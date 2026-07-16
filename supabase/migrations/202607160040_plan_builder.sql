-- Plan Builder — planner-style project management. See docs/features/dashboard-planner.md.
--
-- Self-contained plan_* module. It deliberately does NOT touch the existing Project
-- Manager (project_schedule_items), which keeps working unchanged; the schema is
-- shaped so PM items can be migrated into plan_tasks in a later phase.
--
-- MJG is single-tenant: there is no workspace_id anywhere in this app, so plans have
-- no workspace. client_id/project_id are plain nullable uuids with NO foreign key —
-- MJG has no clients/projects tables, and leaving them un-FK'd keeps this module
-- portable to apps that do.
--
-- Unlike PM (service-role reads + app-side visibility filtering), this module defines
-- real per-plan RLS via can_view_plan()/can_edit_plan()/can_manage_plan(). Dashboard
-- reads still go through the service-role client (which bypasses RLS), so the guards
-- in lib/plans/auth.ts mirror these functions and are the primary enforcement; RLS is
-- defense-in-depth for any direct/anon-key access.
--
-- Membership resolves through public.current_profile_id() (matches auth_user_id OR
-- id), NOT auth.uid() directly — profiles.id and auth.users.id diverge in this app.

-- ---------------------------------------------------------------------------
-- Templates (created first: plans.template_id references it)
-- ---------------------------------------------------------------------------
create table if not exists public.plan_templates (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  name          text not null,
  description   text,
  category      text not null default 'Custom',
  plan_type     text not null default 'basic',   -- basic|premium
  visibility    text not null default 'app',     -- app|shared|private (drives the source tabs)
  preview_url   text,
  badge         text,                            -- recommended|new|null
  template_data jsonb not null default '{}'::jsonb,  -- { groups:[], labels:[], tasks:[], views:[] }
  is_system_template boolean not null default false,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Plans
-- ---------------------------------------------------------------------------
create table if not exists public.plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text,
  description   text,
  plan_type     text not null default 'basic',   -- basic|premium
  visibility    text not null default 'team',    -- private|team
  status        text not null default 'active',  -- active|archived
  owner_id      uuid not null references public.profiles(id) on delete cascade,
  default_view  text not null default 'board',   -- grid|board
  color         text not null default 'gold',    -- gold|sand|clay|plum|slate|ink (see lib/plans/constants.ts)
  icon          text not null default 'clipboard-list',
  cover_url     text,
  start_date    date,
  target_date   date,
  template_id   uuid references public.plan_templates(id) on delete set null,
  template_slug text,
  client_id     uuid,                            -- intentionally no FK; see header
  project_id    uuid,                            -- intentionally no FK; see header
  settings      jsonb not null default '{}'::jsonb,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  archived_at   timestamptz,
  constraint plans_plan_type_check  check (plan_type in ('basic', 'premium')),
  constraint plans_visibility_check check (visibility in ('private', 'team'))
);

create table if not exists public.plan_members (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.plans(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'member',     -- owner|editor|member|viewer
  notification_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (plan_id, user_id),
  constraint plan_members_role_check check (role in ('owner', 'editor', 'member', 'viewer'))
);

create table if not exists public.plan_groups (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid not null references public.plans(id) on delete cascade,
  name         text not null,
  description  text,
  position     integer not null default 0,
  color        text,
  is_collapsed boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.plan_labels (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references public.plans(id) on delete cascade,
  name       text not null,
  color      text not null default 'gold',
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.plan_tasks (
  id             uuid primary key default gen_random_uuid(),
  plan_id        uuid not null references public.plans(id) on delete cascade,
  group_id       uuid references public.plan_groups(id) on delete set null,
  parent_task_id uuid references public.plan_tasks(id) on delete cascade,
  title          text not null,
  description    text,
  notes          text,
  status         text not null default 'not_started', -- not_started|in_progress|waiting|blocked|complete
  priority       text not null default 'medium',      -- low|medium|high|urgent
  progress       integer not null default 0,          -- 0..100
  start_date     date,
  due_date       date,
  estimated_minutes integer,
  actual_minutes    integer,
  is_milestone   boolean not null default false,
  position       integer not null default 0,
  created_by     uuid references public.profiles(id) on delete set null,
  completed_by   uuid references public.profiles(id) on delete set null,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  archived_at    timestamptz,
  constraint plan_tasks_status_check   check (status in ('not_started', 'in_progress', 'waiting', 'blocked', 'complete')),
  constraint plan_tasks_priority_check check (priority in ('low', 'medium', 'high', 'urgent')),
  constraint plan_tasks_progress_check check (progress between 0 and 100)
);

create table if not exists public.plan_task_assignees (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.plan_tasks(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique (task_id, user_id)
);

create table if not exists public.plan_task_labels (
  id       uuid primary key default gen_random_uuid(),
  task_id  uuid not null references public.plan_tasks(id) on delete cascade,
  label_id uuid not null references public.plan_labels(id) on delete cascade,
  unique (task_id, label_id)
);

create table if not exists public.plan_task_checklist_items (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.plan_tasks(id) on delete cascade,
  title        text not null,
  is_complete  boolean not null default false,
  position     integer not null default 0,
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

-- Activity / audit trail. Plan-scoped; the global user_activity_logs table still
-- receives a coarse entry per plan creation (see lib/plans/repository.ts).
create table if not exists public.plan_activity (
  id             uuid primary key default gen_random_uuid(),
  plan_id        uuid not null references public.plans(id) on delete cascade,
  task_id        uuid references public.plan_tasks(id) on delete cascade,
  actor_id       uuid references public.profiles(id) on delete set null,
  action         text not null,                   -- plan_created|task_created|task_updated|task_moved|task_deleted|...
  entity_type    text,                            -- plan|task|group|label|member
  entity_id      uuid,
  previous_value jsonb,
  new_value      jsonb,
  source         text not null default 'user',    -- user|admin|automation|api|import|ai
  metadata       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists plans_owner_idx            on public.plans(owner_id, updated_at desc);
create index if not exists plans_status_idx           on public.plans(status, updated_at desc);
create index if not exists plan_members_plan_idx      on public.plan_members(plan_id);
create index if not exists plan_members_user_idx      on public.plan_members(user_id);
create index if not exists plan_groups_plan_idx       on public.plan_groups(plan_id, position);
create index if not exists plan_labels_plan_idx       on public.plan_labels(plan_id, position);
create index if not exists plan_tasks_plan_idx        on public.plan_tasks(plan_id, position);
create index if not exists plan_tasks_group_idx       on public.plan_tasks(group_id, position);
create index if not exists plan_tasks_due_idx         on public.plan_tasks(plan_id, due_date);
create index if not exists plan_task_assignees_task_idx  on public.plan_task_assignees(task_id);
create index if not exists plan_task_assignees_user_idx  on public.plan_task_assignees(user_id);
create index if not exists plan_task_labels_task_idx     on public.plan_task_labels(task_id);
create index if not exists plan_task_checklist_task_idx  on public.plan_task_checklist_items(task_id, position);
create index if not exists plan_activity_plan_idx        on public.plan_activity(plan_id, created_at desc);
create index if not exists plan_templates_category_idx   on public.plan_templates(category, name);

-- ---------------------------------------------------------------------------
-- Authorization helpers
-- ---------------------------------------------------------------------------
create or replace function public.plan_member_role(p_plan_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.plan_members
  where plan_id = p_plan_id and user_id = public.current_profile_id()
  limit 1
$$;

create or replace function public.can_view_plan(p_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_super_admin() then true
    else exists (
      select 1 from public.plans p
      where p.id = p_plan_id
        and (
          p.owner_id = public.current_profile_id()
          or public.plan_member_role(p_plan_id) is not null
          or (p.visibility = 'team' and public.can_access_dashboard())
        )
    )
  end
$$;

-- Edit = create/update tasks, groups, labels. An explicit 'viewer' membership is
-- read-only even on a team-visible plan, and archived plans are frozen.
create or replace function public.can_edit_plan(p_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.plan_member_role(p_plan_id) = 'viewer' then false
    when public.is_super_admin() then true
    else exists (
      select 1 from public.plans p
      where p.id = p_plan_id
        and p.archived_at is null
        and (
          p.owner_id = public.current_profile_id()
          or public.plan_member_role(p_plan_id) in ('owner', 'editor', 'member')
          or (p.visibility = 'team' and public.can_access_dashboard())
        )
    )
  end
$$;

-- Manage = plan settings, members, archive/delete. Owner (or super admin) only.
create or replace function public.can_manage_plan(p_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_super_admin() then true
    else exists (
      select 1 from public.plans p
      where p.id = p_plan_id
        and (p.owner_id = public.current_profile_id() or public.plan_member_role(p_plan_id) = 'owner')
    )
  end
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.plans                     enable row level security;
alter table public.plan_members              enable row level security;
alter table public.plan_groups               enable row level security;
alter table public.plan_labels               enable row level security;
alter table public.plan_tasks                enable row level security;
alter table public.plan_task_assignees       enable row level security;
alter table public.plan_task_labels          enable row level security;
alter table public.plan_task_checklist_items enable row level security;
alter table public.plan_activity             enable row level security;
alter table public.plan_templates            enable row level security;

do $$
declare t text;
begin
  -- Tables owning a direct plan_id: read if you can view the plan, write if you can edit it.
  foreach t in array array['plan_groups', 'plan_labels', 'plan_tasks'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_select') then
      execute format('create policy %I on public.%I for select using (public.can_view_plan(plan_id))', t || '_select', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_write') then
      execute format('create policy %I on public.%I for all using (public.can_edit_plan(plan_id)) with check (public.can_edit_plan(plan_id))', t || '_write', t);
    end if;
  end loop;

  -- Task children reach the plan through plan_tasks rather than a denormalized
  -- plan_id, so the predicate is a subquery.
  foreach t in array array['plan_task_assignees', 'plan_task_labels', 'plan_task_checklist_items'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_select') then
      execute format('create policy %I on public.%I for select using (public.can_view_plan((select pt.plan_id from public.plan_tasks pt where pt.id = task_id)))', t || '_select', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_write') then
      execute format('create policy %I on public.%I for all using (public.can_edit_plan((select pt.plan_id from public.plan_tasks pt where pt.id = task_id))) with check (public.can_edit_plan((select pt.plan_id from public.plan_tasks pt where pt.id = task_id)))', t || '_write', t);
    end if;
  end loop;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plans' and policyname = 'plans_select') then
    execute 'create policy plans_select on public.plans for select using (public.can_view_plan(id))';
  end if;
  -- You may only create a plan you own; the API additionally checks the premium flag.
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plans' and policyname = 'plans_insert') then
    execute 'create policy plans_insert on public.plans for insert with check (owner_id = public.current_profile_id() or public.is_super_admin())';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plans' and policyname = 'plans_update') then
    execute 'create policy plans_update on public.plans for update using (public.can_manage_plan(id)) with check (public.can_manage_plan(id))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plans' and policyname = 'plans_delete') then
    execute 'create policy plans_delete on public.plans for delete using (public.can_manage_plan(id))';
  end if;

  -- Members are readable by anyone who can see the plan; only owners change them.
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plan_members' and policyname = 'plan_members_select') then
    execute 'create policy plan_members_select on public.plan_members for select using (public.can_view_plan(plan_id))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plan_members' and policyname = 'plan_members_write') then
    execute 'create policy plan_members_write on public.plan_members for all using (public.can_manage_plan(plan_id)) with check (public.can_manage_plan(plan_id))';
  end if;

  -- Activity is an audit trail: readable, never client-writable (service role only).
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plan_activity' and policyname = 'plan_activity_select') then
    execute 'create policy plan_activity_select on public.plan_activity for select using (public.can_view_plan(plan_id))';
  end if;

  -- Templates: app + shared templates are readable by every dashboard user; a
  -- private template is visible only to its author. Super admins own the app ones.
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plan_templates' and policyname = 'plan_templates_select') then
    execute 'create policy plan_templates_select on public.plan_templates for select using (public.can_access_dashboard() and (visibility in (''app'', ''shared'') or created_by = public.current_profile_id()))';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'plan_templates' and policyname = 'plan_templates_write') then
    execute 'create policy plan_templates_write on public.plan_templates for all using (public.is_super_admin() or (created_by = public.current_profile_id() and not is_system_template)) with check (public.is_super_admin() or (created_by = public.current_profile_id() and not is_system_template))';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Atomic plan creation
--
-- The Supabase JS client cannot open a transaction, so plan + owner + members +
-- groups + labels + tasks + checklists + the activity row are created here in one
-- statement — a partially-built plan is never observable.
--
-- SECURITY DEFINER with execute revoked from anon/authenticated: this is called
-- only by the service-role client in app/api/plans, AFTER authorization in
-- lib/plans/auth.ts. p_actor_id is trusted and must never come from the request body.
-- ---------------------------------------------------------------------------
create or replace function public.create_plan_from_template(
  p_actor_id      uuid,
  p_plan          jsonb,
  p_template_data jsonb default '{}'::jsonb,
  p_member_ids    uuid[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id   uuid;
  v_group     jsonb;
  v_label     jsonb;
  v_task      jsonb;
  v_group_map jsonb := '{}'::jsonb;   -- template group key/name -> new plan_groups.id
  v_group_id  uuid;
  v_task_id   uuid;
  v_member    uuid;
  v_start     date;
  v_pos       int;
begin
  if coalesce(trim(p_plan->>'name'), '') = '' then
    raise exception 'Plan name is required.';
  end if;

  v_start := nullif(p_plan->>'start_date', '')::date;

  insert into public.plans (
    name, slug, description, plan_type, visibility, owner_id, default_view,
    color, icon, start_date, target_date, template_id, template_slug,
    client_id, project_id, settings, created_by
  ) values (
    trim(p_plan->>'name'),
    nullif(p_plan->>'slug', ''),
    nullif(p_plan->>'description', ''),
    coalesce(p_plan->>'plan_type', 'basic'),
    coalesce(p_plan->>'visibility', 'team'),
    p_actor_id,
    coalesce(p_plan->>'default_view', 'board'),
    coalesce(p_plan->>'color', 'gold'),
    coalesce(p_plan->>'icon', 'clipboard-list'),
    v_start,
    nullif(p_plan->>'target_date', '')::date,
    nullif(p_plan->>'template_id', '')::uuid,
    nullif(p_plan->>'template_slug', ''),
    nullif(p_plan->>'client_id', '')::uuid,
    nullif(p_plan->>'project_id', '')::uuid,
    coalesce(p_plan->'settings', '{}'::jsonb),
    p_actor_id
  )
  returning id into v_plan_id;

  insert into public.plan_members (plan_id, user_id, role)
  values (v_plan_id, p_actor_id, 'owner')
  on conflict (plan_id, user_id) do nothing;

  foreach v_member in array coalesce(p_member_ids, '{}'::uuid[]) loop
    if v_member is distinct from p_actor_id then
      insert into public.plan_members (plan_id, user_id, role)
      values (v_plan_id, v_member, 'member')
      on conflict (plan_id, user_id) do nothing;
    end if;
  end loop;

  v_pos := 0;
  for v_group in select value from jsonb_array_elements(coalesce(p_template_data->'groups', '[]'::jsonb)) loop
    insert into public.plan_groups (plan_id, name, description, position, color)
    values (v_plan_id, v_group->>'name', nullif(v_group->>'description', ''), v_pos, nullif(v_group->>'color', ''))
    returning id into v_group_id;
    v_group_map := v_group_map || jsonb_build_object(coalesce(v_group->>'key', v_group->>'name'), v_group_id::text);
    v_pos := v_pos + 1;
  end loop;

  v_pos := 0;
  for v_label in select value from jsonb_array_elements(coalesce(p_template_data->'labels', '[]'::jsonb)) loop
    insert into public.plan_labels (plan_id, name, color, position)
    values (v_plan_id, v_label->>'name', coalesce(nullif(v_label->>'color', ''), 'gold'), v_pos);
    v_pos := v_pos + 1;
  end loop;

  -- Template tasks always start fresh: no comments and no completion history are
  -- carried over, and status falls back to 'not_started' unless the template names
  -- a starting status. Relative offsets resolve against the plan start date; with
  -- no start date the task is simply unscheduled.
  v_pos := 0;
  for v_task in select value from jsonb_array_elements(coalesce(p_template_data->'tasks', '[]'::jsonb)) loop
    insert into public.plan_tasks (
      plan_id, group_id, title, description, status, priority, position,
      start_date, due_date, is_milestone, created_by
    ) values (
      v_plan_id,
      nullif(v_group_map->>coalesce(v_task->>'group_key', v_task->>'group', ''), '')::uuid,
      v_task->>'title',
      nullif(v_task->>'description', ''),
      coalesce(nullif(v_task->>'status', ''), 'not_started'),
      coalesce(nullif(v_task->>'priority', ''), 'medium'),
      v_pos,
      case when v_start is not null and v_task ? 'start_offset_days'
           then v_start + ((v_task->>'start_offset_days')::int) end,
      case when v_start is not null and v_task ? 'due_offset_days'
           then v_start + ((v_task->>'due_offset_days')::int) end,
      coalesce((v_task->>'is_milestone')::boolean, false),
      p_actor_id
    )
    returning id into v_task_id;

    if v_task ? 'checklist' then
      insert into public.plan_task_checklist_items (task_id, title, position)
      select v_task_id, item.value, (item.ordinality - 1)::int
      from jsonb_array_elements_text(v_task->'checklist') with ordinality as item(value, ordinality);
    end if;

    v_pos := v_pos + 1;
  end loop;

  insert into public.plan_activity (plan_id, actor_id, action, entity_type, entity_id, new_value, source)
  values (
    v_plan_id, p_actor_id, 'plan_created', 'plan', v_plan_id,
    jsonb_build_object(
      'name', trim(p_plan->>'name'),
      'plan_type', coalesce(p_plan->>'plan_type', 'basic'),
      'template_slug', p_plan->>'template_slug'
    ),
    'user'
  );

  return v_plan_id;
end
$$;

revoke all on function public.create_plan_from_template(uuid, jsonb, jsonb, uuid[]) from public;
revoke all on function public.create_plan_from_template(uuid, jsonb, jsonb, uuid[]) from anon;
revoke all on function public.create_plan_from_template(uuid, jsonb, jsonb, uuid[]) from authenticated;
grant execute on function public.create_plan_from_template(uuid, jsonb, jsonb, uuid[]) to service_role;
