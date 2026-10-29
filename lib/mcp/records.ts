import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// The records MCP tools change, for two jobs:
//   • before/after snapshots in the audit log (mcp_tool_calls.before / after),
//   • soft delete, the trash and restore — nothing deleted through the
//     connector is gone for good; a Super Admin purges from the dashboard.
//
// An entity is TRASHABLE only once every reader of its table skips rows with
// deleted_at set. Add `trash` here in the same change as those reader filters,
// never before — otherwise a "deleted" record keeps showing up in the app.

export type RecordEntity = {
  table: string;
  /** Short human name for a row, for previews and the trash list. */
  label: (row: Record<string, any>) => string;
  /** Set when the entity can be soft-deleted and restored. */
  trash?: { deleteTool: string };
};

const personName = (r: Record<string, any>) =>
  [r.first_name, r.last_name].filter(Boolean).join(" ") || r.email || r.phone || r.id;

export const RECORD_ENTITIES: Record<string, RecordEntity> = {
  contact: { table: "contacts", label: personName, trash: { deleteTool: "contacts_delete" } },
};

export function getEntity(entity: string): RecordEntity {
  const def = RECORD_ENTITIES[entity];
  if (!def) throw new Error(`Unknown record type "${entity}".`);
  return def;
}

export function trashableEntities(): string[] {
  return Object.entries(RECORD_ENTITIES)
    .filter(([, def]) => def.trash)
    .map(([key]) => key);
}

/** The row as it is now (deleted or not), or null. Used for audit snapshots. */
export async function snapshotRecord(entity: string, id: string): Promise<Record<string, unknown> | null> {
  const def = RECORD_ENTITIES[entity];
  if (!def || !id) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from(def.table).select("*").eq("id", id).maybeSingle();
  return (data as Record<string, unknown> | null) ?? null;
}

function trashTable(entity: string): string {
  const def = getEntity(entity);
  if (!def.trash) throw new Error(`${entity} records can't be deleted through the connector.`);
  return def.table;
}

/** A live (not deleted) record, or an error naming what's wrong. */
export async function getLiveRecord(entity: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(trashTable(entity)).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`No ${entity} with id ${id}.`);
  if (data.deleted_at) throw new Error(`That ${entity} is already in the trash.`);
  return data as Record<string, any>;
}

export async function softDelete(entity: string, id: string, actorId: string) {
  await getLiveRecord(entity, id);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(trashTable(entity))
    .update({ deleted_at: new Date().toISOString(), deleted_by: actorId })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`That ${entity} was already deleted.`);
  return { ok: true, entity, id, restore: `mjg_restore with entity "${entity}" and id "${id}"` };
}

export async function restoreRecord(entity: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from(trashTable(entity))
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", id)
    .not("deleted_at", "is", null)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`No ${entity} with id ${id} is in the trash.`);
  return { ok: true, entity, id, name: getEntity(entity).label(data) };
}

export async function listTrash(entity?: string, limit = 50) {
  const entities = entity ? [entity] : trashableEntities();
  const supabase = createSupabaseAdminClient();
  const groups = await Promise.all(
    entities.map(async (key) => {
      const { data, error } = await supabase
        .from(trashTable(key))
        .select(`*, deleter:profiles!${getEntity(key).table}_deleted_by_fkey(email)`)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []).map((row: Record<string, any>) => ({
        entity: key,
        id: row.id as string,
        name: getEntity(key).label(row),
        deleted_at: row.deleted_at as string,
        deleted_by: (row.deleter as { email?: string } | null)?.email ?? null,
      }));
    }),
  );
  return groups.flat().sort((a, b) => b.deleted_at.localeCompare(a.deleted_at)).slice(0, limit);
}

/** Of these (entity, id) pairs, which are in the trash right now. Keys are "entity:id". */
export async function inTrash(pairs: { entity: string; id: string }[]): Promise<Set<string>> {
  const out = new Set<string>();
  const byEntity = new Map<string, string[]>();
  for (const p of pairs) if (RECORD_ENTITIES[p.entity]?.trash) byEntity.set(p.entity, [...(byEntity.get(p.entity) ?? []), p.id]);
  const supabase = createSupabaseAdminClient();
  for (const [entity, ids] of byEntity) {
    const { data } = await supabase.from(getEntity(entity).table).select("id").in("id", ids).not("deleted_at", "is", null);
    for (const row of data ?? []) out.add(`${entity}:${row.id}`);
  }
  return out;
}
