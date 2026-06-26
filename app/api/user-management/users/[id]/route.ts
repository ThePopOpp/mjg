import { NextResponse } from "next/server";
import { ROLES } from "@/lib/rbac/roles";
import { requireUserManager } from "@/lib/user-management/auth";
import { deleteUserProfile, getUserManagementProfile } from "@/lib/user-management/repository";

// The owner account can never be deleted, even by another Super Admin.
const OWNER_EMAILS = new Set(["jw@michaeljgauthier.com"]);

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const actor = await requireUserManager(request, body.actionToken);

    if (id === actor.id) {
      return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
    }

    const { profile } = await getUserManagementProfile(id);
    if (!profile) return NextResponse.json({ error: "User not found." }, { status: 404 });
    const target = profile as { email?: string | null; role?: string | null };

    if (target.email && OWNER_EMAILS.has(target.email.trim().toLowerCase())) {
      return NextResponse.json({ error: "The owner account cannot be deleted." }, { status: 403 });
    }
    // Only a Super Admin may delete a Super Admin (parity with the edit guard).
    if (target.role === ROLES.SUPER_ADMIN && actor.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Only a Super Admin can delete a Super Admin account." }, { status: 403 });
    }

    await deleteUserProfile({ id, actorUserId: actor.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "User delete failed.";
    const status = message.includes("permission") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
