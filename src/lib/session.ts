// Aturan umur sesi — SENGAJA tanpa import apa pun supaya bisa dipakai baik di
// proxy (edge runtime) maupun di route handler (node runtime).

// Batas umur sesi: 6 jam sejak LOGIN, lewat itu user dipaksa logout.
export const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000;

type UserLike = { last_sign_in_at?: string | null } | null | undefined;

// Apakah sesi sudah melewati batas umur?
//
// Sumber waktu = `last_sign_in_at` pada objek user yang DIVERIFIKASI server oleh
// Supabase Auth (hasil getUser()). Dulu waktu mulai sesi disimpan di cookie
// `briefly_session_start` yang tidak httpOnly dan tidak ditandatangani, sehingga
// user cukup menghapus/mengubah cookie itu untuk memperpanjang sesi sendiri.
// Nilai dari Auth server tidak bisa disentuh klien.
//
// Catatan: refresh token TIDAK memperbarui last_sign_in_at, jadi batas ini
// benar-benar dihitung "sejak login", sesuai maksud semula.
export function sessionAgeExceeded(user: UserLike): boolean {
  const raw = user?.last_sign_in_at;
  if (!raw) return false; // tak ada info waktu login → jangan paksa logout
  const started = new Date(raw).getTime();
  if (!Number.isFinite(started)) return false;
  return Date.now() - started > SESSION_MAX_AGE_MS;
}
