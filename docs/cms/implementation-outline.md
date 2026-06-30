# MJG WebApp CMS — Implementation Outline

Source of truth: `docs/cms/cms.md`. This outline grounds that spec in the current
codebase and proposes a safe, phased build. **No code has been written yet —
this is the plan for approval.**

---

## 1. Current project structure findings

- **Framework**: Next.js 15 App Router, React server components, Supabase
  (Postgres + Auth + Storage), Tailwind + shadcn UI. Deployed on Coolify (Docker
  build pack) at `https://my.michaeljgauthier.com`.
- **Dashboard** lives under `app/dashboard/*`, wrapped by `app/dashboard/layout.tsx`
  → `components/layout/dashboard-shell.tsx`.
- **Public/front-end** is served two ways:
  1. **Hardcoded marketing pages** — `app/route.ts` (`/`), `app/mission/route.ts`,
     `app/post/route.ts`, etc. are **route handlers** that `readFileSync` static
     HTML from `main/*.html` (via `lib/public-site/static-pages.ts`
     `getStaticPageHtml`). These are NOT React pages.
  2. **DB-backed pages** — blog/resources (`app/resources/[slug]/route.ts`,
     `app/post/route.ts`) fetch from Supabase (`lib/content/blog.ts`) and render
     **branded HTML strings** using shared chrome from
     `lib/public-site/static-pages.ts`: `renderSiteHeader`, `renderNavStyles`,
     `renderFonts`, `renderFaviconLinks`, `renderThemeScript`, `renderNavScript`.
  - **Implication**: there is already a proven "fetch from DB → render branded
    HTML route handler" pattern. **The CMS should follow pattern (2).**
- **Block-builder precedent exists** 3×: email template editor
  (`components/email-templates/email-template-form.tsx`, schema-in-JSON), social
  post builder (`components/social-media/social-post-builder.tsx`), and the PM
  Gantt. All store a block schema as JSON and render to HTML/preview. The CMS
  block editor should reuse these patterns and the branded form components
  (`FieldSelect`, `DatePicker`, `Input`, `Textarea`, `Button`, `Switch`).
- **Uploads**: `POST /api/admin/uploads` (FormData, `x-mjg-action-token` header)
  → `mjg-media` bucket → returns a public URL. `media_assets` table + Media
  Studio already manage assets.
- **Migrations are applied MANUALLY** (no tracking table). Verifier at
  `supabase/verify_migrations.sql`. Current through `202606250025`. **Any new CMS
  migration must be flagged loudly for the user to run.**

## 2. Current dashboard navigation structure

- `components/layout/dashboard-nav.ts` exports `dashboardNav: NavEntry[]` — a typed
  list of `{ kind:"item", href, label, icon, permission? }` and
  `{ kind:"group", label, icon, items[] }` (e.g. the "Communications" group).
- `dashboard-shell.tsx` renders it, **permission-filtering** each entry via
  `can(profile.role, permission)` and dropping empty groups. The sidebar is a
  scrollable accordion with active-route highlighting.
- **To add CMS**: append `{ kind:"item", href:"/dashboard/cms", label:"CMS",
  icon:<…>, permission: PERMISSIONS.MANAGE_CMS }`. It will only show when
  `can(role, MANAGE_CMS)` is true (see §3 for why that resolves to super-admin-only).

## 3. Current auth and role system

- **Roles**: `lib/rbac/roles.ts` (`ROLES`, `AppRole`, `ROLE_LABELS`,
  `normalizeAppRole`, `canAccessDashboard`).
- **Permissions**: `lib/rbac/permissions.ts` — `PERMISSIONS` map +
  `ROLE_PERMISSIONS` + `can(role, permission)`. `can()` returns **true for
  super_admin on ANY permission** (shortcut), and otherwise checks the role's
  explicit list. **There is no super-admin-EXCLUSIVE permission today**, so a
  generic permission would also let `admin` in.
- **API auth helpers** (`lib/user-management/auth.ts`): `requireUserManager`
  (admin+), `requireParticipantManager`, `requireContentManager`,
  `requireAdminManager`. They resolve the actor from the Supabase session OR a
  signed action token, and return `{...profile, role}`. **No `requireSuperAdmin`
  yet.**
- **RLS helpers in Postgres**: `public.current_app_role()`,
  `public.can_access_dashboard()`, and **`public.is_super_admin()`** (already
  exists — perfect for CMS policies).
- **Dashboard layout** guards only on "active dashboard profile". Per-feature
  super-admin gating must be added at the CMS page/route level.

### Required permission-system additions for CMS (super-admin-only, 4 layers)

1. **New permission** `PERMISSIONS.MANAGE_CMS`, added to `PERMISSIONS` but **NOT
   added to any non-super-admin role's list** in `ROLE_PERMISSIONS`. Result:
   `can(super_admin, MANAGE_CMS) === true` (shortcut), `can(admin, MANAGE_CMS) ===
   false`. Used to gate the nav item. (Define `MANAGE_CMS` in `ROLE_PERMISSIONS`
   only under `SUPER_ADMIN`'s entry for clarity, though the shortcut already
   covers it.)
2. **New auth helper** `requireSuperAdmin(request, actionToken)` — same resolution
   as the others but throws unless `role === super_admin`. Used by every CMS API
   route / server action.
3. **Page-level guard**: `app/dashboard/cms/layout.tsx` calls `getCurrentProfile()`
   and `redirect("/access-restricted")` unless `role === super_admin`. Stops URL
   guessing.
4. **RLS**: every `cms_*` table → policies `using/with check
   (public.is_super_admin())`. Public published rendering uses the **service-role
   client** in the public route handler (bypasses RLS) and only ever reads
   *published* snapshots, so no anon RLS grant is needed and drafts can never leak.

## 4. How frontend pages are currently built

- Marketing pages: static HTML files in `main/` served by route handlers via
  `readFileSync` — **hardcoded**, edited by hand.
- Blog/resource pages: dynamic, DB-backed, rendered as branded HTML strings in
  route handlers using `lib/public-site/static-pages.ts` chrome helpers.
- There is **no generic page-content table** yet — that's what the CMS adds.

### Safe migration path for hardcoded pages

- **Phase 1 does NOT touch `main/*.html` or any existing route.** CMS-managed
  pages render at a **namespaced slug** first (e.g. `/p/[slug]`) so there is zero
  collision risk with existing routes.
- **Adoption later, per page, via fallback** (opt-in, reversible): to let the CMS
  own an existing path (e.g. `/mission`), change that one route handler to
  "render the published CMS page for this slug **if one exists**, else fall back
  to the current static HTML". Nothing breaks; flipping back is trivial.
- A **"Raw HTML" block** type provides an escape hatch: paste an existing page's
  markup into one block to adopt it 1:1, then refactor into structured blocks
  over time.
- Only promote a root catch-all (`app/[...slug]/route.ts`) **after** the
  namespaced flow is proven; it must `notFound()` when no published CMS page
  matches, and is matched by Next only after explicit/dynamic routes.

## 5. Recommended CMS database/schema changes

All tables RLS-locked to `is_super_admin()`. Reuse existing infra where possible.

- **`cms_pages`** — `id, slug (unique), title, description, page_type
  (page/landing/experience/resource/...), status (draft|published|archived),
  assigned_roles text[], published_version_id uuid, created_by, updated_by,
  published_at, created_at, updated_at`.
- **`cms_page_versions`** — `id, page_id, version_number, content_snapshot jsonb
  (full block tree at publish/snapshot time), status, notes, created_by,
  created_at`. **Immutable history.**
- **`cms_blocks`** — the **working draft** tree: `id, page_id, parent_block_id,
  block_type, sort_order, content jsonb, settings jsonb, visibility_rules jsonb,
  is_hidden, created_at, updated_at`.
- **Media** — **reuse `media_assets` + `mjg-media` bucket + `/api/admin/uploads`.**
  No `cms_media` table; reference `media_assets.id`/URL from block content.
- **`cms_forms`, `cms_form_fields`** (Phase 4) — form definitions. **Submissions
  reuse/extend the existing `form_submissions` table** (already wired to users),
  adding a nullable `cms_form_id` rather than a new table.
- **`cms_ai_drafts`** (Phase 5) — Steward output: `id, source_type, source_file_url,
  prompt, generated_structure jsonb, generated_blocks jsonb, status (always starts
  'draft'), created_by, reviewed_by, created_at, reviewed_at`.
- **Audit** — **reuse `user_activity_logs`** via the existing `logUserActivity()`
  (`entity_type='cms_page'`, action `cms_published` / `cms_reverted` / etc.)
  instead of a separate `cms_audit_logs` table.

### Draft vs published separation (important)

- `cms_blocks` = always-editable **draft/working copy**.
- **Publish** = snapshot `cms_blocks` → new `cms_page_versions` row (status
  published) + set `cms_pages.published_version_id` + `published_at` + status.
- **Public renderer reads `published_version_id`'s snapshot only** — never the
  live draft. So drafts are structurally invisible to the public.
- **Revert** = create a NEW version from an old snapshot and load it into
  `cms_blocks` (history is never deleted).

## 6. Recommended routes and components

**Dashboard (Super-Admin-only):**
- `app/dashboard/cms/layout.tsx` — super-admin guard.
- `app/dashboard/cms/page.tsx` — pages list/table + "New page" (Phase 1).
- `app/dashboard/cms/pages/[pageId]/page.tsx` — the editor (Phase 2).
- `components/cms/cms-pages-list.tsx`, `cms-editor.tsx`, `cms-block-tree.tsx`,
  `cms-block-inspector.tsx`, `cms-preview-frame.tsx`, `cms-ai-panel.tsx` (Phase 5).

**API / server (all `requireSuperAdmin`):**
- `app/api/admin/cms/pages/route.ts` (GET list, POST create) + `[id]/route.ts`
  (GET, PATCH, DELETE/archive).
- `app/api/admin/cms/pages/[id]/blocks/route.ts` (save draft block tree).
- `app/api/admin/cms/pages/[id]/publish/route.ts`, `.../revert/route.ts`.
- `app/api/admin/cms/pages/[id]/versions/route.ts` (history).

**Public rendering (service-role; published only):**
- Phase-1 namespaced: `app/p/[slug]/route.ts` — loads published page + snapshot,
  renders branded HTML via `lib/cms/render.ts` reusing the `static-pages.ts` chrome.
- **Preview**: `app/dashboard/cms/preview/[pageId]/route.ts` — Super-Admin-gated,
  renders the **draft** `cms_blocks` with the same renderer (for the iframe).

**Lib:**
- `lib/cms/types.ts` (Block, BlockType, Page, Version), `lib/cms/data.ts` (CRUD +
  publish/revert), `lib/cms/render.ts` (block-tree → branded HTML, fully escaped),
  `lib/cms/blocks.ts` (block registry + defaults + presets).

## 7. Recommended editor UI/UX (matches the spec's layout)

- **Top bar**: page selector (searchable), status badge, Save Draft, Preview,
  Publish (Publish disabled unless super-admin — it always is here).
- **Left panel**: block tree (Section › Row › Column › leaf), Add-block, drag-reorder
  (HTML5 DnD like the PM/social builders), hide/duplicate/delete.
- **Center**: **live preview iframe** (desktop/tablet/mobile width toggles).
- **Right panel**: selected-block inspector — content fields + design controls,
  **preset-first** (brand colors, typography/spacing/button/card presets from the
  Brand Kit `lib/brand/assets.ts`), with "custom" only where needed.
- **AI panel** (Phase 5): Steward prompt → generate draft blocks for review.
- Dashboard-native styling, branded shadcn fields, minimal scrollbars (reuse the
  patterns already established this cycle).

## 8. Live preview approach

- **Recommended: iframe → draft preview route**, because the public renderer is
  HTML-string based (not React components). The iframe (`app/dashboard/cms/
  preview/[pageId]`) renders the draft with the **real renderer**, giving true
  WYSIWYG fidelity and matching the published output exactly.
- **Update model (phased)**: start with "Save draft → reload iframe" (debounced);
  later upgrade to `postMessage`/live patch for instant updates without a full
  reload.
- Preview route is Super-Admin-gated; it renders draft content that the public
  renderer never serves, so unpublished content stays hidden.

## 9. Draft → preview → published → archived + versioning workflow

- **Draft**: editing `cms_blocks`; `cms_pages.status='draft'` (or 'published' with
  newer unpublished edits in the draft copy). Not publicly visible.
- **Preview**: Super-Admin-only render of the draft via the preview route.
- **Publish** (super-admin only): snapshot → `cms_page_versions` + set
  `published_version_id`, `published_at`, `status='published'`. Public renderer
  now serves that snapshot.
- **Archived**: `status='archived'` → public route 404s/falls back; history kept.
- **Versioning**: every publish creates a version; "Restore" loads an old
  snapshot into the draft and (on next publish) creates a new version. **History
  is append-only.** "View change history" lists versions with diffs (basic
  metadata first; visual diff later).
- All transitions logged via `logUserActivity`.

## 10. Preparing for the future Experience Builder

- `cms_pages.page_type` includes `'experience'`; Experiences **reuse the same**
  block system, version/publish workflow, role visibility, media, forms, and AI
  drafts.
- Reserve forward-compatible fields now (cheap): `assigned_roles` (page-level role
  visibility) and a future `experiences`/`experience_assignments` table for
  per-user assignment + progress — **not built in Phase 1**, but the block/form/
  role/ai schemas are shaped so Experiences slot in without rework.
- Block `visibility_rules jsonb` supports role-based (and later user-based) block
  visibility, mirroring the PM visibility model already shipped.

## 11. Integration with the AI Agent, Steward

- Steward (`lib/ai-agent/*`) already has read + confirmation-gated action tools and
  a skills layer. Add a **CMS skill** + **CMS tools** in a later phase:
  `list_cms_pages`, `get_cms_page` (reads); `create_cms_page_draft`,
  `suggest_cms_blocks`, `read_experience_pdf` (actions) — **all produce DRAFTS only**.
- **Hard safety rule (from spec)**: Steward gets **no publish tool**. Everything it
  creates lands in `cms_ai_drafts` / a `status='draft'` page. Publishing is a
  manual Super-Admin UI action behind `requireSuperAdmin`. This makes
  "AI changes are always drafts" a structural guarantee, not a prompt convention.
- An in-CMS "Ask Steward" panel can reuse the now-reusable `AgentChat`
  (`components/ai-agent/agent-chat.tsx`) scoped with CMS suggestions.
- PDF→Experience (Phase 5) uses uploads + a parse step feeding `cms_ai_drafts`.

## 12. Risks, assumptions, dependencies

**Risks**
- **Route shadowing**: a root catch-all could intercept existing routes →
  mitigate by namespacing (`/p/[slug]`) first; only add a root catch-all later
  with `notFound()` fallback.
- **XSS / HTML injection**: blocks render to HTML strings. Escape all
  user-entered text; the "Raw HTML" block is powerful but author is always a
  Super Admin; sanitize/whitelist embeds. No untrusted input reaches the renderer.
- **Breaking hardcoded pages**: avoided — Phase 1 leaves `main/*.html` and all
  existing routes untouched; adoption is opt-in per page via fallback.
- **Permission gaps**: `can()` treats super_admin as all-powerful, so CMS gating
  must use the dedicated `MANAGE_CMS` permission + `requireSuperAdmin` +
  `is_super_admin()` RLS + page guard — not a generic admin check.
- **Scope creep**: the spec is large. Mitigate with the phased plan; ship a
  stable, simple Phase 1–3 before advanced blocks/forms/AI.
- **Preview fidelity**: solved by reusing the real renderer in the iframe.

**Assumptions**
- The owner edits as Super Admin only (matches the requirement).
- Branding presets come from the existing Brand Kit.
- Public CMS pages render server-side as branded HTML (consistent with blog).

**Dependencies**
- Existing: `is_super_admin()` RLS, `current_app_role()`, action-token auth,
  `media_assets` + `mjg-media` + `/api/admin/uploads`, `form_submissions`,
  `user_activity_logs`, `lib/public-site/static-pages.ts` chrome,
  `lib/brand/assets.ts`, the block-builder UI patterns, Steward agent framework.
- New: `MANAGE_CMS` permission, `requireSuperAdmin`, `lib/cms/*`, `cms_*` tables.

## 13. Phased implementation plan

Each phase is independently shippable. **Each new migration will be flagged
explicitly for manual application.**

- **Phase 1 — Foundation & access (smallest safe slice)**
  - Add `MANAGE_CMS` permission + `requireSuperAdmin` helper.
  - Add **CMS** nav item (super-admin-only) + `app/dashboard/cms` route +
    super-admin layout guard.
  - Migration: `cms_pages`, `cms_page_versions`, `cms_blocks` + RLS
    (`is_super_admin()`).
  - CMS home: pages list/table, "New page" (slug/title/type/status), page-metadata
    view. No editor yet.
  - **No change to any existing route or `main/*.html`.**

- **Phase 2 — Page editor + draft + live preview**
  - Block tree editor (Section/Row/Column + Title/Subtitle/Paragraph/Rich text/
    Image/Button/Divider/Spacer to start), Save Draft.
  - `lib/cms/render.ts` + namespaced public route `app/p/[slug]` (published) +
    preview route (draft) + iframe live preview.

- **Phase 3 — Publishing & versioning**
  - Publish (snapshot), Archived status, version history, restore-as-new-version,
    audit via `logUserActivity`.

- **Phase 4 — Advanced blocks, design controls, forms, role visibility**
  - Card/Card grid/CTA/Background/Resource/Embed/Form blocks; preset-first design
    controls; `cms_forms`/`cms_form_fields` + submissions into `form_submissions`;
    page- and block-level `visibility_rules`.
  - Optional per-page **adoption fallback** for a first hardcoded page (e.g.
    `/mission`).

- **Phase 5 — Steward AI integration + Experience prep**
  - CMS skill + draft-only CMS tools; in-CMS Steward panel; `cms_ai_drafts`;
    PDF→draft Experience workflow. **All AI output stays draft until a Super
    Admin publishes.** Lay `page_type='experience'` groundwork.

---

### Open questions for you before Phase 1
1. **Public slug namespace**: OK to start CMS pages at **`/p/[slug]`** (zero risk),
   then adopt real paths later? Or do you want a specific prefix?
2. **First page to manage**: a brand-new test page in Phase 1–3, or target a
   specific existing page (e.g. `/mission`) for the Phase 4 adoption pilot?
3. **Rich text**: acceptable to start with a lightweight rich-text block (bold/
   italic/links/lists) and add a fuller editor later?
4. **Audit**: reuse `user_activity_logs` (recommended) vs. a dedicated
   `cms_audit_logs` table?
