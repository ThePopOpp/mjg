import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import {
  applyChangeSetToDraft, approveAndPublishChangeSet, changeSetDiff, getChangeSet,
  listChangeSets, pendingChangeSets, rejectChangeSet,
} from "@/lib/website/change-sets";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireWebsiteActor(request);
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    if (id) {
      const changeSet = await getChangeSet(id);
      if (!changeSet) throw new Error("That change set no longer exists.");
      return NextResponse.json({ changeSet, diff: changeSetDiff(changeSet) });
    }
    if (params.get("pending") === "1") return NextResponse.json({ changeSets: await pendingChangeSets() });
    return NextResponse.json({
      changeSets: await listChangeSets({
        pageId: params.get("pageId") ?? undefined,
        status: params.get("status") ?? undefined,
      }),
    });
  } catch (error) {
    return fail(error, "Could not load the proposed changes.");
  }
}

/**
 * Approve / apply / reject (spec §14). "apply" is the default landing point for
 * a Steward proposal: it writes the DRAFT and leaves publishing to the owner.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));
    const id = String(body.id ?? "");

    switch (String(body.action)) {
      case "apply":
        return NextResponse.json(await applyChangeSetToDraft(id, { actorId: actor.id }));
      case "approve":
        return NextResponse.json(await approveAndPublishChangeSet(id, { actorId: actor.id }));
      case "reject":
        return NextResponse.json({ changeSet: await rejectChangeSet(id, { actorId: actor.id, reason: body.reason }) });
      default:
        throw new Error("Unknown change-set action.");
    }
  } catch (error) {
    return fail(error, "Could not act on that proposed change.");
  }
}
