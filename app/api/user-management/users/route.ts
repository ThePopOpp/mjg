import { NextResponse } from "next/server";
import { ROLES, isAppRole } from "@/lib/rbac/roles";
import { requireUserManager } from "@/lib/user-management/auth";
import { USER_STATUSES } from "@/lib/user-management/constants";
import { getUserManagementProfile, upsertProfile } from "@/lib/user-management/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);

    if (!isAppRole(body.role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Only a Super Admin may grant the Super Admin role. This applies both when
    // promoting a user TO super_admin and when editing an existing super_admin
    // (so an admin cannot quietly take over a Super Admin account).
    if (body.role === ROLES.SUPER_ADMIN && actor.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Only a Super Admin can assign the Super Admin role." }, { status: 403 });
    }
    if (actor.role !== ROLES.SUPER_ADMIN && body.id) {
      const existing = await getUserManagementProfile(body.id);
      if ((existing.profile as { role?: string } | null)?.role === ROLES.SUPER_ADMIN) {
        return NextResponse.json({ error: "Only a Super Admin can modify a Super Admin account." }, { status: 403 });
      }
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
