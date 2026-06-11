# Setup Guide — Briefly AI News Platform

## Quick Start

```bash
npm install
npm run dev
```

## Mengaktifkan Live AI Analysis

1. Buat file `.env.local` di root project

## Alur Kerja AI

1. User membuka halaman `/news/[id]`
2. Artikel ditampilkan **langsung** (tidak menunggu AI)
3. Navbar menampilkan indikator **"AI menganalisis…"** (kuning berkedip)
4. API route `/api/analyze-news` mengirim konten berita ke Claude
5. AI agent mengembalikan: sentiment, confidence score, ringkasan, kata kunci, dampak
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
