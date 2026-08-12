"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/app/components/UserMenu";
import TombolTema from "@/app/components/TombolTema";

interface SiteHeaderProps {
    setQuery: (val: string) => void;
    /** Kata kunci awal dari alamat, supaya kotak cari tidak tampil kosong
     *  padahal daftarnya sedang tersaring. */
    queryAwal?: string;
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
    queryAwal = "",
    searchActive,
    sentimentFilter,
    setSentimentFilter,
}: SiteHeaderProps) {
    const [input, setInput] = useState(queryAwal);
    // Popup bisa ditutup dengan Esc tanpa menghapus kata kuncinya. Dibuka lagi
    // begitu pengguna mengetik — mengetik ulang berarti ia sedang menyaring lagi.
    const [popupDitutup, setPopupDitutup] = useState(false);
    const [sembunyikanBarisCari, setSembunyikanBarisCari] = useState(false);

    const popupTerbuka = input.trim() !== "" && !popupDitutup && Boolean(setSentimentFilter);

    // Di ponsel header memakan dua baris: logo (64px) + kotak cari (~46px) —
    // sekitar 17% layar, tertahan permanen bahkan saat membaca artikel panjang
    // ketika kotak cari sama sekali tidak dibutuhkan. Baris cari kini menghilang
    // saat menggulir turun dan kembali saat menggulir naik, jadi ia tetap
    // sedekat satu gerakan tanpa terus memakan ruang.
    useEffect(() => {
        let terakhir = window.scrollY;

        const saatGulir = () => {
            const y = window.scrollY;
            // Ambang 8px meredam getaran kecil yang membuat baris berkedip.
            if (Math.abs(y - terakhir) < 8) return;
            // Di dekat puncak halaman kotak cari selalu ditampilkan.
            setSembunyikanBarisCari(y > terakhir && y > 120);
            terakhir = y;
        };

        window.addEventListener("scroll", saatGulir, { passive: true });
        return () => window.removeEventListener("scroll", saatGulir);
    }, []);

    // Menyembunyikan baris cari saat popup sentimennya terbuka akan menyeret
    // popup itu ikut hilang di tengah interaksi.
    const barisCariTersembunyi = sembunyikanBarisCari && !popupTerbuka;

    const submitSearch = () => {
        setQuery(input.trim());
        setTimeout(() => {
            document.getElementById("news-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const clearSearch = () => {
        setInput("");
        setQuery("");
        setPopupDitutup(false);
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
        // `relative` menjadikan kotak cari jangkar bagi popup sentimen di
        // bawahnya. Karena popup ikut di dalam blok ini, ia otomatis menempel
        // pada kotak cari yang sedang tampil — versi lebar maupun sempit.
        <div className="relative">
            <div className="group flex items-center rounded-full border border-gray-200 bg-white py-1 pl-4 pr-1 shadow-sm transition-all duration-300 hover:border-blue-400 focus-within:border-blue-600 dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:border-blue-500/50 dark:focus-within:border-blue-500">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setPopupDitutup(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") submitSearch();
                        // Esc menutup popup lebih dulu; kata kunci dibiarkan utuh
                        // supaya pengguna tidak kehilangan ketikannya.
                        if (e.key === "Escape" && popupTerbuka) {
                            e.preventDefault();
                            setPopupDitutup(true);
                        }
                    }}
                    placeholder="Cari analisis berita"
                    aria-label="Cari analisis berita"
                    // outline-none di sini disengaja dan sudah ada penggantinya:
                    // wadahnya memakai focus-within:border-blue-600, jadi fokus
                    // tetap terlihat sebagai bingkai di seluruh kotak cari.
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

            {/* Popup saringan sentimen — mengambang di atas isi halaman, bukan
                mendorongnya turun. Versi lama menyisipkan pil ini sebagai baris
                tambahan di dalam header, sehingga tinggi header berubah setiap
                kali pengguna mulai mengetik dan seluruh halaman ikut bergeser. */}
            <AnimatePresence initial={false}>
                {popupTerbuka && (
                    <motion.div
                        key="popup-sentimen"
                        initial={{ opacity: 0, y: -6, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.985 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        role="group"
                        aria-label="Saring hasil pencarian menurut sentimen"
                        className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xl shadow-gray-300/40 dark:border-white/10 dark:bg-[#0c0c20] dark:shadow-black/50"
                    >
                        <p className="mb-2.5 px-1 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/40">
                            Sentimen
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {PIL_SENTIMEN.map((p) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => handleSentimentClick(p.label)}
                                    aria-pressed={sentimentFilter === p.label}
                                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0c0c20] ${
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
        </div>
    );

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-gray-50/85 backdrop-blur-2xl transition-colors duration-500 dark:border-white/[0.06] dark:bg-[#05051a]/85">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-5 sm:px-8">
                <Link
                    href="/"
                    className="group flex shrink-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-[#05051a]"
                >
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
                    <TombolTema />
                    <UserMenu />
                </div>
            </div>

            {/* Pencarian versi layar sempit — satu baris penuh di bawah logo.
                `invisible` saat tersembunyi, bukan sekadar tinggi nol: elemen
                setinggi nol masih bisa difokus keyboard, dan fokus yang melompat
                ke kotak tak terlihat membingungkan. */}
            <div
                className={`overflow-hidden px-5 transition-all duration-300 md:hidden ${
                    barisCariTersembunyi ? "invisible max-h-0 pb-0 opacity-0" : "max-h-24 pb-3 opacity-100"
                }`}
            >
                {kotakCari}
            </div>

        </header>
    );
}
