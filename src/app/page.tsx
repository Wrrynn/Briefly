"use client";

import { useState, useEffect } from "react";
import CategoryFilter from "./components/CategoryFilter";
import NewsCard from "./components/NewsCard";
import HeroSection from "./components/HeroSection";

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  const [allNews, setAllNews] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    fetch("/api/analyze-news/berita?limit=100")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setAllNews(json.data);
          setFiltered(json.data);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil berita:", err);
      })
      .finally(() => {
        setLoadingNews(false);
      });
  }, []);

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

  useEffect(() => {
    let result = [...allNews];
    if (category !== "Semua") {
      result = result.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase(),
      );
    }
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
    setCurrentPage(0);
  }, [query, category, allNews]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedNews = filtered.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );

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
          setCategory={setCategory}
          isDarkMode={isDarkMode}
          setIsDarkMode={handleToggleTheme}
          trendingNews={allNews.slice(0, 3)}
          loadingTrending={loadingNews}
        />

        <div id="news-content" className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12">
              <CategoryFilter selected={category} setSelected={setCategory} />
            </div>

            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-gray-400 dark:text-white/50 uppercase tracking-[0.2em] font-bold">
                Menampilkan{" "}
                <span className="text-blue-600 dark:text-white">
                  {filtered.length === 0
                    ? "0"
                    : `${currentPage * ITEMS_PER_PAGE + 1}–${Math.min(
                        (currentPage + 1) * ITEMS_PER_PAGE,
                        filtered.length,
                      )}`}
                </span>{" "}
                dari{" "}
                <span className="text-blue-600 dark:text-white">
                  {filtered.length}
                </span>{" "}
                berita
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-gray-400 dark:text-white/30 uppercase tracking-[0.15em] font-bold">
                  Hal. {currentPage + 1} / {totalPages}
                </p>
              )}
            </div>

            {loadingNews ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden animate-pulse"
                  >
                    <div className="h-52 bg-white/5" />
                    <div className="p-6 space-y-3">
                      <div className="h-3 bg-white/10 rounded w-1/3" />
                      <div className="h-5 bg-white/10 rounded w-full" />
                      <div className="h-5 bg-white/10 rounded w-4/5" />
                      <div className="h-3 bg-white/5 rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {paginatedNews.length > 0 ? (
                    paginatedNews.map((item, i) => (
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
                      <p className="text-gray-300 dark:text-white/10 text-sm mt-2">
                        Pastikan Colab worker sudah berjalan dan data sudah masuk ke Supabase
                      </p>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-16">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-white/10 disabled:hover:text-gray-700 dark:disabled:hover:text-white/70 transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Sebelumnya
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i).map((pageIdx) => {
                        const isActive = pageIdx === currentPage;
                        const isNear =
                          pageIdx === 0 ||
                          pageIdx === totalPages - 1 ||
                          Math.abs(pageIdx - currentPage) <= 1;

                        if (!isNear) {
                          if (
                            pageIdx === 1 && currentPage > 2 ||
                            pageIdx === totalPages - 2 && currentPage < totalPages - 3
                          ) {
                            return (
                              <span key={pageIdx} className="text-gray-400 dark:text-white/20 font-black text-sm px-1">
                                …
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageIdx}
                            onClick={() => handlePageChange(pageIdx)}
                            className={`w-10 h-10 rounded-full text-[11px] font-black transition-all duration-300 ${
                              isActive
                                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg"
                                : "border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-white/50 hover:border-gray-400 dark:hover:border-white/30"
                            }`}
                          >
                            {pageIdx + 1}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className="flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-white/10 disabled:hover:text-gray-700 dark:disabled:hover:text-white/70 transition-all duration-300"
                    >
                      Selanjutnya
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
      </div>
    </main>
  );
}
