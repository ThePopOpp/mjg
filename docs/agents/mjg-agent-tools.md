# MJG Agent Tools

The Hermes Agent should use approved tools only. Tools allow the agent to take action inside the MJG WebApp.

## User Tools

### get_user_profile
Returns basic user profile data.

Allowed fields:
- id
- first_name
- last_name
- email
- phone
- role
- status
- created_at
- last_login_at

### get_user_dashboard_status
Returns current dashboard status.

Allowed fields:
- blueprint_status
- meeting_status
- invitation_status
- documents_status
- messages_status
- last_activity_at

### get_blueprint_progress
Returns Stewardship Blueprint completion status.

Allowed fields:
- faith_completed
- family_completed
- financial_completed
- future_completed
- giving_completed
- legacy_completed
- completion_percentage
- submitted_at

### get_booking_status
Checks if the user has scheduled a meeting.

Allowed fields:
- has_booking
- meeting_type
- meeting_date
- assigned_staff
- booking_url

---

## Messaging Tools

### send_in_app_message
Sends an in-app message to a user.

Use for:
- Welcome messages
- Blueprint reminders
- Booking reminders
- Follow-up prompts

### send_email
Sends an approved MJG email.

Use for:
- Invitation reminders
- Blueprint reminders
- Completed Blueprint follow-ups
- Staff notifications

### send_sms
Sends short SMS reminders only when user has opted in.

Use for:
- Appointment reminders
- Blueprint completion reminders
- Important account notices

### create_draft_message
Creates a staff-reviewable draft instead of sending immediately.

Use when:
- Human approval is required
- Message contains sensitive context
- User-specific follow-up is needed

---

## Staff/Admin Tools

### get_users_needing_followup
Returns users who need staff attention.

Filters:
- incomplete_blueprint
- completed_blueprint_no_booking
- inactive_users
- help_requested
- staff_review_needed

### summarize_user_progress
Creates a summary of user progress for staff.

Output:
- User status
- Completed sections
- Incomplete sections
- Last activity
- Recommended next step

### create_staff_notification
Creates an internal staff alert.

Use for:
- Blueprint completed
- User requested help
- Financial/legal/tax question asked
- User inactive
- Meeting not booked

### assign_user_to_staff
Assigns a user to a staff member.

Use only for admins or system automation.

---

## Scheduling Tools

### create_reminder
Creates a future reminder.

Use for:
- Incomplete Blueprint
- Meeting not booked
- Staff follow-up
- User inactivity

### update_reminder
Updates an existing reminder.

### cancel_reminder
Cancels a reminder.

### get_scheduled_tasks
Returns active reminders, cron tasks, and scheduled agent actions.

---

## Agent Tools

### log_agent_activity
Logs agent action.

Required fields:
- user_id
- agent_action
- tool_used
- status
- created_at

### escalate_to_human
Creates an escalation record for staff.

Use when:
- User asks for financial advice
- User asks for tax/legal advice
- User asks about investment decisions
- User requests staff contact
- Agent confidence is low

### get_agent_memory
Retrieves approved memory about the user.

### save_agent_memory
Stores approved long-term or session memory.

### delete_agent_memory
Removes memory when requested or when no longer needed.