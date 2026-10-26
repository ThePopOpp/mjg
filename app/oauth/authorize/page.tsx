import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { isMcpEnabled } from "@/lib/mcp/auth";
import { OAuthError, assertCanAuthorize, signConsent, validateAuthorizeRequest } from "@/lib/mcp/oauth";

// Consent screen for connecting Claude (or another MCP client) to MJG. The
// person signs in with their MJG account (the normal /login, then back here),
// must be an active Super Admin, and approves. The form posts to
// /api/oauth/authorize with a signature over the request, so it can't be forged.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connect to MJG", robots: { index: false, follow: false } };

type Search = Record<string, string | string[] | undefined>;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-7 shadow-sm">{children}</div>
    </main>
  );
}

function Problem({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <TriangleAlert className="h-7 w-7 text-[#b88a4a]" aria-hidden />
      <h1 className="mt-4 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </Shell>
  );
}

export default async function AuthorizePage({ searchParams }: { searchParams: Promise<Search> }) {
  const raw = await searchParams;
  const params = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

  let request;
  try {
    request = await validateAuthorizeRequest(params);
  } catch (err) {
    return <Problem title="This connection request isn't valid" body={err instanceof OAuthError ? err.message : "Try adding the connector again."} />;
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    const here = `/oauth/authorize?${new URLSearchParams(params as Record<string, string>).toString()}`;
    redirect(`/login?next=${encodeURIComponent(here)}`);
  }

  if (!(await isMcpEnabled())) {
    return <Problem title="The MJG connector is switched off" body="A Super Admin can turn it on in the dashboard under Settings → Claude & Agents." />;
  }
  try {
    await assertCanAuthorize(profile.id);
  } catch {
    return <Problem title="Super Admins only" body={`You're signed in as ${profile.email}. Connecting Claude to MJG is limited to active Super Admins.`} />;
  }

  const issuedAt = Date.now();
  const signature = signConsent(request, profile.id, issuedAt);
  const hidden: Record<string, string> = {
    client_id: request.clientId,
    redirect_uri: request.redirectUri,
    code_challenge: request.codeChallenge,
    state: request.state,
    resource: request.resource ?? "",
    issued_at: String(issuedAt),
    signature,
  };

  return (
    <Shell>
      <ShieldCheck className="h-7 w-7 text-[#b88a4a]" aria-hidden />
      <h1 className="mt-4 text-xl font-semibold">Connect {request.clientName} to MJG</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        It will act as <span className="font-medium text-foreground">{profile.email}</span> with your Super Admin access: reading and changing
        website content, email, SMS, calls, people and project work.
      </p>
      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        <li>• Everything it does is logged under your name.</li>
        <li>• Publishing, sending to many people and deleting always show you a preview and need your explicit yes.</li>
        <li>• You can disconnect any time in Settings → Claude &amp; Agents.</li>
      </ul>
      <form method="post" action="/api/oauth/authorize" className="mt-7 grid grid-cols-2 gap-3">
        {Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <button type="submit" name="decision" value="deny" className="h-11 rounded-md border text-sm font-semibold transition-colors hover:bg-muted">
          Cancel
        </button>
        <button type="submit" name="decision" value="allow" className="h-11 rounded-md bg-[#b88a4a] text-sm font-semibold text-white transition-colors hover:bg-[#a67c42]">
          Allow
        </button>
      </form>
    </Shell>
  );
}
