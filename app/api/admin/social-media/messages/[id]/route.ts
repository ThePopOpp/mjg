import { NextRequest, NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { deleteMessage, updateMessage } from "@/lib/social-media/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await requireUserManager(request, body.actionToken);
    await updateMessage(id, { status: body.status, reply_text: body.reply_text });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to update message.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireUserManager(request, body.actionToken);
    await deleteMessage(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to delete message.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
