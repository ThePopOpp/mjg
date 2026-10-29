import { createHmac } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveProfileRole } from "@/lib/user-management/auth";
import { ROLES } from "@/lib/rbac/roles";
import {
  ACCESS_TTL_SECONDS,
  CODE_TTL_SECONDS,
  PREFIX,
  REFRESH_TTL_SECONDS,
  hashSecret,
  newSecret,
  safeEqual,
  secondsFromNow,
  verifyPkce,
} from "./tokens";
import { labelForClient } from "./clients";

// The OAuth 2.1 authorization server behind the MJG MCP (public clients, PKCE).
//
//   register  — dynamic client registration (Claude registers itself)
//   authorize — /oauth/authorize: the person signs in to MJG, must be an active
//               Super Admin, and approves; we issue a 5-minute single-use code
//   token     — code + PKCE verifier → access token (1h) + refresh token (30d);
//               refresh rotates both
//   revoke    — signs a connection out
//
// Tokens are opaque and stored hashed (lib/mcp/tokens.ts). Every MCP request
// re-checks the person is still an active Super Admin (lib/mcp/auth.ts).

export class OAuthError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const SCOPE = "mjg";

// ── Clients ─────────────────────────────────────────────────────────────────

function isAllowedRedirect(uri: string): boolean {
  try {
    const url = new URL(uri);
    if (url.hash) return false;
    if (url.protocol === "https:") return true;
    // Local MCP clients (Claude Code, MCP Inspector) use loopback redirects.
    return url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

export async function registerClient(body: Record<string, unknown>) {
  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris.filter((u): u is string => typeof u === "string") : [];
  if (!redirectUris.length || redirectUris.length > 10 || !redirectUris.every(isAllowedRedirect)) {
    throw new OAuthError("invalid_redirect_uri", "redirect_uris must be https (or http on localhost).");
  }
  const authMethod = body.token_endpoint_auth_method ?? "none";
  if (authMethod !== "none") throw new OAuthError("invalid_client_metadata", "Only public clients (token_endpoint_auth_method: none) are supported.");

  const clientName = typeof body.client_name === "string" ? body.client_name.slice(0, 120) : "MCP client";
  const clientId = newSecret(PREFIX.client).slice(0, 40);
  const clientLabel = labelForClient(clientName, redirectUris);
  const supabase = createSupabaseAdminClient();
  // Registering again can't get round the client's off switch (Settings → Claude & Agents).
  const { data: switchedOff } = await supabase
    .from("mcp_oauth_clients")
    .select("disabled_at, disabled_by")
    .eq("client_label", clientLabel)
    .not("disabled_at", "is", null)
    .limit(1)
    .maybeSingle();
  const { error } = await supabase.from("mcp_oauth_clients").insert({
    client_id: clientId,
    client_name: clientName,
    redirect_uris: redirectUris,
    client_label: clientLabel,
    disabled_at: switchedOff?.disabled_at ?? null,
    disabled_by: switchedOff?.disabled_by ?? null,
  });
  if (error) throw error;

  return {
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_name: clientName,
    redirect_uris: redirectUris,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    scope: SCOPE,
  };
}

export async function getClient(clientId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("mcp_oauth_clients").select("client_id, client_name, redirect_uris").eq("client_id", clientId).maybeSingle();
  return data;
}

// ── Authorization request (validated on the consent page and again on approve) ──

export type AuthorizeParams = {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  resource: string | null;
};

export async function validateAuthorizeRequest(params: Record<string, string | undefined>): Promise<AuthorizeParams & { clientName: string }> {
  if (params.response_type !== "code") throw new OAuthError("unsupported_response_type", "response_type must be code.");
  const client = params.client_id ? await getClient(params.client_id) : null;
  if (!client) throw new OAuthError("invalid_client", "Unknown client. Remove and re-add the connector.");
  if (!params.redirect_uri || !client.redirect_uris.includes(params.redirect_uri)) {
    throw new OAuthError("invalid_request", "redirect_uri does not match the registered client.");
  }
  if (params.code_challenge_method !== "S256" || !params.code_challenge || !/^[A-Za-z0-9\-_]{43}$/.test(params.code_challenge)) {
    throw new OAuthError("invalid_request", "PKCE (S256) is required.");
  }
  return {
    clientId: client.client_id,
    clientName: client.client_name ?? "MCP client",
    redirectUri: params.redirect_uri,
    codeChallenge: params.code_challenge,
    state: params.state ?? "",
    resource: params.resource ?? null,
  };
}

/** The person approving must be an active Super Admin right now. */
export async function assertCanAuthorize(profileId: string) {
  const resolved = await getActiveProfileRole(profileId).catch(() => null);
  if (!resolved || resolved.role !== ROLES.SUPER_ADMIN) {
    throw new OAuthError("access_denied", "The MJG connector is limited to active Super Admins.", 403);
  }
  return resolved;
}

// The consent form carries a signature over the request + the person, so a
// forged cross-site POST can't approve on someone's behalf.
function consentSecret(): string {
  const secret = process.env.MCP_OAUTH_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new OAuthError("server_error", "OAuth signing secret is not configured.", 500);
  return secret;
}

export function signConsent(params: AuthorizeParams, profileId: string, issuedAt: number): string {
  const payload = [params.clientId, params.redirectUri, params.codeChallenge, params.state, params.resource ?? "", profileId, issuedAt].join("\n");
  return createHmac("sha256", consentSecret()).update(payload).digest("base64url");
}

export function verifyConsent(params: AuthorizeParams, profileId: string, issuedAt: number, signature: string): boolean {
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > 15 * 60_000) return false;
  return safeEqual(signConsent(params, profileId, issuedAt), signature);
}

export async function issueAuthorizationCode(params: AuthorizeParams, profileId: string): Promise<string> {
  const code = newSecret(PREFIX.code);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("mcp_oauth_codes").insert({
    code_hash: hashSecret(code),
    client_id: params.clientId,
    profile_id: profileId,
    redirect_uri: params.redirectUri,
    code_challenge: params.codeChallenge,
    scopes: [SCOPE],
    resource: params.resource,
    expires_at: secondsFromNow(CODE_TTL_SECONDS),
  });
  if (error) throw error;
  return code;
}

// ── Token endpoint ──────────────────────────────────────────────────────────

function tokenResponse(access: string, refresh: string) {
  return { access_token: access, token_type: "Bearer", expires_in: ACCESS_TTL_SECONDS, refresh_token: refresh, scope: SCOPE };
}

export async function exchangeAuthorizationCode(form: URLSearchParams) {
  const code = form.get("code") ?? "";
  const verifier = form.get("code_verifier") ?? "";
  const clientId = form.get("client_id") ?? "";
  const redirectUri = form.get("redirect_uri") ?? "";
  if (!code || !verifier || !clientId) throw new OAuthError("invalid_request", "code, code_verifier and client_id are required.");

  const supabase = createSupabaseAdminClient();
  // Single use: claim the code atomically before anything else.
  const { data: row } = await supabase
    .from("mcp_oauth_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("code_hash", hashSecret(code))
    .is("used_at", null)
    .select("client_id, profile_id, redirect_uri, code_challenge, scopes, expires_at")
    .maybeSingle();

  if (!row) throw new OAuthError("invalid_grant", "Authorization code is invalid or already used.");
  if (new Date(row.expires_at).getTime() <= Date.now()) throw new OAuthError("invalid_grant", "Authorization code expired.");
  if (row.client_id !== clientId) throw new OAuthError("invalid_grant", "Code was issued to a different client.");
  if (redirectUri && redirectUri !== row.redirect_uri) throw new OAuthError("invalid_grant", "redirect_uri mismatch.");
  if (!verifyPkce(verifier, row.code_challenge)) throw new OAuthError("invalid_grant", "PKCE verification failed.");

  await assertCanAuthorize(row.profile_id).catch(() => {
    throw new OAuthError("invalid_grant", "This account can no longer use the MJG connector.");
  });

  const client = await getClient(clientId);
  const access = newSecret(PREFIX.access);
  const refresh = newSecret(PREFIX.refresh);
  const { error } = await supabase.from("mcp_tokens").insert({
    kind: "user",
    name: client?.client_name ?? "MCP client",
    profile_id: row.profile_id,
    client_id: clientId,
    access_hash: hashSecret(access),
    refresh_hash: hashSecret(refresh),
    scopes: ["*"],
    expires_at: secondsFromNow(ACCESS_TTL_SECONDS),
    refresh_expires_at: secondsFromNow(REFRESH_TTL_SECONDS),
    created_by: row.profile_id,
  });
  if (error) throw error;
  await supabase.from("mcp_oauth_clients").update({ last_used_at: new Date().toISOString() }).eq("client_id", clientId);
  return tokenResponse(access, refresh);
}

export async function refreshAccessToken(form: URLSearchParams) {
  const refresh = form.get("refresh_token") ?? "";
  const clientId = form.get("client_id") ?? "";
  if (!refresh) throw new OAuthError("invalid_request", "refresh_token is required.");

  const supabase = createSupabaseAdminClient();
  const { data: token } = await supabase
    .from("mcp_tokens")
    .select("id, profile_id, client_id, refresh_expires_at, revoked_at")
    .eq("refresh_hash", hashSecret(refresh))
    .maybeSingle();
  if (!token || token.revoked_at) throw new OAuthError("invalid_grant", "Refresh token is invalid.");
  if (clientId && token.client_id !== clientId) throw new OAuthError("invalid_grant", "Refresh token belongs to a different client.");
  if (token.refresh_expires_at && new Date(token.refresh_expires_at).getTime() <= Date.now()) {
    throw new OAuthError("invalid_grant", "Refresh token expired. Reconnect.");
  }
  await assertCanAuthorize(token.profile_id).catch(() => {
    throw new OAuthError("invalid_grant", "This account can no longer use the MJG connector.");
  });

  // Rotate both; the row (and so its id, used by confirmations and audit) stays the same.
  const access = newSecret(PREFIX.access);
  const nextRefresh = newSecret(PREFIX.refresh);
  const { data: rotated } = await supabase
    .from("mcp_tokens")
    .update({
      access_hash: hashSecret(access),
      refresh_hash: hashSecret(nextRefresh),
      expires_at: secondsFromNow(ACCESS_TTL_SECONDS),
      refresh_expires_at: secondsFromNow(REFRESH_TTL_SECONDS),
    })
    .eq("id", token.id)
    .eq("refresh_hash", hashSecret(refresh))
    .select("id")
    .maybeSingle();
  if (!rotated) throw new OAuthError("invalid_grant", "Refresh token was already used.");
  return tokenResponse(access, nextRefresh);
}

/** RFC 7009: revoking an unknown token is not an error. */
export async function revokeToken(token: string) {
  if (!token) return;
  const supabase = createSupabaseAdminClient();
  const hash = hashSecret(token);
  const now = new Date().toISOString();
  await supabase.from("mcp_tokens").update({ revoked_at: now }).or(`access_hash.eq.${hash},refresh_hash.eq.${hash}`).is("revoked_at", null);
}

// ── Agent tokens (issued in the dashboard, not via OAuth) ───────────────────

export async function createAgentToken(input: { name: string; profileId: string; scopes: string[]; createdBy: string; expiresInDays?: number }) {
  const secret = newSecret(PREFIX.agent);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("mcp_tokens")
    .insert({
      kind: "agent",
      name: input.name.slice(0, 120),
      profile_id: input.profileId,
      access_hash: hashSecret(secret),
      scopes: input.scopes,
      expires_at: input.expiresInDays ? secondsFromNow(input.expiresInDays * 86_400) : null,
      created_by: input.createdBy,
    })
    .select("id")
    .single();
  if (error) throw error;
  // The secret is shown once and never stored.
  return { id: data.id as string, secret };
}
