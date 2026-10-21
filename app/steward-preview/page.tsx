import { SiteShell } from "@/components/public-site/site-shell";
import { StewardHomepageSections } from "@/components/public-site/steward-homepage-sections";
import { StewardHero } from "@/components/steward-animation/steward-hero";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Michael J. Gauthier — Steward, the Blueprint, and the work",
  description:
    "Steward is a personal guide for designing and living a life that matters — your faith, relationships, health, resources and legacy, in one place.",
  // A review URL, not a page anyone should find in search.
  robots: { index: false, follow: false },
};

// The FIRST homepage candidate: an ambient hero — the gold particle field and
// the orb behind a headline, with no product demo in it.
//
// Kept because it is a real third option and costs nothing to keep, but the two
// candidates actually under review are /steward-homepage-autoplay and
// /steward-homepage-scroll, which put the Steward demo itself in the hero.

export default function StewardPreviewPage() {
  return (
    <SiteShell>
      <StewardHero />
      <StewardHomepageSections />
    </SiteShell>
  );
}
