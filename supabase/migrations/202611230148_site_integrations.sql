-- Third-party site integrations, edited in Social Media → Settings → Integrations.
-- One row (id = 1). First: Metricool's website tracker, which Mike asked for
-- (components/analytics/metricool.tsx loads it on public pages while enabled).
-- The hash is public by nature: it's printed in the page's script tag.

create table if not exists public.site_integrations (
  id               integer primary key default 1 check (id = 1),
  metricool_enabled boolean not null default false,
  metricool_hash   text check (metricool_hash is null or metricool_hash ~ '^[a-f0-9]{16,64}$'),
  updated_by       uuid references public.profiles(id) on delete set null,
  updated_at       timestamptz not null default now()
);

insert into public.site_integrations (id, metricool_enabled, metricool_hash)
values (1, true, '5368556c70777129ee802f96c2157edb')
on conflict (id) do nothing;

-- Server-only (service role); the public endpoint exposes just enabled + hash.
alter table public.site_integrations enable row level security;
