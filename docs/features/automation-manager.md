# Build the MJG Automation Manager

Create a new visual Automation Manager inside the Michael J. Gauthier (MJG) web app.

The Automation Manager should use the same design language, layout patterns, spacing, controls, and overall user experience as the existing MJG Email Template Builder shown in the reference screenshot.

The goal is to create a lightweight visual workflow builder inspired by n8n, Zapier, and FluentCRM Automations, but significantly smaller, simpler, and specifically aligned with the MJG web app.

Do not attempt to reproduce every n8n feature. Focus on an intuitive MJG-specific automation system that Super Admins and authorized staff can use without technical knowledge.

---

# Primary Objective

Allow an administrator to visually create automations by:

1. Selecting triggers, conditions, timing controls, and actions.
2. Dragging blocks onto a visual canvas.
3. Connecting blocks to define the automation flow.
4. Clicking a block to configure its settings.
5. Testing the automation before activating it.
6. Saving the automation as a draft or activating it.
7. Reviewing execution history, errors, and completed automation runs.

The system must dynamically connect to existing MJG features, including:

- User Management
- MJG Email Template Builder
- SMS messaging
- In-app notifications
- Direct messages
- Stewardship Blueprint forms
- Bookings and events
- Community
- Plans and programs
- User roles
- Assigned staff or advisors
- Tasks and project-related records
- Contact tags and custom fields

---

# Navigation

Add a new navigation item named:

**Automations**

Place it under the existing **Communications** navigation group.

Suggested Communications order:

- Emails
- Direct Messages
- SMS
- Dialer
- Social Media
- Automations
- Business Cards

The Automations section should include:

- All Automations
- Active
- Drafts
- Paused
- Templates
- Execution History
- Failed Runs
- Settings

---

# Automation Manager Layout

Use a three-column layout that closely matches the MJG Email Template Builder.

## Column 1: Automation Blocks

The left column is the block library.

Use categorized, draggable cards similar to the existing “Add Block” cards in the Email Template Builder.

Each card should contain:

- Block icon
- Block name
- Short description
- Block category
- Draggable state
- Optional search keywords

Include a search field at the top:

**Search triggers, actions, conditions...**

Organize blocks into expandable categories:

### Triggers

Triggers start an automation.

Initial trigger blocks should include:

- User Created
- User Invited
- User Registered
- User Role Changed
- User Status Changed
- User Added to Plan
- User Removed from Plan
- Stewardship Blueprint Started
- Stewardship Blueprint Completed
- Form Started
- Form Submitted
- Form Incomplete
- Appointment Booked
- Appointment Rescheduled
- Appointment Canceled
- Event Registration Created
- Event Reminder Due
- Tag Added
- Tag Removed
- Custom Field Updated
- Email Opened
- Email Link Clicked
- SMS Reply Received
- Manual Trigger
- Scheduled Date or Time
- Recurring Schedule
- Webhook Trigger

### Actions

Actions perform a task after a trigger or condition is reached.

Initial action blocks should include:

- Send Email
- Send SMS
- Send In-App Notification
- Send Direct Message
- Notify Staff Member
- Assign User Role
- Remove User Role
- Add Tag
- Remove Tag
- Update User Field
- Assign Staff Member
- Add User to Plan
- Remove User from Plan
- Create Task
- Update Task
- Create Follow-Up
- Book Appointment
- Cancel Appointment
- Add Community Member
- Add Community Post
- Generate Document
- Call Webhook
- Run AI Agent Task

### Conditions

Conditions control which path a participant follows.

Include:

- If / Else
- User Has Role
- User Has Tag
- User Status
- User Field Matches
- Form Completed
- Form Not Completed
- Email Opened
- Email Link Clicked
- SMS Opt-In Status
- Email Opt-In Status
- Appointment Status
- Assigned Staff Member
- Date Comparison
- Custom Field Comparison
- Multiple Conditions

Support condition operators such as:

- Equals
- Does not equal
- Contains
- Does not contain
- Is empty
- Is not empty
- Greater than
- Less than
- Before
- After
- Is one of
- Is not one of

### Timing and Flow

Include:

- Wait
- Wait Until
- Specific Date
- Specific Time
- Business Hours
- Delay by Minutes
- Delay by Hours
- Delay by Days
- Delay by Weeks
- Random Delay
- End Automation
- Exit Participant
- Go to Block
- Split Path
- Merge Path

---

# Column 2: Automation Canvas

The center column is the visual workflow canvas.

The canvas should support:

- Dragging blocks from the left column
- Dropping blocks anywhere on the canvas
- Connecting blocks with directional lines
- Moving and repositioning blocks
- Selecting blocks
- Multi-selecting blocks
- Duplicating blocks
- Copying and pasting blocks
- Deleting blocks
- Zooming in and out
- Panning around the canvas
- Fit-to-screen
- Undo and redo
- Automatic layout
- Mini-map for larger automations
- Keyboard shortcuts
- Connection validation

Each block should visually show:

- Icon
- Block name
- Short configuration summary
- Status
- Warning indicator
- Error indicator
- Incoming connection
- Outgoing connection
- Multiple output paths when applicable

Example block summary:

**Send Email**  
Welcome to MJG  
Immediately after signup

Selected blocks should use an MJG accent border or highlight.

Connections should clearly communicate the direction of the automation.

For condition blocks, label connection paths:

- Yes
- No

For split paths, allow custom path labels.

Prevent invalid connections, such as:

- An action with no trigger
- Circular automation loops unless intentionally supported
- Connecting multiple trigger blocks into an invalid sequence
- Activating an automation with unconfigured blocks

---

# Column 3: Block Settings and Configuration

The right column should behave like the contextual settings panel in the MJG Email Template Builder.

When no block is selected, show automation-level settings.

When a block is selected, show settings specific to that block.

## Automation-Level Settings

Include:

- Automation name
- Internal description
- Folder or category
- Automation status
- Draft, Active, Paused, or Archived
- Entry rules
- Re-entry rules
- Start date
- End date
- Time zone
- Business-hour restrictions
- Maximum executions per participant
- Automation owner
- Staff access
- Error handling
- Default sender information
- Default reply-to information

## Trigger Settings

Trigger configuration should include:

- Trigger type
- Related MJG module
- Trigger event
- Filters
- Eligible user roles
- Eligible plans
- Eligible tags
- Required fields
- Re-entry permissions
- Date and time restrictions

## Send Email Settings

The Send Email action must integrate directly with the existing MJG Email Template Builder.

Include:

- Select an existing email template
- Search email templates
- Preview selected template
- Edit selected template
- Create a new template
- Email subject
- From name
- From email
- Reply-to address
- Recipient
- CC and BCC
- Personalization variables
- Send timing
- Email tracking
- Test email
- Fallback values for missing variables

Example personalization variables:

- `{{first_name}}`
- `{{last_name}}`
- `{{full_name}}`
- `{{email}}`
- `{{phone}}`
- `{{user_role}}`
- `{{assigned_advisor_name}}`
- `{{assigned_advisor_email}}`
- `{{appointment_date}}`
- `{{appointment_time}}`
- `{{booking_url}}`
- `{{dashboard_url}}`
- `{{preferences_url}}`
- `{{unsubscribe_url}}`

## Send SMS Settings

Include:

- SMS message
- Character count
- Segment count
- Personalization variables
- Sender number
- Recipient phone field
- Send timing
- Quiet hours
- Test SMS
- Compliance warning

Only send SMS messages to contacts with a valid SMS opt-in status.

Honor opt-out requests and blocked phone numbers. Do not allow an automation to override the user’s SMS consent status.

## Wait Settings

Include:

- Wait duration
- Unit
- Wait until a date
- Wait until a specific time
- User’s local time zone
- Skip weekends
- Business days only
- Business hours only
- Continue immediately when the date has already passed

## User Role Settings

Include:

- Select role
- Add or replace role
- Remove existing role
- Restrict protected roles
- Require confirmation for administrator-level roles

MJG roles may include:

- Super Admin
- Admin
- Staff
- Team Leader
- User
- Client
- Advisor
- Additional custom roles stored in the application

Do not allow unauthorized users to assign Super Admin or other protected roles.

## Notification Settings

Include:

- Notification title
- Notification message
- Notification type
- Recipient
- Link or action URL
- Priority
- Expiration
- Mark as important
- Send an accompanying email or SMS

---

# Top Automation Toolbar

Add a toolbar above the canvas.

Include:

- Back to Automations
- Automation name
- Draft or Active status
- Save
- Save as Template
- Test Automation
- Activate
- Pause
- Duplicate
- Import
- Export
- Execution History
- Undo
- Redo
- Zoom controls
- Full Preview
- More Actions menu

Display save states such as:

- Saving...
- Saved
- Unsaved Changes
- Save Failed

Do not activate an automation until validation succeeds.

---

# Automation Creation Flow

Use the following user flow:

1. Admin selects **New Automation**.
2. Admin chooses:
   - Start from scratch
   - Use a template
   - Duplicate an existing automation
3. Admin names the automation.
4. Admin drags a trigger onto the canvas.
5. Admin selects the trigger.
6. The right settings panel opens.
7. Admin configures the trigger.
8. Admin drags an action onto the canvas.
9. Admin connects the trigger to the action.
10. Admin selects the action.
11. Admin configures the action.
12. Admin adds timing or condition blocks as needed.
13. Admin validates the automation.
14. Admin sends a test to a selected email address or phone number.
15. Admin saves the automation.
16. Admin activates the automation.
17. The system begins enrolling matching participants.
18. Admin reviews execution history and results.

---

# Required Example Automation

Create an initial example automation named:

**New MJG User Welcome**

Flow:

1. Trigger: User Registered
2. Condition: Email Opt-In Status is Active
3. Action: Send Email
4. Template: Select an existing MJG welcome email template
5. Timing: Immediately after signup
6. Wait: 1 day
7. Condition: User has started the Stewardship Blueprint
8. If Yes:
   - Send an in-app encouragement notification
9. If No:
   - Send a Stewardship Blueprint reminder email
10. Notify the assigned staff member
11. End automation

The administrator should be able to send the first email as a test to their own email address before activating the automation.

---

# Additional MJG Automation Templates

Provide starter templates for:

## Stewardship Blueprint Welcome

When a new user is invited, send the MJG welcome email and provide access instructions.

## Incomplete Stewardship Blueprint Reminder

When a user starts but does not complete the Stewardship Blueprint within three days, send a reminder.

## Stewardship Blueprint Completion

When the Blueprint is completed:

- Send a completion email
- Notify the assigned staff member
- Create a follow-up task
- Provide a booking link

## Appointment Reminder

Before a booked appointment:

- Send an email reminder 24 hours before
- Send an SMS reminder three hours before
- Skip SMS when the user has not opted in

## New Client Onboarding

When a user receives the Client role:

- Send the onboarding email
- Add the appropriate tags
- Assign the correct plan
- Notify the assigned advisor
- Create onboarding tasks

## Event Registration Follow-Up

When a user registers for an MJG event:

- Send confirmation
- Send a reminder before the event
- Send a follow-up after the event

## Staff Assignment Notification

When a user is assigned to a staff member or advisor:

- Notify the staff member
- Send an introductory email to the user
- Update the user record

---

# Automation List Page

Create an Automations management page before opening the builder.

Display:

- Automation name
- Description
- Status
- Trigger
- Number of blocks
- Number of enrolled participants
- Completed runs
- Failed runs
- Last execution
- Last modified
- Created by
- Actions menu

Support:

- Search
- Filters
- Sorting
- Grid view
- Table view
- Bulk actions
- Folder organization
- Status tabs
- Duplicate
- Pause
- Activate
- Archive
- Delete
- Export
- View history

Status options:

- Draft
- Active
- Paused
- Needs Attention
- Archived

---

# Testing Mode

The Test Automation feature must allow the administrator to:

- Select an existing test user
- Enter a test email address
- Enter a test phone number
- Use mock participant data
- Run the complete automation
- Run one selected block
- Preview personalization variables
- Preview condition results
- Skip wait blocks during testing
- Review the execution sequence
- View errors
- View API responses where appropriate

Clearly label test messages so they cannot be confused with production messages.

Do not enroll real users during a test.

---

# Execution History

Create a detailed execution history interface.

Each automation run should show:

- Automation
- Participant
- Trigger
- Current block
- Execution status
- Started date and time
- Completed date and time
- Duration
- Actions completed
- Actions skipped
- Conditions evaluated
- Messages sent
- Errors
- Retry attempts

Execution statuses:

- Waiting
- Running
- Completed
- Failed
- Canceled
- Skipped
- Paused

Allow administrators to:

- Inspect a run
- Retry a failed block
- Restart an automation
- Cancel a waiting run
- Remove a participant
- View related user
- View email or SMS delivery status

---

# Error Handling

Support configurable error handling:

- Stop automation
- Skip failed block
- Retry automatically
- Retry after a delay
- Notify automation owner
- Notify Super Admin
- Create a staff task
- Log the error

Display errors directly on affected canvas blocks.

Do not silently fail.

---

# Permissions

Use role-based permissions.

## Super Admin

Can:

- Create automations
- Edit all automations
- Activate or pause automations
- Delete automations
- View all execution history
- Configure protected actions
- Assign administrative roles

## Admin

Can:

- Create and edit permitted automations
- Test automations
- Activate automations when authorized
- View permitted execution history

## Staff or Team Leader

May:

- View assigned automations
- Review execution results
- Test selected automations
- Edit only when granted permission

## Standard User or Client

Cannot access the Automation Manager.

Validate permissions on both the frontend and backend.

---

# Data and Backend Requirements

Create a maintainable data structure for:

- Automations
- Automation versions
- Automation blocks
- Block positions
- Block connections
- Trigger configurations
- Action configurations
- Conditions
- Wait states
- Enrolled participants
- Execution runs
- Execution steps
- Errors
- Test runs
- Templates
- Audit logs

Suggested conceptual entities:

- `automations`
- `automation_versions`
- `automation_nodes`
- `automation_edges`
- `automation_enrollments`
- `automation_runs`
- `automation_run_steps`
- `automation_templates`
- `automation_audit_logs`

Store the canvas definition in a structured and versioned format.

Every automation edit should preserve the currently active version until the updated draft is intentionally published.

Do not allow draft edits to unexpectedly change an automation that is already running.

---

# Audit Logging

Record important activity, including:

- Automation created
- Automation edited
- Automation activated
- Automation paused
- Automation deleted
- Block added
- Block removed
- Settings changed
- Test executed
- Production execution retried
- Participant removed
- Protected role assigned

Each audit entry should contain:

- User
- Action
- Timestamp
- Automation
- Previous value
- New value
- IP or session information when available

---

# Design Direction

Follow the existing MJG dashboard design.

Use:

- Clean white and warm off-white backgrounds
- Black and charcoal typography
- MJG gold and warm orange accents
- Light neutral borders
- Rounded cards and controls
- Small uppercase section labels
- Compact professional spacing
- Existing typography
- Existing buttons, inputs, dropdowns, dialogs, tooltips, and icons

The new feature should feel like a native extension of the Email Template Builder, not a separate third-party application.

## Left Column

Visually match the existing “Add Block” panel.

## Center Canvas

Replace the email preview area with a node-based workflow canvas.

## Right Column

Visually match the existing contextual settings panel.

Use the current MJG components and design tokens rather than introducing an unrelated UI library or visual style.

---

# Responsive Behavior

Desktop is the primary builder experience.

For smaller screens:

- Collapse the left block library into a drawer
- Collapse the right settings panel into a drawer
- Keep the canvas usable with touch controls
- Support pinch-to-zoom when possible
- Display a recommendation to use a larger screen for complex editing

Do not attempt to show all three columns simultaneously on a narrow mobile screen.

---

# Accessibility

Include:

- Keyboard navigation
- Visible focus states
- Accessible labels
- Tooltips
- Screen-reader descriptions
- Sufficient contrast
- Non-color error indicators
- Keyboard-based block creation
- Keyboard-based block connection where practical

---

# Validation Rules

Before activation, validate that:

- At least one trigger exists
- Every required block field is configured
- All actions are connected
- All condition paths are connected or intentionally terminated
- Selected email templates still exist
- Selected users, plans, roles, and tags are valid
- SMS actions comply with opt-in requirements
- Protected role actions are authorized
- No unsupported circular paths exist
- The automation contains a valid ending state
- Sender information is configured

Show validation issues in:

1. A validation summary panel
2. The affected block
3. The right settings panel

Clicking a validation issue should select and focus the related block.

---

# MVP Scope

Build the first version around these blocks:

## Triggers

- User Registered
- User Invited
- User Role Changed
- Stewardship Blueprint Completed
- Appointment Booked
- Manual Trigger
- Scheduled Trigger

## Actions

- Send Email
- Send SMS
- Send In-App Notification
- Assign User Role
- Add Tag
- Update User Field
- Notify Staff Member
- Create Task

## Conditions

- If / Else
- User Has Role
- User Has Tag
- Email Opt-In Status
- SMS Opt-In Status
- Form Completion Status

## Flow

- Wait
- End Automation

Design the block registry so additional block types can be added later without rebuilding the entire builder.

---

# Implementation Guidance

Before writing code:

1. Review the existing MJG project structure.
2. Locate the Email Template Builder components.
3. Identify reusable layout, card, form, toolbar, modal, drawer, and settings components.
4. Review the current database schema.
5. Review user roles and authorization logic.
6. Review email template storage and sending services.
7. Review SMS, notification, booking, form, and user-management integrations.
8. Document the proposed implementation plan.
9. Build the feature in clear phases.
10. Avoid modifying unrelated MJG functionality.

Use the project’s existing stack and conventions.

Prefer reusable components such as:

- `AutomationBuilder`
- `AutomationBlockLibrary`
- `AutomationCanvas`
- `AutomationNode`
- `AutomationConnection`
- `AutomationSettingsPanel`
- `AutomationToolbar`
- `AutomationValidationPanel`
- `AutomationTestDialog`
- `AutomationExecutionHistory`
- `AutomationRunDetails`
- `AutomationTemplateSelector`

Create a central automation block registry containing:

- Block identifier
- Block category
- Display name
- Description
- Icon
- Default configuration
- Configuration schema
- Validation rules
- Input connection rules
- Output connection rules
- Execution handler

Keep UI configuration separate from backend execution logic.

---

# Acceptance Criteria

The feature is complete when an authorized MJG administrator can:

1. Open Automations from the dashboard.
2. Create a new automation.
3. Drag a trigger onto the canvas.
4. Drag an email action onto the canvas.
5. Connect the trigger to the email action.
6. Configure the trigger in the right panel.
7. Select an existing MJG email template.
8. Configure the email to send immediately after registration.
9. Add a wait block.
10. Add a condition.
11. Add separate Yes and No paths.
12. Validate the automation.
13. Send a test email to themselves.
14. Save the automation as a draft.
15. Activate the automation.
16. Enroll a matching test user.
17. Review the automation execution history.
18. Pause the automation without deleting it.
19. Edit a new draft version without disrupting active runs.
20. Review audit history for important changes.

Start by auditing the existing MJG Email Template Builder and provide an implementation plan before making major code changes.