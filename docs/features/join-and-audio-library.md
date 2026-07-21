# Join the Movement page + Listen (audio library) page

Two **independent** frontend features. Build them in either order — they share only
the public-page conventions in §0.

Both are **public marketing pages** (no auth), served from the primary domain
`michaeljgauthier.com`.

---

## 0. Shared conventions — read this first

### Public pages are route handlers, NOT React pages

The marketing site is **HTML rendered by route handlers**, not React/JSX pages. This
is the single most important convention here — building these as `page.tsx` files
would give you no nav, no footer, and no light/dark theme.

Copy the structure of an existing one:
- `app/mission/route.ts` — the closest model (hero + content sections)
- `lib/public-site/legal.ts` — renders `/privacy` and `/terms`
- `lib/public-site/consent.ts` — renders the 4 SMS/email opt-in pages (has a working
  vanilla-JS form posting to an API — **the best model for the Join form**)

Every public page composes these from `lib/public-site/static-pages.ts`:

```ts
renderFaviconLinks()   renderPwaHeadTags()   renderThemeScript()   renderFonts()
renderNavStyles()      renderSiteHeader(siteUrl)
renderSiteFooter(siteUrl)   renderNavScript()   renderInstallScript()
```

Rules:
- `export const dynamic = "force-dynamic";` then `export function GET()` returning
  `new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } })`.
- Use `publicSiteUrl()` / `appUrl()` for absolute links — **never hardcode a domain.**
  The site just migrated to the apex; hardcoding would undo that.
- Support **light and dark** via the `:root` / `[data-theme="dark"]` CSS variable
  pattern used in `legal.ts` and `consent.ts` (`--paper --ink --muted --line --gold --card`).
- Brand is **gold + ink + warm neutrals. No green.** See `reference_brand_colors`.
- Responsive down to mobile; touch targets ≥ 44px.

---

# FEATURE 1 — "Join the Movement" page

## Goal
A dedicated, stylized page with a hero and the Join the Movement form, using the
site nav and footer.

## Route — `/join-the-movement` (its own standalone page) ✅ decided
This is a **dedicated page**, not a homepage section or modal — chosen for SEO,
tracking, and linkability.

The route **already exists** (`app/join-the-movement/route.ts`) serving the legacy
static file `main/join-the-movement.html`. **Replace it in place at the same URL** —
keeping `/join-the-movement` preserves any existing indexing and inbound links,
which is the whole point of giving it its own page. Do not create a second route.

The homepage `#join` section can stay as-is; this page becomes the canonical
destination worth linking to and tracking.

## ⚠️ Do NOT build a new form endpoint — one already exists

`POST /api/public/join-journey` (`app/api/public/join-journey/route.ts`) already:
1. Upserts a **participant** (`upsertParticipant`)
2. Sets `journey_status: "started"` and creates the **email journey events**
3. Records a row in `form_submissions`
4. Sends the welcome email

It accepts (snake_case or camelCase):

| Field | Notes |
|---|---|
| `email` | **required** |
| `first_name` | **required** |
| `last_name` | **required** |
| `phone` | optional |
| `hear_about` | optional → stored as `relationshipCategory` |
| `form_type` | use `join_the_journey` (or `journey_signup`) to trigger the participant + journey path. **Any other value only saves a form submission and does NOT enroll them.** |

Post to this endpoint. Do not duplicate the enrollment logic.

## Form fields
Match the existing homepage `#join` form (`main/index.html`) — it is the fuller of
the two:

`first_name`, `last_name`, `email`, `phone`, `church_name`, `hear_about`,
`questions`, plus a **consent checkbox** (`agree`).

The legacy `main/join-the-movement.html` used a smaller set (`first_name`,
`last_name`, `phone`, `email`, `interest`, `consent`) — treat the homepage version
as the source of truth, and confirm the final field list with the owner.

> **`church_name` and `questions` are already saved — no work needed.** The endpoint
> passes the *entire* raw form body into `form_submissions.payload` (jsonb) via
> `recordSubmission`, so every submitted field is captured even though only
> `email / first_name / last_name / phone / hear_about` are mapped to the participant
> record. Send them along with the rest of the form and they'll persist.
>
> Optional, later: "promote" them to structured fields (a participant column or a
> dashboard column in the submissions view) if the team wants to filter on them.
> Not required for this build.

## Page structure
1. **Hero** — eyebrow, headline, supporting line, and the mission framing
   ("Using God-Given Resources for God-Given Purposes" is the current `/mission` H1
   — keep voice consistent, don't duplicate verbatim).
2. **The form** — card-styled, like `consent.ts`. Inline validation, a clear consent
   line, and a real success state that replaces the form (don't just alert).
3. **What happens next** — short reassurance about the 7-day journey emails.

## Acceptance criteria
- [ ] Renders with site nav + footer, light and dark, mobile → desktop
- [ ] Submits to `/api/public/join-journey` with `form_type: "join_the_journey"`
- [ ] A real submission creates a participant and starts the email journey
- [ ] Success state replaces the form; errors are shown inline (never a bare `alert()`)
- [ ] No hardcoded domains; no green

---

# FEATURE 2 — "Listen" page (audio library) + Media Studio target

## Goal
A stylized frontend audio library — audiobook-style short tracks about the upcoming
book — where **Super Admins control which audio appears** from Media Studio.

## How Media Studio placement actually works (read before coding)

Assets are placed on surfaces via **`media_assets.metadata.display_targets`** — a
plain JSON array of string keys. There is **no join table** involved in this path
(`media_publish_targets` exists but is not what powers these surfaces).

Targets are defined in one array — `components/media-studio/media-studio-dashboard.tsx` (~line 47):

```ts
const displayTargets = [
  { key: "frontend_home",                label: "Frontend home" },
  { key: "frontend_resources",           label: "Resources page" },
  { key: "user_dashboard_notifications", label: "User dashboard notifications" },
  { key: "user_dashboard_audio",         label: "User dashboard audio files" },
  { key: "selected_users",               label: "Selected users later" },
];
```

Reading is done by `getPublishedAudioForTarget(target, limit)` in
`lib/content/media.ts` (~line 58), which returns audio assets where:
`asset_type = 'audio'` AND `status = 'published'` AND `file_url IS NOT NULL` AND
`metadata.display_targets` includes the target key.

Existing consumers, to copy:
- `app/route.ts` → `getPublishedAudioForTarget("frontend_home", 1)`
- `app/resources/route.ts` → `getPublishedAudioForTarget("frontend_resources", 6)`

### ✅ No migration required
`display_targets` is a jsonb array, so adding a new key is **purely additive** — no
schema change, no migration. Adding one is a **one-line change**:

```ts
{ key: "frontend_listen", label: "Listen page" },
```

Note `visibility` (`private | public | assigned`) and `status`
(`draft | published | hidden | archived | deleted`) are **separate** from display
targets. An asset must be `status: published` to appear publicly, regardless of
targets.

## Work items

1. **Add the target** — one line in `displayTargets` (above). Super Admins can then
   tick "Listen page" on any audio asset, alongside the existing surfaces.
2. **Build `/listen`** — `app/listen/route.ts`, reading
   `getPublishedAudioForTarget("frontend_listen", <limit>)`. Raise or remove the
   limit — a library is not a teaser (the default is 6).
3. **Update the nav link** — `renderSiteHeader()` in `static-pages.ts` (~line 140)
   currently points **Listen** at `${siteUrl}/#listen` (a homepage anchor). Change
   it to `${siteUrl}/listen`.

4. **Build track ordering (required)** — see below. An audiobook has a deliberate
   chapter order; the current default (newest-first) is wrong for this.

## Track ordering — a real feature, not just a sort key ✅ decided

Super Admins must be able to **organize the tracks** — set the order they play in on
the Listen page.

**Storage:** `media_assets.metadata.sort_order` (a number). Keeps it migration-free
and consistent with how `display_targets` already works.

**UI (in Media Studio):** the simplest thing that genuinely works — either
- drag-and-drop reordering of the Listen-page track list, or
- an explicit "Order" number field per asset.

Drag-and-drop is nicer; **if you build it, hand-roll it with native HTML5 drag
events** — this repo has no drag library and the Project Manager kanban + Plan
Builder board both do it natively. Persist the new order for every affected track,
not just the moved one, so the sequence stays dense and stable.

**Reading:** the Listen page sorts by `metadata.sort_order` ascending, falling back
to a stable secondary sort (e.g. `created_at`) for tracks with no order set — a
missing order must never make a track vanish or jump around.

> `getPublishedAudioForTarget()` currently hardcodes `order("updated_at", desc)` and
> a `limit` of 6. For the Listen page either extend it (an options arg for ordering
> and limit) or add a sibling function. **Don't change the existing behaviour of the
> homepage and Resources callers** — they rely on it today.

## Page design — stylized audio library
- Hero introducing the book ("coming soon") and what these recordings are.
- **Track list**, each row: title, description, duration, and a play control.
- A real player: play/pause, seek, current/total time, and **only one track playing
  at a time**. Native `<audio>` is acceptable; a light custom UI on top of it is
  better and keeps it on-brand.
- Empty state when nothing is published to the target yet.
- Accessible: keyboard-operable controls, labelled buttons, visible focus.

### Fields available per asset
`title`, `description`, `file_url`, `duration_seconds`, `mime_type`, `file_size`,
`slug`, `metadata`.

For anything extra (track order, cover art, chapter number), use `metadata` keys
(e.g. `metadata.sort_order`, `metadata.cover_url`) rather than new columns — it
avoids a migration and matches how `display_targets` already works. Default the
ordering explicitly; `getPublishedAudioForTarget` currently orders by `updated_at`
descending, which is **not** a sensible chapter order.

## Acceptance criteria
- [ ] "Listen page" appears as a target in Media Studio and persists on save
- [ ] Ticking it publishes that audio to `/listen`; unticking removes it
- [ ] Only `status: published` audio with a `file_url` appears
- [ ] `/listen` renders with site nav + footer, light and dark, mobile → desktop
- [ ] Player works on iOS Safari (test it — mobile audio has its own quirks)
- [ ] Nav "Listen" points at `/listen`, not the old homepage anchor
- [ ] Empty state renders cleanly with nothing published

---

## Decisions — all settled ✅ (owner, 2026-07-20)

1. **Audio storage → `public/media/` for now.** The library is intentionally small
   at launch. Move to Supabase storage (`mjg-media`) when it grows — the Listen page
   reads `file_url` either way, so that migration is later a URL swap, not a rewrite.
   - ⚠️ **Keep the files small.** Everything in `public/` ships inside the Docker
     image on every deploy; the existing 7.7 MB `.wav` already bloats it. Use
     compressed audio (`.m4a`/`.mp3`), not WAV. If the total climbs past ~50 MB or
     tracks keep being added, that's the signal to move to storage.
2. **Track ordering → build the organize feature.** See "Track ordering" above.
3. **`church_name` / `questions` → already persisted**, no work needed (they land in
   `form_submissions.payload`). Promoting them to structured fields is optional and
   out of scope.
4. **Join the Movement → its own dedicated page** at `/join-the-movement`, replacing
   the legacy static file in place (SEO, tracking, linkability).

## Don't
- Don't build these as React `page.tsx` files (no nav/footer/theme).
- Don't create a second join endpoint — reuse `/api/public/join-journey`.
- Don't write a migration for the Listen target — `display_targets` is jsonb.
- Don't hardcode `michaeljgauthier.com` — use `publicSiteUrl()` / `appUrl()`.
- Don't use green anywhere.

## Verify before claiming done
Run `npm run typecheck` and `npx next build`, then drive the real pages
(`npx next dev`) — submit the form and play a track. This repo has no test runner;
typecheck + build + actually exercising the page is the bar.
