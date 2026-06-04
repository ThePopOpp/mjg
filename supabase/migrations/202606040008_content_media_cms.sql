create table if not exists public.blog_post_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_post_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text not null default '',
  content_text text,
  author_name text,
  author_profile_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.blog_post_categories(id) on delete set null,
  featured_image_url text,
  gallery_urls text[] not null default '{}',
  video_url text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'hidden', 'archived', 'deleted')),
  publish_at timestamptz,
  deployed_at timestamptz,
  hidden_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  linked_email_template_id uuid references public.email_templates(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_post_tag_links (
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  tag_id uuid not null references public.blog_post_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table if not exists public.blog_post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video', 'audio', 'embed')),
  title text,
  url text not null,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  asset_type text not null check (asset_type in ('audio', 'video', 'photo', 'gallery')),
  source_type text not null default 'external_url' check (source_type in ('upload', 'external_url', 'recording', 'embed')),
  file_url text,
  storage_bucket text,
  storage_path text,
  embed_url text,
  mime_type text,
  file_size bigint,
  duration_seconds integer,
  width integer,
  height integer,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden', 'archived', 'deleted')),
  visibility text not null default 'private' check (visibility in ('private', 'public', 'assigned')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  collection_type text not null default 'gallery' check (collection_type in ('gallery', 'playlist', 'series')),
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden', 'archived', 'deleted')),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_collection_items (
  collection_id uuid not null references public.media_collections(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  sort_order integer not null default 0,
  caption text,
  created_at timestamptz not null default now(),
  primary key (collection_id, media_asset_id)
);

create table if not exists public.media_publish_targets (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid references public.media_assets(id) on delete cascade,
  media_collection_id uuid references public.media_collections(id) on delete cascade,
  target_type text not null check (target_type in ('public_site', 'dashboard_user', 'all_users', 'participant', 'segment', 'page_section', 'embed')),
  target_key text,
  user_id uuid references public.profiles(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete cascade,
  enabled boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (media_asset_id is not null or media_collection_id is not null)
);

alter table public.form_submissions
  add column if not exists subject text,
  add column if not exists message text,
  add column if not exists hidden_at timestamptz,
  add column if not exists removed_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists actioned_by uuid references public.profiles(id) on delete set null,
  add column if not exists action_reason text,
  add column if not exists assigned_to uuid references public.profiles(id) on delete set null;

create index if not exists blog_posts_status_publish_idx on public.blog_posts(status, publish_at desc);
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_category_idx on public.blog_posts(category_id);
create index if not exists media_assets_type_status_idx on public.media_assets(asset_type, status);
create index if not exists media_publish_targets_asset_idx on public.media_publish_targets(media_asset_id, enabled);
create index if not exists form_submissions_status_idx on public.form_submissions(form_type, status, created_at desc);
create index if not exists form_submissions_visibility_idx on public.form_submissions(deleted_at, removed_at, hidden_at, created_at desc);

alter table public.blog_post_categories enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tag_links enable row level security;
alter table public.blog_post_media enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_collections enable row level security;
alter table public.media_collection_items enable row level security;
alter table public.media_publish_targets enable row level security;

drop policy if exists "blog_categories_dashboard_read" on public.blog_post_categories;
create policy "blog_categories_dashboard_read" on public.blog_post_categories for select using (public.can_access_dashboard());

drop policy if exists "blog_tags_dashboard_read" on public.blog_post_tags;
create policy "blog_tags_dashboard_read" on public.blog_post_tags for select using (public.can_access_dashboard());

drop policy if exists "blog_posts_dashboard_read" on public.blog_posts;
create policy "blog_posts_dashboard_read" on public.blog_posts for select using (public.can_access_dashboard());

drop policy if exists "blog_post_links_dashboard_read" on public.blog_post_tag_links;
create policy "blog_post_links_dashboard_read" on public.blog_post_tag_links for select using (public.can_access_dashboard());

drop policy if exists "blog_post_media_dashboard_read" on public.blog_post_media;
create policy "blog_post_media_dashboard_read" on public.blog_post_media for select using (public.can_access_dashboard());

drop policy if exists "media_assets_dashboard_read" on public.media_assets;
create policy "media_assets_dashboard_read" on public.media_assets for select using (public.can_access_dashboard());

drop policy if exists "media_collections_dashboard_read" on public.media_collections;
create policy "media_collections_dashboard_read" on public.media_collections for select using (public.can_access_dashboard());

drop policy if exists "media_collection_items_dashboard_read" on public.media_collection_items;
create policy "media_collection_items_dashboard_read" on public.media_collection_items for select using (public.can_access_dashboard());

drop policy if exists "media_publish_targets_dashboard_read" on public.media_publish_targets;
create policy "media_publish_targets_dashboard_read" on public.media_publish_targets for select using (public.can_access_dashboard());

drop policy if exists "blog_categories_admin_write" on public.blog_post_categories;
create policy "blog_categories_admin_write" on public.blog_post_categories for all using (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer')) with check (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer'));

drop policy if exists "blog_tags_admin_write" on public.blog_post_tags;
create policy "blog_tags_admin_write" on public.blog_post_tags for all using (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer')) with check (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer'));

drop policy if exists "blog_posts_admin_write" on public.blog_posts;
create policy "blog_posts_admin_write" on public.blog_posts for all using (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer')) with check (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer'));

drop policy if exists "blog_post_links_admin_write" on public.blog_post_tag_links;
create policy "blog_post_links_admin_write" on public.blog_post_tag_links for all using (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer')) with check (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer'));

drop policy if exists "blog_post_media_admin_write" on public.blog_post_media;
create policy "blog_post_media_admin_write" on public.blog_post_media for all using (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer')) with check (public.current_app_role() in ('super_admin', 'admin', 'content_reviewer'));

drop policy if exists "media_assets_admin_write" on public.media_assets;
create policy "media_assets_admin_write" on public.media_assets for all using (public.current_app_role() in ('super_admin', 'admin')) with check (public.current_app_role() in ('super_admin', 'admin'));

drop policy if exists "media_collections_admin_write" on public.media_collections;
create policy "media_collections_admin_write" on public.media_collections for all using (public.current_app_role() in ('super_admin', 'admin')) with check (public.current_app_role() in ('super_admin', 'admin'));

drop policy if exists "media_collection_items_admin_write" on public.media_collection_items;
create policy "media_collection_items_admin_write" on public.media_collection_items for all using (public.current_app_role() in ('super_admin', 'admin')) with check (public.current_app_role() in ('super_admin', 'admin'));

drop policy if exists "media_publish_targets_admin_write" on public.media_publish_targets;
create policy "media_publish_targets_admin_write" on public.media_publish_targets for all using (public.current_app_role() in ('super_admin', 'admin')) with check (public.current_app_role() in ('super_admin', 'admin'));

insert into public.blog_post_categories (name, slug, description) values
  ('Stewardship Blueprint', 'stewardship-blueprint', 'Core Stewardship Blueprint articles and reflections.'),
  ('Created for More', 'created-for-more', 'Created for More pilot updates and resources.'),
  ('Faith and Work', 'faith-and-work', 'Purpose, calling, business, and daily stewardship.')
on conflict (slug) do nothing;
