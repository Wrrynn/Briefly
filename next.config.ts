import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan akses dev server dari IP LAN (mis. saat diuji dari perangkat/VM lain).
  allowedDevOrigins: ["192.168.56.1"],
};

export default nextConfig;
