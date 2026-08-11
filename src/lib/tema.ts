// =====================================================================
// Tema terang/gelap — satu sumber kebenaran
// =====================================================================
// Sebelumnya tiga halaman (beranda, detail berita, profil) masing-masing
// membaca localStorage dan memasang class `dark` sendiri, dengan aturan
// default yang BERBEDA: beranda & profil selalu gelap, halaman detail ikut
// preferensi sistem. Akibatnya pengguna ber-OS terang melihat beranda gelap
// lalu berubah terang begitu membuka satu berita.
//
// Sekarang: satu aturan, dan diterapkan SEBELUM paint pertama lewat SKRIP_TEMA
// di <head>. Komponen React tidak lagi perlu menunggu mount untuk tahu tema —
// itu yang dulu menyebabkan kedip terang→gelap di setiap muat halaman.
// =====================================================================

export const KUNCI_TEMA = "theme";

/**
 * Skrip yang disisipkan di <head> dan dieksekusi sinkron sebelum browser
 * menggambar apa pun. Ditulis sebagai string karena harus berjalan mendahului
 * seluruh bundel React.
 *
 * Aturan: GELAP, kecuali pengguna pernah memilih terang secara eksplisit.
 * Gelap adalah tema utama Briefly (lihat STYLE.md), jadi itu yang dipakai
 * saat belum ada pilihan — bukan preferensi OS, supaya tampilannya sama di
 * semua halaman dan semua perangkat sebelum pengguna memutuskan.
 *
 * Blok try/catch penting: localStorage melempar di mode privat sebagian
 * browser, dan kegagalan di sini akan menghentikan seluruh skrip halaman.
 */
export const SKRIP_TEMA = `(function(){try{var t=localStorage.getItem("${KUNCI_TEMA}");document.documentElement.classList.toggle("dark",t!=="light")}catch(e){document.documentElement.classList.add("dark")}})();`;

/** Apakah tema gelap sedang aktif. Hanya boleh dipanggil di browser. */
export function temaGelapAktif(): boolean {
    return document.documentElement.classList.contains("dark");
}

/** Terapkan tema ke dokumen sekaligus simpan pilihannya. */
export function terapkanTema(gelap: boolean): void {
    document.documentElement.classList.toggle("dark", gelap);
    try {
        localStorage.setItem(KUNCI_TEMA, gelap ? "dark" : "light");
    } catch {
        // Mode privat: tema tetap berlaku untuk sesi ini, hanya tidak tersimpan.
    }
}
