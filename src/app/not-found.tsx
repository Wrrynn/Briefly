import Link from "next/link";

// Halaman 404 seluruh aplikasi.
//
// Sebelumnya berkas ini tidak ada, sehingga alamat asing menampilkan halaman
// bawaan Next: putih polos, berbahasa Inggris, tanpa logo, tanpa jalan kembali.
// Gayanya mengikuti tampilan 404 yang sudah dipakai halaman detail berita.
export default function TidakDitemukan() {
    return (
        <main className="relative flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 transition-colors duration-500 dark:bg-[#05051a]">
            <div className="text-center">
                <p className="mb-4 select-none text-[80px] font-black leading-none text-gray-200 dark:text-white/[0.04]">
                    404
                </p>
                <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                    Halaman Tidak Ditemukan
                </h1>
                <p className="mx-auto mb-8 max-w-sm text-sm font-medium text-gray-500 dark:text-white/40">
                    Alamat yang kamu buka tidak ada. Mungkin tautannya salah ketik, atau
                    halamannya sudah dipindahkan.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-blue-600 dark:bg-white dark:text-black dark:hover:bg-blue-600 dark:hover:text-white"
                >
                    ← Kembali ke Beranda
                </Link>
            </div>
        </main>
    );
}
