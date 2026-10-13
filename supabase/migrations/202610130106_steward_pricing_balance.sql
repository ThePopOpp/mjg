-- Balance the pricing toggle to three cards a side ---------------------------
--
-- 202610130105 put the $149 Initial Full Build under 'any', which left the
-- annual tab with four cards in a three-column grid: one stranded on its own
-- row, which reads as a layout accident rather than a plan.
--
-- Moving it to 'monthly' balances both sides at three AND tells a clearer
-- story, because the two paths become parallel rather than overlapping:
--   month to month -> $149 build once, then $19/mo
--   annual         -> $299 build + first year, or $199/yr for Premium alone
--
-- Nothing is hidden by this. On the annual tab the $299 bundle already includes
-- the build and costs $49 less than buying the two separately, so a standalone
-- build card there was strictly the worse deal sitting next to the better one.
-- Anyone wanting only the build finds it on the month-to-month tab.

update public.steward_offers
   set billing_period = 'monthly', updated_at = now()
 where offer_key = 'initial_full';
