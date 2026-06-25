import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadCardAnalytics } from "@/lib/business-cards/data";

const ADMIN_ROLES = ["super_admin", "admin"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let actor;
  try {
    actor = await requireParticipantManager(request);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }

  const isAdmin = ADMIN_ROLES.includes(actor.role);
  if (!isAdmin) {
    const { data } = await createSupabaseAdminClient()
      .from("business_cards").select("staff_user_id").eq("id", id).maybeSingle();
    if (!data || data.staff_user_id !== actor.id) {
      return NextResponse.json({ error: "You can only view analytics for your own card." }, { status: 403 });
    }
  }

  const range = Number(new URL(request.url).searchParams.get("range") || "30");
  const rangeDays = [7, 30, 90].includes(range) ? range : 30;
  try {
    const analytics = await loadCardAnalytics(id, rangeDays);
    return NextResponse.json({ analytics });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load analytics." }, { status: 500 });
  }
}
