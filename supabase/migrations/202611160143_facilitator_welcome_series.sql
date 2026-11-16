-- Facilitator Welcome Series (docs/Updates-11-16-26/facillitator-welcome-series.md).
--
-- A general welcome for anyone who signs up to facilitate, separate from the
-- study-specific automation tied to a facilitator's plan and start date:
--   Email 1 immediately · Welcome text same day (SMS consent, daytime only)
--   Email 2 two days later · Email 3 five days later
--
-- Once per person: enrollments are unique on lower(email), so someone who comes
-- in through both ForgedLife and MJG, or facilitates a second plan, is never
-- enrolled twice. Sending lives in lib/facilitator-welcome/series.ts.
--
-- OFF by default. It cannot be switched on until the handbook URL and at least
-- one social link are set (enforced in code and by the check below).

create table if not exists public.facilitator_welcome_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default false,
  handbook_url text,
  assessment_url text not null default 'https://michaeljgauthier.com/created-for-more-check-in',
  resources_url text not null default 'https://michaeljgauthier.com/resources',
  instagram_url text,
  facebook_url text,
  linkedin_url text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint facilitator_welcome_ready check (
    not enabled or (
      coalesce(handbook_url, '') <> ''
      and (coalesce(instagram_url, '') <> '' or coalesce(facebook_url, '') <> '' or coalesce(linkedin_url, '') <> '')
    )
  )
);
insert into public.facilitator_welcome_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.facilitator_welcome_enrollments (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  first_name text,
  phone text,
  source text not null check (source in ('mjg_register', 'mjg_invite', 'forgedlife', 'admin')),
  enrolled_at timestamptz not null default now()
);
create unique index if not exists facilitator_welcome_enrollments_email_key
  on public.facilitator_welcome_enrollments (lower(email));

create table if not exists public.facilitator_welcome_events (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.facilitator_welcome_enrollments(id) on delete cascade,
  step_key text not null,
  channel text not null check (channel in ('email', 'sms')),
  scheduled_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'skipped', 'failed')),
  attempts integer not null default 0,
  sent_at timestamptz,
  last_attempt_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique (enrollment_id, step_key)
);
create index if not exists facilitator_welcome_events_due_idx
  on public.facilitator_welcome_events (scheduled_at) where status = 'pending';

-- Server-only: read and written with the service role. No policies.
alter table public.facilitator_welcome_settings enable row level security;
alter table public.facilitator_welcome_enrollments enable row level security;
alter table public.facilitator_welcome_events enable row level security;

-- The Welcome Text. 10DLC: brand-identified, includes opt-out.
insert into public.sms_templates (name, slug, body, available_fields, category, status)
values (
  'Facilitator Welcome · Welcome text',
  'facilitator-welcome-sms',
  'MJG | Stewardship Blueprint: Thanks for signing up to facilitate, {{first_name}}! Your facilitator handbook: {{handbook_url}}. Reply STOP to unsubscribe.',
  array['first_name', 'handbook_url']::text[],
  'facilitator_welcome',
  'active'
)
on conflict (slug) do nothing;

-- The three emails (copy verbatim from the series doc; editable afterwards in Emails).
insert into public.email_templates (name, slug, subject, preheader, category, status, available_fields, html_body, text_body)
values (
  'Facilitator Welcome · 1 · Welcome and thank you',
  'facilitator-welcome-1',
  'Welcome—and thank you for stepping up',
  'You''re helping create space for meaningful conversations and faithful next steps.',
  'facilitator_welcome',
  'active',
  array['greeting_name', 'handbook_url', 'social_links_html', 'social_links_text']::text[],
  $H$<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">You're helping create space for meaningful conversations and faithful next steps.</div>
<div style="background:#f1eee7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 40px 0;text-align:center;">
          <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="120" alt="Michael J. Gauthier" style="width:120px;height:auto;border:0;" />
        </td></tr>
        <tr><td style="padding:18px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>
        <tr><td style="padding:22px 40px 14px;text-align:center;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Welcome, Facilitator</p>
        </td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{greeting_name}},</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Congratulations on taking this step, and thank you for signing up to facilitate. Your willingness to invest in others matters.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">I&rsquo;m Michael J. Gauthier&mdash;Mike&mdash;a husband, father, and the creator of Stewardship Blueprint. This is a whole-life stewardship framework that connects faith, purpose, relationships, health, joy, resources, guardrails, habits, energy, and legacy. It helps people faithfully steward what God has entrusted to them and build lives that matter.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Whether you&rsquo;re facilitating for the first time or have led groups for years, you don&rsquo;t need to have every answer. Thoughtful preparation, genuine care, and a willingness to grow alongside others are a strong place to begin.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">As a resource, I&rsquo;d encourage you to keep our handbook, <em>Facilitating Meaningful Bible Study and Group Conversations</em>, close at hand.</td></tr>
        <tr><td style="padding:8px 40px 22px;text-align:center;"><a href="{{handbook_url}}" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:15px 36px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">Open the Facilitator Handbook &rarr;</a></td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">I&rsquo;m grateful you&rsquo;re part of this. Thank you for making room for people to open Scripture, reflect honestly, and take a faithful next step together.</td></tr>
        <tr><td style="padding:10px 40px 30px;">
          <hr style="border:none;border-top:1px solid #eee7db;margin:0 0 16px;" />
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#191815;font-weight:700;">Michael J. Gauthier</p>
          <p style="margin:3px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8275;">Creator, Stewardship Blueprint</p>
          <p style="margin:3px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;"><a href="https://michaeljgauthier.com" style="color:#8a8275;text-decoration:none;">MichaelJGauthier.com</a></p>
          {{social_links_html}}
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>$H$,
  $T$Hi {{greeting_name}},

Congratulations on taking this step, and thank you for signing up to facilitate. Your willingness to invest in others matters.

I'm Michael J. Gauthier—Mike—a husband, father, and the creator of Stewardship Blueprint. This is a whole-life stewardship framework that connects faith, purpose, relationships, health, joy, resources, guardrails, habits, energy, and legacy. It helps people faithfully steward what God has entrusted to them and build lives that matter.

Whether you're facilitating for the first time or have led groups for years, you don't need to have every answer. Thoughtful preparation, genuine care, and a willingness to grow alongside others are a strong place to begin.

As a resource, I'd encourage you to keep our handbook, Facilitating Meaningful Bible Study and Group Conversations, close at hand.

Open the Facilitator Handbook: {{handbook_url}}

I'm grateful you're part of this. Thank you for making room for people to open Scripture, reflect honestly, and take a faithful next step together.

Michael J. Gauthier
Creator, Stewardship Blueprint
MichaelJGauthier.com
{{social_links_text}}$T$
)
on conflict (slug) do nothing;

insert into public.email_templates (name, slug, subject, preheader, category, status, available_fields, html_body, text_body)
values (
  'Facilitator Welcome · 2 · Room for your own growth',
  'facilitator-welcome-2',
  'There''s room for your own growth, too',
  'You''re part of the journey—not just the person guiding the conversation.',
  'facilitator_welcome',
  'active',
  array['greeting_name', 'assessment_url', 'social_links_html', 'social_links_text']::text[],
  $H$<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">You're part of the journey—not just the person guiding the conversation.</div>
<div style="background:#f1eee7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 40px 0;text-align:center;">
          <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="120" alt="Michael J. Gauthier" style="width:120px;height:auto;border:0;" />
        </td></tr>
        <tr><td style="padding:18px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>
        <tr><td style="padding:22px 40px 14px;text-align:center;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A46E;font-weight:700;">For You, Too</p>
        </td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{greeting_name}},</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">One thing I hope you experience as a facilitator is that this journey is for you, too.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You don&rsquo;t have to put your own growth on hold while helping others. You can reflect, ask questions, make adjustments, and practice the same honesty you hope to encourage in your group.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">A helpful place to begin is the Created for More Check-In. It offers a chance to pause, recognize what is healthy, and notice what may need your attention.</td></tr>
        <tr><td style="padding:8px 40px 22px;text-align:center;"><a href="{{assessment_url}}" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:15px 36px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">Explore the Created for More Check-In &rarr;</a></td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This isn&rsquo;t a test of whether you&rsquo;re ready to lead. It&rsquo;s an invitation to see your own life more clearly and consider one faithful next step.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Already completed it? You might simply revisit what you noticed and ask: <em>What is worth protecting, and what needs attention in this season?</em></td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You choose what to share with others. You don&rsquo;t need a polished story&mdash;just a willingness to keep growing.</td></tr>
        <tr><td style="padding:10px 40px 30px;">
          <hr style="border:none;border-top:1px solid #eee7db;margin:0 0 16px;" />
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#191815;font-weight:700;">Michael J. Gauthier</p>
          <p style="margin:3px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8275;">Creator, Stewardship Blueprint</p>
          <p style="margin:3px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;"><a href="https://michaeljgauthier.com" style="color:#8a8275;text-decoration:none;">MichaelJGauthier.com</a></p>
          {{social_links_html}}
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>$H$,
  $T$Hi {{greeting_name}},

One thing I hope you experience as a facilitator is that this journey is for you, too.

You don't have to put your own growth on hold while helping others. You can reflect, ask questions, make adjustments, and practice the same honesty you hope to encourage in your group.

A helpful place to begin is the Created for More Check-In. It offers a chance to pause, recognize what is healthy, and notice what may need your attention.

Explore the Created for More Check-In: {{assessment_url}}

This isn't a test of whether you're ready to lead. It's an invitation to see your own life more clearly and consider one faithful next step.

Already completed it? You might simply revisit what you noticed and ask: What is worth protecting, and what needs attention in this season?

You choose what to share with others. You don't need a polished story—just a willingness to keep growing.

Michael J. Gauthier
Creator, Stewardship Blueprint
MichaelJGauthier.com
{{social_links_text}}$T$
)
on conflict (slug) do nothing;

insert into public.email_templates (name, slug, subject, preheader, category, status, available_fields, html_body, text_body)
values (
  'Facilitator Welcome · 3 · Resources for the life you''re building',
  'facilitator-welcome-3',
  'A few resources for the life you''re building',
  'Get to know MJG, Stewardship Blueprint, and the support available to you.',
  'facilitator_welcome',
  'active',
  array['greeting_name', 'resources_url', 'social_links_html', 'social_links_text']::text[],
  $H$<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Get to know MJG, Stewardship Blueprint, and the support available to you.</div>
<div style="background:#f1eee7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 40px 0;text-align:center;">
          <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="120" alt="Michael J. Gauthier" style="width:120px;height:auto;border:0;" />
        </td></tr>
        <tr><td style="padding:18px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>
        <tr><td style="padding:22px 40px 14px;text-align:center;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Resources for You</p>
        </td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{greeting_name}},</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">I created MichaelJGauthier.com as a place to share teaching and practical resources that help people design and live a life rooted in faithful stewardship.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Stewardship Blueprint is the framework. Assessments help you reflect on your current season. Studies create opportunities to explore Scripture, have meaningful conversations, and put what you&rsquo;re learning into practice.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Steward is your personal guide for designing and living a life that matters. It offers help reflecting on what matters, clarifying your priorities, and developing your Personal Stewardship Blueprint.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">One way to begin is to ask:</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><em>&ldquo;Help me reflect on this season of my life and choose one faithful next step.&rdquo;</em></td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">ForgedLife supports community, practice, and accountability as you live out those commitments with others.</td></tr>
        <tr><td style="padding:8px 40px 22px;text-align:center;"><a href="{{resources_url}}" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:15px 36px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">Explore MJG and the Available Resources &rarr;</a></td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">There&rsquo;s no need to use everything. Begin with what is useful in your current season.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Let&rsquo;s stay connected. I&rsquo;d also love to connect with you on social media. Follow along for reflections, practical encouragement, and ideas for living out the Stewardship Blueprint in everyday life. Choose whichever platform you use most.</td></tr>
        <tr><td style="padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Thank you again for investing in others. My hope is that you find encouragement and clarity for your own life along the way.</td></tr>
        <tr><td style="padding:10px 40px 30px;">
          <hr style="border:none;border-top:1px solid #eee7db;margin:0 0 16px;" />
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#191815;font-weight:700;">Michael J. Gauthier</p>
          <p style="margin:3px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a8275;">Creator, Stewardship Blueprint</p>
          <p style="margin:3px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;"><a href="https://michaeljgauthier.com" style="color:#8a8275;text-decoration:none;">MichaelJGauthier.com</a></p>
          {{social_links_html}}
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>$H$,
  $T$Hi {{greeting_name}},

I created MichaelJGauthier.com as a place to share teaching and practical resources that help people design and live a life rooted in faithful stewardship.

Stewardship Blueprint is the framework. Assessments help you reflect on your current season. Studies create opportunities to explore Scripture, have meaningful conversations, and put what you're learning into practice.

Steward is your personal guide for designing and living a life that matters. It offers help reflecting on what matters, clarifying your priorities, and developing your Personal Stewardship Blueprint.

One way to begin is to ask:

"Help me reflect on this season of my life and choose one faithful next step."

ForgedLife supports community, practice, and accountability as you live out those commitments with others.

Explore MJG and the Available Resources: {{resources_url}}

There's no need to use everything. Begin with what is useful in your current season.

Let's stay connected. I'd also love to connect with you on social media. Follow along for reflections, practical encouragement, and ideas for living out the Stewardship Blueprint in everyday life. Choose whichever platform you use most.

Thank you again for investing in others. My hope is that you find encouragement and clarity for your own life along the way.

Michael J. Gauthier
Creator, Stewardship Blueprint
MichaelJGauthier.com
{{social_links_text}}$T$
)
on conflict (slug) do nothing;
