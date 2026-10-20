-- Turning the real Steward on ------------------------------------------------
--
-- Until this is true, /steward serves the scripted design prototype. When it is
-- true, the member talks to the actual agent.
--
-- A config row rather than an env var, so a Super Admin can switch it from the
-- dashboard without a redeploy — and, more to the point, can switch it OFF the
-- same way if something is wrong in front of real members.
--
-- Ships false. The docset requires a provider-fit review before real member
-- content reaches any provider, and that review has not been done.

insert into public.steward_config (key, value, value_type, label, description, config_group, production_enabled, source_ref)
values
  ('agent.live_conversation', 'false', 'boolean', 'Steward talks for real',
   'OFF = members see the scripted design prototype. ON = members talk to the real agent, and what they write is sent to the configured AI provider. Do not turn on until the provider is cleared for real member content.',
   'agent', false, 'owner_control')
on conflict (key) do nothing;
