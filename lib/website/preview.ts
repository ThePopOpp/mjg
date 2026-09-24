// Frontend Editor — secure draft preview links (spec §41).
//
// A preview token is a 32-byte random value stored server-side with an expiry.
// It is unguessable, single-page, expiring, and the preview route always sends
// `noindex` headers. Nothing about the token encodes the page id, so a leaked
// link cannot be edited to reach another page.

import { randomBytes, timingSafeEqual } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DEFAULT_TTL_HOURS = 24;

export type PreviewToken = { token: string; expiresAt: string; url: string };

export async function createPreviewToken(
  pageId: string,
  opts: { actorId?: string | null; hours?: number } = {},
): Promise<PreviewToken> {
  const sb = createSupabaseAdminClient();
  const token = randomBytes(32).toString("base64url");
  const hours = Math.min(168, Math.max(1, opts.hours ?? DEFAULT_TTL_HOURS));
  const expiresAt = new Date(Date.now() + hours * 3600_000).toISOString();

  const { error } = await sb.from("website_preview_tokens").insert({
    page_id: pageId,
    token,
    created_by: opts.actorId ?? null,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);

  // Housekeeping: drop this page's expired tokens so the table stays small.
  await sb
    .from("website_preview_tokens")
    .delete()
    .eq("page_id", pageId)
    .lt("expires_at", new Date().toISOString())
    .then(undefined, () => undefined);

  return { token, expiresAt, url: `/website-preview/${token}` };
}

/** Resolve a token to its page id, or null when unknown/expired. */
export async function resolvePreviewToken(token: string): Promise<string | null> {
  const candidate = String(token ?? "");
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(candidate)) return null;

  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("website_preview_tokens")
    .select("page_id, token, expires_at")
    .eq("token", candidate)
    .maybeSingle();
  if (!data) return null;

  // Constant-time compare so a partial match cannot be probed by timing.
  const stored = Buffer.from((data as { token: string }).token);
  const given = Buffer.from(candidate);
  if (stored.length !== given.length || !timingSafeEqual(stored, given)) return null;
  if (new Date((data as { expires_at: string }).expires_at).getTime() < Date.now()) return null;

  return (data as { page_id: string }).page_id;
}

export async function revokePreviewTokens(pageId: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  await sb.from("website_preview_tokens").delete().eq("page_id", pageId);
}
