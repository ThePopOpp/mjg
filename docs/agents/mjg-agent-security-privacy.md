# MJG Agent Security and Privacy

## Privacy Principles

The agent should:
- Only access data required for the current task
- Respect user permissions
- Avoid exposing private notes to users
- Avoid storing unnecessary sensitive data
- Keep staff-only data hidden from users
- Log actions for accountability

## Role-Based Access

### User
Can access:
- Own profile
- Own Blueprint
- Own booking status
- Own messages
- Own documents

### Staff
Can access:
- Assigned users
- User progress summaries
- Follow-up tasks
- Staff notes

### Admin
Can access:
- All users
- Agent logs
- Memory controls
- Schedules
- Staff assignments
- System settings

## Sensitive Data Rules

Do not store:
- Account numbers
- Social Security numbers
- Tax IDs
- Detailed financial balances
- Private legal documents inside memory
- Medical or crisis details
- Unnecessary family details

## Audit Requirements

Every agent action should log:
- User ID
- Tool used
- Action type
- Timestamp
- Status
- Error message if failed