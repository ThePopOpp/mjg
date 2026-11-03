-- Church admins get every facilitator feature, plus a church profile.
--
-- 1. A church admin counts as approved for the church they administer, so they can list
--    official church groups for it without applying to themselves (app rule in
--    lib/churches/repository.ts approvedChurchIdsFor; backstop trigger below).
-- 2. Church profile: description, contact details, full address, logo and photos, shown on
--    the public /churches/<slug> page and on each official group's page.
-- 3. Each church admin's position (title) at the church, shown on the church page.
-- 4. The facilitator Steward offer (trial) is open to church admins too.

-- ── 1. Approval backstop ─────────────────────────────────────────────────────────
create or replace function public.enforce_church_group()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.church_id is null then return new; end if;
  if tg_op = 'UPDATE' and new.church_id is not distinct from old.church_id and new.facilitator_id is not distinct from old.facilitator_id then
    return new;
  end if;
  if not exists (
    select 1 from public.facilitator_applications
    where profile_id = new.facilitator_id and church_id = new.church_id and status = 'approved'
  ) and not exists (
    select 1 from public.church_admins
    where profile_id = new.facilitator_id and church_id = new.church_id and status = 'active'
  ) then
    raise exception 'church_group_not_approved: this facilitator has not been approved by that church';
  end if;
  return new;
end $$;

-- ── 2. Church profile ────────────────────────────────────────────────────────────
alter table public.churches
  add column if not exists description text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists postal_code text,
  add column if not exists denomination text,
  add column if not exists logo_url text,
  -- [{ "url": "...", "caption": "..." }], in display order.
  add column if not exists photos jsonb not null default '[]'::jsonb,
  add column if not exists profile_updated_by uuid references public.profiles(id) on delete set null;

alter table public.churches drop constraint if exists churches_photos_array;
alter table public.churches add constraint churches_photos_array check (jsonb_typeof(photos) = 'array');

-- ── 3. Position (title) ──────────────────────────────────────────────────────────
alter table public.church_admins add column if not exists title text;

-- Carry over the title they gave when they applied.
update public.church_admins ca
set title = a.role_title
from public.church_admin_applications a
where ca.application_id = a.id and ca.title is null and coalesce(trim(a.role_title), '') <> '';

-- ── 4. Facilitator Steward offer ─────────────────────────────────────────────────
update public.steward_offers
set eligible_roles = array_append(eligible_roles, 'church_admin'), updated_at = now()
where 'facilitator' = any(eligible_roles) and not ('church_admin' = any(eligible_roles));
