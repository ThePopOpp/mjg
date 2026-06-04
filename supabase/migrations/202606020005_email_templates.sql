create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subject text not null,
  preheader text,
  html_body text not null,
  text_body text,
  category text not null default 'general',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  available_fields text[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_send_logs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.email_templates(id) on delete set null,
  recipient_email text not null,
  recipient_name text,
  recipient_type text not null default 'manual',
  participant_id uuid references public.participants(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  subject text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  provider text not null default 'smtp',
  provider_message_id text,
  error_message text,
  merge_data jsonb not null default '{}'::jsonb,
  sent_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_templates_status_idx on public.email_templates(status, category);
create index if not exists email_send_logs_recipient_idx on public.email_send_logs(lower(recipient_email));
create index if not exists email_send_logs_status_idx on public.email_send_logs(status, created_at desc);
create index if not exists email_send_logs_template_idx on public.email_send_logs(template_id);

alter table public.email_templates enable row level security;
alter table public.email_send_logs enable row level security;

drop policy if exists "email_templates_dashboard_read" on public.email_templates;
create policy "email_templates_dashboard_read" on public.email_templates
for select using (public.current_app_role() in ('super_admin', 'admin', 'team_member', 'content_reviewer'));

drop policy if exists "email_templates_admin_write" on public.email_templates;
create policy "email_templates_admin_write" on public.email_templates
for all using (public.current_app_role() in ('super_admin', 'admin'))
with check (public.current_app_role() in ('super_admin', 'admin'));

drop policy if exists "email_send_logs_dashboard_read" on public.email_send_logs;
create policy "email_send_logs_dashboard_read" on public.email_send_logs
for select using (public.current_app_role() in ('super_admin', 'admin', 'team_member'));

drop policy if exists "email_send_logs_admin_write" on public.email_send_logs;
create policy "email_send_logs_admin_write" on public.email_send_logs
for all using (public.current_app_role() in ('super_admin', 'admin'))
with check (public.current_app_role() in ('super_admin', 'admin'));
