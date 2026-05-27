# Supabase Schema

The pilot schema is defined in:

- `supabase/migrations/202605260001_mjg_dashboard_foundation.sql`
- `supabase/migrations/202605260002_created_for_more_pilot.sql`

## Core Tables

- `profiles`
- `user_invitations`
- `user_activity_logs`
- `user_preferences`
- `form_submissions`
- `participant_user_links`
- `role_assignment_history`
- `participants`
- `waves`
- `tags`
- `participant_tags`
- `check_in_results`
- `check_in_answers`
- `survey_responses`
- `survey_answers`
- `email_journey_events`
- `notifications`
- `activity_logs`
- `inner_circle_responses`

## User Management Storage

All important user-management data is stored in Supabase. The active schema extends `profiles` with:

- `auth_user_id`
- first, last, and full name
- email and phone
- role and status
- avatar URL
- invited-by user
- related participant/contact record
- notes
- last login date
- role/status change metadata

Additional user-management tables store:

- invitations by email, SMS, or manual invite
- role assignment history
- user-specific view/search/filter/column preferences
- user activity logs
- form submission records
- participant-to-user links
- user-management notifications

Privileged user-management writes must happen server-side through:

- `POST /api/user-management/invitations`
- `POST /api/user-management/users`

These route handlers require an active `super_admin` or `admin` Supabase profile and use the service role key only on the server.

## Consent Fields

Participant records store separate permission fields for:

- 7-day email journey opt-in
- future updates
- anonymous feedback use
- quote/story/interview follow-up
- general follow-up

## Tags

Default pilot, wave, status, interest, permission, and lowest-area tags are seeded by the migration and `supabase/seed/tags.sql`.

## RLS

RLS is enabled on pilot tables. Dashboard read access uses `public.can_access_dashboard()`. Public insert policies exist for form-oriented tables, but the application writes through server-side API routes with the service role key.
