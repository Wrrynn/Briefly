import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "30");

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
    .eq("status_proses", 1)
    .not("id_cluster", "is", null)
    .order("waktu_rilis", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Supabase Error:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transformed = (data || []).map(transformBerita);

  return NextResponse.json({
    data: transformed,
    total: transformed.length,
  });
}

export function transformBerita(item: any) {
  const cluster = item.tabel_cluster;
  const aktors = cluster?.tabel_sentimen_aktor || [];

  const sentiments = aktors.slice(0, 3).map((a: any) => ({
    type: a.sentimen as "Positif" | "Negatif" | "Netral",
    percentage: a.persentase,
    description: `${a.nama_aktor} — sentimen ${a.sentimen.toLowerCase()} terdeteksi.`,
  }));

  const impacts = [
    cluster?.sektor_terdampak
      ? {
          name: `#${cluster.sektor_terdampak.toUpperCase()}`,
          percentage: 75,
        }
      : null,

    cluster?.tingkat_risiko
      ? {
          name: `RISIKO: ${cluster.tingkat_risiko.toUpperCase()}`,
          percentage: 60,
        }
      : null,

    ...aktors.slice(0, 1).map((a: any) => ({
      name: `#${a.nama_aktor.toUpperCase().replace(/ /g, "_")}`,
      percentage: a.persentase,
    })),
  ].filter(Boolean);

  return {
    id: item.id_berita,

    title: item.judul,

    category: detectCategory(item.judul || "", item.isi_teks || ""),

    description:
      cluster?.summary_text?.slice(0, 150) ||
      item.isi_teks?.slice(0, 150) ||
      "",

    sentiments:
      sentiments.length > 0
        ? sentiments
        : [
            {
              type: "Netral",
              percentage: 50,
              description: "Analisis sedang diproses.",
            },
          ],

    impacts:
      impacts.length > 0
        ? impacts
        : [
            {
              name: "#BERITA",
              percentage: 50,
            },
          ],

    source: item.portal_sumber || "Unknown",

    url: item.url_asli,

    time: formatRelativeTime(item.waktu_rilis),

    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",

    fullContent: item.isi_teks || "",

    aiSummary: cluster?.summary_text || "",

    keywords: cluster?.sektor_terdampak ? [cluster.sektor_terdampak] : [],

    publishedAt: item.waktu_rilis
      ? new Date(item.waktu_rilis).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-",
  };
}

function detectCategory(judul: string, isi: string): string {
  const teks = `${judul} ${isi}`.toLowerCase();

  if (/politik|presiden|dpr|pemilu|partai|pemerintah|menteri|kabinet|legislatif|koalisi/.test(teks)) {
    return "Politik";
  }

  if (/saham|ihsg|rupiah|inflasi|ekonomi|bank|investasi|keuangan|ekspor|impor|neraca/.test(teks)) {
    return "Ekonomi";
  }

  if (/bola|liga|gol|timnas|atletik|olahraga|pertandingan|turnamen|juara|medali/.test(teks)) {
    return "Olahraga";
  }

  if (/teknologi|startup|\bai\b|kecerdasan buatan|machine learning|digital|aplikasi|gadget|siber|robot|komputasi/.test(teks)) {
    return "Teknologi";
  }

  if (/film|musik|selebriti|artis|hiburan|konser|drama|sinema|aktor|aktris/.test(teks)) {
    return "Hiburan";
  }

  if (/bisnis|perusahaan|korporasi|merger|akuisisi|saham|pasar|perdagangan|ekspansi/.test(teks)) {
    return "Bisnis";
  }

  if (/kesehatan|rumah sakit|dokter|obat|penyakit|vaksin|medis|pasien|pandemi|wabah/.test(teks)) {
    return "Kesehatan";
  }

  return "Umum";
}

function formatRelativeTime(waktu: string) {
  if (!waktu) return "Baru saja";

  const diff = Date.now() - new Date(waktu).getTime();

  const menit = Math.floor(diff / 60000);
  const jam = Math.floor(diff / 3600000);
  const hari = Math.floor(jam / 24);

  if (menit < 60) return `${menit} menit lalu`;
  if (jam < 24) return `${jam} jam lalu`;

  return `${hari} hari lalu`;
}
