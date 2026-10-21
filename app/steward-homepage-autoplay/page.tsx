import { SiteShell } from "@/components/public-site/site-shell";
import { StewardHomepageSections } from "@/components/public-site/steward-homepage-sections";
import { StewardHeroAutoplay } from "@/components/steward-animation/steward-hero-autoplay";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Michael J. Gauthier — Steward, the Blueprint, and the work",
  description:
    "Steward is a personal guide for designing and living a life that matters — your faith, relationships, health, resources and legacy, in one place.",
  // A review URL, not a page anyone should find in search.
  robots: { index: false, follow: false },
};

// OPTION ONE — the demo plays itself.
//
// A homepage candidate at its own address, for review before anything replaces
// the live homepage. Identical to option two in every respect except the hero:
// here the Steward animation runs on a loop, so someone who lands and does
// nothing still sees the whole thing. Compare with /steward-homepage-scroll,
// which scrubs the same animation from the scrollbar.
//
// It uses SiteShell, so the navigation, footer and the "Need help? Ask Steward"
// button are the real ones rather than approximations — what is being judged is
// the hero, and everything around it should be exactly what would ship.

export default function StewardHomepageAutoplayPage() {
  return (
    <SiteShell>
      <StewardHeroAutoplay />
      <StewardHomepageSections />
    </SiteShell>
  );
}
