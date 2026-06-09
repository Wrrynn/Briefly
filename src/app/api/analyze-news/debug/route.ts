import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Cek semua berita tanpa filter
  const { data: allBerita, error: errorAll } = await supabase
    .from("tabel_berita")
    .select("id_berita, judul, status_proses, id_cluster, waktu_rilis")
    .order("waktu_rilis", { ascending: false })
    .limit(10);

  // Cek berita yang sudah diproses
  const { data: processedBerita, error: errorProcessed } = await supabase
    .from("tabel_berita")
    .select("id_berita, judul, status_proses, id_cluster")
    .eq("status_proses", 1)
    .limit(5);

  // Cek berita dengan cluster
  const { data: clusteredBerita, error: errorClustered } = await supabase
    .from("tabel_berita")
    .select("id_berita, judul, id_cluster")
    .not("id_cluster", "is", null)
    .limit(5);

  // Count statistics
  const { count: totalCount } = await supabase
    .from("tabel_berita")
    .select("*", { count: "exact", head: true });

  const { count: processedCount } = await supabase
    .from("tabel_berita")
    .select("*", { count: "exact", head: true })
    .eq("status_proses", 1);

  const { count: clusteredCount } = await supabase
    .from("tabel_berita")
    .select("*", { count: "exact", head: true })
    .not("id_cluster", "is", null);

  return NextResponse.json({
    statistics: {
      total_berita: totalCount,
      berita_status_proses_1: processedCount,
      berita_dengan_cluster: clusteredCount,
      berita_yang_ditampilkan: clusteredCount, // yang memenuhi semua kondisi
    },
    samples: {
      latest_10_berita: allBerita,
      latest_processed_berita: processedBerita,
      latest_clustered_berita: clusteredBerita,
    },
    errors: {
      errorAll,
      errorProcessed,
      errorClustered,
    },
    info: {
      message:
        "Aplikasi hanya menampilkan berita dengan status_proses=1 DAN id_cluster NOT NULL",
      recommendation:
        "Pastikan Colab worker berjalan untuk memproses dan meng-cluster berita baru",
    },
  });
}
