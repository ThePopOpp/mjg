-- MJG MCP · ChatGPT is opt-in. Until a Super Admin turns it on in Settings →
-- Claude & Agents → AI clients, every ChatGPT connection is refused — even one
-- that has signed in. Claude is unaffected.
alter table public.mcp_settings add column if not exists chatgpt_enabled boolean not null default false;
