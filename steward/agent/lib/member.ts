import { defineState } from "eve/context";

/**
 * The member this session belongs to.
 *
 * Tools cannot reach the session context directly — eve omits `context` from
 * tool execute options — so the principal is captured once by the
 * `session.started` hook, which DOES receive it, and read from here by every
 * tool.
 *
 * It is written from `ctx.session.auth`, which is what the channel's Supabase
 * verifier produced from the member's own token. It is never taken from a
 * message, a tool argument or anything the model can influence, so no
 * conversation can talk Steward into acting as someone else.
 */
export const memberState = defineState<{ principalId: string | null }>(
  "steward.member",
  () => ({ principalId: null }),
);
