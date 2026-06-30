// Siggey skills — structured playbooks (derived from docs/agents) that tell the
// agent HOW to perform each class of task with the available tools. Injected into
// the system prompt so behavior is consistent and correct.

export type AgentSkill = {
  name: string;
  whenToUse: string;
  playbook: string[];
};

export const AGENT_SKILLS: AgentSkill[] = [
  {
    name: "Pilot Insights",
    whenToUse: "Questions about participants, calls, SMS, stats, or pilot progress.",
    playbook: [
      "Always pull live data first (get_pilot_overview, search_participants, get_participant, list_recent_calls, list_sms_conversations).",
      "Cite real numbers and names; never estimate or invent.",
      "Offer a concrete next step (e.g. who needs follow-up).",
    ],
  },
  {
    name: "Outreach (SMS & Email)",
    whenToUse: "Drafting or sending a message to a participant or contact.",
    playbook: [
      "Look the person up first (search_participants / list_contacts) to confirm the correct phone/email.",
      "Draft warm, pastoral, non-salesy copy using their first name.",
      "Propose the exact recipient + content and let the approval step send it. Never claim it was sent until the tool confirms.",
    ],
  },
  {
    name: "Email Templates & Automations",
    whenToUse: "Creating/editing email templates or configuring journey automations.",
    playbook: [
      "List existing templates/automations first to avoid duplicates and to get ids (list_email_templates).",
      "Build the body as on-brand HTML (call get_brand_kit for logo, colors, fonts, button/header snippets). Use merge fields like {{first_name}}, {{checkin_link}}.",
      "To wire an automation, map the event to a template with set_email_automation. New templates default to draft.",
      "To remove a template use delete_email_template (permanent); prefer archiving via update if unsure.",
    ],
  },
  {
    name: "Blog & Content",
    whenToUse: "Creating, editing, or publishing blog posts.",
    playbook: [
      "To edit an existing post, get_blog_post first for its id and current fields, then update_blog_post with ONLY the fields to change.",
      "A cover/header image URL goes in featuredImageUrl — NEVER embed it in the body HTML.",
      "Pull get_brand_kit so styling and voice match MJG. Default new posts to draft unless asked to publish/schedule.",
    ],
  },
  {
    name: "Project Manager",
    whenToUse: "Anything about projects, tasks, phases, milestones, schedules, dependencies, assignees, or templates in the Project Manager.",
    playbook: [
      "The Project Manager plans stewardship & operations work as Projects with child Tasks, Phases, and Milestones, shown across List, Table, Kanban, Gantt (Hour/Day/Week/Month zoom with drag-to-move/resize and drag-to-connect), Calendar, Templates, and My Tasks views.",
      "Items support: type (project/phase/task/milestone); status (pending, scheduled, in_progress, waiting, delayed, blocked, needs_approval, complete, canceled); priority (low, normal, high, urgent, critical, blocking_closeout); start/end dates; progress %; assignee + participants (by EMAIL); dependencies (finish_to_start / start_to_start / finish_to_finish / start_to_finish) drawn as Gantt arrows; reusable templates; photo/audio/file attachments; links to real user/participant/contact records; and project-level visibility (team / private / role-based / user-based, inherited by tasks).",
      "ALWAYS call list_project_items first to get real ids and titles before connecting or updating anything — never invent ids.",
      "To build work: create_project_item to add a Project, then add Tasks with project=<that project's name> so they nest under it. connect_project_items makes the target wait on the source. update_project_item changes status/progress/dates/assignee/priority. Use list_project_templates to see templates that scaffold a whole project.",
      "Assignees/participants are emails. Some items may be private and hidden from you — don't claim items exist that you can't see.",
    ],
  },
  {
    name: "Records (Contacts & Participants)",
    whenToUse: "Adding or updating contacts or participants.",
    playbook: [
      "Search first to avoid duplicates. Every create has a matching update — to change a record, use update_contact / update_participant with just the changed fields.",
      "Use dedicated fields rather than free-text notes when one exists.",
    ],
  },
  {
    name: "Brand Consistency",
    whenToUse: "Any time you generate member-facing email or content.",
    playbook: [
      "Call get_brand_kit and use the official logo URL, gold/green palette, fonts, and the provided email header/button snippets.",
      "Keep the voice warm, professional, faith-centered, and never salesy.",
    ],
  },
  {
    name: "Memory",
    whenToUse: "Ongoing tasks, decisions, or preferences worth recalling later.",
    playbook: [
      "Use 'remember' to store durable, non-sensitive facts (e.g. 'drafted blog post id', 'owner prefers SMS reminders'). Never store financial, legal, or other sensitive personal data.",
      "Check KNOWN MEMORY before asking the user to repeat something. Use 'forget' when a fact is obsolete.",
    ],
  },
];

export function renderSkillsForPrompt(): string {
  const blocks = AGENT_SKILLS.map(
    (s) => `### ${s.name}\nWhen: ${s.whenToUse}\n${s.playbook.map((p) => `- ${p}`).join("\n")}`,
  ).join("\n\n");
  return `\n\nSKILLS (playbooks — follow the matching one for each request):\n\n${blocks}`;
}
