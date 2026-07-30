import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { createDocument } from "@/lib/workspace/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    const scope = body.scope === "shared" ? "shared" : "personal";
    const result = await createDocument({ title: typeof body.title === "string" ? body.title : undefined, scope, folderId: body.folderId ?? null }, actor.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create document.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
