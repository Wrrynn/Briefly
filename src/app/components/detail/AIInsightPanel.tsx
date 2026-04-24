"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { NewsItem } from "@/app/data/mockNews";
import TagBadge from "./TagBadge";

interface AIInsightPanelProps {
  news: NewsItem & { aiSummary?: string; confidenceScore?: number; keywords?: string[] };
  isLive?: boolean;
}

const sentimentConfig = {
  Positif: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    barColor: "bg-gradient-to-r from-emerald-600 to-emerald-400",
    barGlow: "shadow-[0_0_12px_rgba(16,185,129,0.6)]",
    icon: "↑",
    label: "Sentimen Positif",
    description: "Berita ini mengandung informasi yang konstruktif dan berpotensi berdampak baik.",
  },
  Negatif: {
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    barColor: "bg-gradient-to-r from-rose-600 to-rose-400",
    barGlow: "shadow-[0_0_12px_rgba(244,63,94,0.6)]",
    icon: "↓",
    label: "Sentimen Negatif",
    description: "Berita ini mengindikasikan risiko atau dampak negatif yang perlu diwaspadai.",
  },
  Netral: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    barColor: "bg-gradient-to-r from-blue-600 to-blue-400",
    barGlow: "shadow-[0_0_12px_rgba(59,130,246,0.6)]",
    icon: "↔",
    label: "Sentimen Netral",
    description: "Berita ini bersifat informatif tanpa kecenderungan positif atau negatif yang kuat.",
  },
};

function AnimatedBar({
  value,
  colorClass,
  glowClass,
}: {
  value: number;
  colorClass: string;
  glowClass: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="relative h-2 w-full bg-white/[0.07] rounded-full overflow-hidden">
      <motion.div
        className={`absolute top-0 left-0 h-full rounded-full ${colorClass} ${glowClass}`}
        initial={{ width: 0 }}
        animate={{ width: inView ? `${value}%` : 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
      />
    </div>
  );
}

export default function AIInsightPanel({ news, isLive = false }: AIInsightPanelProps) {
  const config = sentimentConfig[news.sentiment] ?? sentimentConfig.Netral;
  const confidence = news.confidenceScore ?? 80;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className="w-full"
    >
      {/* AI Insight Main Card */}
      <div
        className={`relative rounded-2xl border ${config.border} bg-gradient-to-b from-white/[0.04] to-white/[0.02] backdrop-blur-sm overflow-hidden ${config.glow} mb-4`}
      >
        {/* Decorative top glow bar */}
        <div className={`absolute top-0 left-0 right-0 h-px ${config.barColor} opacity-60`} />

        {/* Subtle corner decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20">
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[50px] ${
              news.sentiment === "Positif"
                ? "bg-emerald-500"
                : news.sentiment === "Negatif"
                ? "bg-rose-500"
                : "bg-blue-500"
            }`}
          />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25">
              <svg
                className="w-3.5 h-3.5 text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/70">
                AI Insight
              </p>
            </div>
            <div className="live-badge ml-auto flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-emerald-400" : "bg-blue-400"}`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isLive ? "bg-emerald-500" : "bg-blue-500"}`} />
              </span>
              <span className="text-[9px] text-white/30 uppercase tracking-wider">
                {isLive ? "Live AI" : "Demo"}
              </span>
            </div>
          </div>

          {/* ── Sentiment Section ── */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-3">
              Analisis Sentimen
            </p>

            <div
              className={`flex items-center gap-3 p-4 rounded-xl ${config.bg} border ${config.border}`}
            >
              {/* Big sentiment icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${config.color} border ${config.border} flex-shrink-0`}
              >
                {config.icon}
              </div>
              <div>
                <p className={`text-sm font-bold ${config.color}`}>{config.label}</p>
                <p className="text-[11px] text-white/40 font-light leading-relaxed mt-0.5">
                  {config.description}
                </p>
              </div>
            </div>
          </div>

          {/* ── Confidence Score ── */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">
                Confidence Score
              </p>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className={`text-sm font-black ${config.color}`}
              >
                {confidence}%
              </motion.span>
            </div>
            <AnimatedBar
              value={confidence}
              colorClass={config.barColor}
              glowClass={config.barGlow}
            />
            <p className="text-[10px] text-white/25 mt-1.5 font-light">
              Tingkat keyakinan model AI terhadap analisis ini
            </p>
          </div>

          {/* ── AI Summary ── */}
          {news.aiSummary && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-3">
                Ringkasan AI
              </p>
              <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {/* Quotation mark decoration */}
                <div className="absolute top-3 right-3 text-2xl text-white/[0.06] font-serif leading-none select-none">
                  "
                </div>
                <p className="text-[12.5px] text-white/65 leading-relaxed font-light">
                  {news.aiSummary}
                </p>
              </div>
            </div>
          )}

          {/* ── Impact Tags ── */}
          {news.impact && news.impact.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-3">
                Prediksi Dampak
              </p>
              <div className="flex flex-wrap gap-2">
                {news.impact.map((imp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    <TagBadge text={imp} variant="impact" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keywords Card */}
      {news.keywords && news.keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 mb-4"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold mb-3">
            Kata Kunci
          </p>
          <div className="flex flex-wrap gap-2">
            {news.keywords.map((kw, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.06 }}
              >
                <TagBadge text={kw} variant="keyword" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Read original CTA */}
      <motion.a
        href="#"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-[0_8px_30px_rgba(255,255,255,0.08)]"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        Baca Sumber Asli
      </motion.a>
    </motion.aside>
  );
}
