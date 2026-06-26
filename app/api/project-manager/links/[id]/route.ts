import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { deleteItemLink } from "@/lib/project-manager/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireParticipantManager(request, body?.actionToken);
    await deleteItemLink(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Link delete failed";
    return NextResponse.json({ message: m }, { status: errStatus(m) });
  }
}
