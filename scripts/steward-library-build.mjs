#!/usr/bin/env node
// Builds Steward's teaching library: the Steward V2 source documents, uploaded
// to an OpenAI vector store so Steward can search them the way a ChatGPT
// project searches its files.
//
//   node --env-file=.env.local scripts/steward-library-build.mjs <folder> [--label D0.7.3-R1]
//
// <folder> holds the documents (the package's PROPOSED_MASTERS folder). Every
// .md / .txt / .pdf / .docx in it is uploaded. The result is written to
// steward/library/manifest.json — store id, package label and a SHA-256 per
// file — which the app reads. Rebuilding makes a NEW store and a new manifest;
// the old store is left alone so a deployed build keeps working until the new
// manifest ships. Delete old stores from the OpenAI dashboard once unused.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join, extname } from "node:path";

const args = process.argv.slice(2);
const folder = args.find((a) => !a.startsWith("--"));
const label = args.includes("--label") ? args[args.indexOf("--label") + 1] : "unlabelled";
const key = process.env.OPENAI_API_KEY;

if (!folder) throw new Error("Usage: steward-library-build.mjs <folder> [--label X]");
if (!key || key.length < 60) throw new Error("OPENAI_API_KEY is missing or a placeholder.");

const API = "https://api.openai.com/v1";
const auth = { Authorization: `Bearer ${key}` };

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...auth, ...(init.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path}: ${res.status} ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

const files = readdirSync(folder)
  .filter((f) => [".md", ".txt", ".pdf", ".docx"].includes(extname(f).toLowerCase()))
  .sort();
if (!files.length) throw new Error(`No documents in ${folder}`);

const entries = [];
for (const name of files) {
  const bytes = readFileSync(join(folder, name));
  const form = new FormData();
  form.append("purpose", "assistants");
  form.append("file", new Blob([bytes]), basename(name));
  const uploaded = await api("/files", { method: "POST", body: form });
  entries.push({
    file: name,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    openai_file_id: uploaded.id,
  });
  console.log(`uploaded ${name} (${bytes.length} bytes)`);
}

const store = await api("/vector_stores", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    name: `steward-library-${label}`,
    file_ids: entries.map((e) => e.openai_file_id),
    metadata: { package: label },
  }),
});

// Indexing is asynchronous; wait so the manifest never points at a half-built store.
for (let i = 0; ; i++) {
  const s = await api(`/vector_stores/${store.id}`);
  const c = s.file_counts;
  if (c.in_progress === 0) {
    if (c.failed > 0) throw new Error(`${c.failed} file(s) failed to index in ${store.id}`);
    break;
  }
  if (i > 120) throw new Error(`Timed out waiting for ${store.id}`);
  await new Promise((r) => setTimeout(r, 5000));
}

const manifest = {
  label,
  vector_store_id: store.id,
  built_at: new Date().toISOString(),
  files: entries,
};
mkdirSync("steward/library", { recursive: true });
writeFileSync("steward/library/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nvector store ${store.id} ready — ${entries.length} files. Wrote steward/library/manifest.json`);
