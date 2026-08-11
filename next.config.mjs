import { DOMAIN_GAMBAR } from "./src/lib/host-gambar.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Izinkan akses dev server dari IP LAN (mis. saat diuji dari perangkat/VM lain).
  allowedDevOrigins: ["192.168.56.1"],

  images: {
    // Gambar kartu berasal dari CDN portal berita. Daftar domainnya ada di
    // src/lib/host-gambar.mjs — JANGAN menggantinya dengan hostname "**",
    // karena itu membuat /_next/image jadi proxy gambar terbuka.
    // Dua entri per domain: host persis + seluruh subdomainnya.
    remotePatterns: DOMAIN_GAMBAR.flatMap((domain) => [
      { protocol: "https", hostname: domain },
      { protocol: "https", hostname: `**.${domain}` },
    ]),
  },
};

export default nextConfig;
