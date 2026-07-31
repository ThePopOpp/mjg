# MJG Workspace — Official Features Document

_The complete, authoritative reference for the MJG Workspace. Last updated 2026-07-31._

---

## 1. Overview

The **Workspace** is MJG's built-in collaborative document tool — a Quip/Notion-style space for
living documents: notes, plans, SOPs, meeting agendas, project trackers, and team collaboration.

- **Location:** dashboard sidebar → **Workspace** (`/dashboard/workspace`).
- **Access:** **Super Admin only.**
- **Autosave:** every document saves continuously as you type; the topbar shows a **Saved / Saving…**
  indicator (no save button).
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
- **Templates** — start a new document from a prebuilt template: Blank, Meeting Notes, Blueprint
  Review, Onboarding, Team Agenda, Event Planning, SOP.

### Views
Five layouts, switchable from the view toggle: **List, Cards, Table, Kanban, Calendar**.

### Organization
- **Folders** — group documents; filter the home by folder. Create with **New Folder** (personal or
  shared scope), scoped to the current Workspace.
- **Search** — a search box scans document **titles and body text** and returns matches with a snippet.

### Per-document actions (List / Cards / Table / Kanban / Calendar)
- **Share** (see §4), **Favorite** (star), **Rename**, **Archive**, **Delete**.

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
- Markdown as you type: `#` heading, `>` quote, `**bold**`, `` `code` ``.

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

### 6.1 Building blocks (live apps) — see §7
- **Project Tracker** (Ink accent), **Kanban Board** (Gold accent), **Calendar** (Red accent), each
  with a mini infographic.

### 6.2 Media
- **Image**, **Video**, **Audio**, **Document** — upload a file, embedded in the document (audio plays
  in the branded MJG player).
- **Record audio** — record a voice note directly and insert it.

### 6.3 Basic
- **Table** (size dialog — see §8), **Checklist**, **Date**, **Columns**, **Table of contents**,
  **Divider**, **Link**, **Link a record** (Plan / Client / Booking card), **Code block**,
  **HTML embed** (renders HTML live; scripts disabled), **Emoji**, **Ask AI**.
  (**Link** opens a branded popover anchored at the selection, not a browser prompt.)

---

## 7. Live-app blocks

Interactive blocks whose data saves inside the document. Insert from the mega-menu or `/`.
Edits appear live (no refresh). Each block header has a **palette** button to set its **accent
color** from the MJG brand swatches.

### 7.1 Project Tracker
A structured, typed table. **Add row** at the top-right; hover a row to delete it. Columns:

1. **Project** — type a name freely, or open the **⌄** to set the project's *home*:
   - **Workspace** — standalone, lives only in this document.
   - **Plans** — pick an **existing plan**, or type a new name and choose **"Create '<name>' in
     Plans"** to create a real Plan record and link it — so the project lives in **both** Workspace
     and Plans.
   - **Projects** — pick an **existing project** from the Project Manager (link-to-existing).
   A linked record shows a **Linked ›** shortcut.
2. **Owner** — the **+** picks an MJG user or type a custom name.
3. **Status** — colored options (default **Upcoming / In Progress / Complete**); add your own via
   **New Status…**; remove one with its ✕; clear a row's status.
4. **Deadline** — a combined **Date & Time** field (branded calendar + hour/minute/AM-PM), no native
   browser UI.
5. **Attachment** — **Choose File… → Upload** (any file), **Audio** (plays in the brand player), or
   **URL**.

### 7.2 Kanban Board
Columns of cards, defaulting to **To Do / In Progress / Done** (gold-stepped).
- **Add column** (top-right); each column's **⋯** menu **recolors** (brand palette) or **deletes** it;
  the title is editable.
- Each column has a **+** to add a card; card text is editable inline.
- **Drag a card** to another column (the target highlights on hover), or use the card's **⋯**
  menu → **Move to**. The **⋯** menu also deletes a card.

### 7.3 Calendar
A month grid for events.
- Navigate months with **‹ ›**.
- Hover a day and click **+** to add an event; type the title and press Enter.
- Click an event chip to remove it.

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

## 9. Media & audio

- Upload and embed **images, videos, audio, and documents/PDFs**.
- **Branded audio player** — audio plays in a custom MJG-styled player (light & dark) with speed and
  volume controls, not the plain browser player.
- **Record audio** — record a voice note in the editor and insert it.
- **HTML embed** — paste HTML to render it live (scripts disabled for safety).

---

## 10. Collaboration

- **Comments** (right panel) — threaded discussions with **@-mention autocomplete**; **resolve /
  reopen / delete**; toggle **Show resolved**.
- **Document info** — shows the document's **Scope** and last-updated time, with the Share control.

---

## 11. AI Assistant

Open with the **✨ Ask AI** toolbar button or the **Ask AI** slash command. It reads the current
document and offers: **Summarize**, **Extract action items**, **Improve writing**, **Shorten**,
**Expand**. Review the result in a preview, then **Copy** or **Insert into document** — nothing
changes automatically. (Requires the server's OpenAI key, the same one Steward uses.)

---

## 12. Notes & conventions

- Workspace and all features are **Super Admin only**.
- Documents autosave continuously.
- **Brand:** UI chrome and Insert infographics use MJG gold/ink/red with opacity stepping; Ink is
  theme-aware so it stays visible in dark mode. The recolor palettes are brand-only (no green).
- All popovers (Share, Date & Time, etc.) are positioned to avoid clipping inside scroll areas.
