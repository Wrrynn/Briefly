import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { detectCategory, combineSentiments } from "@/app/api/analyze-news/berita/route";

// Statistik agregat untuk landing page (publik). Kategori & sentimen dihitung
// dengan fungsi yang SAMA dengan feed app (detectCategory / combineSentiments)
// agar filter di grafik konsisten dengan filter di aplikasi.
export const dynamic = "force-dynamic";

const SEP = "::|::";

type Aktor = { nama_aktor: string | null; sentimen: string | null };
type Cluster = {
  judul_summary: string | null;
  summary_text: string | null;
  waktu_terbentuk: string | null;
  tabel_sentimen_aktor: Aktor[] | null;
};

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const { data: totals, error: e1 } = await supabase.rpc("get_landing_stats");
  if (e1) return NextResponse.json({ error: e1.message }, { status: 503 });

  // Klaster yang sudah diringkas = item yang ditampilkan & difilter di app.
  const { data: rows, error: e2 } = await supabase
    .from("tabel_cluster")
    .select("judul_summary, summary_text, waktu_terbentuk, tabel_sentimen_aktor(nama_aktor, sentimen)")
    .not("judul_summary", "is", null)
    .limit(5000);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 503 });

  const clusters = (rows ?? []) as Cluster[];

  const kategoriTotals = new Map<string, number>();
  const dailyAll = new Map<string, number>();
  const kategoriDaily = new Map<string, number>();
  const sentimenCount = new Map<string, number>();
  const aktorOverall = new Map<string, number>();
  const aktorKategori = new Map<string, number>();

  for (const c of clusters) {
    const kategori = detectCategory(c.judul_summary || "", c.summary_text || "");
    const tgl = (c.waktu_terbentuk || "").slice(0, 10);
    const aktors = c.tabel_sentimen_aktor || [];
    const sentimen = combineSentiments(aktors);

    kategoriTotals.set(kategori, (kategoriTotals.get(kategori) || 0) + 1);
    sentimenCount.set(sentimen, (sentimenCount.get(sentimen) || 0) + 1);
    if (tgl) {
      dailyAll.set(tgl, (dailyAll.get(tgl) || 0) + 1);
      const k = `${tgl}${SEP}${kategori}`;
      kategoriDaily.set(k, (kategoriDaily.get(k) || 0) + 1);
    }
    for (const a of aktors) {
      const nama = (a.nama_aktor || "").trim();
      if (!nama) continue;
      aktorOverall.set(nama, (aktorOverall.get(nama) || 0) + 1);
      const ak = `${kategori}${SEP}${nama}`;
      aktorKategori.set(ak, (aktorKategori.get(ak) || 0) + 1);
    }
  }

  const kategori_top = [...kategoriTotals.entries()]
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n);

  const daily = [...dailyAll.entries()]
    .map(([tgl, n]) => ({ tgl, n }))
    .sort((a, b) => a.tgl.localeCompare(b.tgl));

  const kategori_daily = [...kategoriDaily.entries()].map(([k, n]) => {
    const [tgl, label] = k.split(SEP);
    return { tgl, label, n };
  });

  const sentimen = [...sentimenCount.entries()]
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n);

  const aktor_top = [...aktorOverall.entries()]
    .map(([label, n]) => ({ label, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);

  const perKat = new Map<string, { aktor: string; n: number }[]>();
  for (const [k, n] of aktorKategori.entries()) {
    const [kategori, aktor] = k.split(SEP);
    const arr = perKat.get(kategori) || [];
    arr.push({ aktor, n });
    perKat.set(kategori, arr);
  }
  const aktor_kategori: { kategori: string; aktor: string; n: number }[] = [];
  for (const [kategori, arr] of perKat.entries()) {
    arr.sort((a, b) => b.n - a.n);
    for (const item of arr.slice(0, 3)) {
      aktor_kategori.push({ kategori, aktor: item.aktor, n: item.n });
    }
  }

  return NextResponse.json({
    totals,
    kategori_top,
    daily,
    kategori_daily,
    sentimen,
    aktor_top,
    aktor_kategori,
  });
}
