-- =====================================================================
-- Briefly — perbaikan hak akses tabel metrik klik
-- =====================================================================
-- CARA PAKAI: Supabase Dashboard → SQL Editor → tempel → Run.
--
-- MASALAH YANG DIPERBAIKI
-- Setiap kali seseorang membuka halaman analisis, aplikasi mencatat satu
-- klik unik ke public.metrik_klik_unik. Peran `service_role` TIDAK punya
-- hak INSERT ke tabel itu, sehingga Postgres menolak dengan:
--
--     42501: permission denied for table metrik_klik_unik
--
-- Versi lama kode hanya membaca `data` dari hasil upsert dan tidak pernah
-- memeriksa `error`, jadi penolakan ini tertelan diam-diam: tidak ada
-- pesan, tidak ada error 500 — jumlah "dilihat" hanya diam di angka lama
-- selamanya. Akibatnya trending juga ikut salah, karena skornya bertumpu
-- pada jumlah klik.
--
-- Aman dijalankan berulang.
-- =====================================================================

grant select, insert on public.metrik_klik_unik to service_role;

-- tabel_metrik ditulis lewat fungsi tambah_metrik(). Bila fungsi itu bukan
-- SECURITY DEFINER, ia berjalan sebagai pemanggil dan butuh hak yang sama.
-- Baris ini tidak berbahaya bila haknya memang sudah ada.
grant select, insert, update on public.tabel_metrik to service_role;

-- Verifikasi cepat setelah dijalankan — harus mengembalikan baris untuk
-- service_role dengan privilege INSERT:
--
--   select grantee, privilege_type
--   from information_schema.role_table_grants
--   where table_name = 'metrik_klik_unik' and grantee = 'service_role';
