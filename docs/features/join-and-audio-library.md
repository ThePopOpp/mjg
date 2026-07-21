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

## Route
`/join-the-movement` — **this route already exists** as
`app/join-the-movement/route.ts`, which serves the legacy static file
`main/join-the-movement.html`. Replace it with a proper rendered page (same route),
or introduce a new route and redirect the old one. Prefer **replacing in place** so
existing links keep working.

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

> `church_name` and `questions` are **not** accepted by `/api/public/join-journey`
> today. Either extend the endpoint to persist them (they'd land naturally in the
> `form_submissions` payload) or drop them. **Decide before building** — silently
> discarding submitted fields is the failure mode to avoid.

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

## Open decisions — settle these before building

1. **Where do audio files live?**
   - `public/media/` — simple, but **every file ships inside the Docker image**. The
     existing 7.7 MB `.wav` already bloats it. Bad for a growing library.
   - **Supabase storage (`mjg-media` bucket)** — what Media Studio uploads already
     use, keeps the image small, manageable from the dashboard. **Recommended for an
     audio library.**
2. **Track ordering** — explicit `metadata.sort_order`, or newest-first? A book's
   chapters need deliberate order.
3. **Join form fields** — is `church_name` / `questions` persisted (extend the
   endpoint) or dropped?
4. **Does `/join-the-movement` replace the legacy static page**, or live at a new
   route with a redirect?

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
