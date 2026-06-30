-- Project Manager: add 'users' (User Based) visibility — visible to the project's
-- assignee + participants (matched by email) plus the creator. Widens the
-- existing team/private/roles check constraint.
alter table public.project_schedule_items drop constraint if exists project_schedule_items_visibility_check;
alter table public.project_schedule_items
  add constraint project_schedule_items_visibility_check
  check (visibility in ('team','private','roles','users'));
