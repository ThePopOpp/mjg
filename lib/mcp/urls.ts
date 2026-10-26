// Public URLs for the MCP and its OAuth server.
//
// Behind Coolify's proxy, request.url is the container's address, so the public
// origin comes from MCP_PUBLIC_ORIGIN when set, otherwise the forwarded host
// headers. Claude reaches the server at <origin>/mcp (rewritten to /api/mcp in
// next.config.ts); that URL is also the OAuth "resource" tokens are issued for.

export function publicOrigin(request: Request): string {
  const configured = process.env.MCP_PUBLIC_ORIGIN?.trim().replace(/\/$/, "");
  return configured || requestOrigin(request);
}

/** The origin the visitor actually used (forwarded headers), ignoring MCP_PUBLIC_ORIGIN. */
export function requestOrigin(request: Request): string {
  const headers = request.headers;
  const host = headers.get("x-forwarded-host")?.split(",")[0].trim() || headers.get("host") || new URL(request.url).host;
  const forwardedProto = headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const proto = forwardedProto || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export function mcpUrls(request: Request) {
  const origin = publicOrigin(request);
  return {
    origin,
    resource: `${origin}/mcp`,
    resourceMetadata: `${origin}/.well-known/oauth-protected-resource/mcp`,
    authorize: `${origin}/oauth/authorize`,
    token: `${origin}/api/oauth/token`,
    register: `${origin}/api/oauth/register`,
    revoke: `${origin}/api/oauth/revoke`,
  };
}

/** CORS for browser-based MCP clients (e.g. MCP Inspector). Tokens are bearer, never cookies. */
export const CORS_HEADERS: Record<string, string> = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "authorization, content-type, mcp-protocol-version, mcp-session-id, last-event-id",
  "access-control-expose-headers": "www-authenticate, mcp-session-id",
};
