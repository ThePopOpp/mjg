-- Phone-only SMS opt-ins (someone who isn't yet a participant) are now stored on a contact
-- instead of a fake-email participant, so consent_events needs to reference a contact too.
alter table public.consent_events drop constraint if exists consent_events_entity_type_check;
alter table public.consent_events add constraint consent_events_entity_type_check
  check (entity_type = any (array['participant', 'profile', 'contact']));
