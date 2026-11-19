import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getCurrentProfile } from "@/lib/auth/server";
import { approveWording, declineWording, reviseWording } from "@/lib/steward/blueprint-service";

// The member approves, declines, or rewrites proposed wording.
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
  const decision =
    body?.decision === "approve" || body?.decision === "decline" || body?.decision === "revise" ? body.decision : null;

  if (!proposalId || !decision) {
    return NextResponse.json({ error: "proposalId and decision are required." }, { status: 400 });
  }

  // Server-generated: a double-click must not approve twice, and the browser
  // has no business deciding what counts as the same action.
  const idempotencyKey = `member:${decision}:${proposalId}`;

  if (decision === "revise") {
    // The member rewrote the suggestion in their own words (Steward V2.1). The
    // rewrite replaces the pending suggestion; it is approved only if they
    // clicked "Add my version", and only through approveWording.
    const wording = typeof body?.wording === "string" ? body.wording : "";
    const digest = createHash("sha256").update(wording.trim()).digest("hex").slice(0, 16);
    const revised = await reviseWording({
      profileId: profile.id,
      versionId: proposalId,
      value: wording,
      idempotencyKey: `${idempotencyKey}:${digest}`,
    });
    const newId = revised.versionId;
    if (revised.receipt.persistence_status !== "confirmed" || !newId) {
      return NextResponse.json({ revised: false, saved: false, error: revised.receipt.error });
    }
    if (body?.approve !== true) {
      return NextResponse.json({ revised: true, saved: false, proposalId: newId });
    }
    const { receipt, sectionState } = await approveWording({
      profileId: profile.id,
      versionId: newId,
      idempotencyKey: `member:approve:${newId}`,
    });
    return NextResponse.json({
      revised: true,
      saved: receipt.persistence_status === "confirmed",
      status: receipt.persistence_status,
      proposalId: newId,
      sectionState,
      error: receipt.error,
    });
  }

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
