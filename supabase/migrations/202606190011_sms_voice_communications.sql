-- ============================================================================
-- SMS, Voice, and Communications Compliance Migration
-- Twilio A2P 10DLC: consent tracking, SMS messaging, voice calls
-- ============================================================================

-- ---- Consent fields on participants -------------------------------------------

alter table public.participants
  add column if not exists sms_opt_in boolean not null default true,
  add column if not exists sms_opt_in_at timestamptz,
  add column if not exists sms_opt_out_at timestamptz,
  add column if not exists sms_opt_in_source text,
  add column if not exists email_opt_in boolean not null default true,
  add column if not exists email_opt_in_at timestamptz,
  add column if not exists email_opt_out_at timestamptz,
  add column if not exists email_opt_in_source text;

-- ---- Consent fields on profiles -----------------------------------------------

alter table public.profiles
  add column if not exists sms_opt_in boolean not null default true,
  add column if not exists sms_opt_in_at timestamptz,
  add column if not exists sms_opt_out_at timestamptz,
  add column if not exists sms_opt_in_source text,
  add column if not exists email_opt_in boolean not null default true,
  add column if not exists email_opt_in_at timestamptz,
  add column if not exists email_opt_out_at timestamptz,
  add column if not exists email_opt_in_source text;

-- ---- Consent events audit trail -----------------------------------------------

create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('participant', 'profile')),
  entity_id uuid not null,
  channel text not null check (channel in ('sms', 'email')),
  event_type text not null check (event_type in ('opt_in', 'opt_out')),
  source text not null default 'admin_manual'
    check (source in ('web_form', 'admin_manual', 'bulk_import', 'keyword_stop', 'keyword_start', 'csv_import')),
  ip_address text,
  user_agent text,
  performed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists consent_events_entity_idx on public.consent_events (entity_type, entity_id);
create index if not exists consent_events_channel_idx on public.consent_events (channel, event_type);
create index if not exists consent_events_created_at_idx on public.consent_events (created_at desc);

-- ---- SMS conversations --------------------------------------------------------

create table if not exists public.sms_conversations (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  twilio_number text not null,
  contact_number text not null,
  contact_name text,
  last_message_at timestamptz,
  last_message_preview text,
  unread_count integer not null default 0,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sms_conversations_participant_idx on public.sms_conversations (participant_id);
create index if not exists sms_conversations_profile_idx on public.sms_conversations (profile_id);
create index if not exists sms_conversations_contact_number_idx on public.sms_conversations (contact_number);
create index if not exists sms_conversations_last_message_at_idx on public.sms_conversations (last_message_at desc nulls last);
create unique index if not exists sms_conversations_number_pair_idx on public.sms_conversations (twilio_number, contact_number);

-- ---- SMS messages -------------------------------------------------------------

create table if not exists public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.sms_conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'delivered', 'failed', 'received', 'undelivered', 'skipped')),
  twilio_message_sid text unique,
  media_urls text[] not null default '{}',
  sent_by uuid references public.profiles(id) on delete set null,
  error_message text,
  error_code text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists sms_messages_conversation_idx on public.sms_messages (conversation_id, created_at asc);
create index if not exists sms_messages_sid_idx on public.sms_messages (twilio_message_sid) where twilio_message_sid is not null;
create index if not exists sms_messages_status_idx on public.sms_messages (status, created_at desc);

-- ---- SMS templates ------------------------------------------------------------

create table if not exists public.sms_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  body text not null,
  available_fields text[] not null default '{}',
  category text not null default 'general',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sms_templates_status_idx on public.sms_templates (status, category);

-- ---- SMS send logs (bulk broadcast audit) -------------------------------------

create table if not exists public.sms_send_logs (
  id uuid primary key default gen_random_uuid(),
  broadcast_id uuid,
  template_id uuid references public.sms_templates(id) on delete set null,
  recipient_type text not null default 'manual'
    check (recipient_type in ('participant', 'profile', 'manual')),
  recipient_id uuid,
  recipient_phone text not null,
  recipient_name text,
  body_rendered text not null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'delivered', 'failed', 'skipped')),
  twilio_message_sid text,
  sent_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists sms_send_logs_broadcast_idx on public.sms_send_logs (broadcast_id);
create index if not exists sms_send_logs_status_idx on public.sms_send_logs (status, created_at desc);
create index if not exists sms_send_logs_recipient_idx on public.sms_send_logs (recipient_phone);

-- ---- Voice calls --------------------------------------------------------------

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  twilio_call_sid text unique,
  direction text not null check (direction in ('inbound', 'outbound')),
  from_number text not null,
  to_number text not null,
  participant_id uuid references public.participants(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  status text not null default 'initiated',
  duration_seconds integer,
  recording_sid text,
  recording_url text,
  recording_duration integer,
  transcription_sid text,
  transcription_text text,
  voicemail_sid text,
  voicemail_url text,
  voicemail_transcription text,
  notes text,
  handled_by uuid references public.profiles(id) on delete set null,
  started_at timestamptz,
  answered_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists calls_twilio_sid_idx on public.calls (twilio_call_sid) where twilio_call_sid is not null;
create index if not exists calls_created_at_idx on public.calls (created_at desc);
create index if not exists calls_participant_idx on public.calls (participant_id) where participant_id is not null;
create index if not exists calls_handled_by_idx on public.calls (handled_by) where handled_by is not null;
create index if not exists calls_status_idx on public.calls (status, direction);

-- ---- Call transfers -----------------------------------------------------------

create table if not exists public.call_transfers (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  transferred_by uuid references public.profiles(id) on delete set null,
  transferred_to_profile uuid references public.profiles(id) on delete set null,
  transferred_to_number text,
  transfer_type text not null default 'cold' check (transfer_type in ('warm', 'cold')),
  status text not null default 'initiated',
  transferred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists call_transfers_call_idx on public.call_transfers (call_id);

-- ---- RLS ----------------------------------------------------------------------

alter table public.consent_events enable row level security;
alter table public.sms_conversations enable row level security;
alter table public.sms_messages enable row level security;
alter table public.sms_templates enable row level security;
alter table public.sms_send_logs enable row level security;
alter table public.calls enable row level security;
alter table public.call_transfers enable row level security;

-- consent_events: admins write, all dashboard users read
create policy "consent_events_dashboard_read" on public.consent_events
  for select using (public.can_access_dashboard());

create policy "consent_events_admin_write" on public.consent_events
  for all using (public.current_app_role() in ('super_admin', 'admin'))
  with check (public.current_app_role() in ('super_admin', 'admin'));

-- Public insert for web-form opt-in/out pages (unauthenticated visitors)
create policy "consent_events_public_insert" on public.consent_events
  for insert with check (
    source in ('web_form') and performed_by is null
  );

-- sms_conversations
create policy "sms_conversations_dashboard_read" on public.sms_conversations
  for select using (public.can_access_dashboard());

create policy "sms_conversations_team_write" on public.sms_conversations
  for all using (public.current_app_role() in ('super_admin', 'admin', 'team_member'))
  with check (public.current_app_role() in ('super_admin', 'admin', 'team_member'));

-- sms_messages
create policy "sms_messages_dashboard_read" on public.sms_messages
  for select using (public.can_access_dashboard());

create policy "sms_messages_team_write" on public.sms_messages
  for all using (public.current_app_role() in ('super_admin', 'admin', 'team_member'))
  with check (public.current_app_role() in ('super_admin', 'admin', 'team_member'));

-- sms_templates
create policy "sms_templates_dashboard_read" on public.sms_templates
  for select using (public.can_access_dashboard());

create policy "sms_templates_admin_write" on public.sms_templates
  for all using (public.current_app_role() in ('super_admin', 'admin'))
  with check (public.current_app_role() in ('super_admin', 'admin'));

-- sms_send_logs
create policy "sms_send_logs_dashboard_read" on public.sms_send_logs
  for select using (public.can_access_dashboard());

create policy "sms_send_logs_team_write" on public.sms_send_logs
  for all using (public.current_app_role() in ('super_admin', 'admin', 'team_member'))
  with check (public.current_app_role() in ('super_admin', 'admin', 'team_member'));

-- calls
create policy "calls_dashboard_read" on public.calls
  for select using (public.can_access_dashboard());

create policy "calls_team_write" on public.calls
  for all using (public.current_app_role() in ('super_admin', 'admin', 'team_member'))
  with check (public.current_app_role() in ('super_admin', 'admin', 'team_member'));

-- call_transfers
create policy "call_transfers_dashboard_read" on public.call_transfers
  for select using (public.can_access_dashboard());

create policy "call_transfers_team_write" on public.call_transfers
  for all using (public.current_app_role() in ('super_admin', 'admin', 'team_member'))
  with check (public.current_app_role() in ('super_admin', 'admin', 'team_member'));
