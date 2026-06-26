# MJG Agent Heartbeat

The heartbeat system checks user activity and decides whether the agent should take action.

## Heartbeat Purpose

The heartbeat helps the agent:
- Monitor user journey status
- Detect incomplete steps
- Trigger reminders
- Notify staff
- Prevent users from getting stuck
- Keep the stewardship process moving

## Heartbeat Checks

### Check 1: Invitation Status
Condition:
- Invitation sent but not accepted

Action:
- Send reminder after 24-48 hours
- Notify staff after 7 days if still not accepted

---

### Check 2: First Login
Condition:
- User logs in for the first time

Action:
- Send welcome message
- Explain the dashboard
- Recommend starting the Stewardship Blueprint

---

### Check 3: Blueprint Started
Condition:
- User started but did not complete Blueprint

Action:
- Wait 24-48 hours
- Send gentle reminder

---

### Check 4: Blueprint Completed
Condition:
- User completed all required sections

Action:
- Confirm submission
- Notify staff
- Recommend booking a stewardship conversation

---

### Check 5: No Meeting Booked
Condition:
- Blueprint complete but no meeting booked

Action:
- Send booking reminder
- Notify staff after repeated delay

---

### Check 6: User Inactive
Condition:
- No login or activity for 7 days

Action:
- Send re-engagement message

---

### Check 7: Human Help Requested
Condition:
- User asks for human contact

Action:
- Create staff notification
- Mark user as help_requested

---

### Check 8: Advice Boundary Triggered
Condition:
- User asks for financial, tax, legal, investment, or estate planning advice

Action:
- Do not answer directly
- Escalate to staff
- Offer to summarize the user’s question