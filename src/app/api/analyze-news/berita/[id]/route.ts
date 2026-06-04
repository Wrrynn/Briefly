import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { transformBerita } from "../route";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tabel_berita")
    .select(
      `
      id_berita,
      judul,
      isi_teks,
      portal_sumber,
      url_asli,
      waktu_rilis,
      id_cluster,
      tabel_cluster (
        judul_summary,
        summary_text,
        sektor_terdampak,
        prediksi_dampak,
        tingkat_risiko,
        tabel_sentimen_aktor (
          nama_aktor,
          sentimen,
          persentase
        )
      )
    `,
    )
    .eq("id_berita", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Berita tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: transformBerita(data) });
}
