-- MJG MCP · Phase 2: SMS templates join the connector's trash (sms_template_delete).
-- Same columns as the tables in 202610290128_mcp_safety_upgrades.
alter table public.sms_templates add column if not exists deleted_at timestamptz;
alter table public.sms_templates add column if not exists deleted_by uuid references public.profiles(id) on delete set null;
create index if not exists sms_templates_trash_idx on public.sms_templates (deleted_at) where deleted_at is not null;
