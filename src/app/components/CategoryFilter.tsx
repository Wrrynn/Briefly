const categories = [
  "Semua",
  "Politik",
  "Ekonomi",
  "Teknologi",
  "Bisnis",
  "Kesehatan",
  "Olahraga",
  "Umum",
];

export default function CategoryFilter({ selected, setSelected }: any) {
  return (
    // Gap diperbesar ke 4 agar antar tombol tidak rapat
    <div className="flex flex-wrap gap-4 mt-8">
      {categories.map((cat) => (
        <button
          key={cat}
          suppressHydrationWarning // Tetap pasang ini biar aman dari error IDM/Ekstensi
          onClick={() => setSelected(cat)}
          // text-sm (lebih besar dari xs), px-6 (lebar), py-2.5 (tinggi)
          className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 border backdrop-blur-md
            ${
              selected === cat
                ? "bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.4)] scale-105"
                : "bg-white/[0.07] text-white/70 border-white/10 hover:bg-white/20 hover:text-white hover:border-white/40 hover:scale-105"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}