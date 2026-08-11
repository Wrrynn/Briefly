"use client";

import { useMemo, useState } from "react";

// =====================================================================
// Linimasa peliputan
// =====================================================================
// Inti nilai Briefly adalah "satu peristiwa, banyak portal" — tapi urutan
// waktunya belum pernah ditampilkan. Padahal itu yang tidak bisa dijawab satu
// portal pun sendirian: siapa memberitakan lebih dulu, siapa menyusul berapa
// lama kemudian, dan seberapa cepat sebuah peristiwa menyebar.
//
// Seluruh datanya sudah ada di tabel_berita (waktu_rilis terisi penuh). Median
// rentang liputan satu klaster 2,5 jam, terpanjang lebih dari dua hari, jadi
// selisih antar portal memang bermakna dan layak ditampilkan.
// =====================================================================

type Sumber = { portal: string; url: string; title?: string; waktu?: string | null };

const TAMPIL_AWAL = 6;

// "3 jam 20 menit" terlalu ramai untuk kolom sempit; yang dibutuhkan pembaca
// hanya rasa jaraknya.
function selisihSingkat(ms: number): string {
    const menit = Math.round(ms / 60000);
    if (menit < 1) return "bersamaan";
    if (menit < 60) return `+${menit} mnt`;
    const jam = menit / 60;
    if (jam < 24) return `+${jam < 10 ? jam.toFixed(1).replace(/\.0$/, "") : Math.round(jam)} jam`;
    const hari = jam / 24;
    return `+${hari < 10 ? hari.toFixed(1).replace(/\.0$/, "") : Math.round(hari)} hari`;
}

function jamLokal(iso: string): string {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function tanggalLokal(iso: string): string {
    return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function Linimasa({ sources }: { sources?: Sumber[] }) {
    const [semua, setSemua] = useState(false);

    const urut = useMemo(() => {
        // Sumber sudah di-dedup per URL di buildSources, tapi itu tidak cukup di
        // sini: sebagian portal menyiarkan artikel yang sama di beberapa alamat
        // (mis. ANTARA News di situs utama dan situs daerahnya), sehingga baris
        // yang identik muncul dua kali di linimasa. Dedup kedua memakai
        // portal+judul — judul yang BERBEDA dari portal yang sama tetap
        // ditampilkan, karena itu memang liputan susulan yang bernilai.
        const terlihat = new Set<string>();
        return (sources || [])
            .filter((s) => s.waktu && !Number.isNaN(new Date(s.waktu).getTime()))
            .filter((s) => {
                const kunci = `${s.portal}|${(s.title || "").trim().toLowerCase()}`;
                if (terlihat.has(kunci)) return false;
                terlihat.add(kunci);
                return true;
            })
            .map((s) => ({ ...s, ms: new Date(s.waktu as string).getTime() }))
            .sort((a, b) => a.ms - b.ms);
    }, [sources]);

    // Satu titik waktu tidak membentuk linimasa — lebih baik tidak ditampilkan
    // sama sekali daripada menampilkan garis dengan satu simpul.
    if (urut.length < 2) return null;

    const mulai = urut[0].ms;
    const rentangMs = urut[urut.length - 1].ms - mulai;
    const tampil = semua ? urut : urut.slice(0, TAMPIL_AWAL);
    const tersisa = urut.length - tampil.length;

    // Beberapa portal bisa muncul lebih dari sekali; yang menarik bagi pembaca
    // adalah berapa REDAKSI yang meliput, bukan berapa artikel.
    const jumlahPortal = new Set(urut.map((s) => s.portal)).size;

    return (
        <section className="mt-20 pt-10 border-t border-gray-200 dark:border-white/[0.07]">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">
                    Linimasa Peliputan
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-white/40">
                    {jumlahPortal} portal · rentang {selisihSingkat(rentangMs).replace(/^\+/, "")}
                </span>
            </div>

            <p className="mb-8 max-w-2xl text-sm leading-relaxed text-gray-500 dark:text-white/45">
                Urutan portal memberitakan peristiwa ini, dihitung dari yang paling awal.
                Semuanya dimulai {tanggalLokal(urut[0].waktu as string)}.
            </p>

            <ol className="relative space-y-1">
                {/* Garis vertikal penghubung. Ditarik di belakang titik-titik. */}
                <span
                    aria-hidden
                    className="absolute left-[5px] top-2 bottom-2 w-px bg-gray-200 dark:bg-white/10"
                />

                {tampil.map((s, i) => {
                    // `tampil` selalu potongan awal dari daftar yang sudah urut,
                    // jadi indeks 0 pasti liputan paling awal.
                    const pertama = i === 0;
                    return (
                        <li key={`${s.url}-${i}`} className="relative flex gap-4 pl-6">
                            {/* Titik penanda */}
                            <span
                                aria-hidden
                                className={`absolute left-0 top-[9px] h-[11px] w-[11px] rounded-full border-2 ${
                                    pertama
                                        ? "border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400"
                                        : "border-gray-300 bg-white dark:border-white/25 dark:bg-[#05051a]"
                                }`}
                            />

                            <div className="min-w-0 flex-1 py-1.5">
                                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                                    <span className="text-[11px] font-black tabular-nums text-gray-900 dark:text-white">
                                        {jamLokal(s.waktu as string)}
                                    </span>
                                    <span className="text-[11px] font-semibold text-gray-500 dark:text-white/50">
                                        {s.portal}
                                    </span>
                                    {pertama ? (
                                        <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400">
                                            Pertama
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold tabular-nums text-gray-400 dark:text-white/30">
                                            {selisihSingkat(s.ms - mulai)}
                                        </span>
                                    )}
                                </div>

                                {s.title && (
                                    <a
                                        href={s.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 block rounded text-[13px] leading-snug text-gray-700 outline-none transition-colors hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-white/70 dark:hover:text-blue-400"
                                    >
                                        {s.title}
                                    </a>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>

            {tersisa > 0 && (
                <button
                    type="button"
                    onClick={() => setSemua(true)}
                    className="mt-5 ml-6 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 outline-none transition-all hover:border-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:border-white/25 dark:hover:text-white"
                >
                    Tampilkan {tersisa} liputan lagi
                </button>
            )}
        </section>
    );
}
