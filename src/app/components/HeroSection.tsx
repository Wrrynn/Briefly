"use client";

import { motion } from "framer-motion";
import NewsCard from "./NewsCard";
import KerangkaKartu from "./KerangkaKartu";

interface HeroProps {
    trendingNews?: any[];
    loadingTrending?: boolean;
    searchActive?: boolean;
    /** Tanggal (YYYY-MM-DD) data terbaru di database — dipakai untuk label trending. */
    tanggalData?: string | null;
}

// Blok pembuka halaman berita: judul + daftar trending. Navbar dan kotak
// pencarian tidak lagi di sini — keduanya kini ada di SiteHeader yang menempel
// di atas layar sepanjang halaman.
export default function HeroSection({ trendingNews, loadingTrending, searchActive, tanggalData }: HeroProps) {
    const daftarTrending = trendingNews || [];
    const sorotan = daftarTrending[0];
    const pendamping = daftarTrending.slice(1, 3);
    // Tanpa pendamping, grid dua kolom hanya menyisakan lubang di kanan.
    const kelasGrid = `grid gap-6${pendamping.length ? " lg:grid-cols-[1.6fr_1fr]" : ""}`;

    return (
        <div className="w-full">
            <div className="relative w-full bg-gray-50 dark:bg-[#05051a] text-gray-900 dark:text-white transition-colors duration-500 flex flex-col font-sans">

                {/* HERO CONTENT */}
                <div className="px-5 sm:px-8 w-full max-w-7xl mx-auto">
                    {/* Hero sengaja TIDAK setinggi layar. Sebelumnya memakai
                        min-h-[calc(100svh-96px)], sehingga layar pertama hanya berisi
                        judul + kotak cari dengan ratusan piksel kosong — tidak ada satu
                        pun berita yang terlihat sebelum pengguna menggulir. */}
                    <div className="flex flex-col items-center pt-10 pb-12 sm:pt-14 sm:pb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full max-w-4xl">
                            <div className="mb-6">
                                <span className="inline-block py-2 px-5 rounded-full bg-blue-600/10 dark:bg-blue-500/15 ring-1 ring-blue-600/15 dark:ring-blue-400/25 text-blue-700 dark:text-blue-300 text-[10px] font-black tracking-[0.3em] uppercase">
                                    AI Intelligence Platform
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight text-gray-900 dark:text-white">
                                ANALISIS INDONESIA <br />
                                <span className="text-blue-600 dark:text-blue-400 italic">DALAM PERSPEKTIF AI</span>
                            </h1>
                        </motion.div>
                    </div>

                    {!searchActive && (
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full pb-8 lg:pb-10">
                            <div className="flex items-center gap-4 mb-6">
                                {/* Label mengikuti data sebenarnya. Menulis "Hari Ini"
                                    di atas berita sebulan lalu merusak kepercayaan pembaca. */}
                                <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 tracking-[0.4em] uppercase">
                                    Paling Ramai — 7 Hari Terakhir
                                </h3>
                                {tanggalData && (
                                    <span className="hidden sm:inline text-[11px] text-gray-400 dark:text-white/30">
                                        s/d {new Date(`${tanggalData}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                    </span>
                                )}
                                <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/5"></div>
                            </div>

                            {/* Peringkat 1 disorot besar, sisanya kecil di sampingnya.
                                Sebelumnya ketiganya berukuran sama, sehingga urutan
                                "paling ramai" tidak terbaca sama sekali — pembaca
                                harus menebak mana yang teratas.

                                Di ponsel semuanya menumpuk satu kolom; di tablet dua
                                kartu kecil berdampingan; baru di layar lebar sorotan
                                pindah ke kiri dengan dua kartu kecil menumpuk di kanan. */}
                            {loadingTrending ? (
                                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                                    <KerangkaKartu besar />
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                                        <KerangkaKartu />
                                        <KerangkaKartu />
                                    </div>
                                </div>
                            ) : sorotan ? (
                                <div className={kelasGrid}>
                                    <NewsCard data={sorotan} besar />
                                    {pendamping.length > 0 && (
                                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                                            {pendamping.map((item, index) => (
                                                <NewsCard key={item.id || index} data={item} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 dark:text-white/30 text-sm tracking-widest uppercase font-bold">
                                    Belum ada data trending
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
