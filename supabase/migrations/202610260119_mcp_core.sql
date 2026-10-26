-- MJG MCP: the Claude connector's credentials, confirmations and audit trail.
--
-- The MCP endpoint (app/api/mcp) lets Super Admins operate MJG from Claude, and
-- later lets agents (Paperclip / Hermes / OpenClaw) do so with scoped tokens.
-- Everything here is written by the app with the service role; RLS limits
-- direct (dashboard / PostgREST) access to Super Admins.
--
-- Secrets are never stored: access tokens, refresh tokens and authorization
-- codes are kept only as SHA-256 hashes.

-- ── Kill switch ─────────────────────────────────────────────────────────────
-- One row. Off by default: the endpoint answers 503 until a Super Admin turns
-- it on in Settings → Claude & Agents. (A feature flag can't do this job —
-- flags always grant Super Admins.)
create table if not exists public.mcp_settings (
  id          smallint primary key default 1 check (id = 1),
  enabled     boolean not null default false,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);
insert into public.mcp_settings (id, enabled) values (1, false) on conflict (id) do nothing;

-- ── OAuth clients (dynamic client registration, e.g. Claude) ───────────────
create table if not exists public.mcp_oauth_clients (
  client_id      text primary key,
  client_name    text,
  redirect_uris  text[] not null,
  created_at     timestamptz not null default now(),
  last_used_at   timestamptz
);

-- ── Authorization codes (single use, short-lived, PKCE) ─────────────────────
create table if not exists public.mcp_oauth_codes (
  code_hash       text primary key,
  client_id       text not null references public.mcp_oauth_clients(client_id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  redirect_uri    text not null,
  code_challenge  text not null,
  scopes          text[] not null default '{}',
  resource        text,
  expires_at      timestamptz not null,
  used_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- ── Tokens: people (via OAuth) and agents (issued in the dashboard) ─────────
create table if not exists public.mcp_tokens (
  id                  uuid primary key default gen_random_uuid(),
  kind                text not null check (kind in ('user', 'agent')),
  name                text not null,
  profile_id          uuid not null references public.profiles(id) on delete cascade,
  client_id           text references public.mcp_oauth_clients(client_id) on delete cascade,
  access_hash         text not null unique,
  refresh_hash        text unique,
  scopes              text[] not null default '{}',
  expires_at          timestamptz,
  refresh_expires_at  timestamptz,
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  last_used_at        timestamptz,
  revoked_at          timestamptz
);
create index if not exists mcp_tokens_profile_idx on public.mcp_tokens (profile_id) where revoked_at is null;

-- ── High-risk actions waiting for confirmation ──────────────────────────────
-- A high-risk tool call returns a preview and one of these. mjg_confirm runs
-- exactly the stored args, once, for the same token, before it expires.
-- Calls made with an agent token are routed for dashboard approval instead.
create table if not exists public.mcp_pending_confirmations (
  id           uuid primary key default gen_random_uuid(),
  token_id     uuid not null references public.mcp_tokens(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  tool         text not null,
  args         jsonb not null,
  args_hash    text not null,
  preview      jsonb,
  status       text not null default 'pending'
               check (status in ('pending', 'executed', 'failed', 'expired', 'awaiting_approval', 'approved', 'rejected')),
  expires_at   timestamptz not null,
  decided_by   uuid references public.profiles(id) on delete set null,
  decided_at   timestamptz,
  result       jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists mcp_pending_confirmations_status_idx on public.mcp_pending_confirmations (status, created_at desc);

-- ── Audit: every tool call ──────────────────────────────────────────────────
create table if not exists public.mcp_tool_calls (
  id           bigint generated always as identity primary key,
  token_id     uuid references public.mcp_tokens(id) on delete set null,
  profile_id   uuid references public.profiles(id) on delete set null,
  client_id    text,
  tool         text not null,
  risk         text,
  args         jsonb,
  status       text not null check (status in ('ok', 'error', 'denied', 'preview', 'invalid')),
  error        text,
  duration_ms  integer,
  created_at   timestamptz not null default now()
);
create index if not exists mcp_tool_calls_created_idx on public.mcp_tool_calls (created_at desc);
create index if not exists mcp_tool_calls_profile_idx on public.mcp_tool_calls (profile_id, created_at desc);

-- ── RLS: Super Admins only (the app itself uses the service role) ───────────
do $$
declare tbl text;
begin
  foreach tbl in array array['mcp_settings', 'mcp_oauth_clients', 'mcp_oauth_codes', 'mcp_tokens', 'mcp_pending_confirmations', 'mcp_tool_calls']
  loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_super_admin_all', tbl);
    execute format(
      'create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())',
      tbl || '_super_admin_all', tbl);
  end loop;
end $$;
