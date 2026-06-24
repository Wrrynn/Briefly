import type { ReactNode } from "react";
import Footer from "@/app/components/Footer";

// Pembungkus bertema "glassmorphism": latar navy gelap + blob gradien yang di-blur
// (aurora) supaya efek backdrop-blur pada kartu terlihat. Komponen presentasional
// murni (tanpa hook) sehingga bisa dipakai di Server maupun Client Component.
// Lapisan latar aurora (blob gradien ter-blur + grid halus) — sumber warna untuk
// efek kaca. Dipakai oleh AuthShell dan halaman dashboard.
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full bg-blue-600/30 blur-[120px]" />
      <div className="absolute right-[-6rem] top-1/3 h-96 w-96 rounded-full bg-indigo-600/30 blur-[120px]" />
      <div className="absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-violet-600/20 blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#05051a]">
      <Aurora />
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
      {/* Footer wajib di semua halaman (login & register) */}
      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}

// Kartu kaca: transparan + blur + border tipis + bayangan dalam.
export function GlassCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-2xl ring-1 ring-white/5">
      {children}
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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

// Kelas input & tombol dipakai ulang agar konsisten di login/register.
export const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-blue-400/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-blue-500/20";

export const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-white/45";

export const primaryBtnClass =
  "w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50";

export const googleBtnClass =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.16] disabled:opacity-50";
