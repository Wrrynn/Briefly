"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AuthShell,
  GlassCard,
  GoogleIcon,
  inputClass,
  labelClass,
  primaryBtnClass,
  googleBtnClass,
} from "@/app/components/auth/AuthShell";

function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  // Pesan info bila sesi berakhir otomatis setelah 6 jam.
  const expired = searchParams.get("expired");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "Gagal menyelesaikan login. Silakan coba lagi." : null,
  );

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email atau kata sandi salah.");
      setLoading(false);
      return;
    }
    // Navigasi penuh agar cookie sesi yang baru pasti terbaca server (proxy)
    // → langsung masuk ke halaman berita.
    window.location.href = "/";
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    if (error) {
      setError("Gagal masuk dengan Google.");
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white">Briefly</h1>
        <p className="mt-2 text-sm text-white/45">Masuk untuk melanjutkan</p>
      </div>

      <GlassCard>
        {expired && (
          <div className="mb-5 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Sesi berakhir setelah 6 jam. Silakan masuk kembali.
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Kata Sandi</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          <button type="submit" disabled={loading} className={primaryBtnClass}>
            {loading ? "Memproses…" : "Masuk"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-widest text-white/30">atau</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className={googleBtnClass}>
          <GoogleIcon />
          Masuk dengan Google
        </button>
      </GlassCard>

      <p className="mt-6 text-center text-sm text-white/45">
        Belum punya akun?{" "}
        <Link href="/register" className="font-bold text-blue-400 hover:text-blue-300">
          Daftar
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  // useSearchParams butuh batas Suspense agar aman saat prerender.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
