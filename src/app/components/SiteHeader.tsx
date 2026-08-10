"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/app/components/UserMenu";

interface SiteHeaderProps {
    setQuery: (val: string) => void;
    isDarkMode: boolean;
    setIsDarkMode: (val: boolean) => void;
    searchActive?: boolean;
    sentimentFilter?: string;
    setSentimentFilter?: (val: string) => void;
}

// Pil sentimen cepat — muncul di bawah kotak cari saat pengguna mengetik.
const PIL_SENTIMEN: { label: string; aktif: string; pasif: string }[] = [
    {
        label: "Positif",
        aktif: "bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 scale-105",
        pasif: "bg-white dark:bg-white/5 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
    },
    {
        label: "Negatif",
        aktif: "bg-rose-600 text-white shadow-lg shadow-rose-500/40 scale-105",
        pasif: "bg-white dark:bg-white/5 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10",
    },
    {
        label: "Campuran",
        aktif: "bg-amber-600 text-white shadow-lg shadow-amber-500/40 scale-105",
        pasif: "bg-white dark:bg-white/5 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-50 dark:hover:bg-amber-500/10",
    },
];

/**
 * Header tetap (sticky) halaman berita: logo, pencarian, tombol tema, dan menu
 * pengguna. Sengaja BUKAN bagian dari HeroSection — elemen sticky hanya menempel
 * selama induknya masih terlihat, jadi kalau navbar tetap di dalam hero ia akan
 * ikut hilang begitu hero tergulir habis.
 */
export default function SiteHeader({
    setQuery,
    isDarkMode,
    setIsDarkMode,
    searchActive,
    sentimentFilter,
    setSentimentFilter,
}: SiteHeaderProps) {
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

    // Kotak cari dirender dua kali: menyatu di baris logo pada layar lebar, dan
    // sebagai baris tersendiri di layar sempit. Keduanya dikendalikan satu state
    // yang sama, jadi isinya selalu sinkron.
    const kotakCari = (
        <div className="group flex items-center rounded-full border border-gray-200 bg-white py-1 pl-4 pr-1 shadow-sm transition-all duration-300 hover:border-blue-400 focus-within:border-blue-600 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:border-blue-500/50 dark:focus-within:border-blue-500">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                }}
                placeholder="Cari analisis berita"
                aria-label="Cari analisis berita"
                className="w-full min-w-0 border-none bg-transparent py-2 text-sm font-semibold text-gray-900 outline-none placeholder-gray-400 dark:text-white dark:placeholder-white/40"
            />
            {searchActive && (
                <button
                    onClick={clearSearch}
                    aria-label="Bersihkan pencarian"
                    className="mr-1 shrink-0 rounded-full p-1.5 text-gray-400 transition-all active:scale-90 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
            <button
                onClick={submitSearch}
                aria-label="Cari"
                className="shrink-0 rounded-full bg-blue-600 p-2.5 text-white transition-all duration-300 active:scale-95 group-hover:bg-blue-700 group-hover:shadow-lg group-hover:shadow-blue-500/40"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                </svg>
            </button>
        </div>
    );

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-gray-50/85 backdrop-blur-2xl transition-colors duration-500 dark:border-white/[0.06] dark:bg-[#05051a]/85">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-5 sm:px-8">
                <Link href="/" className="group flex shrink-0 items-center gap-3 outline-none">
                    <Image
                        src="/images/Briefly-logo.png"
                        alt="Logo Briefly"
                        width={32}
                        height={32}
                        priority
                        className="h-8 w-8 rounded-lg shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 dark:ring-white/10"
                    />
                    <span className="hidden text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:inline">
                        Briefly
                    </span>
                </Link>

                {/* Pencarian versi layar lebar */}
                <div className="mx-auto hidden w-full max-w-md flex-1 md:block">{kotakCari}</div>

                <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        aria-label={isDarkMode ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
                        className="rounded-xl bg-gray-100 p-2.5 transition-all active:scale-90 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                        {isDarkMode ? (
                            <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>
                    <UserMenu />
                </div>
            </div>

            {/* Pencarian versi layar sempit — satu baris penuh di bawah logo */}
            <div className="px-5 pb-3 md:hidden">{kotakCari}</div>

            {/* Pil sentimen cepat, muncul saat mengetik */}
            <AnimatePresence initial={false}>
                {input.trim() !== "" && setSentimentFilter && (
                    <motion.div
                        key="pil-sentimen"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-2 px-5 pb-3 sm:px-8">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/40">
                                Sentimen:
                            </span>
                            {PIL_SENTIMEN.map((p) => (
                                <button
                                    key={p.label}
                                    onClick={() => handleSentimentClick(p.label)}
                                    aria-pressed={sentimentFilter === p.label}
                                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                                        sentimentFilter === p.label ? p.aktif : p.pasif
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
