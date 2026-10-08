import { defineAgent } from "eve";
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
export default defineAgent({
  defaultTools: false,

  // The model id is pinned deliberately. Calling `openai()` with no argument
  // picks eve's own default, which on eve 0.74.0 is `gpt-6-luna-fast` — a model
  // this account cannot reach, so every turn fails with `model_not_found`. An
  // unpinned default also drifts with each eve upgrade, which is exactly the
  // silent change of execution context master08 forbids (test V2-X08).
  model: openai("gpt-4o-mini"),

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
