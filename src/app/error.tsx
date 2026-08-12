"use client";

import { useEffect } from "react";
import Link from "next/link";

// Batas galat untuk seluruh aplikasi. Tanpa berkas ini, galat tak tertangani
// menampilkan layar bawaan Next yang tidak menyerupai Briefly sama sekali.
//
// `reset` menjalankan ulang segmen yang gagal tanpa memuat ulang halaman —
// jadi galat sesaat (jaringan putus, server sibuk) bisa dipulihkan di tempat.
export default function Galat({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Pesan aslinya tidak ditampilkan ke pengguna, tapi harus tetap bisa
        // dilacak pengembang.
        console.error("Galat halaman:", error);
    }, [error]);

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 transition-colors duration-500 dark:bg-[#05051a]">
            <div className="text-center">
                <p className="mb-4 select-none text-[80px] font-black leading-none text-gray-200 dark:text-white/[0.04]">
                    !
                </p>
                <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                    Ada yang Bermasalah
                </h1>
                <p className="mx-auto mb-8 max-w-sm text-sm font-medium text-gray-500 dark:text-white/40">
                    Halaman ini gagal dimuat. Biasanya ini sementara — coba muat ulang
                    bagian yang gagal.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-xl bg-gray-900 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white outline-none transition-all duration-300 hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:bg-white dark:text-black dark:hover:bg-blue-600 dark:hover:text-white dark:focus-visible:ring-offset-[#05051a]"
                    >
                        Coba Lagi
                    </button>
                    <Link
                        href="/"
                        className="rounded-xl border border-gray-300 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-600 transition-all duration-300 hover:border-gray-400 hover:text-gray-900 dark:border-white/10 dark:text-white/50 dark:hover:border-white/25 dark:hover:text-white"
                    >
                        Ke Beranda
                    </Link>
                </div>

                {/* Ditampilkan hanya bila ada — dipakai untuk mencocokkan laporan
                    pengguna dengan catatan galat di server. */}
                {error.digest && (
                    <p className="mt-8 font-mono text-[11px] text-gray-400 dark:text-white/25">
                        Kode: {error.digest}
                    </p>
                )}
            </div>
        </main>
    );
}
