import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Catat metrik trending untuk satu klaster (id_cluster):
//  - klik     : 1 saat halaman analisis dibuka
//  - durasi_ms: total waktu baca, dikirim saat user meninggalkan halaman
// Penambahan dilakukan ATOMIK lewat RPC `tambah_metrik` agar aman dari race.
//
// DEDUP SISI SERVER: 1 klik hanya dihitung SEKALI per (sesi, klaster) — dijaga
// cookie sesi anonim `briefly_sid` + tabel metrik_klik_unik. Ini mencegah angka
// trending digelembungkan dengan refresh/replay (dedup klien saja gampang diakali).
const MAX_DURASI_MS = 10 * 60 * 1000; // batas atas per kiriman: 10 menit
const SID_COOKIE = "briefly_sid";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  // Sesi anonim untuk dedup (buat bila belum ada).
  let sid = request.cookies.get(SID_COOKIE)?.value;
  const sidBaru = !sid;
  if (!sid) sid = randomUUID();

  const ok = (views?: number) => {
    const res = NextResponse.json(views == null ? { ok: true } : { ok: true, views });
    if (sidBaru) {
      res.cookies.set(SID_COOKIE, sid!, {
        path: "/",
        maxAge: 60 * 60 * 24 * 180, // 180 hari
        httpOnly: true,
        sameSite: "lax",
      });
    }
    return res;
  };

  if (!isSupabaseConfigured || (klik === 0 && durasi_ms === 0)) {
    return ok();
  }

  // Dedup klik: insert (sesi, klaster); bila sudah ada → klik tidak dihitung
  // lagi (durasi tetap diakumulasi karena waktu baca itu sinyal nyata).
  let klikDihitung = klik;
  if (klik > 0) {
    const { data: inserted } = await supabase
      .from("metrik_klik_unik")
      .upsert({ sid, id_cluster: id }, { onConflict: "sid,id_cluster", ignoreDuplicates: true })
      .select("sid");
    klikDihitung = inserted && inserted.length > 0 ? 1 : 0;
  }

  if (klikDihitung === 0 && durasi_ms === 0) {
    return ok();
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
  return ok(Number((m as { jumlah_klik?: number } | null)?.jumlah_klik) || undefined);
}
