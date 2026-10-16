import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { SiteNav } from "@/components/public-site/site-nav";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { MemberSidebar, MemberSidebarMobile } from "@/components/steward/member-sidebar";
import { EXAMPLE_BLUEPRINT } from "@/lib/steward/blueprint";

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
  const rail = { displayName, initials, planLabel: "Free · Steward", nextStep };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <SiteNav siteUrl={publicSiteUrl()} />

      <div className="mx-auto grid min-h-0 w-full max-w-[1280px] flex-1 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
        <MemberSidebar {...rail} />

        <section className="flex min-h-0 flex-col overflow-y-auto">
          <MemberSidebarMobile {...rail} />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </section>
      </div>
    </div>
  );
}
