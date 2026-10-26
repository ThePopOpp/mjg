import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { isMcpEnabled } from "@/lib/mcp/auth";
import { OAuthError, assertCanAuthorize, issueAuthorizationCode, validateAuthorizeRequest, verifyConsent } from "@/lib/mcp/oauth";

// The consent form on /oauth/authorize posts here. Re-validates everything
// (client, redirect, PKCE, the signed consent, the person's role) before
// issuing a code, then sends the browser back to the client.
export const dynamic = "force-dynamic";

function back(redirectUri: string, params: Record<string, string>) {
  const url = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  return NextResponse.redirect(url.toString(), 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const field = (k: string) => (typeof form.get(k) === "string" ? (form.get(k) as string) : undefined);

  let params;
  try {
    params = await validateAuthorizeRequest({
      response_type: "code",
      client_id: field("client_id"),
      redirect_uri: field("redirect_uri"),
      code_challenge: field("code_challenge"),
      code_challenge_method: "S256",
      state: field("state"),
      resource: field("resource"),
    });
  } catch (err) {
    // An invalid client or redirect is never redirected to (it could be anyone's URL).
    const message = err instanceof OAuthError ? err.message : "Invalid request.";
    return new NextResponse(message, { status: 400 });
  }

  if (field("decision") !== "allow") return back(params.redirectUri, { error: "access_denied", state: params.state });

  const profile = await getCurrentProfile();
  if (!profile) return back(params.redirectUri, { error: "access_denied", error_description: "Not signed in.", state: params.state });
  if (!verifyConsent(params, profile.id, Number(field("issued_at")), field("signature") ?? "")) {
    return back(params.redirectUri, { error: "access_denied", error_description: "Consent expired. Try connecting again.", state: params.state });
  }
  try {
    if (!(await isMcpEnabled())) throw new OAuthError("temporarily_unavailable", "The MJG connector is switched off.");
    await assertCanAuthorize(profile.id);
    const code = await issueAuthorizationCode(params, profile.id);
    return back(params.redirectUri, { code, state: params.state });
  } catch (err) {
    const e = err instanceof OAuthError ? err : new OAuthError("server_error", "Could not complete sign-in.");
    if (!(err instanceof OAuthError)) console.error("[oauth] authorize", err);
    return back(params.redirectUri, { error: e.code, error_description: e.message, state: params.state });
  }
}
