import { NextRequest, NextResponse } from "next/server";
import { supabase as admin, isSupabaseConfigured } from "@/lib/supabase";
import { getSessionUser, tooManyRequests } from "@/lib/auth";
import { allowRequest, clientIp } from "@/lib/rate-limit";

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

// GET sengaja tetap publik (jumlah like tampil di footer landing untuk
// pengunjung yang belum login), jadi dibatasi laju agar tidak jadi sarana
// membebani database.
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ count: 0, liked: false, authed: false });
  }

  if (!allowRequest(`likes-get:${clientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests();
  }

  const count = await totalLikes();

  const user = await getSessionUser();
  const liked = user ? await sudahLike(user.id) : false;
  return NextResponse.json({ count, liked, authed: !!user });
}

export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  // 1) Verifikasi identitas dari sesi (termasuk batas umur sesi 6 jam).
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Perlu login" }, { status: 401 });
  }

  if (!allowRequest(`likes-post:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests();
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
