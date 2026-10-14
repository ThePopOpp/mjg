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
 * WHY THIS IS OFF UNLESS YOU ASK FOR IT
 * -------------------------------------
 * withEve needs a BUILT eve service to point at. In production it asserts that
 * steward/.output/server/index.mjs exists and throws at startup if it does not:
 *
 *   "eve production output is missing at <root>/steward/.output/server/index.mjs.
 *    Run eve build from <root>/steward before starting Next.js."
 *
 * The runtime image does not COPY steward/, so mounting it on NODE_ENV=production
 * took the whole site down with "no available server": Next threw before it could
 * listen and the container never came up. `next dev` fails just as hard for a
 * different reason — it starts the eve dev server, which exits non-zero when its
 * Postgres workflow store is unreachable and takes `next dev` down with it.
 *
 * Nothing calls /eve/v1/* yet, because there is no Steward agent UI. A rewrite to
 * a service that is not running buys nothing and risks everything, so it stays
 * off until STEWARD_EVE=1 is set deliberately.
 *
 * Turning it on needs all three, not just the flag: COPY steward/ into the
 * runtime stage, run `eve build` so .output exists, and run `eve start` alongside
 * Next so something is listening on the port the rewrite targets.
 */
const mountEve = process.env.STEWARD_EVE === "1";

export default mountEve ? withEve(nextConfig, { eveRoot: "steward" }) : nextConfig;
