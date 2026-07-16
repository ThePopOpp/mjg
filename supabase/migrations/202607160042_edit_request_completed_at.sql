-- Edit requests — record WHEN a request was completed, so completed work can live
-- in its own "Completed Edits" tab with an unreviewed-since badge, instead of
-- cluttering the open queue and the Review FAB.
--
-- updated_at can't answer "completed since I last looked": it moves on any edit
-- (reassign, priority change), so a long-done request would keep re-appearing as
-- newly completed. completed_at is set once, when status becomes 'done', and
-- cleared if the request is reopened.
--
-- Applies to both request sources: cms_page_notes (Frontend Edits) and
-- dashboard_notes (Dashboard Edits).

alter table public.cms_page_notes  add column if not exists completed_at timestamptz;
alter table public.dashboard_notes add column if not exists completed_at timestamptz;

-- Backfill anything already marked done. updated_at is the best available
-- approximation for work completed before this column existed.
update public.cms_page_notes  set completed_at = updated_at where status = 'done' and completed_at is null;
update public.dashboard_notes set completed_at = updated_at where status = 'done' and completed_at is null;

-- The Completed Edits tab sorts by most-recently-completed and counts rows newer
-- than the viewer's last review.
create index if not exists cms_page_notes_completed_idx  on public.cms_page_notes(completed_at desc)  where status = 'done';
create index if not exists dashboard_notes_completed_idx on public.dashboard_notes(completed_at desc) where status = 'done';

-- The FAB and the open queue read status directly; keep those lookups cheap now
-- that they filter it rather than showing everything.
create index if not exists cms_page_notes_status_idx on public.cms_page_notes(status, created_at desc);
