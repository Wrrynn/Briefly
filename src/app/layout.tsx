import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { SKRIP_TEMA } from "@/lib/tema";
import "./globals.css";

// Font sans modern untuk seluruh teks UI
const fontSans = Plus_Jakarta_Sans({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Briefly: Analisis Berita Indonesia dalam Perspektif AI",
    description:
        "Platform intelijen berita berbasis AI: ringkasan, analisis sentimen, dan prediksi dampak sektoral dari berita Indonesia.",
    icons: {
        icon: "/images/favicon-512.png",
        shortcut: "/images/favicon-512.png",
        apple: "/images/favicon-512.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="id"
            className={`${fontSans.variable} ${geistMono.variable} h-full antialiased`}
            // globals.css memasang scroll-behavior: smooth agar lompatan ke
            // #news-content terlihat halus. Tanpa atribut ini Next ikut
            // menghaluskan perpindahan ANTAR HALAMAN, sehingga membuka satu
            // berita terasa seperti tergulir panjang alih-alih berganti halaman.
            data-scroll-behavior="smooth"
            // Skrip di bawah menambahkan class `dark` sebelum React hydrate,
            // jadi atribut class di klien memang berbeda dari hasil server.
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">
                {/* Elemen PERTAMA di <body>, sengaja skrip mentah dan sinkron:
                    browser mengeksekusinya saat mem-parse HTML, sebelum menggambar
                    apa pun di bawahnya — itulah yang menghapus kedip terang→gelap.

                    Dua alternatif sudah dicoba dan ditolak:
                    * <head> manual di root layout → bentrok dengan pengelolaan
                      head milik Next dan memicu ketidakcocokan hydration.
                    * next/script strategy="beforeInteractive" → tidak meng-inline
                      skripnya ke HTML server sama sekali, jadi kedipnya kembali.

                    React memperingatkan bahwa skrip di dalam pohon komponen tidak
                    dijalankan saat navigasi sisi klien. Itu memang tidak perlu:
                    class `dark` sudah menempel di <html> dan bertahan lintas
                    navigasi. Yang dibutuhkan hanya eksekusi saat dokumen dimuat. */}
                <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />

                {/* Tautan lompat — hanya muncul saat difokus keyboard.
                    Tanpa ini, pengguna keyboard dan pembaca layar harus menyusuri
                    logo, kotak cari, tombol tema, avatar, dan tombol keluar sebelum
                    mencapai berita pertama, DI SETIAP HALAMAN. Sasarannya
                    #isi-utama, yang dipasang tepat setelah header di tiap halaman. */}
                <a
                    href="#isi-utama"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-gray-900 focus:px-5 focus:py-3 focus:text-[11px] focus:font-black focus:uppercase focus:tracking-[0.2em] focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:bg-white dark:focus:text-gray-900"
                >
                    Langsung ke isi
                </a>

                {children}
            </body>
        </html>
    );
}
