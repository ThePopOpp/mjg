import { memberState } from "./member.ts";

// Calling back into the MJG application.
//
// Steward holds no database credentials and knows no Blueprint rules. Every
// tool it has is a request to the application, which owns the rules and does
// the writing. That is the propose/approve contract made structural: there is
// no code path from this container to a member's Blueprint except through an
// endpoint that refuses to approve anything.

const TOOL_ENDPOINT = "/api/steward/agent";

function appUrl(): string {
  const base = process.env.MJG_APP_URL?.trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error(
      "MJG_APP_URL is not set. Steward cannot reach the application, so it has no tools.",
    );
  }
  return base;
}

function secret(): string {
  const value = process.env.STEWARD_AGENT_SECRET;
  if (!value) {
    throw new Error(
      "STEWARD_AGENT_SECRET is not set. Refusing to call the application without proving who we are.",
    );
  }
  return value;
}

/**
 * The member this turn belongs to.
 *
 * Read from session state the `session.started` hook wrote out of the verified
 * Supabase principal — NOT from tool arguments, and not from anything the model
 * can influence. A session with no principal gets no tools rather than a
 * default identity.
 */
function principalId(): string {
  const id = memberState.get().principalId;
  if (!id) throw new Error("This conversation has no signed-in member, so the Blueprint is not available.");
  return id;
}

export async function callApp<T>(tool: string, args: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`${appUrl()}${TOOL_ENDPOINT}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-steward-agent-secret": secret(),
    },
    body: JSON.stringify({ tool, principalId: principalId(), args }),
  });

  const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; result?: T; error?: string };

  // The application's error text is written FOR the model — "that is not a
  // field on this page" is how Steward learns to ask correctly. Surface it
  // rather than flattening every failure into one opaque message.
  if (!response.ok || payload.ok !== true) {
    throw new Error(payload.error ?? `The application returned ${response.status}.`);
  }
  return payload.result as T;
}
