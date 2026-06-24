"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Bila konfirmasi email diaktifkan, user perlu cek email dulu.
    if (data.user && !data.session) {
      setDone(true);
      setLoading(false);
      return;
    }

    // Bila konfirmasi email dimatikan, langsung masuk.
    window.location.href = "/";
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Gagal mendaftar dengan Google.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#05051a] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Briefly
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
            Buat akun baru
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c0c20] border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-xl shadow-gray-100/60 dark:shadow-none">
          {done ? (
            <div className="text-center py-4">
              <p className="text-gray-900 dark:text-white font-bold mb-2">
                Cek email kamu 📧
              </p>
              <p className="text-sm text-gray-500 dark:text-white/50">
                Kami mengirim tautan konfirmasi ke{" "}
                <span className="text-blue-600 dark:text-blue-400">{email}</span>
                . Klik tautan itu untuk mengaktifkan akun.
              </p>
              <Link
                href="/login"
                className="inline-block mt-6 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Kembali ke halaman masuk
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-3 text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                <GoogleIcon />
                Daftar dengan Google
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-white/30">
                  atau
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/50 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama kamu"
                    className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/50 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/50 mb-2">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 transition-colors"
                >
                  {loading ? "Memproses…" : "Daftar"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-white/50">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
