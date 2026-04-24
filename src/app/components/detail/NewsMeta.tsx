"use client";

import React from "react";
import { motion } from "framer-motion";
import type { NewsItem } from "@/app/data/mockNews";

interface NewsMetaProps {
  news: NewsItem;
}

export default function NewsMeta({ news }: NewsMetaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5 border-t border-b border-white/[0.07] mb-8"
    >
      {/* Author */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-600/40 border border-blue-500/30 flex items-center justify-center">
          <span className="text-[10px] font-bold text-blue-300">
            {(news.author ?? "A").charAt(0)}
          </span>
        </div>
        <span className="text-[12px] text-white/60 font-medium">
          {news.author ?? "Redaksi"}
        </span>
      </div>

      <span className="h-4 w-px bg-white/10 hidden sm:block" />

      {/* Source */}
      <div className="flex items-center gap-2">
        <svg
          className="w-3 h-3 text-white/30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.828 14.828a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.102 1.101"
          />
        </svg>
        <span className="text-[12px] text-white/50 font-medium uppercase tracking-wider">
          {news.source}
        </span>
      </div>

      <span className="h-4 w-px bg-white/10 hidden sm:block" />

      {/* Date */}
      <div className="flex items-center gap-2">
        <svg
          className="w-3 h-3 text-white/30"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-[12px] text-white/40 font-light">
          {news.publishedAt ?? news.time}
        </span>
      </div>
    </motion.div>
  );
}
