import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Logout. Dipanggil via <form method="post" action="/auth/signout">.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  // Reset penanda mulai sesi (timer 6 jam) agar login berikutnya mulai dari awal.
  res.cookies.set("briefly_session_start", "", { path: "/", maxAge: 0 });
  return res;
}
