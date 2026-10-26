import { NextResponse } from "next/server";
import { OAuthError, registerClient } from "@/lib/mcp/oauth";
import { CORS_HEADERS } from "@/lib/mcp/urls";

// OAuth dynamic client registration (RFC 7591) — Claude registers itself here
// the first time the MJG connector is added.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    return NextResponse.json(await registerClient(body), { status: 201, headers: { ...CORS_HEADERS, "cache-control": "no-store" } });
  } catch (err) {
    const e = err instanceof OAuthError ? err : new OAuthError("server_error", "Registration failed.", 500);
    if (!(err instanceof OAuthError)) console.error("[oauth] register", err);
    return NextResponse.json({ error: e.code, error_description: e.message }, { status: e.status, headers: CORS_HEADERS });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
