import { NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateMcpRequest, isAuthFailure } from "@/lib/mcp/auth";
import { createMcpServer } from "@/lib/mcp/server";
import { CORS_HEADERS, mcpUrls } from "@/lib/mcp/urls";

// The MJG MCP endpoint (Streamable HTTP, stateless). Public URL: <origin>/mcp,
// rewritten here in next.config.ts. Each request is authenticated, then served
// by a fresh server built for that actor from the tool registry (lib/mcp).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

async function handle(request: Request) {
  const actor = await authenticateMcpRequest(request);
  if (isAuthFailure(actor)) {
    const urls = mcpUrls(request);
    return NextResponse.json(
      { error: actor.error, error_description: actor.description },
      {
        status: actor.status,
        headers: {
          ...CORS_HEADERS,
          ...(actor.status === 401
            ? { "www-authenticate": `Bearer resource_metadata="${urls.resourceMetadata}", error="${actor.error}", error_description="${actor.description}"` }
            : {}),
        },
      },
    );
  }

  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  const server = createMcpServer(actor);
  await server.connect(transport);
  try {
    const response = await transport.handleRequest(request, {
      authInfo: { token: "", clientId: actor.clientId ?? "", scopes: actor.scopes, expiresAt: actor.expiresAt },
    });
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
    return new Response(response.body, { status: response.status, headers });
  } finally {
    // Stateless: nothing to keep between requests.
    void server.close();
  }
}

export const POST = handle;
export const GET = handle;
export const DELETE = handle;

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
