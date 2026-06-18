import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);

    const entityType: "participant" | "profile" = body.entityType;
    const entityIds: string[] = body.entityIds ?? [];
    const channel: "sms" | "email" = body.channel;
    const eventType: "opt_in" | "opt_out" = body.eventType;

    if (!entityType || !["participant", "profile"].includes(entityType))
      return NextResponse.json({ error: "entityType must be 'participant' or 'profile'." }, { status: 400 });
    if (!entityIds.length)
      return NextResponse.json({ error: "At least one entity ID is required." }, { status: 400 });
    if (!channel || !["sms", "email"].includes(channel))
      return NextResponse.json({ error: "channel must be 'sms' or 'email'." }, { status: 400 });
    if (!eventType || !["opt_in", "opt_out"].includes(eventType))
      return NextResponse.json({ error: "eventType must be 'opt_in' or 'opt_out'." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const table = entityType === "participant" ? "participants" : "profiles";

    const update: Record<string, unknown> = {};
    if (channel === "sms") {
      if (eventType === "opt_in") {
        update.sms_opt_in = true;
        update.sms_opt_in_at = now;
        update.sms_opt_in_source = "admin_manual";
      } else {
        update.sms_opt_in = false;
        update.sms_opt_out_at = now;
      }
    } else {
      if (eventType === "opt_in") {
        update.email_opt_in = true;
        update.email_opt_in_at = now;
        update.email_opt_in_source = "admin_manual";
        if (entityType === "participant") update.future_updates_opt_in = true;
      } else {
        update.email_opt_in = false;
        update.email_opt_out_at = now;
        if (entityType === "participant") {
          update.email_journey_opt_in = false;
          update.future_updates_opt_in = false;
        }
      }
    }

    await supabase.from(table).update(update).in("id", entityIds);

    const consentInserts = entityIds.map((id) => ({
      entity_type: entityType,
      entity_id: id,
      channel,
      event_type: eventType,
      source: "admin_manual" as const,
      performed_by: actor.id,
    }));

    await supabase.from("consent_events").insert(consentInserts);

    return NextResponse.json({ ok: true, updated: entityIds.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update opt status.";
    const httpStatus = message.includes("required") || message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status: httpStatus });
  }
}

export async function GET(request: Request) {
  try {
    await requireAdminManager(request);
    const supabase = createSupabaseAdminClient();

    const [participantSms, participantEmail, profileSms, profileEmail] = await Promise.all([
      supabase.from("participants").select("id", { count: "exact", head: true }).eq("sms_opt_in", true),
      supabase.from("participants").select("id", { count: "exact", head: true }).eq("email_opt_in", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("sms_opt_in", true).neq("role", "participant"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("email_opt_in", true).neq("role", "participant"),
    ]);

    const [totalParticipants, totalProfiles] = await Promise.all([
      supabase.from("participants").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).neq("role", "participant"),
    ]);

    return NextResponse.json({
      participants: {
        total: totalParticipants.count ?? 0,
        smsOptIn: participantSms.count ?? 0,
        emailOptIn: participantEmail.count ?? 0,
        smsOptOut: (totalParticipants.count ?? 0) - (participantSms.count ?? 0),
        emailOptOut: (totalParticipants.count ?? 0) - (participantEmail.count ?? 0),
      },
      profiles: {
        total: totalProfiles.count ?? 0,
        smsOptIn: profileSms.count ?? 0,
        emailOptIn: profileEmail.count ?? 0,
        smsOptOut: (totalProfiles.count ?? 0) - (profileSms.count ?? 0),
        emailOptOut: (totalProfiles.count ?? 0) - (profileEmail.count ?? 0),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch opt stats.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
