-- Allow invitation emails to be scheduled for a future time (sent by the invitations cron).
alter table public.user_invitations add column if not exists scheduled_send_at timestamptz;
create index if not exists user_invitations_scheduled_idx
  on public.user_invitations(scheduled_send_at)
  where invite_status = 'pending' and scheduled_send_at is not null;
