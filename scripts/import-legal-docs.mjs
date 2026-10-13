#!/usr/bin/env node
/**
 * Loads the legal document markdown on disk into public.legal_documents.
 *
 * Migration 202610130102 creates one row per document but leaves the bodies
 * empty on purpose: pasting 44KB of attorney-review markdown into a migration
 * would make that file unreadable and would freeze a copy that drifts the
 * moment counsel sends edits. This script is the import step.
 *
 * What goes where, and why it differs per document:
 *
 *   draft_md      <- the 2026-10-09 package file for every document. These are
 *                    marked "ATTORNEY REVIEW DRAFT" and carry unresolved
 *                    [BRACKETED] placeholders, so they are drafts, full stop.
 *
 *   published_md  <- ONLY for privacy and terms, and ONLY from the existing
 *                    docs/legal/MJG-*-A2P-10DLC.md files. Those are the
 *                    documents Twilio's A2P 10DLC campaign review approved and
 *                    the ones /privacy and /terms serve today. Seeding them as
 *                    published is what makes this import a no-op for the public
 *                    site: nothing the public sees changes.
 *
 * Re-running is safe. A body is only written when the stored copy differs, and
 * published_md is never touched after the first import unless --force is passed.
 *
 * Usage:
 *   node scripts/import-legal-docs.mjs            # import / refresh drafts
 *   node scripts/import-legal-docs.mjs --dry-run  # report what would change
 *   node scripts/import-legal-docs.mjs --force    # also re-seed published_md
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
dotenv.config({ path: join(root, ".env.local") });
dotenv.config({ path: join(root, ".env") });

const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set (looked in .env.local and .env).");
  process.exit(1);
}

const PKG = "docs/legal/Steward_Legal_Trust_Package_UPDATED_2026-10-09";

/** slug -> { draft: <package file>, published?: <currently live file> } */
const SOURCES = {
  privacy: {
    draft: `${PKG}/01_Privacy_Policy_DRAFT.md`,
    published: "docs/legal/MJG-Privacy-Policy-A2P-10DLC.md",
  },
  terms: {
    draft: `${PKG}/02_Terms_of_Service_DRAFT.md`,
    published: "docs/legal/MJG-Terms-of-Service-A2P-10DLC.md",
  },
  "sms-terms": { draft: `${PKG}/03_SMS_Messaging_Terms_DRAFT.md` },
  "ai-trust": { draft: `${PKG}/04_AI_Trust_Notice_DRAFT.md` },
  "sig-separation": { draft: `${PKG}/05_SIG_Separation_and_Conflict_Policy_INTERNAL.md` },
  "launch-compliance": { draft: `${PKG}/06_Launch_Compliance_Checklist.md` },
  "contact-decisions": { draft: `${PKG}/00_README_Contact_Decisions.md` },
  "consent-copy": { draft: `${PKG}/07_Account_and_Consent_Copy.md` },
};

function read(rel) {
  // Strip a BOM: it survives into the rendered page as a stray character.
  return readFileSync(join(root, rel), "utf8").replace(/^﻿/, "");
}

/** "**Effective Date:** July 20, 2026" -> 2026-07-20, or null when unparseable. */
function parseEffectiveDate(md) {
  const m = md.match(/^\*\*(?:Effective Date|Effective|Last Updated):\*\*\s*(.+)$/im);
  if (!m) return null;
  const raw = m[1].trim().replace(/\*/g, "");
  // The package ships "[INSERT ON PUBLICATION]" — not a date, and inventing one
  // would be worse than leaving the field empty.
  if (/^\[/.test(raw)) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

const client = new pg.Client({ connectionString });
await client.connect();

let changed = 0;
let skipped = 0;

try {
  await client.query("begin");

  for (const [slug, src] of Object.entries(SOURCES)) {
    const { rows } = await client.query(
      "select id, draft_md, published_md, effective_date from public.legal_documents where slug = $1",
      [slug],
    );
    if (rows.length === 0) {
      console.log(`  !  ${slug.padEnd(18)} no row — run npm run db:migrate first`);
      continue;
    }
    const row = rows[0];
    const draft = read(src.draft);

    const draftChanged = row.draft_md !== draft;
    const seedPublished = Boolean(src.published) && (force || row.published_md === null);

    if (!draftChanged && !seedPublished) {
      skipped++;
      console.log(`  =  ${slug.padEnd(18)} unchanged`);
      continue;
    }

    if (dryRun) {
      const what = [draftChanged ? "draft" : null, seedPublished ? "published" : null]
        .filter(Boolean)
        .join(" + ");
      console.log(`  ~  ${slug.padEnd(18)} would update ${what}`);
      changed++;
      continue;
    }

    if (draftChanged) {
      await client.query(
        `update public.legal_documents
            set draft_md = $2, has_unpublished_changes = true, updated_at = now()
          where id = $1`,
        [row.id, draft],
      );
      await nextVersion(row.id, draft, null, "imported", `Imported from ${src.draft}`);
    }

    if (seedPublished) {
      const live = read(src.published);
      const effective = parseEffectiveDate(live);
      await client.query(
        `update public.legal_documents
            set published_md = $2,
                effective_date = coalesce($3::date, effective_date),
                published_at = coalesce(published_at, now()),
                updated_at = now()
          where id = $1`,
        [row.id, live, effective],
      );
      await nextVersion(
        row.id,
        live,
        effective,
        "published",
        `Seeded from the live A2P 10DLC document ${src.published}`,
      );
    }

    changed++;
    const what = [draftChanged ? "draft" : null, seedPublished ? "published" : null]
      .filter(Boolean)
      .join(" + ");
    console.log(`  ok ${slug.padEnd(18)} ${what}`);
  }

  if (dryRun) {
    await client.query("rollback");
    console.log(`\nDry run: ${changed} would change, ${skipped} unchanged. Nothing written.`);
  } else {
    await client.query("commit");
    console.log(`\n${changed} document(s) updated, ${skipped} unchanged.`);
  }
} catch (err) {
  await client.query("rollback").catch(() => {});
  console.error("\nImport failed, rolled back:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

async function nextVersion(documentId, body, effective, action, note) {
  await client.query(
    `insert into public.legal_document_versions
       (document_id, version_number, body_md, effective_date, action, note)
     select $1,
            coalesce(max(version_number), 0) + 1,
            $2, $3::date, $4, $5
       from public.legal_document_versions where document_id = $1`,
    [documentId, body, effective, action, note],
  );
}
