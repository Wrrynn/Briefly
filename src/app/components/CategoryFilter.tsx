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
    <div className="flex flex-wrap gap-2 mt-3">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setSelected(cat)}
          className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ease-in-out
            ${
             selected === cat
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}