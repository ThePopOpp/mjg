# MJG Workspace — Official Features Document

_The complete, authoritative reference for the MJG Workspace. Last updated 2026-08-12._

> This document has two audiences. **§1–§14** describe every shipped feature (the product spec).
> **§15** is a build brief + Claude Code prompt for porting the Workspace into another web app.

---

## 1. Overview

The **Workspace** is MJG's built-in collaborative document tool — a Quip/Notion-style space for
living documents: notes, plans, SOPs, meeting agendas, project trackers, and team collaboration.

- **Location:** dashboard sidebar → **Workspace** (`/dashboard/workspace`).
- **Access:** **Super Admin only.**
- **Autosave:** every document saves continuously as you type; the topbar shows a **Saved / Saving…**
  indicator (no save button). Saving is protected by **version history** (§12) and a **stale-write
  conflict guard** (§13) so content can't be silently lost or overwritten across devices.
- **Theming:** fully theme-aware (light & dark). Chrome and infographics use the MJG brand —
  **Gold `#C9A46E`**, **Ink `#191815`**, and warm neutrals, plus **Red `#9B2F2E`** as an accent.

---

## 2. Workspaces (top level)

Documents are organized inside named **Workspaces** — top-level spaces above folders.

- **Switcher:** a dropdown at the top of the Workspace home shows all Workspaces and lets you move
  between them.
- **Create:** **New Workspace** (button or the switcher's "New workspace" item) creates a named space
  (e.g. Marketing, Board, Personal). Each has its **own folders, documents, and search**.
- **Scope:** selecting a Workspace scopes everything on the home to that space; the URL carries `?ws=…`.
  The editor keeps you within a document's Workspace (its file nav, folders, and the back link).
- **Default:** all pre-existing content lives in a default **General** workspace.

---

## 3. The Workspace home

### Tabs
- **My Documents** — your personal documents.
- **Shared** — documents shared with everyone, or shared specifically with you.
- **Favorites** — documents you've starred.
- **Templates** — start a new document from a prebuilt template (§3.1); templates can be
  **favorited** or **hidden**, and hidden ones restored.
- **Archived** — the recycle bin (§3.2): archived and trashed documents, with **Restore** and
  **permanent delete**.

### 3.1 Templates
Prebuilt starting points, each seeding real content and live-app blocks:
**Blank document, Client Meeting Notes, Stewardship Blueprint Review, New Client Onboarding,
Team Meeting Agenda, Event Planning, Process / SOP, Client Project Tracker, 6-Week Challenge Planner,
Content & Blog Pipeline, Event & Speaking Planner, Quarterly Goals & Initiatives, Facilitator Cohort
Board.**

### 3.2 Archived / Trash view
- Archiving a document removes it from the active lists but keeps it recoverable.
- The **Archived** tab lists archived + trashed docs; each offers **Restore** (back to its
  Workspace) or **Delete permanently** (a hard purge, confirmation required).
- Same pattern as the templates recycle bin.

### Views
Five layouts, switchable from the view toggle: **List, Cards, Table, Kanban, Calendar**.

### Organization
- **Folders** — group documents; filter the home by folder. Create with **New Folder** (personal or
  shared scope), scoped to the current Workspace.
- **Search** — a search box scans document **titles and body text** and returns matches with a snippet.

### Per-document actions (every view)
- **Share** (§4), **Favorite** (star), **Rename**, **Archive**, **Delete**.

---

## 4. Sharing & access

A **Share** control appears on the editor's Document info panel and on every home view. Options:

- **Personal** — only you.
- **Public** — everyone in the Workspace.
- **Share with specific people** — a searchable user picker; add/remove individual collaborators.

The Share panel is theme-aware and positioned so it never clips inside scroll areas.

---

## 5. The document editor

### 5.1 Topbar menus (Quip-style)
To the left of the **+** button:

- **Edit** — Undo (Ctrl+Z), Redo (Ctrl+Y), **Find & Replace** (Ctrl+H): search the document; Find,
  Replace (one), or Replace all, with a live match count.
- **View** — toggle **Show files** (left panel), **Show comments** (right panel), **Show outline**
  (live sidebar of H1–H3 headings, click to jump), and **Focus mode** (hide all side panels).
- **Insert** — an MJG-branded **mega-menu** (see §6).
- **Format** — Bold / Italic / Underline / Strikethrough / Highlight / Inline code; **Paragraph style**
  ▸ (Text, Heading 1–3, Quote); **Alignment** ▸ (Left / Center / Right); **List** ▸ (Bulleted /
  Numbered / Checklist); **Clear formatting** (Ctrl+\).

### 5.2 Formatting toolbar
Every button has a theme-aware tooltip. Groups:
- **Marks** — Bold, Italic, Underline, Strikethrough, Inline code, Highlight, Text color, Background
  color, Font size.
- **Headings & quote** — H1, H2, H3, Quote.
- **Lists** — Bulleted, Numbered, Checklist, Insert date, Link a record.
- **Alignment** — Left, Center, Right.
- **Tables** — Insert table, Add row, Add column, **Table settings**, Delete table (see §8).
- **Media** — Image, Video, Audio, Document, Record audio.
- **Mentions & extras** — @-mention, Emoji, Table of contents.
- **Layout** — Columns, HTML embed.
- **Blocks** — Code block, Link (opens a branded popover anchored at your selection), Divider,
  **Ask AI**.
- **Far right** — right-panel toggle. (The **Saved / Saving…** indicator sits on the ← Workspace
  row above the toolbar, so autosave never reflows the toolbar.)

### 5.3 Writing shortcuts (in the body)
- Type **`/`** on an empty line → block insert menu (search + arrow keys + Enter).
- Type **`@`** after a space or at line start → mention an admin user.
- Type **`#`** → **link another Workspace document** inline (§7); pick from a document picker
  anchored at the caret (searchable, scoped to the current Workspace or all spaces).
- Markdown as you type: `#` heading (at line start), `>` quote, `**bold**`, `` `code` ``.

### 5.4 Keyboard quick-keys
| Action | Shortcut |
| --- | --- |
| Bold | Ctrl+B |
| Italic | Ctrl+I |
| Underline | Ctrl+U |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Find & Replace | Ctrl+H |
| Clear formatting | Ctrl+\ |

---

## 6. Insert menu (mega-menu)

The Insert menu is an MJG-branded mega-menu with three sections.

### 6.1 Building blocks (live apps) — see §9
- **Project Tracker** (Ink accent), **Kanban Board** (Gold accent), **Calendar** (Red accent), each
  with a mini infographic.

### 6.2 Media
- **Image**, **Video**, **Audio**, **Document** — upload a file, embedded in the document (audio plays
  in the branded MJG player; audio can be **transcribed** and **resized** — §10).
- **Record audio** — record a voice note directly and insert it (transcribable too).

### 6.3 Basic
- **Table** (size dialog — see §8), **Checklist**, **Date**, **Columns**, **Table of contents**,
  **Divider**, **Link**, **Link a record** (Plan / Project / Booking card), **Link a document**
  (`#` picker), **Code block**, **HTML embed** (renders HTML live; scripts disabled), **Emoji**,
  **Ask AI**. (**Link** opens a branded popover anchored at the selection, not a browser prompt.)

---

## 7. Inline document links (`#`)

- Type **`#`** anywhere in the body, or use **Insert ▸ Link a document**, to drop an inline chip that
  links to another Workspace document.
- The picker is a caret-anchored popover: searchable, filter by the current Workspace or **All
  spaces**, click to insert. The chip renders the target's title and navigates to it on click.

---

## 8. Tables (basic table block)

- **Insert table** opens a dialog to choose **Rows (1–30)** and **Columns (1–12)**.
- **Add row / Add column / Delete table** from the toolbar (cursor inside the table).
- **Table settings** (gear icon) applies to the table your cursor is in:
  - **Border thickness** — None / Thin / Medium / Thick (whole table).
  - **Border color** — brand swatches (whole table).
  - **Cell background** — fill the current cell (including a clear option).
- Tables render a full, closed grid; older tables show borders automatically.

---

## 9. Live-app blocks

Interactive blocks whose data saves inside the document. Insert from the mega-menu or `/`.
Edits appear live (no refresh). Each block header has a **palette** button to set its **accent
color** from the MJG brand swatches.

### 9.1 Project Tracker
A structured, typed table with **fully custom columns**. **Add row** at the top-right; hover a row to
delete it. **Add column** lets you name a column and choose its **type**; existing columns can be
renamed, retyped, or removed.

**Column types:** Single-line text, Multi-line text, Select (custom colored options), Checkbox,
Date, Time, Date & time, URL / Link, **Image**, **Audio** (branded player inline), **Video**,
Users (multi-select MJG users or custom names), and three record-linking types —
**Workspace / Plans / Projects** — plus a combined **Connect** picker.

The default columns are:
1. **Project** — type a name freely, or open the **⌄** to set the project's *home*:
   - **Workspace** — standalone, lives only in this document.
   - **Plans** — pick an **existing plan**, or type a new name and choose **"Create '<name>' in
     Plans"** to create a real Plan record and link it — so the project lives in **both** Workspace
     and Plans.
   - **Projects** — pick an **existing project** from the Project Manager (link-to-existing).
   A linked record shows a **Linked ›** shortcut.
2. **Owner** — the **+** picks an MJG user or a custom name.
3. **Status** — colored options (default **Upcoming / In Progress / Complete**); add your own via
   **New Status…**; remove one with its ✕; clear a row's status.
4. **Deadline** — a combined **Date & Time** field (branded calendar + hour/minute/AM-PM), no native
   browser UI.
5. **Attachment** — **Choose File… → Upload** (any file), **Audio** (plays in the brand player), or
   **URL**. Attachments open in a **viewer modal** (§10).

### 9.2 Kanban Board
Columns of cards, defaulting to **To Do / In Progress / Done** (gold-stepped).
- **Add column** (top-right); each column's **⋯** menu **recolors** (brand palette) or **deletes** it;
  the title is editable.
- Each column has a **+** to add a card; card text is editable inline.
- **Drag a card** to another column (the target highlights on hover), or use the card's **⋯**
  menu → **Move to**. The **⋯** menu also deletes a card.

### 9.3 Calendar
A month grid for events.
- Navigate months with **‹ ›**.
- Hover a day and click **+** to add an event; type the title and press Enter.
- Click an event chip to remove it.

---

## 10. Media, audio & attachments

- Upload and embed **images, videos, audio, and documents/PDFs**.
- **Branded audio player** — audio plays in a custom MJG-styled player (light & dark) with speed and
  volume controls, not the plain browser player. In the document the player is **resizable** (drag to
  set width).
- **Audio transcription** — a **Transcribe** button on the player converts speech to text
  (OpenAI Whisper) and inserts the transcript into the document below the player. Works on uploaded
  audio and on recorded voice notes.
- **Record audio** — record a voice note in the editor and insert it.
- **Attachment viewer modal** — clicking a Project Tracker attachment (or media chip) opens a modal
  that previews **images, video, and audio** inline (with a download/open option), instead of a raw
  file link.
- **HTML embed** — paste HTML to render it live (scripts disabled for safety).

---

## 11. Collaboration

- **Comments** (right panel) — threaded discussions with **@-mention autocomplete**; **resolve /
  reopen / delete**; toggle **Show resolved**.
- **Document info** — shows the document's **Scope**, last-updated time, the Share control, and the
  **Version history** button (§12).

---

## 12. Version history & Restore

Every document keeps an automatic snapshot trail so nothing is ever lost — an in-app substitute for
database Point-in-Time Recovery.

- **Automatic snapshots** — before an overwriting save, the *prior* content is snapshotted
  (throttled to ~60s so it doesn't spam; pruned to the most recent 60 snapshots per document).
- **Version history panel** — the **Version history** button on the Document info panel opens a
  dialog listing every snapshot with **timestamp, author, and character count**.
- **One-click Restore** — restores the document to that snapshot. The **current** content is
  snapshotted first, so a restore is itself undoable.

---

## 13. Stale-write conflict guard (cross-device safety)

Autosave is no longer "last write wins." This prevents the classic data-loss case: editing on an
iPad, then a stale tab on a PC silently overwriting the newer edits.

- The editor remembers the `updated_at` baseline it loaded with and sends it on every save.
- If the server's row is **newer** (the doc was changed on another device since this tab loaded), the
  save is rejected (**HTTP 409**) and **autosave pauses** behind a banner offering:
  - **Reload latest** — pull in the other device's version.
  - **Overwrite with mine** — force-save this tab's content anyway.

---

## 14. AI Assistant

Open with the **✨ Ask AI** toolbar button or the **Ask AI** slash command. It reads the current
document and offers: **Summarize**, **Extract action items**, **Improve writing**, **Shorten**,
**Expand**. Review the result in a preview, then **Copy** or **Insert into document** — nothing
changes automatically. (Requires the server's OpenAI key, the same one the app's AI agent uses.)

---

## 15. Porting the Workspace into another web app

This section is the build brief for adding the Workspace to a **different** Next.js application, plus
a ready-to-paste Claude Code prompt.

### 15.1 Reference stack (what the MJG build uses)

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 15** (App Router, RSC), **React 19** |
| Editor | **Plate v53** (`platejs`, `platejs/react`, `@platejs/*` — basic-nodes, basic-styles, code-block, layout, link, list, media, table, toc) |
| Styling | **Tailwind CSS v3.4** (`darkMode: ["class"]`), Radix UI primitives (Dialog, DropdownMenu, Tabs, Tooltip) |
| Data | **Supabase** (`@supabase/ssr` cookie sessions); a service-role admin client bypasses RLS on the server |
| AI | OpenAI (chat completions for Ask-AI; **whisper-1** for transcription) |
| Deploy | Docker / Coolify |

Substitute equivalents freely (any Postgres + auth works); the concepts below are what matter.

### 15.2 Data model (tables)

- `workspace_spaces` — top-level Workspaces.
- `workspace_folders` — folders within a space (personal/shared scope).
- `workspace_documents` — `id, space_id, folder_id, title, content_json (jsonb), scope
  ('personal'|'shared'), status, owner/created_by, updated_by, updated_at, archived/trashed state`.
- `workspace_document_collaborators` — per-user share grants.
- `workspace_comments` — threaded comments (parent_id, resolved, author, body, mentions).
- `workspace_document_versions` — snapshot trail: `document_id, title, content_json, char_count,
  created_by, created_at` (indexed by `(document_id, created_at desc)`).

Content is stored as the editor's **JSON node array** (`content_json`), not HTML.

### 15.3 Server surface (API routes)

`documents` (list/create, get/update/delete, **restore**, **purge**), `documents/[id]/versions`
(list + restore), `documents/[id]/collaborators`, `documents/[id]/comments` + `comments/[id]`,
`documents/[id]/favorite`, `folders`, `spaces`, `templates`, `search` (title + body),
`records` (link/create Plan/Project records), `doc-links` (the `#` picker source), `users`
(mention/share directory), `ai` (Ask-AI actions), `transcribe` (Whisper).

**Two invariants worth copying exactly:**
1. **Conflict guard** — `PATCH` accepts `expectedUpdatedAt` + `force`; if `expectedUpdatedAt`
   ≠ the DB's `updated_at` and `force` isn't set, return **409** with the server's `updatedAt`.
   On success return the new `updatedAt` so the client can advance its baseline.
2. **Snapshot-before-overwrite** — on a content-changing save, snapshot the *prior* row into
   `…_versions` (throttled + pruned) before writing. Restore snapshots current first.

### 15.4 Client architecture

- **`workspace-home`** — tabs (mine/shared/favorites/templates/archived), five views
  (List/Cards/Table/Kanban/Calendar), folders, search, space switcher.
- **`workspace-editor`** — the page shell: file nav, save-status, Document info + Share + Version
  history, conflict banner. Owns the autosave loop (`baseUpdatedAt` ref, `conflictRef`, single-flight
  `saving` ref).
- **`plate-editor`** — the Plate instance: custom plugins registered via `createPlatePlugin`
  (`doc_link`, `record_link`, `date_field`, `html_embed`, `todo_item`), a COMPONENTS map keyed by
  plugin key, the `/`, `@`, `#` menus, toolbar, and the topbar Edit/View/Insert/Format menus.
- **`live-apps`** — Project Tracker / Kanban / Calendar blocks (self-contained, data in the node).
- **`brand-audio-player`**, **`comments-panel`**, **`share-control`** — leaf components.

### 15.5 Claude Code build prompt

Paste the following into Claude Code (or your VS Code agent) in the target project. It's written to
be run **incrementally** — the agent should build phase by phase and stop for review between phases.

````text
You are adding a "Workspace" feature to this web app — a Quip/Notion-style collaborative document
editor. Build it to match the spec in docs/features/workspace-features.md (§1–§14). Work in phases;
after each phase, run the type-checker and build, then summarize what you changed and pause for review.

STACK & CONVENTIONS
- Detect this project's framework, styling, auth, and database first, and MATCH them. Do not
  introduce a second UI kit, state library, or ORM. If something is missing, propose the smallest
  addition and ask before adding it.
- Rich-text editor: use Plate v53 (platejs + platejs/react + the @platejs/* packages for
  basic-nodes, basic-styles, code-block, layout, link, list, media, table, toc). Register custom
  block/inline types with createPlatePlugin and a components map keyed by plugin key.
- Store document content as the editor's JSON node array (a jsonb column), NOT HTML.
- Keep every surface theme-aware (light + dark). Use this app's existing design tokens/brand colors;
  do not hardcode colors. Ask me for the brand palette if it isn't obvious.

DATA MODEL (adapt names to this app's conventions)
- spaces (top-level workspaces), folders (personal/shared), documents (space_id, folder_id, title,
  content_json jsonb, scope 'personal'|'shared', status, owner, updated_by, updated_at, archive/trash
  state), document_collaborators, comments (threaded, resolvable, mentions), and
  document_versions (document_id, title, content_json, char_count, created_by, created_at; index by
  document_id + created_at desc).
- Enforce access with row-level security if this DB supports it; otherwise gate in the API layer.
  Default the whole feature to the app's highest role and make that easy to change later.

BUILD PHASES (stop for review after each)
1. Migrations + repository layer: all tables above + CRUD. Include list/get/update/delete/restore
   (soft-delete → trash) and hard purge for documents. Seed a default "General" space.
2. Workspace home: tabs (My Documents, Shared, Favorites, Templates, Archived), five views
   (List, Cards, Table, Kanban, Calendar), folders, a space switcher, and search over title + body.
   Per-document actions: Share, Favorite, Rename, Archive, Delete. Archived tab = Restore +
   Delete-permanently. Include a small set of starter templates.
3. Editor shell + autosave with TWO safety features (critical — do not skip):
   (a) VERSION HISTORY: before any content-changing save, snapshot the PRIOR content into
       document_versions (throttle to ~60s; prune to the last 60 per doc). A "Version history" dialog
       lists snapshots (timestamp, author, char count) with one-click Restore that snapshots the
       CURRENT content first (so restore is undoable).
   (b) STALE-WRITE CONFLICT GUARD: the client sends the updated_at baseline it loaded with; the
       server rejects with HTTP 409 if the DB row is newer and no `force` flag is set. On 409 the
       editor pauses autosave and shows a banner: "changed on another device" → [Reload latest]
       [Overwrite with mine]. On success, return and store the new updated_at.
   Use a single-flight save (ignore overlapping saves) and a ref-based baseline, not React state, to
   avoid stale closures.
4. Plate editor surface: toolbar (marks, headings/quote, lists, alignment, tables, media, mentions,
   emoji, TOC, columns, HTML-embed, code block, link, divider), topbar Edit/View/Insert/Format
   menus, and the "/" block menu. Add "@" mentions and "#" to link another document inline
   (caret-anchored, searchable picker). Markdown-as-you-type for headings/quote/bold/code.
5. Live-app blocks (data saved inside the document node): Project Tracker (typed, fully custom
   columns — text, long text, select w/ colored options, checkbox, date, time, date+time, url,
   image, audio, video, user multi-select, and record-link types), Kanban (drag between columns,
   recolor/rename/delete columns, card CRUD), and a month Calendar. Each block header has an accent
   picker from the brand palette.
6. Media + collaboration: file upload/embed for image/video/audio/document; a branded, resizable
   audio player; audio Transcription via OpenAI whisper-1 that inserts the transcript into the
   document; an attachment viewer modal (image/video/audio preview). Threaded Comments panel with
   @-mention autocomplete and resolve/reopen. Sharing control (Personal / Public / specific people).
7. AI assistant: an "Ask AI" panel that reads the current document and offers Summarize, Extract
   action items, Improve writing, Shorten, Expand — result shown in a preview with Copy / Insert
   (never auto-apply). Use this app's existing AI provider/key.

QUALITY BARS
- Type-check and build must pass after every phase.
- Popovers/dialogs must never clip inside scroll areas; position them against the caret/viewport.
- No destructive action on a GET route reachable by a link/prefetch.
- Keep components small and match the surrounding code's naming and idioms.
Start with Phase 1 and ask me before running any database migration.
````

---

## 16. Notes & conventions

- Workspace and all features are **Super Admin only** (in the MJG app).
- Documents autosave continuously, protected by version history (§12) and the conflict guard (§13).
- **Brand:** UI chrome and Insert infographics use MJG gold/ink/red with opacity stepping; Ink is
  theme-aware so it stays visible in dark mode. The recolor palettes are brand-only (no green).
- All popovers (Share, Date & Time, `#` picker, etc.) are positioned to avoid clipping inside scroll
  areas.
