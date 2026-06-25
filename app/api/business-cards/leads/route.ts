import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { loadLeads } from "@/lib/business-cards/data";

const ADMIN_ROLES = ["super_admin", "admin"];

export async function GET(request: Request) {
  let actor;
  try {
    actor = await requireParticipantManager(request);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }

  const isAdmin = ADMIN_ROLES.includes(actor.role);
  const all = isAdmin && new URL(request.url).searchParams.get("scope") === "all";

  try {
    const leads = await loadLeads({ all, staffId: actor.id });
    return NextResponse.json({ leads });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load leads." }, { status: 500 });
  }
}
