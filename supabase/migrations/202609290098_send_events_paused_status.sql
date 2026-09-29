-- Allow an individual queued email to be PAUSED.
--
-- Pausing a whole group already works (experiences.status = 'paused', which the
-- scheduler skips). What was missing is holding ONE email — "send everything
-- except the midpoint pulse" — which the new bulk actions on the Email
-- Automation view need.
--
-- 'paused' is deliberately distinct from the existing 'skipped':
--   skipped = this recipient will never get this email (opted out, bounced).
--   paused  = held on purpose, and expected to be resumed.
--
-- The scheduler only ever picks up status = 'scheduled', so a paused row is
-- inert the moment it is set — no scheduler change is needed. Resuming puts it
-- back to 'scheduled' with its date intact.

alter table public.experience_send_events
  drop constraint if exists experience_send_events_status_check;

alter table public.experience_send_events
  add constraint experience_send_events_status_check
  check (status = any (array['scheduled'::text, 'sent'::text, 'skipped'::text, 'failed'::text, 'paused'::text]));
