import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Tipe lokal untuk cookie yang akan ditulis. Dideklarasikan manual karena type
// bawaan @supabase/supabase-js di proyek ini di-stub menjadi `any`.
type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

// Client Supabase untuk dipakai di SERVER (Server Components, Route Handlers,
// Server Actions). Sesi pengguna disimpan di cookie. Memakai anon key, bukan
// service-role — jadi RLS tetap berlaku atas nama user yang login.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Dipanggil dari Server Component (cookie read-only) — abaikan;
            // middleware yang bertugas me-refresh cookie sesi.
          }
        },
      },
    },
  );
}
