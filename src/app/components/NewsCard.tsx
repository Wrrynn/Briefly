"use client";

import React from "react";
import Link from "next/link";

export default function NewsCard({ data }: any) {
  const sentimentStyles: { [key: string]: string } = {
    Positif: "bg-emerald-600 text-white border-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    Negatif: "bg-rose-600 text-white border-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
    Netral: "bg-blue-600 text-white border-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.4)]",
  };

  return (
    <div className="group relative bg-black border-2 border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-500 hover:-translate-y-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]">
      <div className="relative h-52 overflow-hidden border-b-2 border-white/10">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        <div className="absolute top-4 left-4">
          <span className="bg-white text-black font-black text-[10px] px-3 py-1.5 rounded-md uppercase tracking-[0.2em] shadow-xl">
            {data.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
            {data.source}
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {data.time}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors duration-300 tracking-tight">
          {data.title}
        </h2>

        <p className="text-sm text-white/80 line-clamp-2 mb-6 font-normal leading-relaxed">
          {data.description}
        </p>

        <div className="flex flex-col gap-4 pt-5 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span 
              suppressHydrationWarning
              className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border-b-4 ${sentimentStyles[data.sentiment] || sentimentStyles.Netral}`}
            >
              {data.sentiment}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.impact.map((imp: string, i: number) => (
              <span
                key={i}
                className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[9px] font-bold px-2.5 py-1 rounded uppercase tracking-tighter"
              >
                #{imp}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={`/news/${data.id}`}
          className="block w-full mt-7 py-3.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.25em] hover:bg-blue-500 hover:text-white transition-all duration-300 active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.4)] text-center"
        >
          Analisis Lengkap →
        </Link>
      </div>

      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-blue-600/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-600/40 transition-all duration-700" />
    </div>
  );
}