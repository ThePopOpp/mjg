import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { SiteNav } from "@/components/public-site/site-nav";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { MemberSidebar, MemberSidebarMobile } from "@/components/steward/member-sidebar";
import { EXAMPLE_BLUEPRINT } from "@/lib/steward/blueprint";
import { listActiveEntitlements } from "@/lib/steward/orders";

// The authenticated Steward app shell.
//
// A route group, so it wraps /steward, /steward/blueprint and /steward/more
// WITHOUT wrapping /steward/pricing — pricing is public marketing and keeps the
// full site chrome and footer.
//
// Layout per the owner's mock: the real site navigation across the top, then a
// two-column working area that fills the rest of the viewport. The content
// column owns its own scrolling, which is what lets the conversation pin its
// composer to the bottom while the transcript moves behind it.

export default async function StewardMemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/steward");

  const displayName = profile.firstName.trim() || profile.email.split("@")[0] || "Member";
  const initials =
    `${profile.firstName.trim().charAt(0)}${profile.lastName.trim().charAt(0)}`.toUpperCase() ||
    displayName.slice(0, 2).toUpperCase();
  const nextStep = EXAMPLE_BLUEPRINT["starting-plan"]?.entries?.[0]?.value;

  // Read from entitlements, not written here. This label said "Free · Steward"
  // for everyone because it was a string literal — including for members who
  // actually held the Full Blueprint, which made a correct grant look broken.
  const entitlements = await listActiveEntitlements(profile.id).catch(() => []);
  const held = new Set(entitlements.map((entitlement) => entitlement.benefit));
  const planLabel = held.has("premium")
    ? "Premium · Steward"
    : held.has("full_acquisition")
      ? "Full Blueprint · Steward"
      : "Free · Steward";

  const rail = { displayName, initials, planLabel, nextStep };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <SiteNav siteUrl={publicSiteUrl()} />

      <div className="mx-auto grid min-h-0 w-full max-w-[1160px] flex-1 grid-cols-1 md:grid-cols-[244px_minmax(0,1fr)] md:px-8">
        <MemberSidebar {...rail} />

        <section className="scroll-slim flex min-h-0 flex-col overflow-y-auto">
          <MemberSidebarMobile {...rail} />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </section>
      </div>
    </div>
  );
}
