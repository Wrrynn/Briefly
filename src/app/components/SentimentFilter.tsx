"use client";

import React from "react";
import { motion } from "framer-motion";

interface SentimentFilterProps {
    selected: string;
    setSelected: (sentiment: string) => void;
}

// Opsi sentimen + warna aktif + warna titik (dot) masing-masing (selaras dgn badge di NewsCard).
const options: {
    label: string;
    activeBg: string;
    activeShadow: string;
    dot: string;
    inactiveText: string;
}[] = [
    {
        label: "Semua",
        activeBg: "bg-gray-900 dark:bg-white",
        activeShadow: "shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
        dot: "bg-gradient-to-br from-emerald-500 via-amber-400 to-rose-500",
        inactiveText: "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white",
    },
    {
        label: "Positif",
        activeBg: "bg-emerald-600",
        activeShadow: "shadow-lg shadow-emerald-500/40",
        dot: "bg-emerald-500",
        inactiveText: "text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300",
    },
    {
        label: "Negatif",
        activeBg: "bg-rose-600",
        activeShadow: "shadow-lg shadow-rose-500/40",
        dot: "bg-rose-500",
        inactiveText: "text-rose-700 dark:text-rose-400 group-hover:text-rose-800 dark:group-hover:text-rose-300",
    },
    {
        label: "Campuran",
        activeBg: "bg-amber-600",
        activeShadow: "shadow-lg shadow-amber-500/40",
        dot: "bg-amber-500",
        inactiveText: "text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300",
    },
];

export default function SentimentFilter({ selected, setSelected }: SentimentFilterProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
            {options.map((opt) => {
                const isActive = selected === opt.label;
                const isSemua = opt.label === "Semua";

                return (
                    <button
                        key={opt.label}
                        // "Semua" mengosongkan filter; klik opsi aktif lain juga reset ke "Semua".
                        onClick={() => setSelected(isSemua || isActive ? "Semua" : opt.label)}
                        className="relative px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 outline-none group"
                    >
                        {isActive ? (
                            <motion.div
                                layoutId="activeSentiment"
                                className={`absolute inset-0 rounded-full z-0 ${opt.activeBg} ${opt.activeShadow}`}
                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                            />
                        ) : (
                            <div className="absolute inset-0 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 z-0 transition-colors group-hover:border-gray-400 dark:group-hover:border-white/20" />
                        )}

                        <span className="relative z-10 flex items-center gap-2">
                            {/* Titik warna penanda sentimen (gaya chip search engine) */}
                            <span
                                className={`h-2 w-2 rounded-full ${opt.dot} transition-transform duration-300 ${
                                    isActive ? "ring-2 ring-white/70 scale-110" : "group-hover:scale-110"
                                }`}
                            />
                            <span
                                className={`transition-colors duration-300 ${
                                    isActive
                                        ? isSemua
                                            ? "text-white dark:text-gray-900"
                                            : "text-white"
                                        : opt.inactiveText
                                }`}
                            >
                                {opt.label}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
