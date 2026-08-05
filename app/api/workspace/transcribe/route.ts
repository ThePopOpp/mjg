import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";

// Transcribes an uploaded audio blob to text via OpenAI (Whisper). Super-admin gated.
export async function POST(request: Request) {
  try {
    await requireSuperAdmin(request);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Transcription isn't configured (OPENAI_API_KEY is missing)." }, { status: 503 });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No audio file was provided." }, { status: 400 });

    const oaForm = new FormData();
    oaForm.append("file", file, file.name || "recording.webm");
    oaForm.append("model", "whisper-1");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: oaForm,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json({ error: `Transcription failed (${res.status}). ${detail}`.slice(0, 300) }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({ ok: true, text: (data?.text ?? "").trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed.";
    const status = message.includes("permission") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
