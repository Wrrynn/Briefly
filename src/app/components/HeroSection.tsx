"use client";

import { useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import ColorBends from "./ColorBends";
import Link from "next/link";
import RecentNews from "./RecentNews";

const menuItems = [
  { label: "Semua", num: "01", link: "/#" },
  { label: "Politik", num: "02", link: "/#" },
  { label: "Ekonomi", num: "03", link: "/#" },
  { label: "Teknologi", num: "04", link: "/#" },
  { label: "Bisnis", num: "05", link: "/#" },
  { label: "Kesehatan", num: "06", link: "/#" },
  { label: "Olahraga", num: "07", link: "/#" },
  { label: "Umum", num: "08", link: "/#" },
];

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const titleOpacity = useTransform(smoothProgress, [0, 0.3], [1, 0]);
  const titleScale = useTransform(smoothProgress, [0, 0.4], [1, 0.85]);
  const titleZ = useTransform(smoothProgress, [0, 0.4], [30, 0]);
  const titlePointerEvents = useTransform(smoothProgress, (val) =>
    val < 0.3 ? "auto" : "none",
  );

  const newsOpacity = useTransform(smoothProgress, [0.2, 0.6], [0, 1]);
  const newsScale = useTransform(smoothProgress, [0.2, 0.7], [1.15, 1]);
  const newsZ = useTransform(smoothProgress, [0, 0.4], [0, 40]);
  const newsPointerEvents = useTransform(smoothProgress, (val) =>
    val > 0.4 ? "auto" : "none",
  );

  return (
    <div
      ref={containerRef}
      className="relative h-[250vh] text-white flex flex-col w-full"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col overflow-hidden">
        {/* 🔥 NAVBAR PREMIUM CINEMATIC RE-DESIGN */}
        <nav className="relative z-[100] flex justify-center px-10 py-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center justify-between gap-10 w-fit min-w-[550px] bg-white/[0.02] border border-white/5 rounded-full px-8 py-3.5 backdrop-blur-2xl transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.6)] group"
          >
            {/* Logo area - Minimalist elegant */}
            <div className="flex items-center gap-3 text-xs font-light tracking-[0.4em] uppercase text-white hover:text-blue-300 transition-colors cursor-pointer">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
              </div>
              <span className="relative top-[1px]">Compro</span>
            </div>

            {/* Links area - Airier typography */}
            <div className="flex gap-10 items-center">
              <Link
                href="/"
                className="relative text-[11px] font-light tracking-[0.3em] uppercase text-white/50 hover:text-white transition-all group/link"
              >
                Home
                <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-blue-500 transition-all group-hover/link:w-full"></span>
              </Link>
              <div className="h-4 w-[1px] bg-white/5" />{" "}
              {/* Ultra thin divider */}
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-4 text-[11px] font-light tracking-[0.3em] uppercase text-white/50 hover:text-white transition-all group/menu"
              >
                {/* 🔥Hamburger with smooth flow animation */}
                <div className="relative flex flex-col gap-[4px] w-5">
                  <span className="block h-[1px] w-full bg-current transition-all" />
                  <span className="block h-[1px] w-full bg-current transition-all group-hover/menu:w-2/3 origin-right" />
                  <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-blue-500 transition-all group-hover/menu:w-full"></span>
                </div>
                <span className="relative top-[1px]">Menu</span>
              </button>
            </div>
          </motion.div>
        </nav>

        {/* 🔥 DRAWER RE-DESIGN (Cinematic & Elegant Style) */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Background Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md cursor-pointer"
              />

              {/* Sidebar Menu */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[380px] z-[120] flex flex-col bg-[#05051a]/95 border-l border-white/5 shadow-2xl backdrop-blur-2xl"
              >
                <div className="p-10 flex flex-col h-full">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="self-end w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-90"
                  >
                    <span className="text-white/60 text-sm font-light">✕</span>
                  </button>

                  {/* Menu Items */}
                  <div className="mt-12">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-blue-500/60 font-bold mb-10 pl-1">
                      Eksplorasi
                    </p>

                    <nav className="flex flex-col gap-1">
                      {menuItems.map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 + 0.2 }}
                        >
                          <Link
                            href={item.link}
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center gap-6 py-3.5 transition-all outline-none"
                          >
                            {/* Index Number */}
                            <span className="text-[10px] font-mono text-white/20 group-hover:text-blue-500/80 transition-colors duration-300 pt-1">
                              {item.num}
                            </span>

                            {/* Menu Label */}
                            <span className="text-2xl font-light tracking-tight text-white/80 group-hover:text-white group-hover:translate-x-3 transition-all duration-500 ease-out">
                              {item.label}
                            </span>

                            {/* Hover Line Indicator */}
                            <span className="h-[1px] w-0 bg-blue-500/40 group-hover:w-8 transition-all duration-500 ease-out" />
                          </Link>
                        </motion.div>
                      ))}
                    </nav>
                  </div>

                  {/* Footer Sidebar */}
                  <div className="mt-auto pt-8 border-t border-white/5">
                    <div className="flex flex-col gap-2">
                      <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-medium">
                        © 2026 COMPRO AI PLATFORM
                      </p>
                      <p className="text-[9px] text-white/10 font-light tracking-wider">
                        Sentiment & Prediksi Dampak Masa Depan
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* HERO CONTENT AREA */}
        <div className="relative z-10 flex flex-1 items-center justify-center w-full h-full overflow-hidden pb-10">
          <motion.div
            className="absolute flex flex-col items-center justify-center text-center px-6 w-full max-w-2xl"
            style={{
              opacity: titleOpacity,
              scale: titleScale,
              zIndex: titleZ,
              pointerEvents: titlePointerEvents as any,
            }}
          >

            <h1 className="text-5xl md:text-6xl font-bold leading-[1.15] tracking-tight max-w-3xl mb-12 drop-shadow-lg">
              Berita Dunia <span className="text-white/40">Terkini</span> dengan
              Sentimen AI
            </h1>

  

            <div className="flex gap-4 pb-10">
              <button className="bg-white text-black rounded-full px-9 py-4 text-xs font-extrabold uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all active:scale-95 shadow-xl">
                Get Started
              </button>
              <button className="bg-white/5 backdrop-blur-md text-white/80 border border-white/10 rounded-full px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95 shadow-lg">
                Learn More
              </button>
            </div>

            <div className="inline-flex items-center gap-3 bg-white/[0.04] border border-white/40 rounded-full px-5 py-2.5 text-xs text-white/50 mb-10 w-[500px] 
                focus-within:border-white-500/60 focus-within:bg-white/[0.08] 
                transition-all duration-500 backdrop-blur-sm group 
                /* Efek Cahaya (Glow) */
                shadow-[0_0_20px_rgba(255,255,255,0.05)] 
                focus-within:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
                
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white/30 group-focus-within:text-white-400 transition-colors duration-500"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>

                <input
                  placeholder="Cari analisis AI..."
                  className="bg-transparent border-none outline-none text-left w-full placeholder:text-white/20 font-light tracking-wide text-white"
                />
            </div>

          </motion.div>
          

          {/* LAYER 2: RECENT NEWS */}
          <motion.div
            className="absolute w-full mt-16"
            style={{
              opacity: newsOpacity,
              scale: newsScale,
              zIndex: newsZ,
              pointerEvents: newsPointerEvents as any,
            }}
          >
            <RecentNews />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
