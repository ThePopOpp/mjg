
20505ea2-2dee-4d86-b37c-39019ddf8dea.png
Write a description of Microsoft Planner. I'm going to build a feature just like this in a few of my web apps. I need a prompt and a .md file to add to my projects. 

Worked for 22s
Microsoft Planner Description
Microsoft Planner is a collaborative task and project-management platform within Microsoft 365. It allows individuals and teams to create plans, divide work into tasks and buckets, assign responsibilities, set priorities and deadlines, add checklists, attachments and conversations, and monitor progress through several visual views.

The current Planner experience supports Basic and Premium plans. Both plan types support Grid, Board and Charts views, filtering, grouping, plan duplication and task collaboration. Basic plans emphasize straightforward task management and scheduling, while Premium plans add structured project-management capabilities such as Timeline/Gantt charts, dependencies, milestones, custom fields, goals, sprints, workload management, critical path, task history and AI-assisted project management. 

The different views display the same underlying task information in formats suited to different workflows:

Grid: Structured table for scanning and editing task details.

Board: Kanban-style columns with draggable task cards.

Calendar: Tasks organized by start and due dates.

Charts: Visual reporting by status, priority, assignee and group.

Timeline: Premium Gantt-style scheduling with dependencies.

People: Premium workload and resource-allocation view.

Goals: Premium objectives connected to project tasks. 

The screenshot’s Create a plan experience is particularly useful for your web apps because it provides one entry point where users can:

Start with a Basic or Premium plan.

Search and browse categorized templates.

Switch between application, shared and user-created templates.

Preview a template before using it.

Create the selected plan through a clear contextual action button.

Starter Prompt
Review the existing application and build a reusable planner-style
project-management feature called "Plan Builder."

Read and follow:

docs/planner-feature-spec.md

The experience should be inspired by the workflow in the supplied
Microsoft Planner screenshot, but it must use our application's existing
design system, branding, icons, colors, components, authentication,
permissions and database conventions.

Begin by auditing the project and identifying:

- Existing dashboard routes
- Authentication and user roles
- Database structure
- Workspace, client and project relationships
- Existing tables, modals, drawers, forms and cards
- Existing subscription or feature-flag controls
- Existing notification and audit-log systems

Then build Phase 1:

1. Create a responsive "Create a plan" modal.
2. Add Basic Plan and Premium Plan selection cards.
3. Add searchable template-source tabs:
   - App Templates
   - Shared
   - Created by Me
4. Add categorized starter templates.
5. Show a live preview of the selected plan or template.
6. Add plan configuration for name, description, workspace, owner,
   members, visibility, dates, default view, color and icon.
7. Create plans, groups, template tasks, labels, members and audit-log
   records through safe server-side operations.
8. Add a Plans index page.
9. Add Grid and Board views using the same underlying task records.
10. Add task creation, editing, assignment, labels, priority, status,
    dates, notes, checklists and drag-and-drop movement.
11. Add searching, filtering, sorting and grouping.
12. Protect Premium features through the existing entitlement,
    subscription, role or feature-flag system.
13. Add authorization and row-level security.
14. Support desktop, tablet, mobile, light mode and dark mode.
15. Include loading, empty, error and permission-denied states.

Do not copy Microsoft logos, branded illustrations, proprietary icons,
exact colors or product names.

Before changing code, present:

- Your project audit
- Proposed architecture
- Database changes
- Routes and components to add
- Files to modify
- Assumptions or conflicts

Implement the feature in small, testable steps. After implementation,
run the available type checking, linting and tests, and accurately report
the results and any incomplete work.
Download
The complete file includes the product description, creation workflow, Basic and Premium capabilities, template system, Grid/Board/Calendar/Charts/Timeline views, task drawer, permissions, database model, component structure, routes, automation rules, AI Project Manager, implementation phases, acceptance criteria and the full coding-agent prompt.

 


Library
/
planner-feature-spec.md


# Planner-Style Project Management Feature

## Purpose

Build a reusable planning and project-management module inspired by the workflow and usability of Microsoft Planner, while using original branding, components, naming, and visual styling for each web app.

The module should let a user create a plan from scratch or from a template, organize work into tasks and groups, assign team members, track dates and progress, and switch between multiple views such as Grid, Board, Calendar, Charts, and Timeline.

This document is designed to be added directly to a project's `/docs` directory and used by Claude Code, Codex, or another coding agent.

---

## Product Description

Microsoft Planner is a collaborative task and project-management application within Microsoft 365. It combines lightweight task tracking with more structured project-planning tools.

Users create **plans**, add and assign **tasks**, organize tasks into **buckets or groups**, apply labels, set priorities and dates, add checklists and attachments, and monitor work through different visual views.

A planner-style module should provide one shared source of truth for:

- Personal tasks
- Team projects
- Client work
- Internal operations
- Campaigns
- Software development
- Construction projects
- Events
- Repeatable workflows
- AI-generated project plans

The experience should remain simple for basic users while allowing advanced project controls to be enabled only when needed.

---

## Feature Name

Use a project-specific name rather than copying the Microsoft Planner name.

Suggested names:

- Plans
- Project Planner
- Work Planner
- Project Plans
- Plan Builder
- Workflow Planner
- Task Planner
- Project Hub

Default implementation name in this document:

> **Plan Builder**

---

# 1. Primary User Experience

## 1.1 Create a Plan Modal

Create a large responsive modal or full-screen dialog based on the supplied reference screenshot.

### Desktop Layout

Use a two-column layout:

#### Left Panel

The left panel contains all plan-selection controls.

Include:

1. Modal title: `Create a plan`
2. Section: `Start from scratch`
3. Plan-type cards:
   - Basic Plan
   - Premium Plan
4. Section: `Choose a template`
5. Search field
6. Template-source tabs:
   - App Templates
   - Shared
   - Created by Me
7. Scrollable template list grouped by category
8. Selected-state styling
9. Optional template badges:
   - Basic
   - Premium
   - Shared
   - Recommended
   - New

#### Right Panel

The right panel previews the selected plan or template.

Include:

- Preview image or live miniature interface
- Template name
- Short description
- Included views
- Included default groups or phases
- Included task count
- Basic or Premium indicator
- Optional estimated setup time

#### Footer Actions

Keep the action buttons anchored at the bottom-right:

- Cancel
- Create Basic Plan
- Create Premium Plan
- Use Template

The primary button label must update dynamically based on the selected option.

### Tablet and Mobile Layout

On smaller screens:

- Stack the preview below the plan and template selector.
- Keep the footer actions sticky.
- Allow the template list to scroll independently.
- Use a drawer or full-screen sheet on mobile.
- Do not reduce touch targets below 44px.
- Collapse template metadata into expandable sections when necessary.

---

# 2. Plan Types

## 2.1 Basic Plan

A Basic Plan is intended for simple task management and team collaboration.

Include:

- Grid view
- Board view
- Calendar view
- Charts view
- Tasks
- Groups or buckets
- Assignees
- Start dates
- Due dates
- Priority
- Status
- Labels
- Notes
- Rich-text descriptions
- Checklists
- Attachments
- Links
- Comments
- Mentions
- Activity notifications
- Filters
- Grouping
- Sorting
- Search
- Duplicate plan
- Export plan
- Personal or shared visibility

## 2.2 Premium Plan

A Premium Plan includes everything in a Basic Plan plus advanced project-management features.

Include:

- Timeline or Gantt view
- Task dependencies
- Milestones
- Summary tasks
- Subtasks
- Custom fields
- Custom statuses
- Conditional task coloring
- Goals
- Goal-to-task relationships
- People or workload view
- Resource allocation
- Backlog
- Sprints
- Critical path
- Baseline dates
- Estimated effort
- Actual effort
- Task history
- Plan history
- Custom working calendar
- Portfolio support
- AI Project Manager
- Advanced reporting
- Automation rules

Plan type access should be controlled by subscription, role, feature flag, or organization settings.

---

# 3. Template Library

## 3.1 Template Sources

### App Templates

Templates maintained by the product owner or super administrator.

### Shared

Templates shared by another user, workspace, company, team, or department.

### Created by Me

Templates created and saved by the current user.

## 3.2 Suggested Template Categories

- Simple Plans
- Project Management
- Software Development
- Marketing
- Sales
- CRM
- Client Onboarding
- Construction
- Design
- Events
- Content Production
- Operations
- Hiring
- Product Launch
- Website Development
- Maintenance
- Custom

## 3.3 Suggested Starter Templates

### Simple Plan

Groups:

- To Do
- In Progress
- Waiting
- Completed

### Project Management

Groups:

- Discovery
- Planning
- Design
- Production
- Review
- Delivery
- Completed

### Software Development

Groups:

- Backlog
- Ready
- In Progress
- Code Review
- Testing
- Blocked
- Released

### Client Onboarding

Groups:

- New Client
- Information Needed
- Setup
- Internal Review
- Client Review
- Active

### Construction Project

Groups:

- Lead
- Pre-Construction
- Design
- Estimating
- Permitting
- Procurement
- Construction
- Punch List
- Closeout
- Warranty

### Marketing Campaign

Groups:

- Ideas
- Strategy
- Content
- Design
- Approval
- Scheduled
- Published
- Reporting

---

# 4. Plan Creation Flow

## Step 1: Open Plan Builder

The user selects:

- New Plan
- Create Plan
- Add Project
- Create from Template

## Step 2: Select Plan Type

The user chooses:

- Basic
- Premium
- A template

## Step 3: Configure the Plan

Open a second step or inline form with:

- Plan name
- Description
- Workspace
- Client
- Project
- Department
- Owner
- Members
- Visibility
- Start date
- Target completion date
- Color
- Icon
- Cover image
- Default view
- Tags
- Notification preferences

## Step 4: Review

Show a compact summary:

- Plan type
- Template
- Members
- Included task groups
- Included views
- Start and completion dates

## Step 5: Create

On creation:

1. Create the plan record.
2. Create default groups.
3. Create template tasks.
4. Create labels and custom fields.
5. Add the creator as owner.
6. Add selected members.
7. Write an audit-log entry.
8. Trigger notifications.
9. Redirect to the selected default view.

---

# 5. Plan Views

All views must use the same underlying task data.

## 5.1 Grid View

A structured table for fast editing.

Suggested columns:

- Task
- Status
- Group
- Assignee
- Priority
- Start Date
- Due Date
- Progress
- Labels
- Dependencies
- Estimated Effort
- Actual Effort
- Last Updated

Requirements:

- Inline editing
- Column resizing
- Column reordering
- Hide/show columns
- Saved column layouts
- Bulk selection
- Bulk editing
- Keyboard navigation
- CSV or Excel export

## 5.2 Board View

A Kanban-style view.

Allow grouping by:

- Group or bucket
- Status
- Assignee
- Priority
- Label
- Sprint
- Goal
- Client
- Project phase

Requirements:

- Drag-and-drop cards
- Drag between columns
- Reorder within columns
- Quick-add task
- Column task count
- Column progress
- Collapsible columns
- Swimlanes where enabled

## 5.3 Calendar View

Display tasks and milestones by date.

Include:

- Month
- Week
- Work week
- Day
- Agenda

Requirements:

- Drag to change dates
- Resize to change duration
- Filter by member, status, or plan
- Show unscheduled tasks
- Optional external calendar synchronization

## 5.4 Charts View

Include visual reporting for:

- Status
- Priority
- Group
- Assignee
- Label
- Overdue tasks
- Completed tasks
- Workload
- Planned versus actual progress

Charts should be interactive and act as filters when selected.

## 5.5 Timeline View

Premium feature.

Include:

- Gantt bars
- Milestones
- Dependencies
- Parent and child tasks
- Critical path
- Baseline comparison
- Drag-to-reschedule
- Resize duration
- Zoom by day, week, month, quarter, or year
- Today marker
- Collapsible task hierarchy

## 5.6 People View

Premium feature.

Display:

- Team members
- Assigned task count
- Active workload
- Estimated hours
- Overdue tasks
- Capacity
- Availability
- Underallocated and overallocated status

## 5.7 Goals View

Premium feature.

Allow users to:

- Create goals
- Add descriptions and owners
- Set target dates
- Link tasks to goals
- Track progress
- Mark goals as on track, at risk, or off track

---

# 6. Task Details

Open tasks in a side drawer, modal, or dedicated page.

## Required Task Fields

- Task title
- Description
- Plan
- Group
- Status
- Priority
- Progress percentage
- Start date
- Due date
- Duration
- Assignees
- Followers
- Labels
- Checklist
- Attachments
- Links
- Comments
- Mentions
- Dependencies
- Parent task
- Subtasks
- Milestone toggle
- Estimated effort
- Actual effort
- Custom fields
- Created by
- Created date
- Last updated by
- Last updated date

## Task Activity

Record:

- Status changes
- Assignment changes
- Date changes
- Comment activity
- Attachment activity
- Dependency changes
- Checklist changes
- Automation actions
- AI actions

---

# 7. Search, Filters, Grouping, and Sorting

## Global Search

Search across:

- Plan names
- Task names
- Descriptions
- Comments
- Members
- Clients
- Labels
- Attachments
- Custom fields

## Filters

Support:

- Assigned to
- Created by
- Status
- Priority
- Group
- Label
- Due date
- Start date
- Overdue
- Completed
- Client
- Project
- Department
- Sprint
- Goal
- Custom field values

## Saved Views

Users should be able to:

- Save the current filters
- Save grouping and sorting
- Save visible columns
- Name a custom view
- Keep a view private
- Share a view with the team
- Set a view as default

---

# 8. Collaboration

Include:

- Personal plans
- Shared plans
- Workspace plans
- Team plans
- Guest access
- Comments
- Threaded replies
- @mentions
- Reactions
- Task followers
- Notifications
- Email notifications
- In-app notifications
- Optional SMS notifications
- Optional AI-generated summaries

All collaboration actions should respect plan and task permissions.

---

# 9. Roles and Permissions

Suggested roles:

## Super Admin

- Full access to all plans and templates
- Manage feature flags
- Manage subscription-level access
- Manage global templates
- View all audit logs

## Workspace Admin

- Manage plans in the workspace
- Manage members
- Manage shared templates
- Configure plan defaults

## Plan Owner

- Edit plan settings
- Add or remove members
- Delete or archive the plan
- Manage automations
- Save the plan as a template

## Plan Member

- View the plan
- Create and edit tasks
- Comment
- Upload attachments
- Complete assigned work

## Guest

- Limited access to assigned or shared plans
- Permissions determined by the plan owner

## Viewer

- Read-only access

Use row-level security when Supabase is used.

---

# 10. Template Management

Users with permission can convert an existing plan into a reusable template.

A template may contain:

- Name
- Description
- Category
- Preview image
- Plan type
- Groups
- Tasks
- Task order
- Statuses
- Priorities
- Labels
- Checklists
- Relative dates
- Dependencies
- Custom fields
- Automation rules
- Default views

When a template is used:

- Do not copy comments.
- Do not copy completed history.
- Reset task status unless the template explicitly defines a starting status.
- Convert fixed dates into relative dates when configured.
- Prompt the user to map template roles to actual users.

---

# 11. Automation Rules

Allow users to create rules such as:

- When a task is assigned, notify the assignee.
- When a due date is approaching, send a reminder.
- When a task becomes overdue, notify the owner.
- When all checklist items are completed, mark the task complete.
- When a task moves to a group, update its status.
- When a task is completed, unlock the dependent task.
- When a milestone is completed, notify stakeholders.
- When a task is created from a form, assign it by category.
- When a plan reaches a specific status, create the next plan.
- When a client approves a task, advance the workflow.

Automation actions may include:

- Create task
- Update task
- Move task
- Assign user
- Add label
- Send email
- Send SMS
- Create notification
- Add comment
- Create calendar event
- Call webhook
- Trigger AI agent
- Trigger n8n workflow

---

# 12. AI Project Manager

The AI Project Manager should be optional and permission-aware.

## AI Capabilities

- Generate a plan from a natural-language request
- Recommend a template
- Break a goal into tasks
- Generate groups or project phases
- Suggest task owners
- Recommend start and due dates
- Identify missing dependencies
- Identify blockers
- Summarize plan progress
- Create weekly updates
- Draft client-facing status reports
- Detect overdue or at-risk work
- Recommend workload rebalancing
- Convert meeting notes into tasks
- Convert emails into tasks
- Answer questions about the plan
- Prepare the user for an upcoming project meeting

## AI Safety Requirements

- Never make destructive changes without confirmation.
- Show a preview before bulk-creating or bulk-updating tasks.
- Respect workspace and row-level permissions.
- Log AI-created and AI-modified records.
- Clearly identify AI-generated suggestions.
- Allow users to approve, reject, or edit suggestions.

---

# 13. Suggested Data Model

The final schema should follow the existing project conventions.

## Core Tables

### `plans`

- `id`
- `workspace_id`
- `client_id`
- `project_id`
- `name`
- `slug`
- `description`
- `plan_type`
- `visibility`
- `status`
- `owner_id`
- `default_view`
- `color`
- `icon`
- `cover_url`
- `start_date`
- `target_date`
- `template_id`
- `settings`
- `created_at`
- `updated_at`
- `archived_at`

### `plan_members`

- `id`
- `plan_id`
- `user_id`
- `role`
- `notification_settings`
- `created_at`

### `plan_groups`

- `id`
- `plan_id`
- `name`
- `description`
- `position`
- `color`
- `is_collapsed`
- `created_at`
- `updated_at`

### `tasks`

- `id`
- `plan_id`
- `group_id`
- `parent_task_id`
- `goal_id`
- `sprint_id`
- `title`
- `description`
- `status`
- `priority`
- `progress`
- `start_date`
- `due_date`
- `duration_minutes`
- `estimated_minutes`
- `actual_minutes`
- `is_milestone`
- `position`
- `created_by`
- `completed_by`
- `completed_at`
- `created_at`
- `updated_at`
- `archived_at`

### `task_assignees`

- `id`
- `task_id`
- `user_id`
- `assigned_by`
- `assigned_at`

### `task_labels`

- `id`
- `task_id`
- `label_id`

### `labels`

- `id`
- `plan_id`
- `name`
- `color`
- `position`

### `task_checklist_items`

- `id`
- `task_id`
- `title`
- `is_complete`
- `position`
- `completed_by`
- `completed_at`

### `task_dependencies`

- `id`
- `predecessor_task_id`
- `successor_task_id`
- `dependency_type`
- `lag_minutes`

Dependency types:

- `finish_to_start`
- `start_to_start`
- `finish_to_finish`
- `start_to_finish`

### `task_comments`

- `id`
- `task_id`
- `user_id`
- `parent_comment_id`
- `body`
- `created_at`
- `updated_at`
- `deleted_at`

### `task_attachments`

- `id`
- `task_id`
- `uploaded_by`
- `file_name`
- `file_url`
- `mime_type`
- `file_size`
- `created_at`

### `plan_templates`

- `id`
- `workspace_id`
- `created_by`
- `name`
- `description`
- `category`
- `plan_type`
- `visibility`
- `preview_url`
- `template_data`
- `is_system_template`
- `created_at`
- `updated_at`

### `plan_goals`

- `id`
- `plan_id`
- `title`
- `description`
- `owner_id`
- `status`
- `progress`
- `target_date`
- `created_at`
- `updated_at`

### `plan_sprints`

- `id`
- `plan_id`
- `name`
- `goal`
- `start_date`
- `end_date`
- `status`
- `position`

### `custom_fields`

- `id`
- `plan_id`
- `name`
- `field_type`
- `options`
- `is_required`
- `position`

### `task_custom_field_values`

- `id`
- `task_id`
- `custom_field_id`
- `value`

### `plan_activity`

- `id`
- `plan_id`
- `task_id`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `previous_value`
- `new_value`
- `metadata`
- `created_at`

### `plan_automations`

- `id`
- `plan_id`
- `name`
- `trigger_type`
- `trigger_config`
- `action_type`
- `action_config`
- `is_enabled`
- `created_by`
- `created_at`
- `updated_at`

---

# 14. Suggested Component Structure

```text
components/planner/
├── create-plan/
│   ├── create-plan-dialog.tsx
│   ├── plan-type-card.tsx
│   ├── template-search.tsx
│   ├── template-source-tabs.tsx
│   ├── template-category.tsx
│   ├── template-card.tsx
│   ├── template-preview.tsx
│   ├── plan-configuration-form.tsx
│   └── create-plan-footer.tsx
├── plan-shell/
│   ├── plan-header.tsx
│   ├── plan-navigation.tsx
│   ├── plan-filters.tsx
│   ├── plan-grouping.tsx
│   └── plan-actions-menu.tsx
├── views/
│   ├── grid-view.tsx
│   ├── board-view.tsx
│   ├── calendar-view.tsx
│   ├── charts-view.tsx
│   ├── timeline-view.tsx
│   ├── people-view.tsx
│   └── goals-view.tsx
├── tasks/
│   ├── task-card.tsx
│   ├── task-row.tsx
│   ├── task-detail-drawer.tsx
│   ├── task-form.tsx
│   ├── task-checklist.tsx
│   ├── task-comments.tsx
│   ├── task-attachments.tsx
│   ├── task-dependencies.tsx
│   └── task-activity.tsx
├── templates/
│   ├── template-library.tsx
│   ├── save-as-template-dialog.tsx
│   └── template-editor.tsx
├── ai/
│   ├── ai-project-manager-button.tsx
│   ├── ai-project-manager-panel.tsx
│   ├── ai-plan-preview.tsx
│   └── ai-action-approval.tsx
└── shared/
    ├── member-avatar-stack.tsx
    ├── priority-badge.tsx
    ├── status-badge.tsx
    ├── label-chip.tsx
    └── progress-indicator.tsx
```

---

# 15. Suggested Routes

```text
/plans
/plans/new
/plans/templates
/plans/templates/[templateId]
/plans/[planId]
/plans/[planId]/grid
/plans/[planId]/board
/plans/[planId]/calendar
/plans/[planId]/charts
/plans/[planId]/timeline
/plans/[planId]/people
/plans/[planId]/goals
/plans/[planId]/settings
```

Use the existing dashboard routing conventions when they differ from this example.

---

# 16. API and Server Actions

Suggested operations:

```text
createPlan
updatePlan
archivePlan
deletePlan
duplicatePlan
createPlanFromTemplate
savePlanAsTemplate
addPlanMember
removePlanMember
updatePlanMemberRole
createGroup
updateGroup
reorderGroups
deleteGroup
createTask
updateTask
moveTask
reorderTask
duplicateTask
archiveTask
deleteTask
assignTask
addTaskLabel
removeTaskLabel
addChecklistItem
updateChecklistItem
addTaskComment
addTaskAttachment
addTaskDependency
removeTaskDependency
createGoal
linkTaskToGoal
createSprint
moveTaskToSprint
createAutomation
runAutomation
generatePlanWithAI
summarizePlanWithAI
exportPlan
```

Use server-side authorization for every mutation.

---

# 17. Notifications

Trigger notifications for:

- Task assigned
- Task reassigned
- Mention
- Comment reply
- Due date approaching
- Task overdue
- Dependency unblocked
- Plan invitation
- Plan role changed
- Milestone completed
- Goal at risk
- Automation failure
- AI action awaiting approval

Notification channels may include:

- In-app
- Email
- SMS
- Push
- Slack
- Microsoft Teams
- Webhook

---

# 18. Audit Logging

Record all important changes.

Include:

- Actor
- Date and time
- Plan
- Task
- Action
- Previous value
- New value
- Source
- IP address when appropriate
- User agent when appropriate

Possible sources:

- User
- Admin
- Automation
- API
- Import
- AI agent

---

# 19. Accessibility

Requirements:

- Keyboard-accessible modal and menus
- Visible focus states
- Proper labels and descriptions
- Semantic headings
- Screen-reader announcements for drag-and-drop changes
- Non-color status indicators
- Sufficient contrast
- Reduced-motion support
- Accessible charts with text summaries
- Accessible timeline controls

---

# 20. Performance Requirements

- Paginate or virtualize large grids.
- Virtualize long Kanban columns.
- Use optimistic updates carefully.
- Keep filters in URL state when useful.
- Cache plan metadata.
- Lazy-load premium views.
- Debounce search.
- Upload attachments directly to approved storage.
- Use background jobs for exports, imports, AI generation, and large template creation.
- Prevent unnecessary real-time subscriptions.

---

# 21. Original Design Requirement

The feature may be inspired by Microsoft Planner's workflow, but it must not copy Microsoft branding or proprietary visual assets.

Do not copy:

- Microsoft logos
- Microsoft icons
- Microsoft product names
- Exact colors
- Exact illustrations
- Exact component dimensions
- Proprietary template artwork

Create an original interface using the project's existing:

- Design system
- Brand colors
- Typography
- Icons
- Card styles
- Button styles
- Spacing scale
- Light and dark themes

---

# 22. Implementation Phases

## Phase 1: Foundation

- Database schema
- Permissions
- Plans index
- Create Plan modal
- Basic Plan creation
- Template library
- Grid view
- Board view
- Task details
- Search and filters

## Phase 2: Collaboration

- Members
- Comments
- Mentions
- Attachments
- Notifications
- Activity history
- Saved views
- Duplicate plan
- Export

## Phase 3: Scheduling

- Calendar view
- Drag-to-reschedule
- Dependencies
- Timeline view
- Milestones
- Parent tasks and subtasks

## Phase 4: Advanced Planning

- Goals
- Sprints
- Workload view
- Custom fields
- Automations
- Critical path
- Portfolios

## Phase 5: AI

- Natural-language plan generation
- AI task generation
- Meeting-note conversion
- Progress summaries
- At-risk detection
- Workload suggestions
- Approval workflow
- AI audit logs

---

# 23. Acceptance Criteria

The feature is complete when:

- A user can create a Basic Plan from scratch.
- A user with permission can create a Premium Plan.
- A user can browse, search, preview, and select templates.
- The preview panel updates when a template is selected.
- The create button reflects the selected plan type or template.
- A created plan opens in its default view.
- Users can create, edit, assign, move, reorder, and complete tasks.
- Grid and Board views display the same task records.
- Filters and grouping work without modifying underlying data.
- Members only see plans permitted by their role.
- Plan creation and task changes are written to activity logs.
- The modal works on desktop, tablet, and mobile.
- The feature supports light and dark themes.
- The feature follows the existing project's design system.
- Premium features are protected by feature flags or subscription checks.
- AI actions require approval before destructive or bulk changes.

---

# 24. Claude Code / Codex Build Prompt

Copy and paste the following prompt into the coding agent after adding this file to the project.

```text
Review the existing application before writing code. Locate and follow the current architecture, routing, authentication, database, permissions, styling, component, form, modal, table, notification, and testing conventions.

Read this file in full:

[INSERT PATH]/planner-feature-spec.md

Build a reusable planner-style project-management module called "Plan Builder." The module should be inspired by the workflow shown in the supplied Microsoft Planner reference screenshot, but it must use our existing design system, original branding, original icons, and original styling.

Start with Phase 1 only unless the project already contains supporting components that make later phases safe to include.

Phase 1 requirements:

1. Add a responsive "Create a plan" modal or full-screen dialog.
2. Use a two-column desktop layout:
   - Left: Basic Plan, Premium Plan, template search, template-source tabs, and a scrollable categorized template list.
   - Right: a preview of the selected plan or template with name, description, included views, groups, and task count.
3. Add responsive tablet and mobile behavior with stacked content and sticky actions.
4. Add Basic and Premium plan-type cards.
5. Add template-source tabs:
   - App Templates
   - Shared
   - Created by Me
6. Add starter templates:
   - Simple Plan
   - Project Management
   - Software Development
   - Client Onboarding
   - Construction Project
   - Marketing Campaign
7. Add plan configuration fields:
   - Name
   - Description
   - Workspace
   - Owner
   - Members
   - Visibility
   - Start date
   - Target date
   - Default view
   - Color
   - Icon
8. Create the required database migrations using the project's existing database conventions.
9. Add row-level security or equivalent server-side authorization.
10. Create the plan, default groups, template tasks, labels, members, and activity-log entry in one safe transaction where supported.
11. Add a Plans index page.
12. Add Grid and Board views using the same task records.
13. Add task creation, editing, assignment, status, priority, dates, labels, checklist, notes, and drag-and-drop movement.
14. Add search, filters, grouping, and sorting.
15. Add plan and task activity logging.
16. Protect Premium Plan creation with the project's existing entitlement, role, subscription, or feature-flag system. When no system exists, create a clean feature-flag abstraction without hard-coding billing logic.
17. Use existing reusable components before adding new ones.
18. Do not introduce a second design system.
19. Do not copy Microsoft logos, illustrations, icons, exact colors, or branded product names.
20. Ensure accessibility, keyboard support, loading states, empty states, error states, and responsive behavior.

Before implementation, provide:

- A concise audit of the current project
- The files and routes you plan to add or modify
- The proposed database changes
- Any assumptions
- Any conflicts with the existing architecture

Then implement the feature in small, testable steps.

After implementation:

- Run type checking
- Run linting
- Run existing tests
- Add focused tests for plan creation, permissions, template creation, Grid/Board data consistency, and task movement
- Report all files changed
- Report any incomplete items
- Do not claim success for checks that were not actually run
```

---

# 25. Optional Project-Specific Additions

Depending on the web app, connect plans to:

- Clients
- Leads
- Opportunities
- Deals
- Contacts
- Vendors
- Subcontractors
- Projects
- Quotes
- Contracts
- Invoices
- Appointments
- Events
- Forms
- Support tickets
- Files
- Messages
- CRM records
- AI-agent memory

Keep these relationships optional so the planner module remains reusable across multiple applications.
Library
/
planner-feature-spec.md


# Planner-Style Project Management Feature

## Purpose

Build a reusable planning and project-management module inspired by the workflow and usability of Microsoft Planner, while using original branding, components, naming, and visual styling for each web app.

The module should let a user create a plan from scratch or from a template, organize work into tasks and groups, assign team members, track dates and progress, and switch between multiple views such as Grid, Board, Calendar, Charts, and Timeline.

This document is designed to be added directly to a project's `/docs` directory and used by Claude Code, Codex, or another coding agent.

---

## Product Description

Microsoft Planner is a collaborative task and project-management application within Microsoft 365. It combines lightweight task tracking with more structured project-planning tools.

Users create **plans**, add and assign **tasks**, organize tasks into **buckets or groups**, apply labels, set priorities and dates, add checklists and attachments, and monitor work through different visual views.

A planner-style module should provide one shared source of truth for:

- Personal tasks
- Team projects
- Client work
- Internal operations
- Campaigns
- Software development
- Construction projects
- Events
- Repeatable workflows
- AI-generated project plans

The experience should remain simple for basic users while allowing advanced project controls to be enabled only when needed.

---

## Feature Name

Use a project-specific name rather than copying the Microsoft Planner name.

Suggested names:

- Plans
- Project Planner
- Work Planner
- Project Plans
- Plan Builder
- Workflow Planner
- Task Planner
- Project Hub

Default implementation name in this document:

> **Plan Builder**

---

# 1. Primary User Experience

## 1.1 Create a Plan Modal

Create a large responsive modal or full-screen dialog based on the supplied reference screenshot.

### Desktop Layout

Use a two-column layout:

#### Left Panel

The left panel contains all plan-selection controls.

Include:

1. Modal title: `Create a plan`
2. Section: `Start from scratch`
3. Plan-type cards:
   - Basic Plan
   - Premium Plan
4. Section: `Choose a template`
5. Search field
6. Template-source tabs:
   - App Templates
   - Shared
   - Created by Me
7. Scrollable template list grouped by category
8. Selected-state styling
9. Optional template badges:
   - Basic
   - Premium
   - Shared
   - Recommended
   - New

#### Right Panel

The right panel previews the selected plan or template.

Include:

- Preview image or live miniature interface
- Template name
- Short description
- Included views
- Included default groups or phases
- Included task count
- Basic or Premium indicator
- Optional estimated setup time

#### Footer Actions

Keep the action buttons anchored at the bottom-right:

- Cancel
- Create Basic Plan
- Create Premium Plan
- Use Template

The primary button label must update dynamically based on the selected option.

### Tablet and Mobile Layout

On smaller screens:

- Stack the preview below the plan and template selector.
- Keep the footer actions sticky.
- Allow the template list to scroll independently.
- Use a drawer or full-screen sheet on mobile.
- Do not reduce touch targets below 44px.
- Collapse template metadata into expandable sections when necessary.

---

# 2. Plan Types

## 2.1 Basic Plan

A Basic Plan is intended for simple task management and team collaboration.

Include:

- Grid view
- Board view
- Calendar view
- Charts view
- Tasks
- Groups or buckets
- Assignees
- Start dates
- Due dates
- Priority
- Status
- Labels
- Notes
- Rich-text descriptions
- Checklists
- Attachments
- Links
- Comments
- Mentions
- Activity notifications
- Filters
- Grouping
- Sorting
- Search
- Duplicate plan
- Export plan
- Personal or shared visibility

## 2.2 Premium Plan

A Premium Plan includes everything in a Basic Plan plus advanced project-management features.

Include:

- Timeline or Gantt view
- Task dependencies
- Milestones
- Summary tasks
- Subtasks
- Custom fields
- Custom statuses
- Conditional task coloring
- Goals
- Goal-to-task relationships
- People or workload view
- Resource allocation
- Backlog
- Sprints
- Critical path
- Baseline dates
- Estimated effort
- Actual effort
- Task history
- Plan history
- Custom working calendar
- Portfolio support
- AI Project Manager
- Advanced reporting
- Automation rules

Plan type access should be controlled by subscription, role, feature flag, or organization settings.

---

# 3. Template Library

## 3.1 Template Sources

### App Templates

Templates maintained by the product owner or super administrator.

### Shared

Templates shared by another user, workspace, company, team, or department.

### Created by Me

Templates created and saved by the current user.

## 3.2 Suggested Template Categories

- Simple Plans
- Project Management
- Software Development
- Marketing
- Sales
- CRM
- Client Onboarding
- Construction
- Design
- Events
- Content Production
- Operations
- Hiring
- Product Launch
- Website Development
- Maintenance
- Custom

## 3.3 Suggested Starter Templates

### Simple Plan

Groups:

- To Do
- In Progress
- Waiting
- Completed

### Project Management

Groups:

- Discovery
- Planning
- Design
- Production
- Review
- Delivery
- Completed

### Software Development

Groups:

- Backlog
- Ready
- In Progress
- Code Review
- Testing
- Blocked
- Released

### Client Onboarding

Groups:

- New Client
- Information Needed
- Setup
- Internal Review
- Client Review
- Active

### Construction Project

Groups:

- Lead
- Pre-Construction
- Design
- Estimating
- Permitting
- Procurement
- Construction
- Punch List
- Closeout
- Warranty

### Marketing Campaign

Groups:

- Ideas
- Strategy
- Content
- Design
- Approval
- Scheduled
- Published
- Reporting

---

# 4. Plan Creation Flow

## Step 1: Open Plan Builder

The user selects:

- New Plan
- Create Plan
- Add Project
- Create from Template

## Step 2: Select Plan Type

The user chooses:

- Basic
- Premium
- A template

## Step 3: Configure the Plan

Open a second step or inline form with:

- Plan name
- Description
- Workspace
- Client
- Project
- Department
- Owner
- Members
- Visibility
- Start date
- Target completion date
- Color
- Icon
- Cover image
- Default view
- Tags
- Notification preferences

## Step 4: Review

Show a compact summary:

- Plan type
- Template
- Members
- Included task groups
- Included views
- Start and completion dates

## Step 5: Create

On creation:

1. Create the plan record.
2. Create default groups.
3. Create template tasks.
4. Create labels and custom fields.
5. Add the creator as owner.
6. Add selected members.
7. Write an audit-log entry.
8. Trigger notifications.
9. Redirect to the selected default view.

---

# 5. Plan Views

All views must use the same underlying task data.

## 5.1 Grid View

A structured table for fast editing.

Suggested columns:

- Task
- Status
- Group
- Assignee
- Priority
- Start Date
- Due Date
- Progress
- Labels
- Dependencies
- Estimated Effort
- Actual Effort
- Last Updated

Requirements:

- Inline editing
- Column resizing
- Column reordering
- Hide/show columns
- Saved column layouts
- Bulk selection
- Bulk editing
- Keyboard navigation
- CSV or Excel export

## 5.2 Board View

A Kanban-style view.

Allow grouping by:

- Group or bucket
- Status
- Assignee
- Priority
- Label
- Sprint
- Goal
- Client
- Project phase

Requirements:

- Drag-and-drop cards
- Drag between columns
- Reorder within columns
- Quick-add task
- Column task count
- Column progress
- Collapsible columns
- Swimlanes where enabled

## 5.3 Calendar View

Display tasks and milestones by date.

Include:

- Month
- Week
- Work week
- Day
- Agenda

Requirements:

- Drag to change dates
- Resize to change duration
- Filter by member, status, or plan
- Show unscheduled tasks
- Optional external calendar synchronization

## 5.4 Charts View

Include visual reporting for:

- Status
- Priority
- Group
- Assignee
- Label
- Overdue tasks
- Completed tasks
- Workload
- Planned versus actual progress

Charts should be interactive and act as filters when selected.

## 5.5 Timeline View

Premium feature.

Include:

- Gantt bars
- Milestones
- Dependencies
- Parent and child tasks
- Critical path
- Baseline comparison
- Drag-to-reschedule
- Resize duration
- Zoom by day, week, month, quarter, or year
- Today marker
- Collapsible task hierarchy

## 5.6 People View

Premium feature.

Display:

- Team members
- Assigned task count
- Active workload
- Estimated hours
- Overdue tasks
- Capacity
- Availability
- Underallocated and overallocated status

## 5.7 Goals View

Premium feature.

Allow users to:

- Create goals
- Add descriptions and owners
- Set target dates
- Link tasks to goals
- Track progress
- Mark goals as on track, at risk, or off track

---

# 6. Task Details

Open tasks in a side drawer, modal, or dedicated page.

## Required Task Fields

- Task title
- Description
- Plan
- Group
- Status
- Priority
- Progress percentage
- Start date
- Due date
- Duration
- Assignees
- Followers
- Labels
- Checklist
- Attachments
- Links
- Comments
- Mentions
- Dependencies
- Parent task
- Subtasks
- Milestone toggle
- Estimated effort
- Actual effort
- Custom fields
- Created by
- Created date
- Last updated by
- Last updated date

## Task Activity

Record:

- Status changes
- Assignment changes
- Date changes
- Comment activity
- Attachment activity
- Dependency changes
- Checklist changes
- Automation actions
- AI actions

---

# 7. Search, Filters, Grouping, and Sorting

## Global Search

Search across:

- Plan names
- Task names
- Descriptions
- Comments
- Members
- Clients
- Labels
- Attachments
- Custom fields

## Filters

Support:

- Assigned to
- Created by
- Status
- Priority
- Group
- Label
- Due date
- Start date
- Overdue
- Completed
- Client
- Project
- Department
- Sprint
- Goal
- Custom field values

## Saved Views

Users should be able to:

- Save the current filters
- Save grouping and sorting
- Save visible columns
- Name a custom view
- Keep a view private
- Share a view with the team
- Set a view as default

---

# 8. Collaboration

Include:

- Personal plans
- Shared plans
- Workspace plans
- Team plans
- Guest access
- Comments
- Threaded replies
- @mentions
- Reactions
- Task followers
- Notifications
- Email notifications
- In-app notifications
- Optional SMS notifications
- Optional AI-generated summaries

All collaboration actions should respect plan and task permissions.

---

# 9. Roles and Permissions

Suggested roles:

## Super Admin

- Full access to all plans and templates
- Manage feature flags
- Manage subscription-level access
- Manage global templates
- View all audit logs

## Workspace Admin

- Manage plans in the workspace
- Manage members
- Manage shared templates
- Configure plan defaults

## Plan Owner

- Edit plan settings
- Add or remove members
- Delete or archive the plan
- Manage automations
- Save the plan as a template

## Plan Member

- View the plan
- Create and edit tasks
- Comment
- Upload attachments
- Complete assigned work

## Guest

- Limited access to assigned or shared plans
- Permissions determined by the plan owner

## Viewer

- Read-only access

Use row-level security when Supabase is used.

---

# 10. Template Management

Users with permission can convert an existing plan into a reusable template.

A template may contain:

- Name
- Description
- Category
- Preview image
- Plan type
- Groups
- Tasks
- Task order
- Statuses
- Priorities
- Labels
- Checklists
- Relative dates
- Dependencies
- Custom fields
- Automation rules
- Default views

When a template is used:

- Do not copy comments.
- Do not copy completed history.
- Reset task status unless the template explicitly defines a starting status.
- Convert fixed dates into relative dates when configured.
- Prompt the user to map template roles to actual users.

---

# 11. Automation Rules

Allow users to create rules such as:

- When a task is assigned, notify the assignee.
- When a due date is approaching, send a reminder.
- When a task becomes overdue, notify the owner.
- When all checklist items are completed, mark the task complete.
- When a task moves to a group, update its status.
- When a task is completed, unlock the dependent task.
- When a milestone is completed, notify stakeholders.
- When a task is created from a form, assign it by category.
- When a plan reaches a specific status, create the next plan.
- When a client approves a task, advance the workflow.

Automation actions may include:

- Create task
- Update task
- Move task
- Assign user
- Add label
- Send email
- Send SMS
- Create notification
- Add comment
- Create calendar event
- Call webhook
- Trigger AI agent
- Trigger n8n workflow

---

# 12. AI Project Manager

The AI Project Manager should be optional and permission-aware.

## AI Capabilities

- Generate a plan from a natural-language request
- Recommend a template
- Break a goal into tasks
- Generate groups or project phases
- Suggest task owners
- Recommend start and due dates
- Identify missing dependencies
- Identify blockers
- Summarize plan progress
- Create weekly updates
- Draft client-facing status reports
- Detect overdue or at-risk work
- Recommend workload rebalancing
- Convert meeting notes into tasks
- Convert emails into tasks
- Answer questions about the plan
- Prepare the user for an upcoming project meeting

## AI Safety Requirements

- Never make destructive changes without confirmation.
- Show a preview before bulk-creating or bulk-updating tasks.
- Respect workspace and row-level permissions.
- Log AI-created and AI-modified records.
- Clearly identify AI-generated suggestions.
- Allow users to approve, reject, or edit suggestions.

---

# 13. Suggested Data Model

The final schema should follow the existing project conventions.

## Core Tables

### `plans`

- `id`
- `workspace_id`
- `client_id`
- `project_id`
- `name`
- `slug`
- `description`
- `plan_type`
- `visibility`
- `status`
- `owner_id`
- `default_view`
- `color`
- `icon`
- `cover_url`
- `start_date`
- `target_date`
- `template_id`
- `settings`
- `created_at`
- `updated_at`
- `archived_at`

### `plan_members`

- `id`
- `plan_id`
- `user_id`
- `role`
- `notification_settings`
- `created_at`

### `plan_groups`

- `id`
- `plan_id`
- `name`
- `description`
- `position`
- `color`
- `is_collapsed`
- `created_at`
- `updated_at`

### `tasks`

- `id`
- `plan_id`
- `group_id`
- `parent_task_id`
- `goal_id`
- `sprint_id`
- `title`
- `description`
- `status`
- `priority`
- `progress`
- `start_date`
- `due_date`
- `duration_minutes`
- `estimated_minutes`
- `actual_minutes`
- `is_milestone`
- `position`
- `created_by`
- `completed_by`
- `completed_at`
- `created_at`
- `updated_at`
- `archived_at`

### `task_assignees`

- `id`
- `task_id`
- `user_id`
- `assigned_by`
- `assigned_at`

### `task_labels`

- `id`
- `task_id`
- `label_id`

### `labels`

- `id`
- `plan_id`
- `name`
- `color`
- `position`

### `task_checklist_items`

- `id`
- `task_id`
- `title`
- `is_complete`
- `position`
- `completed_by`
- `completed_at`

### `task_dependencies`

- `id`
- `predecessor_task_id`
- `successor_task_id`
- `dependency_type`
- `lag_minutes`

Dependency types:

- `finish_to_start`
- `start_to_start`
- `finish_to_finish`
- `start_to_finish`

### `task_comments`

- `id`
- `task_id`
- `user_id`
- `parent_comment_id`
- `body`
- `created_at`
- `updated_at`
- `deleted_at`

### `task_attachments`

- `id`
- `task_id`
- `uploaded_by`
- `file_name`
- `file_url`
- `mime_type`
- `file_size`
- `created_at`

### `plan_templates`

- `id`
- `workspace_id`
- `created_by`
- `name`
- `description`
- `category`
- `plan_type`
- `visibility`
- `preview_url`
- `template_data`
- `is_system_template`
- `created_at`
- `updated_at`

### `plan_goals`

- `id`
- `plan_id`
- `title`
- `description`
- `owner_id`
- `status`
- `progress`
- `target_date`
- `created_at`
- `updated_at`

### `plan_sprints`

- `id`
- `plan_id`
- `name`
- `goal`
- `start_date`
- `end_date`
- `status`
- `position`

### `custom_fields`

- `id`
- `plan_id`
- `name`
- `field_type`
- `options`
- `is_required`
- `position`

### `task_custom_field_values`

- `id`
- `task_id`
- `custom_field_id`
- `value`

### `plan_activity`

- `id`
- `plan_id`
- `task_id`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `previous_value`
- `new_value`
- `metadata`
- `created_at`

### `plan_automations`

- `id`
- `plan_id`
- `name`
- `trigger_type`
- `trigger_config`
- `action_type`
- `action_config`
- `is_enabled`
- `created_by`
- `created_at`
- `updated_at`

---

# 14. Suggested Component Structure

```text
components/planner/
├── create-plan/
│   ├── create-plan-dialog.tsx
│   ├── plan-type-card.tsx
│   ├── template-search.tsx
│   ├── template-source-tabs.tsx
│   ├── template-category.tsx
│   ├── template-card.tsx
│   ├── template-preview.tsx
│   ├── plan-configuration-form.tsx
│   └── create-plan-footer.tsx
├── plan-shell/
│   ├── plan-header.tsx
│   ├── plan-navigation.tsx
│   ├── plan-filters.tsx
│   ├── plan-grouping.tsx
│   └── plan-actions-menu.tsx
├── views/
│   ├── grid-view.tsx
│   ├── board-view.tsx
│   ├── calendar-view.tsx
│   ├── charts-view.tsx
│   ├── timeline-view.tsx
│   ├── people-view.tsx
│   └── goals-view.tsx
├── tasks/
│   ├── task-card.tsx
│   ├── task-row.tsx
│   ├── task-detail-drawer.tsx
│   ├── task-form.tsx
│   ├── task-checklist.tsx
│   ├── task-comments.tsx
│   ├── task-attachments.tsx
│   ├── task-dependencies.tsx
│   └── task-activity.tsx
├── templates/
│   ├── template-library.tsx
│   ├── save-as-template-dialog.tsx
│   └── template-editor.tsx
├── ai/
│   ├── ai-project-manager-button.tsx
│   ├── ai-project-manager-panel.tsx
│   ├── ai-plan-preview.tsx
│   └── ai-action-approval.tsx
└── shared/
    ├── member-avatar-stack.tsx
    ├── priority-badge.tsx
    ├── status-badge.tsx
    ├── label-chip.tsx
    └── progress-indicator.tsx
```

---

# 15. Suggested Routes

```text
/plans
/plans/new
/plans/templates
/plans/templates/[templateId]
/plans/[planId]
/plans/[planId]/grid
/plans/[planId]/board
/plans/[planId]/calendar
/plans/[planId]/charts
/plans/[planId]/timeline
/plans/[planId]/people
/plans/[planId]/goals
/plans/[planId]/settings
```

Use the existing dashboard routing conventions when they differ from this example.

---

# 16. API and Server Actions

Suggested operations:

```text
createPlan
updatePlan
archivePlan
deletePlan
duplicatePlan
createPlanFromTemplate
savePlanAsTemplate
addPlanMember
removePlanMember
updatePlanMemberRole
createGroup
updateGroup
reorderGroups
deleteGroup
createTask
updateTask
moveTask
reorderTask
duplicateTask
archiveTask
deleteTask
assignTask
addTaskLabel
removeTaskLabel
addChecklistItem
updateChecklistItem
addTaskComment
addTaskAttachment
addTaskDependency
removeTaskDependency
createGoal
linkTaskToGoal
createSprint
moveTaskToSprint
createAutomation
runAutomation
generatePlanWithAI
summarizePlanWithAI
exportPlan
```

Use server-side authorization for every mutation.

---

# 17. Notifications

Trigger notifications for:

- Task assigned
- Task reassigned
- Mention
- Comment reply
- Due date approaching
- Task overdue
- Dependency unblocked
- Plan invitation
- Plan role changed
- Milestone completed
- Goal at risk
- Automation failure
- AI action awaiting approval

Notification channels may include:

- In-app
- Email
- SMS
- Push
- Slack
- Microsoft Teams
- Webhook

---

# 18. Audit Logging

Record all important changes.

Include:

- Actor
- Date and time
- Plan
- Task
- Action
- Previous value
- New value
- Source
- IP address when appropriate
- User agent when appropriate

Possible sources:

- User
- Admin
- Automation
- API
- Import
- AI agent

---

# 19. Accessibility

Requirements:

- Keyboard-accessible modal and menus
- Visible focus states
- Proper labels and descriptions
- Semantic headings
- Screen-reader announcements for drag-and-drop changes
- Non-color status indicators
- Sufficient contrast
- Reduced-motion support
- Accessible charts with text summaries
- Accessible timeline controls

---

# 20. Performance Requirements

- Paginate or virtualize large grids.
- Virtualize long Kanban columns.
- Use optimistic updates carefully.
- Keep filters in URL state when useful.
- Cache plan metadata.
- Lazy-load premium views.
- Debounce search.
- Upload attachments directly to approved storage.
- Use background jobs for exports, imports, AI generation, and large template creation.
- Prevent unnecessary real-time subscriptions.

---

# 21. Original Design Requirement

The feature may be inspired by Microsoft Planner's workflow, but it must not copy Microsoft branding or proprietary visual assets.

Do not copy:

- Microsoft logos
- Microsoft icons
- Microsoft product names
- Exact colors
- Exact illustrations
- Exact component dimensions
- Proprietary template artwork

Create an original interface using the project's existing:

- Design system
- Brand colors
- Typography
- Icons
- Card styles
- Button styles
- Spacing scale
- Light and dark themes

---

# 22. Implementation Phases

## Phase 1: Foundation

- Database schema
- Permissions
- Plans index
- Create Plan modal
- Basic Plan creation
- Template library
- Grid view
- Board view
- Task details
- Search and filters

## Phase 2: Collaboration

- Members
- Comments
- Mentions
- Attachments
- Notifications
- Activity history
- Saved views
- Duplicate plan
- Export

## Phase 3: Scheduling

- Calendar view
- Drag-to-reschedule
- Dependencies
- Timeline view
- Milestones
- Parent tasks and subtasks

## Phase 4: Advanced Planning

- Goals
- Sprints
- Workload view
- Custom fields
- Automations
- Critical path
- Portfolios

## Phase 5: AI

- Natural-language plan generation
- AI task generation
- Meeting-note conversion
- Progress summaries
- At-risk detection
- Workload suggestions
- Approval workflow
- AI audit logs

---

# 23. Acceptance Criteria

The feature is complete when:

- A user can create a Basic Plan from scratch.
- A user with permission can create a Premium Plan.
- A user can browse, search, preview, and select templates.
- The preview panel updates when a template is selected.
- The create button reflects the selected plan type or template.
- A created plan opens in its default view.
- Users can create, edit, assign, move, reorder, and complete tasks.
- Grid and Board views display the same task records.
- Filters and grouping work without modifying underlying data.
- Members only see plans permitted by their role.
- Plan creation and task changes are written to activity logs.
- The modal works on desktop, tablet, and mobile.
- The feature supports light and dark themes.
- The feature follows the existing project's design system.
- Premium features are protected by feature flags or subscription checks.
- AI actions require approval before destructive or bulk changes.

---

# 24. Claude Code / Codex Build Prompt

Copy and paste the following prompt into the coding agent after adding this file to the project.

```text
Review the existing application before writing code. Locate and follow the current architecture, routing, authentication, database, permissions, styling, component, form, modal, table, notification, and testing conventions.

Read this file in full:

[INSERT PATH]/planner-feature-spec.md

Build a reusable planner-style project-management module called "Plan Builder." The module should be inspired by the workflow shown in the supplied Microsoft Planner reference screenshot, but it must use our existing design system, original branding, original icons, and original styling.

Start with Phase 1 only unless the project already contains supporting components that make later phases safe to include.

Phase 1 requirements:

1. Add a responsive "Create a plan" modal or full-screen dialog.
2. Use a two-column desktop layout:
   - Left: Basic Plan, Premium Plan, template search, template-source tabs, and a scrollable categorized template list.
   - Right: a preview of the selected plan or template with name, description, included views, groups, and task count.
3. Add responsive tablet and mobile behavior with stacked content and sticky actions.
4. Add Basic and Premium plan-type cards.
5. Add template-source tabs:
   - App Templates
   - Shared
   - Created by Me
6. Add starter templates:
   - Simple Plan
   - Project Management
   - Software Development
   - Client Onboarding
   - Construction Project
   - Marketing Campaign
7. Add plan configuration fields:
   - Name
   - Description
   - Workspace
   - Owner
   - Members
   - Visibility
   - Start date
   - Target date
   - Default view
   - Color
   - Icon
8. Create the required database migrations using the project's existing database conventions.
9. Add row-level security or equivalent server-side authorization.
10. Create the plan, default groups, template tasks, labels, members, and activity-log entry in one safe transaction where supported.
11. Add a Plans index page.
12. Add Grid and Board views using the same task records.
13. Add task creation, editing, assignment, status, priority, dates, labels, checklist, notes, and drag-and-drop movement.
14. Add search, filters, grouping, and sorting.
15. Add plan and task activity logging.
16. Protect Premium Plan creation with the project's existing entitlement, role, subscription, or feature-flag system. When no system exists, create a clean feature-flag abstraction without hard-coding billing logic.
17. Use existing reusable components before adding new ones.
18. Do not introduce a second design system.
19. Do not copy Microsoft logos, illustrations, icons, exact colors, or branded product names.
20. Ensure accessibility, keyboard support, loading states, empty states, error states, and responsive behavior.

Before implementation, provide:

- A concise audit of the current project
- The files and routes you plan to add or modify
- The proposed database changes
- Any assumptions
- Any conflicts with the existing architecture

Then implement the feature in small, testable steps.

After implementation:

- Run type checking
- Run linting
- Run existing tests
- Add focused tests for plan creation, permissions, template creation, Grid/Board data consistency, and task movement
- Report all files changed
- Report any incomplete items
- Do not claim success for checks that were not actually run
```

---

# 25. Optional Project-Specific Additions

Depending on the web app, connect plans to:

- Clients
- Leads
- Opportunities
- Deals
- Contacts
- Vendors
- Subcontractors
- Projects
- Quotes
- Contracts
- Invoices
- Appointments
- Events
- Forms
- Support tickets
- Files
- Messages
- CRM records
- AI-agent memory

Keep these relationships optional so the planner module remains reusable across multiple applications.