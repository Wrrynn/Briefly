"use client";

import { useState, useEffect } from "react";
// Import dynamic tetap dipakai karena Three.js butuh akses ke objek 'window'
import dynamic from "next/dynamic";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import CategoryFilter from "./components/CategoryFilter";
import NewsCard from "./components/NewsCard";
import { newsData } from "./data/mockNews";
import HeroSection from "./components/HeroSection";

// Load ColorBends secara dinamis agar tidak error Hydration/SSR
const ColorBends = dynamic(
  () => import("./components/ColorBends"),
  { ssr: false }
);

export default function Home() {
  const [data, setData] = useState(newsData);
  const [filtered, setFiltered] = useState(newsData);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  // 🔍 FILTER LOGIC
  useEffect(() => {
    let result = data;
    if (category !== "Semua") {
      result = result.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (query) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    setFiltered(result);
  }, [query, category, data]);

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* ─── BACKGROUND LAYER ─── */}
      <div className="fixed inset-0 -z-10 h-full w-full">
        <ColorBends 
          colors={["#0010f5"]}
          rotation={-2}
          speed={1}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent={false}
          autoRotate={1}
        />
        {/* Overlay tipis agar konten lebih mudah dibaca */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* ─── CONTENT LAYER ─── */}
      <div className="relative z-10">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 mt-8 pb-20">
          <div>
            <CategoryFilter/>
          </div>

          <p className="text-sm text-gray-400 mt-6 mb-4">
            Menampilkan <span className="text-white font-bold">{filtered.length}</span> berita
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item, i) => (
              <NewsCard key={i} data={item} />
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              Berita tidak ditemukan...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}