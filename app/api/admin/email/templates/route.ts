import { NextResponse } from "next/server";
import { saveEmailTemplate, deleteEmailTemplate } from "@/lib/email/templates";
import { requireUserManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);
    const template = await saveEmailTemplate({
      id: body.id,
      name: body.name,
      slug: body.slug,
      subject: body.subject,
      preheader: body.preheader,
      htmlBody: body.htmlBody,
      textBody: body.textBody,
      category: body.category,
      status: body.status,
      actorUserId: actor.id,
    });

    return NextResponse.json({ ok: true, template });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Template save failed.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    await requireUserManager(request, body.actionToken);
    if (!body.id) return NextResponse.json({ error: "Template id is required." }, { status: 400 });
    await deleteEmailTemplate(body.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Template delete failed.";
    const status = message.includes("permission") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
