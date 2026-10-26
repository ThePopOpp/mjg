import { NextResponse } from "next/server";
import { CORS_HEADERS, mcpUrls } from "@/lib/mcp/urls";

// OAuth protected-resource metadata (RFC 9728) for the MJG MCP. Served at both
// /.well-known/oauth-protected-resource and …/mcp (the path-specific form),
// since clients try either. Tells Claude where to sign in.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const urls = mcpUrls(request);
  return NextResponse.json(
    {
      resource: urls.resource,
      authorization_servers: [urls.origin],
      scopes_supported: ["mjg"],
      bearer_methods_supported: ["header"],
      resource_name: "MJG",
    },
    { headers: CORS_HEADERS },
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
