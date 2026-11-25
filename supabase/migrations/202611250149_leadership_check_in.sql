-- The Leadership Check-In (docs/assessments/Leadership_Check_In_Jeremy_Implementation_Kit.docx).
--
-- Results reuse public.check_in_submissions with assessment = 'leadership-check-in'
-- (one row per attempt; history preserved). No new table.
--
-- Two release switches, both OFF. Super admins always pass a feature flag, so they can
-- preview everything while it is off; enabled_profile_ids lets named test accounts in.
--   leadership_check_in.public  — the public page, its Assessments-hub card and sitemap
--                                 entry. Off: /leadership-check-in is visible to super
--                                 admins only (everyone else gets a 404).
--   leadership_check_in.steward — Steward Leadership Mode (kit Phase 2): the "talk to
--                                 Steward" hand-off on the results, and Steward reading
--                                 these results. The kit forbids mentioning Steward on the
--                                 assessment until Mike approves the tested integration.

insert into public.feature_flags (key, description, enabled)
values
  ('leadership_check_in.public',
   'Leadership Check-In: public page at /leadership-check-in, Assessments hub card and sitemap. Off = super admins only.',
   false),
  ('leadership_check_in.steward',
   'Leadership Check-In: Steward hand-off on results + Steward reads these results (Leadership Mode, Phase 2). Mike approves before enabling.',
   false)
on conflict (key) do nothing;

-- "Readable by MCP" for these results — off by default, like the others.
insert into public.assessment_settings (assessment)
values ('leadership-check-in')
on conflict (assessment) do nothing;
