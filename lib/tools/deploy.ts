import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createIssue, latestCommit, listOpenPullRequests } from "@/lib/deploy/github";
import { appStatus, recentDeployments, triggerDeploy } from "@/lib/deploy/coolify";
import type { ToolContext, ToolDef } from "./types";

// Building and shipping from Claude (P6). A feature request becomes a GitHub
// issue; handed to Claude Code (the GitHub Action), it comes back as a pull
// request for a person to review and merge. Deploying runs a Coolify build of
// main — high risk, and people only (the "deploy" domain is never granted to
// agent tokens). GitHub and Coolify credentials stay on the server.

async function linkDevRequest(devRequestId: string, issue: { number: number; url: string }) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("dev_requests").select("metadata").eq("id", devRequestId).maybeSingle();
  if (!data) throw new Error("Dev request not found.");
  await supabase
    .from("dev_requests")
    .update({ metadata: { ...(data.metadata ?? {}), github_issue: issue.number, github_url: issue.url }, status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", devRequestId);
}

function peopleOnly(ctx: ToolContext) {
  if (ctx.tokenKind === "agent") throw new Error("Only a person can do this.");
}

const createIssueTool: ToolDef = {
  name: "github_create_issue",
  title: "File a GitHub issue",
  description:
    "Creates an issue in the MJG GitHub repo. With hand_to_claude, Claude Code (GitHub Action) picks it up and opens a pull request for review — nothing reaches the live site until a person merges and deploys. Optionally links a dev request (dev_request_id) and marks it in progress.",
  domain: "dev",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", maxLength: 200 },
      body: { type: "string", description: "What to build or fix, why, and acceptance criteria (markdown)." },
      hand_to_claude: { type: "boolean", description: "Ask Claude Code to implement it as a pull request." },
      labels: { type: "array", items: { type: "string" } },
      dev_request_id: { type: "string" },
    },
    required: ["title", "body"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { title: string; body: string; hand_to_claude?: boolean; labels?: string[]; dev_request_id?: string }, ctx) => {
    const body = [
      a.body,
      "",
      `_Filed from Claude by ${ctx.actorEmail} via the MJG connector._`,
      ...(a.hand_to_claude
        ? ["", "@claude please implement this as a pull request. Follow the repo's conventions, keep the change focused, run `npx tsc --noEmit` and the relevant `npm run test:*`, and explain what you changed and how to verify it."]
        : []),
    ].join("\n");
    const issue = await createIssue({ title: a.title, body, labels: a.labels });
    if (a.dev_request_id) await linkDevRequest(a.dev_request_id, issue);
    return { ...issue, handedToClaude: Boolean(a.hand_to_claude) };
  },
};

const prs: ToolDef = {
  name: "github_pull_requests",
  title: "Open pull requests",
  description: "Open pull requests in the MJG repo (including ones Claude Code opened), newest first.",
  domain: "dev",
  inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 50 } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { limit?: number }) => listOpenPullRequests(a.limit ?? 20),
};

const status: ToolDef = {
  name: "deploy_status",
  title: "Site deploy status",
  description: "The live app's status in Coolify, its recent deployments, and the latest commit on main (what a deploy would ship).",
  domain: "deploy",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async (_a, ctx) => {
    peopleOnly(ctx);
    const [app, deployments, main] = await Promise.all([
      appStatus(),
      recentDeployments(5).catch((e) => ({ error: String(e) })),
      latestCommit("main").catch((e) => ({ error: String(e) })),
    ]);
    return { app, deployments, latestOnMain: main };
  },
};

const deploy: ToolDef = {
  name: "deploy_trigger",
  title: "Deploy the site",
  description: "Builds and deploys the latest main branch to the live site in Coolify (a few minutes; the site stays up while it builds).",
  domain: "deploy",
  inputSchema: { type: "object", properties: { force: { type: "boolean", description: "Rebuild without cache." } } },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { force?: boolean }) => `Deploy main to the live site${a.force ? " (clean rebuild)" : ""}`,
  preview: async (_a, ctx) => {
    peopleOnly(ctx);
    const [app, main] = await Promise.all([appStatus(), latestCommit("main").catch((e) => ({ error: String(e) }))]);
    return { app, willDeploy: main };
  },
  run: async (a: { force?: boolean }, ctx) => {
    peopleOnly(ctx);
    return triggerDeploy(Boolean(a.force));
  },
};

export const DEPLOY_TOOLS: ToolDef[] = [createIssueTool, prs, status, deploy];
