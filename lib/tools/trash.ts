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

export const TRASH_TOOLS: ToolDef[] = [trashList, restore, contactsDelete];
