import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { loadCompletedEdits, setCompletedReviewedAt } from "@/lib/cms/completed-edits";

// Completed Edits — history of finished requests from both sources, plus the
// unreviewed-since-last-visit count behind the CMS tab badge.
// Super-admin only, matching the rest of the CMS + edit-request APIs.

function errStatus(m: string) {
  return /authentication/i.test(m) ? 401 : /permission|required|super/i.test(m) ? 403 : 500;
}

export async function GET(request: Request) {
  try {
    const actor = await requireSuperAdmin(request);
    return NextResponse.json(await loadCompletedEdits(actor.id));
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load completed edits.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

// Called when the tab is opened: stamps the watermark so the badge clears. The
// response carries unreviewed: 0 so the caller doesn't need a second round trip.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body?.actionToken);
    if (body?.action !== "mark_reviewed") {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
    const reviewedAt = await setCompletedReviewedAt(actor.id);
    return NextResponse.json({ ok: true, reviewedAt, unreviewed: 0 });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to mark reviewed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
