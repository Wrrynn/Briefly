import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface AIAnalysisResult {
  sentiment: "Positif" | "Negatif" | "Netral";
  confidenceScore: number;
  aiSummary: string;
  keywords: string[];
  impactAnalysis: string[];
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, fullContent, category, source } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const articleText = fullContent || description;

    const prompt = `Kamu adalah analis berita AI yang ahli. Analisis artikel berita berikut dan berikan hasil analisis dalam format JSON yang sangat spesifik.

ARTIKEL:
Judul: ${title}
Kategori: ${category}
Sumber: ${source}
Konten: ${articleText}

Berikan analisis dalam format JSON berikut (HANYA JSON, tanpa teks lain):
{
  "sentiment": "Positif" | "Negatif" | "Netral",
  "confidenceScore": <angka 60-99>,
  "aiSummary": "<ringkasan 2-3 kalimat padat dalam Bahasa Indonesia, fokus pada dampak dan implikasi>",
  "keywords": ["<kata kunci 1>", "<kata kunci 2>", "<kata kunci 3>", "<kata kunci 4>", "<kata kunci 5>"],
  "impactAnalysis": ["<dampak 1 dengan simbol ↑↓↔>", "<dampak 2>", "<dampak 3>"],
  "reasoning": "<alasan singkat 1 kalimat kenapa sentiment ini dipilih>"
}

Aturan:
- sentiment: Positif jika berita memberikan dampak konstruktif/menguntungkan, Negatif jika berisiko/merugikan, Netral jika informatif/mixed
- confidenceScore: refleksikan seberapa jelas sentiment-nya (80-95 untuk yang jelas, 60-79 untuk yang ambigu)
- aiSummary: maksimal 60 kata, padat, fokus pada "apa artinya bagi pembaca"
- keywords: 5 kata/frasa kunci yang paling relevan
- impactAnalysis: tepat 3 item, format "<Aspek> ↑" atau "<Aspek> ↓" atau "<Aspek> ↔"
- reasoning: 1 kalimat singkat dalam Bahasa Indonesia`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON — strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const analysis: AIAnalysisResult = JSON.parse(cleaned);

    // Validate and sanitize
    if (!["Positif", "Negatif", "Netral"].includes(analysis.sentiment)) {
      analysis.sentiment = "Netral";
    }
    analysis.confidenceScore = Math.min(
      99,
      Math.max(60, Math.round(analysis.confidenceScore))
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis API error:", error);

    // Return a graceful fallback instead of a hard 500
    const fallback: AIAnalysisResult = {
      sentiment: "Netral",
      confidenceScore: 70,
      aiSummary:
        "Analisis AI sementara tidak tersedia. Silakan coba beberapa saat lagi.",
      keywords: [],
      impactAnalysis: [],
      reasoning: "Analisis tidak dapat dilakukan saat ini.",
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}
