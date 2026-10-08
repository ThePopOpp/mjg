import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // pdfkit reads its built-in font metrics (.afm) from disk at runtime. Bundling it breaks
  // those file lookups, so keep it external and let Node require it from node_modules.
  serverExternalPackages: ["pdfkit"],
};

/**
 * Steward, the member-facing agent, is mounted on this app's origin.
 *
 * withEve does NOT run the agent inside this Next.js process — it adds a single
 * rewrite, /eve/v1/:path+ -> 127.0.0.1:4274, and proxies to a separate eve
 * service. Same origin is the point: our Supabase session cookie applies to
 * Steward with no CORS and no second auth. (EVE_NEXT_PRODUCTION_ORIGIN can later
 * point that rewrite at a separate host, so eve can become its own Coolify
 * resource without changing this file.)
 *
 * `eveRoot` keeps the agent definition in steward/ rather than the repo root, so
 * Steward's instructions, tools and build output stay separate from the Next.js
 * app and from Shepherd.
 *
 * WHY THIS IS GATED
 * -----------------
 * In `next dev`, withEve starts the eve dev server while resolving rewrites, and
 * that server connects to its Postgres workflow store on startup. If the store
 * is unreachable it exits non-zero, and `next dev` then dies with "eve server
 * process exited before printing its server URL" — the whole app, not just
 * Steward. Mounting unconditionally would mean nobody can run the dashboard
 * locally without a workflow database, which is a bad trade while Steward has no
 * UI yet.
 *
 * So: always mounted in production builds, and opt-in locally via STEWARD_EVE=1
 * when you are actually working on Steward. A production build does not need the
 * database — only the dev server starts a live eve process.
 */
const mountEve = process.env.NODE_ENV === "production" || process.env.STEWARD_EVE === "1";

export default mountEve ? withEve(nextConfig, { eveRoot: "steward" }) : nextConfig;
