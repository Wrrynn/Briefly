"use client";

import { useState, useEffect } from "react";
import CategoryFilter from "./components/CategoryFilter";
import NewsCard from "./components/NewsCard";
import { newsData } from "./data/mockNews";
import HeroSection from "./components/HeroSection";

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [filtered, setFiltered] = useState(newsData);
  
  // State untuk tema
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Mencegah hydration mismatch & membaca localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    // Default dark mode jika belum ada settingan
    const isDark = savedTheme === "dark" || (!savedTheme && true); 
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Fungsi untuk handle klik ganti tema
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
    let result = [...newsData];
    if (category !== "Semua") {
      result = result.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [query, category]);

  // Hindari render sebelum tema terbaca
  if (!mounted) return null;

  return (
    <main className="min-h-screen transition-colors duration-500 bg-gray-50 dark:bg-[#05051a]">
      <div className="min-h-screen transition-colors duration-500">
        
        {/* HERO SECTION - Kirim fungsi handleToggleTheme */}
        <HeroSection 
          setQuery={setQuery} 
          setCategory={setCategory} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={handleToggleTheme} 
        />

        {/* AREA KONTEN UTAMA */}
        <div id="news-content" className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            
            <div className="mb-12">
               <CategoryFilter selected={category} setSelected={setCategory} />
            </div>

            <p className="text-sm text-gray-400 dark:text-white/50 mb-8 uppercase tracking-[0.2em] font-bold">
              Menampilkan <span className="text-blue-600 dark:text-white">{filtered.length}</span> berita
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.length > 0 ? (
                filtered.map((item, i) => (
                  <NewsCard key={item.id || i} data={item} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2.5rem]">
                  <p className="text-gray-400 dark:text-white/20 tracking-[0.2em] font-bold uppercase">Berita tidak ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}