import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { sendSms } from "@/lib/twilio/sms";
import { brandEmailButton, brandEmailHeader } from "@/lib/brand/assets";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { getDmPrefs } from "@/lib/direct-messages/preferences";
import { sendPushToUser } from "@/lib/push/web-push";

const DEBOUNCE_MS = 5 * 60 * 1000; // don't re-alert the same recipient within 5 min
const MESSAGES_URL = "https://my.michaeljgauthier.com/dashboard/direct-messages";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Alert the OTHER participants of a new message via email/SMS, honoring their
 * preferences and a debounce window. Best-effort — never throws into send().
 */
export async function notifyDmRecipients(conversationId: string, senderId: string, preview: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: sender } = await supabase.from("profiles").select("first_name, last_name, email").eq("id", senderId).maybeSingle();
    const senderName = [sender?.first_name, sender?.last_name].filter(Boolean).join(" ").trim() || sender?.email || "Someone";

    const { data: parts } = await supabase
      .from("dm_participants")
      .select("user_id, last_notified_at")
      .eq("conversation_id", conversationId)
      .neq("user_id", senderId);

    const now = Date.now();
    const snippet = preview.slice(0, 140);

    for (const p of parts ?? []) {
      // Web push fires on every message (like any messenger) to the recipient's
      // subscribed devices — it's the least intrusive channel.
      await sendPushToUser(p.user_id, {
        title: `New message from ${senderName}`,
        body: snippet,
        url: "/dashboard/direct-messages",
        tag: `dm-${conversationId}`,
      });

      // Email/SMS are debounced so a rapid back-and-forth doesn't spam.
      if (p.last_notified_at && now - new Date(p.last_notified_at).getTime() < DEBOUNCE_MS) continue;

      const prefs = await getDmPrefs(p.user_id);
      if (!prefs.email && !prefs.sms) continue;

      const { data: prof } = await supabase.from("profiles").select("email, first_name, phone, sms_opt_in").eq("id", p.user_id).maybeSingle();
      if (!prof) continue;

      let notified = false;

      if (prefs.email && prof.email) {
        const html = `${brandEmailHeader()}
          <h2 style="font-family:Georgia,serif;color:#111;margin:12px 0 8px;">New message from ${esc(senderName)}</h2>
          <p style="font-family:Arial,sans-serif;color:#333;line-height:1.6;">${esc(snippet)}</p>
          <p style="margin-top:20px;">${brandEmailButton(MESSAGES_URL, "Open messages")}</p>
          <p style="font-family:Arial,sans-serif;color:#888;font-size:12px;margin-top:24px;">You're receiving this because message alerts are on. Turn them off in Settings &rarr; Direct Messages at ${publicSiteUrl()}.</p>`;
        const res = await sendSmtpEmail({ to: prof.email, subject: `New message from ${senderName}`, html }).catch(() => null);
        if (res && (res as { ok?: boolean }).ok !== false) notified = true;
      }

      if (prefs.sms && prof.phone && prof.sms_opt_in) {
        const res = await sendSms({ to: prof.phone, body: `New message from ${senderName}: ${snippet.slice(0, 100)} — reply at ${MESSAGES_URL}` }).catch(() => null);
        if (res) notified = true;
      }

      if (notified) {
        await supabase.from("dm_participants").update({ last_notified_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("user_id", p.user_id);
      }
    }
  } catch {
    /* alerts are best-effort; a failure must never block sending a message */
  }
}
