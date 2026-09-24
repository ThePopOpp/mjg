-- Rename the branded term "Keystone Habits" to "Keystone Rhythms" across stored
-- content, matching the same rename in lib/check-in/created-for-more.ts,
-- lib/pilot/constants.ts and lib/six-week-challenge/videos.ts.
--
-- SCOPE — deliberately narrow:
--   • Only the branded phrase is touched, in both cases and both numbers.
--     Generic uses of the word "habits" ("Do my daily habits move me toward the
--     life I say I want?") are left exactly as written.
--   • The STORAGE KEY 'habits' is never touched. It is what links a submission's
--     layer score to its section; renaming it would orphan every historical
--     check-in. Only display titles change.
--
-- HISTORICAL ROWS: check_in_answers and check_in_submissions.layer_scores hold a
-- snapshot of the label a participant saw at the time. Those labels are updated
-- too, so reports do not show two different names for the same section depending
-- on when someone answered. No score, answer or ranking is altered.

-- Case-preserving replacement, plural before singular so "Habits" is not left
-- as "Habit" + "s".
create or replace function pg_temp.keystone_rename(input text)
returns text language sql immutable as $$
  select replace(replace(replace(replace(
    coalesce(input, ''),
    'Keystone Habits', 'Keystone Rhythms'),
    'Keystone Habit',  'Keystone Rhythm'),
    'keystone habits', 'keystone rhythms'),
    'keystone habit',  'keystone rhythm')
$$;

-- ── Check-in question bank (denormalised display text on each answer) ────────
update public.check_in_answers
   set section_label = pg_temp.keystone_rename(section_label)
 where section_label ilike '%keystone habit%';

update public.check_in_answers
   set question = pg_temp.keystone_rename(question)
 where question ilike '%keystone habit%';

-- ── Stored per-section results (jsonb array of layer objects) ────────────────
-- Round-tripped through text so only the labels inside change; `key`, `score`
-- and `status` are untouched because they never contain the phrase.
update public.check_in_submissions
   set layer_scores = pg_temp.keystone_rename(layer_scores::text)::jsonb
 where layer_scores::text ilike '%keystone habit%';

-- ── 6-Week Challenge video copy ─────────────────────────────────────────────
update public.challenge_videos
   set subtitle    = pg_temp.keystone_rename(subtitle),
       description = pg_temp.keystone_rename(description)
 where subtitle ilike '%keystone habit%' or description ilike '%keystone habit%';

-- ── Email templates (both the HTML and plain-text bodies) ───────────────────
update public.email_templates
   set html_body = pg_temp.keystone_rename(html_body),
       text_body = pg_temp.keystone_rename(text_body)
 where html_body ilike '%keystone habit%' or text_body ilike '%keystone habit%';

-- ── Steward's training documents ────────────────────────────────────────────
-- Keeps the agent from quoting the retired term back at anyone.
update public.agent_training_docs
   set content_md = pg_temp.keystone_rename(content_md)
 where content_md ilike '%keystone habit%';

-- ── Frontend Editor content, for whenever pages start using the term ────────
update public.website_pages
   set draft_content     = pg_temp.keystone_rename(draft_content::text)::jsonb,
       published_content = case
         when published_content is null then null
         else pg_temp.keystone_rename(published_content::text)::jsonb
       end
 where draft_content::text ilike '%keystone habit%'
    or published_content::text ilike '%keystone habit%';

-- ── Legacy CMS pages ────────────────────────────────────────────────────────
update public.cms_pages
   set draft_content = pg_temp.keystone_rename(draft_content::text)::jsonb
 where draft_content::text ilike '%keystone habit%';
