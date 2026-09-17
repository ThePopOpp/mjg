import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Phone identity for SMS.
 *
 * Numbers reach us in several shapes — Twilio sends E.164 ("+14803527598"), people type
 * "480-352-7598", and imported records hold "4803527598". Matching on the raw string splits one
 * person across several conversations and fails to link their profile, so everything here keys
 * on the last ten digits and stores E.164.
 */

/** Last 10 digits — the comparison key. US/CA numbers match regardless of formatting. */
export function phoneKey(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** Canonical storage form: +1XXXXXXXXXX for 10/11-digit US numbers, else +<digits>. */
export function toE164(phone: string | null | undefined): string {
  const raw = (phone ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? `+${digits}` : `+${digits}`;
}

/** "(480) 352-7598" for display; longer/international numbers pass through as E.164. */
export function formatPhone(phone: string | null | undefined): string {
  const key = phoneKey(phone);
  if (key.length !== 10) return toE164(phone) || (phone ?? "");
  return `(${key.slice(0, 3)}) ${key.slice(3, 6)}-${key.slice(6)}`;
}

export type SmsContact = {
  /** Where the identity came from; a profile wins over a participant, which wins over a contact. */
  kind: "profile" | "participant" | "contact";
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  phone: string;
  phoneKey: string;
};

function displayName(firstName?: string | null, lastName?: string | null, fullName?: string | null) {
  const composed = [firstName, lastName].filter(Boolean).join(" ").trim();
  // Prefer first + last: full_name is frequently null on profiles, which is what made the
  // inbox fall back to showing a bare phone number for people who DO have an account.
  return composed || (fullName ?? "").trim() || null;
}

/**
 * Everyone we could address by SMS — profiles, participants and contacts that have a phone
 * number — de-duplicated by phone with profiles taking precedence.
 */
export async function listSmsDirectory(): Promise<SmsContact[]> {
  const supabase = createSupabaseAdminClient();

  const [profiles, participants, contacts] = await Promise.all([
    supabase.from("profiles").select("id, first_name, last_name, full_name, email, phone, avatar_url, status, updated_at").not("phone", "is", null).limit(2000),
    supabase.from("participants").select("id, first_name, last_name, email, phone, updated_at").not("phone", "is", null).limit(2000),
    supabase.from("contacts").select("id, first_name, last_name, email, phone, updated_at").not("phone", "is", null).limit(2000),
  ]);

  const byKey = new Map<string, { contact: SmsContact; score: number; updatedAt: number }>();

  // Two records can share a number (a real account and an old test one, a profile and a
  // participant). Rank by source first, then prefer the record that looks most like the
  // person's live identity — active, has a photo, has a name — so the inbox shows the right
  // face rather than whichever row the database happened to return first.
  const scoreOf = (c: SmsContact, active: boolean) =>
    ({ profile: 300, participant: 200, contact: 100 })[c.kind] +
    (active ? 10 : 0) +
    (c.avatarUrl ? 5 : 0) +
    (c.name ? 1 : 0);

  const add = (c: SmsContact, active = true, updatedAt?: string | null) => {
    if (!c.phoneKey) return;
    const score = scoreOf(c, active);
    const stamp = updatedAt ? new Date(updatedAt).getTime() : 0;
    const existing = byKey.get(c.phoneKey);
    // Equal scores are broken by recency, so the same record wins on every load. Without
    // this the winner depended on row order and the displayed identity could flip.
    const wins = !existing || score > existing.score || (score === existing.score && stamp > existing.updatedAt);
    if (wins) byKey.set(c.phoneKey, { contact: c, score, updatedAt: stamp });
  };

  for (const p of (profiles.data ?? []) as any[]) {
    add({
      kind: "profile",
      id: p.id,
      firstName: p.first_name ?? null,
      lastName: p.last_name ?? null,
      name: displayName(p.first_name, p.last_name, p.full_name),
      email: p.email ?? null,
      avatarUrl: p.avatar_url ?? null,
      phone: toE164(p.phone),
      phoneKey: phoneKey(p.phone),
    }, p.status === "active", p.updated_at);
  }
  for (const p of (participants.data ?? []) as any[]) {
    add({
      kind: "participant",
      id: p.id,
      firstName: p.first_name ?? null,
      lastName: p.last_name ?? null,
      name: displayName(p.first_name, p.last_name),
      email: p.email ?? null,
      avatarUrl: null,
      phone: toE164(p.phone),
      phoneKey: phoneKey(p.phone),
    }, true, p.updated_at);
  }
  for (const p of (contacts.data ?? []) as any[]) {
    add({
      kind: "contact",
      id: p.id,
      firstName: p.first_name ?? null,
      lastName: p.last_name ?? null,
      name: displayName(p.first_name, p.last_name),
      email: p.email ?? null,
      avatarUrl: null,
      phone: toE164(p.phone),
      phoneKey: phoneKey(p.phone),
    }, true, p.updated_at);
  }

  return [...byKey.values()]
    .map((v) => v.contact)
    .sort((a, b) => (a.name ?? a.phone).localeCompare(b.name ?? b.phone));
}

/** Directory keyed by phoneKey, for enriching a page of conversations in one pass. */
export async function smsDirectoryByPhone(): Promise<Map<string, SmsContact>> {
  const list = await listSmsDirectory();
  return new Map(list.map((c) => [c.phoneKey, c]));
}

/** Resolve a single number to a known person, or null. */
export async function resolveSmsContact(phone: string): Promise<SmsContact | null> {
  const key = phoneKey(phone);
  if (!key) return null;
  return (await smsDirectoryByPhone()).get(key) ?? null;
}

/** The shape the SMS UI renders for a conversation's other party. */
export type ConversationContact = {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  phone: string;
  phoneDisplay: string;
  kind: SmsContact["kind"] | null;
  id: string | null;
};

/** Merge a conversation row with the directory. Falls back to whatever the row already knows. */
export function buildConversationContact(
  contactNumber: string,
  storedName: string | null,
  directory: Map<string, SmsContact>,
): ConversationContact {
  const match = directory.get(phoneKey(contactNumber));
  return {
    name: match?.name ?? (storedName?.trim() || null),
    firstName: match?.firstName ?? null,
    lastName: match?.lastName ?? null,
    email: match?.email ?? null,
    avatarUrl: match?.avatarUrl ?? null,
    phone: toE164(contactNumber) || contactNumber,
    phoneDisplay: formatPhone(contactNumber),
    kind: match?.kind ?? null,
    id: match?.id ?? null,
  };
}
