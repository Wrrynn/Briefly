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

  // Reset halaman ke hal. 1 secara otomatis jika kata pencarian atau kategori berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [query, category]);

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
  }, [currentPage, category, query]);

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
        />

        <div id="news-content" className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-12">
              <CategoryFilter selected={category} setSelected={handleCategoryChange} />
            </div>

            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-gray-400 dark:text-white/50 uppercase tracking-[0.2em] font-bold">
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
              {totalNewsCount > 0 && totalPages > 1 && (
                <p className="text-sm text-gray-400 dark:text-white/30 uppercase tracking-[0.15em] font-bold">
                  Hal. {currentPage} / {totalPages}
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
                      <p className="text-gray-300 dark:text-white/10 text-sm mt-2">
                        Kata kunci "{query}" tidak ditemukan di database.
                      </p>
                    </div>
                  )}
                </div>

                {totalNewsCount > 0 && totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-16">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      Sebelumnya
                    </button>

                    <div className="flex items-center gap-2">
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
                            className={`w-10 h-10 rounded-full text-[11px] font-black transition-all duration-300 ${
                              isActive
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
                      className="flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
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