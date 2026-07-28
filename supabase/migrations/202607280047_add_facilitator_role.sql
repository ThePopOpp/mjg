-- Add the "facilitator" application role.
-- Kept in its own migration: Postgres requires the ALTER TYPE ... ADD VALUE to be
-- committed before the new value is used (the migration runner commits per file),
-- so anything that references 'facilitator' lives in later migrations (…48, …49).
-- Idempotent guard mirrors the user_status extension in 202605260003.
do $$
begin
  if not exists (
    select 1 from pg_enum
    where enumlabel = 'facilitator'
      and enumtypid = 'public.app_role'::regtype
  ) then
    alter type public.app_role add value 'facilitator';
  end if;
end $$;
