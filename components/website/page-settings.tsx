"use client";

// Page + SEO settings (spec §23, §24). Lives in the editor's right panel.
//
// Changing the address is the one edit here with consequences beyond this page,
// so it warns first, offers the redirect, and shows what links in.

import * as React from "react";
import { AlertTriangle, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slugProblem } from "@/lib/website/protected";
import { CMS_LIKE_PAGE_TYPES } from "./constants";
import type { PageDependencies } from "@/lib/website/data";
import type { WebsitePage } from "@/lib/website/types";

const INPUT =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const TEXTAREA =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function PageSettings({
  page,
  dependencies,
  onSave,
}: {
  page: WebsitePage;
  dependencies: PageDependencies | null;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const [form, setForm] = React.useState(() => toForm(page));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [createRedirect, setCreateRedirect] = React.useState(true);

  React.useEffect(() => setForm(toForm(page)), [page]);

  const set = (patch: Partial<ReturnType<typeof toForm>>) => setForm((f) => ({ ...f, ...patch }));
  const slugChanged = form.slug !== page.slug;
  const slugIssue = slugChanged ? slugProblem(form.slug) : null;
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(page));

  async function save() {
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, seo_keywords: form.seo_keywords.split(",").map((k) => k.trim()).filter(Boolean), createRedirect });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save those settings.");
    } finally {
      setSaving(false);
    }
  }

  const titleLength = form.seo_title.length;
  const descriptionLength = form.seo_description.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold">Page</h3>
          <Row label="Title"><input className={INPUT} value={form.title} onChange={(e) => set({ title: e.target.value })} /></Row>

          <Row label="Address" hint={page.is_protected ? "This is a protected page — its address is fixed." : `Visitors will reach this page at /${form.slug}`}>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">/</span>
              <input
                className={INPUT}
                value={form.slug}
                disabled={page.is_protected}
                onChange={(e) => set({ slug: e.target.value })}
              />
            </div>
          </Row>

          {slugChanged ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs dark:border-amber-800 dark:bg-amber-950/40">
              <p className="flex items-start gap-2 font-medium text-amber-900 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {slugIssue
                  ? slugIssue
                  : `This page currently lives at /${page.slug}. Anyone who has that address bookmarked or linked will land on a missing page unless you keep a redirect.`}
              </p>
              {!slugIssue ? (
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-amber-900 dark:text-amber-200">
                  <input type="checkbox" checked={createRedirect} onChange={(e) => setCreateRedirect(e.target.checked)} className="h-3.5 w-3.5 accent-[#b88a4a]" />
                  Send /{page.slug} to /{form.slug} automatically
                </label>
              ) : null}
              {dependencies?.incomingLinks.length ? (
                <p className="mt-2 text-amber-900 dark:text-amber-200">
                  {dependencies.incomingLinks.length} other page{dependencies.incomingLinks.length === 1 ? "" : "s"} link here:{" "}
                  {dependencies.incomingLinks.map((l) => l.title).join(", ")}.
                </p>
              ) : null}
            </div>
          ) : null}

          <Row label="Page type">
            <select className={INPUT} value={form.page_type} onChange={(e) => set({ page_type: e.target.value })}>
              {CMS_LIKE_PAGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Row>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={form.navigation_visibility} onChange={(e) => set({ navigation_visibility: e.target.checked })} className="h-4 w-4 accent-[#b88a4a]" />
            Offer this page in the navigation manager
          </label>
          {form.navigation_visibility ? (
            <Row label="Navigation label" hint="Leave blank to use the page title.">
              <input className={INPUT} value={form.navigation_label} onChange={(e) => set({ navigation_label: e.target.value })} />
            </Row>
          ) : null}
        </section>

        <section className="space-y-4 border-t border-border pt-5">
          <h3 className="text-sm font-semibold">Search engines</h3>

          <Row label="SEO title" hint={`${titleLength} characters — around 50–60 reads best in search results.`}>
            <input className={INPUT} value={form.seo_title} onChange={(e) => set({ seo_title: e.target.value })} />
          </Row>

          <Row label="Meta description" hint={`${descriptionLength} characters — around 140–160 reads best in search results.`}>
            <textarea rows={3} className={TEXTAREA} value={form.seo_description} onChange={(e) => set({ seo_description: e.target.value })} />
          </Row>

          <Row label="Keywords" hint="Comma separated. Optional.">
            <input className={INPUT} value={form.seo_keywords} onChange={(e) => set({ seo_keywords: e.target.value })} />
          </Row>

          <Row label="Canonical URL" hint="Only set this when this page duplicates another address.">
            <input className={INPUT} value={form.canonical_url} onChange={(e) => set({ canonical_url: e.target.value })} />
          </Row>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={form.no_index} onChange={(e) => set({ no_index: e.target.checked })} className="h-4 w-4 accent-[#b88a4a]" />
              Ask search engines not to index this page
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={form.no_follow} onChange={(e) => set({ no_follow: e.target.checked })} className="h-4 w-4 accent-[#b88a4a]" />
              Ask search engines not to follow its links
            </label>
          </div>
        </section>

        <section className="space-y-4 border-t border-border pt-5">
          <h3 className="text-sm font-semibold">When shared</h3>
          <Row label="Share title" hint="Leave blank to use the SEO title.">
            <input className={INPUT} value={form.og_title} onChange={(e) => set({ og_title: e.target.value })} />
          </Row>
          <Row label="Share description">
            <textarea rows={2} className={TEXTAREA} value={form.og_description} onChange={(e) => set({ og_description: e.target.value })} />
          </Row>
          <Row label="Share image" hint="1200 × 630 works everywhere.">
            <input className={INPUT} value={form.og_image_url} onChange={(e) => set({ og_image_url: e.target.value })} />
          </Row>
          {form.og_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.og_image_url} alt="" className="max-h-32 rounded-md border border-border object-contain" />
          ) : null}
        </section>

        {dependencies?.incomingLinks.length ? (
          <section className="border-t border-border pt-5">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold"><Link2 className="h-3.5 w-3.5" /> Linked from</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {dependencies.incomingLinks.map((l) => (
                <li key={l.pageId}>{l.title} <span className="text-xs">({l.count} link{l.count === 1 ? "" : "s"})</span></li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <div className="border-t border-border p-3">
        {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
        <Button onClick={save} disabled={saving || !dirty || Boolean(slugIssue)} className="w-full gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {dirty ? "Save page settings" : "Saved"}
        </Button>
      </div>
    </div>
  );
}

function toForm(page: WebsitePage) {
  return {
    title: page.title,
    slug: page.slug,
    page_type: page.page_type as string,
    navigation_visibility: page.navigation_visibility,
    navigation_label: page.navigation_label ?? "",
    seo_title: page.seo_title ?? "",
    seo_description: page.seo_description ?? "",
    seo_keywords: (page.seo_keywords ?? []).join(", "),
    canonical_url: page.canonical_url ?? "",
    og_title: page.og_title ?? "",
    og_description: page.og_description ?? "",
    og_image_url: page.og_image_url ?? "",
    no_index: page.no_index,
    no_follow: page.no_follow,
  };
}
