import { NextResponse } from "next/server";
import { supabase as admin, isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

// Like/support aplikasi: 1 like per pengguna terdaftar (dedup via PK user_id).
// GET  -> { count, liked, authed }  (count agregat publik via service-role)
// POST -> toggle like milik user yang sedang login (butuh sesi)
export const dynamic = "force-dynamic";

async function totalLikes(): Promise<number> {
  const { count } = await admin
    .from("app_likes")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ count: 0, liked: false, authed: false });
  }

  const count = await totalLikes();

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  let liked = false;
  if (user) {
    const { data } = await sb
      .from("app_likes")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    liked = !!data;
  }

  return NextResponse.json({ count, liked, authed: !!user });
}

export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Perlu login" }, { status: 401 });
  }

  // Toggle: kalau sudah like → hapus; kalau belum → tambah. RLS memastikan
  // user hanya bisa mengubah barisnya sendiri.
  const { data: existing } = await sb
    .from("app_likes")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await sb.from("app_likes").delete().eq("user_id", user.id);
  } else {
    await sb.from("app_likes").insert({ user_id: user.id });
  }

  const count = await totalLikes();
  return NextResponse.json({ count, liked: !existing });
}
