# MJG WebApp CMS Feature

## Purpose

The MJG WebApp needs a full CMS inside the dashboard so the owner, Mike, can manage frontend page content without manually editing code. The CMS should support editing existing frontend pages, creating new pages, building reusable page sections, adding forms, controlling role-based access, previewing changes, publishing safely, and eventually working with the MJG AI Agent, Steward, to generate Experiences from uploaded PDFs or written instructions.

The CMS should be designed as a scalable foundation for the future Experience Builder.

---

## Primary Goals

1. Add a new dashboard navigation item called **CMS**.
2. Restrict the CMS to **Super Admin** users only.
3. Allow Super Admins to select and edit frontend webapp pages.
4. Provide a live page preview inside the CMS editor.
5. Allow page content to be built from reusable blocks.
6. Support draft, preview, published, archived, and versioned page states.
7. Integrate with forms, user roles, automations, and the future Experience Builder.
8. Prepare the CMS for integration with the MJG AI Agent, **Steward**.

---

## Access Control

The CMS must only be visible and accessible to Super Admin users.

### Requirements

- Add a dashboard navigation item labeled **CMS**.
- Hide the CMS nav item from all non-Super Admin users.
- Protect the CMS route at the page, server action, API route, and database-policy level where applicable.
- Prevent non-Super Admin users from accessing CMS data even if they know the URL.
- Use the existing MJG WebApp role and user management system.
- If the current permission system is incomplete, document the required improvements before implementation.

---

## Dashboard Navigation

Add a new item to the dashboard navigation:

```txt
CMS
```

Recommended route:

```txt
/dashboard/cms
```

Optional future routes:

```txt
/dashboard/cms/pages
/dashboard/cms/pages/[pageId]
/dashboard/cms/media
/dashboard/cms/forms
/dashboard/cms/versions
/dashboard/cms/ai-drafts
```

---

## CMS Page Selection

Inside the CMS, Super Admins need a simple way to choose which frontend page they are editing.

### Recommended UX Options

Use one of the following depending on the current dashboard UI:

- Searchable select field at the top of the CMS editor.
- Tabs for commonly edited pages.
- Sidebar list of pages grouped by type.
- Page table/list view that opens the editor when a page is selected.

### Page Types to Support

The CMS should eventually support:

- Home / landing pages
- Stewardship Blueprint pages
- Experience pages
- User-facing informational pages
- Private dashboard-connected pages
- Role-based pages
- Future campaign or resource pages

### Implementation Note

Before implementing, review how frontend pages are currently routed and rendered. If the pages are currently hardcoded, create a migration path that lets the team gradually move pages into CMS-managed content without breaking the existing frontend.

---

## CMS Editor Layout

The CMS editor should be clean, dashboard-native, and easy for a non-technical owner to use.

### Recommended Layout

```txt
Top Bar
- Page selector
- Page status badge
- Save Draft button
- Preview button
- Publish button

Left Panel
- Page block structure
- Add block button
- Drag/reorder blocks
- Hide/duplicate/delete controls

Center Panel
- Live page preview
- Desktop/tablet/mobile preview options if practical

Right Panel
- Selected block settings
- Content fields
- Design controls
- Visibility settings

Optional AI Panel
- Steward prompt input
- Generate block/page suggestions
- Review AI-generated drafts
```

---

## Live Preview

The CMS should include a live preview of the selected page content.

### Requirements

- Show the selected page as it will appear on the frontend.
- Update the preview as content blocks are edited.
- Support draft preview before publishing.
- Keep unpublished content hidden from regular users.
- Allow Super Admin users to preview pages safely.

### Recommended States

- **Draft**: saved but not visible publicly/private-user-facing yet.
- **Preview**: viewable by Super Admin for review.
- **Published**: active page content shown to assigned users.
- **Archived**: hidden from normal use but preserved.

---

## Content Block System

The CMS should use reusable content blocks so pages can be built section by section.

### Core Block Types

- Section
- Row
- Column
- Title
- Subtitle
- Paragraph
- Rich text
- Image
- Video
- Button
- Link
- Card
- Card grid
- Divider
- Spacer
- CTA section
- Background section
- Resource/download section
- Embedded content
- Form block

### Block Actions

Each block should support:

- Add
- Edit
- Reorder
- Duplicate
- Hide/show
- Delete
- Save
- Preview

---

## Design Controls

Blocks should support design settings that let Super Admins adjust layout and visual styling.

### Recommended Controls

- Background color
- Text color
- Font family or typography preset
- Font size
- Font weight
- Text alignment
- Padding
- Margin
- Gap/spacing
- Border radius / corner rounding
- Borders
- Shadows
- Background image
- Background overlay
- Column width
- Container width
- Responsive behavior
- Visibility rules

### Design Safety

To keep MJG branding consistent, prefer presets where possible:

- Brand colors
- Typography presets
- Spacing presets
- Button styles
- Section styles
- Card styles

Allow custom settings only where necessary.

---

## Forms

The CMS should allow forms to be added to frontend pages or Experiences.

### Form Features

- Add an existing form component where available.
- Create or configure custom fields.
- Set field labels.
- Set field types.
- Mark fields required or optional.
- Connect submissions to users.
- Trigger automations.
- Assign form visibility by role.
- Support progress tracking where needed.

### Field Types

Recommended fields:

- Text
- Email
- Phone
- Textarea
- Select
- Multi-select
- Radio
- Checkbox
- Date
- File upload
- Signature, if needed later
- Hidden fields for automation/user context

---

## Role-Based Visibility

CMS pages and blocks should support role-based visibility.

### Examples

An Experience or page may be visible to:

- Super Admin
- Staff
- Team Leader
- User
- Client
- Stewardship participant
- Custom roles

### Requirements

- Page-level role assignment.
- Optional block-level visibility rules.
- User-specific assignment support for future Experience workflows.
- Safe default: if no role is assigned, do not expose private content unintentionally.

---

## Automations

The CMS should be designed to work with automation triggers.

### Examples

- Form submitted
- Page viewed
- Experience started
- Experience completed
- User assigned to Experience
- User has incomplete form
- User clicks CTA
- Staff notification needed
- Follow-up reminder needed

### Automation Connections

The CMS should prepare for integration with:

- User management
- Form submissions
- Email notifications
- SMS notifications, if applicable
- Staff dashboard notifications
- AI Agent follow-up prompts
- Audit logs

---

## AI Agent Steward Integration

The CMS should integrate with the MJG AI Agent, **Steward**.

The long-term goal is for Mike to upload an Experience PDF or provide written instructions, then ask Steward to design and generate a draft Experience or frontend page.

### Steward Should Eventually Support

- Reading uploaded Experience PDFs.
- Summarizing the PDF content.
- Recommending page structure.
- Creating draft sections and content blocks.
- Suggesting form fields.
- Creating copy aligned with MJG branding.
- Mapping content to user roles.
- Suggesting automations.
- Suggesting dashboard actions.
- Creating a draft page or Experience for Super Admin review.

### Safety Rule

AI-generated content should always be saved as a draft. Nothing generated by Steward should be published automatically without Super Admin review and approval.

---

## Recommended Data Model

Review the existing database before implementing. If no CMS structure exists, consider the following model.

### cms_pages

Stores page metadata.

Suggested fields:

- id
- slug
- title
- description
- page_type
- status
- assigned_roles
- created_by
- updated_by
- published_at
- created_at
- updated_at

### cms_page_versions

Stores revisions and version history.

Suggested fields:

- id
- page_id
- version_number
- content_snapshot
- status
- created_by
- created_at
- notes

### cms_blocks

Stores blocks for each page.

Suggested fields:

- id
- page_id
- parent_block_id
- block_type
- sort_order
- content
- settings
- visibility_rules
- is_hidden
- created_at
- updated_at

### cms_media

Stores uploaded or selected media references.

Suggested fields:

- id
- file_url
- file_name
- file_type
- alt_text
- uploaded_by
- created_at

### cms_forms

Stores CMS-managed forms if the app does not already have a form system.

Suggested fields:

- id
- title
- description
- status
- assigned_roles
- created_by
- created_at
- updated_at

### cms_form_fields

Stores individual form fields.

Suggested fields:

- id
- form_id
- field_type
- label
- placeholder
- required
- options
- sort_order
- settings

### cms_form_submissions

Stores form submissions.

Suggested fields:

- id
- form_id
- user_id
- submitted_data
- submitted_at
- status

### cms_ai_drafts

Stores AI-generated drafts from Steward.

Suggested fields:

- id
- source_type
- source_file_url
- prompt
- generated_structure
- generated_blocks
- status
- created_by
- reviewed_by
- created_at
- reviewed_at

### cms_audit_logs

Stores change history.

Suggested fields:

- id
- action
- entity_type
- entity_id
- previous_value
- new_value
- performed_by
- created_at

---

## Publishing Workflow

The CMS should support a safe publishing process.

### Statuses

- Draft
- Preview
- Published
- Archived

### Actions

- Save draft
- Preview page
- Publish changes
- Duplicate page
- Archive page
- Restore previous version
- View change history

### Rules

- Only Super Admin users can publish.
- AI-generated content must remain draft until approved.
- Published pages should have a version snapshot.
- Reverting should create a new version rather than deleting history.

---

## Experience Builder Relationship

The CMS should be built with the future Experience Builder in mind.

The Experience Builder will allow Mike to create specific user experiences that may include:

- Private pages
- Forms
- Steps
- Resources
- Uploaded PDFs
- Role assignments
- User assignments
- Progress tracking
- Automations
- AI-generated drafts
- Staff notifications

CMS pages and Experiences may share the same block system, form system, role visibility system, and AI draft system.

---

## Implementation Phases

### Phase 1: CMS Foundation

- Add CMS dashboard nav item.
- Restrict CMS to Super Admin.
- Add CMS route/page.
- Add page selector.
- Display selected page metadata.
- Create base database schema if needed.

### Phase 2: Page Editor

- Add editable page content structure.
- Add basic blocks.
- Add save draft functionality.
- Add live preview.

### Phase 3: Publishing and Versioning

- Add draft/published/archived status.
- Add publish action.
- Add revision history.
- Add restore previous version.

### Phase 4: Advanced Blocks and Forms

- Add sections, columns, cards, images, videos, buttons, links, forms, and CTA blocks.
- Add design controls.
- Add role-based visibility.

### Phase 5: Steward AI Integration

- Add Steward panel inside CMS.
- Allow prompts to generate draft blocks/pages.
- Prepare PDF-to-Experience workflow.
- Keep AI-generated content in draft until reviewed and published.

---

## Risks and Considerations

- Do not break existing hardcoded frontend pages.
- Do not expose CMS pages to non-Super Admin users.
- Do not publish AI-generated content automatically.
- Avoid overbuilding the first version.
- Keep the first CMS version stable, simple, and easy to test.
- Preserve existing MJG branding and dashboard design patterns.
- Validate user role and permission logic at every layer.

---

## Success Criteria

The CMS feature is successful when:

- Super Admin users can access the CMS from the dashboard.
- Non-Super Admin users cannot see or access the CMS.
- Super Admin users can select a frontend page.
- Super Admin users can edit page content using blocks.
- Super Admin users can preview changes before publishing.
- Draft and published content are clearly separated.
- The system is ready to support future Experience Builder workflows.
- The architecture can support Steward AI-generated drafts safely.
