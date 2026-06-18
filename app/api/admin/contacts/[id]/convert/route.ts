import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const actor = await requireParticipantManager(request, body.actionToken);
    const target: "participant" | "profile" = body.target ?? "participant";

    const supabase = createSupabaseAdminClient();

    const { data: contact, error: fetchErr } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchErr || !contact) return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    if (contact.status === "converted") return NextResponse.json({ error: "Already converted." }, { status: 400 });

    let convertedId: string | null = null;

    if (target === "participant") {
      const { data: participant, error: pErr } = await supabase
        .from("participants")
        .insert({
          first_name:   contact.first_name ?? "",
          last_name:    contact.last_name  ?? "",
          email:        contact.email      ?? null,
          phone:        contact.phone      ?? null,
          source:       contact.source     ?? "contact_import",
          notes:        contact.notes      ?? null,
          sms_opt_in:   contact.sms_opt_in,
          email_opt_in: contact.email_opt_in,
          status:       "active",
        })
        .select("id")
        .single();
      if (pErr) throw pErr;
      convertedId = participant.id;

      await supabase.from("contacts").update({
        status: "converted",
        converted_to_participant_id: convertedId,
        converted_at: new Date().toISOString(),
      }).eq("id", id);

      return NextResponse.json({ ok: true, target: "participant", participantId: convertedId });
    }

    if (target === "profile") {
      // Profiles require Supabase Auth — we create a profile row only; admin must invite via User Management
      const { data: profile, error: prErr } = await supabase
        .from("profiles")
        .insert({
          full_name: [contact.first_name, contact.last_name].filter(Boolean).join(" ") || "Unknown",
          email:     contact.email ?? null,
          phone:     contact.phone ?? null,
          role:      "team_member",
          status:    "invited",
        })
        .select("id")
        .single();
      if (prErr) throw prErr;
      convertedId = profile.id;

      await supabase.from("contacts").update({
        status: "converted",
        converted_to_profile_id: convertedId,
        converted_at: new Date().toISOString(),
      }).eq("id", id);

      return NextResponse.json({ ok: true, target: "profile", profileId: convertedId });
    }

    return NextResponse.json({ error: "Invalid target." }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Conversion failed.";
    return NextResponse.json({ error: msg }, { status: msg.includes("required") ? 403 : 500 });
  }
}
