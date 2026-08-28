-- 6-Week Challenge videos move from code (lib/six-week-challenge/videos.ts) into the DB so the
-- Video Studio can edit/add/remove them and the public frontend reflects the changes. Seeded
-- from the current code set; the code list remains as a fallback if this table is ever empty.
create table if not exists public.challenge_videos (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  sort_order     double precision not null default 0,
  badge          text not null default '',
  title          text not null default '',
  subtitle       text not null default '',
  description    text not null default '',
  youtube_id     text,
  drive_id       text,
  embed_direct   boolean not null default true,
  video_url      text,
  poster_eyebrow text,
  poster_title   text,
  thumbnail_url  text,
  thumbnail_dark text,
  duration_label text,
  status         text not null default 'published',   -- published | draft
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists challenge_videos_sort_idx on public.challenge_videos (sort_order);

-- Server reads/writes go through the service-role admin client (bypasses RLS); enable RLS with
-- no public policies so nothing is exposed directly to anon/auth clients.
alter table public.challenge_videos enable row level security;

insert into public.challenge_videos
  (slug, sort_order, badge, title, subtitle, description, youtube_id, drive_id, embed_direct, video_url, poster_eyebrow, poster_title, thumbnail_url, thumbnail_dark, duration_label, status)
values
  ($q$invitation$q$, 0,   $q$Invitation$q$, $q$The Invitation$q$, $q$What The Life You're Building is — and who it's for.$q$, $q$A short invitation to the 6-Week Challenge. Share this with any man you're inviting into the group — it makes the ask easy and helps him say yes.$q$, null, $q$1p9eEwKjA8tQ408-35cwtB2qyCgrNe-CU$q$, true, null, null, null, $q$/6-week-challenge/thumbnails/invitation.svg$q$, $q$/6-week-challenge/thumbnails/invitation.svg$q$, null, $q$published$q$),
  ($q$homework$q$,   0.5, $q$Homework$q$,   $q$Your First Assignment$q$, $q$Do the pre-work before Week 1 begins.$q$, $q$Before the first session, watch this short homework video and take the Created for More Check-In. It sets up everything Week 1 builds on.$q$, null, $q$1dlwMGJ2ZTIThMv04GZstd5wD-G9MrIMB$q$, true, null, null, null, $q$/6-week-challenge/thumbnails/homework.svg$q$, $q$/6-week-challenge/thumbnails/homework.svg$q$, null, $q$published$q$),
  ($q$week-1$q$,     1,   $q$Week 1$q$,     $q$Wake Up$q$, $q$Name your current reality and notice the drift.$q$, $q$Week 1 isn't about shame or a dramatic overhaul — it's about awareness. We slow down and tell the truth about the life we're actually building.$q$, null, $q$1yG2gVCiibEUrwZqxli-S250vsI_4qdaF$q$, true, null, null, null, $q$/6-week-challenge/thumbnails/week1.svg$q$, $q$/6-week-challenge/thumbnails/week1.svg$q$, null, $q$published$q$),
  ($q$week-2$q$,     2,   $q$Week 2$q$,     $q$See the Blueprint$q$, $q$Clarify bedrock, identity, values, mission, and daily purpose.$q$, $q$A blueprint shows where the walls go, but not why the house is being built. Week 2 gets clear on what your life is rooted in and built toward.$q$, null, $q$1h8VIR-xPMke-NQrC1rey9ExxVci__r-B$q$, true, null, null, null, $q$/6-week-challenge/thumbnails/week2.svg$q$, $q$/6-week-challenge/thumbnails/week2.svg$q$, null, $q$published$q$),
  ($q$week-3$q$,     3,   $q$Week 3$q$,     $q$Evaluate the Pillars$q$, $q$Assess family, fitness, fun, and finances; choose one focus.$q$, $q$The four visible pillars carry the weight of everyday life. Week 3 assesses each honestly and chooses the one focus pillar for the next 90 days.$q$, null, null, true, null, null, null, $q$/6-week-challenge/thumbnails/week3.svg$q$, $q$/6-week-challenge/thumbnails/week3.svg$q$, null, $q$published$q$),
  ($q$week-4$q$,     4,   $q$Week 4$q$,     $q$Install the Guardrails$q$, $q$Build one specific boundary that protects what matters.$q$, $q$A guardrail is a decision made before the moment of pressure — not after regret. Week 4 builds one boundary specific enough to actually keep.$q$, null, null, true, null, null, null, $q$/6-week-challenge/thumbnails/week4.svg$q$, $q$/6-week-challenge/thumbnails/week4.svg$q$, null, $q$published$q$),
  ($q$week-5$q$,     5,   $q$Week 5$q$,     $q$Strengthen the Structure$q$, $q$Choose one keystone habit and one renewal rhythm.$q$, $q$Change is sustained by rhythm, not intensity. Week 5 focuses on keystone habits and the energy needed to steward what matters without running empty.$q$, null, null, true, null, null, null, $q$/6-week-challenge/thumbnails/week5.svg$q$, $q$/6-week-challenge/thumbnails/week5.svg$q$, null, $q$published$q$),
  ($q$week-6$q$,     6,   $q$Week 6$q$,     $q$Design My Life$q$, $q$Assemble your Personal Blueprint and retake the Check-In.$q$, $q$Week 6 brings the whole structure together into one Personal Blueprint, retakes the Created for More Check-In, and names the next 30-day commitment.$q$, null, null, true, null, null, null, $q$/6-week-challenge/thumbnails/week6.svg$q$, $q$/6-week-challenge/thumbnails/week6.svg$q$, null, $q$published$q$),
  ($q$closing$q$,    7,   $q$Closing$q$,    $q$What's Next$q$, $q$Keep building — and help another man begin.$q$, $q$A closing word after Week 6: how to keep the Blueprint from sitting in a drawer, protect your 30-day commitment, and multiply what you built.$q$, null, null, true, null, null, null, $q$/6-week-challenge/thumbnails/whats-next.svg$q$, $q$/6-week-challenge/thumbnails/whats-next.svg$q$, null, $q$published$q$)
on conflict (slug) do nothing;
