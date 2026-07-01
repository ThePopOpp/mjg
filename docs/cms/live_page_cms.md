# MJG Live Page CMS / Page Review Editor

## Purpose

The Live Page CMS / Page Review Editor allows authorized dashboard users to visually review current frontend webpages, click specific page elements, add notes, and export those notes into an AI-readable document or PDF. The AI Agent, Steward, can then use the notes as structured context to suggest or draft changes to CMS-managed pages, Experience pages, or hardcoded frontend pages.

This feature is designed to bridge the gap between visual website review and CMS/AI-assisted implementation.

---

## Primary Goal

Create a dashboard-based page editor that displays current frontend webpages inside an iframe or preview panel. The user should be able to visually click on a page element, identify whether it is a section, container, row, column, card, component, or heading, then add notes and requested changes.

The notes should be saved with enough metadata for the AI Agent to understand exactly what part of the page the note belongs to.

The system should support live frontend page preview, iframe or same-app preview routes, clickable overlays, section and element detection, notes by page and element, element hierarchy mapping, PDF/document export, AI-readable summaries, future AI-generated draft updates, and Super Admin review before publishing.

---

## Feature Name

Recommended feature name: **Live Page CMS**

Alternative names:
- Page Review Editor
- Visual Page Notes
- Frontend Review Editor
- AI Page Review Tool

Recommended dashboard location: **Dashboard > CMS > Live Page Review**

---

## Access Control

First version should be restricted to **Super Admin only**.

Requirements:
- Hide the navigation item from non-Super Admin users.
- Protect the route from direct access.
- Protect all server actions and API endpoints.
- Protect note data in the database.
- Prevent public users from seeing review sessions, notes, exports, or AI instructions.
- Maintain audit logs for created notes, updated notes, exported documents, and AI-generated drafts.

---

## Main Workflow

1. Super Admin opens the Live Page CMS.
2. Super Admin selects a frontend page to review.
3. The selected page loads inside an iframe or preview route.
4. The system detects page elements and creates clickable overlays.
5. Super Admin chooses a selection mode.
6. Super Admin clicks a section, container, row, column, card, component, or heading.
7. The right-side notes panel opens with detected metadata.
8. Super Admin adds notes, priority, status, and change type.
9. Notes are saved to the current review session.
10. Notes can be exported as a PDF or structured document.
11. Steward can read the export and use it to suggest or draft page changes.
12. Any AI-generated changes must remain drafts until reviewed and published by a Super Admin.

---

## Main Editor Layout

### Top Bar

Include:
- Page selector dropdown
- Selected page URL
- Selected page status
- Device preview toggle: Desktop / Tablet / Mobile
- Selection mode dropdown
- Refresh preview button
- Save notes button
- Export PDF/document button
- Send to Steward button, if AI integration already exists

### Preview Area

Display the selected frontend page.

Preferred approaches:
1. Same-app iframe preview route
2. Dashboard preview route that renders the page safely
3. CMS-rendered preview from page/block data
4. Authorized preview route with review overlay enabled

The preview should support desktop width, tablet width, mobile width, refreshing page content, clickable overlays, hover highlights, and selected element state.

### Notes Panel

When an element is clicked, show a side panel with:
- Selected page name
- Page URL
- Selected element type
- Selected element label
- Parent section
- Parent container
- Heading text, if available
- Heading level, if available
- Component/block type, if available
- Current content summary
- Existing notes for this element
- New note input
- Priority
- Status
- Change type
- Save note button

---

## Page Selection

The editor should allow users to select frontend pages such as:
- Homepage
- Landing pages
- Stewardship Blueprint pages
- Experience pages
- CMS-managed frontend pages
- Public informational pages
- Private user-facing pages, if permitted

The page selector should show:
- Page title
- Page slug
- Page URL
- Page type
- CMS-managed or hardcoded status
- Published/draft status if available

---

## Selection Modes

Add a selection mode control so the user can choose what type of element to review.

Recommended options:
- Auto Detect
- Sections
- Containers
- Rows
- Columns
- Cards
- Components
- Headings Only

### Auto Detect Mode

In Auto Detect mode, the editor should determine the most likely selectable element based on the click location.

If multiple elements overlap, show a small picker menu such as:
- Section: Hero
- Container: Hero Inner
- Row: Hero Content Row
- Column: Left Content Column
- Heading: You Were Created For More
- Component: CTA Button Group

This allows the user to choose the exact level they want to note.

---

## Element Types to Detect

The Page Review Editor should identify and support notes on the following element types.

### 1. Page Section
Large page area, usually full-width. Examples: hero section, feature section, dashboard preview section, CTA section, footer section.

### 2. Container
Inner wrapper inside a section. Usually controls max width, alignment, spacing, and layout constraints.

### 3. Row
Horizontal layout group that may contain columns, cards, or content groups.

### 4. Column
Individual layout column inside a row or grid. Examples: left text column, right image column, card column, form column.

### 5. Card
Reusable content card. Examples: Faith card, Family card, Finances card, step card, feature card, dashboard widget card.

### 6. Component
Reusable frontend component or CMS block. Examples: hero, CTA, form, button group, image block, video block, accordion, tabs, quote block, booking block, dashboard preview, resource block.

### 7. Heading
Heading elements: H1, H2, H3, H4, H5, H6. Headings should be used to detect major sections and anchor notes to visible page content.

---

## Homepage Context

The current homepage has approximately six major sections with titles. The first version should be able to detect these sections by scanning for headings and/or section containers.

For each homepage section, create a selectable overlay and note target.

---

## Element Detection Strategy

For CMS-managed pages, prefer stable CMS references:
- Page ID
- CMS block ID
- Component ID
- Block type
- Section order
- Parent block ID

For hardcoded pages, generate stable references from:
- Page slug
- Element type
- Heading text
- Section order
- DOM path
- CSS class
- Parent section label

Do not rely only on fragile DOM selectors if CMS block IDs or component IDs exist.

---

## Element Metadata

Each selected element should store:
- Page URL
- Page title
- Page slug
- Element type
- Element label
- Heading text, if available
- Heading level, if available
- Section order
- Parent section ID or reference
- Parent container ID or reference
- Parent row ID or reference
- Parent column ID or reference
- DOM selector
- DOM path
- CSS classes
- Component name, if detectable
- CMS block ID, if available
- Bounding box position
- Screenshot position, if available
- Current text content summary
- Current image/resource references, if available
- Current button/link references, if available
- Created at
- Updated at

---

## Nested Element Awareness

The editor must preserve hierarchy.

Example:
Homepage → Hero Section → Hero Container → Hero Text Column → H1 Heading → Paragraph → Button Group → Primary CTA Button

The AI Agent should know whether a note applies to the full section, inner container, row, column, card, specific heading, button group, or single component.

Example note meanings:
- Make this whole section taller.
- Reduce this container width.
- Rewrite only this H1.
- Swap the button order.
- Change only this card.
- Fix spacing inside this column.

---

## Overlay Behavior

Each detected element should show a subtle overlay.

Overlay requirements:
- Thin border around the selected element
- Small label with element type and title
- Hover highlight
- Click to select
- Selected state
- Non-destructive overlay
- Should not distort the actual page layout
- Should not permanently cover the page content

### Overlay Label Examples

- `SECTION 01: Hero`
- `CONTAINER: Hero Inner`
- `ROW: Feature Cards`
- `COLUMN 02: Right Image`
- `CARD: Faith`
- `COMPONENT: CTA Button Group`
- `H1: You Were Created For More`
- `H2: A Blueprint for What Matters Most`

Use different badges for SECTION, CONTAINER, ROW, COLUMN, CARD, COMPONENT, H1, H2, H3, H4, H5, and H6.

---

## Notes System

Allow users to add multiple notes to each selected element.

Each note should include:
- Note content
- Page URL
- Page title
- Page slug
- Element type
- Element label
- Section title
- Heading level
- Section order
- Element selector/reference
- Created by
- Created date/time
- Updated date/time
- Priority
- Status
- Change type

### Priority Options
- Low
- Medium
- High
- Urgent

### Status Options
- Draft
- Open
- In Progress
- Resolved
- Archived

### Change Type Options
- Copy update
- Section layout update
- Container spacing update
- Column layout update
- Card update
- Component update
- Button / CTA update
- Image update
- Form update
- Styling update
- Responsive / mobile issue
- Accessibility issue
- SEO update
- AI rewrite request
- Other

---

## PDF / Document Export

Create an export feature that turns the review notes into a structured PDF or document that the AI Agent can read.

The export should include:

### Cover / Summary
- Page name
- Page URL
- Date created
- Created by
- Total sections reviewed
- Total elements reviewed
- Total notes
- Summary of requested changes

### Section-by-Section Notes
For each section:
- Section number
- Heading text
- Heading level
- Page location/order
- Section selector/reference ID
- Parent hierarchy
- Screenshot thumbnail if available
- Notes
- Priority
- Status
- Change type
- Recommended action

### AI-Friendly Summary
At the end of the document, include:
- Page to update
- Section to update
- Container/row/column/card/component to update
- Requested change
- Priority
- Related CMS block ID, if available
- Related form/CTA/image/resource, if available
- AI instruction

### AI-Friendly Note Example

Page: Homepage  
Section: Stewardship Blueprint Hero  
Element Type: H1 Heading  
Element Text: You Were Created For More  
Requested Change: Make the headline shorter and improve mobile spacing.  
Priority: High  
AI Instruction: Update only the H1 heading and related responsive typography. Do not change the CTA buttons or section background.

---

## AI Agent Steward Integration

Steward should be able to:
- Read exported review documents
- Understand which frontend page is being reviewed
- Understand element hierarchy
- Identify requested copy, layout, image, CTA, form, or design changes
- Suggest updates
- Create CMS draft changes when the page is CMS-managed
- Leave recommendations for manual implementation when a page is hardcoded
- Save AI-generated updates as drafts
- Wait for Super Admin approval before publishing

Important:
- Steward must not automatically publish changes.
- Steward must not make destructive edits.
- Steward must preserve the note hierarchy and target element reference.
- Steward should ask for clarification if notes are ambiguous.

---

## Suggested Data Model

### page_review_sessions
Fields:
- id
- page_id
- page_url
- page_title
- page_slug
- created_by
- status
- created_at
- updated_at

### page_review_elements
Fields:
- id
- review_session_id
- page_id
- page_url
- page_slug
- element_type
- element_label
- heading_text
- heading_level
- section_order
- parent_section_id
- parent_container_id
- parent_row_id
- parent_column_id
- dom_selector
- dom_path
- css_classes
- component_name
- cms_block_id
- bounding_box_json
- screenshot_url
- content_summary
- created_at
- updated_at

### page_review_notes
Fields:
- id
- review_session_id
- element_id
- note
- priority
- status
- change_type
- created_by
- created_at
- updated_at
- resolved_at

### page_review_exports
Fields:
- id
- review_session_id
- file_url
- file_type
- created_by
- created_at
- ai_visible
- ai_processed_at

---

## Iframe / Preview Considerations

If iframe DOM inspection is blocked by cross-origin restrictions, use one of these safe approaches:

1. Serve the preview from the same app/domain.
2. Create a preview route that renders the page inside the dashboard.
3. Use CMS page/block data instead of iframe DOM scanning.
4. Inject a safe review overlay script only for authorized dashboard preview sessions.
5. Use a server-side section map generated from CMS blocks.

Do not use unsafe workarounds.

---

## First Version Scope

Implement the first version with:
- Dashboard route for Live Page CMS
- Page selector
- Iframe or preview panel
- Desktop/tablet/mobile preview toggle
- Selection mode dropdown
- Detection for H1-H6
- Detection for sections, containers, rows, columns, cards, and components where possible
- Clickable overlays
- Notes panel
- Save notes per selected element
- List notes by page and element
- Basic PDF/document export
- AI-readable export format

---

## Future Enhancements

Plan for later:
- Screenshot capture per element
- AI summary generation
- AI suggested edits
- Push notes directly into CMS block drafts
- Resolve notes after edits are made
- Compare before/after section versions
- Comment threads
- Team assignment
- Notifications
- Approval workflow
- Automated responsive issue detection
- Accessibility checks
- SEO review notes
- Visual diffing

---

## UI Style

Match the existing MJG dashboard design. Keep the interface clean, simple, visual, easy for a non-technical owner, focused on page review, and not overloaded with controls.

Use badges for element type, badges for H1-H6, status labels, priority labels, clear hover states, and a simple notes panel.

---

## Important Rules

- Do not break current frontend pages.
- Do not publish AI edits automatically.
- Do not allow unauthorized users to access review notes.
- Save all AI-generated changes as drafts.
- Keep a clear audit trail.
- If a frontend page is not CMS-managed, still allow notes but mark it as `manual implementation required`.
- Prefer CMS block IDs and stable component references over fragile DOM selectors.
- Preserve element hierarchy in notes and exports.

---

## Final Instruction

Start by reviewing the current app structure, CMS implementation, page rendering approach, and AI Agent integration. Then provide a short technical implementation plan before making code changes.
