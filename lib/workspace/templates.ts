// Built-in Workspace templates. Content is Plate JSON; creating from a template copies it.
type Node = { type: string; children: { text: string }[]; checked?: boolean };
const h = (type: string, text: string): Node => ({ type, children: [{ text }] });
const p = (text = ""): Node => ({ type: "p", children: [{ text }] });
const todo = (text: string): Node => ({ type: "todo_item", checked: false, children: [{ text }] });

export type WorkspaceTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  content: Node[];
};

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: "blank",
    name: "Blank document",
    description: "Start from scratch.",
    category: "General",
    content: [p("")],
  },
  {
    id: "meeting-notes",
    name: "Client Meeting Notes",
    description: "Capture a client conversation, decisions, and follow-ups.",
    category: "Meetings",
    content: [
      h("h1", "Client Meeting Notes"),
      p("Date: "),
      p("Attendees: "),
      h("h2", "Purpose"),
      p(""),
      h("h2", "Discussion"),
      p(""),
      h("h2", "Decisions"),
      p(""),
      h("h2", "Follow-up tasks"),
      todo(""),
      todo(""),
      h("h2", "Next appointment"),
      p(""),
    ],
  },
  {
    id: "blueprint-review",
    name: "Stewardship Blueprint Review",
    description: "Review a client's Blueprint across the key areas.",
    category: "Stewardship",
    content: [
      h("h1", "Stewardship Blueprint Review"),
      p("Client: "),
      p("Completion status: "),
      h("h2", "Faith"),
      p(""),
      h("h2", "Family"),
      p(""),
      h("h2", "Finances"),
      p(""),
      h("h2", "Future"),
      p(""),
      h("h2", "Advisor observations"),
      p(""),
      h("h2", "Recommended next steps"),
      todo(""),
      todo(""),
    ],
  },
  {
    id: "onboarding",
    name: "New Client Onboarding",
    description: "Onboard a new client with a checklist.",
    category: "Stewardship",
    content: [
      h("h1", "New Client Onboarding"),
      p("Client: "),
      p("Assigned advisor: "),
      h("h2", "Onboarding checklist"),
      todo("Welcome communication sent"),
      todo("Required documents collected"),
      todo("Account access set up"),
      todo("First appointment scheduled"),
      h("h2", "Open questions"),
      p(""),
    ],
  },
  {
    id: "team-agenda",
    name: "Team Meeting Agenda",
    description: "Run a focused team meeting.",
    category: "Meetings",
    content: [
      h("h1", "Team Meeting Agenda"),
      p("Date: "),
      p("Attendees: "),
      h("h2", "Updates"),
      p(""),
      h("h2", "Discussion topics"),
      p(""),
      h("h2", "Decisions"),
      p(""),
      h("h2", "Assigned actions"),
      todo(""),
      h("h2", "Next meeting"),
      p(""),
    ],
  },
  {
    id: "event-planning",
    name: "Event Planning",
    description: "Plan an event end to end.",
    category: "Marketing",
    content: [
      h("h1", "Event Planning"),
      h("h2", "Overview"),
      p("Date & venue: "),
      p("Registration goal: "),
      h("h2", "Tasks"),
      todo("Invite list"),
      todo("Marketing"),
      todo("Assets"),
      todo("Speakers"),
      h("h2", "Day-of checklist"),
      todo(""),
      h("h2", "Follow-up"),
      p(""),
    ],
  },
  {
    id: "sop",
    name: "Process / SOP",
    description: "Document a standard operating procedure.",
    category: "Operations",
    content: [
      h("h1", "Standard Operating Procedure"),
      p("Purpose: "),
      p("Owner: "),
      h("h2", "Steps"),
      todo(""),
      todo(""),
      h("h2", "Related files"),
      p(""),
      p("Review date: "),
    ],
  },
];

export function getTemplateContent(id: string): Node[] | null {
  return WORKSPACE_TEMPLATES.find((t) => t.id === id)?.content ?? null;
}
