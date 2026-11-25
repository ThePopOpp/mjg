import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { downloadRecording, updateItem } from "@/lib/dashboard/overview/items";
import { allowed } from "@/lib/dashboard/overview/catalog";

// Transcribe one of your own voice memos (OpenAI Whisper, as /api/workspace/transcribe)
// and save the text as the memo's body. Staff only, since it costs per minute.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    if (!allowed(me.role, "staff")) return NextResponse.json({ error: "Transcription is available to staff." }, { status: 403 });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Transcription isn't configured (OPENAI_API_KEY is missing)." }, { status: 503 });
    if (typeof body.id !== "string") return NextResponse.json({ error: "id is required." }, { status: 400 });

    const audio = await downloadRecording(me.id, body.id);
    if (!audio) return NextResponse.json({ error: "Recording not found." }, { status: 404 });

    const form = new FormData();
    form.append("file", new File([audio.blob], audio.path.split("/").pop() || "memo.webm", { type: audio.blob.type || "audio/webm" }));
    form.append("model", "whisper-1");
    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: form });
    if (!res.ok) return NextResponse.json({ error: `Transcription failed (${res.status}).` }, { status: 502 });
    const text = String(((await res.json()) as { text?: string }).text ?? "").trim();
    const item = await updateItem(me.id, body.id, { body: text });
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transcription failed.";
    return NextResponse.json({ error: message }, { status: /authentication|required|profile/i.test(message) ? 401 : 500 });
  }
}
