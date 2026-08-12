"use client";

import { motion } from "framer-motion";
import DaftarTrending from "./DaftarTrending";

interface HeroProps {
    trendingNews?: any[];
    loadingTrending?: boolean;
    searchActive?: boolean;
    /** Tanggal (YYYY-MM-DD) data terbaru di database — dipakai untuk label trending. */
    tanggalData?: string | null;
}

// Jendela trending di /api/trending (JENDELA_HARI). Dihitung mundur dari
// tanggal TERBARU DI DATABASE, bukan dari hari ini — pipeline bisa tertinggal
// berhari-hari, dan itulah yang membuat label statis jadi keliru.
const JENDELA_TRENDING_HARI = 7;

/** "26 Jun – 2 Jul 2026" dari tanggal terbaru di database. */
function labelRentangTrending(iso?: string | null): string | null {
    if (!iso) return null;
    const akhir = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(akhir.getTime())) return null;
    const awal = new Date(akhir.getTime() - JENDELA_TRENDING_HARI * 86_400_000);

    const seTahun = awal.getFullYear() === akhir.getFullYear();
    const fmt = (d: Date, denganTahun: boolean) =>
        d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            ...(denganTahun ? { year: "numeric" } : {}),
        });

    return `${fmt(awal, !seTahun)} – ${fmt(akhir, true)}`;
}

// Blok pembuka halaman berita: judul + daftar trending. Navbar dan kotak
// pencarian tidak lagi di sini — keduanya kini ada di SiteHeader yang menempel
// di atas layar sepanjang halaman.
export default function HeroSection({ trendingNews, loadingTrending, searchActive, tanggalData }: HeroProps) {
    const rentangTrending = labelRentangTrending(tanggalData);

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
                            <div className="flex items-center gap-3 mb-6 sm:gap-4">
                                <h3 className="shrink-0 text-[11px] font-black text-gray-400 dark:text-gray-500 tracking-[0.4em] uppercase">
                                    Paling Ramai
                                </h3>
                                {/* Rentang tanggal yang SEBENARNYA, bukan "7 Hari
                                    Terakhir" yang ditulis mati seperti sebelumnya.
                                    Arsip bisa tertinggal berminggu-minggu dari hari
                                    ini, sehingga tulisan itu keliru — dan untuk produk
                                    yang menjual ketepatan analisis, judul yang salah
                                    soal tanggal merugikan kepercayaan lebih besar
                                    daripada nilainya. Keterangan kecil "s/d …" di
                                    sampingnya tidak menolong: orang membaca judul. */}
                                {rentangTrending && (
                                    <span className="shrink-0 text-[11px] font-semibold text-gray-400 dark:text-white/30">
                                        {rentangTrending}
                                    </span>
                                )}
                                <div className="h-[1px] min-w-0 flex-1 bg-gray-200 dark:bg-white/5"></div>
                            </div>

                            <DaftarTrending data={trendingNews} memuat={loadingTrending} />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
