"use client";

import Link from "next/link";

export default function NewsCard({ data }: any) {
  return (
    <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:-translate-y-1 shadow-2xl">
      {/* Bagian Konten */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="bg-white text-black font-black text-[10px] px-3 py-1.5 rounded-md uppercase tracking-[0.2em] shadow-xl">
            {data.category}
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {data.time}
          </span>
        </div>
        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-4">
          {data.source}
        </p>

        <h2 className="text-xl font-extrabold text-white leading-snug mb-3 group-hover:text-gray-300 transition-colors duration-300 tracking-tight line-clamp-2">
          {data.title}
        </h2>

        <p className="text-sm text-white/60 line-clamp-2 mb-6 font-normal leading-relaxed">
          {data.description}
        </p>

        <div className="flex flex-col gap-4 pt-5 border-t border-white/10">

          {/* Dampak & Persentase */}
          <div className="flex flex-wrap gap-2">
            {data.impacts?.map((imp: any, i: number) => (
              <span
                key={i}
                className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-tighter"
              >
                <span>{imp.name}</span>
                <span className="text-white/80 font-mono">{imp.percentage}%</span>
              </span>
            ))}
          </div>

        </div>

        <Link
          href={`/news/${data.id}`}
          className="block w-full mt-7 py-3.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.25em] hover:bg-gray-200 transition-all duration-300 active:scale-95 text-center"
        >
          Analisis Lengkap →
        </Link>
      </div>
    </div>
  );
}
