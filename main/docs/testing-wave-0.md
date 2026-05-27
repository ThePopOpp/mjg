# Wave 0 Testing

## Required Setup

1. Apply Supabase migrations.
2. Add server-side environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
3. Start the Next.js app.

## Manual Test Flow

1. Open `/created-for-more-7-day-stewardship-pilot?source=wave_0`.
2. Click through to `/check-in`.
3. Complete all 25 scores and reflection fields.
4. Confirm redirect to `/check-in/thank-you`.
5. Verify Supabase rows:
   - `participants`
   - `check_in_results`
   - `check_in_answers`
   - `participant_tags`
   - `email_journey_events`
   - `notifications`
6. Manually send or review the scheduled Wave 0 email sequence.
7. Complete `/surveys/general`.
8. Verify survey rows and participant tags.
9. Complete `/stewardship-blueprint-inner-circle` for selected testers.
10. Review dashboard pages for visibility.

## Pastor/Elder Test Flow

1. Open `/stewardship-blueprint-pastor-review?source=pastor_elder`.
2. Complete the Check-In as Pastor/Elder/Church Leader.
3. Complete `/surveys/pastor-elder`.
4. Confirm Pastor/Elder tags, survey response, and dashboard visibility.
