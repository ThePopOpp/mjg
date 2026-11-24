import { NextResponse } from "next/server";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageSpeaking } from "@/lib/marketing/content/scopes/page-speaking";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// The /speaking invitation form (components/marketing/speaking.tsx).
//
// Stored in form_submissions (form_type "speaking_inquiry", so it shows in
// Dashboard → Emails → Form Submissions) with the consent wording, referring
// page and UTM attribution, then emailed to the active Super Admins as
// "[MJG Speaking Inquiry] – <type> – <organization>". The optional news box is
// recorded with the submission only — an inquiry never subscribes anyone.
// Spam: a honeypot field plus at most 3 inquiries per email per 10 minutes.

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function utmFrom(attribution: unknown) {
  const a = (attribution ?? {}) as { first?: Record<string, unknown> | null; session?: Record<string, unknown> | null };
  const pick = (t: Record<string, unknown> | null | undefined) =>
    t
      ? Object.fromEntries(
          ["path", "referrer", "at", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
            .filter((k) => typeof t[k] === "string")
            .map((k) => [k, String(t[k]).slice(0, 300)]),
        )
      : null;
  return { first_touch: pick(a.first), session_touch: pick(a.session) };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot filled: answer as if it worked, store nothing.
  if (str(body.company_url, 300)) return NextResponse.json({ ok: true });

  const { inquiry } = await getScopeContent(pageSpeaking);
  const name = str(body.name, 120);
  const email = str(body.email, 200).toLowerCase();
  const organization = str(body.organization, 160);
  const typeId = str(body.invitation_type, 40);
  const type = inquiry.invitationTypes.find((t) => t.id === typeId);
  const message = str(body.message, 4000);
  const websiteRaw = str(body.website, 300);
  const website = websiteRaw && !/^https?:\/\//i.test(websiteRaw) ? `https://${websiteRaw}` : websiteRaw;

  const fields: Record<string, string> = {};
  if (!name) fields.name = "Please enter your name.";
  if (!EMAIL.test(email)) fields.email = "Please enter a valid email address.";
  if (!organization) fields.organization = "Please enter your organization or podcast name.";
  if (!type) fields.invitation_type = "Please choose an invitation type.";
  if (message.length < 10) fields.message = "Please tell us a little about your audience and the conversation.";
  if (website) {
    try {
      new URL(website);
    } catch {
      fields.website = "That website address doesn’t look right.";
    }
  }
  if (body.consent !== true) fields.consent = "Please agree so we can respond to your inquiry.";
  if (Object.keys(fields).length) {
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fields }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("form_submissions")
    .select("id", { count: "exact", head: true })
    .eq("form_type", "speaking_inquiry")
    .eq("email", email)
    .gte("created_at", since);
  if ((count ?? 0) >= 3) {
    return NextResponse.json({ ok: false, error: "We already have your inquiry. Thank you — we’ll be in touch." }, { status: 429 });
  }

  const details = {
    name,
    email,
    organization,
    invitation_type: type!.id,
    invitation_type_label: type!.label,
    message,
    website: website || null,
    timeframe: str(body.timeframe, 160) || null,
    location: str(body.location, 160) || null,
    audience_size: str(body.audience_size, 60) || null,
    phone: str(body.phone, 40) || null,
  };
  const payload = {
    ...details,
    consent: true,
    consent_text: str(body.consent_text, 300) || inquiry.consent,
    consented_at: new Date().toISOString(),
    marketing_opt_in: body.marketing_opt_in === true,
    marketing_opt_in_text: body.marketing_opt_in === true ? str(body.marketing_opt_in_text, 300) || inquiry.marketingOptIn : null,
    page_url: str(body.page_url, 500) || null,
    referrer: str(body.referrer, 500) || null,
    ...utmFrom(body.attribution),
  };
  const subject = `[MJG Speaking Inquiry] – ${type!.label} – ${organization}`;

  const { data, error } = await supabase
    .from("form_submissions")
    .insert({
      form_type: "speaking_inquiry",
      email,
      phone: details.phone,
      subject,
      message,
      source: "speaking-page",
      status: "received",
      payload,
    })
    .select("id")
    .single();
  if (error) {
    console.error("[speaking-inquiry] insert failed", error.message);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await supabase
    .from("notifications")
    .insert({
      type: "form_submission_received",
      title: "Speaking inquiry received",
      message: `${name} (${organization}) sent a ${type!.label.toLowerCase()} inquiry.`,
      destination: "dashboard",
      status: "queued",
      metadata: { formType: "speaking_inquiry", submissionId: data.id, email },
    })
    .then(undefined, () => undefined);

  // The submission is stored; a mail problem must not turn a received inquiry into an error.
  await notifyAdmins(subject, payload).catch((err) => console.error("[speaking-inquiry] email failed", err instanceof Error ? err.message : err));

  return NextResponse.json({ ok: true });
}

async function notifyAdmins(subject: string, p: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient();
  const { data: admins } = await supabase.from("profiles").select("email").eq("role", "super_admin").eq("status", "active").not("email", "is", null);
  const to = Array.from(new Set((admins ?? []).map((a) => a.email as string).filter(Boolean)));
  if (!to.length) return;

  const first = (p.first_touch ?? {}) as Record<string, string>;
  const session = (p.session_touch ?? {}) as Record<string, string>;
  const rows: [string, unknown][] = [
    ["Name", p.name],
    ["Email", p.email],
    ["Organization / podcast", p.organization],
    ["Invitation type", p.invitation_type_label],
    ["Website", p.website],
    ["Preferred date / timeframe", p.timeframe],
    ["Location / format", p.location],
    ["Estimated audience", p.audience_size],
    ["Phone", p.phone],
    ["Consent", `Yes — “${p.consent_text}”`],
    ["Wants MJG news", p.marketing_opt_in ? "Yes" : "No"],
    ["Source page", p.page_url],
    ["Referrer", p.referrer],
    ["Campaign", session.utm_campaign || first.utm_campaign],
    ["UTM source / medium", [session.utm_source || first.utm_source, session.utm_medium || first.utm_medium].filter(Boolean).join(" / ")],
  ];
  const shown = rows.filter(([, v]) => v !== null && v !== undefined && v !== "");
  const esc = (v: unknown) =>
    String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

  await sendSmtpEmail({
    to,
    subject,
    replyTo: String(p.email),
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#141211;max-width:640px">
      <h2 style="margin:0 0 12px">New speaking inquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-size:14px">${shown
        .map(([k, v]) => `<tr><td style="color:#6b6258;vertical-align:top;white-space:nowrap"><strong>${esc(k)}</strong></td><td>${esc(v)}</td></tr>`)
        .join("")}</table>
      <p style="margin:16px 0 4px"><strong>About the audience and conversation</strong></p>
      <p style="margin:0;white-space:pre-wrap">${esc(p.message)}</p>
      <p style="margin-top:20px;font-size:12px;color:#6b6258">Also in Dashboard → Emails → Form Submissions. Reply to this email to answer them directly.</p>
    </div>`,
    text: `${subject}\n\n${shown.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nAbout the audience and conversation:\n${p.message}`,
  });
}
