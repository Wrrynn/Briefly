import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Catat metrik trending untuk satu klaster (id_cluster):
//  - klik     : 1 saat halaman analisis dibuka (dedup di sisi klien per sesi)
//  - durasi_ms: total waktu baca, dikirim saat user meninggalkan halaman
// Penambahan dilakukan ATOMIK lewat RPC `tambah_metrik` agar aman dari race.
const MAX_DURASI_MS = 10 * 60 * 1000; // batas atas per kiriman: 10 menit

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
    klik = Number(body?.klik) > 0 ? 1 : 0; // klik maks 1 per kiriman
    durasi_ms = Math.max(0, Math.min(MAX_DURASI_MS, Number(body?.durasi_ms) || 0));
  } catch {
    // Body kosong / bukan JSON — anggap tidak ada metrik.
  }

  if (klik === 0 && durasi_ms === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.rpc("tambah_metrik", {
    p_id: id,
    p_klik: klik,
    p_durasi: durasi_ms,
  });
  if (error) {
    console.error("Metrik error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
