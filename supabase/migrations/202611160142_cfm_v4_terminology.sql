-- Created for More Check-In v4 (revised 2026-09-11) — stored copy that still
-- carried the older wording. Code-owned copy is updated in
-- lib/check-in/created-for-more.ts and lib/pilot/constants.ts.
--
-- Deliberately NOT touched: check_in_submissions. Past results keep the wording
-- they were taken on (v3); new results record details.version = 'cfm-v4-2026-09-11'.

-- 1. The Week 5 video description still said "keystone habits".
update public.challenge_videos
set description = replace(
      replace(description, 'Michael walks through keystone habits', 'Michael walks through keystone rhythms'),
      'Design one habit, protect one rhythm of renewal', 'Design one keystone rhythm, protect one rhythm of renewal'),
    updated_at = now()
where slug = 'week-5'
  and description ilike '%keystone habits%';

-- 2. The pilot check-in builder's unpublished draft still holds v3 statements.
--    Publishing it would bring them back, so bring the draft up to v4.
update public.pilot_forms
set draft_definition = replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
      draft_definition::text,
      'I have identified one or two habits that, if kept, would change everything else.',
      'I have identified one or two keystone rhythms that strengthen other important areas of my life.'),
      'When a keystone rhythm slips, I notice quickly and recover instead of spiraling.',
      'When a keystone rhythm slips, I notice quickly and return instead of spiraling.'),
      'When a keystone habit slips, I notice quickly and recover instead of spiraling.',
      'When a keystone rhythm slips, I notice quickly and return instead of spiraling.'),
      'My habits are shaping my identity, not just filling my to-do list.',
      'My rhythms support who I am becoming, rather than simply filling my to-do list.'),
      'I am intentionally shaping what the next generation sees in me.',
      'I intentionally model the values I hope others will learn from my life.'),
      'My time, money, and influence are aligned with what I want to leave behind.',
      'I use my time, resources, and influence to help others grow in what matters now.'),
      'I have had a real conversation about legacy with someone I love.',
      'I model and explain generosity and invite others to practice it with me.'),
      'I am building something today that will outlast me.',
      'I give others opportunities to practice what they are learning and encourage them to pass it on.'),
      'What is my life producing beyond me?',
      'What am I helping others learn, practice, and pass on while I am living?'),
      'Do my daily habits move me toward the life I say I want?',
      'Do my repeated rhythms support the life I say I want?'),
      'Mission, Values & Purpose',
      'Mission + Values + Direction'),
      'Are the areas I stand on every day actually able to hold weight?',
      'Are the areas I steward every day receiving the attention they need?')::jsonb
where kind = 'check_in'
  and draft_definition is not null
  and draft_definition::text ilike '%change everything else%';
