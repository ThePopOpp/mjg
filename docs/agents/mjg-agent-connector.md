# Connecting agents to MJG (Paperclip · Hermes · OpenClaw)

MJG is the source of truth. Agents don't get database access or app secrets —
they connect to the **MJG connector** (the same MCP server Claude uses) with an
**agent token**, take tasks from MJG's queue, do the work with the MJG tools
their token allows, and report back. People stay in charge:

- every agent action is logged under the agent's name (Dashboard → Claude & Agents → Recent activity);
- an agent's **high-risk** actions (publishing, mass sends, deletes, refunds…) never run directly — they wait in **Waiting for your approval** until a person approves;
- **deploying** to the live site is people-only — no agent token can be granted it;
- any agent can be **paused** (every call refused) or **disconnected** instantly.

Naming: the internal operator agent is **Shepherd**. **Steward** is the member
product (the Eve agent in `steward/`) and is never connected here.

## 1. Issue a token

Dashboard → **Claude & Agents** → **New agent token**. Name it after the agent
(e.g. `Hermes — Scribe`), switch on only the areas it needs (read or write),
set an expiry, and copy the token — it's shown once. It acts on behalf of the
Super Admin who created it.

Suggested starting scopes (least privilege — widen only when needed):

| Agent | Areas |
|---|---|
| Paperclip (manager) | Agent tasks: write · everything else: read |
| Scribe (content) | Marketing content, Blog, Media: write · Website: read |
| Outreach (marketing) | Email, Social: write · SMS, Participants: read |
| Concierge (support) | Contacts/CRM, Calls: write · SMS, Email: read |
| Builder (website) | Website, Marketing content: write · Dev requests: write |
| Guide (member journey) | Projects & operations: write · Participants: read |
| Guardian (QA) | read only, all areas |

"Agent tasks" (`agent`) is required for any agent that takes work from the queue.

## 2. Connect the harness

Every harness that speaks MCP over HTTP connects the same way:

- **URL:** `https://mcp.michaeljgauthier.com/mcp` (Streamable HTTP)
- **Header:** `Authorization: Bearer <agent token>`

Configure it per each project's own documentation (Paperclip, Hermes and
OpenClaw each have their MCP-server settings). Keep the token in the harness's
secret store / Coolify env, e.g. `MJG_MCP_URL` and `MJG_AGENT_TOKEN`.

Model providers (OpenAI, Anthropic, xAI, …) are configured in the harness, not
in MJG — routing through OpenRouter keeps that to one key.

## 3. The work loop

```
agent_task_next                → claims the next task (yours first, then unassigned; by priority)
  … do the work with MJG tools (mjg_search_tools finds them) …
agent_task_report {status: "in_progress", message}   → progress notes, as often as useful
agent_task_report {status: "needs_review" | "done" | "failed", result, result_data}
```

- `needs_review` hands it to a person, who **Accepts**, **Sends back** (requeue) or **Cancels** it (dashboard or Claude: `agent_task_resolve`).
- A high-risk tool returns `status: "awaiting_approval"` — report that in the task and move on; don't retry.
- People create tasks from Claude ("give Scribe a task to draft next week's blog post …" → `agent_task_create`), and Paperclip can create tasks for other agents with an `agent:write` token.

## 4. Running on Coolify

Run each harness as its **own Coolify resource** in the MJG project — never
inside the web app container (the site went down once from that coupling):

- internal network only; give a UI a domain only if it has its own login;
- persistent volumes for state (`PAPERCLIP_DATA_DIR`, `HERMES_HOME`, …);
- only the secrets that agent needs: its MJG token and its model key — never
  `COOLIFY_API_TOKEN`, `GITHUB_TOKEN`, Supabase or Stripe keys;
- size CPU/RAM for browser-driving harnesses (OpenClaw) and sandbox them;
- heartbeats / scheduled runs as Coolify scheduled tasks or the harness's own scheduler.
