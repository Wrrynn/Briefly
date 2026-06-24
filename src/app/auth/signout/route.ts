import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Logout. Dipanggil via <form method="post" action="/auth/signout">.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
