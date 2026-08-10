import { NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import {
  fetchMetrikFor,
  fetchSektorFor,
  filterRentangHari,
  getClusterIndex,
  transformCluster,
} from "@/lib/news";

export const dynamic = "force-dynamic";

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

const TOP_N = 3;

// Jendela trending disamakan dengan rentang default feed (7 hari). Sebelumnya
// terkunci ke SATU hari terakhir: pada hari sepi — dan hari terakhir di
// database Anda hanya berisi 2 klaster — grid 3 kolom tampil bolong.
const JENDELA_HARI = 7;

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  // 1. Pakai indeks klaster yang sama dengan feed utama (sudah di-cache), bukan
  //    query terpisah 1000 klaster tiap request. Efek samping bagusnya: daftar
  //    trending dijamin konsisten dengan daftar berita.
  let entries;
  try {
    entries = await getClusterIndex();
  } catch (e) {
    console.error("Supabase Error (trending):", e);
    return NextResponse.json({ data: [] }, { status: 503 });
  }

  // 2. Saring ke jendela hari terakhir yang ada di database.
  const kandidat = filterRentangHari(entries, JENDELA_HARI);

  // 3. Metrik hanya untuk kandidat (bukan seluruh tabel_metrik).
  const metrikMap = await fetchMetrikFor(kandidat.map((e) => e.id));

  // 4. Skor decay — peluruhan waktu tetap membuat yang terbaru naik.
  const now = Date.now();
  const scored = kandidat.map((e) => {
    const m = metrikMap[e.id];
    let score = 0;
    if (m) {
      const menit = (m.total_durasi_ms || 0) / 60000;
      const raw = W_KLIK * (m.jumlah_klik || 0) + W_BACA_PER_MENIT * menit;
      const umurJam = m.updated_at
        ? (now - new Date(m.updated_at).getTime()) / 3_600_000
        : Number.POSITIVE_INFINITY;
      score = raw * Math.pow(0.5, umurJam / HALF_LIFE_JAM);
    }
    return { e, score };
  });

  // 5. Urut: skor tertinggi dulu; bila seri/belum ada metrik, yang terbaru dulu.
  //    Jadi bila belum ada aktivitas hari ini, trending = berita terbaru hari ini.
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      new Date(b.e.waktu || 0).getTime() - new Date(a.e.waktu || 0).getTime(),
  );

  const top = scored.slice(0, TOP_N);
  const sektorMap = await fetchSektorFor(top.map(({ e }) => e.id));

  const data = top.map(({ e }) =>
    transformCluster(
      e.raw,
      sektorMap[e.id] || [],
      e.category,
      Number(metrikMap[e.id]?.jumlah_klik) || 0,
    ),
  );

  return NextResponse.json({ data });
}
