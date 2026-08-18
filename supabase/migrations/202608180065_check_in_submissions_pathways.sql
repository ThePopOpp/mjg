-- Created for More Check-In next-steps became multi-select; store the full set.
-- The legacy single `chosen_pathway` column is kept (populated with the first choice)
-- for back-compat.
alter table public.check_in_submissions add column if not exists chosen_pathways jsonb not null default '[]'::jsonb;
