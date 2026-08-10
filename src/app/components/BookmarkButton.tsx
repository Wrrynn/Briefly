"use client";

import { useEffect, useState } from "react";

// Status bookmark dipakai banyak kartu sekaligus. Daripada tiap kartu memanggil
// API sendiri, daftar id disimpan sekali di level modul dan komponen berlangganan
// perubahannya — satu request untuk seluruh halaman.
let idsTersimpan: Set<number> | null = null;
let inflight: Promise<Set<number>> | null = null;
let migrasiBelumJalan = false;
const pendengar = new Set<() => void>();

function beritahu() {
  pendengar.forEach((f) => f());
}

async function muatIds(): Promise<Set<number>> {
  if (idsTersimpan) return idsTersimpan;
  if (inflight) return inflight;

  inflight = fetch("/api/profil/bookmark", { cache: "no-store" })
    .then(async (r) => {
      if (r.status === 503) {
        // Tabel profil belum dibuat — sembunyikan fitur, jangan tampilkan error.
        migrasiBelumJalan = true;
        return new Set<number>();
      }
      if (!r.ok) return new Set<number>();
      const j = await r.json();
      return new Set<number>((j.ids || []).map(Number));
    })
    .catch(() => new Set<number>())
    .then((s) => {
      idsTersimpan = s;
      beritahu();
      return s;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Dipanggil halaman profil setelah menghapus bookmark agar kartu ikut sinkron. */
export function segarkanBookmark() {
  idsTersimpan = null;
  void muatIds();
}

export default function BookmarkButton({
  id,
  ukuran = "kecil",
}: {
  id: number;
  ukuran?: "kecil" | "besar";
}) {
  const [tersimpan, setTersimpan] = useState(false);
  const [siap, setSiap] = useState(false);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    let aktif = true;
    const sinkron = () => {
      if (!aktif) return;
      setTersimpan(Boolean(idsTersimpan?.has(id)));
      setSiap(idsTersimpan !== null && !migrasiBelumJalan);
    };
    pendengar.add(sinkron);
    void muatIds().then(sinkron);
    return () => {
      aktif = false;
      pendengar.delete(sinkron);
    };
  }, [id]);

  // Sembunyikan tombol sampai status diketahui, dan sepenuhnya bila tabel profil
  // belum ada — lebih baik absen daripada tombol yang selalu gagal.
  if (!siap) return null;

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sibuk) return;
    setSibuk(true);

    // Optimistis: balikkan tampilan dulu, koreksi bila server menolak.
    const sebelum = tersimpan;
    setTersimpan(!sebelum);
    try {
      const r = await fetch("/api/profil/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw new Error();
      const j = await r.json();
      if (idsTersimpan) {
        if (j.tersimpan) idsTersimpan.add(id);
        else idsTersimpan.delete(id);
        beritahu();
      }
      setTersimpan(Boolean(j.tersimpan));
    } catch {
      setTersimpan(sebelum);
    } finally {
      setSibuk(false);
    }
  };

  const px = ukuran === "besar" ? "w-5 h-5" : "w-4 h-4";

  return (
    <button
      onClick={toggle}
      aria-pressed={tersimpan}
      aria-label={tersimpan ? "Hapus dari tersimpan" : "Simpan berita"}
      title={tersimpan ? "Hapus dari tersimpan" : "Simpan berita"}
      className={`shrink-0 rounded-lg p-1.5 transition-all active:scale-90 ${
        tersimpan
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-300 hover:text-gray-500 dark:text-white/25 dark:hover:text-white/60"
      }`}
    >
      <svg
        className={px}
        viewBox="0 0 24 24"
        fill={tersimpan ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5A1.5 1.5 0 016.5 3h11A1.5 1.5 0 0119 4.5V21l-7-4.5L5 21V4.5z" />
      </svg>
    </button>
  );
}
