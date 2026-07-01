import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { listBlockTemplates, createBlockTemplate } from "@/lib/cms/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    return NextResponse.json({ templates: await listBlockTemplates() });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load templates.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const tpl = await createBlockTemplate({ name: body.name, kind: body.kind, content: body.content, actorUserId: actor.id });
    await logUserActivity({ actorUserId: actor.id, action: "cms_block_template_created", entityType: "cms_block_template", entityId: tpl.id, metadata: { name: tpl.name, kind: tpl.kind } });
    return NextResponse.json({ template: tpl });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to save template.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
