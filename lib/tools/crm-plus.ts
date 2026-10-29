import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createBooking, loadBookingTypes, updateBooking } from "@/lib/booking/data";
import { loadCardForEdit, saveCard } from "@/lib/business-cards/data";
import type { SaveCardPayload } from "@/lib/business-cards/types";
import { getLiveRecord, softDelete } from "@/lib/mcp/records";
import type { ToolDef } from "./types";

// CRM gaps from the expansion plan §2.1: merging contacts, bookings, business
// cards and form submissions. Deletes are in lib/tools/trash.ts.

// ── Contacts ────────────────────────────────────────────────────────────────

const CONTACT_FILL = [
  "type", "status", "first_name", "last_name", "email", "phone", "profile_photo_url", "company", "website", "church",
  "address_line_1", "address_line_2", "city", "state", "zip_code", "source", "list", "converted_to_participant_id",
  "converted_to_profile_id", "converted_at", "sms_opt_in", "email_opt_in",
] as const;

const blank = (v: unknown) => v === null || v === undefined || v === "";

/** What the kept contact looks like after taking `from`'s details: kept values win, blanks are filled. */
export function mergeContactRows(keep: Record<string, any>, from: Record<string, any>) {
  const patch: Record<string, unknown> = {};
  for (const k of CONTACT_FILL) if (blank(keep[k]) && !blank(from[k])) patch[k] = from[k];
  const tags = [...new Set([...(keep.tags ?? []), ...(from.tags ?? [])])];
  if (tags.length !== (keep.tags ?? []).length) patch.tags = tags;
  if (from.notes?.trim() && from.notes.trim() !== keep.notes?.trim()) {
    patch.notes = [keep.notes?.trim(), `Merged from ${[from.first_name, from.last_name].filter(Boolean).join(" ") || from.email || "contact"}:\n${from.notes.trim()}`]
      .filter(Boolean)
      .join("\n\n");
  }
  const custom = { ...(from.custom_fields ?? {}), ...(keep.custom_fields ?? {}) };
  if (Object.keys(custom).length !== Object.keys(keep.custom_fields ?? {}).length) patch.custom_fields = custom;
  return patch;
}

const contactsMerge: ToolDef = {
  name: "contacts_merge",
  title: "Merge two contacts",
  description:
    "Merges a duplicate contact into the one you keep: the kept contact's details win, its blanks are filled from the duplicate, tags and custom fields are combined, notes appended, and project links moved. The duplicate goes to the trash (restorable).",
  domain: "crm",
  inputSchema: {
    type: "object",
    properties: {
      keep_id: { type: "string", description: "The contact to keep." },
      merge_id: { type: "string", description: "The duplicate to fold in and trash." },
    },
    required: ["keep_id", "merge_id"],
  },
  risk: "high",
  minRole: "super_admin",
  record: { entity: "contact", id: (a: { keep_id: string }) => a.keep_id },
  summarize: () => "Merge the duplicate into the kept contact, then trash the duplicate",
  preview: async (a: { keep_id: string; merge_id: string }) => {
    if (a.keep_id === a.merge_id) throw new Error("Choose two different contacts.");
    const [keep, from] = await Promise.all([getLiveRecord("contact", a.keep_id), getLiveRecord("contact", a.merge_id)]);
    return { keep: `${keep.first_name ?? ""} ${keep.last_name ?? ""}`.trim() || keep.email, trash: `${from.first_name ?? ""} ${from.last_name ?? ""}`.trim() || from.email, changes: mergeContactRows(keep, from) };
  },
  run: async (a: { keep_id: string; merge_id: string }, ctx) => {
    if (a.keep_id === a.merge_id) throw new Error("Choose two different contacts.");
    const [keep, from] = await Promise.all([getLiveRecord("contact", a.keep_id), getLiveRecord("contact", a.merge_id)]);
    const supabase = createSupabaseAdminClient();
    const patch = mergeContactRows(keep, from);
    if (Object.keys(patch).length) {
      const { error } = await supabase.from("contacts").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", a.keep_id);
      if (error) throw error;
    }
    const { error: linkErr } = await supabase.from("project_item_links").update({ contact_id: a.keep_id }).eq("contact_id", a.merge_id);
    if (linkErr) throw linkErr;
    await softDelete("contact", a.merge_id, ctx.actorId);
    return { ok: true, kept: a.keep_id, trashed: a.merge_id, filled: Object.keys(patch) };
  },
};

// ── Bookings ────────────────────────────────────────────────────────────────

const BOOKING_ID = { type: "string", description: "Booking id (from list_bookings)." };

const bookingsCreate: ToolDef = {
  name: "bookings_create",
  title: "Book an appointment",
  description:
    "Books someone into a booking type (id from list_bookings) at a start time (ISO 8601). The end time comes from the type's length unless given. Refused if the slot overlaps another booking. No confirmation email is sent.",
  domain: "crm",
  inputSchema: {
    type: "object",
    properties: {
      booking_type_id: { type: "string" },
      start_at: { type: "string", description: "ISO 8601, e.g. 2026-11-04T16:00:00-07:00" },
      end_at: { type: "string" },
      invitee_name: { type: "string" },
      invitee_email: { type: "string" },
      invitee_phone: { type: "string" },
      status: { type: "string", enum: ["confirmed", "pending"] },
      location_details: { type: "string" },
    },
    required: ["booking_type_id", "start_at", "invitee_name"],
  },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "booking", id: (_a, r) => r?.id },
  run: async (a: { booking_type_id: string; start_at: string; end_at?: string; invitee_name: string; invitee_email?: string; invitee_phone?: string; status?: string; location_details?: string }) => {
    const type = (await loadBookingTypes()).find((t) => t.id === a.booking_type_id);
    if (!type) throw new Error("No such booking type.");
    const start = new Date(a.start_at);
    if (Number.isNaN(start.getTime())) throw new Error("start_at isn't a valid date and time.");
    const end = a.end_at ? new Date(a.end_at) : new Date(start.getTime() + type.duration_minutes * 60_000);
    if (Number.isNaN(end.getTime()) || end <= start) throw new Error("end_at must be after start_at.");
    return createBooking({
      booking_type_id: type.id,
      host_staff_id: type.host_staff_id,
      invitee_name: a.invitee_name,
      invitee_email: a.invitee_email ?? null,
      invitee_phone: a.invitee_phone ?? null,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      timezone: type.timezone,
      location_type: type.location_type,
      location_details: a.location_details ?? type.location_details,
      source: "mcp",
      status: a.status ?? "confirmed",
    });
  },
};

const bookingsUpdate: ToolDef = {
  name: "bookings_update",
  title: "Change a booking",
  description: "Changes a booking: start_at / end_at (reschedule), status (confirmed, pending, completed, no_show), invitee details, location details or internal notes. To cancel use bookings_cancel.",
  domain: "crm",
  inputSchema: {
    type: "object",
    properties: {
      id: BOOKING_ID,
      changes: {
        type: "object",
        properties: {
          start_at: { type: "string" },
          end_at: { type: "string" },
          status: { type: "string", enum: ["confirmed", "pending", "completed", "no_show"] },
          invitee_name: { type: "string" },
          invitee_email: { type: "string" },
          invitee_phone: { type: "string" },
          location_details: { type: "string" },
          internal_notes: { type: "string" },
        },
        additionalProperties: false,
      },
    },
    required: ["id", "changes"],
  },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "booking", id: (a: { id: string }) => a.id },
  run: async (a: { id: string; changes: Record<string, unknown> }) => {
    await getLiveRecord("booking", a.id);
    await updateBooking(a.id, a.changes);
    return { ok: true, id: a.id };
  },
};

const bookingsCancel: ToolDef = {
  name: "bookings_cancel",
  title: "Cancel a booking",
  description: "Cancels a booking (status canceled) with an optional reason, freeing the slot. The booking stays on record. No email is sent.",
  domain: "crm",
  inputSchema: { type: "object", properties: { id: BOOKING_ID, reason: { type: "string" } }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  record: { entity: "booking", id: (a: { id: string }) => a.id },
  summarize: () => "Cancel this booking",
  preview: async (a: { id: string; reason?: string }) => {
    const b = await getLiveRecord("booking", a.id);
    return { invitee: b.invitee_name, email: b.invitee_email, start: b.start_at, status: b.status, reason: a.reason ?? null };
  },
  run: async (a: { id: string; reason?: string }) => {
    await updateBooking(a.id, { status: "canceled", cancel_reason: a.reason ?? null });
    return { ok: true, id: a.id, status: "canceled" };
  },
};

// ── Business cards ──────────────────────────────────────────────────────────

const CARD_FIELDS = {
  type: "object",
  description:
    "Card fields: card_name, display_name, first_name, last_name, job_title, company_name, department, bio, primary_phone, sms_phone, primary_email, website_url, maps_url, profile_photo_url, logo_url, accent_color, background_color, text_color, theme_mode, layout_template, slug, staff_user_id (owner). Status changes use status: draft | unpublished | archived — publishing is done in the dashboard.",
};

/** A tool can't publish a card (that's a public page); it can only draft, unpublish or archive. */
function cleanCard(fields: Record<string, unknown>): SaveCardPayload {
  const { id: _id, sections: _s, links: _l, view_count: _v, click_count: _c, published_at: _p, is_public: _i, ...rest } = fields;
  if (rest.status === "published") throw new Error("Publishing a card makes it public — do that from the Business Cards screen.");
  return rest as SaveCardPayload;
}

const businessCardsCreate: ToolDef = {
  name: "business_cards_create",
  title: "Create a business card",
  description: "Creates a digital business card as a draft (not public) with the default sections. Owner defaults to you.",
  domain: "crm",
  inputSchema: { type: "object", properties: { fields: CARD_FIELDS }, required: ["fields"] },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "business_card", id: (_a, r) => r?.id },
  run: async (a: { fields: Record<string, unknown> }, ctx) => {
    const card = await saveCard({ status: "draft", ...cleanCard(a.fields) }, { ownerStaffId: ctx.actorId, isAdmin: true });
    return { id: card.id, slug: card.slug, status: card.status, card_name: card.card_name };
  },
};

const businessCardsUpdate: ToolDef = {
  name: "business_cards_update",
  title: "Edit a business card",
  description: "Changes a business card's fields (id from list_business_cards). Only pass what changes.",
  domain: "crm",
  inputSchema: { type: "object", properties: { id: { type: "string" }, fields: CARD_FIELDS }, required: ["id", "fields"] },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "business_card", id: (a: { id: string }) => a.id },
  run: async (a: { id: string; fields: Record<string, unknown> }, ctx) => {
    await getLiveRecord("business_card", a.id);
    const current = await loadCardForEdit(a.id);
    if (!current) throw new Error("No such business card.");
    const changes = cleanCard(a.fields);
    // saveCard rebuilds the slug and visibility from what it's given, so keep the current ones unless changed.
    const card = await saveCard(
      { id: a.id, slug: current.slug, status: current.status, is_public: current.is_public, ...changes },
      { ownerStaffId: ctx.actorId, isAdmin: true },
    );
    return { id: card.id, slug: card.slug, status: card.status, card_name: card.card_name };
  },
};

// ── Form submissions ────────────────────────────────────────────────────────

const formSubmissionUpdate: ToolDef = {
  name: "form_submission_update",
  title: "Handle a form submission",
  description:
    "Marks a website form submission handled (or back to received), assigns it to a team member (profile id), and/or hides or shows it in the dashboard list. Same as the Form Submissions screen's actions; deleting is form_submission_delete.",
  domain: "crm",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Submission id (from list_form_submissions)." },
      status: { type: "string", enum: ["received", "handled"] },
      assigned_to: { type: ["string", "null"] },
      visibility: { type: "string", enum: ["hide", "show"] },
      reason: { type: "string" },
    },
    required: ["id"],
  },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "form_submission", id: (a: { id: string }) => a.id },
  run: async (a: { id: string; status?: string; assigned_to?: string | null; visibility?: "hide" | "show"; reason?: string }, ctx) => {
    await getLiveRecord("form_submission", a.id);
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updated_at: now, actioned_by: ctx.actorId };
    if (a.status) patch.status = a.status;
    if (a.assigned_to !== undefined) patch.assigned_to = a.assigned_to;
    if (a.visibility === "hide") Object.assign(patch, { hidden_at: now, action_reason: a.reason ?? "hidden" });
    if (a.visibility === "show") Object.assign(patch, { hidden_at: null, removed_at: null, action_reason: a.reason ?? "shown" });
    if (a.reason && !a.visibility) patch.action_reason = a.reason;
    if (Object.keys(patch).length === 2) throw new Error("Nothing to change — pass status, assigned_to or visibility.");
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("form_submissions").update(patch).eq("id", a.id).select("id, status, assigned_to, hidden_at").single();
    if (error) throw error;
    return data;
  },
};

export const CRM_PLUS_TOOLS: ToolDef[] = [contactsMerge, bookingsCreate, bookingsUpdate, bookingsCancel, businessCardsCreate, businessCardsUpdate, formSubmissionUpdate];
