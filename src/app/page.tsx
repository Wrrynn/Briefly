"use client";

import { useState, useEffect } from "react";
import CategoryFilter from "./components/CategoryFilter";
import NewsCard from "./components/NewsCard";
import { newsData } from "./data/mockNews";
import HeroSection from "./components/HeroSection";
import dynamic from "next/dynamic";

//const ColorBends = dynamic(() => import("./components/ColorBends"), { ssr: false });

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [filtered, setFiltered] = useState(newsData);

  useEffect(() => {
    let result = [...newsData];

    if (category !== "Semua") {
      result = result.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (query.trim() !== "") {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [query, category]);

  return (
    <main className="relative min-h-screen w-full bg-[#05051a]">
      {/* Background Section
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ColorBends colors={["#0010f5"]} speed={0.5} />
        <div className="absolute inset-0 bg-black/40" />
      </div> */}

      <div className="relative z-10 w-full">
        {/* Header/Hero Section */}
        <HeroSection />

        {/* Content Section */}
        <div className="py-20 text-white">
          <div className="max-w-7xl mx-auto px-4">
            {/* Filter Section */}
            <CategoryFilter selected={category} setSelected={setCategory} />

            {/* Info Section */}
            <p className="text-sm text-white/50 mt-8 mb-6 uppercase tracking-widest">
              Menampilkan <span className="text-white font-bold">{filtered.length}</span> berita
            </p>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.length > 0 ? (
                filtered.map((item, i) => (
                  <NewsCard key={item.id || i} data={item} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-white/20 tracking-[0.2em]">Berita tidak ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}