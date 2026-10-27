-- Facilitator listings & Find a Group.
-- A facilitator publishes one or more groups (when/where/how many). Participants browse
-- them publicly, then request a spot: auto-booked or facilitator-approved. Confirmed spots
-- count against capacity. Every group owns a facilitator_team so confirmed members land on
-- the facilitator's team (DM eligibility, team results, experience drips) like today.
--
-- Location privacy: lat/lng/address_line are private. Public pages read public_lat/public_lng
-- (a fuzzed point computed by the app) unless show_exact_address is on.
--
-- All writes go through the app's server code with the service role; RLS below only governs
-- direct reads. Spot-taking goes through the row-locking RPCs so two people can't both take
-- the last spot.

-- ── Public facilitator profile ───────────────────────────────────────────────────
create table if not exists public.facilitator_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  bio text,
  photo_url text,
  church_org text,
  city text,
  state text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Groups (the listings) ────────────────────────────────────────────────────────
create table if not exists public.facilitator_groups (
  id uuid primary key default gen_random_uuid(),
  facilitator_id uuid not null references public.profiles(id) on delete cascade,
  team_id uuid references public.facilitator_teams(id) on delete set null,
  experience_id uuid references public.experiences(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text,
  audience text not null default 'men' check (audience in ('men','women','couples','mixed','youth')),
  language text not null default 'English',
  photo_url text,
  church_org text,
  meeting_day smallint check (meeting_day between 0 and 6),
  meeting_time time,
  timezone text not null default 'America/Phoenix',
  frequency text not null default 'weekly' check (frequency in ('weekly','biweekly')),
  start_date date,
  duration_weeks smallint not null default 6 check (duration_weeks between 1 and 52),
  format text not null default 'in_person' check (format in ('in_person','online','hybrid')),
  venue_name text,
  address_line text,
  city text,
  state text,
  postal_code text,
  lat double precision,
  lng double precision,
  public_lat double precision,
  public_lng double precision,
  show_exact_address boolean not null default false,
  capacity smallint not null default 10 check (capacity between 1 and 200),
  booking_mode text not null default 'approval' check (booking_mode in ('auto','approval')),
  status text not null default 'draft' check (status in ('draft','published','closed','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists facilitator_groups_facilitator_idx on public.facilitator_groups(facilitator_id);
create index if not exists facilitator_groups_status_idx on public.facilitator_groups(status);

-- ── Reservations (spots) ─────────────────────────────────────────────────────────
-- A request from a signed-in participant has profile_id. A person the facilitator adds by
-- hand may not have an account yet, so name/email/participant_id carry them instead.
create table if not exists public.facilitator_group_reservations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.facilitator_groups(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  participant_id uuid references public.participants(id) on delete set null,
  name text,
  email text,
  party_size smallint not null default 1 check (party_size between 1 and 4),
  message text,
  source text not null default 'request' check (source in ('request','facilitator','import')),
  status text not null default 'pending' check (status in ('pending','confirmed','waitlisted','declined','canceled')),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fgr_group_idx on public.facilitator_group_reservations(group_id, status);
create index if not exists fgr_profile_idx on public.facilitator_group_reservations(profile_id);
create unique index if not exists fgr_active_profile_uidx on public.facilitator_group_reservations(group_id, profile_id)
  where profile_id is not null and status in ('pending','confirmed','waitlisted');
create unique index if not exists fgr_active_email_uidx on public.facilitator_group_reservations(group_id, lower(email))
  where email is not null and status in ('pending','confirmed','waitlisted');

-- ── Launch gate (single row) ─────────────────────────────────────────────────────
-- hidden: public pages 404 (super admins can still preview) · preview: browse only,
-- "requests open <opens_label>" · open: messaging + requests on.
create table if not exists public.group_finder_settings (
  id smallint primary key default 1 check (id = 1),
  mode text not null default 'hidden' check (mode in ('hidden','preview','open')),
  opens_label text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.group_finder_settings (id) values (1) on conflict (id) do nothing;

-- ── Spot RPCs ────────────────────────────────────────────────────────────────────
create or replace function public.group_spots_taken(p_group uuid)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(sum(party_size), 0)::int from public.facilitator_group_reservations
  where group_id = p_group and status = 'confirmed'
$$;

-- A participant asks for a spot. Full → waitlisted; otherwise auto → confirmed, approval → pending.
-- Returns the reservation (existing active one if they already asked).
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
  select * into g from public.facilitator_groups where id = p_group for update;
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

-- The facilitator (or an admin) decides. confirm re-checks room; decline/cancel free the spot.
create or replace function public.decide_group_reservation(p_reservation uuid, p_decision text, p_actor uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  r public.facilitator_group_reservations;
  g public.facilitator_groups;
  taken integer;
  new_status text;
begin
  select * into r from public.facilitator_group_reservations where id = p_reservation;
  if not found then raise exception 'reservation_not_found'; end if;
  select * into g from public.facilitator_groups where id = r.group_id for update;

  if p_decision = 'confirm' then
    if r.status = 'confirmed' then return 'confirmed'; end if;
    if r.status not in ('pending','waitlisted') then raise exception 'not_pending'; end if;
    taken := public.group_spots_taken(r.group_id);
    if taken + r.party_size > g.capacity then raise exception 'no_room'; end if;
    new_status := 'confirmed';
  elsif p_decision = 'decline' then
    if r.status not in ('pending','waitlisted') then raise exception 'not_pending'; end if;
    new_status := 'declined';
  elsif p_decision = 'cancel' then
    if r.status not in ('pending','confirmed','waitlisted') then return r.status; end if;
    new_status := 'canceled';
  else
    raise exception 'bad_decision';
  end if;

  update public.facilitator_group_reservations
    set status = new_status, decided_by = p_actor, decided_at = now(), updated_at = now()
    where id = p_reservation;
  return new_status;
end $$;

-- The facilitator adds someone they recruited. Takes a confirmed spot; refuses when full.
create or replace function public.add_group_member(p_group uuid, p_participant uuid, p_name text, p_email text, p_party integer, p_actor uuid, p_source text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  g public.facilitator_groups;
  existing uuid;
  rid uuid;
begin
  select * into g from public.facilitator_groups where id = p_group for update;
  if not found then raise exception 'group_not_found'; end if;

  select id into existing from public.facilitator_group_reservations
    where group_id = p_group and lower(email) = lower(p_email) and status in ('pending','confirmed','waitlisted') limit 1;
  if existing is not null then
    perform public.decide_group_reservation(existing, 'confirm', p_actor);
    return existing;
  end if;

  if public.group_spots_taken(p_group) + greatest(p_party, 1) > g.capacity then raise exception 'no_room'; end if;
  insert into public.facilitator_group_reservations (group_id, participant_id, name, email, party_size, source, status, decided_by, decided_at)
  values (p_group, p_participant, p_name, lower(p_email), greatest(p_party, 1), coalesce(p_source, 'facilitator'), 'confirmed', p_actor, now())
  returning id into rid;
  return rid;
end $$;

-- Only the server (service role) calls these; it does the auth checks.
revoke all on function public.group_spots_taken(uuid) from public, anon, authenticated;
revoke all on function public.request_group_spot(uuid, uuid, integer, text, text, text) from public, anon, authenticated;
revoke all on function public.decide_group_reservation(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.add_group_member(uuid, uuid, text, text, integer, uuid, text) from public, anon, authenticated;
grant execute on function public.group_spots_taken(uuid) to service_role;
grant execute on function public.request_group_spot(uuid, uuid, integer, text, text, text) to service_role;
grant execute on function public.decide_group_reservation(uuid, text, uuid) to service_role;
grant execute on function public.add_group_member(uuid, uuid, text, text, integer, uuid, text) to service_role;

-- ── RLS ──────────────────────────────────────────────────────────────────────────
alter table public.facilitator_profiles enable row level security;
alter table public.facilitator_groups enable row level security;
alter table public.facilitator_group_reservations enable row level security;
alter table public.group_finder_settings enable row level security;

create policy "facilitator_profiles_read" on public.facilitator_profiles for select
  using (public.can_manage_users() or profile_id = public.current_profile_id());
create policy "facilitator_profiles_admin_write" on public.facilitator_profiles for all
  using (public.can_manage_users()) with check (public.can_manage_users());

create policy "facilitator_groups_read" on public.facilitator_groups for select
  using (public.can_manage_users() or facilitator_id = public.current_profile_id());
create policy "facilitator_groups_admin_write" on public.facilitator_groups for all
  using (public.can_manage_users()) with check (public.can_manage_users());

create policy "fgr_read" on public.facilitator_group_reservations for select
  using (
    public.can_manage_users()
    or profile_id = public.current_profile_id()
    or exists (select 1 from public.facilitator_groups g where g.id = group_id and g.facilitator_id = public.current_profile_id())
  );
create policy "fgr_admin_write" on public.facilitator_group_reservations for all
  using (public.can_manage_users()) with check (public.can_manage_users());

create policy "group_finder_settings_admin" on public.group_finder_settings for all
  using (public.can_manage_users()) with check (public.can_manage_users());
