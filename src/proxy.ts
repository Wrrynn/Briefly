import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Tipe lokal untuk cookie yang akan ditulis (type @supabase/supabase-js di-stub).
type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

// Batas umur sesi: 6 jam sejak login, lewat itu user dipaksa logout.
const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const SESSION_START_COOKIE = "briefly_session_start";

// Next.js 16: konvensi "proxy" (pengganti "middleware"). Menyegarkan token sesi
// Supabase pada setiap request dan menulis ulang cookie-nya, agar sesi tidak
// kedaluwarsa di Server Components.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // PENTING: jangan sisipkan logika apa pun antara createServerClient dan
  // getUser() — bisa membuat user ter-logout secara acak.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // === Batas waktu sesi: maksimal 6 jam, lewat itu paksa logout ===
  if (user) {
    const startedRaw = request.cookies.get(SESSION_START_COOKIE)?.value;
    const started = startedRaw ? Number(startedRaw) : NaN;
    const now = Date.now();

    if (Number.isFinite(started) && now - started > SESSION_MAX_AGE_MS) {
      // Sesi sudah lebih dari 6 jam → akhiri sesi & arahkan ke /login.
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("expired", "1");
      const expiredResponse = NextResponse.redirect(url);
      // Hapus cookie sesi Supabase (sb-*) + penanda mulai sesi.
      request.cookies.getAll().forEach((c) => {
        if (c.name.startsWith("sb-") || c.name === SESSION_START_COOKIE) {
          expiredResponse.cookies.set(c.name, "", { path: "/", maxAge: 0 });
        }
      });
      return expiredResponse;
    }

    if (!Number.isFinite(started)) {
      // Sesi pertama kali terlihat (mis. baru login) → catat waktu mulai.
      // Cookie sengaja berumur panjang; logika 6 jam memakai nilai timestamp,
      // bukan masa kedaluwarsa cookie.
      response.cookies.set(SESSION_START_COOKIE, String(now), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    }
  }

  // Gerbang autentikasi: seluruh aplikasi (termasuk halaman berita "/") wajib
  // login. Rute publik dikecualikan: halaman auth & API (API dipakai oleh
  // halaman setelah login dan mengembalikan JSON, bukan HTML redirect).
  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/login" ||
    path === "/register" ||
    path.startsWith("/auth") ||
    path.startsWith("/api");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) =>
      redirectResponse.cookies.set(c.name, c.value, c),
    );
    return redirectResponse;
  }

  return response;
}

export const config = {
  // Jalankan di semua rute kecuali aset statis & gambar.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
