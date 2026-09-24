# MJG Frontend Editor — Steward (Hermes AI) Website Management

**Feature:** Frontend Editor  
**Project:** Michael J. Gauthier / MJG Web App  
**Target Path:** `docs/frontend-editor/frontend-editor.md`  
**Primary User:** Mike Gauthier / Company Owner  
**Framework:** Next.js + React + TypeScript + Tailwind CSS + shadcn/ui  
**AI Agent:** Steward, powered by Hermes AI  
**Recommended Data Layer:** Supabase  
**Status:** Product / Engineering Specification

---

## 1. Feature Overview

Build a **Frontend Editor** inside the MJG dashboard that allows authorized users—especially the company owner, Mike Gauthier—to manage the public MJG website without needing to edit source code manually.

The editor must integrate directly with **Steward (Hermes AI)** so Mike can use natural-language instructions to:

- Create new frontend pages.
- Edit existing pages.
- Delete or archive pages.
- Add, edit, reorder, duplicate, hide, or remove page sections.
- Rewrite or expand page content.
- Update headings, paragraphs, calls to action, buttons, lists, testimonials, FAQs, images, videos, forms, and other supported content.
- Update SEO metadata.
- Preview changes before publication.
- Publish approved changes.
- Restore previous versions.
- Ask Steward questions about the website structure and content.
- Make site-wide content changes where permitted.

The goal is to provide a **controlled AI-assisted CMS and page editor for a Next.js website**, while protecting the production application from unsafe or unintended code changes.

---

## 2. Core Product Principle

The Frontend Editor should **not give Steward unrestricted access to rewrite arbitrary production source code**.

Instead, Steward should operate through a controlled set of frontend-management tools and schemas.

Preferred architecture:

1. Next.js owns the application shell, routing, reusable UI components, design system, authentication, and page renderer.
2. Editable frontend content is stored in a structured content layer, preferably Supabase.
3. Pages are represented by structured page records and approved component blocks.
4. Steward creates and edits those records through validated server-side actions/tools.
5. The user previews the proposed result.
6. Approved changes are published.
7. Every change is versioned and auditable.
8. Rollback is available.

This gives Mike the flexibility of an AI website editor without turning the production repository into an uncontrolled AI code-editing environment.

---

# 3. Primary Goals

## 3.1 Owner-Friendly Website Management

Mike should be able to manage the website from the MJG dashboard without:

- Opening VS Code.
- Editing JSX/TSX.
- Creating pull requests.
- Logging into a separate CMS.
- Knowing the exact page file path.
- Understanding Next.js routing.

Example request:

> "Steward, update the Kingdom Stewardship page. Change the hero title to 'Lead with Purpose. Steward with Intention.' Add a section below the hero explaining the Stewardship Blueprint, and add a button that links to the Blueprint page."

Steward should:

1. Identify the correct page.
2. Read the current page structure.
3. Create a proposed change set.
4. Show Mike what will change.
5. Render a preview.
6. Publish only after approval, unless Mike is using an explicitly enabled direct-publish workflow.

---

## 3.2 AI-Assisted Page Creation

Example:

> "Steward, create a new page called Steward AI. Explain what Steward does, how it works with the Stewardship Blueprint, include a pricing CTA, and add it under Resources in the website navigation."

Steward should be able to:

- Create the page record.
- Generate the slug.
- Create structured content blocks.
- Add SEO metadata.
- Set status to draft.
- Create or update the navigation item.
- Show a preview.
- Request approval to publish.

---

## 3.3 Safe Editing

All AI changes must be constrained by:

- Role permissions.
- Allowed page components.
- Allowed fields.
- Validation.
- Preview state.
- Version history.
- Audit logs.
- Soft delete.
- Rollback.
- Publish controls.

---

# 4. User Roles and Permissions

Use the existing MJG user-role architecture where possible.

Recommended roles:

## Super Admin

Can:

- Access the Frontend Editor.
- Create pages.
- Edit all pages.
- Delete/archive pages.
- Restore pages.
- Publish changes.
- Restore previous versions.
- Manage component availability.
- Manage navigation.
- Manage global website settings.
- Configure Steward permissions.
- View audit logs.
- Enable or disable direct publishing.

## Owner / Administrator

Mike should have full website management permissions similar to Super Admin for frontend content.

Can:

- Create pages.
- Edit pages.
- Archive pages.
- Publish changes.
- Restore prior versions.
- Manage SEO.
- Manage navigation.
- Use Steward AI for frontend management.

## Staff

Configurable permissions such as:

- View pages.
- Edit draft content.
- Create drafts.
- Cannot publish unless granted permission.
- Cannot permanently delete.
- Cannot edit protected global components unless granted permission.

## Standard User

No Frontend Editor access.

---

# 5. Dashboard Navigation

Add a new dashboard navigation item:

**Website**

Suggested sub-navigation:

- Overview
- Pages
- Navigation
- Media
- Global Content
- SEO
- Drafts
- Versions
- Steward AI
- Settings

Alternative:

**Frontend Editor**

with tabs for:

- Pages
- Site Navigation
- Global Content
- Media
- SEO
- History
- Steward

---

# 6. Frontend Editor Dashboard

## 6.1 Overview Screen

Show:

- Total published pages.
- Draft pages.
- Scheduled pages.
- Recently edited pages.
- Unpublished changes.
- Recent Steward activity.
- Recent manual activity.
- Broken links or missing metadata.
- Pages missing SEO titles/descriptions.
- Pending approval changes.
- Recently deleted/archived pages.

Quick actions:

- Create Page
- Ask Steward
- Edit Homepage
- Manage Navigation
- Upload Media
- View Drafts

---

# 7. Page Manager

Create a page-management table/grid.

Each page should show:

- Page title.
- Slug.
- Status.
- Page type.
- Last updated.
- Updated by.
- Published date.
- SEO status.
- Navigation status.
- Version count.
- Draft indicator.

Actions:

- Edit.
- Preview.
- Duplicate.
- Publish.
- Unpublish.
- Archive.
- Delete.
- Restore.
- View versions.
- Ask Steward about page.

Filters:

- Published.
- Draft.
- Scheduled.
- Archived.
- Landing pages.
- Resource pages.
- Marketing pages.
- System pages.
- Pages edited by Steward.
- Pages edited manually.

Search:

- Title.
- Slug.
- Content.
- SEO metadata.

---

# 8. Page Data Model

Recommended Supabase table:

`website_pages`

Suggested fields:

```ts
id: uuid
title: string
slug: string
page_type: string
status: "draft" | "published" | "scheduled" | "archived"
template: string
content: jsonb
seo_title: string | null
seo_description: string | null
seo_keywords: string[] | null
canonical_url: string | null
og_title: string | null
og_description: string | null
og_image_id: uuid | null
featured_image_id: uuid | null
navigation_visibility: boolean
navigation_label: string | null
parent_page_id: uuid | null
sort_order: number
published_at: timestamptz | null
scheduled_at: timestamptz | null
created_by: uuid
updated_by: uuid
created_at: timestamptz
updated_at: timestamptz
deleted_at: timestamptz | null
```

---

# 9. Structured Content Block Model

Store page content as validated structured blocks rather than arbitrary JSX.

Example:

```json
{
  "version": 1,
  "blocks": [
    {
      "id": "hero_123",
      "type": "hero",
      "props": {
        "eyebrow": "Kingdom Stewardship",
        "title": "Steward What Matters Most",
        "description": "A practical framework for aligning life, resources, and responsibility.",
        "primaryCta": {
          "label": "Explore the Blueprint",
          "href": "/stewardship-blueprint"
        }
      }
    },
    {
      "id": "content_456",
      "type": "richText",
      "props": {
        "content": "..."
      }
    }
  ]
}
```

Each block must validate against a registered component schema.

---

# 10. Approved Component Registry

Create a component registry that defines what Mike and Steward are allowed to place on pages.

Example component types:

- Hero.
- Rich Text.
- Two Column Content.
- Image + Content.
- Video.
- Feature Grid.
- Card Grid.
- CTA.
- Button Group.
- Testimonial.
- Quote.
- FAQ.
- Accordion.
- Tabs.
- Stats.
- Timeline.
- Team Member.
- Resource Card.
- Blog Feed.
- Event Feed.
- Stewardship Blueprint Section.
- Pricing.
- Subscription CTA.
- Contact Form.
- Booking CTA.
- Newsletter / Email Signup.
- Image Gallery.
- Logo Grid.
- Divider.
- Spacer.

Each component definition should contain:

```ts
type ComponentDefinition = {
  type: string
  label: string
  category: string
  schema: ZodSchema
  defaultProps: Record<string, unknown>
  editableFields: string[]
  stewardEditable: boolean
  ownerEditable: boolean
}
```

Steward may only create or modify registered components.

---

# 11. Visual Page Editor

Provide an editor that combines:

- Page structure tree.
- Live preview.
- Property panel.
- Steward AI chat.
- Draft/publish controls.

Recommended desktop layout:

### Left Panel

Page structure:

- Hero
- Intro
- Stewardship Blueprint
- Features
- CTA
- Footer CTA

Allow:

- Drag and drop.
- Reorder.
- Duplicate.
- Hide.
- Delete.
- Add block.

### Center Panel

Live page preview.

Preview modes:

- Desktop.
- Tablet.
- Mobile.

Optional:

- Open preview in new tab.
- Preview as public user.
- Preview draft URL.

### Right Panel

Block settings:

- Content.
- Images.
- Links.
- Alignment.
- Layout.
- Visibility.
- Styling options that are permitted by the design system.

Include an **Ask Steward** tab.

---

# 12. Steward AI Integration

Steward should act as an AI frontend-management agent.

## 12.1 Steward Capabilities

Steward may:

- List pages.
- Search pages.
- Read page structure.
- Read page content.
- Read metadata.
- Create draft pages.
- Edit page blocks.
- Reorder blocks.
- Duplicate blocks.
- Delete blocks.
- Update links.
- Update images.
- Update metadata.
- Update navigation.
- Create draft navigation items.
- Suggest SEO improvements.
- Create page content.
- Rewrite content.
- Summarize pages.
- Identify outdated content.
- Identify broken internal links.
- Create page drafts from prompts.
- Compare page versions.
- Restore versions when authorized.

---

## 12.2 Steward Tool Layer

Steward should use server-side tools rather than direct database access from the browser.

Suggested internal tool actions:

```txt
website.pages.list
website.pages.get
website.pages.createDraft
website.pages.updateDraft
website.pages.archive
website.pages.restore
website.pages.publish
website.pages.unpublish

website.blocks.add
website.blocks.update
website.blocks.move
website.blocks.duplicate
website.blocks.remove

website.navigation.list
website.navigation.updateDraft
website.navigation.publish

website.media.search
website.media.attach

website.seo.read
website.seo.updateDraft

website.versions.list
website.versions.get
website.versions.restore

website.preview.generate
website.changeSet.create
website.changeSet.approve
website.changeSet.reject
```

Do not expose unrestricted SQL, file writes, shell commands, or arbitrary repository writes through the owner-facing editor.

---

# 13. Steward Conversation Experience

Create a persistent Steward panel inside the Frontend Editor.

Example conversation:

**Mike:**
> Update the homepage hero to focus more on Kingdom Stewardship and the Stewardship Blueprint.

**Steward:**
> I found the homepage hero. I prepared a draft with a revised eyebrow, headline, supporting copy, and CTA. I did not publish it. Review the changes below.

Show:

- Existing text.
- Proposed text.
- Highlighted differences.
- Preview button.
- Apply to Draft.
- Reject.

After draft application:

- Preview.
- Publish.
- Continue editing.

---

# 14. Change Sets

Every meaningful Steward request should create a `change_set`.

Recommended table:

`website_change_sets`

Fields:

```ts
id: uuid
page_id: uuid | null
requested_by: uuid
source: "steward" | "manual"
prompt: string | null
summary: string
before_state: jsonb
after_state: jsonb
status: "proposed" | "draft_applied" | "approved" | "published" | "rejected"
created_at: timestamptz
approved_by: uuid | null
approved_at: timestamptz | null
published_at: timestamptz | null
```

This makes every AI change explainable and reversible.

---

# 15. Draft, Preview, and Publish Workflow

Recommended default workflow:

1. User requests change.
2. Steward reads current page.
3. Steward creates proposed change set.
4. Validation runs.
5. Draft is generated.
6. User previews changes.
7. User approves.
8. Draft is published.
9. Previous published version remains available for rollback.
10. Audit log records the event.

Do not overwrite production content before a valid draft exists.

---

# 16. Direct Publish Mode

Optional advanced setting.

Setting:

**Allow Steward to publish immediately**

Default:

`OFF`

When disabled:

- Steward can prepare and apply drafts.
- Owner must click Publish.

When enabled:

- Only designated roles can use it.
- Steward must still create a version and audit record.
- Destructive changes should still require confirmation.
- Protected pages should ignore direct publish.

Recommended protected pages:

- Login.
- Signup.
- Account.
- Checkout.
- Billing.
- Legal pages.
- Authentication callbacks.
- System routes.

---

# 17. Version History

Create a complete version history for every page.

Recommended table:

`website_page_versions`

Fields:

```ts
id: uuid
page_id: uuid
version_number: number
content: jsonb
metadata: jsonb
created_by: uuid
source: "manual" | "steward" | "restore"
change_summary: string
created_at: timestamptz
```

Version UI:

- Version number.
- Date/time.
- User.
- Source.
- Summary.
- Preview.
- Compare.
- Restore.

---

# 18. Compare Changes

Provide before/after comparison.

Support:

- Text diff.
- Block added.
- Block removed.
- Block moved.
- Image changed.
- CTA changed.
- Link changed.
- SEO changed.
- Navigation changed.

Steward should be able to summarize:

> "This change updates the hero headline, replaces the primary CTA, adds a Stewardship Blueprint section, and changes the SEO description."

---

# 19. Delete and Archive Behavior

Avoid permanent deletion by default.

## Archive

Preferred action.

Archived pages:

- Are removed from public navigation.
- Are no longer publicly accessible unless configured otherwise.
- Remain recoverable.
- Retain version history.

## Permanent Delete

Only Super Admin / Owner.

Require:

- Explicit confirmation.
- Clear page title.
- Dependency check.
- Link check.
- Child-page check.
- Navigation check.

Example:

> "This page is linked from 4 other pages. Removing it may create broken links."

---

# 20. Media Manager

Create or connect to an MJG media library.

Media features:

- Upload image.
- Upload video.
- Search media.
- Replace media.
- Edit alt text.
- Edit caption.
- Tag media.
- View usage.
- Prevent deletion when actively used without confirmation.

Recommended storage:

Supabase Storage.

Steward should be able to:

- Search existing media.
- Suggest an image.
- Attach existing media.
- Update alt text.

Steward should not fabricate uploaded assets that do not exist.

---

# 21. Navigation Manager

Support:

- Main navigation.
- Footer navigation.
- Utility navigation.
- Dropdowns.
- Nested items.
- External links.
- Internal links.
- Visibility.
- Sort order.

Recommended table:

`website_navigation_items`

Fields:

```ts
id: uuid
navigation_group: string
label: string
url: string
page_id: uuid | null
parent_id: uuid | null
sort_order: number
is_visible: boolean
open_in_new_tab: boolean
created_at: timestamptz
updated_at: timestamptz
```

Steward should be able to say:

> "I added Steward AI under Resources and placed it below Stewardship Blueprint."

---

# 22. Global Content

Create editable global content records for reusable site-wide content.

Examples:

- Website announcement.
- Footer.
- Contact details.
- Social links.
- Primary CTA.
- Booking link.
- Legal footer text.
- Default SEO.
- Organization metadata.
- Steward CTA.
- Subscription CTA.

Recommended table:

`website_globals`

Fields:

```ts
id: uuid
key: string
label: string
value: jsonb
type: string
updated_by: uuid
updated_at: timestamptz
```

---

# 23. SEO Management

Per-page SEO:

- SEO title.
- Meta description.
- Canonical URL.
- Open Graph title.
- Open Graph description.
- Open Graph image.
- Index/noindex.
- Follow/nofollow when needed.

Steward can:

- Audit page SEO.
- Suggest improvements.
- Create metadata.
- Identify duplicates.
- Identify missing metadata.

Steward should not automatically change SEO on published pages without a draft/change-set workflow.

---

# 24. URL and Slug Management

When changing a slug:

1. Detect the previous URL.
2. Warn the user.
3. Offer to create redirect.
4. Search internal references.
5. Update internal links when approved.

Recommended redirects table:

`website_redirects`

Fields:

```ts
id: uuid
source_path: string
destination_path: string
status_code: 301 | 302
is_active: boolean
created_by: uuid
created_at: timestamptz
```

---

# 25. Page Templates

Allow pages to start from approved templates.

Suggested templates:

- Standard Content Page.
- Landing Page.
- Resource Page.
- Stewardship Blueprint Page.
- Service / Offering Page.
- Article / Insight Page.
- Event Page.
- Product / Membership Page.
- Contact Page.
- Booking Page.
- Legal Page.

Steward should select the closest template when creating a page.

---

# 26. Design System Protection

The frontend editor must preserve the MJG design system.

Steward should work with:

- Existing Tailwind tokens.
- Existing shadcn/ui components.
- MJG typography.
- MJG spacing.
- MJG brand colors.
- Existing button variants.
- Existing card variants.
- Responsive rules.

Avoid allowing arbitrary user-entered class names.

Instead expose approved settings:

- Alignment.
- Width.
- Theme.
- Background variant.
- Spacing preset.
- Button style.
- Content width.
- Image position.
- Responsive visibility.

---

# 27. Existing Next.js Integration

Recommended rendering pattern:

```tsx
export default async function Page({ params }) {
  const page = await getPublishedPageBySlug(params.slug)

  if (!page) {
    notFound()
  }

  return <PageRenderer page={page} />
}
```

Renderer:

```tsx
export function PageRenderer({ page }) {
  return (
    <>
      {page.content.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </>
  )
}
```

Block renderer:

```tsx
const registry = {
  hero: HeroBlock,
  richText: RichTextBlock,
  featureGrid: FeatureGridBlock,
  cta: CtaBlock,
  faq: FaqBlock,
}

export function BlockRenderer({ block }) {
  const Component = registry[block.type]

  if (!Component) return null

  return <Component {...block.props} />
}
```

Use runtime validation before rendering.

---

# 28. Route Strategy

For CMS-driven pages, preferred options:

## Option A — Catch-All Dynamic Route

```txt
app/(marketing)/[[...slug]]/page.tsx
```

Good for:

- Flexible page creation.
- Slugs controlled by CMS.
- Avoiding source-code creation for each new page.

## Option B — Hybrid

Keep critical custom routes in code and use CMS pages for standard marketing/content pages.

Recommended hybrid approach:

### Code-Owned Routes

- Authentication.
- Dashboard.
- Billing.
- Checkout.
- User settings.
- Steward application.
- API routes.
- Protected workflows.

### CMS-Owned Routes

- Homepage content.
- About.
- Kingdom Stewardship.
- Stewardship Blueprint.
- Resources.
- Marketing pages.
- Information pages.
- Landing pages.
- General content pages.

---

# 29. Protected Routes

Maintain a configuration list.

Example:

```ts
const PROTECTED_ROUTES = [
  "/dashboard",
  "/login",
  "/signup",
  "/api",
  "/account",
  "/checkout",
  "/billing",
]
```

Steward cannot create, delete, rename, or overwrite protected routes through the Frontend Editor.

---

# 30. Steward Knowledge Context

Steward should be provided context about:

- MJG brand.
- Kingdom Stewardship.
- Stewardship Blueprint.
- Existing site map.
- Existing products/features.
- Page templates.
- Component registry.
- Global content.
- SEO rules.
- Brand language.
- Legal restrictions.
- User permissions.
- Current page being edited.

Use retrieval instead of injecting the entire website into every prompt.

---

# 31. Steward System Rules for Frontend Editing

Recommended agent rules:

1. Always read the current page before editing.
2. Never publish before validation.
3. Prefer draft changes.
4. Do not modify protected routes.
5. Do not write arbitrary executable code through the content editor.
6. Only use registered page components.
7. Preserve the existing design system.
8. Keep responsive behavior intact.
9. Never delete a published page without an explicit owner instruction.
10. Never permanently delete content when archive is sufficient.
11. Create a change summary.
12. Create a version before publish.
13. Warn about broken links.
14. Warn before changing slugs.
15. Do not expose secrets, environment variables, API keys, or server internals.
16. Respect role permissions.
17. If a requested component does not exist, recommend a developer-created reusable component rather than generating unsafe runtime code.

---

# 32. AI Change Risk Levels

Classify requests.

## Low Risk

Examples:

- Rewrite paragraph.
- Change heading.
- Update CTA label.
- Replace image.
- Edit SEO description.

May be applied directly to draft.

## Medium Risk

Examples:

- Add or remove section.
- Reorder sections.
- Change page slug.
- Change navigation.
- Replace forms.

Require preview.

## High Risk

Examples:

- Delete page.
- Change global header/footer.
- Edit legal content.
- Remove navigation.
- Change checkout-related links.
- Mass site-wide replacement.

Require explicit confirmation.

---

# 33. Manual Editor + Steward Editor

The feature should support both workflows.

## Manual

Mike clicks a block and edits content directly.

## Steward

Mike describes what he wants.

Both should write to the same structured page system and version history.

---

# 34. Inline AI Actions

Within editable fields, offer:

- Rewrite.
- Shorten.
- Expand.
- Make clearer.
- Make more conversational.
- Improve CTA.
- Improve SEO.
- Fix grammar.
- Create alternatives.
- Match MJG brand voice.
- Explain this section.

---

# 35. Site-Wide Steward Requests

Support carefully controlled multi-page operations.

Example:

> "Change every button labeled 'Learn More' to 'Explore More' except buttons in the Stewardship Blueprint."

Steward should:

1. Search occurrences.
2. Return affected pages.
3. Show count.
4. Create change set.
5. Allow exclusions.
6. Preview.
7. Apply drafts.
8. Publish when approved.

---

# 36. Content Search

Add full-site search for administrators.

Search:

- Page title.
- Slug.
- Body copy.
- Buttons.
- Links.
- SEO.
- Navigation labels.

Steward should use the same search layer.

---

# 37. Link Intelligence

Provide a link-index system.

For each page show:

- Incoming links.
- Outgoing links.
- Broken links.
- External links.
- Redirects.

Before deletion or slug changes, run dependency checks.

---

# 38. Audit Log

Recommended table:

`website_audit_logs`

Fields:

```ts
id: uuid
actor_id: uuid
actor_type: "user" | "steward"
action: string
resource_type: string
resource_id: uuid | null
summary: string
metadata: jsonb
created_at: timestamptz
```

Log:

- Page created.
- Page edited.
- Page published.
- Page archived.
- Page restored.
- Version restored.
- Navigation edited.
- SEO edited.
- Global content changed.
- Steward prompt executed.
- Direct publish used.

---

# 39. Dashboard Notifications

Examples:

- "Homepage draft updated by Steward."
- "Mike published version 14 of Kingdom Stewardship."
- "A navigation change is waiting for approval."
- "A page scheduled for publication will go live tomorrow."
- "Steward found 3 broken internal links."

---

# 40. Autosave

Manual editor should autosave drafts.

Recommended:

- Debounce 1–3 seconds.
- Show saving state.
- Never autosave directly to published version.
- Store draft separately.
- Recover unsaved session if browser closes unexpectedly.

---

# 41. Draft Preview URLs

Generate secure preview links.

Requirements:

- Signed token.
- Expiration.
- Optional share with staff.
- Not indexed.
- Shows draft version.
- Cannot be guessed.

---

# 42. Publishing

Publishing should:

1. Validate the page.
2. Create version record.
3. Update published content.
4. Revalidate Next.js cache.
5. Revalidate relevant path.
6. Revalidate navigation if required.
7. Write audit log.
8. Update search index if used.
9. Clear preview state where appropriate.

Use:

- `revalidatePath`
- `revalidateTag`

where appropriate.

---

# 43. Scheduling

Optional but recommended.

Allow:

- Publish immediately.
- Schedule publication.
- Schedule unpublish.
- Schedule navigation visibility.

Use server-side job scheduling compatible with the current deployment architecture.

---

# 44. Supabase Security

Use Row Level Security.

Requirements:

- Public users can only read published public content.
- Dashboard users require authenticated access.
- Draft content is not publicly queryable.
- Only permitted roles can publish.
- Only Owner/Super Admin can permanently delete.
- Steward server tools use validated server-side authorization.

Do not put Supabase service-role credentials in the browser.

---

# 45. Proposed Supabase Tables

Recommended:

```txt
website_pages
website_page_versions
website_page_drafts
website_change_sets
website_navigation_items
website_navigation_versions
website_globals
website_media
website_redirects
website_audit_logs
website_component_settings
```

Optional:

```txt
website_templates
website_preview_tokens
website_scheduled_actions
website_links
website_seo_audits
website_steward_sessions
```

---

# 46. Page Draft Model

Optional dedicated draft table:

`website_page_drafts`

```ts
id: uuid
page_id: uuid
content: jsonb
metadata: jsonb
updated_by: uuid
source: "manual" | "steward"
created_at: timestamptz
updated_at: timestamptz
```

Alternative:

Keep current draft and published snapshots in `website_pages`.

Choose one approach and use it consistently.

---

# 47. API / Server Actions

Suggested server actions:

```ts
getPages()
getPage()
createPageDraft()
updatePageDraft()
publishPage()
archivePage()
restorePage()
duplicatePage()

addPageBlock()
updatePageBlock()
movePageBlock()
removePageBlock()

updateSeo()
updateNavigation()

createChangeSet()
approveChangeSet()
rejectChangeSet()

getPageVersions()
restorePageVersion()

generatePreview()
```

All write operations must validate:

- Authentication.
- Role.
- Ownership/permission.
- Input schema.
- Protected route restrictions.

---

# 48. UI Components

Suggested shadcn/ui components:

- Sheet.
- Dialog.
- Tabs.
- Card.
- Command.
- Dropdown Menu.
- Context Menu.
- Alert Dialog.
- Table.
- Badge.
- Tooltip.
- Scroll Area.
- Resizable Panels.
- Select.
- Input.
- Textarea.
- Switch.
- Accordion.
- Collapsible.
- Breadcrumb.
- Sonner / Toast.
- Skeleton.

---

# 49. Recommended Page Editor Layout

```txt
┌──────────────────────────────────────────────────────────────────┐
│ Website / Pages / Homepage                     Preview  Publish   │
├────────────────┬─────────────────────────────┬───────────────────┤
│ PAGE STRUCTURE │ LIVE PREVIEW                │ SETTINGS / STEWARD│
│                │                             │                   │
│ Hero           │                             │ Content           │
│ Intro          │                             │ Design            │
│ Blueprint      │                             │ SEO               │
│ Features       │                             │                   │
│ CTA            │                             │ [Ask Steward]     │
│                │                             │                   │
│ + Add Section  │                             │                   │
└────────────────┴─────────────────────────────┴───────────────────┘
```

---

# 50. Steward Command Bar

Add a command input:

> Ask Steward to change this page...

Quick prompts:

- Rewrite this page.
- Improve the hero.
- Add a CTA.
- Add a FAQ.
- Improve SEO.
- Make this easier to understand.
- Add Stewardship Blueprint content.
- Add a booking section.
- Create a mobile-friendly summary.
- Check for broken links.

---

# 51. Homepage Editing

Homepage should support:

- Hero.
- Featured content.
- Stewardship Blueprint.
- Steward AI.
- Resources.
- Testimonials.
- Booking CTA.
- Newsletter.
- Footer CTA.

Homepage may be marked as a protected content page:

- Editable.
- Cannot be deleted.
- Slug cannot be changed.

---

# 52. Legal Pages

Legal content may be edited but should require stronger controls.

Examples:

- Privacy Policy.
- Terms.
- SMS Opt-In.
- SMS Opt-Out.
- Email Opt-In.
- Email Opt-Out.

Recommended behavior:

- Owner/Super Admin only.
- Draft required.
- Warn that changes may have legal/compliance implications.
- Maintain permanent version history.

---

# 53. Forms and Functional Components

Do not allow Steward to freely generate arbitrary form code.

Forms should use registered form components.

Examples:

- Contact form.
- Booking form.
- Newsletter signup.
- Stewardship Blueprint intake.
- Subscription CTA.

Fields and destinations should be configured through schema-backed settings.

---

# 54. Developer Escape Hatch

Some frontend changes will require actual engineering.

If Mike asks:

> "Create a new interactive retirement calculator."

Steward should recognize that this is not simply a content-block update if no approved calculator component exists.

Steward should respond with a developer task:

- Feature requested.
- Proposed component.
- Page placement.
- Data requirements.
- Integration requirements.
- Acceptance criteria.

Optional future feature:

**Create Development Request**

This can generate a `.md` developer specification in the project docs.

---

# 55. Optional GitHub / Repository Integration

Do not require GitHub for routine website edits.

GitHub should remain useful for:

- New components.
- Layout changes.
- Feature engineering.
- Application code.
- Design-system changes.

Optional advanced workflow:

- Steward identifies missing component.
- Generates developer specification.
- Developer implements component in repo.
- Component is registered in Frontend Editor.
- Mike can then use it through the dashboard.

---

# 56. Brand Voice

Steward should use MJG-specific brand guidance when generating content.

Include concepts such as:

- Kingdom Stewardship.
- Stewardship Blueprint.
- Purpose.
- Responsibility.
- Faithful stewardship.
- Time.
- Energy.
- Attention.
- Resources.
- Intentional living.
- Financial stewardship.

Avoid inventing factual claims, credentials, guarantees, testimonials, or regulatory language.

---

# 57. Accessibility

All generated and edited pages should preserve accessibility.

Validation:

- Image alt text.
- Button/link labels.
- Heading order.
- Form labels.
- Keyboard navigation.
- Contrast.
- Semantic markup.

Steward should flag common accessibility issues.

---

# 58. Responsive Behavior

Every registered block must have defined:

- Desktop layout.
- Tablet layout.
- Mobile layout.

The editor should preview all three.

Steward should not create content that depends on desktop-only layouts unless explicitly approved.

---

# 59. Performance

The content system should:

- Use server components where appropriate.
- Cache published content.
- Revalidate only affected routes.
- Optimize images.
- Avoid loading editor JavaScript on the public site.
- Lazy-load heavy blocks.
- Keep the dashboard editor separated from public bundles where practical.

---

# 60. Security Requirements

- No arbitrary code execution from content fields.
- Sanitize rich text.
- Validate URLs.
- Validate media types.
- Prevent script injection.
- Restrict iframe/embed domains.
- Log write operations.
- Use server-side permission checks.
- Rate limit AI write actions.
- Do not expose secrets to Steward context.
- Do not expose environment variables to frontend users.

---

# 61. Suggested Rich Text Strategy

Use a structured rich-text editor such as:

- Tiptap, or
- Lexical.

Do not store raw uncontrolled HTML when avoidable.

If HTML is accepted:

- Sanitize server-side.
- Use strict allowlists.

---

# 62. Existing Page Migration

Create a migration utility for current code-defined marketing content.

Migration process:

1. Inventory current public pages.
2. Classify page:
   - code-owned
   - CMS-owned
   - hybrid
3. Convert CMS-owned page content into page blocks.
4. Preserve slug.
5. Preserve metadata.
6. Preserve images.
7. Preserve internal links.
8. Compare rendered output.
9. Publish CMS version.
10. Remove duplicate hard-coded content after validation.

Do not migrate system routes into the CMS.

---

# 63. Acceptance Criteria

The feature is complete when:

- Mike can open the MJG dashboard and access Frontend Editor.
- Mike can see all editable website pages.
- Mike can create a page without editing code.
- Mike can edit page content manually.
- Mike can ask Steward to edit a page.
- Steward can read the current page before modifying it.
- Steward can create a draft change.
- Mike can preview draft changes.
- Mike can publish approved changes.
- Mike can archive a page.
- Mike can restore an archived page.
- Page versions are saved.
- Prior versions can be restored.
- Steward edits are logged.
- Manual edits are logged.
- Protected routes cannot be deleted by the editor.
- Navigation can be managed.
- SEO can be managed.
- Media can be selected and attached.
- The public Next.js site renders published structured content correctly.
- Publishing triggers cache/path revalidation.
- Unauthorized users cannot modify website content.

---

# 64. Phase Plan

## Phase 1 — Foundation

- Supabase schema.
- Permission model.
- Page model.
- Page versioning.
- Component registry.
- Public page renderer.
- Page list.
- Basic manual editor.

## Phase 2 — Steward Integration

- Steward page tools.
- Page read/search.
- AI draft generation.
- Change sets.
- Before/after diff.
- Preview.
- Approval workflow.

## Phase 3 — Site Management

- Navigation editor.
- SEO editor.
- Media manager.
- Global content.
- Redirects.
- Link intelligence.

## Phase 4 — Advanced Operations

- Site-wide AI changes.
- Scheduled publishing.
- Approval workflows.
- Development-request generator.
- Content audits.
- Accessibility audits.
- SEO audits.

---

# 65. Recommended Build Priority

Build in this order:

1. Page schema.
2. Component registry.
3. Public page renderer.
4. Draft/published content separation.
5. Page manager.
6. Manual editor.
7. Version history.
8. Preview.
9. Steward read tools.
10. Steward draft-edit tools.
11. Change sets.
12. Publish workflow.
13. Navigation.
14. SEO.
15. Media.
16. Global content.
17. Advanced site-wide AI operations.

---

# 66. Final Product Direction

The MJG Frontend Editor should feel like a combination of:

- AI website assistant.
- Structured CMS.
- Visual page builder.
- Version-controlled publishing system.

Mike should be able to speak naturally to Steward:

> "Create a new page for Steward AI."

> "Rewrite the homepage hero."

> "Add a section about the Stewardship Blueprint."

> "Remove this outdated paragraph."

> "Show me what changed last week."

> "Restore the previous version."

> "Add Steward AI under Resources."

Steward should execute those requests through safe, validated, reversible website-management tools while the existing Next.js application remains the controlled rendering and application layer.

The final result should give the owner meaningful control over the website without requiring access to source code for normal content and page-management tasks.
