-- Project Manager (ported from CMI, reframed for MJG stewardship/ops).
-- A Gantt/Kanban/List/Calendar scheduler: typed schedule items, dependencies,
-- and reusable project templates. Construction-specific tables/associations are
-- intentionally omitted. project_id is a plain uuid (no FK — MJG has no projects table).

-- ── Schedule items ─────────────────────────────────────────────────────────────
create table if not exists public.project_schedule_items (
  id uuid primary key default gen_random_uuid(),
  board_id text default 'default',
  project_id uuid,
  client_project_id uuid,
  type text not null default 'task' check (type in ('project','phase','task','milestone')),
  project_title text,
  title text not null,
  phase text,
  assignee text,
  client text,
  participants text,
  dependencies text,
  start_date date not null,
  end_date date not null,
  status text not null default 'scheduled'
    check (status in ('pending','scheduled','in_progress','waiting','delayed','blocked','needs_approval','complete','canceled')),
  priority text not null default 'normal'
    check (priority in ('low','normal','high','urgent','critical','blocking_closeout')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  notify boolean not null default false,
  description text,
  forms text,
  punch text,
  client_visible boolean not null default false,
  internal_notes text,
  is_blocked boolean not null default false,
  blocker_reason text,
  sort_order integer not null default 0,
  visible_on_gantt boolean not null default true,
  schedule_group_key text,
  template_slug text,
  template_name text,
  duration_minutes integer,
  metadata jsonb not null default '{}'::jsonb,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists psi_board_idx on public.project_schedule_items(board_id);
create index if not exists psi_dates_idx on public.project_schedule_items(start_date, end_date);
create index if not exists psi_status_idx on public.project_schedule_items(status);
create index if not exists psi_group_idx on public.project_schedule_items(schedule_group_key);
create index if not exists psi_sort_idx on public.project_schedule_items(board_id, phase, sort_order);

-- ── Dependencies ───────────────────────────────────────────────────────────────
create table if not exists public.project_schedule_dependencies (
  id uuid primary key default gen_random_uuid(),
  board_id text default 'default',
  project_id uuid,
  client_project_id uuid,
  source_item_id uuid not null references public.project_schedule_items(id) on delete cascade,
  target_item_id uuid not null references public.project_schedule_items(id) on delete cascade,
  dependency_type text not null default 'finish_to_start'
    check (dependency_type in ('finish_to_start','start_to_start','finish_to_finish','start_to_finish')),
  lag_days integer not null default 0,
  auto_shift boolean not null default false,
  notes text,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint psd_unique_pair unique (source_item_id, target_item_id, dependency_type)
);
create index if not exists psd_board_idx on public.project_schedule_dependencies(board_id);
create index if not exists psd_source_idx on public.project_schedule_dependencies(source_item_id);
create index if not exists psd_target_idx on public.project_schedule_dependencies(target_item_id);

-- ── Templates ──────────────────────────────────────────────────────────────────
create table if not exists public.project_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text,
  suggested_duration_days integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_template_tasks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.project_templates(id) on delete cascade,
  phase_name text not null,
  task_key text not null,
  task_name text not null,
  description text,
  offset_days integer not null default 0,
  duration_minutes integer not null default 1440,
  dependency_keys text[] not null default array[]::text[],
  suggested_roles text[] not null default array[]::text[],
  client_visible boolean not null default false,
  priority text not null default 'normal',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (template_id, task_key)
);

-- ── RLS (service-role API bypasses; dashboard staff may read) ──────────────────
alter table public.project_schedule_items enable row level security;
alter table public.project_schedule_dependencies enable row level security;
alter table public.project_templates enable row level security;
alter table public.project_template_tasks enable row level security;

create policy "psi_dashboard_read" on public.project_schedule_items for select using (public.can_access_dashboard());
create policy "psi_team_write" on public.project_schedule_items for all
  using (public.current_app_role() in ('super_admin','admin','team_member'))
  with check (public.current_app_role() in ('super_admin','admin','team_member'));
create policy "psd_dashboard_read" on public.project_schedule_dependencies for select using (public.can_access_dashboard());
create policy "psd_team_write" on public.project_schedule_dependencies for all
  using (public.current_app_role() in ('super_admin','admin','team_member'))
  with check (public.current_app_role() in ('super_admin','admin','team_member'));
create policy "ptpl_dashboard_read" on public.project_templates for select using (public.can_access_dashboard());
create policy "ptask_dashboard_read" on public.project_template_tasks for select using (public.can_access_dashboard());

-- ── Seed: stewardship / ops templates ──────────────────────────────────────────
insert into public.project_templates (name, slug, description, category, suggested_duration_days) values
  ('7-Day Stewardship Pilot Launch','stewardship-pilot-launch','Plan, launch, and report on a 7-day stewardship pilot cohort.','Stewardship',16),
  ('Church / Pastor Partnership Onboarding','church-partnership-onboarding','Onboard a church or pastor partnership through to a launched cohort.','Churches/Pastors',31),
  ('Email Journey Build','email-journey-build','Plan, write, and activate an automated email journey.','Automation',8),
  ('Content Sprint','content-sprint','Plan, produce, and publish a blog/media content sprint.','Marketing',8),
  ('Event Planning','event-planning','Plan and run an event from concept to follow-up.','Events',15),
  ('Survey & Reporting Cycle','survey-reporting-cycle','Design, distribute, and report on a survey cycle.','Reports',13)
on conflict (slug) do nothing;

insert into public.project_template_tasks (template_id, phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
select t.id, x.phase_name, x.task_key, x.task_name, x.description, x.offset_days, x.duration_minutes, x.dependency_keys, x.priority, x.sort_order
from public.project_templates t cross join (values
  ('Plan'::text,'intake'::text,'Define pilot cohort & goals'::text,null::text,0::int,2880::int,array[]::text[],'high'::text,1::int),
  ('Plan','content_prep','Prepare 7-day content',null,2,4320,array['intake'],'high',2),
  ('Plan','email_setup','Set up email journey automation',null,2,2880,array['intake'],'normal',3),
  ('Launch','invite','Send invitations',null,5,1440,array['content_prep','email_setup'],'high',4),
  ('Launch','launch','Launch day 1',null,6,1440,array['invite'],'critical',5),
  ('Run','monitor','Monitor check-ins (days 1-7)',null,6,10080,array['launch'],'normal',6),
  ('Wrap','survey','Send final survey',null,13,1440,array['monitor'],'normal',7),
  ('Wrap','report','Compile pilot report',null,14,2880,array['survey'],'normal',8)
) as x(phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
where t.slug = 'stewardship-pilot-launch'
on conflict (template_id, task_key) do nothing;

insert into public.project_template_tasks (template_id, phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
select t.id, x.phase_name, x.task_key, x.task_name, x.description, x.offset_days, x.duration_minutes, x.dependency_keys, x.priority, x.sort_order
from public.project_templates t cross join (values
  ('Connect'::text,'intake'::text,'Initial pastor conversation'::text,null::text,0::int,1440::int,array[]::text[],'high'::text,1::int),
  ('Connect','materials','Send partnership materials',null,1,2880,array['intake'],'normal',2),
  ('Plan','meeting','Schedule kickoff meeting',null,3,1440,array['materials'],'normal',3),
  ('Plan','enroll','Enroll church group participants',null,4,2880,array['meeting'],'high',4),
  ('Launch','launch','Launch stewardship cohort',null,6,1440,array['enroll'],'critical',5),
  ('Wrap','followup','30-day follow-up',null,30,1440,array['launch'],'normal',6)
) as x(phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
where t.slug = 'church-partnership-onboarding'
on conflict (template_id, task_key) do nothing;

insert into public.project_template_tasks (template_id, phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
select t.id, x.phase_name, x.task_key, x.task_name, x.description, x.offset_days, x.duration_minutes, x.dependency_keys, x.priority, x.sort_order
from public.project_templates t cross join (values
  ('Plan'::text,'plan'::text,'Map journey steps'::text,null::text,0::int,1440::int,array[]::text[],'high'::text,1::int),
  ('Build','write','Write email copy',null,1,4320,array['plan'],'normal',2),
  ('Build','design','Design templates',null,1,4320,array['plan'],'normal',3),
  ('Build','automate','Configure automations',null,4,2880,array['write','design'],'high',4),
  ('Launch','test','Test sends',null,6,1440,array['automate'],'high',5),
  ('Launch','activate','Activate journey',null,7,1440,array['test'],'critical',6)
) as x(phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
where t.slug = 'email-journey-build'
on conflict (template_id, task_key) do nothing;

insert into public.project_template_tasks (template_id, phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
select t.id, x.phase_name, x.task_key, x.task_name, x.description, x.offset_days, x.duration_minutes, x.dependency_keys, x.priority, x.sort_order
from public.project_templates t cross join (values
  ('Plan'::text,'ideate'::text,'Plan content calendar'::text,null::text,0::int,1440::int,array[]::text[],'high'::text,1::int),
  ('Produce','draft','Draft posts',null,1,5760,array['ideate'],'normal',2),
  ('Produce','media','Produce media / audio',null,1,5760,array['ideate'],'normal',3),
  ('Review','review','Review & edit',null,5,2880,array['draft','media'],'normal',4),
  ('Publish','publish','Schedule & publish',null,7,1440,array['review'],'high',5)
) as x(phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
where t.slug = 'content-sprint'
on conflict (template_id, task_key) do nothing;

insert into public.project_template_tasks (template_id, phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
select t.id, x.phase_name, x.task_key, x.task_name, x.description, x.offset_days, x.duration_minutes, x.dependency_keys, x.priority, x.sort_order
from public.project_templates t cross join (values
  ('Plan'::text,'concept'::text,'Define event concept'::text,null::text,0::int,2880::int,array[]::text[],'high'::text,1::int),
  ('Plan','venue','Book venue / platform',null,2,2880,array['concept'],'high',2),
  ('Promote','promote','Promotion & registration',null,4,10080,array['venue'],'normal',3),
  ('Prepare','prep','Prepare materials',null,4,7200,array['venue'],'normal',4),
  ('Run','event','Event day',null,12,1440,array['promote','prep'],'critical',5),
  ('Wrap','recap','Post-event follow-up',null,13,2880,array['event'],'normal',6)
) as x(phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
where t.slug = 'event-planning'
on conflict (template_id, task_key) do nothing;

insert into public.project_template_tasks (template_id, phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
select t.id, x.phase_name, x.task_key, x.task_name, x.description, x.offset_days, x.duration_minutes, x.dependency_keys, x.priority, x.sort_order
from public.project_templates t cross join (values
  ('Design'::text,'design'::text,'Design survey'::text,null::text,0::int,2880::int,array[]::text[],'high'::text,1::int),
  ('Distribute','distribute','Distribute survey',null,2,1440,array['design'],'normal',2),
  ('Collect','collect','Collection window',null,3,10080,array['distribute'],'normal',3),
  ('Analyze','analyze','Analyze responses',null,10,2880,array['collect'],'normal',4),
  ('Report','report','Publish report',null,12,1440,array['analyze'],'high',5)
) as x(phase_name, task_key, task_name, description, offset_days, duration_minutes, dependency_keys, priority, sort_order)
where t.slug = 'survey-reporting-cycle'
on conflict (template_id, task_key) do nothing;
