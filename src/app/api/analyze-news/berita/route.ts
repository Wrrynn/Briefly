import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Skor relevansi hasil pencarian. Prioritas: judul yang mengandung frasa/kata
// kunci jauh lebih tinggi daripada isi teks; judul yang diawali kata kunci
// mendapat bonus, sehingga yang "paling dekat" muncul paling atas.
function relevanceScore(item: any, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const judul = (item.judul || "").toLowerCase();
  const isi = (item.isi_teks || "").toLowerCase();
  const words = q.split(/\s+/).filter((w) => w.length >= 2);

  let score = 0;
  if (judul.includes(q)) score += 100; // frasa penuh di judul
  if (judul.startsWith(q)) score += 50; // judul diawali kata kunci
  if (isi.includes(q)) score += 15; // frasa penuh di isi
  for (const w of words) {
    if (judul.includes(w)) score += 10; // tiap kata di judul
    if (isi.includes(w)) score += 2; // tiap kata di isi
  }
  return score;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10"); 
  const categoryFilter = searchParams.get("category") || "Semua";
  const searchQuery = searchParams.get("search") || "";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 0. Hanya tampilkan berita yang analisisnya LENGKAP: cluster harus punya
  //    data sentimen (tabel_sentimen_aktor) DAN prediksi sektor (tabel_sektor).
  //    Otomatis bertambah saat worker AI memproses lebih banyak cluster.
  const [{ data: sentRows }, { data: sektorRows }] = await Promise.all([
    supabase.from("tabel_sentimen_aktor").select("id_cluster"),
    supabase.from("tabel_sektor").select("id_cluster"),
  ]);
  const sentSet = new Set(
    (sentRows || []).map((r) => r.id_cluster).filter((x): x is number => x != null),
  );
  const sektorSet = new Set(
    (sektorRows || []).map((r) => r.id_cluster).filter((x): x is number => x != null),
  );
  // Irisan: cluster yang punya sentimen DAN sektor
  const analyzedClusterIds = [...sentSet].filter((id) => sektorSet.has(id));
  const clusterFilter = analyzedClusterIds.length > 0 ? analyzedClusterIds : [-1];

  // 0b. Ambil HANYA berita dari hari terakhir yang diupdate (tanggal created_at
  //     paling baru di antara berita teranalisis). Dinamis — ikut hari terbaru.
  const { data: newestRow } = await supabase
    .from("tabel_berita")
    .select("created_at")
    .in("id_cluster", clusterFilter)
    .order("created_at", { ascending: false })
    .limit(1);

  let dayStart: string | null = null;
  let dayEnd: string | null = null;
  const newestCreated = newestRow?.[0]?.created_at;
  if (newestCreated) {
    dayStart = newestCreated.slice(0, 10); // "YYYY-MM-DD" (awal hari)
    const next = new Date(`${dayStart}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    dayEnd = next.toISOString().slice(0, 10); // hari berikutnya (eksklusif)
  }

  // 1. Inisialisasi basis query utama
  let dbQuery = supabase
    .from("tabel_berita")
    .select(
      `
      id_berita,
      judul,
      isi_teks,
      portal_sumber,
      url_asli,
      waktu_rilis,
      created_at,
      id_cluster,
      status_proses,
      tabel_cluster (
        judul_summary,
        summary_text,
        tabel_sentimen_aktor (
          nama_aktor,
          sentimen,
          persentase
        )
      )
    `,
    { count: 'exact' }
    )
    .in("id_cluster", clusterFilter);

  const isSearch = searchQuery.trim() !== "";

  // Saat MENCARI: telusuri seluruh berita teranalisis (abaikan batas hari
  // terakhir). Saat tidak mencari: batasi ke hari terakhir yang diupdate.
  if (!isSearch && dayStart && dayEnd) {
    dbQuery = dbQuery.gte("created_at", dayStart).lt("created_at", dayEnd);
  }

  // A. Filter pencarian: cocokkan frasa penuh ATAU tiap kata, di judul/isi.
  //    Hasilnya nanti diurutkan berdasarkan relevansi (lihat relevanceScore).
  if (isSearch) {
    const safe = searchQuery.replace(/[,()%*]/g, " ").trim();
    const words = safe.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
    const terms = [...new Set([safe, ...words])].filter(Boolean);
    const orStr = terms
      .map((t) => `judul.ilike.%${t}%,isi_teks.ilike.%${t}%`)
      .join(",");
    dbQuery = dbQuery.or(orStr);
  }

  // B. FIX UTAMA: Eksekusi filter kategori menggunakan klausa OR terpisah yang valid di Supabase JS
  if (categoryFilter !== "Semua") {
    let keywords: string[] = [];
    
    if (categoryFilter === "Ekonomi & Bisnis") {
      keywords = ["saham", "ihsg", "rupiah", "inflasi", "ekonomi", "bank", "investasi", "keuangan", "bisnis", "pasar", "perdagangan"];
    } else if (categoryFilter === "Politik & Pemerintahan") {
      keywords = ["politik", "pemilu", "partai", "pemerintah", "menteri", "kabinet", "presiden", "dpr", "pilkada", "demokrasi", "prabowo"];
    } else if (categoryFilter === "Hukum & Keamanan") {
      keywords = ["hukum", "polisi", "tni", "kpk", "sidang", "hakim", "jaksa", "kriminal", "korupsi"];
    } else if (categoryFilter === "Sosial & Masyarakat") {
      keywords = ["sosial", "masyarakat", "bencana", "warga", "komunitas", "budaya", "demo", "bansos"];
    } else if (categoryFilter === "Kesehatan") {
      keywords = ["kesehatan", "rumah sakit", "dokter", "obat", "penyakit", "vaksin", "medis", "pasien", "bpjs"];
    } else if (categoryFilter === "Pendidikan") {
      keywords = ["pendidikan", "sekolah", "kuliah", "mahasiswa", "guru", "dosen", "kurikulum", "beasiswa", "kampus"];
    } else if (categoryFilter === "Energi & Lingkungan") {
      keywords = ["energi", "lingkungan", "iklim", "karbon", "polusi", "tambang", "batu bara", "sampah"];
    } else if (categoryFilter === "Teknologi") {
      keywords = ["teknologi", "startup", "ai", "kecerdasan buatan", "digital", "aplikasi", "gadget", "siber"];
    } else if (categoryFilter === "Olahraga & Hiburan") {
      keywords = ["bola", "liga", "gol", "timnas", "olahraga", "pertandingan", "konser", "film", "musik", "artis", "hiburan"];
    } else if (categoryFilter === "Hubungan Internasional") {
      keywords = ["internasional", "pbb", "diplomasi", "luar negeri", "asean", "perang", "perjanjian"];
    }

    if (keywords.length > 0) {
      // Gabungkan seluruh keyword kategori ke dalam satu format string OR Supabase yang legal
      const categoryString = keywords
        .map(kw => `judul.ilike.%${kw}%,isi_teks.ilike.%${kw}%`)
        .join(",");
      
      dbQuery = dbQuery.or(categoryString);
    }
  }

  // Eksekusi query. Saat mencari, urutkan berdasarkan RELEVANSI (judul paling
  // dekat dengan kata kunci di atas) lalu paginasi; selain itu urut terbaru.
  let beritaData: any[] = [];
  let count = 0;

  if (isSearch) {
    const { data, error } = await dbQuery.limit(500);
    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const ranked = (data || [])
      .map((b) => ({ item: b, score: relevanceScore(b, searchQuery) }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          new Date(b.item.created_at || 0).getTime() -
            new Date(a.item.created_at || 0).getTime(),
      );
    count = ranked.length;
    beritaData = ranked.slice(from, to + 1).map((r) => r.item);
  } else {
    const { data, error, count: c } = await dbQuery
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    beritaData = data || [];
    count = c ?? 0;
  }

  // 2. Ambil data semua sumber berita berdasarkan id_cluster
  const clusterIds = (beritaData || [])
    .map((b) => b.id_cluster)
    .filter((id): id is number => id !== null);

  let semuaSumberMap: Record<number, { portal: string; url: string }[]> = {};

  if (clusterIds.length > 0) {
    const { data: sumberData } = await supabase
      .from("tabel_berita")
      .select("id_cluster, portal_sumber, url_asli")
      .in("id_cluster", clusterIds);

    if (sumberData) {
      sumberData.forEach((item) => {
        if (item.id_cluster) {
          if (!semuaSumberMap[item.id_cluster]) {
            semuaSumberMap[item.id_cluster] = [];
          }
          const exists = semuaSumberMap[item.id_cluster].some(
            (s) => s.url === item.url_asli
          );
          if (!exists) {
            semuaSumberMap[item.id_cluster].push({
              portal: item.portal_sumber || getPublisherName(item.url_asli),
              url: item.url_asli,
            });
          }
        }
      });
    }
  }

  // 3. Mapping data hasil ekstraksi DB
  let transformed = (beritaData || []).map((item) =>
    transformBerita(item, semuaSumberMap[item.id_cluster || 0] || [])
  );

  return NextResponse.json({
    data: transformed,
    total: count !== null ? count : transformed.length, 
  });
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

export function transformBerita(
  item: any,
  siblingSources: { portal: string; url: string }[],
  sektorList: any[] = [],
) {
  const cluster = item.tabel_cluster;
  const aktors = cluster?.tabel_sentimen_aktor || [];
  const isProcessed = item.status_proses === 1 && item.id_cluster !== null;

  const sentiments = aktors.slice(0, 3).map((a: any) => ({
    type: a.sentimen as "Positif" | "Negatif" | "Netral",
    percentage: a.persentase,
    description: `${a.nama_aktor} — sentimen ${a.sentimen.toLowerCase()} terdeteksi.`,
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

  const sources = isProcessed && siblingSources.length > 0
    ? siblingSources
    : [{ portal: item.portal_sumber || getPublisherName(item.url_asli), url: item.url_asli }];

  return {
    id: item.id_berita,
    title: item.judul,
    category: detectCategory(item.judul || "", item.isi_teks || ""),
    description: cluster?.summary_text?.slice(0, 150) || item.isi_teks?.slice(0, 150) || "Konten berita tersedia, menunggu analisis AI...",
    sentiments: sentiments.length > 0 ? sentiments : [
      { type: "Netral" as const, percentage: 50, description: isProcessed ? "Analisis sedang diproses." : "⏳ Menunggu analisis AI." }
    ],
    impacts: impacts.length > 0 ? impacts : [
      { name: isProcessed ? "#BERITA" : "#MENUNGGU_PROSES", percentage: 50 }
    ],
    source: item.portal_sumber || getPublisherName(item.url_asli),
    url: item.url_asli,
    sources: sources,
    sektorPredictions: sektorPredictions,
    time: formatRelativeTime(item.created_at || item.waktu_rilis),
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
    fullContent: item.isi_teks || "",
    aiSummary: cluster?.summary_text || (isProcessed ? "Ringkasan belum tersedia." : "⏳ Analisis AI belum tersedia."),
    keywords: sektorPredictions.map((s) => s.nama_sektor),
    publishedAt: item.created_at 
      ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "-",
    isAnalyzed: isProcessed,
  };
}

function detectCategory(judul: string, isi: string): string {
  const teks = `${judul} ${isi}`.toLowerCase();

  if (/saham|ihsg|rupiah|inflasi|ekonomi|bank|investasi|keuangan|ekspor|impor|bisnis|korporasi|merger|pasar|perdagangan/.test(teks)) return "Ekonomi & Bisnis";
  if (/politik|pemilu|partai|pemerintah|menteri|kabinet|legislatif|koalisi|presiden|dpr|pilkada|demokrasi|prabowo/.test(teks)) return "Politik & Pemerintahan";
  if (/hukum|keamanan|polisi|tni|kpk|sidang|hakim|jaksa|kriminal|terorisme|pasal|gugatan|korupsi/.test(teks)) return "Hukum & Keamanan";
  if (/sosial|masyarakat|bencana|warga|komunitas|budaya|adatan|demo|aksi|kemiskinan|bansos/.test(teks)) return "Sosial & Masyarakat";
  if (/kesehatan|rumah sakit|dokter|obat|penyakit|vaksin|medis|pasien|pandemi|wabah|bpjs/.test(teks)) return "Kesehatan";
  if (/pendidikan|sekolah|kuliah|mahasiswa|guru|dosen|kurikulum|beasiswa|kemendikbud|kampus/.test(teks)) return "Pendidikan";
  if (/energi|lingkungan|iklim|karbon|polusi|tambang|batu bara|plts|sumber daya|sampah|kehutanan/.test(teks)) return "Energi & Lingkungan";
  if (/teknologi|startup|\bai\b|kecerdasan buatan|machine learning|digital|aplikasi|gadget|siber|robot|software/.test(teks)) return "Teknologi";
  if (/bola|liga|gol|timnas|olahraga|atlet|pertandingan|juara|konser|film|musik|selebriti|artis|hiburan/.test(teks)) return "Olahraga & Hiburan";
  if (/internasional|pbb|diplomasi|luar negeri|g20|asean|perbatasan|perang|perjanjian/.test(teks)) return "Hubungan Internasional";

  return "Ekonomi & Bisnis"; 
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