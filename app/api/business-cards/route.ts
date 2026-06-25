import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeStats, loadCardsForViewer, loadStaffOptions, saveCard } from "@/lib/business-cards/data";
import type { SaveCardPayload } from "@/lib/business-cards/types";

const ADMIN_ROLES = ["super_admin", "admin"];

function errStatus(msg: string) {
  return /authentication/i.test(msg) ? 401 : /permission|required|only/i.test(msg) ? 403 : 500;
}

export async function GET(request: Request) {
  let actor;
  try {
    actor = await requireParticipantManager(request);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: errStatus(msg) });
  }

  const isAdmin = ADMIN_ROLES.includes(actor.role);
  const scope = new URL(request.url).searchParams.get("scope");
  const all = isAdmin && scope === "all";

  try {
    const cards = await loadCardsForViewer({ all, staffId: actor.id });
    const stats = await computeStats(cards);
    const staffOptions = isAdmin ? await loadStaffOptions() : [];
    return NextResponse.json({ cards, stats, role: actor.role, staffId: actor.id, isAdmin, staffOptions });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load cards." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as (SaveCardPayload & { actionToken?: string }) | null;
  let actor;
  try {
    actor = await requireParticipantManager(request, payload?.actionToken);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: errStatus(msg) });
  }
  if (!payload) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const isAdmin = ADMIN_ROLES.includes(actor.role);

  // Ownership guard for non-admins editing an existing card.
  if (payload.id && !isAdmin) {
    const { data } = await createSupabaseAdminClient()
      .from("business_cards").select("staff_user_id").eq("id", payload.id).maybeSingle();
    if (!data || data.staff_user_id !== actor.id) {
      return NextResponse.json({ error: "You can only edit your own card." }, { status: 403 });
    }
  }

  try {
    const card = await saveCard(payload, { ownerStaffId: actor.id, isAdmin });
    return NextResponse.json({ card });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Save failed." }, { status: 400 });
  }
}
