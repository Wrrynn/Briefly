import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, tooManyRequests, unauthorized } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { kartuUntukIds } from "@/lib/news";
import { MigrasiBelumJalan, catatRiwayat, daftarRiwayat, hapusRiwayat } from "@/lib/profil";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

function balas(e: unknown) {
  if (e instanceof MigrasiBelumJalan) {
    return NextResponse.json({ migrasiBelumJalan: true, error: e.message }, { status: 503 });
  }
  console.error("Riwayat error:", e);
  return NextResponse.json({ error: "Gagal memproses riwayat" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const baris = await daftarRiwayat(user.id, 60);
    const perluKartu = new URL(request.url).searchParams.get("kartu") === "1";
    const kartu = perluKartu ? await kartuUntukIds(baris.map((b) => b.id_cluster)) : [];

    // Sisipkan waktu baca ke tiap kartu agar UI bisa menampilkan "dibaca kapan".
    const perId = new Map(baris.map((b) => [b.id_cluster, b]));
    const data = kartu.map((k: any) => ({
      ...k,
      dibacaAt: perId.get(k.id)?.dibaca_at ?? null,
      jumlahBuka: perId.get(k.id)?.jumlah_buka ?? 1,
    }));

    return NextResponse.json({ riwayat: baris, data: perluKartu ? data : undefined });
  } catch (e) {
    return balas(e);
  }
}

// Dipanggil halaman detail saat berita dibuka.
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!allowRequest(`riwayat:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests();
  }

  let id: number;
  try {
    const body = await request.json();
    id = Number(body?.id);
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID klaster tidak valid" }, { status: 400 });
  }

  try {
    await catatRiwayat(user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return balas(e);
  }
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  try {
    await hapusRiwayat(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return balas(e);
  }
}
