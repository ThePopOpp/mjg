-- Legal document manager (CMS -> Legal) -------------------------------------
--
-- WHY A TABLE AND NOT MORE MARKDOWN FILES. /privacy and /terms are currently
-- rendered straight from docs/legal/*.md by lib/public-site/legal.ts, which is a
-- good pattern precisely because there is no second copy to drift. But the
-- container filesystem is read-only in practice, so "manage these in the
-- dashboard" cannot mean "edit those files". The documents move into Postgres;
-- the markdown files stay as the import source and as a fallback (see below), so
-- a bad row can never take a Twilio-required page offline.
--
-- DRAFT VS PUBLISHED. Every document carries both. `draft_md` is what the
-- dashboard edits; `published_md` is what the public route serves. A document
-- with `published_md IS NULL` has never been published and its public route
-- 404s. This matters more than usual here: the 2026-10-09 package is explicitly
-- "ATTORNEY REVIEW DRAFT" and the privacy policy itself says "Do not publish
-- this draft with placeholders", so the drafts land as drafts and the currently
-- live A2P 10DLC documents keep serving until counsel clears the replacements.
--
-- CATEGORIES. Not every file in the package is a web page, and getting this
-- wrong would publish an internal conflict-of-interest policy:
--   'public'   -> may be served at a public route
--   'internal' -> operational/compliance document, never routable
--   'ui_copy'  -> consent and checkout copy consumed by the app, not a page
-- The public route layer only ever looks at category = 'public'.
--
-- Super-Admin only at the database level, matching the CMS and Frontend Editor.

create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),

  -- For a 'public' document this is also its route: slug 'privacy' -> /privacy.
  slug text not null unique,
  title text not null,
  eyebrow text not null default 'Legal',
  summary text not null default '',

  category text not null default 'public'
    check (category in ('public','internal','ui_copy')),

  -- What the dashboard edits.
  draft_md text not null default '',
  -- What the public route serves. NULL = never published.
  published_md text,

  -- Printed in the page header. Deliberately nullable: the package ships
  -- "[INSERT ON PUBLICATION]" and an invented date would be worse than none.
  effective_date date,

  has_unpublished_changes boolean not null default true,
  published_at timestamptz,
  published_by uuid references public.profiles(id) on delete set null,

  -- Provenance, so a row can always be traced back to the document it came from.
  source_file text,

  sort_order integer not null default 0,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists legal_documents_category_idx
  on public.legal_documents(category, sort_order);
-- Partial index: the public route layer only ever asks for published rows.
create index if not exists legal_documents_published_idx
  on public.legal_documents(slug) where published_md is not null;

-- == Version history =========================================================
-- Append-only. Every save, publish and unpublish writes a row, so a legal
-- document can be shown to counsel as "what did this say on date X" and rolled
-- back without relying on database backups.
create table if not exists public.legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.legal_documents(id) on delete cascade,
  version_number integer not null,
  body_md text not null,
  effective_date date,
  action text not null default 'saved'
    check (action in ('imported','saved','published','unpublished','restored')),
  note text not null default '',
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_id, version_number)
);

create index if not exists legal_document_versions_doc_idx
  on public.legal_document_versions(document_id, version_number desc);

-- == RLS =====================================================================
do $$
declare tbl text;
begin
  foreach tbl in array array['legal_documents','legal_document_versions'] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_super_admin_all', tbl);
    execute format(
      'create policy %I on public.%I for all using (public.is_super_admin()) with check (public.is_super_admin())',
      tbl || '_super_admin_all', tbl);
  end loop;
end $$;

-- == Seed =====================================================================
-- Two groups, and the difference is the whole point of this migration.
--
-- 1. The live A2P 10DLC Privacy Policy and Terms are seeded as PUBLISHED, with
--    their current markdown in published_md, so /privacy and /terms serve
--    exactly what they serve today. Their draft_md is left empty here and is
--    filled by the importer with the 2026-10-09 replacement drafts, which is
--    what makes "review the new wording, then publish" a dashboard action.
-- 2. Everything from the 2026-10-09 package is seeded as DRAFT ONLY
--    (published_md NULL). /sms-terms and /ai-trust therefore 404 until someone
--    publishes them, which is correct: those pages do not exist yet.
--
-- draft_md is seeded empty and populated by scripts/import-legal-docs.mjs,
-- which reads the real files. Pasting 44KB of attorney-review markdown into a
-- migration would make the document's own history unreadable and would freeze a
-- copy that drifts the moment counsel sends edits.

insert into public.legal_documents (slug, title, eyebrow, summary, category, source_file, sort_order)
values
  ('privacy', 'Privacy Policy', 'Legal',
   'How personal information is collected, used, retained and deleted.',
   'public', 'Steward_Legal_Trust_Package_UPDATED_2026-10-09/01_Privacy_Policy_DRAFT.md', 10),

  ('terms', 'Terms of Service', 'Legal',
   'The agreement between the user and Stewardship Blueprint, LLC.',
   'public', 'Steward_Legal_Trust_Package_UPDATED_2026-10-09/02_Terms_of_Service_DRAFT.md', 20),

  ('sms-terms', 'SMS Messaging Terms', 'Legal',
   'The two optional SMS programs, their consent and how to stop them.',
   'public', 'Steward_Legal_Trust_Package_UPDATED_2026-10-09/03_SMS_Messaging_Terms_DRAFT.md', 30),

  ('ai-trust', 'AI & Trust Notice', 'Trust',
   'What Steward''s AI does, what it remembers and who can see it.',
   'public', 'Steward_Legal_Trust_Package_UPDATED_2026-10-09/04_AI_Trust_Notice_DRAFT.md', 40),

  ('sig-separation', 'SIG Separation & Conflict Policy', 'Internal',
   'Operational controls keeping Steward and Strategic Income Group separate. INTERNAL — never published.',
   'internal', 'Steward_Legal_Trust_Package_UPDATED_2026-10-09/05_SIG_Separation_and_Conflict_Policy_INTERNAL.md', 50),

  ('launch-compliance', 'Launch Compliance Checklist', 'Internal',
   'Pre-launch blockers, workstreams and unresolved decisions. INTERNAL.',
   'internal', 'Steward_Legal_Trust_Package_UPDATED_2026-10-09/06_Launch_Compliance_Checklist.md', 60),

  ('contact-decisions', 'Website & Contact Decisions', 'Internal',
   'Operating entity, address, inbox routing and publication paths. INTERNAL.',
   'internal', 'Steward_Legal_Trust_Package_UPDATED_2026-10-09/00_README_Contact_Decisions.md', 70),

  ('consent-copy', 'Account & Consent Copy', 'UI copy',
   'Registration, SMS consent, sharing and checkout wording used inside the app.',
   'ui_copy', 'Steward_Legal_Trust_Package_UPDATED_2026-10-09/07_Account_and_Consent_Copy.md', 80)
on conflict (slug) do nothing;
