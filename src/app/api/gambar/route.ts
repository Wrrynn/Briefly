import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getSessionUser, tooManyRequests, unauthorized } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { gambarKlaster } from "@/lib/gambar";

// Gambar pratinjau untuk kartu berita: GET /api/gambar?ids=12,34,56
//
// Endpoint ini melakukan permintaan KELUAR ke portal berita, jadi ia dijaga
// ketat: wajib login, dibatasi laju, dan jumlah id per permintaan dibatasi —
// tanpa itu siapa pun bisa memakainya untuk memaksa server kita menembaki
// alamat lain. Hasilnya di-cache di lib/gambar.ts, sehingga permintaan kedua
// untuk id yang sama tidak menyentuh jaringan luar sama sekali.
export const dynamic = "force-dynamic";

const MAKS_ID = 24; // satu halaman feed = 12 kartu; 24 memberi ruang untuk trending
const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 60_000;

export async function GET(request: NextRequest) {
    if (!isSupabaseConfigured) {
        return NextResponse.json({ gambar: {} });
    }

    const user = await getSessionUser();
    if (!user) return unauthorized();

    if (!allowRequest(`gambar:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
        return tooManyRequests();
    }

    const ids = (request.nextUrl.searchParams.get("ids") || "")
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0)
        .slice(0, MAKS_ID);

    if (!ids.length) return NextResponse.json({ gambar: {} });

    try {
        const gambar = await gambarKlaster(ids);
        return NextResponse.json({ gambar });
    } catch (e) {
        // Kartu tetap tampil tanpa gambar — ini bukan kegagalan yang layak
        // menghentikan halaman.
        console.error("Gambar klaster error:", e instanceof Error ? e.message : e);
        return NextResponse.json({ gambar: {} });
    }
}
