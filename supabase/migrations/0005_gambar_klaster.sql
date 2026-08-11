-- =====================================================================
-- Briefly — cache gambar pratinjau kartu berita
-- =====================================================================
-- CARA PAKAI: Supabase Dashboard → SQL Editor → tempel → Run.
-- Aman dijalankan berulang. Jalankan setelah 0004.
--
-- LATAR BELAKANG
-- Klaster tidak menyimpan gambar; yang tersedia hanya url_asli tiap berita
-- anggotanya. Aplikasi mengambil <meta property="og:image"> dari halaman
-- sumber, lalu menyimpan hasilnya di sini.
--
-- Tabel ini murni CACHE — isinya boleh dihapus kapan saja, aplikasi akan
-- mengambil ulang. Tanpa tabel ini aplikasi tetap jalan (cache memori saja),
-- tapi setiap server restart berarti seluruh gambar di-scrape ulang dari
-- portal berita: lambat bagi pengguna dan tidak sopan bagi portalnya.
--
-- url_gambar NULL bukan berarti "belum dicoba" — artinya SUDAH dicoba dan
-- portalnya memang tidak menyediakan og:image (atau menolak permintaan).
-- Nilai null inilah yang mencegah percobaan berulang tanpa henti; aplikasi
-- mencoba lagi setelah beberapa jam berdasarkan diambil_at.
-- =====================================================================

create table if not exists public.app_gambar_klaster (
  id_cluster bigint      primary key,
  url_gambar text,
  url_sumber text,
  diambil_at timestamptz not null default now()
);

-- Dipakai untuk membersihkan entri lama / mencari yang perlu disegarkan.
create index if not exists app_gambar_klaster_diambil_idx
  on public.app_gambar_klaster (diambil_at);

-- ---------------------------------------------------------------------
-- RLS — tabel ini hanya disentuh server lewat service-role.
-- ---------------------------------------------------------------------
-- Sengaja TANPA policy: dengan RLS aktif dan tidak ada policy, anon maupun
-- authenticated tidak bisa membaca/menulis langsung, sementara service_role
-- (yang mem-bypass RLS) tetap bisa. Isinya bukan data sensitif, tapi tidak
-- ada alasan membukanya — klien mengambil gambar lewat /api/gambar.
alter table public.app_gambar_klaster enable row level security;

-- Tabel yang dibuat di project ini tidak otomatis mewarisi hak untuk
-- service_role (lihat 0002 dan 0004), jadi grant ditulis eksplisit.
grant select, insert, update, delete on public.app_gambar_klaster to service_role;

-- ---------------------------------------------------------------------
-- VERIFIKASI
-- ---------------------------------------------------------------------
select table_name, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where grantee = 'service_role'
  and table_schema = 'public'
  and table_name = 'app_gambar_klaster'
group by table_name;
