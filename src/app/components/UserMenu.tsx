"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Tampilan user + tombol logout di navbar halaman berita. Mengambil nama dari
// metadata sesi (tanpa query DB). Logout menghapus sesi lalu ke /login.
export default function UserMenu() {
  const supabase = createClient();
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      // `data` bertipe any (type @supabase/supabase-js di-stub di proyek ini).
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!active || !user) return;
      const meta = user.user_metadata as { full_name?: string } | undefined;
      setName(meta?.full_name || user.email?.split("@")[0] || "Pengguna");
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleLogout() {
    setLoading(true);
    // Reset penanda mulai sesi agar timer 6 jam mulai dari awal saat login lagi.
    document.cookie = "briefly_session_start=; path=/; max-age=0";
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (!name) return null;

  const inisial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="hidden items-center gap-2 sm:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white">
          {inisial}
        </div>
        <span className="text-sm font-bold text-gray-800 dark:text-white/80">{name}</span>
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center gap-2 rounded-2xl border border-red-300/60 bg-red-50 px-3.5 py-2 text-sm font-bold text-red-600 transition active:scale-95 hover:bg-red-100 disabled:opacity-50 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {loading ? "Keluar…" : "Keluar"}
      </button>
    </div>
  );
}
