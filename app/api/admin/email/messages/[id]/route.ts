import { NextResponse } from "next/server";
import { updateEmailMessageAction } from "@/lib/email/inbox";
import { requireUserManager } from "@/lib/user-management/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);
    const action = body.action === "delete" ? "delete" : body.action === "remove" ? "remove" : body.action === "hide" ? "hide" : null;

    if (!action) {
      return NextResponse.json({ error: "Valid action is required." }, { status: 400 });
    }

    await updateEmailMessageAction({ id, action, actorUserId: actor.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update email message.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
