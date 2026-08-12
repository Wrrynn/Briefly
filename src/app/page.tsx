import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import NewsHome from "@/app/components/NewsHome";
import Landing from "@/app/components/Landing";

// Root "/" bersifat publik & kondisional:
// - Belum login  -> tampilkan Landing (promosi) agar pengunjung tertarik daftar.
// - Sudah login  -> tampilkan aplikasi berita (NewsHome).
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <Landing />;

  // NewsHome membaca filter dari alamat lewat useSearchParams, dan Next
  // mewajibkan komponen semacam itu berada di dalam batas Suspense.
  // Fallback-nya diberi warna latar halaman, bukan kosong, supaya tidak ada
  // kedipan putih bila render sempat tertunda.
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-[#05051a]" />}>
      <NewsHome />
    </Suspense>
  );
}
