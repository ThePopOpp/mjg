import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildJourneyEvents } from "@/lib/email/journey";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { PARTICIPANT_TYPES } from "@/lib/pilot/constants";
import { upsertParticipant } from "@/lib/pilot/repository";
import { isAppRole, ROLES } from "@/lib/rbac/roles";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logUserActivity, upsertProfile } from "@/lib/user-management/repository";

export async function POST(request: NextRequest) {
  try {
    const payload = await parseRequestPayload(request);
    const email = stringValue(payload.email).toLowerCase();
    const firstName = stringValue(payload.first_name || payload.firstName);
    const lastName = stringValue(payload.last_name || payload.lastName);
    const phone = stringValue(payload.phone);
    const formType = stringValue(payload.form_type) || "join_the_journey";

    if (formType !== "journey_signup" && formType !== "join_the_journey") {
      const submission = await savePublicFormSubmission({
        formType,
        email,
        firstName,
        lastName,
        phone,
        payload,
      });
      return NextResponse.json({ ok: true, submissionId: submission?.id ?? null });
    }

    if (!email || !firstName || !lastName) {
      return NextResponse.json({ ok: false, error: "First name, last name, and email are required." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const participant = await upsertParticipant({
      firstName,
      lastName,
      email,
      phone,
      waveSource: "direct_email",
      relationshipCategory: stringValue(payload.hear_about) || undefined,
      participantType: PARTICIPANT_TYPES.GENERAL,
      consent: {
        emailJourneyOptIn: true,
        futureUpdatesOptIn: true,
        anonymousFeedbackPermission: true,
        followUpPermission: true,
      },
    });

    await supabase.from("participants").update({ journey_status: "started", updated_at: new Date().toISOString() }).eq("id", participant.id);
    await ensureJourneyEvents(participant.id);
    await recordSubmission({
      participantId: participant.id,
      email,
      phone,
      payload,
    });

    const profileResult = await ensureParticipantProfile({
      firstName,
      lastName,
      email,
      phone,
      participantId: participant.id,
    });

    await supabase.from("participant_user_links").upsert(
      {
        participant_id: participant.id,
        user_id: profileResult.profile.id,
        link_type: "join_the_journey_signup",
      },
      { onConflict: "participant_id,user_id" },
    );

    // By this point they ARE enrolled — participant, profile, journey events and the
    // form submission are all written. Letting a mail-provider failure throw here
    // would hand a fully-enrolled visitor "Something went wrong", and they'd sign up
    // again (each retry writing another form_submissions row). So the send is
    // non-fatal — but never silent: a failure raises a dashboard notification, since
    // the person is left without the credentials the email carries.
    const welcomeEmail = await sendWelcomeAccessEmail({
      email,
      firstName,
      tempPassword: profileResult.tempPassword,
      existingAccount: profileResult.existingAccount,
    }).catch((emailError: unknown) => {
      const reason = emailError instanceof Error ? emailError.message : "Unknown email error.";
      console.error("[join-journey] welcome email failed", { email, reason });
      return { failed: true as const, reason };
    });

    if (welcomeEmail && "failed" in welcomeEmail) {
      await supabase
        .from("notifications")
        .insert({
          participant_id: participant.id,
          type: "join_the_journey_welcome_email_failed",
          title: "Welcome email failed to send",
          message: `${firstName} ${lastName} (${email}) joined The Journey, but the welcome email with their sign-in details could not be sent. Reason: ${welcomeEmail.reason}`,
          destination: "dashboard",
          status: "queued",
          metadata: { email, reason: welcomeEmail.reason },
        })
        .then(undefined, () => undefined); // never let the alert itself sink the signup
    }

    await supabase.from("notifications").insert({
      participant_id: participant.id,
      type: "join_the_journey_signup",
      title: "Join The Journey signup",
      message: `${firstName} ${lastName} joined The Journey from the public site.`,
      destination: "dashboard",
      status: "queued",
      metadata: {
        email,
        source: payload.source || "Join The Journey Modal",
        hear_about: payload.hear_about ?? null,
        church_name: payload.church_name ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      participantId: participant.id,
      profileId: profileResult.profile.id,
      existingAccount: profileResult.existingAccount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Join The Journey signup failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

async function savePublicFormSubmission(input: {
  formType: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  payload: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  const subject = stringValue(input.payload.subject) || labelize(input.formType);
  const message = stringValue(input.payload.notes || input.payload.message || input.payload.questions);
  const fullName = stringValue(input.payload.full_name) || `${input.firstName} ${input.lastName}`.trim();

  const { data, error } = await supabase
    .from("form_submissions")
    .insert({
      form_type: input.formType,
      email: input.email || null,
      phone: input.phone || null,
      subject,
      message,
      source: stringValue(input.payload.source) || "Public website",
      status: "received",
      payload: input.payload,
    })
    .select("*")
    .single();
  if (error) throw error;

  await supabase.from("notifications").insert({
    type: "form_submission_received",
    title: `${labelize(input.formType)} submitted`,
    message: `${fullName || input.email || "A website visitor"} submitted ${labelize(input.formType)}.`,
    destination: "dashboard",
    status: "queued",
    metadata: { formType: input.formType, submissionId: data.id, email: input.email },
  });

  await notifySuperAdminsOfSubmission({
    formType: input.formType,
    name: fullName,
    email: input.email,
    phone: input.phone,
    subject,
    message,
  });

  return data;
}

async function notifySuperAdminsOfSubmission(input: {
  formType: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("email")
    .eq("role", "super_admin")
    .eq("status", "active")
    .not("email", "is", null);

  const recipients = Array.from(new Set((admins ?? []).map((admin) => admin.email).filter(Boolean)));
  if (!recipients.length) return;

  await sendSmtpEmail({
    to: recipients,
    subject: `New ${labelize(input.formType)} submission`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
        <h2>New ${escapeHtml(labelize(input.formType))} submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name || "-")}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.email || "-")}</p>
        <p><strong>Phone:</strong> ${escapeHtml(input.phone || "-")}</p>
        <p><strong>Subject:</strong> ${escapeHtml(input.subject || "-")}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(input.message || "-").replace(/\n/g, "<br>")}</p>
      </div>
    `,
    text: `New ${labelize(input.formType)} submission\nName: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone ?? ""}\nSubject: ${input.subject}\nMessage:\n${input.message}`,
  });
}

async function parseRequestPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }

  const formData = contentType.includes("multipart/form-data")
    ? await request.formData()
    : new URLSearchParams(await request.text());

  return Object.fromEntries(formData.entries());
}

async function ensureParticipantProfile(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  participantId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const existingProfile = await supabase.from("profiles").select("*").eq("email", input.email).maybeSingle();
  const existingAuthUserId = existingProfile.data?.auth_user_id || existingProfile.data?.id;
  let tempPassword: string | null = null;
  let authUserId = existingAuthUserId as string | undefined;
  let existingAccount = Boolean(authUserId);

  if (!authUserId) {
    tempPassword = generateTemporaryPassword();
    const created = await supabase.auth.admin.createUser({
      email: input.email,
      password: tempPassword,
      email_confirm: true,
      // Supabase auth rejects anything that isn't E.164 and fails the WHOLE signup
      // with a 500 — so a visitor typing "(480) 555-0142" could never join. The
      // phone is still saved on the participant + profile records regardless; it's
      // optional here, so anything we can't confidently normalise is simply omitted
      // rather than allowed to sink the signup.
      phone: toE164(input.phone),
      user_metadata: {
        first_name: input.firstName,
        last_name: input.lastName,
        source: "join_the_journey",
      },
    });

    if (created.error) {
      const existingAuth = await findAuthUserByEmail(input.email);
      if (!existingAuth) throw created.error;
      authUserId = existingAuth.id;
      tempPassword = null;
      existingAccount = true;
    } else {
      authUserId = created.data.user.id;
    }
  }

  const profile = await upsertProfile({
    id: existingProfile.data?.id,
    authUserId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    role: isAppRole(existingProfile.data?.role) ? existingProfile.data.role : ROLES.PARTICIPANT,
    status: "active",
    relatedParticipantId: input.participantId,
    notes: existingProfile.data?.notes || "Created from Join The Journey public signup.",
  });

  await logUserActivity({
    userId: profile.id,
    action: existingAccount ? "join_journey_profile_connected" : "join_journey_user_created",
    entityType: "profiles",
    entityId: profile.id,
    metadata: { source: "join_the_journey", participantId: input.participantId },
  });

  return { profile, tempPassword, existingAccount };
}

async function findAuthUserByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 1000) break;
  }
  return null;
}

async function ensureJourneyEvents(participantId: string) {
  const supabase = createSupabaseAdminClient();
  const existing = await supabase.from("email_journey_events").select("id", { count: "exact", head: true }).eq("participant_id", participantId);
  if ((existing.count ?? 0) > 0) return;
  await supabase.from("email_journey_events").insert(buildJourneyEvents(participantId));
}

async function recordSubmission(input: { participantId: string; email: string; phone?: string; payload: Record<string, unknown> }) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("form_submissions").insert({
    form_type: "join_the_journey",
    email: input.email,
    phone: input.phone || null,
    participant_id: input.participantId,
    source: stringValue(input.payload.source) || "Join The Journey Modal",
    status: "received",
    payload: input.payload,
  });
}

async function sendWelcomeAccessEmail(input: {
  email: string;
  firstName: string;
  tempPassword: string | null;
  existingAccount: boolean;
}) {
  const siteUrl = publicSiteUrl();
  const passwordBlock = input.tempPassword
    ? `<p>Your temporary password is:</p><p style="font-size:18px;font-weight:700;letter-spacing:.04em;">${escapeHtml(input.tempPassword)}</p><p>Please sign in and update your password when you are ready.</p>`
    : "<p>Your account is already connected. Please sign in with your existing password or use the secure email sign-in link.</p>";

  await sendSmtpEmail({
    to: input.email,
    subject: "Welcome to The Journey",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:620px;margin:0 auto;padding:24px;">
        <h1 style="margin:0 0 16px;">Welcome, ${escapeHtml(input.firstName)}</h1>
        <p>Thanks for joining The Journey with Michael J. Gauthier and The Stewardship Blueprint.</p>
        ${passwordBlock}
        <p><a href="${siteUrl}/login" style="display:inline-block;background:#111111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;">Sign in</a></p>
      </div>
    `,
    text: input.tempPassword
      ? `Welcome, ${input.firstName}. Sign in at ${siteUrl}/login with this temporary password: ${input.tempPassword}`
      : `Welcome, ${input.firstName}. Your account is connected. Sign in at ${siteUrl}/login with your existing password or request a secure email sign-in link.`,
  });
}

function generateTemporaryPassword() {
  return `${randomBytes(9).toString("base64url")}1!`;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/** Best-effort E.164 for Supabase auth. Returns undefined when unsure — the caller
 *  treats the phone as optional, so "unsure" must never fail the signup. */
function toE164(phone?: string) {
  const raw = (phone ?? "").trim();
  if (!raw) return undefined;

  const digits = raw.replace(/\D/g, "");
  // Already international ("+44 20 …"): keep the country code the visitor gave us.
  if (raw.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : undefined;
  // Bare NANP number, with or without the country code.
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return undefined;
}

function labelize(value: string) {
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
