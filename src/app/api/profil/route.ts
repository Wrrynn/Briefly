import { NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import {
  MigrasiBelumJalan,
  ambilPreferensi,
  daftarAktorDiikuti,
  daftarBookmark,
  daftarRiwayat,
} from "@/lib/profil";

export const dynamic = "force-dynamic";

// Ringkasan profil: identitas dari sesi + hitungan aktivitas + preferensi.
// Dipanggil sekali saat halaman /profil dibuka.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const u = user as any;
  const meta = (u.user_metadata || {}) as { full_name?: string; avatar_url?: string };
  const identitas = {
    id: u.id,
    email: u.email ?? null,
    nama: meta.full_name || u.email?.split("@")[0] || "Pengguna",
    avatar: meta.avatar_url || null,
    bergabung: u.created_at ?? null,
    loginTerakhir: u.last_sign_in_at ?? null,
  };

  try {
    const [bookmark, riwayat, aktor, preferensi] = await Promise.all([
      daftarBookmark(u.id),
      daftarRiwayat(u.id, 200),
      daftarAktorDiikuti(u.id),
      ambilPreferensi(u.id),
    ]);

    return NextResponse.json({
      user: identitas,
      statistik: {
        disimpan: bookmark.length,
        dibaca: riwayat.length,
        totalBuka: riwayat.reduce((n, r) => n + r.jumlah_buka, 0),
        diikuti: aktor.length,
      },
      preferensi,
    });
  } catch (e) {
    if (e instanceof MigrasiBelumJalan) {
      // Aplikasi tetap hidup: halaman profil menampilkan instruksi migrasi
      // alih-alih layar error.
      return NextResponse.json(
        { user: identitas, migrasiBelumJalan: true, error: e.message },
        { status: 200 },
      );
    }
    console.error("Profil error:", e);
    return NextResponse.json({ error: "Gagal memuat profil" }, { status: 500 });
  }
}
