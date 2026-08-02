import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EMPTY_DOC, extractPlainText, type WorkspaceScope, type WorkspaceDocListItem, type WorkspaceFolder, type WorkspaceDocument } from "./types";

function personName(p: any): string | null {
  if (!p) return null;
  return p.full_name || `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.email || null;
}

export const DEFAULT_WORKSPACE_ID = "11111111-1111-1111-1111-111111111111";
export type WorkspaceSpace = { id: string; name: string; icon: string | null };

export async function listWorkspaces(): Promise<WorkspaceSpace[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("workspaces").select("id,name,icon").order("created_at", { ascending: true });
  return (data ?? []) as WorkspaceSpace[];
}

export async function createWorkspace(name: string, profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("workspaces")
    .insert({ name: name.trim() || "Untitled workspace", created_by: profileId })
    .select("id,name,icon")
    .single();
  if (error) throw error;
  return data as WorkspaceSpace;
}

export async function listFolders(profileId: string, workspaceId?: string): Promise<WorkspaceFolder[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("workspace_folders")
    .select("id,name,scope,owner_id,parent_id,created_at")
    .is("archived_at", null)
    .or(`scope.eq.shared,and(scope.eq.personal,owner_id.eq.${profileId})`)
    .order("name", { ascending: true });
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  const { data } = await query;
  return (data ?? []) as WorkspaceFolder[];
}

export async function createFolder(input: { name: string; scope: WorkspaceScope; parentId?: string | null; workspaceId?: string | null }, profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("workspace_folders")
    .insert({ name: input.name.trim() || "Untitled folder", scope: input.scope, owner_id: input.scope === "personal" ? profileId : null, parent_id: input.parentId || null, workspace_id: input.workspaceId || DEFAULT_WORKSPACE_ID, created_by: profileId })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export async function listDocuments(profileId: string, workspaceId?: string): Promise<{ mine: WorkspaceDocListItem[]; shared: WorkspaceDocListItem[] }> {
  const supabase = createSupabaseAdminClient();
  let docsQuery = supabase
    .from("workspace_documents")
    .select("id,title,description,scope,folder_id,owner_id,status,updated_at, folder:workspace_folders(name), owner:profiles!workspace_documents_owner_id_fkey(full_name,first_name,last_name,email), updater:profiles!workspace_documents_updated_by_fkey(full_name,first_name,last_name,email)")
    .is("deleted_at", null)
    .neq("status", "archived")
    .order("updated_at", { ascending: false })
    .limit(300);
  if (workspaceId) docsQuery = docsQuery.eq("workspace_id", workspaceId);
  const [{ data: docs }, { data: favs }, { data: collabDocs }] = await Promise.all([
    docsQuery,
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

export async function createDocument(input: { title?: string; scope: WorkspaceScope; folderId?: string | null; content?: unknown; workspaceId?: string | null }, profileId: string) {
  const supabase = createSupabaseAdminClient();
  const content = input.content ?? EMPTY_DOC;
  const { data, error } = await supabase
    .from("workspace_documents")
    .insert({
      title: input.title?.trim() || "Untitled",
      scope: input.scope,
      folder_id: input.folderId || null,
      workspace_id: input.workspaceId || DEFAULT_WORKSPACE_ID,
      owner_id: profileId,
      content_json: content,
      plain_text: extractPlainText(content),
      created_by: profileId,
      updated_by: profileId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export type SearchResult = { id: string; title: string; folder_name: string | null; scope: string; updated_at: string; snippet: string | null };

/** Search accessible documents by title or body text. */
export async function searchDocuments(profileId: string, q: string): Promise<SearchResult[]> {
  const term = q.trim();
  if (!term) return [];
  const supabase = createSupabaseAdminClient();
  const like = `%${term.replace(/[%_]/g, "")}%`;
  const { data } = await supabase
    .from("workspace_documents")
    .select("id,title,plain_text,scope,owner_id,updated_at, folder:workspace_folders(name)")
    .is("deleted_at", null)
    .or(`title.ilike.${like},plain_text.ilike.${like}`)
    .order("updated_at", { ascending: false })
    .limit(40);

  const results: SearchResult[] = [];
  for (const d of data ?? []) {
    if (d.scope === "personal" && d.owner_id !== profileId) continue; // only my personal + all shared
    const text: string = d.plain_text ?? "";
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    const snippet = idx >= 0 ? `${idx > 20 ? "…" : ""}${text.slice(Math.max(0, idx - 20), idx + 80)}…` : text.slice(0, 90) || null;
    results.push({ id: d.id, title: d.title, folder_name: (d as any).folder?.name ?? null, scope: d.scope, updated_at: d.updated_at, snippet });
  }
  return results;
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

export type WorkspaceCollaborator = { id: string; user_id: string; name: string; email: string | null; permission: string };
export type ShareableUser = { id: string; name: string; email: string | null };

/** Collaborators on a document + the pool of users that can be added. */
export async function getSharing(documentId: string): Promise<{ collaborators: WorkspaceCollaborator[]; users: ShareableUser[] }> {
  const supabase = createSupabaseAdminClient();
  const [{ data: collab }, { data: people }] = await Promise.all([
    supabase
      .from("workspace_collaborators")
      .select("id, user_id, permission, user:profiles!workspace_collaborators_user_id_fkey(full_name,first_name,last_name,email)")
      .eq("document_id", documentId),
    supabase.from("profiles").select("id,full_name,first_name,last_name,email").eq("status", "active").order("full_name", { ascending: true }).limit(300),
  ]);
  const collaborators: WorkspaceCollaborator[] = (collab ?? []).map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    name: personName(c.user) || "Unknown",
    email: c.user?.email ?? null,
    permission: c.permission,
  }));
  const users: ShareableUser[] = (people ?? []).map((p: any) => ({ id: p.id, name: personName(p) || "Unknown", email: p.email ?? null }));
  return { collaborators, users };
}

export async function addCollaborator(documentId: string, userId: string, invitedBy: string, permission = "editor") {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("workspace_collaborators")
    .upsert({ document_id: documentId, user_id: userId, permission, invited_by: invitedBy }, { onConflict: "document_id,user_id" });
  if (error) throw error;
  return { documentId, userId };
}

export async function removeCollaborator(documentId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("workspace_collaborators").delete().eq("document_id", documentId).eq("user_id", userId);
  if (error) throw error;
  return { documentId, userId };
}

export async function listHiddenTemplateIds(): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("workspace_hidden_templates").select("template_id");
  return (data ?? []).map((r: any) => r.template_id as string);
}

export async function hideTemplate(templateId: string, profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("workspace_hidden_templates").upsert({ template_id: templateId, hidden_by: profileId }, { onConflict: "template_id" });
  if (error) throw error;
  return { templateId };
}

export async function unhideTemplate(templateId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("workspace_hidden_templates").delete().eq("template_id", templateId);
  if (error) throw error;
  return { templateId };
}

export async function listFavoriteTemplateIds(userId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("workspace_template_favorites").select("template_id").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.template_id as string);
}

export async function favoriteTemplate(userId: string, templateId: string, on: boolean) {
  const supabase = createSupabaseAdminClient();
  if (on) await supabase.from("workspace_template_favorites").upsert({ user_id: userId, template_id: templateId }, { onConflict: "user_id,template_id" });
  else await supabase.from("workspace_template_favorites").delete().eq("user_id", userId).eq("template_id", templateId);
  return { templateId, favorite: on };
}

export async function toggleFavorite(userId: string, documentId: string, on: boolean) {
  const supabase = createSupabaseAdminClient();
  if (on) await supabase.from("workspace_favorites").upsert({ user_id: userId, document_id: documentId });
  else await supabase.from("workspace_favorites").delete().eq("user_id", userId).eq("document_id", documentId);
  return { documentId, favorite: on };
}
