# MJG Workspace — Master Guide (Steward)

> **Master reference** for the MJG Workspace, for **Steward** (MJG AI agent).
> This is the top-level index. It summarizes the whole feature and points to the detailed
> guides. Paste all of these into Steward training documents (`agent_training_docs`) for full
> coverage — this master plus the four topic guides.

## What the Workspace is

The **Workspace** (dashboard sidebar → **/dashboard/workspace**) is MJG's built-in collaborative
document tool — a Quip/Notion-style space for living documents: notes, plans, SOPs, meeting
agendas, project trackers, and team collaboration. It is **Super Admin only**. Documents autosave
continuously.

## The guides (detailed references)

1. **Workspace Feature Guide** (`workspace-feature-guide.md`) — the overall feature: organizing
   documents (tabs, folders, favorites, search, templates), the editor's writing tools, media,
   collaboration, sharing, and access.
2. **Editor UI Guide** (`workspace-editor-ui.md`) — the topbar menus (Edit / View / Insert /
   Format), the formatting toolbar, comments, document info & sharing, the AI Assistant, views,
   and keyboard quick-keys.
3. **Insert Blocks & Live Apps** (`workspace-insert-blocks.md`) — the Insert mega-menu, and the
   three interactive blocks: **Project Tracker**, **Kanban Board**, and **Calendar**, plus media
   and basic blocks.
4. **Table Controls** (`workspace-table-controls.md`) — inserting tables with a chosen size, and
   the Table settings dialog (border thickness, border color, per-cell background).

## Feature map (at a glance)

- **Workspaces (top level)** — Create multiple named Workspaces (e.g. Marketing, Board, Personal)
  from the switcher at the top of the home. Each Workspace has its own folders, documents, and
  search. Switching Workspaces scopes everything to that space; the editor keeps you within a
  document's Workspace. Existing content lives in the default **General** workspace.
- **Home & organization** — My Documents / Shared / Favorites / Templates tabs; folders; search;
  five views (List, Cards, Table, Kanban, Calendar); per-document Share control.
- **Sharing** — Personal (only you) / Public (everyone in the workspace) / share with specific
  people. Available in the editor and every home view.
- **Editor menus** — Edit (Undo/Redo, Find & Replace), View (panel toggles, Focus mode, Outline),
  Insert (mega-menu), Format (marks, paragraph/alignment/list submenus, Clear formatting).
- **Writing** — headings, marks, colors, font size, lists, checklists, quotes, alignment, tables,
  columns, table of contents, dividers, links, code blocks, HTML embeds, emoji, dates.
- **Live apps** — Project Tracker (typed table with Owner/Status/Deadline/Attachment; can link an
  existing Plan or Project, or **create a new Plan** so the project lives in both Workspace and
  Plans), Kanban Board, Calendar.
- **Media** — image / video / audio / document upload, plus in-editor audio recording; audio
  plays in the branded MJG player.
- **Collaboration** — threaded comments with @-mentions, resolve/reopen; live document info.
- **AI Assistant** — Summarize / Extract action items / Improve / Shorten / Expand, with a
  review-before-insert preview.
- **Shortcuts** — `/` block menu, `@` mentions, Markdown-as-you-type; Ctrl+B/I/U, Ctrl+Z/Y,
  Ctrl+H (Find & Replace), Ctrl+\ (Clear formatting).

## Access & notes

- Super Admin only.
- Documents autosave (no save button); the topbar shows a Saved/Saving indicator.
- The AI Assistant needs the OpenAI key configured on the server (the same one Steward uses).
- Brand: the UI chrome and Insert infographics use MJG **gold** (stepped in opacity); semantic
  status colors inside a Project Tracker are user-chosen and separate from brand chrome.
