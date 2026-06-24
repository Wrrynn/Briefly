import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Jalankan di semua rute kecuali aset statis & gambar.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
