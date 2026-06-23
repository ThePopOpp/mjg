-- Dialer enhancements: call pricing + on-demand transcription tracking
-- Adds Twilio price capture and a status field for recording transcription.

-- ---- Call pricing (sourced from Twilio call resource) -------------------------
alter table public.calls add column if not exists price numeric(10, 5);
alter table public.calls add column if not exists price_unit text;

-- ---- Transcription state for on-demand recording transcription ----------------
-- null = not requested, 'pending' = in flight, 'completed' = done, 'failed' = errored
alter table public.calls add column if not exists transcription_status text;

comment on column public.calls.price is 'Absolute call cost from Twilio (positive). Twilio reports a negative charge; we store the magnitude.';
comment on column public.calls.price_unit is 'ISO currency code for price, e.g. USD.';
comment on column public.calls.transcription_status is 'On-demand recording transcription state: pending | completed | failed.';
