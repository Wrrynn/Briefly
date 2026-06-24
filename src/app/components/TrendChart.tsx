"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type Daily = { tgl: string; n: number };
type KategoriDaily = { tgl: string; label: string; n: number };
type Labeled = { label: string; n: number };
type AktorKategori = { kategori: string; aktor: string; n: number };
type Stats = {
  totals: { berita: number; cluster: number; cluster_terangkum: number; portal: number };
  daily: Daily[];
  kategori_top: Labeled[];
  kategori_daily: KategoriDaily[];
  sentimen: Labeled[];
  aktor_top: Labeled[];
  aktor_kategori: AktorKategori[];
};

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
function fmtTgl(tgl: string) {
  const [, m, d] = tgl.split("-");
  return `${parseInt(d, 10)} ${BULAN[parseInt(m, 10) - 1]}`;
}
function ribu(n: number) {
  return n.toLocaleString("id-ID");
}

const W = 320;
const TOP = 12;
const BOTTOM = 132;
const LABEL_Y = 148;

export default function TrendChart() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string>("Semua");
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/landing-stats", { cache: "no-store" });
        const json = (await res.json()) as Stats | { error: string };
        if (!active) return;
        if ("error" in json) setError(true);
        else setStats(json);
      } catch {
        if (active) setError(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Sumbu X = tanggal saat berita ditangkap (urut naik).
  const dates = useMemo(
    () => (stats ? [...stats.daily].map((d) => d.tgl).sort() : []),
    [stats],
  );

  // Seri sesuai filter: "Semua" = klaster/hari; kategori = klaster kategori itu/hari.
  const series = useMemo(() => {
    if (!stats) return [];
    if (selected === "Semua") {
      const map = new Map(stats.daily.map((d) => [d.tgl, d.n]));
      return dates.map((t) => map.get(t) ?? 0);
    }
    const map = new Map(
      stats.kategori_daily.filter((s) => s.label === selected).map((s) => [s.tgl, s.n]),
    );
    return dates.map((t) => map.get(t) ?? 0);
  }, [stats, selected, dates]);

  const max = Math.max(1, ...series);

  if (error) {
    return (
      <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-8 text-center text-sm text-white/50 backdrop-blur-2xl">
        Statistik belum tersedia saat ini.
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="h-[380px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl" />
    );
  }

  const n = dates.length;
  const gap = 5;
  const barW = (W - (n - 1) * gap) / n;
  const sentimen = Object.fromEntries(stats.sentimen.map((s) => [s.label, s.n]));

  // Aktor teratas: overall (aktor_top) atau per kategori terpilih (aktor_kategori).
  const topActors: Labeled[] =
    selected === "Semua"
      ? stats.aktor_top
      : stats.aktor_kategori
          .filter((a) => a.kategori === selected)
          .map((a) => ({ label: a.aktor, n: a.n }));

  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
              Data langsung dari sistem
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{ribu(stats.totals.berita)}</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            berita ditangkap · {ribu(stats.totals.cluster)} klaster · {stats.totals.portal} portal
          </p>
        </div>
      </div>

      {/* Filter kategori — SAMA dengan filter di app (detectCategory) */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {["Semua", ...stats.kategori_top.map((s) => s.label)].map((label) => {
          const aktif = selected === label;
          return (
            <button
              key={label}
              onClick={() => {
                setSelected(label);
                setHover(null);
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                aktif
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-white/55 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grafik batang harian (SVG) */}
      <svg viewBox={`0 0 ${W} 156`} className="w-full" role="img" aria-label="Tren berita harian">
        {/* garis dasar */}
        <line x1="0" y1={BOTTOM} x2={W} y2={BOTTOM} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {dates.map((t, i) => {
          const val = series[i];
          const h = (val / max) * (BOTTOM - TOP - 6);
          const x = i * (barW + gap);
          const y = BOTTOM - h;
          const aktif = hover === i;
          return (
            <g key={t} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)}>
              {/* area klik penuh tinggi agar mudah di-hover */}
              <rect x={x} y={TOP} width={barW} height={BOTTOM - TOP} fill="transparent" />
              <motion.rect
                initial={{ height: 0, y: BOTTOM }}
                animate={{ height: Math.max(h, 2), y: Math.max(y, TOP) }}
                transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                x={x}
                width={barW}
                rx={Math.min(3, barW / 2)}
                fill={aktif ? "#60a5fa" : "url(#barGrad)"}
              />
              {/* label tanggal: tampilkan jarang agar tidak penuh */}
              {(i === 0 || i === n - 1 || i === Math.floor(n / 2)) && (
                <text x={x + barW / 2} y={LABEL_Y} textAnchor="middle" className="fill-white/35" style={{ fontSize: 9, fontWeight: 700 }}>
                  {fmtTgl(t)}
                </text>
              )}
            </g>
          );
        })}

        {/* tooltip nilai pada batang aktif */}
        {hover !== null && dates[hover] && (
          <g>
            <text
              x={Math.min(Math.max(hover * (barW + gap) + barW / 2, 22), W - 22)}
              y={TOP + 2}
              textAnchor="middle"
              className="fill-white"
              style={{ fontSize: 11, fontWeight: 800 }}
            >
              {ribu(series[hover])}
            </text>
          </g>
        )}

        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.65" />
          </linearGradient>
        </defs>
      </svg>

      {/* Keterangan interaktif */}
      <p className="mt-1 text-center text-[11px] text-white/45">
        {selected === "Semua" ? (
          <>Klaster berita per hari — pilih kategori untuk tren topik</>
        ) : (
          <>
            Tren historis topik <span className="font-bold text-blue-300">{selected}</span> — muncul berulang lintas hari, bukan isu sesaat
          </>
        )}
      </p>

      {/* Sentimen (real) */}
      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
        {[
          { k: "Positif", c: "bg-emerald-400" },
          { k: "Negatif", c: "bg-rose-400" },
          { k: "Campuran", c: "bg-amber-400" },
        ].map((s) => (
          <div key={s.k} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.c}`} />
            <span className="text-[11px] font-semibold text-white/55">
              {s.k} <span className="text-white/80">{ribu(sentimen[s.k] ?? 0)}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Aktor teratas — frekuensi kemunculan di analisis (overall / per sektor) */}
      {topActors.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Aktor paling sering muncul{" "}
            <span className="text-blue-300">{selected === "Semua" ? "(overall)" : `· ${selected}`}</span>
          </p>
          <div className="space-y-2">
            {topActors.slice(0, 3).map((a, i) => {
              const rank = ["bg-amber-400/90 text-amber-950", "bg-white/30 text-white", "bg-orange-400/80 text-orange-950"][i] ?? "bg-white/15 text-white";
              return (
                <div key={a.label} className="flex items-center gap-2.5">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-black ${rank}`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-[12px] font-semibold text-white/85">{a.label}</span>
                  <span className="shrink-0 text-[11px] font-bold text-white/40">{ribu(a.n)}×</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
