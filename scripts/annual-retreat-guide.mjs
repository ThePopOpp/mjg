#!/usr/bin/env node
/**
 * Annual Retreat Guide files (private bucket `annual-retreat`, migration 202611260152).
 *
 * The public route /annual-retreat/guide always serves whichever file
 * annual_retreat_settings.guide_path names. Every version stays in the bucket.
 *
 * Usage:
 *   node scripts/annual-retreat-guide.mjs --status
 *   node scripts/annual-retreat-guide.mjs --upload <local.pdf> --as <bucket-file.pdf>
 *   node scripts/annual-retreat-guide.mjs --release <bucket-file.pdf> --version 1.1
 *
 * --upload only stores the file. --release switches what the page and emails
 * serve; run it only after Mike approves that exact file.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: join(root, ".env.local") });

const BUCKET = "annual-retreat";
const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

async function status() {
  const { data: settings } = await db.from("annual_retreat_settings").select("*").eq("id", 1).maybeSingle();
  const { data: files, error } = await db.storage.from(BUCKET).list("", { limit: 100 });
  if (error) throw error;
  console.log("Serving:", settings?.guide_path, `(v${settings?.guide_version})`, "as", settings?.guide_filename);
  console.log("Follow-ups enabled:", settings?.followups_enabled);
  console.log("Files in bucket:");
  for (const f of files ?? []) console.log(`  ${f.name}  ${f.metadata?.size ?? "?"} bytes  ${f.created_at ?? ""}`);
}

async function upload(local, as) {
  if (!/^[A-Za-z0-9._-]+\.pdf$/.test(as)) throw new Error("--as must be a plain .pdf file name.");
  const body = readFileSync(local);
  if (body.subarray(0, 5).toString() !== "%PDF-") throw new Error(`${local} is not a PDF.`);
  // Never overwrite: a released version must stay exactly as approved.
  const { error } = await db.storage.from(BUCKET).upload(as, body, { contentType: "application/pdf", upsert: false });
  if (error) throw error;
  console.log(`Uploaded ${local} → ${BUCKET}/${as} (${body.length} bytes). Not released; use --release after approval.`);
}

async function release(file, version) {
  if (!version || !/^\d+(\.\d+){0,2}$/.test(version)) throw new Error("--version is required, e.g. 1.1");
  const { data: files, error } = await db.storage.from(BUCKET).list("", { search: file });
  if (error) throw error;
  if (!(files ?? []).some((f) => f.name === file)) throw new Error(`${file} is not in the bucket. Upload it first.`);
  const { error: upErr } = await db
    .from("annual_retreat_settings")
    .update({ guide_path: file, guide_version: version, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (upErr) throw upErr;
  console.log(`Now serving ${file} as v${version}.`);
}

try {
  if (args.includes("--upload")) await upload(arg("--upload"), arg("--as"));
  else if (args.includes("--release")) await release(arg("--release"), arg("--version"));
  else await status();
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
