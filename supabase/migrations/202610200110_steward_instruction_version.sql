-- The instruction bundle is no longer a placeholder -------------------------
--
-- steward/agent/instructions.md now carries the real participant-facing
-- behaviour, assembled from the accepted baseline (S00, 00_Common, and
-- 03_Conversation_Sensitive_Safety C01-C13) rather than the spike scaffold.
--
-- The version is stamped onto every run, so a reply can be read back against
-- the instructions that produced it. Bump it whenever instructions.md changes
-- in a way that could change what Steward says.

update public.steward_config
   set value = '"steward-instructions-v1-docset-0.6.2"',
       description = 'Stamped onto every run so a reply can be read back against the instructions that produced it. Bump whenever steward/agent/instructions.md changes behaviour.',
       updated_at = now()
 where key = 'agent.instruction_version';
