export interface NewsItem {
  id: number;
  title: string;
  category: string;
  description: string;
  sentiments: {
    type: "Positif" | "Negatif" | "Netral";
    percentage: number;
    description: string;
  }[];
  impacts: { name: string; percentage: number }[];
  source: string;
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

export const newsData: NewsItem[] = [
  {
    id: 1,
    title: "Ketegangan Iran-Israel Meningkat",
    category: "Politik",
    description: "Eskalasi konflik di Timur Tengah memicu kekhawatiran global akan stabilitas kawasan.",
    sentiments: [
      { type: "Positif", percentage: 10, description: "Mendorong percepatan transisi ke energi terbarukan di beberapa negara importir." },
      { type: "Netral", percentage: 15, description: "PBB terus mengupayakan resolusi dan jalur diplomasi tanpa memihak." },
      { type: "Negatif", percentage: 75, description: "Harga minyak mentah dunia melonjak dan mengancam inflasi global." }
    ],
    impacts: [
      { name: "#KEAMANAN ↓", percentage: 85 },
      { name: "#MINYAK ↑", percentage: 92 },
      { name: "#DIPLOMASI ↓", percentage: 60 }
    ],
    source: "Bloomberg",
    time: "2 jam lalu",
    author: "Ahmad Fauzi",
    publishedAt: "20 April 2026",
    readTime: 5,
    image: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Ketegangan antara Iran dan Israel kembali meningkat tajam dalam beberapa hari terakhir, memicu kekhawatiran serius di komunitas internasional terkait stabilitas kawasan Timur Tengah.\n\nPejabat senior pemerintah Amerika Serikat dan Uni Eropa telah melakukan serangkaian pertemuan darurat untuk membahas langkah-langkah de-eskalasi. Sementara itu, PBB mengeluarkan pernyataan yang mendesak semua pihak untuk menahan diri dan kembali ke jalur diplomatik.\n\nHarga minyak mentah dunia langsung bereaksi terhadap perkembangan ini, dengan harga Brent Crude melonjak lebih dari 4% dalam satu sesi perdagangan. Para analis memperkirakan volatilitas harga energi global akan terus berlanjut selama ketegangan ini belum mereda.\n\nNegara-negara di kawasan Teluk Persia mulai meningkatkan kesiagaan militer mereka, sementara jalur pelayaran di Selat Hormuz dipantau ketat oleh armada angkatan laut multinasional.`,
    aiSummary: "Konflik Iran-Israel kembali memanas dengan dampak langsung pada pasar energi global (+4% harga minyak) dan ketegangan diplomatik multilateral. Risiko eskalasi militer terbuka masih tinggi dalam 30 hari ke depan.",
    confidenceScore: 87,
    keywords: ["Iran", "Israel", "Timur Tengah", "Minyak", "Diplomasi", "PBB"],
  },
  {
    id: 2,
    title: "Suku Bunga BI Ditahan di 6%",
    category: "Ekonomi",
    description: "Bank Indonesia memutuskan untuk mempertahankan suku bunga guna menjaga stabilitas nilai tukar Rupiah.",
    sentiments: [
      { type: "Positif", percentage: 30, description: "IHSG merespons positif, inflasi domestik tetap terjaga dalam target." },
      { type: "Netral", percentage: 60, description: "Keputusan menahan suku bunga dianggap langkah paling rasional saat ini." },
      { type: "Negatif", percentage: 10, description: "Potensi pelambatan ekspansi kredit di sektor riil karena bunga masih tinggi." }
    ],
    impacts: [
      { name: "#RUPIAH ↔", percentage: 80 },
      { name: "#IHSG ↑", percentage: 45 },
      { name: "#KREDIT ↔", percentage: 50 }
    ],
    source: "CNBC",
    time: "4 jam lalu",
    author: "Dewi Rahmawati",
    publishedAt: "20 April 2026",
    readTime: 4,
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Bank Indonesia (BI) dalam Rapat Dewan Gubernur (RDG) bulan April 2026 secara bulat memutuskan untuk mempertahankan suku bunga acuan BI Rate pada level 6,00% per tahun.\n\nGubernur BI, Perry Warjiyo, menjelaskan bahwa keputusan ini diambil dengan mempertimbangkan kondisi global yang masih penuh ketidakpastian, termasuk kebijakan moneter The Fed yang masih cenderung ketat dan tekanan inflasi di negara-negara maju.\n\nDari sisi domestik, inflasi Indonesia tetap terjaga dalam target 2,5±1% dan pertumbuhan ekonomi kuartal pertama 2026 tercatat solid di 5,1%. Nilai tukar Rupiah relatif stabil di kisaran Rp15.800-16.000 per dolar AS.\n\nPasar saham merespons positif keputusan ini, dengan IHSG menguat 0,8% dalam sesi perdagangan sore hari.`,
    aiSummary: "BI mempertahankan suku bunga 6% sebagai respons terhadap ketidakpastian global. Fundamental ekonomi domestik solid, namun sinyal pemangkasan mungkin diperlukan di H2 2026 untuk mendorong ekspansi kredit.",
    confidenceScore: 92,
    keywords: ["Bank Indonesia", "Suku Bunga", "Rupiah", "IHSG", "Inflasi", "Moneter"],
  },
  {
    id: 3,
    title: "Peluncuran Chip AI Terbaru dari NVIDIA",
    category: "Teknologi",
    description: "NVIDIA memperkenalkan arsitektur GPU terbaru yang menjanjikan efisiensi komputasi AI hingga 10x lipat.",
    sentiments: [
      { type: "Positif", percentage: 85, description: "Lompatan besar dalam efisiensi komputasi dan lonjakan harga saham NVIDIA." },
      { type: "Netral", percentage: 10, description: "Pengembangan infrastruktur AI global berlanjut sesuai peta jalan teknologi." },
      { type: "Negatif", percentage: 5, description: "Meningkatnya hambatan masuk (barrier to entry) bagi pesaing kecil di industri chip." }
    ],
    impacts: [
      { name: "#EFISIENSI ↑", percentage: 95 },
      { name: "#SAHAM TECH ↑", percentage: 88 },
      { name: "#INOVASI ↑", percentage: 90 }
    ],
    source: "The Verge",
    time: "1 jam lalu",
    author: "Rizky Pratama",
    publishedAt: "20 April 2026",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1591815302525-756a9bcc3425?q=80&w=1200&auto=format&fit=crop",
    fullContent: `NVIDIA secara resmi memperkenalkan arsitektur GPU generasi terbaru mereka, yang dijuluki "Blackwell Ultra", dalam acara GTC 2026 yang digelar di San Jose, California.\n\nJensen Huang, CEO NVIDIA, mengklaim bahwa chip baru ini mampu menghadirkan performa komputasi AI hingga 10 kali lebih efisien dibandingkan generasi sebelumnya, dengan konsumsi daya yang justru berkurang 30%.\n\nArsitektur baru ini dirancang khusus untuk beban kerja AI generasi berikutnya, termasuk model bahasa raksasa dengan triliunan parameter dan sistem AI multimodal yang membutuhkan pemrosesan data real-time dalam skala masif.\n\nSaham NVIDIA melonjak lebih dari 8% pasca-pengumuman, membawa kapitalisasi pasar perusahaan ini melampaui angka $4 triliun untuk pertama kalinya dalam sejarah.`,
    aiSummary: "NVIDIA Blackwell Ultra menandai lompatan generasional dalam komputasi AI (10x efisiensi, -30% daya). Dominasi pasar GPU semakin solid dengan pre-order senilai miliaran dolar. Katalis bullish jangka menengah untuk sektor semikonduktor.",
    confidenceScore: 95,
    keywords: ["NVIDIA", "GPU", "AI", "Blackwell Ultra", "Semikonduktor", "Tech"],
  },
  {
    id: 4,
    title: "Akuisisi Besar di Sektor Retail",
    category: "Bisnis",
    description: "Grup konglomerat lokal resmi mengakuisisi jaringan retail supermarket terbesar di Indonesia.",
    sentiments: [
      { type: "Positif", percentage: 65, description: "Potensi pembukaan lapangan kerja baru di sektor distribusi dan logistik pasca-akuisisi." },
      { type: "Netral", percentage: 20, description: "Menunggu persetujuan KPPU terkait regulasi monopoli pasar sebelum beroperasi penuh." },
      { type: "Negatif", percentage: 15, description: "Adanya kekhawatiran dari UMKM lokal mengenai persaingan harga yang tidak seimbang." }
    ],
    impacts: [
      { name: "#EKSPANSI ↑", percentage: 85 },
      { name: "#PASAR ↑", percentage: 70 },
      { name: "#KERJA ↑", percentage: 60 }
    ],
    source: "Forbes",
    time: "5 jam lalu",
    author: "Siti Nurhaliza",
    publishedAt: "20 April 2026",
    readTime: 4,
    image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Salah satu konglomerat terbesar Indonesia secara resmi menyelesaikan proses akuisisi jaringan supermarket nasional dengan nilai transaksi mencapai Rp 18,5 triliun.\n\nDirektur Utama perusahaan pengakuisisi menyatakan bahwa langkah strategis ini merupakan bagian dari rencana ekspansi besar-besaran di sektor ritel konsumen, dengan target mencapai 500 gerai baru dalam lima tahun ke depan.\n\nAkuisisi ini mencakup lebih dari 320 gerai yang tersebar di 45 kota besar di seluruh Indonesia, beserta seluruh aset infrastruktur logistik dan distribusi yang mendukung operasional jaringan tersebut.`,
    aiSummary: "Akuisisi senilai Rp18,5T menciptakan pemain dominan baru di ritel Indonesia. Konsolidasi sektoral dipercepat. Perlu pantau regulasi KPPU. Potensi penciptaan lapangan kerja signifikan dalam 3-5 tahun.",
    confidenceScore: 88,
    keywords: ["Akuisisi", "Retail", "Konglomerat", "KPPU", "Ekspansi", "Indonesia"],
  },
  {
    id: 5,
    title: "Vaksin Baru Untuk Varian Omicron",
    category: "Kesehatan",
    description: "Ilmuwan berhasil mengembangkan formula vaksin yang lebih efektif melawan mutasi terbaru virus.",
    sentiments: [
      { type: "Positif", percentage: 90, description: "Efikasi 94% mencegah infeksi berat dan izin penggunaan darurat WHO terbit." },
      { type: "Netral", percentage: 8, description: "Proses distribusi ke berbagai negara masih membutuhkan waktu operasional logistik." },
      { type: "Negatif", percentage: 2, description: "Sebagian kecil relawan melaporkan efek samping ringan pasca-vaksinasi." }
    ],
    impacts: [
      { name: "#IMUNITAS ↑", percentage: 94 },
      { name: "#RAWAT INAP ↓", percentage: 85 },
      { name: "#MOBILITAS ↑", percentage: 75 }
    ],
    source: "Healthline",
    time: "6 jam lalu",
    author: "Dr. Hendra Wijaya",
    publishedAt: "20 April 2026",
    readTime: 5,
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Tim peneliti internasional dari Universitas Oxford bekerja sama dengan perusahaan farmasi BioNTech berhasil mengembangkan formula vaksin baru yang terbukti 94% efektif melawan varian Omicron XBB terbaru.\n\nHasil uji klinis fase 3 yang melibatkan lebih dari 40.000 relawan di 12 negara menunjukkan bahwa vaksin baru ini tidak hanya efektif mencegah infeksi berat, tetapi juga mengurangi penularan hingga 72%.\n\nWHO telah memberikan otorisasi penggunaan darurat untuk vaksin ini, dan beberapa negara termasuk Indonesia sudah memesan jutaan dosis untuk program imunisasi nasional.`,
    aiSummary: "Vaksin mRNA generasi kedua dengan efikasi 94% vs Omicron XBB. Reduksi rawat inap signifikan, durasi proteksi 18 bulan. WHO otorisasi darurat sudah diterbitkan. Dampak positif pada mobilitas global dan sektor pariwisata.",
    confidenceScore: 91,
    keywords: ["Vaksin", "Omicron", "mRNA", "WHO", "BioNTech", "Kesehatan Global"],
  },
  {
    id: 6,
    title: "Bursa Transfer Pemain Liga Inggris",
    category: "Olahraga",
    description: "Rekor transfer kembali pecah setelah klub raksasa London mendatangkan striker muda berbakat.",
    sentiments: [
      { type: "Positif", percentage: 30, description: "Antusiasme suporter meningkat drastis, tiket pertandingan langsung ludes." },
      { type: "Netral", percentage: 50, description: "Perekrutan adalah bagian dari strategi pembangunan skuad jangka panjang." },
      { type: "Negatif", percentage: 20, description: "Kritik atas nilai transfer £180 juta yang merusak keseimbangan kompetitif liga." }
    ],
    impacts: [
      { name: "#RATING ↑", percentage: 75 },
      { name: "#TIKET ↑", percentage: 90 },
      { name: "#PERSAINGAN ↑", percentage: 65 }
    ],
    source: "Sky Sports",
    time: "3 jam lalu",
    author: "Kevin Santoso",
    publishedAt: "20 April 2026",
    readTime: 3,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Chelsea FC secara resmi mengumumkan rekrutan terbaru mereka, mendatangkan striker muda berbakat asal Brasil berusia 19 tahun dengan nilai transfer yang dilaporkan mencapai £180 juta, memecahkan rekor transfer Liga Inggris.\n\nPemain ini, yang sebelumnya bermain untuk Santos FC, telah menunjukkan performa luar biasa musim lalu dengan mencetak 38 gol dalam 42 penampilan di semua kompetisi, menarik perhatian klub-klub top Eropa.\n\nTransfer ini memicu perdebatan hangat di kalangan penggemar dan analis sepak bola terkait inflasi nilai transfer yang terus meningkat tanpa batas, serta dampaknya terhadap keseimbangan kompetitif di Premier League.`,
    aiSummary: "Transfer £180M Chelsea mencetak rekor Premier League baru. Strategi membangun dominasi jangka panjang, namun memicu debat soal financial sustainability dan competitive balance liga.",
    confidenceScore: 79,
    keywords: ["Chelsea", "Transfer", "Premier League", "Sepak Bola", "Brasil"],
  },
  {
    id: 7,
    title: "Cuaca Ekstrim Melanda Jakarta",
    category: "Umum",
    description: "BMKG memperingatkan potensi hujan lebat disertai angin kencang di wilayah Jabodetabek sepekan ke depan.",
    sentiments: [
      { type: "Positif", percentage: 5, description: "Pemprov DKI Jakarta telah menyiapkan langkah antisipasi banjir dan evakuasi." },
      { type: "Netral", percentage: 10, description: "Fenomena cuaca ini diakibatkan oleh dinamika alam reguler Madden-Julian Oscillation." },
      { type: "Negatif", percentage: 85, description: "Risiko tinggi banjir, pohon tumbang, dan kelumpuhan aktivitas logistik warga." }
    ],
    impacts: [
      { name: "#TRANSPORTASI ↓", percentage: 90 },
      { name: "#LOGISTIK ↓", percentage: 80 },
      { name: "#WASPADA ↑", percentage: 95 }
    ],
    source: "Kompas",
    time: "30 menit lalu",
    author: "Andi Pratama",
    publishedAt: "20 April 2026",
    readTime: 3,
    image: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) mengeluarkan peringatan dini cuaca ekstrim untuk wilayah Jabodetabek dengan status Siaga mulai hari ini hingga tujuh hari ke depan.\n\nBMKG memprediksikan intensitas hujan lebat hingga sangat lebat disertai angin kencang berkecepatan 40-60 km/jam dan potensi petir di berbagai wilayah Jakarta, Bogor, Depok, Tangerang, dan Bekasi.\n\nMasyarakat diimbau untuk menghindari perjalanan yang tidak mendesak selama periode cuaca buruk ini, terutama di malam hari dan area yang rentan terhadap banjir dan pohon tumbang.`,
    aiSummary: "Cuaca ekstrim Jabodetabek 7 hari ke depan: kombinasi MJO aktif + vortex siklonik. Risiko tinggi banjir, gangguan transportasi, dan rantai pasok. Warga dianjurkan membatasi aktivitas non-esensial.",
    confidenceScore: 83,
    keywords: ["Jakarta", "BMKG", "Banjir", "Cuaca Ekstrim", "Jabodetabek"],
  }
];