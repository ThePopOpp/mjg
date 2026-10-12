-- Core 5 — set the sequence to the dates Mike signed off on ------------------
--
-- SOURCE OF TRUTH: docs/6-week-challenge/core-5/MJG - Core 5 - Email Sequence
-- 10-12-2026.csv. This replaces the dates 202610120100 set earlier today, which
-- were derived from "restart Week 2 on Wednesday 14 Oct". Mike's document moves
-- the group to a Monday rhythm instead, so the dates are now stated absolutely,
-- one row per step, rather than as a shift. A document-driven update should be
-- readable against the document.
--
-- THE NEW CADENCE: Launch emails on alternate Mondays, follow-ups the Friday
-- four days later.
--   Week 2  Mon 12 Oct   Week 3  Mon 26 Oct   Week 4  Mon 09 Nov
--   Week 5  Mon 23 Nov   Week 6  Mon 07 Dec
--
-- THREE THINGS ABOUT THE DOCUMENT, recorded because they were judgement calls:
--
--   1. Row 5 is dated today. Its 08:00 Arizona slot had already passed when this
--      ran, and lib/experiences/scheduler.ts selects on
--      (status = 'scheduled' AND scheduled_at <= now), so Week 2 goes out to all
--      six attendees on the next cron run. Jeremy confirmed that is intended.
--   2. Row 6's date cell is malformed: "10/162026". Read as Fri 16 Oct 2026 —
--      the only reading that fits both the row's position and the Monday-launch
--      / Friday-follow-up spacing every other pair in the document uses.
--   3. Rows 9 and 10 are both Mon 09 Nov 2026, so Midpoint Pulse and Week 4
--      Launch land on the same day. Applied as written rather than guessed at;
--      flagged for Mike to confirm.
--
-- Steps 1-4 already sent in September and are listed for completeness only —
-- the UPDATEs below touch nothing with status 'sent', so their delivery history
-- is left alone. Steps 5 and 6 are already 'scheduled' with cleared delivery
-- metadata (202610120100 re-opened them), so this only moves their dates.
--
-- Arizona has no DST, so 08:00 Arizona is 15:00 UTC all year.
--
-- Guarded on step 7 still sitting where 202610120100 left it, so re-running
-- cannot quietly re-date a sequence that has since moved on.

do $$
declare
  gid uuid := '5811d9b8-4220-481d-9de8-daf55feb14e1';  -- Core 5
  plan record;
  touched int;
  total_events int := 0;
  total_steps int := 0;
begin
  if not exists (
    select 1 from public.experience_send_events
    where experience_id = gid and step_number = 7
      and scheduled_at = '2026-10-28T15:00:00Z'
  ) then
    raise notice 'Core 5 step 7 is not where 202610120100 left it — skipping, the sequence has already moved.';
    return;
  end if;

  insert into public.user_activity_logs (action, entity_type, entity_id, metadata)
  values (
    'experience_sequence_reanchored', 'experience', gid,
    jsonb_build_object(
      'group', 'Core 5',
      'reason', 'Match the owner-approved sequence document (Monday launches, Friday follow-ups).',
      'source_document', 'docs/6-week-challenge/core-5/MJG - Core 5 - Email Sequence 10-12-2026.csv',
      'supersedes', '202610120100',
      'week2_sends_immediately', true,
      'notes', jsonb_build_array(
        'Row 6 date cell was malformed ("10/162026"); read as 2026-10-16.',
        'Rows 9 and 10 both dated 2026-11-09; applied as written.'
      ),
      'previous_schedule', (
        select jsonb_agg(jsonb_build_object('step', step_number, 'scheduled_at', scheduled_at, 'status', status)
                         order by step_number)
          from (select distinct step_number, scheduled_at, status
                  from public.experience_send_events where experience_id = gid) s
      ),
      'migration', '202610120101'
    )
  );

  -- One row per step, exactly as the document lists them. offset_value moves with
  -- scheduled_at because lib/experiences/add-attendee.ts derives a new attendee's
  -- dates from the offsets, and a late joiner must not inherit the old schedule.
  for plan in
    select * from (values
      ( 5,  33, '2026-10-12T15:00:00Z'::timestamptz),
      ( 6,  37, '2026-10-16T15:00:00Z'::timestamptz),
      ( 7,  47, '2026-10-26T15:00:00Z'::timestamptz),
      ( 8,  51, '2026-10-30T15:00:00Z'::timestamptz),
      ( 9,  61, '2026-11-09T15:00:00Z'::timestamptz),
      (10,  61, '2026-11-09T15:00:00Z'::timestamptz),
      (11,  65, '2026-11-13T15:00:00Z'::timestamptz),
      (12,  75, '2026-11-23T15:00:00Z'::timestamptz),
      (13,  80, '2026-11-28T15:00:00Z'::timestamptz),
      (14,  89, '2026-12-07T15:00:00Z'::timestamptz),
      (15,  93, '2026-12-11T15:00:00Z'::timestamptz),
      (16, 101, '2026-12-19T15:00:00Z'::timestamptz),
      (17, 113, '2026-12-31T15:00:00Z'::timestamptz),
      (18, 141, '2027-01-28T15:00:00Z'::timestamptz),
      (19, 159, '2027-02-15T15:00:00Z'::timestamptz),
      (20, 169, '2027-02-25T15:00:00Z'::timestamptz)
    ) as t(step_number, offset_value, send_at)
  loop
    update public.experience_steps
       set offset_value = plan.offset_value
     where experience_id = gid
       and step_number = plan.step_number
       and offset_unit = 'day';
    get diagnostics touched = row_count;
    total_steps := total_steps + touched;

    -- Deliberately excludes 'sent': nothing already delivered is re-dated here.
    update public.experience_send_events
       set scheduled_at = plan.send_at
     where experience_id = gid
       and step_number = plan.step_number
       and status in ('scheduled', 'paused');
    get diagnostics touched = row_count;
    total_events := total_events + touched;
  end loop;

  raise notice 'Core 5 re-dated from document: % step definitions, % send events.', total_steps, total_events;
end $$;
