import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkLegalReadiness, type LegalIssue } from "./placeholders";

// Service-role data layer for legal documents. ONLY call the mutating functions
// from super-admin-guarded routes (requireSuperAdmin); RLS (is_super_admin) is
// the defense-in-depth backstop.
//
// The read used by the PUBLIC site — getPublishedLegalDocument — is deliberately
// in this same module and deliberately only ever selects `published_md` for
// category 'public'. That is the single place the public can reach legal
// content, and it cannot return a draft or an internal document even if a
// caller asks for one by slug.

export type LegalCategory = "public" | "internal" | "ui_copy";

export type LegalDocument = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  category: LegalCategory;
  draft_md: string;
  published_md: string | null;
  effective_date: string | null;
  has_unpublished_changes: boolean;
  published_at: string | null;
  source_file: string | null;
  sort_order: number;
  updated_at: string;
};

/** A document plus the publication checks, for the dashboard list and editor. */
export type LegalDocumentWithStatus = LegalDocument & {
  isPublished: boolean;
  /** 'public' documents only: the route this would serve at. */
  publicPath: string | null;
  readiness: {
    ready: boolean;
    reason: string | null;
    placeholderCount: number;
    draftMarkerCount: number;
    issues: LegalIssue[];
  };
};

const COLUMNS =
  "id, slug, title, eyebrow, summary, category, draft_md, published_md, effective_date, has_unpublished_changes, published_at, source_file, sort_order, updated_at";

function withStatus(row: LegalDocument): LegalDocumentWithStatus {
  const readiness = checkLegalReadiness(row.draft_md);
  return {
    ...row,
    isPublished: row.published_md !== null,
    publicPath: row.category === "public" ? `/${row.slug}` : null,
    readiness: {
      ready: readiness.ready,
      reason: readiness.reason,
      placeholderCount: readiness.placeholderCount,
      draftMarkerCount: readiness.draftMarkerCount,
      issues: readiness.issues,
    },
  };
}

export async function listLegalDocuments(): Promise<LegalDocumentWithStatus[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("legal_documents")
    .select(COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as LegalDocument[]).map(withStatus);
}

export async function getLegalDocument(id: string): Promise<LegalDocumentWithStatus | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("legal_documents").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? withStatus(data as LegalDocument) : null;
}

/**
 * The public site's only route into legal content.
 *
 * Returns null unless the document is category 'public' AND has been published.
 * An unpublished slug therefore 404s rather than leaking a draft, which is why
 * /sms-terms and /ai-trust do not exist until someone publishes them.
 */
export async function getPublishedLegalDocument(
  slug: string,
): Promise<{ title: string; eyebrow: string; body_md: string; effective_date: string | null } | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("legal_documents")
    .select("title, eyebrow, published_md, effective_date")
    .eq("slug", slug)
    .eq("category", "public")
    .not("published_md", "is", null)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.published_md) return null;
  return {
    title: data.title as string,
    eyebrow: data.eyebrow as string,
    body_md: data.published_md as string,
    effective_date: (data.effective_date as string | null) ?? null,
  };
}

/** Published public documents, for the /legal index and footer links. */
export async function listPublishedLegalDocuments(): Promise<
  Array<{ slug: string; title: string; summary: string; effective_date: string | null }>
> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("legal_documents")
    .select("slug, title, summary, effective_date")
    .eq("category", "public")
    .not("published_md", "is", null)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Array<{
    slug: string;
    title: string;
    summary: string;
    effective_date: string | null;
  }>;
}

async function recordVersion(
  documentId: string,
  body: string,
  effectiveDate: string | null,
  action: "saved" | "published" | "unpublished" | "restored",
  note: string,
  actorUserId?: string | null,
) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("legal_document_versions")
    .select("version_number")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(1);
  const next = ((data?.[0]?.version_number as number | undefined) ?? 0) + 1;

  const { error } = await supabase.from("legal_document_versions").insert({
    document_id: documentId,
    version_number: next,
    body_md: body,
    effective_date: effectiveDate,
    action,
    note,
    actor_id: actorUserId ?? null,
  });
  if (error) throw error;
}

/** Saves the draft. Never touches what the public is being served. */
export async function saveLegalDraft(
  id: string,
  input: { draft_md: string; effective_date?: string | null; title?: string; summary?: string },
  actorUserId?: string | null,
): Promise<LegalDocumentWithStatus> {
  const supabase = createSupabaseAdminClient();

  const patch: Record<string, unknown> = {
    draft_md: input.draft_md,
    has_unpublished_changes: true,
    updated_at: new Date().toISOString(),
    updated_by: actorUserId ?? null,
  };
  if (input.effective_date !== undefined) patch.effective_date = input.effective_date;
  if (input.title !== undefined) patch.title = input.title;
  if (input.summary !== undefined) patch.summary = input.summary;

  const { error } = await supabase.from("legal_documents").update(patch).eq("id", id);
  if (error) throw error;

  await recordVersion(id, input.draft_md, input.effective_date ?? null, "saved", "Draft saved", actorUserId);

  const doc = await getLegalDocument(id);
  if (!doc) throw new Error("Legal document disappeared while saving.");
  return doc;
}

export class LegalPublishBlocked extends Error {
  readonly issues: LegalIssue[];
  constructor(message: string, issues: LegalIssue[]) {
    super(message);
    this.name = "LegalPublishBlocked";
    this.issues = issues;
  }
}

/**
 * Promotes the draft to published.
 *
 * Refuses in three cases, all of them on purpose:
 *   - the document is not category 'public' (internal policies and UI copy have
 *     no public route, and publishing 05_SIG_Separation would be a disclosure
 *     incident, not a typo);
 *   - the draft still carries placeholders or draft markers;
 *   - there is no effective date, because every document in the package has an
 *     "Effective: [INSERT]" line that has to become a real date.
 */
export async function publishLegalDocument(
  id: string,
  actorUserId?: string | null,
): Promise<LegalDocumentWithStatus> {
  const doc = await getLegalDocument(id);
  if (!doc) throw new Error("Legal document not found.");

  if (doc.category !== "public") {
    throw new LegalPublishBlocked(
      `"${doc.title}" is ${doc.category === "internal" ? "an internal document" : "in-app copy"} and has no public page. It cannot be published.`,
      [],
    );
  }

  const readiness = checkLegalReadiness(doc.draft_md);
  if (!readiness.ready) {
    throw new LegalPublishBlocked(readiness.reason ?? "This document is not ready to publish.", readiness.issues);
  }

  if (!doc.effective_date) {
    throw new LegalPublishBlocked(
      "Set an effective date before publishing. Every document in the package ships with a placeholder effective date that has to become a real one.",
      [],
    );
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("legal_documents")
    .update({
      published_md: doc.draft_md,
      has_unpublished_changes: false,
      published_at: now,
      published_by: actorUserId ?? null,
      updated_at: now,
      updated_by: actorUserId ?? null,
    })
    .eq("id", id);
  if (error) throw error;

  await recordVersion(id, doc.draft_md, doc.effective_date, "published", `Published at ${doc.publicPath}`, actorUserId);

  const updated = await getLegalDocument(id);
  if (!updated) throw new Error("Legal document disappeared while publishing.");
  return updated;
}

/**
 * Withdraws a published document, so its route 404s again.
 *
 * Refused for /privacy and /terms: both are required to be publicly reachable
 * by the A2P 10DLC campaign registration, and taking them down would break SMS
 * compliance rather than just hide a page. Replace the wording instead.
 */
const UNPUBLISH_PROTECTED = new Set(["privacy", "terms"]);

export async function unpublishLegalDocument(
  id: string,
  actorUserId?: string | null,
): Promise<LegalDocumentWithStatus> {
  const doc = await getLegalDocument(id);
  if (!doc) throw new Error("Legal document not found.");

  if (UNPUBLISH_PROTECTED.has(doc.slug)) {
    throw new LegalPublishBlocked(
      `${doc.title} has to stay publicly reachable — the A2P 10DLC campaign registration points at ${doc.publicPath}. Edit and republish it instead of taking it down.`,
      [],
    );
  }
  if (!doc.published_md) {
    throw new LegalPublishBlocked(`${doc.title} is not published.`, []);
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("legal_documents")
    .update({
      published_md: null,
      has_unpublished_changes: true,
      published_at: null,
      updated_at: now,
      updated_by: actorUserId ?? null,
    })
    .eq("id", id);
  if (error) throw error;

  await recordVersion(id, doc.published_md, doc.effective_date, "unpublished", "Withdrawn from the public site", actorUserId);

  const updated = await getLegalDocument(id);
  if (!updated) throw new Error("Legal document disappeared while unpublishing.");
  return updated;
}

export type LegalVersion = {
  id: string;
  version_number: number;
  body_md: string;
  effective_date: string | null;
  action: string;
  note: string;
  created_at: string;
};

export async function listLegalVersions(documentId: string, limit = 30): Promise<LegalVersion[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("legal_document_versions")
    .select("id, version_number, body_md, effective_date, action, note, created_at")
    .eq("document_id", documentId)
    .order("version_number", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as LegalVersion[];
}

/** Copies an old version back into the draft. Never publishes it. */
export async function restoreLegalVersion(
  documentId: string,
  versionId: string,
  actorUserId?: string | null,
): Promise<LegalDocumentWithStatus> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("legal_document_versions")
    .select("version_number, body_md, effective_date")
    .eq("id", versionId)
    .eq("document_id", documentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("That version does not belong to this document.");

  const { error: updateError } = await supabase
    .from("legal_documents")
    .update({
      draft_md: data.body_md as string,
      has_unpublished_changes: true,
      updated_at: new Date().toISOString(),
      updated_by: actorUserId ?? null,
    })
    .eq("id", documentId);
  if (updateError) throw updateError;

  await recordVersion(
    documentId,
    data.body_md as string,
    (data.effective_date as string | null) ?? null,
    "restored",
    `Restored into the draft from v${data.version_number}`,
    actorUserId,
  );

  const doc = await getLegalDocument(documentId);
  if (!doc) throw new Error("Legal document disappeared while restoring.");
  return doc;
}
