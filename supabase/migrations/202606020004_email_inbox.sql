create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  mailbox text not null default 'INBOX',
  provider text not null default 'imap',
  message_uid bigint,
  message_id text,
  subject text,
  from_email text,
  from_name text,
  to_emails text[] not null default '{}',
  cc_emails text[] not null default '{}',
  reply_to_emails text[] not null default '{}',
  text_body text,
  html_body text,
  snippet text,
  received_at timestamptz,
  sent_at timestamptz,
  flags text[] not null default '{}',
  raw_headers jsonb not null default '{}'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  participant_id uuid references public.participants(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  sync_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(mailbox, message_uid),
  unique(message_id)
);

create index if not exists email_messages_received_idx on public.email_messages(received_at desc);
create index if not exists email_messages_from_idx on public.email_messages(lower(from_email));
create index if not exists email_messages_participant_idx on public.email_messages(participant_id);
create index if not exists email_messages_profile_idx on public.email_messages(profile_id);

alter table public.email_messages enable row level security;

drop policy if exists "email_messages_dashboard_read" on public.email_messages;
create policy "email_messages_dashboard_read" on public.email_messages
for select using (
  public.current_app_role() in ('super_admin', 'admin', 'team_member')
);

drop policy if exists "email_messages_admin_write" on public.email_messages;
create policy "email_messages_admin_write" on public.email_messages
for all using (
  public.current_app_role() in ('super_admin', 'admin')
) with check (
  public.current_app_role() in ('super_admin', 'admin')
);
