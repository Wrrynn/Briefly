-- =====================================================================
-- Briefly — tabel pendukung HALAMAN PROFIL PENGGUNA
-- =====================================================================
-- CARA PAKAI: buka Supabase Dashboard → SQL Editor → tempel seluruh isi
-- file ini → Run. Aman dijalankan berulang (semua pakai IF NOT EXISTS).
--
-- Catatan desain:
-- * id_cluster sengaja TIDAK diberi foreign key ke tabel_cluster supaya
--   migrasi ini tidak gagal bila tipe kolom di sana berbeda. Integritas
--   dijaga di sisi aplikasi (id selalu berasal dari klaster yang tampil).
-- * RLS diaktifkan sebagai lapisan pertahanan kedua. Aplikasi mengakses
--   tabel ini lewat service-role (bypass RLS) SETELAH memverifikasi sesi,
--   tetapi policy di bawah membuat data tetap aman andai suatu saat
--   diakses langsung dengan anon key.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Berita yang disimpan pengguna
-- ---------------------------------------------------------------------
create table if not exists public.bookmark (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  id_cluster bigint      not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id_cluster)
);

create index if not exists bookmark_user_terbaru_idx
  on public.bookmark (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 2. Riwayat baca (satu baris per pengguna+klaster, diperbarui tiap buka)
-- ---------------------------------------------------------------------
create table if not exists public.riwayat_baca (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  id_cluster   bigint      not null,
  dibaca_at    timestamptz not null default now(),
  jumlah_buka  integer     not null default 1,
  primary key (user_id, id_cluster)
);

create index if not exists riwayat_user_terbaru_idx
  on public.riwayat_baca (user_id, dibaca_at desc);

-- Catat/menaikkan riwayat secara atomik (hindari race saat dua tab dibuka).
create or replace function public.catat_riwayat(p_user uuid, p_cluster bigint)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.riwayat_baca (user_id, id_cluster)
  values (p_user, p_cluster)
  on conflict (user_id, id_cluster) do update
    set dibaca_at   = now(),
        jumlah_buka = public.riwayat_baca.jumlah_buka + 1;
$$;

-- ---------------------------------------------------------------------
-- 3. Aktor yang diikuti
-- ---------------------------------------------------------------------
create table if not exists public.aktor_diikuti (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  nama_aktor text        not null,
  created_at timestamptz not null default now(),
  primary key (user_id, nama_aktor)
);

-- ---------------------------------------------------------------------
-- 4. Preferensi pengguna
-- ---------------------------------------------------------------------
create table if not exists public.preferensi_pengguna (
  user_id          uuid        primary key references auth.users (id) on delete cascade,
  tema             text        not null default 'dark',
  rentang_hari     integer     not null default 7,
  kategori_favorit text,
  digest_harian    boolean     not null default false,
  updated_at       timestamptz not null default now(),
  constraint tema_valid    check (tema in ('dark', 'light')),
  constraint rentang_valid check (rentang_hari in (0, 1, 7, 30))
);

-- ---------------------------------------------------------------------
-- 5. RLS — tiap pengguna hanya boleh menyentuh barisnya sendiri
-- ---------------------------------------------------------------------
alter table public.bookmark            enable row level security;
alter table public.riwayat_baca        enable row level security;
alter table public.aktor_diikuti       enable row level security;
alter table public.preferensi_pengguna enable row level security;

drop policy if exists bookmark_milik_sendiri on public.bookmark;
create policy bookmark_milik_sendiri on public.bookmark
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists riwayat_milik_sendiri on public.riwayat_baca;
create policy riwayat_milik_sendiri on public.riwayat_baca
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists aktor_milik_sendiri on public.aktor_diikuti;
create policy aktor_milik_sendiri on public.aktor_diikuti
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists preferensi_milik_sendiri on public.preferensi_pengguna;
create policy preferensi_milik_sendiri on public.preferensi_pengguna
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
