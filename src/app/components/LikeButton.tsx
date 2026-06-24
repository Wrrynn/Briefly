"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Tombol dukung/like aplikasi (di footer). Menampilkan TOTAL like seluruh
// pengguna dan ikut bertambah SECARA REAL-TIME saat siapa pun like/unlike
// (Supabase Realtime pada counter app_like_count). Menyukai butuh login
// (1 like/akun, bisa di-toggle).
export default function LikeButton() {
  const [count, setCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    (async () => {
      try {
        const r = await fetch("/api/likes", { cache: "no-store" });
        const j = (await r.json()) as { count?: number; liked?: boolean };
        if (!active) return;
        setCount(j.count ?? 0);
        setLiked(!!j.liked);
      } catch {
        if (active) setCount(0);
      }
    })();

    // Live: total like berubah untuk SEMUA pengunjung (tanpa reload).
    const channel = supabase
      .channel("app_like_count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_like_count" },
        (payload: { new?: { total?: number } }) => {
          const total = payload?.new?.total;
          if (typeof total === "number") setCount(total);
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/likes", { method: "POST" });
      if (r.status === 401) {
        window.location.href = "/login"; // belum login → masuk dulu untuk mendukung
        return;
      }
      const j = (await r.json()) as { count?: number; liked?: boolean };
      setCount(j.count ?? count ?? 0);
      setLiked(!!j.liked);
    } catch {
      // abaikan
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      aria-label="Dukung aplikasi ini"
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 disabled:opacity-60 ${
        liked
          ? "border-rose-400/40 bg-rose-500/15 text-rose-300"
          : "border-white/15 bg-white/5 text-white/70 hover:border-rose-400/40 hover:text-rose-300"
      }`}
    >
      <svg
        className={`h-4 w-4 transition-transform group-hover:scale-110 ${liked ? "scale-110" : ""}`}
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span>Dukung</span>
      <span className={liked ? "text-rose-200" : "text-white/90"}>
        {count === null ? "·" : count.toLocaleString("id-ID")}
      </span>
    </button>
  );
}
