"use client";

import React from "react";
import Link from "next/link";

export default function NewsCard({ data }: any) {
  // Styling disesuaikan agar cocok dijejerkan bertiga (lebih transparan tapi tetap neon)
  const sentimentStyles: { [key: string]: string } = {
    Positif: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Negatif: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    Netral: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="group relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:-translate-y-1 shadow-2xl">
      {/* Bagian Gambar */}
      <div className="relative h-52 overflow-hidden border-b border-white/10">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white text-black font-black text-[10px] px-3 py-1.5 rounded-md uppercase tracking-[0.2em] shadow-xl">
            {data.category}
          </span>
        </div>
      </div>

      {/* Bagian Konten */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
            {data.source}
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {data.time}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-white leading-snug mb-3 group-hover:text-gray-300 transition-colors duration-300 tracking-tight line-clamp-2">
          {data.title}
        </h2>

        <p className="text-sm text-white/60 line-clamp-2 mb-6 font-normal leading-relaxed">
          {data.description}
        </p>

        <div className="flex flex-col gap-4 pt-5 border-t border-white/10">
          
          {/* 3 Sentimen & Persentase */}
          <div className="flex gap-2">
            {data.sentiments?.map((sent: any, index: number) => (
              <div 
                key={index}
                className={`flex-1 flex justify-between items-center px-2 py-1.5 rounded-md border ${sentimentStyles[sent.type] || sentimentStyles.Netral}`}
              >
                <span className="text-[8px] font-black uppercase tracking-wider">
                  {sent.type}
                </span>
                <span className="text-[10px] font-mono font-bold">
                  {sent.percentage}%
                </span>
              </div>
            ))}
          </div>

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