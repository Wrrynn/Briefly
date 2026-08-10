import type { NextRequest } from "next/server";

// Pembatas laju sederhana (fixed window) di MEMORI PROSES.
//
// Cakupan: per-instance. Di deployment serverless/multi-instance ini bersifat
// best-effort — cukup untuk meredam replay/scraping kasar dari satu klien, tapi
// bukan pengganti rate limit terpusat (Upstash/Redis, atau WAF) bila trafik
// sudah besar. Dipakai untuk melindungi endpoint publik & endpoint tulis.
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
const MAX_KEYS = 10_000; // batas atas agar map tidak tumbuh tanpa henti

function sweep(now: number) {
  for (const [key, w] of windows) {
    if (w.resetAt <= now) windows.delete(key);
  }
}

/**
 * Catat satu request untuk `key`. Mengembalikan `true` bila request MASIH boleh
 * diproses, `false` bila kuota dalam jendela waktu sudah habis.
 */
export function allowRequest(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const w = windows.get(key);

  if (!w || w.resetAt <= now) {
    if (windows.size >= MAX_KEYS) sweep(now);
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (w.count >= limit) return false;
  w.count++;
  return true;
}

// Pengenal klien untuk endpoint yang belum ter-autentikasi. Di belakang proxy
// (Vercel/Cloudflare) IP asli ada di x-forwarded-for.
export function clientIp(request: NextRequest | Request): string {
  const h = request.headers;
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}
