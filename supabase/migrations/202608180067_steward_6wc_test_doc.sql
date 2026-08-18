-- Seed a Steward training doc: how to run a standard or expedited test of the
-- 6-Week Challenge email automation. Idempotent (guarded by title).

insert into public.agent_training_docs (title, summary, content_md, source_kind, status, char_count, tags)
select t.title, t.summary, t.content_md, 'paste', 'ready', char_length(t.content_md),
       array['6-week-challenge','testing','experiences','email-automation']
from (values (
  'How to test the 6-Week Challenge',
  'Step-by-step for running a standard OR expedited (minutes) test of the 6-Week Challenge email automation via Experiences.',
  $md$# How to test the 6-Week Challenge

The 6-Week Challenge is delivered as an **email automation** through the **Experiences** module (Dashboard → Experiences). An admin creates an experience from the "6 Week Challenge" type, adds attendees, and clicks **Send**, which schedules the 21-email participant sequence. A Coolify scheduled task (`node scripts/experiences-cron.mjs`, every ~10 min) releases each email when its time arrives.

## Standard test (full flow)
1. Go to **Dashboard → Experiences → New Experience**.
2. **Trigger:** choose **6 Week Challenge**.
3. **Start date/time:** this is the kickoff/enrollment day. Week 1 lands ~7 days later; the remaining emails follow the built-in day offsets.
4. **Attendees:** add 1–2 test people (name + a real inbox you can check).
5. **Program / Selections:** the 21-step sequence pre-fills with its send offsets — leave as-is for a real-cadence test.
6. **Send:** click **Send**. This creates the scheduled send events (the experience moves to `scheduled`).
7. Open the experience (**Experiences → the experience**) to see the **Schedule** — every email × attendee with its send time and status.
8. Emails go out automatically: the Coolify **experiences** scheduled task releases any email whose time has passed on its next run (~every 10 min).

## Expedited test (see it work in minutes — for a live demo)
Use any of these:
- **Send an email now:** on the experience's **Schedule** table, click **Send now** on any row to email that attendee immediately — no waiting for the scheduler. Best for demoing a specific email.
- **Prove the automation fires on its own:** click **Reschedule** on an email, set it a few minutes in the **past**, then in Coolify open the **experiences** scheduled task and click **Execute now** (or wait for the next 10-minute tick). The email sends automatically.
- **Compress the whole sequence:** when creating the experience, set **Frequency → Custom → every 1 minute** (or edit the per-step offsets to minutes). All 21 emails then come due within minutes instead of spanning weeks.

## Verify
- Check the test attendee's inbox.
- The experience **Schedule** shows each row flip from `scheduled` → `sent` with a timestamp.
- The **Dashboard** and **Reports** reflect activity.

## Clean up
Delete the test experience when finished — this removes its attendees and all its scheduled emails.

## Requirements for sending to work
- `EXPERIENCE_CRON_SECRET` is set on the app, and the Coolify **experiences** scheduled task is running `node scripts/experiences-cron.mjs`.
- An email provider is configured (`RESEND_API_KEY` + `RESEND_FROM_EMAIL`).
- (Draft templates DO send; only archived templates are skipped.)$md$
)) as t(title, summary, content_md)
where not exists (select 1 from public.agent_training_docs where title = 'How to test the 6-Week Challenge');
