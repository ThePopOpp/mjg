-- website_audit_logs: record changes made through the Claude connector (MCP) as
-- actor_type 'mcp', alongside 'user' (dashboard) and 'shepherd' (dashboard AI).
-- Who exactly acted is in actor_id; mcp_tool_calls holds the full call.

alter table public.website_audit_logs drop constraint if exists website_audit_logs_actor_type_check;
alter table public.website_audit_logs
  add constraint website_audit_logs_actor_type_check
  check (actor_type in ('user', 'shepherd', 'mcp'));
