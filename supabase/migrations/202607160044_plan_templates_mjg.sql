-- Plan Builder — MJG-specific starter templates.
--
-- The first six (202607160041) are generic scaffolding from the spec. These ten are
-- built around the work MJG actually does: the 7-Day Stewardship Pilot, church
-- partnerships, pastor/elder review, the email journey, content, events, the Inner
-- Circle, resource launches, the dashboard itself, and messaging compliance.
--
-- Re-runnable: upserts by slug, so editing one here and re-applying updates it.
-- template_data shape is documented in 202607160041_plan_builder_templates.sql.

insert into public.plan_templates (slug, name, description, category, plan_type, visibility, is_system_template, badge, template_data)
values
  (
    'stewardship-pilot-wave',
    'Stewardship Pilot Wave',
    'Run a full wave of the 7-Day Stewardship Pilot, from recruiting participants through check-ins to the wrap-up report.',
    'Stewardship Pilot',
    'basic',
    'app',
    true,
    'recommended',
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'planning', 'name', 'Planning'),
        jsonb_build_object('key', 'recruiting', 'name', 'Recruiting'),
        jsonb_build_object('key', 'onboarding', 'name', 'Onboarding'),
        jsonb_build_object('key', 'live', 'name', 'Week Live'),
        jsonb_build_object('key', 'checkins', 'name', 'Check-Ins'),
        jsonb_build_object('key', 'wrap', 'name', 'Wrap-Up'),
        jsonb_build_object('key', 'reporting', 'name', 'Reporting')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Participant-facing', 'color', 'gold'),
        jsonb_build_object('name', 'Internal', 'color', 'slate'),
        jsonb_build_object('name', 'Needs Mike', 'color', 'clay')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Set the wave dates and target size', 'group_key', 'planning', 'priority', 'high', 'due_offset_days', 2),
        jsonb_build_object('title', 'Confirm the participant list', 'group_key', 'recruiting', 'priority', 'high', 'due_offset_days', 5,
          'checklist', jsonb_build_array('Import contacts', 'Tag by wave', 'Check opt-in status')),
        jsonb_build_object('title', 'Schedule the welcome email + SMS', 'group_key', 'onboarding', 'priority', 'high', 'due_offset_days', 6),
        jsonb_build_object('title', 'Day 1 goes live', 'group_key', 'live', 'priority', 'urgent', 'due_offset_days', 7, 'is_milestone', true),
        jsonb_build_object('title', 'Monitor daily check-in completion', 'group_key', 'checkins', 'priority', 'high', 'start_offset_days', 7, 'due_offset_days', 14),
        jsonb_build_object('title', 'Follow up with anyone who missed a check-in', 'group_key', 'checkins', 'priority', 'high', 'due_offset_days', 12),
        jsonb_build_object('title', 'Send the closing survey', 'group_key', 'wrap', 'priority', 'high', 'due_offset_days', 15),
        jsonb_build_object('title', 'Write the wave report', 'group_key', 'reporting', 'priority', 'medium', 'due_offset_days', 21,
          'checklist', jsonb_build_array('Completion rate', 'Survey themes', 'Stories worth sharing', 'What to change next wave'))
      )
    )
  ),
  (
    'church-partnership-onboarding',
    'Church Partnership Onboarding',
    'Take a church from first conversation to an active partnership, with the pastor/elder loop built in.',
    'Partnerships',
    'basic',
    'app',
    true,
    'recommended',
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'intro', 'name', 'Intro Call'),
        jsonb_build_object('key', 'discovery', 'name', 'Discovery'),
        jsonb_build_object('key', 'proposal', 'name', 'Proposal'),
        jsonb_build_object('key', 'agreement', 'name', 'Agreement'),
        jsonb_build_object('key', 'setup', 'name', 'Setup'),
        jsonb_build_object('key', 'launch', 'name', 'Launch'),
        jsonb_build_object('key', 'ongoing', 'name', 'Ongoing')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Waiting on church', 'color', 'clay'),
        jsonb_build_object('name', 'Needs Mike', 'color', 'gold'),
        jsonb_build_object('name', 'Admin', 'color', 'slate')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Hold the intro call with the pastor', 'group_key', 'intro', 'priority', 'high', 'due_offset_days', 3),
        jsonb_build_object('title', 'Understand the congregation and their needs', 'group_key', 'discovery', 'priority', 'high', 'due_offset_days', 7,
          'checklist', jsonb_build_array('Size and demographics', 'Current stewardship teaching', 'Leadership structure', 'Timing constraints')),
        jsonb_build_object('title', 'Send the partnership proposal', 'group_key', 'proposal', 'priority', 'high', 'due_offset_days', 12),
        jsonb_build_object('title', 'Agreement signed', 'group_key', 'agreement', 'priority', 'urgent', 'due_offset_days', 20, 'is_milestone', true),
        jsonb_build_object('title', 'Add the church contacts and tag them', 'group_key', 'setup', 'priority', 'medium', 'due_offset_days', 24),
        jsonb_build_object('title', 'Brief the pastor on the check-in process', 'group_key', 'launch', 'priority', 'high', 'due_offset_days', 28),
        jsonb_build_object('title', 'Schedule the first quarterly check-in', 'group_key', 'ongoing', 'priority', 'medium', 'due_offset_days', 90)
      )
    )
  ),
  (
    'pastor-elder-review-cycle',
    'Pastor & Elder Review Cycle',
    'Invite pastors and elders to review, chase the stragglers, and close the loop on their feedback.',
    'Partnerships',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'invite', 'name', 'To Invite'),
        jsonb_build_object('key', 'awaiting', 'name', 'Awaiting Response'),
        jsonb_build_object('key', 'review', 'name', 'In Review'),
        jsonb_build_object('key', 'followup', 'name', 'Follow-Up'),
        jsonb_build_object('key', 'done', 'name', 'Complete')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Pastor', 'color', 'gold'),
        jsonb_build_object('name', 'Elder', 'color', 'plum'),
        jsonb_build_object('name', 'Overdue', 'color', 'clay')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Build the reviewer list', 'group_key', 'invite', 'priority', 'high', 'due_offset_days', 2),
        jsonb_build_object('title', 'Send review invitations', 'group_key', 'invite', 'priority', 'high', 'due_offset_days', 3),
        jsonb_build_object('title', 'Chase anyone who hasn’t responded in a week', 'group_key', 'awaiting', 'priority', 'medium', 'due_offset_days', 10),
        jsonb_build_object('title', 'Read and theme the responses', 'group_key', 'review', 'priority', 'high', 'due_offset_days', 17),
        jsonb_build_object('title', 'Thank every reviewer personally', 'group_key', 'followup', 'priority', 'medium', 'due_offset_days', 21)
      )
    )
  ),
  (
    'email-journey-build',
    'Email Journey Build',
    'Design, build and wire an automated email journey — mapping to templates, automations and live monitoring.',
    'Communications',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'map', 'name', 'Map the Journey'),
        jsonb_build_object('key', 'copy', 'name', 'Draft Copy'),
        jsonb_build_object('key', 'build', 'name', 'Build Templates'),
        jsonb_build_object('key', 'wire', 'name', 'Wire Automations'),
        jsonb_build_object('key', 'test', 'name', 'Test'),
        jsonb_build_object('key', 'live', 'name', 'Live'),
        jsonb_build_object('key', 'monitor', 'name', 'Monitor')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Copy', 'color', 'gold'),
        jsonb_build_object('name', 'Build', 'color', 'slate'),
        jsonb_build_object('name', 'Compliance', 'color', 'clay')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Map every trigger and the email it fires', 'group_key', 'map', 'priority', 'high', 'due_offset_days', 3),
        jsonb_build_object('title', 'Draft the copy for each step', 'group_key', 'copy', 'priority', 'high', 'due_offset_days', 8),
        jsonb_build_object('title', 'Build the templates on-brand', 'group_key', 'build', 'priority', 'medium', 'due_offset_days', 12,
          'checklist', jsonb_build_array('Header + logo', 'Merge fields', 'Unsubscribe link', 'Mobile check')),
        jsonb_build_object('title', 'Map each event to its template', 'group_key', 'wire', 'priority', 'high', 'due_offset_days', 15),
        jsonb_build_object('title', 'Send test sends to the team', 'group_key', 'test', 'priority', 'high', 'due_offset_days', 17),
        jsonb_build_object('title', 'Journey goes live', 'group_key', 'live', 'priority', 'urgent', 'due_offset_days', 20, 'is_milestone', true),
        jsonb_build_object('title', 'Review opens, clicks and drop-off after two weeks', 'group_key', 'monitor', 'priority', 'medium', 'due_offset_days', 34)
      )
    )
  ),
  (
    'content-production-sprint',
    'Content Production Sprint',
    'Take teaching content from idea to published — blog, social and email in one pass.',
    'Content Production',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'ideas', 'name', 'Ideas'),
        jsonb_build_object('key', 'outline', 'name', 'Outline'),
        jsonb_build_object('key', 'draft', 'name', 'Draft'),
        jsonb_build_object('key', 'review', 'name', 'Review'),
        jsonb_build_object('key', 'design', 'name', 'Design'),
        jsonb_build_object('key', 'scheduled', 'name', 'Scheduled'),
        jsonb_build_object('key', 'published', 'name', 'Published')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Blog', 'color', 'gold'),
        jsonb_build_object('name', 'Social', 'color', 'plum'),
        jsonb_build_object('name', 'Email', 'color', 'sand'),
        jsonb_build_object('name', 'Needs Mike', 'color', 'clay')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Pick the theme for this sprint', 'group_key', 'ideas', 'priority', 'high', 'due_offset_days', 1),
        jsonb_build_object('title', 'Outline the teaching piece', 'group_key', 'outline', 'priority', 'high', 'due_offset_days', 3),
        jsonb_build_object('title', 'Write the blog post', 'group_key', 'draft', 'priority', 'high', 'due_offset_days', 7),
        jsonb_build_object('title', 'Mike reviews the draft', 'group_key', 'review', 'priority', 'high', 'due_offset_days', 10),
        jsonb_build_object('title', 'Cut social posts from the piece', 'group_key', 'design', 'priority', 'medium', 'due_offset_days', 12,
          'checklist', jsonb_build_array('Pull 3 quotes', 'Design the images', 'Write the captions')),
        jsonb_build_object('title', 'Schedule everything', 'group_key', 'scheduled', 'priority', 'medium', 'due_offset_days', 13)
      )
    )
  ),
  (
    'speaking-engagement',
    'Speaking Engagement',
    'Everything around a talk or event — from inquiry through run of show to the follow-up.',
    'Events',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'calendar'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'inquiry', 'name', 'Inquiry'),
        jsonb_build_object('key', 'confirmed', 'name', 'Confirmed'),
        jsonb_build_object('key', 'prep', 'name', 'Prep'),
        jsonb_build_object('key', 'promo', 'name', 'Promotion'),
        jsonb_build_object('key', 'runofshow', 'name', 'Run of Show'),
        jsonb_build_object('key', 'eventday', 'name', 'Event Day'),
        jsonb_build_object('key', 'followup', 'name', 'Follow-Up')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Travel', 'color', 'slate'),
        jsonb_build_object('name', 'AV', 'color', 'plum'),
        jsonb_build_object('name', 'Needs Mike', 'color', 'gold')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Confirm date, venue and audience', 'group_key', 'confirmed', 'priority', 'high', 'due_offset_days', 3),
        jsonb_build_object('title', 'Book travel and accommodation', 'group_key', 'prep', 'priority', 'high', 'due_offset_days', 10),
        jsonb_build_object('title', 'Finalize the talk', 'group_key', 'prep', 'priority', 'high', 'due_offset_days', 21,
          'checklist', jsonb_build_array('Outline', 'Slides', 'Handout', 'Rehearse')),
        jsonb_build_object('title', 'Promote it across email and social', 'group_key', 'promo', 'priority', 'medium', 'due_offset_days', 14),
        jsonb_build_object('title', 'Confirm AV and timings with the host', 'group_key', 'runofshow', 'priority', 'high', 'due_offset_days', 25),
        jsonb_build_object('title', 'Event day', 'group_key', 'eventday', 'priority', 'urgent', 'due_offset_days', 30, 'is_milestone', true),
        jsonb_build_object('title', 'Thank the host and send the resources', 'group_key', 'followup', 'priority', 'high', 'due_offset_days', 32)
      )
    )
  ),
  (
    'inner-circle-cohort',
    'Inner Circle Cohort',
    'Run an Inner Circle cohort from applications through to graduation.',
    'Community',
    'basic',
    'app',
    true,
    'new',
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'applications', 'name', 'Applications'),
        jsonb_build_object('key', 'screening', 'name', 'Screening'),
        jsonb_build_object('key', 'invited', 'name', 'Invited'),
        jsonb_build_object('key', 'onboarding', 'name', 'Onboarding'),
        jsonb_build_object('key', 'active', 'name', 'Active'),
        jsonb_build_object('key', 'graduated', 'name', 'Graduated')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Priority applicant', 'color', 'gold'),
        jsonb_build_object('name', 'Needs a call', 'color', 'clay')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Open applications', 'group_key', 'applications', 'priority', 'high', 'due_offset_days', 1),
        jsonb_build_object('title', 'Review and shortlist', 'group_key', 'screening', 'priority', 'high', 'due_offset_days', 10),
        jsonb_build_object('title', 'Send invitations', 'group_key', 'invited', 'priority', 'high', 'due_offset_days', 14),
        jsonb_build_object('title', 'Run the kickoff session', 'group_key', 'onboarding', 'priority', 'high', 'due_offset_days', 21, 'is_milestone', true),
        jsonb_build_object('title', 'Hold the mid-cohort check-in', 'group_key', 'active', 'priority', 'medium', 'due_offset_days', 45)
      )
    )
  ),
  (
    'resource-launch',
    'Resource Launch',
    'Launch a book, guide or downloadable resource, from manuscript to post-launch follow-through.',
    'Product Launch',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'manuscript', 'name', 'Manuscript'),
        jsonb_build_object('key', 'edit', 'name', 'Edit'),
        jsonb_build_object('key', 'design', 'name', 'Design'),
        jsonb_build_object('key', 'prelaunch', 'name', 'Pre-Launch'),
        jsonb_build_object('key', 'launch', 'name', 'Launch Week'),
        jsonb_build_object('key', 'post', 'name', 'Post-Launch')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Writing', 'color', 'gold'),
        jsonb_build_object('name', 'Design', 'color', 'plum'),
        jsonb_build_object('name', 'Promo', 'color', 'sand')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Finish the manuscript', 'group_key', 'manuscript', 'priority', 'high', 'due_offset_days', 30),
        jsonb_build_object('title', 'Editing pass', 'group_key', 'edit', 'priority', 'high', 'due_offset_days', 45),
        jsonb_build_object('title', 'Cover and interior design', 'group_key', 'design', 'priority', 'medium', 'due_offset_days', 60),
        jsonb_build_object('title', 'Build the landing page', 'group_key', 'prelaunch', 'priority', 'high', 'due_offset_days', 70),
        jsonb_build_object('title', 'Warm the list with a teaser sequence', 'group_key', 'prelaunch', 'priority', 'medium', 'due_offset_days', 75),
        jsonb_build_object('title', 'Launch day', 'group_key', 'launch', 'priority', 'urgent', 'due_offset_days', 80, 'is_milestone', true),
        jsonb_build_object('title', 'Gather testimonials and results', 'group_key', 'post', 'priority', 'medium', 'due_offset_days', 95)
      )
    )
  ),
  (
    'dashboard-release',
    'Website & Dashboard Release',
    'Ship a change to the MJG site or dashboard, from spec through staging to release.',
    'Website Development',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'backlog', 'name', 'Backlog'),
        jsonb_build_object('key', 'spec', 'name', 'Spec'),
        jsonb_build_object('key', 'build', 'name', 'Build'),
        jsonb_build_object('key', 'review', 'name', 'Review'),
        jsonb_build_object('key', 'staging', 'name', 'Staging'),
        jsonb_build_object('key', 'released', 'name', 'Released')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Bug', 'color', 'clay'),
        jsonb_build_object('name', 'Feature', 'color', 'gold'),
        jsonb_build_object('name', 'Content', 'color', 'sand')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Write down what this change is for', 'group_key', 'spec', 'priority', 'high', 'due_offset_days', 2),
        jsonb_build_object('title', 'Build it', 'group_key', 'build', 'priority', 'high', 'due_offset_days', 7),
        jsonb_build_object('title', 'Review on staging', 'group_key', 'review', 'priority', 'high', 'due_offset_days', 9),
        jsonb_build_object('title', 'Release', 'group_key', 'released', 'priority', 'high', 'due_offset_days', 10, 'is_milestone', true,
          'checklist', jsonb_build_array('Migrations applied', 'Typecheck + build pass', 'Deployed', 'Spot-checked live'))
      )
    )
  ),
  (
    'messaging-compliance',
    'Messaging Compliance Setup',
    'Get SMS and email messaging approved and compliant — registration, opt-in pages, and the paperwork.',
    'Operations',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'requirements', 'name', 'Requirements'),
        jsonb_build_object('key', 'docs', 'name', 'Documentation'),
        jsonb_build_object('key', 'submitted', 'name', 'Submitted'),
        jsonb_build_object('key', 'underreview', 'name', 'Under Review'),
        jsonb_build_object('key', 'approved', 'name', 'Approved'),
        jsonb_build_object('key', 'live', 'name', 'Live')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Blocker', 'color', 'clay'),
        jsonb_build_object('name', 'Waiting on carrier', 'color', 'sand'),
        jsonb_build_object('name', 'Legal', 'color', 'slate')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'List what the carrier requires', 'group_key', 'requirements', 'priority', 'high', 'due_offset_days', 2),
        jsonb_build_object('title', 'Publish opt-in and opt-out pages', 'group_key', 'docs', 'priority', 'urgent', 'due_offset_days', 5,
          'checklist', jsonb_build_array('SMS opt-in', 'SMS opt-out', 'Email opt-in', 'Email opt-out')),
        jsonb_build_object('title', 'Publish privacy policy and terms', 'group_key', 'docs', 'priority', 'urgent', 'due_offset_days', 5),
        jsonb_build_object('title', 'Submit the campaign for review', 'group_key', 'submitted', 'priority', 'high', 'due_offset_days', 7, 'is_milestone', true),
        jsonb_build_object('title', 'Answer any carrier follow-up questions', 'group_key', 'underreview', 'priority', 'high', 'due_offset_days', 14),
        jsonb_build_object('title', 'Send a test message end to end', 'group_key', 'live', 'priority', 'high', 'due_offset_days', 21)
      )
    )
  )
on conflict (slug) do update set
  name          = excluded.name,
  description   = excluded.description,
  category      = excluded.category,
  plan_type     = excluded.plan_type,
  visibility    = excluded.visibility,
  badge         = excluded.badge,
  template_data = excluded.template_data,
  updated_at    = now();
