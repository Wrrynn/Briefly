import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSessionUser, tooManyRequests, unauthorized } from "@/lib/auth";
import { allowRequest } from "@/lib/rate-limit";
import { getClusterIndex, buildSources } from "@/lib/news";
import { analisisFraming, promptFraming } from "@/lib/framing";

export const dynamic = "force-dynamic";

// GET  → perbandingan framing DETERMINISTIK (tanpa AI, selalu tersedia).
// POST → sintesis AI atas perbandingan itu (opsional, butuh ANTHROPIC_API_KEY).

const MODEL = "claude-opus-5";
const SINTESIS_TTL_MS = 24 * 60 * 60 * 1000; // hasil sintesis stabil; cache sehari
const RATE_LIMIT_AI = 10; // panggilan AI per pengguna per menit

// Kunci placeholder di .env contoh ("sk-ant-xxxxxxx") tidak boleh dianggap valid,
// supaya UI menampilkan pesan "belum dikonfigurasi" alih-alih error 401 dari API.
function apiKeyTersedia(): boolean {
  const k = process.env.ANTHROPIC_API_KEY || "";
  return k.startsWith("sk-ant-") && !/x{4,}/i.test(k);
}

const cacheSintesis = new Map<number, { at: number; hasil: unknown }>();

async function muatKlaster(id: number) {
  const entries = await getClusterIndex();
  const entry = entries.find((e) => e.id === id);
  if (!entry) return null;
  const judul = entry.title || "Tanpa Judul";
  return { judul, sources: buildSources(entry.raw.tabel_berita || [], judul) };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const klaster = await muatKlaster(id);
  if (!klaster) return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });

  const analisis = analisisFraming(klaster.sources);
  return NextResponse.json({
    analisis,
    aiTersedia: apiKeyTersedia(),
    sintesis: cacheSintesis.get(id)?.hasil ?? null,
  });
}

const SKEMA = {
  type: "object",
  properties: {
    ringkasan: {
      type: "string",
      description: "Satu paragraf: apa yang sama dan apa yang berbeda antar portal.",
    },
    perbedaan: {
      type: "array",
      description: "Satu entri per portal yang sudut pemberitaannya menonjol.",
      items: {
        type: "object",
        properties: {
          portal: { type: "string" },
          sudut: { type: "string", description: "Satu kalimat penekanan portal ini." },
        },
        required: ["portal", "sudut"],
        additionalProperties: false,
      },
    },
    catatan: {
      type: "string",
      description:
        "Satu kalimat kehati-hatian, mis. bila perbedaannya tipis atau sampelnya sedikit.",
    },
  },
  required: ["ringkasan", "perbedaan", "catatan"],
  additionalProperties: false,
} as const;

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (!allowRequest(`framing:${user.id}`, RATE_LIMIT_AI, 60_000)) return tooManyRequests();

  const id = parseInt((await context.params).id);
  if (isNaN(id)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const tersimpan = cacheSintesis.get(id);
  if (tersimpan && Date.now() - tersimpan.at < SINTESIS_TTL_MS) {
    return NextResponse.json({ sintesis: tersimpan.hasil, dariCache: true });
  }

  if (!apiKeyTersedia()) {
    return NextResponse.json(
      {
        error:
          "Sintesis AI belum aktif: isi ANTHROPIC_API_KEY yang valid di .env lalu restart server.",
      },
      { status: 503 },
    );
  }

  const klaster = await muatKlaster(id);
  if (!klaster) return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });

  const analisis = analisisFraming(klaster.sources);
  if (!analisis.bisaDibandingkan) {
    return NextResponse.json({ error: analisis.alasan }, { status: 400 });
  }

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Fallback sisi server: bila classifier menolak permintaan, Anthropic
      // menjalankan ulang di model pengganti dalam panggilan yang sama.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system:
        "Kamu menganalisis pemberitaan Indonesia. Jawab dalam bahasa Indonesia yang jelas dan netral. Jangan menuduh portal mana pun bias; cukup tunjukkan perbedaan penekanan yang terlihat dari pilihan kata di judul.",
      output_config: {
        // Tugas ini pendek dan terikat pada teks yang diberikan — effort medium
        // sudah cukup dan jauh lebih hemat daripada default (high).
        effort: "medium",
        format: { type: "json_schema", schema: SKEMA },
      },
      messages: [{ role: "user", content: promptFraming(klaster.judul, analisis) }],
    } as any);

    // Claude Opus 5 dapat menolak permintaan (HTTP 200 + stop_reason "refusal").
    // Harus dicek SEBELUM membaca content, yang bisa kosong.
    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "Permintaan ditolak oleh filter keamanan model." },
        { status: 422 },
      );
    }

    const teks = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    let hasil: unknown;
    try {
      hasil = JSON.parse(teks);
    } catch {
      return NextResponse.json(
        { error: "Model tidak mengembalikan JSON yang valid." },
        { status: 502 },
      );
    }

    cacheSintesis.set(id, { at: Date.now(), hasil });
    return NextResponse.json({ sintesis: hasil });
  } catch (e: any) {
    console.error("Framing AI error:", e);
    const status = e?.status === 401 ? 503 : 502;
    return NextResponse.json(
      {
        error:
          status === 503
            ? "ANTHROPIC_API_KEY ditolak. Periksa kembali kuncinya."
            : "Gagal memanggil layanan AI. Coba lagi sebentar lagi.",
      },
      { status },
    );
  }
}
