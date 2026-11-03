-- Close self-promotion through the public (publishable) key.
--
-- profiles_update_self let any signed-in user UPDATE their own profiles row with
-- the publishable key — including `role` and `status`, so a participant could
-- make themselves an admin. Nothing in the app uses it: every profiles write
-- goes through server code with the service role, which bypasses RLS.
drop policy if exists "profiles_update_self" on public.profiles;

-- profiles_manage_users_write still lets admins write profiles through the
-- public key. Guard the privileged columns there too: through the public key
-- (the anon / authenticated database roles) only a Super Admin may set or
-- change role, status, email or auth_user_id. Server code (service_role) and
-- migrations (postgres) are untouched.
create or replace function public.profiles_guard_privileged()
returns trigger
language plpgsql
-- SECURITY INVOKER (the default) on purpose: current_user must be the caller's
-- role. Under SECURITY DEFINER it would be the owner and the guard would never fire.
security invoker
set search_path = public
as $$
begin
  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;
  if public.current_app_role() = 'super_admin' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role in ('super_admin', 'admin') then
      raise exception 'Only a Super Admin can create an admin profile.' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.email is distinct from old.email
     or new.auth_user_id is distinct from old.auth_user_id
     or new.id is distinct from old.id then
    raise exception 'Role, status, email and sign-in link can only be changed by a Super Admin.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged on public.profiles;
create trigger profiles_guard_privileged
before insert or update on public.profiles
for each row execute function public.profiles_guard_privileged();
