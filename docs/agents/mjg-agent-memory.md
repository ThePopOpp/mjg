# MJG Agent Memory

The MJG Agent should use memory carefully and respectfully.

## Memory Types

### 1. Session Memory
Temporary memory for the current chat/session.

Examples:
- User is asking about booking
- User is currently completing the Blueprint
- User is confused about a dashboard section

Session memory should expire after the session.

---

### 2. User Journey Memory
Stores non-sensitive progress data.

Examples:
- User accepted invitation
- User started Blueprint
- User completed Blueprint
- User has not booked meeting
- User requested human help

---

### 3. Preference Memory
Stores helpful preferences.

Examples:
- User prefers email reminders
- User prefers SMS reminders
- User wants staff to follow up
- User prefers morning appointments

Only store if useful and allowed.

---

### 4. Staff Memory
Stores internal notes visible only to authorized staff/admins.

Examples:
- Staff follow-up needed
- User asked for Michael specifically
- User requested help with a technical issue

---

## Memory Rules

The agent should remember:
- User progress
- Reminder preferences
- Booking status
- Staff follow-up status
- Prior support requests

The agent should not store:
- Sensitive financial details
- Account numbers
- Tax details
- Legal details
- Medical details
- Private family conflict details
- Anything unnecessary for the user journey

## Memory Expiration

Suggested expiration:

- Session memory: end of session
- Reminder memory: until completed or cancelled
- User journey memory: persistent
- Staff notes: persistent until removed
- Sensitive support context: 30-90 days max