import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { transformCluster, q } from "../analyze-news/berita/route";

// Trending = berita yang sedang RAMAI, dihitung dari metrik (klik analisis +
// waktu baca) dengan PELURUHAN waktu (decay) supaya aktivitas lama makin tidak
// berpengaruh dan daftar terasa hidup.
//
//   skor = (W_KLIK*klik + W_BACA_PER_MENIT*menit_baca) * 0.5^(umur_jam/HALF_LIFE)
//
// W_BACA dibuat lebih besar dari W_KLIK karena waktu baca lebih sulit dimanipulasi
// (klik iseng murah, baca lama menandakan minat nyata).
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

export async function GET() {
  // 1. Ambil semua metrik & hitung skor decay.
  const metrikRes = await q(() =>
    supabase
      .from("tabel_metrik")
      .select("id_cluster, jumlah_klik, total_durasi_ms, updated_at"),
  );
  const metrik = (metrikRes.data as any[]) || [];

  const now = Date.now();
  const scored = metrik
    .map((m) => {
      const menit = (m.total_durasi_ms || 0) / 60000;
      const raw = W_KLIK * (m.jumlah_klik || 0) + W_BACA_PER_MENIT * menit;
      const umurJam = m.updated_at
        ? (now - new Date(m.updated_at).getTime()) / 3_600_000
        : Number.POSITIVE_INFINITY;
      const decay = Math.pow(0.5, umurJam / HALF_LIFE_JAM);
      return { id: m.id_cluster, score: raw * decay };
    })
    .filter((s) => s.id != null && s.score > 0)
    .sort((a, b) => b.score - a.score);

  // Ambil kandidat lebih dari 3 — sebagian mungkin belum di-summarize.
  const topIds = scored.slice(0, 12).map((s) => s.id);

  // 2. Map prediksi sektor per klaster (dipakai transformCluster).
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

  // 3. Ambil detail klaster trending (hanya yang sudah di-summarize), urut sesuai skor.
  let trending: any[] = [];
  if (topIds.length) {
    const res = await q(() =>
      supabase
        .from("tabel_cluster")
        .select(CLUSTER_SELECT)
        .in("id_cluster", topIds)
        .not("judul_summary", "is", null),
    );
    const byId: Record<number, any> = {};
    ((res.data as any[]) || []).forEach((c) => (byId[c.id_cluster] = c));
    trending = topIds
      .map((id) => byId[id])
      .filter(Boolean)
      .map((c) => transformCluster(c, sektorMap[c.id_cluster] || []));
  }

  // 4. Fallback: bila metrik belum cukup, lengkapi dengan berita TERBARU
  //    supaya bagian trending tidak pernah kosong.
  if (trending.length < 3) {
    const sudahAda = new Set(trending.map((t) => t.id));
    const latest = await q(() =>
      supabase
        .from("tabel_cluster")
        .select(CLUSTER_SELECT)
        .not("judul_summary", "is", null)
        .order("waktu_terbentuk", { ascending: false })
        .limit(3 + trending.length + 5),
    );
    const tambahan = ((latest.data as any[]) || [])
      .filter((c) => !sudahAda.has(c.id_cluster))
      .slice(0, 3 - trending.length)
      .map((c) => transformCluster(c, sektorMap[c.id_cluster] || []));
    trending = [...trending, ...tambahan];
  }

  return NextResponse.json({ data: trending.slice(0, 3) });
}
