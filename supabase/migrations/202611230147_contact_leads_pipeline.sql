-- Lead pipeline on contacts (agents + people prospecting churches, facilitators,
-- individuals and partners). contacts stays the one place people live; these
-- columns are only used when type = 'lead'. Written by the leads_* MCP tools
-- (lib/tools/leads.ts) and shown in Contacts → Leads.
--
--   lead_stage    — where the lead is in outreach
--   lead_segment  — who they are to MJG
--   job_title     — e.g. "Lead Pastor", "Executive Pastor", "Podcast host"
--   research_notes— what an agent or person found, appended over time
--   found_by      — "agent:<token name>" or the person's email
--   consent_basis — where the contact details came from (e.g. "published on church website")
--   dedupe_key    — lower(email), else website domain + name; unique among live rows,
--                   so the same lead can't be imported twice

alter table public.contacts
  add column if not exists lead_stage text
    check (lead_stage in ('new','researched','contacted','replied','qualified','converted','disqualified')),
  add column if not exists lead_segment text
    check (lead_segment in ('church','facilitator','individual','partner')),
  add column if not exists job_title text,
  add column if not exists research_notes text,
  add column if not exists found_by text,
  add column if not exists consent_basis text,
  add column if not exists dedupe_key text,
  add column if not exists last_contacted_at timestamptz;

create unique index if not exists contacts_dedupe_key_uidx
  on public.contacts (dedupe_key)
  where dedupe_key is not null and deleted_at is null;

create index if not exists contacts_lead_pipeline_idx
  on public.contacts (lead_segment, lead_stage, created_at desc)
  where type = 'lead' and deleted_at is null;

-- Existing leads start in the pipeline as "new".
update public.contacts set lead_stage = 'new' where type = 'lead' and lead_stage is null;
