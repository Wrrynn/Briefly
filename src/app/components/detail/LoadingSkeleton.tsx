"use client";

// Kerangka muat halaman detail berita.
//
// Seluruh warnanya dulu hanya putih transparan (bg-white/8, bg-white/10, dst)
// tanpa satu pun pasangan `dark:` — benar di latar gelap, tapi di mode terang
// putih 8% di atas bg-gray-50 praktis tidak terlihat. Pembaca mode terang
// membuka satu berita dan hanya melihat area kosong selama pemuatan.
//
// Sekarang memakai dua tingkat yang sama dengan KerangkaKartu:
//   kuat  = bg-gray-200 dark:bg-white/10   (judul, gambar, blok utama)
//   redup = bg-gray-100 dark:bg-white/5    (teks pendukung)
const KUAT = "bg-gray-200 dark:bg-white/10";
const REDUP = "bg-gray-100 dark:bg-white/5";
const GARIS = "border-gray-200 dark:border-white/[0.07]";

export default function LoadingSkeleton() {
    return (
        <div className="animate-pulse w-full">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-8">
                <div className={`h-3 w-16 rounded ${KUAT}`} />
                <div className={`h-3 w-3 rounded ${REDUP}`} />
                <div className={`h-5 w-20 rounded-lg ${KUAT}`} />
            </div>

            {/* Category + badges */}
            <div className="flex items-center gap-3 mb-5">
                <div className={`h-6 w-24 rounded-lg ${KUAT}`} />
                <div className={`h-3 w-3 rounded-full ${REDUP}`} />
                <div className={`h-3 w-20 rounded ${REDUP}`} />
            </div>

            {/* Title */}
            <div className="space-y-3 mb-6">
                <div className={`h-9 w-full rounded-lg ${KUAT}`} />
                <div className={`h-9 w-4/5 rounded-lg ${KUAT}`} />
                <div className={`h-9 w-2/3 rounded-lg ${REDUP}`} />
            </div>

            {/* Description */}
            <div className="space-y-2 mb-8 max-w-[620px]">
                <div className={`h-4 w-full rounded ${REDUP}`} />
                <div className={`h-4 w-5/6 rounded ${REDUP}`} />
            </div>

            {/* Meta row */}
            <div className={`flex gap-6 py-5 border-t border-b mb-8 ${GARIS}`}>
                <div className={`h-7 w-28 rounded-full ${REDUP}`} />
                <div className={`h-7 w-20 rounded ${REDUP}`} />
                <div className={`h-7 w-24 rounded ${REDUP}`} />
            </div>

            {/* Image */}
            <div className={`w-full aspect-[16/9] rounded-2xl mb-10 ${KUAT}`} />

            {/* Content paragraphs */}
            <div className="space-y-4 max-w-[700px]">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className={`h-4 w-full rounded ${REDUP}`} />
                        <div className={`h-4 w-full rounded ${REDUP}`} />
                        <div className={`h-4 w-4/5 rounded ${REDUP}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Panel wawasan AI */}
            <div className={`rounded-2xl border bg-white p-6 dark:bg-white/[0.03] ${GARIS}`}>
                <div className="flex items-center gap-2 mb-5">
                    <div className="h-4 w-4 rounded bg-blue-500/30" />
                    <div className={`h-4 w-24 rounded ${KUAT}`} />
                </div>

                {/* Sentimen */}
                <div className="mb-5">
                    <div className={`h-3 w-20 rounded mb-3 ${REDUP}`} />
                    <div className={`h-10 w-full rounded-xl ${REDUP}`} />
                </div>

                {/* Tingkat keyakinan */}
                <div className="mb-5">
                    <div className={`h-3 w-28 rounded mb-3 ${REDUP}`} />
                    <div className={`h-2 w-full rounded-full ${REDUP}`} />
                </div>

                {/* Ringkasan */}
                <div className="space-y-2 mb-5">
                    <div className={`h-3 w-16 rounded mb-3 ${REDUP}`} />
                    <div className={`h-3 w-full rounded ${REDUP}`} />
                    <div className={`h-3 w-5/6 rounded ${REDUP}`} />
                    <div className={`h-3 w-4/5 rounded ${REDUP}`} />
                </div>

                {/* Label dampak */}
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-7 w-20 rounded-lg ${REDUP}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
