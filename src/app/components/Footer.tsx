"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const team = [
    { role: "Project Manager", name: "I Made Dwi Wiryawan Raditya (Ditya)", email: "dityawryn.gm@gmail.com" },
    { role: "AI Engineer", name: "M. Reyenno Rakhazhillan S. (Reno)", email: "reynozhi@gmail.com" },
    { role: "AI Engineer", name: "Farhan Ahmad Naufal (Farhan)", email: "farhan310105@gmail.com" },
    { role: "AI Engineer", name: "Galuh Ambar Setiana (Galuh)", email: "galuhambar08@gmail.com" },
    { role: "Front-end Developer", name: "Fransiskus Harris Berliandu (Harris)", email: "berliandu@gmail.com" },
    { role: "Back-end Developer", name: "Timothy Hinsan Widjaja (Timothy)", email: "racataxs@gmail.com" },
    { role: "Quality Assurance Engineer", name: "Rizky Abadi (Rizky)", email: "rizkiabadii17@gmail.com" },
];

const navLinks = [
    { label: "Beranda", href: "/" },
    { label: "Jelajahi Berita", href: "/#news-content" },
    { label: "Trending Hari Ini", href: "/" },
];

const categories = [
    "Ekonomi & Bisnis",
    "Politik & Pemerintahan",
    "Hukum & Keamanan",
    "Teknologi",
];

const fitur = [
    "Ringkasan AI",
    "Analisis Sentimen",
    "Prediksi Dampak Sektoral",
];

export default function Footer() {
    const year = new Date().getFullYear();
    const [showAbout, setShowAbout] = useState(false);

    // Kunci scroll body saat modal terbuka + tutup dengan tombol Escape
    useEffect(() => {
        if (!showAbout) return;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowAbout(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [showAbout]);

    return (
        <footer className="relative border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#05051a] text-gray-900 dark:text-white transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 py-14 sm:py-16">
                <div className="grid grid-cols-2 md:grid-cols-12 gap-10">
                    {/* Brand + social */}
                    <div className="col-span-2 md:col-span-4">
                        <Link href="/" className="group inline-flex items-center gap-3 outline-none">
                            <Image
                                src="/images/Briefly-logo.png"
                                alt="Logo Briefly"
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-105"
                            />
                            <span className="text-base font-black tracking-[0.3em] uppercase text-gray-900 dark:text-white">
                                Briefly
                            </span>
                        </Link>
                        <p className="mt-5 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-white/50 font-medium">
                            Platform intelijen berita berbasis AI: ringkasan, analisis sentimen,
                            dan prediksi dampak sektoral dari berita Indonesia.
                        </p>
                        <button
                            onClick={() => setShowAbout(true)}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-300 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-2.5-1.34" />
                            </svg>
                            About Us
                        </button>
                    </div>

                    {/* Navigasi */}
                    <div className="md:col-span-3">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 tracking-[0.25em] uppercase mb-5">
                            Navigasi
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {navLinks.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm font-semibold text-gray-600 dark:text-white/60 hover:text-blue-600 dark:hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Fitur */}
                    <div className="md:col-span-2">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 tracking-[0.25em] uppercase mb-5">
                            Fitur
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {fitur.map((f) => (
                                <li key={f}>
                                    <span className="text-sm font-semibold text-gray-600 dark:text-white/60">
                                        {f}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Kategori */}
                    <div className="md:col-span-3">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-white/40 tracking-[0.25em] uppercase mb-5">
                            Kategori
                        </h4>
                        <ul className="flex flex-col gap-3">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        href="/#news-content"
                                        className="text-sm font-semibold text-gray-600 dark:text-white/60 hover:text-blue-600 dark:hover:text-white transition-colors"
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-6 border-t border-gray-100 dark:border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-gray-400 dark:text-white/40 font-bold uppercase tracking-[0.15em]">
                        © {year} Briefly. Seluruh hak cipta dilindungi.
                    </p>
                </div>
            </div>

            {/* Modal About Us */}
            {showAbout && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="about-title"
                >
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-gray-900/60 dark:bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowAbout(false)}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2rem] bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/10 shadow-2xl">
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-7 sm:px-8 py-6 bg-white/90 dark:bg-[#0c0c20]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/[0.06]">
                            <div>
                                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mb-1">
                                    Tim Briefly
                                </p>
                                <h3 id="about-title" className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                                    About Us
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowAbout(false)}
                                aria-label="Tutup"
                                className="p-2.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-90"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Daftar anggota */}
                        <ul className="divide-y divide-gray-100 dark:divide-white/[0.06] px-7 sm:px-8 py-2">
                            {team.map((m) => (
                                <li key={m.email} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-[0.2em] mb-0.5">
                                            {m.role}
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {m.name}
                                        </p>
                                    </div>
                                    <a
                                        href={`mailto:${m.email}`}
                                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                                    >
                                        {m.email}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </footer>
    );
}
