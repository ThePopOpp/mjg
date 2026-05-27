import { NextResponse } from "next/server";
import { isAppRole } from "@/lib/rbac/roles";
import { requireUserManager } from "@/lib/user-management/auth";
import { USER_STATUSES, upsertProfile } from "@/lib/user-management/repository";

export async function POST(request: Request) {
  try {
    const actor = await requireUserManager();
    const body = await request.json();

    if (!isAppRole(body.role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (!USER_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const profile = await upsertProfile({
      id: body.id,
      authUserId: body.authUserId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      role: body.role,
      status: body.status,
      avatarUrl: body.avatarUrl,
      invitedBy: body.invitedBy,
      relatedParticipantId: body.relatedParticipantId,
      notes: body.notes,
      actorUserId: actor.id,
      statusChangeReason: body.statusChangeReason,
    });

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "User save failed.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
