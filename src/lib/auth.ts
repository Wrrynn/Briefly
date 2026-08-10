import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sessionAgeExceeded } from "@/lib/session";

// Gerbang autentikasi untuk ROUTE HANDLER.
//
// Kenapa perlu: proxy.ts mengecualikan seluruh `/api` dari gerbang login (benar,
// karena API harus membalas JSON 401 dan bukan redirect HTML). Akibatnya, selama
// tiap route tidak memeriksa sesi sendiri, endpoint seperti
// /api/analyze-news/berita bisa diakses siapa pun tanpa login — padahal semua
// query memakai client SERVICE-ROLE yang mem-bypass RLS. Helper ini menutup
// celah itu: identitas diverifikasi ke Supabase Auth, baru query service-role
// dijalankan.

export type SessionUser = { id: string; email?: string | null; last_sign_in_at?: string | null };

/**
 * Kembalikan user yang sesinya sah, atau `null` bila belum login / sesi sudah
 * melewati batas umur (6 jam sejak login).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) return null;
  if (sessionAgeExceeded(user)) return null;
  return user as SessionUser;
}

export function unauthorized(message = "Perlu login") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function tooManyRequests(message = "Terlalu banyak permintaan. Coba lagi sebentar lagi.") {
  return NextResponse.json({ error: message }, { status: 429 });
}
