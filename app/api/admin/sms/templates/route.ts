import { NextResponse } from "next/server";
import { requireParticipantManager, requireAdminManager } from "@/lib/user-management/auth";
import { listSmsTemplates, saveSmsTemplate } from "@/lib/sms/outbound";

export async function GET(request: Request) {
  try {
    await requireParticipantManager(request);
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") ?? "active") as "active" | "draft" | "all";
    return NextResponse.json({ templates: await listSmsTemplates(status) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch templates.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);
    const saved = await saveSmsTemplate({
      id: body.id ?? null,
      name: String(body.name ?? ""),
      body: String(body.body ?? ""),
      category: String(body.category ?? "general"),
      status: body.status,
      actorId: actor.id,
    });
    return NextResponse.json({ ok: true, id: saved.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save template.";
    const httpStatus = message.includes("required") ? 400 : message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}
