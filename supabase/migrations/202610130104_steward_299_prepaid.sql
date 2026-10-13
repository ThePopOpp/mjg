-- The $299 offer is one year PREPAID, not a subscription ---------------------
--
-- Owner correction, 2026-10-13: "The $299 plan is just a one year prepaid plan
-- and not a subscription."
--
-- The accepted catalogue ships two $299 offers and 202610130103 implemented the
-- wrong one:
--   build_plus_first_year_recurring_v1  -> $299 then $199/yr until canceled
--   build_first_year_LEGACY_REFERENCE_ONLY -> $299 prepaid, no autorenew
-- The product is the second shape. This moves the sellable offer onto it.
--
-- WHAT THIS REMOVES, which is most of the hard part:
--   * no Stripe subscription, so no billing anchor to reconcile against
--     activation (the reason the bundle could not be a subscription at all);
--   * no saved card, so nothing is kept on file after the purchase;
--   * no renewal price, no dunning, no renewal grace, no advance renewal notice
--     and no cancellation flow for this offer. There is nothing to cancel.
--
-- What it does NOT change: activation still starts the 30-day build window and
-- the 12-month premium term together, and the 90-day activation deadline and
-- every refund window are untouched. Those hang off activation, not off billing.
--
-- After the prepaid year ends, paid_expiry applies — the Blueprint is retained,
-- access drops to free, and nothing is deleted. Continuing costs a separate
-- Premium purchase; it is never an automatic conversion.

-- A sellable prepaid offer and a historical record are both
-- ONE_TIME_PREPAID_NO_AUTORENEW, so billing can no longer be what decides
-- whether something is purchasable. Separate the two ideas.
alter table public.steward_offers
  add column if not exists is_historical_record boolean not null default false;

comment on column public.steward_offers.is_historical_record is
  'True for rows kept only so an existing purchase resolves correctly. Never purchasable, never synced to Stripe.';

-- The legacy BUILD_LIVE_299_Y1 alias: kept so prior purchases resolve, never sold.
update public.steward_offers
   set is_historical_record = true,
       production_enabled = false,
       updated_at = now()
 where offer_key = 'build_first_year_legacy';

-- The sellable offer becomes prepaid.
update public.steward_offers
   set billing = 'ONE_TIME_PREPAID_NO_AUTORENEW',
       interval = null,
       label = 'Build + first year',
       description = 'The full Blueprint build plus one year of Premium, paid once. It does not renew.',
       renewal_price_minor = null,
       renewal_interval = null,
       renewal_calendar_months = null,
       -- Nothing recurring is being agreed to, so there is no recurring assent
       -- to capture at checkout.
       requires_recurring_assent = false,
       -- The renewal price is no longer referenced. Cleared here as well as
       -- archived in Stripe by the sync, so nothing can quietly charge it.
       stripe_renewal_price_id = null,
       source_ref = 'offer_catalogue:build_first_year_LEGACY_REFERENCE_ONLY + owner_correction_2026-10-13',
       updated_at = now()
 where offer_key = 'build_plus_first_year';
