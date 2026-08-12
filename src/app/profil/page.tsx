"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import NewsCard from "@/app/components/NewsCard";
import KerangkaKartu from "@/app/components/KerangkaKartu";
import LogoBriefly from "@/app/components/LogoBriefly";
import Footer from "@/app/components/Footer";
import { temaGelapAktif, terapkanTema } from "@/lib/tema";

type Identitas = {
    id: string;
    email: string | null;
    nama: string;
    avatar: string | null;
    bergabung: string | null;
    loginTerakhir: string | null;
};
type Statistik = { disimpan: number; dibaca: number; totalBuka: number; diikuti: number };
type Preferensi = {
    tema: "dark" | "light";
    rentang_hari: number;
    kategori_favorit: string | null;
    digest_harian: boolean;
};
type Aktor = {
    nama: string;
    jumlah: number;
    positif: number;
    negatif: number;
    netral: number;
    kategoriTeratas: string | null;
    diikuti?: boolean;
};

const TAB = ["Tersimpan", "Riwayat", "Aktor", "Setelan"] as const;
type Tab = (typeof TAB)[number];

function tanggalPanjang(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function waktuRelatif(iso?: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const menit = Math.floor((Date.now() - d.getTime()) / 60000);
    if (menit < 1) return "baru saja";
    if (menit < 60) return `${menit} menit lalu`;
    const jam = Math.floor(menit / 60);
    if (jam < 24) return `${jam} jam lalu`;
    return `${Math.floor(jam / 24)} hari lalu`;
}

export default function ProfilPage() {
    // Dibaca dari dokumen, bukan dari localStorage lagi — SKRIP_TEMA sudah
    // menerjemahkan preferensi tersimpan menjadi class `dark` sebelum paint.
    const [isDarkMode, setIsDarkMode] = useState(
        () => typeof document === "undefined" || temaGelapAktif(),
    );

    const [user, setUser] = useState<Identitas | null>(null);
    const [statistik, setStatistik] = useState<Statistik | null>(null);
    const [preferensi, setPreferensi] = useState<Preferensi | null>(null);
    const [perluMigrasi, setPerluMigrasi] = useState(false);
    const [memuat, setMemuat] = useState(true);

    const [tab, setTab] = useState<Tab>("Tersimpan");
    const [tersimpan, setTersimpan] = useState<any[] | null>(null);
    const [riwayat, setRiwayat] = useState<any[] | null>(null);
    const [aktorDiikuti, setAktorDiikuti] = useState<Aktor[] | null>(null);
    const [aktorPopuler, setAktorPopuler] = useState<Aktor[]>([]);
    const [pesan, setPesan] = useState<string | null>(null);

    // === TEMA ===
    // Pemasangan class `dark` sudah dilakukan SKRIP_TEMA di layout sebelum paint.
    // Yang tersisa di sini hanya sakelar di tab Setelan, yang perlu tahu keadaan
    // sekarang untuk menampilkan posisi on/off-nya.
    const gantiTema = (gelap: boolean) => {
        setIsDarkMode(gelap);
        terapkanTema(gelap);
        void simpanPreferensi({ tema: gelap ? "dark" : "light" });
    };

    // === MUAT PROFIL ===
    useEffect(() => {
        const ac = new AbortController();
        fetch("/api/profil", { cache: "no-store", signal: ac.signal })
            .then(async (r) => {
                if (r.status === 401) {
                    window.location.href = "/login?expired=1";
                    return null;
                }
                return r.json();
            })
            .then((j) => {
                if (!j) return;
                setUser(j.user ?? null);
                if (j.migrasiBelumJalan) {
                    setPerluMigrasi(true);
                    return;
                }
                setStatistik(j.statistik ?? null);
                setPreferensi(j.preferensi ?? null);
            })
            .catch((e) => {
                if (e?.name !== "AbortError") console.error("Profil:", e);
            })
            .finally(() => setMemuat(false));
        return () => ac.abort();
    }, []);

    // === MUAT ISI TAB SESUAI KEBUTUHAN ===
    //
    // `null` = belum pernah dimuat, `[]` = sudah dimuat dan memang kosong.
    // Perbedaan itu yang dipakai sebagai penjaga agar satu tab hanya diminta
    // sekali — dan dulu justru itu yang rusak, dengan dua sebab yang saling
    // mengunci:
    //
    // 1. Ketiga daftar ikut jadi DEPENDENSI, padahal effect ini sendiri yang
    //    menulisnya. Akibatnya setiap satu daftar selesai dimuat, effect
    //    dijalankan ulang dan cleanup-nya MEMBATALKAN permintaan tab lain yang
    //    masih berjalan.
    // 2. `.catch` memperlakukan pembatalan sama seperti kegagalan asli, lalu
    //    menyetel daftar menjadi `[]`. Permintaan yang dibatalkan bukan jawaban
    //    "tidak ada data", tapi state terlanjur bukan null lagi — sehingga
    //    penjaganya menutup pintu dan tab itu tidak pernah diminta lagi.
    //
    // Di mode pengembangan React sengaja menjalankan effect dua kali, jadi
    // rantainya: fetch A → batal A → fetch B → A tertangkap sebagai [] →
    // dependensi berubah → batal B → penjaga sudah bukan null → berhenti
    // selamanya. Daftar tampak kosong sampai halaman dimuat ulang, dan karena
    // ini balapan, kadang lolos — itulah kenapa gejalanya terasa acak.
    useEffect(() => {
        if (perluMigrasi) return;
        const ac = new AbortController();
        const opsi = { cache: "no-store" as const, signal: ac.signal };

        // Pembatalan bukan kegagalan: biarkan state tetap `null` supaya tab itu
        // diminta lagi saat dibuka berikutnya.
        const dibatalkan = (e: unknown) => (e as { name?: string })?.name === "AbortError";

        if (tab === "Tersimpan" && tersimpan === null) {
            fetch("/api/profil/bookmark?kartu=1", opsi)
                .then((r) => (r.ok ? r.json() : { data: [] }))
                .then((j) => setTersimpan(j.data || []))
                .catch((e) => {
                    if (!dibatalkan(e)) setTersimpan([]);
                });
        }
        if (tab === "Riwayat" && riwayat === null) {
            fetch("/api/profil/riwayat?kartu=1", opsi)
                .then((r) => (r.ok ? r.json() : { data: [] }))
                .then((j) => setRiwayat(j.data || []))
                .catch((e) => {
                    if (!dibatalkan(e)) setRiwayat([]);
                });
        }
        if (tab === "Aktor" && aktorDiikuti === null) {
            fetch("/api/profil/aktor", opsi)
                .then((r) => (r.ok ? r.json() : { diikuti: [], populer: [] }))
                .then((j) => {
                    setAktorDiikuti(j.diikuti || []);
                    setAktorPopuler(j.populer || []);
                })
                .catch((e) => {
                    if (!dibatalkan(e)) setAktorDiikuti([]);
                });
        }
        return () => ac.abort();
        // Ketiga daftar sengaja TIDAK masuk dependensi — di sini perannya
        // penjaga, bukan pemicu. Memasukkannya berarti setiap pemuatan yang
        // berhasil membatalkan permintaan tab lain yang sedang berjalan.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, perluMigrasi]);

    const simpanPreferensi = useCallback(async (patch: Partial<Preferensi>) => {
        try {
            const r = await fetch("/api/profil/preferensi", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            if (!r.ok) return;
            const j = await r.json();
            if (j.preferensi) setPreferensi(j.preferensi);
        } catch {
            /* preferensi bersifat non-kritis — abaikan kegagalan */
        }
    }, []);

    const toggleAktor = async (nama: string) => {
        try {
            const r = await fetch("/api/profil/aktor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama }),
            });
            if (!r.ok) return;
            // Muat ulang daftar agar statistik ikut menyesuaikan.
            setAktorDiikuti(null);
            const seg = await fetch("/api/profil/aktor", { cache: "no-store" });
            if (seg.ok) {
                const j = await seg.json();
                setAktorDiikuti(j.diikuti || []);
                setAktorPopuler(j.populer || []);
                setStatistik((s) => (s ? { ...s, diikuti: (j.diikuti || []).length } : s));
            }
        } catch {
            setAktorDiikuti(null);
        }
    };

    const hapusRiwayat = async () => {
        if (!confirm("Hapus seluruh riwayat baca? Tindakan ini tidak bisa dibatalkan.")) return;
        const r = await fetch("/api/profil/riwayat", { method: "DELETE" });
        if (r.ok) {
            setRiwayat([]);
            setStatistik((s) => (s ? { ...s, dibaca: 0, totalBuka: 0 } : s));
            setPesan("Riwayat baca dihapus.");
            setTimeout(() => setPesan(null), 4000);
        }
    };

    // Tanpa gerbang `if (!mounted) return null`: render pertama dari server
    // sudah menampilkan navbar dan kerangka isi, bukan halaman kosong.
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[#05051a] text-gray-900 dark:text-white transition-colors duration-500">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#05051a]/80 backdrop-blur-2xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="group flex items-center">
                        <LogoBriefly
                            prioritas
                            className="h-8 w-auto transition-transform group-hover:scale-105"
                        />
                    </Link>
                    <Link
                        href="/"
                        className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        ← Kembali ke berita
                    </Link>
                </div>
            </nav>

            {/* Sasaran tautan lompat di layout. */}
            <div
                id="isi-utama"
                tabIndex={-1}
                className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 scroll-mt-20 outline-none"
            >
                {memuat ? (
                    // Meniru susunan halaman aslinya: identitas (avatar + nama),
                    // tiga kotak statistik, lalu deretan tab. Versi lama hanya dua
                    // batang panjang yang tidak menyerupai apa pun di bawahnya.
                    <div className="animate-pulse">
                        <div className="flex flex-wrap items-center gap-5 sm:gap-6">
                            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gray-200 dark:bg-white/10" />
                            <div className="min-w-0 space-y-2.5">
                                <div className="h-6 w-48 rounded bg-gray-200 dark:bg-white/10" />
                                <div className="h-3.5 w-64 rounded bg-gray-100 dark:bg-white/5" />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-[92px] rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.04]"
                                />
                            ))}
                        </div>

                        <div className="mt-10 flex gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-4 w-24 rounded bg-gray-100 dark:bg-white/5" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* === IDENTITAS === */}
                        <header className="flex flex-wrap items-center gap-5 sm:gap-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-blue-500/20">
                                {(user?.nama || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
                                    {user?.nama || "Pengguna"}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-white/45 truncate">
                                    {user?.email || "—"}
                                </p>
                                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-white/30">
                                    Bergabung {tanggalPanjang(user?.bergabung)}
                                </p>
                            </div>
                        </header>

                        {perluMigrasi ? (
                            <div className="mt-10 rounded-3xl border-2 border-dashed border-amber-300 dark:border-amber-500/25 bg-amber-50/60 dark:bg-amber-500/[0.06] p-8">
                                <h2 className="text-base font-black text-amber-900 dark:text-amber-200">
                                    Satu langkah lagi
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/70">
                                    Tabel penyimpanan profil belum ada di database. Jalankan berkas
                                    migrasi berikut dari repositori, berurutan:
                                </p>

                                {/* Ditulis sebagai daftar berlabel "berkas", BUKAN blok kode.
                                    Versi lama menampilkan path di dalam <code> monospace —
                                    tampilannya persis perintah siap salin, dan memang pernah
                                    tersalin apa adanya ke SQL Editor lalu ditolak Postgres
                                    dengan `syntax error at or near "supabase"`. Yang harus
                                    disalin adalah ISI berkasnya, dan kalimat di bawah kini
                                    menyebutkan itu secara eksplisit. */}
                                <ol className="mt-4 space-y-1.5">
                                    {[
                                        ["0001_profil_pengguna.sql", "tabel profil"],
                                        ["0002_perbaikan_hak_metrik.sql", "penghitung dilihat"],
                                        ["0004_app_likes_dan_hak_akses.sql", "tombol suka + hak akses"],
                                        ["0005_gambar_klaster.sql", "cache gambar kartu"],
                                    ].map(([berkas, guna], i) => (
                                        <li
                                            key={berkas}
                                            className="flex flex-wrap items-baseline gap-x-2 text-[13px] text-amber-900 dark:text-amber-200"
                                        >
                                            <span className="font-black tabular-nums opacity-50">{i + 1}.</span>
                                            <span className="font-bold">
                                                supabase/migrations/{berkas}
                                            </span>
                                            <span className="text-[11px] text-amber-800/60 dark:text-amber-200/45">
                                                — {guna}
                                            </span>
                                        </li>
                                    ))}
                                </ol>

                                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/70">
                                    Buka tiap berkas di editor, salin <strong>seluruh isinya</strong>{" "}
                                    (bukan nama berkasnya), lalu tempel dan jalankan di{" "}
                                    <strong>Supabase Dashboard → SQL Editor</strong>. Semuanya aman
                                    dijalankan berulang.
                                </p>

                                <p className="mt-3 text-xs text-amber-800/70 dark:text-amber-200/50">
                                    Setelah selesai, muat ulang halaman ini. Fitur lain tetap berjalan
                                    normal tanpa migrasi ini.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* === STATISTIK === */}
                                <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                                    {[
                                        { label: "Disimpan", nilai: statistik?.disimpan ?? 0 },
                                        { label: "Dibaca", nilai: statistik?.dibaca ?? 0 },
                                        { label: "Diikuti", nilai: statistik?.diikuti ?? 0 },
                                    ].map((s) => (
                                        <div
                                            key={s.label}
                                            className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] px-4 py-5 text-center"
                                        >
                                            <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-white">
                                                {s.nilai}
                                            </p>
                                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/35">
                                                {s.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* === TAB === */}
                                <div className="mt-10 flex flex-wrap gap-2 border-b border-gray-200 dark:border-white/10">
                                    {TAB.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTab(t)}
                                            aria-selected={tab === t}
                                            role="tab"
                                            className={`relative px-4 sm:px-5 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
                                                tab === t
                                                    ? "text-gray-900 dark:text-white"
                                                    : "text-gray-400 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/70"
                                            }`}
                                        >
                                            {t}
                                            {tab === t && (
                                                <motion.span
                                                    layoutId="tab-aktif"
                                                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue-600 dark:bg-white"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {pesan && (
                                    <p className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        {pesan}
                                    </p>
                                )}

                                {/* SENGAJA tanpa AnimatePresence mode="wait": mode itu menunda
                                    pemasangan panel baru sampai animasi keluar panel lama selesai.
                                    Bila animasi tersendat (tab latar, perangkat lambat, preferensi
                                    reduce-motion), panel baru tidak pernah dipasang dan area konten
                                    tampak kosong. Dengan key={tab}, React langsung memasang ulang. */}
                                <div className="mt-8">
                                    <motion.div
                                        key={tab}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* --- TERSIMPAN --- */}
                                        {tab === "Tersimpan" &&
                                            (tersimpan === null ? (
                                                <SkeletonGrid />
                                            ) : tersimpan.length === 0 ? (
                                                <Kosong
                                                    judul="Belum ada berita tersimpan"
                                                    isi="Tekan ikon penanda di kartu berita untuk menyimpannya di sini."
                                                />
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {tersimpan.map((item: any) => (
                                                        <NewsCard key={item.id} data={item} />
                                                    ))}
                                                </div>
                                            ))}

                                        {/* --- RIWAYAT --- */}
                                        {tab === "Riwayat" &&
                                            (riwayat === null ? (
                                                <SkeletonGrid />
                                            ) : riwayat.length === 0 ? (
                                                <Kosong
                                                    judul="Riwayat masih kosong"
                                                    isi="Berita yang kamu buka akan tercatat di sini."
                                                />
                                            ) : (
                                                <>
                                                    <div className="mb-5 flex justify-end">
                                                        <button
                                                            onClick={hapusRiwayat}
                                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/35 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                        >
                                                            Hapus semua riwayat
                                                        </button>
                                                    </div>
                                                    <ul className="divide-y divide-gray-200 dark:divide-white/[0.07] rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
                                                        {riwayat.map((item: any) => (
                                                            <li key={item.id}>
                                                                <Link
                                                                    href={`/news/${item.id}`}
                                                                    className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                                                                >
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-[15px] font-bold leading-snug line-clamp-2">
                                                                            {item.title}
                                                                        </p>
                                                                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/30">
                                                                            {item.category} · dibaca {waktuRelatif(item.dibacaAt)}
                                                                            {item.jumlahBuka > 1 ? ` · ${item.jumlahBuka}×` : ""}
                                                                        </p>
                                                                    </div>
                                                                    <span className="shrink-0 pt-1 text-gray-300 dark:text-white/20">→</span>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </>
                                            ))}

                                        {/* --- AKTOR --- */}
                                        {tab === "Aktor" &&
                                            (aktorDiikuti === null ? (
                                                <SkeletonGrid />
                                            ) : (
                                                <div className="space-y-10">
                                                    <div>
                                                        <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/40">
                                                            Diikuti
                                                        </h2>
                                                        {aktorDiikuti.length === 0 ? (
                                                            <Kosong
                                                                judul="Belum mengikuti aktor"
                                                                isi="Ikuti tokoh atau lembaga untuk memantau tren sentimennya."
                                                            />
                                                        ) : (
                                                            <div className="grid gap-3 sm:grid-cols-2">
                                                                {aktorDiikuti.map((a) => (
                                                                    <KartuAktor
                                                                        key={a.nama}
                                                                        aktor={a}
                                                                        diikuti
                                                                        onToggle={() => toggleAktor(a.nama)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h2 className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-white/40">
                                                            Paling sering muncul
                                                        </h2>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {aktorPopuler.map((a) => (
                                                                <KartuAktor
                                                                    key={a.nama}
                                                                    aktor={a}
                                                                    diikuti={Boolean(a.diikuti)}
                                                                    onToggle={() => toggleAktor(a.nama)}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                        {/* --- SETELAN --- */}
                                        {tab === "Setelan" && (
                                            <div className="max-w-2xl space-y-3">
                                                <BarisSetelan
                                                    judul="Tema gelap"
                                                    keterangan="Berlaku di seluruh halaman Briefly."
                                                >
                                                    <Sakelar aktif={isDarkMode} onChange={gantiTema} />
                                                </BarisSetelan>

                                                <BarisSetelan
                                                    judul="Rentang berita default"
                                                    keterangan="Rentang yang dipakai saat kamu membuka beranda."
                                                >
                                                    <div className="inline-flex gap-1 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 p-1">
                                                        {[1, 7, 30, 0].map((n) => (
                                                            <button
                                                                key={n}
                                                                onClick={() => simpanPreferensi({ rentang_hari: n })}
                                                                aria-pressed={preferensi?.rentang_hari === n}
                                                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
                                                                    preferensi?.rentang_hari === n
                                                                        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                                                                        : "text-gray-500 dark:text-white/45"
                                                                }`}
                                                            >
                                                                {n === 0 ? "Semua" : `${n} hari`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </BarisSetelan>

                                                {/* Sakelar ini sebelumnya tampil menyala biru, padahal
                                                    pengiriman email memang belum ada — pengguna wajar
                                                    mengira ia sudah berlangganan sesuatu. Selama
                                                    fiturnya belum jalan, sakelarnya dinonaktifkan dan
                                                    diberi penanda, bukan dibiarkan tampak berfungsi. */}
                                                <BarisSetelan
                                                    judul="Ringkasan harian lewat email"
                                                    lencana="Belum tersedia"
                                                    keterangan="Akan hadir setelah pengiriman email disiapkan."
                                                >
                                                    <Sakelar
                                                        aktif={false}
                                                        nonaktif
                                                        onChange={() => {}}
                                                    />
                                                </BarisSetelan>

                                                <BarisSetelan
                                                    judul="Hapus riwayat baca"
                                                    keterangan="Menghapus seluruh catatan berita yang pernah kamu buka."
                                                >
                                                    <button
                                                        onClick={hapusRiwayat}
                                                        className="rounded-xl border border-rose-300/60 dark:border-rose-400/25 bg-rose-50 dark:bg-rose-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-rose-600 dark:text-rose-300 transition hover:bg-rose-100 dark:hover:bg-rose-500/20"
                                                    >
                                                        Hapus
                                                    </button>
                                                </BarisSetelan>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </main>
    );
}

/* ============================ SUB-KOMPONEN ============================ */

function SkeletonGrid() {
    // Memakai kerangka yang sama dengan feed. Versi lama hanya blok h-52 polos —
    // jauh lebih pendek daripada kartu sebenarnya, sehingga isi halaman melompat
    // begitu data datang.
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
                <KerangkaKartu key={i} />
            ))}
        </div>
    );
}

function Kosong({ judul, isi }: { judul: string; isi: string }) {
    return (
        <div className="rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/[0.07] py-16 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/25">
                {judul}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400 dark:text-white/25">{isi}</p>
        </div>
    );
}

function KartuAktor({
    aktor,
    diikuti,
    onToggle,
}: {
    aktor: Aktor;
    diikuti: boolean;
    onToggle: () => void;
}) {
    const total = Math.max(1, aktor.positif + aktor.negatif + aktor.netral);
    const bar = [
        { n: aktor.positif, warna: "bg-emerald-500" },
        { n: aktor.netral, warna: "bg-blue-400" },
        { n: aktor.negatif, warna: "bg-rose-500" },
    ];

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold">{aktor.nama}</p>
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-white/30">
                        {aktor.jumlah} berita
                        {aktor.kategoriTeratas ? ` · ${aktor.kategoriTeratas}` : ""}
                    </p>
                </div>
                <button
                    onClick={onToggle}
                    className={`shrink-0 rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] transition ${
                        diikuti
                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                            : "border border-gray-300 dark:border-white/15 text-gray-600 dark:text-white/55 hover:border-gray-500 dark:hover:border-white/35"
                    }`}
                >
                    {diikuti ? "Diikuti" : "Ikuti"}
                </button>
            </div>

            <div className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/5">
                {bar.map((b, i) =>
                    b.n > 0 ? (
                        <div key={i} className={b.warna} style={{ width: `${(b.n / total) * 100}%` }} />
                    ) : null,
                )}
            </div>
            <p className="mt-2 text-[10px] font-bold text-gray-400 dark:text-white/30">
                {aktor.positif} positif · {aktor.netral} netral · {aktor.negatif} negatif
            </p>
        </div>
    );
}

function BarisSetelan({
    judul,
    keterangan,
    lencana,
    children,
}: {
    judul: string;
    keterangan: string;
    /** Penanda kecil di samping judul, mis. untuk fitur yang belum berjalan. */
    lencana?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] px-5 py-4">
            <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                    {judul}
                    {lencana && (
                        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400">
                            {lencana}
                        </span>
                    )}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-white/35">{keterangan}</p>
            </div>
            {children}
        </div>
    );
}

function Sakelar({
    aktif,
    onChange,
    nonaktif = false,
}: {
    aktif: boolean;
    onChange: (v: boolean) => void;
    /** Sakelar yang fiturnya memang belum berjalan — lihat catatan di tab Setelan. */
    nonaktif?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={aktif}
            disabled={nonaktif}
            onClick={() => onChange(!aktif)}
            className={`relative h-6 w-11 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#05051a] ${
                nonaktif
                    ? "cursor-not-allowed bg-gray-200 dark:bg-white/10"
                    : aktif
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-white/15"
            }`}
        >
            {/* `left-0.5` WAJIB ada. Tanpa properti left, elemen absolut memakai
                posisi statisnya — dan `text-align: center` bawaan <button> membuat
                posisi itu jatuh di tengah track, bukan di tepi kiri. Akibatnya
                knob mulai dari 12px lalu digeser lagi, sehingga menonjol keluar
                dari track saat menyala dan berhenti di tengah saat mati. */}
            <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow transition-transform duration-200 ${
                    nonaktif ? "bg-gray-400 dark:bg-white/30" : "bg-white"
                } ${aktif ? "translate-x-5" : "translate-x-0"}`}
            />
        </button>
    );
}
