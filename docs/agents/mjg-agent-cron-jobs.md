# MJG Agent Cron Jobs

Cron jobs run on a schedule and allow the agent to check user status automatically.

## Recommended Cron Jobs

### 1. Daily User Journey Check
Schedule:
- Every day at 8:00 AM

Purpose:
- Check all active users
- Find incomplete Blueprints
- Find completed Blueprints with no booking
- Find inactive users
- Find users needing staff review

Example:
```cron
0 8 * * *