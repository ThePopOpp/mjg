-- The Steward Blueprint record -----------------------------------------------
--
-- Phase 3 of the Steward build: the tables the agent proposes against. Nothing
-- here is written by a model. Steward proposes wording; the application writes;
-- the model narrates a receipt it was handed.
--
-- THE RULE THESE TABLES EXIST TO ENFORCE — clause D25:
--
--   "A Blueprint definition state, a wording/content state, an application
--    persistence result, practice evidence, service entitlement and participant
--    permission are independent facts. Store and display each from its
--    authoritative source. Do not derive persistence from approval, approval
--    from persistence, definition from purchase, practice from wording, or
--    entitlement from participant intent."
--
-- So there is no single `status` column anywhere in this file. Six axes, six
-- homes:
--
--   definition  -> steward_sections.definition_state, steward_fields.definition_state
--                  (separately — a section is NOT the max of its fields)
--   content     -> steward_field_versions.content_state
--   persistence -> steward_write_receipts.persistence_status
--   practice    -> steward_observations.outcome (missing is a value, not a zero)
--   entitlement -> steward_entitlements (migration 202610130103, commerce)
--   permission  -> steward_consents.purpose
--
-- A single status column is how STATE-001 happened. Collapsing any two of these
-- back together would reintroduce it.
--
-- PRIVACY POSTURE. Unlike most tables in this app — which are service-role only
-- behind a server guard — these hold private per-member content, so they carry
-- real RLS scoped to the signed-in member via public.current_profile_id().
-- The service role still bypasses RLS for the agent's server-side writes, but a
-- leaked anon key cannot read one member's Blueprint, let alone everyone's.

-- == 1. The Blueprint =========================================================

create table if not exists public.steward_blueprints (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  -- Two depths only. There is no middle edition.
  edition text not null default 'free' check (edition in ('free', 'full')),
  -- Bumped when the framework version this Blueprint was built against changes,
  -- so an old Blueprint can be read back against the structure that created it.
  framework_version text not null default 'SV2-DOCSET-D0.6.2-20260928',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.steward_blueprints.edition is
  'free = the three-page Blueprint. full = all thirteen. Derived from entitlement at read time, never from participant intent.';

-- == 2. Sections (the pages) ==================================================

create table if not exists public.steward_sections (
  id uuid primary key default gen_random_uuid(),
  blueprint_id uuid not null references public.steward_blueprints(id) on delete cascade,
  -- Matches the slugs in lib/steward/blueprint.ts, which transcribe the docset.
  page_slug text not null,
  page_number integer not null,
  definition_state text not null default 'not_yet_explored'
    check (definition_state in ('not_yet_explored', 'taking_shape', 'defined_for_this_season')),
  -- When the evaluator last derived the state above, and from which rule set.
  state_evaluated_at timestamptz,
  state_rule_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (blueprint_id, page_slug)
);
create index if not exists steward_sections_blueprint_idx
  on public.steward_sections(blueprint_id, page_number);

comment on column public.steward_sections.definition_state is
  'Derived by FUNCTIONAL SUFFICIENCY, never by counting filled fields and never promoted automatically by an approved child field.';

-- == 3. Fields ================================================================

create table if not exists public.steward_fields (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.steward_sections(id) on delete cascade,
  field_key text not null,
  label text not null,
  -- A nonessential field may sit at taking_shape while its section is
  -- defined_for_this_season. That is correct, not a bug: the docset names it.
  essential boolean not null default true,
  sort_order integer not null default 0,
  definition_state text not null default 'not_yet_explored'
    check (definition_state in ('not_yet_explored', 'taking_shape', 'defined_for_this_season')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, field_key)
);
create index if not exists steward_fields_section_idx
  on public.steward_fields(section_id, sort_order);

-- == 4. Wording objects =======================================================
-- Append-only. Changing wording supersedes a version; it never edits one, so
-- what the participant actually approved stays readable afterwards.

create table if not exists public.steward_field_versions (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.steward_fields(id) on delete cascade,
  content_state text not null default 'exploratory'
    check (content_state in ('exploratory', 'proposed', 'participant_approved', 'superseded')),
  -- The exact words. A proposal is stored verbatim so approval can be of THESE
  -- words rather than of a paraphrase.
  value text not null,
  -- A CONTENT MARKER on this wording, deliberately NOT a fourth definition
  -- state. Conflating the two is how the original STATE-001 defect happened.
  needs_clarity boolean not null default false,
  clarity_note text,
  supersedes_id uuid references public.steward_field_versions(id) on delete set null,
  proposed_by text not null default 'steward' check (proposed_by in ('steward', 'participant')),
  -- Set only by an explicit participant action, never by the agent.
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  superseded_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists steward_field_versions_field_idx
  on public.steward_field_versions(field_id, created_at desc);
-- The current wording of a field: at most one approved version that nothing has
-- superseded. Enforced here rather than trusted to application code.
create unique index if not exists steward_field_versions_one_current_idx
  on public.steward_field_versions(field_id)
  where content_state = 'participant_approved' and superseded_at is null;

comment on column public.steward_field_versions.needs_clarity is
  'Content marker on this wording. NOT a definition state. Never read it as one.';

-- == 5. Write receipts ========================================================
-- The ONLY thing that makes "saved" true. Nothing may infer persistence from an
-- approval having happened, and the agent may only report what a settled
-- receipt says.

create table if not exists public.steward_write_receipts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  operation text not null,
  target_table text,
  target_id uuid,
  -- Supplied by the caller so a retried proposal cannot write twice.
  idempotency_key text not null unique,
  persistence_status text not null default 'pending'
    check (persistence_status in ('pending', 'confirmed', 'failed', 'unknown')),
  -- 'unknown' is a real outcome, not a bug: a write whose result we did not
  -- learn must not be reported as either success or failure.
  detail jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);
create index if not exists steward_write_receipts_profile_idx
  on public.steward_write_receipts(profile_id, created_at desc);

-- == 6. Practice evidence =====================================================
-- Missingness is preserved. "Not reported" is distinct from "did not do it",
-- and neither may be rendered as a zero.

create table if not exists public.steward_observations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  field_id uuid references public.steward_fields(id) on delete set null,
  observed_on date not null,
  outcome text not null check (outcome in ('done', 'not_done', 'not_reported')),
  note text,
  source text not null default 'participant' check (source in ('participant', 'facilitator')),
  created_at timestamptz not null default now(),
  unique (profile_id, field_id, observed_on)
);
create index if not exists steward_observations_profile_idx
  on public.steward_observations(profile_id, observed_on desc);

-- == 7. Purpose-bound consent =================================================
-- Five distinct permissions, because the docset treats them as distinct. One
-- blanket "I agree" cannot stand in for any of them.

create table if not exists public.steward_consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null
    check (purpose in ('storage', 'personalisation', 'review', 'resurfacing', 'sharing')),
  granted boolean not null default false,
  granted_at timestamptz,
  revoked_at timestamptz,
  source text not null default 'member_settings',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, purpose)
);

-- == 8. Selected continuity ===================================================
-- "Selected purpose-bound continuity, not blanket transcripts." A note here is
-- something the application chose to carry forward for a stated purpose, with
-- its own expiry — not a log of everything said.

create table if not exists public.steward_selected_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null,
  note text not null,
  source_session_id text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists steward_selected_notes_profile_idx
  on public.steward_selected_notes(profile_id, created_at desc);
create index if not exists steward_selected_notes_expiry_idx
  on public.steward_selected_notes(expires_at)
  where expires_at is not null;

-- == 9. Audit =================================================================

create table if not exists public.steward_audit_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  actor_type text not null check (actor_type in ('participant', 'steward', 'system', 'super_admin')),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists steward_audit_logs_profile_idx
  on public.steward_audit_logs(profile_id, created_at desc);

-- == 10. Model telemetry ======================================================
-- Master08: record provider, requested model AND the actual model where the
-- provider returns one. A silent fallback is a CHANGED EXECUTION CONTEXT, not a
-- detail — test V2-X08 exists for exactly this. Never label an unavailable
-- snapshot as known.

create table if not exists public.steward_agent_runs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  session_id text,
  turn_id text,
  provider text not null,
  requested_model text not null,
  -- NULL means the provider did not tell us. That is not the same as "it used
  -- what we asked for", and must never be rendered as if it were.
  actual_model text,
  instruction_version text,
  fallback_policy_version text,
  generation_config_version text,
  status text not null default 'started'
    check (status in ('started', 'completed', 'failed', 'refused')),
  error text,
  input_tokens integer,
  output_tokens integer,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists steward_agent_runs_profile_idx
  on public.steward_agent_runs(profile_id, started_at desc);
create index if not exists steward_agent_runs_model_idx
  on public.steward_agent_runs(provider, requested_model, actual_model);

comment on column public.steward_agent_runs.actual_model is
  'What the provider reports it actually served. NULL = not returned; do not treat as equal to requested_model.';

-- == RLS ======================================================================
-- Scoped to the signed-in member. public.current_profile_id() resolves the
-- profile from auth.uid(), which is how the rest of this schema does it.
--
-- Read-only for the member on every table. Writes go through the service role
-- after the application's own checks, so an approval cannot be forged by
-- posting directly to PostgREST.

alter table public.steward_blueprints      enable row level security;
alter table public.steward_sections        enable row level security;
alter table public.steward_fields          enable row level security;
alter table public.steward_field_versions  enable row level security;
alter table public.steward_write_receipts  enable row level security;
alter table public.steward_observations    enable row level security;
alter table public.steward_consents        enable row level security;
alter table public.steward_selected_notes  enable row level security;
alter table public.steward_audit_logs      enable row level security;
alter table public.steward_agent_runs      enable row level security;

drop policy if exists steward_blueprints_own on public.steward_blueprints;
create policy steward_blueprints_own on public.steward_blueprints
  for select using (profile_id = public.current_profile_id());

drop policy if exists steward_sections_own on public.steward_sections;
create policy steward_sections_own on public.steward_sections
  for select using (
    exists (
      select 1 from public.steward_blueprints b
       where b.id = steward_sections.blueprint_id
         and b.profile_id = public.current_profile_id()
    )
  );

drop policy if exists steward_fields_own on public.steward_fields;
create policy steward_fields_own on public.steward_fields
  for select using (
    exists (
      select 1
        from public.steward_sections s
        join public.steward_blueprints b on b.id = s.blueprint_id
       where s.id = steward_fields.section_id
         and b.profile_id = public.current_profile_id()
    )
  );

drop policy if exists steward_field_versions_own on public.steward_field_versions;
create policy steward_field_versions_own on public.steward_field_versions
  for select using (
    exists (
      select 1
        from public.steward_fields f
        join public.steward_sections s on s.id = f.section_id
        join public.steward_blueprints b on b.id = s.blueprint_id
       where f.id = steward_field_versions.field_id
         and b.profile_id = public.current_profile_id()
    )
  );

drop policy if exists steward_write_receipts_own on public.steward_write_receipts;
create policy steward_write_receipts_own on public.steward_write_receipts
  for select using (profile_id = public.current_profile_id());

drop policy if exists steward_observations_own on public.steward_observations;
create policy steward_observations_own on public.steward_observations
  for select using (profile_id = public.current_profile_id());

drop policy if exists steward_consents_own on public.steward_consents;
create policy steward_consents_own on public.steward_consents
  for select using (profile_id = public.current_profile_id());

drop policy if exists steward_selected_notes_own on public.steward_selected_notes;
create policy steward_selected_notes_own on public.steward_selected_notes
  for select using (profile_id = public.current_profile_id());

drop policy if exists steward_audit_logs_own on public.steward_audit_logs;
create policy steward_audit_logs_own on public.steward_audit_logs
  for select using (profile_id = public.current_profile_id());

-- Telemetry is operational data, not member content: a member may read their
-- own runs, and nobody else reaches it except the service role.
drop policy if exists steward_agent_runs_own on public.steward_agent_runs;
create policy steward_agent_runs_own on public.steward_agent_runs
  for select using (profile_id = public.current_profile_id());

-- == Agent configuration ======================================================
-- Added to the existing steward_config spine so the model can be changed from
-- the Agent Manager without a redeploy, per tier or per cohort.
--
-- production_enabled = false on every row below. A value can exist for dev and
-- staging and still not be cleared for real member content — which is exactly
-- the state these are in until the provider-fit and privacy review named in the
-- handoff notice has been done.

insert into public.steward_config (key, value, value_type, label, description, config_group, production_enabled, source_ref)
values
  ('agent.model.provider', '"openai"', 'string', 'Model provider',
   'Which provider serves Steward. Each provider touching real member content needs its own provider-fit and contractual review first.',
   'agent', false, 'master08_model_telemetry'),

  ('agent.model.id', '"gpt-4o-mini"', 'string', 'Model id',
   'Pinned deliberately. An unpinned default drifts on every eve upgrade, which is the silent change of execution context master08 forbids.',
   'agent', false, 'master08_model_telemetry'),

  ('agent.instruction_version', '"steward-instructions-v0"', 'string', 'Instruction bundle version',
   'Stamped onto every run so a reply can be read back against the instructions that produced it.',
   'agent', false, 'master08_model_telemetry'),

  -- Deliberately NULL. The handoff notice lists resource_budgets among the
  -- values left unset, and forbids inventing them. The config reader throws a
  -- named error, so a feature that needs one cannot quietly run on a guess.
  ('agent.resource_budgets', null, 'json', 'Resource budgets',
   'UNSET in the accepted docset: max calls per turn, context tokens, retries. Must be decided, not guessed.',
   'agent', false, 'handoff_notice_unset_values'),

  ('agent.fallback_policy_version', null, 'string', 'Fallback policy version',
   'UNSET. What Steward does when the requested model is unavailable is an owner decision, and a silent fallback is a changed execution context (V2-X08).',
   'agent', false, 'handoff_notice_unset_values'),

  ('retention.conversation_days', null, 'duration_days', 'Conversation retention',
   'UNSET. Governs the purge job over Eve''s session store as well as steward_selected_notes. Nothing retains indefinitely by default.',
   'retention', false, 'handoff_notice_unset_values'),

  ('promotion.max_per_conversation', '2', 'number', 'Promotion budget per conversation',
   'One shared ceiling for upgrade AND referral invitations. Application state, not model discretion: not resettable by a new tab or by routing.',
   'agent', false, 'promotion_attention_budget'),

  ('promotion.max_per_turn', '1', 'number', 'Promotion budget per turn',
   'A refusal stops unsolicited pitches for the rest of the conversation.',
   'agent', false, 'promotion_attention_budget')
on conflict (key) do nothing;
