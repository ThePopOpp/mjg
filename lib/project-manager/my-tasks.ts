// "My Tasks" — Project Manager items assigned to a specific user, used by the
// dashboard overview widget. Reuses the PM visibility-aware loader so a viewer
// only ever sees items they're allowed to. Buckets (overdue / today / next 7
// days) are computed CLIENT-SIDE from `dueDate` so they honor the viewer's own
// timezone; this layer just returns their open, dated, assigned items.

import { loadProjectManagerData, type PmViewer } from "./data";

export type MyTask = {
  id: string;
  title: string;
  project: string | null;
  dueDate: string; // ISO timestamp (end_date)
  status: string;
  priority: string | null;
  type: string;
};

// Statuses that still need action (i.e. not complete/canceled).
const OPEN_STATUSES = new Set([
  "pending", "scheduled", "in_progress", "waiting", "delayed", "blocked", "needs_approval",
]);

const splitEmails = (s?: string | null) =>
  String(s || "").split(/[,\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);

// Open, dated tasks/milestones where the viewer is the assignee or a participant.
export async function getMyOpenTasks(viewer: PmViewer): Promise<MyTask[]> {
  const email = (viewer.email || "").trim().toLowerCase();
  if (!email) return [];

  let items;
  try {
    ({ items } = await loadProjectManagerData("default", viewer));
  } catch {
    return []; // PM not migrated / unavailable — the widget just shows empty.
  }

  return items
    .filter((i) => {
      if (i.type !== "task" && i.type !== "milestone") return false;
      if (!OPEN_STATUSES.has(i.status)) return false;
      if (!i.end_date) return false;
      const people = [...splitEmails(i.assignee), ...splitEmails(i.participants)];
      return people.includes(email);
    })
    .map((i) => ({
      id: i.id,
      title: i.title,
      project: i.project_title || i.schedule_group_key || null,
      dueDate: i.end_date,
      status: i.status,
      priority: i.priority,
      type: i.type,
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
