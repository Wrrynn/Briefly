import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import {
  fetchSektorFor,
  fetchViewsFor,
  filterRentangHari,
  firstQueryWordRank,
  getClusterIndex,
  latestDateOf,
  oldestDateOf,
  relevanceScore,
  RENTANG_DEFAULT,
  RENTANG_VALID,
  transformCluster,
  type ClusterEntry,
} from "@/lib/news";

export const dynamic = "force-dynamic";

// Batas atas item per halaman. Sebelumnya `limit` dipakai apa adanya, jadi
// ?limit=100000 memaksa server mengirim seluruh isi database dalam satu balasan.
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  // Endpoint ini memakai client service-role (bypass RLS), jadi identitas WAJIB
  // diverifikasi lebih dulu — proxy.ts sengaja tidak memblokir /api agar API
  // membalas JSON, bukan redirect HTML.
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") || "10") || 10),
  );
  const categoryFilter = searchParams.get("category") || "Semua";
  const searchQuery = searchParams.get("search") || "";
  const sentimentFilter = searchParams.get("sentiment") || "Semua";
  // Urutan waktu: "desc" (terbaru dulu, default) atau "asc" (terlama dulu).
  const sortOrder = searchParams.get("sort") === "asc" ? "asc" : "desc";
  // Rentang hari (mundur dari tanggal TERBARU DI DATABASE). 0 = seluruh arsip.
  const daysRaw = parseInt(searchParams.get("days") ?? "");
  const days = (RENTANG_VALID as readonly number[]).includes(daysRaw)
    ? daysRaw
    : RENTANG_DEFAULT;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1. Indeks klaster (kategori, sentimen gabungan, dokumen pencarian) — sudah
  //    dihitung sekali lalu di-cache, tidak dibangun ulang tiap request.
  let entries: ClusterEntry[];
  try {
    entries = await getClusterIndex();
  } catch (e: any) {
    console.error("Supabase Error (cluster index):", e);
    return NextResponse.json(
      { error: "Gagal memuat data analisis. Coba muat ulang." },
      { status: 503 },
    );
  }

  const isSearch = searchQuery.trim() !== "";

  // 2. Saat MENCARI: telusuri SELURUH data (semua tanggal) — pencarian bersifat
  //    global ke seantero database. Saat TIDAK mencari: batasi ke rentang hari
  //    yang dipilih pengguna (default 7 hari terakhir yang ADA DI DATABASE).
  let filtered: ClusterEntry[] = isSearch
    ? entries
    : filterRentangHari(entries, days);

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
    filtered = filtered.filter((e) => relevanceScore(e.search, searchQuery) > 0);
  }

  // 5. Urutkan berdasarkan waktu sesuai pilihan (asc/desc). Saat mencari,
  //    KATA QUERY AWAL diutamakan: hasil dikelompokkan menurut kata query
  //    pertama yang cocok (mis. "jokowi" dulu, lalu "prabowo"), dan DI DALAM
  //    tiap kelompok tetap diurut berdasarkan waktu.
  const byTime = (a: ClusterEntry, b: ClusterEntry) => {
    const ta = new Date(a.waktu || 0).getTime();
    const tb = new Date(b.waktu || 0).getTime();
    return sortOrder === "asc" ? ta - tb : tb - ta;
  };
  if (isSearch) {
    const rankCache = new Map<ClusterEntry, number>();
    const rankOf = (e: ClusterEntry) => {
      let r = rankCache.get(e);
      if (r === undefined) {
        r = firstQueryWordRank(e.search, searchQuery);
        rankCache.set(e, r);
      }
      return r;
    };
    // Salin dulu: `filtered` bisa masih menunjuk ke array indeks yang di-cache,
    // dan sort() mengubah array di tempat.
    filtered = [...filtered].sort((a, b) => rankOf(a) - rankOf(b) || byTime(a, b));
  } else {
    filtered = [...filtered].sort(byTime);
  }

  // 6. Paginasi DULU, baru ambil data pendukung untuk id di halaman ini saja.
  //    Sebelumnya seluruh tabel_sektor dan tabel_metrik ditarik utuh hanya untuk
  //    melengkapi 12 kartu.
  const count = filtered.length;
  const pageEntries = filtered.slice(from, to + 1);
  const pageIds = pageEntries.map((e) => e.id);

  const [sektorMap, viewsMap] = await Promise.all([
    fetchSektorFor(pageIds),
    fetchViewsFor(pageIds),
  ]);

  const transformed = pageEntries.map((e) =>
    transformCluster(e.raw, sektorMap[e.id] || [], e.category, viewsMap[e.id] || 0),
  );

  // `meta` menyediakan konteks kesegaran data untuk UI: tanpa ini, feed
  // menampilkan berita sebulan lalu di bawah judul "Trending Hari Ini" tanpa
  // penjelasan apa pun.
  return NextResponse.json({
    data: transformed,
    total: count,
    meta: {
      days,
      latestDate: latestDateOf(entries),
      oldestDate: oldestDateOf(entries),
      totalArsip: entries.length,
    },
  });
}
