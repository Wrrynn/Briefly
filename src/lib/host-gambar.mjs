// =====================================================================
// Daftar host gambar yang boleh dioptimasi Next.js
// =====================================================================
// SUMBER KEBENARAN TUNGGAL. Diimpor oleh tiga tempat:
//   * next.config.mjs / next.config.ts  → membangun images.remotePatterns
//   * src/app/components/NewsCard.tsx   → memilih <Image> atau <img>
//
// Sengaja berkas .mjs, bukan .ts: berkas konfigurasi Next dimuat di luar
// pipeline TypeScript aplikasi, jadi hanya ESM polos yang bisa dibaca ketiganya
// tanpa menduplikasi daftarnya.
//
// ---------------------------------------------------------------------
// KENAPA DAFTAR, BUKAN WILDCARD "**"
// ---------------------------------------------------------------------
// Mengizinkan hostname "**" akan membuat /_next/image menjadi proxy gambar
// terbuka: siapa pun bisa memanggil /_next/image?url=<alamat apa pun> dan
// server kita yang mengunduhkannya. Daftar ini membatasi hal itu ke CDN portal
// berita yang memang muncul di data kita.
//
// ---------------------------------------------------------------------
// ASAL DAFTAR INI
// ---------------------------------------------------------------------
// Hasil pengukuran atas 167 artikel contoh (mencakup seluruh host artikel yang
// ada di tabel_berita), 151 di antaranya punya og:image. Host gambar yang
// muncul, beserta frekuensinya:
//
//     44  img.antaranews.com                     4  statik.tempo.co
//     40  asset.kompas.com                       4  cdn0-production-images-kly.akamaized.net
//     28  akcdn.detik.net.id                     4  cdn1-production-images-kly.akamaized.net
//     17  static.republika.co.id                 2  assets-studiohub.kompas.com
//      4  media.suara.com                        2  cdnv.detik.com
//      1  images-tm.tempo.co                     1  video.antaranews.com
//
// Portal di luar daftar ini TIDAK kehilangan gambarnya — NewsCard jatuh ke
// <img> biasa (tampil, tapi tanpa optimasi). Jadi daftar yang tertinggal
// zaman berarti kehilangan penghematan, bukan gambar yang rusak.
// =====================================================================

/**
 * Domain induk CDN gambar. Subdomain apa pun di bawahnya ikut diizinkan —
 * itu penting karena portal memakai banyak subdomain (img./asset./statik./
 * cdn0-…), dan Antara punya subdomain daerah yang jumlahnya puluhan.
 *
 * @type {readonly string[]}
 */
export const DOMAIN_GAMBAR = [
    "antaranews.com",
    "kompas.com",
    "detik.net.id", // akcdn/awsimages — dipakai detik, CNN Indonesia, CNBC Indonesia
    "detik.com",
    "republika.co.id",
    "suara.com",
    "tempo.co",
    // CDN bersama Akamai yang dipakai grup KLY (Liputan6, Merdeka, Fimela).
    // Lebih luas dari yang lain karena satu CDN melayani banyak pelanggan —
    // tetap jauh lebih sempit daripada mengizinkan seluruh internet.
    "akamaized.net",
];

/**
 * Apakah URL gambar boleh dilewatkan ke pengoptimal Next.js.
 * Cocok bila host sama persis dengan domain, atau merupakan subdomainnya.
 *
 * @param {string | null | undefined} url
 * @returns {boolean}
 */
export function bolehDioptimasi(url) {
    if (!url) return false;
    let host;
    try {
        host = new URL(url).hostname.toLowerCase();
    } catch {
        return false;
    }
    return DOMAIN_GAMBAR.some((d) => host === d || host.endsWith(`.${d}`));
}
