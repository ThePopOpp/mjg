import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { saveCmsDraft } from "@/lib/cms/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    await saveCmsDraft(id, body?.content ?? {}, actor.id);
    await logUserActivity({ actorUserId: actor.id, action: "cms_draft_saved", entityType: "cms_page", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to save draft.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
