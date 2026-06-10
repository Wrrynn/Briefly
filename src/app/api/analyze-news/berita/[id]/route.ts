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
      created_at,
      status_proses,
      id_cluster,
      tabel_cluster (
        judul_summary,
        summary_text,
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

    // Fetch sibling sources + sector predictions for the same cluster
    let siblingSources: { portal: string; url: string }[] = [];
    let sektorList: any[] = [];
    if (data.id_cluster) {
        const [{ data: sumberData }, { data: sektorData }] = await Promise.all([
            supabase
                .from("tabel_berita")
                .select("judul, portal_sumber, url_asli")
                .eq("id_cluster", data.id_cluster),
            supabase
                .from("tabel_sektor")
                .select("nama_sektor, prediksi_dampak, tingkat_risiko")
                .eq("id_cluster", data.id_cluster),
        ]);

        if (sumberData) {
            // Skor relevansi: jumlah kata judul yang sama dengan judul berita ini
            const tokenize = (t: string) =>
                new Set(
                    (t || "")
                        .toLowerCase()
                        .replace(/[^a-z0-9\s]/g, " ")
                        .split(/\s+/)
                        .filter((w) => w.length > 3),
                );
            const baseTokens = tokenize(data.judul);
            const relevance = (t: string) => {
                let score = 0;
                tokenize(t).forEach((w) => {
                    if (baseTokens.has(w)) score++;
                });
                return score;
            };

            const seen = new Set<string>();
            // 1. Sumber berita ini sendiri = paling relevan, selalu di urutan pertama
            if (data.url_asli) {
                seen.add(data.url_asli);
                siblingSources.push({
                    portal: data.portal_sumber || data.url_asli,
                    url: data.url_asli,
                });
            }
            // 2. Sumber lain dalam cluster, diurutkan dari yang paling relevan
            const others = sumberData
                .filter((s: any) => s.url_asli && !seen.has(s.url_asli) && seen.add(s.url_asli))
                .map((s: any) => ({
                    portal: s.portal_sumber || s.url_asli,
                    url: s.url_asli,
                    score: relevance(s.judul),
                }))
                .sort((a: any, b: any) => b.score - a.score);

            siblingSources.push(...others.map(({ portal, url }: { portal: any; url: any }) => ({ portal, url })));
            // 3. Batasi maksimal 5 sumber paling relevan per berita
            siblingSources = siblingSources.slice(0, 5);
        }
        sektorList = sektorData || [];
    }

    return NextResponse.json({
        data: transformBerita(data, siblingSources, sektorList),
    });
}
