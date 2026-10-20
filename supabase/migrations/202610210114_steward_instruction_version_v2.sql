-- Instruction bundle v2 ------------------------------------------------------
--
-- Adds a worked example of a good reply and a bad one, taken from a real test
-- conversation: a member said "I don't even know truly what my values are" and
-- Steward answered with a four-item menu of services.
--
-- Rules alone were not holding — "write prose, not documents" had been in the
-- bundle for two versions and the model kept producing numbered lists. Showing
-- the shape is a stronger lever than describing it.

update public.steward_config
   set value = '"steward-instructions-v2-voice-examples"',
       updated_at = now()
 where key = 'agent.instruction_version';
