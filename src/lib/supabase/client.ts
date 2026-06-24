import { createBrowserClient } from "@supabase/ssr";

// Client Supabase untuk dipakai di BROWSER (Client Components).
// Memakai anon/publishable key — aman karena dibatasi RLS.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
