// Turns a Supabase session into an eve principal.
//
// WHY THIS FILE EXISTS
// --------------------
// The browser talks to Steward on this app's own origin (`/eve/v1/...`), which
// Next.js rewrites to the eve service over loopback. That means the Supabase
// auth cookie rides along on the request, and this module is the only thing
// standing between that cookie and a Steward session. There is no second login.
//
// It deliberately does NOT use eve's built-in `jwtEcdsa()` helper. That helper
// takes a single hard-coded PEM public key, but this Supabase project signs with
// asymmetric ES256 keys published at a rotating JWKS endpoint:
//
//   https://<ref>.supabase.co/auth/v1/.well-known/jwks.json
//   -> { "keys": [ { "alg": "ES256", "kid": "...", "kty": "EC", ... } ] }
//
// Pinning today's PEM would silently 401 every member the moment Supabase
// rotates that key. `createRemoteJWKSet` follows the rotation and caches, so
// verification stays local and fast without a per-request network call.
//
// `eve/channels/auth` also ships `oidc()`, which does understand JWKS — but it
// tags the caller `principalType: "service"`. Members are not services, and that
// distinction drives downstream authorisation, so it is not usable here either.

import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AuthFn } from "eve/channels/auth";

/**
 * Supabase stores the session under `sb-<project-ref>-auth-token`. When the
 * session JSON exceeds 3180 bytes @supabase/ssr splits it across numbered
 * cookies (`...auth-token.0`, `.1`, ...) which must be concatenated in order
 * before decoding. See @supabase/ssr's `combineChunks`/`CHUNK_LIKE_REGEX`.
 */
const CHUNK_SUFFIX = /^(.*)\.(0|[1-9][0-9]*)$/;

/** @supabase/ssr marks base64url-encoded cookie values with this prefix. */
const BASE64_PREFIX = "base64-";

interface AuthConfig {
  readonly cookieName: string | null;
  readonly issuer: string;
  readonly jwks: ReturnType<typeof createRemoteJWKSet>;
}

let cachedConfig: AuthConfig | null = null;

/**
 * Resolves the issuer, JWKS client and cookie name — lazily, and memoized for
 * the life of the process.
 *
 * Lazy is not an optimisation here, it is a correctness requirement. `eve build`
 * *evaluates* every authored module under `agent/` to discover channels, tools
 * and agents. Reading (and rejecting on) a Supabase env var at module scope
 * therefore fails the Docker image build, where no runtime secrets are present.
 * Any import-time side effect in this directory — an env assertion, a network
 * client, a DB pool — runs at build time, so it all belongs behind a call.
 */
function config(): AuthConfig {
  if (cachedConfig) return cachedConfig;

  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!raw || raw.trim().length === 0) {
    // Thrown on first request rather than at import. The auth walk turns a
    // skipped entry into a bare 401, which would look like a bad password; this
    // surfaces the actual misconfiguration instead.
    throw new Error(
      "Steward auth needs NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) to resolve the JWKS endpoint.",
    );
  }

  const supabaseUrl = raw.trim().replace(/\/+$/, "");
  const issuer = `${supabaseUrl}/auth/v1`;

  // Project ref from `https://<ref>.supabase.co`, used to name the cookie.
  const host = new URL(supabaseUrl).hostname;
  const ref = host.split(".")[0];

  cachedConfig = {
    cookieName: ref && ref !== "localhost" ? `sb-${ref}-auth-token` : null,
    issuer,
    // One JWKS cache for the process, not one per request.
    jwks: createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)),
  };
  return cachedConfig;
}

function parseCookieHeader(header: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name.length === 0) continue;
    out.set(name, part.slice(eq + 1).trim());
  }
  return out;
}

/**
 * Reassembles the Supabase session cookie and digs out the access token.
 * Returns null for anything malformed — a broken cookie is an unauthenticated
 * request, never an error worth surfacing to the caller.
 */
function accessTokenFromCookies(header: string | null, cookieName: string | null): string | null {
  if (!header || !cookieName) return null;
  const cookies = parseCookieHeader(header);

  let raw = cookies.get(cookieName) ?? null;
  if (raw === null) {
    // Chunked form. Sort numerically — `.10` must not sort before `.2`.
    const chunks: { index: number; value: string }[] = [];
    for (const [name, value] of cookies) {
      const match = name.match(CHUNK_SUFFIX);
      if (match && match[1] === cookieName) {
        chunks.push({ index: Number(match[2]), value });
      }
    }
    if (chunks.length === 0) return null;
    chunks.sort((a, b) => a.index - b.index);
    raw = chunks.map((c) => c.value).join("");
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  if (decoded.startsWith(BASE64_PREFIX)) {
    try {
      decoded = Buffer.from(decoded.slice(BASE64_PREFIX.length), "base64url").toString("utf8");
    } catch {
      return null;
    }
  }

  try {
    const session = JSON.parse(decoded) as { access_token?: unknown };
    return typeof session.access_token === "string" ? session.access_token : null;
  } catch {
    return null;
  }
}

function bearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer[ ]+(.+)$/i);
  const token = match?.[1]?.trim();
  return token && token.length > 0 ? token : null;
}

/**
 * Verifies a Supabase access token and returns its claims, or null.
 *
 * Exported so the behaviour can be tested directly against a locally minted
 * key rather than only through a live login.
 */
export async function verifySupabaseAccessToken(
  token: string,
  keys?: Parameters<typeof jwtVerify>[1],
  issuerOverride?: string,
): Promise<{ sub: string; email?: string; role: string } | null> {
  const resolvedKeys = keys ?? config().jwks;
  const issuer = issuerOverride ?? config().issuer;

  let payload: Record<string, unknown>;
  try {
    const result = await jwtVerify(token, resolvedKeys, {
      issuer,
      // Pin the algorithm. Without this, a token signed with a different scheme
      // could be presented against a key the set happens to accept.
      algorithms: ["ES256"],
      // Supabase sets aud to "authenticated" for signed-in users.
      audience: "authenticated",
    });
    payload = result.payload as Record<string, unknown>;
  } catch {
    return null;
  }

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  const role = typeof payload.role === "string" ? payload.role : null;
  if (!sub || !role) return null;

  // THE BOUNDARY THAT MATTERS. A project's anon and service_role keys are also
  // tokens issued by this same issuer. Accepting either would hand a Steward
  // session to anyone holding a public key, or hand one full-trust identity to
  // every caller. Only a real signed-in end user may open a session.
  if (role !== "authenticated") return null;

  const email = typeof payload.email === "string" ? payload.email : undefined;
  return email === undefined ? { role, sub } : { email, role, sub };
}

/**
 * eve route auth backed by the Supabase session.
 *
 * Returns `null` (not a thrown error) when there is no usable credential, so it
 * composes with eve's ordered auth walk. The walk 401s when every entry skips,
 * which is the behaviour we want: no anonymous Steward sessions, ever.
 */
export function supabasePrincipal(): AuthFn<Request> {
  return async (request: Request) => {
    const { cookieName, issuer, jwks } = config();

    const token =
      bearerToken(request.headers.get("authorization")) ??
      accessTokenFromCookies(request.headers.get("cookie"), cookieName);
    if (!token) return null;

    const claims = await verifySupabaseAccessToken(token, jwks, issuer);
    if (!claims) return null;

    // Built imperatively: a conditional object literal widens to a union whose
    // absent-email branch carries `email?: undefined`, which is not assignable
    // to the Record<string, string | readonly string[]> that eve expects.
    const attributes: Record<string, string> = {};
    if (claims.email) attributes.email = claims.email;

    return {
      attributes,
      authenticator: "supabase",
      issuer,
      // This is the identity every per-member lookup keys off. It is the
      // Supabase `auth.users.id`, which is also `profiles.id` in this app, so
      // it joins straight onto member data without an email match.
      principalId: claims.sub,
      principalType: "user",
      subject: claims.sub,
    };
  };
}
