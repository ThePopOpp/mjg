-- The Energy Audit Check-In is stored in check_in_submissions alongside the Created for More
-- Check-In (discriminated by the `assessment` column: 'energy-audit' vs 'created-for-more').
-- Its section scores fit the existing layer_scores / total_score / stage / strongest_layer /
-- lowest_layer columns, but its "Identify Your Next Step" answers and optional reflections have
-- no home — they go in this assessment-specific details document.
--
-- Readers that mean "completed the Created for More Check-In" must filter on
-- assessment = 'created-for-more' so an Energy Audit is never counted as one.
alter table public.check_in_submissions
  add column if not exists details jsonb not null default '{}'::jsonb;

create index if not exists check_in_submissions_assessment_idx
  on public.check_in_submissions (assessment, created_at desc);
