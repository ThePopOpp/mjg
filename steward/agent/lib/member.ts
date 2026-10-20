import { defineState } from "eve/context";

/**
 * The member this session belongs to.
 *
 * Tools cannot reach the session context directly — eve omits `context` from
 * tool execute options — so the principal is captured once by the
 * `session.started` hook, which does receive it, and read from here by the
 * tools.
 *
 * It comes from `ctx.session.auth`, which is what the channel's Supabase
 * verifier produced from the member's own token. Never from a message, a tool
 * argument or anything else the model can influence, so no conversation can
 * talk Steward into acting as someone else.
 */
export const memberState = defineState<{ principalId: string | null }>(
  "steward.member",
  () => ({ principalId: null }),
);

/**
 * Pulls the principal out of a session's auth.
 *
 * `SessionAuth` is NOT `{ principalId }` — it is `{ current, initiator }`, each
 * either a principal or null. Reading `auth.principalId` silently yields
 * undefined, which is the bug that made Steward invent members' Blueprints: the
 * identity never arrived, every tool failed with "no signed-in member", and the
 * model covered the failure with a plausible answer rather than reporting it.
 *
 * `current` is whoever made this request; `initiator` opened the session. For a
 * member talking to Steward they are the same person, and falling back to the
 * initiator keeps a resumed session working.
 */
export function principalFromAuth(auth: {
  current?: { principalId?: string } | null;
  initiator?: { principalId?: string } | null;
} | null | undefined): string | null {
  return auth?.current?.principalId ?? auth?.initiator?.principalId ?? null;
}
