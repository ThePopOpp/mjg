import type { NextConfig } from "next";

/**
 * Steward, the member-facing agent, is reached on this app's origin.
 *
 * The agent runs as its OWN Coolify resource — a separate container built from
 * steward/Dockerfile — and this is just a reverse proxy to it. Same origin is
 * the point: the Supabase session cookie applies to Steward with no CORS and no
 * second sign-in, while the agent itself keeps its own lifecycle. A crash there
 * can no longer take michaeljgauthier.com down.
 *
 * WHY THIS IS A PLAIN REWRITE AND NOT `withEve`
 * ---------------------------------------------
 * withEve does the same job, but in production it reaches for a LOCAL build:
 * unless EVE_NEXT_PRODUCTION_ORIGIN is set it tries to start an eve server from
 * steward/.output and throws at startup if that output is missing —
 *
 *   "eve production output is missing at <root>/steward/.output/server/index.mjs."
 *
 * The website's image does not contain steward/, so mounting it took the whole
 * site down on 2026-10-15 with "no available server": Next threw before it could
 * listen and the container never came up.
 *
 * A rewrite cannot do that. If the agent is unreachable, /eve/v1/* returns an
 * error and every other page keeps serving. For a surface the whole marketing
 * site depends on, that trade is worth more than the convenience withEve adds.
 *
 * The path is identical on both sides because the eve server serves /eve/v1/*
 * itself (EVE_ROUTE_PREFIX). Verified against a running 0.74.0 build:
 *
 *   GET  /eve/v1/health   200  {"ok":true,"status":"ready",...}
 *   GET  /eve/v1/info     401
 *   POST /eve/v1/session  401 with no token, and 401 with a bad one
 *
 * That 401 is the agent's own Supabase verification, which is the real security
 * boundary — this proxy adds convenience, not protection.
 *
 * STEWARD_AGENT_URL is the agent's address:
 *   production  http://steward-agent:4274   (Coolify network alias)
 *   local       http://127.0.0.1:4274       (npx eve start in steward/)
 * Unset means no rewrite at all, which is the safe default.
 */
const agentUrl = process.env.STEWARD_AGENT_URL?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // pdfkit reads its built-in font metrics (.afm) from disk at runtime. Bundling it breaks
  // those file lookups, so keep it external and let Node require it from node_modules.
  serverExternalPackages: ["pdfkit"],

  async rewrites() {
    if (!agentUrl) return [];
    return {
      // beforeFiles: /eve/v1/* must reach the agent rather than 404 against a
      // route that does not exist in this app.
      beforeFiles: [
        {
          source: "/eve/v1/:path+",
          destination: `${agentUrl}/eve/v1/:path+`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
