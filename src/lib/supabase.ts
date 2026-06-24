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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// True hanya bila URL + service-role key sudah diisi di .env.local.
export const isSupabaseConfigured = Boolean(supabaseUrl && serviceKey);

// PENTING: jangan biarkan modul ini THROW saat diimpor bila key belum diisi.
// Dulu `createClient(url!, KEY!)` melempar "supabaseKey is required" saat route
// dimuat, sehingga API mengembalikan halaman HTML 500 dan fetch().json() di
// frontend gagal dengan "Unexpected token '<'". Sebagai gantinya client tetap
// dibuat (dengan placeholder), tapi setiap request GAGAL-CEPAT dengan pesan
// jelas; helper q() di route menangkapnya dan route membalas JSON rapi.
const resilientFetch: typeof fetch = (input: any, init: any = {}) => {
  if (!isSupabaseConfigured) {
    return Promise.reject(
      new Error(
        "Supabase belum dikonfigurasi: isi SUPABASE_SERVICE_ROLE_KEY di .env.local lalu restart dev server.",
      ),
    );
  }
  return undiciFetch(input, { ...init, dispatcher }) as any;
};

export const supabase = createClient(
  // Pakai `||` bukan `??`: .env mengisi var kosong sebagai "" (bukan undefined),
  // dan "" tetap membuat createClient melempar "supabaseKey is required".
  supabaseUrl || "http://localhost:54321",
  serviceKey || "SERVICE_ROLE_KEY_BELUM_DIISI",
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
