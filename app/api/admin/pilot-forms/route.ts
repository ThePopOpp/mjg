import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { logUserActivity } from "@/lib/user-management/repository";
import { listForms, getBuilderForm, ensureSeeds, saveDraft, publishForm, deleteForm } from "@/lib/pilot/forms-data";
import type { PilotFormKind } from "@/lib/pilot/form-types";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required|super/i.test(m) ? 403 : 500; }

export async function GET(request: Request) {
  try {
    const actor = await requireSuperAdmin(request);
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind") as PilotFormKind | null;
    const slug = url.searchParams.get("slug");
    if (slug && kind) return NextResponse.json({ form: await getBuilderForm(kind, slug) });
    await ensureSeeds(actor.id);
    return NextResponse.json({ forms: await listForms(kind ?? undefined) });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load forms.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    switch (body.action) {
      case "save": {
        const form = await saveDraft({
          id: body.id || undefined, kind: body.kind, slug: body.slug, title: String(body.title || "Untitled"),
          description: body.description ?? null, draftDefinition: body.definition, actorUserId: actor.id,
        });
        await logUserActivity({ actorUserId: actor.id, action: "pilot_form_saved", entityType: "pilot_form", entityId: form.id, metadata: { slug: form.slug } }).catch(() => {});
        return NextResponse.json({ form });
      }
      case "publish": {
        const form = await publishForm(String(body.id));
        await logUserActivity({ actorUserId: actor.id, action: "pilot_form_published", entityType: "pilot_form", entityId: form.id, metadata: { slug: form.slug } }).catch(() => {});
        return NextResponse.json({ form });
      }
      case "delete":
        await deleteForm(String(body.id)); return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    const m = error instanceof Error ? error.message : "Action failed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
