import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Koneksi ke Supabase kadang lambat/putus. Helper ini mengulang query (rebuild
// tiap percobaan) dengan batas waktu per percobaan, agar gangguan sesaat tidak
// membuat seluruh data kosong tanpa pesan error.
type SbResult = { data: any; error: any; count?: number | null };
export async function q(
  factory: () => PromiseLike<any>,
  tries = 2,
  perTryMs = 50000,
): Promise<SbResult> {
  let last: SbResult | null = null;
  for (let i = 0; i < tries; i++) {
    try {
      const res = (await Promise.race([
        factory(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), perTryMs),
        ),
      ])) as SbResult;
      if (!res.error) return res;
      last = res;
    } catch (e) {
      last = { data: null, error: e };
    }
    await new Promise((r) => setTimeout(r, 300 * (i + 1)));
  }
  return last ?? { data: null, error: new Error("Supabase tidak merespons") };
}

// Gabungkan sentimen beberapa aktor menjadi satu label untuk kartu/filter:
// semua Positif -> "Positif", semua Negatif -> "Negatif",
// ada Positif & Negatif -> "Campuran", selain itu -> "Netral".
function combineSentiments(aktors: any[]): string {
  if (!aktors?.length) return "Netral";
  const types = new Set(aktors.map((a) => a.sentimen));
  const hasPositif = types.has("Positif");
  const hasNegatif = types.has("Negatif");
  if (hasPositif && hasNegatif) return "Campuran";
  if (hasPositif) return "Positif";
  if (hasNegatif) return "Negatif";
  return "Netral";
}

// Dokumen yang bisa dicari per klaster. Pencarian menjangkau judul ringkasan,
// isi ringkasan, nama aktor, serta info pendukung (judul berita anggota, portal
// sumber, alasan sentimen) sehingga user bisa mencari "berdasarkan judul, isi
// berita, aktor, dll".
type SearchDoc = {
  title: string; // judul ringkasan klaster
  text: string; // isi ringkasan klaster
  actors: string; // nama aktor (cocok kuat)
  extra: string; // judul berita anggota + portal + alasan sentimen
};

// Tanggal kalender (YYYY-MM-DD) menurut zona waktu Indonesia (WIB/Asia/Jakarta).
// Dipakai untuk membandingkan apakah sebuah berita terbit "hari ini".
function jakartaDateStr(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Skor relevansi pencarian terhadap dokumen klaster (gabungan beberapa field
// dengan bobot berbeda). Mengembalikan 0 jika tak ada kecocokan sama sekali.
function relevanceScore(doc: SearchDoc, query: string): number {
  const qy = query.toLowerCase().trim();
  if (!qy) return 0;
  const judul = (doc.title || "").toLowerCase();
  const isi = (doc.text || "").toLowerCase();
  const aktor = (doc.actors || "").toLowerCase();
  const extra = (doc.extra || "").toLowerCase();
  const words = qy.split(/\s+/).filter((w) => w.length >= 2);

  let score = 0;
  // Cocok frasa penuh — paling kuat.
  if (judul.includes(qy)) score += 100;
  if (judul.startsWith(qy)) score += 50;
  if (aktor.includes(qy)) score += 60;
  if (isi.includes(qy)) score += 15;
  if (extra.includes(qy)) score += 12;

  // Cocok per kata — agar pencarian beberapa kata tetap relevan.
  for (const w of words) {
    if (judul.includes(w)) score += 10;
    if (aktor.includes(w)) score += 8;
    if (isi.includes(w)) score += 2;
    if (extra.includes(w)) score += 2;
  }
  return score;
}

// Urutan prioritas kata kunci: kembalikan INDEKS kata query PERTAMA (sesuai
// urutan ketik) yang cocok dengan dokumen. Mis. query "jokowi prabowo": klaster
// yang menyebut "jokowi" -> 0, yang hanya "prabowo" -> 1. Dipakai agar hasil
// pencarian mengelompok berdasarkan kata awal dulu, baru diurut waktu di tiap
// kelompok. Mengembalikan angka besar bila tak ada kata yang cocok.
function firstQueryWordRank(doc: SearchDoc, query: string): number {
  const words = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  if (!words.length) return 0;
  const haystack = [doc.title, doc.text, doc.actors, doc.extra]
    .join(" ")
    .toLowerCase();
  for (let i = 0; i < words.length; i++) {
    if (haystack.includes(words[i])) return i;
  }
  return words.length;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const categoryFilter = searchParams.get("category") || "Semua";
  const searchQuery = searchParams.get("search") || "";
  const sentimentFilter = searchParams.get("sentiment") || "Semua";
  // Urutan waktu: "desc" (terbaru dulu, default) atau "asc" (terlama dulu).
  const sortOrder = searchParams.get("sort") === "asc" ? "asc" : "desc";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 0. Ambil semua prediksi sektor → map per klaster (sektor opsional).
  const sektorRes = await q(() =>
    supabase
      .from("tabel_sektor")
      .select("id_cluster, nama_sektor, prediksi_dampak, tingkat_risiko"),
  );
  if (sektorRes.error) {
    console.error("Supabase Error (sektor):", sektorRes.error);
    return NextResponse.json(
      { error: "Gagal memuat data analisis. Coba muat ulang." },
      { status: 503 },
    );
  }
  const sektorMap: Record<number, any[]> = {};
  ((sektorRes.data as any[]) || []).forEach((s) => {
    if (s.id_cluster == null) return;
    (sektorMap[s.id_cluster] ||= []).push(s);
  });

  // 1. Ambil SEMUA klaster yang sudah di-summarize (judul_summary terisi).
  //    Jumlahnya kecil (ratusan), jadi filter kategori/pencarian/urut/paginasi
  //    dilakukan di sini agar KATEGORI DI KARTU == DASAR FILTER (konsisten).
  const { data, error } = await q(() =>
    supabase
      .from("tabel_cluster")
      .select(
        `
        id_cluster,
        judul_summary,
        summary_text,
        waktu_terbentuk,
        jumlah_berita,
        tabel_sentimen_aktor (
          nama_aktor,
          sentimen,
          persentase,
          alasan
        ),
        tabel_berita (
          judul,
          portal_sumber,
          url_asli,
          created_at
        )
      `,
      )
      .not("judul_summary", "is", null)
      .order("waktu_terbentuk", { ascending: false })
      .limit(3000),
  );
  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Hitung kategori SEKALI per klaster (dipakai untuk label DAN filter).
  const enriched = ((data || []) as any[]).map((c: any) => {
    const aktors = c.tabel_sentimen_aktor || [];
    const members = c.tabel_berita || [];

    // Waktu efektif klaster = created_at anggota TERBARU (fallback waktu_terbentuk).
    // HARUS sama dengan perhitungan di transformCluster agar urutan & filter
    // "hari terakhir" konsisten dengan WAKTU yang TAMPIL di kartu.
    const repCreatedAt = (members as any[]).reduce(
      (acc: string | null, m: any) => {
        if (!m?.created_at) return acc;
        if (!acc || new Date(m.created_at).getTime() > new Date(acc).getTime()) {
          return m.created_at;
        }
        return acc;
      },
      null as string | null,
    );
    const waktu = repCreatedAt || c.waktu_terbentuk;

    // Sentimen kartu = gabungan sentimen aktor (maks 3, sama dgn yang tampil):
    // semua Positif -> "Positif", semua Negatif -> "Negatif",
    // ada Positif & Negatif -> "Campuran".
    const combinedSentiment = combineSentiments(aktors.slice(0, 3));

    // Dokumen pencarian: nama aktor (cocok kuat) + info pendukung (judul berita
    // anggota, portal sumber, alasan sentimen) supaya pencarian menjangkau
    // judul, isi, aktor, dan sumber.
    const actors = aktors.map((a: any) => a.nama_aktor || "").join(" ");
    const extra = [
      ...members.map((m: any) => m.judul || ""),
      ...members.map((m: any) => m.portal_sumber || ""),
      ...aktors.map((a: any) => a.alasan || ""),
    ].join(" ");

    return {
      raw: c,
      category: detectCategory(c.judul_summary || "", c.summary_text || ""),
      title: c.judul_summary || "",
      text: c.summary_text || "",
      waktu,
      sentiment: combinedSentiment,
      search: {
        title: c.judul_summary || "",
        text: c.summary_text || "",
        actors,
        extra,
      } as SearchDoc,
    };
  });

  const isSearch = searchQuery.trim() !== "";

  // 2.5 HANYA berita pada HARI TERAKHIR yang ada di database (bukan tanggal
  //     sistem). Cari tanggal kalender (WIB) paling baru di antara klaster,
  //     lalu tampilkan hanya klaster pada tanggal tersebut.
  const latestDate = enriched.reduce<string | null>((acc, e) => {
    if (!e.waktu) return acc;
    const d = jakartaDateStr(new Date(e.waktu));
    return !acc || d > acc ? d : acc;
  }, null);
  let filtered = latestDate
    ? enriched.filter(
        (e) => e.waktu && jakartaDateStr(new Date(e.waktu)) === latestDate,
      )
    : enriched;

  // 3. Filter kategori — pakai kategori yang SAMA dengan label kartu.
  if (categoryFilter !== "Semua") {
    filtered = filtered.filter((e) => e.category === categoryFilter);
  }

  // 3.5 Filter sentimen — filter berdasarkan sentimen dominan berita
  if (sentimentFilter !== "Semua") {
    filtered = filtered.filter((e) => e.sentiment === sentimentFilter);
  }

  // 4. Filter pencarian — judul/isi ringkasan + aktor + judul berita anggota & portal.
  if (isSearch) {
    filtered = filtered.filter(
      (e) => relevanceScore(e.search, searchQuery) > 0,
    );
  }

  // 5. Urutkan berdasarkan waktu sesuai pilihan (asc/desc). Saat mencari,
  //    KATA QUERY AWAL diutamakan: hasil dikelompokkan menurut kata query
  //    pertama yang cocok (mis. "jokowi" dulu, lalu "prabowo"), dan DI DALAM
  //    tiap kelompok tetap diurut berdasarkan waktu.
  const byTime = (a: any, b: any) => {
    const ta = new Date(a.waktu || 0).getTime();
    const tb = new Date(b.waktu || 0).getTime();
    return sortOrder === "asc" ? ta - tb : tb - ta;
  };
  if (isSearch) {
    const rankCache = new Map<any, number>();
    const rankOf = (e: any) => {
      let r = rankCache.get(e);
      if (r === undefined) {
        r = firstQueryWordRank(e.search, searchQuery);
        rankCache.set(e, r);
      }
      return r;
    };
    filtered.sort((a, b) => rankOf(a) - rankOf(b) || byTime(a, b));
  } else {
    filtered.sort(byTime);
  }

  // 6. Paginasi + transform (kategori diteruskan agar konsisten dgn filter).
  const count = filtered.length;
  const transformed = filtered
    .slice(from, to + 1)
    .map((e) => transformCluster(e.raw, sektorMap[e.raw.id_cluster] || [], e.category));

  return NextResponse.json({ data: transformed, total: count });
}

// =========================================================
// HELPER FUNCTIONS
// =========================================================

function getPublisherName(url: string): string {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes('detik.com')) return 'Detik';
    if (domain.includes('kompas.com')) return 'Kompas';
    if (domain.includes('cnnindonesia.com')) return 'CNN Indonesia';
    if (domain.includes('cnbcindonesia.com')) return 'CNBC Indonesia';
    if (domain.includes('tribunnews.com')) return 'Tribunnews';
    if (domain.includes('tempo.co')) return 'Tempo';

    const cleanDomain = domain.replace('www.', '').replace('news.', '');
    return cleanDomain.split('.')[0].toUpperCase();
  } catch {
    return 'Sumber Asli';
  }
}

// Daftar sumber dari berita anggota klaster (dipakai DETAIL): dedup per-URL,
// diurutkan dari yang judulnya paling relevan dengan judul ringkasan. SEMUA
// sumber unik dikembalikan (tanpa batas) supaya popup "Lihat Semua Sumber"
// menampilkan seluruh berita, dan total sumber konsisten dengan daftar ini.
export function buildSources(
  members: any[],
  clusterTitle: string,
): { portal: string; url: string; title: string }[] {
  const tokenize = (t: string) =>
    new Set(
      (t || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
  const baseTokens = tokenize(clusterTitle);
  const relevance = (t: string) => {
    let score = 0;
    tokenize(t).forEach((w) => {
      if (baseTokens.has(w)) score++;
    });
    return score;
  };

  const seen = new Set<string>();
  return (members || [])
    .filter((m) => m.url_asli && !seen.has(m.url_asli) && seen.add(m.url_asli))
    .map((m) => ({
      portal: m.portal_sumber || getPublisherName(m.url_asli),
      url: m.url_asli,
      title: m.judul || "",
      score: relevance(m.judul || ""),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ portal, url, title }) => ({ portal, url, title }));
}

// Transform satu baris KLASTER (hasil summarize) menjadi bentuk untuk frontend.
// `categoryOverride` dipakai agar kategori di kartu sama persis dengan yang
// dipakai untuk filter (konsisten).
export function transformCluster(
  cluster: any,
  sektorList: any[] = [],
  categoryOverride?: string,
) {
  const members: any[] = cluster.tabel_berita || [];
  const aktors = cluster.tabel_sentimen_aktor || [];

  const rep =
    [...members].sort(
      (a, b) => (b.isi_teks?.length || 0) - (a.isi_teks?.length || 0),
    )[0] || {};

  const repCreatedAt = members.reduce<string | null>((acc, m) => {
    if (!m?.created_at) return acc;
    if (!acc || new Date(m.created_at).getTime() > new Date(acc).getTime()) {
      return m.created_at;
    }
    return acc;
  }, null);
  const waktu = repCreatedAt || cluster.waktu_terbentuk;

  const summaryTitle = cluster.judul_summary || rep.judul || "Tanpa Judul";
  const hasSentiment = aktors.length > 0;

  const sentiments = aktors.slice(0, 3).map((a: any) => ({
    type: a.sentimen as "Positif" | "Negatif" | "Netral",
    percentage: a.persentase,
    aktor: a.nama_aktor,
    description:
      a.alasan?.trim() ||
      `${a.nama_aktor} — sentimen ${a.sentimen.toLowerCase()} terdeteksi.`,
  }));

  const sektorPredictions = (sektorList || []).map((s: any) => ({
    nama_sektor: s.nama_sektor,
    prediksi_dampak: s.prediksi_dampak,
    tingkat_risiko: s.tingkat_risiko,
  }));

  const impacts = aktors.slice(0, 1).map((a: any) => ({
    name: `#${a.nama_aktor.toUpperCase().replace(/ /g, "_")}`,
    percentage: a.persentase,
  }));

  const sources = buildSources(members, summaryTitle);
  // Total sumber = jumlah sumber unik yang BENAR-BENAR ditampilkan (konsisten
  // dengan daftar di popup). Fallback ke jumlah_berita bila daftar kosong.
  const jumlahBerita = sources.length || cluster.jumlah_berita || 0;

  return {
    id: cluster.id_cluster,
    title: summaryTitle,
    summaryTitle,
    category: categoryOverride || detectCategory(summaryTitle, cluster.summary_text || rep.isi_teks || ""),
    description:
      cluster.summary_text?.slice(0, 160) ||
      rep.isi_teks?.slice(0, 160) ||
      "Ringkasan belum tersedia.",
    sentiments: sentiments.length > 0 ? sentiments : [
      { type: "Netral" as const, percentage: 50, description: "⏳ Analisis sentimen belum tersedia." }
    ],
    impacts: impacts.length > 0 ? impacts : [
      { name: hasSentiment ? "#BERITA" : "#MENUNGGU_PROSES", percentage: 50 }
    ],
    source: sources[0]?.portal || (jumlahBerita ? `${jumlahBerita} sumber` : "Beberapa sumber"),
    sourceCount: jumlahBerita,
    url: sources[0]?.url || "#",
    sources: sources,
    sektorPredictions: sektorPredictions,
    time: formatRelativeTime(waktu),
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
    fullContent: cluster.summary_text || rep.isi_teks || "",
    aiSummary: cluster.summary_text || "Ringkasan belum tersedia.",
    keywords: sektorPredictions.map((s: any) => s.nama_sektor),
    publishedAt: waktu
      ? new Date(waktu).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "-",
    isAnalyzed: hasSentiment,
  };
}

// Pola kata kunci per kategori. Memakai batas kata (\b) agar tidak salah cocok
// karena substring (mis. "hukuman" TIDAK dianggap "hukum", "pasaran" bukan
// "pasar").
const CATEGORY_PATTERNS: [string, RegExp][] = [
  ["Ekonomi & Bisnis", /\b(saham|ihsg|rupiah|inflasi|ekonomi|bank|perbankan|investasi|keuangan|ekspor|impor|bisnis|korporasi|merger|pasar modal|perdagangan|dividen|emiten|pajak|emas|harga emas|bahan pokok|harga pangan|sembako|logistik|umkm|properti|suku bunga|gaji|upah)\b/],
  ["Politik & Pemerintahan", /\b(politik|pemilu|partai|pemerintah|menteri|kementerian|kabinet|legislatif|koalisi|presiden|wapres|dpr|dprd|mpr|pilkada|demokrasi|prabowo|gibran|jokowi|gubernur|bupati|wali kota|kebijakan|undang-undang|\bruu\b)\b/],
  ["Hukum & Keamanan", /\b(hukum|keamanan|polisi|polri|polda|polres|\btni\b|\bkpk\b|sidang|hakim|jaksa|kriminal|terorisme|pasal|gugatan|korupsi|tersangka|penjara|narkoba|narkotika|pencurian|pembunuhan|penipuan|penembakan|begal|\bkdrt\b|pelecehan|kekerasan seksual|penangkapan|ditangkap|kejahatan|penyelundupan)\b/],
  ["Sosial & Masyarakat", /\b(sosial|masyarakat|bencana|komunitas|demonstrasi|\bdemo\b|kemiskinan|bansos|banjir|gempa|kebakaran|pengungsi|kecelakaan|cuaca ekstrem|cuaca|longsor|lalu lintas|mudik|libur panjang|wisatawan|wisata|job fair|pencari kerja|ojol|keracunan|peristiwa|kuliner|makanan|resep|fashion|kecantikan|pernikahan|khutbah|islam|agama|kereta|\bkai\b|ormas)\b/],
  ["Kesehatan", /\b(kesehatan|rumah sakit|dokter|obat|penyakit|vaksin|medis|pasien|pandemi|wabah|bpjs|gizi|stunting|virus|kanker|diabetes|imunisasi)\b/],
  ["Pendidikan", /\b(pendidikan|sekolah|kuliah|mahasiswa|guru|dosen|kurikulum|beasiswa|kemendikbud|kampus|universitas|ujian|siswa|pelajar|sekolah rakyat)\b/],
  ["Energi & Lingkungan", /\b(energi|lingkungan|iklim|karbon|polusi|tambang|batu bara|\bplts\b|sampah|kehutanan|emisi|sawit|migas|\bbbm\b|\blpg\b|pertamina|gunung api|gunung berapi|erupsi|vulkanik|satwa|konservasi|anggrek|\bpln\b|kelistrikan)\b/],
  ["Teknologi", /\b(teknologi|startup|\bai\b|kecerdasan buatan|machine learning|digital|aplikasi|gadget|siber|robot|software|internet|smartphone|ponsel|perangkat|\bchip\b|gawai|media sosial)\b/],
  ["Olahraga & Hiburan", /\b(bola|sepak bola|liga|super league|\bgol\b|timnas|olahraga|atlet|pertandingan|juara|piala|klasemen|pemain|pelatih|klub|persib|persija|persebaya|arema|real madrid|barcelona|manchester|liverpool|arsenal|chelsea|guardiola|messi|ronaldo|motogp|moto2|moto3|pembalap|balap|balapan|sirkuit|grand prix|kualifikasi|sprint|formula 1|valentino|marquez|tenis|badminton|bulu tangkis|basket|voli|penalti|konser|film|musik|selebriti|aktor|aktris|artis|hiburan|sinetron|drama korea|drama china)\b/],
  ["Hubungan Internasional", /\b(internasional|\bpbb\b|diplomasi|luar negeri|\bg20\b|asean|perbatasan|perang|perjanjian|gencatan senjata|israel|palestina|gaza|ukraina|rusia|netanyahu|amerika serikat)\b/],
];

// Pilih kategori dengan kecocokan kata kunci TERBANYAK (judul diberi bobot lebih
// besar). Default "Sosial & Masyarakat" (bucket umum/peristiwa) bila tak ada
// kata kunci yang cocok — bukan "Ekonomi" yang menyesatkan.
function detectCategory(judul: string, isi: string): string {
  const judulL = (judul || "").toLowerCase();
  const teks = `${judul} ${isi}`.toLowerCase();

  let best = "Sosial & Masyarakat";
  let bestScore = 0;
  for (const [name, re] of CATEGORY_PATTERNS) {
    const g = new RegExp(re.source, "g");
    const bodyHits = (teks.match(g) || []).length;
    const titleHits = (judulL.match(new RegExp(re.source, "g")) || []).length;
    const score = bodyHits + titleHits * 2; // kata di judul dihitung ekstra
    if (score > bestScore) {
      bestScore = score;
      best = name;
    }
  }
  return best;
}

function formatRelativeTime(waktu: string) {
  if (!waktu) return "Baru saja";
  const dateObj = new Date(waktu);
  if (isNaN(dateObj.getTime())) return waktu;

  const diff = Date.now() - dateObj.getTime();
  const menit = Math.floor(diff / 60000);
  const jam = Math.floor(diff / 3600000);
  const hari = Math.floor(jam / 24);

  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  if (jam < 24) return `${jam} jam lalu`;
  return `${hari} hari lalu`;
}
