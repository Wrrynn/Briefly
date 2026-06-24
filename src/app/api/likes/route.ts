import { NextResponse } from "next/server";
import { supabase as admin, isSupabaseConfigured } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

// Like/support aplikasi: 1 like per pengguna terdaftar (dedup via PK user_id).
// Pola aman: IDENTITAS diverifikasi lewat sesi (getUser), lalu operasi DB
// dilakukan dengan SERVICE-ROLE (admin, bypass RLS) memakai user_id terverifikasi
// — supaya tulis tidak bergantung pada token sesi yang mencapai PostgREST.
export const dynamic = "force-dynamic";

async function totalLikes(): Promise<number> {
  const { count } = await admin
    .from("app_likes")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

async function sudahLike(userId: string): Promise<boolean> {
  const { data } = await admin
    .from("app_likes")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
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

  const liked = user ? await sudahLike(user.id) : false;
  return NextResponse.json({ count, liked, authed: !!user });
}

export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // 1) Verifikasi identitas dari sesi.
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Perlu login" }, { status: 401 });
  }

  // 2) Toggle pakai admin (bypass RLS) dengan user_id terverifikasi.
  const liked = await sudahLike(user.id);
  if (liked) {
    const { error } = await admin.from("app_likes").delete().eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.from("app_likes").insert({ user_id: user.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const count = await totalLikes();
  return NextResponse.json({ count, liked: !liked });
}
