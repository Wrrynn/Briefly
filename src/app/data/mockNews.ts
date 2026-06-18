// Tipe bersama untuk satu item berita (dipakai komponen detail & list).
export interface NewsItem {
  id: number;
  title: string;
  // Judul hasil summarize dari tabel_cluster (judul_summary). Dipakai sebagai
  // judul tampilan bila tersedia; jatuh ke `title` (judul artikel) bila tidak.
  summaryTitle?: string;
  category: string;
  description: string;
  sentiments: {
    type: "Positif" | "Negatif" | "Netral";
    percentage: number;
    description: string;
    aktor?: string;
  }[];
  impacts: { name: string; percentage: number }[];
  source: string;
  sources?: { portal: string; url: string }[];
  sektorPredictions?: { nama_sektor: string; prediksi_dampak: string; tingkat_risiko: string }[];
  time: string;
  image: string;
  author?: string;
  fullContent?: string;
  aiSummary?: string;
  confidenceScore?: number;
  keywords?: string[];
  readTime?: number;
  publishedAt?: string;
}
