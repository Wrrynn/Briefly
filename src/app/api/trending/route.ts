import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { transformCluster, q, jakartaDateStr } from "../analyze-news/berita/route";

// Trending = berita yang sedang RAMAI HARI INI. Hanya klaster pada HARI TERAKHIR
// yang ada di database (sama dengan daftar utama) yang ikut — tidak ada berita 2
// hari lalu dst. Urutan ditentukan metrik (klik analisis + waktu baca) dengan
// PELURUHAN waktu (decay) supaya yang baru ramai naik:
//
//   skor = (W_KLIK*klik + W_BACA_PER_MENIT*menit_baca) * 0.5^(umur_jam/HALF_LIFE)
//
// W_BACA dibuat lebih besar dari W_KLIK karena waktu baca lebih sulit dimanipulasi.
const W_KLIK = 1;
const W_BACA_PER_MENIT = 2;
const HALF_LIFE_JAM = 24; // skor tinggal separuh setiap 24 jam

// Field klaster yang dibutuhkan transformCluster (judul, sumber, waktu, dll).
const CLUSTER_SELECT = `
  id_cluster,
  judul_summary,
  summary_text,
  waktu_terbentuk,
  jumlah_berita,
  tabel_sentimen_aktor ( nama_aktor, sentimen, persentase, alasan ),
  tabel_berita ( judul, isi_teks, portal_sumber, url_asli, created_at )
`;

// Waktu efektif klaster = created_at anggota TERBARU (fallback waktu_terbentuk).
// Sama dengan perhitungan di transformCluster agar tanggal konsisten dgn kartu.
function repWaktu(c: any): string | null {
  const members: any[] = c.tabel_berita || [];
  const rep = members.reduce<string | null>((acc, m) => {
    if (!m?.created_at) return acc;
    if (!acc || new Date(m.created_at).getTime() > new Date(acc).getTime()) {
      return m.created_at;
    }
    return acc;
  }, null);
  return rep || c.waktu_terbentuk || null;
}

export async function GET() {
  // 1. Metrik per klaster.
  const metrikRes = await q(() =>
    supabase
      .from("tabel_metrik")
      .select("id_cluster, jumlah_klik, total_durasi_ms, updated_at"),
  );
  const metrikMap: Record<number, any> = {};
  ((metrikRes.data as any[]) || []).forEach((m) => {
    if (m.id_cluster != null) metrikMap[m.id_cluster] = m;
  });

  // 2. Prediksi sektor per klaster (dipakai transformCluster).
  const sektorRes = await q(() =>
    supabase
      .from("tabel_sektor")
      .select("id_cluster, nama_sektor, prediksi_dampak, tingkat_risiko"),
  );
  const sektorMap: Record<number, any[]> = {};
  ((sektorRes.data as any[]) || []).forEach((s) => {
    if (s.id_cluster == null) return;
    (sektorMap[s.id_cluster] ||= []).push(s);
  });

  // 3. Ambil klaster terbaru yang sudah di-summarize, lalu tentukan HARI TERAKHIR
  //    (tanggal kalender WIB paling baru) dan saring hanya klaster pada hari itu.
  const res = await q(() =>
    supabase
      .from("tabel_cluster")
      .select(CLUSTER_SELECT)
      .not("judul_summary", "is", null)
      .order("waktu_terbentuk", { ascending: false })
      .limit(1000),
  );
  const clusters = ((res.data as any[]) || []).map((c) => ({
    c,
    waktu: repWaktu(c),
  }));

  const latestDate = clusters.reduce<string | null>((acc, x) => {
    if (!x.waktu) return acc;
    const d = jakartaDateStr(new Date(x.waktu));
    return !acc || d > acc ? d : acc;
  }, null);
  const todays = latestDate
    ? clusters.filter(
        (x) => x.waktu && jakartaDateStr(new Date(x.waktu)) === latestDate,
      )
    : clusters;

  // 4. Skor decay HANYA untuk klaster hari ini. Tanpa metrik -> skor 0.
  const now = Date.now();
  const scored = todays.map(({ c, waktu }) => {
    const m = metrikMap[c.id_cluster];
    let score = 0;
    if (m) {
      const menit = (m.total_durasi_ms || 0) / 60000;
      const raw = W_KLIK * (m.jumlah_klik || 0) + W_BACA_PER_MENIT * menit;
      const umurJam = m.updated_at
        ? (now - new Date(m.updated_at).getTime()) / 3_600_000
        : Number.POSITIVE_INFINITY;
      score = raw * Math.pow(0.5, umurJam / HALF_LIFE_JAM);
    }
    return { c, waktu, score };
  });

  // 5. Urut: skor tertinggi dulu; bila seri/belum ada metrik, yang terbaru dulu.
  //    Jadi bila belum ada aktivitas hari ini, trending = berita terbaru hari ini.
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      new Date(b.waktu || 0).getTime() - new Date(a.waktu || 0).getTime(),
  );

  const data = scored
    .slice(0, 3)
    .map(({ c }) => transformCluster(c, sektorMap[c.id_cluster] || []));

  return NextResponse.json({ data });
}
