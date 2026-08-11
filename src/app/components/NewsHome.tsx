"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CategoryFilter from "@/app/components/CategoryFilter";
import SentimentFilter from "@/app/components/SentimentFilter";
import NewsCard from "@/app/components/NewsCard";
import SiteHeader from "@/app/components/SiteHeader";
import HeroSection from "@/app/components/HeroSection";
import Footer from "@/app/components/Footer";

const ITEMS_PER_PAGE = 12;

// Pilihan rentang waktu. Dihitung mundur dari tanggal terbaru DI DATABASE,
// bukan tanggal sistem — pipeline bisa tertinggal berhari-hari.
const RENTANG = [
    { nilai: 1, label: "1 hari" },
    { nilai: 7, label: "7 hari" },
    { nilai: 30, label: "30 hari" },
    { nilai: 0, label: "Semua" },
];

function tanggalIndo(iso?: string | null): string {
    if (!iso) return "-";
    const d = new Date(`${iso}T00:00:00`);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// Berapa hari data terbaru tertinggal dari hari ini.
function umurHari(iso?: string | null): number | null {
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export default function NewsHome() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Semua");
    const [sentimentFilter, setSentimentFilter] = useState("Semua");
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
    const [showFilters, setShowFilters] = useState(false);
    // Rentang hari dihitung mundur dari tanggal TERBARU DI DATABASE (0 = semua).
    const [days, setDays] = useState(7);
    const [meta, setMeta] = useState<{
        latestDate?: string | null;
        oldestDate?: string | null;
        totalArsip?: number;
    } | null>(null);

    // Jumlah filter aktif (selain "Semua") untuk badge di tombol filter
    const activeFilterCount =
        (category !== "Semua" ? 1 : 0) + (sentimentFilter !== "Semua" ? 1 : 0);

    const [allNews, setAllNews] = useState<any[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);
    // Dibedakan dari "hasil kosong": dulu kegagalan jaringan ikut menampilkan
    // "Berita tidak ditemukan", seolah-olah datanya memang tidak ada.
    const [errorNews, setErrorNews] = useState<string | null>(null);

    // Trending: berita paling ramai (klik analisis + waktu baca) dari /api/trending
    const [trendingNews, setTrendingNews] = useState<any[]>([]);
    const [loadingTrending, setLoadingTrending] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalNewsCount, setTotalNewsCount] = useState(0);
    // Dinaikkan oleh tombol "Coba lagi" untuk memicu ulang fetch.
    const [reloadKey, setReloadKey] = useState(0);

    const [mounted, setMounted] = useState(false);

    // Tema tidak lagi diurus di sini: class `dark` sudah dipasang sebelum paint
    // pertama oleh SKRIP_TEMA di layout, dan tombolnya ada di SiteHeader.
    useEffect(() => setMounted(true), []);

    // Reset halaman ke hal. 1 secara otomatis jika kata pencarian, kategori, sentimen, rentang, atau urutan berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [query, category, sentimentFilter, sortOrder, days]);

    // Terapkan rentang default dari preferensi pengguna (halaman /profil).
    // Hanya memicu fetch ulang bila nilainya memang berbeda dari default.
    useEffect(() => {
        const ac = new AbortController();
        fetch("/api/profil", { cache: "no-store", signal: ac.signal })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
                const n = j?.preferensi?.rentang_hari;
                if (typeof n === "number" && n !== days) setDays(n);
            })
            .catch(() => {});
        return () => ac.abort();
        // Sengaja hanya sekali saat mount — bukan mengikuti perubahan `days`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Ambil daftar trending (terpisah dari daftar utama yang ter-paginasi/filter)
    useEffect(() => {
        const ac = new AbortController();
        fetch("/api/trending", { cache: "no-store", signal: ac.signal })
            .then((res) => (res.ok ? res.json() : { data: [] }))
            .then((json) => setTrendingNews(json.data || []))
            .catch((err) => {
                if (err?.name === "AbortError") return;
                console.error("Gagal mengambil trending:", err);
                setTrendingNews([]);
            })
            .finally(() => setLoadingTrending(false));
        return () => ac.abort();
    }, []);

    // Ambil data dinamis dari API secara terpusat.
    // AbortController membatalkan request lama saat filter/halaman berubah:
    // tanpa itu, respons yang datang telat bisa menimpa hasil terbaru.
    useEffect(() => {
        const ac = new AbortController();
        setLoadingNews(true);
        setErrorNews(null);

        let url = `/api/analyze-news/berita?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
        if (category !== "Semua") {
            url += `&category=${encodeURIComponent(category)}`;
        }
        if (query.trim() !== "") {
            url += `&search=${encodeURIComponent(query)}`;
        }
        if (sentimentFilter !== "Semua") {
            url += `&sentiment=${encodeURIComponent(sentimentFilter)}`;
        }
        url += `&sort=${sortOrder}&days=${days}`;

        fetch(url, { cache: "no-store", signal: ac.signal })
            .then(async (res) => {
                // Sesi habis / belum login: API kini membalas 401 (bukan HTML).
                if (res.status === 401) {
                    window.location.href = "/login?expired=1";
                    return null;
                }
                if (!res.ok) {
                    const body = await res.json().catch(() => null);
                    throw new Error(body?.error || `Gagal memuat berita (${res.status})`);
                }
                return res.json();
            })
            .then((json) => {
                if (!json) return;
                setAllNews(json.data || []);
                setTotalNewsCount(json.total || 0);
                if (json.meta) setMeta(json.meta);
            })
            .catch((err) => {
                if (err?.name === "AbortError") return;
                console.error("Gagal mengambil berita:", err);
                setErrorNews(err?.message || "Gagal memuat berita.");
                setAllNews([]);
                setTotalNewsCount(0);
            })
            .finally(() => {
                if (!ac.signal.aborted) setLoadingNews(false);
            });

        return () => ac.abort();
    }, [currentPage, category, query, sentimentFilter, sortOrder, days, reloadKey]);

    const filteredNews = allNews;
    const totalPages = totalNewsCount > 0 ? Math.ceil(totalNewsCount / ITEMS_PER_PAGE) : 1;

    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        document.getElementById("news-content")?.scrollIntoView({ behavior: "smooth" });
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen transition-colors duration-500 bg-gray-50 dark:bg-[#05051a]">
            <div className="min-h-screen transition-colors duration-500">
                <SiteHeader
                    setQuery={setQuery}
                    searchActive={query.trim() !== ""}
                    sentimentFilter={sentimentFilter}
                    setSentimentFilter={setSentimentFilter}
                />

                <HeroSection
                    trendingNews={trendingNews}
                    loadingTrending={loadingTrending}
                    searchActive={query.trim() !== ""}
                    tanggalData={meta?.latestDate ?? null}
                />

                {/* scroll-mt menjaga judul daftar tidak tertutup header sticky
                    saat scrollIntoView dipanggil dari pencarian/paginasi. */}
                <div id="news-content" className="scroll-mt-24 pt-8 pb-20">
                    <div className="max-w-7xl mx-auto px-4">
                        {/* Kesegaran data — jujur soal kapan data terakhir masuk.
                            Tanpa ini, berita sebulan lalu tampil tanpa keterangan apa pun. */}
                        {meta?.latestDate && (umurHari(meta.latestDate) ?? 0) > 1 && (
                            <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/[0.07] px-5 py-3.5">
                                <span className="flex h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                <p className="text-[13px] text-amber-900 dark:text-amber-200/90">
                                    Data terakhir masuk{" "}
                                    <strong className="font-bold">{tanggalIndo(meta.latestDate)}</strong>
                                    {" — "}
                                    {umurHari(meta.latestDate)} hari lalu. Analisis baru belum tersedia.
                                </p>
                                {meta.totalArsip ? (
                                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700/70 dark:text-amber-300/50">
                                        Arsip: {meta.totalArsip.toLocaleString("id-ID")} analisis
                                    </span>
                                ) : null}
                            </div>
                        )}

                        <div className="mb-10">
                            {/* Rentang waktu — hanya relevan saat tidak mencari (pencarian selalu global) */}
                            {query.trim() === "" && (
                                <div className="mb-5 flex flex-wrap items-center gap-2">
                                    <span className="mr-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/40">
                                        Rentang
                                    </span>
                                    <div className="inline-flex flex-wrap gap-1 p-1 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5">
                                        {RENTANG.map((r) => (
                                            <button
                                                key={r.nilai}
                                                onClick={() => setDays(r.nilai)}
                                                aria-pressed={days === r.nilai}
                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                                                    days === r.nilai
                                                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow"
                                                        : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                    {meta?.latestDate && (
                                        <span className="text-[10px] text-gray-400 dark:text-white/30">
                                            {days === 0
                                                ? `${tanggalIndo(meta.oldestDate)} – ${tanggalIndo(meta.latestDate)}`
                                                : `s/d ${tanggalIndo(meta.latestDate)}`}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Baris kontrol: tombol filter + ringkasan filter aktif */}
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setShowFilters((v) => !v)}
                                    aria-expanded={showFilters}
                                    className={`relative flex items-center gap-2.5 pl-4 pr-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 outline-none border ${
                                        showFilters || activeFilterCount > 0
                                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                            : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                                    }`}
                                >
                                    {/* Ikon filter (corong) */}
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18l-7 8v6l-4 2v-8l-7-8z" />
                                    </svg>
                                    <span>Filter</span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-black">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                    {/* Chevron menandai status buka/tutup */}
                                    <svg
                                        className={`w-3.5 h-3.5 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={() => {
                                            setCategory("Semua");
                                            setSentimentFilter("Semua");
                                        }}
                                        className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-white/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Panel filter yang terpisah: Sektor & Analisis */}
                            <AnimatePresence initial={false}>
                                {showFilters && (
                                    <motion.div
                                        key="filter-panel"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-6 p-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm space-y-8">
                                            {/* Filter Sektor */}
                                            <div>
                                                <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/40">
                                                    <span className="h-1 w-6 rounded-full bg-blue-500" />
                                                    Filter Sektor
                                                </h3>
                                                <CategoryFilter selected={category} setSelected={handleCategoryChange} />
                                            </div>

                                            {/* Garis pemisah antar filter */}
                                            <div className="h-px w-full bg-gray-200 dark:bg-white/10" />

                                            {/* Filter Analisis (Sentimen) */}
                                            <div>
                                                <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/40">
                                                    <span className="h-1 w-6 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
                                                    Filter Analisis
                                                </h3>
                                                <SentimentFilter selected={sentimentFilter} setSelected={setSentimentFilter} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs sm:text-sm text-gray-400 dark:text-white/50 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">
                                    Menampilkan{" "}
                                    <span className="text-blue-600 dark:text-white">
                                        {totalNewsCount === 0
                                            ? "0"
                                            : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                                                currentPage * ITEMS_PER_PAGE,
                                                totalNewsCount,
                                            )}`}
                                    </span>{" "}
                                    dari{" "}
                                    <span className="text-blue-600 dark:text-white">
                                        {totalNewsCount}
                                    </span>{" "}
                                    berita
                                </p>
                                {sentimentFilter !== "Semua" && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-[0.2em] font-bold">
                                            Filter Sentimen:
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${
                                            sentimentFilter === "Positif"
                                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                                : sentimentFilter === "Negatif"
                                                    ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                                                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                        }`}>
                                            {sentimentFilter}
                                        </span>
                                        <button
                                            onClick={() => setSentimentFilter("Semua")}
                                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                            aria-label="Hapus filter sentimen"
                                        >
                                            <svg className="w-3 h-3 text-gray-400 dark:text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Urutkan: Terbaru (desc) / Terlama (asc) */}
                                <div className="flex items-center gap-2">
                                    <span className="hidden sm:inline text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-[0.2em] font-bold">
                                        Urutkan:
                                    </span>
                                    <div className="inline-flex p-1 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5">
                                        <button
                                            onClick={() => setSortOrder("desc")}
                                            aria-pressed={sortOrder === "desc"}
                                            className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                                                sortOrder === "desc"
                                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow"
                                                    : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                        >
                                            Terbaru
                                        </button>
                                        <button
                                            onClick={() => setSortOrder("asc")}
                                            aria-pressed={sortOrder === "asc"}
                                            className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                                                sortOrder === "asc"
                                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow"
                                                    : "text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                        >
                                            Terlama
                                        </button>
                                    </div>
                                </div>

                                {totalNewsCount > 0 && totalPages > 1 && (
                                    <p className="text-xs sm:text-sm text-gray-400 dark:text-white/30 uppercase tracking-[0.15em] font-bold">
                                        Hal. {currentPage} / {totalPages}
                                    </p>
                                )}
                            </div>
                        </div>

                        {loadingNews ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden animate-pulse shadow-lg shadow-gray-100/60 dark:shadow-none"
                                    >
                                        <div className="aspect-[16/9] w-full bg-gray-200 dark:bg-white/10" />
                                        <div className="p-6 space-y-3">
                                            <div className="flex justify-between">
                                                <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded-md" />
                                                <div className="h-5 w-14 bg-gray-200 dark:bg-white/10 rounded-md" />
                                            </div>
                                            <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/5" />
                                            <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-full mt-3" />
                                            <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-4/5" />
                                            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-full mt-3" />
                                            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-3/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {errorNews && (
                                    <div className="mb-10 flex flex-col items-center gap-4 rounded-[2.5rem] border-2 border-dashed border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 py-14 px-6 text-center">
                                        <p className="text-rose-700 dark:text-rose-400 font-bold uppercase tracking-[0.2em] text-xs">
                                            Gagal memuat berita
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-white/40 max-w-md">{errorNews}</p>
                                        <button
                                            onClick={() => setReloadKey((k) => k + 1)}
                                            className="mt-1 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                                        >
                                            Coba lagi
                                        </button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {errorNews ? null : filteredNews.length > 0 ? (
                                        filteredNews.map((item, i) => (
                                            <NewsCard
                                                key={item.id || item.id_berita || i}
                                                data={item}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2.5rem]">
                                            <p className="text-gray-400 dark:text-white/20 tracking-[0.2em] font-bold uppercase">
                                                Berita tidak ditemukan
                                            </p>
                                            <p className="text-gray-300 dark:text-white/20 text-sm mt-2">
                                                {query.trim() !== ""
                                                    ? `Kata kunci "${query}"${sentimentFilter !== "Semua" ? ` dengan sentimen ${sentimentFilter}` : ""} tidak ada di berita yang sudah dianalisis.`
                                                    : category !== "Semua"
                                                        ? `Belum ada berita teranalisis untuk kategori "${category}"${sentimentFilter !== "Semua" ? ` dengan sentimen ${sentimentFilter}` : ""} dalam rentang ini.`
                                                        : sentimentFilter !== "Semua"
                                                            ? `Belum ada berita dengan sentimen ${sentimentFilter} dalam rentang ini.`
                                                            : "Belum ada berita dalam rentang ini."}
                                            </p>
                                            {query.trim() === "" && days !== 0 && (
                                                <button
                                                    onClick={() => setDays(0)}
                                                    className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    Cari di seluruh arsip →
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {totalNewsCount > 0 && totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 sm:gap-3 mt-16">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </button>

                                        {/* Indikator halaman ringkas untuk mobile */}
                                        <span className="sm:hidden text-[11px] font-black text-gray-600 dark:text-white/60 uppercase tracking-[0.15em] px-2">
                                            {currentPage} / {totalPages}
                                        </span>

                                        <div className="hidden sm:flex items-center gap-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNo) => {
                                                const isActive = pageNo === currentPage;
                                                const isNear =
                                                    pageNo === 1 ||
                                                    pageNo === totalPages ||
                                                    Math.abs(pageNo - currentPage) <= 1;

                                                if (!isNear) {
                                                    if (
                                                        (pageNo === 2 && currentPage > 3) ||
                                                        (pageNo === totalPages - 1 && currentPage < totalPages - 2)
                                                    ) {
                                                        return (
                                                            <span key={pageNo} className="text-gray-400 dark:text-white/20 font-black text-sm px-1">
                                                                …
                                                            </span>
                                                        );
                                                    }
                                                    return null;
                                                }

                                                return (
                                                    <button
                                                        key={pageNo}
                                                        onClick={() => handlePageChange(pageNo)}
                                                        className={`w-10 h-10 rounded-full text-[11px] font-black transition-all duration-300 ${isActive
                                                                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg"
                                                                : "border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-white/50 hover:border-gray-400 dark:hover:border-white/30"
                                                            }`}
                                                    >
                                                        {pageNo}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages}
                                            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            <span className="hidden sm:inline">Selanjutnya</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <Footer />
            </div>
        </main>
    );
}
