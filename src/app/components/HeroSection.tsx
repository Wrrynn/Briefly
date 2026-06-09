"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface HeroProps {
  setQuery: (val: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  trendingNews?: any[];
  loadingTrending?: boolean;
  searchActive?: boolean;
}

function getDominantSentiment(sentiments: any[]) {
  if (!sentiments?.length) return { type: "Netral" as const, percentage: 50 };
  return sentiments.reduce((prev, curr) =>
    curr.percentage > prev.percentage ? curr : prev
  );
}

export default function HeroSection({ setQuery, isDarkMode, setIsDarkMode, trendingNews, loadingTrending, searchActive }: HeroProps) {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");

  const submitSearch = () => {
    setQuery(input.trim());
    setTimeout(() => {
      document.getElementById("news-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const clearSearch = () => {
    setInput("");
    setQuery("");
  };

  const topTopics = (trendingNews || []).slice(0, 3).map((item, index) => {
    const dominant = getDominantSentiment(item.sentiments || []);
    return {
      rank: index + 1,
      id: item.id,
      title: item.title,
      sentiment: dominant.type as "Positif" | "Negatif" | "Netral",
      score: dominant.percentage,
      category: item.category,
    };
  });

  useEffect(() => setMounted(true), []);

  return (
    <div className="w-full">
      <div className="relative w-full bg-gray-50 dark:bg-[#05051a] text-gray-900 dark:text-white transition-colors duration-500 flex flex-col font-sans">

        {/* NAVBAR */}
        <nav className="relative z-50 w-full px-8 py-8 lg:px-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group outline-none">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </div>
            <span className="text-sm font-black tracking-[0.3em] uppercase text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Briefly
            </span>
          </Link>

          {mounted && (
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-2xl bg-gray-200/50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-90"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          )}
        </nav>

        {/* HERO CONTENT */}
        <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 lg:py-20 w-full max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full max-w-4xl">
            <div className="mb-8">
              <span className="inline-block py-2 px-5 rounded-full bg-blue-600/10 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase">
                AI Intelligence Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black leading-[1.05] tracking-tighter mb-12 text-gray-900 dark:text-white">
              ANALISIS INDONESIA <br/>
              <span className="text-blue-600 dark:text-blue-500 italic">DALAM PERSPEKTIF AI.</span>
            </h1>

            <div className="relative max-w-2xl mx-auto mb-24 w-full">
              <div className="group flex items-center bg-white dark:bg-[#111111] border-2 border-gray-200 dark:border-white/5 rounded-[2.5rem] p-2 pl-10 shadow-xl shadow-gray-200/50 dark:shadow-none hover:border-blue-400 dark:hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] focus-within:border-blue-600 dark:focus-within:border-blue-500 -translate-y-0 hover:-translate-y-0.5 transition-all duration-300">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
                  placeholder="Cari analisis sentimen..."
                  className="w-full bg-transparent border-none outline-none py-5 text-gray-900 dark:text-white placeholder-gray-400 font-bold text-lg"
                />
                {searchActive && (
                  <button
                    onClick={clearSearch}
                    aria-label="Bersihkan pencarian"
                    className="mr-2 p-2.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-90"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={submitSearch}
                  aria-label="Cari"
                  className="bg-blue-600 text-white p-5 rounded-full mr-1 transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/40 active:scale-95"
                >
                  <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {!searchActive && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full">
            <div className="flex items-center gap-4 mb-10">
              <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 tracking-[0.4em] uppercase">Trending Hari Ini</h3>
              <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/5"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loadingTrending ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="p-8 bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/5 rounded-[2rem] animate-pulse flex flex-col h-full min-h-[180px]">
                    <div className="flex justify-between items-start mb-8">
                      <div className="h-6 w-10 bg-gray-200 dark:bg-white/10 rounded-lg" />
                      <div className="text-right space-y-1">
                        <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded ml-auto" />
                        <div className="h-7 w-12 bg-gray-200 dark:bg-white/10 rounded ml-auto" />
                      </div>
                    </div>
                    <div className="mt-auto space-y-2">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
                      <div className="h-5 w-full bg-gray-200 dark:bg-white/10 rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                    </div>
                  </div>
                ))
              ) : topTopics.length > 0 ? (
                topTopics.map((topic, index) => (
                  <Link
                    key={index}
                    href={topic.id ? `/news/${topic.id}` : "#"}
                    className="group relative p-8 bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/5 rounded-[2rem] text-left hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-500 hover:shadow-2xl shadow-gray-100 dark:shadow-none hover:-translate-y-2 flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-[10px] font-black px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg uppercase">#{topic.rank}</span>
                      <div className="text-right">
                        <p className={`text-[11px] font-black uppercase tracking-widest ${topic.sentiment === 'Positif' ? 'text-emerald-600' : topic.sentiment === 'Negatif' ? 'text-rose-600' : 'text-blue-600'}`}>
                          {topic.sentiment}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3">{topic.category}</p>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-[1.3] group-hover:text-blue-600 transition-colors">{topic.title}</h4>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-400 dark:text-white/30 text-sm tracking-widest uppercase font-bold">
                  Belum ada data trending
                </div>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
