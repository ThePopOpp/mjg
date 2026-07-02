// Frontend Edits — data layer for page edit-requests (cms_page_notes).
// Service-role admin client behind the Super-Admin API guard (like the rest of
// the CMS data layer). See docs/features/frontend-page-editor-portable.md.

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ElementDescriptor } from "@/components/cms/frontend-overlay";

export type PageNoteStatus = "open" | "in_progress" | "done" | "archived";
export type PageNote = {
  id: string;
  page_slug: string;
  page_label: string | null;
  page_url: string | null;
  element_ref: string;
  element_type: string | null;
  element_label: string | null;
  heading_text: string | null;
  dom_selector: string | null;
  bounding_box: unknown;
  descriptor: unknown;
  note: string;
  change_type: string;
  priority: string;
  status: PageNoteStatus;
  created_by: string | null;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

const COLUMNS =
  "id, page_slug, page_label, page_url, element_ref, element_type, element_label, heading_text, dom_selector, bounding_box, descriptor, note, change_type, priority, status, created_by, created_by_email, created_at, updated_at";

export async function listPageNotes(pageSlug?: string): Promise<PageNote[]> {
  const sb = createSupabaseAdminClient();
  let q = sb.from("cms_page_notes").select(COLUMNS).order("created_at", { ascending: false }).limit(500);
  if (pageSlug) q = q.eq("page_slug", pageSlug);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as PageNote[];
}

export type CreatePageNoteInput = {
  pageSlug: string;
  pageLabel?: string | null;
  pageUrl?: string | null;
  descriptor: ElementDescriptor;
  note: string;
  changeType?: string;
  priority?: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
};

export async function createPageNote(input: CreatePageNoteInput): Promise<PageNote> {
  const sb = createSupabaseAdminClient();
  const d = input.descriptor;
  const { data, error } = await sb
    .from("cms_page_notes")
    .insert({
      page_slug: input.pageSlug,
      page_label: input.pageLabel ?? null,
      page_url: input.pageUrl ?? null,
      element_ref: d.element_ref,
      element_type: d.element_type,
      element_label: d.element_label,
      heading_text: d.heading_text,
      dom_selector: d.dom_selector,
      bounding_box: d.bounding_box,
      descriptor: d,
      note: input.note,
      change_type: input.changeType || "edit",
      priority: input.priority || "medium",
      created_by: input.actorUserId ?? null,
      created_by_email: input.actorEmail ?? null,
    })
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as PageNote;
}

export async function updatePageNote(
  id: string,
  patch: Partial<Pick<PageNote, "note" | "change_type" | "priority" | "status">>,
): Promise<PageNote> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("cms_page_notes")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as PageNote;
}

export async function deletePageNote(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("cms_page_notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
