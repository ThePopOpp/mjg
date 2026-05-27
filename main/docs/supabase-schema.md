# Supabase Schema

The pilot schema is defined in:

- `supabase/migrations/202605260001_mjg_dashboard_foundation.sql`
- `supabase/migrations/202605260002_created_for_more_pilot.sql`

## Core Tables

- `profiles`
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
