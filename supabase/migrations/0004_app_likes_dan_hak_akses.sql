-- =====================================================================
-- Briefly — tabel LIKE aplikasi + hak akses service-role
-- =====================================================================
-- CARA PAKAI: Supabase Dashboard → SQL Editor → tempel seluruh isi file
-- ini → Run. Aman dijalankan berulang.
--
-- URUTAN JALANKAN (dari database kosong):
--   1) 0001_profil_pengguna.sql        — tabel profil + fungsi catat_riwayat
--   2) 0002_perbaikan_hak_metrik.sql   — hak akses metrik klik
--   3) 0004_app_likes_dan_hak_akses.sql — berkas ini
--   4) 0003_dummy_profil.sql           — opsional, data contoh (butuh 0001)
--
-- ---------------------------------------------------------------------
-- MASALAH YANG DIPERBAIKI
-- ---------------------------------------------------------------------
-- (a) public.app_likes sudah terlanjur dibuat manual lewat Dashboard, jadi
--     tidak pernah ada di repo ini. Database baru yang di-setup dari folder
--     migrations tidak akan punya tabelnya sama sekali, dan endpoint
--     /api/likes gagal dengan PGRST205 (tabel tidak ditemukan).
--
-- (b) Di database yang sudah ada tabelnya pun, `service_role` TIDAK punya
--     hak apa pun atasnya:
--
--         42501: permission denied for table app_likes
--
--     Endpoint /api/likes memverifikasi sesi lebih dulu lalu menulis pakai
--     service-role (bypass RLS) dengan user_id terverifikasi — pola yang
--     sama dipakai seluruh API di proyek ini. Tanpa grant, tombol like di
--     footer gagal untuk SEMUA pengguna.
--
-- (c) Grant serupa ditegaskan ulang untuk empat tabel profil dari 0001.
--     Ini bukan hiasan: tabel yang dibuat lewat Dashboard di project ini
--     terbukti TIDAK otomatis mewarisi hak untuk service_role (itulah sebab
--     0002 harus ada untuk metrik_klik_unik). Tanpa baris-baris di bawah,
--     menjalankan 0001 hanya menukar galat "tabel tidak ditemukan" menjadi
--     "permission denied" — gejala berbeda, fitur tetap mati.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tabel like aplikasi — satu like per pengguna, dedup lewat primary key
-- ---------------------------------------------------------------------
create table if not exists public.app_likes (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. RLS — lapisan pertahanan kedua (aplikasi memakai service-role SETELAH
--    memverifikasi sesi; policy ini menjaga data bila suatu saat tabelnya
--    diakses langsung dengan anon key)
-- ---------------------------------------------------------------------
alter table public.app_likes enable row level security;

drop policy if exists app_likes_milik_sendiri on public.app_likes;
create policy app_likes_milik_sendiri on public.app_likes
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 3. Hak akses service-role
-- ---------------------------------------------------------------------
-- app_likes: GET menghitung total (select), POST menyalakan/mematikan like
-- (insert + delete). Update tidak dipakai.
grant select, insert, delete on public.app_likes to service_role;

-- Tabel profil dari 0001 — lihat catatan (c) di kepala berkas.
grant select, insert, update, delete on public.bookmark            to service_role;
grant select, insert, update, delete on public.riwayat_baca        to service_role;
grant select, insert, update, delete on public.aktor_diikuti       to service_role;
grant select, insert, update, delete on public.preferensi_pengguna to service_role;

-- catat_riwayat() dipanggil lewat supabase.rpc() memakai service-role.
grant execute on function public.catat_riwayat(uuid, bigint) to service_role;

-- ---------------------------------------------------------------------
-- 4. VERIFIKASI — jalankan setelah Run. Harus mengembalikan 5 baris, satu
--    per tabel, semuanya dengan privileges yang disebut di atas.
-- ---------------------------------------------------------------------
select table_name, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where grantee = 'service_role'
  and table_schema = 'public'
  and table_name in (
    'app_likes', 'bookmark', 'riwayat_baca', 'aktor_diikuti', 'preferensi_pengguna'
  )
group by table_name
order by table_name;
