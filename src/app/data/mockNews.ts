export interface NewsItem {
  id: number;
  title: string;
  category: string;
  description: string;
  sentiment: "Positif" | "Negatif" | "Netral";
  impact: string[];
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
    sentiment: "Negatif",
    impact: ["Keamanan ↓", "Minyak ↑", "Diplomasi ↓"],
    source: "Bloomberg",
    time: "2 jam lalu",
    author: "Ahmad Fauzi",
    publishedAt: "20 April 2026",
    readTime: 5,
    image: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Ketegangan antara Iran dan Israel kembali meningkat tajam dalam beberapa hari terakhir, memicu kekhawatiran serius di komunitas internasional terkait stabilitas kawasan Timur Tengah.

Pejabat senior pemerintah Amerika Serikat dan Uni Eropa telah melakukan serangkaian pertemuan darurat untuk membahas langkah-langkah de-eskalasi. Sementara itu, PBB mengeluarkan pernyataan yang mendesak semua pihak untuk menahan diri dan kembali ke jalur diplomatik.

Harga minyak mentah dunia langsung bereaksi terhadap perkembangan ini, dengan harga Brent Crude melonjak lebih dari 4% dalam satu sesi perdagangan. Para analis memperkirakan volatilitas harga energi global akan terus berlanjut selama ketegangan ini belum mereda.

Negara-negara di kawasan Teluk Persia mulai meningkatkan kesiagaan militer mereka, sementara jalur pelayaran di Selat Hormuz dipantau ketat oleh armada angkatan laut multinasional.

Para diplomat dari berbagai negara sedang bekerja keras di belakang layar untuk mencari solusi diplomatik yang dapat mencegah konflik bersenjata terbuka yang berpotensi mengguncang stabilitas ekonomi global.`,
    aiSummary: "Konflik Iran-Israel kembali memanas dengan dampak langsung pada pasar energi global (+4% harga minyak) dan ketegangan diplomatik multilateral. Risiko eskalasi militer terbuka masih tinggi dalam 30 hari ke depan.",
    confidenceScore: 87,
    keywords: ["Iran", "Israel", "Timur Tengah", "Minyak", "Diplomasi", "PBB"],
  },
  {
    id: 2,
    title: "Suku Bunga BI Ditahan di 6%",
    category: "Ekonomi",
    description: "Bank Indonesia memutuskan untuk mempertahankan suku bunga guna menjaga stabilitas nilai tukar Rupiah.",
    sentiment: "Netral",
    impact: ["Rupiah ↔", "IHSG ↑", "Kredit ↔"],
    source: "CNBC",
    time: "4 jam lalu",
    author: "Dewi Rahmawati",
    publishedAt: "20 April 2026",
    readTime: 4,
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Bank Indonesia (BI) dalam Rapat Dewan Gubernur (RDG) bulan April 2026 secara bulat memutuskan untuk mempertahankan suku bunga acuan BI Rate pada level 6,00% per tahun.

Gubernur BI, Perry Warjiyo, menjelaskan bahwa keputusan ini diambil dengan mempertimbangkan kondisi global yang masih penuh ketidakpastian, termasuk kebijakan moneter The Fed yang masih cenderung ketat dan tekanan inflasi di negara-negara maju.

Dari sisi domestik, inflasi Indonesia tetap terjaga dalam target 2,5±1% dan pertumbuhan ekonomi kuartal pertama 2026 tercatat solid di 5,1%. Nilai tukar Rupiah relatif stabil di kisaran Rp15.800-16.000 per dolar AS.

Para ekonom menilai keputusan ini sudah tepat mengingat kondisi global yang masih bergejolak. Namun sebagian analis berharap BI mulai memberikan sinyal pemangkasan suku bunga pada semester kedua 2026 untuk mendorong pertumbuhan kredit dan investasi.

Pasar saham merespons positif keputusan ini, dengan IHSG menguat 0,8% dalam sesi perdagangan sore hari.`,
    aiSummary: "BI mempertahankan suku bunga 6% sebagai respons terhadap ketidakpastian global. Fundamental ekonomi domestik solid, namun sinyal pemangkasan mungkin diperlukan di H2 2026 untuk mendorong ekspansi kredit.",
    confidenceScore: 92,
    keywords: ["Bank Indonesia", "Suku Bunga", "Rupiah", "IHSG", "Inflasi", "Moneter"],
  },
  {
    id: 3,
    title: "Peluncuran Chip AI Terbaru dari NVIDIA",
    category: "Teknologi",
    description: "NVIDIA memperkenalkan arsitektur GPU terbaru yang menjanjikan efisiensi komputasi AI hingga 10x lipat.",
    sentiment: "Positif",
    impact: ["Efisiensi ↑", "Saham Tech ↑", "Inovasi ↑"],
    source: "The Verge",
    time: "1 jam lalu",
    author: "Rizky Pratama",
    publishedAt: "20 April 2026",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1591815302525-756a9bcc3425?q=80&w=1200&auto=format&fit=crop",
    fullContent: `NVIDIA secara resmi memperkenalkan arsitektur GPU generasi terbaru mereka, yang dijuluki "Blackwell Ultra", dalam acara GTC 2026 yang digelar di San Jose, California.

Jensen Huang, CEO NVIDIA, mengklaim bahwa chip baru ini mampu menghadirkan performa komputasi AI hingga 10 kali lebih efisien dibandingkan generasi sebelumnya, dengan konsumsi daya yang justru berkurang 30%.

Arsitektur baru ini dirancang khusus untuk beban kerja AI generasi berikutnya, termasuk model bahasa raksasa dengan triliunan parameter dan sistem AI multimodal yang membutuhkan pemrosesan data real-time dalam skala masif.

Beberapa perusahaan hyperscale terkemuka seperti Microsoft, Google, dan Amazon Web Services telah menyatakan komitmen untuk menjadi pelanggan pertama, dengan total pesanan awal yang diperkirakan mencapai miliaran dolar.

Saham NVIDIA melonjak lebih dari 8% pasca-pengumuman, membawa kapitalisasi pasar perusahaan ini melampaui angka $4 triliun untuk pertama kalinya dalam sejarah.`,
    aiSummary: "NVIDIA Blackwell Ultra menandai lompatan generasional dalam komputasi AI (10x efisiensi, -30% daya). Dominasi pasar GPU semakin solid dengan pre-order senilai miliaran dolar. Katalis bullish jangka menengah untuk sektor semikonduktor.",
    confidenceScore: 95,
    keywords: ["NVIDIA", "GPU", "AI", "Blackwell Ultra", "Semikonduktor", "Tech"],
  },
  {
    id: 4,
    title: "Akuisisi Besar di Sektor Retail",
    category: "Bisnis",
    description: "Grup konglomerat lokal resmi mengakuisisi jaringan retail supermarket terbesar di Indonesia.",
    sentiment: "Positif",
    impact: ["Ekspansi ↑", "Pasar ↑", "Kerja ↑"],
    source: "Forbes",
    time: "5 jam lalu",
    author: "Siti Nurhaliza",
    publishedAt: "20 April 2026",
    readTime: 4,
    image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Salah satu konglomerat terbesar Indonesia secara resmi menyelesaikan proses akuisisi jaringan supermarket nasional dengan nilai transaksi mencapai Rp 18,5 triliun.

Direktur Utama perusahaan pengakuisisi menyatakan bahwa langkah strategis ini merupakan bagian dari rencana ekspansi besar-besaran di sektor ritel konsumen, dengan target mencapai 500 gerai baru dalam lima tahun ke depan.

Akuisisi ini mencakup lebih dari 320 gerai yang tersebar di 45 kota besar di seluruh Indonesia, beserta seluruh aset infrastruktur logistik dan distribusi yang mendukung operasional jaringan tersebut.

Komisi Pengawas Persaingan Usaha (KPPU) menyatakan akan melakukan evaluasi mendalam terkait potensi dampak konsentrasi pasar dari transaksi ini terhadap persaingan usaha di sektor ritel.

Para analis memperkirakan langkah ini akan mendorong konsolidasi lebih lanjut di industri ritel Indonesia, dengan potensi terciptaan ribuan lapangan kerja baru seiring ekspansi yang direncanakan.`,
    aiSummary: "Akuisisi senilai Rp18,5T menciptakan pemain dominan baru di ritel Indonesia. Konsolidasi sektoral dipercepat. Perlu pantau regulasi KPPU. Potensi penciptaan lapangan kerja signifikan dalam 3-5 tahun.",
    confidenceScore: 88,
    keywords: ["Akuisisi", "Retail", "Konglomerat", "KPPU", "Ekspansi", "Indonesia"],
  },
  {
    id: 5,
    title: "Vaksin Baru Untuk Varian Omicron",
    category: "Kesehatan",
    description: "Ilmuwan berhasil mengembangkan formula vaksin yang lebih efektif melawan mutasi terbaru virus.",
    sentiment: "Positif",
    impact: ["Imunitas ↑", "Rawat Inap ↓", "Mobilitas ↑"],
    source: "Healthline",
    time: "6 jam lalu",
    author: "Dr. Hendra Wijaya",
    publishedAt: "20 April 2026",
    readTime: 5,
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Tim peneliti internasional dari Universitas Oxford bekerja sama dengan perusahaan farmasi BioNTech berhasil mengembangkan formula vaksin baru yang terbukti 94% efektif melawan varian Omicron XBB terbaru.

Hasil uji klinis fase 3 yang melibatkan lebih dari 40.000 relawan di 12 negara menunjukkan bahwa vaksin baru ini tidak hanya efektif mencegah infeksi berat, tetapi juga mengurangi penularan hingga 72%.

Inovasi kunci dalam vaksin ini adalah penggunaan teknologi mRNA generasi kedua yang mampu beradaptasi lebih cepat terhadap mutasi virus baru, serta formula adjuvant yang meningkatkan durasi perlindungan imun hingga 18 bulan.

WHO telah memberikan otorisasi penggunaan darurat untuk vaksin ini, dan beberapa negara termasuk Indonesia sudah memesan jutaan dosis untuk program imunisasi nasional.

Para ahli kesehatan global menyambut gembira terobosan ini, mengingat varian Omicron XBB telah menyebabkan lonjakan kasus di beberapa wilayah Asia dalam beberapa bulan terakhir.`,
    aiSummary: "Vaksin mRNA generasi kedua dengan efikasi 94% vs Omicron XBB. Reduksi rawat inap signifikan, durasi proteksi 18 bulan. WHO otorisasi darurat sudah diterbitkan. Dampak positif pada mobilitas global dan sektor pariwisata.",
    confidenceScore: 91,
    keywords: ["Vaksin", "Omicron", "mRNA", "WHO", "BioNTech", "Kesehatan Global"],
  },
  {
    id: 6,
    title: "Bursa Transfer Pemain Liga Inggris",
    category: "Olahraga",
    description: "Rekor transfer kembali pecah setelah klub raksasa London mendatangkan striker muda berbakat.",
    sentiment: "Netral",
    impact: ["Rating ↑", "Tiket ↑", "Persaingan ↑"],
    source: "Sky Sports",
    time: "3 jam lalu",
    author: "Kevin Santoso",
    publishedAt: "20 April 2026",
    readTime: 3,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Chelsea FC secara resmi mengumumkan rekrutan terbaru mereka, mendatangkan striker muda berbakat asal Brasil berusia 19 tahun dengan nilai transfer yang dilaporkan mencapai £180 juta, memecahkan rekor transfer Liga Inggris.

Pemain ini, yang sebelumnya bermain untuk Santos FC, telah menunjukkan performa luar biasa musim lalu dengan mencetak 38 gol dalam 42 penampilan di semua kompetisi, menarik perhatian klub-klub top Eropa.

Direktur Olahraga Chelsea menyatakan bahwa rekrutan ini merupakan bagian dari strategi jangka panjang klub untuk membangun skuad yang kompetitif di level tertinggi Eropa dalam 5 tahun ke depan.

Transfer ini memicu perdebatan hangat di kalangan penggemar dan analis sepak bola terkait inflasi nilai transfer yang terus meningkat tanpa batas, serta dampaknya terhadap keseimbangan kompetitif di Premier League.

Tiket pertandingan kandang Chelsea dilaporkan habis terjual dalam waktu kurang dari 2 jam setelah pengumuman transfer ini.`,
    aiSummary: "Transfer £180M Chelsea mencetak rekor Premier League baru. Strategi membangun dominasi jangka panjang, namun memicu debat soal financial sustainability dan competitive balance liga.",
    confidenceScore: 79,
    keywords: ["Chelsea", "Transfer", "Premier League", "Sepak Bola", "Brasil"],
  },
  {
    id: 7,
    title: "Cuaca Ekstrim Melanda Jakarta",
    category: "Umum",
    description: "BMKG memperingatkan potensi hujan lebat disertai angin kencang di wilayah Jabodetabek sepekan ke depan.",
    sentiment: "Negatif",
    impact: ["Transportasi ↓", "Logistik ↓", "Waspada ↑"],
    source: "Kompas",
    time: "30 menit lalu",
    author: "Andi Pratama",
    publishedAt: "20 April 2026",
    readTime: 3,
    image: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1200&auto=format&fit=crop",
    fullContent: `Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) mengeluarkan peringatan dini cuaca ekstrim untuk wilayah Jabodetabek dengan status Siaga mulai hari ini hingga tujuh hari ke depan.

BMKG memprediksikan intensitas hujan lebat hingga sangat lebat disertai angin kencang berkecepatan 40-60 km/jam dan potensi petir di berbagai wilayah Jakarta, Bogor, Depok, Tangerang, dan Bekasi.

Kondisi cuaca ekstrim ini dipicu oleh kombinasi dua fenomena meteorologis, yaitu aktifnya Madden-Julian Oscillation (MJO) di atas Samudra Hindia dan terbentuknya vortex siklonik di Laut Jawa yang memperparah konveksi atmosferik.

Gubernur DKI Jakarta telah menginstruksikan seluruh jajaran Pemprov DKI untuk meningkatkan kesiagaan menghadapi potensi banjir, termasuk mengaktifkan pompa air di seluruh titik rawan genangan dan menyiapkan tempat evakuasi sementara.

Masyarakat diimbau untuk menghindari perjalanan yang tidak mendesak selama periode cuaca buruk ini, terutama di malam hari dan area yang rentan terhadap banjir dan pohon tumbang.`,
    aiSummary: "Cuaca ekstrim Jabodetabek 7 hari ke depan: kombinasi MJO aktif + vortex siklonik. Risiko tinggi banjir, gangguan transportasi, dan rantai pasok. Warga dianjurkan membatasi aktivitas non-esensial.",
    confidenceScore: 83,
    keywords: ["Jakarta", "BMKG", "Banjir", "Cuaca Ekstrim", "Jabodetabek"],
  },
];
