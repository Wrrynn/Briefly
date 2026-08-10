import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getClusterIndex, q } from "@/lib/news";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { tooManyRequests } from "@/lib/auth";

// Statistik agregat untuk landing page. Endpoint ini SENGAJA publik (landing
// tampil sebelum login), jadi ia dilindungi dua hal: hasilnya di-cache dan
// pemanggilnya dibatasi laju — sebelumnya tiap hit menarik 5000 klaster lalu
// mengagregasi semuanya, sehingga siapa pun bisa membebani database dengan
// me-refresh halaman depan.
//
// Kategori & sentimen memakai indeks klaster yang SAMA dengan feed app, jadi
// angka di grafik konsisten dengan filter di aplikasi.
export const dynamic = "force-dynamic";

const SEP = "::|::";
const STATS_TTL_MS = 10 * 60 * 1000;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

let statsCache: { at: number; payload: unknown } | null = null;
let statsInflight: Promise<unknown> | null = null;

async function computeStats() {
  const { data: totals, error } = await q(() => supabase.rpc("get_landing_stats"));
  if (error) throw error instanceof Error ? error : new Error(String(error?.message || error));

  const clusters = await getClusterIndex();

  const kategoriTotals = new Map<string, number>();
  const dailyAll = new Map<string, number>();
  const kategoriDaily = new Map<string, number>();
  const sentimenCount = new Map<string, number>();
  const aktorOverall = new Map<string, number>();
  const aktorKategori = new Map<string, number>();

  for (const c of clusters) {
    const kategori = c.category;
    const tgl = (c.raw.waktu_terbentuk || "").slice(0, 10);
    const aktors = c.raw.tabel_sentimen_aktor || [];
    const sentimen = c.sentiment;

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

  return {
    totals,
    kategori_top,
    daily,
    kategori_daily,
    sentimen,
    aktor_top,
    aktor_kategori,
  };
}

async function getStats() {
  const now = Date.now();
  if (statsCache && now - statsCache.at < STATS_TTL_MS) return statsCache.payload;
  if (statsInflight) return statsInflight;

  statsInflight = computeStats()
    .then((payload) => {
      statsCache = { at: Date.now(), payload };
      return payload;
    })
    .catch((e) => {
      if (statsCache) return statsCache.payload; // sajikan yang lama daripada gagal
      throw e;
    })
    .finally(() => {
      statsInflight = null;
    });

  return statsInflight;
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  if (!allowRequest(`landing:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests();
  }

  try {
    return NextResponse.json(await getStats());
  } catch (e: any) {
    console.error("Landing stats error:", e);
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 503 });
  }
}
