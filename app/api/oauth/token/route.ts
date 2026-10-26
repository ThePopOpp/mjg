import { NextResponse } from "next/server";
import { OAuthError, exchangeAuthorizationCode, refreshAccessToken } from "@/lib/mcp/oauth";
import { CORS_HEADERS } from "@/lib/mcp/urls";

// OAuth token endpoint: authorization_code (with PKCE) and refresh_token grants.
export const dynamic = "force-dynamic";

const NO_STORE = { ...CORS_HEADERS, "cache-control": "no-store", pragma: "no-cache" };

export async function POST(request: Request) {
  try {
    const form = new URLSearchParams(await request.text());
    const grant = form.get("grant_type");
    const body =
      grant === "authorization_code"
        ? await exchangeAuthorizationCode(form)
        : grant === "refresh_token"
          ? await refreshAccessToken(form)
          : (() => {
              throw new OAuthError("unsupported_grant_type", "Use authorization_code or refresh_token.");
            })();
    return NextResponse.json(body, { headers: NO_STORE });
  } catch (err) {
    const e = err instanceof OAuthError ? err : new OAuthError("server_error", "Token request failed.", 500);
    if (!(err instanceof OAuthError)) console.error("[oauth] token", err);
    return NextResponse.json({ error: e.code, error_description: e.message }, { status: e.status, headers: NO_STORE });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
