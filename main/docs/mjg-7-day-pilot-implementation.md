# Created for More 7-Day Stewardship Pilot Implementation

This implementation follows `main/docs/mjg-7-day-pilot.md` as the source of truth.

## Public Routes

- `/created-for-more-7-day-stewardship-pilot`
- `/stewardship-blueprint-pastor-review`
- `/check-in`
- `/check-in/thank-you`
- `/surveys/general`
- `/surveys/pastor-elder`
- `/surveys/thank-you`
- `/stewardship-blueprint-inner-circle`

## Flow

Personal invitation by text or email leads to a landing page. Participants complete the Check-In, opt in to the 7-day journey, receive the journey manually or through a future provider, complete the final survey, and may be invited to the Inner Circle.

## Form Handling

Public forms post to server-side API routes:

- `POST /api/pilot/check-in`
- `POST /api/pilot/surveys`
- `POST /api/pilot/inner-circle`

These routes use the server-only Supabase service role key and do not expose privileged credentials in browser code.

## Dashboard Connections

The existing dashboard shell was not rebuilt. Pilot data was connected to:

- Dashboard overview
- Participants
- Check-In Results
- Surveys
- Email Journey
- Tags & Segments
- Reports
- Inner Circle

## Launch Note

Wave 0 can launch with manual email triggering if Supabase migrations are applied and `SUPABASE_SERVICE_ROLE_KEY` is configured. Automated provider sending is intentionally a shell until final copy and provider credentials are ready.
