import { NextResponse } from "next/server";
import { getThread, sendMessage } from "@/lib/direct-messages/data";
import { requireActiveProfile } from "@/lib/user-management/auth";

function fail(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = message.includes("Authentication required") ? 401 : message.toLowerCase().includes("participant") ? 403 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await requireActiveProfile(request);
    const { id } = await params;
    const thread = await getThread(me.id, id);
    if (!thread) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    return NextResponse.json({ ok: true, ...thread });
  } catch (error) {
    return fail(error, "Failed to load conversation.");
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const me = await requireActiveProfile(request, body.actionToken);
    const { id } = await params;
    const message = await sendMessage(me.id, id, {
      body: String(body.body ?? ""),
      importance: body.importance,
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
    });
    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return fail(error, "Failed to send message.");
  }
}
