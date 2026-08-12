"use client";

import Link from "next/link";
import BookmarkButton from "@/app/components/BookmarkButton";
import GambarBerita from "@/app/components/GambarBerita";

// =====================================================================
// Daftar trending — papan peringkat, bukan dinding kartu
// =====================================================================
// Sebelumnya trending memakai NewsCard yang sama persis dengan feed di
// bawahnya: bentuk, isi, dan ukuran identik, sehingga seksi ini tidak punya
// identitas sendiri dan hanya terbaca sebagai "tiga kartu lagi".
//
// Kontrasnya sekarang datang dari BENTUK, bukan dari ada yang diperbesar:
// baris mendatar bernomor terbaca sebagai tangga peringkat. Efek sampingnya
// menguntungkan — seksi ini jadi jauh lebih pendek, sehingga berita pertama
// di feed naik lebih cepat terlihat tanpa menggulir.
// =====================================================================

type Item = {
    id?: number | string;
    title?: string;
    portalCount?: number;
    portals?: string[];
    menitBaca?: number;
    views?: number;
};

function Meta({ item }: { item: Item }) {
    const bagian: string[] = [];

    const portal = item.portalCount || item.portals?.length || 0;
    if (portal > 0) bagian.push(`${portal} portal`);

    // Lama baca adalah bahan skor paling berbobot sekaligus paling sulit
    // dimanipulasi — di sinilah ia menjelaskan kenapa berita ini di atas.
    if ((item.menitBaca ?? 0) > 0) {
        bagian.push(
            item.menitBaca! < 1
                ? "<1 mnt dibaca"
                : `${Number(item.menitBaca).toLocaleString("id-ID")} mnt dibaca`,
        );
    } else if ((item.views ?? 0) > 0) {
        bagian.push(`${Number(item.views).toLocaleString("id-ID")} dilihat`);
    }

    if (!bagian.length) return null;
    return (
        <p className="mt-1 truncate text-[11px] text-gray-400 dark:text-white/40">
            {bagian.join(" · ")}
        </p>
    );
}

function Baris({ item, peringkat }: { item: Item; peringkat: number }) {
    const idKlaster = item.id == null ? null : Number(item.id);

    return (
        <li className="group relative flex items-center gap-3 p-3 transition-colors hover:bg-gray-50 sm:gap-4 sm:p-4 dark:hover:bg-white/[0.03]">
            <Link
                href={`/news/${item.id}`}
                aria-label={item.title}
                className="absolute inset-0 z-10 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
            />

            {/* Peringkat 1 diberi warna aksen; sisanya sengaja redup supaya
                nomornya membantu membaca urutan tanpa merebut perhatian dari
                judul beritanya. */}
            <span
                aria-hidden
                className={`w-6 shrink-0 text-center text-xl font-black tabular-nums sm:w-8 sm:text-2xl ${
                    peringkat === 1
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-300 dark:text-white/20"
                }`}
            >
                {peringkat}
            </span>

            <GambarBerita
                idKlaster={idKlaster}
                sizes="96px"
                className="h-14 w-20 shrink-0 rounded-xl sm:h-16 sm:w-24"
            />

            <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 sm:text-[15px] dark:text-white dark:group-hover:text-blue-400">
                    {item.title}
                </h3>
                <Meta item={item} />
            </div>

            {idKlaster != null && (
                <span className="relative z-20 shrink-0">
                    <BookmarkButton id={idKlaster} />
                </span>
            )}
        </li>
    );
}

function BarisKerangka() {
    return (
        <li className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
            <div className="h-6 w-6 shrink-0 animate-pulse rounded bg-gray-200 sm:w-8 dark:bg-white/10" />
            <div className="h-14 w-20 shrink-0 animate-pulse rounded-xl bg-gray-200 sm:h-16 sm:w-24 dark:bg-white/10" />
            <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-4 w-3/5 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-2/5 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            </div>
        </li>
    );
}

export default function DaftarTrending({
    data,
    memuat,
}: {
    data?: Item[];
    memuat?: boolean;
}) {
    const daftar = data || [];

    const pembungkus =
        "divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100/60 dark:divide-white/[0.06] dark:border-white/5 dark:bg-[#0c0c20] dark:shadow-none";

    if (memuat) {
        return (
            <ul className={pembungkus}>
                {[1, 2, 3].map((i) => (
                    <BarisKerangka key={i} />
                ))}
            </ul>
        );
    }

    if (!daftar.length) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-10 text-center text-sm font-bold uppercase tracking-widest text-gray-400 dark:border-white/5 dark:text-white/30">
                Belum ada data trending
            </div>
        );
    }

    return (
        <ul className={pembungkus}>
            {daftar.map((item, i) => (
                // Urutan array sudah urutan peringkat dari /api/trending.
                <Baris key={item.id || i} item={item} peringkat={i + 1} />
            ))}
        </ul>
    );
}
