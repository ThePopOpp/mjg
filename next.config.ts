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

/**
 * Steward as a standalone product, on its own host.
 *
 * steward.michaeljgauthier.com serves the member app with no /steward prefix
 * in the URL, so it reads as its own product rather than a section of the
 * marketing site. It is the SAME deployment: one codebase, one database, one
 * Supabase session.
 *
 * That last point is why this is a subdomain and not an independent domain. A
 * cookie set for michaeljgauthier.com reaches steward.michaeljgauthier.com, so
 * a member signs in once and moves between the dashboard and Steward without
 * noticing. A different registrable domain cannot share that cookie, and would
 * mean signing in twice.
 *
 * WHAT MUST NOT BE REWRITTEN, and why each one is here:
 *   _next, favicon, manifest, sw.js, icons   framework and PWA assets
 *   api, auth, eve                           endpoints, including the agent proxy
 *   login, register, reset-password          auth pages the member app links to
 *   steward                                  already prefixed; would double up
 *   anything with a dot                      static files served from /public
 *
 * Scoped by `has: host`, so the main site is untouched whatever this matches.
 */
const stewardHost = process.env.STEWARD_HOST?.trim() || "steward.michaeljgauthier.com";

const STEWARD_HOST_PASSTHROUGH =
  "_next|api|auth|eve|login|register|reset-password|accept-invite|steward|favicon|manifest|sw\\.js|icons";

const nextConfig: NextConfig = {
  // Normally `.next`. A production build and `next dev` share that directory and
  // corrupt each other's output — running `npm run build` while the dev server
  // is up has taken local dev down more than once, and the symptom (a page that
  // simply stops loading) looks nothing like the cause. Setting NEXT_DIST_DIR
  // lets a verification build run in its own directory alongside dev.
  //
  // One cost: such a build rewrites tsconfig.json and next-env.d.ts to point at
  // the override. Run `git checkout -- tsconfig.json next-env.d.ts` afterwards.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  // pdfkit reads its built-in font metrics (.afm) from disk at runtime. Bundling it breaks
  // those file lookups, so keep it external and let Node require it from node_modules.
  serverExternalPackages: ["pdfkit"],

  // Marketing images (components/marketing/primitives/marketing-image.tsx) go
  // through next/image. Local files need nothing; uploads come from Supabase
  // storage, and stock placeholders were downloaded into /public.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },

  async redirects() {
    // The old signup page; Join the Journey now lives at /join.
    return [{ source: "/join-the-movement", destination: "/join", permanent: true }];
  },

  async headers() {
    // Preview copies of the redesigned pages are for review only. noindex in
    // the page metadata covers crawlers that render; the header covers the rest.
    return [
      {
        source: "/site-preview/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  async rewrites() {
    const beforeFiles = [];

    // /eve/v1/* must reach the agent rather than 404 against a route that does
    // not exist in this app.
    if (agentUrl) {
      beforeFiles.push({
        source: "/eve/v1/:path+",
        destination: `${agentUrl}/eve/v1/:path+`,
      });
    }

    // The Steward host: / -> /steward, /blueprint -> /steward/blueprint.
    beforeFiles.push(
      {
        source: "/",
        has: [{ type: "host" as const, value: stewardHost }],
        destination: "/steward",
      },
      {
        // The second lookahead excludes any path containing a dot, which is
        // how every file under /public is served — /mjg-logos/mjg_white.png,
        // /media/*, /icons/*. Without it the logo on this host rewrote to
        // /steward/mjg-logos/... and 404ed, which is exactly what happened.
        source: `/:path((?!${STEWARD_HOST_PASSTHROUGH})(?!.*\.).*)`,
        has: [{ type: "host" as const, value: stewardHost }],
        destination: "/steward/:path",
      },
    );

    return { beforeFiles, afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
