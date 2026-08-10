import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSessionUser, tooManyRequests, unauthorized } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";

// Catat metrik trending untuk satu klaster (id_cluster):
//  - klik     : 1 saat halaman analisis dibuka
//  - durasi_ms: total waktu baca, dikirim saat user meninggalkan halaman
// Penambahan dilakukan ATOMIK lewat RPC `tambah_metrik` agar aman dari race.
//
// DEDUP: 1 klik hanya dihitung SEKALI per (pengguna, klaster), dijaga tabel
// metrik_klik_unik. Dulu kuncinya cookie anonim `briefly_sid` — cookie itu bisa
// dihapus berkali-kali dari devtools sehingga skor trending gampang
// digelembungkan. Halaman analisis memang sudah wajib login, jadi memakai
// user_id sebagai kunci dedup lebih kuat DAN tidak menambah query.
const MAX_DURASI_MS = 10 * 60 * 1000; // batas atas per kiriman: 10 menit

// Pagar tambahan terhadap replay: sebanyak-banyaknya 60 kiriman metrik per menit
// per pengguna (pemakaian normal hanya 2 per artikel yang dibuka).
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  if (!allowRequest(`metrik:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests();
  }

  const { id: idStr } = await context.params;
  const id = parseInt(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  // Body bisa JSON biasa (fetch) atau Blob JSON (navigator.sendBeacon).
  let klik = 0;
  let durasi_ms = 0;
  try {
    const body = await request.json();
    klik = Number(body?.klik) > 0 ? 1 : 0;
    durasi_ms = Math.max(0, Math.min(MAX_DURASI_MS, Number(body?.durasi_ms) || 0));
  } catch {
    // Body kosong / bukan JSON — anggap tidak ada metrik.
  }

  if (!isSupabaseConfigured || (klik === 0 && durasi_ms === 0)) {
    return NextResponse.json({ ok: true });
  }

  // Dedup klik: insert (pengguna, klaster); bila sudah ada → klik tidak dihitung
  // lagi (durasi tetap diakumulasi karena waktu baca itu sinyal nyata).
  //
  // Memakai INSERT biasa, bukan upsert(ignoreDuplicates).select(). Cara lama
  // selalu mengembalikan array kosong — PostgREST menjalankan ON CONFLICT DO
  // NOTHING dan tidak mengirim balik baris yang baru masuk — sehingga
  // klikDihitung SELALU 0 dan tidak ada satu pun klik yang pernah tercatat.
  // Dengan insert biasa, berhasil = baris baru = klik pertama; error 23505
  // (unique_violation) = sudah pernah dihitung.
  let klikDihitung = klik;
  if (klik > 0) {
    const { error: insertError } = await supabase
      .from("metrik_klik_unik")
      .insert({ sid: user.id, id_cluster: id });

    if (!insertError) {
      klikDihitung = 1;
    } else {
      klikDihitung = 0;
      if (insertError.code !== "23505") {
        console.error("Metrik dedup error:", insertError);
      }
    }
  }

  if (klikDihitung === 0 && durasi_ms === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.rpc("tambah_metrik", {
    p_id: id,
    p_klik: klikDihitung,
    p_durasi: durasi_ms,
  });
  if (error) {
    console.error("Metrik error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Kembalikan jumlah dilihat terbaru agar UI update seketika tanpa reload.
  const { data: m } = await supabase
    .from("tabel_metrik")
    .select("jumlah_klik")
    .eq("id_cluster", id)
    .maybeSingle();

  // `|| undefined` yang lama mengubah nilai sah 0 menjadi undefined, sehingga
  // UI tidak pernah menerima angka saat hitungan masih nol.
  const mentah = (m as { jumlah_klik?: number } | null)?.jumlah_klik;
  const views = mentah == null ? undefined : Number(mentah);

  return NextResponse.json(views == null ? { ok: true } : { ok: true, views });
}
