"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import NewsCard from "./NewsCard";

interface HeroProps {
    setQuery: (val: string) => void;
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    trendingNews?: any[];
    loadingTrending?: boolean;
    searchActive?: boolean;
    sentimentFilter?: string;
    setSentimentFilter?: (val: string) => void;
}

export default function HeroSection({ setQuery, isDarkMode, setIsDarkMode, trendingNews, loadingTrending, searchActive, sentimentFilter, setSentimentFilter }: HeroProps) {
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
        if (setSentimentFilter) setSentimentFilter("Semua");
    };

    const handleSentimentClick = (sentiment: string) => {
        if (setSentimentFilter) {
            setSentimentFilter(sentimentFilter === sentiment ? "Semua" : sentiment);
        }
    };

    useEffect(() => setMounted(true), []);

    return (
        <div className="w-full">
            <div className="relative w-full bg-gray-50 dark:bg-[#05051a] text-gray-900 dark:text-white transition-colors duration-500 flex flex-col font-sans">

                {/* NAVBAR */}
                <nav className="relative z-50 w-full px-5 sm:px-8 py-6 sm:py-8 lg:px-16 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group outline-none">
                        <Image
                            src="/images/Briefly-logo.png"
                            alt="Logo Briefly"
                            width={36}
                            height={36}
                            priority
                            className="h-9 w-9 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-105"
                        />
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
                <div className="px-5 sm:px-8 w-full max-w-7xl mx-auto">
                    {/* Hero mengisi layar pertama; trending ada di bawah (perlu scroll) */}
                    <div className="min-h-[calc(100svh-96px)] flex flex-col justify-center items-center py-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full max-w-4xl">
                            <div className="mb-8">
                                <span className="inline-block py-2 px-5 rounded-full bg-blue-600/10 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase">
                                    AI Intelligence Platform
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-6xl md:text-6xl font-black leading-[1.05] tracking-tighter mb-8 sm:mb-12 text-gray-900 dark:text-white">
                                ANALISIS INDONESIA <br />
                                <span className="text-blue-600 dark:text-blue-500 italic">DALAM PERSPEKTIF AI</span>
                            </h1>

                            <div className="relative max-w-2xl mx-auto mb-16 sm:mb-20 w-full">
                                <div className="group flex items-center bg-white dark:bg-[#111111] border-2 border-gray-200 dark:border-white/5 rounded-[2.5rem] p-2 pl-6 sm:pl-10 shadow-xl shadow-gray-200/50 dark:shadow-none hover:border-blue-400 dark:hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-200/40 dark:hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] focus-within:border-blue-600 dark:focus-within:border-blue-500 -translate-y-0 hover:-translate-y-0.5 transition-all duration-300">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
                                        placeholder="Cari analisis berita"
                                        className="w-full bg-transparent border-none outline-none py-4 sm:py-5 text-gray-900 dark:text-white placeholder-gray-400 font-bold text-base sm:text-lg"
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
                                        className="bg-blue-600 text-white p-4 sm:p-5 rounded-full mr-1 transition-all duration-300 group-hover:bg-blue-700 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/40 active:scale-95"
                                    >
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Sentiment Filter Pills - muncul saat user mengetik */}
                                {input.trim() !== "" && setSentimentFilter && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        className="flex items-center justify-center gap-3 mt-4"
                                    >
                                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">
                                            Sentimen:
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSentimentClick("Positif")}
                                                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                                    sentimentFilter === "Positif"
                                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 scale-105"
                                                        : "bg-white dark:bg-white/5 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                                }`}
                                            >
                                                Positif
                                            </button>
                                            <button
                                                onClick={() => handleSentimentClick("Negatif")}
                                                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                                    sentimentFilter === "Negatif"
                                                        ? "bg-rose-600 text-white shadow-lg shadow-rose-500/40 scale-105"
                                                        : "bg-white dark:bg-white/5 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                }`}
                                            >
                                                Negatif
                                            </button>
                                            <button
                                                onClick={() => handleSentimentClick("Campuran")}
                                                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                                    sentimentFilter === "Campuran"
                                                        ? "bg-amber-600 text-white shadow-lg shadow-amber-500/40 scale-105"
                                                        : "bg-white dark:bg-white/5 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                                }`}
                                            >
                                                Campuran
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {!searchActive && (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full pb-8 lg:pb-10">
                            <div className="flex items-center gap-4 mb-10">
                                <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 tracking-[0.4em] uppercase">Trending Hari Ini</h3>
                                <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/5"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {loadingTrending ? (
                                    [1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden animate-pulse shadow-lg shadow-gray-100/60 dark:shadow-none">
                                            <div className="p-6 space-y-3">
                                                <div className="flex justify-between">
                                                    <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded-md" />
                                                    <div className="h-5 w-14 bg-gray-200 dark:bg-white/10 rounded-md" />
                                                </div>
                                                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/5" />
                                                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-full mt-3" />
                                                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-4/5" />
                                                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-full mt-3" />
                                                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-3/4" />
                                                <div className="h-11 bg-gray-200 dark:bg-white/10 rounded-xl w-full mt-5" />
                                            </div>
                                        </div>
                                    ))
                                ) : (trendingNews || []).length > 0 ? (
                                    (trendingNews || []).slice(0, 3).map((item, index) => (
                                        <NewsCard key={item.id || index} data={item} />
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
