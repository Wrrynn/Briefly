"use client";
import { useState } from "react";
import ColorBends from "./ColorBends";
import Link from "next/link";

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

  return (
    <div className="relative min-h-screen text-white flex flex-col overflow-hidden">    

      {/* Navbar */}
      <nav className="relative z-10 flex justify-center px-10 py-5">
        <div className="flex items-center justify-between gap-10 w-[520px] bg-white/[0.07] border border-white/[0.15] rounded-full px-6 py-2.5">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a10 10 0 0 1 0 20A10 10 0 0 1 12 2" />
              <path d="M12 6v2M12 16v2M6 12H4M20 12h-2" />
            </svg>
            Compro
          </div>
          <div className="flex gap-7 items-center">
            <a href="#" className="text-sm text-white/85 hover:text-white">Home</a>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors"
            >
              <div className="flex flex-col gap-1 w-4">
                <span className={`block h-px bg-current transition-all duration-300 origin-center ${isOpen ? "translate-y-[5.5px] rotate-45" : ""}`} />
                <span className={`block h-px bg-current transition-all duration-300 ${isOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block h-px bg-current transition-all duration-300 origin-center ${isOpen ? "-translate-y-[5.5px] -rotate-45" : ""}`} />
              </div>
              Menu
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-20 transition-all duration-[400ms] ${
          isOpen ? "bg-black/50 pointer-events-auto" : "bg-transparent pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] z-30 flex flex-col px-9 py-10
          bg-gradient-to-bl from-[#1a0a3a] to-[#0d0d2b]
          border-l border-white/[0.08]
          transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.175,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="self-end text-white/50 hover:text-white text-xl leading-none"
        >
          ✕
        </button>

        <nav className="mt-12 flex flex-col">
          {menuItems.map((item, i) => (
            <Link
              key={item.label}
              href={item.link}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-4 py-[18px] border-b border-white/[0.06] text-white hover:text-[#b19eef] no-underline transition-all duration-[400ms] ${
                isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
              style={{ transitionDelay: isOpen ? `${0.08 + i * 0.08}s` : "0s" }}
            >
              <span className="text-[11px] text-white/30 font-mono w-5">{item.num}</span>
              <span className="text-[22px] font-medium tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 pb-20 gap-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-7 w-[300px]">
          <input
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-left w-full placeholder:text-white/50"
          />
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold leading-tight tracking-tight max-w-xl mb-9">
          Berita Dunia Terkini dengan Sentimen & Prediksi Dampak AI
        </h1>

        {/* Buttons */}
        <div className="flex gap-3">
          <button className="bg-white text-black rounded-full px-7 py-3 text-sm font-medium hover:opacity-90 transition-opacity">
            Get Started
          </button>
          <button className="bg-white/10 text-white/85 border border-white/20 rounded-full px-7 py-3 text-sm hover:bg-white/15 transition-colors">
            Learn More
          </button>
        </div>
      </div>

    </div>
  );
}