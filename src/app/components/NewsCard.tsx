"use client";

import Link from "next/link";
import BookmarkButton from "@/app/components/BookmarkButton";
import GambarBerita from "@/app/components/GambarBerita";
import IkonMata from "@/app/components/IkonMata";

// Sentimen kartu mewakili gabungan sentimen semua aktor:
// - semua Positif  -> "Positif"
// - semua Negatif  -> "Negatif"
// - ada Positif & Negatif -> "Campuran"
function getCardSentiment(
  sentiments: any[],
): "Positif" | "Negatif" | "Netral" | "Campuran" | null {
  if (!sentiments?.length) return null;
  const types = new Set(sentiments.map((s: any) => s.type));
  const hasPositif = types.has("Positif");
  const hasNegatif = types.has("Negatif");
  if (hasPositif && hasNegatif) return "Campuran";
  if (hasPositif) return "Positif";
  if (hasNegatif) return "Negatif";
  return "Netral";
}

const sentimentBadge: Record<string, string> = {
  Positif: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/25",
  Negatif: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/25",
  Netral: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/25",
  Campuran: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/25",
};

// "31 hari lalu" tidak memberi informasi apa pun. Begitu berita berumur lebih
// dari sehari, tanggal sebenarnya jauh lebih berguna.
function labelWaktu(data: any): string {
  const relatif = String(data.time || "");
  return /hari lalu/.test(relatif) ? data.publishedAt || relatif : relatif;
}

const MAKS_PORTAL = 2; // dijaga tetap satu baris agar tinggi kartu rata

// `besar` dipakai untuk sorotan utama di daftar trending. Sengaja berupa varian
// dari kartu yang sama, bukan komponen terpisah: isinya identik dan hanya
// ukurannya yang berbeda, jadi dua salinan hanya akan saling ketinggalan zaman
// setiap kali kartunya diubah.
export default function NewsCard({ data, besar = false }: any) {
  const idKlaster = data.id == null ? null : Number(data.id);
  const sentiment = getCardSentiment(data.sentiments);
  const portals: string[] = data.portals || [];
  const sisaPortal = (data.portalCount || portals.length) - MAKS_PORTAL;
  const sektor: string[] = (data.sektorPredictions || [])
    .slice(0, 3)
    .map((s: any) => s.nama_sektor)
    .filter(Boolean);

  return (
    <article className="group relative flex flex-col bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/5 rounded-2xl transition-all duration-300 hover:border-blue-600 dark:hover:border-blue-500/40 hover:shadow-2xl hover:-translate-y-1 shadow-lg shadow-gray-100/60 dark:shadow-none">
      {/* Seluruh kartu adalah satu target klik — tanpa tombol terpisah di bawah.
          Tombol itu justru jadi elemen paling mencolok di kartu dan mengalahkan
          judul beritanya sendiri, padahal tujuannya sama dengan klik kartu. */}
      <Link
        href={`/news/${data.id}`}
        aria-label={data.title}
        className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />

      {/* Lebar tayang berbeda antar varian, jadi `sizes` ikut berbeda — kalau
          disamakan, kartu sorotan akan meminta gambar yang terlalu kecil lalu
          tampak buram saat diperbesar. */}
      <GambarBerita
        idKlaster={idKlaster}
        sizes={
          besar
            ? "(max-width: 1024px) 100vw, 760px"
            : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
        }
        className="aspect-[16/9] w-full rounded-t-2xl"
        priority={besar}
      />

      <div className={`flex flex-col flex-1 ${besar ? "p-6 sm:p-8" : "p-6"}`}>
        {/* Kategori + sentimen + simpan */}
        <div className="flex justify-between items-center gap-2 mb-3">
          <span className="bg-gray-900 dark:bg-white text-white dark:text-black font-black text-[10px] px-3 py-1.5 rounded-md uppercase tracking-[0.2em]">
            {data.category}
          </span>
          <div className="flex items-center gap-1">
            {sentiment && (
              <span className={`text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-md border ${sentimentBadge[sentiment]}`}>
                {sentiment}
              </span>
            )}
            {data.id != null && (
              <span className="relative z-20">
                <BookmarkButton id={Number(data.id)} />
              </span>
            )}
          </div>
        </div>

        {/* JUDUL — elemen paling menonjol di kartu. */}
        <h2
          className={`font-extrabold text-gray-900 dark:text-white leading-snug mb-2.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-3 ${
            besar ? "text-2xl sm:text-[28px] sm:leading-[1.2]" : "text-[19px]"
          }`}
        >
          {data.title}
        </h2>

        {/* Ruang di kartu sorotan jauh lebih lega, jadi ringkasannya boleh
            lebih panjang — di kartu kecil tetap dua baris agar tinggi kartu
            dalam satu baris grid tetap rata. */}
        <p
          className={`text-gray-600 dark:text-white/55 mb-4 leading-relaxed ${
            besar ? "text-[15px] line-clamp-4" : "text-sm line-clamp-2"
          }`}
        >
          {data.description}
        </p>

        {/* Portal sumber — inti nilai Briefly: satu peristiwa, banyak portal.
            Dibedakan gayanya dari sektor di bawah karena artinya berbeda:
            ini SUMBER, yang di bawah DAMPAK. */}
        {portals.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 min-w-0">
            {portals.slice(0, MAKS_PORTAL).map((p) => (
              <span
                key={p}
                className="truncate rounded-full bg-gray-100 dark:bg-white/[0.07] px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:text-white/60"
              >
                {p}
              </span>
            ))}
            {sisaPortal > 0 && (
              <span className="shrink-0 text-[11px] font-semibold text-gray-400 dark:text-white/35">
                +{sisaPortal} portal
              </span>
            )}
          </div>
        )}

        {/* Sektor terdampak — teks polos, bukan chip, supaya tidak tertukar
            dengan portal di atasnya. */}
        {sektor.length > 0 && (
          <p className="mb-5 text-[11px] leading-relaxed text-gray-400 dark:text-white/35">
            <span className="font-bold">Dampak:</span> {sektor.join(" · ")}
          </p>
        )}

        {/* Baris kaki: waktu + jumlah dilihat (dengan ikon mata). */}
        <div className="mt-auto flex items-center gap-2 border-t border-gray-100 dark:border-white/[0.06] pt-4 text-[11px] text-gray-400 dark:text-white/40">
          <span className="min-w-0 truncate">{labelWaktu(data)}</span>
          {data.views > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1">
              <span className="opacity-50">·</span>
              <IkonMata className="h-3 w-3" />
              {Number(data.views).toLocaleString("id-ID")} dilihat
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
