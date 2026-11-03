-- Extra roles a profile may switch into ("View as") to see and test the other
-- dashboards. The primary role stays in profiles.role; these are additional.
--
-- Kept in its own table, NOT a profiles column: the profiles_update_self policy
-- lets a signed-in user update their own profiles row, so a column there could be
-- self-granted. RLS is on with no policies — only the service role (server code)
-- reads or writes this table.

create table if not exists public.profile_view_roles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  roles text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint profile_view_roles_known check (
    roles <@ array[
      'admin', 'team_member', 'facilitator', 'content_reviewer',
      'pastor_elder_reviewer', 'church_admin', 'participant'
    ]::text[]
  )
);

alter table public.profile_view_roles enable row level security;

-- Jeremy Waters and Michael Gauthier: every non-Super-Admin role.
insert into public.profile_view_roles (profile_id, roles)
select p.id, array[
  'admin', 'team_member', 'facilitator', 'content_reviewer',
  'pastor_elder_reviewer', 'church_admin', 'participant'
]::text[]
from public.profiles p
where p.id in ('ca0048f5-da41-4c60-92c7-1cea5e874782', 'cdaf134d-4194-4ca4-90ac-aa976ebc1c2c')
on conflict (profile_id) do update set roles = excluded.roles, updated_at = now();
