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
import AIInsightPanel from "@/app/components/detail/AIInsightPanel";
import LoadingSkeleton, { SidebarSkeleton } from "@/app/components/detail/LoadingSkeleton";
import type { AIAnalysisResult } from "@/app/api/analyze-news/route";

// const ColorBends = dynamic(() => import("@/app/components/ColorBends"), { ssr: false });

type EnrichedNews = NewsItem & Partial<AIAnalysisResult> & { aiLoading?: boolean; aiError?: boolean };

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<EnrichedNews | null>(null);
  const [notFound, setNotFound] = useState(false);

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
          impact: analysis.impactAnalysis.length > 0 ? analysis.impactAnalysis : prev.impacts,
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

  if (!loading && notFound) {
    return (
      <main className="relative min-h-screen w-full bg-[#05051a] flex items-center justify-center">
        {/* <div className="fixed inset-0 z-0 pointer-events-none">
          <ColorBends colors={["#0010f5"]} speed={0.5} />
          <div className="absolute inset-0 bg-black/50" />
        </div> */}
        <div className="relative z-10 text-center px-4">
          <p className="text-[80px] font-black text-white/[0.04] leading-none mb-4 select-none">404</p>
          <h1 className="text-2xl font-bold text-white mb-3">Berita Tidak Ditemukan</h1>
          <p className="text-white/40 mb-8 font-light text-sm max-w-xs mx-auto">
            Berita yang kamu cari tidak ada atau telah dihapus dari sistem kami.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all duration-300">
            ← Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[#05051a] text-white">
      {/* <div className="fixed inset-0 z-0 pointer-events-none">
        <ColorBends colors={["#0010f5"]} speed={0.3} />
        <div className="absolute inset-0 bg-black/55" />
      </div> */}

      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05051a]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-[11px] font-light tracking-[0.4em] uppercase text-white/60 hover:text-white transition-colors duration-200">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </div>
            <span>Compro</span>
          </Link>

          <div className="flex items-center gap-4">
            {news && (
              <div className="hidden sm:flex items-center gap-2">
                {news.aiLoading ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                    </span>
                    <span className="text-[10px] text-amber-400/70 uppercase tracking-wider">AI menganalisis…</span>
                  </>
                ) : news.aiError ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/20" />
                    </span>
                    <span className="text-[10px] text-white/25 uppercase tracking-wider">Analisis mock</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] text-emerald-400/70 uppercase tracking-wider">Analisis AI selesai</span>
                  </>
                )}
              </div>
            )}
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white transition-colors duration-200 uppercase tracking-wider font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </div>
        </div>
      </nav>

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
                      {/* Memanggil Komponen Sidebar AI Insight yang didefinisikan di bawah */}
                      <AIInsightSidebar news={news} isLive={!news.aiError} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!loading && news && (
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="mt-20 pt-10 border-t border-white/[0.07]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white tracking-tight">Berita Lainnya</h2>
              <Link href="/" className="text-[11px] text-white/40 hover:text-white transition-colors uppercase tracking-widest font-medium">
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

function RelatedCard({ item, delay }: { item: NewsItem; delay: number }) {
  // ... (Sama seperti kode asli)
  const sentimentColor =
    item.sentiments?.[0]?.type === "Positif" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
    : item.sentiments?.[0]?.type === "Negatif" ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
    : "text-blue-400 bg-blue-500/10 border-blue-500/25";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.9 + delay, ease: [0.25, 1, 0.5, 1] }}>
      <Link href={`/news/${item.id}`}
        className="group block rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-300">
        <div className="relative h-36 overflow-hidden">
          <img src={item.image} alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05051a]/80 to-transparent" />
          <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border ${sentimentColor}`}>
            {item.sentiments?.[0]?.type || "Analisis"}
          </span>
        </div>
        <div className="p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1.5">{item.category}</p>
          <h3 className="text-[13px] font-semibold text-white/80 leading-snug group-hover:text-white transition-colors duration-200 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-[11px] text-white/30 mt-1.5 font-light">{item.time}</p>
        </div>
      </Link>
    </motion.div>
  );
}

// === KOMPONEN AI INSIGHT SIDEBAR ===
function AIInsightSidebar({ news, isLive }: { news: EnrichedNews; isLive: boolean }) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.06] bg-[#070716]/90 backdrop-blur-xl p-6 relative overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,16,245,0.05)]">
      {/* Background Glow Kiri Atas */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-600/20 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-[13px] font-black uppercase tracking-[0.2em] text-white/90">AI Insight</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
          <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
            {isLive ? "LIVE AI" : "MOCK"}
          </span>
        </div>
      </div>

      {/* Bagian Analisis Sentimen (Diperbarui menjadi baris ke bawah + deskripsi) */}
      <div className="mb-8 relative z-10">
        <h4 className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase mb-4">Analisis Sentimen</h4>
        
        {news.sentiments && news.sentiments.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Tiga Kotak Sentimen Berbaris ke Bawah */}
            <div className="flex flex-col gap-3">
              {news.sentiments.map((s, idx) => {
                const isPositif = s.type === "Positif";
                const isNegatif = s.type === "Negatif";
                
                // Menentukan warna border dan background
                const bgTheme = isPositif 
                  ? "border-emerald-500/20 bg-emerald-500/10" 
                  : isNegatif 
                  ? "border-rose-500/20 bg-rose-500/10"
                  : "border-blue-500/20 bg-blue-500/10";
                
                // Menentukan warna teks judul
                const textTheme = isPositif 
                  ? "text-emerald-400" 
                  : isNegatif 
                  ? "text-rose-400"
                  : "text-blue-400";

                return (
                  <div key={idx} className={`flex flex-col p-3.5 rounded-xl border ${bgTheme} transition-colors`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${textTheme}`}>
                        {s.type}
                      </span>
                      <span className={`text-[12px] font-black ${textTheme}`}>
                        {s.percentage}%
                      </span>
                    </div>
                    {/* Memanggil s.description dari mockNews.ts */}
                    <p className="text-[11px] text-white/70 leading-relaxed font-light">
                      {s.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Kotak Dampak / Impacts */}
            {news.impacts && news.impacts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-white/[0.05]">
                {news.impacts.map((imp, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111118] border border-white/[0.05]">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{imp.name}</span>
                    <span className="text-[10px] font-black text-white">{imp.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bagian Confidence Score */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between items-end mb-3">
          <h4 className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase">Confidence Score</h4>
          <span className="text-[13px] font-black text-blue-400">{news.confidenceScore || 0}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${news.confidenceScore || 0}%` }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="h-full bg-blue-500 rounded-full" 
          />
        </div>
        <p className="text-[10px] text-white/30 font-light">Tingkat keyakinan model AI terhadap analisis ini</p>
      </div>

      {/* Bagian Ringkasan AI */}
      <div className="mb-6 relative z-10">
        <h4 className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase mb-4">Ringkasan AI</h4>
        <div className="p-4 rounded-2xl border border-white/[0.05] bg-[#0a0a1a] relative">
          <p className="text-[13px] text-white/70 leading-relaxed font-light">
            {news.aiSummary || "Analisis AI sementara tidak tersedia. Silakan coba beberapa saat lagi."}
          </p>
          <span className="absolute top-4 right-4 text-2xl text-white/5 font-serif leading-none">"</span>
        </div>
      </div>

      {/* Tombol Baca Sumber Asli */}
      <a 
        href="#" 
        className="mt-auto relative z-10 w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl text-center hover:bg-gray-200 transition-colors flex justify-center items-center gap-2"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Baca Sumber Asli
      </a>
    </div>
  );
}