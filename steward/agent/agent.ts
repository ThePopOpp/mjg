import { defineAgent, defineDynamic } from "eve";
import { anthropic } from "eve/models/anthropic";
import { openai } from "eve/models/openai";

/**
 * Steward — the member-facing agent.
 *
 * `defaultTools: false` is NOT optional here. Eve enables bash, read_file,
 * write_file, web_fetch, web_search, load_skill and agent by default. This agent
 * is reachable by any member who signs up, and the accepted baseline requires an
 * explicit allow-list: §E02 passes "allowed tools" per invocation, and §E05 says
 * important prohibitions "must be enforced in code/permissions as well as
 * prompts. A model-based check is supplementary, not the identity or security
 * boundary."
 *
 * Every tool Steward gets is added deliberately under steward/agent/tools/, and
 * each one proposes or reads — none of them writes Blueprint state directly.
 * Writes go through the application's services and come back as receipts.
 *
 * SPIKE SCAFFOLD: the model is pinned here so the harness can be proved. Phase 2
 * replaces it with `defineDynamic`, resolving per session from the Agent Manager
 * config so it can be switched without a redeploy and varied per tier.
 *
 * OpenAI only because it is the only provider with a real key in the
 * environment right now — not a product decision. `openai()` and `anthropic()`
 * both bypass the Vercel AI Gateway and talk to the provider directly; the
 * compiled manifest records that as `routing: external, provider: openai`.
 *
 * If a turn fails with "AI Gateway authentication failed: AI Gateway received no
 * credentials", do not believe it. eve reports an invalid or placeholder
 * provider key with that gateway-shaped message even when the model is routed
 * directly, which sends you hunting for a Vercel gateway key you do not need.
 * Check the provider key first: a real OPENAI_API_KEY is ~164 characters.
 */
/** Pinned fallback. Must stay a real id — never eve's default. */
const FALLBACK = { model: "gpt-4o-mini", provider: "openai" };

/**
 * Asks the application which model to use.
 *
 * Read at session start rather than baked in at build, which is what makes the
 * dashboard setting real. Failure is non-fatal by design; see the comment on
 * `model` below.
 */
async function resolveModel(): Promise<{ provider: string; model: string }> {
  const base = process.env.MJG_APP_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.STEWARD_AGENT_SECRET;
  if (!base || !secret) {
    console.warn("[steward] model config unreachable (MJG_APP_URL or STEWARD_AGENT_SECRET unset); using", FALLBACK);
    return FALLBACK;
  }

  try {
    const response = await fetch(`${base}/api/steward/agent/model`, {
      headers: { "x-steward-agent-secret": secret },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = (await response.json()) as {
      provider?: string;
      model?: string;
      usedFallback?: boolean;
    };
    if (!payload.model) throw new Error("no model in response");

    // Requested vs served is the distinction master08 cares about. This records
    // what we ASKED for; the provider's actual served model is recorded by the
    // application when it is returned.
    console.info(
      `[steward] model requested: ${payload.provider ?? "openai"}/${payload.model}` +
        (payload.usedFallback ? " (application had no setting; it chose a fallback)" : ""),
    );
    return { model: payload.model, provider: payload.provider ?? "openai" };
  } catch (error) {
    console.warn("[steward] could not resolve model, using fallback", FALLBACK, error);
    return FALLBACK;
  }
}

export default defineAgent({
  defaultTools: false,

  /**
   * The model is resolved per session from the Agent Manager, so a Super Admin
   * can change it from the dashboard and have the next conversation use it —
   * no redeploy, and no code change to try a different one.
   *
   * It is always an explicit id, never eve's own default. Calling `openai()`
   * with no argument picks `gpt-6-luna-fast` on eve 0.74.0, which this account
   * cannot reach, so every turn would fail with `model_not_found`. An unpinned
   * default also drifts with each eve upgrade, which is precisely the silent
   * change of execution context master08 forbids (test V2-X08).
   *
   * If the application is unreachable or the setting is unset, this falls back
   * to a pinned id rather than failing the session: a member mid conversation
   * should not lose Steward because a setting was cleared. The fallback is
   * logged, so it is visible rather than looking like a choice someone made.
   */
  model: defineDynamic({
    events: {
      "session.started": async () => {
        const selection = await resolveModel();
        return selection.provider === "anthropic"
          ? anthropic(selection.model)
          : openai(selection.model);
      },
    },
  }),

  experimental: {
    workflow: {
      /**
       * Durable state lives in Postgres, NOT on the container filesystem.
       *
       * This is a correctness requirement, not tuning. Eve's default world is
       * `@workflow/world-local`, which writes runs, steps, events and stream
       * chunks under `.eve/.workflow-data/`. On Coolify that directory is
       * container-local and ephemeral: it is lost on every deploy, is not shared
       * between replicas, and cannot be reached by a retention or deletion job.
       * A member's conversation would silently vanish on redeploy, and a
       * deletion request could not prove it had erased anything.
       *
       * NOTE FOR ANYONE CHANGING THIS: `WORKFLOW_TARGET_WORLD` — the env var the
       * @workflow/world-postgres README documents — does NOT work with eve. The
       * built server reads it nowhere; it survives in the bundle only inside
       * error strings. Eve resolves the world at BUILD time from this field and
       * bakes the import into `.output`. Setting the env var and nothing else
       * fails silently: the server starts, sessions are created and accepted,
       * and every run is written to local disk. Verified against eve 0.74.0.
       *
       * The factory is invoked at runtime, so the connection string still comes
       * from the environment (`WORKFLOW_POSTGRES_URL`, else `DATABASE_URL`) and
       * no credential is compiled into the manifest.
       *
       * Still marked `experimental` by eve, so re-verify on every eve upgrade.
       */
      world: "@workflow/world-postgres",
    },
  },
});
