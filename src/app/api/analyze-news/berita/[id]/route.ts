import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { transformCluster, q } from "../route";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  // Ambil hasil summarize dari TABEL CLUSTER (id_cluster). tabel_berita di-embed
  // = daftar sumber (berita mentah bahan clustering).
  const { data, error } = await q(() =>
    supabase
      .from("tabel_cluster")
      .select(
        `
        id_cluster,
        judul_summary,
        summary_text,
        waktu_terbentuk,
        jumlah_berita,
        tabel_sentimen_aktor (
          nama_aktor,
          sentimen,
          persentase
        ),
        tabel_berita (
          id_berita,
          judul,
          isi_teks,
          portal_sumber,
          url_asli,
          waktu_rilis,
          created_at,
          status_proses
        )
      `,
      )
      .eq("id_cluster", id)
      .single(),
  );

  if (error || !data) {
    return NextResponse.json(
      { error: "Berita tidak ditemukan" },
      { status: 404 },
    );
  }

  // Prediksi sektor untuk klaster ini.
  const { data: sektorData } = await q(() =>
    supabase
      .from("tabel_sektor")
      .select("nama_sektor, prediksi_dampak, tingkat_risiko")
      .eq("id_cluster", id),
  );

  return NextResponse.json({
    data: transformCluster(data, sektorData || []),
  });
}
