import { getFinderSettings, listAllGroups, listReservations, setFinderSettings, setGroupStatus, updateGroup } from "@/lib/facilitator-groups/repository";
import { addGroupMember, decideReservation } from "@/lib/facilitator-groups/reservations";
import { commitFacilitatorImport, previewFacilitatorImport } from "@/lib/facilitator-groups/import";
import type { FinderMode, GroupInput } from "@/lib/facilitator-groups/shared";
import type { ToolContext, ToolDef } from "./types";

// Find a Group: facilitator listings, their rosters, the launch switch and the facilitator
// import. Same lib functions as the dashboard (Facilitators & Groups / Facilitator Listing).

const actor = (ctx: ToolContext) => ({ id: ctx.actorId, role: ctx.role });
const GROUP_ID = { type: "string", description: "Group id (from groups_list)." };

const groupsList: ToolDef = {
  name: "groups_list",
  title: "Find a Group listings",
  description: "Every facilitator group (draft, published, closed) with schedule, area, capacity, confirmed spots and pending requests.",
  domain: "people",
  inputSchema: { type: "object", properties: { status: { type: "string", enum: ["draft", "published", "closed"] } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { status?: string }) => {
    const groups = await listAllGroups();
    return groups
      .filter((g) => !a.status || g.status === a.status)
      .map((g) => ({
        id: g.id, slug: g.slug, title: g.title, status: g.status, facilitator: g.facilitatorName,
        day: g.meetingDay, time: g.meetingTime, timezone: g.timezone, frequency: g.frequency, startDate: g.startDate,
        format: g.format, city: g.city, state: g.state, capacity: g.capacity, confirmed: g.spotsTaken,
        pending: g.pendingCount, waitlist: g.waitlistCount, bookingMode: g.bookingMode, url: `/groups/${g.slug}`,
      }));
  },
};

const groupRoster: ToolDef = {
  name: "group_roster",
  title: "A group's people",
  description: "Everyone who requested, joined, is waitlisted for, or left a group, with status and party size.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: GROUP_ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }, ctx) => listReservations(actor(ctx), a.id),
};

const groupUpdate: ToolDef = {
  name: "group_update",
  title: "Edit a group listing",
  description:
    "Changes a group's details. Fields: title, description, audience (men|women|couples|mixed|youth), meetingDay (0=Sun…6=Sat), meetingTime (HH:MM 24h), timezone, frequency (weekly|biweekly), startDate (YYYY-MM-DD), durationWeeks, format (in_person|online|hybrid), venueName, addressLine, city, state, postalCode, showExactAddress, capacity, bookingMode (auto|approval). Address changes re-geocode.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: GROUP_ID, changes: { type: "object" } }, required: ["id", "changes"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; changes: Partial<GroupInput> }, ctx) => updateGroup(actor(ctx), a.id, a.changes),
};

const groupSetStatus: ToolDef = {
  name: "group_set_status",
  title: "Publish or close a group",
  description: "Publishes a group on Find a Group (status published), takes it down (closed), returns it to draft, or archives it.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: GROUP_ID, status: { type: "string", enum: ["published", "closed", "draft", "archived"] } }, required: ["id", "status"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { status: string }) => (a.status === "published" ? "Publish this group on Find a Group" : `Set this group to ${a.status}`),
  run: async (a: { id: string; status: "published" | "closed" | "draft" | "archived" }, ctx) => setGroupStatus(actor(ctx), a.id, a.status),
};

const groupDecide: ToolDef = {
  name: "group_reservation_decide",
  title: "Approve or decline a spot request",
  description: "Confirms (takes a spot — checks room), declines, or removes (cancel) one reservation. The person is emailed.",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: { reservation_id: { type: "string" }, decision: { type: "string", enum: ["confirm", "decline", "cancel"] } },
    required: ["reservation_id", "decision"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { reservation_id: string; decision: "confirm" | "decline" | "cancel" }, ctx) => decideReservation(actor(ctx), a.reservation_id, a.decision),
};

const groupAddMember: ToolDef = {
  name: "group_add_member",
  title: "Add someone to a group",
  description: "Adds a person (by email) to a group as confirmed — takes a spot and puts them on the facilitator's team.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: GROUP_ID, email: { type: "string" }, name: { type: "string" }, party_size: { type: "integer", minimum: 1, maximum: 4 } }, required: ["id", "email"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; email: string; name?: string; party_size?: number }, ctx) =>
    addGroupMember(actor(ctx), a.id, { email: a.email, name: a.name, partySize: a.party_size }),
};

const finderGet: ToolDef = {
  name: "group_finder_status",
  title: "Find a Group launch status",
  description: "Whether Find a Group is hidden, in preview (browse only) or open (requests + messages), and the 'opens' label.",
  domain: "people",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => getFinderSettings(),
};

const finderSet: ToolDef = {
  name: "group_finder_set_mode",
  title: "Open or close Find a Group",
  description: "Sets Find a Group to hidden, preview (browse only) or open (people can request spots and message facilitators).",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: { mode: { type: "string", enum: ["hidden", "preview", "open"] }, opens_label: { type: "string", description: "Shown to visitors, e.g. 'January 5'." } },
    required: ["mode"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { mode: string }) => `Set Find a Group to ${a.mode}`,
  preview: async (a: { mode: string; opens_label?: string }) => ({ current: await getFinderSettings(), next: { mode: a.mode, opensLabel: a.opens_label ?? null } }),
  run: async (a: { mode: FinderMode; opens_label?: string }, ctx) => setFinderSettings(ctx.actorId, a.mode, a.opens_label ?? null),
};

const facilitatorImport: ToolDef = {
  name: "facilitators_import",
  title: "Import facilitators (CSV)",
  description:
    "Invites facilitators from CSV text (columns: First Name, Last Name, Email required; Phone, Church, City, State, Group Title, Day, Time, Capacity, Format, Start Date optional). Existing facilitators get their listing details filled; other existing accounts are skipped. send_at schedules the invitations.",
  domain: "people",
  inputSchema: { type: "object", properties: { csv: { type: "string" }, send_at: { type: "string", description: "ISO date-time to send invitations later; omit to send now." } }, required: ["csv"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Import these facilitators and send their invitations",
  preview: async (a: { csv: string }) => {
    const { rows } = await previewFacilitatorImport(a.csv);
    return {
      invite: rows.filter((r) => r.action === "invite").length,
      update: rows.filter((r) => r.action === "update").length,
      skip: rows.filter((r) => r.action === "skip").map((r) => ({ line: r.line, email: r.email, why: r.error ?? r.notes.join(" ") })),
    };
  },
  run: async (a: { csv: string; send_at?: string }, ctx) => commitFacilitatorImport(a.csv, ctx.actorId, { sendAt: a.send_at ?? null }),
};

export const GROUP_TOOLS: ToolDef[] = [groupsList, groupRoster, groupUpdate, groupSetStatus, groupDecide, groupAddMember, finderGet, finderSet, facilitatorImport];
