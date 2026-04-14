"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type News = {
  id: number;
  title: string;
  description: string;
  image: string;
  sentiment: "positif" | "negatif" | "netral";
};

const data: News[] = [
  {
    id: 1,
    title: "AI Mengubah Dunia Kerja",
    description:
      "Revolusi kecerdasan buatan mendominasi efisiensi operasional industri.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    sentiment: "positif",
  },
  {
    id: 2,
    title: "Ekonomi Global Menurun",
    description:
      "Pasar menunjukkan tren volatilitas tinggi akibat pergeseran kebijakan.",
    image:
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    sentiment: "negatif",
  },
  {
    id: 3,
    title: "Teknologi Baru 2026",
    description:
      "Komputasi kuantum menjanjikan keamanan data bagi sektor perbankan.",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
    sentiment: "netral",
  },
  {
    id: 4,
    title: "Startup AI Berkembang",
    description:
      "Ekosistem teknologi bergairah dengan suntikan dana triliunan rupiah.",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
    sentiment: "positif",
  },
];

// Ukuran aman untuk layar laptop
const CARD_WIDTH = 320;
const GAP = 24;

const extended = [...data, ...data, ...data];

export default function RecentNews() {
  const [index, setIndex] = useState(data.length);
  const [active, setActive] = useState<News | null>(null);
  const [isJumping, setIsJumping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const next = () => {
    if (isJumping) return;
    setIndex((prev) => prev + 1);
  };

  const prev = () => {
    if (isJumping) return;
    setIndex((prev) => prev - 1);
  };

  useEffect(() => {
    data.forEach((item) => {
      const img = new window.Image();
      img.src = item.image;
    });
  }, []);

  // AUTO SWIPE SETIAP 3 DETIK
  useEffect(() => {
    if (isHovered || active || isJumping) return;
    const autoPlayInterval = setInterval(() => next(), 3000);
    return () => clearInterval(autoPlayInterval);
  }, [index, isHovered, active, isJumping]);

  useEffect(() => {
    if (index >= data.length * 2) {
      const timeout = setTimeout(() => {
        setIsJumping(true);
        setIndex(index - data.length);
      }, 600);
      return () => clearTimeout(timeout);
    }
    if (index <= data.length - 1) {
      const timeout = setTimeout(() => {
        setIsJumping(true);
        setIndex(index + data.length);
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [index]);

  useEffect(() => {
    if (isJumping) {
      const timeout = setTimeout(() => setIsJumping(false), 50);
      return () => clearTimeout(timeout);
    }
  }, [isJumping]);

  const cinematicEase = [0.25, 1, 0.5, 1];

  return (
    <div className="relative w-full flex flex-col items-center py-4 bg-transparent overflow-hidden">
      {/* HEADER SECTION (Teks Neon Bug-Free) */}
      <div className="w-full max-w-[1200px] px-6 mb-8 flex flex-col items-center justify-center z-10 text-center">
        <div className="relative inline-block py-2">
          {/* Teks Dasar */}
          <h2 className="text-2xl md:text-4xl font-extralight text-white/10 tracking-[0.3em] uppercase">
            Recent News
          </h2>
          {/* Animasi Nyala */}
          <motion.div
            className="absolute top-0 left-0 h-full overflow-hidden whitespace-nowrap pt-2"
            animate={{ width: ["0%", "100%", "100%", "0%"] }}
            transition={{
              duration: 7,
              times: [0, 0.4, 0.7, 1],
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            <h2
              className="text-2xl md:text-4xl font-medium text-white tracking-[0.3em] uppercase"
              style={{
                textShadow:
                  "0 0 15px rgba(96, 165, 250, 0.9), 0 0 35px rgba(96, 165, 250, 0.5)",
              }}
            >
              Recent News
            </h2>
          </motion.div>
        </div>
        <p className="text-white/30 mt-3 font-light text-[10px] md:text-xs tracking-[0.25em] uppercase">
          Top Stories Hari Ini
        </p>
      </div>

      {/* CAROUSEL WRAPPER */}
      <div
        className="relative w-full flex items-center justify-center group/carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* NAV LEFT */}
        <button
          onClick={prev}
          className="absolute left-2 md:left-8 lg:left-16 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-2xl transition-all duration-500 active:scale-90 opacity-0 group-hover/carousel:opacity-100 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <span className="text-white/80 text-xl -ml-1">❮</span>
        </button>

        {/* TRACK AREA */}
        <div
          className="overflow-visible w-full flex justify-center py-6"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <motion.div
            className="flex cursor-grab active:cursor-grabbing items-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, info) => {
              const threshold = 50;
              if (info.offset.x < -threshold) next();
              else if (info.offset.x > threshold) prev();
            }}
            animate={{
              x:
                -index * (CARD_WIDTH + GAP) +
                (typeof window !== "undefined"
                  ? window.innerWidth / 2 - CARD_WIDTH / 2
                  : 0),
            }}
            transition={
              isJumping
                ? { duration: 0 }
                : { type: "tween", ease: cinematicEase, duration: 0.6 }
            }
          >
            {extended.map((item, i) => {
              const distance = Math.abs(i - index);
              const isCenter = distance === 0;

              return (
                <motion.div
                  key={i}
                  onClick={() => setActive(item)}
                  className="relative shrink-0 rounded-[28px] overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  style={{
                    width: CARD_WIDTH,
                    marginRight: GAP,
                    height: 420, // Tinggi pas buat laptop
                  }}
                  animate={{
                    scale: isCenter ? 1.05 : 0.85,
                    opacity: isCenter ? 1 : 0.4,
                    zIndex: isCenter ? 20 : 0,
                  }}
                  // 🔥 FIX: HOVER EFFECT DIKEMBALIKAN
                  whileHover={{
                    scale: isCenter ? 1.08 : 0.9,
                    opacity: 1,
                    y: isCenter ? -8 : 0, // Naik sedikit pas dihover
                    zIndex: 30, // Pastikan ada di paling atas
                  }}
                  transition={{
                    type: "tween",
                    ease: cinematicEase,
                    duration: 0.6,
                  }}
                >
                  {/* IMAGE PAN/ZOOM */}
                  <motion.div
                    className="absolute inset-0 w-full h-full"
                    animate={{ scale: isCenter ? 1.15 : 1 }}
                    transition={{
                      duration: isCenter ? 6 : 0.6,
                      ease: "easeOut",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/60 to-transparent" />

                  {/* TEXT CONTENT */}
                  <motion.div
                    className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start"
                    animate={{
                      y: isCenter ? 0 : 15,
                      opacity: isCenter ? 1 : 0.5,
                    }}
                    transition={{
                      type: "tween",
                      ease: cinematicEase,
                      duration: 0.6,
                    }}
                  >
                    <span
                      className={`text-[9px] uppercase tracking-[0.2em] font-extrabold mb-3 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-colors duration-300 ${
                        item.sentiment === "positif"
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          : item.sentiment === "negatif"
                            ? "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                            : "bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                      }`}
                    >
                      {item.sentiment}
                    </span>

                    <h3 className="text-xl font-bold leading-tight text-white mb-2 drop-shadow-lg">
                      {item.title}
                    </h3>

                    <p className="text-xs text-white/70 line-clamp-2 leading-relaxed drop-shadow-md">
                      {item.description}
                    </p>
                  </motion.div>

                  {/* BORDER GLOW */}
                  <div
                    className={`absolute inset-0 rounded-[28px] border transition-colors duration-700 pointer-events-none ${isCenter ? "border-white/20" : "border-transparent"}`}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* NAV RIGHT */}
        <button
          onClick={next}
          className="absolute right-2 md:right-8 lg:right-16 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-2xl transition-all duration-500 active:scale-90 opacity-0 group-hover/carousel:opacity-100 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          <span className="text-white/80 text-xl ml-1">❯</span>
        </button>
      </div>

      {/* PROGRESS BAR INDICATOR */}
      <div className="flex gap-2 mt-4 z-10">
        {data.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full bg-white/10 overflow-hidden shadow-[0_0_5px_rgba(255,255,255,0.1)]"
            style={{
              width: index % data.length === i ? 40 : 12,
              transition: "width 0.6s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {index % data.length === i && !isHovered && !active && (
              <motion.div
                className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
                key={index}
              />
            )}
            {index % data.length === i && (isHovered || active) && (
              <div className="h-full w-full bg-white/50" />
            )}
          </div>
        ))}
      </div>

      {/* MODAL POPUP */}
      {/* MODAL POPUP - ULTIMATE CINEMATIC INSIGHT */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            {/* 1. Backdrop Blur - Lebih Pekat & Mewah */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-[20px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
            />

            {/* 2. Modal Container - Perfect Centered */}
            <motion.div
              className="relative w-full max-w-4xl bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex flex-col md:flex-row h-full min-h-[450px]">
                {/* Bagian Visual (Kiri) */}
                <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
                  <motion.img
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={active.image}
                    className="w-full h-full object-cover"
                    alt={active.title}
                  />
                  {/* Glassy Overlay on Image */}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#05051a] via-transparent to-transparent" />

                  {/* Floating Badge on Image */}
                  <div className="absolute top-8 left-8 flex gap-3">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                        active.sentiment === "positif"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : active.sentiment === "negatif"
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                            : "bg-blue-500/20 border-blue-500/40 text-blue-300"
                      }`}
                    >
                      {active.sentiment}
                    </span>
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/40 backdrop-blur-md">
                      Insight AI
                    </span>
                  </div>
                </div>

                {/* Bagian Informasi (Kanan) */}
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center relative">
                  {/* Hiasan Background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[60px] -z-10" />

                  <motion.h2
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-6 leading-[1.2] tracking-tight"
                  >
                    {active.title}
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4 mb-10"
                  >
                    <p className="text-white/60 leading-relaxed text-sm font-light">
                      {active.description}
                    </p>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                      <p className="text-blue-400 text-[11px] font-bold uppercase tracking-widest mb-1">
                        Analisis Prediksi
                      </p>
                      <p className="text-white/40 text-xs leading-relaxed font-light">
                        Algoritma kami mendeteksi potensi pertumbuhan efisiensi{" "}
                        <span className="text-white/80 font-medium">
                          15-20%
                        </span>{" "}
                        dalam sektor ini dalam 12 bulan ke depan.
                      </p>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href="#"
                      target="_blank"
                      className="flex-[2] bg-white text-black text-center py-4 rounded-2xl text-[11px] font-extrabold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-blue-500 hover:text-white transition-all"
                    >
                      Baca Artikel Asli
                    </motion.a>

                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "rgba(255,255,255,0.1)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActive(null)}
                      className="flex-1 py-4 bg-white/5 border border-white/10 text-white/50 rounded-2xl text-[11px] font-extrabold uppercase tracking-[0.2em] transition-all"
                    >
                      Tutup
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Decorative Corner Detail */}
              <div className="absolute bottom-0 right-0 p-6 opacity-20 pointer-events-none">
                <div className="text-[60px] font-black text-white/10 leading-none select-none">
                  AI
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
