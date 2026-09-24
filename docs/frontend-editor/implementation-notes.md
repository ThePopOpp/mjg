# Frontend Editor — implementation notes

Companion to [`frontend-editor.md`](./frontend-editor.md), which remains the specification.
This document records **what was built, where it lives, and where the implementation
deliberately differs from the spec** to fit the existing MJG codebase.

Shipped: 2026-09-24. Migration `202609240093_website_frontend_editor.sql` (applied).

---

## 1. Where it lives

| Area | Path |
| --- | --- |
| Dashboard entry | `/dashboard/cms/editor` — sidebar **CMS → Editor** |
| Page editor | `/dashboard/cms/editor/pages/[id]` |
| Draft preview (editor iframe) | `/website-preview/draft/[id]` |
| Draft preview (shareable link) | `/website-preview/[token]` |
| Public rendering | `app/[...slug]/page.tsx` |
| Server library | `lib/website/*` |
| React blocks + dashboard UI | `components/website/*` |
| API | `app/api/admin/website/*` |
| Steward tools | `lib/website/steward-tools.ts` |

The module sits **under** `/dashboard/cms`, so `app/dashboard/cms/layout.tsx` already guards
it: Super Admin only. That is one of four layers — nav permission (`MANAGE_CMS`), the page
guard, `requireSuperAdmin` on every API route, and `is_super_admin()` RLS on all eight tables.

---

## 2. The safety model, in one page

Nothing about this feature gives Steward — or the editor UI — a way to write code.

1. **Content is data, not markup.** A page is an ordered list of blocks; each block is
   `{ id, type, props }`. `props` is validated against a field schema in
   `lib/website/registry.ts` and unknown keys are dropped. There is no HTML block, no class
   name field and no style field.
2. **Only registered components render.** `validateContent()` rejects unregistered types and
   `BlockRenderer` renders nothing for a type it has no component for.
3. **Protected routes are unreachable.** `lib/website/protected.ts` holds the prefix list;
   `assertUsableSlug()` refuses them on create and rename, and the public catch-all refuses
   to serve them even if a row somehow existed.
4. **Writes land in the draft.** `published_content` is only ever replaced by `publishPage()`,
   which validates, writes a version row first, then swaps the snapshot and revalidates.
5. **Every write is audited** in `website_audit_logs` with `actor_type` of `user` or `steward`.
6. **Deletion is soft by default.** Permanent deletion runs a dependency check and requires
   the page title typed back. Steward has **no** delete tool at all.

### Steward specifically

`WEBSITE_TOOLS` in `lib/website/steward-tools.ts` is the complete surface. Reads auto-execute;
every write is confirmation-gated through the existing `AgentTool.requiresConfirmation`
mechanism. Each write goes through `writeThroughChangeSet()`, which records a change set,
applies it to the draft, and publishes **only** if direct publish is switched on *and* the
page is neither protected nor legal *and* the change is not high risk (`stewardMayPublish()`).

Direct publish defaults to **off** (`website_globals` → `editor.settings`).

There is no SQL, file, shell or repository access anywhere in that tool layer. When Mike asks
for something the registry cannot express, `website_request_component` writes a developer
specification into `dev_requests` instead of improvising — this is spec §54.

---

## 3. Where the implementation differs from the spec

These are deliberate adaptations, not omissions. Behaviour and the safety model are preserved.

| Spec says | We did | Why |
| --- | --- | --- |
| `schema: ZodSchema` per component | A hand-rolled field-descriptor engine (`lib/website/schema.ts`) | The project has no zod and validates by hand everywhere else. The descriptors do triple duty: validation, Steward's tool schema, **and** the property-panel UI — so registering a component gives you its editor for free. |
| Separate `website_page_drafts` table | `draft_content` + `published_content` on `website_pages` | Spec §46 says pick one and be consistent. This matches the existing `cms_pages.draft_content` pattern and avoids a join on every read. |
| `website_media` table | Reuses the existing `media_assets` / Media Studio | Spec §20 says "create **or connect to**". A second library would mean two places to upload and two places for alt text to drift. |
| `website_component_settings`, `website_templates`, `website_links`, `website_seo_audits`, `website_scheduled_actions` | Not created | Settings live in `website_globals` (`editor.settings`); templates are code (`lib/website/templates.ts`) because they emit validated blocks; link and SEO audits are computed on demand from page content rather than stored. Nothing is lost and there is no index to keep in sync. |
| Redirects as 301/302 | Next emits 308/307 | The app-router `permanentRedirect`/`redirect` helpers are method-preserving equivalents. `status_code` still records the intent, and the UI says "Permanent"/"Temporary". |
| Tiptap or Lexical rich text | A small Markdown subset (`**bold**`, `*italic*`, `[link](/page)`, `- lists`) rendered through `lib/cms/md.ts` | `mdToHtml()` escapes first and then applies the subset, so authored content **cannot** produce executable markup. Spec §61's requirement is "do not store raw uncontrolled HTML" — this satisfies it with no new dependency and no sanitiser to get wrong. |
| Scheduling (§43) | Columns exist (`scheduled_at`, `unpublish_at`), no cron yet | Spec calls it optional. The schema is ready; wiring it needs a scheduled task alongside the existing `EXPERIENCE_CRON_SECRET` job. **This is the main piece of the spec not yet functional.** |

---

## 4. Two things to know before you touch it

### The public route is a root catch-all

`app/[...slug]/page.tsx` is the **last** route Next tries. Every code-owned route matches
first and is untouched — verified: `/`, `/about`, `/mission`, `/resources`, `/book-waitlist`,
`/privacy` and `/terms` all still render, and an unmatched address still 404s.

If you add a new code-owned public route, add its prefix to `PROTECTED_ROUTES` so a CMS page
can never shadow it.

### Published pages are read uncached, on purpose

`getPublishedPageBySlug()` does **not** use `unstable_cache`. It did during development, and
testing showed the cached entry survived both `revalidateTag` and a dev-server restart — an
unpublished or archived page kept serving for the full 300-second window. Withdrawn content
staying live is the one failure mode this module must not have, so caching moved to the route
level where `revalidatePath()` reliably clears it. The read is a single indexed lookup.

If you reintroduce a data cache here, prove invalidation works by unpublishing a page and
immediately requesting it.

---

## 5. Navigation: a real limitation

The Navigation manager writes `website_navigation_items`, and CMS-owned pages render their
header and footer from it. **The existing marketing pages do not** — they still use the
code-owned nav in `lib/public-site/nav-items.ts`.

The migration seeds the table to mirror that file exactly, so the two menus match today. But
if Mike adds an item in the dashboard, it appears on CMS pages only until the rest of the
site is moved over. `SiteShell` and `SiteNav` now accept optional `navItems`, so that
migration is a per-page prop change rather than a rewrite.

Worth doing before handing the navigation manager to Mike as "the" site navigation.

---

## 6. Adding a new approved component

Three steps, no editor changes:

1. Add a `ComponentDefinition` to `DEFINITIONS` in `lib/website/registry.ts` — `type`,
   `label`, `description`, `category`, and the `fields` list (append `...sectionFields()` for
   the shared background/spacing/width/align settings).
2. Add the React component to `components/website/blocks/index.tsx` (or `interactive.tsx` if
   it needs browser behaviour). It receives `{ props }` and should wrap itself in `<Section>`.
3. Map `type → component` in `components/website/page-renderer.tsx`.

It then appears in the Add Section picker, gets a generated property panel, and becomes
available to Steward — automatically.

---

## 7. What was verified

- `npx tsc --noEmit` clean; `npm run build` clean.
- Migration applied (`npm run db:migrate`).
- End-to-end public rendering: a seeded published page rendered hero, rich text (including
  Markdown bold and an internal link), feature grid, FAQ and CTA, with SEO title and meta
  description in `<head>`, DB-driven navigation in the header, and a hidden block correctly
  **not** rendered.
- Deleting the page returned it to 404 immediately (this is what caught the cache bug above).
- A seeded redirect sent `/old-smoke-path` → the page.
- Guards: `/dashboard/cms/editor` redirects when signed out, `/api/admin/website/pages`
  returns 401, an invalid preview token 404s.

**Not exercised in a browser:** the authenticated dashboard UI — the workspace, the
three-panel editor, autosave, the Steward panel and the publish dialog. They typecheck and
build, but they have not been clicked through with a real Super Admin session. That is the
first thing to do on this feature.
