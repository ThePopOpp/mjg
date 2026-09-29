-- Core 5 — resend Week 3 and re-anchor the rest of the sequence to Tue 13 Oct 2026.
--
-- WHAT HAPPENED: "6WC · 07 · Week 3 — Evaluate the Pillars" (step 7) went out to
-- all 6 attendees today, Tue 29 Sep 2026 at 08:00 Arizona. It needs to go out
-- again on Tue 13 Oct 2026, with every later email shifting to match.
--
-- THE SHIFT: 29 Sep 08:00 → 13 Oct 08:00 is exactly +14 days, so steps 7 through
-- 20 all move by 14 days. That lands step 8 (Week 3 Follow-Up) on Fri 23 Oct —
-- ten days after the new Week 3 send, which is the spacing that was asked for.
--
-- THREE THINGS CHANGE, and all three are needed:
--   1. experience_steps.offset_value for steps 7-20. This is the schedule
--      DEFINITION: lib/experiences/add-attendee.ts computes a new attendee's
--      dates from it, so leaving it alone would give anyone added later the old
--      pre-shift dates.
--   2. The queued send events for steps 8-20.
--   3. The step 7 events, which are re-opened for sending.
--
-- ON RE-OPENING STEP 7: experience_send_events has UNIQUE (attendee_id,
-- step_number), so a resend cannot be a second row — the existing six rows are
-- reset to 'scheduled' and their delivery metadata cleared. That overwrites the
-- record of today's send, so it is captured in user_activity_logs first.
--
-- NOTE: all six attendees received Week 3 this morning and will receive it a
-- second time on 13 Oct. That is the intent, not an accident.
--
-- Arizona has no DST, so 08:00 Arizona is 15:00 UTC all year.
--
-- Guarded: the whole block is skipped unless step 7 is still sitting on its
-- original 29 Sep slot, so re-running can never shift the sequence twice.

do $$
declare
  gid uuid := '5811d9b8-4220-481d-9de8-daf55feb14e1';  -- Core 5
  new_week3 timestamptz := '2026-10-13T15:00:00Z';     -- Tue 13 Oct, 08:00 Arizona
  shift interval := interval '14 days';
  history jsonb;
  moved int;
begin
  if not exists (
    select 1 from public.experience_send_events
    where experience_id = gid and step_number = 7
      and scheduled_at = '2026-09-29T15:00:00Z'
  ) then
    raise notice 'Core 5 step 7 is not on its original 29 Sep slot — already re-anchored. Skipping.';
    return;
  end if;

  -- Preserve what today's send looked like before the rows are re-opened.
  select jsonb_agg(jsonb_build_object(
           'attendee_id', attendee_id, 'status', status,
           'scheduled_at', scheduled_at, 'sent_at', sent_at,
           'provider_message_id', provider_message_id))
    into history
    from public.experience_send_events
   where experience_id = gid and step_number = 7;

  insert into public.user_activity_logs (action, entity_type, entity_id, metadata)
  values (
    'experience_sequence_reanchored', 'experience', gid,
    jsonb_build_object(
      'group', 'Core 5',
      'reason', 'Resend Week 3 — Evaluate the Pillars and restart the sequence from Tue 13 Oct 2026.',
      'shift_days', 14,
      'steps_shifted', '7-20',
      'step7_new_send', new_week3,
      'step7_previous_sends', history,
      'migration', '202609290097'
    )
  );

  -- 1. The schedule definition, so newly added attendees inherit the new dates.
  update public.experience_steps
     set offset_value = offset_value + 14
   where experience_id = gid
     and step_number between 7 and 20
     and offset_unit = 'day';

  -- 2. Everything still queued after Week 3.
  update public.experience_send_events
     set scheduled_at = scheduled_at + shift
   where experience_id = gid
     and step_number between 8 and 20
     and status = 'scheduled';
  get diagnostics moved = row_count;
  raise notice 'Re-queued % later send events (+14 days).', moved;

  -- 3. Week 3 itself: re-opened for a second send on 13 Oct.
  update public.experience_send_events
     set status              = 'scheduled',
         scheduled_at        = new_week3,
         sent_at             = null,
         provider            = null,
         provider_message_id = null,
         error_message       = null,
         last_attempt_at     = null
   where experience_id = gid
     and step_number = 7;
  get diagnostics moved = row_count;
  raise notice 'Re-opened % Week 3 send events for 13 Oct.', moved;
end $$;
