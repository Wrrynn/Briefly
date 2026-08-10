import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, tooManyRequests, unauthorized } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { ringkasanAktor } from "@/lib/news";
import { MigrasiBelumJalan, daftarAktorDiikuti, toggleAktor } from "@/lib/profil";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

function balas(e: unknown) {
  if (e instanceof MigrasiBelumJalan) {
    return NextResponse.json({ migrasiBelumJalan: true, error: e.message }, { status: 503 });
  }
  console.error("Aktor error:", e);
  return NextResponse.json({ error: "Gagal memproses aktor" }, { status: 500 });
}

// Daftar aktor yang diikuti (lengkap dengan statistiknya) + saran aktor populer
// supaya tab ini tidak kosong bagi pengguna baru.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const diikuti = await daftarAktorDiikuti(user.id);
    const [statDiikuti, populer] = await Promise.all([
      diikuti.length ? ringkasanAktor(diikuti) : Promise.resolve([]),
      ringkasanAktor(undefined, 12),
    ]);

    const setDiikuti = new Set(diikuti.map((n) => n.toLowerCase()));
    return NextResponse.json({
      diikuti: statDiikuti,
      populer: populer.map((a) => ({ ...a, diikuti: setDiikuti.has(a.nama.toLowerCase()) })),
    });
  } catch (e) {
    return balas(e);
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!allowRequest(`aktor:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return tooManyRequests();
  }

  let nama: string;
  try {
    const body = await request.json();
    nama = String(body?.nama || "").trim();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  if (!nama || nama.length > 200) {
    return NextResponse.json({ error: "Nama aktor tidak valid" }, { status: 400 });
  }

  try {
    return NextResponse.json(await toggleAktor(user.id, nama));
  } catch (e) {
    return balas(e);
  }
}
