import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, tooManyRequests, unauthorized } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { kartuUntukIds } from "@/lib/news";
import { MigrasiBelumJalan, daftarBookmark, toggleBookmark } from "@/lib/profil";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

function balasMigrasi(e: unknown) {
  if (e instanceof MigrasiBelumJalan) {
    return NextResponse.json({ migrasiBelumJalan: true, error: e.message }, { status: 503 });
  }
  console.error("Bookmark error:", e);
  return NextResponse.json({ error: "Gagal memproses bookmark" }, { status: 500 });
}

// GET ?kartu=1 → sekalian kirim kartu beritanya (untuk tab "Tersimpan").
// GET biasa    → hanya daftar id (untuk menandai tombol simpan di feed).
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const ids = await daftarBookmark(user.id);
    const perluKartu = new URL(request.url).searchParams.get("kartu") === "1";
    return NextResponse.json({
      ids,
      data: perluKartu ? await kartuUntukIds(ids) : undefined,
    });
  } catch (e) {
    return balasMigrasi(e);
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!allowRequest(`bookmark:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
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
    return NextResponse.json(await toggleBookmark(user.id, id));
  } catch (e) {
    return balasMigrasi(e);
  }
}
