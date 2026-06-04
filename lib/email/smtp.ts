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

export function hasSmtpConfig() {
  const user = process.env.SMTP_USER ?? process.env.MAIL_JW_USERNAME;
  const pass = process.env.SMTP_PASSWORD ?? process.env.MAIL_JW_PASSWORD;
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && user && pass);
}

export async function sendSmtpEmail(input: SendEmailInput) {
  if (!hasSmtpConfig()) {
    return {
      ok: false,
      skipped: true,
      reason: "SMTP is not configured. Add SMTP_PASSWORD and related env vars to enable sending.",
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
    auth: {
      user,
      pass,
    },
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

  return {
    ok: true,
    skipped: false,
    messageId: info.messageId,
  };
}
