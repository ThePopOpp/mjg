import { NextResponse } from "next/server";
import { listMessageableUsers } from "@/lib/direct-messages/data";
import { getGroupPeople } from "@/lib/direct-messages/eligibility";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { ROLES } from "@/lib/rbac/roles";

// The people-picker for starting a new DM.
// Admins message anyone; facilitators/participants message their group only.
export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") ?? "").trim().toLowerCase();

    if (me.role === ROLES.SUPER_ADMIN || me.role === ROLES.ADMIN) {
      const users = await listMessageableUsers(me.id, search || undefined);
      return NextResponse.json({ ok: true, users });
    }
    if (me.role === ROLES.FACILITATOR || me.role === ROLES.PARTICIPANT) {
      let users = await getGroupPeople(me);
      if (search) users = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(search));
      return NextResponse.json({ ok: true, users });
    }
    return NextResponse.json({ ok: true, users: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load users.";
    return NextResponse.json({ error: message }, { status: message.includes("Authentication required") ? 401 : 400 });
  }
}
