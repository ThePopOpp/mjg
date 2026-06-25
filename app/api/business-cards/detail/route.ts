import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { loadCardForEdit } from "@/lib/business-cards/data";

const ADMIN_ROLES = ["super_admin", "admin"];

export async function GET(request: Request) {
  let actor;
  try {
    actor = await requireParticipantManager(request);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const card = await loadCardForEdit(id);
  if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });

  const isAdmin = ADMIN_ROLES.includes(actor.role);
  if (!isAdmin && card.staff_user_id !== actor.id) {
    return NextResponse.json({ error: "You can only view your own card." }, { status: 403 });
  }

  return NextResponse.json({ card });
}
