"use client";

import { useEffect } from "react";
import "./globals.css";

// Jaring pengaman terakhir: dipakai HANYA bila root layout sendiri yang gagal.
// Karena ia MENGGANTIKAN root layout, berkas ini wajib merender <html> dan
// <body>-nya sendiri — dan skrip tema di layout tidak ikut jalan, jadi class
// `dark` dipasang langsung agar tampilannya tetap Briefly, bukan halaman putih
// telanjang.
export default function GalatGlobal({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Galat global:", error);
    }, [error]);

    return (
        <html lang="id" className="dark h-full">
            <body className="min-h-full">
                <main className="flex min-h-screen w-full items-center justify-center bg-[#05051a] px-4">
                    <div className="text-center">
                        <p className="mb-4 select-none text-[80px] font-black leading-none text-white/[0.04]">
                            !
                        </p>
                        <h1 className="mb-3 text-2xl font-bold text-white">
                            Aplikasi Gagal Dimuat
                        </h1>
                        <p className="mx-auto mb-8 max-w-sm text-sm font-medium text-white/40">
                            Terjadi galat yang menghentikan seluruh halaman. Coba muat ulang.
                        </p>
                        <button
                            type="button"
                            onClick={reset}
                            className="rounded-xl bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-all duration-300 hover:bg-blue-600 hover:text-white"
                        >
                            Muat Ulang
                        </button>
                        {error.digest && (
                            <p className="mt-8 font-mono text-[11px] text-white/25">
                                Kode: {error.digest}
                            </p>
                        )}
                    </div>
                </main>
            </body>
        </html>
    );
}
