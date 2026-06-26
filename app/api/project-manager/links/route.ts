import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { addItemLink } from "@/lib/project-manager/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body?.actionToken);
    if (!body?.item_id || !body?.target_id) throw new Error("item_id and target_id are required.");
    if (!["user", "participant", "contact"].includes(body.link_type)) throw new Error("Invalid link type.");
    const link = await addItemLink({
      item_id: String(body.item_id), link_type: body.link_type, target_id: String(body.target_id),
      display_name: body.display_name ?? null, email: body.email ?? null, phone: body.phone ?? null,
      created_by: actor.id,
    });
    return NextResponse.json({ link });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Link add failed";
    return NextResponse.json({ message: m }, { status: errStatus(m) });
  }
}
