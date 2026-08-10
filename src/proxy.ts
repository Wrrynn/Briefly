import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sessionAgeExceeded } from "@/lib/session";

// Tipe lokal untuk cookie yang akan ditulis (type @supabase/supabase-js di-stub).
type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

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

  // === Batas waktu sesi: maksimal 6 jam sejak login, lewat itu paksa logout ===
  // Umur sesi dihitung dari `last_sign_in_at` milik user hasil getUser() —
  // nilai dari Auth server yang tidak bisa disentuh klien. Versi sebelumnya
  // memakai cookie `briefly_session_start` yang bukan httpOnly dan tidak
  // ditandatangani, sehingga user cukup menghapusnya untuk memperpanjang sesi.
  if (user && sessionAgeExceeded(user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("expired", "1");
    const expiredResponse = NextResponse.redirect(url);
    // Hapus cookie sesi Supabase (sb-*) + sisa cookie penanda versi lama.
    request.cookies.getAll().forEach((c) => {
      if (c.name.startsWith("sb-") || c.name === "briefly_session_start") {
        expiredResponse.cookies.set(c.name, "", { path: "/", maxAge: 0 });
      }
    });
    return expiredResponse;
  }

  // Gerbang autentikasi: seluruh aplikasi (termasuk halaman berita "/") wajib
  // login. Rute publik dikecualikan: halaman auth & API (API dipakai oleh
  // halaman setelah login dan mengembalikan JSON, bukan HTML redirect).
  const path = request.nextUrl.pathname;
  const isPublic =
    path === "/" || // root publik: server component menampilkan Landing/NewsHome
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
