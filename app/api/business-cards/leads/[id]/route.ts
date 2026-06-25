import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { deleteLead, getLeadOwner, updateLeadStatus } from "@/lib/business-cards/data";
import type { LeadStatus } from "@/lib/business-cards/types";

const ADMIN_ROLES = ["super_admin", "admin"];
const VALID: LeadStatus[] = ["new", "contacted", "qualified", "archived"];

class LeadError extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } }

async function authorize(request: Request, id: string, actionToken?: string) {
  const actor = await requireParticipantManager(request, actionToken);
  const isAdmin = ADMIN_ROLES.includes(actor.role);
  const lead = await getLeadOwner(id);
  if (!lead) throw new LeadError("Lead not found.", 404);
  if (!isAdmin && lead.owner_staff_id !== actor.id) {
    throw new LeadError("You can only manage leads for your own cards.", 403);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as { status?: LeadStatus; actionToken?: string } | null;
  try {
    await authorize(request, id, body?.actionToken);
  } catch (err) {
    const status = err instanceof LeadError ? err.status : 401;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unauthorized." }, { status });
  }
  if (!body?.status || !VALID.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  try {
    await updateLeadStatus(id, body.status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Update failed." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as { actionToken?: string } | null;
  try {
    await authorize(request, id, body?.actionToken);
  } catch (err) {
    const status = err instanceof LeadError ? err.status : 401;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unauthorized." }, { status });
  }
  try {
    await deleteLead(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." }, { status: 400 });
  }
}
