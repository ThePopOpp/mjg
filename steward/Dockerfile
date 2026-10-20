# Steward — the member-facing agent runtime.
#
# Its own Coolify resource, deliberately. withEve does not run the agent inside
# the Next.js process: it adds a rewrite, /eve/v1/:path+ -> the eve server, and
# proxies. Running that server in the website's container would mean an agent
# that fails to boot takes michaeljgauthier.com down with it — which is exactly
# what happened on 2026-10-15. Separate resource, separate lifecycle.
#
# Coolify settings this file expects:
#   Build Pack        Dockerfile
#   Base directory    /
#   Dockerfile loc.   /steward/Dockerfile
#   Port              4274
#   Domains           NONE. Reached over the `coolify` network only.
#
# The build context is the repo root, so every COPY below is repo-relative.

# Node 24 is a hard floor — eve declares engines.node >= 24.
FROM node:24-bookworm-slim AS builder
WORKDIR /app/steward

# steward/ carries its own package.json rather than leaning on the Next app's
# node_modules. The agent is a separate deployable; it should not pull in Next,
# React, Stripe, Supabase and the rest of the website to build a chat server.
#
# `just-bash` is in there and must stay, despite this agent having
# `defaultTools: false` and therefore no bash tool. eve initialises a sandbox
# template named "root" at BUILD time regardless of which tools are enabled, and
# without the package the build dies with "The just-bash sandbox provider
# requires the `just-bash` package". It is inert at runtime — nothing can reach
# a shell, because no tool exposes one.
# `npm install`, not `npm ci`: the lockfile is generated on Windows and omits
# Linux-only optional deps, which makes strict `ci` fail. Same reason the root
# Dockerfile does it this way.
COPY steward/package.json steward/package-lock.json ./
RUN npm install --no-audit --no-fund

COPY steward/ ./

# Compiles the agent to .output/server/index.mjs and BAKES IN the workflow world
# resolved from agent.ts. WORKFLOW_TARGET_WORLD does not work with eve — the
# world is a build-time decision, verified against 0.74.0. If this step is
# skipped the server still starts and silently writes every run to local disk.
RUN npx eve build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:24-bookworm-slim AS runner
WORKDIR /app/steward
ENV NODE_ENV=production PORT=4274     # Graphile Worker's default concurrency is 50 against a Postgres pool of 10.
    # It warns about this at boot and then, under real use, stops claiming jobs
    # entirely: turns queue a job, nothing picks it up, and the member sees a
    # question that never gets answered. Observed with 28 jobs sitting at
    # attempts=0, unlocked, for over an hour.
    #
    # Kept below the pool size deliberately. Steward's work is one turn per
    # member at a time, not a batch queue, so headroom matters more than
    # parallelism.
    WORKFLOW_POSTGRES_WORKER_CONCURRENCY=8

COPY --from=builder /app/steward/node_modules ./node_modules
COPY --from=builder /app/steward/package.json ./
COPY --from=builder /app/steward/.output ./.output
# The agent definition and instructions ship too: eve reads instructions.md at
# runtime, and shipping the source is what makes a deployed reply traceable back
# to the exact instruction bundle that produced it.
COPY --from=builder /app/steward/agent ./agent

EXPOSE 4274

# Required at runtime, supplied by Coolify (never baked into the image):
#   OPENAI_API_KEY            the provider key
#   DATABASE_URL              Postgres for the workflow world — durable sessions
#   NEXT_PUBLIC_SUPABASE_URL  JWKS origin for verifying a member's token
#
# WORKFLOW_POSTGRES_URL overrides DATABASE_URL if the agent ever needs its own
# database. The world factory reads it at runtime, so no credential is compiled
# into the bundle.
CMD ["npx", "eve", "start"]

# ── One-time, per database ────────────────────────────────────────────────────
# @workflow/world-postgres needs its own schema before the server can start. It
# is NOT created automatically: without it the container boots, queries
# workflow.workflow_runs, and exits code 1 with
# `relation "workflow.workflow_runs" does not exist`.
#
# From the repo root, against the target database:
#
#     npm run steward:db:bootstrap
#
# Creates the workflow, graphile_worker and workflow_drizzle schemas. Additive
# and namespaced — it does not touch `public`. Run it once per database, and
# again after an eve or world-postgres upgrade that ships new migrations.
