"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import CategoryFilter from "./components/CategoryFilter";
import NewsCard from "./components/NewsCard";
import { newsData } from "./data/mockNews";
import dynamic from "next/dynamic";
import HeroSection from "./components/HeroSection";

export default function Home() {
  const [data, setData] = useState(newsData);
  const [filtered, setFiltered] = useState(newsData);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  const ColorBends = dynamic(
  () => import("./components/ColorBends"),
  { ssr: false }
  );

  // 🔍 FILTER LOGIC
  useEffect(() => {
    let result = data;

    if (category !== "Semua") {
      result = result.filter(
        (item) =>
          item.category.toLowerCase() === category.toLowerCase()
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

  // 🔄 REFRESH (simulasi)
  const handleRefresh = () => {
    setData([...newsData]); // nanti bisa fetch API
  };

  return (
    <main className="bg-gray-50 min-h-screen ">
      <div className="w-full h-screen relative bg-black">
        <HeroSection />
      </div>

      <Navbar onRefresh={handleRefresh} p-4 />

      <div className="max-w-7xl mx-auto mt-4">
        <SearchBar query={query} setQuery={setQuery} />
        <CategoryFilter
          selected={category}
          setSelected={setCategory}
        />

        <p className="text-sm text-gray-500 mt-4 mb-4">
          Menampilkan {filtered.length} berita
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((item, i) => (
            <NewsCard key={i} data={item} />
          ))}
        </div>
        
      </div>
    </main>
  );
}