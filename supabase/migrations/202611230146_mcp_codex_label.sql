-- Codex (OpenAI's coding agent) gets its own client label, switch and activity
-- filter, the same as Claude and ChatGPT. Same rule as labelForClient() in
-- lib/mcp/clients.ts: a client name containing "codex" is Codex, checked before
-- the ChatGPT/OpenAI rule.

alter table public.mcp_oauth_clients drop constraint if exists mcp_oauth_clients_client_label_check;
alter table public.mcp_oauth_clients
  add constraint mcp_oauth_clients_client_label_check
  check (client_label in ('Claude', 'ChatGPT', 'Codex', 'Other'));

update public.mcp_oauth_clients set client_label = 'Codex' where client_name ~* 'codex';
update public.mcp_tool_calls c set client_label = 'Codex'
  from public.mcp_oauth_clients o
  where o.client_id = c.client_id and o.client_label = 'Codex' and c.client_label is distinct from 'Codex';
