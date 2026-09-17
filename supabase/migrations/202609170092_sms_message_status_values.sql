-- sms_messages.status only allowed a subset of Twilio's message statuses. Sending through a
-- Messaging Service (required for A2P 10DLC) returns "accepted" as the initial status rather
-- than "queued", which violated the CHECK — the insert failed, the error was swallowed, and
-- the message silently never appeared in the inbox even though Twilio had sent it.
--
-- Widen to every status Twilio can report, so neither the create call nor the status webhook
-- can be rejected:
--   accepted, scheduled, queued, sending, sent, receiving, received, delivered,
--   undelivered, failed, read, canceled, partially_delivered
-- plus our own "skipped" for sends suppressed by opt-out.
alter table public.sms_messages drop constraint if exists sms_messages_status_check;

alter table public.sms_messages
  add constraint sms_messages_status_check
  check (status in (
    'accepted', 'scheduled', 'queued', 'sending', 'sent',
    'receiving', 'received', 'delivered', 'undelivered', 'failed',
    'read', 'canceled', 'partially_delivered', 'skipped'
  ));
