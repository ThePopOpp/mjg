import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
};

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY);
}

function hasSmtpCredentials() {
  const user = process.env.SMTP_USER ?? process.env.MAIL_JW_USERNAME;
  const pass = process.env.SMTP_PASSWORD ?? process.env.MAIL_JW_PASSWORD;
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && user && pass);
}

export function hasSmtpConfig() {
  return hasResendConfig() || hasSmtpCredentials();
}

async function sendViaResend(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY!;
  const from =
    process.env.RESEND_FROM_EMAIL ??
    process.env.NOTIFICATION_FROM_EMAIL ??
    "noreply@my.michaeljgauthier.com";
  const replyTo = input.replyTo ?? process.env.RESEND_REPLY_TO ?? from;

  const body: Record<string, unknown> = {
    from,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    reply_to: replyTo,
  };
  if (input.text) body.text = input.text;
  if (input.cc) body.cc = Array.isArray(input.cc) ? input.cc : [input.cc];
  if (input.bcc) body.bcc = Array.isArray(input.bcc) ? input.bcc : [input.bcc];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Resend API error: ${err.message ?? response.statusText}`);
  }

  const data = (await response.json()) as { id: string };
  return { ok: true, skipped: false, messageId: data.id };
}

export async function sendSmtpEmail(input: SendEmailInput) {
  if (hasResendConfig()) {
    return sendViaResend(input);
  }

  if (!hasSmtpCredentials()) {
    return {
      ok: false,
      skipped: true,
      reason: "No email provider configured. Add RESEND_API_KEY or SMTP credentials to enable sending.",
    };
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER ?? process.env.MAIL_JW_USERNAME;
  const pass = process.env.SMTP_PASSWORD ?? process.env.MAIL_JW_PASSWORD;
  const secure =
    process.env.SMTP_SECURE !== "false" &&
    (process.env.SMTP_SECURE === "true" || process.env.SMTP_ENCRYPTION === "ssl" || port === 465);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user, pass },
  });

  const from = process.env.NOTIFICATION_FROM_EMAIL || user;

  const info = await transporter.sendMail({
    from,
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo || from,
    attachments: input.attachments,
  });

  return { ok: true, skipped: false, messageId: info.messageId };
}
