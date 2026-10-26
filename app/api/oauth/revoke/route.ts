import { NextResponse } from "next/server";
import { revokeToken } from "@/lib/mcp/oauth";
import { CORS_HEADERS } from "@/lib/mcp/urls";

// OAuth token revocation (RFC 7009). Always 200, even for unknown tokens.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = new URLSearchParams(await request.text());
  await revokeToken(form.get("token") ?? "").catch((err) => console.error("[oauth] revoke", err));
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
