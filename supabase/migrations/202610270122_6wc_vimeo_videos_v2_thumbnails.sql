-- 6-Week Challenge videos move to Vimeo, with the new thumbnail set (public/6-week-challenge/
-- thumbnails/v2). Titles and descriptions follow docs/6-week-challenge/6-week-challenge-video-details.md.
-- Vimeo links live in video_url (the player recognises them); embed_direct is off so our
-- thumbnail shows first and the click starts the Vimeo player. Week 6 has no link yet, so it
-- stays "coming soon". The Homework video isn't part of the new set and is left as it was.

update public.challenge_videos set
  title = 'An Invitation',
  description = $$What kind of life are you actually building? Michael Gauthier invites you into The Life You’re Building Men’s Challenge, a six-week Stewardship Blueprint experience for men who are ready to stop drifting and start building on purpose. You don’t need a polished story or all the answers. Bring a guide, a pen, and a willingness to be real.$$,
  video_url = 'https://vimeo.com/1239686215', drive_id = null, youtube_id = null, embed_direct = false,
  thumbnail_url = '/6-week-challenge/thumbnails/v2/invitation.jpg', thumbnail_dark = '/6-week-challenge/thumbnails/v2/invitation.jpg',
  availability = 'available', updated_at = now()
where slug = 'invitation';

update public.challenge_videos set
  title = 'Wake Up',
  description = $$Drift is subtle, and busyness can disguise it. This week, Michael helps you see the structure your life already has and the scoreboard you’ve been playing on. Take the Created for More Check-In, name where you’re drifting, and choose one man to walk with you through the next six weeks.$$,
  video_url = 'https://vimeo.com/1239685393', drive_id = null, youtube_id = null, embed_direct = false,
  thumbnail_url = '/6-week-challenge/thumbnails/v2/week-1.jpg', thumbnail_dark = '/6-week-challenge/thumbnails/v2/week-1.jpg',
  availability = 'available', updated_at = now()
where slug = 'week-1';

update public.challenge_videos set
  title = 'See the Blueprint',
  description = $$Identity before strategy. This week goes down to your bedrock (faith and identity) and the foundation built on it: your mission, values, life verse, and daily purpose. Bring a rough first draft to your group. A messy, true mission beats a polished one you never live by.$$,
  video_url = 'https://vimeo.com/1239689416', drive_id = null, youtube_id = null, embed_direct = false,
  thumbnail_url = '/6-week-challenge/thumbnails/v2/week-2.jpg', thumbnail_dark = '/6-week-challenge/thumbnails/v2/week-2.jpg',
  availability = 'available', updated_at = now()
where slug = 'week-2';

update public.challenge_videos set
  title = 'Evaluate the Pillars',
  description = $$Family, Fitness, Fun, and Finances are the four pillars that carry everyday life. The goal isn’t perfect balance but faithful stewardship. Score each pillar, choose one Focus Pillar for the next 90 days, and give the other three one faithful touch each week. Focus one. Steward all four.$$,
  video_url = 'https://vimeo.com/1239698700', drive_id = null, youtube_id = null, embed_direct = false,
  thumbnail_url = '/6-week-challenge/thumbnails/v2/week-3.jpg', thumbnail_dark = '/6-week-challenge/thumbnails/v2/week-3.jpg',
  availability = 'available', updated_at = now()
where slug = 'week-3';

update public.challenge_videos set
  title = 'Install the Guardrails',
  description = $$A guardrail is a decision made before the moment of pressure. It protects what you don’t want to lose. This week, draft one specific guardrail for your Focus Pillar, scan the other pillars for danger zones, and tell one trusted man who can ask how it’s going.$$,
  video_url = 'https://vimeo.com/1239702336', drive_id = null, youtube_id = null, embed_direct = false,
  thumbnail_url = '/6-week-challenge/thumbnails/v2/week-4.jpg', thumbnail_dark = '/6-week-challenge/thumbnails/v2/week-4.jpg',
  availability = 'available', updated_at = now()
where slug = 'week-4';

update public.challenge_videos set
  title = 'Strengthen the Structure',
  description = $$You are shaped less by inspiration than by rhythm. Michael walks through keystone habits and how to steward your physical, emotional, mental, and spiritual energy. Design one habit, protect one rhythm of renewal, and run it for seven days.$$,
  video_url = 'https://vimeo.com/1239699941', drive_id = null, youtube_id = null, embed_direct = false,
  thumbnail_url = '/6-week-challenge/thumbnails/v2/week-5.jpg', thumbnail_dark = '/6-week-challenge/thumbnails/v2/week-5.jpg',
  availability = 'available', updated_at = now()
where slug = 'week-5';

update public.challenge_videos set
  title = 'Design My Life',
  description = $$This is where it all comes together. Complete your Personal Blueprint, explore the final layer of legacy, and retake the Check-In to see how far you’ve come. Then commit to a 30-day focus with a four-pillar rhythm and the man who will help you keep it.$$,
  embed_direct = false,
  thumbnail_url = '/6-week-challenge/thumbnails/v2/week-6.jpg', thumbnail_dark = '/6-week-challenge/thumbnails/v2/week-6.jpg',
  updated_at = now()
where slug = 'week-6';

update public.challenge_videos set
  title = 'What''s Next',
  description = $$You finished, but a blueprint was never meant to sit in a drawer. Michael shares three next steps: keep the accountability alive, carry the framework into daily life with the ForgedLife app, and invite the next man to walk through the challenge with you. Keep building.$$,
  video_url = 'https://vimeo.com/1239704415', drive_id = null, youtube_id = null, embed_direct = false,
  thumbnail_url = '/6-week-challenge/thumbnails/v2/closing.jpg', thumbnail_dark = '/6-week-challenge/thumbnails/v2/closing.jpg',
  availability = 'available', updated_at = now()
where slug = 'closing';

-- Email posters: new artwork with a "Watch the video" band (new file names, so inboxes don't
-- show a cached copy of the old image).
update public.email_templates set
  html_body = replace(replace(replace(replace(replace(replace(replace(replace(html_body,
    '/6-week-challenge/thumbnails/invitation-email.png', '/6-week-challenge/thumbnails/v2/invitation-email.jpg'),
    '/6-week-challenge/thumbnails/week1-email.png', '/6-week-challenge/thumbnails/v2/week-1-email.jpg'),
    '/6-week-challenge/thumbnails/week2-email.png', '/6-week-challenge/thumbnails/v2/week-2-email.jpg'),
    '/6-week-challenge/thumbnails/week3-email.png', '/6-week-challenge/thumbnails/v2/week-3-email.jpg'),
    '/6-week-challenge/thumbnails/week4-email.png', '/6-week-challenge/thumbnails/v2/week-4-email.jpg'),
    '/6-week-challenge/thumbnails/week5-email.png', '/6-week-challenge/thumbnails/v2/week-5-email.jpg'),
    '/6-week-challenge/thumbnails/week6-email.png', '/6-week-challenge/thumbnails/v2/week-6-email.jpg'),
    '/6-week-challenge/thumbnails/whats-next-email.png', '/6-week-challenge/thumbnails/v2/closing-email.jpg'),
  updated_at = now()
where html_body like '%/6-week-challenge/thumbnails/%-email.png%';
