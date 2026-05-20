"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { newsData, type NewsItem } from "@/app/data/mockNews";
import NewsHeader from "@/app/components/detail/NewsHeader";
import NewsMeta from "@/app/components/detail/NewsMeta";
import NewsContent from "@/app/components/detail/NewsContent";
import LoadingSkeleton, { SidebarSkeleton } from "@/app/components/detail/LoadingSkeleton";
import type { AIAnalysisResult } from "@/app/api/analyze-news/route";

type EnrichedNews = NewsItem & Partial<AIAnalysisResult> & { aiLoading?: boolean; aiError?: boolean };

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<EnrichedNews | null>(null);
  const [notFound, setNotFound] = useState(false);

  // === SISTEM TEMA GLOBAL (DARK / LIGHT) ===
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Baca tema dari localStorage biar "nyambung" sama Home
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark" || (!savedTheme && document.documentElement.classList.contains("dark"));
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // === LOGIC FETCH BERITA ===
  useEffect(() => {
    const id = Number(params?.id);
    const timer = setTimeout(() => {
      const found = newsData.find((n) => n.id === id);
      if (found) {
        setNews({ ...found, aiLoading: true });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [params?.id]);

  const fetchAIAnalysis = useCallback(async (item: NewsItem) => {
    try {
      const res = await fetch("/api/analyze-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          fullContent: item.fullContent,
          category: item.category,
          source: item.source,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const analysis: AIAnalysisResult = await res.json();
      setNews((prev) =>
        prev ? {
          ...prev,
          ...analysis,
          sentiment: analysis.sentiment,
          confidenceScore: analysis.confidenceScore,
          aiSummary: analysis.aiSummary,
          keywords: analysis.keywords,
          // 2. FIX TYPO: Seharusnya 'impacts', bukan 'impact'
          impacts: analysis.impactAnalysis.length > 0 ? analysis.impactAnalysis : prev.impacts,
          aiLoading: false,
          aiError: false,
        } : prev
      );
    } catch {
      setNews((prev) => prev ? { ...prev, aiLoading: false, aiError: true } : prev);
    }
  }, []);

  useEffect(() => {
    if (news && news.aiLoading && !news.aiError) {
      fetchAIAnalysis(news);
    }
  }, [news?.aiLoading, fetchAIAnalysis]);

  // === RENDER ERROR 404 ===
  if (!loading && notFound) {
    return (
      // 3. FIX: Menambahkan `${isDarkMode ? "dark" : ""}` di tag main
      <main className={`${isDarkMode ? "dark" : ""} relative min-h-screen w-full bg-gray-50 dark:bg-[#05051a] flex items-center justify-center transition-colors duration-500`}>
        <div className="relative z-10 text-center px-4">
          <p className="text-[80px] font-black text-gray-200 dark:text-white/[0.04] leading-none mb-4 select-none">404</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Berita Tidak Ditemukan</h1>
          <p className="text-gray-500 dark:text-white/40 mb-8 font-medium text-sm max-w-xs mx-auto">
            Berita yang kamu cari tidak ada atau telah dihapus dari sistem kami.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all duration-300">
            ← Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  // === RENDER HALAMAN UTAMA ===
  return (
    // 4. FIX: Menambahkan `${isDarkMode ? "dark" : ""}` di tag main utama agar styling Dark Mode ke-trigger
    <main className={`${isDarkMode ? "dark" : ""} relative min-h-screen w-full bg-gray-50 dark:bg-[#05051a] text-gray-900 dark:text-white transition-colors duration-500`}>
      
      {/* NAVBAR DENGAN TOGGLE TEMA */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#05051a]/80 backdrop-blur-2xl transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-[11px] font-black tracking-[0.4em] uppercase text-gray-900 dark:text-white/80 hover:text-blue-600 dark:hover:text-white transition-colors duration-200">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </div>
            <span>Compro</span>
          </Link>

          <div className="flex items-center gap-5">
            {/* TOGGLE TEMA (Light/Dark) */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-90"
              >
                {isDarkMode ? (
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
              </button>
            )}

            {/* STATUS AI */}
            {news && (
              <div className="hidden sm:flex items-center gap-2">
                {news.aiLoading ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400/70 uppercase tracking-wider font-bold">AI menganalisis…</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400/70 uppercase tracking-wider font-bold">Analisis Selesai</span>
                  </>
                )}
              </div>
            )}
            
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 uppercase tracking-wider font-bold ml-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 xl:gap-20">
              <LoadingSkeleton />
              <SidebarSkeleton />
            </motion.div>
          ) : news ? (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 xl:gap-20">
              <div className="min-w-0">
                <NewsHeader news={news} />
                <NewsMeta news={news} />
                <NewsContent news={news} />
              </div>

              <div className="lg:sticky lg:top-24 lg:self-start h-fit">
                <AnimatePresence mode="wait">
                  {news.aiLoading ? (
                    <motion.div key="ai-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                      <SidebarSkeleton />
                    </motion.div>
                  ) : (
                    <motion.div key="ai-ready" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}>
                      <AIInsightSidebar news={news} isLive={!news.aiError} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* RELATED NEWS SECTION */}
        {!loading && news && (
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="mt-20 pt-10 border-t border-gray-200 dark:border-white/[0.07]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Berita Lainnya</h2>
              <Link href="/" className="text-[11px] text-gray-500 dark:text-white/40 hover:text-blue-600 dark:hover:text-white transition-colors uppercase tracking-widest font-bold">
                Lihat Semua →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {newsData.filter((n) => n.id !== news.id).slice(0, 3).map((item, i) => (
                <RelatedCard key={item.id} item={item} delay={i * 0.08} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}

// === KOMPONEN KARTU BERITA LAINNYA ===
function RelatedCard({ item, delay }: { item: NewsItem; delay: number }) {
  const isPositif = item.sentiments?.[0]?.type === "Positif";
  const isNegatif = item.sentiments?.[0]?.type === "Negatif";
  
  const sentimentColor = isPositif 
    ? "text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/25"
    : isNegatif 
    ? "text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/25"
    : "text-blue-700 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/25";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.9 + delay, ease: [0.25, 1, 0.5, 1] }}>
      <Link href={`/news/${item.id}`}
        className="group block rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] overflow-hidden hover:border-blue-500 dark:hover:border-blue-500/30 hover:shadow-xl dark:hover:shadow-none dark:hover:bg-white/[0.04] transition-all duration-300">
        <div className="relative h-40 overflow-hidden">
          <img src={item.image} alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border ${sentimentColor}`}>
            {item.sentiments?.[0]?.type || "Analisis"}
          </span>
        </div>
        <div className="p-5">
          <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-black mb-2">{item.category}</p>
          <h3 className="text-[14px] font-bold text-gray-900 dark:text-white/90 leading-snug group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-white/40 mt-3 font-semibold">{item.time}</p>
        </div>
      </Link>
    </motion.div>
  );
}

// === KOMPONEN AI INSIGHT SIDEBAR ===
function AIInsightSidebar({ news, isLive }: { news: EnrichedNews; isLive: boolean }) {
  return (
    <div className="rounded-[1.5rem] border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#070716]/90 backdrop-blur-xl p-6 md:p-8 relative overflow-hidden flex flex-col shadow-xl shadow-gray-200/50 dark:shadow-[0_0_40px_rgba(0,16,245,0.05)] transition-colors duration-500">
      
      {/* Background Glow */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white/90">AI Insight</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-300 dark:bg-white/20"}`} />
          <span className="text-[9px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.2em]">
            {isLive ? "LIVE AI" : "MOCK"}
          </span>
        </div>
      </div>

      {/* Analisis Sentimen */}
      <div className="mb-8 relative z-10">
        <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 tracking-[0.2em] uppercase mb-5">Analisis Sentimen</h4>
        
        {news.sentiments && news.sentiments.length > 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
              {news.sentiments.map((s, idx) => {
                const isPositif = s.type === "Positif";
                const isNegatif = s.type === "Negatif";
                
                const bgTheme = isPositif 
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10" 
                  : isNegatif 
                  ? "border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10"
                  : "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10";
                
                const textTheme = isPositif 
                  ? "text-emerald-700 dark:text-emerald-400" 
                  : isNegatif 
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-blue-700 dark:text-blue-400";

                return (
                  <div key={idx} className={`flex flex-col p-5 rounded-2xl border ${bgTheme} transition-colors`}>
                    <div className="flex items-center justify-between mb-3">
                      {/* Font size label diperbesar sedikit */}
                      <span className={`text-[13px] font-black uppercase tracking-[0.15em] ${textTheme}`}>
                        {s.type}
                      </span>
                      {/* Font size persentase diperbesar */}
                      <span className={`text-[13px] font-black ${textTheme}`}>
                        {s.percentage}%
                      </span>
                    </div>
                    {/* Font size deskripsi diubah ke 14px agar jauh lebih mudah dibaca */}
                    <p className="text-[16px] text-gray-700 dark:text-white/80 leading-relaxed font-medium">
                      {s.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Kotak Dampak (Impacts) */}
            {news.impacts && news.impacts.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3 pt-5 border-t border-gray-100 dark:border-white/[0.05]">
                {news.impacts.map((imp, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-gray-100 dark:bg-[#111118] border border-gray-200 dark:border-white/[0.05]">
                    <span className="text-[11px] font-bold text-gray-600 dark:text-white/70 uppercase tracking-widest">{imp.name}</span>
                    <span className="text-[11px] font-black text-gray-900 dark:text-white">{imp.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confidence Score */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-end mb-3">
          <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 tracking-[0.2em] uppercase">Confidence Score</h4>
          <span className="text-[15px] font-black text-blue-600 dark:text-blue-400">{news.confidenceScore || 0}%</span>
        </div>
        <div className="h-2.5 w-full bg-gray-200 dark:bg-white/[0.05] rounded-full overflow-hidden mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${news.confidenceScore || 0}%` }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full" 
          />
        </div>
        <p className="text-[11px] text-gray-500 dark:text-white/40 font-medium mt-2">Tingkat keyakinan model AI terhadap analisis ini</p>
      </div>

      {/* Tombol Baca Sumber Asli */}
      <a 
        href="#" 
        className="mt-auto relative z-10 w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black text-[12px] font-black uppercase tracking-[0.2em] rounded-xl text-center hover:bg-black dark:hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Baca Sumber Asli
      </a>
    </div>
  );
}