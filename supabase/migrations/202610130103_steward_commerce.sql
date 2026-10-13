-- Steward commerce — config spine, offer catalogue, orders, activation, entitlements
--
-- Source of truth for every value here is the accepted docset, not invention:
--   CONFIG/offer_catalogue.example.json          -> steward_offers
--   CONFIG/dec09_lifecycle_policies.example.json -> steward_config (lifecycle.*)
--   CONFIG/dec09_benefits.example.json           -> benefit shape
--   CONFIG/grant_and_group_templates.example.json-> grants
--
-- THE ONE RULE THAT SHAPES ALL OF THIS. Clause D25 keeps six facts independent,
-- and two of them live here: entitlement comes from grants and orders, never
-- from participant intent, and persistence comes from a receipt, never from
-- approval. So Stripe records PAYMENT FACTS and nothing else; what a member is
-- entitled to is decided in Postgres from orders, activations and grants. A
-- Stripe subscription being "active" is evidence, not an entitlement.
--
-- NULL MEANS UNSET, NOT ZERO. steward_config.value is nullable on purpose. The
-- docset leaves provider_retry_schedule and final_invoice_disposition null and
-- the handoff notice forbids inventing them, so they are seeded NULL and
-- lib/steward/config.ts throws rather than defaulting. A guessed dunning
-- schedule would be a silently wrong promise to a paying customer.
--
-- NOTHING IS SELLABLE YET. Every offer lands production_enabled = false, exactly
-- as the catalogue ships it. Turning one on is a deliberate act in the Agent
-- Manager after the Terms §8 blanks are filled, not a side effect of this file.

-- == Config spine ============================================================
create table if not exists public.steward_config (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  -- NULL = deliberately unset. Readers must fail loudly, never default.
  value jsonb,
  value_type text not null default 'string'
    check (value_type in ('string','number','boolean','json','duration_days','duration_months')),
  label text not null,
  description text not null default '',
  config_group text not null default 'general',
  -- Mirrors the docset's own production_enabled flag: a value can exist and
  -- still not be cleared for production use.
  production_enabled boolean not null default false,
  source_ref text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists steward_config_group_idx on public.steward_config(config_group, key);

create table if not exists public.steward_config_versions (
  id uuid primary key default gen_random_uuid(),
  config_id uuid not null references public.steward_config(id) on delete cascade,
  version_number integer not null,
  value jsonb,
  note text not null default '',
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (config_id, version_number)
);

-- == Offer catalogue =========================================================
-- Prices live here and are read at runtime. The docset is explicit that prices
-- are never fixed in prompts (global.fixed_prices_in_prompts = false), and the
-- Terms require the exact price to be stated at checkout, so there is exactly
-- one place a price can come from.
create table if not exists public.steward_offers (
  id uuid primary key default gen_random_uuid(),
  offer_key text not null unique,
  product_key text not null,
  label text not null,
  description text not null default '',

  price_minor integer not null,
  currency text not null default 'USD',

  billing text not null
    check (billing in ('NONE','ONE_TIME','RECURRING','INITIAL_BUNDLE_THEN_RECURRING_ANNUAL','ONE_TIME_PREPAID_NO_AUTORENEW')),
  interval text check (interval in ('MONTH','YEAR')),
  card_required boolean not null default true,

  benefits text[] not null default '{}',

  -- Initial-bundle shape. build_days and the activation deadline come from the
  -- offer, not from a constant, because the catalogue sets them per offer.
  build_days integer,
  activation_deadline_days integer,

  -- Renewal, for INITIAL_BUNDLE_THEN_RECURRING_ANNUAL.
  renewal_price_minor integer,
  renewal_interval text check (renewal_interval in ('MONTH','YEAR')),
  renewal_calendar_months integer,

  requires_full_acquisition boolean not null default false,
  requires_initial_full_not_already_acquired boolean not null default false,
  requires_recurring_assent boolean not null default false,

  -- Facilitator trial (owner decision 2026-10-13: a real Stripe trial — card
  -- collected, free days, then charged). trial_days NULL = no trial.
  trial_days integer,
  -- Empty = available to everyone. Otherwise the offer is only purchasable by
  -- these roles, which is what scopes the facilitator trial.
  eligible_roles text[] not null default '{}',

  -- Filled by scripts/stripe-sync-catalogue.mjs. Null until synced.
  stripe_product_id text,
  stripe_price_id text,
  stripe_renewal_price_id text,

  -- Ships false for every offer in the catalogue. Nothing is sellable until a
  -- human flips this with the Terms §8 blanks filled in.
  production_enabled boolean not null default false,
  sort_order integer not null default 0,
  source_ref text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists steward_offers_enabled_idx
  on public.steward_offers(production_enabled, sort_order);

-- == Orders — payment facts only =============================================
create table if not exists public.steward_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  offer_key text not null references public.steward_offers(offer_key) on update cascade,

  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_subscription_id text,
  stripe_customer_id text,

  amount_minor integer not null default 0,
  currency text not null default 'USD',
  -- 'pending' covers async payment methods, where checkout.session.completed
  -- arrives with payment_status 'unpaid' and the money confirms later.
  status text not null default 'pending'
    check (status in ('pending','paid','failed','refunded','partially_refunded','canceled')),

  -- CONFIRMED payment. This is what the 90-day activation deadline counts from,
  -- so it is set only by a webhook, never by a browser return.
  paid_at timestamptz,

  -- The offer terms as accepted, frozen. purchased_terms_immutable = true: a
  -- later catalogue edit must never change what someone already bought.
  accepted_terms jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists steward_orders_user_idx on public.steward_orders(user_id, created_at desc);
create index if not exists steward_orders_sub_idx on public.steward_orders(stripe_subscription_id)
  where stripe_subscription_id is not null;

-- == Activation ==============================================================
-- Explicit, idempotent, and the anchor for every clock. The build window and
-- the 12-month premium term start at the SAME activation instant, concurrently.
create table if not exists public.steward_activations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.steward_orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  activated_at timestamptz not null,

  -- All stored as UTC instants. A later display-timezone change must not move
  -- an interval (display_timezone_change_moves_interval = false).
  build_starts_at timestamptz not null,
  build_ends_at timestamptz not null,
  premium_starts_at timestamptz not null,
  premium_ends_at timestamptz not null,
  -- The billing anniversary: activation + 12 calendar months, last-valid-day.
  renewal_anchor_at timestamptz,

  policy_version text not null,
  created_at timestamptz not null default now()
);
create index if not exists steward_activations_user_idx on public.steward_activations(user_id);

-- == Entitlements — the authoritative answer =================================
create table if not exists public.steward_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  benefit text not null
    check (benefit in ('free_blueprint','full_acquisition','build_window','premium')),

  -- 'role' is the standing kind: held while a role holds, no order behind it.
  source text not null check (source in ('purchase','grant','role')),
  source_order_id uuid references public.steward_orders(id) on delete set null,

  starts_at timestamptz not null default now(),
  -- NULL = no expiry. The grant templates allow an explicit non-expiring grant.
  ends_at timestamptz,

  -- Revoked rather than deleted, so a refund leaves a trail.
  revoked_at timestamptz,
  revoked_reason text,

  -- Grants only. models_can_grant = false in the docset, so this is always a
  -- human; nothing in the agent layer may write this table.
  granted_by uuid references public.profiles(id) on delete set null,
  grant_reason text,
  grant_template text,

  created_at timestamptz not null default now()
);
create index if not exists steward_entitlements_lookup_idx
  on public.steward_entitlements(user_id, benefit, revoked_at);

-- == Refunds =================================================================
create table if not exists public.steward_refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.steward_orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,

  -- request_received_time_controls = true: eligibility is judged on when the
  -- request arrived, not when someone got round to processing it.
  requested_at timestamptz not null default now(),

  window_kind text not null
    check (window_kind in ('before_activation','initial_post_activation','annual_charge','unused_unactivated')),

  amount_minor integer,
  -- pending_refund_is_not_success = true: 'requested' must never read as done.
  status text not null default 'requested'
    check (status in ('requested','approved','rejected','processing','succeeded','failed')),

  stripe_refund_id text,
  note text not null default '',
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists steward_refunds_order_idx on public.steward_refunds(order_id, requested_at desc);

-- == Webhook event log =======================================================
-- Stripe delivers at least once. The unique event id is what makes replay safe.
create table if not exists public.steward_stripe_events (
  id text primary key,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  received_at timestamptz not null default now()
);
create index if not exists steward_stripe_events_unprocessed_idx
  on public.steward_stripe_events(received_at) where processed_at is null;

-- == RLS =====================================================================
-- Catalogue, config, orders and entitlements are all super-admin-only at the
-- database level. Member-facing reads go through the service-role data layer
-- behind their own auth checks; a member must never be able to write an
-- entitlement row, which is the whole point of keeping it out of Stripe.
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'steward_config','steward_config_versions','steward_offers','steward_orders',
    'steward_activations','steward_entitlements','steward_refunds','steward_stripe_events'
  ] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_super_admin_all', tbl);
    execute format(
      'create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())',
      tbl || '_super_admin_all', tbl);
  end loop;
end $$;

-- == Seed: lifecycle config ==================================================
-- Straight from dec09_lifecycle_policies.example.json. The two nulls there stay
-- null here.
insert into public.steward_config (key, value, value_type, label, description, config_group, source_ref)
values
  ('lifecycle.policy_version', '"dec09_lifecycle_v1"', 'string', 'Lifecycle policy version',
   'Stamped onto every activation so a term can be read back against the policy that created it.', 'lifecycle', 'dec09_lifecycle_policies'),
  ('lifecycle.timezone', '"America/Phoenix"', 'string', 'Billing timezone',
   'Arizona does not observe DST, so a calendar day is always 24h here.', 'lifecycle', 'dec09_lifecycle_policies'),
  ('lifecycle.activation_deadline_days', '90', 'duration_days', 'Activation deadline',
   'Calendar days from confirmed payment in which activation stays available.', 'lifecycle', 'dec09_lifecycle_policies'),
  ('lifecycle.build_days', '30', 'duration_days', 'Build window',
   'Calendar days of the initial build window, starting at confirmed activation.', 'lifecycle', 'dec09_lifecycle_policies'),
  ('lifecycle.premium_months', '12', 'duration_months', 'Initial premium term',
   'Calendar months of premium starting at the SAME activation instant as the build window.', 'lifecycle', 'dec09_lifecycle_policies'),
  ('refund.before_activation_full', 'true', 'boolean', 'Full refund before activation',
   'Before activation a refund is full.', 'refund', 'dec09_lifecycle_policies'),
  ('refund.initial_post_activation_days', '14', 'duration_days', 'Post-activation refund window',
   'Calendar days after activation to request a refund, meaningful use included.', 'refund', 'dec09_lifecycle_policies'),
  ('refund.annual_charge_days', '14', 'duration_days', 'Annual renewal refund window',
   'Calendar days from an annual renewal charge to request a refund.', 'refund', 'dec09_lifecycle_policies'),
  ('refund.unused_unactivated_days', '90', 'duration_days', 'Unused purchase auto-refund',
   'An unactivated purchase is refunded automatically at this point.', 'refund', 'dec09_lifecycle_policies'),
  ('renewal.grace_days', '7', 'duration_days', 'Renewal grace',
   'Calendar days past paid-through end. Retries do NOT reset it and it never applies to a failed initial purchase.', 'renewal', 'dec09_lifecycle_policies'),
  ('notices.annual_advance_days', '30', 'duration_days', 'Annual renewal notice',
   'Days before an annual renewal that advance notice is sent. Stripe''s invoice.upcoming default is ~7, so this needs its own scheduler.', 'notices', 'dec09_lifecycle_policies'),
  -- Deliberately NULL. The docset leaves both unset and the handoff notice
  -- forbids inventing them; the config reader throws if a feature needs one.
  ('renewal.provider_retry_schedule', null, 'json', 'Dunning retry schedule',
   'UNSET in the accepted docset. Must be decided, not guessed.', 'renewal', 'dec09_lifecycle_policies'),
  ('renewal.final_invoice_disposition', null, 'string', 'Final invoice disposition',
   'UNSET in the accepted docset. Must be decided, not guessed.', 'renewal', 'dec09_lifecycle_policies'),
  ('tax.enabled', 'false', 'boolean', 'Tax calculation',
   'Owner deferred 2026-10-13. Prices are created tax-exclusive so this can be switched on later without rebuilding the catalogue.', 'tax', 'owner_decision_2026-10-13'),
  ('tax.behavior', '"exclusive"', 'string', 'Tax behavior',
   'exclusive = tax added on top (US norm). Set on the Stripe price at creation and not changeable afterwards.', 'tax', 'owner_decision_2026-10-13')
on conflict (key) do nothing;

-- == Seed: offer catalogue ===================================================
-- Prices and flags transcribed from offer_catalogue.example.json. All land
-- production_enabled = false, as that file ships them.
insert into public.steward_offers (
  offer_key, product_key, label, description, price_minor, currency, billing, interval,
  card_required, benefits, build_days, activation_deadline_days,
  renewal_price_minor, renewal_interval, renewal_calendar_months,
  requires_full_acquisition, requires_initial_full_not_already_acquired, requires_recurring_assent,
  trial_days, eligible_roles, sort_order, source_ref
) values
  ('free', 'free_blueprint', 'Free', 'The free three-page Blueprint experience.',
   0, 'USD', 'NONE', null, false, '{free_blueprint}', null, null,
   null, null, null, false, false, false, null, '{}', 10, 'offer_catalogue:free_reference'),

  ('initial_full', 'full_blueprint_build', 'Initial Full Build', 'One-time purchase of the full Blueprint build.',
   14900, 'USD', 'ONE_TIME', null, true, '{full_acquisition,build_window}', 30, 90,
   null, null, null, false, true, false, null, '{}', 20, 'offer_catalogue:initial_full_reference'),

  ('build_plus_first_year', 'build_plus_first_year', 'Build + first year',
   'The full build plus the first year of Premium, renewing annually until canceled.',
   29900, 'USD', 'INITIAL_BUNDLE_THEN_RECURRING_ANNUAL', 'YEAR', true,
   '{full_acquisition,build_window,premium_first_year}', 30, 90,
   19900, 'YEAR', 12, false, true, true, null, '{}', 30, 'offer_catalogue:build_plus_first_year_recurring_v1'),

  ('premium_monthly', 'steward_premium', 'Premium monthly', 'Premium, billed monthly.',
   1900, 'USD', 'RECURRING', 'MONTH', true, '{premium}', null, null,
   null, null, null, true, false, true, null, '{}', 40, 'offer_catalogue:premium_monthly_reference'),

  ('premium_annual', 'steward_premium', 'Premium annual', 'Premium, billed annually.',
   19900, 'USD', 'RECURRING', 'YEAR', true, '{premium}', null, null,
   null, null, null, true, false, true, null, '{}', 50, 'offer_catalogue:premium_annual_reference'),

  -- Prepaid, never auto-converted to a recurring plan. historical_scope in the
  -- catalogue: "preserve actual legacy purchased terms; not silent new
  -- recurring offer". Kept so legacy holders resolve correctly; not sellable.
  ('build_first_year_legacy', 'build_plus_first_year', 'Build + first year (legacy BUILD_LIVE_299_Y1)',
   'Legacy prepaid purchase. Non-renewing and never automatically migrated.',
   29900, 'USD', 'ONE_TIME_PREPAID_NO_AUTORENEW', null, true,
   '{full_acquisition,build_window,premium_first_year}', 30, 90,
   null, null, null, false, false, false, null, '{}', 60, 'offer_catalogue:build_first_year_LEGACY_REFERENCE_ONLY'),

  -- Owner decision 2026-10-13: a real Stripe trial for facilitators — card
  -- collected at checkout, free days, then charged unless canceled. Scoped by
  -- role, so it cannot be bought from the public pricing page. 14 days is a
  -- placeholder the owner has not yet confirmed.
  ('facilitator_premium_trial', 'steward_premium', 'Premium — facilitator trial',
   'Premium for facilitators, free for an introductory period and then billed monthly unless canceled.',
   1900, 'USD', 'RECURRING', 'MONTH', true, '{premium}', null, null,
   null, null, null, false, false, true, 14, '{facilitator}', 70, 'owner_decision_2026-10-13')
on conflict (offer_key) do nothing;
