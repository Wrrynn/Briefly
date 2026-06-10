import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
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
        icon: "/images/Briefly-logo.png",
        shortcut: "/images/Briefly-logo.png",
        apple: "/images/Briefly-logo.png",
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
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
