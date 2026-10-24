# High-Level Prompt — MJG AI Agent Team

Use this specification as the source of truth:

`docs/ai-agent-team/mjg-paperclip-hermes-agent-team.md`

Build the **MJG AI Agent Team** inside the existing Michael J. Gauthier Next.js application and dashboard using **Paperclip as the AI organization/control plane** and **Hermes AI as the runtime for each agent**.

The system should be an organized AI workforce, not a flat collection of chatbots.

## Core architecture

- Mike Gauthier is the human owner/board authority.
- Steward is the primary internal AI interface and AI Chief of Staff.
- Core Hermes agents:
  - Steward
  - Scribe
  - Guide
  - Outreach
  - Concierge
  - Builder
  - Guardian
- Phase 2 agents:
  - Analyst
  - Community
- Optional future engineering agent:
  - Forge

## Required implementation direction

1. Review `docs/ai-agent-team/mjg-paperclip-hermes-agent-team.md` completely before coding.
2. Inspect the **current installed Paperclip version, APIs and adapter/plugin model** before implementing Paperclip-specific routes or schemas.
3. Create/configure the MJG company in Paperclip with Mike as the human authority.
4. Use Paperclip for goals, projects, tasks, assignment, delegation, heartbeats, blockers, budgets, routines, reviews, approvals, work products, costs and audit history.
5. Use Hermes for reasoning, persistent agent memory, skills, MCP/tool use and specialized role execution.
6. Build/configure a controlled Paperclip ↔ Hermes adapter bridge that maps each Paperclip agent to a durable Hermes profile.
7. Give each Hermes agent its own identity, role instructions, skill policy, memory policy and least-privilege tool/MCP access.
8. Create Steward as the main interface Mike and approved staff use. Steward should delegate work to specialist agents instead of doing everything itself.
9. Create Guardian as an independent reviewer that reports to Mike/Board rather than only to Steward.
10. Keep canonical MJG business/member data in the MJG application and approved data sources, not only in Hermes memory or Paperclip context.
11. Integrate Builder with `docs/frontend-editor/frontend-editor.md`. Normal website content changes must use the structured Frontend Editor workflow rather than unrestricted source-code editing.
12. Route code-level Next.js work through an isolated engineering workflow with branch/workspace, tests, diff/preview and approval.
13. Add an `Agent Team` dashboard area containing Overview, Steward, Team, Org Chart, Tasks, Projects, Goals, Approvals, Activity, Routines, Skills, Costs, Reviews and Settings.
14. Make **Ask Steward** the primary action in the Agent Team UI.
15. Add explicit human approval for destructive actions, mass communications, legal/privacy changes, sensitive data operations, high-risk public claims, production deployment and other protected actions listed in the spec.
16. Keep customer-facing Steward AI completely separate from the internal operator Steward. They may share approved Blueprint knowledge, but never unrestricted company tools, Paperclip authority, staff data, internal memory or other users' data.
17. Use the existing MJG authentication, roles, Next.js architecture, Supabase patterns, Tailwind CSS and shadcn/ui where appropriate.
18. Preserve the existing MJG UI/UX instead of replacing the application shell.
19. Make all agent work auditable and tied to Paperclip goals/projects/tasks.
20. Design the integration layer so future Paperclip changes can be absorbed without rewriting the MJG UI.

Treat the specification file as authoritative for agent roles, reporting lines, tool boundaries, review rules, skills, memory, workflows, rollout phases and acceptance criteria.
