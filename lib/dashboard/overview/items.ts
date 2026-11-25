import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPersonalNotification } from "@/lib/notifications/personal";

// Personal To-Do, Reminder, Note and Voice memo items (migration 202611260150).
// Every function is scoped to one owner; callers pass the signed-in profile id.

export type ItemKind = "todo" | "reminder" | "note" | "recording";
export const ITEM_KINDS: ItemKind[] = ["todo", "reminder", "note", "recording"];
export const RECORDINGS_BUCKET = "dashboard-private";

export type PersonalItem = {
  id: string;
  kind: ItemKind;
  title: string;
  body: string;
  dueAt: string | null;
  doneAt: string | null;
  audioUrl: string | null;
  durationS: number | null;
  position: number;
  createdAt: string;
};

type Row = {
  id: string;
  kind: ItemKind;
  title: string;
  body: string;
  due_at: string | null;
  done_at: string | null;
  audio_path: string | null;
  duration_s: number | null;
  position: number;
  created_at: string;
};

const COLS = "id, kind, title, body, due_at, done_at, audio_path, duration_s, position, created_at";

async function toItems(rows: Row[]): Promise<PersonalItem[]> {
  const supabase = createSupabaseAdminClient();
  const paths = rows.map((r) => r.audio_path).filter((p): p is string => !!p);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabase.storage.from(RECORDINGS_BUCKET).createSignedUrls(paths, 60 * 60);
    for (const d of data ?? []) if (d.path && d.signedUrl) urls.set(d.path, d.signedUrl);
  }
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    dueAt: r.due_at,
    doneAt: r.done_at,
    audioUrl: r.audio_path ? urls.get(r.audio_path) ?? null : null,
    durationS: r.duration_s,
    position: r.position,
    createdAt: r.created_at,
  }));
}

export async function listItems(profileId: string, kinds: ItemKind[] = ITEM_KINDS): Promise<PersonalItem[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from("dashboard_personal_items")
    .select(COLS)
    .eq("profile_id", profileId)
    .in("kind", kinds)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return toItems((data ?? []) as Row[]);
}

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
const isoOrNull = (v: unknown) => {
  if (v === null) return null;
  if (typeof v !== "string" || !v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

export function cleanPatch(input: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  const title = clip(input.title, 300);
  if (title !== undefined) patch.title = title;
  const body = clip(input.body, 20000);
  if (body !== undefined) patch.body = body;
  const due = isoOrNull(input.dueAt);
  if (due !== undefined) {
    patch.due_at = due;
    patch.notified_at = null; // a new time re-arms the reminder
  }
  if (input.done === true) patch.done_at = new Date().toISOString();
  if (input.done === false) patch.done_at = null;
  if (typeof input.position === "number" && Number.isFinite(input.position)) patch.position = Math.round(input.position);
  return patch;
}

export async function createItem(profileId: string, kind: ItemKind, input: Record<string, unknown>, audio?: { path: string; durationS: number | null }) {
  const row = { profile_id: profileId, kind, ...cleanPatch(input), ...(audio ? { audio_path: audio.path, duration_s: audio.durationS } : {}) };
  const { data, error } = await createSupabaseAdminClient().from("dashboard_personal_items").insert(row).select(COLS).single();
  if (error) throw new Error(error.message);
  return (await toItems([data as Row]))[0];
}

export async function updateItem(profileId: string, id: string, input: Record<string, unknown>) {
  const patch = { ...cleanPatch(input), updated_at: new Date().toISOString() };
  const { data, error } = await createSupabaseAdminClient()
    .from("dashboard_personal_items")
    .update(patch)
    .eq("id", id)
    .eq("profile_id", profileId)
    .select(COLS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (await toItems([data as Row]))[0] : null;
}

export async function deleteItem(profileId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("dashboard_personal_items").select("audio_path").eq("id", id).eq("profile_id", profileId).maybeSingle();
  const { error } = await supabase.from("dashboard_personal_items").delete().eq("id", id).eq("profile_id", profileId);
  if (error) throw new Error(error.message);
  if (data?.audio_path) await supabase.storage.from(RECORDINGS_BUCKET).remove([data.audio_path]);
}

export async function uploadRecording(profileId: string, file: File) {
  const type = file.type || "audio/webm";
  if (!type.startsWith("audio/")) throw new Error("Only audio can be saved as a voice memo.");
  if (file.size > 25 * 1024 * 1024) throw new Error("Recordings are limited to 25 MB.");
  const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
  const path = `${profileId}/recordings/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await createSupabaseAdminClient()
    .storage.from(RECORDINGS_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

/** The audio of one of the owner's recordings, for transcription. */
export async function downloadRecording(profileId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("dashboard_personal_items").select("audio_path").eq("id", id).eq("profile_id", profileId).eq("kind", "recording").maybeSingle();
  if (!data?.audio_path) return null;
  const { data: blob, error } = await supabase.storage.from(RECORDINGS_BUCKET).download(data.audio_path);
  if (error || !blob) return null;
  return { blob, path: data.audio_path as string };
}

/**
 * Turn the owner's due reminders into personal notifications (shown in the alert
 * strip). Runs when the Overview loads and when the notifications poll runs, so no
 * scheduled job is needed. Each reminder notifies once.
 */
export async function fireDueReminders(profileId: string) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("dashboard_personal_items")
    .select("id, title, body, due_at")
    .eq("profile_id", profileId)
    .eq("kind", "reminder")
    .is("done_at", null)
    .is("notified_at", null)
    .lte("due_at", now)
    .limit(20);
  for (const r of data ?? []) {
    // Claim first so two tabs polling at once can't notify twice.
    const { data: claimed } = await supabase
      .from("dashboard_personal_items")
      .update({ notified_at: now })
      .eq("id", r.id)
      .is("notified_at", null)
      .select("id")
      .maybeSingle();
    if (!claimed) continue;
    await createPersonalNotification({
      userId: profileId,
      type: "reminder",
      title: `Reminder: ${r.title || "Untitled"}`,
      message: r.body || "Your reminder is due.",
      href: "/dashboard",
      metadata: { reminder_id: r.id },
    });
  }
}
