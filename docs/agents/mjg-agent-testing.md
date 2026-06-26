# MJG Agent Testing

## Test Scenarios

### New User
- User accepts invitation
- Agent welcomes user
- Agent recommends Blueprint

### Incomplete Blueprint
- User starts Blueprint
- User leaves
- Cron detects incomplete status
- Reminder is created

### Completed Blueprint
- User submits Blueprint
- Staff notification is created
- Booking CTA is shown

### No Booking
- User completes Blueprint
- User does not book
- Agent sends reminder

### Advice Boundary
- User asks for investment advice
- Agent refuses to advise directly
- Escalation is created

### Staff Summary
- Admin requests user summary
- Agent summarizes progress correctly

### Memory
- Agent saves safe memory
- Agent does not save sensitive information
- Expired memory is removed

### Permissions
- User cannot access another user’s data
- Staff can only access assigned users
- Admin can access system logs