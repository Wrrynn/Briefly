"use client";

export default function SearchBar({ query, setQuery }: any) {
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Cari berita..."
      className="
        w-full mt-4 p-3 border rounded-lg
        transition-all duration-300 ease-in-out
        hover:border-white-400 focus:ring-4 focus:ring-white-400
        "
    />
  );
}