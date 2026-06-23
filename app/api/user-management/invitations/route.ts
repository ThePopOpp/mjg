import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { createUserInvitation } from "@/lib/user-management/repository";
import { ROLES, isAppRole } from "@/lib/rbac/roles";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);

    if (!isAppRole(body.role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Only a Super Admin may grant the Super Admin role — prevents privilege escalation.
    if (body.role === ROLES.SUPER_ADMIN && actor.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Only a Super Admin can invite another Super Admin." }, { status: 403 });
    }

    const invitation = await createUserInvitation({
      email: body.email,
      phone: body.phone,
      role: body.role,
      inviteMethod: body.inviteMethod ?? "email",
      invitedBy: actor.id,
      siteUrl: body.siteUrl,
    });

    return NextResponse.json({ ok: true, invitation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invitation failed.";
    const status = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
