import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { mediaUsage, searchMedia, updateMediaAltText } from "@/lib/website/media";

export const dynamic = "force-dynamic";

// Reads the existing media library (media_assets / Media Studio) rather than
// creating a second one, so uploads are managed in exactly one place.
export async function GET(request: NextRequest) {
  try {
    await requireWebsiteActor(request);
    const params = new URL(request.url).searchParams;
    const usageFor = params.get("usageFor");
    if (usageFor) return NextResponse.json({ usage: await mediaUsage(usageFor) });
    return NextResponse.json({
      media: await searchMedia({
        query: params.get("query") ?? undefined,
        assetType: params.get("assetType") ?? undefined,
      }),
    });
  } catch (error) {
    return fail(error, "Could not load the media library.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const item = await updateMediaAltText(String(body.id), String(body.altText ?? ""), { actorId: actor.id });
    return NextResponse.json({ item });
  } catch (error) {
    return fail(error, "Could not update that media item.");
  }
}
