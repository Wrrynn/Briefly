"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { NewsItem } from "@/app/data/mockNews";

interface NewsHeaderProps {
  news: NewsItem;
}

const categoryColors: Record<string, string> = {
  Politik: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  Ekonomi: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Teknologi: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  Bisnis: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  Kesehatan: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  Olahraga: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  Umum: "text-slate-400 border-slate-500/30 bg-slate-500/10",
};

export default function NewsHeader({ news }: NewsHeaderProps) {
  const catColor = categoryColors[news.category] ?? "text-blue-400 border-blue-500/30 bg-blue-500/10";

  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      className="mb-8"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/30 mb-8 font-medium">
        <Link
          href="/"
          className="hover:text-white/60 transition-colors duration-200"
        >
          Beranda
        </Link>
        <span className="text-white/15">›</span>
        <span className={`${catColor} px-2 py-0.5 rounded border text-[10px]`}>
          {news.category}
        </span>
      </nav>

      {/* Category + Read time */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-lg border ${catColor}`}
        >
          {news.category}
        </span>
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <span className="text-[11px] text-white/40 font-light tracking-wide">
          {news.readTime ?? 4} menit baca
        </span>
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <span className="text-[11px] text-white/40 font-light">{news.time}</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold text-white leading-[1.2] tracking-tight mb-6 max-w-[700px]">
        {news.title}
      </h1>

      {/* Description */}
      <p className="text-base text-white/60 leading-relaxed max-w-[620px] font-light">
        {news.description}
      </p>
    </motion.header>
  );
}
