-- Seeds "The 6 Week Challenge" email templates from the v.4 Participant Study Guide
-- and Leader & Campaign Guide. Templates are created as DRAFT under the
-- six_week_challenge category so they show under the filter and can be reviewed
-- before activation. Idempotent via slug.

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values
-- ============================ PARTICIPANT (6 weekly emails) ============================
(
  '6WC — Participant — Week 1: Wake Up',
  '6wc-participant-week-1',
  'Week 1: Wake Up — {{first_name}}, what are you building?',
  'Name your current reality and notice the drift.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">The Life You're Building · A 6-Week Men's Study</p>
  <h1 style="font-size:26px;margin:6px 0 2px;">Week 1 — Wake Up</h1>
  <p style="color:#6a6a6a;font-family:Arial,sans-serif;font-size:14px;margin:0 0 22px;">Name your current reality and notice drift.</p>
  <p>Hi {{first_name}},</p>
  <p>Most men don't drift because they stop caring. Life just gets full — calendars fill, work expands, and somewhere along the way we stop asking one of the most important questions we could ask. This week we slow down and tell the truth about the life we're actually building.</p>
  <div style="border-left:3px solid #C9A46E;padding:6px 16px;margin:22px 0;font-style:italic;color:#333;">What kind of life am I actually building?</div>
  <p><strong>This week:</strong> watch the short Week 1 video, complete your pre-work reading, and come ready to share one honest insight. Your one step — notice a single area where you've been drifting.</p>
  <p style="text-align:center;margin:26px 0 10px;"><a href="#" style="background:#191815;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">▶ Watch this week's video</a></p>
  <p style="text-align:center;margin:0 0 26px;"><a href="https://michaeljgauthier.com/created-for-more-check-in" style="background:#C9A46E;color:#191815;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Complete your Check-In</a></p>
  <p style="margin-bottom:2px;">Let's build,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Participant — Week 2: See the Blueprint',
  '6wc-participant-week-2',
  'Week 2: See the Blueprint — clarity on what your life is for',
  'Clarify bedrock, identity, values, mission, and daily purpose.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">The Life You're Building · A 6-Week Men's Study</p>
  <h1 style="font-size:26px;margin:6px 0 2px;">Week 2 — See the Blueprint</h1>
  <p style="color:#6a6a6a;font-family:Arial,sans-serif;font-size:14px;margin:0 0 22px;">Clarify bedrock, identity, values, mission, and daily purpose.</p>
  <p>Hi {{first_name}},</p>
  <p>A life is built from the ground up — on what you believe (your Bedrock) and what you're building toward (your Foundation). This week we get clear on identity, values, and daily purpose, so the everyday decisions have something solid to rest on.</p>
  <div style="border-left:3px solid #C9A46E;padding:6px 16px;margin:22px 0;font-style:italic;color:#333;">Is my identity rooted in something deeper than performance and pressure?</div>
  <p><strong>This week:</strong> watch the Week 2 video and complete the reading. Your one step — draft a one-sentence purpose statement you can use to make a real decision this week.</p>
  <p style="text-align:center;margin:26px 0 10px;"><a href="#" style="background:#191815;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">▶ Watch this week's video</a></p>
  <p style="margin-bottom:2px;">Keep building,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Participant — Week 3: Evaluate the Pillars',
  '6wc-participant-week-3',
  'Week 3: Evaluate the Pillars — Family, Fitness, Fun & Finances',
  'Assess the four pillars and choose one priority.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">The Life You're Building · A 6-Week Men's Study</p>
  <h1 style="font-size:26px;margin:6px 0 2px;">Week 3 — Evaluate the Pillars</h1>
  <p style="color:#6a6a6a;font-family:Arial,sans-serif;font-size:14px;margin:0 0 22px;">Assess family, fitness, fun, and finances; choose one priority.</p>
  <p>Hi {{first_name}},</p>
  <p>The Four Pillars — Family, Fitness, Fun, and Finances — carry the weight of everyday life. They matter deeply, but they can only stand as long as what is beneath and around them is solid. This week we assess each honestly and choose one to focus on.</p>
  <div style="border-left:3px solid #C9A46E;padding:6px 16px;margin:22px 0;font-style:italic;color:#333;">Are the areas I stand on every day actually able to hold weight?</div>
  <p><strong>This week:</strong> watch the Week 3 video and complete the reading. Your one step — choose your Focus Pillar and take one visible action in it.</p>
  <p style="text-align:center;margin:26px 0 10px;"><a href="#" style="background:#191815;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">▶ Watch this week's video</a></p>
  <p style="margin-bottom:2px;">Keep building,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Participant — Week 4: Install the Guardrails',
  '6wc-participant-week-4',
  'Week 4: Install the Guardrails — protect what matters',
  'Build specific boundaries before regret arrives.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">The Life You're Building · A 6-Week Men's Study</p>
  <h1 style="font-size:26px;margin:6px 0 2px;">Week 4 — Install the Guardrails</h1>
  <p style="color:#6a6a6a;font-family:Arial,sans-serif;font-size:14px;margin:0 0 22px;">Build specific boundaries that protect what matters most.</p>
  <p>Hi {{first_name}},</p>
  <p>Guardrails are pre-decided boundaries that protect what matters before regret arrives. Good intentions rarely hold under pressure — a clear line does. This week we build a few specific ones and invite a brother to help us keep them.</p>
  <div style="border-left:3px solid #C9A46E;padding:6px 16px;margin:22px 0;font-style:italic;color:#333;">Do I have boundaries in place before I need them, not just after damage is done?</div>
  <p><strong>This week:</strong> watch the Week 4 video and complete the reading. Your one step — write one guardrail and tell one man who will help you keep it.</p>
  <p style="text-align:center;margin:26px 0 10px;"><a href="#" style="background:#191815;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">▶ Watch this week's video</a></p>
  <p style="margin-bottom:2px;">Keep building,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Participant — Week 5: Strengthen the Structure',
  '6wc-participant-week-5',
  'Week 5: Strengthen the Structure — habits & energy',
  'Design keystone habits and steward your energy.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">The Life You're Building · A 6-Week Men's Study</p>
  <h1 style="font-size:26px;margin:6px 0 2px;">Week 5 — Strengthen the Structure</h1>
  <p style="color:#6a6a6a;font-family:Arial,sans-serif;font-size:14px;margin:0 0 22px;">Design keystone habits and steward energy.</p>
  <p>Hi {{first_name}},</p>
  <p>Small repeated rhythms pull the rest of life into alignment — and energy is the fuel beneath every other resource. This week we design one or two keystone habits and protect the renewal that keeps us from running on empty.</p>
  <div style="border-left:3px solid #C9A46E;padding:6px 16px;margin:22px 0;font-style:italic;color:#333;">Do my daily habits move me toward the life I say I want?</div>
  <p><strong>This week:</strong> watch the Week 5 video and complete the reading. Your one step — choose one keystone habit and attach it to a rhythm you already have.</p>
  <p style="text-align:center;margin:26px 0 10px;"><a href="#" style="background:#191815;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">▶ Watch this week's video</a></p>
  <p style="margin-bottom:2px;">Keep building,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Participant — Week 6: Design My Life',
  '6wc-participant-week-6',
  'Week 6: Design My Life — assemble your Blueprint',
  'Name your legacy and commit to 30 days.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">The Life You're Building · A 6-Week Men's Study</p>
  <h1 style="font-size:26px;margin:6px 0 2px;">Week 6 — Design My Life</h1>
  <p style="color:#6a6a6a;font-family:Arial,sans-serif;font-size:14px;margin:0 0 22px;">Assemble a Personal Blueprint, name a legacy, commit to 30 days.</p>
  <p>Hi {{first_name}},</p>
  <p>This is where it comes together. You'll assemble your Personal Blueprint, name the legacy you're building, and commit to a 30-day plan. Complete your AFTER Check-In and watch your score move where you did the work — a life that lasts is built one faithful step at a time.</p>
  <div style="border-left:3px solid #C9A46E;padding:6px 16px;margin:22px 0;font-style:italic;color:#333;">What is my life producing beyond me?</div>
  <p><strong>This week:</strong> watch the Week 6 video, complete your <strong>AFTER</strong> Check-In, and commit to a 30-day plan you'll revisit in a month.</p>
  <p style="text-align:center;margin:26px 0 10px;"><a href="#" style="background:#191815;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">▶ Watch this week's video</a></p>
  <p style="text-align:center;margin:0 0 26px;"><a href="https://michaeljgauthier.com/created-for-more-check-in" style="background:#C9A46E;color:#191815;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Complete your AFTER Check-In</a></p>
  <p style="margin-bottom:2px;">Well done,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
-- ============================ LEADER / FACILITATOR (campaign milestones) ============================
(
  '6WC — Leader — Welcome & Recruit',
  '6wc-leader-welcome-recruit',
  'You''re leading The Life You''re Building — let''s get your group set',
  'Set your dates, invite 8–12 men, and share the invite video.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">Leader &amp; Campaign Guide · The Life You're Building</p>
  <h1 style="font-size:26px;margin:6px 0 12px;">Thank you for stepping up.</h1>
  <p>Hi {{first_name}},</p>
  <p>You don't need to be a pastor, a counselor, or a polished speaker to lead this well. You need three things: a willingness to go first in honesty, the discipline to protect the structure of each meeting, and enough care to follow up with your men between sessions. This guide gives you the rest.</p>
  <p><strong>3–4 weeks out — your setup:</strong></p>
  <ul>
    <li>Set all <strong>six dates</strong> and a location (same day and time each week — predictability protects attendance).</li>
    <li>Invite <strong>8–12 men</strong> personally. A direct ask beats any announcement, and the short invite video helps them say yes.</li>
    <li>Order or print the <strong>Participant Guides</strong>.</li>
  </ul>
  <p>Invite men you respect and believe will engage honestly — not men you're trying to fix. The most powerful thing you bring is not expertise. It's example.</p>
  <p style="text-align:center;margin:26px 0;"><a href="#" style="background:#191815;color:#ffffff;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;">▶ Share the invite video</a></p>
  <p style="margin-bottom:2px;">You've got this,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Leader — One Week Out',
  '6wc-leader-one-week-out',
  'One week out — send the welcome and the BEFORE Check-In',
  'Prep your men for Week 1.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">Leader &amp; Campaign Guide · The Life You're Building</p>
  <h1 style="font-size:26px;margin:6px 0 12px;">One week out</h1>
  <p>Hi {{first_name}},</p>
  <p>You're almost there. This week, prepare your men so Week 1 lands well:</p>
  <ul>
    <li>Send the <strong>welcome email</strong> with the guide attached.</li>
    <li>Ask each man to complete the <strong>BEFORE column</strong> of the seven-layer Created for More Check-In and the Week 1 pre-work.</li>
    <li>Read this guide once, then re-read Week 1.</li>
  </ul>
  <p>Remember the standard rhythm — about <strong>75 minutes</strong>: welcome &amp; prayer, a personal check-in round, the teaching video, guided discussion (depth over coverage), this week's action, and closing prayer. End on time.</p>
  <p style="text-align:center;margin:26px 0;"><a href="https://michaeljgauthier.com/created-for-more-check-in" style="background:#C9A46E;color:#191815;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Share the Check-In link</a></p>
  <p style="margin-bottom:2px;">For the men,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Leader — Weekly Session Reminder',
  '6wc-leader-weekly-reminder',
  'This week''s session — a quick reminder',
  'Run the meeting, play the video, capture a debrief.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">Leader &amp; Campaign Guide · The Life You're Building</p>
  <h1 style="font-size:26px;margin:6px 0 12px;">Your session this week</h1>
  <p>Hi {{first_name}},</p>
  <p>A quick reminder as you lead this week's meeting:</p>
  <ul>
    <li>Play this week's <strong>teaching video</strong> (~10–12 min), then add your own story and the key lesson.</li>
    <li>Use <strong>two or three primary questions</strong> — depth over coverage. Ask one question at a time and allow silence.</li>
    <li>Close with <strong>this week's action</strong> and prayer. End on time.</li>
    <li>Afterward, <strong>capture a short debrief</strong> — a few notes on what happened and who to follow up with.</li>
  </ul>
  <p>Facilitate rather than perform. When you share honestly first, you give every man permission to do the same.</p>
  <p style="margin-bottom:2px;">Lead well,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Leader — Midpoint Pulse (after Week 3)',
  '6wc-leader-midpoint-pulse',
  'Midpoint — how is your group landing?',
  'Take a pulse after Week 3 and adjust your support.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">Leader &amp; Campaign Guide · The Life You're Building</p>
  <h1 style="font-size:26px;margin:6px 0 12px;">Midpoint check</h1>
  <p>Hi {{first_name}},</p>
  <p>You're halfway. Now is a good time to take a quiet pulse on how the group is landing and adjust your support for the second half:</p>
  <ul>
    <li>Who is engaging, and who has gone quiet? Reach out personally to one or two men this week.</li>
    <li>Is the discussion getting honest, or staying safe? Model a little more vulnerability if needed.</li>
    <li>Are men actually taking their weekly action, or just talking? Gently raise the bar.</li>
  </ul>
  <p>Transformation comes first — never turn the room into a survey while men are sharing. Let the Check-In do the measuring, before and after.</p>
  <p style="margin-bottom:2px;">Stay the course,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
),
(
  '6WC — Leader — Final Survey & 30-Day Follow-Up',
  '6wc-leader-final-30day',
  'You finished — capture the growth and set the 30-day',
  'Send the final survey and schedule the 30-day follow-up.',
  $html$<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#191815;line-height:1.6;">
  <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#C9A46E;font-family:Arial,sans-serif;">Leader &amp; Campaign Guide · The Life You're Building</p>
  <h1 style="font-size:26px;margin:6px 0 12px;">You finished the six weeks.</h1>
  <p>Hi {{first_name}},</p>
  <p>Well done. Now let's capture what happened — measurable growth and real stories — so you can encourage your men and, if you sense the call, multiply into more groups:</p>
  <ul>
    <li>Send the <strong>final survey</strong> to the group.</li>
    <li>Have each man complete the <strong>AFTER column</strong> of the Created for More Check-In and compare it to their BEFORE score.</li>
    <li><strong>Schedule the 30-day follow-up</strong> — reconnect, complete the 30-DAY column, and gather what actually lasted.</li>
    <li>Ask who would recommend the group, and note the one or two ready to lead the next one.</li>
  </ul>
  <p style="text-align:center;margin:26px 0;"><a href="https://michaeljgauthier.com/created-for-more-check-in" style="background:#C9A46E;color:#191815;padding:12px 22px;border-radius:6px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Share the AFTER Check-In</a></p>
  <p style="margin-bottom:2px;">Multiply it,</p>
  <p style="margin-top:0;">— Michael J. Gauthier</p>
</div>$html$,
  null, 'six_week_challenge', 'draft', '{first_name,last_name,full_name}'
)
on conflict (slug) do nothing;
