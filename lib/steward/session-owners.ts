import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Steward session ownership (table steward_session_owners; see migration
// 202611130141 for why it exists).
//
// Called by the Steward container through /api/steward/agent, so the profile id
// here is always the one that route resolved from the eve-verified principal —
// never anything a browser or the model supplied.

/** eve session ids are workflow run ids (`wrun_…`). Anything else is refused. */
const SESSION_ID = /^[A-Za-z0-9_-]{8,128}$/;

function sessionIdFrom(args: { sessionId?: unknown }): string | null {
  const id = typeof args?.sessionId === "string" ? args.sessionId.trim() : "";
  return SESSION_ID.test(id) ? id : null;
}

/**
 * Records that `profileId` owns a session eve has just created. Idempotent for
 * the same owner; a session already owned by someone else is refused and
 * reported as such, never reassigned.
 */
export async function claimSession(profileId: string, args: { sessionId?: unknown }): Promise<{ owned: boolean }> {
  const sessionId = sessionIdFrom(args);
  if (!sessionId) return { owned: false };

  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("steward_session_owners")
    .insert({ session_id: sessionId, profile_id: profileId });
  // 23505 = already recorded. Fine only if it is already this member's.
  if (error && error.code !== "23505") throw new Error(`could not record session owner: ${error.message}`);
  return sessionOwnedBy(profileId, { sessionId });
}

/** True only when a row says this member owns this session. No row → false. */
export async function sessionOwnedBy(profileId: string, args: { sessionId?: unknown }): Promise<{ owned: boolean }> {
  const sessionId = sessionIdFrom(args);
  if (!sessionId) return { owned: false };

  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from("steward_session_owners")
    .select("profile_id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw new Error(`could not read session owner: ${error.message}`);
  return { owned: data?.profile_id === profileId };
}
