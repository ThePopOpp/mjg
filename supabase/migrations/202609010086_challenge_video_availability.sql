-- Availability chip for challenge videos: 'available' (live), 'coming_soon' (not live yet), or
-- 'none' (hide the chip). Controlled per-video from the Media Studio Video Studio. Backfill from
-- the current link status so existing videos get the right chip.
alter table public.challenge_videos add column if not exists availability text;

update public.challenge_videos
set availability = case
  when (youtube_id is not null or drive_id is not null or video_url is not null) then 'available'
  else 'coming_soon'
end
where availability is null;
