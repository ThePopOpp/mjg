-- MJG MCP · Phase 1 safety upgrades (docs/mcp/MJG-MCP-EXPANSION-PLAN.md §3).
--
-- Before Claude and ChatGPT get full create/update/delete:
--   1. soft delete — deleted_at / deleted_by on every table an MCP delete tool
--      will touch, so nothing deleted through the connector is gone for good;
--   2. which client did what — each OAuth client is labelled Claude / ChatGPT /
--      Other and can be switched off on its own;
--   3. richer audit — the record a call touched, with before/after snapshots;
--   4. daily send caps — set by a Super Admin (null = no cap).

-- ── 1. Soft delete ──────────────────────────────────────────────────────────
-- Adding the columns changes nothing on its own: no row is soft-deleted until
-- an entity's delete tool ships, and each one ships together with its readers
-- skipping deleted rows (see lib/mcp/trash.ts).
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'contacts', 'participants', 'facilitator_groups', 'social_posts', 'social_templates',
    'media_assets', 'project_schedule_items', 'tags', 'bookings', 'business_cards', 'form_submissions'
  ]
  loop
    execute format('alter table public.%I add column if not exists deleted_at timestamptz', tbl);
    execute format('alter table public.%I add column if not exists deleted_by uuid references public.profiles(id) on delete set null', tbl);
    execute format('create index if not exists %I on public.%I (deleted_at) where deleted_at is not null', tbl || '_trash_idx', tbl);
  end loop;
end $$;

-- ── 2. Client labels + per-client switch ────────────────────────────────────
alter table public.mcp_oauth_clients
  add column if not exists client_label text not null default 'Other' check (client_label in ('Claude', 'ChatGPT', 'Other')),
  add column if not exists disabled_at  timestamptz,
  add column if not exists disabled_by  uuid references public.profiles(id) on delete set null;

-- Same rule as labelForClient() in lib/mcp/clients.ts.
update public.mcp_oauth_clients set client_label = case
  when client_name ~* '(chatgpt|openai)' or array_to_string(redirect_uris, ' ') ~* '(chatgpt\.com|openai\.com)' then 'ChatGPT'
  when client_name ~* '(claude|anthropic)' or array_to_string(redirect_uris, ' ') ~* '(claude\.ai|claude\.com|anthropic\.com)' then 'Claude'
  else 'Other'
end;

-- ── 3. Audit: client, record, before/after ──────────────────────────────────
alter table public.mcp_tool_calls
  add column if not exists client_label text,
  add column if not exists entity       text,
  add column if not exists record_id    text,
  add column if not exists before       jsonb,
  add column if not exists after        jsonb;
create index if not exists mcp_tool_calls_record_idx on public.mcp_tool_calls (entity, record_id) where entity is not null;
create index if not exists mcp_tool_calls_tool_idx on public.mcp_tool_calls (tool, created_at desc);

update public.mcp_tool_calls c set client_label = coalesce(
  (select o.client_label from public.mcp_oauth_clients o where o.client_id = c.client_id),
  (select case when t.kind = 'agent' then 'Agent' end from public.mcp_tokens t where t.id = c.token_id)
) where c.client_label is null;

-- ── 4. Daily send caps (rolling 24 hours, across every client) ──────────────
alter table public.mcp_settings
  add column if not exists sms_daily_cap   integer check (sms_daily_cap is null or sms_daily_cap >= 0),
  add column if not exists email_daily_cap integer check (email_daily_cap is null or email_daily_cap >= 0);
