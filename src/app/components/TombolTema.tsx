"use client";

import { temaGelapAktif, terapkanTema } from "@/lib/tema";

// Tombol ganti tema yang dipakai di SELURUH halaman.
//
// Ikonnya dipilih murni lewat varian `dark:` CSS, bukan state React. Itu yang
// membuat tombol ini bisa dirender langsung dari server: versi lama menyimpan
// `isDarkMode` di state, sehingga tiap halaman terpaksa menyembunyikan
// tombolnya sampai `mounted` true demi menghindari hydration mismatch.
export default function TombolTema({
    className = "",
    onGanti,
}: {
    className?: string;
    /** Dipanggil setelah tema berubah — dipakai profil untuk ikut menyimpan ke database. */
    onGanti?: (gelap: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => {
                const gelap = !temaGelapAktif();
                terapkanTema(gelap);
                onGanti?.(gelap);
            }}
            aria-label="Ganti tema terang atau gelap"
            title="Ganti tema terang atau gelap"
            className={`rounded-xl bg-gray-100 p-2.5 transition-all active:scale-90 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 ${className}`}
        >
            {/* Matahari saat tema gelap (menawarkan "kembali ke terang") */}
            <svg className="hidden h-4 w-4 text-amber-400 dark:block" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
            {/* Bulan saat tema terang */}
            <svg className="h-4 w-4 text-blue-700 dark:hidden" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
        </button>
    );
}
