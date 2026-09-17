import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { createDashboardNotification } from "@/lib/notifications/notify";
import { dmBadge, getNotifierId } from "@/lib/notifications/system-dm";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { SECTION_MAX, TOTAL_MAX, sectionByKey, type EnergyAuditScore } from "@/lib/energy-audit/energy-audit";

// Always alert these two, even if their role wouldn't otherwise receive it.
const ALWAYS_EMAIL = ["mike@strategicincomegroup.com", "jwaters@qallus.co"];

function esc(v: string) {
  return v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export type EnergyAuditTeamContext = {
  participantId: string | null;
  /** Facilitators leading a team this person belongs to. */
  facilitators: { id: string; email: string | null; name: string }[];
  teamNames: string[];
};

/**
 * Resolve the audit taker's team context by email: participant record → team memberships →
 * the facilitators leading those teams. Lookup only — never creates a participant.
 */
export async function resolveEnergyAuditTeam(email: string | null): Promise<EnergyAuditTeamContext> {
  const empty: EnergyAuditTeamContext = { participantId: null, facilitators: [], teamNames: [] };
  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) return empty;

  const supabase = createSupabaseAdminClient();
  const { data: participant } = await supabase.from("participants").select("id").ilike("email", normalized).maybeSingle();
  if (!participant) return empty;

  const { data: memberships } = await supabase
    .from("facilitator_team_members")
    .select("team_id")
    .eq("participant_id", participant.id);
  const teamIds = (memberships ?? []).map((m) => m.team_id as string);
  if (!teamIds.length) return { ...empty, participantId: participant.id };

  const { data: teams } = await supabase
    .from("facilitator_teams")
    .select("id,name,facilitator_id")
    .in("id", teamIds)
    .not("facilitator_id", "is", null);

  const facilitatorIds = Array.from(new Set((teams ?? []).map((t) => t.facilitator_id as string).filter(Boolean)));
  if (!facilitatorIds.length) {
    return { participantId: participant.id, facilitators: [], teamNames: (teams ?? []).map((t) => t.name as string) };
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,email,first_name,last_name,full_name")
    .in("id", facilitatorIds)
    .eq("status", "active");

  return {
    participantId: participant.id,
    facilitators: (profiles ?? []).map((p: any) => ({
      id: p.id as string,
      email: (p.email as string) ?? null,
      name: p.full_name || `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || (p.email as string) || "Facilitator",
    })),
    teamNames: (teams ?? []).map((t) => t.name as string),
  };
}

/**
 * Alert on a completed Energy Audit: the team's facilitator (if the taker is on a team) gets a
 * DM badge + a styled email, Mike/Jeremy/super admins get the summary, and a dashboard
 * notification record is written. Every step is best-effort — the audit is already saved.
 */
export async function alertEnergyAudit(input: {
  name: string | null;
  email: string | null;
  score: EnergyAuditScore;
  auditId: string;
  focusSource?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { name, email, score, auditId } = input;
  const site = publicSiteUrl();
  const displayName = name?.trim() || email || "Someone";
  const focus = input.focusSource ? sectionByKey(input.focusSource as any) : sectionByKey(score.lowest);

  const team = await resolveEnergyAuditTeam(email).catch((e) => {
    console.error("[energy-audit-alert] team lookup failed", e instanceof Error ? e.message : e);
    return { participantId: null, facilitators: [], teamNames: [] } as EnergyAuditTeamContext;
  });

  // ── 1. Emails: facilitators (personal framing) + admins (summary) ───────────────
  const { data: admins } = await supabase
    .from("profiles")
    .select("email")
    .eq("role", "super_admin")
    .eq("status", "active")
    .not("email", "is", null);
  const adminRecipients = Array.from(
    new Set([...(admins ?? []).map((a) => a.email as string), ...ALWAYS_EMAIL].filter(Boolean).map((e) => e.toLowerCase())),
  );
  const facilitatorEmails = team.facilitators.map((f) => f.email).filter((e): e is string => Boolean(e));

  const rows = score.sections
    .map(
      (s) =>
        `<tr><td style="padding:5px 0;font-family:Arial,sans-serif;font-size:13px;color:#3a3632;">${esc(s.title)} <span style="color:#7a736a;">· ${esc(s.level)}</span></td><td style="padding:5px 0;text-align:right;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#191815;">${s.score}/${SECTION_MAX}</td></tr>`,
    )
    .join("");

  const buildEmail = (audience: "facilitator" | "admin") => {
    const gold = "#C9A46E";
    const ink = "#191815";
    const eyebrow = audience === "facilitator" ? "Someone on your team" : "New Energy Audit";
    const lead =
      audience === "facilitator"
        ? `${esc(displayName)} just completed the Energy Audit${team.teamNames.length ? ` (${esc(team.teamNames.join(", "))})` : ""}.`
        : `${esc(displayName)} completed the Energy Audit.`;
    const cta =
      audience === "facilitator"
        ? `<a href="${site}/dashboard/team" style="display:inline-block;background:${gold};color:${ink};text-decoration:none;padding:14px 34px;border-radius:8px;font-size:15px;font-weight:700;">View your team &rarr;</a>`
        : `<a href="${site}/dashboard/energy-audit" style="display:inline-block;background:${gold};color:${ink};text-decoration:none;padding:14px 34px;border-radius:8px;font-size:15px;font-weight:700;">View all Energy Audits &rarr;</a>`;

    return `<div style="background:#f1eee7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;"><tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:26px 40px 0;text-align:center;">
          <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="104" alt="MJG" style="width:104px;height:auto;border:0;" /></td></tr>
        <tr><td style="padding:16px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>
        <tr><td style="padding:22px 40px 2px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${gold};font-weight:700;">${eyebrow}</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;line-height:1.25;color:${ink};font-weight:700;">${lead}</h1>
        </td></tr>
        <tr><td style="padding:14px 40px 0;">
          <div style="text-align:center;border:1px solid #e7e1d5;border-radius:10px;padding:20px;">
            <div style="font-size:38px;font-weight:700;color:${ink};">${score.total}<span style="font-size:17px;color:#7a736a;"> / ${TOTAL_MAX}</span></div>
            <div style="font-size:15px;font-weight:700;color:${ink};margin-top:2px;">${esc(score.interpretation.title)}</div>
          </div></td></tr>
        <tr><td style="padding:16px 40px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#3a3632;">
          <strong>Name:</strong> ${esc(name || "—")}<br/>
          <strong>Email:</strong> ${esc(email || "—")}<br/>
          <strong>Renewing:</strong> ${esc(focus.title)}
        </td></tr>
        <tr><td style="padding:14px 40px 0;">
          <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #eee7db;">${rows}</table></td></tr>
        ${audience === "facilitator" ? `<tr><td style="padding:16px 40px 0;font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#7a736a;">A low score isn't a failure — it's an opening. Consider a short, unhurried conversation about what's draining them and what one rhythm could help.</td></tr>` : ""}
        <tr><td style="padding:22px 40px 30px;text-align:center;">${cta}</td></tr>
      </table></td></tr></table></div>`;
  };

  const textSummary = `${displayName} completed the Energy Audit\nScore: ${score.total}/${TOTAL_MAX} — ${score.interpretation.title}\nEmail: ${email || "—"}\nRenewing: ${focus.title}\n\n${score.sections.map((s) => `- ${s.title} (${s.level}): ${s.score}/${SECTION_MAX}`).join("\n")}`;

  if (facilitatorEmails.length) {
    await sendSmtpEmail({
      to: facilitatorEmails,
      subject: `${displayName} completed the Energy Audit · ${score.total}/${TOTAL_MAX}`,
      html: buildEmail("facilitator"),
      text: `${textSummary}\n\nView your team: ${site}/dashboard/team`,
    }).catch((e) => console.error("[energy-audit-alert] facilitator email failed", e instanceof Error ? e.message : e));
  }

  if (adminRecipients.length) {
    await sendSmtpEmail({
      to: adminRecipients,
      subject: `New Energy Audit — ${displayName} · ${score.total}/${TOTAL_MAX} (${score.interpretation.title})`,
      html: buildEmail("admin"),
      text: `${textSummary}\n\nView: ${site}/dashboard/energy-audit`,
    }).catch((e) => console.error("[energy-audit-alert] admin email failed", e instanceof Error ? e.message : e));
  }

  // ── 2. DM bell badges: facilitators + Mike/Jeremy ───────────────────────────────
  try {
    const notifierId = await getNotifierId(supabase);
    if (notifierId) {
      const { data: alwaysTargets } = await supabase.from("profiles").select("id,email").in("email", ALWAYS_EMAIL);
      const recipientIds = new Set<string>([
        ...team.facilitators.map((f) => f.id),
        ...((alwaysTargets ?? []).map((t) => t.id as string)),
      ]);
      const body = `⚡ Energy Audit completed\n${displayName} · ${score.total}/${TOTAL_MAX} · ${score.interpretation.title}\nRenewing: ${focus.title}${email ? `\n${email}` : ""}`;
      for (const rid of recipientIds) {
        await dmBadge(supabase, notifierId, rid, body).catch((e) =>
          console.error("[energy-audit-alert] dm failed", rid, e instanceof Error ? e.message : e),
        );
      }
    }
  } catch (e) {
    console.error("[energy-audit-alert] dm block failed", e instanceof Error ? e.message : e);
  }

  // ── 3. Dashboard notification record ────────────────────────────────────────────
  await createDashboardNotification({
    type: "energy_audit_completed",
    title: "New Energy Audit",
    message: `${displayName} scored ${score.total}/${TOTAL_MAX} — ${score.interpretation.title} · renewing ${focus.title}`,
    participantId: team.participantId ?? undefined,
    metadata: {
      name,
      email,
      total: score.total,
      interpretation: score.interpretation.title,
      lowest: score.lowest,
      focus: focus.key,
      auditId,
      teamNames: team.teamNames,
      facilitatorsNotified: team.facilitators.map((f) => f.email).filter(Boolean),
    },
  }).catch((e) => console.error("[energy-audit-alert] notification failed", e instanceof Error ? e.message : e));
}
