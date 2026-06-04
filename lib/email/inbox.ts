import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type EmailSyncResult = {
  synced: number;
  skipped: number;
  mailbox: string;
  latestUid?: number;
};

export function hasImapConfig() {
  const user = process.env.IMAP_USER ?? process.env.MAIL_JW_USERNAME ?? process.env.SMTP_USER;
  const pass = process.env.IMAP_PASSWORD ?? process.env.MAIL_JW_PASSWORD ?? process.env.SMTP_PASSWORD;
  return Boolean(process.env.IMAP_HOST && process.env.IMAP_PORT && user && pass);
}

export async function syncInboxEmails({ mailbox = "INBOX", limit = 25 }: { mailbox?: string; limit?: number } = {}): Promise<EmailSyncResult> {
  if (!hasImapConfig()) {
    throw new Error("IMAP is not configured. Add IMAP_PASSWORD and related env vars to enable receiving.");
  }

  const host = process.env.IMAP_HOST;
  const port = Number(process.env.IMAP_PORT ?? 993);
  const user = process.env.IMAP_USER ?? process.env.MAIL_JW_USERNAME ?? process.env.SMTP_USER;
  const pass = process.env.IMAP_PASSWORD ?? process.env.MAIL_JW_PASSWORD ?? process.env.SMTP_PASSWORD;
  const secure = process.env.IMAP_SECURE !== "false";

  if (!host || !user || !pass) {
    throw new Error("IMAP host, user, and password are required.");
  }

  const client = new ImapFlow({
    host,
    port,
    secure,
    auth: { user, pass },
    logger: false,
  });

  const supabase = createSupabaseAdminClient();
  let synced = 0;
  let skipped = 0;
  let latestUid: number | undefined;

  await client.connect();

  try {
    const lock = await client.getMailboxLock(mailbox);
    try {
      const status = await client.status(mailbox, { messages: true });
      const total = status.messages ?? 0;
      const start = Math.max(1, total - limit + 1);
      const range = total > 0 ? `${start}:*` : "";

      if (!range) {
        return { synced, skipped, mailbox };
      }

      for await (const message of client.fetch(range, { uid: true, source: true, envelope: true, flags: true })) {
        if (!message.source || !message.uid) {
          skipped += 1;
          continue;
        }

        latestUid = Number(message.uid);
        const parsed = await simpleParser(message.source);
        const from = parsed.from?.value[0];
        const to = parsed.to ? parsedAddressList(parsed.to) : [];
        const cc = parsed.cc ? parsedAddressList(parsed.cc) : [];
        const replyTo = parsed.replyTo ? parsedAddressList(parsed.replyTo) : [];
        const textBody = parsed.text ?? "";
        const snippet = textBody.replace(/\s+/g, " ").trim().slice(0, 240);
        const fromEmail = from?.address?.toLowerCase() ?? null;
        const links = fromEmail ? await findRelatedRecords(fromEmail) : { participantId: null, profileId: null };

        const { error } = await supabase.from("email_messages").upsert(
          {
            mailbox,
            provider: "imap",
            message_uid: Number(message.uid),
            message_id: parsed.messageId ?? null,
            subject: parsed.subject ?? message.envelope?.subject ?? null,
            from_email: fromEmail,
            from_name: from?.name ?? null,
            to_emails: to,
            cc_emails: cc,
            reply_to_emails: replyTo,
            text_body: textBody || null,
            html_body: typeof parsed.html === "string" ? parsed.html : null,
            snippet: snippet || null,
            received_at: parsed.date?.toISOString() ?? message.envelope?.date?.toISOString() ?? null,
            sent_at: parsed.date?.toISOString() ?? null,
            flags: Array.from(message.flags ?? []).map(String),
            raw_headers: Object.fromEntries(parsed.headers),
            attachments: parsed.attachments.map((attachment) => ({
              filename: attachment.filename,
              contentType: attachment.contentType,
              size: attachment.size,
            })),
            participant_id: links.participantId,
            profile_id: links.profileId,
            sync_metadata: { syncedAt: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "mailbox,message_uid" },
        );

        if (error) {
          skipped += 1;
        } else {
          synced += 1;
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return { synced, skipped, mailbox, latestUid };
}

export async function getEmailInboxData() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_messages")
    .select("*, participants(id,first_name,last_name,email), profile:profiles!email_messages_profile_id_fkey(id,full_name,email)")
    .is("deleted_at", null)
    .is("removed_at", null)
    .is("hidden_at", null)
    .order("received_at", { ascending: false, nullsFirst: false })
    .limit(100);

  return {
    messages: data ?? [],
    error: error?.message ?? null,
  };
}

export async function getEmailMessageHistoryData() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_messages")
    .select("*, participants(id,first_name,last_name,email), profile:profiles!email_messages_profile_id_fkey(id,full_name,email)")
    .is("deleted_at", null)
    .is("removed_at", null)
    .order("received_at", { ascending: false, nullsFirst: false })
    .limit(100);

  return {
    messages: data ?? [],
    error: error?.message ?? null,
  };
}

export async function updateEmailMessageAction(input: {
  id: string;
  action: "hide" | "remove" | "delete";
  actorUserId?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const payload =
    input.action === "hide"
      ? { hidden_at: now, actioned_by: input.actorUserId ?? null, action_reason: "hidden_from_inbox", updated_at: now }
      : input.action === "remove"
        ? { removed_at: now, actioned_by: input.actorUserId ?? null, action_reason: "removed_from_history", updated_at: now }
        : { deleted_at: now, actioned_by: input.actorUserId ?? null, action_reason: "deleted", updated_at: now };

  const { error } = await supabase.from("email_messages").update(payload).eq("id", input.id);
  if (error) throw error;
}

async function findRelatedRecords(email: string) {
  const supabase = createSupabaseAdminClient();
  const [participant, profile] = await Promise.all([
    supabase.from("participants").select("id").eq("email", email).maybeSingle(),
    supabase.from("profiles").select("id").eq("email", email).maybeSingle(),
  ]);

  return {
    participantId: participant.data?.id ?? null,
    profileId: profile.data?.id ?? null,
  };
}

function parsedAddressList(value: { value: Array<{ address?: string | false | undefined }> } | Array<{ value: Array<{ address?: string | false | undefined }> }>) {
  const addresses = Array.isArray(value) ? value.flatMap((item) => item.value) : value.value;
  return addressList(addresses);
}

function addressList(addresses: Array<{ address?: string | false | undefined }>) {
  return addresses.map((item) => item.address).filter((address): address is string => Boolean(address)).map((address) => address.toLowerCase());
}
