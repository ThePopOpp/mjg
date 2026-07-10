import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DevRequestSource = "media_resource" | "cms_frontend_edit" | "cms_dashboard_edit" | "manual";
export type DevRequestStatus = "queued" | "in_progress" | "done" | "archived";

export type DevRequest = {
  id: string;
  source_type: DevRequestSource;
  source_id: string | null;
  title: string;
  body: string | null;
  file_url: string | null;
  page_target: string | null;
  request_kind: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: DevRequestStatus;
  steward_brief: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertDevRequestInput = {
  sourceType: DevRequestSource;
  sourceId?: string | null;
  title: string;
  body?: string | null;
  fileUrl?: string | null;
  pageTarget?: string | null;
  requestKind?: string | null;
  priority?: DevRequest["priority"];
  metadata?: Record<string, unknown>;
  actorUserId?: string | null;
  actorEmail?: string | null;
};

/**
 * Add (or refresh) a queue item flagged for Claude. Upserts on
 * (source_type, source_id) so re-sending the same resource/edit updates it in
 * place rather than duplicating. A brand-new send resets status to "queued".
 */
export async function upsertDevRequest(input: UpsertDevRequestInput): Promise<DevRequest> {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const base = {
    source_type: input.sourceType,
    source_id: input.sourceId ?? null,
    title: input.title.trim(),
    body: input.body?.trim() || null,
    file_url: input.fileUrl?.trim() || null,
    page_target: input.pageTarget?.trim() || null,
    request_kind: input.requestKind?.trim() || null,
    priority: input.priority ?? "medium",
    metadata: input.metadata ?? {},
    created_by_email: input.actorEmail ?? null,
    updated_at: now,
  };

  // Look for an existing queue row for this source item.
  let existing: { id: string } | null = null;
  if (input.sourceId) {
    const { data } = await supabase
      .from("dev_requests")
      .select("id")
      .eq("source_type", input.sourceType)
      .eq("source_id", input.sourceId)
      .maybeSingle();
    existing = data ?? null;
  }

  if (existing) {
    // Re-queue an item that was previously worked/done, but leave in_progress alone.
    const { data, error } = await supabase
      .from("dev_requests")
      .update({ ...base, status: "queued" })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as DevRequest;
  }

  const { data, error } = await supabase
    .from("dev_requests")
    .insert({ ...base, status: "queued", created_by: input.actorUserId ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data as DevRequest;
}

export async function listDevRequests(filter?: { status?: DevRequestStatus | "active" | "all"; limit?: number }): Promise<DevRequest[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("dev_requests").select("*").order("created_at", { ascending: false }).limit(filter?.limit ?? 100);

  const status = filter?.status ?? "active";
  if (status === "active") query = query.in("status", ["queued", "in_progress"]);
  else if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DevRequest[];
}

export async function updateDevRequestStatus(input: { id: string; status: DevRequestStatus; stewardBrief?: string | null }): Promise<DevRequest> {
  const supabase = createSupabaseAdminClient();
  const patch: Record<string, unknown> = { status: input.status, updated_at: new Date().toISOString() };
  if (input.stewardBrief !== undefined) patch.steward_brief = input.stewardBrief;

  const { data, error } = await supabase.from("dev_requests").update(patch).eq("id", input.id).select("*").single();
  if (error) throw error;
  return data as DevRequest;
}
