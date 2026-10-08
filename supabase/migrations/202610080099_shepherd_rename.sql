-- Rename the internal dashboard agent: Steward -> Shepherd ------------------
--
-- WHY. "Steward" is being reused for the member-facing AI product. Leaving
-- `actor_type = 'steward'` and `source = 'steward'` in place would mean the word
-- "steward" in the database refers to the *admin* agent while "Steward" in the
-- product refers to the *member* agent. That ambiguity is a trap for whoever
-- reads this schema next, so the stored values move too, not just the UI copy.
--
-- The brand words are untouched on purpose. "Stewardship", "stewarding",
-- "stewards", "Financial Steward" and "Steward your days with intention" are
-- Michael's own language, not the agent, and they must survive this migration
-- intact. Nothing here does a blanket text replace.
--
-- Each CHECK constraint is widened before the backfill and narrowed after, so
-- the table is never in a state where its own rows violate it. Constraint names
-- are discovered from pg_constraint rather than assumed: they were created
-- inline (unnamed) in 202609240093, so their generated names are an
-- implementation detail we should not hard-code.

-- == Helper: drop whatever CHECK currently guards a column ====================
create or replace function pg_temp.drop_column_checks(p_table text, p_column text)
returns void
language plpgsql
as $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = p_table
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%' || p_column || '%'
  loop
    execute format('alter table public.%I drop constraint %I', p_table, c.conname);
  end loop;
end;
$$;

-- == 1. website_pages.last_edited_source =====================================
select pg_temp.drop_column_checks('website_pages', 'last_edited_source');
update public.website_pages
   set last_edited_source = 'shepherd'
 where last_edited_source = 'steward';
alter table public.website_pages
  add constraint website_pages_last_edited_source_check
  check (last_edited_source in ('manual','shepherd','restore'));

-- == 2. website_page_versions.source =========================================
select pg_temp.drop_column_checks('website_page_versions', 'source');
update public.website_page_versions
   set source = 'shepherd'
 where source = 'steward';
alter table public.website_page_versions
  add constraint website_page_versions_source_check
  check (source in ('manual','shepherd','restore'));

-- == 3. website_change_sets.source ===========================================
-- Also carries a column default of 'steward', which has to move with the value.
select pg_temp.drop_column_checks('website_change_sets', 'source');
alter table public.website_change_sets alter column source drop default;
update public.website_change_sets
   set source = 'shepherd'
 where source = 'steward';
alter table public.website_change_sets alter column source set default 'shepherd';
alter table public.website_change_sets
  add constraint website_change_sets_source_check
  check (source in ('shepherd','manual'));

-- == 4. website_audit_logs.actor_type ========================================
select pg_temp.drop_column_checks('website_audit_logs', 'actor_type');
update public.website_audit_logs
   set actor_type = 'shepherd'
 where actor_type = 'steward';
alter table public.website_audit_logs
  add constraint website_audit_logs_actor_type_check
  check (actor_type in ('user','shepherd'));

-- == 5. editor.settings JSONB key ============================================
-- One row in website_globals. Rebuild the object with the new key only when the
-- old key is actually present, so re-running this is a no-op.
update public.website_globals
   set value = (value - 'allowStewardDirectPublish')
               || jsonb_build_object(
                    'allowShepherdDirectPublish',
                    coalesce(value -> 'allowStewardDirectPublish', 'false'::jsonb)
                  )
 where key = 'editor.settings'
   and value ? 'allowStewardDirectPublish';

-- == 6. dev_requests.steward_brief -> shepherd_brief =========================
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'dev_requests'
      and column_name = 'steward_brief'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'dev_requests'
      and column_name = 'shepherd_brief'
  ) then
    alter table public.dev_requests rename column steward_brief to shepherd_brief;
  end if;
end;
$$;

-- == 7. The read-only SQL RPC ================================================
-- Recreated under the new name rather than renamed, so the grant/revoke pair is
-- stated explicitly for the new function instead of inherited silently. Body is
-- unchanged from 202607010029 — same six guards, in the same order.
create or replace function public.shepherd_readonly_query(query_text text)
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

revoke all on function public.shepherd_readonly_query(text) from public;
grant execute on function public.shepherd_readonly_query(text) to service_role;

drop function if exists public.steward_readonly_query(text);

-- == 8. Seeded agent training docs ===========================================
-- These rows carry the agent's name inside their bodies and titles, the same way
-- 202609240094 had to rewrite seeded copy for the Keystone Rhythms rename.
-- Word-boundary guarded so "Stewardship" and "stewarding" are never touched.
update public.agent_training_docs
   set title = regexp_replace(title, '\ySteward\y', 'Shepherd', 'g')
 where title ~ '\ySteward\y';

update public.agent_training_docs
   set content_md = regexp_replace(content_md, '\ySteward\y', 'Shepherd', 'g')
 where content_md is not null and content_md ~ '\ySteward\y';

update public.agent_training_docs
   set summary = regexp_replace(summary, '\ySteward\y', 'Shepherd', 'g')
 where summary is not null and summary ~ '\ySteward\y';
