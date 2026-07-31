# MJG Workspace — Insert Blocks & Live Apps

> Training reference for **Steward** (MJG AI agent). Covers everything in the editor's
> **Insert** menu, with emphasis on the three interactive "live app" blocks.
> Paste into a Steward training document (`agent_training_docs`).

The **Insert** menu (top toolbar of the Workspace document editor, or type `/`) is an
MJG-branded mega-menu with three sections: **Building blocks**, **Media**, and **Basic**.

---

## Building blocks (live apps)

These are interactive blocks whose data is saved inside the document (they autosave).

### Project Tracker
A structured table for running projects. Insert it, then use **Add row** (top-right) to add rows.
Columns:

1. **Project** — Type a name freely, or click the **⌄** to set the project's *home*:
   - **Workspace** — a standalone project that lives only in this document.
   - **Plans** — pick an **existing plan** from the MJG Plans module (search list), or type a
     new name. Linking a plan makes the project reachable from both Workspace and Plans.
   - **Projects** — pick an **existing project** from the Project Manager, or type a new name.
   A linked record shows a small **Linked ›** shortcut.
2. **Owner** — click the **+** to pick an MJG user, or type a custom name.
3. **Status** — colored options **Upcoming / In Progress / Complete**. Add your own with the
   **New Status…** field; remove one with its ✕. Clear a row's status from the menu.
4. **Deadline** — a **date** picker plus a **time** field (appears once a date is set).
5. **Attachment** — **Choose File… → Upload** (any file), **Audio** (plays in the MJG branded
   audio player), or **URL** (paste a link).

Hover a row to reveal its delete button.

### Kanban Board
Columns of cards for tracking progress. Defaults to **To Do / In Progress / Done**.
- **Add column** (top-right); each column has a **⋯** menu to **recolor** or **delete** it, and its
  title is editable.
- Each column has a **+** to add a card; card text is editable inline.
- Each card's **⋯** menu can **Move to** another column or **Delete** the card.

### Calendar
A month grid for events.
- Navigate months with **‹ ›**.
- Hover a day and click **+** to add an event; type the title and press Enter.
- Click an event chip to remove it.

---

## Media
- **Image**, **Video**, **Audio**, **Document** — upload a file; it's embedded in the document.
  Audio plays in the branded MJG player.
- **Record audio** — record a voice note directly and insert it.

## Basic
- **Table** — opens a dialog to choose rows & columns (see the separate Table Controls guide).
- **Checklist** — clickable checkboxes that strike through when complete.
- **Date** — an inline date chip.
- **Columns** — multi-column layout.
- **Table of contents** — auto-built from the document's headings.
- **Divider** — a horizontal rule.
- **Link** — insert a hyperlink.
- **Link a record** — insert a live card linking to an MJG Plan, Client/Participant, or Booking.
- **Code block** — a monospaced code box.
- **HTML embed** — paste HTML to render it live (scripts disabled).
- **Emoji** — emoji picker.
- **Ask AI** — the AI assistant (see the Editor UI guide).

---

## Quick answers (for Steward)

- *"How do I add a project tracker?"* → Insert → **Project Tracker** (or type `/project`).
- *"Can the tracker pull from my Plans?"* → Yes. In the Project column, open **⌄**, choose **Plans**
  (or **Projects**), then pick an existing record from the list — or type a new name.
- *"How do I attach a voice note to a project?"* → In the Attachment column, **Choose File… → Audio**.
- *"How do I add a new status like 'Blocked'?"* → Open the Status menu, type it in **New Status…**,
  press Enter.
- *"How do I move a Kanban card?"* → Open the card's **⋯** menu → **Move to** → pick a column.
- *"How do I add a calendar event?"* → Hover the day, click **+**, type the title, press Enter.
