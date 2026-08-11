"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ambilGambar } from "@/lib/gambar-client";
import { bolehDioptimasi } from "@/lib/host-gambar.mjs";

// Gambar pratinjau sebuah klaster berita — og:image halaman sumbernya.
// Dipakai kartu (feed, trending, profil) dan halaman detail, jadi tiga keadaan
// tampilannya (memuat / ada / tidak ada) hanya ditulis sekali di sini.

function GambarKosong() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/[0.06] dark:to-white/[0.02]">
            <svg
                className="h-9 w-9 text-gray-300 dark:text-white/15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h5M8 13h8M8 16h8" />
            </svg>
        </div>
    );
}

export default function GambarBerita({
    idKlaster,
    sizes,
    className = "",
    priority = false,
}: {
    idKlaster: number | null;
    /** Nilai atribut `sizes` untuk next/image — sesuaikan dengan lebar tayang sebenarnya. */
    sizes: string;
    /** Kelas untuk wadah: rasio, sudut, dan lebar ditentukan pemanggil. */
    className?: string;
    /** Setel true bila gambar berada di layar pertama (mematikan lazy-load). */
    priority?: boolean;
}) {
    // undefined = masih diambil, null = tidak ada gambar, string = URL siap pakai.
    const [gambar, setGambar] = useState<string | null | undefined>(
        idKlaster == null ? null : undefined,
    );
    const [gagalMuat, setGagalMuat] = useState(false);

    useEffect(() => {
        if (idKlaster == null) return;
        let aktif = true;
        ambilGambar(idKlaster).then((url) => {
            if (!aktif) return;
            setGagalMuat(false);
            setGambar(url);
        });
        return () => {
            aktif = false;
        };
    }, [idKlaster]);

    return (
        <div className={`relative overflow-hidden bg-gray-100 dark:bg-white/[0.04] ${className}`}>
            {gambar && !gagalMuat ? (
                // Host CDN portal yang dikenal dilewatkan ke pengoptimal Next
                // (aslinya ~1200px, yang dibutuhkan jauh lebih kecil). Host lain
                // tetap tampil lewat <img> biasa — tanpa optimasi, tidak rusak.
                bolehDioptimasi(gambar) ? (
                    <Image
                        src={gambar}
                        alt=""
                        fill
                        sizes={sizes}
                        priority={priority}
                        onError={() => setGagalMuat(true)}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- host di luar daftar remotePatterns
                    <img
                        src={gambar}
                        alt=""
                        loading={priority ? "eager" : "lazy"}
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() => setGagalMuat(true)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )
            ) : gambar === undefined ? (
                <div className="h-full w-full animate-pulse bg-gray-200 dark:bg-white/[0.06]" />
            ) : (
                <GambarKosong />
            )}
        </div>
    );
}
