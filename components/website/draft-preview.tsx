// Shared rendering for both draft-preview entry points (the editor iframe and a
// signed share link). It puts the draft through exactly the same renderer and
// chrome the live site uses, so what Mike sees is what visitors will get.

import { SiteShell } from "@/components/public-site/site-shell";
import { PageRenderer } from "@/components/website/page-renderer";
import { getPublicGlobals, getPublicNavigation } from "@/lib/website/public";
import type { NavItem } from "@/lib/public-site/nav-items";
import type { WebsitePage } from "@/lib/website/types";

export async function DraftPreview({ page, banner = true }: { page: WebsitePage; banner?: boolean }) {
  const [mainNav, footerNav, globals] = await Promise.all([
    getPublicNavigation("main"),
    getPublicNavigation("footer"),
    getPublicGlobals(),
  ]);

  const navItems: NavItem[] = mainNav
    .filter((n) => !n.parent_id)
    .map((root) => {
      const children = mainNav.filter((c) => c.parent_id === root.id);
      return {
        label: root.label,
        href: root.url || undefined,
        children: children.length ? children.map((c) => ({ label: c.label, href: c.url })) : undefined,
      };
    });

  return (
    <>
      {banner ? (
        <div className="bg-[#14131a] px-6 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#d6ab6d]">
          Draft preview — not published
        </div>
      ) : null}
      <SiteShell
        navItems={navItems}
        footerLinks={footerNav.filter((n) => n.url).map((n) => ({ label: n.label, href: n.url }))}
        footerNote={String((globals["site.footer_note"] ?? {}).text ?? "") || undefined}
      >
        {page.draft_content.blocks.length ? (
          <PageRenderer content={page.draft_content} />
        ) : (
          <div className="mx-auto max-w-[1160px] px-8 py-24 text-center text-muted-foreground">
            <p className="font-serif text-2xl">This page has no sections yet.</p>
            <p className="mt-2">Add a section from the left panel to see it here.</p>
          </div>
        )}
      </SiteShell>
    </>
  );
}
