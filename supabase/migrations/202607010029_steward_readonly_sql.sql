-- Steward read-only SQL RPC ------------------------------------------------
-- Lets the AI agent (Super-Admin gated at the app layer in lib/ai-agent/tools.ts
-- via assertSuperAdmin) run ad-hoc SELECT queries safely. Defense in depth:
--   1. SELECT / WITH only ....................... regex reject at entry
--   2. single statement only .................... reject embedded ';'
--   3. no write / DDL keywords .................. word-boundary keyword reject
--   4. transaction forced READ ONLY ............. blocks any write that slips (4) — the real guard
--   5. 5s statement timeout ..................... runaway query protection
--   6. results capped at 200 rows ............... wraps the query in a bounded subquery
-- Callable ONLY by service_role (the app's admin client); revoked from everyone else.

create or replace function public.steward_readonly_query(query_text text)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  result jsonb;
  lowered text := lower(btrim(query_text));
  stripped text := btrim(query_text, E' \t\r\n;');
begin
  if lowered !~ '^(select|with)\s' then
    raise exception 'Only SELECT / WITH queries are allowed.';
  end if;
  if position(';' in stripped) > 0 then
    raise exception 'Only a single statement is allowed.';
  end if;
  if lowered ~ '\y(insert|update|delete|drop|alter|truncate|create|grant|revoke|comment|copy|vacuum|analyze|merge|call|do|refresh|reindex|cluster|lock|set|reset)\y' then
    raise exception 'Only read-only SELECT queries are allowed (no writes or DDL).';
  end if;

  -- Local settings — reset at transaction end.
  perform set_config('statement_timeout', '5000', true);
  perform set_config('transaction_read_only', 'on', true);

  execute format(
    'select coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb) from (select * from (%s) q limit 200) t',
    query_text
  ) into result;

  return result;
end;
$$;

revoke all on function public.steward_readonly_query(text) from public;
grant execute on function public.steward_readonly_query(text) to service_role;
