import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { createRedirect, deleteRedirect, listRedirects, setRedirectActive } from "@/lib/website/site";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireWebsiteActor(request);
    return NextResponse.json({ redirects: await listRedirects() });
  } catch (error) {
    return fail(error, "Could not load the redirects.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const redirect = await createRedirect({ ...body, actorId: actor.id });
    return NextResponse.json({ redirect });
  } catch (error) {
    return fail(error, "Could not create that redirect.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    await setRedirectActive(String(body.id), body.is_active !== false, { actorId: actor.id });
    return NextResponse.json({ redirects: await listRedirects() });
  } catch (error) {
    return fail(error, "Could not update that redirect.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    await deleteRedirect(String(body.id), { actorId: actor.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error, "Could not remove that redirect.");
  }
}
