-- Media Studio "Books" tab: a 3D page-turning book demo built from real uploaded media assets.
-- A book is an ordered list of pages; each page points at a media_assets row (usually a photo)
-- and can carry its own heading/body copy that gets drawn onto the page texture.
create table if not exists public.media_books (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  subtitle      text not null default '',
  description   text not null default '',
  -- Brand styling for the rendered book (defaults are the MJG palette: ink cover, cream
  -- pages, gold accent). Never green.
  cover_color   text not null default '#111111',
  page_color    text not null default '#faf8f4',
  accent_color  text not null default '#c9aa70',
  cover_asset_id uuid references public.media_assets(id) on delete set null,
  status        text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order    double precision not null default 0,
  created_by    uuid references public.profiles(id) on delete set null,
  updated_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.media_book_pages (
  id             uuid primary key default gen_random_uuid(),
  book_id        uuid not null references public.media_books(id) on delete cascade,
  -- The uploaded asset this page shows. Kept nullable so a text-only page is valid, and set
  -- null (rather than cascading) if the asset is later deleted so the page survives.
  media_asset_id uuid references public.media_assets(id) on delete set null,
  image_url      text,
  heading        text not null default '',
  body           text not null default '',
  sort_order     double precision not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists media_books_sort_idx on public.media_books (sort_order);
create index if not exists media_book_pages_book_idx on public.media_book_pages (book_id, sort_order);

-- Server reads/writes go through the service-role admin client (bypasses RLS); enable RLS with
-- no policies so nothing is exposed directly to anon/auth clients. Matches challenge_videos.
alter table public.media_books enable row level security;
alter table public.media_book_pages enable row level security;
