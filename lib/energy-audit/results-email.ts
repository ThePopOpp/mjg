import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTemplateEmail } from "@/lib/email/templates";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import {
  SECTION_MAX, TOTAL_MAX, sectionByKey,
  type EnergyAuditNextStep, type EnergyAuditScore, type EnergySource,
} from "@/lib/energy-audit/energy-audit";

export const ENERGY_AUDIT_TEMPLATE_SLUG = "energy-audit-results";

function esc(v: string) {
  return v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

/**
 * Send the taker their results using the editable `energy-audit-results` email template.
 *
 * renderTemplate only does flat {{key}} substitution — no loops — so anything table-shaped
 * (the four score rows, the refill list, the optional commitments block) is pre-rendered here
 * and passed in as a single merge field.
 */
export async function sendEnergyAuditResultsEmail(input: {
  to: string;
  name: string | null;
  score: EnergyAuditScore;
  nextStep: EnergyAuditNextStep;
  auditId: string;
  profileId?: string | null;
  participantId?: string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  const supabase = createSupabaseAdminClient();
  const { data: template } = await supabase
    .from("email_templates")
    .select("id,status")
    .eq("slug", ENERGY_AUDIT_TEMPLATE_SLUG)
    .maybeSingle();

  if (!template) return { sent: false, reason: "template-missing" };
  if (template.status === "archived") return { sent: false, reason: "template-archived" };

  const site = publicSiteUrl();
  const { score, nextStep } = input;
  const focus = sectionByKey((nextStep.lowestEnergySource ?? score.lowest) as EnergySource);
  const strongest = sectionByKey(score.strongest);
  const first = (input.name ?? "").trim().split(/\s+/)[0] || "there";

  const energyRowsHtml = score.sections
    .map((s) => {
      const pct = Math.round((s.score / SECTION_MAX) * 100);
      const isFocus = s.key === focus.key;
      return `<tr>
        <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:14px;color:#3a3632;width:42%;">${esc(s.title)}${isFocus ? ' <span style="color:#C9A46E;font-weight:700;">&bull;</span>' : ""}<br /><span style="font-size:12px;color:#7a736a;">${esc(s.level)}</span></td>
        <td style="padding:8px 8px;width:38%;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;border-radius:5px;"><tr>
            <td style="background:#C9A46E;border-radius:5px;height:10px;width:${pct}%;font-size:0;line-height:0;">&nbsp;</td>
            <td style="font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td>
        <td style="padding:8px 0;text-align:right;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#191815;white-space:nowrap;">${s.score}/${SECTION_MAX}</td>
      </tr>`;
    })
    .join("");

  const commitments = [
    nextStep.nextAction && { label: "This week, I will", value: nextStep.nextAction },
    nextStep.conversationPerson && { label: "One person to talk with", value: nextStep.conversationPerson },
    nextStep.renewalRhythm && { label: "One rhythm to renew this energy", value: nextStep.renewalRhythm },
  ].filter(Boolean) as { label: string; value: string }[];

  // Whole table row, so the section disappears cleanly when they committed to nothing.
  const nextActionBlockHtml = commitments.length
    ? `<tr><td style="padding:22px 40px 0;">
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A46E;font-weight:700;">What you committed to</p>
        ${commitments
          .map(
            (c) =>
              `<p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#3a3632;"><strong style="color:#191815;">${esc(c.label)}:</strong> ${esc(c.value)}</p>`,
          )
          .join("")}
      </td></tr>`
    : "";

  const result = await sendTemplateEmail({
    templateId: template.id as string,
    recipient: {
      email: input.to,
      first_name: first,
      full_name: input.name ?? "",
      profile_id: input.profileId ?? null,
      participant_id: input.participantId ?? null,
      merge_data: {
        total_score: String(score.total),
        total_max: String(TOTAL_MAX),
        interpretation_title: score.interpretation.title,
        interpretation_meaning: score.interpretation.meaning,
        interpretation_reflection: score.interpretation.reflection,
        focus_title: focus.title,
        focus_refills_html: `<ul style="margin:0;padding-left:20px;">${focus.refills
          .map((r) => `<li style="font-size:14px;line-height:1.7;color:#3a3632;margin:0 0 6px;">${esc(r)}</li>`)
          .join("")}</ul>`,
        focus_refills_text: focus.refills.map((r) => `- ${r}`).join("\n"),
        energy_rows_html: energyRowsHtml,
        energy_rows_text: score.sections.map((s) => `- ${s.title} (${s.level}): ${s.score}/${SECTION_MAX}`).join("\n"),
        next_action: nextStep.nextAction || "",
        next_action_block_html: nextActionBlockHtml,
        conversation_person: nextStep.conversationPerson || "",
        renewal_rhythm: nextStep.renewalRhythm || "",
        strongest_title: strongest.title,
        audit_date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        audit_url: `${site}/api/energy-audit/${input.auditId}/pdf`,
        dashboard_url: `${site}/dashboard`,
        retake_url: `${site}/stewardship-blueprint/energy-audit`,
        site_url: site,
      },
    },
  });

  // `skipped` means SMTP/Resend isn't configured in this environment — not a failure.
  if (result?.skipped) return { sent: false, reason: "mail-not-configured" };
  return { sent: Boolean(result?.ok), reason: result?.ok ? undefined : "send-failed" };
}
