# MJG Agent Logging

## Log Types

### agent_conversation_logs
Stores chat metadata, not necessarily full private content.

Fields:
- id
- user_id
- session_id
- role
- message_type
- created_at

### agent_action_logs
Stores tool/action history.

Fields:
- id
- user_id
- action_name
- tool_name
- status
- created_at
- error_message

### agent_escalation_logs
Stores human escalation records.

Fields:
- id
- user_id
- escalation_type
- priority
- summary
- assigned_staff
- status
- created_at

### agent_cron_logs
Stores scheduled job history.

Fields:
- id
- job_name
- run_status
- started_at
- completed_at
- records_processed
- errors