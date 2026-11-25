-- profiles.id and auth.users.id diverge in this app, so ownership resolves through
-- public.current_profile_id() (matches auth_user_id OR id), as in plan_builder.
drop policy if exists dashboard_personal_items_owner on public.dashboard_personal_items;
create policy dashboard_personal_items_owner on public.dashboard_personal_items
  for all to authenticated
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
