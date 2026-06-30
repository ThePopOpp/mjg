-- Project Manager: role-based / private visibility for projects.
-- Visibility lives on PROJECT items; tasks/phases/milestones strictly inherit
-- their project's visibility. Enforcement is app-level (the PM loads via the
-- service-role client, which bypasses RLS), so these columns are read by the
-- data loader + API routes to filter what each viewer sees.
--   team    = everyone with dashboard access (default; current behavior)
--   private = only the creator (created_by) — strict, hidden even from admins
--   roles   = only the roles listed in visible_roles (plus the creator)
alter table public.project_schedule_items
  add column if not exists visibility text not null default 'team'
    check (visibility in ('team','private','roles')),
  add column if not exists visible_roles text[] not null default array[]::text[];

create index if not exists psi_visibility_idx on public.project_schedule_items(visibility);
