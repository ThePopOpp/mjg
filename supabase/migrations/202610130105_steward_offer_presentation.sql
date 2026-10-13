-- Presentation fields for the pricing page -----------------------------------
--
-- "Most popular" is marketing copy, and marketing copy belongs in the catalogue
-- next to the price rather than hardcoded in a component. Same reasoning the
-- docset applies to prices (global.fixed_prices_in_prompts = false): one place
-- to change it, and the Agent Manager can own it later without a deploy.
--
-- billing_period is what the monthly/annual toggle filters on. It is stored
-- rather than derived because the mapping is a product decision, not a fact
-- about the billing type:
--   'any'     -> shown under both toggles. Free, and the $149 build, which is
--                the entry purchase Premium requires either way.
--   'monthly' -> month-to-month.
--   'annual'  -> billed yearly, or prepaid for twelve months.

alter table public.steward_offers
  add column if not exists badge text,
  add column if not exists highlight boolean not null default false,
  add column if not exists billing_period text not null default 'any'
    check (billing_period in ('any','monthly','annual'));

comment on column public.steward_offers.badge is
  'Short ribbon on the pricing card, e.g. "Most popular". NULL for no ribbon.';
comment on column public.steward_offers.billing_period is
  'Which side of the monthly/annual toggle this offer appears under. "any" shows under both.';

-- Always visible: the free tier and the one-time build, which is the
-- prerequisite for Premium on either cadence.
update public.steward_offers set billing_period = 'any'
 where offer_key in ('free', 'initial_full');

-- Month-to-month.
update public.steward_offers set billing_period = 'monthly'
 where offer_key in ('premium_monthly', 'facilitator_premium_trial');

-- Billed yearly, or prepaid for a year.
update public.steward_offers set billing_period = 'annual'
 where offer_key in ('premium_annual', 'build_plus_first_year', 'build_first_year_legacy');

-- The flagship: $299 buys the build plus a year, where buying them separately
-- is $149 + $199 = $348. The page computes and shows that difference rather
-- than asserting a vague "best value".
update public.steward_offers
   set badge = 'Most popular', highlight = true
 where offer_key = 'build_plus_first_year';

update public.steward_offers
   set badge = 'Best value'
 where offer_key = 'premium_annual';

update public.steward_offers
   set badge = 'Start here'
 where offer_key = 'initial_full';
