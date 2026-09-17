import type { Metadata } from "next";
import { SiteShell, SITE_CONTENT_BOX } from "@/components/public-site/site-shell";
import { EnergyAuditFlow } from "@/components/energy-audit/energy-audit-flow";
import { getCurrentProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Energy Audit Check-In | A Stewardship Blueprint Assessment",
  description:
    "See where your tank is full, where it's leaking, and what renewal you need next. A 10–15 minute self-assessment of your physical, emotional, mental, and spiritual energy.",
};

export default async function EnergyAuditPage() {
  // Signed-in users get their audit saved to their MJG account; anonymous visitors can still
  // take it and optionally leave an email for their results.
  const profile = await getCurrentProfile().catch(() => null);
  const signedIn = Boolean(profile && profile.id !== "local-preview" && profile.email);

  return (
    <SiteShell>
      <section className={`${SITE_CONTENT_BOX} py-12 md:py-16`}>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
            <span aria-hidden>✦</span> A Stewardship Blueprint Assessment
          </span>
          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            The Energy Audit <em className="not-italic text-[#b88a4a]">Check-In</em>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            See where your tank is full, where it&rsquo;s leaking, and what renewal you need next.
          </p>
        </div>

        <div className="mt-12">
          <EnergyAuditFlow
            signedIn={signedIn}
            firstName={signedIn ? profile!.firstName : null}
            dashboardHref={signedIn ? "/dashboard" : null}
          />
        </div>
      </section>
    </SiteShell>
  );
}
