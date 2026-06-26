# MJG Agent Data Model

## Tables

### agent_memory
Stores approved memory.

Fields:
- id
- user_id
- memory_type
- key
- value
- expires_at
- created_at
- updated_at

---

### agent_schedules
Stores future actions.

Fields:
- id
- user_id
- schedule_type
- action_name
- run_at
- status
- payload
- created_at
- completed_at

---

### agent_logs
Stores agent activity.

Fields:
- id
- user_id
- action_name
- tool_name
- status
- metadata
- created_at

---

### agent_escalations
Stores human escalation requests.

Fields:
- id
- user_id
- escalation_type
- priority
- summary
- assigned_to
- status
- created_at
- resolved_at

---

### agent_cron_runs
Stores cron execution history.

Fields:
- id
- job_name
- started_at
- completed_at
- status
- records_processed
- error_message