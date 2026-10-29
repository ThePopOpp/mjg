import { getLiveRecord, getEntity, listTrash, restoreRecord, softDelete, trashableEntities } from "@/lib/mcp/records";
import type { ToolDef } from "./types";

// Soft delete through the connector: delete tools move a record to the trash
// (deleted_at), mjg_trash_list shows what's there, mjg_restore brings it back.
// Nothing is ever hard-deleted through MCP; a Super Admin purges from the
// dashboard. Each entity's delete tool lives here, built by trashDeleteTool.

const ENTITY_PARAM = {
  type: "string",
  enum: trashableEntities(),
  description: "The kind of record.",
};

const trashList: ToolDef = {
  name: "mjg_trash_list",
  title: "Trash",
  description: "Records deleted through the connector that can still be restored (newest first): what it was, who deleted it and when.",
  domain: "core",
  inputSchema: {
    type: "object",
    properties: {
      entity: ENTITY_PARAM,
      limit: { type: "integer", minimum: 1, maximum: 200, description: "How many (default 50)." },
    },
  },
  risk: "read",
  minRole: "super_admin",
  run: (args: { entity?: string; limit?: number }) => listTrash(args.entity, args.limit),
};

const restore: ToolDef = {
  name: "mjg_restore",
  title: "Restore from trash",
  description: "Brings a deleted record back exactly as it was (entity and id from mjg_trash_list).",
  domain: "core",
  inputSchema: {
    type: "object",
    properties: { entity: ENTITY_PARAM, id: { type: "string" } },
    required: ["entity", "id"],
  },
  risk: "write",
  minRole: "super_admin",
  record: { entity: (a: { entity: string }) => a.entity, id: (a: { id: string }) => a.id },
  run: (args: { entity: string; id: string }) => restoreRecord(args.entity, args.id),
};

/** A soft-delete tool for one trashable entity: high risk, previews the record first. */
function trashDeleteTool(input: { entity: string; name: string; title: string; description: string; domain: ToolDef["domain"] }): ToolDef {
  const { entity } = input;
  return {
    name: input.name,
    title: input.title,
    description: `${input.description} It goes to the trash and can be restored with mjg_restore.`,
    domain: input.domain,
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    risk: "high",
    minRole: "super_admin",
    record: { entity, id: (a: { id: string }) => a.id },
    summarize: (a: { id: string }) => `Move ${entity} ${a.id} to the trash (restorable)`,
    preview: async (a: { id: string }) => {
      const row = await getLiveRecord(entity, a.id);
      return { [entity]: getEntity(entity).label(row), id: row.id, restorable: true };
    },
    run: (a: { id: string }, ctx) => softDelete(entity, a.id, ctx.actorId),
  };
}

const contactsDelete = trashDeleteTool({
  entity: "contact",
  name: "contacts_delete",
  title: "Delete a contact",
  description: "Deletes a contact/lead (id from list_contacts).",
  domain: "crm",
});

const participantsArchive = trashDeleteTool({
  entity: "participant",
  name: "participants_archive",
  title: "Archive a participant",
  description: "Archives a pilot participant (id from search_participants): they disappear from lists, reports and every send (journeys, experiences, broadcasts). Their history is kept.",
  domain: "people",
});

const tagsDelete = trashDeleteTool({
  entity: "tag",
  name: "tags_delete",
  title: "Delete a tag",
  description: "Deletes a participant tag (id from list_tags); it stops showing on everyone tagged with it.",
  domain: "people",
});

const groupDelete = trashDeleteTool({
  entity: "facilitator_group",
  name: "group_delete",
  title: "Delete a group listing",
  description: "Deletes a Find a Group listing (id from groups_list) — it disappears from the site and the dashboard. To just take it down, use group_set_status closed or archived.",
  domain: "people",
});

const socialPostDelete = trashDeleteTool({
  entity: "social_post",
  name: "social_post_delete",
  title: "Delete a social post",
  description: "Deletes a social post (id from list_social_posts); a scheduled one won't publish. Doesn't remove anything already posted on the platform.",
  domain: "social",
});

const socialTemplateDelete = trashDeleteTool({
  entity: "social_template",
  name: "social_template_delete",
  title: "Delete a social template",
  description: "Deletes a social post template (id from list_social_templates). Automations using it stop finding it — check list_social_templates' automations first.",
  domain: "social",
});

const mediaDelete = trashDeleteTool({
  entity: "media_asset",
  name: "media_delete",
  title: "Delete a media asset",
  description: "Deletes a Media Studio asset (id from list_media_assets); it disappears from the library and public pages. The stored file is kept.",
  domain: "media",
});

const smsTemplateDelete = trashDeleteTool({
  entity: "sms_template",
  name: "sms_template_delete",
  title: "Delete an SMS template",
  description: "Deletes an SMS template (id from sms_list_templates).",
  domain: "sms",
});

const projectItemDelete = trashDeleteTool({
  entity: "project_item",
  name: "project_item_delete",
  title: "Delete a Project Manager item",
  description: "Deletes a Project Manager item — project, phase, task or milestone (id from list_project_items).",
  domain: "ops",
});

const businessCardsDelete = trashDeleteTool({
  entity: "business_card",
  name: "business_cards_delete",
  title: "Delete a business card",
  description: "Deletes a digital business card (id from list_business_cards); its public page stops working.",
  domain: "crm",
});

const formSubmissionDelete = trashDeleteTool({
  entity: "form_submission",
  name: "form_submission_delete",
  title: "Delete a form submission",
  description: "Deletes a website form submission (id from list_form_submissions) — same as Delete on the Form Submissions screen.",
  domain: "crm",
});

export const TRASH_TOOLS: ToolDef[] = [
  trashList,
  restore,
  contactsDelete,
  participantsArchive,
  tagsDelete,
  groupDelete,
  socialPostDelete,
  socialTemplateDelete,
  mediaDelete,
  smsTemplateDelete,
  projectItemDelete,
  businessCardsDelete,
  formSubmissionDelete,
];
