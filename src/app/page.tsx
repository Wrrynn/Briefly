"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CategoryFilter from "./components/CategoryFilter";
import SentimentFilter from "./components/SentimentFilter";
import NewsCard from "./components/NewsCard";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";

const ITEMS_PER_PAGE = 10;

export default function Home() {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("Semua");
    const [sentimentFilter, setSentimentFilter] = useState("Semua");
    const [showFilters, setShowFilters] = useState(false);

    // Jumlah filter aktif (selain "Semua") untuk badge di tombol filter
    const activeFilterCount =
        (category !== "Semua" ? 1 : 0) + (sentimentFilter !== "Semua" ? 1 : 0);

    const [allNews, setAllNews] = useState<any[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalNewsCount, setTotalNewsCount] = useState(0);

    const [isDarkMode, setIsDarkMode] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Efek Pengaturan Tema (Dark Mode)
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme");
        const isDark = savedTheme === "dark" || (!savedTheme && true);
        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    // Reset halaman ke hal. 1 secara otomatis jika kata pencarian, kategori, atau sentimen berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [query, category, sentimentFilter]);

    // Ambil data dinamis dari API secara terpusat
    useEffect(() => {
        setLoadingNews(true);

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

        fetch(url, { cache: "no-store" })
            .then((res) => res.json())
            .then((json) => {
                if (json.data) {
                    setAllNews(json.data);
                    setTotalNewsCount(json.total || 0);
                } else {
                    setAllNews([]);
                    setTotalNewsCount(0);
                }
            })
            .catch((err) => {
                console.error("Gagal mengambil berita:", err);
                setAllNews([]);
                setTotalNewsCount(0);
            })
            .finally(() => {
                setLoadingNews(false);
            });
    }, [currentPage, category, query, sentimentFilter]);

    const filteredNews = allNews;
    const totalPages = totalNewsCount > 0 ? Math.ceil(totalNewsCount / ITEMS_PER_PAGE) : 1;

    const handleToggleTheme = (newMode: boolean) => {
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

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
                <HeroSection
                    setQuery={setQuery}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={handleToggleTheme}
                    trendingNews={allNews.slice(0, 3)}
                    loadingTrending={loadingNews}
                    searchActive={query.trim() !== ""}
                    sentimentFilter={sentimentFilter}
                    setSentimentFilter={setSentimentFilter}
                />

                <div id="news-content" className="py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="mb-10">
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
                            {totalNewsCount > 0 && totalPages > 1 && (
                                <p className="text-xs sm:text-sm text-gray-400 dark:text-white/30 uppercase tracking-[0.15em] font-bold">
                                    Hal. {currentPage} / {totalPages}
                                </p>
                            )}
                        </div>

                        {loadingNews ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden animate-pulse shadow-lg shadow-gray-100/60 dark:shadow-none"
                                    >
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
                                            <div className="h-11 bg-gray-200 dark:bg-white/10 rounded-xl w-full mt-5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {filteredNews.length > 0 ? (
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
                                                        ? `Belum ada berita teranalisis untuk kategori "${category}"${sentimentFilter !== "Semua" ? ` dengan sentimen ${sentimentFilter}` : ""} hari ini.`
                                                        : sentimentFilter !== "Semua"
                                                            ? `Belum ada berita dengan sentimen ${sentimentFilter} yang dapat ditampilkan.`
                                                            : "Belum ada berita yang dapat ditampilkan."}
                                            </p>
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