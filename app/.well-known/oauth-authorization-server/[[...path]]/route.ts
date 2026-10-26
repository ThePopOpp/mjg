import { NextResponse } from "next/server";
import { CORS_HEADERS, mcpUrls } from "@/lib/mcp/urls";

// OAuth authorization-server metadata (RFC 8414) for the MJG MCP: the app signs
// people in (Supabase session), checks they are an active Super Admin, and
// issues MCP tokens. Public clients only (PKCE, no client secret).
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const urls = mcpUrls(request);
  return NextResponse.json(
    {
      issuer: urls.origin,
      authorization_endpoint: urls.authorize,
      token_endpoint: urls.token,
      registration_endpoint: urls.register,
      revocation_endpoint: urls.revoke,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      revocation_endpoint_auth_methods_supported: ["none"],
      scopes_supported: ["mjg"],
    },
    { headers: CORS_HEADERS },
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
