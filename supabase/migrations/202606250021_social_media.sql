-- Social Media hub — mirrors the Emails section for social platforms.
-- Content hub + scheduling now; live platform-API posting is wired later via a
-- publish adapter (lib/social-media/publish.ts). Credentials are entered in the
-- dashboard Settings page and stored in social_accounts.credentials (jsonb).
-- Platform check allows a broad set so new networks need no migration.

-- ── Connected accounts / credentials (managed in Settings) ──────────────────────
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook','instagram','linkedin','x','youtube','tiktok','threads','pinterest')),
  display_name text not null,
  profile_url text,
  external_id text,
  status text not null default 'disconnected' check (status in ('disconnected','connected','error')),
  is_active boolean not null default true,
  credentials jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists social_accounts_platform_idx on public.social_accounts(platform, is_active);

-- ── Post templates (with drag-and-drop block builder schema) ─────────────────────
create table if not exists public.social_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text not null default 'general',
  status text not null default 'draft' check (status in ('draft','active','archived')),
  platforms text[] not null default '{}',
  body_text text not null default '',
  builder_schema jsonb not null default '{}'::jsonb,
  media_urls text[] not null default '{}',
  hashtags text[] not null default '{}',
  link_url text,
  available_fields text[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists social_templates_status_idx on public.social_templates(status, category);

-- ── Posts (drafts, scheduled, published) + engagement ───────────────────────────
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.social_templates(id) on delete set null,
  account_id uuid references public.social_accounts(id) on delete set null,
  platform text not null,
  status text not null default 'draft' check (status in ('draft','scheduled','publishing','published','failed','skipped')),
  body_text text not null default '',
  media_urls text[] not null default '{}',
  hashtags text[] not null default '{}',
  link_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  external_post_id text,
  external_url text,
  error_message text,
  engagement jsonb not null default '{}'::jsonb,
  merge_data jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists social_posts_status_idx on public.social_posts(status, scheduled_at);
create index if not exists social_posts_platform_idx on public.social_posts(platform, published_at desc);

-- ── Inbox: messages, comments, reviews, mentions ────────────────────────────────
create table if not exists public.social_messages (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.social_accounts(id) on delete set null,
  platform text not null,
  kind text not null default 'message' check (kind in ('message','comment','review','mention')),
  external_id text,
  author_name text,
  author_handle text,
  author_avatar_url text,
  text text,
  rating integer,
  permalink text,
  post_external_id text,
  sentiment text,
  status text not null default 'new' check (status in ('new','read','replied','archived')),
  received_at timestamptz not null default now(),
  replied_at timestamptz,
  reply_text text,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists social_messages_status_idx on public.social_messages(status, received_at desc);
create index if not exists social_messages_kind_idx on public.social_messages(kind, platform);
create unique index if not exists social_messages_external_uq on public.social_messages(platform, kind, external_id) where external_id is not null;

-- ── Automations: event → template mappings ──────────────────────────────────────
create table if not exists public.social_automations (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  template_id uuid references public.social_templates(id) on delete set null,
  platforms text[] not null default '{}',
  enabled boolean not null default false,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Daily analytics rollup (for reports) ────────────────────────────────────────
create table if not exists public.social_analytics_daily (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references public.social_accounts(id) on delete cascade,
  platform text not null,
  metric_date date not null,
  followers integer not null default 0,
  impressions integer not null default 0,
  reach integer not null default 0,
  engagements integer not null default 0,
  posts_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (account_id, metric_date)
);
create index if not exists social_analytics_date_idx on public.social_analytics_daily(platform, metric_date desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────────
alter table public.social_accounts enable row level security;
alter table public.social_templates enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_messages enable row level security;
alter table public.social_automations enable row level security;
alter table public.social_analytics_daily enable row level security;

-- accounts hold credentials → admins only (service-role API bypasses RLS).
drop policy if exists "social_accounts_admin_all" on public.social_accounts;
create policy "social_accounts_admin_all" on public.social_accounts for all
  using (public.current_app_role() in ('super_admin','admin'))
  with check (public.current_app_role() in ('super_admin','admin'));

-- content tables: dashboard read, admin write.
do $$
declare tbl text;
begin
  foreach tbl in array array['social_templates','social_posts','social_messages','social_automations','social_analytics_daily'] loop
    execute format('drop policy if exists %I on public.%I', tbl||'_dashboard_read', tbl);
    execute format('create policy %I on public.%I for select using (public.current_app_role() in (''super_admin'',''admin'',''team_member'',''content_reviewer''))', tbl||'_dashboard_read', tbl);
    execute format('drop policy if exists %I on public.%I', tbl||'_admin_write', tbl);
    execute format($f$create policy %I on public.%I for all
      using (public.current_app_role() in ('super_admin','admin'))
      with check (public.current_app_role() in ('super_admin','admin'))$f$, tbl||'_admin_write', tbl);
  end loop;
end $$;

-- ── Seed: the two platforms in use + starter templates ──────────────────────────
insert into public.social_accounts (platform, display_name, profile_url, status) values
  ('facebook','Michael J. Gauthier (Facebook Page)','https://facebook.com/','disconnected'),
  ('linkedin','Michael J. Gauthier (LinkedIn)','https://linkedin.com/in/','disconnected')
on conflict do nothing;

insert into public.social_templates (name, slug, description, category, status, platforms, body_text, hashtags) values
  ('Daily Stewardship Encouragement','daily-stewardship-encouragement','A short daily encouragement post.','Stewardship','active',
   array['facebook','linkedin'],
   E'Stewardship isn''t about giving more — it''s about living faithfully with what you''ve been entrusted.\n\nWhat''s one thing you''re stewarding well today?',
   array['#Stewardship','#FaithfulLiving','#StewardshipBlueprint']),
  ('Event Promo','event-promo','Promote an upcoming event or webinar.','Events','active',
   array['facebook','linkedin'],
   E'You''re invited! Join us for {{event_title}}.\n\n{{event_url}}',
   array['#Event','#StewardshipBlueprint'])
on conflict (slug) do nothing;
