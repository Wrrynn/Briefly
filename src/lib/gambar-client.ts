"use client";

// Pengambil gambar kartu di sisi klien, dengan penggabungan permintaan.
//
// NewsCard dipakai di tiga tempat (feed, trending, halaman profil) dan tiap
// kartu hanya tahu id-nya sendiri. Kalau tiap kartu memanggil API sendiri-
// sendiri, satu halaman feed berarti 12 permintaan sekaligus. Modul ini
// menampung permintaan yang datang dalam jeda pendek lalu mengirimnya sebagai
// SATU permintaan — jadi kartu tetap mandiri (tanpa prop drilling dari
// halaman), tapi jaringannya tetap hemat.

const JEDA_MS = 60;
const MAKS_PER_BATCH = 24; // harus sejalan dengan MAKS_ID di /api/gambar

const hasil = new Map<number, string | null>();
const menunggu = new Map<number, ((url: string | null) => void)[]>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function kirimBatch() {
    timer = null;

    const ids = [...menunggu.keys()].slice(0, MAKS_PER_BATCH);
    if (!ids.length) return;

    const penerima = new Map<number, ((url: string | null) => void)[]>();
    for (const id of ids) {
        penerima.set(id, menunggu.get(id) || []);
        menunggu.delete(id);
    }

    let peta: Record<string, string | null> = {};
    try {
        const res = await fetch(`/api/gambar?ids=${ids.join(",")}`, { cache: "no-store" });
        if (res.ok) peta = (await res.json())?.gambar || {};
    } catch {
        // Diamkan: kartu tampil dengan placeholder, bukan pesan galat.
    }

    for (const id of ids) {
        const kunci = String(id);
        // Server hanya menyertakan id yang benar-benar selesai diproses. Id yang
        // TIDAK ada di respons berarti server kehabisan anggaran waktu — itu
        // bukan jawaban "tidak ada gambar", jadi jangan disimpan ke cache;
        // biarkan dicoba lagi saat kartu dirender berikutnya.
        const terjawab = Object.prototype.hasOwnProperty.call(peta, kunci);
        const url = terjawab ? peta[kunci] : null;
        if (terjawab) hasil.set(id, url);
        penerima.get(id)?.forEach((selesai) => selesai(url));
    }

    // Sisa antrean bila lebih dari satu batch.
    if (menunggu.size && !timer) timer = setTimeout(kirimBatch, JEDA_MS);
}

/**
 * URL gambar untuk satu klaster. `null` = tidak ada gambar (sudah dicoba).
 * Hasil disimpan selama halaman hidup, jadi pindah halaman lalu kembali tidak
 * memicu permintaan ulang.
 */
export function ambilGambar(id: number): Promise<string | null> {
    if (hasil.has(id)) return Promise.resolve(hasil.get(id) ?? null);

    return new Promise((resolve) => {
        const daftar = menunggu.get(id) || [];
        daftar.push(resolve);
        menunggu.set(id, daftar);
        if (!timer) timer = setTimeout(kirimBatch, JEDA_MS);
    });
}
