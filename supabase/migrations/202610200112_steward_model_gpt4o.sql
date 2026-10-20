-- A stronger model for Steward ----------------------------------------------
--
-- gpt-4o-mini was the spike's choice: cheap, and enough to prove the harness
-- worked. The first real conversation showed its limit — it answered a member
-- asking for help with their family's future with a four-point intake form,
-- which is the generic-assistant voice the docset is explicitly trying to
-- avoid. Holding a specific voice over a long instruction bundle is exactly
-- what the small models are worst at.
--
-- gpt-4o is the same model the internal agent already runs on this account, so
-- it is known reachable rather than assumed.
--
-- This is now a live setting: agent.ts resolves the model per session from
-- here, so changing this row changes the next conversation. No redeploy.

update public.steward_config
   set value = '"gpt-4o"',
       updated_at = now()
 where key = 'agent.model.id';
