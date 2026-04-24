"use client";

import React from "react";
import { motion } from "framer-motion";
import type { NewsItem } from "@/app/data/mockNews";

interface NewsContentProps {
  news: NewsItem;
}

export default function NewsContent({ news }: NewsContentProps) {
  const paragraphs = (news.fullContent ?? news.description)
    .split("\n\n")
    .filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
      className="max-w-[700px]"
    >
      {/* Hero image */}
      <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-10 border border-white/[0.08]">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05051a]/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="text-[10px] text-white/40 font-mono bg-black/40 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
            Foto: {news.source}
          </span>
        </div>
      </div>

      {/* Article body */}
      <div className="prose-custom space-y-6">
        {paragraphs.map((para, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.25 + i * 0.07,
              ease: [0.25, 1, 0.5, 1],
            }}
            className={`text-[15px] leading-[1.85] font-light tracking-[0.01em] ${
              i === 0
                ? "text-white/80 text-base leading-[1.9] font-normal"
                : "text-white/65"
            }`}
          >
            {para.trim()}
          </motion.p>
        ))}
      </div>

      {/* Bottom divider */}
      <div className="mt-12 pt-6 border-t border-white/[0.06]">
        <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium">
          Artikel ini dipublikasikan oleh {news.source} · {news.publishedAt ?? news.time}
        </p>
      </div>
    </motion.article>
  );
}
