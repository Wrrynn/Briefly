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

  return user ? <NewsHome /> : <Landing />;
}
