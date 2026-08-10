import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, tooManyRequests, unauthorized } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { RENTANG_VALID } from "@/lib/news";
import { MigrasiBelumJalan, type Preferensi, simpanPreferensi } from "@/lib/profil";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!allowRequest(`preferensi:${user.id}`, 60, 60_000)) return tooManyRequests();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  // Hanya field yang dikenali yang diteruskan — nilai di luar daftar ditolak
  // agar tidak menabrak CHECK constraint di database.
  const patch: Partial<Preferensi> = {};
  if (body.tema === "dark" || body.tema === "light") patch.tema = body.tema;
  if ((RENTANG_VALID as readonly number[]).includes(Number(body.rentang_hari))) {
    patch.rentang_hari = Number(body.rentang_hari);
  }
  if (typeof body.digest_harian === "boolean") patch.digest_harian = body.digest_harian;
  if (typeof body.kategori_favorit === "string" || body.kategori_favorit === null) {
    patch.kategori_favorit = body.kategori_favorit || null;
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Tidak ada perubahan yang dikenali" }, { status: 400 });
  }

  try {
    return NextResponse.json({ preferensi: await simpanPreferensi(user.id, patch) });
  } catch (e) {
    if (e instanceof MigrasiBelumJalan) {
      return NextResponse.json({ migrasiBelumJalan: true, error: e.message }, { status: 503 });
    }
    console.error("Preferensi error:", e);
    return NextResponse.json({ error: "Gagal menyimpan preferensi" }, { status: 500 });
  }
}
