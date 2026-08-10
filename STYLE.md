# STYLE.md — Panduan Gaya Visual Briefly

Dokumen ini merekam sistem desain yang **sudah dipakai** di kode, bukan sistem ideal
yang belum ada. Setiap nilai di bawah diambil dari komponen nyata di `src/app/`.
Kalau menambah komponen baru, salin pola di sini dulu sebelum membuat pola sendiri.

Stack: Next.js App Router + Tailwind CSS v4 (`@theme inline`) + shadcn tokens +
framer-motion. Tidak ada file konfigurasi `tailwind.config`; seluruh token ada di
[globals.css](src/app/globals.css).

---

## 1. Prinsip

1. **Judul berita adalah elemen paling menonjol.** Tombol, badge, dan chip tidak
   boleh mengalahkan judul — lihat catatan di [NewsCard.tsx:51-53](src/app/components/NewsCard.tsx#L51-L53).
2. **Jujur soal data.** Label tanggal/kesegaran data mengikuti isi database, bukan
   kalimat pemanis seperti "Hari Ini" ([NewsHome.tsx:217-234](src/app/components/NewsHome.tsx#L217-L234)).
3. **Satu arti, satu bentuk.** Portal sumber memakai chip bulat; sektor terdampak
   memakai teks polos — supaya dua hal yang artinya beda tidak terlihat sama.
4. **Gelap adalah tema utama.** Mode terang wajib didukung, tapi komposisi warna
   dirancang untuk latar navy `#05051a`.
5. **Bahasa Indonesia untuk semua teks UI**, termasuk `aria-label` dan pesan galat.

---

## 2. Tema

- Default: **dark**. Disimpan di `localStorage` kunci `"theme"`, diterapkan dengan
  menambah/menghapus class `dark` pada `<html>` ([NewsHome.tsx:74-84](src/app/components/NewsHome.tsx#L74-L84)).
- Varian dark memakai `@custom-variant dark (&:is(.dark *))` — jadi selalu tulis
  pasangan `class dark:class`, bukan mengandalkan `prefers-color-scheme`.
- Halaman yang menerima tema dari luar memakai `themeClass` di root `<main>`
  ([news/[id]/page.tsx:230](src/app/news/[id]/page.tsx#L230)).
- Transisi tema: `transition-colors duration-500` pada container besar.

```tsx
<main className="min-h-screen bg-gray-50 dark:bg-[#05051a] transition-colors duration-500">
```

---

## 3. Warna

### 3.1 Permukaan (surface)

| Peran | Terang | Gelap |
| --- | --- | --- |
| Latar halaman | `bg-gray-50` | `bg-[#05051a]` |
| Kartu berita | `bg-white` | `bg-[#0c0c20]` |
| Panel analisis / kartu detail | `bg-white` | `bg-[#070716]/90` + `backdrop-blur-xl` |
| Input pencarian | `bg-white` | `bg-[#111111]` |
| Permukaan tipis (chip, pill, panel) | `bg-white` / `bg-white/60` | `bg-white/5`, `bg-white/[0.02]`, `bg-white/[0.06]` |
| Navbar sticky | `bg-white/80` + blur | `bg-[#05051a]/80` + `backdrop-blur-2xl` |

### 3.2 Garis & pemisah

| Peran | Terang | Gelap |
| --- | --- | --- |
| Border kartu | `border-gray-200` | `border-white/5` |
| Border kontrol (pill, tombol) | `border-gray-300` | `border-white/10` |
| Border kaca (glass) | — | `border-white/12` |
| Pemisah/hairline | `bg-gray-200`, `border-gray-100` | `bg-white/10`, `border-white/[0.06]` |

### 3.3 Teks

| Peran | Terang | Gelap |
| --- | --- | --- |
| Judul / teks utama | `text-gray-900` | `text-white` |
| Isi paragraf | `text-gray-600` – `text-gray-700` | `text-white/55` – `text-white/70` |
| Sekunder / meta | `text-gray-500` | `text-white/45` |
| Redup (label mikro, kaki kartu) | `text-gray-400` | `text-white/30` – `text-white/40` |

Aturan praktis di dark mode: pakai **opasitas putih**, bukan `text-gray-*`.
Skala yang dipakai: `/85 /80 /70 /60 /55 /50 /45 /40 /35 /30 /20`.

### 3.4 Aksen merek

Biru adalah satu-satunya warna merek. `blue-600` untuk mode terang, `blue-400`
untuk mode gelap; `blue-500` dipakai untuk border/glow.

```tsx
className="text-blue-600 dark:text-blue-400"
className="hover:border-blue-600 dark:hover:border-blue-500/40"
```

Aurora latar halaman auth memakai `blue-600/30`, `indigo-600/30`, `violet-600/20`
dengan `blur-[120px]` ([AuthShell.tsx](src/app/components/auth/AuthShell.tsx)).
Di luar aurora, **jangan** memperkenalkan indigo/violet sebagai warna UI.

### 3.5 Warna semantik sentimen

Ini kontrak warna produk — jangan ditukar di komponen mana pun.

| Sentimen | Warna | Terang | Gelap |
| --- | --- | --- | --- |
| Positif | emerald | `text-emerald-700 bg-emerald-50 border-emerald-200` | `text-emerald-400 bg-emerald-500/10 border-emerald-500/25` |
| Negatif | rose | `text-rose-700 bg-rose-50 border-rose-200` | `text-rose-400 bg-rose-500/10 border-rose-500/25` |
| Netral | blue | `text-blue-700 bg-blue-50 border-blue-200` | `text-blue-400 bg-blue-500/10 border-blue-500/25` |
| Campuran | amber | `text-amber-700 bg-amber-50 border-amber-200` | `text-amber-400 bg-amber-500/10 border-amber-500/25` |

Sumber kebenaran: `sentimentBadge` di [NewsCard.tsx:24-29](src/app/components/NewsCard.tsx#L24-L29).
Amber juga dipakai untuk **peringatan** (banner kesegaran data), rose untuk
**galat** — keduanya konsisten dengan makna sentimennya.

Formula: `<warna>-500/10` untuk isian gelap, `/25` untuk border gelap,
`/20` untuk border yang lebih halus, `/40` untuk shadow berwarna.

### 3.6 Token shadcn

`--background`, `--card`, `--primary`, `--muted`, `--border`, `--ring`, `--chart-1..5`
didefinisikan dalam OKLCH di [globals.css:51-118](src/app/globals.css#L51-L118) dan
dipetakan lewat `@theme inline`. Token ini dipakai komponen shadcn/radix; komponen
buatan sendiri di repo ini memakai utility Tailwind langsung. Keduanya boleh
berdampingan — jangan menulis ulang token OKLCH untuk komponen custom.

---

## 4. Tipografi

- **Sans:** Plus Jakarta Sans lewat `next/font/google`, var `--font-sans`
  ([layout.tsx:6-10](src/app/layout.tsx#L6-L10)). Diterapkan global di `html` (`@apply font-sans`).
- **Mono:** Geist Mono, var `--font-geist-mono`. Dipakai sangat jarang.
- `<html>` selalu `antialiased`.

### Skala

| Peran | Kelas |
| --- | --- |
| Hero H1 | `text-4xl sm:text-5xl md:text-6xl font-black leading-[1.08] tracking-tight` |
| Judul artikel (detail) | `text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight` |
| Judul kartu | `text-[19px] font-extrabold leading-snug line-clamp-3` |
| Judul seksi | `text-lg font-black tracking-tight` |
| Isi | `text-sm leading-relaxed` (13–15px untuk teks padat: `text-[13px]`) |
| Meta | `text-[11px]` |
| Label mikro | `text-[10px]` / `text-[9px]` |

### Pola "label mikro"

Pola paling khas Briefly: teks kecil, super tebal, huruf besar, jarak huruf lebar.

```tsx
<span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/40">
  Rentang
</span>
```

Tangga `tracking`: `0.15em` (chip/tombol) → `0.2em` (default label) →
`0.25em`/`0.3em` (heading kecil, badge hero) → `0.4em` (heading pengantar besar).
Makin lebar jaraknya, makin sedikit boleh dipakai.

Bobot: `font-black` untuk label mikro & judul, `font-bold`/`font-semibold` untuk
meta dan chip, `font-light`/`font-normal` hanya di `.prose-custom`.

### Isi artikel

Kelas utilitas `.prose-custom` ([globals.css:135-149](src/app/globals.css#L135-L149))
memberi paragraf 15px/1.85 dan menonjolkan paragraf pertama. Catatan: nilainya
di-hardcode `rgba(255,255,255,…)` sehingga hanya benar di mode gelap — perbaiki di
sana kalau butuh mode terang, jangan menimpanya per komponen.

---

## 5. Layout & jarak

- Lebar konten: `max-w-7xl mx-auto`; formulir/kartu auth `max-w-md`; paragraf
  penjelas `max-w-2xl`.
- Padding horizontal: `px-4` (konten daftar), `px-5 sm:px-8 lg:px-16` (navbar/hero).
- Grid kartu: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` dengan `gap-10`
  (trending memakai `md:grid-cols-3 gap-8`).
- Padding internal: kartu `p-6`, panel besar `p-6 md:p-8`, panel filter `p-6`,
  kartu kaca `p-8`.
- Ritme vertikal seksi: `mb-8` → `mb-10` antar blok, `mt-20 pt-10` + border-top
  untuk seksi besar di halaman detail.
- Breakpoint yang benar-benar dipakai: `sm`, `md`, `lg`. Mobile-first — tulis nilai
  kecil dulu, lalu naikkan.

---

## 6. Radius

`--radius: 0.625rem`, dengan tangga turunan di `@theme inline`. Dalam praktik:

| Bentuk | Kelas |
| --- | --- |
| Pill, chip, tombol bulat, avatar | `rounded-full` (paling sering) |
| Tombol utama, badge sedang | `rounded-xl` |
| Kartu berita, panel kecil | `rounded-2xl` |
| Panel besar, kartu kaca, chart | `rounded-3xl` |
| Kotak pencarian, empty state | `rounded-[2.5rem]` |
| Badge kecil | `rounded-md` / `rounded-lg` |

---

## 7. Bayangan, kaca, dan kedalaman

Mode terang memakai bayangan abu; mode gelap **tidak** memakai bayangan hitam —
kedalaman dibuat lewat border tipis, blur, dan glow biru.

```tsx
// Kartu
className="shadow-lg shadow-gray-100/60 dark:shadow-none hover:shadow-2xl"

// Kartu kaca (auth, chart)
className="rounded-3xl border border-white/12 bg-white/[0.06] p-8
           shadow-[0_20px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-2xl ring-1 ring-white/5"

// Glow biru saat hover
className="dark:hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
```

Tangga blur: `backdrop-blur-sm` (panel filter) → `backdrop-blur-xl` (panel detail)
→ `backdrop-blur-2xl` (navbar, kaca).

---

## 8. Katalog komponen

### Badge kategori (kartu)
```tsx
<span className="bg-gray-900 dark:bg-white text-white dark:text-black font-black
                 text-[10px] px-3 py-1.5 rounded-md uppercase tracking-[0.2em]">
```

### Badge sentimen
```tsx
<span className={`text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1
                  rounded-md border ${sentimentBadge[sentiment]}`}>
```

### Chip portal (netral, informatif)
```tsx
<span className="truncate rounded-full bg-gray-100 dark:bg-white/[0.07] px-2.5 py-1
                 text-[11px] font-semibold text-gray-600 dark:text-white/60">
```

### Tombol utama (inversi)
Warna kebalikan latar: hitam di terang, putih di gelap.
```tsx
<button className="rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900
                   px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em]
                   transition hover:opacity-90 disabled:opacity-50">
```
Kartu berita **tidak** memakai tombol ini — seluruh kartu sudah jadi target klik,
dan tombol besar di dalamnya justru mengalahkan judul berita.

### Tombol sekunder / pagination
```tsx
<button className="px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em]
                   border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5
                   text-gray-700 dark:text-white/70
                   hover:border-blue-600 dark:hover:border-blue-500
                   hover:text-blue-600 dark:hover:text-blue-400
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300">
```

### Kelompok pill (segmented)
Wadah `rounded-full` berbingkai, isi tombol `rounded-full`; yang aktif memakai
inversi + `shadow`, yang pasif hanya teks.
```tsx
<div className="inline-flex p-1 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5">
  <button aria-pressed={aktif}
    className={aktif
      ? "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow"
      : "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white"} />
</div>
```

### Kartu berita
Seluruh kartu satu target klik: `<Link className="absolute inset-0 z-10">` di dalam
`<article className="group relative">`. Kontrol interaktif di dalamnya harus `z-20`.
```tsx
className="group relative flex flex-col bg-white dark:bg-[#0c0c20]
           border border-gray-200 dark:border-white/5 rounded-2xl
           transition-all duration-300 hover:border-blue-600 dark:hover:border-blue-500/40
           hover:shadow-2xl hover:-translate-y-1"
```

### Skeleton
Struktur mengikuti bentuk konten aslinya (bukan kotak generik):
`animate-pulse`, blok `bg-gray-200 dark:bg-white/10` untuk elemen kuat dan
`bg-gray-100 dark:bg-white/5` untuk elemen redup.

### Empty state
```tsx
<div className="col-span-full text-center py-20 rounded-[2.5rem]
                border-2 border-dashed border-gray-200 dark:border-white/5">
```
Selalu: judul huruf besar + kalimat penjelas spesifik + (bila ada) satu jalan keluar.

### Error state
Sama seperti empty state, tapi bertema rose (`border-rose-200 dark:border-rose-500/20`,
`bg-rose-50/50 dark:bg-rose-500/5`) dan **wajib** menyertakan tombol "Coba lagi".
Bedakan galat jaringan dari hasil kosong.

### Banner peringatan
```tsx
<div className="rounded-2xl border border-amber-200 dark:border-amber-500/20
                bg-amber-50/70 dark:bg-amber-500/[0.07] px-5 py-3.5">
  <span className="flex h-2 w-2 shrink-0 rounded-full bg-amber-500" />
```

### Header sticky
Semua halaman memakai pola sama: `sticky top-0 z-50` + `border-b` + latar
semi-transparan + `backdrop-blur-2xl`, tinggi baris `h-16`, isi `max-w-7xl mx-auto`.
Beranda memakai [SiteHeader.tsx](src/app/components/SiteHeader.tsx) yang juga memuat
kotak pencarian.

Dua jebakan yang sudah pernah kena:
- Elemen `sticky` hanya menempel selama **induknya** terlihat. Header harus jadi
  anak langsung container setinggi halaman — bukan diletakkan di dalam hero.
- Target `scrollIntoView` wajib diberi `scroll-mt-24`, kalau tidak judulnya
  tertutup header.

### Kartu kaca + Aurora
Hanya untuk halaman auth dan panel statistik. Pakai `Aurora`, `GlassCard` dari
[AuthShell.tsx](src/app/components/auth/AuthShell.tsx) — jangan menyalin ulang blob-nya.

---

## 9. Gerak

- Transisi standar: `transition-all duration-300`; perubahan tema `duration-500`.
- Hover kartu: `hover:-translate-y-1`; hover kontrol: `hover:-translate-y-0.5`.
- Tekan: `active:scale-95` (ikon kecil `active:scale-90`).
- Masuk halaman (framer-motion): `initial={{ opacity: 0, y: 20 }}` →
  `animate={{ opacity: 1, y: 0 }}`, delay bertahap `0.2` untuk blok kedua.
- Buka/tutup panel: `AnimatePresence` + animasi `height: 0 → "auto"` dengan
  `duration: 0.3, ease: "easeInOut"` dan `overflow-hidden`.
- Indikator "live": titik `bg-emerald-400` + lapisan `animate-ping`.
- `scroll-behavior: smooth` sudah global; navigasi internal memakai
  `scrollIntoView({ behavior: "smooth" })`.

Jangan menganimasikan warna dan posisi lebih dari 300ms di elemen yang sering
diklik — terasa lamban.

---

## 10. Aksesibilitas

- Fokus: cincin global `outline-ring/50` (base layer). Untuk overlay link kartu
  pakai `focus-visible:ring-2 focus-visible:ring-blue-500`. Jangan `outline-none`
  tanpa mengganti dengan indikator lain.
- Tombol toggle wajib `aria-pressed`; panel yang bisa dibuka wajib `aria-expanded`.
- Tombol berisi ikon saja wajib `aria-label` berbahasa Indonesia
  (mis. `aria-label="Bersihkan pencarian"`).
- Elemen dekoratif (aurora, grid) diberi `aria-hidden`.
- SVG data diberi `role="img"` + `aria-label`.
- Target klik minimal ±40px: `p-2.5` untuk ikon, `py-2.5`–`py-3.5` untuk tombol.
- Hindari `text-white/30` untuk informasi yang penting — kontrasnya di bawah ambang.

---

## 11. Format & bahasa

- Angka: `Number(n).toLocaleString("id-ID")`.
- Tanggal: `toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })`.
- Waktu relatif hanya untuk berita < 1 hari; selebihnya tampilkan tanggal asli
  ([NewsCard.tsx:33-36](src/app/components/NewsCard.tsx#L33-L36)).
- Pemisah antar item inline: ` · `.
- Panah ajakan: `→` di akhir label tombol ("Analisis Lengkap →").
- `lang="id"` di `<html>`; seluruh salinan UI dan komentar kode berbahasa Indonesia.

---

## 12. Daftar periksa sebelum merge

- [ ] Setiap warna punya pasangan `dark:`-nya.
- [ ] Dark mode memakai opasitas putih, bukan `text-gray-*`/`bg-gray-*`.
- [ ] Warna sentimen sesuai tabel §3.5 — tidak ada palet baru.
- [ ] Radius, tracking, dan ukuran teks diambil dari tangga yang ada.
- [ ] Ada state loading (skeleton), kosong, dan galat + "Coba lagi".
- [ ] Tombol ikon punya `aria-label`; toggle punya `aria-pressed`.
- [ ] Kontrol di dalam kartu berada di `z-20` agar tidak tertutup overlay link.
- [ ] Angka dan tanggal diformat `id-ID`.
- [ ] Tidak ada bayangan hitam pekat di mode gelap.
