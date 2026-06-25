"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Konfirmasi email aktif → tidak ada sesi; minta user cek email.
    if (data.user && !data.session) {
      setCheckEmail(true);
      setLoading(false);
      return;
    }

    // Konfirmasi email nonaktif → signUp memberi sesi. Tapi alurnya WAJIB login
    // dulu: keluarkan sesi lalu arahkan ke halaman masuk.
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function handleGoogleRegister() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    if (error) {
      setError(
        String(error.message).includes("provider is not enabled")
          ? "Login Google belum diaktifkan di Supabase. Sementara gunakan email/kata sandi."
          : `Gagal dengan Google: ${error.message}`,
      );
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white">Briefly</h1>
        <p className="mt-2 text-sm text-white/45">Buat akun baru</p>
      </div>

      <GlassCard>
        {checkEmail ? (
          <div className="py-4 text-center">
            <p className="mb-2 font-bold text-white">Cek email kamu 📧</p>
            <p className="text-sm text-white/50">
              Tautan konfirmasi dikirim ke{" "}
              <span className="text-blue-300">{email}</span>. Klik untuk
              mengaktifkan akun, lalu masuk.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-bold text-blue-400 hover:text-blue-300"
            >
              Ke halaman masuk
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className={labelClass}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama kamu"
                  className={inputClass}
                />
              </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className={inputClass}
                />
              </div>

              <button type="submit" disabled={loading} className={primaryBtnClass}>
                {loading ? "Memproses…" : "Daftar"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-widest text-white/30">atau</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button onClick={handleGoogleRegister} disabled={loading} className={googleBtnClass}>
              <GoogleIcon />
              Daftar dengan Google
            </button>
          </>
        )}
      </GlassCard>

      <p className="mt-6 text-center text-sm text-white/45">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
}
