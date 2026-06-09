create table if not exists public.impact_scores (
  id uuid primary key default gen_random_uuid(),
  score_date date not null default current_date,
  total_amount numeric(25, 2) not null default 0,
  goal_label text not null default '$1 Billion',
  headline text not null default 'Tracking Progress Towards',
  body_text text not null default '',
  notes text,
  published boolean not null default false,
  categories jsonb not null default '[]'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed with initial data
insert into public.impact_scores (
  score_date, total_amount, goal_label, headline, body_text, published, categories
)
select
  current_date,
  96061108000.00,
  '$1 Billion',
  'Tracking Progress Towards',
  'Every dollar given, every investment made with purpose it all counts. This is our running total of the real-world impact created by our community.',
  true,
  '[
    {"icon": "star",    "title": "Financial Education",  "description": "Teaching Biblical stewardship principles to individuals & families"},
    {"icon": "clock",   "title": "Intentional Giving",   "description": "Empowering generous, purposeful charitable contributions"},
    {"icon": "refresh", "title": "Impact Investing",     "description": "Aligning investments with values for lasting community transformation"},
    {"icon": "users",   "title": "Community Building",   "description": "A movement of 25,000 inspired, purposeful stewards"}
  ]'::jsonb
where not exists (select 1 from public.impact_scores limit 1);
