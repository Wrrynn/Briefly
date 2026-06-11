import { createClient } from "@supabase/supabase-js";
import { setDefaultResultOrder } from "node:dns";
import { Agent, fetch as undiciFetch } from "undici";

// Di Windows, Node sering mencoba alamat IPv6 lebih dulu lalu kena timeout saat
// menyambung ke Supabase. Paksa resolusi IPv4 lebih dulu.
try {
  setDefaultResultOrder("ipv4first");
} catch {
  // Abaikan bila runtime tidak mendukung (mis. edge runtime).
}

// Jaringan ke Supabase (di balik Cloudflare) di sebagian lingkungan sangat
// lambat membuka koneksi TCP — sering melewati batas default Node (10 dtk),
// sehingga query gagal dan data kosong. Pakai dispatcher undici dengan connect
// timeout panjang + keep-alive: koneksi pertama boleh lambat, lalu dipakai
// ulang (cepat) untuk query berikutnya.
const dispatcher = new Agent({
  connect: { timeout: 45_000 },
  keepAliveTimeout: 60_000,
  keepAliveMaxTimeout: 120_000,
  headersTimeout: 45_000,
  bodyTimeout: 45_000,
});

const resilientFetch: typeof fetch = (input: any, init: any = {}) =>
  undiciFetch(input, { ...init, dispatcher }) as any;

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: resilientFetch,
    },
  },
);
