import { defineHook } from "eve/hooks";
import { memberState, principalFromAuth } from "../lib/member.ts";

/**
 * Captures the signed-in member when the session opens.
 *
 * The channel verifies the Supabase token and eve puts the result on the
 * session, but a tool has no way to read that: `ToolExecuteOptions` is
 * explicitly `Omit<ToolExecutionOptions, "context">`. A hook does receive the
 * context, so this is where identity enters the agent — once, from the verified
 * principal, into durable session state.
 */
export default defineHook({
  events: {
    "session.started": (_event, ctx) => {
      const principalId = principalFromAuth(ctx.session.auth);
      if (!principalId) {
        // Loud, because the symptom is otherwise invisible: tools fail, and a
        // model covers the failure with something plausible.
        console.warn("[steward] session started with no principal; Blueprint tools will refuse");
      }
      memberState.update((current) => ({ ...current, principalId }));
    },
  },
});
