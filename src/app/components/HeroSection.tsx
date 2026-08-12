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

                {/* JUDUL HALAMAN
                    Dulu di sini berdiri billboard promosi: lencana "AI Intelligence
                    Platform" dan judul 60px "ANALISIS INDONESIA DALAM PERSPEKTIF AI",
                    rata tengah, dengan padding tebal — sekitar 340px di desktop dan
                    240px di ponsel sebelum satu berita pun terlihat.

                    Materi itu memang berguna, tapi untuk MEYAKINKAN ORANG MENDAFTAR,
                    dan Landing.tsx sudah menanganinya untuk pengunjung yang belum
                    punya akun. Halaman ini hanya dilihat pengguna yang sudah login —
                    mereka membayar satu gulir penuh untuk membaca slogan yang sama
                    setiap hari.

                    Sekarang: judul halaman ringkas dan rata kiri, sejajar dengan
                    filter dan daftar berita di bawahnya. */}
                <div className="px-5 sm:px-8 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-8 pb-8 sm:pt-10 sm:pb-10"
                    >
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            Analisis Berita
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-sm text-gray-500 dark:text-white/45">
                            Ringkasan, sentimen aktor, dan prediksi dampak sektoral
                            disusun dari banyak portal untuk satu peristiwa yang sama.
                        </p>
                    </motion.div>

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
