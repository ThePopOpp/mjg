-- Instruction bundle v3 ------------------------------------------------------
--
-- Steward now sees the member's own Created for More Check-In and Energy Audit
-- results: scores in every turn's context, statement ratings and reflections
-- through the new read_assessments tool. The bundle gains a section on using
-- them — ground the answer in their results, hold them lightly, and explain a
-- result only in the assessment's own words.
--
-- In testing, Steward's answers were "way too broad". The cause was that it had
-- nothing specific about them to draw on, not the wording of its voice rules.

update public.steward_config
   set value = '"steward-instructions-v3-assessments"',
       updated_at = now()
 where key = 'agent.instruction_version';
