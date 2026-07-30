# MJG Collaborative Workspace
## A Slimmed-Down, Quip-Inspired Collaboration Feature for the Michael J. Gauthier Web App

**Recommended feature name:** MJG Workspace  
**Alternative navigation labels:** Team Docs, Collaborative Notes, Workspaces, Living Documents  
**Recommended navigation location:** Main dashboard navigation, near Project Manager, Plans, or Communications

---

# 1. High-Level Overview

The **MJG Collaborative Workspace** is a lightweight document, communication, and task-collaboration feature built directly into the Michael J. Gauthier web app.

The concept is inspired by Quip's approach of combining documents, simple data tables, conversations, comments, and action items in one shared workspace. The MJG version should be intentionally smaller and more focused. It should not attempt to replace Microsoft Word, Excel, Slack, Notion, or a full project-management platform.

The purpose is to give MJG administrators, staff, advisors, team leaders, and approved clients a central place to:

- Create shared living documents
- Collaborate on meeting notes and client plans
- Leave contextual comments
- Mention teammates
- Assign checklist items and tasks
- Track decisions and follow-up items
- Attach files and MJG records
- Connect documents to users, plans, bookings, projects, events, and Stewardship Blueprint activity
- Use reusable MJG templates
- Review document changes and version history
- Ask the MJG AI Agent to summarize, organize, or draft content

The feature should feel native to the existing MJG dashboard and reuse the app's current design system, authentication, roles, user management, messaging, notifications, file storage, and AI Agent capabilities.

---

# 2. Core Features of Quip

Quip's primary product concept is a unified collaboration workspace containing documents, spreadsheets, and communication.

Its core capabilities include:

## Collaborative Documents

- Rich-text documents
- Simultaneous editing
- Embedded images, tables, checklists, and other content
- Responsive editing across desktop and mobile devices
- Offline access and synchronization
- Document permissions
- Version history

## Spreadsheets and Structured Data

- Standalone spreadsheets
- Spreadsheets embedded inside documents
- Formulas and functions
- Sorting and filtering
- Data validation
- Conditional formatting
- Charts
- Collaborative cell editing and comments

## Contextual Communication

- Comments attached to document content
- Comments attached to spreadsheet cells
- Built-in conversation threads
- Team chat rooms
- One-to-one messaging
- Reactions, emojis, and GIFs
- Notifications for relevant activity

## Mentions and Linking

- Mention people
- Mention dates
- Link related documents
- Insert interactive content
- Bring collaborators into a specific discussion

## Tasks and Checklists

- Interactive checklists
- Assignable tasks
- Owners
- Due dates
- Reminders
- Task tracking across documents and teams

## Organization and Discovery

- Folders
- Sidebar navigation
- Search
- Recent documents
- Shared documents
- Favorites and frequently accessed content

## Sharing and Permissions

- Share documents and folders
- Control access
- Organization-level visibility
- Edit and view permissions
- Enterprise authentication and security options

## Templates

- Reusable document templates
- Standardized team processes
- Prebuilt planning and workflow documents
- Template-based record collaboration

## Live Apps and Connected Data

- Interactive content embedded in documents
- Calendars, project trackers, and other live components
- Salesforce records and data embedded in documents
- Two-way Salesforce data synchronization in supported editions
- Documents embedded within Salesforce records

---

# 3. Recommended MJG Version

The MJG version should preserve the highest-value collaboration ideas while avoiding unnecessary complexity.

## Primary Product Goal

Create a shared, action-oriented workspace where MJG staff can document conversations, collaborate around clients and programs, assign follow-up items, and connect the document to the rest of the MJG platform.

## Recommended Core Modules

1. **Workspace Documents**
2. **Block-Based Editor**
3. **Comments and Mentions**
4. **Checklists and Assigned Tasks**
5. **Simple Tables**
6. **MJG Record Connections**
7. **Templates**
8. **Folders and Search**
9. **Permissions and Sharing**
10. **Version History**
11. **Notifications**
12. **AI Agent Assistance**

---

# 4. Suggested User Experience

## Workspace Home

Create a main **Workspace** page with:

- New Document button
- New Folder button
- Template Gallery button
- Search
- Recent documents
- My documents
- Shared with me
- Favorites
- Client workspaces
- Team workspaces
- Archived documents

Support table and card views.

Each document card or row should show:

- Document title
- Short description
- Workspace or folder
- Related client or MJG record
- Owner
- Collaborators
- Last updated date
- Last updated by
- Open tasks
- Unread comments
- Sharing status
- Favorite status
- Actions menu

Suggested actions:

- Open
- Rename
- Duplicate
- Move
- Share
- Add to favorites
- Create from template
- Export
- Archive
- Delete

---

# 5. Three-Panel Document Interface

Use a clean three-panel layout that aligns with the existing MJG dashboard.

## Left Panel: Workspace Navigation

Include:

- Back to Workspace
- Document outline
- Headings
- Related documents
- Attached files
- Linked MJG records
- Open tasks
- Document information

The panel should be collapsible.

## Center Panel: Document Editor

The center is the main collaborative editor.

Support slash commands or an **Add Block** button.

Recommended content blocks:

- Paragraph
- Heading 1
- Heading 2
- Heading 3
- Bulleted list
- Numbered list
- Checklist
- Task
- Quote
- Callout
- Divider
- Image
- File attachment
- Link
- Simple table
- Meeting details
- Decision block
- Client record
- User record
- Plan record
- Booking record
- Event record
- Project record
- Stewardship Blueprint record
- AI-generated content block

Blocks should support:

- Drag-and-drop reordering
- Duplicate
- Move
- Convert block type
- Comment
- Copy link to block
- Delete

## Right Panel: Context and Collaboration

When no block is selected, show:

- Document details
- Owner
- Sharing settings
- Tags
- Related MJG records
- Document activity
- Version history

When a block is selected, show:

- Block settings
- Comments
- Mentions
- Assigned users
- Due date
- Status
- Attachments
- Block history

The right panel should be collapsible.

---

# 6. Document Editor Features

## Rich Text

Support:

- Bold
- Italic
- Underline
- Strikethrough
- Inline code
- Text links
- Text alignment
- Text color using approved MJG colors
- Highlight
- Headings
- Lists
- Quotes
- Callouts

Avoid a complicated Microsoft Word-style toolbar. Keep the controls contextual and focused.

## Slash Commands

Typing `/` should open an insert menu.

Example commands:

- `/heading`
- `/checklist`
- `/task`
- `/table`
- `/image`
- `/file`
- `/client`
- `/booking`
- `/event`
- `/plan`
- `/blueprint`
- `/decision`
- `/ai`

## Autosave

Documents should save automatically.

Display:

- Saving...
- Saved
- Offline changes
- Save failed
- Unsaved changes

Avoid requiring users to manually save routine edits.

---

# 7. Real-Time Collaboration

The long-term goal should support multiple users editing the same document.

The interface should show:

- Active collaborators
- User avatars
- Live cursor or selection presence
- Who is currently viewing
- Recent edits
- Typing or editing indicators

For the first release, real-time collaboration may be simplified to:

- Autosave
- Presence indicators
- Near-real-time document refresh
- Optimistic updates
- Conflict detection
- A warning when another person changed the same block

Do not risk overwriting another user's work.

---

# 8. Comments, Mentions, and Discussion

Comments should be contextual rather than a separate generic chat system.

Allow comments on:

- The entire document
- A paragraph
- A heading
- A checklist item
- A task
- A table
- A table row
- An image
- An attached file
- A linked MJG record

Comment capabilities:

- Threaded replies
- Resolve
- Reopen
- Edit
- Delete
- React
- Mention users
- Assign a comment
- Link directly to the commented block
- Filter unresolved comments

Use `@mentions` to notify approved collaborators.

Examples:

- `@Mike Please review this section.`
- `@Jeremy Can you attach the updated plan?`
- `@Team Please confirm the follow-up date.`

The feature should use the MJG app's existing notification system and optionally connect to Direct Messages instead of creating a duplicate standalone chat platform.

---

# 9. Tasks and Checklists

Tasks should be available directly inside documents.

Each task can include:

- Task title
- Description
- Assignee
- Due date
- Due time
- Status
- Priority
- Related client
- Related plan
- Related booking
- Related project
- Reminder
- Comments
- Attachments

Suggested statuses:

- Not Started
- In Progress
- Waiting
- Complete
- Canceled

Suggested priority levels:

- Low
- Normal
- High
- Urgent

A document task should optionally synchronize with the MJG Project Manager or central task system.

Example:

A task created inside a client meeting document can also appear in:

- The assigned staff member's task list
- The client's internal record
- Project Manager
- AI Agent context
- Related plan or program

Completing the task in either location should update the other location.

---

# 10. Simple Tables

The MJG Workspace should include a lightweight table block rather than a full spreadsheet application.

Support:

- Add and remove rows
- Add and remove columns
- Rename column headers
- Basic text, number, date, status, checkbox, currency, and user fields
- Sort
- Filter
- Column resizing
- Row comments
- CSV export
- CSV import as a later enhancement

Potential MJG uses:

- Meeting agendas
- Client follow-up lists
- Event planning
- Stewardship action items
- Document request lists
- Advisor assignments
- Content planning
- Program milestones

Do not include advanced formulas, macros, pivot tables, or complex spreadsheet functions in the MVP.

---

# 11. MJG Record Connections

A major advantage of building this feature inside MJG is the ability to connect documents to live application records.

Allow a document to be related to one or more:

- Users
- Clients
- Staff members
- Advisors
- Plans
- Programs
- Projects
- Tasks
- Bookings
- Events
- Community groups
- Blog posts
- Email templates
- SMS templates
- Stewardship Blueprint submissions
- Forms
- Uploaded assets

## Smart Record Blocks

Allow users to insert a live summary block.

Example client block:

**Client: John Smith**

- Email
- Phone
- Assigned advisor
- Current plan
- Blueprint status
- Next appointment
- Open tasks
- View Client button

Example booking block:

**Stewardship Conversation**

- Date
- Time
- Attendee
- Assigned staff member
- Booking status
- Join or View Booking button

Record blocks should display current data without copying sensitive record data permanently into the document body when possible.

Respect module permissions. A person should not gain access to restricted client information simply because someone inserted a record into a shared document.

---

# 12. Templates

Create an MJG Workspace Template Gallery.

Recommended starter templates:

## Client Meeting Notes

- Meeting details
- Attendees
- Purpose
- Discussion notes
- Decisions
- Questions
- Follow-up tasks
- Next appointment

## Stewardship Blueprint Review

- Client
- Blueprint completion status
- Faith
- Family
- Finances
- Future
- Giving
- Legacy
- Advisor observations
- Recommended next steps
- Assigned tasks

## New Client Onboarding

- Client information
- Assigned advisor
- Required documents
- Account access
- Welcome communication
- First appointment
- Onboarding checklist
- Open questions

## Team Meeting Agenda

- Date
- Attendees
- Agenda
- Updates
- Discussion topics
- Decisions
- Assigned actions
- Next meeting

## Event Planning

- Event overview
- Date and venue
- Registration goal
- Invite list
- Marketing tasks
- Assets
- Speakers
- Day-of checklist
- Follow-up

## Content Planning

- Topic
- Audience
- Blog post
- Email campaign
- SMS campaign
- Social content
- Assets
- Owner
- Publish date
- Approval status

## Process or Standard Operating Procedure

- Purpose
- Owner
- Scope
- Prerequisites
- Steps
- Related files
- Review date
- Revision history

Super Admins should be able to create, edit, duplicate, publish, and archive templates.

---

# 13. Folders, Tags, and Organization

Support:

- Personal folders
- Team folders
- Client folders
- Program folders
- Project folders
- Shared folders
- Archived folders
- Tags
- Favorites
- Recent documents
- Pinned documents

Suggested automatic folders:

- Client Workspaces
- Stewardship Blueprint
- Team Meetings
- Events
- Plans
- Projects
- Marketing
- Operations
- Templates

Documents may belong to one primary folder and have multiple tags and MJG record relationships.

---

# 14. Search

Provide global workspace search across:

- Document titles
- Document body content
- Comments
- Tasks
- Tags
- Related clients
- Related plans
- Related bookings
- Related events
- Attachments, when text extraction is available

Filters:

- Owner
- Collaborator
- Folder
- Tag
- Related client
- Document type
- Date created
- Date updated
- Has open tasks
- Has unresolved comments
- Shared with me
- Archived

Search results should respect permissions.

---

# 15. Sharing and Permissions

Suggested access levels:

- Private
- Specific People
- Team
- Role
- Client and Assigned Team
- Organization
- Public Link — disabled by default and restricted to approved use cases

Suggested document permissions:

- Owner
- Editor
- Commenter
- Viewer

## Role Guidance

### Super Admin

- Manage all documents and templates
- Configure organization settings
- Restore archived or deleted documents
- Review audit history
- Manage public-link policy

### Admin

- Create and manage approved team documents
- Manage folders and templates when authorized
- Share with staff and clients

### Staff or Team Leader

- Create documents
- Edit shared documents
- Comment
- Assign tasks
- Share within permitted groups

### Client or Standard User

- View documents shared with them
- Comment when allowed
- Complete assigned checklist items or tasks when allowed
- Upload requested files when allowed
- Cannot browse internal team documents

All permissions must be enforced on the backend as well as the frontend.

---

# 16. Version History and Audit Activity

Track document activity including:

- Document created
- Title changed
- Content edited
- Block added
- Block deleted
- Block moved
- Comment added
- Comment resolved
- User mentioned
- Task created
- Task assigned
- Task completed
- Attachment uploaded
- Sharing changed
- Related record added
- Document restored
- Document archived

Version history should allow authorized users to:

- Review previous versions
- See who made a change
- See when a change was made
- Restore a prior version
- Duplicate a prior version into a new document

The initial MVP can use periodic document snapshots plus detailed activity logs rather than storing every keystroke.

---

# 17. Notifications

Trigger notifications for:

- Document shared
- User mentioned
- Comment reply
- Comment assigned
- Task assigned
- Task due soon
- Task overdue
- Requested review
- Document approval requested
- Document approved
- Important document updated

Support:

- In-app notification
- Optional email
- Optional SMS only when consent and communication rules permit

Allow users to control notification preferences.

Avoid sending a notification for every small document edit.

---

# 18. AI Agent Integration

The MJG AI Agent should assist with document work while respecting permissions.

Suggested AI actions:

- Summarize document
- Summarize recent changes
- Extract action items
- Convert action items into tasks
- Draft meeting agenda
- Draft follow-up email
- Rewrite selected text
- Improve clarity
- Shorten content
- Expand content
- Create a checklist
- Organize notes into sections
- Identify unresolved questions
- Suggest next steps
- Generate document from an MJG template
- Find related documents
- Answer questions using approved workspace documents

AI-generated changes should:

- Require user review before replacing content
- Show a preview
- Identify generated content
- Preserve the original version
- Respect document and client permissions
- Be included in the audit history

---

# 19. Recommended Navigation

Add a new top-level navigation item:

**Workspace**

Suggested page hierarchy:

- Workspace Home
- My Documents
- Shared with Me
- Client Workspaces
- Team Workspaces
- Tasks
- Templates
- Favorites
- Archived
- Workspace Settings

Alternative: place Workspace under **Community** or near **Project Manager**.

A top-level Workspace item is recommended because the feature will connect multiple areas of the MJG app.

---

# 20. Suggested Routes

```text
/workspace
/workspace/documents
/workspace/documents/new
/workspace/documents/[documentId]
/workspace/folders
/workspace/folders/[folderId]
/workspace/templates
/workspace/templates/[templateId]
/workspace/tasks
/workspace/favorites
/workspace/shared
/workspace/archived
/workspace/settings
```

---

# 21. Suggested Data Model

The final schema should follow the existing MJG project conventions.

Suggested conceptual entities:

```text
workspace_documents
workspace_document_versions
workspace_blocks
workspace_folders
workspace_folder_members
workspace_collaborators
workspace_comments
workspace_comment_replies
workspace_tasks
workspace_tags
workspace_document_tags
workspace_record_links
workspace_attachments
workspace_templates
workspace_notifications
workspace_activity_logs
workspace_presence
```

## Example: workspace_documents

```text
id
title
description
owner_user_id
folder_id
document_type
content_json
plain_text_content
status
visibility
created_at
updated_at
archived_at
deleted_at
```

## Example: workspace_blocks

```text
id
document_id
parent_block_id
block_type
position
content_json
created_by
updated_by
created_at
updated_at
```

## Example: workspace_collaborators

```text
id
document_id
user_id
permission
invited_by
created_at
```

## Example: workspace_record_links

```text
id
document_id
block_id
record_type
record_id
display_label
created_by
created_at
```

## Example: workspace_tasks

```text
id
document_id
block_id
title
description
assigned_user_id
status
priority
due_at
related_record_type
related_record_id
project_task_id
created_by
created_at
updated_at
completed_at
```

Use structured JSON for editor block content, but also maintain searchable plain text.

---

# 22. MVP Scope

The first version should include:

## Documents

- Create
- Edit
- Autosave
- Rename
- Duplicate
- Archive
- Delete
- Restore

## Editor Blocks

- Paragraph
- Heading
- Bulleted list
- Numbered list
- Checklist
- Task
- Quote
- Callout
- Divider
- Image
- File
- Link
- Simple table
- MJG record link

## Collaboration

- Share
- Viewer, commenter, and editor permissions
- Document comments
- Block comments
- Replies
- Mentions
- Resolved comments
- In-app notifications

## Organization

- Folders
- Tags
- Search
- Recent
- Favorites
- Shared with me
- Templates

## Tasks

- Create
- Assign
- Set due date
- Update status
- Display in central task list
- Optional Project Manager synchronization

## History

- Activity log
- Periodic versions
- Restore version

## AI

- Summarize
- Rewrite selected text
- Extract tasks
- Draft follow-up email

---

# 23. Phase Two

Add later:

- True live multi-user cursors
- Offline editing
- Advanced table field types
- Calendar view
- Document approvals
- Template variables
- PDF export
- DOCX export
- Import from Word or Markdown
- Guest collaborators
- Public links
- Workspace analytics
- Read receipts
- Voice notes and transcription
- More advanced AI Agent tools
- Full client workspace portals

---

# 24. Features to Exclude from the Initial Version

Do not build these in the MVP:

- Full spreadsheet formulas
- Macros
- Pivot tables
- Presentation software
- Standalone chat rooms
- Another direct-message system
- Video conferencing
- Complex whiteboarding
- Public wiki publishing
- Full offline synchronization
- External app marketplace
- Unrestricted public document sharing

MJG already has or plans to have communications, projects, bookings, community, assets, and AI capabilities. The Workspace should connect those systems rather than duplicate them.

---

# 25. Acceptance Criteria

The MVP is complete when an authorized MJG user can:

1. Open Workspace from the dashboard.
2. Create a blank document.
3. Create a document from a template.
4. Add and reorder content blocks.
5. Add headings, paragraphs, lists, checklists, tasks, files, and tables.
6. Link a document to an MJG client.
7. Share the document with a staff member.
8. Share an approved document with a client.
9. Control viewer, commenter, and editor access.
10. Add a comment to a document block.
11. Mention another user in a comment.
12. Resolve and reopen a comment.
13. Assign a task from inside the document.
14. See the assigned task in the central task list.
15. Search for the document.
16. Add the document to a folder.
17. Favorite the document.
18. Review document activity.
19. Restore a previous document version.
20. Ask the AI Agent to summarize the document.
21. Ask the AI Agent to extract action items.
22. Archive and restore the document.
23. Use the feature without gaining unauthorized access to client data.

---

# 26. Claude Code Prompt

```md
# Build the MJG Collaborative Workspace

Create a new feature named **Workspace** inside the Michael J. Gauthier web app.

The feature should be a slimmed-down, MJG-specific collaboration workspace inspired by Quip's core concept of combining living documents, contextual comments, simple tables, checklists, tasks, and related business records in one place.

Do not clone Quip's branding, source code, or complete feature set. Build a focused native MJG experience using the current project stack, components, design system, authentication, database, roles, storage, notifications, and AI Agent architecture.

## Product Objective

Allow MJG administrators, staff, advisors, team leaders, and approved clients to create and collaborate on shared documents connected to MJG users, plans, bookings, projects, events, forms, and Stewardship Blueprint records.

The Workspace must reduce disconnected notes, email threads, duplicate tasks, and scattered client documents.

## Before Coding

1. Audit the existing MJG codebase.
2. Identify the frontend framework, editor libraries, database, authentication, storage, real-time capabilities, notification system, user roles, Project Manager tasks, Direct Messages, and AI Agent implementation.
3. Locate reusable MJG dashboard components.
4. Review current row-level security and backend permission patterns.
5. Review how clients, users, plans, bookings, events, projects, forms, and Blueprint submissions are represented.
6. Provide a concise implementation plan.
7. Implement the feature in phases without changing unrelated functionality.

## Navigation

Add a top-level dashboard item named:

**Workspace**

Include:

- Workspace Home
- My Documents
- Shared with Me
- Client Workspaces
- Team Workspaces
- Tasks
- Templates
- Favorites
- Archived
- Workspace Settings

Use the current MJG sidebar component and permission system.

## Workspace Home

Create a Workspace landing page with:

- New Document
- New Folder
- Template Gallery
- Search
- Recent Documents
- My Documents
- Shared with Me
- Favorites
- Client Workspaces
- Team Workspaces
- Archived Documents

Support table and card views.

Each document item should show:

- Title
- Description
- Folder
- Related MJG record
- Owner
- Collaborators
- Updated date
- Updated by
- Open tasks
- Unread comments
- Sharing status
- Actions menu

## Document Editor Layout

Build a responsive three-panel editor.

### Left Panel

- Back to Workspace
- Document outline
- Related documents
- Attachments
- Linked MJG records
- Open tasks
- Document information

### Center Panel

Create a block-based editor supporting:

- Paragraph
- Heading 1
- Heading 2
- Heading 3
- Bulleted list
- Numbered list
- Checklist
- Task
- Quote
- Callout
- Divider
- Image
- File attachment
- Link
- Simple table
- Meeting details
- Decision
- Client record
- User record
- Plan record
- Booking record
- Event record
- Project record
- Stewardship Blueprint record
- AI-generated content

Support:

- Slash commands
- Add Block menu
- Drag-and-drop block reordering
- Duplicate block
- Move block
- Convert block
- Comment on block
- Copy block link
- Delete block
- Undo
- Redo
- Autosave

Display save status:

- Saving...
- Saved
- Unsaved Changes
- Save Failed

### Right Panel

When no block is selected, show:

- Document information
- Owner
- Sharing
- Tags
- Related MJG records
- Activity
- Version history

When a block is selected, show:

- Block settings
- Comments
- Mentions
- Assignee
- Due date
- Status
- Attachments
- Block history

Make the left and right panels collapsible.

## Document Toolbar

Include:

- Document title
- Folder
- Favorite
- Share
- Collaborator avatars
- Comments
- Activity
- Version History
- AI Assistant
- Export
- More Actions

More Actions:

- Rename
- Duplicate
- Move
- Create Template
- Archive
- Delete

## Rich Text

Support:

- Bold
- Italic
- Underline
- Strikethrough
- Inline code
- Links
- Headings
- Lists
- Quotes
- Callouts
- Approved MJG text and highlight colors

Keep the editor controls clean and contextual. Do not build a large word-processing ribbon.

## Comments and Mentions

Allow comments on:

- Entire document
- Individual blocks
- Checklist items
- Tasks
- Table rows
- Images
- Files
- Linked MJG records

Support:

- Threaded replies
- Edit
- Delete
- Resolve
- Reopen
- Reactions
- `@mentions`
- Assign comment
- Direct link to block
- Unresolved comment filter

Use the existing MJG notification system.

Do not build another standalone chat feature. Integrate with Direct Messages when a separate conversation is needed.

## Tasks and Checklists

A document task must support:

- Title
- Description
- Assignee
- Due date and time
- Status
- Priority
- Reminder
- Related client
- Related plan
- Related booking
- Related project
- Comments
- Attachments

Statuses:

- Not Started
- In Progress
- Waiting
- Complete
- Canceled

Priorities:

- Low
- Normal
- High
- Urgent

Allow a Workspace task to synchronize with the existing MJG Project Manager or central task system.

Do not create duplicate unsynchronized task records.

## Simple Tables

Create a lightweight table block.

Support:

- Add and remove rows
- Add and remove columns
- Rename headers
- Text
- Number
- Date
- Status
- Checkbox
- Currency
- User
- Sort
- Filter
- Resize columns
- Row comments
- CSV export

Do not build formulas, macros, pivot tables, or advanced spreadsheet functions in the MVP.

## MJG Record Connections

Documents and blocks can connect to:

- Users
- Clients
- Staff
- Advisors
- Plans
- Programs
- Projects
- Tasks
- Bookings
- Events
- Community groups
- Blog posts
- Email templates
- SMS templates
- Forms
- Stewardship Blueprint submissions
- Assets

Create live summary cards for linked records.

Example client card:

- Client name
- Email
- Phone
- Assigned advisor
- Plan
- Blueprint status
- Next appointment
- Open tasks
- View Client button

Always enforce the permissions of the original MJG record. Sharing a document must not expose a restricted record to an unauthorized user.

## Templates

Create a template gallery containing:

- Client Meeting Notes
- Stewardship Blueprint Review
- New Client Onboarding
- Team Meeting Agenda
- Event Planning
- Content Planning
- Standard Operating Procedure

Super Admins can:

- Create templates
- Edit templates
- Duplicate templates
- Publish templates
- Archive templates

## Folders and Organization

Support:

- Personal folders
- Team folders
- Client folders
- Program folders
- Project folders
- Shared folders
- Archived folders
- Tags
- Favorites
- Recent documents
- Pinned documents

## Search

Search:

- Titles
- Document content
- Comments
- Tasks
- Tags
- Related records
- Attachment text when available

Filters:

- Owner
- Collaborator
- Folder
- Tag
- Related client
- Document type
- Created date
- Updated date
- Open tasks
- Unresolved comments
- Shared with me
- Archived

Search results must respect access permissions.

## Sharing and Permissions

Document visibility:

- Private
- Specific People
- Team
- Role
- Client and Assigned Team
- Organization

Disable public links for the MVP.

Document access:

- Owner
- Editor
- Commenter
- Viewer

### Super Admin

Can manage all documents, folders, templates, settings, audit activity, deleted content, and sharing policies.

### Admin

Can create and manage approved documents, folders, and templates based on permissions.

### Staff or Team Leader

Can create, edit, comment, assign tasks, and share within permitted teams.

### Client or Standard User

Can only access documents explicitly shared with them. They may view, comment, complete assigned items, or upload requested files when allowed.

Enforce authorization on the frontend, API, server actions, database queries, file storage, real-time channels, search, exports, and AI tools.

## Version History

Track:

- Document creation
- Title changes
- Content changes
- Blocks added, removed, and moved
- Comments
- Mentions
- Tasks
- Attachments
- Sharing changes
- Linked records
- Archives and restores

Allow authorized users to:

- Review versions
- See the editor and timestamp
- Restore a prior version
- Duplicate a prior version into a new document

For the MVP, use periodic content snapshots and detailed activity logs.

## Notifications

Notify users for:

- Document shared
- Mention
- Comment reply
- Assigned comment
- Task assigned
- Task due soon
- Task overdue
- Review requested
- Approval requested
- Important update

Use in-app notifications by default.

Optional email and SMS notifications must follow MJG communication preferences, consent, and opt-out settings.

Avoid sending notifications for every keystroke or small edit.

## AI Agent

Add an AI Assistant menu with:

- Summarize document
- Summarize recent changes
- Extract action items
- Convert action items to tasks
- Draft meeting agenda
- Draft follow-up email
- Rewrite selected text
- Improve clarity
- Shorten
- Expand
- Create checklist
- Organize notes
- Identify unresolved questions
- Suggest next steps
- Find related documents

AI changes must:

- Show a preview
- Require confirmation before replacing content
- Preserve the previous version
- Record the AI action in activity history
- Respect document and source-record permissions
- Never use documents the current user cannot access

## Suggested Routes

- `/workspace`
- `/workspace/documents`
- `/workspace/documents/new`
- `/workspace/documents/[documentId]`
- `/workspace/folders`
- `/workspace/folders/[folderId]`
- `/workspace/templates`
- `/workspace/templates/[templateId]`
- `/workspace/tasks`
- `/workspace/favorites`
- `/workspace/shared`
- `/workspace/archived`
- `/workspace/settings`

Adapt the route structure to the project's existing conventions.

## Suggested Data Entities

- `workspace_documents`
- `workspace_document_versions`
- `workspace_blocks`
- `workspace_folders`
- `workspace_folder_members`
- `workspace_collaborators`
- `workspace_comments`
- `workspace_comment_replies`
- `workspace_tasks`
- `workspace_tags`
- `workspace_document_tags`
- `workspace_record_links`
- `workspace_attachments`
- `workspace_templates`
- `workspace_notifications`
- `workspace_activity_logs`
- `workspace_presence`

Use the project's existing naming conventions and migration system.

Store structured block content and maintain a searchable plain-text representation.

## Reusable Components

Consider:

- `WorkspaceHome`
- `WorkspaceSidebar`
- `DocumentEditor`
- `DocumentToolbar`
- `DocumentOutline`
- `BlockInsertMenu`
- `EditorBlock`
- `CommentPanel`
- `CommentThread`
- `SharingDialog`
- `CollaboratorPicker`
- `RecordLinkPicker`
- `RecordPreviewCard`
- `WorkspaceTaskBlock`
- `SimpleTableBlock`
- `TemplateGallery`
- `VersionHistoryPanel`
- `ActivityPanel`
- `WorkspaceSearch`
- `WorkspaceAIAssistant`

Follow the existing MJG component architecture rather than forcing these exact names.

## MVP Deliverables

Build:

1. Workspace landing page
2. Document list
3. Folder support
4. Template gallery
5. Block editor
6. Autosave
7. Sharing and permissions
8. Comments and mentions
9. Tasks and checklists
10. Lightweight tables
11. MJG record links
12. Search
13. Favorites
14. Version history
15. Activity log
16. Notifications
17. Initial AI Agent actions
18. Responsive desktop, tablet, and mobile behavior

## Exclude from the MVP

Do not build:

- Full spreadsheet formulas
- Macros
- Pivot tables
- Slide presentations
- Standalone chat rooms
- Another direct-message system
- Video conferencing
- Whiteboarding
- Public wiki publishing
- Full offline sync
- External app marketplace
- Unrestricted public sharing

## Design Direction

Match the existing MJG dashboard.

Use:

- Current sidebar
- Current top navigation
- Current typography
- White and warm neutral backgrounds
- Black and charcoal text
- MJG gold and warm orange accents
- Light borders
- Rounded cards
- Existing buttons, dialogs, dropdowns, inputs, icons, tabs, drawers, and tooltips
- Existing light and dark mode behavior when available

The Workspace should look like a native MJG module, not an embedded third-party application.

## Acceptance Criteria

The feature is complete when an authorized user can:

1. Create a blank document.
2. Create from a template.
3. Add and reorder blocks.
4. Add text, lists, checklists, tasks, files, images, and tables.
5. Link a client or another MJG record.
6. Share with a staff member.
7. Share an approved document with a client.
8. Set viewer, commenter, and editor permissions.
9. Comment on a block.
10. Mention another user.
11. Resolve and reopen comments.
12. Assign a task.
13. See the task in the central task system.
14. Search for the document.
15. Organize it in a folder.
16. Favorite it.
17. Review its activity.
18. Restore a previous version.
19. Ask the AI Agent to summarize it.
20. Ask the AI Agent to extract tasks.
21. Archive and restore it.
22. Confirm that unauthorized users cannot access the document, attachment, linked record, search result, notification content, export, or AI context.

Start by auditing the MJG project and presenting the implementation plan before making major code changes.
```

---

# 27. Recommended Build Order

## Phase 1: Foundation

- Routes
- Navigation
- Database schema
- Permissions
- Workspace home
- Document CRUD
- Basic block editor
- Autosave

## Phase 2: Collaboration

- Sharing
- Collaborators
- Comments
- Mentions
- Notifications
- Activity log

## Phase 3: Action Management

- Checklists
- Tasks
- Due dates
- Assignments
- Project Manager synchronization

## Phase 4: MJG Connections

- Client links
- User links
- Plan links
- Booking links
- Event links
- Blueprint links
- Record preview cards

## Phase 5: Organization

- Folders
- Tags
- Favorites
- Search
- Templates
- Archive

## Phase 6: Intelligence and History

- Version history
- Restore
- AI summaries
- AI rewriting
- AI task extraction
- Related-document discovery

---

# 28. Final Recommendation

Build **MJG Workspace** as a collaborative document layer across the MJG platform.

Its most valuable differentiator should not be general word processing. Its value should come from connecting shared documents directly to MJG clients, plans, Stewardship Blueprint activity, bookings, events, projects, tasks, communications, and the MJG AI Agent.

The MVP should prioritize:

1. Living documents
2. Contextual comments
3. Assignable tasks
4. MJG record connections
5. Templates
6. Permissions
7. Search
8. Version history
9. AI assistance

This creates a useful Quip-inspired experience without introducing the cost, complexity, or duplication of a full productivity suite.
