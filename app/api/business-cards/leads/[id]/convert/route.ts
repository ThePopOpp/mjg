// Convert a business-card lead into an MJG record: a Contact or a Participant.
import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";

const ADMIN = ["super_admin", "admin"];
type Target = "contact" | "participant";

function splitName(name: string | null, fallbackEmail: string | null) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0] || (fallbackEmail ? fallbackEmail.split("@")[0] : "Lead");
  const last = parts.slice(1).join(" ");
  return { first, last };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as
    | { target?: Target; contactType?: string; actionToken?: string }
    | null;

  let actor;
  try {
    actor = await requireParticipantManager(request, body?.actionToken);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unauthorized.";
    return NextResponse.json({ error: msg }, { status: /authentication/i.test(msg) ? 401 : 403 });
  }

  const target = body?.target;
  if (target !== "contact" && target !== "participant") {
    return NextResponse.json({ error: "Invalid target." }, { status: 400 });
  }

  const isAdmin = ADMIN.includes(actor.role);
  const sb = createSupabaseAdminClient();

  const { data: lead } = await sb
    .from("business_card_leads")
    .select("id, owner_staff_id, name, email, phone, company, message")
    .eq("id", id).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (!isAdmin && lead.owner_staff_id !== actor.id) {
    return NextResponse.json({ error: "You can only convert leads for your own cards." }, { status: 403 });
  }

  const { first, last } = splitName(lead.name, lead.email);

  try {
    if (target === "contact") {
      const { data, error } = await sb.from("contacts").insert({
        first_name: first, last_name: last, email: lead.email || null, phone: lead.phone || null,
        company: lead.company || null, type: body?.contactType || "lead", status: "active",
        source: "business_card", notes: lead.message || null, created_by: actor.id,
      }).select("id").single();
      if (error) throw new Error(error.message);
      return NextResponse.json({ ok: true, target, id: data.id, label: `${first} ${last}`.trim() || lead.email, href: "/dashboard/contacts" });
    }

    // participant
    if (!lead.email) return NextResponse.json({ error: "Lead has no email — required to enroll a participant." }, { status: 400 });
    const p = await upsertParticipant({
      firstName: first, lastName: last, email: lead.email, phone: lead.phone || undefined, waveSource: "business_card",
    });
    return NextResponse.json({ ok: true, target, id: (p as { id?: string })?.id ?? null, label: `${first} ${last}`.trim() || lead.email, href: "/dashboard/participants" });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Conversion failed." }, { status: 400 });
  }
}
