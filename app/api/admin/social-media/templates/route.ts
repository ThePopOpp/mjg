import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { deleteSocialTemplate, saveSocialTemplate } from "@/lib/social-media/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);
    const template = await saveSocialTemplate({
      id: body.id, name: body.name, slug: body.slug, description: body.description, category: body.category,
      status: body.status, platforms: body.platforms, bodyText: body.bodyText, builderSchema: body.builderSchema,
      mediaUrls: body.mediaUrls, hashtags: body.hashtags, linkUrl: body.linkUrl, actorUserId: actor.id,
    });
    return NextResponse.json({ ok: true, template });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Template save failed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    await requireUserManager(request, body.actionToken);
    if (!body.id) return NextResponse.json({ error: "Template id is required." }, { status: 400 });
    await deleteSocialTemplate(body.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Template delete failed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
