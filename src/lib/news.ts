import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Logika domain berita dipakai bersama oleh beberapa route (daftar berita,
// detail, trending, statistik landing). Sebelumnya route saling mengimpor satu
// sama lain (`trending/route.ts` -> `analyze-news/berita/route.ts`), yang
// membuat satu request bisa ikut memuat modul route lain. Semua helper bersama
// sekarang tinggal di sini.

// =========================================================
// AKSES SUPABASE
// =========================================================

// Koneksi ke Supabase kadang lambat/putus. Helper ini mengulang query (rebuild
// tiap percobaan) dengan batas waktu per percobaan, agar gangguan sesaat tidak
// membuat seluruh data kosong tanpa pesan error.
type SbResult = { data: any; error: any; count?: number | null };
export async function q(
  factory: () => PromiseLike<any>,
  tries = 2,
  perTryMs = 50000,
): Promise<SbResult> {
  // Bila Supabase belum dikonfigurasi (SUPABASE_SERVICE_ROLE_KEY kosong), jangan
  // mencoba query sama sekali — kembalikan error instan agar route membalas JSON
  // cepat, bukan menumpuk retry yang lambat.
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local"),
    };
  }
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

// =========================================================
// SENTIMEN, WAKTU, KATEGORI
// =========================================================

// Gabungkan sentimen beberapa aktor menjadi satu label untuk kartu/filter:
// semua Positif -> "Positif", semua Negatif -> "Negatif",
// ada Positif & Negatif -> "Campuran", selain itu -> "Netral".
export function combineSentiments(aktors: any[]): string {
  if (!aktors?.length) return "Netral";
  const types = new Set(aktors.map((a) => a.sentimen));
  const hasPositif = types.has("Positif");
  const hasNegatif = types.has("Negatif");
  if (hasPositif && hasNegatif) return "Campuran";
  if (hasPositif) return "Positif";
  if (hasNegatif) return "Negatif";
  return "Netral";
}

// Tanggal kalender (YYYY-MM-DD) menurut zona waktu Indonesia (WIB/Asia/Jakarta).
// Dipakai untuk membandingkan apakah sebuah berita terbit "hari ini".
export function jakartaDateStr(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// Waktu efektif klaster = created_at anggota TERBARU (fallback waktu_terbentuk).
// Satu sumber kebenaran untuk daftar, trending, dan transformCluster supaya
// urutan & filter "hari terakhir" konsisten dengan WAKTU yang TAMPIL di kartu.
export function clusterWaktu(cluster: any): string | null {
  const members: any[] = cluster?.tabel_berita || [];
  const rep = members.reduce<string | null>((acc, m) => {
    if (!m?.created_at) return acc;
    if (!acc || new Date(m.created_at).getTime() > new Date(acc).getTime()) {
      return m.created_at;
    }
    return acc;
  }, null);
  return rep || cluster?.waktu_terbentuk || null;
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

// Regex global di-cache sekali di level modul. Sebelumnya `new RegExp(...)`
// dibangun ulang 2x per kategori per klaster pada SETIAP request — untuk ribuan
// klaster itu puluhan ribu kompilasi regex yang sia-sia.
const CATEGORY_GLOBAL: [string, RegExp][] = CATEGORY_PATTERNS.map(
  ([name, re]) => [name, new RegExp(re.source, "g")],
);

// Pilih kategori dengan kecocokan kata kunci TERBANYAK (judul diberi bobot lebih
// besar). Default "Sosial & Masyarakat" (bucket umum/peristiwa) bila tak ada
// kata kunci yang cocok — bukan "Ekonomi" yang menyesatkan.
export function detectCategory(judul: string, isi: string): string {
  const judulL = (judul || "").toLowerCase();
  const teks = `${judul} ${isi}`.toLowerCase();

  let best = "Sosial & Masyarakat";
  let bestScore = 0;
  for (const [name, re] of CATEGORY_GLOBAL) {
    re.lastIndex = 0;
    const bodyHits = (teks.match(re) || []).length;
    re.lastIndex = 0;
    const titleHits = (judulL.match(re) || []).length;
    const score = bodyHits + titleHits * 2; // kata di judul dihitung ekstra
    if (score > bestScore) {
      bestScore = score;
      best = name;
    }
  }
  return best;
}

// =========================================================
// PENCARIAN
// =========================================================

// Dokumen yang bisa dicari per klaster. Pencarian menjangkau judul ringkasan,
// isi ringkasan, nama aktor, serta info pendukung (judul berita anggota, portal
// sumber, alasan sentimen) sehingga user bisa mencari "berdasarkan judul, isi
// berita, aktor, dll".
export type SearchDoc = {
  title: string; // judul ringkasan klaster
  text: string; // isi ringkasan klaster
  actors: string; // nama aktor (cocok kuat)
  extra: string; // judul berita anggota + portal + alasan sentimen
  all: string; // gabungan keempatnya (untuk pengecekan cepat)
};

// Cocokkan KATA UTUH, bukan potongan huruf: "padi" cocok pada "harga padi naik"
// tetapi TIDAK pada "kepadian". Batas kata = karakter selain huruf/angka, aman
// untuk nama & teks bahasa Indonesia. Regex di-cache per kata agar hemat.
const wordReCache = new Map<string, RegExp>();
function matchWord(haystack: string, word: string): boolean {
  if (!word) return false;
  let re = wordReCache.get(word);
  if (!re) {
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    re = new RegExp(`(?:^|[^a-z0-9])${esc}(?:[^a-z0-9]|$)`, "i");
    wordReCache.set(word, re);
  }
  return re.test(haystack);
}

// Skor relevansi pencarian terhadap dokumen klaster (gabungan beberapa field
// dengan bobot berbeda). Mengembalikan 0 jika tak ada kecocokan sama sekali.
// Semua pencocokan PER KATA UTUH (bukan per huruf).
export function relevanceScore(doc: SearchDoc, query: string): number {
  const qy = query.toLowerCase().trim();
  if (!qy) return 0;

  const words = qy.split(/\s+/).filter((w) => w.length >= 2);

  // Saringan murah (substring) sebelum belasan pencocokan regex di bawah. Aman:
  // setiap poin skor mensyaratkan kecocokan KATA UTUH atas frasa `qy` atau atas
  // salah satu kata di `words`, dan itu mustahil bila teksnya bahkan tidak
  // mengandung potongan hurufnya. Mayoritas klaster gugur di baris ini.
  if (!doc.all.includes(qy) && !words.some((w) => doc.all.includes(w))) return 0;

  const judul = doc.title;
  const isi = doc.text;
  const aktor = doc.actors;
  const extra = doc.extra;

  let score = 0;
  // Cocok frasa penuh (sebagai rangkaian kata utuh) — paling kuat.
  if (matchWord(judul, qy)) score += 100;
  if (matchWord(aktor, qy)) score += 60;
  if (matchWord(isi, qy)) score += 15;
  if (matchWord(extra, qy)) score += 12;

  // Cocok per kata — agar pencarian beberapa kata tetap relevan.
  for (const w of words) {
    if (matchWord(judul, w)) score += 10;
    if (matchWord(aktor, w)) score += 8;
    if (matchWord(isi, w)) score += 2;
    if (matchWord(extra, w)) score += 2;
  }
  return score;
}

// Urutan prioritas kata kunci: kembalikan INDEKS kata query PERTAMA (sesuai
// urutan ketik) yang cocok dengan dokumen. Mis. query "jokowi prabowo": klaster
// yang menyebut "jokowi" -> 0, yang hanya "prabowo" -> 1. Dipakai agar hasil
// pencarian mengelompok berdasarkan kata awal dulu, baru diurut waktu di tiap
// kelompok. Mengembalikan angka besar bila tak ada kata yang cocok.
export function firstQueryWordRank(doc: SearchDoc, query: string): number {
  const words = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  if (!words.length) return 0;
  for (let i = 0; i < words.length; i++) {
    if (matchWord(doc.all, words[i])) return i;
  }
  return words.length;
}

// =========================================================
// INDEKS KLASTER (CACHE)
// =========================================================

// Kenapa ada cache: sebelumnya SETIAP request ke /api/analyze-news/berita
// menarik seluruh klaster beserta relasinya, lalu menghitung ulang kategori,
// sentimen gabungan, dan dokumen pencarian untuk ribuan baris — hanya untuk
// menampilkan 12 kartu. Data berita diperbarui per batch (bukan per detik),
// jadi indeks yang sama dipakai ulang selama TTL.
//
// Batasan yang disadari: cache ini per-instance proses. Di serverless tiap
// instance punya salinan sendiri (tetap benar, sekadar cache miss lebih sering).
// Bila nanti pencarian dipindah ke Postgres (tsvector + GIN), lapisan ini bisa
// dihapus — lihat catatan di README/PERFORMANCE.
const CLUSTER_INDEX_TTL_MS = 5 * 60 * 1000;
const CLUSTER_INDEX_LIMIT = 5000;

// isi_teks SENGAJA tidak diambil: field itu berisi teks berita penuh untuk
// SETIAP anggota klaster — bagian terbesar dari payload, sementara daftar,
// trending, dan statistik hanya memakai ringkasan klaster. Detail berita
// mengambilnya sendiri lewat query per-id.
const CLUSTER_SELECT = `
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
`;

export type ClusterEntry = {
  raw: any;
  id: number;
  category: string;
  title: string;
  text: string;
  waktu: string | null;
  sentiment: string;
  search: SearchDoc;
};

let indexCache: { at: number; entries: ClusterEntry[] } | null = null;
let indexInflight: Promise<ClusterEntry[]> | null = null;

function buildEntry(c: any): ClusterEntry {
  const aktors = c.tabel_sentimen_aktor || [];
  const members = c.tabel_berita || [];

  // Sentimen kartu = gabungan sentimen aktor (maks 3, sama dgn yang tampil).
  const sentiment = combineSentiments(aktors.slice(0, 3));

  // Dokumen pencarian: nama aktor (cocok kuat) + info pendukung (judul berita
  // anggota, portal sumber, alasan sentimen) supaya pencarian menjangkau
  // judul, isi, aktor, dan sumber. Semua di-lowercase SEKALI di sini, bukan
  // berulang kali tiap request.
  const title = (c.judul_summary || "").toLowerCase();
  const text = (c.summary_text || "").toLowerCase();
  const actors = aktors
    .map((a: any) => a.nama_aktor || "")
    .join(" ")
    .toLowerCase();
  const extra = [
    ...members.map((m: any) => m.judul || ""),
    ...members.map((m: any) => m.portal_sumber || ""),
    ...aktors.map((a: any) => a.alasan || ""),
  ]
    .join(" ")
    .toLowerCase();

  return {
    raw: c,
    id: c.id_cluster,
    category: detectCategory(c.judul_summary || "", c.summary_text || ""),
    title: c.judul_summary || "",
    text: c.summary_text || "",
    waktu: clusterWaktu(c),
    sentiment,
    search: {
      title,
      text,
      actors,
      extra,
      all: `${title} ${text} ${actors} ${extra}`,
    },
  };
}

async function loadClusterIndex(): Promise<ClusterEntry[]> {
  const { data, error } = await q(() =>
    supabase
      .from("tabel_cluster")
      .select(CLUSTER_SELECT)
      .not("judul_summary", "is", null)
      .order("waktu_terbentuk", { ascending: false })
      .limit(CLUSTER_INDEX_LIMIT),
  );
  if (error) throw error instanceof Error ? error : new Error(String(error?.message || error));
  return ((data || []) as any[]).map(buildEntry);
}

/**
 * Indeks klaster yang sudah diperkaya (kategori, sentimen, dokumen pencarian),
 * dengan cache TTL + single-flight (request bersamaan berbagi satu query).
 */
export async function getClusterIndex(): Promise<ClusterEntry[]> {
  const now = Date.now();
  if (indexCache && now - indexCache.at < CLUSTER_INDEX_TTL_MS) {
    return indexCache.entries;
  }
  if (indexInflight) return indexInflight;

  indexInflight = loadClusterIndex()
    .then((entries) => {
      indexCache = { at: Date.now(), entries };
      return entries;
    })
    .catch((e) => {
      // Supabase sedang bermasalah: lebih baik sajikan indeks lama (sedikit
      // basi) daripada halaman kosong. Hanya melempar bila belum pernah ada.
      if (indexCache) return indexCache.entries;
      throw e;
    })
    .finally(() => {
      indexInflight = null;
    });

  return indexInflight;
}

/** Tanggal kalender WIB paling baru yang ada di indeks. */
export function latestDateOf(entries: { waktu: string | null }[]): string | null {
  return entries.reduce<string | null>((acc, e) => {
    if (!e.waktu) return acc;
    const d = jakartaDateStr(new Date(e.waktu));
    return !acc || d > acc ? d : acc;
  }, null);
}

/** Tanggal kalender WIB paling lama yang ada di indeks. */
export function oldestDateOf(entries: { waktu: string | null }[]): string | null {
  return entries.reduce<string | null>((acc, e) => {
    if (!e.waktu) return acc;
    const d = jakartaDateStr(new Date(e.waktu));
    return !acc || d < acc ? d : acc;
  }, null);
}

// Rentang hari yang boleh diminta klien. 0 = seluruh arsip.
export const RENTANG_VALID = [1, 7, 30, 0] as const;
export const RENTANG_DEFAULT = 7;

/** Geser tanggal "YYYY-MM-DD" mundur n hari (aman lintas bulan/tahun). */
function mundurHari(tanggal: string, n: number): string {
  const d = new Date(`${tanggal}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/**
 * Saring klaster ke `hari` terakhir.
 *
 * PENTING: hitungannya mundur dari tanggal TERBARU DI DATABASE, bukan dari
 * tanggal sistem. Pipeline bisa tertinggal berhari-hari; kalau memakai tanggal
 * hari ini, feed jadi kosong total. Versi lama mengunci ke satu hari terakhir
 * saja — pada hari sepi itu berarti beranda hanya menampilkan 2 kartu.
 */
export function filterRentangHari<T extends { waktu: string | null }>(
  entries: T[],
  hari: number,
): T[] {
  if (!hari || hari <= 0) return entries; // 0 = semua arsip
  const latest = latestDateOf(entries);
  if (!latest) return entries;
  const batas = mundurHari(latest, hari - 1);
  return entries.filter(
    (e) => e.waktu && jakartaDateStr(new Date(e.waktu)) >= batas,
  );
}

// =========================================================
// PENGAMBILAN DATA PENDUKUNG (per halaman, bukan seluruh tabel)
// =========================================================

/** Prediksi sektor untuk sekumpulan id klaster saja. */
export async function fetchSektorFor(ids: number[]): Promise<Record<number, any[]>> {
  const map: Record<number, any[]> = {};
  if (!ids.length) return map;
  const { data } = await q(() =>
    supabase
      .from("tabel_sektor")
      .select(
        "id_cluster, nama_sektor, prediksi_dampak, tingkat_risiko, objek_terdampak, sentimen_objek, persentase_objek",
      )
      .in("id_cluster", ids),
  );
  ((data as any[]) || []).forEach((s) => {
    if (s.id_cluster == null) return;
    (map[s.id_cluster] ||= []).push(s);
  });
  return map;
}

/** Jumlah klik (dilihat) untuk sekumpulan id klaster saja. */
export async function fetchViewsFor(ids: number[]): Promise<Record<number, number>> {
  const map: Record<number, number> = {};
  if (!ids.length) return map;
  const { data } = await q(() =>
    supabase.from("tabel_metrik").select("id_cluster, jumlah_klik").in("id_cluster", ids),
  );
  ((data as any[]) || []).forEach((m) => {
    if (m.id_cluster != null) map[m.id_cluster] = Number(m.jumlah_klik) || 0;
  });
  return map;
}

/** Metrik lengkap (klik + durasi + updated_at) untuk skor trending. */
export async function fetchMetrikFor(ids: number[]): Promise<Record<number, any>> {
  const map: Record<number, any> = {};
  if (!ids.length) return map;
  const { data } = await q(() =>
    supabase
      .from("tabel_metrik")
      .select("id_cluster, jumlah_klik, total_durasi_ms, updated_at")
      .in("id_cluster", ids),
  );
  ((data as any[]) || []).forEach((m) => {
    if (m.id_cluster != null) map[m.id_cluster] = m;
  });
  return map;
}

/**
 * Bangun kartu berita untuk sekumpulan id, MEMPERTAHANKAN urutan `ids`
 * (dipakai halaman profil: bookmark & riwayat sudah terurut dari DB).
 * Id yang tidak ada di indeks (mis. klaster lama di luar batas) dilewati.
 */
export async function kartuUntukIds(ids: number[]) {
  if (!ids.length) return [];
  const entries = await getClusterIndex();
  const perId = new Map(entries.map((e) => [e.id, e]));
  const ada = ids.map((id) => perId.get(id)).filter(Boolean) as ClusterEntry[];
  if (!ada.length) return [];

  const adaIds = ada.map((e) => e.id);
  const [sektorMap, viewsMap] = await Promise.all([
    fetchSektorFor(adaIds),
    fetchViewsFor(adaIds),
  ]);
  return ada.map((e) =>
    transformCluster(e.raw, sektorMap[e.id] || [], e.category, viewsMap[e.id] || 0),
  );
}

// =========================================================
// AKTOR
// =========================================================

export type RingkasanAktor = {
  nama: string;
  jumlah: number; // banyak klaster yang menyebut aktor ini
  positif: number;
  negatif: number;
  netral: number;
  kategoriTeratas: string | null;
  klasterTerbaru: number[]; // maks 3 id, terbaru dulu
};

/**
 * Hitung ringkasan per aktor dari indeks klaster. `hanya` membatasi ke nama
 * tertentu (dipakai untuk daftar "aktor yang diikuti"); bila kosong, semua
 * aktor dihitung lalu dikembalikan yang teratas.
 */
export async function ringkasanAktor(
  hanya?: string[],
  batas = 12,
): Promise<RingkasanAktor[]> {
  const entries = await getClusterIndex();
  const saring = hanya?.length ? new Set(hanya.map((n) => n.toLowerCase())) : null;

  const acc = new Map<string, RingkasanAktor & { _waktu: [string, number][] }>();

  for (const e of entries) {
    const aktors = (e.raw.tabel_sentimen_aktor || []) as any[];
    for (const a of aktors) {
      const nama = String(a?.nama_aktor || "").trim();
      if (!nama) continue;
      if (saring && !saring.has(nama.toLowerCase())) continue;

      let r = acc.get(nama);
      if (!r) {
        r = {
          nama,
          jumlah: 0,
          positif: 0,
          negatif: 0,
          netral: 0,
          kategoriTeratas: null,
          klasterTerbaru: [],
          _waktu: [],
        };
        acc.set(nama, r);
      }
      r.jumlah++;
      if (a.sentimen === "Positif") r.positif++;
      else if (a.sentimen === "Negatif") r.negatif++;
      else r.netral++;
      r._waktu.push([e.waktu || "", e.id]);
      // Kategori dominan dihitung kasar: kategori klaster pertama yang ditemui
      // sudah cukup representatif untuk label kecil di UI.
      r.kategoriTeratas ||= e.category;
    }
  }

  const hasil = [...acc.values()].map((r) => {
    r._waktu.sort((a, b) => new Date(b[0] || 0).getTime() - new Date(a[0] || 0).getTime());
    r.klasterTerbaru = r._waktu.slice(0, 3).map(([, id]) => id);
    const { _waktu, ...bersih } = r;
    void _waktu;
    return bersih;
  });

  hasil.sort((a, b) => b.jumlah - a.jumlah);
  return saring ? hasil : hasil.slice(0, batas);
}

// =========================================================
// TRANSFORMASI UNTUK FRONTEND
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
  views = 0,
) {
  const members: any[] = cluster.tabel_berita || [];
  const aktors = cluster.tabel_sentimen_aktor || [];

  const rep =
    [...members].sort(
      (a, b) => (b.isi_teks?.length || 0) - (a.isi_teks?.length || 0),
    )[0] || {};

  const waktu = clusterWaktu(cluster);

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
    objek_terdampak: s.objek_terdampak ?? null,
    sentimen_objek: s.sentimen_objek ?? null,
    persentase_objek: s.persentase_objek ?? null,
  }));

  const impacts = aktors.slice(0, 1).map((a: any) => ({
    name: `#${a.nama_aktor.toUpperCase().replace(/ /g, "_")}`,
    percentage: a.persentase,
  }));

  const sources = buildSources(members, summaryTitle);
  // Total sumber = jumlah sumber unik yang BENAR-BENAR ditampilkan (konsisten
  // dengan daftar di popup). Fallback ke jumlah_berita bila daftar kosong.
  const jumlahBerita = sources.length || cluster.jumlah_berita || 0;

  // Nama portal unik — inti nilai jual Briefly ("N portal meliput peristiwa
  // ini") yang sebelumnya dihitung tapi tidak pernah ditampilkan di kartu.
  const portals = [...new Set(sources.map((s) => s.portal).filter(Boolean))];

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
    portals,
    portalCount: portals.length,
    views,
    url: sources[0]?.url || "#",
    sources: sources,
    sektorPredictions: sektorPredictions,
    time: formatRelativeTime(waktu),
    // Tanggal mesin (YYYY-MM-DD) untuk pengelompokan per hari di feed.
    dateKey: waktu ? jakartaDateStr(new Date(waktu)) : null,
    fullContent: cluster.summary_text || rep.isi_teks || "",
    aiSummary: cluster.summary_text || "Ringkasan belum tersedia.",
    keywords: sektorPredictions.map((s: any) => s.nama_sektor),
    publishedAt: waktu
      ? new Date(waktu).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "-",
    isAnalyzed: hasSentiment,
  };
}

function formatRelativeTime(waktu: string | null) {
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
