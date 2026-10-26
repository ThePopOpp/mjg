import { upsertDevRequest } from "@/lib/dev-requests/repository";
import type { ToolDef } from "./types";

// Asking for new features or fixes. A dev request lands in the queue Claude
// Code works from (dev_requests; `npm run dev:requests`) — this is how "build a
// new dashboard feature" enters the pipeline. list_dev_requests and
// update_dev_request_status already exist (Shepherd's tools).

const create: ToolDef = {
  name: "dev_request_create",
  title: "Request a feature or fix",
  description:
    "Files a development request for the MJG app (new dashboard feature, page component, bug fix, integration). Describe the goal, who it's for, and what 'done' looks like. It is picked up by the developer/coding agent; nothing changes in the app by itself.",
  domain: "dev",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string", maxLength: 160 },
      details: { type: "string", description: "What to build or fix, why, and acceptance criteria." },
      page: { type: "string", description: "Page or area it concerns, e.g. /dashboard/sms or /contact." },
      kind: { type: "string", enum: ["feature", "bug", "content", "integration", "design", "other"] },
      priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
    },
    required: ["title", "details"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { title: string; details: string; page?: string; kind?: string; priority?: "low" | "medium" | "high" | "urgent" }, ctx) =>
    upsertDevRequest({
      sourceType: "manual",
      title: a.title,
      body: a.details,
      pageTarget: a.page ?? null,
      requestKind: a.kind ?? "feature",
      priority: a.priority ?? "medium",
      metadata: { via: ctx.via, requestedBy: ctx.actorEmail },
      actorUserId: ctx.actorId,
      actorEmail: ctx.actorEmail,
    }),
};

export const DEV_TOOLS: ToolDef[] = [create];
