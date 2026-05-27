import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export async function sendSmtpEmail(input: SendEmailInput) {
  if (!hasSmtpConfig()) {
    return {
      ok: false,
      skipped: true,
      reason: "SMTP is not configured. Add SMTP_PASSWORD and related env vars to enable sending.",
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const from = process.env.NOTIFICATION_FROM_EMAIL || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo || from,
  });

  return {
    ok: true,
    skipped: false,
    messageId: info.messageId,
  };
}
