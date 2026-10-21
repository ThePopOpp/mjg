import { SiteShell } from "@/components/public-site/site-shell";
import { StewardHomepageSections } from "@/components/public-site/steward-homepage-sections";
import { StewardHeroScroll } from "@/components/steward-animation/steward-hero-scroll";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Michael J. Gauthier — Steward, the Blueprint, and the work",
  description:
    "Steward is a personal guide for designing and living a life that matters — your faith, relationships, health, resources and legacy, in one place.",
  // A review URL, not a page anyone should find in search.
  robots: { index: false, follow: false },
};

// OPTION TWO — the scrollbar is the playhead.
//
// The same homepage as /steward-homepage-autoplay, with the same body, and the
// same animation in the hero. The difference is who drives it: scrolling down
// plays the demo, scrolling up rewinds it, and reaching the end releases the
// pin so the rest of the page scrolls normally.
//
// The two pages exist side by side so the choice can be made by looking rather
// than by description.

export default function StewardHomepageScrollPage() {
  return (
    <SiteShell>
      <StewardHeroScroll />
      <StewardHomepageSections />
    </SiteShell>
  );
}
