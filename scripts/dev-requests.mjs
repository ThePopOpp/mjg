#!/usr/bin/env node
/**
 * Read the Dev Request Queue — items the team flagged for Claude to implement
 * (via "Send to Claude" on Media Studio resources and CMS edit requests).
 *
 * Usage:
 *   node scripts/dev-requests.mjs            # active items (queued + in progress)
 *   node scripts/dev-requests.mjs all        # every item
 *   node scripts/dev-requests.mjs queued     # a specific status
 *   node scripts/dev-requests.mjs --json     # raw JSON (add anywhere)
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: join(root, ".env.local") });
dotenv.config({ path: join(root, ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✖ DATABASE_URL is not set (checked .env.local and .env).");
  process.exit(1);
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const statusArg = args.find((a) => !a.startsWith("--")) || "active";

const SOURCE_LABEL = {
  media_resource: "Media resource",
  cms_frontend_edit: "CMS frontend edit",
  cms_dashboard_edit: "CMS dashboard edit",
  manual: "Manual",
};

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

function whereForStatus(status) {
  if (status === "all") return { clause: "", params: [] };
  if (status === "active") return { clause: "where status in ('queued','in_progress')", params: [] };
  return { clause: "where status = $1", params: [status] };
}

async function main() {
  await client.connect();
  const { clause, params } = whereForStatus(statusArg);
  const { rows } = await client.query(
    `select id, source_type, source_id, title, body, file_url, page_target, request_kind,
            priority, status, created_by_email, created_at
       from public.dev_requests ${clause}
       order by
         case status when 'in_progress' then 0 when 'queued' then 1 when 'done' then 2 else 3 end,
         case priority when 'urgent' then 0 when 'high' then 1 when 'medium' then 2 else 3 end,
         created_at desc`,
    params,
  );

  if (asJson) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (!rows.length) {
    console.log(`No dev requests with status "${statusArg}".`);
    return;
  }

  console.log(`Dev Request Queue — ${rows.length} item(s) [${statusArg}]\n`);
  for (const r of rows) {
    const src = SOURCE_LABEL[r.source_type] || r.source_type;
    console.log(`── [${r.status.toUpperCase()}] ${r.title}`);
    console.log(`   ${src}${r.request_kind ? ` · ${r.request_kind}` : ""} · priority: ${r.priority}`);
    if (r.page_target) console.log(`   page: ${r.page_target}`);
    if (r.file_url) console.log(`   file: ${r.file_url}`);
    if (r.body) console.log(`   note: ${String(r.body).replace(/\s+/g, " ").slice(0, 400)}`);
    console.log(`   id: ${r.id}  ·  by ${r.created_by_email || "—"}  ·  ${new Date(r.created_at).toISOString().slice(0, 16).replace("T", " ")}`);
    console.log("");
  }
}

main()
  .catch((err) => {
    console.error(`✖ ${err.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
