-- The Homework video moves to Vimeo with its new description (same pattern as 202610270122).
-- No new thumbnail was supplied, so it keeps homework.svg.
update public.challenge_videos set
  description = $$The work between sessions is where real growth begins. Complete your check-in, fill out your guide, share what you're learning with another man, and take the next step by bringing it to your group.$$,
  video_url = 'https://vimeo.com/1239920175', drive_id = null, youtube_id = null, embed_direct = false,
  availability = 'available', updated_at = now()
where slug = 'homework';
