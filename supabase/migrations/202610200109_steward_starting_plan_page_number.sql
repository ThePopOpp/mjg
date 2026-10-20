-- My Starting Plan is not page 3 of the thirteen -----------------------------
--
-- lib/steward/blueprint.ts numbers My Starting Plan / My Next Faithful Step as
-- 3 because it is the THIRD PAGE OF THE FREE BLUEPRINT. The bootstrap wrote
-- that number straight through, which put it at page_number 3 alongside What I
-- Stand On — two pages at 3, and an ordering that depends on whichever row the
-- planner happens to return first.
--
-- Found by reading the agent's own overview output: the list went
-- 1, 2, "My Starting Plan", and What I Stand On was nowhere near where it
-- belonged.
--
-- It is stored after the thirteen. The Free view renumbers it to 3 for display,
-- which is a presentation concern and does not belong in the stored order.

update public.steward_sections
   set page_number = 14,
       updated_at = now()
 where page_slug = 'starting-plan'
   and page_number <> 14;
