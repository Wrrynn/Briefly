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

const ColorBends = dynamic(() => import("@/app/components/ColorBends"), { ssr: false });

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
          impact: analysis.impactAnalysis.length > 0 ? analysis.impactAnalysis : prev.impact,
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
        <div className="fixed inset-0 z-0 pointer-events-none">
          <ColorBends colors={["#0010f5"]} speed={0.5} />
          <div className="absolute inset-0 bg-black/50" />
        </div>
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ColorBends colors={["#0010f5"]} speed={0.3} />
        <div className="absolute inset-0 bg-black/55" />
      </div>

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
                      <AIInsightPanel news={news} isLive={!news.aiError} />
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
  const sentimentColor =
    item.sentiment === "Positif" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
    : item.sentiment === "Negatif" ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
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
            {item.sentiment}
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
