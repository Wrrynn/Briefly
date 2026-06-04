# Setup Guide — Briefly AI News Platform

## Quick Start

```bash
npm install
npm run dev
```

## Mengaktifkan Live AI Analysis

1. Buat file `.env.local` di root project
2. Tambahkan API key Anthropic kamu:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
```

3. Dapatkan API key di: https://console.anthropic.com

Tanpa API key, halaman detail tetap berjalan normal menggunakan **data mock** — AI summary, sentiment, dan keyword sudah tersedia dari `mockNews.ts`. Begitu API key ditambahkan, setiap halaman berita akan otomatis melakukan analisis Claude secara real-time saat dibuka.

## Alur Kerja AI

1. User membuka halaman `/news/[id]`
2. Artikel ditampilkan **langsung** (tidak menunggu AI)
3. Navbar menampilkan indikator **"AI menganalisis…"** (kuning berkedip)
4. API route `/api/analyze-news` mengirim konten berita ke Claude
5. Claude mengembalikan: sentiment, confidence score, ringkasan, kata kunci, dampak
6. AI Insight Panel **diperbarui secara live** dengan animasi smooth
7. Navbar berubah ke **"Analisis AI selesai"** (hijau berkedip)

## Struktur File Baru

```
src/app/
├── api/
│   └── analyze-news/
│       └── route.ts          ← API route Claude
├── news/
│   └── [id]/
│       └── page.tsx          ← Halaman detail berita
└── components/
    └── detail/
        ├── AIInsightPanel.tsx ← Panel AI (terima isLive prop)
        ├── NewsHeader.tsx
        ├── NewsMeta.tsx
        ├── NewsContent.tsx
        ├── TagBadge.tsx
        └── LoadingSkeleton.tsx
```
