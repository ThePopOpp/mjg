import { NextResponse } from "next/server";
import { saveAudioSortOrder } from "@/lib/content/media";
import { requireAdminManager } from "@/lib/user-management/auth";

// Persists the Listen-page running order set by dragging tracks in Media Studio.
// The client sends the WHOLE list, not just the moved track, so sort_order stays
// dense (0,1,2…) and two people reordering can't interleave into a broken sequence.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);

    const orderedIds: unknown = body.orderedIds;
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "orderedIds must be an array of asset ids." }, { status: 400 });
    }

    const result = await saveAudioSortOrder(orderedIds as string[], actor.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Saving the track order failed.";
    const status = message.includes("Authentication required") ? 401 : message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
