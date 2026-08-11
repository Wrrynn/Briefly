import { supabase } from "@/lib/supabase";

// Akses data milik pengguna: bookmark, riwayat baca, aktor yang diikuti, dan
// preferensi. Tabelnya dibuat lewat supabase/migrations/0001_profil_pengguna.sql.
//
// Semua fungsi di sini SUDAH mengasumsikan identitas terverifikasi (dipanggil
// setelah getSessionUser()), lalu memakai client service-role.

// Dua kegagalan yang berbeda, tapi artinya sama bagi pengguna: rangkaian
// migrasi belum tuntas.
//
//   42P01 / PGRST205 / PGRST202 — tabel atau fungsinya memang belum dibuat
//   42501                       — tabelnya ADA, tapi service_role belum
//                                 diberi hak atasnya
//
// Kode 42501 wajib ikut di sini. Menjalankan 0001 saja membuat tabelnya ada
// tetapi tanpa grant (project ini tidak mewariskannya otomatis — itu sebabnya
// 0002 dan 0004 ditulis), sehingga galatnya berubah dari "tabel tidak
// ditemukan" menjadi "izin ditolak". Tanpa baris ini, tepat di kondisi
// setengah jalan itu aplikasi berhenti menampilkan banner petunjuk dan
// melempar 500 yang tidak menjelaskan apa-apa.
const KODE_MIGRASI_BELUM_TUNTAS = new Set(["42P01", "PGRST205", "PGRST202", "42501"]);

export function migrasiBelumTuntas(error: any): boolean {
  if (!error) return false;
  const kode = String(error.code || "");
  if (KODE_MIGRASI_BELUM_TUNTAS.has(kode)) return true;
  const pesan = String(error.message || "").toLowerCase();
  return (
    pesan.includes("does not exist") ||
    pesan.includes("could not find the table") ||
    pesan.includes("permission denied")
  );
}

export class MigrasiBelumJalan extends Error {
  constructor() {
    super(
      "Migrasi profil belum tuntas. Jalankan 0001, 0002, 0004, lalu 0005 di supabase/migrations/ " +
        "lewat Supabase SQL Editor — 0001 membuat tabelnya, 0004 memberi hak aksesnya.",
    );
    this.name = "MigrasiBelumJalan";
  }
}

function lempar(error: any) {
  if (migrasiBelumTuntas(error)) throw new MigrasiBelumJalan();
  throw error instanceof Error ? error : new Error(String(error?.message || error));
}

// =========================================================
// BOOKMARK
// =========================================================

export async function daftarBookmark(userId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from("bookmark")
    .select("id_cluster")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) lempar(error);
  return ((data as any[]) || []).map((r) => Number(r.id_cluster));
}

/** Toggle simpan/hapus. Mengembalikan status akhir. */
export async function toggleBookmark(
  userId: string,
  idCluster: number,
): Promise<{ tersimpan: boolean; total: number }> {
  const { data: ada, error: e1 } = await supabase
    .from("bookmark")
    .select("id_cluster")
    .eq("user_id", userId)
    .eq("id_cluster", idCluster)
    .maybeSingle();
  if (e1) lempar(e1);

  if (ada) {
    const { error } = await supabase
      .from("bookmark")
      .delete()
      .eq("user_id", userId)
      .eq("id_cluster", idCluster);
    if (error) lempar(error);
  } else {
    const { error } = await supabase
      .from("bookmark")
      .insert({ user_id: userId, id_cluster: idCluster });
    if (error) lempar(error);
  }

  const { count } = await supabase
    .from("bookmark")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  return { tersimpan: !ada, total: count ?? 0 };
}

// =========================================================
// RIWAYAT BACA
// =========================================================

export async function catatRiwayat(userId: string, idCluster: number): Promise<void> {
  // RPC melakukan insert-or-bump secara atomik.
  const { error } = await supabase.rpc("catat_riwayat", {
    p_user: userId,
    p_cluster: idCluster,
  });
  if (error) lempar(error);
}

export type BarisRiwayat = { id_cluster: number; dibaca_at: string; jumlah_buka: number };

export async function daftarRiwayat(userId: string, limit = 50): Promise<BarisRiwayat[]> {
  const { data, error } = await supabase
    .from("riwayat_baca")
    .select("id_cluster, dibaca_at, jumlah_buka")
    .eq("user_id", userId)
    .order("dibaca_at", { ascending: false })
    .limit(limit);
  if (error) lempar(error);
  return ((data as any[]) || []).map((r) => ({
    id_cluster: Number(r.id_cluster),
    dibaca_at: r.dibaca_at,
    jumlah_buka: Number(r.jumlah_buka) || 1,
  }));
}

export async function hapusRiwayat(userId: string): Promise<void> {
  const { error } = await supabase.from("riwayat_baca").delete().eq("user_id", userId);
  if (error) lempar(error);
}

// =========================================================
// AKTOR YANG DIIKUTI
// =========================================================

export async function daftarAktorDiikuti(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("aktor_diikuti")
    .select("nama_aktor")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) lempar(error);
  return ((data as any[]) || []).map((r) => String(r.nama_aktor));
}

export async function toggleAktor(
  userId: string,
  namaAktor: string,
): Promise<{ diikuti: boolean }> {
  const nama = namaAktor.trim();
  const { data: ada, error: e1 } = await supabase
    .from("aktor_diikuti")
    .select("nama_aktor")
    .eq("user_id", userId)
    .eq("nama_aktor", nama)
    .maybeSingle();
  if (e1) lempar(e1);

  if (ada) {
    const { error } = await supabase
      .from("aktor_diikuti")
      .delete()
      .eq("user_id", userId)
      .eq("nama_aktor", nama);
    if (error) lempar(error);
  } else {
    const { error } = await supabase
      .from("aktor_diikuti")
      .insert({ user_id: userId, nama_aktor: nama });
    if (error) lempar(error);
  }
  return { diikuti: !ada };
}

// =========================================================
// PREFERENSI
// =========================================================

export type Preferensi = {
  tema: "dark" | "light";
  rentang_hari: number;
  kategori_favorit: string | null;
  digest_harian: boolean;
};

export const PREFERENSI_DEFAULT: Preferensi = {
  tema: "dark",
  rentang_hari: 7,
  kategori_favorit: null,
  digest_harian: false,
};

export async function ambilPreferensi(userId: string): Promise<Preferensi> {
  const { data, error } = await supabase
    .from("preferensi_pengguna")
    .select("tema, rentang_hari, kategori_favorit, digest_harian")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) lempar(error);
  if (!data) return { ...PREFERENSI_DEFAULT };
  const d = data as any;
  return {
    tema: d.tema === "light" ? "light" : "dark",
    rentang_hari: Number(d.rentang_hari) ?? 7,
    kategori_favorit: d.kategori_favorit ?? null,
    digest_harian: Boolean(d.digest_harian),
  };
}

export async function simpanPreferensi(
  userId: string,
  patch: Partial<Preferensi>,
): Promise<Preferensi> {
  const sekarang = await ambilPreferensi(userId);
  const baru: Preferensi = { ...sekarang, ...patch };

  const { error } = await supabase.from("preferensi_pengguna").upsert(
    {
      user_id: userId,
      tema: baru.tema,
      rentang_hari: baru.rentang_hari,
      kategori_favorit: baru.kategori_favorit,
      digest_harian: baru.digest_harian,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) lempar(error);
  return baru;
}
