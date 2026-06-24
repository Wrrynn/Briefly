import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Endpoint yang dituju Supabase setelah login OAuth (Google) atau konfirmasi
// email. Menukar `code` menjadi sesi, lalu mengarahkan kembali ke aplikasi.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
