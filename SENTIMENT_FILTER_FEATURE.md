# 🎯 Fitur Sentiment Filter

## Overview
Fitur ini memungkinkan pengguna untuk memfilter berita berdasarkan sentimen terhadap aktor utama dalam berita. Misalnya, mencari berita tentang "Jokowi" dengan sentimen "Positif" atau "Negatif".

## Cara Kerja

### 1. **User Interface**
- **Lokasi**: Filter muncul di bawah search box di HeroSection
- **Kondisi Muncul**: Hanya ketika user mengetik di search box
- **Desain**: Dua button pill dengan emoji dan warna yang berbeda:
  - 😊 **Positif** (Hijau/Emerald)
  - 😞 **Negatif** (Merah/Rose)

### 2. **User Flow**
1. User mengetik nama aktor atau keyword di search box (misal: "Jokowi")
2. Filter sentiment pills muncul dengan animasi smooth
3. User klik salah satu sentiment (Positif/Negatif)
4. Hasil berita ditampilkan sesuai dengan:
   - Keyword yang dicari
   - Sentiment yang dipilih
   - Kategori yang aktif (jika ada)

### 3. **Indikator Visual**
- **Active State**: Button yang dipilih memiliki background solid dengan shadow
- **Badge di Hasil**: Menampilkan badge sentiment aktif di atas daftar berita
- **Clear Button**: Tombol X untuk menghapus filter sentiment
- **Empty State**: Pesan disesuaikan jika tidak ada berita yang cocok

### 4. **Technical Implementation**

#### Frontend (React Components):
- **page.tsx**: 
  - State management `sentimentFilter`
  - API call dengan parameter `sentiment`
  - Display badge sentiment aktif
  
- **HeroSection.tsx**:
  - Sentiment filter pills UI
  - Toggle functionality
  - Animasi dengan Framer Motion

#### Backend (API Route):
- **route.ts**:
  - Extract `sentiment` query parameter
  - Filter berdasarkan sentimen dominan dari `tabel_sentimen_aktor`
  - Sentimen diambil dari aktor pertama (sentimen utama)

## Keunggulan Desain

### ✅ User Experience
- **Contextual**: Filter hanya muncul saat relevan (ada search query)
- **Visual Feedback**: Warna dan emoji membuat sentiment mudah dipahami
- **Non-Intrusive**: Tidak mengganggu flow pencarian normal
- **Easy Reset**: Bisa di-clear dengan mudah

### ✅ Performance
- **Client-Side State**: State management efisien dengan React hooks
- **Server-Side Filtering**: Filtering dilakukan di backend untuk performa optimal
- **Pagination Aware**: Bekerja seamlessly dengan pagination

### ✅ Scalability
- **Reusable Logic**: Function helper dapat digunakan untuk filtering lain
- **Modular Components**: Mudah untuk dipindah atau dimodifikasi
- **Database Optimized**: Filter menggunakan data yang sudah ada (tidak perlu query tambahan)

## API Parameters

```typescript
GET /api/analyze-news/berita?search=jokowi&sentiment=Positif
```

### Query Parameters:
- `search`: Keyword pencarian (string)
- `sentiment`: Filter sentiment - "Positif" | "Negatif" | "Semua" (default: "Semua")
- `category`: Filter kategori berita (string)
- `page`: Nomor halaman (number)
- `limit`: Jumlah item per halaman (number)

## Future Enhancements

### Potensi Pengembangan:
1. **Multi-Actor Support**: Filter berdasarkan sentimen untuk multiple actors
2. **Sentiment Score Range**: Filter berdasarkan range persentase sentimen
3. **Sentiment Trends**: Grafik tren sentimen dari waktu ke waktu
4. **Bookmark Filters**: Simpan kombinasi filter yang sering digunakan
5. **Export Results**: Export hasil filtered ke PDF/Excel

## Design Considerations

### Mengapa Pilihan Ini?
1. **Di bawah Search Box**: 
   - Secara logis, sentiment adalah refinement dari search
   - Tidak mengambil ruang saat tidak diperlukan
   - Flow alami: Search → Refine → Results

2. **Emoji + Text**:
   - Universal language untuk sentiment
   - Membantu colorblind users
   - Meningkatkan recognizability

3. **Pills/Buttons vs Dropdown**:
   - Hanya 2 options → better visibility
   - Faster selection (1 click vs 2 clicks)
   - Visual feedback lebih jelas

4. **Hanya Positif & Negatif**:
   - Fokus pada polaritas yang jelas
   - Menghindari confusion dengan berita netral
   - User biasanya mencari opini ekstrem (pro/kontra)

## Testing Scenarios

### Test Cases:
1. ✅ Filter tanpa search query (tidak muncul)
2. ✅ Filter dengan search query (muncul)
3. ✅ Klik sentiment button (filter aktif)
4. ✅ Klik sentiment yang sama dua kali (toggle off)
5. ✅ Clear search box (reset sentiment)
6. ✅ Kombinasi category + search + sentiment
7. ✅ Pagination dengan sentiment filter aktif
8. ✅ Empty state dengan sentiment filter
9. ✅ Dark mode compatibility
10. ✅ Mobile responsive

## Browser Compatibility
- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile Browsers (iOS Safari, Chrome Android)

## Accessibility
- ✅ Keyboard navigation support
- ✅ ARIA labels untuk screen readers
- ✅ Color contrast compliance (WCAG AA)
- ✅ Focus indicators
- ✅ Emoji tidak mengganggu screen readers (complemented by text)

---

**Created**: 2026-06-18
**Status**: ✅ Implemented & Ready for Production
