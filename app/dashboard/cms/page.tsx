import { listCmsPages } from "@/lib/cms/data";
import { getCurrentProfile } from "@/lib/auth/server";
import { CmsWorkspace } from "@/components/cms/cms-workspace";
import type { FrontendPage } from "@/components/cms/frontend-edits";

export const dynamic = "force-dynamic";
export const metadata = { title: "CMS — MJG Dashboard" };

// Same-origin public routes worth reviewing in the Frontend Edits iframe editor.
const PUBLIC_PAGES: FrontendPage[] = [
  { slug: "home", label: "Home", url: "/" },
  { slug: "about", label: "About", url: "/about" },
  { slug: "mission", label: "Mission", url: "/mission" },
  { slug: "created-for-more", label: "Created for More", url: "/created-for-more" },
  { slug: "join-the-movement", label: "Join the Movement", url: "/join-the-movement" },
  { slug: "resources", label: "Resources", url: "/resources" },
  { slug: "contact", label: "Contact", url: "/contact" },
  { slug: "events", label: "Events", url: "/events" },
  { slug: "book", label: "Booking", url: "/book" },
];

export default async function CmsPage() {
  const [pages, profile] = await Promise.all([listCmsPages(), getCurrentProfile()]);
  const displayName = profile ? ([profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email) : undefined;
  // Frontend page list = curated public routes + any PUBLISHED CMS pages (/p/<slug>).
  const cmsPublic: FrontendPage[] = pages
    .filter((p) => p.status === "published")
    .map((p) => ({ slug: `p-${p.slug}`, label: `${p.title} (CMS)`, url: `/p/${p.slug}` }));
  const frontendPages = [...PUBLIC_PAGES, ...cmsPublic];

  return <CmsWorkspace initialPages={pages} frontendPages={frontendPages} displayName={displayName} />;
}
