import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteCard, reassignCard, setCardStatus } from "@/lib/business-cards/data";
import type { CardStatus } from "@/lib/business-cards/types";

const ADMIN_ROLES = ["super_admin", "admin"];
const VALID_STATUS: CardStatus[] = ["draft", "published", "unpublished", "archived"];

class CardError extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } }

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required|only|not found/i.test(msg) ? 403 : 500;
}

async function authorize(request: Request, id: string, actionToken?: string) {
  const actor = await requireParticipantManager(request, actionToken);
  const isAdmin = ADMIN_ROLES.includes(actor.role);
  const { data } = await createSupabaseAdminClient()
    .from("business_cards").select("staff_user_id").eq("id", id).maybeSingle();
  if (!data) throw new CardError("Card not found.", 404);
  if (!isAdmin && data.staff_user_id !== actor.id) {
    throw new CardError("You can only manage your own card.", 403);
  }
  return { actor, isAdmin };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as
    { status?: CardStatus; staff_user_id?: string | null; actionToken?: string } | null;
  let isAdmin = false;
  try {
    ({ isAdmin } = await authorize(request, id, body?.actionToken));
  } catch (err) {
    const status = err instanceof CardError ? err.status : errStatus(err instanceof Error ? err.message : "");
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unauthorized." }, { status });
  }
  if (!body) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  try {
    if (body.status) {
      if (!VALID_STATUS.includes(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      await setCardStatus(id, body.status);
    }
    if (body.staff_user_id !== undefined) {
      if (!isAdmin) return NextResponse.json({ error: "Only admins can reassign cards." }, { status: 403 });
      await reassignCard(id, body.staff_user_id);
    }
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
    const status = err instanceof CardError ? err.status : errStatus(err instanceof Error ? err.message : "");
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unauthorized." }, { status });
  }
  try {
    await deleteCard(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." }, { status: 400 });
  }
}
