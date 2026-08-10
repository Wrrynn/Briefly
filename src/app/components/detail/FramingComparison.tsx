"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type SudutPortal = { portal: string; judul: string[]; penekanan: string[]; jumlah: number };
type Analisis = {
    bisaDibandingkan: boolean;
    jumlahPortal: number;
    portal: SudutPortal[];
    kataBersama: string[];
    alasan?: string;
};
type Sintesis = {
    ringkasan: string;
    perbedaan: { portal: string; sudut: string }[];
    catatan: string;
};

// Membandingkan judul yang dipakai tiap portal untuk PERISTIWA YANG SAMA.
// Bagian deterministik selalu tampil (murni dari data); sintesis AI opsional.
export default function FramingComparison({ newsId }: { newsId: string | number }) {
    const [analisis, setAnalisis] = useState<Analisis | null>(null);
    const [aiTersedia, setAiTersedia] = useState(false);
    const [sintesis, setSintesis] = useState<Sintesis | null>(null);
    const [memuat, setMemuat] = useState(true);
    const [memuatAI, setMemuatAI] = useState(false);
    const [galat, setGalat] = useState<string | null>(null);

    useEffect(() => {
        const ac = new AbortController();
        fetch(`/api/framing/${newsId}`, { cache: "no-store", signal: ac.signal })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
                if (!j) return;
                setAnalisis(j.analisis);
                setAiTersedia(Boolean(j.aiTersedia));
                if (j.sintesis) setSintesis(j.sintesis);
            })
            .catch((e) => {
                if (e?.name !== "AbortError") console.error("Framing:", e);
            })
            .finally(() => setMemuat(false));
        return () => ac.abort();
    }, [newsId]);

    const mintaSintesis = async () => {
        setMemuatAI(true);
        setGalat(null);
        try {
            const r = await fetch(`/api/framing/${newsId}`, { method: "POST" });
            const j = await r.json();
            if (!r.ok) throw new Error(j?.error || "Gagal membuat sintesis.");
            setSintesis(j.sintesis);
        } catch (e: any) {
            setGalat(e?.message || "Gagal membuat sintesis.");
        } finally {
            setMemuatAI(false);
        }
    };

    if (memuat) {
        return (
            <div className="mt-20 pt-10 border-t border-gray-200 dark:border-white/[0.07]">
                <div className="h-5 w-56 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!analisis) return null;

    return (
        <section className="mt-20 pt-10 border-t border-gray-200 dark:border-white/[0.07]">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                    Perbandingan Antar Portal
                </h2>
                {analisis.bisaDibandingkan && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-white/40">
                        {analisis.jumlahPortal} portal meliput ini
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500 dark:text-white/45 mb-8 max-w-2xl leading-relaxed">
                Peristiwa yang sama, judul yang berbeda. Kata di bawah diambil langsung dari
                judul asli tiap portal — bukan tafsiran.
            </p>

            {!analisis.bisaDibandingkan ? (
                <p className="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 px-6 py-8 text-center text-sm text-gray-400 dark:text-white/35">
                    {analisis.alasan}
                </p>
            ) : (
                <>
                    {analisis.kataBersama.length > 0 && (
                        <div className="mb-8 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/40">
                                Disebut semua portal:
                            </span>
                            {analisis.kataBersama.map((w) => (
                                <span
                                    key={w}
                                    className="rounded-md bg-gray-100 dark:bg-white/5 px-2 py-1 text-[11px] font-bold text-gray-600 dark:text-white/60"
                                >
                                    {w}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        {analisis.portal.map((p) => (
                            <div
                                key={p.portal}
                                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5"
                            >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-900 dark:text-white">
                                        {p.portal}
                                    </span>
                                    {p.jumlah > 1 && (
                                        <span className="text-[10px] font-bold text-gray-400 dark:text-white/30">
                                            {p.jumlah} artikel
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-1.5 mb-4">
                                    {p.judul.slice(0, 3).map((j, i) => (
                                        <li
                                            key={i}
                                            className="text-[13px] leading-snug text-gray-700 dark:text-white/70"
                                        >
                                            “{j}”
                                        </li>
                                    ))}
                                </ul>

                                {p.penekanan.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 self-center mr-1">
                                            Khas
                                        </span>
                                        {p.penekanan.map((w) => (
                                            <span
                                                key={w}
                                                className="rounded-md border border-blue-200 dark:border-blue-500/25 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300"
                                            >
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-gray-400 dark:text-white/30">
                                        Tidak ada kata yang khas portal ini.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Sintesis AI — opsional, di atas data yang sama */}
                    <div className="mt-8">
                        <AnimatePresence mode="wait">
                            {sintesis ? (
                                <motion.div
                                    key="sintesis"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/60 dark:bg-blue-500/[0.06] p-6"
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-3">
                                        Sintesis AI
                                    </p>
                                    <p className="text-sm leading-relaxed text-gray-800 dark:text-white/80">
                                        {sintesis.ringkasan}
                                    </p>
                                    {sintesis.perbedaan?.length > 0 && (
                                        <ul className="mt-4 space-y-2">
                                            {sintesis.perbedaan.map((d, i) => (
                                                <li key={i} className="text-sm text-gray-700 dark:text-white/70">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {d.portal}:
                                                    </span>{" "}
                                                    {d.sudut}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {sintesis.catatan && (
                                        <p className="mt-4 text-xs italic text-gray-500 dark:text-white/40">
                                            {sintesis.catatan}
                                        </p>
                                    )}
                                </motion.div>
                            ) : aiTersedia ? (
                                <motion.div key="tombol" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <button
                                        onClick={mintaSintesis}
                                        disabled={memuatAI}
                                        className="rounded-xl bg-gray-900 dark:bg-white px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white dark:text-gray-900 transition hover:opacity-90 disabled:opacity-50"
                                    >
                                        {memuatAI ? "Menganalisis…" : "Rangkum perbedaannya dengan AI"}
                                    </button>
                                    {galat && (
                                        <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">{galat}</p>
                                    )}
                                </motion.div>
                            ) : (
                                <p key="nokey" className="text-xs text-gray-400 dark:text-white/30">
                                    Sintesis AI nonaktif — isi <code>ANTHROPIC_API_KEY</code> di{" "}
                                    <code>.env</code> untuk mengaktifkannya.
                                </p>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </section>
    );
}
