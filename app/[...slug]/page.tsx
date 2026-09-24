// Public rendering for Frontend-Editor-owned pages (spec §28, Option B hybrid).
//
// This is the LAST route Next tries: every code-owned route in app/ — the
// dashboard, the API, auth, and the existing marketing pages — matches first and
// is untouched. Only an address nothing else claims reaches here, and it renders
// only if a PUBLISHED website_pages row owns that slug. Anything else either
// follows an active redirect or 404s exactly as before.

import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/public-site/site-shell";
import { PageRenderer } from "@/components/website/page-renderer";
import { isProtectedPath } from "@/lib/website/protected";
import { buildPageMetadata, getPublicGlobals, getPublicNavigation, getPublishedPageBySlug } from "@/lib/website/public";
import { findRedirect } from "@/lib/website/site";
import type { NavItem } from "@/lib/public-site/nav-items";

type Params = { params: Promise<{ slug?: string[] }> };

function slugFrom(parts: string[] | undefined): string {
  return (parts ?? []).map((p) => decodeURIComponent(p)).join("/").toLowerCase();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const path = slugFrom(slug);
  if (!path || isProtectedPath(path)) return {};
  const page = await getPublishedPageBySlug(path);
  if (!page) return {};
  const globals = await getPublicGlobals();
  return buildPageMetadata(page, globals["seo.defaults"] ?? {});
}

/** Navigation rows → the shape SiteNav renders, nesting one level of children. */
function toNavItems(
  rows: { id: string; label: string; url: string; parent_id: string | null; open_in_new_tab: boolean }[],
): NavItem[] {
  const roots = rows.filter((r) => !r.parent_id);
  return roots.map((root) => {
    const children = rows.filter((r) => r.parent_id === root.id);
    return {
      label: root.label,
      href: root.url || undefined,
      children: children.length ? children.map((c) => ({ label: c.label, href: c.url })) : undefined,
    };
  });
}

export default async function WebsitePage({ params }: Params) {
  const { slug } = await params;
  const path = slugFrom(slug);
  if (!path || isProtectedPath(path)) notFound();

  const page = await getPublishedPageBySlug(path);
  if (!page) {
    // A page that has moved keeps its old address working (spec §24). Next's
    // app-router helpers emit 308 (permanent) and 307 (temporary) — the
    // method-preserving equivalents of 301/302, which is what the stored
    // status_code records as intent.
    const rule = await findRedirect(`/${path}`);
    if (rule) {
      if (rule.status_code === 302) redirect(rule.destination_path);
      permanentRedirect(rule.destination_path);
    }
    notFound();
  }

  const [mainNav, footerNav, globals] = await Promise.all([
    getPublicNavigation("main"),
    getPublicNavigation("footer"),
    getPublicGlobals(),
  ]);

  const announcement = (globals["site.announcement"] ?? {}) as { enabled?: boolean; text?: string; href?: string };
  const footerNote = String((globals["site.footer_note"] ?? {}).text ?? "");

  return (
    <SiteShell
      navItems={toNavItems(mainNav)}
      footerLinks={footerNav.filter((n) => n.url).map((n) => ({ label: n.label, href: n.url }))}
      footerNote={footerNote || undefined}
    >
      {announcement.enabled && announcement.text ? (
        <div className="bg-[#b88a4a] px-6 py-2.5 text-center text-sm font-medium text-white">
          {announcement.href ? (
            <a href={announcement.href} className="underline underline-offset-2">
              {announcement.text}
            </a>
          ) : (
            announcement.text
          )}
        </div>
      ) : null}
      <PageRenderer content={page.content} />
    </SiteShell>
  );
}
