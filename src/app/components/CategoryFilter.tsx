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
    <div className="flex flex-wrap gap-3 mt-6">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelected(cat)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border backdrop-blur-sm px-4 py-1.5 ...
            ${
              selected === cat
                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                : "bg-white/[0.05] text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}