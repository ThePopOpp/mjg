#!/usr/bin/env node
/**
 * Direct Supabase migration runner.
 *
 * Applies every supabase/migrations/*.sql file that hasn't been recorded yet,
 * in filename order, each inside its own transaction, using the DATABASE_URL
 * from .env.local. A `_mjg_migrations` table tracks what's been applied so each
 * file runs exactly once.
 *
 * Usage:
 *   node scripts/apply-migrations.mjs           # apply pending migrations
 *   node scripts/apply-migrations.mjs --status  # list applied vs pending, no changes
 *   node scripts/apply-migrations.mjs --check    # connectivity test only (read-only)
 *   node scripts/apply-migrations.mjs --baseline # mark all current files applied WITHOUT running them
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");

dotenv.config({ path: join(root, ".env.local") });
dotenv.config({ path: join(root, ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✖ DATABASE_URL is not set (checked .env.local and .env).");
  process.exit(1);
}

const mode =
  process.argv.includes("--status") ? "status"
  : process.argv.includes("--check") ? "check"
  : process.argv.includes("--baseline") ? "baseline"
  : "apply";

// Supabase requires TLS; the cert chain isn't in Node's default store, so don't verify.
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

function migrationFiles() {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

function checksum(sql) {
  return createHash("sha256").update(sql).digest("hex").slice(0, 16);
}

async function ensureTable() {
  await client.query(`
    create table if not exists public._mjg_migrations (
      filename text primary key,
      checksum text not null,
      applied_at timestamptz not null default now()
    );
  `);
}

async function appliedSet() {
  const { rows } = await client.query("select filename from public._mjg_migrations");
  return new Set(rows.map((r) => r.filename));
}

async function main() {
  await client.connect();

  if (mode === "check") {
    const { rows } = await client.query("select current_database() as db, current_user as usr, now() as at");
    console.log(`✓ Connected to "${rows[0].db}" as "${rows[0].usr}" at ${rows[0].at.toISOString()}`);
    // Show tracking state if the table already exists.
    const { rows: exists } = await client.query(
      "select to_regclass('public._mjg_migrations') is not null as has_table",
    );
    if (exists[0].has_table) {
      const applied = await appliedSet();
      console.log(`  _mjg_migrations table present — ${applied.size} migration(s) recorded.`);
    } else {
      console.log("  _mjg_migrations table not created yet (first run with --apply will create it).");
    }
    return;
  }

  await ensureTable();
  const applied = await appliedSet();
  const files = migrationFiles();
  const pending = files.filter((f) => !applied.has(f));

  if (mode === "status") {
    console.log(`Migrations: ${files.length} total, ${applied.size} applied, ${pending.length} pending.\n`);
    for (const f of files) console.log(`  ${applied.has(f) ? "✓ applied " : "• pending "} ${f}`);
    return;
  }

  if (mode === "baseline") {
    for (const f of pending) {
      const sql = readFileSync(join(migrationsDir, f), "utf8");
      await client.query(
        "insert into public._mjg_migrations (filename, checksum) values ($1, $2) on conflict (filename) do nothing",
        [f, checksum(sql)],
      );
    }
    console.log(`✓ Baselined ${pending.length} migration(s) as applied (no SQL executed).`);
    return;
  }

  if (!pending.length) {
    console.log(`✓ Up to date — ${applied.size} migration(s) already applied, nothing pending.`);
    return;
  }

  console.log(`Applying ${pending.length} pending migration(s)...\n`);
  for (const f of pending) {
    const sql = readFileSync(join(migrationsDir, f), "utf8");
    process.stdout.write(`  → ${f} ... `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into public._mjg_migrations (filename, checksum) values ($1, $2)",
        [f, checksum(sql)],
      );
      await client.query("commit");
      console.log("done");
    } catch (err) {
      await client.query("rollback");
      console.log("FAILED");
      console.error(`\n✖ ${f} failed and was rolled back:\n${err.message}\n`);
      process.exitCode = 1;
      return;
    }
  }
  console.log(`\n✓ Applied ${pending.length} migration(s).`);
}

main()
  .catch((err) => {
    console.error(`✖ ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
