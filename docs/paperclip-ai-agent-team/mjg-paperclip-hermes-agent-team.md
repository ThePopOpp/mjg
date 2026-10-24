# MJG AI Agent Team — Paperclip + Hermes AI

**Project:** Michael J. Gauthier / MJG Web App  
**Feature:** AI Agent Team / Autonomous Organization  
**Orchestration:** Paperclip  
**Agent Runtime:** Hermes Agent (Nous Research)  
**App:** Next.js  
**Primary Human Owner:** Mike Gauthier  
**Primary Human-Facing Agent:** Steward  
**Target File:** `docs/ai-agent-team/mjg-paperclip-hermes-agent-team.md`

---

## 1. Purpose

Build a structured MJG AI organization in the existing MJG dashboard using **Paperclip as the control plane** and **Hermes AI as the runtime for each AI employee**.

The system should not behave like a collection of unrelated chatbots. It should behave like an organization with:

- Reporting lines.
- Goals.
- Projects.
- Single-owner tasks.
- Delegation.
- Heartbeats.
- Budgets.
- Approvals.
- Reviews.
- Audit history.
- Scoped permissions.
- Human escalation.

Mike should primarily interact with **Steward**, who functions as the AI Chief of Staff and delegates work to the specialist Hermes agents behind the scenes.

---

## 2. Product Alignment

The current MJG website and product ecosystem centers on:

- The Stewardship Blueprint.
- The Life You're Building.
- Created for More Check-In.
- 6-Week Challenge.
- Video curriculum.
- Faith and identity.
- Purpose and priorities.
- Family, fitness, fun and finances.
- Guardrails and boundaries.
- Keystone habits.
- Energy.
- Legacy.
- Resources and articles.
- Book waitlist.
- Join the Journey.
- One-on-one sessions.
- Feedback / surveys.
- Future ForgedLife engagement.

The agent organization should mirror these real member and business workflows rather than generic corporate departments.

---

## 3. Technology Responsibilities

### Paperclip owns the organization

Use Paperclip for:

- Company structure.
- Agent hierarchy.
- Goals.
- Projects.
- Tasks/issues.
- Assignment and checkout.
- Dependencies/blockers.
- Heartbeats.
- Schedules/routines.
- Budgets and cost controls.
- Approvals/reviews.
- Audit trails.
- Work products.
- Agent status.
- Governance.

### Hermes owns the worker intelligence

Use Hermes for:

- Reasoning.
- Specialized role behavior.
- Persistent agent memory.
- Skills.
- Tool execution.
- MCP connections.
- Research.
- Browser/tool workflows where approved.
- Reusable procedures.
- Agent learning loops.

### MJG app owns business truth

Keep canonical data in the MJG application and approved systems:

- Users.
- Roles.
- Memberships/subscriptions.
- Assessment results.
- 6-Week Challenge progress.
- Website content.
- CRM/contact records.
- Consent records.
- Appointments.
- Communications history.
- Analytics.
- Billing data.
- Approved Blueprint content.

Do not make Paperclip or agent memory the only source of truth for business-critical data.

---

## 4. Recommended Org Chart

```text
                         MIKE GAUTHIER
                      Human Owner / Board
                              │
              ┌───────────────┴───────────────┐
              │                               │
           STEWARD                         GUARDIAN
      AI Chief Steward /                Independent QA /
        Chief of Staff                    Governance
              │
   ┌──────────┼──────────┬──────────┬──────────┐
   │          │          │          │          │
 SCRIBE      GUIDE     OUTREACH   CONCIERGE   BUILDER
 Content     Journey    Growth      Support     Website
 & Blueprint & Program  Lifecycle   Scheduling  Digital Ops
                          │
                       COMMUNITY
                      Group Engagement

              ANALYST reports to STEWARD
              FORGE is optional under BUILDER
```

### Recommended initial launch team

Start with seven agents:

1. Steward.
2. Scribe.
3. Guide.
4. Outreach.
5. Concierge.
6. Builder.
7. Guardian.

Add after the first workflows are stable:

8. Analyst.
9. Community.
10. Forge (optional engineering agent).

Do not launch a large flat swarm on day one.

---

## 5. Human Owner — Mike Gauthier

Mike is the final human authority.

Retain human control over:

- Mission and strategy.
- Major product direction.
- Book/Blueprint doctrine and final content.
- Public financial-planning positioning.
- Sensitive member communications.
- Mass communications.
- Legal/compliance-sensitive content.
- High-risk production changes.
- Agent hiring/activation.
- Budget overrides.
- High-risk tool permissions.

Represent Mike as a human owner/board user in Paperclip wherever the current Paperclip version supports it.

---

## 6. Steward — Chief Steward / AI Chief of Staff

**Runtime:** Hermes AI  
**Reports to:** Mike  
**Primary role:** Single front door for Mike and approved staff.

Steward should:

1. Understand the request.
2. Identify the relevant goal/project.
3. Break the request into tasks.
4. Assign the correct specialist.
5. Set priority and dependencies.
6. Monitor progress.
7. Route review/approval.
8. Consolidate outputs.
9. Report back to Mike.

Example:

> “Steward, prepare next week's Created for More campaign, review the Check-In funnel, and draft a resource about protecting your time.”

Steward should create/delegate work rather than doing everything itself.

### Steward responsibilities

- Executive assistance.
- Task intake.
- Delegation.
- Cross-agent coordination.
- Daily/weekly briefs.
- Project status.
- Blocker resolution.
- Approval routing.
- Research requests.
- Internal documentation.
- Follow-up management.

### Steward restrictions

- No unrestricted production deployment.
- No individualized investment advice.
- No legal conclusions.
- No bypassing Paperclip task ownership.
- No bypassing Guardian/human review when policy requires it.
- No broad sharing of member data between agents.

---

## 7. Scribe — Stewardship Content & Editorial Director

**Runtime:** Hermes AI  
**Reports to:** Steward

### Owns

- Stewardship Blueprint content.
- The Life You're Building content.
- Book drafts.
- Articles/resources.
- Reflection worksheets.
- Video scripts.
- Email copy.
- Landing-page copy.
- FAQs.
- Teaching outlines.
- Social copy.

### Core behavior

Scribe must clearly distinguish:

- Approved MJG content.
- Draft MJG content.
- External research.
- AI-generated suggestions.

Generated content must never silently become “Mike's teaching” or an approved Blueprint position.

---

## 8. Guide — Member Journey & Stewardship Experience Agent

**Runtime:** Hermes AI  
**Reports to:** Steward

### Owns

- Created for More Check-In support.
- Blueprint layer explanations.
- 6-Week Challenge journey.
- Reflection prompts.
- Personal Blueprint support.
- Educational next-step recommendations.
- Program progress guidance.

Guide can help users interpret and reflect, but is not a therapist, medical provider, pastor, lawyer, financial planner, or investment adviser.

Personalized professional requests should route to an appropriate human.

---

## 9. Outreach — Growth & Lifecycle Marketing Agent

**Runtime:** Hermes AI  
**Reports to:** Steward

### Owns

- Join the Journey.
- Book waitlist.
- Lead nurture.
- Created for More follow-up.
- Challenge onboarding/reminders.
- Email campaigns.
- SMS campaigns.
- Social campaigns.
- Launch sequences.

### Required rules

Outreach must respect:

- SMS consent.
- Email consent.
- Opt-outs.
- Suppression lists.
- Communication preferences.
- Audience eligibility.

An email address or phone number is not consent by itself.

---

## 10. Concierge — Support, Scheduling & Relationship Agent

**Runtime:** Hermes AI  
**Reports to:** Steward

### Owns

- General support.
- Contact requests.
- Resource navigation.
- One-on-one session scheduling.
- Appointment changes where permitted.
- Confirmations/reminders.
- Account assistance.
- Human handoff.

Concierge must not turn support or scheduling conversations into individualized financial advice.

---

## 11. Builder — Website & Digital Experience Agent

**Runtime:** Hermes AI  
**Reports to:** Steward

### Owns

- MJG Frontend Editor.
- Website page drafts.
- Page content.
- Navigation drafts.
- SEO metadata.
- Media placement.
- Landing pages.
- Resource pages.
- Broken-link checks.

Builder should follow:

`docs/frontend-editor/frontend-editor.md`

For normal website content, Builder should use the structured Frontend Editor rather than arbitrary source-code writes.

If the request requires a new Next.js feature/component:

1. Create an engineering task.
2. Use an isolated branch/workspace.
3. Build/test/typecheck.
4. Produce a diff/preview.
5. Require review before production.

---

## 12. Analyst — Analytics & Optimization Agent

**Runtime:** Hermes AI  
**Reports to:** Steward

Recommended as Phase 2.

### Owns

- Website analytics.
- Check-In funnel.
- 6-Week Challenge progression.
- Book waitlist conversion.
- Join the Journey conversion.
- Email/SMS performance.
- Booking funnel.
- Content performance.
- Agent costs and utilization.

Analyst recommends actions but should not automatically publish major changes.

Prefer aggregate/de-identified data whenever individual records are unnecessary.

---

## 13. Community — Challenge & Community Engagement Agent

**Runtime:** Hermes AI  
**Reports to:** Outreach

Recommended as Phase 2.

### Owns

- Challenge groups.
- Group leaders.
- Weekly participant reminders.
- Feedback.
- Surveys.
- Follow-through.
- Future ForgedLife community engagement.

---

## 14. Guardian — Independent QA & Governance Reviewer

**Runtime:** Hermes AI  
**Reports to:** Mike/Board

Guardian should remain independent from the agents whose work it reviews.

### Reviews

- Brand consistency.
- Factual consistency.
- Blueprint consistency.
- Financial-advice boundaries.
- Privacy.
- Consent.
- Public claims.
- Legal-sensitive content.
- Sensitive data access.
- Destructive changes.
- Production publication/deployment according to policy.

### Guardian should be a required review participant for

- Public resources.
- New public landing pages.
- Campaigns.
- Public email/SMS templates.
- Assessment-result language.
- Book excerpts.
- Challenge curriculum.
- Public financial content.

### Guardian + human approval

Require both for:

- Legal-page changes.
- Major financial claims.
- Mass campaigns.
- New sensitive-data access.
- Production deployment.
- Major pricing/billing changes.
- New external integrations with sensitive access.

---

## 15. Optional Future Agent — Forge

**Runtime:** Hermes AI  
**Reports to:** Builder

Forge is the code-level engineering agent for changes that cannot be done through the Frontend Editor.

Require:

- Isolated Paperclip workspace.
- Branch/worktree.
- Tests.
- Typecheck/build.
- Diff artifact.
- Review.
- Human approval before production by default.

---

## 16. Paperclip Company

Create one Paperclip company for MJG.

Suggested goal-level mission draft:

```yaml
company:
  name: Michael J. Gauthier
  short_name: MJG
  mission: >
    Encourage and equip people to intentionally steward the resources,
    responsibilities, relationships, time, talents, treasure, energy,
    influence and opportunities God has entrusted to them.
```

Mike should approve canonical mission language before it becomes permanent agent context.

---

## 17. Goal Hierarchy

```text
MJG Mission
│
├─ G1 — Grow the Stewardship Blueprint
│  ├─ Publish valuable resources
│  ├─ Develop The Life You're Building
│  └─ Maintain framework consistency
│
├─ G2 — Help People Move from Drift to Intentional Stewardship
│  ├─ Created for More Check-In
│  ├─ 6-Week Challenge
│  ├─ Personal Blueprint
│  └─ Ongoing journey
│
├─ G3 — Grow the MJG Community
│  ├─ Join the Journey
│  ├─ Book waitlist
│  ├─ Challenge groups
│  └─ ForgedLife
│
├─ G4 — Deliver an Excellent Digital Experience
│  ├─ Website
│  ├─ Dashboard
│  ├─ Frontend Editor
│  └─ Steward experience
│
├─ G5 — Improve Through Measurement
│  ├─ Analytics
│  ├─ Funnel performance
│  └─ Feedback/experiments
│
└─ G6 — Protect Trust
   ├─ Privacy
   ├─ Consent
   ├─ Financial-advice boundaries
   ├─ Quality
   └─ Human approval
```

Every meaningful Paperclip task should trace to a goal.

---

## 18. Recommended Paperclip Projects

```text
Stewardship Blueprint
The Life You're Building
Created for More Check-In
6-Week Challenge
Resources & Content
Book Launch
Join the Journey
Member Experience
Website & Frontend Editor
Marketing & Lifecycle
Support & Scheduling
Analytics & Reporting
Governance & Compliance
Agent Platform
```

Use projects as durable bodies of work, not one-off task folders.

---

## 19. Single-Assignee Rule

Each task should have one owner.

Do not conceptually assign one Paperclip task to multiple agents.

Example:

```text
Parent: Launch Week 3 materials — Steward
  ├─ Finalize lesson copy — Scribe
  ├─ Update challenge page — Builder
  ├─ Prepare reminder sequence — Outreach
  └─ Review release — Guardian
```

Use dependencies/blockers explicitly where needed.

---

## 20. Hermes Profile Mapping

Use one persistent Hermes identity/profile per durable agent.

Suggested profiles:

```text
mjg-steward
mjg-scribe
mjg-guide
mjg-outreach
mjg-concierge
mjg-builder
mjg-guardian
mjg-analyst
mjg-community
mjg-forge
```

Each should have isolated or appropriately scoped:

- Identity.
- Instructions.
- Memory.
- Skills.
- Sessions.
- Tools.
- MCP configuration.

Do not use one unrestricted Hermes profile for the entire company.

---

## 21. Paperclip ↔ Hermes Adapter

Do not assume a native first-party Paperclip/Hermes adapter exists.

Build/configure a controlled adapter bridge using the current supported Paperclip adapter/plugin/HTTP contract.

Conceptual flow:

```text
Paperclip task/heartbeat
        ↓
MJG Hermes Adapter
        ↓
Resolve Paperclip Agent → Hermes Profile
        ↓
Inject goal/project/task context + scoped secrets
        ↓
Run Hermes with approved tools/MCP
        ↓
Capture result + artifacts + cost
        ↓
Return status/work product to Paperclip
```

Before implementation, inspect the installed/current Paperclip version and its adapter API.

---

## 22. Execution Contract

Each Hermes run should receive structured context similar to:

```json
{
  "company": "MJG",
  "agent": "Scribe",
  "paperclipTaskId": "...",
  "goal": "...",
  "project": "...",
  "task": "...",
  "priority": "medium",
  "approvalPolicy": "public-content-review",
  "allowedTools": ["..."],
  "allowedDataScopes": ["..."],
  "expectedOutput": "...",
  "successCriteria": ["..."]
}
```

Return structured results, e.g.:

```json
{
  "status": "completed",
  "summary": "Drafted Week 3 reminder sequence.",
  "deliverables": [],
  "risks": [],
  "requiresReview": true,
  "recommendedReviewer": "Guardian",
  "followUpTasks": []
}
```

---

## 23. Skills Architecture

Use three layers.

### Shared MJG skills

```text
mjg-brand-voice
stewardship-blueprint
mjg-product-map
mjg-website-map
mjg-content-standards
mjg-privacy-and-consent
paperclip-agent-protocol
mjg-human-escalation
```

### Department skills

Examples:

**Scribe**

```text
mjg-editorial-workflow
resource-article-workflow
book-draft-workflow
video-script-workflow
```

**Guide**

```text
created-for-more
six-week-challenge
personal-blueprint
reflection-guidance
```

**Outreach**

```text
campaign-planning
email-lifecycle
sms-consent-check
launch-checklist
```

**Builder**

```text
frontend-editor
nextjs-mjg
website-publishing
seo-workflow
```

### Agent-learned skills

Hermes may learn reusable workflows from completed work.

For production agents, strongly consider requiring human approval for changes to high-impact skills/procedures.

---

## 24. Memory Strategy

Use Hermes persistent memory for operational memory, not as the sole source of truth.

Good memory examples:

- Mike's report preferences.
- Tool quirks.
- Reusable workflow preferences.
- Known process lessons.

Canonical data belongs in approved MJG systems.

### Knowledge priority

```text
Tier 1 — Canonical MJG data/documents
Tier 2 — Approved shared Hermes skills
Tier 3 — Agent-specific Hermes memory
Tier 4 — Paperclip task/project/goal context
```

When they conflict, Tier 1 wins.

---

## 25. MCP & Tool Strategy

Hermes supports MCP, but use least privilege.

### Steward

- Paperclip.
- MJG internal APIs.
- Reporting.
- Calendar read where appropriate.
- CRM read where appropriate.

### Scribe

- Approved content sources.
- Website content read.
- Research.
- Media read.

### Guide

- Check-In results.
- Challenge progress.
- Resource search.

### Outreach

- CRM.
- Email.
- SMS.
- Consent/segments.
- Analytics.

### Concierge

- Calendar.
- Contacts.
- Support/account status.
- Communications.

### Builder

- Frontend Editor API.
- CMS.
- Media.
- SEO.
- GitHub only if engineering access is explicitly granted.

### Analyst

- Analytics/reporting.
- Aggregate CRM/funnel data.
- Paperclip cost data.

### Guardian

- Read access to proposed work.
- Policies.
- Diffs.
- Consent/privacy rules.

Guardian should rarely need broad write access.

---

## 26. High-Risk Actions

Require human approval for:

- Permanent deletion.
- Production deployment.
- Legal changes.
- Privacy/Terms changes.
- Mass email/SMS.
- New marketing audience segments.
- Billing/refund operations when policy requires confirmation.
- Role/permission changes.
- Sensitive data exports.
- Destructive database operations.
- New external integrations with sensitive access.
- Public outcome/statistical claims that are not already verified.

---

## 27. Example Workflow — New Resource

Mike:

> “Steward, create an article about guarding your calendar so your stated priorities show up in your time.”

Flow:

```text
Steward → creates task
Scribe → drafts article
Guardian → reviews
Builder → creates website draft
Mike → previews/approves
Builder → publishes
Analyst → tracks performance
Outreach → may receive distribution task
```

---

## 28. Example Workflow — Created for More

When a user completes the Check-In:

```text
MJG app saves canonical results
        ↓
Guide receives only necessary assessment data
        ↓
Guide creates educational/reflection summary
        ↓
Guide recommends approved MJG resources
        ↓
Concierge handles requested booking
        ↓
Outreach follows up only if user consent allows it
```

Do not create a Paperclip task for every low-value UI event. Use Paperclip when agent work, review, coordination, or durable accountability is required.

---

## 29. Example Workflow — Frontend Change

Mike:

> “Steward, add a section to the homepage for The Life You're Building.”

Flow:

```text
Steward → Builder
Builder → reads current page
Scribe → copy if needed
Builder → Frontend Editor change set
Guardian → review
Mike → preview/approval
Builder → publish
Analyst → monitor
```

---

## 30. Example Workflow — 6-Week Challenge

Parent project: `6-Week Challenge`

Weekly task structure:

```text
Steward
  ├─ Guide: verify week's learning objective
  ├─ Scribe: update material
  ├─ Community: participant/facilitator communication
  ├─ Outreach: reminders
  ├─ Builder: page/video/resource updates
  ├─ Guardian: review
  └─ Analyst: participation summary
```

---

## 31. Routines / Heartbeats

Prefer event-driven execution first.

Suggested routines:

### Steward

- Daily critical-task review.
- Weekly executive summary.

### Scribe

- Weekly content-calendar review.

### Outreach

- Campaign queue review.
- Failed-send/lifecycle exception review.

### Concierge

- Upcoming appointment prep.
- Unresolved support review.

### Builder

- Broken-link/publish queue checks.

### Analyst

- Daily anomaly check.
- Weekly funnel summary.

### Guardian

Prefer event-driven review rather than constant polling.

Avoid aggressive heartbeats for idle agents.

---

## 32. Budget Strategy

Use agent-level monthly budgets.

Suggested relative allocation:

- Higher: Steward, Scribe, Builder.
- Medium: Guide, Outreach, Analyst.
- Lower/event-driven: Concierge, Community, Guardian.

Do not starve Guardian when a required review is pending.

Use warning thresholds before hard stops.

---

## 33. Agent Evaluations

Create repeatable evaluations such as:

- Can Steward route 50 sample tasks correctly?
- Can Scribe distinguish approved source material from generated ideas?
- Can Guide avoid personalized investment advice?
- Can Outreach refuse sends when consent is missing?
- Can Concierge correctly escalate advice requests?
- Can Builder refuse unsafe production actions?
- Can Guardian detect unsupported claims?
- Can Analyst avoid exposing individual private records in aggregate reports?

Increase autonomy only after eval performance is acceptable.

---

## 34. MJG Dashboard — Agent Team

Add a new dashboard area:

```text
Agent Team
├─ Overview
├─ Steward
├─ Team
├─ Org Chart
├─ Tasks
├─ Projects
├─ Goals
├─ Approvals
├─ Activity
├─ Routines
├─ Skills
├─ Costs
├─ Reviews
└─ Settings
```

### Overview

Show:

- Active/paused agents.
- Running tasks.
- Blocked tasks.
- Pending approvals.
- Items needing Mike.
- Monthly cost/budget.
- Recent deliverables.
- Recent agent decisions.
- Guardian review queue.

Primary action:

**Ask Steward**

---

## 35. Org Chart UI

Display:

```text
Mike
├─ Steward
│  ├─ Scribe
│  ├─ Guide
│  ├─ Outreach
│  │  └─ Community
│  ├─ Concierge
│  ├─ Builder
│  │  └─ Forge (future)
│  └─ Analyst
└─ Guardian
```

Agent card fields:

- Name.
- Title.
- Status.
- Reports to.
- Current task.
- Budget/cost.
- Last heartbeat.
- Skills.
- Tool access.
- Pause/resume.

---

## 36. Paperclip Integration Layer

Keep Paperclip calls behind one server-side abstraction.

Suggested conceptual structure:

```text
src/lib/paperclip/
├── client.ts
├── auth.ts
├── companies.ts
├── agents.ts
├── goals.ts
├── projects.ts
├── tasks.ts
├── approvals.ts
├── routines.ts
├── costs.ts
├── activity.ts
├── webhooks.ts
└── types.ts
```

Adapt to the actual existing MJG project structure.

---

## 37. Hermes Integration Layer

Suggested conceptual structure:

```text
services/hermes/
├── adapter.ts
├── agent-map.ts
├── run.ts
├── context.ts
├── result-parser.ts
├── permissions.ts
├── artifacts.ts
└── callbacks.ts
```

The actual implementation must match the deployment architecture and current Hermes/Paperclip capabilities.

---

## 38. Agent Registry

Maintain a first-class MJG mapping between Paperclip and Hermes.

```ts
type MjgAgent = {
  key: string
  name: string
  title: string
  paperclipAgentId: string
  hermesProfile: string
  reportsTo: string | null
  enabled: boolean
  toolPolicy: string
  approvalPolicy: string
}
```

---

## 39. Data Security

Classify data:

```text
Public
Internal
Member
Sensitive
Financial
Secret
```

Agents receive only the scopes required for a task.

Do not place whole customer/member records into every prompt.

Do not expose raw secrets in the UI, task comments, or agent memory.

Use Paperclip scoped secrets and Hermes tool/MCP filtering where appropriate.

---

## 40. Logging & Side Effects

Log:

- Human request.
- Paperclip task.
- Assigned agent.
- Hermes run/session ID.
- Important tools used.
- Deliverables.
- Cost.
- Review.
- Approval.
- Final outcome.

Before sending/publishing/writing externally, verify:

- Correct contact/user.
- Correct action.
- Correct consent.
- Correct environment.
- Correct approval policy.

Use idempotency to avoid duplicate sends/actions after retries.

---

## 41. Internal Steward vs Customer-Facing Steward

This separation is mandatory.

Recommended identities:

```text
Internal operator:
mjg-steward-operator

Customer/member agent:
mjg-steward-member
```

They may share approved Blueprint knowledge and skills, but they must not share unrestricted:

- Tools.
- CRM access.
- Paperclip authority.
- Staff data.
- Company memory.
- Website publishing.
- Other users' data.

The customer-facing Steward must be scoped to the authenticated user's permitted context.

---

## 42. Implementation Phases

### Phase 1 — Paperclip Foundation

- Connect/deploy Paperclip.
- Create MJG company.
- Configure Mike.
- Build goal hierarchy.
- Build projects.
- Build Paperclip API client.
- Establish approvals/activity sync.

### Phase 2 — Hermes Core Team

Activate:

- Steward.
- Scribe.
- Guide.
- Outreach.
- Concierge.
- Builder.
- Guardian.

Build Paperclip ↔ Hermes adapter.

Configure profiles, skills, memory policies, MCP allowlists, budgets and reporting lines.

### Phase 3 — Dashboard

Build:

- Agent Team overview.
- Ask Steward.
- Org chart.
- Agent details.
- Tasks/projects/goals.
- Approvals.
- Costs.
- Activity.

### Phase 4 — MJG Workflows

Connect:

- Frontend Editor.
- Created for More.
- 6-Week Challenge.
- Book waitlist.
- Join the Journey.
- Scheduling.
- Resources.
- Communications.

### Phase 5 — Intelligence Layer

Add:

- Analyst.
- Community.
- Automated reports.
- Evals.
- Optimization workflows.

### Phase 6 — Engineering Autonomy

Optional:

- Forge.
- Isolated workspaces.
- Git integration.
- Automated tests.
- Review/merge workflow.

---

## 43. Build Priority

Recommended order:

1. Paperclip company + Mike.
2. Steward.
3. Hermes adapter bridge.
4. Task delegation.
5. Agent registry.
6. Guardian review gate.
7. Scribe.
8. Builder.
9. Guide.
10. Outreach.
11. Concierge.
12. Agent Team dashboard.
13. Skills/memory policies.
14. Tool/MCP scopes.
15. Budgets/costs.
16. Analyst.
17. Community.
18. Forge.

---

## 44. Acceptance Criteria

The first production phase is complete when:

- MJG exists as a Paperclip company.
- Mike is represented as the human authority.
- Steward is the primary internal AI interface.
- Steward runs through Hermes.
- Steward can create/delegate Paperclip tasks.
- Core specialist agents have distinct Hermes identities.
- Reporting lines are visible.
- Each agent has defined responsibilities and scoped tools.
- Each agent has a budget.
- Tasks trace to projects/goals.
- Guardian can review protected work.
- Human approval can stop high-risk actions.
- Agent work appears in the MJG dashboard.
- Agent costs/activity are visible.
- Builder uses the Frontend Editor for normal website content changes.
- Customer-facing Steward cannot inherit internal Steward authority.
- Agent failures do not create uncontrolled retry loops or duplicate external actions.

---

## 45. Implementation Rule

Before coding Paperclip-specific routes, adapters, schemas or assumptions:

1. Inspect the installed/current Paperclip version.
2. Review current Paperclip documentation/source.
3. Use its current supported API contract.
4. Keep direct Paperclip calls behind the MJG integration layer.
5. Do not scatter version-specific Paperclip logic throughout the UI.

Paperclip evolves quickly; the integration boundary should protect the MJG app from upstream changes.

---

## 46. Final Product Direction

The system should feel simple to Mike:

> “Steward, what needs my attention today?”

> “Steward, prepare Week 4 of the challenge.”

> “Steward, draft a new article on guardrails and prepare a website draft.”

> “Steward, tell me why Check-In completions dropped this week.”

> “Steward, prepare the book launch plan.”

Steward handles the conversation.  
Paperclip handles the organization.  
Hermes handles the work.  
Guardian protects the release process.  
The MJG dashboard gives Mike visibility and control.
