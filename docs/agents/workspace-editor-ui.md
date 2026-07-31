# MJG Workspace — Editor UI (Topbar, Menus, Formatting, Comments, AI, Shortcuts)

> Training reference for **Steward** (MJG AI agent). A broken-down guide to the Workspace
> document editor's interface. Paste into a Steward training document (`agent_training_docs`).

The editor has a **menu bar** (Edit / View / Insert / Format), a **formatting toolbar**, a
**left panel** (files), a **right panel** (comments + document info), and an optional **Outline**.

---

## Topbar menus (Quip-style)

To the left of the **+** button:

### Edit menu
- **Undo** (Ctrl+Z) / **Redo** (Ctrl+Y)
- **Find & Replace** (Ctrl+H) — search the document; Find, Replace (one), or Replace all, with a
  live match count.

### View menu
- **Show files** — toggle the left panel (favorites / folders / documents).
- **Show comments** — toggle the right comments panel.
- **Show outline** — toggle a live outline sidebar built from the document's H1–H3 headings
  (click a heading to jump to it).
- **Focus mode** — hides all side panels for distraction-free writing.

### Insert menu
An MJG-branded mega-menu (Building blocks / Media / Basic). See the **Insert Blocks** guide.

### Format menu
- **Bold / Italic / Underline / Strikethrough / Highlight / Inline code**
- **Paragraph style** ▸ Text, Heading 1–3, Quote
- **Alignment** ▸ Left / Center / Right
- **List** ▸ Bulleted / Numbered / Checklist
- **Clear formatting** (Ctrl+\) — strips marks back to plain text.

---

## Formatting toolbar

Every button has a theme-aware tooltip (light & dark). Groups:
- **Text marks** — Bold, Italic, Underline, Strikethrough, Inline code, Highlight, Text color,
  Background color, Font size.
- **Headings & quote** — H1, H2, H3, Quote.
- **Lists** — Bulleted, Numbered, Checklist, Insert date, Link a record.
- **Alignment** — Left, Center, Right.
- **Tables** — Insert table (row/column dialog), Add row, Add column, **Table settings**
  (borders & colors — see Table Controls guide), Delete table.
- **Media** — Image, Video, Audio, Document, Record audio.
- **Mentions & extras** — @-mention, Emoji, Table of contents.
- **Layout** — Columns, HTML embed.
- **Blocks** — Code block, Link, Divider, **Ask AI**.
- Far right: **save status** ("Saved"/"Saving…") and the right-panel toggle.

---

## Writing shortcuts (in the document body)

- Type **`/`** on an empty line → block insert menu (search + arrow keys + Enter).
- Type **`@`** after a space or at line start → mention an admin user.
- Markdown as you type: `#` heading, `>` quote, `**bold**`, `` `code` ``.

## Keyboard quick-keys

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

## Comments (right panel)

- Add a comment in the composer; type **@** to mention someone.
- Comments are **threaded**; reply within a thread.
- **Resolve / Reopen / Delete** a thread; toggle **Show resolved**.

---

## Document info & Sharing (right panel)

- Shows the document **Scope** and last-updated time.
- **Share** button (also on every home view): set access to **Personal** (only you),
  **Public** (everyone in the workspace), or **share with specific people** (searchable user
  picker). The panel is theme-aware and won't clip.

---

## AI Assistant

Open with the **✨ Ask AI** toolbar button or the **Ask AI** slash command. It reads the current
document and offers: **Summarize**, **Extract action items**, **Improve writing**, **Shorten**,
**Expand**. Review the result in a preview, then **Copy** or **Insert into document**. Nothing
changes automatically.

---

## Views (Workspace home, not the editor)

The Workspace home lists documents with tabs (**My Documents / Shared / Favorites / Templates**),
folder filtering, search, and five layouts: **List, Cards, Table, Kanban, Calendar**. Each row has
a Share control, favorite star, rename, archive, and delete.

---

## Quick answers (for Steward)

- *"How do I find and replace text?"* → Edit menu → Find & Replace, or Ctrl+H.
- *"How do I hide the side panels?"* → View menu → Focus mode.
- *"How do I see an outline of my document?"* → View menu → Show outline.
- *"How do I clear formatting?"* → Format menu → Clear formatting, or Ctrl+\.
- *"How do I comment and tag someone?"* → Right panel composer, type @ then their name.
- *"How do I summarize this doc?"* → Ask AI → Summarize → Insert or Copy.
