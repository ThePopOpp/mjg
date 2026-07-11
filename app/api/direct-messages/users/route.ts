import { NextResponse } from "next/server";
import { listMessageableUsers } from "@/lib/direct-messages/data";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { ROLES } from "@/lib/rbac/roles";

// The people-picker for starting a new DM. v1: admins only (they initiate).
export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    if (me.role !== ROLES.SUPER_ADMIN && me.role !== ROLES.ADMIN) {
      return NextResponse.json({ ok: true, users: [] });
    }
    const url = new URL(request.url);
    const users = await listMessageableUsers(me.id, url.searchParams.get("search") ?? undefined);
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load users.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication required") ? 401 : 400 });
  }
}
