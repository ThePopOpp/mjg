-- Stripe → Coupons --------------------------------------------------------------
--
-- Coupon codes managed by Super Admins from /dashboard/stripe.
--
-- WHY THE RULES LIVE HERE AND NOT IN STRIPE. Stripe has no start date and no
-- maximum spend, and once a coupon or promotion code exists its limits cannot
-- be edited. So Stripe holds only the discount itself (percent or amount,
-- duration, which products), and every rule an admin may want to change later
-- — start, expiry, usage limits, min/max spend — is enforced by the app before
-- it creates the Checkout session. Checkout never shows Stripe's own
-- promotion-code box, so a code cannot reach Stripe without passing these rules.

create table if not exists public.stripe_coupons (
  id uuid primary key default gen_random_uuid(),

  -- What the buyer types. Stored upper-case; matching is case-insensitive.
  code text not null,
  description text,

  discount_type text not null check (discount_type in ('percent','amount')),
  percent_off numeric(5,2) check (percent_off is null or (percent_off > 0 and percent_off <= 100)),
  amount_off_minor integer check (amount_off_minor is null or amount_off_minor > 0),
  currency text not null default 'USD',

  -- Only meaningful for subscriptions; one-time purchases are always 'once'.
  duration text not null default 'once' check (duration in ('once','repeating','forever')),
  duration_in_months integer check (duration_in_months is null or duration_in_months > 0),

  -- Empty = every offer.
  applies_to_offer_keys text[] not null default '{}',

  -- App-enforced, editable.
  starts_at timestamptz,
  expires_at timestamptz,
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  once_per_customer boolean not null default false,
  min_spend_minor integer check (min_spend_minor is null or min_spend_minor >= 0),
  max_spend_minor integer check (max_spend_minor is null or max_spend_minor >= 0),
  active boolean not null default true,

  -- The Stripe coupon. Test and live are separate Stripe worlds that share this
  -- database, so the mode is recorded and checkout refuses a coupon from the
  -- other one.
  stripe_coupon_id text not null,
  stripe_livemode boolean not null,

  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint stripe_coupons_value_matches_type check (
    (discount_type = 'percent' and percent_off is not null and amount_off_minor is null) or
    (discount_type = 'amount' and amount_off_minor is not null and percent_off is null)
  ),
  constraint stripe_coupons_months_for_repeating check (
    (duration = 'repeating') = (duration_in_months is not null)
  ),
  constraint stripe_coupons_dates_ordered check (
    starts_at is null or expires_at is null or starts_at < expires_at
  ),
  constraint stripe_coupons_spend_ordered check (
    min_spend_minor is null or max_spend_minor is null or min_spend_minor <= max_spend_minor
  )
);

create unique index if not exists stripe_coupons_code_mode_idx
  on public.stripe_coupons (upper(code), stripe_livemode);

alter table public.stripe_coupons enable row level security;
drop policy if exists stripe_coupons_super_admin_all on public.stripe_coupons;
create policy stripe_coupons_super_admin_all on public.stripe_coupons
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Which code an order used, and what it saved. Set from the verified webhook.
alter table public.steward_orders
  add column if not exists coupon_id uuid references public.stripe_coupons(id) on delete set null,
  add column if not exists coupon_code text,
  add column if not exists discount_minor integer not null default 0;

create index if not exists steward_orders_coupon_idx
  on public.steward_orders (coupon_id) where coupon_id is not null;
