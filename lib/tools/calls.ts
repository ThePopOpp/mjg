import { getCall, listCalls, transcribeCall, updateCall } from "@/lib/twilio/calls";
import type { ToolDef } from "./types";

// Phone calls (Twilio Voice): the call log, one call with its recording and
// transcript, notes, and transcribing a recording. Placing calls from Claude
// is a later phase.

const list: ToolDef = {
  name: "calls_list",
  title: "Call log",
  description: "Recent calls (newest first): direction, numbers, who it was, status, duration, voicemail, transcript status and cost.",
  domain: "calls",
  inputSchema: {
    type: "object",
    properties: {
      limit: { type: "integer", minimum: 1, maximum: 100 },
      offset: { type: "integer", minimum: 0 },
      direction: { type: "string", enum: ["inbound", "outbound"] },
      voicemail_only: { type: "boolean" },
    },
  },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { limit?: number; offset?: number; direction?: string; voicemail_only?: boolean }) =>
    listCalls({ limit: a.limit ?? 25, offset: a.offset, direction: a.direction, voicemailOnly: a.voicemail_only }),
};

const get: ToolDef = {
  name: "calls_get",
  title: "One call",
  description: "One call's details, recording links, voicemail and transcripts.",
  domain: "calls",
  inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => getCall(a.id),
};

const notes: ToolDef = {
  name: "calls_update",
  title: "Add notes to a call",
  description: "Saves notes (and optionally a status) on a call.",
  domain: "calls",
  inputSchema: { type: "object", properties: { id: { type: "string" }, notes: { type: "string" }, status: { type: "string" } }, required: ["id"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; notes?: string; status?: string }) => updateCall(a.id, { notes: a.notes, status: a.status }),
};

const transcribe: ToolDef = {
  name: "calls_transcribe",
  title: "Transcribe a call",
  description: "Transcribes a call's recording or voicemail and saves the text on the call.",
  domain: "calls",
  inputSchema: { type: "object", properties: { id: { type: "string" }, target: { type: "string", enum: ["recording", "voicemail"] } }, required: ["id"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; target?: "recording" | "voicemail" }) => transcribeCall(a.id, a.target ?? "recording"),
};

export const CALL_TOOLS: ToolDef[] = [list, get, notes, transcribe];
