import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EMPTY_DOC, extractPlainText, type WorkspaceScope, type WorkspaceDocListItem, type WorkspaceFolder, type WorkspaceDocument } from "./types";

function personName(p: any): string | null {
  if (!p) return null;
  return p.full_name || `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.email || null;
}

export async function listFolders(profileId: string): Promise<WorkspaceFolder[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("workspace_folders")
    .select("id,name,scope,owner_id,parent_id,created_at")
    .is("archived_at", null)
    .or(`scope.eq.shared,and(scope.eq.personal,owner_id.eq.${profileId})`)
    .order("name", { ascending: true });
  return (data ?? []) as WorkspaceFolder[];
}

export async function createFolder(input: { name: string; scope: WorkspaceScope; parentId?: string | null }, profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("workspace_folders")
    .insert({ name: input.name.trim() || "Untitled folder", scope: input.scope, owner_id: input.scope === "personal" ? profileId : null, parent_id: input.parentId || null, created_by: profileId })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export async function listDocuments(profileId: string): Promise<{ mine: WorkspaceDocListItem[]; shared: WorkspaceDocListItem[] }> {
  const supabase = createSupabaseAdminClient();
  const [{ data: docs }, { data: favs }, { data: collabDocs }] = await Promise.all([
    supabase
      .from("workspace_documents")
      .select("id,title,description,scope,folder_id,owner_id,status,updated_at, folder:workspace_folders(name), owner:profiles!workspace_documents_owner_id_fkey(full_name,first_name,last_name,email), updater:profiles!workspace_documents_updated_by_fkey(full_name,first_name,last_name,email)")
      .is("deleted_at", null)
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
      .limit(300),
    supabase.from("workspace_favorites").select("document_id").eq("user_id", profileId),
    supabase.from("workspace_collaborators").select("document_id").eq("user_id", profileId),
  ]);

  const favSet = new Set((favs ?? []).map((f: any) => f.document_id));
  const collabSet = new Set((collabDocs ?? []).map((c: any) => c.document_id));

  const map = (d: any): WorkspaceDocListItem => ({
    id: d.id,
    title: d.title,
    description: d.description,
    scope: d.scope,
    folder_id: d.folder_id,
    folder_name: d.folder?.name ?? null,
    owner_id: d.owner_id,
    owner_name: personName(d.owner),
    status: d.status,
    updated_at: d.updated_at,
    updated_by_name: personName(d.updater),
    is_favorite: favSet.has(d.id),
  });

  const mine: WorkspaceDocListItem[] = [];
  const shared: WorkspaceDocListItem[] = [];
  for (const d of docs ?? []) {
    if (d.scope === "personal" && d.owner_id === profileId) mine.push(map(d));
    else if (d.scope === "shared") shared.push(map(d));
    else if (collabSet.has(d.id)) shared.push(map(d)); // personal doc shared with me
  }
  return { mine, shared };
}

/** Load a document if the actor may access it (owner, shared scope, or collaborator). */
export async function getDocument(id: string, profileId: string): Promise<WorkspaceDocument | null> {
  const supabase = createSupabaseAdminClient();
  const { data: doc } = await supabase.from("workspace_documents").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (!doc) return null;
  if (doc.scope === "personal" && doc.owner_id !== profileId) {
    const { data: collab } = await supabase.from("workspace_collaborators").select("id").eq("document_id", id).eq("user_id", profileId).maybeSingle();
    if (!collab) return null;
  }
  return doc as WorkspaceDocument;
}

export async function createDocument(input: { title?: string; scope: WorkspaceScope; folderId?: string | null }, profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("workspace_documents")
    .insert({
      title: input.title?.trim() || "Untitled",
      scope: input.scope,
      folder_id: input.folderId || null,
      owner_id: profileId,
      content_json: EMPTY_DOC,
      plain_text: "",
      created_by: profileId,
      updated_by: profileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export async function updateDocument(
  id: string,
  input: { title?: string; content?: unknown; folderId?: string | null; scope?: WorkspaceScope; status?: string },
  profileId: string,
) {
  const supabase = createSupabaseAdminClient();
  const patch: Record<string, unknown> = { updated_by: profileId, updated_at: new Date().toISOString() };
  if (typeof input.title === "string" && input.title.trim()) patch.title = input.title.trim();
  if (input.content !== undefined) {
    patch.content_json = input.content;
    patch.plain_text = extractPlainText(input.content);
  }
  if (input.folderId !== undefined) patch.folder_id = input.folderId || null;
  if (input.scope) patch.scope = input.scope;
  if (input.status) {
    patch.status = input.status;
    patch.archived_at = input.status === "archived" ? new Date().toISOString() : null;
  }
  const { error } = await supabase.from("workspace_documents").update(patch).eq("id", id);
  if (error) throw error;
  return { id };
}

export async function deleteDocument(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("workspace_documents").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  return { id };
}

export async function toggleFavorite(userId: string, documentId: string, on: boolean) {
  const supabase = createSupabaseAdminClient();
  if (on) await supabase.from("workspace_favorites").upsert({ user_id: userId, document_id: documentId });
  else await supabase.from("workspace_favorites").delete().eq("user_id", userId).eq("document_id", documentId);
  return { documentId, favorite: on };
}
