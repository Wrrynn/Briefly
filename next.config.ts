import type { NextConfig } from "next";
import { DOMAIN_GAMBAR } from "./src/lib/host-gambar.mjs";

// CATATAN: proyek ini punya DUA berkas konfigurasi — next.config.mjs dan
// next.config.ts. Next.js hanya memakai SALAH SATU (yang pertama ditemukan
// menurut urutan resolusinya), jadi yang lain jadi kode mati yang menyesatkan.
// Keduanya dijaga identik untuk sementara; sebaiknya salah satunya dihapus.
const nextConfig: NextConfig = {
  // Izinkan akses dev server dari IP LAN (mis. saat diuji dari perangkat/VM lain).
  allowedDevOrigins: ["192.168.56.1"],

  images: {
    // Gambar kartu berasal dari CDN portal berita. Daftar domainnya ada di
    // src/lib/host-gambar.mjs — JANGAN menggantinya dengan hostname "**",
    // karena itu membuat /_next/image jadi proxy gambar terbuka.
    // Dua entri per domain: host persis + seluruh subdomainnya.
    remotePatterns: DOMAIN_GAMBAR.flatMap((domain) => [
      { protocol: "https" as const, hostname: domain },
      { protocol: "https" as const, hostname: `**.${domain}` },
    ]),
  },
};

export default nextConfig;
