-- Follow-up to 202609240094: that migration handled "Keystone Habits" and
-- "keystone habits", but the training documents also use sentence case
-- ("Keystone habits create the rhythms that reinforce your structure").
--
-- This pass is case-insensitive and case-preserving, so every remaining spelling
-- is covered, and it is safe to re-run: text that has already been renamed no
-- longer matches. The storage key 'habits' and generic uses of the word "habit"
-- are still never touched — the pattern requires the word "keystone" in front.

create or replace function pg_temp.keystone_rename(input text)
returns text language plpgsql immutable as $$
declare
  result text := coalesce(input, '');
begin
  -- Longest/most specific first so "Habits" never becomes "Habit" + a stray "s".
  result := replace(result, 'KEYSTONE HABITS', 'KEYSTONE RHYTHMS');
  result := replace(result, 'KEYSTONE HABIT',  'KEYSTONE RHYTHM');
  result := replace(result, 'Keystone Habits', 'Keystone Rhythms');
  result := replace(result, 'Keystone Habit',  'Keystone Rhythm');
  result := replace(result, 'Keystone habits', 'Keystone rhythms');
  result := replace(result, 'Keystone habit',  'Keystone rhythm');
  result := replace(result, 'keystone habits', 'keystone rhythms');
  result := replace(result, 'keystone habit',  'keystone rhythm');
  return result;
end;
$$;

update public.agent_training_docs
   set content_md = pg_temp.keystone_rename(content_md)
 where content_md ilike '%keystone habit%';

update public.check_in_answers
   set section_label = pg_temp.keystone_rename(section_label),
       question      = pg_temp.keystone_rename(question)
 where section_label ilike '%keystone habit%' or question ilike '%keystone habit%';

update public.check_in_submissions
   set layer_scores = pg_temp.keystone_rename(layer_scores::text)::jsonb
 where layer_scores::text ilike '%keystone habit%';

update public.challenge_videos
   set subtitle    = pg_temp.keystone_rename(subtitle),
       description = pg_temp.keystone_rename(description)
 where subtitle ilike '%keystone habit%' or description ilike '%keystone habit%';

update public.email_templates
   set html_body = pg_temp.keystone_rename(html_body),
       text_body = pg_temp.keystone_rename(text_body)
 where html_body ilike '%keystone habit%' or text_body ilike '%keystone habit%';

update public.website_pages
   set draft_content     = pg_temp.keystone_rename(draft_content::text)::jsonb,
       published_content = case
         when published_content is null then null
         else pg_temp.keystone_rename(published_content::text)::jsonb
       end
 where draft_content::text ilike '%keystone habit%'
    or published_content::text ilike '%keystone habit%';

update public.cms_pages
   set draft_content = pg_temp.keystone_rename(draft_content::text)::jsonb
 where draft_content::text ilike '%keystone habit%';
