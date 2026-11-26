import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Find-or-create a contact by email, for public forms.
//
// • Matched case-insensitively against live (not soft-deleted) contacts, so a
//   repeat visitor never creates a duplicate.
// • New contacts get email_opt_in set EXPLICITLY (the column defaults to true,
//   which would quietly subscribe everyone).
// • For an existing contact, marketing permission is only ever turned ON by a
//   fresh explicit consent (`marketingConsent: true`). A form submission without
//   it never changes their preference, and never undoes an unsubscribe.
// • Existing names are never overwritten; a missing first name is filled in.

export type UpsertContactInput = {
  email: string;
  firstName?: string | null;
  source: string;
  tag?: string;
  /** True only when the person ticked an explicit marketing-permission box on this submission. */
  marketingConsent: boolean;
};

export type UpsertContactResult = { id: string; created: boolean; emailOptIn: boolean; previouslyOptedOut: boolean };

export async function upsertContactByEmail(input: UpsertContactInput): Promise<UpsertContactResult> {
  const db = createSupabaseAdminClient();
  const email = input.email.trim().toLowerCase();
  const firstName = (input.firstName ?? "").trim().slice(0, 80) || null;

  const { data: existing, error } = await db
    .from("contacts")
    .select("id, first_name, email_opt_in, tags")
    .ilike("email", email)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);

  if (existing) {
    const patch: Record<string, unknown> = {};
    if (!existing.first_name && firstName) patch.first_name = firstName;
    const tags = new Set<string>(Array.isArray(existing.tags) ? (existing.tags as string[]) : []);
    if (input.tag && !tags.has(input.tag)) patch.tags = [...tags, input.tag];
    if (input.marketingConsent && existing.email_opt_in !== true) patch.email_opt_in = true;
    if (Object.keys(patch).length) {
      const { error: upErr } = await db.from("contacts").update(patch).eq("id", existing.id);
      if (upErr) throw new Error(upErr.message);
    }
    return {
      id: existing.id as string,
      created: false,
      emailOptIn: input.marketingConsent ? true : existing.email_opt_in === true,
      previouslyOptedOut: existing.email_opt_in === false,
    };
  }

  const { data: created, error: insErr } = await db
    .from("contacts")
    .insert({
      // "contact", not "lead": leads feed the prospecting pipeline and agent
      // outreach, which someone who only asked for a free resource never agreed to.
      type: "contact",
      status: "active",
      email,
      first_name: firstName,
      source: input.source,
      tags: input.tag ? [input.tag] : [],
      email_opt_in: input.marketingConsent,
      sms_opt_in: false,
    })
    .select("id")
    .single();
  if (insErr) throw new Error(insErr.message);
  return { id: created.id as string, created: true, emailOptIn: input.marketingConsent, previouslyOptedOut: false };
}
