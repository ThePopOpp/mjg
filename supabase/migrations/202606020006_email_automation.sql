create table if not exists public.email_template_mappings (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  template_id uuid references public.email_templates(id) on delete set null,
  enabled boolean not null default true,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_journey_events
  add column if not exists template_id uuid references public.email_templates(id) on delete set null,
  add column if not exists last_attempt_at timestamptz;

create index if not exists email_template_mappings_event_idx on public.email_template_mappings(event_key);
create index if not exists email_journey_events_due_idx on public.email_journey_events(status, scheduled_at);
create index if not exists email_journey_events_template_idx on public.email_journey_events(template_id);

alter table public.email_template_mappings enable row level security;

drop policy if exists "email_template_mappings_dashboard_read" on public.email_template_mappings;
create policy "email_template_mappings_dashboard_read" on public.email_template_mappings
for select using (public.current_app_role() in ('super_admin', 'admin', 'team_member', 'content_reviewer'));

drop policy if exists "email_template_mappings_admin_write" on public.email_template_mappings;
create policy "email_template_mappings_admin_write" on public.email_template_mappings
for all using (public.current_app_role() in ('super_admin', 'admin'))
with check (public.current_app_role() in ('super_admin', 'admin'));

insert into public.email_template_mappings (event_key, description) values
  ('user_invitation', 'Dashboard account invitation email.'),
  ('check_in_completed', 'Sent after the Created for More Check-In is completed.'),
  ('survey_general_invite', 'Final survey invitation for general participants.'),
  ('survey_pastor_elder_invite', 'Final survey invitation for pastor, elder, and church leader reviewers.'),
  ('inner_circle_invite', 'Invitation to continue with the Stewardship Blueprint Inner Circle.'),
  ('email_journey_welcome', 'Email 0: Welcome and next steps.'),
  ('email_journey_day_1', 'Email 1: Day 1.'),
  ('email_journey_day_2', 'Email 2: Day 2.'),
  ('email_journey_day_3', 'Email 3: Day 3.'),
  ('email_journey_day_4', 'Email 4: Day 4.'),
  ('email_journey_day_5', 'Email 5: Day 5.'),
  ('email_journey_day_6', 'Email 6: Day 6.'),
  ('email_journey_day_7', 'Email 7: Day 7.'),
  ('email_journey_final_survey', 'Email 8: Final survey invitation.'),
  ('email_journey_survey_reminder', 'Email 9: Survey reminder.'),
  ('email_journey_thank_you_share', 'Email 10: Thank-you and share request.'),
  ('email_journey_inner_circle', 'Email 11: Inner Circle invitation.'),
  ('email_journey_behind_the_scenes', 'Email 12: Behind-the-scenes follow-up.')
on conflict (event_key) do nothing;
