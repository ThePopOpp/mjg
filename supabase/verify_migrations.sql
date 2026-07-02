-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFY MIGRATIONS
-- Paste this whole file into the Supabase SQL editor and Run.
-- Every row should say "✅ applied". Any "❌ MISSING" = that migration's .sql
-- file in supabase/migrations/ still needs to be run (run them in filename order).
--
-- This project applies migrations MANUALLY (no migration-tracking table), so this
-- query checks for a signature object created by each migration instead.
-- ─────────────────────────────────────────────────────────────────────────────
with checks(migration, present) as (
  values
    ('001 foundation (participants)',            to_regclass('public.participants') is not null),
    ('003 user management (user_invitations)',   to_regclass('public.user_invitations') is not null),
    ('004 email inbox (email_messages)',         to_regclass('public.email_messages') is not null),
    ('005 email templates',                      to_regclass('public.email_templates') is not null),
    ('006 email automation (mappings)',          to_regclass('public.email_template_mappings') is not null),
    ('011 sms / voice communications',           to_regclass('public.sms_messages') is not null),
    ('013 contacts',                             to_regclass('public.contacts') is not null),
    ('016 agent memory',                         to_regclass('public.agent_memory') is not null),
    ('017 business cards',                       to_regclass('public.business_cards') is not null),
    ('018 mjg-media storage bucket',             exists (select 1 from storage.buckets where id = 'mjg-media')),
    ('019 project manager (schedule items)',     to_regclass('public.project_schedule_items') is not null),
    ('020 bookings & events (booking_types)',    to_regclass('public.booking_types') is not null),
    ('021 social media (social_accounts)',       to_regclass('public.social_accounts') is not null),
    ('022 schedule dates are timestamptz',       exists (select 1 from information_schema.columns
                                                          where table_schema = 'public' and table_name = 'project_schedule_items'
                                                            and column_name = 'start_date' and data_type = 'timestamp with time zone')),
    ('023 PM attachments + links',               to_regclass('public.project_item_attachments') is not null
                                                   and to_regclass('public.project_item_links') is not null),
    ('024 PM visibility column',                 exists (select 1 from information_schema.columns
                                                          where table_schema = 'public' and table_name = 'project_schedule_items'
                                                            and column_name = 'visibility')),
    ('025 visibility allows ''users''',          exists (select 1 from information_schema.check_constraints
                                                          where constraint_name = 'project_schedule_items_visibility_check'
                                                            and check_clause ilike '%users%')),
    ('026 CMS foundation (cms_pages)',           to_regclass('public.cms_pages') is not null
                                                   and to_regclass('public.cms_blocks') is not null),
    ('027 CMS draft_content column',             exists (select 1 from information_schema.columns
                                                          where table_schema = 'public' and table_name = 'cms_pages'
                                                            and column_name = 'draft_content')),
    ('028 CMS block templates',                  to_regclass('public.cms_block_templates') is not null),
    ('029 Steward read-only SQL RPC',            to_regprocedure('public.steward_readonly_query(text)') is not null),
    ('030 Frontend Edits (cms_page_notes)',      to_regclass('public.cms_page_notes') is not null),
    ('031 Dashboard Edits (dashboard_notes)',    to_regclass('public.dashboard_notes') is not null
                                                   and to_regclass('public.dashboard_note_comments') is not null)
)
select migration,
       case when present then '✅ applied' else '❌ MISSING — run this file' end as status
from checks
order by migration;
