-- Web analytics, Phase 1: first-party, cookieless traffic + sign-up attribution.
--
-- Until now the site recorded nothing about visits (no pageviews, referrers or
-- UTMs). These tables are written by:
--   • analytics_events      — /api/analytics/collect (components/analytics/site-analytics.tsx)
--   • profile_attribution   — /api/auth/register (first touch + the session that signed up)
--   • analytics_bot_hits    — middleware.ts (AI / search crawlers, which never run JS)
-- and read by /dashboard/analytics (lib/analytics/queries.ts) through the
-- functions below. Server-only: RLS on with no policies, so only the service
-- role can read or write; anon/authenticated can't execute the functions.
--
-- Privacy: no cookies and no raw IPs. visitor_hash = sha256(daily secret salt +
-- ip + user agent), so a visitor can't be followed across days. 13-month
-- retention is enforced by analytics_prune().

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event text not null default 'pageview' check (event ~ '^[a-z_]{2,40}$'),
  host text,
  path text not null,
  -- The session's ENTRY context, repeated on every event so each pageview carries its channel.
  entry_path text,
  referrer_host text,
  channel text not null default 'direct',
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  is_entry boolean not null default false,
  visitor_hash text not null,
  session_id text not null,
  device text,
  country text,
  profile_id uuid references public.profiles(id) on delete set null
);
create index if not exists analytics_events_time_idx on public.analytics_events (occurred_at desc);
create index if not exists analytics_events_path_idx on public.analytics_events (path, occurred_at desc);
create index if not exists analytics_events_channel_idx on public.analytics_events (channel, occurred_at desc);

create table if not exists public.profile_attribution (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  -- First touch: the first visit we ever saw from this browser.
  first_seen_at timestamptz,
  first_landing_path text,
  first_referrer_host text,
  first_channel text not null default 'unknown',
  first_source text,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  -- Last touch: the session that registered.
  last_landing_path text,
  last_channel text,
  last_source text,
  last_utm_campaign text,
  registered_at timestamptz not null default now()
);
create index if not exists profile_attribution_registered_idx on public.profile_attribution (registered_at desc);

create table if not exists public.analytics_bot_hits (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  bot text not null,
  bot_kind text not null check (bot_kind in ('ai_search','ai_training','ai_user','search','other')),
  host text,
  path text not null
);
create index if not exists analytics_bot_hits_time_idx on public.analytics_bot_hits (occurred_at desc);

alter table public.analytics_events enable row level security;
alter table public.profile_attribution enable row level security;
alter table public.analytics_bot_hits enable row level security;

-- ── Read functions (the dashboard's only query surface) ─────────────────────────
-- Days bucket in America/Phoenix, the business's local time.

create or replace function public.analytics_totals(p_since timestamptz, p_until timestamptz)
returns table (pageviews bigint, visitors bigint, sessions bigint, bounced_sessions bigint)
language sql stable set search_path = public as $$
  with e as (
    select * from analytics_events
    where occurred_at >= p_since and occurred_at < p_until and event = 'pageview'
  ), s as (
    select session_id, count(*) as views from e group by session_id
  )
  select
    (select count(*) from e),
    (select count(distinct visitor_hash) from e),
    (select count(*) from s),
    (select count(*) from s where views = 1);
$$;

create or replace function public.analytics_series(p_since timestamptz, p_until timestamptz)
returns table (day date, pageviews bigint, visitors bigint, sessions bigint)
language sql stable set search_path = public as $$
  select (occurred_at at time zone 'America/Phoenix')::date as day,
         count(*), count(distinct visitor_hash), count(distinct session_id)
  from analytics_events
  where occurred_at >= p_since and occurred_at < p_until and event = 'pageview'
  group by 1 order by 1;
$$;

-- p_dim is whitelisted by the CASE: anything else groups under null.
create or replace function public.analytics_breakdown(p_since timestamptz, p_until timestamptz, p_dim text, p_limit int default 25)
returns table (key text, pageviews bigint, visitors bigint, sessions bigint)
language sql stable set search_path = public as $$
  select k, count(*), count(distinct visitor_hash), count(distinct session_id)
  from (
    select visitor_hash, session_id,
      case p_dim
        when 'channel' then channel
        when 'source' then coalesce(source, '(none)')
        when 'path' then path
        when 'entry_path' then case when is_entry then path end
        when 'referrer_host' then referrer_host
        when 'device' then coalesce(device, 'unknown')
        when 'country' then coalesce(country, 'unknown')
        when 'campaign' then utm_campaign
      end as k
    from analytics_events
    where occurred_at >= p_since and occurred_at < p_until and event = 'pageview'
  ) x
  where k is not null
  group by k order by 2 desc limit greatest(1, least(p_limit, 200));
$$;

create or replace function public.analytics_channel_series(p_since timestamptz, p_until timestamptz)
returns table (day date, channel text, sessions bigint)
language sql stable set search_path = public as $$
  select (occurred_at at time zone 'America/Phoenix')::date, channel, count(distinct session_id)
  from analytics_events
  where occurred_at >= p_since and occurred_at < p_until and event = 'pageview'
  group by 1, 2 order by 1, 2;
$$;

-- Sign-ups in the window by first-touch channel, and what those people went on to do (any time).
create or replace function public.analytics_funnel(p_since timestamptz, p_until timestamptz)
returns table (channel text, signups bigint, checkins bigint, group_requests bigint, purchases bigint, waitlist bigint)
language sql stable set search_path = public as $$
  select pa.first_channel,
    count(*),
    count(*) filter (where exists (select 1 from check_in_submissions c where c.profile_id = pa.profile_id)),
    count(*) filter (where exists (select 1 from facilitator_group_reservations r where r.profile_id = pa.profile_id)),
    count(*) filter (where exists (select 1 from steward_orders o where o.user_id = pa.profile_id and o.status in ('paid','partially_refunded'))),
    count(*) filter (where exists (select 1 from book_waitlist_requests w where w.profile_id = pa.profile_id))
  from profile_attribution pa
  where pa.registered_at >= p_since and pa.registered_at < p_until
  group by 1 order by 2 desc;
$$;

-- Landing pages ranked by the sign-ups they started (first touch).
create or replace function public.analytics_landing_signups(p_since timestamptz, p_until timestamptz, p_limit int default 15)
returns table (path text, signups bigint)
language sql stable set search_path = public as $$
  select coalesce(first_landing_path, '(before tracking)'), count(*)
  from profile_attribution
  where registered_at >= p_since and registered_at < p_until
  group by 1 order by 2 desc limit greatest(1, least(p_limit, 100));
$$;

create or replace function public.analytics_bot_breakdown(p_since timestamptz, p_until timestamptz)
returns table (bot text, bot_kind text, hits bigint, pages bigint, last_seen timestamptz)
language sql stable set search_path = public as $$
  select bot, bot_kind, count(*), count(distinct path), max(occurred_at)
  from analytics_bot_hits
  where occurred_at >= p_since and occurred_at < p_until
  group by 1, 2 order by 3 desc;
$$;

create or replace function public.analytics_bot_pages(p_since timestamptz, p_until timestamptz, p_kind text default null, p_limit int default 20)
returns table (path text, hits bigint, bots bigint)
language sql stable set search_path = public as $$
  select path, count(*), count(distinct bot)
  from analytics_bot_hits
  where occurred_at >= p_since and occurred_at < p_until and (p_kind is null or bot_kind = p_kind)
  group by 1 order by 2 desc limit greatest(1, least(p_limit, 100));
$$;

-- 13-month retention for raw rows (attribution rows are kept: they're per account).
create or replace function public.analytics_prune()
returns table (events_deleted bigint, bot_hits_deleted bigint)
language plpgsql set search_path = public as $$
declare a bigint; b bigint;
begin
  delete from analytics_events where occurred_at < now() - interval '13 months';
  get diagnostics a = row_count;
  delete from analytics_bot_hits where occurred_at < now() - interval '13 months';
  get diagnostics b = row_count;
  return query select a, b;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'analytics_totals(timestamptz,timestamptz)',
    'analytics_series(timestamptz,timestamptz)',
    'analytics_breakdown(timestamptz,timestamptz,text,int)',
    'analytics_channel_series(timestamptz,timestamptz)',
    'analytics_funnel(timestamptz,timestamptz)',
    'analytics_landing_signups(timestamptz,timestamptz,int)',
    'analytics_bot_breakdown(timestamptz,timestamptz)',
    'analytics_bot_pages(timestamptz,timestamptz,text,int)',
    'analytics_prune()'
  ] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
    execute format('grant execute on function public.%s to service_role', f);
  end loop;
end $$;
