"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Aurora } from "@/app/components/auth/AuthShell";
import TrendChart from "@/app/components/TrendChart";
import Footer from "@/app/components/Footer";

// Ikon garis sederhana (inline SVG) — tanpa dependency tambahan.
function Icon({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICON = {
  ringkasan: "M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z",
  sentimen: "M3 12h3l2 5 4-14 2 9h7",
  sektor: "M3 17l6-6 4 4 8-8m0 0h-5m5 0v5",
  klaster: "M12 3l8 4.5-8 4.5-8-4.5L12 3zm8 9l-8 4.5L4 12m16 4.5L12 21l-8-4.5",
  trending: "M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z",
  filter: "M3 4.5h18l-7 8v6l-4 2v-8l-7-8z",
};

const features = [
  { d: ICON.ringkasan, t: "Ringkasan AI", s: "Ratusan berita diringkas otomatis menjadi inti yang padat dan mudah dicerna." },
  { d: ICON.sentimen, t: "Analisis Sentimen", s: "Ketahui nada positif, negatif, atau netral untuk tiap aktor dan isu." },
  { d: ICON.sektor, t: "Prediksi Dampak Sektoral", s: "Perkiraan dampak dan tingkat risiko terhadap berbagai sektor ekonomi." },
  { d: ICON.klaster, t: "Klaster Multi-Portal", s: "Berita dari 10+ portal tepercaya dikelompokkan jadi satu peristiwa utuh." },
  { d: ICON.trending, t: "Trending Real-time", s: "Lihat isu yang sedang paling ramai dibaca dan dianalisis saat ini." },
  { d: ICON.filter, t: "Filter & Cari Cerdas", s: "Saring berita per kategori, sentimen, dan kata kunci dalam sekejap." },
];

const steps = [
  { n: "01", t: "Kumpulkan", s: "Scraper menarik berita terbaru dari portal tepercaya secara berkala." },
  { n: "02", t: "Analisis AI", s: "AI mengklaster, meringkas, menilai sentimen, dan memprediksi dampak." },
  { n: "03", t: "Sajikan", s: "Insight tampil rapi dan interaktif, siap kamu telusuri kapan saja." },
];

const stats = [
  { v: "10+", l: "Portal berita" },
  { v: "5", l: "Dimensi analisis" },
  { v: "24/7", l: "Pembaruan otomatis" },
  { v: "AI", l: "Bertenaga LLM" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <main className="min-h-screen bg-[#05051a] text-white font-sans overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <Image src="/images/Briefly-logo.png" alt="Briefly" width={34} height={34} className="h-8 w-8 rounded-xl ring-1 ring-white/10" priority />
          <span className="text-sm font-black uppercase tracking-[0.3em]">Briefly</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-white/70 transition hover:text-white">
            Masuk
          </Link>
          <Link href="/register" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#05051a] transition hover:bg-white/90">
            Daftar
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <Aurora />
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-2 lg:pt-16">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.span
              variants={fadeUp}
              className="inline-block rounded-full bg-blue-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 ring-1 ring-blue-400/20"
            >
              AI News Intelligence • Indonesia
            </motion.span>

            <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Pahami berita Indonesia{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                dalam hitungan detik
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
              Briefly mengubah ribuan berita dari banyak portal menjadi ringkasan
              cerdas, analisis sentimen, dan prediksi dampak sektoral — semua
              ditenagai AI, dalam satu tampilan.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-900/40 transition hover:from-blue-500 hover:to-indigo-500"
              >
                Coba Gratis Sekarang
                <Icon d="M9 5l7 7-7 7" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/login" className="rounded-xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white/80 transition hover:bg-white/5">
                Sudah punya akun
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.l}>
                  <p className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-2xl font-black text-transparent">{s.v}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/40">{s.l}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Grafik tren NYATA dari database (volume berita + filter sektor) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-md"
          >
            <TrendChart />
            <div className="absolute -right-6 -top-6 -z-10 h-40 w-40 rounded-full bg-blue-600/30 blur-[80px]" />
          </motion.div>
        </div>
      </section>

      {/* ===== APA ITU BRIEFLY ===== */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="text-3xl font-black tracking-tight sm:text-4xl"
        >
          Berita itu banjir. <span className="text-white/45">Waktumu terbatas.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-lg leading-relaxed text-white/55"
        >
          Briefly adalah platform intelijen berita berbasis AI. Alih-alih membaca
          puluhan artikel, kamu langsung dapat <span className="text-white">inti, sentimen, dan dampaknya</span> — supaya
          keputusan dan pemahamanmu lebih cepat dan tajam.
        </motion.p>
      </section>

      {/* ===== FITUR ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Fitur Unggulan</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Semua yang kamu butuhkan untuk paham cepat</h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.t}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: (i % 3) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-colors hover:border-blue-400/30 hover:bg-white/[0.06]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-300 ring-1 ring-blue-400/20 transition-transform group-hover:scale-110">
                <Icon d={f.d} />
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{f.s}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CARA KERJA ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12 text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Cara Kerja</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Tiga langkah, dari berita mentah ke insight</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-7"
            >
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-4xl font-black text-transparent">{s.n}</span>
              <h3 className="mt-3 text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{s.s}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA AKHIR ===== */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent px-8 py-16 text-center"
        >
          <div className="absolute -left-10 -top-10 h-60 w-60 rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="relative">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Mulai pahami berita lebih cerdas</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/55">
              Gratis untuk dicoba. Daftar sekarang dan lihat berita Indonesia dari
              sudut pandang AI.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-[#05051a] transition hover:bg-white/90"
              >
                Buat Akun Gratis
              </Link>
              <Link href="/login" className="rounded-xl border border-white/20 px-7 py-3.5 text-sm font-bold text-white/85 transition hover:bg-white/5">
                Masuk
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER (sama dengan halaman lain) ===== */}
      <Footer />
    </main>
  );
}
