-- Plan Builder starter templates (app templates, owned by the product).
-- Seeded as data rather than hard-coded in TS so super admins can edit them and so
-- "Created by Me" / "Shared" templates share one code path with the app ones.
-- Re-runnable: upserts by slug, so editing a template here and re-applying updates it.
--
-- template_data shape (consumed by public.create_plan_from_template):
--   groups:   [{ key, name, description? , color? }]        -- order = board columns
--   labels:   [{ name, color }]
--   tasks:    [{ title, group_key, description?, status?, priority?,
--                start_offset_days?, due_offset_days?, is_milestone?, checklist?: string[] }]
--   views:    ["board","grid"]                              -- shown in the preview panel
-- Offsets are days from the plan's start date; tasks are unscheduled if none is set.

insert into public.plan_templates (slug, name, description, category, plan_type, visibility, is_system_template, badge, template_data)
values
  (
    'simple-plan',
    'Simple Plan',
    'A clean four-column board for straightforward work. Start here if you just need to track tasks.',
    'Simple Plans',
    'basic',
    'app',
    true,
    'recommended',
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'todo', 'name', 'To Do'),
        jsonb_build_object('key', 'doing', 'name', 'In Progress'),
        jsonb_build_object('key', 'waiting', 'name', 'Waiting'),
        jsonb_build_object('key', 'done', 'name', 'Completed')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Quick win', 'color', 'gold'),
        jsonb_build_object('name', 'Needs input', 'color', 'clay')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Add your first task', 'group_key', 'todo', 'priority', 'medium', 'due_offset_days', 1,
          'description', 'Replace this with real work. Tasks can carry dates, labels, a checklist and an assignee.'),
        jsonb_build_object('title', 'Invite the people who will use this plan', 'group_key', 'todo', 'priority', 'medium', 'due_offset_days', 2)
      )
    )
  ),
  (
    'project-management',
    'Project Management',
    'Phase-based delivery from discovery through handoff. Good for client and internal projects with a defined end.',
    'Project Management',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'discovery', 'name', 'Discovery'),
        jsonb_build_object('key', 'planning', 'name', 'Planning'),
        jsonb_build_object('key', 'design', 'name', 'Design'),
        jsonb_build_object('key', 'production', 'name', 'Production'),
        jsonb_build_object('key', 'review', 'name', 'Review'),
        jsonb_build_object('key', 'delivery', 'name', 'Delivery'),
        jsonb_build_object('key', 'done', 'name', 'Completed')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Blocker', 'color', 'clay'),
        jsonb_build_object('name', 'Client', 'color', 'gold'),
        jsonb_build_object('name', 'Internal', 'color', 'slate')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Run kickoff and capture goals', 'group_key', 'discovery', 'priority', 'high', 'due_offset_days', 3,
          'checklist', jsonb_build_array('Confirm attendees', 'Agree the goal', 'Write up notes')),
        jsonb_build_object('title', 'Document scope and success measures', 'group_key', 'discovery', 'priority', 'high', 'due_offset_days', 5),
        jsonb_build_object('title', 'Build the schedule and name owners', 'group_key', 'planning', 'priority', 'high', 'due_offset_days', 7),
        jsonb_build_object('title', 'Draft the first design pass', 'group_key', 'design', 'priority', 'medium', 'start_offset_days', 7, 'due_offset_days', 14),
        jsonb_build_object('title', 'Internal review', 'group_key', 'review', 'priority', 'medium', 'due_offset_days', 21),
        jsonb_build_object('title', 'Client sign-off', 'group_key', 'delivery', 'priority', 'high', 'due_offset_days', 28, 'is_milestone', true)
      )
    )
  ),
  (
    'software-development',
    'Software Development',
    'A delivery board from backlog to release, with review and testing gates.',
    'Software Development',
    'basic',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'backlog', 'name', 'Backlog'),
        jsonb_build_object('key', 'ready', 'name', 'Ready'),
        jsonb_build_object('key', 'doing', 'name', 'In Progress'),
        jsonb_build_object('key', 'codereview', 'name', 'Code Review'),
        jsonb_build_object('key', 'testing', 'name', 'Testing'),
        jsonb_build_object('key', 'blocked', 'name', 'Blocked'),
        jsonb_build_object('key', 'released', 'name', 'Released')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Bug', 'color', 'clay'),
        jsonb_build_object('name', 'Feature', 'color', 'gold'),
        jsonb_build_object('name', 'Chore', 'color', 'slate'),
        jsonb_build_object('name', 'Tech debt', 'color', 'plum')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Groom the backlog', 'group_key', 'backlog', 'priority', 'medium', 'due_offset_days', 2),
        jsonb_build_object('title', 'Define acceptance criteria for the next item', 'group_key', 'ready', 'priority', 'high', 'due_offset_days', 3),
        jsonb_build_object('title', 'Set up the release checklist', 'group_key', 'ready', 'priority', 'medium', 'due_offset_days', 5,
          'checklist', jsonb_build_array('Typecheck passes', 'Lint passes', 'Migrations applied', 'Rollback plan written'))
      )
    )
  ),
  (
    'client-onboarding',
    'Client Onboarding',
    'Take a new client from signed to active without dropping a step.',
    'Client Onboarding',
    'basic',
    'app',
    true,
    'new',
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'new', 'name', 'New Client'),
        jsonb_build_object('key', 'info', 'name', 'Information Needed'),
        jsonb_build_object('key', 'setup', 'name', 'Setup'),
        jsonb_build_object('key', 'internal', 'name', 'Internal Review'),
        jsonb_build_object('key', 'client', 'name', 'Client Review'),
        jsonb_build_object('key', 'active', 'name', 'Active')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Waiting on client', 'color', 'clay'),
        jsonb_build_object('name', 'Priority', 'color', 'gold')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Send the welcome message', 'group_key', 'new', 'priority', 'high', 'due_offset_days', 1),
        jsonb_build_object('title', 'Collect intake details', 'group_key', 'info', 'priority', 'high', 'due_offset_days', 3,
          'checklist', jsonb_build_array('Contact details', 'Billing details', 'Access and logins')),
        jsonb_build_object('title', 'Create accounts and access', 'group_key', 'setup', 'priority', 'medium', 'due_offset_days', 5),
        jsonb_build_object('title', 'Book the kickoff call', 'group_key', 'client', 'priority', 'high', 'due_offset_days', 7),
        jsonb_build_object('title', 'Client is live', 'group_key', 'active', 'priority', 'medium', 'due_offset_days', 14, 'is_milestone', true)
      )
    )
  ),
  (
    'construction-project',
    'Construction Project',
    'Lead to warranty across every jobsite stage, including permitting and punch list.',
    'Construction',
    'premium',
    'app',
    true,
    null,
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'lead', 'name', 'Lead'),
        jsonb_build_object('key', 'precon', 'name', 'Pre-Construction'),
        jsonb_build_object('key', 'design', 'name', 'Design'),
        jsonb_build_object('key', 'estimating', 'name', 'Estimating'),
        jsonb_build_object('key', 'permitting', 'name', 'Permitting'),
        jsonb_build_object('key', 'procurement', 'name', 'Procurement'),
        jsonb_build_object('key', 'construction', 'name', 'Construction'),
        jsonb_build_object('key', 'punch', 'name', 'Punch List'),
        jsonb_build_object('key', 'closeout', 'name', 'Closeout'),
        jsonb_build_object('key', 'warranty', 'name', 'Warranty')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Inspection', 'color', 'gold'),
        jsonb_build_object('name', 'Subcontractor', 'color', 'slate'),
        jsonb_build_object('name', 'Change order', 'color', 'clay')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Site walk and scope notes', 'group_key', 'precon', 'priority', 'high', 'due_offset_days', 5),
        jsonb_build_object('title', 'Prepare the estimate', 'group_key', 'estimating', 'priority', 'high', 'due_offset_days', 12),
        jsonb_build_object('title', 'Submit permit application', 'group_key', 'permitting', 'priority', 'urgent', 'due_offset_days', 20, 'is_milestone', true),
        jsonb_build_object('title', 'Order long-lead materials', 'group_key', 'procurement', 'priority', 'high', 'due_offset_days', 25),
        jsonb_build_object('title', 'Final walkthrough with owner', 'group_key', 'closeout', 'priority', 'high', 'due_offset_days', 90)
      )
    )
  ),
  (
    'marketing-campaign',
    'Marketing Campaign',
    'Take a campaign from idea to reporting, with an approval gate before anything ships.',
    'Marketing',
    'basic',
    'app',
    true,
    'recommended',
    jsonb_build_object(
      'views', jsonb_build_array('board', 'grid'),
      'groups', jsonb_build_array(
        jsonb_build_object('key', 'ideas', 'name', 'Ideas'),
        jsonb_build_object('key', 'strategy', 'name', 'Strategy'),
        jsonb_build_object('key', 'content', 'name', 'Content'),
        jsonb_build_object('key', 'design', 'name', 'Design'),
        jsonb_build_object('key', 'approval', 'name', 'Approval'),
        jsonb_build_object('key', 'scheduled', 'name', 'Scheduled'),
        jsonb_build_object('key', 'published', 'name', 'Published'),
        jsonb_build_object('key', 'reporting', 'name', 'Reporting')
      ),
      'labels', jsonb_build_array(
        jsonb_build_object('name', 'Email', 'color', 'gold'),
        jsonb_build_object('name', 'Social', 'color', 'plum'),
        jsonb_build_object('name', 'Blog', 'color', 'sand')
      ),
      'tasks', jsonb_build_array(
        jsonb_build_object('title', 'Agree the campaign goal and audience', 'group_key', 'strategy', 'priority', 'high', 'due_offset_days', 3),
        jsonb_build_object('title', 'Draft the core message', 'group_key', 'content', 'priority', 'high', 'due_offset_days', 7),
        jsonb_build_object('title', 'Produce the assets', 'group_key', 'design', 'priority', 'medium', 'start_offset_days', 7, 'due_offset_days', 14,
          'checklist', jsonb_build_array('Social images', 'Email header', 'Landing page hero')),
        jsonb_build_object('title', 'Final approval before scheduling', 'group_key', 'approval', 'priority', 'urgent', 'due_offset_days', 16, 'is_milestone', true),
        jsonb_build_object('title', 'Report on results', 'group_key', 'reporting', 'priority', 'medium', 'due_offset_days', 30)
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
