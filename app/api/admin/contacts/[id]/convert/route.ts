import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";
import { createUserInvitation } from "@/lib/user-management/repository";
import { ROLES } from "@/lib/rbac/roles";

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

    const contactEmail = (contact.email ?? "").trim();

    if (target === "participant") {
      // Participants are keyed by email (NOT NULL) and deduped via upsertParticipant — the
      // old raw insert set a non-existent `status` column and allowed null email, so it
      // always 500'd.
      if (!contactEmail) return NextResponse.json({ error: "This contact has no email — add one before converting to a participant." }, { status: 400 });
      const participant = await upsertParticipant({
        firstName: contact.first_name ?? "",
        lastName: contact.last_name ?? "",
        email: contactEmail,
        phone: contact.phone ?? undefined,
        waveSource: contact.source ?? "contact_import",
      });
      convertedId = participant.id;
      // Carry over the contact's notes + opt-in flags (not part of upsertParticipant).
      await supabase.from("participants").update({
        notes: contact.notes ?? null,
        sms_opt_in: contact.sms_opt_in ?? false,
        email_opt_in: contact.email_opt_in ?? false,
        updated_at: new Date().toISOString(),
      }).eq("id", convertedId);

      await supabase.from("contacts").update({
        status: "converted",
        converted_to_participant_id: convertedId,
        converted_at: new Date().toISOString(),
      }).eq("id", id);

      return NextResponse.json({ ok: true, target: "participant", participantId: convertedId });
    }

    if (target === "profile") {
      // A profile needs a Supabase Auth user (profiles.id → auth.users), so the old raw
      // profile insert always failed. The correct "convert to profile" is an account
      // invitation the contact accepts.
      if (!contactEmail) return NextResponse.json({ error: "This contact has no email — add one before converting to a profile." }, { status: 400 });
      const invitation = await createUserInvitation({ email: contactEmail, role: ROLES.TEAM_MEMBER, inviteMethod: "email", invitedBy: actor.id });

      await supabase.from("contacts").update({
        status: "converted",
        converted_at: new Date().toISOString(),
      }).eq("id", id);

      return NextResponse.json({ ok: true, target: "profile", invited: true, invitationId: invitation.id });
    }

    return NextResponse.json({ error: "Invalid target." }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Conversion failed.";
    return NextResponse.json({ error: msg }, { status: msg.includes("required") ? 403 : 500 });
  }
}
