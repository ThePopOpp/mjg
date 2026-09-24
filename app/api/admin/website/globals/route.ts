import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { listGlobals, updateGlobal } from "@/lib/website/site";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireWebsiteActor(request);
    return NextResponse.json({ globals: await listGlobals() });
  } catch (error) {
    return fail(error, "Could not load the global content.");
  }
}

// Global content shows on every page, so this is a high-risk write (spec §32):
// updateGlobal() validates each value against the item's existing shape.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const global = await updateGlobal(String(body.key), body.value ?? {}, { actorId: actor.id });
    return NextResponse.json({ global });
  } catch (error) {
    return fail(error, "Could not save that global content item.");
  }
}
