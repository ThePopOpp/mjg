import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Signed, per-recipient unsubscribe links for marketing emails.
//
// The token names the address and the list ("scope"), signed with HMAC so it
// can't be forged or pointed at someone else. It never expires: an unsubscribe
// link in an old email must keep working. The link opens a confirmation page;
// unsubscribing is always a POST (never a GET a mail scanner could trigger),
// and the List-Unsubscribe-Post header lets inboxes do it in one click.

export type UnsubscribeScope = "annual_retreat";

function secret(): string {
  const own = process.env.EMAIL_UNSUBSCRIBE_SECRET?.trim();
  if (own) return own;
  // Derived from the service key, so it works without a new env var but is
  // never the key itself.
  const base = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base) throw new Error("EMAIL_UNSUBSCRIBE_SECRET or SUPABASE_SERVICE_ROLE_KEY must be set.");
  return createHash("sha256").update(`mjg-unsubscribe:${base}`).digest("hex");
}

const b64 = (v: string | Buffer) => Buffer.from(v).toString("base64url");

export function signUnsubscribe(email: string, scope: UnsubscribeScope): string {
  const payload = b64(JSON.stringify({ e: email.trim().toLowerCase(), s: scope }));
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyUnsubscribe(token: string | null | undefined): { email: string; scope: UnsubscribeScope } | null {
  if (!token || token.length > 600) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest();
  let given: Buffer;
  try {
    given = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { e?: unknown; s?: unknown };
    if (typeof data.e !== "string" || data.s !== "annual_retreat") return null;
    return { email: data.e, scope: data.s };
  } catch {
    return null;
  }
}

/** j****@example.com: enough to recognise, not enough to harvest. */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "your address";
  return `${user.slice(0, 1)}${"*".repeat(Math.max(1, Math.min(user.length - 1, 6)))}@${domain}`;
}
