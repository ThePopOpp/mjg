import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveProfileRole } from "@/lib/user-management/auth";
import { ROLES } from "@/lib/rbac/roles";
import type { ToolContext } from "@/lib/tools/types";
import { hashSecret } from "./tokens";

// Who is calling the MCP endpoint. Checked on EVERY request, in this order:
//   1. the kill switch (mcp_settings.enabled),
//   2. the bearer token: known, not revoked, not expired,
//   3. the person behind it: still an active Super Admin right now.
// So switching the connector off, revoking a token, deactivating someone or
// changing their role takes effect on the very next call.

export type McpActor = {
  ctx: ToolContext;
  tokenId: string;
  scopes: string[];
  clientId: string | null;
  expiresAt: number | undefined;
};

export type AuthFailure = { status: 401 | 403 | 503; error: string; description: string };

export async function isMcpEnabled(): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("mcp_settings").select("enabled").eq("id", 1).maybeSingle();
  return Boolean(data?.enabled);
}

export async function authenticateMcpRequest(request: Request): Promise<McpActor | AuthFailure> {
  if (!(await isMcpEnabled())) {
    return { status: 503, error: "temporarily_unavailable", description: "The MJG connector is switched off in Settings → Claude & Agents." };
  }

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!bearer) return { status: 401, error: "invalid_token", description: "Sign in to connect." };

  const supabase = createSupabaseAdminClient();
  const { data: token } = await supabase
    .from("mcp_tokens")
    .select("id, kind, profile_id, client_id, scopes, expires_at, revoked_at, paused_at")
    .eq("access_hash", hashSecret(bearer))
    .maybeSingle();

  if (!token || token.revoked_at) return { status: 401, error: "invalid_token", description: "This connection was signed out. Reconnect." };
  if (token.expires_at && new Date(token.expires_at).getTime() <= Date.now()) {
    return { status: 401, error: "invalid_token", description: "Session expired." };
  }
  if (token.paused_at) {
    return { status: 403, error: "access_denied", description: "This agent is paused in Settings → Claude & Agents." };
  }

  const resolved = await getActiveProfileRole(token.profile_id);
  if (!resolved || resolved.role !== ROLES.SUPER_ADMIN) {
    return { status: 403, error: "insufficient_scope", description: "The MJG connector is limited to active Super Admins." };
  }

  // Best effort; never fails the request.
  void supabase.from("mcp_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", token.id).then(() => undefined);

  return {
    tokenId: token.id,
    scopes: token.scopes ?? [],
    clientId: token.client_id,
    expiresAt: token.expires_at ? Math.floor(new Date(token.expires_at).getTime() / 1000) : undefined,
    ctx: {
      actorId: resolved.profile.id,
      actorEmail: resolved.profile.email ?? "",
      role: resolved.role,
      via: "mcp",
      tokenKind: token.kind as "user" | "agent",
      tokenId: token.id,
      clientId: token.client_id,
    },
  };
}

export function isAuthFailure(value: McpActor | AuthFailure): value is AuthFailure {
  return "status" in value;
}
