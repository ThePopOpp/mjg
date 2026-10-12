-- Core 5 — resend both Week 2 emails and re-anchor the sequence to Wed 14 Oct 2026.
--
-- WHAT IS BEING ASKED: the group is restarting from Week 2. "6WC · 05 · Week 2 —
-- See the Blueprint" (step 5) and its follow-up (step 6) already went out, on
-- 15 Sep and 25 Sep. Both go out again, with Week 2 Launch landing Wed 14 Oct
-- 2026 at 08:00 Arizona, and everything after it moving to match.
--
-- WHY THIS IS NOT ONE UNIFORM SHIFT. 202609290097 moved steps 7-20 by +14 days
-- to delay Week 3 from 29 Sep to 13 Oct, but left steps 5-6 where they were.
-- That left a 28-day gap between Week 2 Follow-Up and Week 3 Launch, where every
-- other Launch-to-Launch gap in this sequence is 14 days. Shifting 5-20 by one
-- uniform amount would carry that artifact forward and put Week 3 on 11 Nov —
-- four weeks after Week 2, a skipped meeting for a biweekly group, with Week 6
-- Launch landing in Christmas week.
--
-- So the shift is deliberately uneven, and it removes the artifact:
--   steps 5-6   +29 days   (15 Sep -> 14 Oct)
--   steps 7-20  +15 days   (13 Oct -> 28 Oct)
-- The 14 extra days the previous re-anchor inserted are absorbed here, and the
-- Launch emails return to a clean 14-day rhythm on Wednesdays:
--   Week 2  Wed 14 Oct   Week 3  Wed 28 Oct   Week 4  Wed 11 Nov
--   Week 5  Wed 25 Nov   Week 6  Wed 09 Dec
-- Follow-ups keep their existing 10-day spacing behind each Launch.
--
-- THREE THINGS CHANGE, and all three are needed:
--   1. experience_steps.offset_value. This is the schedule DEFINITION:
--      lib/experiences/add-attendee.ts computes a new attendee's dates from it,
--      so leaving it alone would give anyone added later the old dates.
--   2. The queued send events for steps 7-20.
--   3. The step 5 and 6 events, which are re-opened for sending.
--
-- ON RE-OPENING STEPS 5 AND 6: experience_send_events has
-- UNIQUE (attendee_id, step_number), so a resend cannot be a second row. The
-- twelve existing rows are reset to 'scheduled' and their delivery metadata
-- cleared, which overwrites the record of the September sends — so those are
-- captured in user_activity_logs first.
--
-- NOTE: all six attendees already received both Week 2 emails in September and
-- will receive them a second time. That is the intent, not an accident.
--
-- Arizona has no DST, so 08:00 Arizona is 15:00 UTC all year.
--
-- Guarded: the whole block is skipped unless step 5 is still sitting on its
-- original 15 Sep slot, so re-running can never shift the sequence twice.

do $$
declare
  gid uuid := '5811d9b8-4220-481d-9de8-daf55feb14e1';  -- Core 5
  new_week2 timestamptz := '2026-10-14T15:00:00Z';     -- Wed 14 Oct, 08:00 Arizona
  shift_week2 interval := interval '29 days';          -- steps 5-6
  shift_tail  interval := interval '15 days';          -- steps 7-20
  history jsonb;
  moved int;
begin
  if not exists (
    select 1 from public.experience_send_events
    where experience_id = gid and step_number = 5
      and scheduled_at = '2026-09-15T15:00:00Z'
  ) then
    raise notice 'Core 5 step 5 is not on its original 15 Sep slot — already re-anchored. Skipping.';
    return;
  end if;

  -- Preserve what the September sends looked like before the rows are re-opened.
  select jsonb_agg(jsonb_build_object(
           'step_number', step_number, 'attendee_id', attendee_id, 'status', status,
           'scheduled_at', scheduled_at, 'sent_at', sent_at,
           'provider_message_id', provider_message_id)
         order by step_number, attendee_id)
    into history
    from public.experience_send_events
   where experience_id = gid and step_number in (5, 6);

  insert into public.user_activity_logs (action, entity_type, entity_id, metadata)
  values (
    'experience_sequence_reanchored', 'experience', gid,
    jsonb_build_object(
      'group', 'Core 5',
      'reason', 'Restart from Week 2 — See the Blueprint on Wed 14 Oct 2026, and restore a clean biweekly Launch cadence.',
      'shift_days_steps_5_6', 29,
      'shift_days_steps_7_20', 15,
      'artifact_removed', 'the 14-day gap 202609290097 left between Week 2 Follow-Up and Week 3 Launch',
      'step5_new_send', new_week2,
      'resent_steps', jsonb_build_array(5, 6),
      'previous_sends', history,
      'migration', '202610120100'
    )
  );

  -- 1. The schedule definition, so newly added attendees inherit the new dates.
  update public.experience_steps
     set offset_value = offset_value + 29
   where experience_id = gid
     and step_number between 5 and 6
     and offset_unit = 'day';

  update public.experience_steps
     set offset_value = offset_value + 15
   where experience_id = gid
     and step_number between 7 and 20
     and offset_unit = 'day';

  -- 2. Everything still queued from Week 3 onward.
  update public.experience_send_events
     set scheduled_at = scheduled_at + shift_tail
   where experience_id = gid
     and step_number between 7 and 20
     and status in ('scheduled', 'paused');
  get diagnostics moved = row_count;
  raise notice 'Re-queued % later send events (+15 days).', moved;

  -- 3. Week 2 itself: both emails re-opened for a second send.
  update public.experience_send_events
     set status              = 'scheduled',
         scheduled_at        = scheduled_at + shift_week2,
         sent_at             = null,
         provider            = null,
         provider_message_id = null,
         error_message       = null,
         last_attempt_at     = null
   where experience_id = gid
     and step_number in (5, 6);
  get diagnostics moved = row_count;
  raise notice 'Re-opened % Week 2 send events (+29 days).', moved;
end $$;
