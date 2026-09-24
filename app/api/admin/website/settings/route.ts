import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { getEditorSettings, setEditorSettings } from "@/lib/website/site";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireWebsiteActor(request);
    return NextResponse.json({ settings: await getEditorSettings() });
  } catch (error) {
    return fail(error, "Could not load the editor settings.");
  }
}

// Direct publishing is OFF by default and only a Super Admin can turn it on
// (spec §16). Protected and legal pages ignore it regardless.
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const settings = await setEditorSettings(
      { allowStewardDirectPublish: body.allowStewardDirectPublish === true },
      { actorId: actor.id },
    );
    return NextResponse.json({ settings });
  } catch (error) {
    return fail(error, "Could not save the editor settings.");
  }
}
