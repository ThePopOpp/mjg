-- How an offer is laid out on the pricing page -------------------------------
--
-- 'card' -> one column of the three-up grid.
-- 'row'  -> a full-width band under the grid.
--
-- A column rather than a special case on offer_key in the component, for the
-- same reason prices and badges live here: presentation that an owner will want
-- to change should not need a deploy, and a hardcoded "if (offer_key ===
-- 'initial_full')" rots the moment the catalogue changes.

alter table public.steward_offers
  add column if not exists layout text not null default 'card'
    check (layout in ('card','row'));

comment on column public.steward_offers.layout is
  'card = a column in the pricing grid; row = a full-width band beneath it.';

-- The standalone build is the entry purchase on either cadence, so it sits in a
-- full-width row under both toggles rather than competing with the plans. On
-- the annual side the $299 bundle already includes it for $49 less than buying
-- the two separately, so showing it as a peer there made the better deal look
-- like one option among several.
update public.steward_offers
   set layout = 'row',
       billing_period = 'any',
       updated_at = now()
 where offer_key = 'initial_full';
