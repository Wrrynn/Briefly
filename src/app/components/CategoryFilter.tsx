"use client";

import React from "react";
import { motion } from "framer-motion";

interface CategoryFilterProps {
  selected: string;
  setSelected: (category: string) => void;
}

const categories = [
  "Semua",
  "Ekonomi & Bisnis",
  "Politik & Pemerintahan",
  "Hukum & Keamanan",
  "Sosial & Masyarakat",
  "Kesehatan",
  "Pendidikan",
  "Energi & Lingkungan",
  "Teknologi",
  "Olahraga & Hiburan",
  "Hubungan Internasional"
];

export default function CategoryFilter({ selected, setSelected }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
      {categories.map((cat) => {
        const isActive = selected === cat;

        return (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            className="relative px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 outline-none group"
          >
            {/* Background Logic */}
            {isActive ? (
              <motion.div
                layoutId="activeCategory"
                className={`absolute inset-0 rounded-full z-0 
                  ${/* Mode Terang: Hitam Pekat | Mode Gelap: Putih Bersinar */ ""}
                  bg-gray-900 dark:bg-white 
                  shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            ) : (
              <div className="absolute inset-0 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 z-0 transition-colors group-hover:border-gray-400 dark:group-hover:border-white/20" />
            )}

            {/* Label Text - Diperbaiki Keterbacaannya */}
            <span
              className={`relative z-10 transition-colors duration-300 
                ${isActive 
                  ? "text-white dark:text-gray-900" // Kontras tinggi saat aktif
                  : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" // Teks lebih pekat di mode terang
                }`}
            >
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}