import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { DecideButtons, StatusPill } from "@/components/churches/church-ui";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { getChurchAdminApplicationByToken } from "@/lib/churches/applications";
import { TOKEN_STATE_MESSAGES } from "@/lib/churches/rules";

export const dynamic = "force-dynamic";

// Where the emailed/texted approval links land. Requires a signed-in Super Admin; the token is
// single-use and only consumed when a decision is made, never by opening the page.
export default async function ApproveChurchAdminPage({ searchParams }: { searchParams: Promise<{ token?: string; decision?: string }> }) {
  const { token = "", decision } = await searchParams;
  const here = `/dashboard/church-admins/approve?${new URLSearchParams({ token, ...(decision ? { decision } : {}) }).toString()}`;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(here)}`);
  if (profile.role !== ROLES.SUPER_ADMIN) redirect("/access-restricted");

  const { application: a, state } = await getChurchAdminApplicationByToken(token);
  const initial = decision === "approve" || decision === "reject" ? decision : null;
  const place = a ? [a.churchCity, a.churchState].filter(Boolean).join(", ") : "";

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Church admin application" title={a ? `${a.name} · ${a.churchName}` : "Approval link"} />
      {!a || state !== "valid" ? (
        <Card>
          <CardContent className="space-y-2 pt-5 text-sm">
            <p>{state === "valid" ? TOKEN_STATE_MESSAGES.missing : TOKEN_STATE_MESSAGES[state]}</p>
            {a ? <p className="text-muted-foreground">Status: <StatusPill status={a.status} /></p> : null}
            <a href="/dashboard/churches" className="text-[#b88a4a] hover:underline">Open Churches → Applications</a>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="grid gap-5 pt-5 md:grid-cols-[1fr_300px]">
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">{a.name}</span> <span className="text-muted-foreground">{a.email}</span></p>
              <p>
                {a.churchName}{place ? ` · ${place}` : ""}
                {a.isNewChurch ? <span className="ml-1 text-xs text-[#8a6532] dark:text-[#e2ca9a]">(new church — created on approval)</span> : null}
              </p>
              {a.churchWebsite ? <p className="text-muted-foreground">{a.churchWebsite}</p> : null}
              {a.roleTitle ? <p className="text-muted-foreground">Role: {a.roleTitle}</p> : null}
              {a.message ? <p className="border-l-2 border-[#b88a4a] pl-3 text-muted-foreground">{a.message}</p> : null}
              <p className="pt-2 text-xs text-muted-foreground">Approving makes them an admin of this church; they can then approve facilitators for it. This link works once.</p>
            </div>
            <DecideButtons url="/api/churches/admin-applications/decide" body={{ token, id: a.id }} initial={initial} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
