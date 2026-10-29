-- Soft-delete readers: SQL functions that read soft-deletable tables skip rows with deleted_at set.
-- App-side (supabase-js) readers were updated alongside this migration.
--
-- Only request_group_spot needs it: it is the public entry point for Find a Group, and a trashed
-- group may still carry status 'published'. The other Find a Group RPCs (add_group_member,
-- decide_group_reservation) are reached only after the app has loaded the group through a
-- filtered reader. RLS policies on these tables are dashboard-only, so they are left alone.

create or replace function public.request_group_spot(p_group uuid, p_profile uuid, p_party integer, p_message text, p_name text, p_email text)
returns table (reservation_id uuid, reservation_status text, already boolean)
language plpgsql security definer set search_path = public as $$
declare
  g public.facilitator_groups;
  existing public.facilitator_group_reservations;
  taken integer;
  new_status text;
  rid uuid;
begin
  select * into g from public.facilitator_groups where id = p_group and deleted_at is null for update;
  if not found then raise exception 'group_not_found'; end if;
  if g.status <> 'published' then raise exception 'group_not_open'; end if;
  if g.facilitator_id = p_profile then raise exception 'own_group'; end if;

  select * into existing from public.facilitator_group_reservations
    where group_id = p_group and profile_id = p_profile and status in ('pending','confirmed','waitlisted') limit 1;
  if found then
    return query select existing.id, existing.status, true;
    return;
  end if;

  taken := public.group_spots_taken(p_group);
  if taken + greatest(p_party, 1) > g.capacity then new_status := 'waitlisted';
  elsif g.booking_mode = 'auto' then new_status := 'confirmed';
  else new_status := 'pending';
  end if;

  insert into public.facilitator_group_reservations (group_id, profile_id, name, email, party_size, message, source, status, decided_at)
  values (p_group, p_profile, p_name, lower(p_email), greatest(p_party, 1), p_message, 'request', new_status,
          case when new_status = 'confirmed' then now() end)
  returning id into rid;
  return query select rid, new_status, false;
end $$;

revoke all on function public.request_group_spot(uuid, uuid, integer, text, text, text) from public, anon, authenticated;
grant execute on function public.request_group_spot(uuid, uuid, integer, text, text, text) to service_role;
