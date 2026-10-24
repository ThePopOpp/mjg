-- Consent evidence: what the person actually agreed to.
--
-- A consent_events row said a channel was opted into, but not what the person
-- was shown. For A2P 10DLC (and plain good practice) the record should carry the
-- exact disclosure text on screen at the time, which form it came from, and
-- anything else needed to reconstruct the moment (form version, page, source).

alter table public.consent_events
  add column if not exists disclosure_text text,
  add column if not exists form_type text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;
