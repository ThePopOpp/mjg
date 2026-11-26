import { SectionHeader } from "@/components/dashboard/section-header";
import { RetreatAdmin } from "@/components/annual-retreat/retreat-admin";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { FOLLOWUP_STEPS, allTrackedLinks, guideUrl, siteUrl, stewardUrl } from "@/lib/annual-retreat/config";
import { EMAILS, renderEmail, type EmailKey } from "@/lib/annual-retreat/emails";
import { followupProblems, getRetreatSettings, retreatIsPublic } from "@/lib/annual-retreat/server";
import { getRetreatReport } from "@/lib/annual-retreat/report";

export const dynamic = "force-dynamic";
export const metadata = { title: "Annual Retreat — MJG Dashboard" };

// The Annual Retreat Guide: report, email previews and test sends, follow-up
// switch and tracked links. Super admins only.
export default async function AnnualRetreatAdminPage() {
  const profile = await requirePagePermission(PERMISSIONS.MANAGE_CMS, "/dashboard/annual-retreat");
  const [settings, report, isPublic] = await Promise.all([getRetreatSettings(), getRetreatReport(90), retreatIsPublic()]);
  const base = siteUrl();
  const keys: EmailKey[] = ["delivery", ...FOLLOWUP_STEPS.map((s) => s.key)];
  const previews = keys.map((key) => {
    const step = FOLLOWUP_STEPS.find((s) => s.key === key);
    const r = renderEmail(key, {
      firstName: profile.firstName || null,
      guideUrl: guideUrl("email", base),
      stewardUrl: stewardUrl(base),
      siteUrl: base,
      unsubscribe: key === "delivery" ? null : { url: `${base}/email/unsubscribe?t=preview`, mailingAddress: settings.mailing_address?.trim() || "[Postal address not set yet]" },
    });
    return { key, timing: step ? `Day ${step.day}, only with the optional permission` : "Immediately, to everyone who requests the guide", subject: r.subject, preheader: EMAILS[key].preheader, html: r.html };
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Annual Retreat Guide"
        description="The free retreat guide funnel: landing page, download, delivery email and the optional follow-up series."
      />
      <RetreatAdmin
        report={report}
        settings={{ ...settings, problems: followupProblems(settings) }}
        isPublic={isPublic}
        previews={previews}
        links={allTrackedLinks(base)}
        landingUrl={`${base}/annual-retreat`}
        guideUrl={guideUrl(undefined, base)}
      />
    </div>
  );
}
