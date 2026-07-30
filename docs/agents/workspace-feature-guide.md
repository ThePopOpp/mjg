# MJG Workspace — Complete Feature Reference

> Training reference for **Steward** (MJG AI agent) and internal documentation.
> Versioned copy of the Workspace feature guide. Paste this content into a Steward
> training document (`agent_training_docs`) to teach the agent about Workspace.

**What it is:** Workspace is MJG's built-in collaborative document tool — a Quip/Notion-style
space for living documents: notes, plans, SOPs, meeting agendas, and team collaboration.
It is **Super Admin only**.

**Where it lives:** The **Workspace** item in the dashboard sidebar → `/dashboard/workspace`.

---

## Organizing documents (the Workspace home)

- **Documents** — Create, open, rename, and delete rich documents. Every document autosaves as you type (no save button).
- **Scopes** — Documents can be **personal** (only you) or **shared** (visible to other Super Admins / collaborators).
- **Tabs** — Filter the home by **Mine**, **Shared**, **Favorites**, and **Templates**.
- **Favorites** — Star any document to pin it to the Favorites tab.
- **Folders** — Group documents into folders and filter the home by folder.
- **Views** — See your documents as a **List**, **Cards**, **Table**, **Kanban**, or **Calendar**.
- **Search** — A search box scans document titles and body text and returns matching results with a text snippet.
- **Templates** — Start a new document from a prebuilt template: **Blank**, **Meeting Notes**, **Blueprint Review**, **Onboarding**, **Team Agenda**, **Event Planning**, and **SOP**.

---

## Writing (the document editor)

The editor has a sticky toolbar plus a **`/` slash-command menu** (type `/` on an empty line) for inserting blocks quickly.

**Text formatting**
- Paragraph and **Heading 1 / 2 / 3**
- **Bold**, *italic*, underline, strikethrough, inline `code`, and highlight
- **Text color** and **background/highlight color** pickers
- **Font size** options
- **Alignment** — left, center, right

**Lists & structure**
- **Bulleted** and **numbered** lists
- **Checklists** — clickable checkboxes; checking an item strikes it through to mark it complete, unchecking restores it
- **Quote** blocks and **dividers**
- **Columns** — split content into a multi-column layout
- **Table of contents** — auto-generated from the document's headings
- **Tables** — insert a table, add rows/columns, and delete it

**Media & embeds**
- Upload and embed **images, videos, audio, and documents/PDFs**
- **Branded audio player** — audio plays in a custom MJG-styled player (light & dark themes) with speed and volume controls, not the plain browser player
- **Record audio** — record a voice note right in the document and insert it
- **HTML embed** — paste raw HTML and have it render live in the document (scripts disabled for safety)
- **Code block** — for displaying code/HTML as text
- **Emoji** picker

**Links & connections**
- **Links** — insert clickable hyperlinks
- **@mentions** — type `@` to mention an admin user
- **Record-link cards** — insert a live card that links the document to an MJG record: a **Plan**, a **Client/Participant**, or a **Booking**. The card links straight to that record's page in the dashboard.

---

## Collaboration

- **Comments** — a comments panel with threaded discussions on a document.
- Comments support **@mention autocomplete**, and you can **resolve / reopen / delete** them, plus toggle showing resolved comments.
- A document info panel shows document details alongside the comments.

---

## AI Assistant

Open with the **✨ Ask AI** toolbar button or the **Ask AI** slash command. It reads the current document and can:
- **Summarize** the document
- **Extract action items** (tasks) as a bullet list
- **Improve writing** (clarity, grammar, flow)
- **Shorten** the text
- **Expand** the text with more detail

Results appear in a preview first — you then choose to **Copy** them or **Insert** them into the document. Nothing changes automatically.

---

## Access & notes

- Workspace and all its features are **Super Admin only**.
- Documents autosave continuously.
- The AI Assistant requires the OpenAI key to be configured on the server (the same one Steward uses).
