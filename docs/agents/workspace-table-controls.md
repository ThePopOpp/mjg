# MJG Workspace — Table Controls

> Training reference for **Steward** (MJG AI agent) and internal documentation.
> Paste this content into a Steward training document (`agent_training_docs`) to
> teach the agent how tables work in the Workspace editor.

Tables live inside a Workspace document. Insert and restyle them from the editor
toolbar (the table icons) or the **Insert** menu. Every table renders as a full,
closed grid.

---

## Inserting a table

- Click the **table icon** in the toolbar, choose **Insert → Table**, or type `/` and pick **Table**.
- A dialog asks for the size: **Rows (1–30)** and **Columns (1–12)**. Set the numbers and click **Insert**.
- The table is inserted at your cursor with the size you chose (default 3 × 3).

---

## Rows & columns

While your cursor is inside a table:

- **Add row** — the "add row" toolbar icon inserts a row.
- **Add column** — the "add column" toolbar icon inserts a column.
- **Delete table** — the trash icon removes the whole table.

(There's no fixed column limit after creation — keep adding columns as needed, up to a sensible width.)

---

## Table settings (borders & colors)

Click into any cell, then open the **Table settings** button in the toolbar (the gear icon,
next to the table tools). A dialog opens with three controls. **All changes apply to the table
your cursor is currently in.**

1. **Border thickness** — choose **None**, **Thin**, **Medium**, or **Thick**. "None" hides the
   grid lines; the others set the border to 1 / 2 / 3 pixels. Applies to the whole table.
2. **Border color** — pick a swatch: default (theme border), ink/black, gray, gold (brand),
   red, blue, or green. Applies to the whole table's grid.
3. **Cell background** — pick a fill color for the **cell your cursor is in** (not the whole
   table). Options include a clear/none choice (**✕**), muted gray, gold tint, and soft
   yellow / green / blue / red / purple. To color several cells, set them one at a time.

Click **Done** to close the dialog.

---

## Tips & notes

- **Set the cursor first.** Border and background changes act on the table (or cell) that
  contains your cursor. If nothing changes, click inside the table first.
- **Cell background is per-cell.** Border thickness and border color are per-table.
- **Header row.** The first row renders as a styled header (bold, tinted background) by default;
  a cell background you set on a header cell overrides that tint.
- **Theme-aware.** Default border and background colors follow the app's light/dark theme.
  Fixed swatch colors (red, blue, gold, etc.) stay the same in both themes.
- **Existing tables.** Tables created before these controls automatically show full borders
  (default thin), so older documents look correct without editing.

---

## Quick answers (for Steward)

- *"How do I make a table with 5 columns?"* → Insert a table and set Columns to 5 in the dialog.
- *"My table has no outline / open borders."* → Open Table settings and set Border thickness to
  Thin (or thicker); pick a Border color. The whole grid closes up.
- *"How do I highlight one cell?"* → Click that cell, open Table settings, and choose a Cell
  background color.
- *"How do I remove table lines?"* → Table settings → Border thickness → **None**.
