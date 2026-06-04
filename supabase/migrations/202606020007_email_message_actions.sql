alter table public.email_messages
  add column if not exists hidden_at timestamptz,
  add column if not exists removed_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists actioned_by uuid references public.profiles(id) on delete set null,
  add column if not exists action_reason text;

create index if not exists email_messages_visibility_idx
on public.email_messages(deleted_at, removed_at, hidden_at, received_at desc);
