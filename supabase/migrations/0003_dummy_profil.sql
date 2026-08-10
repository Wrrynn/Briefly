-- =====================================================================
-- Briefly — DATA DUMMY untuk halaman profil
-- =====================================================================
-- URUTAN JALANKAN:
--   1) 0001_profil_pengguna.sql   (wajib — membuat tabelnya)
--   2) 0003_dummy_profil.sql      (berkas ini)
--
-- CARA PAKAI: Supabase Dashboard → SQL Editor → tempel seluruh isi → Run.
--
-- Isi seed ini memakai id klaster dan nama aktor NYATA dari database Anda,
-- jadi kartu di tab "Tersimpan"/"Riwayat" benar-benar tampil lengkap dengan
-- judul, portal, dan sentimennya — bukan kartu kosong.
--
-- Seed diterapkan ke SEMUA akun di auth.users (pada database pengembangan
-- biasanya hanya akun Anda sendiri). Aman dijalankan berulang: semua
-- INSERT memakai ON CONFLICT DO NOTHING.
--
-- Untuk membersihkan kembali, lihat blok RESET di bagian paling bawah.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Bookmark — 6 klaster terangkum terbaru, waktu simpan dibuat berjenjang
--    agar urutannya terlihat wajar.
-- ---------------------------------------------------------------------
insert into public.bookmark (user_id, id_cluster, created_at)
select u.id,
       x.id_cluster,
       now() - (x.n * interval '5 hours')
from auth.users u
cross join (
  select id_cluster,
         row_number() over (order by waktu_terbentuk desc) as n
  from public.tabel_cluster
  where judul_summary is not null
  order by waktu_terbentuk desc
  limit 6
) x
on conflict (user_id, id_cluster) do nothing;

-- ---------------------------------------------------------------------
-- 2. Riwayat baca — 12 klaster, waktu baca menyebar beberapa hari ke
--    belakang, sebagian dibuka lebih dari sekali.
-- ---------------------------------------------------------------------
insert into public.riwayat_baca (user_id, id_cluster, dibaca_at, jumlah_buka)
select u.id,
       x.id_cluster,
       now() - (x.n * interval '7 hours'),
       1 + (x.n % 3)               -- 1..3 kali buka
from auth.users u
cross join (
  select id_cluster,
         row_number() over (order by waktu_terbentuk desc) as n
  from public.tabel_cluster
  where judul_summary is not null
  order by waktu_terbentuk desc
  limit 12
) x
on conflict (user_id, id_cluster) do nothing;

-- ---------------------------------------------------------------------
-- 3. Aktor yang diikuti — 4 aktor yang paling sering muncul di database.
--    Statistik sentimennya dihitung aplikasi dari data asli, jadi bar
--    positif/netral/negatif langsung terisi.
-- ---------------------------------------------------------------------
insert into public.aktor_diikuti (user_id, nama_aktor, created_at)
select u.id,
       a.nama_aktor,
       now() - (a.n * interval '2 days')
from auth.users u
cross join (
  select btrim(nama_aktor) as nama_aktor,
         row_number() over (order by count(*) desc) as n
  from public.tabel_sentimen_aktor
  where nama_aktor is not null
    and btrim(nama_aktor) <> ''
  group by btrim(nama_aktor)
  order by count(*) desc
  limit 4
) a
on conflict (user_id, nama_aktor) do nothing;

-- ---------------------------------------------------------------------
-- 4. Preferensi — satu baris per pengguna. digest_harian sengaja dinyalakan
--    supaya sakelarnya terlihat aktif di tab Setelan (pengiriman email
--    memang belum ada; label di UI sudah menyatakan itu).
-- ---------------------------------------------------------------------
insert into public.preferensi_pengguna (user_id, tema, rentang_hari, digest_harian)
select id, 'dark', 7, true
from auth.users
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------
-- 5. VERIFIKASI — hasilnya harus mendekati: disimpan 6, dibaca 12, diikuti 4.
-- ---------------------------------------------------------------------
select
  (select count(*) from public.bookmark)            as disimpan,
  (select count(*) from public.riwayat_baca)        as dibaca,
  (select count(*) from public.aktor_diikuti)       as diikuti,
  (select count(*) from public.preferensi_pengguna) as baris_preferensi;

-- =====================================================================
-- RESET — hapus tanda komentar pada empat baris di bawah bila ingin
-- membuang seluruh data dummy dan kembali ke profil kosong.
-- =====================================================================
-- delete from public.bookmark;
-- delete from public.riwayat_baca;
-- delete from public.aktor_diikuti;
-- delete from public.preferensi_pengguna;
