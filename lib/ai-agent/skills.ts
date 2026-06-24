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
