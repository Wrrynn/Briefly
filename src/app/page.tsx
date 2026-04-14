"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";
import CategoryFilter from "./components/CategoryFilter";
import NewsCard from "./components/NewsCard";
import { newsData } from "./data/mockNews";
import HeroSection from "./components/HeroSection";
import RecentNews from "./components/RecentNews";

export default function Home() {
  const [data, setData] = useState(newsData);
  const [filtered, setFiltered] = useState(newsData);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  useEffect(() => {
    let result = data;

    if (category !== "Semua") {
      result = result.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (query) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()),
      );
    }

    setFiltered(result);
  }, [query, category, data]);

  const handleRefresh = () => {
    setData([...newsData]);
  };

  return (
    <main className="bg-black text-white">
      {/* HERO */}
      <HeroSection />

      {/* NAVBAR + CONTENT */}
      <div className="bg-gray-50 text-black py-10">
        <Navbar onRefresh={handleRefresh} p-4 />

        <div className="max-w-7xl mx-auto mt-4 px-4">
          <SearchBar query={query} setQuery={setQuery} />
          <CategoryFilter selected={category} setSelected={setCategory} />

          <p className="text-sm text-gray-500 mt-4 mb-4">
            Menampilkan {filtered.length} berita
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <NewsCard key={i} data={item} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
