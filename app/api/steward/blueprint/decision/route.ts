import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getCurrentProfile } from "@/lib/auth/server";
import { approveWording, declineWording } from "@/lib/steward/blueprint-service";

// The member approves or declines proposed wording.
//
// THIS IS THE ONLY PATH ONTO A BLUEPRINT, and it is reachable only by a signed-
// in member acting on their own record. The agent cannot call it: it has no
// member session, and the service credential it does hold opens a different
// endpoint that has no approve tool on it at all.
//
// Which is the whole architecture in one paragraph — Steward proposes through
// one door, the member approves through another, and the two doors are not
// connected.

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const proposalId = typeof body?.proposalId === "string" ? body.proposalId : null;
  const decision = body?.decision === "approve" || body?.decision === "decline" ? body.decision : null;

  if (!proposalId || !decision) {
    return NextResponse.json({ error: "proposalId and decision are required." }, { status: 400 });
  }

  // Server-generated: a double-click must not approve twice, and the browser
  // has no business deciding what counts as the same action.
  const idempotencyKey = `member:${decision}:${proposalId}`;

  if (decision === "decline") {
    const receipt = await declineWording({ profileId: profile.id, versionId: proposalId, idempotencyKey });
    return NextResponse.json({
      saved: false,
      declined: receipt.persistence_status === "confirmed",
      error: receipt.error,
    });
  }

  const { receipt, sectionState } = await approveWording({
    profileId: profile.id,
    versionId: proposalId,
    idempotencyKey,
  });

  // The receipt is the answer. `saved` is true only for a confirmed write —
  // a pending or unknown result is reported as what it is, because the one
  // thing this endpoint must never do is tell a member their words are on
  // their Blueprint when we do not know that.
  return NextResponse.json({
    saved: receipt.persistence_status === "confirmed",
    status: receipt.persistence_status,
    sectionState,
    error: receipt.error,
  });
}
