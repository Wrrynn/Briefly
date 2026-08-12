import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getClusterIndex } from "@/lib/news";

// =====================================================================
// Gambar pratinjau kartu berita
// =====================================================================
// Klaster di database tidak menyimpan gambar — yang ada hanya URL artikel
// aslinya. Modul ini mengambil <meta property="og:image"> dari halaman sumber
// (metadata yang memang disediakan portal untuk pratinjau saat dibagikan),
// lalu MENYIMPAN hasilnya supaya satu artikel hanya pernah diambil sekali.
//
// Tanpa cache, satu halaman feed (12 kartu) berarti 12 permintaan keluar ke
// portal berita SETIAP kali halaman dibuka — lambat untuk pengguna dan tidak
// sopan terhadap portalnya. Cache berlapis dua:
//   1. memori proses  — instan, hilang saat server restart
//   2. tabel app_gambar_klaster — bertahan lintas restart & lintas instance
//
// Bila tabelnya belum dibuat (migrasi 0005 belum dijalankan), modul tetap
// berfungsi dengan cache memori saja: gambar tetap tampil, hanya saja hasilnya
// hilang tiap restart. Kegagalan cache TIDAK PERNAH menggagalkan permintaan.
// =====================================================================

const TABEL = "app_gambar_klaster";

const UA = "BrieflyBot/1.0 (pengambil gambar pratinjau untuk ringkasan berita)";
const TIMEOUT_MS = 6_000;
const MAKS_BYTE = 256 * 1024; // og:image ada di <head>; sisanya tidak perlu diunduh
const MAKS_SUMBER_PER_KLASTER = 2; // coba portal kedua bila yang pertama gagal
const KONKURENSI = 4; // jangan menyerbu portal berita

// Anggaran waktu untuk SELURUH batch. Tanpa ini, TIMEOUT_MS hanya berlaku per
// URL: 12 klaster × 2 sumber × 6 dtk dengan konkurensi 4 bisa menahan satu
// permintaan sampai ~36 detik bila portalnya menggantung. Lewat anggaran ini,
// sisa klaster dilepas tanpa hasil — kartunya memakai placeholder dan dicoba
// lagi pada kunjungan berikutnya, jauh lebih baik daripada koneksi tertahan.
const ANGGARAN_BATCH_MS = 9_000;

// Batas atas cache memori agar tidak tumbuh tanpa henti di proses yang
// berumur panjang. Isinya hanya cache, jadi dibuang seluruhnya sudah cukup.
const MAKS_MEMORI = 5_000;

// Hasil sukses dianggap awet; kegagalan dicoba ulang setelah beberapa jam
// (portal bisa saja sedang bermasalah atau memblokir sesaat).
const TTL_SUKSES_MS = 30 * 24 * 60 * 60 * 1000;
const TTL_GAGAL_MS = 6 * 60 * 60 * 1000;

type Entri = { url: string | null; at: number };

const memori = new Map<number, Entri>();

// Cache database dinonaktifkan SEMENTARA bila tabelnya belum ada atau haknya
// belum diberikan — supaya log tidak dibanjiri galat yang sama untuk setiap
// klaster, tanpa membuat gambar berhenti tampil.
//
// Sengaja berupa tenggat, bukan sakelar sekali-mati. Versi sebelumnya memakai
// boolean permanen, dan itu terbukti menjebak: begitu migrasi 0005 dijalankan,
// proses yang sedang hidup tetap melewati cache sampai server di-restart —
// di produksi artinya sampai deploy berikutnya, padahal databasenya sudah benar.
const JEDA_COBA_LAGI_MS = 10 * 60 * 1000;
let cacheDbMatiHingga = 0;

function cacheDbAktif(): boolean {
  return Date.now() >= cacheDbMatiHingga;
}

function masihSegar(e: Entri): boolean {
  const umur = Date.now() - e.at;
  return e.url ? umur < TTL_SUKSES_MS : umur < TTL_GAGAL_MS;
}

// ---------------------------------------------------------------------
// Pengambilan HTML — hanya bagian kepala dokumen
// ---------------------------------------------------------------------
async function unduhKepala(url: string): Promise<{ html: string; finalUrl: string } | null> {
    const res = await fetch(url, {
        headers: {
            "user-agent": UA,
            accept: "text/html,application/xhtml+xml",
            "accept-language": "id-ID,id;q=0.9,en;q=0.8",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return null;
    if (!(res.headers.get("content-type") || "").includes("html")) return null;

    const reader = res.body?.getReader();
    if (!reader) return null;

    const dec = new TextDecoder();
    let html = "";
    let total = 0;

    try {
        while (total < MAKS_BYTE) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            html += dec.decode(value, { stream: true });
            // Berhenti begitu </head> lengkap — meta pratinjau pasti sudah lewat.
            if (html.includes("</head>")) break;
        }
    } finally {
        reader.cancel().catch(() => {});
    }

    return { html, finalUrl: res.url || url };
}

// ---------------------------------------------------------------------
// Ekstraksi URL gambar dari meta tag
// ---------------------------------------------------------------------
// Urutan pola = urutan prioritas. Tiap jenis meta ditulis dua arah karena
// urutan atribut berbeda antar portal (`property` lalu `content`, atau
// sebaliknya) — hanya menangani satu arah membuat sebagian portal gagal.
const POLA: RegExp[] = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
];

function bersihkanEntitas(s: string): string {
    return s
        .replace(/&amp;/g, "&")
        .replace(/&#0?38;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .trim();
}

export function cariGambarDiHtml(html: string, basisUrl: string): string | null {
    for (const pola of POLA) {
        const cocok = html.match(pola);
        if (!cocok?.[1]) continue;

        const mentah = bersihkanEntitas(cocok[1]);
        if (!mentah) continue;

        try {
            // Sebagian portal menulis path relatif atau protokol-relatif (//cdn/...).
            const abs = new URL(mentah, basisUrl);
            if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;
            return abs.toString();
        } catch {
            continue;
        }
    }
    return null;
}

async function scrapeSatu(url: string): Promise<string | null> {
    try {
        const hasil = await unduhKepala(url);
        if (!hasil) return null;
        return cariGambarDiHtml(hasil.html, hasil.finalUrl);
    } catch {
        // Timeout, DNS gagal, portal menolak bot — semuanya berakhir sama:
        // klaster ini tidak punya gambar, dan itu bukan kondisi galat.
        return null;
    }
}

// ---------------------------------------------------------------------
// Cache di database
// ---------------------------------------------------------------------
async function bacaCacheDb(ids: number[]): Promise<Map<number, Entri>> {
    const peta = new Map<number, Entri>();
    if (!cacheDbAktif() || !isSupabaseConfigured || !ids.length) return peta;

    const { data, error } = await supabase
        .from(TABEL)
        .select("id_cluster, url_gambar, diambil_at")
        .in("id_cluster", ids);

    if (error) {
        matikanCacheDb(error);
        return peta;
    }

    type BarisCache = { id_cluster: number; url_gambar: string | null; diambil_at: string };
    for (const b of (data || []) as BarisCache[]) {
        peta.set(Number(b.id_cluster), {
            url: b.url_gambar ?? null,
            at: new Date(b.diambil_at).getTime(),
        });
    }
    return peta;
}

async function tulisCacheDb(baris: { id_cluster: number; url_gambar: string | null; url_sumber: string | null }[]) {
    if (!cacheDbAktif() || !isSupabaseConfigured || !baris.length) return;

    const { error } = await supabase
        .from(TABEL)
        .upsert(
            baris.map((b) => ({ ...b, diambil_at: new Date().toISOString() })),
            { onConflict: "id_cluster" },
        );

    if (error) matikanCacheDb(error);
}

function matikanCacheDb(error: unknown) {
    const { code: kode, message } = (error || {}) as { code?: string; message?: string };
    // PGRST205 = tabel belum ada, 42501 = service-role belum diberi hak.
    if (kode === "PGRST205" || kode === "42501") {
        cacheDbMatiHingga = Date.now() + JEDA_COBA_LAGI_MS;
        console.warn(
            `[gambar] Cache database dilewati selama ${JEDA_COBA_LAGI_MS / 60000} menit (${kode}): ` +
            `jalankan migrasi 0005_gambar_klaster.sql. Gambar tetap tampil, tapi hasil scraping ` +
            `belum tersimpan. Setelah migrasi dijalankan cache aktif sendiri, tanpa restart.`,
        );
        return;
    }
    console.error("[gambar] Galat cache:", message || error);
}

// ---------------------------------------------------------------------
// Sumber URL per klaster
// ---------------------------------------------------------------------
async function sumberPerKlaster(ids: number[]): Promise<Map<number, string[]>> {
    const peta = new Map<number, string[]>();
    const perlu = new Set(ids);

    const entries = await getClusterIndex();
    for (const e of entries) {
        if (!perlu.has(e.id)) continue;
        const members = (e.raw?.tabel_berita || []) as { url_asli?: string | null }[];
        const urls = [
            ...new Set(
                members
                    .map((m) => String(m?.url_asli || "").trim())
                    .filter((u) => u.startsWith("http")),
            ),
        ].slice(0, MAKS_SUMBER_PER_KLASTER);
        if (urls.length) peta.set(e.id, urls);
    }

    return peta;
}

// Jalankan tugas dengan batas paralel — bukan Promise.all polos, supaya tidak
// membuka belasan koneksi sekaligus ke portal yang sama. Berhenti mengambil
// tugas baru begitu `batasWaktu` lewat; slot yang belum sempat dikerjakan
// dikembalikan sebagai undefined (bukan null — artinya "belum dicoba", jadi
// tidak boleh ikut tercatat sebagai kegagalan di cache).
async function petaTerbatas<T, H>(
    items: T[],
    batas: number,
    batasWaktu: number,
    kerja: (item: T) => Promise<H>,
): Promise<(H | undefined)[]> {
    const hasil: (H | undefined)[] = new Array(items.length);
    let i = 0;

    const pekerja = async () => {
        while (i < items.length && Date.now() < batasWaktu) {
            const idx = i++;
            hasil[idx] = await kerja(items[idx]);
        }
    };

    await Promise.all(Array.from({ length: Math.min(batas, items.length) }, pekerja));
    return hasil;
}

// ---------------------------------------------------------------------
// API utama modul
// ---------------------------------------------------------------------
/**
 * Kembalikan URL gambar untuk tiap id klaster. Nilai `null` berarti sudah
 * pernah dicoba dan memang tidak ada — bukan galat, dan tidak akan dicoba lagi
 * sampai TTL kegagalan lewat.
 */
export async function gambarKlaster(ids: number[]): Promise<Record<number, string | null>> {
    const unik = [...new Set(ids.filter((n) => Number.isFinite(n)))];
    const keluar: Record<number, string | null> = {};
    const belum: number[] = [];

    // Lapis 1 — memori
    for (const id of unik) {
        const e = memori.get(id);
        if (e && masihSegar(e)) keluar[id] = e.url;
        else belum.push(id);
    }
    if (!belum.length) return keluar;

    // Lapis 2 — database
    const dariDb = await bacaCacheDb(belum);
    const perluScrape: number[] = [];
    for (const id of belum) {
        const e = dariDb.get(id);
        if (e && masihSegar(e)) {
            memori.set(id, e);
            keluar[id] = e.url;
        } else {
            perluScrape.push(id);
        }
    }
    if (!perluScrape.length) return keluar;

    // Lapis 3 — ambil dari portal
    const sumber = await sumberPerKlaster(perluScrape);

    type Baris = { id_cluster: number; url_gambar: string | null; url_sumber: string | null };

    const batasWaktu = Date.now() + ANGGARAN_BATCH_MS;
    const baris = await petaTerbatas<number, Baris>(
        perluScrape,
        KONKURENSI,
        batasWaktu,
        async (id) => {
            const urls = sumber.get(id) || [];
            for (const url of urls) {
                const gambar = await scrapeSatu(url);
                if (gambar) return { id_cluster: id, url_gambar: gambar, url_sumber: url };
            }
            // Semua sumber gagal — dicatat sebagai null supaya tidak diulang terus.
            return { id_cluster: id, url_gambar: null, url_sumber: urls[0] ?? null };
        },
    );

    // Slot undefined = kehabisan anggaran waktu. Sengaja TIDAK dimasukkan ke
    // hasil maupun cache: klien akan mencobanya lagi nanti, sementara mencatat
    // null di sini akan mengunci kartu itu tanpa gambar selama 6 jam.
    const selesai = baris.filter((b): b is Baris => b !== undefined);

    if (memori.size > MAKS_MEMORI) memori.clear();

    const sekarang = Date.now();
    for (const b of selesai) {
        memori.set(b.id_cluster, { url: b.url_gambar, at: sekarang });
        keluar[b.id_cluster] = b.url_gambar;
    }

    await tulisCacheDb(selesai);

    return keluar;
}
