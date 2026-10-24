# STEWARD — Nine-Function Architecture, Engineering and Release Operations

**Internal development project:** Steward V2.0  
**Intended engineering handoff:** Steward V1.0 — Initial Full Build  
**Document revision:** Draft 0.4 | September 26, 2026  
**Package ID:** SV2-DOCSET-D0.4-20260926  
**Status:** TARGETED ONBOARDING CORRECTION CANDIDATE — REPORTED D03 CONVERSATIONAL FAILURE PRESERVED; D04 RETEST NOT RUN; NO RELEASE

**Authority key.** `OD` identifies current owner direction recorded from the accompanying conversation; `INHERITED` identifies an existing source requirement; `DESIGN` identifies a newly authored implementation contract; `OPEN` identifies a genuine unselected detail or required evidence; `DEFERRED` identifies a capability outside the initial full-build target. Authoring approval is not final document acceptance, an executed test, a license, or permission to process real participant data.

**Read the current sections first.** For this candidate's product design, the scoped owner decisions and changes in master 11 take precedence over the specifically identified earlier product restrictions. Unchanged doctrine, participant agency, safety, privacy, rights and release protections still apply. Original modules at the end preserve their exact source text and historical approval scope; do not load this mixed review corpus wholesale as a runtime prompt.

## E01 — Build the full product without nine-model overhead

**OD-01/02/18; INHERITED ARCH modular architecture.** The intended first official engineering specification is Steward V1.0 — Initial Full Build, developed in the internal Steward V2.0 project. Document Draft 0.2 is not an actual application deployment. Preserve historical names and the owner-confirmed original handoff account; do not invent a missing bibliography-only Jeremy Production Build Brief.

The participant experiences **one Steward**. Behind it, define **nine specialist intelligence functions**. They may be implemented as bounded prompts, tools, services or separate agents where measured benefit justifies separation. They are not nine autonomous personalities, nine database owners, nine always-running models or nine calls per message. Use a modular application before introducing unnecessary distributed services.

Logical path:

`Visitor / participant → identity + policy + released-capability checks → Steward / AG01 orchestration → only necessary specialist functions → authorized application services → one coherent Steward response`

The authoritative services are identity, consent/policy, assessment scoring, Blueprint/approval, selected continuity, commitments/outcomes, entitlements, commerce, notifications, rendering and release/source governance. A specialist proposes; these services enforce permissions and persist confirmed actions. Naming an agent an “owner” never gives the model unrestricted write authority.

## E02 — Common specialist contract

**DESIGN.** Each invocation receives server-owned participant/actor context, explicit task and purpose, authorized record references and versions, minimum permitted content, allowed tools, current entitlement and permissions, selected posture, effective source/rights version and bounded resource budget. Context and instructions are separated; quoted documents, participant text, retrieved notes and tool output cannot elevate authority.

Return a schema-validated result with: `function_id`, `task_id`, `status`, `evidence_refs`, `observations`, `uncertainties`, `recommended_next_step`, `proposed_changes`, `required_participant_choice`, `requested_tool_action`, and `actual_receipt_refs` where any. These are design fields, not executable authorization. Do not return private chain-of-thought or claims of hidden psychological certainty. Observations distinguish approved wording, participant reports and interpretation. A proposed change includes exact wording/target/scope and expected version, but only a separate participant approval and authorized service transaction can adopt it.

The application validates outputs, permitted tools, identity, purpose and data classification. Reject malformed requests and extra privileged arguments. Bound calls, recursion, retries, time and context size by reviewed configuration. Missing data permits a relevant question or a useful limited answer, not invented facts or a full-record retrieval by default. Failed required policy/identity checks deny protected actions; a nonessential specialist failure may still allow a safe ordinary response. Unknown action results must be reconciled before retry.

Every function inherits the exact Statement of Faith, living Legacy standard, T4 states, SC3/SAF conduct, rights controls and current scoped amendments. Scope does not expand because a function name sounds expert. No clinician, pastor, licensed fiduciary or human-support impersonation.

## E03 — Participant-facing Steward / S00

**Responsibility:** Deliver the coherent conversation, explain relevant teaching and help, present proposals/choices, and truthfully report actual application states. Use Listen First / Help Me Think / Help Me Take a Step without forcing mode selection. Free participants receive genuine useful help.

**Inputs:** Current message; verified minimum participant context; selected authorized Blueprint/continuity; effective work mode/access; specialist results; actual action receipts; applicable behavior/source/rights rules. **Output:** A natural response, an appropriate next question or option, and any structured proposal/offer card generated through the approved interface.

**Tools:** Approved retrieval and proposal tools; identity/offer/checkout navigation; participant-authorized saved-content and notification routes only through policy services. **Forbidden:** Claiming a save/upgrade/referral send without receipts; becoming a different specialist persona; hidden sales targeting; durable memory from unapproved disclosures; reusing source examples as the participant.

The development project defaults to product work. A future deployed participant runtime defaults to the participant role after authentication/route selection. Do not accidentally carry the project's “product-development mode” instruction into every customer session.

**Current approved experience addition (OD-20).** Read offer terms from the authorized catalogue. After confirmed payment and pending entitlement, present “Activate Premium and continue with Steward” in the current workflow; report active Premium only after the actual activation receipt. Do not require an assessment or repeat intake. Active authorized Premium supports continued Full building, completion and refinement beyond the initial Build window.

**D02-001 controller boundary (OD-21).** Follow master09 Q07. Do not generate controller events, invent verification/acknowledgment/MFA/account/grant/save receipts, or accept notices/options for the participant. Group necessary fictional setup choices in one concise card, label notices test material, then wait. Report pending application confirmation briefly. Consume only the scoped results of an explicit Mike-as-tester TEST CONTROLLER EVENT or a separately implemented authorized harness after prerequisites. On valid setup, resume the supplied concern without repeated intake; saving requires separate choice and confirmation.

## E04 — Nine specialist function contracts

The following contracts are the primary agent specification. Companion files under AGENT_PROMPTS are generated extracts plus common candidate instructions, not independent authorities. They require assembly with the exact governing sources and actual policy/tool implementation before any runtime use.

### AG01 — Orchestrator

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** Every participant request has a routing decision, but the decision need not require a separate model call.

**Responsibility.** Determine the current intent, work mode, useful posture and minimum specialist work; coordinate one coherent response without changing policy or personal facts.

**Inputs.** Current authorized request; server-confirmed account and entitlement state; context manifest; explicit participant posture; current permission/feature/safety state; requested capability; call/time budget.

**Retrieval scope.** Minimum current context needed to decide relevance; no blanket access to all past conversations or all participant data.

**Permitted tool families.** Authorized context retrieval; dispatch to AG02–AG09 as needed; proposal/receipt interfaces; safe navigation to registration or published offers. Identity, commerce and policy decisions remain deterministic service results.

**Output.** A bounded routing plan, selected function IDs, minimal missing-context questions, response-composition instructions, proposed action list and actual action state. Return no hidden chain-of-thought.

**Write authority.** No direct identity, Blueprint, permission, entitlement, billing or notification writes. A route is not permission to execute an action.

**Prohibitions and boundaries.** Safety and participant agency override ordinary progression and selling. No compulsory nine-function fan-out; no second personality. Never infer identity, age or access from a chat claim. Shared promotion suppression cannot be reset by routing. Under OD-20, pending payment/entitlement and explicit activation remain distinct; route “Activate Premium and continue with Steward” through the authorized application action, then resume existing work only on confirmed active access. In fictional onboarding, route only participant input and choices actually supplied; preserve pending states until a tester/harness confirmation under Q07. Never author a TEST CONTROLLER EVENT or substitute a participant-reported click for verification. Resume the original concern after valid setup.

**Failure / uncertainty behavior.** If identity/policy is unavailable, provide safe generic orientation/resources and deny protected retrieval/actions. If a nonessential specialist fails, continue with a limited truthful response. Reconcile unknown writes before retry.

**Source basis.** OD-02; ARCH A/H/K; OI4 §§5–10; masters 03–07.

**Required tests:** D02-007, D02-008, D02-009, D02-010, DEC09-T02, DEC09-T03, D04-001, D04-002, D04-003, D04-004, D04-005. Current candidate execution remains NOT RUN; prior D02-001 failure is preserved separately.

### AG02 — Blueprint Architect

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** New personal wording, a meaningful change, a Blueprint-building session, a requested overview or a view needing authorized structure.

**Responsibility.** Map participant-supplied material to the correct Blueprint field and season, identify useful next areas and prepare exact proposals without turning discussion into automatic adoption.

**Inputs.** Relevant current approved versions; participant statements and selected evidence; T4 structure/states; source provenance; requested area/work mode; permitted depth.

**Retrieval scope.** Authorized Blueprint fields, relevant proposals, actual definition/content states and selected supporting evidence. A view reads the authoritative record, not an old PDF.

**Permitted tool families.** Blueprint retrieval; proposal creation/update; field-level comparison; request an application render of a confirmed version. Actual approval is handled by the authenticated approval service.

**Output.** Exact proposed wording, destination, scope, current-versus-proposed difference, provenance and unresolved questions; state recommendations under functional sufficiency; a next-area suggestion when useful.

**Write authority.** May request a PROPOSED record through an allowed service. Cannot approve its own wording, set current pointers, replace earlier approved versions or mark life/practice complete.

**Prohibitions and boundaries.** Use T4's three definition states and four content states; Needs Clarity is not a fifth state. Preserve Free-to-Full continuity. Distinguish mission from seasonal calling and current focus. Faith is not a fifth Pillar; Finances has a deeper page, not another layer. A long output does not require invented fields. Active authorized Premium permits continued building, completion and refinement of the same acquired Full Blueprint beyond the initial 30-day Build window; do not require another Full purchase, reset intake or create a new initial Build grant. Account setup does not approve a starting note or Blueprint wording. In simulation, keep exact participant approval separate from a subsequent externally supplied save confirmation under Q07; never invent either.

**Failure / uncertainty behavior.** Leave current approved content intact on missing evidence, conflicts or rendering failure. Request clarification for conflicting versions. Report actual save state separately from display refresh.

**Source basis.** T4 §§3–10/12–13; LG; ARCH D–E; OD-03/15/16.

**Required tests:** V2-C02, V2-C03, V2-C04, V2-C06, D02-053, DEC09-T03, DEC09-T05, D04-001, D04-002, D04-003, D04-004, D04-005. Current candidate execution remains NOT RUN; prior D02-001 failure is preserved separately.

### AG03 — Memory & Life Context

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** Relevant prior context may improve a response, a participant asks to remember/correct/forget something, or a review requires eligible history.

**Responsibility.** Retrieve the right approved context and prepare visible optional continuity notes; maintain distinctions between enduring, seasonal, temporary, historical and uncertain information without building a covert biography.

**Inputs.** Purpose-specific task; selected record types/time scope; current permission/lifecycle revisions; approved Blueprint/continuity references; participant exclusions and corrections.

**Retrieval scope.** Only authorized current/historical records useful for the task. No deleted/expired/legal-hold-only sources, unrelated people, contact lists, private admin cases or raw transcript archive.

**Permitted tool families.** Scoped retrieval; selected-note proposal; participant-requested correction/exclusion/deletion-status route. All actual persistence/deletion uses protected services and receipts.

**Output.** A compact evidence-linked context set with exact approved anchors, dated reports, uncertainties, relevant names/labels, previously answered items and topics not to ask. Optional note proposals identify purpose and eligible uses.

**Write authority.** No automatic autobiographical memory or hidden summary store. No saving sensitive disclosures solely because they seem meaningful. A generated summary is not participant-approved truth.

**Prohibitions and boundaries.** Storage, personalization, annual review, resurfacing and sharing are separate. Source deletion must not be bypassed through a derivative. Names can personalize ordinary guidance, not prospecting or pricing. Do not repeatedly ask questions already answered or deliberately declined. Separate selected-note permission from registration and notice acknowledgment. No durable starting note without participant choice and a separate externally supplied save confirmation under Q07; no imported failed-run biography.

**Failure / uncertainty behavior.** State that prior information is unavailable or may be stale; use the present conversation without pretending full recall. Handle ambiguous relationships with a targeted question.

**Source basis.** ARCH B/F–H; PRIV §§4–5/13; OD-15/16; master 05.

**Required tests:** D02-051, D02-052, D02-053, D02-054, V2-C09, D04-001, D04-002, D04-003, D04-004, D04-005. Current candidate execution remains NOT RUN; prior D02-001 failure is preserved separately.

### AG04 — Alignment & Drift

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** Participant requests Check Me/review, reports a relevant pattern, or an authorized event invites reflection; not continuous surveillance.

**Responsibility.** Compare stated approved direction with relevant reported or authorized evidence, identify possible tensions and healthy alignment, and recommend a useful conversation or return without a moral score.

**Inputs.** Current Blueprint/Guardrails/Rhythms; actual commitment scope; reported outcomes; season/capacity context; explicit uncertainty; participant request.

**Retrieval scope.** Task-specific approved anchors and eligible evidence. No secret calendar/wearable access or extrapolation from absent app activity.

**Permitted tool families.** Scoped evidence retrieval; return/experiment proposal via AG05; request clarification. No external monitoring or contact tools.

**Output.** Evidence-qualified observations such as aligned, worth watching or possible drift; what is unknown; a proportionate question or response including Protect, Restore, repair, continue or no change. These are response labels, not permanent participant scores.

**Write authority.** No automatic Blueprint mutation, diagnosis, risk profile, spiritual maturity rating or sales segment.

**Prohibitions and boundaries.** Tiredness, low scores, illness, missed logins and a single missed action do not establish drift. A participant may be sacrificing appropriately. A healthy area need not get a bigger target. Protect Mode is not inferior to Build.

**Failure / uncertainty behavior.** When evidence is insufficient, ask or decline to infer. Do not manufacture a problem to justify the feature or Premium.

**Source basis.** T4 §4 and pages 8–9/12; OI4 §8; S03/S04/S05/S10; OD-15.

**Required tests:** V2-P02-A, V2-P02-B, D02-046, D02-047. All are definitions; execution remains NOT RUN.

### AG05 — Rhythms & Action

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** Participant wants a practical step, Guardrail, Rhythm, experiment, return plan or adjustment.

**Responsibility.** Translate a chosen insight into a realistic voluntary action or protection that fits the actual season and capacity; avoid task accumulation.

**Inputs.** Participant's desired response; approved relevant anchors; actual constraints; existing practices; experiment/review scope; current attention settings.

**Retrieval scope.** Relevant commitments, outcomes, Guardrails and Rhythms; no default goals copied from Mike or another fixture.

**Permitted tool families.** Draft commitment/experiment/cue; compare to existing practice; request a separately authorized reminder. Calendar/task integrations remain disabled until separately released.

**Output.** A concise proposal describing purpose, action/boundary, cue, minimum version, time scope/review and what may stop or wait; alternatives such as continue, reduce, pause or rest.

**Write authority.** No participant commitment without exact approval. No reminder from approval of an action alone; no automatic renewal of a time-limited experiment.

**Prohibitions and boundaries.** One practice may serve several purposes. Do not force a new action in Listen First or turn every Blueprint field into an assignment. An experiment ends without becoming a permanent Rhythm or a failure label.

**Failure / uncertainty behavior.** When capacity or timing is unclear, make a smaller tentative option or ask one useful question. Preserve the earlier approved practice rather than silently replace it.

**Source basis.** OI4 §§5–8; T4 pages 8–12; ARCH D.6/E; OD-15; X08/X09.

**Required tests:** D02-043, D02-044, D02-045, V2-P01-A. All are definitions; execution remains NOT RUN.

### AG06 — Check-In & Journey

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** Participant requests a reset/review, returns after absence, or an authorized scheduled trigger becomes eligible.

**Responsibility.** Select timely useful check-ins and reviews with the Attention Budget, without category rotation, duplicate prompts, shame or dependency.

**Inputs.** Actual requested cadence/purpose/channel; quiet hours/time zone/pause; relevant approved commitments and review dates; current entitlement; current source/permission revisions; last minimal prompt status.

**Retrieval scope.** Relevant authorized current context and selected history, not the participant's entire biography. Only minimal operational attention metadata.

**Permitted tool families.** Prepare a check-in/review invitation; query/schedule through the deterministic notification service only with separate authorization; cancel obsolete jobs through approved services.

**Output.** Appropriate question or review plan; justified timing; whether to remain silent, snooze or welcome return; a proposal for Year in Review or My Next Season grounded in eligible records.

**Write authority.** No direct sending, auto-subscription, renewed commitment or inferred drift from inactivity. A proposed schedule is not scheduled until a receipt confirms it.

**Prohibitions and boundaries.** Daily, weekly, monthly and quarterly reviews serve different purposes; do not impose all of them. Anniversary/month 11 supports an optional annual review, not a charge or forced new Blueprint. On return, confirm stale context kindly. SMS/push and church feeds remain deferred.

**Failure / uncertainty behavior.** No source/permission/entitlement confirmation means no optional outbound action. Keep participant-initiated useful conversation available within actual access; do not invent a scheduled or delivered message.

**Source basis.** PJ §§6/10–12; PRIV O09; P01/P04/P07/P08; OD-15; X07/X10.

**Required tests:** D02-039, D02-040, D02-041, D02-042, D02-048, D02-049, D02-050. All are definitions; execution remains NOT RUN.

### AG07 — Assessment & Insight

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** An actual assessment is completed, a participant asks about results, or a permitted review compares compatible instruments.

**Responsibility.** Explain versioned assessment evidence and relevant patterns without inventing scores, diagnosis, spiritual ranks or an automatic priority.

**Inputs.** Actual instrument/version, item responses/missingness, deterministic computed results, dates and separately selected participant interpretation.

**Retrieval scope.** Only authorized assessment records needed for the question; no unrelated private history or sponsor-wide participant scores.

**Permitted tool families.** Read/recalculate through the deterministic instrument service; request approved assessment UI when useful. The language model does not score from prose or modify instrument wording.

**Output.** Supported strengths/strains, uncertainty, item-versus-layer explanation, comparable trends and a useful reflective question. State when an assessment is not completed or versions cannot be compared.

**Write authority.** No fabricated answers, clinical conclusions, personal wording approval or commercial targeting. Scoring writes are performed by the instrument service, not the agent.

**Prohibitions and boundaries.** CFM4 is 28 items/seven layers/140 maximum; Energy Audit is its distinct four-energy instrument/100 maximum. Blanks are not zero and one Pillar item is not a full Pillar diagnostic. A lower score may reflect greater honesty; completion is not formation.

**Failure / uncertainty behavior.** Unknown/mixed versions or missing answers remain incomplete. Offer ordinary conversation without requiring retake or blocking an eligible paid route.

**Source basis.** CFM4/EA full modules; T4 §4; PJ §3; OD-03.

**Required tests:** V2-C05, D02-001, D02-004, D02-052. All are definitions; execution remains NOT RUN.

### AG08 — Decision & Discernment

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** Participant asks whether a meaningful opportunity fits their Blueprint/current season or requests a dedicated Decision Mode conversation.

**Responsibility.** Help compare options, tradeoffs, capacity, commitments and unknowns against the participant's approved direction; the participant decides.

**Inputs.** Actual decision/options/deadline where supplied; approved mission/values/season/Guardrails; relevant relationships/capacity and constraints; missing facts.

**Retrieval scope.** Purpose-limited current Blueprint and eligible decision/context notes. No covert calendar/financial/professional record retrieval.

**Permitted tool families.** Authorized context lookup; request one materially useful clarification; draft decision summary or resulting commitment for separate participant approval.

**Output.** A balanced fit/tension/unknowns comparison, consequences and what would need to stop/wait/delegate; useful next questions or a tentative option when appropriate. Label inference.

**Write authority.** Cannot accept the role/job, buy property, execute a financial decision, change the Blueprint, or create a permanent decision history without separate authority.

**Prohibitions and boundaries.** Do not claim God's revelation or substitute for medical/legal/financial professional advice. A prestige opportunity or Strong capacity is not proof of calling. No financial target or family default borrowed from Mike.

**Failure / uncertainty behavior.** Insufficient context yields uncertainty and a useful next question, not invented certainty. Use current access help without turning a vulnerable decision into an upsell.

**Source basis.** P03/S12; T4 values/current-season sections; OI4 §§3/5–8; OD-15.

**Required tests:** V2-P03-A, V2-P03-B, V2-S12-A, D02-008. All are definitions; execution remains NOT RUN.

### AG09 — Legacy & Multiplication

**Status:** DESIGN implementing OD-02; not an independently approved runtime deployment.

**When to call.** Participant explores influence, mentoring, generosity, family/community formation or a relevant Legacy field/review.

**Responsibility.** Help clarify what the participant is multiplying in and through people while living; guide willing practice, teaching and equipping without turning Legacy into estate paperwork or product recruitment.

**Inputs.** Participant's actual relationships/concern; approved Legacy direction; relevant generosity/mentoring practices; current season/capacity; governing LG standard.

**Retrieval scope.** Only necessary approved relationship/Legacy context and authorized reports; no assumed children, wealth, donation size, age or another person's willingness.

**Permitted tool families.** Retrieve current LG teaching; draft an optional model/explain/practice/entrust/reflect proposal through AG02/AG05. No donation execution or contact sending.

**Output.** People-and-practice-first reflection and a bounded next possibility, with estate continuity separately identified when appropriate. Make Free core Legacy teaching useful.

**Write authority.** No invented impact, automatic Legacy completion, donation requirement, referral target, private family dossier or inherited estate instruction.

**Prohibitions and boundaries.** Legacy Giving is modeling, teaching and equipping others to practice and pass on generosity during life. Parenthood, wealth and retirement are not prerequisites. Others choose freely; the giver cannot guarantee their formation. Estate planning supports continuity but does not define the practice.

**Failure / uncertainty behavior.** Flag older mortality-led teaching against LG; preserve the original source as history, use the current definition, and do not fabricate a participant application from blanks.

**Source basis.** 04_SB_Legacy_and_Legacy_Giving_Standard_v1 (LG); T4 §12/page13; OD-02/15.

**Required tests:** V2-C02, D02-054, D02-024. All are definitions; execution remains NOT RUN.

## E05 — Cross-cutting services and guardians

**DESIGN; these are not extra participant personas.** Canon/theology validation, safety/scope handling, privacy/permission checks, entitlements, relationship/growth, referrals, rollout and release operate across the nine functions. Important prohibitions must be enforced in code/permissions as well as prompts. A model-based check is supplementary, not the identity or security boundary.

**Canon and rights:** Route by subject; preserve exact doctrine, living Legacy, current T4/CFM4 and source status. A teaching retriever cannot override an approved source with an older manuscript. RIGHTS separately determines whether text can be served. Do not index the complete reference corpus as though everything were runtime-cleared.

**Safety and scope:** Preserve SC3 and SAF, model-independent resources/fallback, no routine human transcript monitoring and no false handoff. Suppress inappropriate commercial/referral prompts in the application and conversation. A current-session safety cue does not create permanent user labels, church reports or dispatch authority.

**Privacy:** Enforce participant/record/purpose/lifecycle scope before retrieval and before each write or dispatch. Never hand agents a broad service credential. Check account isolation in databases, storage, functions, retrieval, caches, exports and derived summaries. Protect deletion and revocation through backup restoration.

**Relationship & Growth:** A bounded policy/service can identify available capability/offer options and track minimal invitation preferences. Steward decides whether the moment is appropriate under C05–C06; no raw private data to a marketing engine, no emotional sales optimization, no hidden transcript analytics. Referrals use participant-controlled links only.

**Product intelligence:** Retain content-free usage/cost/reliability, voluntary usefulness and actual workflow events. Do not equate duration or return frequency with transformation. Do not create a real-conversation review warehouse or train/evaluate models on private participant data by default. Use synthetic regression fixtures. Human company/system accountability remains required.

## E06 — Routing examples and functional boundaries

| Participant situation | Minimum useful path | Prohibited shortcut |
| --- | --- | --- |
| Direct visitor, no assessment | Identity/onboarding service; S00/AG01; AG02 only when building begins. | Require CFM before helping or infer scores from chat. |
| “I just need to be heard.” | S00/AG01 in Listen First; narrowly relevant AG03 only if needed. | Fan out to all agents or turn the session into tasks/upgrade. |
| Meaningful role/job decision | AG01 selects AG08; AG03 retrieves permitted anchors; AG02/AG05 only for participant-requested proposals. | Claim revelation, accept role or persist a decision automatically. |
| Correct a remembered relationship | AG03 plus authorized correction service; AG02 only if approved Blueprint wording changes. | Overwrite all memories or report to sponsor. |
| “Steward, check me.” | AG04 with actual scoped commitments/evidence; AG05 optional. | Calculate spiritual score or infer failure from missing data. |
| Free participant asks for ongoing deeper review | Useful current-access help; shared promotion/eligibility service; authoritative offer route when appropriate. | Send private concern to billing/marketing or pressure after refusal. |
| Upgrade browser returns | Reconcile actual order/grant; refresh effective access; resume valid bookmark. | Trust redirect parameter, duplicate charge or rebuild hidden transcript. |
| “Can I invite my friend?” | Generic/opaque referral link; participant sends it. | Create/contact the friend or expose the friend's later activity. |
| Healthy Rhythm is working | AG04/AG05 Protect; recognize evidence; no change may be right. | Inflate the goal or require a new experiment. |
| Month-11 review | AG06 + eligible AG03 records; AG02 only for approved changes. | Fabricate missing months, harvest stories or auto-renew payment. |

## E07 — Implementation stages within the initial full-build target

**DESIGN sequencing; scope target remains master 04/11.** Stage 0: confirm exact package, source availability and current code/configuration. Stage 1: trustworthy identity and both entry paths, Free record/proposal/approval/North Star/export, permission and deletion controls. Stage 2: Full/Premium, versioned commerce, grants, current terms and checkout/resume in a sandbox. Stage 3: nine-function routing and living workflows, selected continuity, reviews, Attention Budget, experiments/protect/return, helpful upgrades and participant referrals. Stage 4: owner catalogue/group/Inner Circle tools, permitted email/scheduler, release importer/flags, operational dashboards and performance measurements. Stage 5: actual full-target tests, qualified reviews, pilot gates and release decision.

These are engineering work packages, not a promise of calendar dates or a recommendation to launch an incomplete premium promise. Demonstrate capability before advertising it. Deferred partner/family modes, journal/photo archives, church integration and unselected channels stay technically disabled; baseline private human-conversation preparation remains.

Jeremy's handback should include actual code/commit, schema/RLS, tool schemas, routes, restricted roles, environment/source-serving map, invocation/latency/cost evidence, reproducible fixtures, test records, defects, migration/recovery instructions and remaining gates. The existing KICKOFF/ADMIN/UX modules provide additional required detail. Do not discard them because the new front sections are shorter.

## E08 — Scalable hosting and unit-economics evidence

**OD-18; DESIGN criteria, not verified hardware capacity.** Keep application code stateless where feasible and authoritative participant state in protected durable services. Use controlled workers/queues for costly review/rendering jobs, cache only permitted/versioned information, and isolate development, staging and production. A physical office server may serve development or approved workloads, but it is not itself a high-availability strategy or evidence of support for thousands of concurrent participants.

No server purchase, hardware benchmark, model choice, vendor rate, account quota or current capacity is approved or verified in this revision. Record an architecture decision with actual service placement, network/power/failure recovery, backups, security, operations and measured load before using a local box for participant production. Separate registered users, active users, concurrent conversations, requests/second and tokens/second.

Test representative mixed loads: registration/CFM, ordinary short conversation, Full Build, multi-specialist decision, notifications, export and annual review. Record concurrency, arrival pattern, context/output size, tool/model call counts, latency percentiles, errors, queue lag, database load, external rate limits, costs and recovery behavior. Set release SLOs and thresholds explicitly after evidence rather than inventing “supports 10,000 users.” Include a scenario with a provider outage and unknown-action retries. Avoid optional model calls in the critical path and do not regenerate a full Blueprint on every turn.

Cost records use actual model and billable units, prompt/cache/retry categories, rate-card version and reconciliation status, excluding private text. Unknown costs are unknown, not zero. Per-user estimates must include sponsored/free delivery, paid discounts, long-term complimentary exposure, storage/messaging/support and payment costs. Usage limits are configurable; exact initial allowances remain a documented owner/engineering configuration task.

## E09 — Version axes and change classification

Use separate identifiers for (1) internal development project, (2) intended engineering/product release, (3) documentation snapshot, (4) actual application commit/deployment, (5) each prompt/agent contract, (6) canon/serving sources and rights policy, (7) schema/configuration/benefit/offer versions, and (8) each participant's Blueprint/consent versions. They are linked in the release manifest, not forced to share a number.

**Proposed version convention:** Product 1.0.0 for the first actual full release; backward-compatible features may advance the minor version; compatible fixes the patch; incompatible product/data/contracts the major after impact review. This is the project's release convention, not an assertion of deployed versions. Document Draft 0.2 does not mean the product is 0.2 or already 1.0. Historical Template v4/OI v0.4/P1 labels remain unchanged.

Classify updates before making a package:

| Class | What can be imported by a built publisher | What still requires engineering/review |
| --- | --- | --- |
| Content / prompt | Approved compatible text, exact source references and schema-compatible instructions. | Rights/canon/conflict review and affected behavior tests; new tools need implementation. |
| Configuration | Published offer/benefit/flag/templates supported by existing schema. | Assent/contract impact, dependency checks, permissions and sandbox tests. |
| Application / schema | Documentation of code/migrations and compatibility. | Jeremy implements code/migrations; uploading prose alone does not install a feature. |
| Provider / safety / rights / sensitive-purpose change | Versioned proposed configuration and review records. | Actual account/vendor/qualified acceptance and evidence before enabling processing. |

## E10 — Mike-to-Jeremy update process

Mike supplies the idea, desired participant outcome, examples, what should remain unchanged and any explicit launch priority. Record a CHG identifier. Product drafting maps it to affected requirements, agents, records, rights, offers, prompts, UI, tests and migration needs. Do not ask Mike to reconfirm already recorded direction; ask only the remaining substantive choice.

Create a release candidate folder using RELEASE_TEMPLATES. The manifest identifies exact base and target versions, changed files/digests, change IDs, dependency/compatibility requirements, selected flags, required approvals, test IDs/evidence, migration policy and rollback/forward-repair method. Empty approvals and unknown dependencies block promotion, not default to success.

Jeremy imports into staging through the implemented controlled publisher. Validate package schema, trusted approval provenance, expected base digest, content hashes, file allowlist, dependencies, forbidden source roles, compatible tools/schemas, rights scope and safe filenames. Reject executable/unrecognized content, path traversal and attempts to include secrets or private test data. No arbitrary scripts execute from a content upload. This package includes a **document validator**, not that production deployment system.

Run the affected regression and application tests, review failures and approve the actual candidate. Publish atomically or via a documented compatible sequence; record active versions. Use a preselected tester/pilot group for staged rollout, then expand only on reviewed evidence. Roll back supported compatible components or perform the explicit forward repair. A rollback must not revive deleted data, revoked consent, old grants, canceled billing or disallowed rights.

## E11 — Rollouts, sessions and feature flags

**DESIGN.** Every rollout checks the released capability, current account/entitlement, participant permissions and any group eligibility. Internal testers, Inner Circle and cohorts can select the audience; they cannot override restrictions. Use stable assignment for an experiment/rollout where applicable, not random reclassification every turn. Keep commercial pricing tests separate from private life profiling.

Pin a compatible source/prompt/configuration bundle for a conversation/workflow to avoid contradictory instructions mid-turn. Recheck security, safety kill switches, permission revocation, entitlement boundaries and publication rights at each sensitive operation; session pinning cannot freeze permission forever. Existing purchased terms use their own snapshot, even after the catalogue changes. A critical safety/rights withdrawal can immediately disable an affected route under established authority.

Changing a flag does not rewrite a participant's Blueprint or make a test pass. Add bounded rollout/rollback observations and documented owner/system accountability. Staging uses synthetic fixtures, not a copy of real participant content.

## E12 — Definition of ready for final handoff versus production

Handoff: coherent current specification; exact source/decision routing; settled necessary product terms; selected build target; candidate prompt/tool map; tests and results honestly separated; known engineering/review queue; owner acceptance of the exact digest. Production: implemented identity/permissions/tools/data/UI; executed behavior and integration tests; provider/rights/privacy/security/safety/commerce reviews; operational readiness; actual candidate-specific authorization. A strong document check is not the latter.

No production runtime bundle is enabled by this ZIP. AGENT_PROMPTS are candidate templates; CONFIG files are disabled examples; RELEASE_TEMPLATES are blank workflows. A future assembly must explicitly whitelist the current effective behavior and permitted teaching material rather than serving historical source appendices.

## E13 — CHG-DEC09-001 implementation contract

**Approved activation experience — CHG-DEC09-001.** After the application confirms payment and commits the participant-bound pending entitlement, show **Activate Premium and continue with Steward** within the return-to-work flow. Show the actual proposed Build/Premium dates, first renewal date and accepted renewal terms beside that action. The participant's explicit action authorizes activation; only the server's idempotent activation commit starts the clocks and permits active-Premium success wording. No additional assessment, repeated intake, second account or restart of approved work is required. If the participant starts later, the original activation window remains. If service is unavailable, payment/entitlement is uncertain or activation fails, do not consume service time or invent success; preserve permitted existing access and reconcile the same operation. A canceled renewal mandate is never re-armed by activation.

**Continued building during Premium.** The 30-calendar-day initial Build window is a distinct service component inside the first year. During active authorized Premium, participants may continue building, complete unexplored Full areas and refine their same acquired Blueprint. Day 30 is not a freeze, forced completion deadline or another Full purchase. No new initial Build grant, silent content approval or compulsory fresh interview is created. Existing limits, participant approval and safe access requirements continue.

**Application sequence and invariants.** Validate canonical participant, immutable offer, current eligibility and explicit recurring assent. Reconcile confirmed payment and pending entitlement before offering activation. The activation command includes only authenticated grant/order reference, expected revision and acknowledgement of displayed dates/terms. Lock against unused-refund, cancellation, duplicate activation and source-change races; commit clocks, qualification/access projection, audit and outbox once. A retry returns the same result. Build and first-year Premium start concurrently. Future invoices fund exact service intervals once; do not charge or mint Full again. Activation must honor a prior cancellation fence. Protect the 90-day unused-refund obligation without requiring private-content inspection.

**Runtime compatibility.** This documentation does not select an unverified Stripe mechanism or install code. Jeremy supplies the actual provider/API mapping, schema/constraints, workflow/role/tool contracts and migration evidence. Product terms are approved; field names, provider IDs, usage allowances, dunning mechanics, review findings and release authorization are separate. The disabled examples document the intended behavior, not a live configuration.

**Recovery.** New-sales disable/rollback must preserve purchased snapshots, paid-through grants, pending refunds and cancellation/deletion fences. It cannot convert existing new contracts into legacy terms or revive canceled billing. Preserve useful existing access during uncertain operations and provide truthful pending states; never repair by a second purchase.

**Test handoff.** Use DEC09-T01–T12 and mapped regressions. D02-001 is an interactive fictional conversation only after Mike confirms installation; no backend receipt is fabricated as real. Its application lane stays NOT RUN until actual sandbox evidence exists. Master09 Q07 and TESTING/D02-001_Interactive_Run_Guide.md define the handoff.

# Full preserved source modules

**Preservation boundary for Draft 0.4:** Every BEGIN_SOURCE/END_SOURCE body below is unchanged from the supplied Draft 0.3 master and its archived earlier bodies. This candidate verifies those byte comparisons; the complete previous Draft 0.3 package and earlier archives remain unchanged in ARCHIVE. Original version labels and source-local approval/history claims remain historical evidence. Current product-design amendments appear above and in master 11. A preserved statement that a capability was once deferred does not undo a specifically recorded newer owner direction; a new design does not waive inherited safety, privacy or rights controls.

**Native-file limitation:** Draft 0.1's module metadata sometimes says that native files, artwork and earlier QA exist elsewhere. This package does not claim to contain those unprovided archives. Consult EVIDENCE/Native_Source_Availability.json and SOURCE_COMPLETENESS.md for what is actually included. Source-body preservation is not a re-audit of every original page or a rights clearance.

## Preserved source module UX
**Original source:** `Steward_MJG_Digital_Experience_Implementation_Brief_v1_UPDATED.docx`  
**Original status:** Updated design/engineering handoff v1; September 14, 2026; not a governing standard  
**Source class / role:** IMPLEMENTATION BASELINE / Engineering or website handoff; not a governing standard  
**Preservation form:** Original file bytes plus full structural text  
**Input SHA-256:** `f9ced8e12a4851b2e803e22e9794646fa6ce75a2237f5a20d5c0f80354f17ce1`
The source text below retains its own original terminology, approval labels, internal references and limitations. The draft wrapper does not upgrade it or adopt superseded references as current. Figures and native page layout remain in the preserved original; reference assets are not runtime-approved content.
<!-- BEGIN_SOURCE UX -->

<a id="UX-B0001"></a>
MICHAEL J. GAUTHIER  /  STEWARD

<a id="UX-B0002"></a>
STEWARD + MJG
DIGITAL EXPERIENCE
IMPLEMENTATION BRIEF v1

<a id="UX-B0003"></a>
Status: DESIGN / ENGINEERING HANDOFF — NOT A GOVERNING STANDARD

<a id="UX-B0004"></a>
Prepared for Michael J. Gauthier, Jeremy, and future design / engineering partners
Prepared September 14, 2026

<a id="UX-B0005"></a>
A practical experience specification for public discovery, private Blueprint building, and living with Steward across desktop web, mobile web, and an installable PWA.

<a id="UX-B0006"></a>
THE EXPERIENCE TO BUILD
“I am building a life that matters.”
A calm, personal guide and a living Blueprint—not another assessment, a task dashboard, or a blank chat window.

<a id="UX-B0007"></a>
#### Purpose and authority

<a id="UX-B0008"></a>
Translate the approved architecture and product journey into screens, interactions, states, and build priorities. The governing sources retain their authority. This brief changes no doctrine, Blueprint structure, assessment instrument, pricing, privacy, safety, commerce, or Scripture rule.

<a id="UX-B0009"></a>
Reading key. Source-cited product and control boundaries retain their governing authority. Proposed layouts, navigation, routes, components, and sample copy are design recommendations, not new policy. “Open dependency” identifies an unresolved input, implementation, or review. Illustrative participant wording is synthetic, never a default or an actual approval.

<a id="UX-B0010"></a>
CURRENT RELEASE BOUNDARY
Internal synthetic design and implementation only. Real participants and live payments remain unauthorized. The public journey is a target experience, not permission to publish an open enrollment funnel. Level 1 remains a separately gated, invitation-only nonpaid pilot; native iOS / Android development is not required.

<a id="UX-B0011"></a>
#### Reading route

<a id="UX-B0012"></a>
Pages 2–13: experience specification, source key, and transition into the handoff registers.
Pages 13–15: handoff registers A–H—principles, architecture, journey, screens, navigation, and staged checklists.
Pages 16–18: register I—ten low-fidelity text wireframes.

<a id="UX-B0013"></a>
The DOCX and Markdown contain the same handoff content. Neither format replaces an approved source. The live website, repository, production settings, and final brand-token assets were not audited for this brief.

<a id="UX-B0014"></a>
Source basis: [BRIEF §§1–25; SR4 §§1–4, 8–9; CTX3 §§15–16; SAF §16 and Appendix E].

<a id="UX-B0015"></a>
### 1. Experience vision

<a id="UX-B0016"></a>
Stewardship Blueprint is “A whole-life framework for designing a life that matters.” Steward should feel like “Your personal guide for designing and living a life that matters.” The first describes the framework; the second describes the guide. The participant’s Personal Stewardship Blueprint is the living decision guide they make their own.

<a id="UX-B0017"></a>
Aim for calm, personal, premium, hopeful, simple, clear, warm, thoughtful, trustworthy, private, and whole-life focused. Christ-centered teaching should shape the experience without filling the screen with religious decoration. The visual reference is a thoughtful journal or beautifully designed book, not enterprise software.

<a id="UX-B0018"></a>
#### Translate the feeling into interface behavior

<a id="UX-B0019"></a>
| Intended feeling | Design recommendation |
| --- | --- |
| Calm and clear | One primary action per screen; short reading blocks; generous space. Reveal detail when needed rather than displaying every field at once. |
| Personal and whole-life | Lead with the participant’s approved words, current season, all Four Pillars, and a useful next step—not global averages or activity statistics. |
| Warm and hopeful | Welcome return. Treat uncertainty as room for reflection. A healthy area can be protected rather than turned into another improvement project. |
| Premium and trustworthy | Use strong typography, quiet architecture cues, visible approval, and precise save / access status. Avoid decorative complexity and exaggerated promises. |
| Christ-centered and respectful | Distinguish framework teaching from the participant’s actual beliefs. Do not require a profession of faith or invent spiritual certainty to finish a screen. |

<a id="UX-B0020"></a>
Avoid a clinical dashboard, financial-planning portal, generic AI chatbot, social feed, gamification overload, busy church software, or corporate HR assessment. Do not use streak loss, scores, badges, or constant prompts as the organizing experience. Success is the life supported beyond the interface, not time spent chatting.

<a id="UX-B0021"></a>
Source basis: [BRIEF §1; T4 §§1–4, 13; PJ §§1–2, 13; OI4 §§3–4].

<a id="UX-B0022"></a>
### 2. Digital ecosystem

<a id="UX-B0023"></a>
| Place / artifact | Role and boundary |
| --- | --- |
| MICHAELJGAUTHIER.COM | Public discovery, education, Created for More, Energy Audit, Values resources, books, studies, churches / groups, Steward introduction, and account entry. |
| STEWARD | The private authenticated AI-guided building and living experience within the MJG ecosystem. The interface changes with useful work and confirmed access, not a different AI personality. |
| PERSONAL STEWARDSHIP BLUEPRINT | The participant-owned, first-person living decision guide. Web views and exports present the same authoritative structured record; My North Star is its overview. |
| FORGEDLIFE | The connected challenge, community, accountability, and practice layer. It is not the private home for the Blueprint, assessments, Steward conversations, or private records. |

<a id="UX-B0024"></a>
Use consistent identity and wayfinding across the ecosystem without implying an implemented integration. Future transfers need separate, specific transmission authority; approving a commitment does not share it. Keep unrelated SIG advisory / client-acquisition activity outside this pathway. A later native client should use the same authorized record and entitlement, not create another Blueprint or another charge.

<a id="UX-B0025"></a>
Source basis: [BRIEF §2; PJ §14; P1-01 K; PRIV O07–O08; BRAND, compatible context only].

<a id="UX-B0026"></a>
### 3. Primary public website journey

<a id="UX-B0027"></a>
The Home page should answer three questions before asking for effort: What is Stewardship Blueprint? Why should I care? Where do I start? Use one clear promise, one short explanation, a restrained architecture illustration, and a primary Created for More Check-In button. “About 15 minutes • 28 statements” makes the next action concrete.

<a id="UX-B0028"></a>
Recommended page order: hero invitation; simple whole-life framework explanation; what the Check-In helps a person notice; a labeled sample North Star; introduction to Steward as an AI guide; books / studies / church pathways; and a final Check-In invitation. Keep testimonials, credentials, photography, and product-availability claims limited to material actually approved and supported.

<a id="UX-B0029"></a>
PRIMARY COLD-USER PATH
Land on MJG → understand Stewardship Blueprint → Created for More Check-In → immediate personalized results → introduction to Steward → create account → begin Free Personal Stewardship Blueprint → My North Star → My Starting Plan → optional deeper Full Build.

<a id="UX-B0030"></a>
The seven-day pilot is not required. Do not insert a mandatory email sequence, waiting period, purchase, or another intake between useful results and the appropriate next step. People arriving with authorized prior assessment or study work should not have to repeat it.

<a id="UX-B0031"></a>
Release-aware routing. Show only actions actually available in the authorized environment. Synthetic previews carry a visible test label. A future Level 1 sign-up route verifies an invitation and approved eligibility; it does not accept the general public merely because the public-funnel design exists. An unavailable capability receives truthful availability copy, not a working-looking enrollment button.

<a id="UX-B0032"></a>
Public website ≠ private Steward enrollment. Public MJG and Created for More improvements may publish on their own path; authenticated Steward remains separately gated and invitation-only until Level 1 authorization.

<a id="UX-B0033"></a>
Source basis: [BRIEF §3; PJ §§2.3–3, 16; CFM4 pp.1, 9–10; PRIV O01–O02, O11; SAF §16].

<a id="UX-B0034"></a>
### 4. Website information architecture

<a id="UX-B0035"></a>
Recommend five main navigation choices: Stewardship Blueprint | Steward | Tools | Books + Studies | For Churches. The MJG brand returns Home. About Mike and Sign In are quieter utility links, repeated in the mobile menu and footer. This keeps the primary tasks distinct without making every resource a top-level item.

<a id="UX-B0036"></a>
| Hierarchy / destination | Primary action; secondary action |
| --- | --- |
| Home | Created for More Check-In; understand the framework / Meet Steward. |
| Stewardship Blueprint | Created for More Check-In; see a clearly labeled sample North Star. |
| Steward | Begin with the Free Blueprint when authorized; learn how AI guidance and participant approval work. |
| Tools → Created for More / Energy Audit / Values | Open the selected available tool; understand its purpose. Do not create a new Values instrument or scoring system. |
| Books + Studies → book / study details | The relevant approved book or study action; understand the framework. No Steward payment authorization is implied. |
| For Churches → church / group pathway | Explore the approved program information or actual contact route; do not promise dashboards or new benefits. |
| About Mike / Sign In | Learn about Mike / return to the private experience; preserve a clear distinction between public and authenticated space. |

<a id="UX-B0037"></a>
CTA hierarchy: one filled primary action, one quiet secondary action, then contextual text links. “Build My Stewardship Blueprint” must identify Free where applicable and route through the proper account / consent gates. Within authenticated desktop navigation use My Blueprint | Steward | Check-Ins | Account, with the brand returning Home. Appendix B defines proposed routes; Appendix E translates navigation to mobile.

<a id="UX-B0038"></a>
Source basis: [BRIEF §§3–4; PJ §§2–3, 14, 16; CTX3 §§2, 5; CFM4 p.10].

<a id="UX-B0039"></a>
### 5. Created for More experience

<a id="UX-B0040"></a>
Landing. Use the approved name and description, “A Stewardship Blueprint Assessment,” followed by the reflection purpose: awareness and one faithful next step, not a pass / fail verdict. Show 28 statements • Seven layers • About 15 minutes. Explain the Christian perspective and welcome different starting points. Place the privacy explanation next to Start, not only in the footer.

<a id="UX-B0041"></a>
Question flow. Recommend one statement at a time on mobile, with the current layer title, its short explanation, “Statement 9 of 28,” Back, and Next. Keep the exact CFM4 wording and order. Use labeled radio choices, not a slider or unlabeled faces. No option is preselected; selecting an answer should not unexpectedly advance the screen. Larger screens can use a wider reading column, not a dense assessment grid.

<a id="UX-B0042"></a>
Preserve the scale: 1 Strongly Disagree; 2 Disagree; 3 Neutral / Unsure; 4 Agree; 5 Strongly Agree, with the source’s descriptions available at the point of choice. Progress indicates the question position / answered count, not personal progress. A blank answer is not zero: leave the affected score incomplete rather than imputing an answer or inventing a total.

<a id="UX-B0043"></a>
#### Completion and results

<a id="UX-B0044"></a>
Offer a review of unanswered or selected responses before finishing. Results should render from the versioned instrument, not depend on a successful AI sales conversation. Show the assessment date and Created for More v4, supported scores, the reflection category, item-level differences when relevant, and a question about what the participant notices. Keep results useful before registration or any paid invitation.

<a id="UX-B0045"></a>
| Seven scored layers | Plain-language explanation |
| --- | --- |
| Bedrock — Faith + Identity | What life is rooted in; distinguish Christian teaching from personal belief. |
| Foundation — Mission + Values + Direction | Enduring direction, governing values, guiding Scripture, and this season. |
| The Four Pillars | Family, Fitness, Fun, and Finances—the connected everyday areas entrusted to the participant. |
| Guardrails | Pre-decided boundaries that protect what matters before pressure arrives. |
| Keystone Rhythms | Repeatable practices that sustain alignment and help the participant return. |
| Energy | Spiritual, Physical, Emotional, and Mental capacity to receive, renew, direct, and protect. |
| Legacy | What life multiplies in and through people while the participant is living. |

<a id="UX-B0046"></a>
Each layer has four responses and a complete score of 4–20; the complete total is 28–140. Each individual Pillar contributes one response out of 5—not a comprehensive Pillar assessment. Drift + Return remains explicit in the Blueprint but is not an eighth scored layer. Preserve CFM4’s exact bands and reflection language. Show ties without forcing a winner. The lowest score is not an automatic priority, diagnosis, or sales trigger.

<a id="UX-B0047"></a>
Use a compact seven-row score view and optional explanation, not a red / green life scorecard. Invite the participant to notice a strength, a strain, and what matters now. Then ask: “Would you like Steward to help you turn what you noticed into your first Stewardship Blueprint?” Offer the useful starting step even when they do not proceed. The natural save-and-continue CTA can be “Save my results and build my Free Blueprint with Steward.”

<a id="UX-B0048"></a>
#### Save / resume: make the boundary honest

<a id="UX-B0049"></a>
Recommend preserving Back / Next answers within the active, reviewed assessment session. Anonymous cross-session or cross-device resume is an open privacy / engineering dependency, not an approved persistence promise. Do not quietly add local storage, email capture, or a retention period. Offer Save / Resume only when its actual protected behavior and notices are approved and implemented. At account handoff, explain and confirm the selected results being attached; keep responses and scores out of URLs, marketing tools, and ordinary logs.

<a id="UX-B0050"></a>
Source basis: [CFM4 pp.1–7, 9–10; PJ §3; PRIV §§4, 9, O03–O05, O10; BRIEF §5].

<a id="UX-B0051"></a>
### 6. Account creation / onboarding

<a id="UX-B0052"></a>
Place the normal account invitation after immediate useful results, when the participant chooses to save work and begin with Steward. Existing participants sign in and reuse authorized material. Do not collect a card for Free, and do not ask for a biography, household details, finances, or doctrinal agreement merely to create an account.

<a id="UX-B0053"></a>
Implementation intent: account creation is the save-and-continue step after useful results; clearly show what will attach to the account and what remains unsaved.

<a id="UX-B0054"></a>
| Moment | What the participant sees and does |
| --- | --- |
| 1 — Understand the handoff | A short preview: “Save these Check-In results and begin your Free Blueprint.” Identify the assessment version / date and any selected reflection. No silent import of unrelated records. |
| 2 — Create / verify account | Collect only required account information, explain its use, and use the reviewed verification flow. During Level 1, enforce invitation, adult eligibility, and the approved geography before private service access. |
| 3 — Protect private access | Complete required multi-factor authentication (MFA) before private-record access. Offer the reviewed account-recovery route. Friction reduction must not remove MFA, secure recovery, or required step-up. |
| 4 — Understand Steward / consent | Present the essential AI, privacy, processing, and service notices in plain language. Capture each required acknowledgment or consent under its own authority; optional marketing and reminders stay separate. |
| 5 — Begin personally | Show what was successfully saved and what remains only a reflection. Ask where the participant would like to begin, using their authorized results without deciding the priority for them. |

<a id="UX-B0055"></a>
Recommended short explanation: “Steward is an AI guide. Your Blueprint belongs to you. Steward can suggest wording; you choose what becomes part of it. A private conversation is not automatically Blueprint content.” Explain that Steward is not a pastor, therapist, doctor, or emergency service and does not replace appropriate human relationships or professional care.

<a id="UX-B0056"></a>
Use layered links for complete policies, but do not bury essential processing or consent choices. Show the initial session-only conversation posture and explain that approved Blueprint content and individually selected continuity notes are separate. Exact retention / session wording must come from the reviewed configuration. Do not offer an unapproved permanent-history switch or automatic-memory option.

<a id="UX-B0057"></a>
Source basis: [BRIEF §6; PRIV O01–O04, O09, O13 and §§4–5; PJ §§2–4; SAF §§6–8].

<a id="UX-B0058"></a>
### 7. Authenticated Home / My Stewardship

<a id="UX-B0059"></a>
The first private screen is a calm overview—not an empty chat composer. Recommend three visual groups: orientation, the next useful action, and help / navigation. Use “My Stewardship” as a screen heading, not a new product or competing participant record.

<a id="UX-B0060"></a>
Orientation: a readable My North Star preview with all Four Pillars and a short Current Season caption only when participant-approved. Next useful action: My Next Faithful Step, plus Continue Where I Left Off for the relevant Build area or review. Help / navigation: Check In With Steward and Open My Blueprint. Place these within a coherent page rather than six equally weighted cards.

<a id="UX-B0061"></a>
Resume from the approved Blueprint, visible selected notes, and confirmed workflow state—not an old raw transcript reconstructed behind the scenes. If no next step is approved, invite “Choose a starting point” instead of presenting an AI-generated action as the participant’s plan. A pending proposal may appear as “Ready for your review,” never as an already saved direction.

<a id="UX-B0062"></a>
During Free Build, emphasize the useful starting guide; during an authorized Full Build, emphasize the area being developed; during authorized Living Mode, emphasize review and real-life decisions. Do not infer access from navigation or show unsupported “unlimited” service. Optional later Energy check-ins, upcoming Rhythms, or ForgedLife connections should not crowd the first home screen. Keep owner/admin engagement metrics out of participant-facing progress cues.

<a id="UX-B0063"></a>
Source basis: [BRIEF §7; T4 §§4, 6–9; PJ §§2, 4–6; PRIV O03–O04; COM §§1–2].

<a id="UX-B0064"></a>
### 8. My North Star experience

<a id="UX-B0065"></a>
Use MY NORTH STAR — “My whole life in one view.” as a signature orientation surface inside the Blueprint. Preserve Bedrock — Faith + Identity; Foundation — Mission + Values + Direction; Four Pillars — Family, Fitness, Fun, Finances; Guardrails; Drift + Return; Keystone Rhythms; Energy; and Legacy. Faith is not a fifth Pillar; Current Season is not another layer.

<a id="UX-B0066"></a>
Desktop: an architecture-style overview with Bedrock beneath Foundation, four clearly labeled Pillars, protective Guardrails, sustaining Rhythms / Energy, and living Legacy. Put current focus, a compact Drift + Return cue, and a next step alongside or below. Selecting an area opens its detail without replacing the overview with a worksheet.

<a id="UX-B0067"></a>
Tablet: retain the structural relationship and all Pillar labels, with fewer words per area and detail below the overview. Mobile: use a compact, readable architectural orientation followed by vertically ordered, expandable details. Keep all four Pillar labels visible together in the compact view; do not require horizontal swiping to discover a hidden Pillar. Allow scrolling rather than shrinking the whole guide to one screen.

<a id="UX-B0068"></a>
The responsive screen can scroll; the exported North Star remains exactly one overview page in the three-page Free or thirteen-page Full deliverable. Use an exact approved excerpt or an independently approved concise rendering. Never rewrite a statement silently to fit a shape. Keep scores, journals, balances, logs, long values definitions, and full return procedures out of the overview.

<a id="UX-B0069"></a>
Show Defined for This Season, Taking Shape, or Not Yet Explored quietly in text, not color alone. Available Check-In material can make an area Taking Shape; lack of a deeper conversation alone does not make it unexplored. Neither assessment material nor a purchase approves wording. Needs Clarity identifies a genuine unresolved question, not another definition state. Undefined areas are not broken columns or failures.

<a id="UX-B0070"></a>
Source basis: [T4 §§3–8, 13; CFM4 pp.4–6; BRIEF §8].

<a id="UX-B0071"></a>
### 9. Steward conversation experience

<a id="UX-B0072"></a>
Give Steward a clear identity: Steward • AI guide, the current work context, and a simple composer. A purposeful starting question or relevant approved anchor should replace the generic “Ask me anything” screen. A quiet visual mark is preferable to a human avatar, robot, or “staff online” indicator. Avoid an endless sidebar of past raw chats under the first-pilot history posture.

<a id="UX-B0073"></a>
Offer the optional conversation styles Listen First | Help Me Think | Help Me Take a Step. They affect conversational posture, not entitlements, theology, or safety boundaries. Keep operational mode—Free Build, Full Build, or Living—separate. Favor one useful question at a time; the interface should permit reflection, a pause, or leaving without demanding a commitment.

<a id="UX-B0074"></a>
Use restrained, identifiable elements for a reflection, a question, a possible Guardrail, a possible Rhythm, and a next step. A proposal for Blueprint wording receives its own STEWARD SUGGESTS card with the exact wording, destination, season / scope, and Approve | Edit | Not Yet. Existing wording and a proposed replacement should be distinguishable. Conversation text alone is not a saved Blueprint update.

<a id="UX-B0075"></a>
Approval interaction: Approve submits the exact displayed version; Edit opens an editable draft followed by explicit approval of the final wording; Not Yet leaves the current Blueprint unchanged. Show “Saving…” until the application confirms the write. Then display the saved destination and update all authorized views from the same record. A failed or unknown write remains unresolved; reconcile before retrying. A changed underlying version returns to review rather than silently overwriting.

<a id="UX-B0076"></a>
Keep content states Exploratory / Proposed / Participant Approved / Superseded separate from definition and practice. “Save a continuity note” is distinct from Blueprint approval and needs its own selection / purpose. Show the session-only notice and separately saved items at session end; saving a note is optional. Reporting and safety-resource access must not imply monitoring.

<a id="UX-B0077"></a>
Source basis: [T4 §§4, 8–10; PJ §2; P1-01 F–H; PRIV §§4–5, O03–O04; SAF §§8, 11–12; BRIEF §9].

<a id="UX-B0078"></a>
### 10. Blueprint Build experience

<a id="UX-B0079"></a>
Build Free first. A participant can finish a truthful, useful starting Blueprint and an actionable next step without paying. “Complete” does not mean every field is Defined for This Season. Taking Shape, Not Yet Explored, and genuine Needs Clarity can remain. Do not prolong intake to fill boxes or decorate Free with locked, supposedly missing pieces.

<a id="UX-B0080"></a>
Free has three export pages: Cover; My North Star; My Starting Plan / My Next Faithful Step. Use the cover title MY CURRENT STEWARDSHIP BLUEPRINT, the descriptor “A living decision guide for the person I am becoming and the life I am building.”, and “Built on Purpose. Designed to Last.” Include only supplied / approved identity, display name, season, and dates where appropriate.

<a id="UX-B0081"></a>
The Starting Plan brings together a useful step and, where truthfully developed, protection, a rhythm, renewal, a drift / return cue, a human-support invitation, a living Legacy beginning, and real questions. One practice may serve several purposes. Do not convert these into seven mandatory assignments, assume another person agrees, or force a thirty-day plan.

<a id="UX-B0082"></a>
#### Full deepens the same Blueprint—without restarting

<a id="UX-B0083"></a>
Carry forward exact approved wording, provenance, scope, states, permissions, and authorized prior work. Use a navigable table of contents with quiet section states and “Continue here.” Conversation order follows relevance and readiness; exported page order remains fixed. Cover and overview are views, not two extra personal-growth assignments. Avoid percentages, race-to-finish language, or automatic state promotion after purchase.

<a id="UX-B0084"></a>
| Full page | Approved title / role |
| --- | --- |
| 1 | MY CURRENT STEWARDSHIP BLUEPRINT — cover and approved personal anchor. |
| 2 | MY NORTH STAR — My whole life in one view. |
| 3 | WHAT I STAND ON — Bedrock / Identity in Christ, Mission, Life Verse or Guiding Scripture, Current Calling, Daily Purpose, Current Season; reference Values without duplicating Page 5. |
| 4 | THE PERSON I AM BECOMING + MY WHY |
| 5 | MY GOVERNING VALUES + DECISION FILTER |
| 6 | MY FOUR PILLARS — Family, Fitness, Fun, Finances together. |
| 7 | MY FINANCES — ENOUGH → FREEDOM → MULTIPLICATION; deeper continuation of the Finances Pillar. |
| 8 | GUARDRAILS — PROTECT WHAT MATTERS |
| 9 | DRIFT + RETURN — RECOGNIZE DRIFT. RETURN QUICKLY. |
| 10 | MY ACCOUNTABILITY PARTNER — actual chosen human support; naming someone does not grant access. |
| 11 | KEYSTONE RHYTHMS — THE RHYTHMS THAT SUSTAIN ALIGNMENT |
| 12 | ENERGY — STEWARD THE FUEL BEHIND THE LIFE |
| 13 | LEGACY — WHAT MY LIFE IS MULTIPLYING |

<a id="UX-B0085"></a>
View / export recommendation: provide a readable document view, explicit current-versus-proposed wording, a preview, and secure self-export. Bind the export to the actual participant and content / template / rights versions. A successful export does not approve content or share it. Preserve legibility and the three- / thirteen-page architecture; ask approval for a shorter rendering rather than silently editing to fit.

<a id="UX-B0086"></a>
Scripture rendering: retain the approved reference and participant-approved significance. Initial Steward output uses reference + original Steward explanation; exact NIV remains unauthorized, with no automatic alternate translation. Apply RIGHTS to display, export, and public assets equally; paid access adds no rights, and notices do not justify extra Blueprint pages.

<a id="UX-B0087"></a>
Source basis: [T4 §§4–10, 13; PJ §§2, 4–5; PRIV O07, O13; RIGHTS §§12–15, D02; BRIEF §10].

<a id="UX-B0088"></a>
### 11. Living Mode experience

<a id="UX-B0089"></a>
Once Build work is useful and Living access is confirmed, shift from intake to living, reviewing, deciding, returning, renewing, and refining. Start with the prior choice and actual reported outcome; distinguish intentions, attempts, and unknown outcomes. Use the Blueprint to guide decisions, not decorate a profile.

<a id="UX-B0090"></a>
| Optional rhythm | Experience recommendation |
| --- | --- |
| Quick Check-In • about 30 seconds–3 minutes | One question about a chosen step, what helped, or today’s priority; allow a deeper conversation. |
| Weekly Blueprint Reset • about 10–15 minutes | Review actual commitments and next week: continue, adjust, protect, or pause. |
| Monthly Energy Review • about 15–20 minutes | Reflect on Spiritual, Physical, Emotional, and Mental capacity; demands, investments, leaks, and renewal. |
| Quarterly Seasonal Review • about 30–45 minutes | Revisit calling, responsibilities, Pillars, financial purpose, protection, and approved seasonal changes. |

<a id="UX-B0091"></a>
These are suggestions, not obligations or guaranteed session lengths. Missing activity means unknown, not failure. No overdue badges, broken streaks, catch-up debt, or dependency cues. Welcome return: “What is most important in this season now?” Never silently renew a time-limited commitment.

<a id="UX-B0092"></a>
Source basis: [PJ §6; T4 §§4, 9, 11–12; CFM4 p.9; BRIEF §11].

<a id="UX-B0093"></a>
### 12. Drift + Return UX

<a id="UX-B0094"></a>
Organize reflection as NOTICE → UNDERSTAND → COMPARE TO BLUEPRINT → CHOOSE RESPONSE. Begin with reported circumstances and the relevant approved direction—not an algorithmic moral warning. Optional copy: “Something may be pulling you away from what you said matters. What has been happening?” Use it only when supported; do not substitute “You are off track.”

<a id="UX-B0095"></a>
The response may be return, simplify, repair, renew, continue, or appropriate human help. Prefer existing Guardrails / Rhythms before adding commitments. A miss, tiredness, low score, or absent app activity does not establish drift. Include ownership / repair for actual harm; safety takes priority. Revised Blueprint wording still requires approval.

<a id="UX-B0096"></a>
Source basis: [T4 §5, Page 9; PJ §§6, 12; SAF §§1–5; BRIEF §12].

<a id="UX-B0097"></a>
### 13. Energy experience

<a id="UX-B0098"></a>
Present Energy as the fuel behind the life, not a health score or productivity battery. Show Spiritual, Physical, Emotional, and Mental Energy with participant-supplied insight. Help distinguish deposits / refilling, meaningful investments, necessary withdrawals, and avoidable leaks. Not every tiring responsibility is a leak; depletion is not automatically drift, weak faith, or failure.

<a id="UX-B0099"></a>
Recommend reflection and one chosen renewal practice before charts. Later Energy Audit access preserves its own instrument and versioned results—not a diagnosis or substitute CFM score. This design enables no connected health, wearable data, or medical interpretation.

<a id="UX-B0100"></a>
Source basis: [T4 §5, Page 12; PJ §6; EA as supporting source via SR4 §3; PRIV, deferred scope; BRIEF §13].

<a id="UX-B0101"></a>
### 14. Legacy experience

<a id="UX-B0102"></a>
Legacy is what a person multiplies in and through others while living. Legacy Giving is modeling, teaching and equipping willing others to practice and pass on generosity during the giver’s lifetime. Lead with people, modeling, teaching, equipping, and living influence—not death, inheritance, estate planning, or wealth transfer.

<a id="UX-B0103"></a>
Ask what a willing person might learn, practice, or pass on. Model + Explain; Practice Together; Entrust + Pass On; Reflect is a flexible practice, not a required program. Never invent willingness or formation. Estate continuity is supporting; wealth and parenthood are unnecessary. Free participants can understand and begin Legacy Giving.

<a id="UX-B0104"></a>
Source basis: [LG pp.1–5; T4 §5, Page 13; PJ §§7–8; BRIEF §14].

<a id="UX-B0105"></a>
### 15. Privacy / trust UX

<a id="UX-B0106"></a>
Place concise cues near the action: “Private to you.” “You choose what becomes part of your Blueprint.” “Steward can suggest; you approve.” “You control what you share.” Link these to accurate processing and exceptional-access explanations. “Private to you” must not imply no service processing, no lawful exceptions, end-to-end encryption, or zero provider retention without evidence.

<a id="UX-B0107"></a>
| Control / cue | Governing boundary translated into UX |
| --- | --- |
| Conversation history | Show Session-only for the initial pilot. Explain what survives separately. No archive of old raw chats and no unapproved history choices. Exact session / retention wording remains review-dependent. |
| Saved continuity | Automatic autobiographical memory is OFF. Show individually selected notes, exact wording, purpose, and review / expiry criterion, with eligible correction / deletion controls. Blueprint approvals remain separate. |
| Sharing / export | Secure participant self-export only initially. No “Share with church,” recipient picker, spouse access, public link, or automatic private-document email. Naming an accountability partner never shares content. |
| Permissions / communications | Keep service processing, Blueprint approval, selected notes, reminders, marketing, sharing, and payment authority separate. Optional generic reminder email only where implemented; no initial SMS / push reminders. |
| Security / account | Make MFA, tested recovery, fresh authentication for specified high-impact actions, data-access / deletion requests, and closure findable without talking to AI. Keep billing cancellation distinct from account closure. |
| Staff / sponsors / analytics | No routine transcript monitoring, private-screen replay, or content-based marketing. No named sponsor activity or private-content feed. Exceptional authorized case access must follow the source controls, not a broad staff inbox. |

<a id="UX-B0108"></a>
Place Privacy & Data Controls one clear step from Account / More, and link it from onboarding and the session notice. Show actual request states—received, in progress, completed with scope, or failed—not instant “everything deleted” claims. Deletion exceptions, provider fit, and lifecycle rules come from the reviewed implementation; no periods or unrestricted forever-storage promise are created here.

<a id="UX-B0109"></a>
Source basis: [PRIV §§4–5, 9, 13, O03–O10, O13; P1-01 G–H; SAF §8; BRIEF §15].

<a id="UX-B0110"></a>
### 16. Safety UX

<a id="UX-B0111"></a>
Keep safety guidance calm, direct, and visibly distinct from ordinary coaching. Depending on the situation, a prominent in-context resource panel can interrupt Blueprint work without turning the whole product into an alarming corporate warning page. Immediate external help must not depend on finishing questions, creating an account, paying, or waiting for a support ticket.

<a id="UX-B0112"></a>
Use reviewed resource components and a verified resource manifest, not model-generated contact details. Keep public static resource access independent of successful model generation, quota, entitlement status, and human customer-support hours. Design a minimal fallback for model / provider / routing failure, plus tested unknown-geography behavior. Any offline fallback is limited to approved, non-private static content with a reviewed update strategy—not a guarantee of connectivity or rescue.

<a id="UX-B0113"></a>
Steward operates autonomously within the separately authorized candidate and controls. Human approval is not needed for normal conversation or approved safety-resource guidance. Do not imply Mike, staff, a church, or a sponsor is monitoring; that emergency services were contacted; that someone will call; or that a safety signal automatically enters a human queue. Actual support and incident accountability remain separate.

<a id="UX-B0114"></a>
Provide Report this response with optional selected, previewed evidence—not an automatically attached transcript. A real case ID appears only after submission succeeds; show actual support coverage without promising immediate review. A safer-device / exit route must not claim it erases traces. After a sensitive conversation, preserve prior approved content; the participant may choose no Blueprint change. Safety responses and resources need specialist review and executed failure-path tests before real use.

<a id="UX-B0115"></a>
Source basis: [SAF §§0.4, 2–3, 6–12 and Appendix E; PRIV O07–O10; BRIEF §16].

<a id="UX-B0116"></a>
### 17. Commercial / upgrade UX

<a id="UX-B0117"></a>
Deliver useful Free value before initiating paid progression. Introduce depth with “Would you like help going deeper?” Explain what Full adds without calling Free inferior, showing guilt-based locks, or treating an assessment score as a sales opportunity. “Not now” dismisses the invitation and immediately returns to a useful Free action, without repeated pressure.

<a id="UX-B0118"></a>
| Approved offer | Price, USD | UX explanation for a later authorized commercial release |
| --- | --- | --- |
| Free | $0 | Useful Free Personal Stewardship Blueprint. No card or Stripe Customer is required. |
| Full Blueprint Build | $149 one time | Guided Full Build; no automatic subscription. Preserve the approved activation / Build-window rules, not an invented purchase countdown. |
| Build + Live With Steward | $299 first year | Prepaid Full Build plus 12 months of Steward. No auto-renew; a later continuation requires a new affirmative choice. |
| Ongoing Steward | $19/month | Qualified continuation after Full; not a cheaper substitute for acquiring the initial Full Build. |
| Annual Steward | $199/year | Qualified annual continuation under the approved commercial terms; not another initial Blueprint depth. |

<a id="UX-B0119"></a>
Later offer detail must show the actual benefits, eligibility, activation, service dates, renewal nature, applicable tax / exact total, cancellation, and refund terms from COM D01–D14. Do not invent discounts, refund promises, or lifetime prices. Returning qualified Full owners should not be pushed to buy the initial Build again. Keep cancellation controls separate from deleting the account or Blueprint.

<a id="UX-B0120"></a>
Never trigger paid offers from crisis, grief, self-harm, abuse, addiction, spiritual doubt, shame, or low scores. Suppression applies to conversation, banners, limits, checkout entry, and reminders—not merely model wording. Access ending does not erase the Blueprint or Free access. An unknown entitlement receives “We can’t confirm this access right now,” not an expiration claim or an instruction to buy again.

<a id="UX-B0121"></a>
The UI reads confirmed entitlements from MJG’s protected service. Stripe records payment facts; the AI cannot grant, refund, renew, or change protected access. Live payment routes must be technically blocked at Levels 0–1, including direct links / APIs and provider routes, not just hidden buttons. The price table above is a design reference, not authorization to transact.

<a id="UX-B0122"></a>
Source basis: [COM §§1–2, D01–D14 and release gates; PJ §§7–8; PRIV O05, O11; SAF §11; BRIEF §17].

<a id="UX-B0123"></a>
### 18. Mobile / PWA experience

<a id="UX-B0124"></a>
Design mobile first and make the main actions easy to reach with one thumb. Recommend four bottom-navigation items: Home | Blueprint | Steward | More. Keep Quick Check-In prominent on Home and inside Steward; More contains the Check-Ins index, Account, Privacy & Data Controls, and Support. Five items give Check-In a dedicated position but duplicate a common entry action and reduce space for readable labels. Validate four first; add a fifth only when observed use justifies it.

<a id="UX-B0125"></a>
Create one responsive application with an installation path and an ordinary browser path that stays fully usable. A later native client may reuse the same service and records. Do not require app-store downloads, voice, push permission, or a separate subscription. Confirm actual device / browser compatibility before making installation promises.

<a id="UX-B0126"></a>
Keep the composer visible above the keyboard; retain accessible Back, Send, and approval controls; respect device safe areas; prevent the bottom bar from covering text or actions. Preserve route / section position where authorized. Fast resume rechecks the session, MFA, and entitlement; it does not reopen expired raw conversation history.

<a id="UX-B0127"></a>
Recommend a non-private offline shell, clear network state, and approved static resources. Do not cache private chats / Blueprints in a service worker or queue offline approvals as a convenience without separate security / lifecycle acceptance. Show “Not sent” or “Not saved” truthfully. Installation is not consent for notifications; initial SMS / push reminders remain disabled.

<a id="UX-B0128"></a>
Source basis: [BRIEF §18; PJ §§14–15; PRIV O03–O04, O09, O13 and §§4, 9; SAF §11].

<a id="UX-B0129"></a>
### 19. Visual design direction

<a id="UX-B0130"></a>
Use generous whitespace, strong typography, architecture-inspired relationships, restrained motion, minimal icons, and a premium editorial feel. Add photography only for useful human context. Avoid robots, neon AI styling, generic SaaS gradients, dense charts, dashboard chrome, and badge collections. Think living journal / book, not church administration.

<a id="UX-B0131"></a>
T4 identifies the established cream, navy, gold, teal, and green family where useful. Reuse approved assets; exact digital colors, logos, typography, and tokens remain an open input. Historical diagrams yield to current architecture / living Legacy. This handoff’s styling is not a brand specification.

<a id="UX-B0132"></a>
Source basis: [BRIEF §19; T4 §13; SR4 §4, BRAND status].

<a id="UX-B0133"></a>
### 20. Accessibility

<a id="UX-B0134"></a>
Provide readable type, good contrast, keyboard navigation, visible focus, semantic headings, labeled controls, screen-reader status announcements, and reduced motion. Recommend approximately 44 × 44 CSS-pixel touch targets as a design target—not compliance certification. Resized text must not clip wording or hide controls.

<a id="UX-B0135"></a>
Give North Star an equivalent structured text reading order. Never encode definition, score, or save status only by color. Use plain errors, predictable dialog / navigation focus, and accessible full proposal wording. Test zoom, keyboard, screen-reader, and mobile-orientation flows on the actual candidate.

<a id="UX-B0136"></a>
Source basis: [BRIEF §20; T4 §13; PRIV and SAF accessibility / review requirements].

<a id="UX-B0137"></a>
### 21. Error / empty / return states

<a id="UX-B0138"></a>
| State | Recommended message / action | Integrity requirement |
| --- | --- | --- |
| First visit / nothing defined | “Let’s begin with what matters to you.” Choose a starting point. | Show all architectural areas without fake personal statements. |
| Taking Shape | “There is something here to explore.” Continue or review wording. | Do not label developing content as approved or failed. |
| Return after weeks / months | “Welcome back. What matters most in this season now?” | No catch-up debt; do not infer drift or restore old raw chats. |
| Provider / API failure | “Steward couldn’t respond just now.” Retry when available. | Keep authorized saved views and independent safety resources usable. |
| Save failed | “This change was not saved.” Review and retry. | Keep current approved content unchanged; distinguish the unsaved draft. |
| Save result unknown | “We’re checking whether this change was saved.” | Reconcile the exact request / version before resubmission. |
| Export failed | “Your export wasn’t created.” Retry or report the problem. | Do not claim a file exists, was delivered, or was emailed. |
| Session expired | “Please sign in again to continue.” | Reauthenticate / MFA as required; explain unsaved work accurately. |
| Entitlement unavailable | “We can’t confirm this access right now.” Retry / support. | Do not infer expiry or ask for another purchase; retain lawful Free access. |
| Offline / network issue | “You’re offline. This message has not been sent.” | No false AI response, hidden private cache, or automatic queued approval. |
| Version conflict | “This wording changed before your update was saved.” Review both. | Require an informed current-version decision; no silent overwrite. |
| Report / deletion request failure | “We couldn’t submit your request.” Retry / alternate support route. | No fake case receipt or deletion completion; show actual confirmed scope. |

<a id="UX-B0139"></a>
Illustrative copy must match actual state. Preserve recoverable drafts only within reviewed session / storage controls; do not promise recovery after session end or clear unsaved work while reporting success.

<a id="UX-B0140"></a>
Source basis: [BRIEF §21; P1-01 F–H; PRIV §§4, 13; COM, action / entitlement controls; SAF §11].

<a id="UX-B0141"></a>
### 22. Website + app screen inventory

<a id="UX-B0142"></a>
Appendix D inventories public discovery, private workflows, Level 1 controls, and later screens. A proposal or export state may be a component rather than a route. Each screen needs a primary action, data / approval state, mobile treatment, and truthful empty / failure behavior.

<a id="UX-B0143"></a>
### 23. Jeremy build priority

<a id="UX-B0144"></a>
First synthetic slice: CFM → account / login → Home → conversation → proposal approval → North Star → Starting Plan → Free view / export, with mobile and failure states. Use invented records and isolated test services only.

<a id="UX-B0145"></a>
Instrumentation boundary: capture approved Admin + Observability telemetry from the start, but keep it separate from participant-facing progress cues unless separately justified.

<a id="UX-B0146"></a>
Before Level 1: privacy / data controls, reporting, independent safety resources, MFA / recovery / step-up, nonpaid entitlement logic, and role-limited owner readiness status. Show candidate / source versions, enabled scope, operational failures, resource verification, and gate evidence—not private transcripts or named sponsor activity.

<a id="UX-B0147"></a>
Release-path separation: public MJG / CFM work may ship independently; authenticated Steward remains closed until the applicable Level 1 release decision.

<a id="UX-B0148"></a>
Later: paid checkout / billing, advanced Full / Living navigation, complex church dashboards, deep ForgedLife integration, native clients, and advanced notifications. Any expressly granted Full / Living feature included in a Level 1 candidate needs its relevant UI and tests before that release; “later” never waives enabled-scope gates.

<a id="UX-B0149"></a>
### 24. Wireframes

<a id="UX-B0150"></a>
Appendix I provides ten functional text wireframes, not final visual assets. Create pending, confirmed, failed, unknown, and conflict variants before polish. Bracketed participant wording remains synthetic; no frame supplies a real approval.

<a id="UX-B0151"></a>
### 25. Handoff, open inputs, and verification

<a id="UX-B0152"></a>
Deliver this DOCX and matching Markdown. Next design outputs: responsive flows, the approval state model, T4 export layouts, and a traceable UX test matrix. Obtain actual brand assets, reviewed pre-account / resume handling, lifecycle notices, support contacts / coverage, provider-fit evidence, and verified resource / entitlement configuration. No missing value is assumed.

<a id="UX-B0153"></a>
Document review: architecture, living Legacy, useful Free value, participant approval, private MJG home, and ForgedLife’s community role are preserved. No new price, Scripture rule, monitoring model, or native requirement is introduced. This review proves no implementation, specialist clearance, or executed test. Real participants and payments remain unauthorized; Appendix G does not replace SAF Appendix E. This update also preserves a value-first CFM-to-account handoff, separate public/private release paths, and separation of owner analytics from participant progress cues.

<a id="UX-B0154"></a>
#### Source key and authority

<a id="UX-B0155"></a>
References identify current Project Sources, independent of upload suffix or format copy. Their sections / pages supply the governing basis, not this brief.

<a id="UX-B0156"></a>
| Key | Source identity / scope |
| --- | --- |
| BRIEF | Owner’s 25-part Digital Experience creation instructions, September 14, 2026; requested task / UX direction. |
| T4 / PJ | Personal Stewardship Blueprint Template v4; Product Journey and Progression Standard v0.1. Approved September 11, 2026; structure / journey. |
| CFM4 / LG | Created for More Check-In v4 Printable, revised September 11; approved current assessment. Legacy and Legacy Giving Standard v1; living-multiplication authority. |
| P1-01 / PRIV | Production Data Architecture v1 (approved September 11); P1-02 + P1-03 Privacy, Security, Consent + Sharing v0.1 (September 12, 2026). |
| SAF / COM / RIGHTS | P1-07 + P1-08 + P1-10 Safety, Support + Real-Participant Release; P1-04 + P1-05 + P1-06 Commerce, Payments + Entitlement; P1-09 Scripture + Publication Rights. All v0.1, approved September 12, 2026 within scope. |
| CTX3 / SR4 | Context and Decisions v3; Source Register and Review Queue v4. Approved September 11; maintenance September 12, 2026. Navigation / routing only. |
| OI4 / support | Operating Instructions v0.4 is the approved general fictional baseline; Sensitive Conversations v0.3 stays separate; Statement of Faith unchanged. BRAND Draft v1 and Energy Audit (EA) are supporting sources. |

<a id="UX-B0157"></a>
Source basis: [SR4 §§1–4, 8–9; CTX3 §§15–16; governing approval scopes; BRIEF §§22–25].

<a id="UX-B0158"></a>
HANDOFF REGISTERS  /  A–C

<a id="UX-B0159"></a>
### A. Experience Principles

<a id="UX-B0160"></a>
Meaning before mechanics: orient and act, not finish forms. One living record: coherent Free, Full, North Star, and export views. Visible agency: AI suggests; participant approves; system records truthfully. Return without shame: absence is not a moral diagnosis. Privacy at the action: explain saving and export. Free value first: no distress-based sales. Real life first: human connection, renewal, and living multiplication beyond the interface.

<a id="UX-B0161"></a>
Source basis: [T4 §§1–4, 6–13; PJ §§1–3, 8, 12–14; PRIV; SAF; BRIEF].

<a id="UX-B0162"></a>
### B. Website Information Architecture

<a id="UX-B0163"></a>
Route strings below are recommendations, not deployed URLs. Retain the source-published /created-for-more-check-in path. Avoid private text, scores, names, or tokens in route strings.

<a id="UX-B0164"></a>
PUBLIC
/                              Home (MJG brand link)
/stewardship-blueprint          Framework + sample North Star
/steward                       Meet Steward / how it works
/tools                         Tools index
  /created-for-more-check-in    Landing → questions → results
  /energy-audit                 Available approved resource
  /values                       Available approved resource
/books-studies                 Books + Studies → detail pages
/churches                      Church / group pathway
/about                         About Mike (utility + menu + footer)
/login | /create-account       Authorized account entry
/privacy | /terms | /support | /safety-resources

PRIVATE, AUTHENTICATION / AUTHORIZATION REQUIRED
/app                           Home / My Stewardship
/app/blueprint                 Current guide + Free / Full views
  /app/blueprint/north-star     My North Star
  /app/blueprint/starting-plan  My Starting Plan
  /app/blueprint/section/...    Blueprint section detail
/app/steward                   Current-session conversation / proposals
/app/check-ins                 Check-In entry / authorized result records
/app/account                   Account → privacy / security / data controls
/app/support                   Report a problem / permitted case status

<a id="UX-B0165"></a>
Use one primary Check-In CTA. Private section links may open panels. Safety resources remain reachable without authentication; private reports and data controls stay protected. Public availability / data collection still require applicable reviews.

<a id="UX-B0166"></a>
### C. Participant Journey Map

<a id="UX-B0167"></a>
| Stage | Participant outcome | Primary transition / integrity check |
| --- | --- | --- |
| Discover | Understand the framework / starting point. | Home → CFM; whole-life, not clinical or generic AI. |
| Notice | Useful versioned reflection. | Results → chosen step; lowest score does not select the priority. |
| Choose Steward | Understand AI / saved work. | Account, consent, required security; results are not signup-gated. |
| Build Free | Useful North Star / Starting Plan. | Approve → confirmed save → coherent three-page view; no payment. |
| Go deeper | Extend the same Blueprint. | Confirmed Full access; no repeated intake or automatic renewal. |
| Live / return | Review, renew, refine. | Optional entitled support; no guilt or silent commitments. |
| Study branch | Group first, then personalize. | Compass’s post-study benefit when released; no cold-user delay. |

<a id="UX-B0168"></a>
Source basis: [PJ §§2–6, 14, 16; CFM4 pp.6–10; PRIV O01–O13; COM; SAF §16].

<a id="UX-B0169"></a>
HANDOFF REGISTERS  /  D–E

<a id="UX-B0170"></a>
### D. Screen Inventory

<a id="UX-B0171"></a>
S = synthetic slice; L1 = complete before applicable Level 1; P = public-site proposal with publication / availability review; Later = separately gated. No row asserts implementation.

<a id="UX-B0172"></a>
| IDs / screens | Stage | Purpose / primary action |
| --- | --- | --- |
| P01 Home | P | What / why / start → Created for More. |
| P02 Stewardship Blueprint; P03 Steward | P | Framework / AI guide → CFM or authorized Free entry. |
| P04 CFM Landing; P05 Questions; P06 Results | S | Exact instrument → useful reflection → chosen step. |
| P07 Energy Audit; P08 Values | P | Available approved resources; deeper digital work later. |
| P09 Books / Studies; P10 Churches; P11 About | P | Approved resource, group, and author information. |
| P12 Login / Create Account | S/L1 | Account / consent / invitation → MFA-protected private access. |
| P13 Policies; P14 Public Safety Resources | L1 | Find service information / model-independent resources. |
| A01 Home / My Stewardship | S | Approved orientation → next useful action. |
| A02 My North Star; A03 My Blueprint | S | Whole-life overview / current guide → detail / export. |
| A04 Steward Conversation | S | Current-session guidance → reflection / proposal. |
| A05 Proposal Approval component | S | Exact wording → approve / edit / not yet; truthful states. |
| A06 Starting Plan | S | Useful step and supported protection / renewal / return. |
| A07 Check-In; A08 Blueprint Section Detail | S* | Brief reflection / focused review within confirmed scope. |
| A09 Export | S/L1 | Correct version → step-up → secure self-export / failure. |
| A10 Account; A11 Privacy / Data Controls | L1 | Selected notes, permissions, data requests, closure. |
| A12 Support / Report Problem | L1 | Selected evidence → actual case receipt / coverage. |
| A13 MFA / Recovery / Step-up | L1 | Tested private-access and high-impact protections. |
| O01 Owner Release / Service Status | L1 | Role-limited readiness / operational facts; no transcripts. |
| L01 Upgrade; L02 Billing | Later | Approved offers, activation, cancellation, reconciliation. |
| L03 Full Build Progress; L04 Living Reviews | Later* | Full navigation / deeper review, not completion pressure. |
| L05 Sponsored Cohort Status | Later* | Participant benefit / dates; no named sponsor feed. |
| L06 ForgedLife Connection | Later | Authorized linking / selected transfers; no private sync by default. |

<a id="UX-B0173"></a>
*Advanced depth is later. Any expressly granted Full / Living capability needs its applicable UI / tests before a Level 1 candidate includes it. A nonpaid sponsored cohort still has separate gates.

<a id="UX-B0174"></a>
### E. Mobile Navigation Recommendation

<a id="UX-B0175"></a>
Recommend Home | Blueprint | Steward | More. Put Quick Check-In on Home and within Steward; More holds Check-Ins, Account, Privacy & Data Controls, and Support. Show labels / active state and direct Back in details. Validate four items before adding a fifth Check-In tab.

<a id="UX-B0176"></a>
Desktop keeps My Blueprint, Steward, Check-Ins, and Account; the brand returns Home. Test thumb reach, keyboard overlap, resized text, and back / resume in browser and installed modes. Installation never implies push permission or persistent raw-chat history.

<a id="UX-B0177"></a>
Source basis: [BRIEF §§18, 22–23; PJ §§2, 14, 16; PRIV; SAF §16; COM].

<a id="UX-B0178"></a>
HANDOFF REGISTERS  /  F–H

<a id="UX-B0179"></a>
### F. First Vertical Slice UX Checklist

<a id="UX-B0180"></a>
Unexecuted UX work: demonstrate with synthetic fixtures and record actual candidate, fixture, result, defect, reviewer, and date. This list reports no passed tests.

<a id="UX-B0181"></a>
[ ] Scope: a visible synthetic environment, invented participants, isolated test services, and denied real enrollment / payment / emergency actions.

<a id="UX-B0182"></a>
[ ] Gateway: exact CFM4 items / scale / scoring, incomplete-answer handling, accessible Back / Next, useful results before account or upgrade, and no automatic lowest-score priority.

<a id="UX-B0183"></a>
[ ] Continuity: reviewed account handoff, versioned assessment context, purposeful Home, and no repeated intake or invented biography / beliefs.

<a id="UX-B0184"></a>
[ ] Approval: separate proposal card; approve / edit / not-yet branches; exact-version confirmation; pending / failed / unknown / conflict states; no unapproved Blueprint write.

<a id="UX-B0185"></a>
[ ] Coherent Free guide: all Four Pillars, explicit Drift + Return, living Legacy, one useful Starting Plan, and a legible three-page export from the same approved record.

<a id="UX-B0186"></a>
[ ] Return and mobile: honest Taking Shape / empty states, session expiry, provider / network / export failures, keyboard-safe navigation, basic screen-reader / keyboard flow, and no persistent raw-chat assumption.

<a id="UX-B0187"></a>
[ ] Evidence: isolate two synthetic accounts and exclude private payloads from logs. Screenshots / fictional approvals do not establish production-control passes.

<a id="UX-B0188"></a>
### G. Level 1 UX Checklist

<a id="UX-B0189"></a>
UX evidence inputs to SAF Appendix E—not a competing release checklist. All applicable core gates and the separate release decision remain required.

<a id="UX-B0190"></a>
[ ] Entry and protection: invitation-only Arizona-first / adults-18+ scope, required MFA before private access, tested recovery, and specified export / deletion / closure / security-change step-up.

<a id="UX-B0191"></a>
[ ] Privacy controls: accurate session-only notice and end review; automatic memory OFF; individually selected notes with review / correction / deletion; independent permissions and truthful data-request status.

<a id="UX-B0192"></a>
[ ] Safe assistance: reviewed static resources work without the model, quota, payment, login, or support availability; unknown geography, failure, reporting, selected evidence, and safer-exit behavior tested.

<a id="UX-B0193"></a>
[ ] Operational truth: actual support contacts / coverage / case receipts, no monitoring or rescue promises, autonomous AI availability stated separately, and role-limited owner operational status.

<a id="UX-B0194"></a>
[ ] Nonpaid access: confirmed approved grant and service dates, unknown / expired entitlement branches, retained Blueprint / Free rights, and backend / provider payment blockade. The six-week review envelope is not a grant term.

<a id="UX-B0195"></a>
[ ] Candidate evidence: provider-fit / ZDR posture, lifecycle notices, independent security / specialist reviews, reference + original Scripture explanation, accessibility, applicable source tests, and stop-ship criteria.

<a id="UX-B0196"></a>
[ ] Authorization: SAF’s initial direction is up to three adults, possible expansion to no more than ten total only after its documented checkpoint, within a six-week review envelope. None is enrollment authority today.

<a id="UX-B0197"></a>
### H. Deferred UX Features

<a id="UX-B0198"></a>
Defer paid checkout / billing until paid-release gates; complex Living / church dashboards; deep ForgedLife flows; connected health; voice; native apps; persistent raw-chat archives; built-in third-party sharing; and advanced notifications. No initial SMS / push reminders, participant-content research / training, named sponsor feeds, or automatic emergency contact.

<a id="UX-B0199"></a>
Later Compass path: participants receive post-study Full Build + 60 days of Steward from activation; leaders receive their distinct Full Build + 12-month entitlement. No card or auto-renew. Show confirmed dates; preserve the Blueprint / Free afterward. Do not universalize Compass terms or turn preferred activation timing into forfeiture.

<a id="UX-B0200"></a>
Source basis: [BRIEF §23; PRIV O01–O13; SAF §§16–18 and Appendix E; COM release gates; RIGHTS D01–D06; PJ §16.8].

<a id="UX-B0201"></a>
HANDOFF REGISTER  /  I

<a id="UX-B0202"></a>
### I. Low-Fidelity Wireframes

<a id="UX-B0203"></a>
Functional layout guides only. All screens below are design / synthetic previews, not a launched product. Square brackets identify controls or variable content. Content / entitlement / availability come from the application; sample copy does not establish personal facts or approvals. Mobile layouts reflow rather than shrinking these frames.

<a id="UX-B0204"></a>
#### A — Public Home

<a id="UX-B0205"></a>
MJG brand → Home                 About Mike   Sign In
Blueprint | Steward | Tools | Books + Studies | Churches
--------------------------------------------------------
DESIGN A LIFE THAT MATTERS
A whole-life framework for designing a life that matters.
[Created for More Check-In]       Meet Steward
28 statements • Seven layers • About 15 minutes

[Restrained framework illustration / approved asset]
What it is → Why it matters → Where to begin

[Sample North Star — clearly labeled example]
STEWARDSHIP BLUEPRINT = framework | STEWARD = AI guide
Books + Studies                  Church / Group pathway
--------------------------------------------------------
About | Privacy | Terms | Support | Safety resources

<a id="UX-B0206"></a>
Behavior: the Check-In is the single primary cold-user action. Use approved availability copy. A sample never looks like the visitor’s generated Blueprint; existing book / study links do not enable Steward checkout.

<a id="UX-B0207"></a>
#### B — Created for More landing

<a id="UX-B0208"></a>
← Back to MJG                         Privacy information
CREATED FOR MORE CHECK-IN
A Stewardship Blueprint Assessment
Pause. Notice what is working and what deserves attention.
28 statements • Seven layers • About 15 minutes

[How the seven layers connect]     [How responses are used]
A reflection—not a pass / fail test or a verdict.
Your results do not automatically become Blueprint wording.

[Begin the Check-In]               Already started? [Sign In]*
*Resume only where a reviewed, implemented saved flow exists.
You can receive useful results before creating an account.

<a id="UX-B0209"></a>
Question state: layer name → exact statement → five labeled choices → Back / Next. Announce statement position and keep incomplete scores incomplete. Save / Resume never implies an unapproved anonymous retention mechanism.

<a id="UX-B0210"></a>
#### C — Created for More results

<a id="UX-B0211"></a>
YOUR BLUEPRINT SNAPSHOT                  [Review responses]
Created for More v4 • [date] • Reflection, not a label
[Supported total / 140 + source reflection category]

Bedrock [score / 20]       Foundation [score / 20]
Four Pillars [score / 20]  Guardrails [score / 20]
Keystone Rhythms [ / 20]   Energy [ / 20]   Legacy [ / 20]
[Explore layer meaning / source reflection language]
Four Pillars detail, when useful: Family | Fitness | Fun | Finances

What do you notice? [reflection]  What matters now? [choice]
A useful next step: [participant choice / clearly labeled option]
Would you like Steward to help you turn what you noticed
into your first Stewardship Blueprint?
[Save my results + Build my Free Blueprint]        [Use my starting step for now]

<a id="UX-B0212"></a>
Behavior: preserve ties and missing-score states. No “lowest score = priority,” diagnosis, upgrade banner, or registration wall. Results remain assessment evidence until exact Blueprint wording is separately proposed and approved. Account creation follows useful results as the explicit save-and-continue choice; it is not required to unlock the results themselves.

<a id="UX-B0213"></a>
Source basis: [BRIEF §§3–6, 24; CFM4 pp.1–7; PJ §§2–3; PRIV O03–O05, O10].

<a id="UX-B0214"></a>
HANDOFF REGISTER  /  I • CONTINUED

<a id="UX-B0215"></a>
#### D — Authenticated Home

<a id="UX-B0216"></a>
MJG / Steward → Home     My Blueprint | Steward | Check-Ins | Account
MY STEWARDSHIP                                      Privacy & Controls
[Approved Current Season, if defined]

MY NORTH STAR — My whole life in one view.
[Compact whole-life architecture • all four Pillar labels]
[Open My North Star]

MY NEXT FAITHFUL STEP
[Exact approved step, or “Choose a starting point”]
[Continue where I left off: confirmed area / review]

[Check In With Steward]                         [Open My Blueprint]
[Optional proposal: Ready for your review — not yet saved]

<a id="UX-B0217"></a>
Behavior: three visual groups, not a widget wall. Resume uses authorized approved content / selected notes and actual workflow state. No invisible reconstruction of prior raw chat. A season or action is not populated from inference.

<a id="UX-B0218"></a>
#### E — My North Star

<a id="UX-B0219"></a>
MY NORTH STAR                           [Open section] [Back]
My whole life in one view.               [Season / version]
                  LEGACY
          [approved living-multiplication anchor]
                   ENERGY
              [approved renewal direction]
               KEYSTONE RHYTHMS
                [approved concise rhythm]
     | FAMILY  | FITNESS | FUN     | FINANCES |
 G   | [words] | [words] | [words] | [words]  |   G
 U   | [state] | [state] | [state] | [state]  |   U
 A   +-------------------------------------+   A
 R       FOUNDATION — Mission + Values + Direction  R
 D                [approved concise direction]     D
 R             BEDROCK — Faith + Identity          R
 A                [approved personal anchor]       A
 I   [Guardrail protection / approved concise cue]  I
 L                                                 L
 S                                                 S
DRIFT + RETURN [compact cue]   CURRENT FOCUS [if approved]
MY NEXT FAITHFUL STEP [approved wording, if defined]

<a id="UX-B0220"></a>
Behavior: architecture is conceptual, not final drawing geometry. Use discreet text states and exact approved excerpts. Mobile keeps the four Pillar labels together in a readable orientation, with detail below; tablet opens detail below the structure. The exported overview is one legible page, not a screenshot of a long mobile screen.

<a id="UX-B0221"></a>
#### F — Steward Conversation

<a id="UX-B0222"></a>
← My Stewardship                  Steward • AI guide
Current work: [Free Build / Full Build / Living, confirmed]
Session-only conversation                  [What is saved?]
[Listen First] [Help Me Think] [Help Me Take a Step]
----------------------------------------------------------
[Relevant approved anchor or participant-chosen starting point]
STEWARD: [One useful reflection / question]
YOU:     [Current-session response]
[Distinct proposal card when relevant — see G]
----------------------------------------------------------
[Write your response...                               ] [Send]
[Review saved items / End session]   [Report this response]
[Safety resources — accessible without successful AI]

<a id="UX-B0223"></a>
Behavior: no robot, human-agent presence signal, transcript archive, or implied monitoring. The keyboard must not cover Send, proposal controls, or the safety-resource route. Ending the session does not require saving a memory note.

<a id="UX-B0224"></a>
Source basis: [BRIEF §§7–9, 24; T4 §§4–8; PJ §2; PRIV O03–O04; SAF §§8, 11–12].

<a id="UX-B0225"></a>
HANDOFF REGISTER  /  I • CONTINUED

<a id="UX-B0226"></a>
#### G — Blueprint Proposal Approval Card

<a id="UX-B0227"></a>
STEWARD SUGGESTS                       PROPOSED • NOT SAVED
Destination: Family / current-season direction
Current: [exact existing wording, when replacing]
Proposed: “My current Family priority is [participant wording].”
Scope: [season / time limit, when applicable]
[Approve]                 [Edit]                 [Not Yet]
Saving… → [only after confirmation: Saved to Family • version]
Failed / unknown / conflict → review / reconcile; no false success.

<a id="UX-B0228"></a>
Edit requires approval of the final version. Not Yet changes no current Blueprint wording. A separate continuity-note card uses “Save this note” and explains its purpose; it does not reuse Blueprint approval as memory or sharing permission.

<a id="UX-B0229"></a>
#### H — Free Blueprint / Starting Plan

<a id="UX-B0230"></a>
MY CURRENT STEWARDSHIP BLUEPRINT         [Version / season]
[Cover]           [My North Star]           [My Starting Plan]
A living decision guide for the person I am becoming
and the life I am building.       Built on Purpose. Designed to Last.

MY STARTING PLAN / MY NEXT FAITHFUL STEP
Current focus [approved]       Next faithful step [approved]
Protection / Rhythm / Renewal [supported approved content]
Drift sign → Return response  [supported approved content]
Human invitation / Living Legacy beginning [if developed]
Needs Clarity [actual question]    Review point [if agreed]
[Review wording] [Open North Star] [Preview secure self-export]
Useful now; no need to fill every area or purchase Full.

<a id="UX-B0231"></a>
The exported Free guide has exactly three pages. One practice may serve several functions. Export is a participant-only download after required step-up, not a share, an email, or proof of approval.

<a id="UX-B0232"></a>
#### I — Mobile navigation

<a id="UX-B0233"></a>
[Screen title]                         [Back, when needed]
[Readable content, reflowing at larger text sizes]
[Primary screen action / keyboard-safe composer]
----------------------------------------------------------
   HOME          BLUEPRINT          STEWARD          MORE
Home: Quick Check-In       More: Check-Ins / Account / Privacy / Support
[Device safe area; no content or approval buttons hidden underneath]

<a id="UX-B0234"></a>
Four items recommended. A fifth Check-In tab is a validation option, not initial scope. Install / browser paths use the same record; installation is not push permission or a promise of offline private access.

<a id="UX-B0235"></a>
#### J — Privacy / Data Controls

<a id="UX-B0236"></a>
← Account                      PRIVACY & DATA CONTROLS
What is saved?    [Blueprint content] [Assessment records]
Conversation: SESSION-ONLY      [How this works / actual policy]
Automatic memory: OFF           [Selected continuity notes]
  [Exact note + purpose + review criterion] [Edit] [Delete eligible note]
Permissions                    [Review required / optional purposes]
Reminders: [generic email, only if enabled]   Marketing: [separate choice]
Data: [Secure self-export] [Request my data] [Deletion request]
Security: [MFA] [Recovery]      Account: [Close account]
[Actual request / confirmation status]     [Support / safety resources]
No third-party share button; billing cancellation is a separate control.

<a id="UX-B0237"></a>
Controls work without asking Steward. Show fresh-authentication steps for high-impact actions and actual deletion / retention scope. No unapproved history toggle, SMS / push reminder option, staff conversation browser, or sponsor access is introduced.

<a id="UX-B0238"></a>
Source basis: [BRIEF §§9–10, 15, 18, 24–25; T4 §§4–10; P1-01 F–H; PRIV O03–O10, O13; COM; SAF].

### Preserved supplementary part: word/header1.xml

	STEWARD + MJG  /  DIGITAL EXPERIENCE	IMPLEMENTATION BRIEF v1

### Preserved supplementary part: word/footer1.xml

	DESIGN / ENGINEERING HANDOFF — NOT A GOVERNING STANDARD	

<!-- END_SOURCE UX -->

## Preserved source module ADMIN
**Original source:** `Steward_Admin_and_Observability_Implementation_Brief_v1.docx`  
**Original status:** Engineering handoff v1; September 14, 2026; not a governing standard  
**Source class / role:** IMPLEMENTATION BASELINE / Engineering or website handoff; not a governing standard  
**Preservation form:** Original file bytes plus full structural text  
**Input SHA-256:** `01f7cf9a199c5fa2afcc7f6be40971655b1545339bbfe19f7506037a80b60124`
The source text below retains its own original terminology, approval labels, internal references and limitations. The draft wrapper does not upgrade it or adopt superseded references as current. Figures and native page layout remain in the preserved original; reference assets are not runtime-approved content.
<!-- BEGIN_SOURCE ADMIN -->

<a id="ADMIN-B0001"></a>
STEWARD / ENGINEERING HANDOFF

<a id="ADMIN-B0002"></a>
STEWARD ADMIN + OBSERVABILITY
IMPLEMENTATION BRIEF v1

<a id="ADMIN-B0003"></a>
Status: ENGINEERING IMPLEMENTATION / HANDOFF — NOT A GOVERNING STANDARD

<a id="ADMIN-B0004"></a>
Prepared for Jeremy • Product Owner: Michael J. Gauthier
Prepared September 14, 2026 • Source baseline: current approvals through September 12, 2026

<a id="ADMIN-B0005"></a>
#### Purpose

<a id="ADMIN-B0006"></a>
Give Jeremy the instrumentation contract needed from the first synthetic vertical slice. Michael J. Gauthier should be able to understand usage, Created for More and Blueprint progression, reported usefulness, technical and source accuracy, safety-control health, release changes, errors and provider costs—without routinely reading private conversations. [BRIEF]

<a id="ADMIN-B0007"></a>
Current boundary: synthetic/internal implementation only. This brief does not authorize real participants, live consumer payments, exact NIV functionality or a production release. It neither amends a governing source nor records implementation, test execution, specialist approval or licensing evidence.

<a id="ADMIN-B0008"></a>
### 1. Design principle

<a id="ADMIN-B0009"></a>
Instrument Steward from day one; build the data capture and event model now. A polished executive dashboard is not part of the first synthetic slice. Use the four delivery layers below. “Build now” means implement and test with fictional fixtures, not activate real-data collection. [BRIEF; REG, §§1–2, 9]

<a id="ADMIN-B0010"></a>
| Layer | Deliverable / timing |
| --- | --- |
| A — Capture now | Typed event allowlist, protected audit/receipt paths, usage and cost adapters, version manifests, synthetic test records and retention hooks. |
| B — Debug now | Small authenticated internal view of synthetic accounts, workflow states, proposals/approvals, entitlements, errors, costs and executed test evidence. |
| C — Before Level 1 | Simple owner dashboard and reviewed access, aggregation, alerting, lifecycle and release-evidence connections for the authorized scope. |
| D — After validation | Only appropriately approved richer analytics. Do not build a warehouse, broad staff console or experimentation platform now. |

<a id="ADMIN-B0011"></a>
Measure useful stewardship, not dependence: usefulness, alignment, truthful completion, reliability, safety, real-world action and return. Chat volume, session length, screen time and frequency are operational context—not faithfulness or product success. Listening may be a useful outcome without a new task. [PJ, §§1, 20; OI, §§1, 5]

<a id="ADMIN-B0012"></a>
#### Reading map

<a id="ADMIN-B0013"></a>
Pages 2–8: implementation requirements and governing references. Pages 9–10: event taxonomy. Page 11: permissions. Page 12: Level 1 fields. Pages 13–14: release and test schemas. Page 15: Jeremy’s checklists and document-boundary review.

<a id="ADMIN-B0014"></a>
### 2. Admin / owner access

<a id="ADMIN-B0015"></a>
Michael J. Gauthier is Product Owner. Provide a role-based owner view of authorized aggregate usage, journey, quality, safety, health, cost and release data. Entitlement/account status is available only through a separately permissioned, purpose-limited operational route. Owner status is not blanket permission to inspect private records. [PRIV, §2/O12; SAF, D04/D08]

<a id="ADMIN-B0016"></a>
Do not implement routine real-conversation search, transcript browsing, hidden sampling, participant impersonation or private-Blueprint inspection in the owner console. Jeremy’s synthetic content debug permissions must not carry into real environments. Appendix B specifies the permissions boundary. Exceptional content access follows the existing case process, independent authorization and audit logging. [P1-01, C/H/I; PRIV, §2/P20; SAF, §8]

<a id="ADMIN-B0017"></a>
#### Governing reference map

<a id="ADMIN-B0018"></a>
The keys below identify current document titles and versions, not upload suffixes or format copies. Authority is issue-specific. These references govern; this brief translates them into engineering contracts. [CTX; REG, §§2–4]

<a id="ADMIN-B0019"></a>
| Key / current source | Authority and relevant scope |
| --- | --- |
| P1-01 — Production Data Architecture v1 | Approved architecture, Sept. 11. M.A and A–R; classes, provenance, approval, audit, lifecycle. M.B/N gates remain; M.C disabled. |
| PRIV — P1-02 + P1-03 Privacy, Security, Consent + Sharing v0.1 | Approved standard, Sept. 12. O01–O13; §§2, 4, 9–13, 17; P20; allowlist, access, retention and provider-fit gates. |
| SAF — P1-07 + P1-08 + P1-10 Safety, Support + Real-Participant Release v0.1 | Approved standard, Sept. 12. D01–D08; §§8–18; PS tests, Appendix E release checklist and SS stop-ship register. |
| COM — P1-04 + P1-05 + P1-06 Commerce, Payments + Entitlement v0.1 | Approved standard, Sept. 12. D01–D14; authoritative grants, payment separation, CE tests and RG gates. |
| RIGHTS — P1-09 Scripture + Publication Rights v0.1 | Approved standard, Sept. 12. D01–D06; reference-only posture, serving-source rights, SR tests and PG gates. |
| T4 — Personal Stewardship Blueprint Template v4 | Approved governing standard, Sept. 11. §§3–10, 12–13: structure, states, approval, Free/Full and exports. |
| PJ — Product Journey and Progression Standard v0.1 | Approved governing standard, Sept. 11. §§2–7, 16, 19–20: progression, entitlements, ethical engagement and success. |
| OI — Operating Instructions v0.4; SC — Sensitive Conversations &amp; Safety Standards v0.3 | OI: approved general fictional-test baseline, Sept. 11. SC: separate unchanged safety working-test baseline. Neither is production certification. |
| CFM — Created for More Check-In v4 | Approved current assessment specification, revised Sept. 11. Instrument, completion/scoring distinctions and gateway. |
| CTX — Context and Decisions v3; REG — Source Register and Review Queue v4 | Approved current context/source control; Sept. 12 maintenance synchronization. Route authority; preserve open evidence and release work. |

<a id="ADMIN-B0020"></a>
Additional authority: Statement-of-Faith.txt (SF) remains the exact unchanged doctrinal baseline; Legacy and Legacy Giving Standard v1 (LG) governs living multiplication. BRIEF means the owner’s attached Admin + Observability creation instructions. No earlier draft, historical bibliography or working-test label overrides later approved authority.

<a id="ADMIN-B0021"></a>
### 3. Active user / session metrics

<a id="ADMIN-B0022"></a>
The defaults below are engineering measurement definitions, not participant policy. Version them as metric_definition_version. The 5-minute presence and 30-minute analytics-session windows are synthetic implementation defaults; they do not define transcript retention, account expiry, billing allowances or a production session policy. Apply PRIV’s existing review before real collection. [BRIEF; PRIV, §4/O03/O10]

<a id="ADMIN-B0023"></a>
| Metric | Definition and limits |
| --- | --- |
| Online now — approximate | Distinct authenticated participants with a purposeful first-party action in the last 5 minutes. Maintain only a transient last-activity projection; no timestamp timeline or named online roster. Background refresh, polling and passive open tabs do not count. |
| Active workflow sessions | Count non-ended conversation, Blueprint Build and CFM workflow sessions with qualifying activity in the same window. Count distinct workflow IDs; show their types separately. These populations can overlap and must not be added as unique people. |
| DAU / WAU / MAU | Distinct authenticated participants with qualifying product use today / today plus 6 prior days / today plus 29 prior days. Store times in UTC; display UTC, cutoff and the partial current day. Exclude synthetic, admin, bot and health-probe traffic. |
| New / returning / sessions per user | New accounts: confirmed creation in the period. New active: first qualifying use falls in the period. Returning: active in the period with known use before its start. If prior history is unavailable, label unknown. Sessions/user = sessions ÷ active participants in that period. |
| Session and retention handling | End an analytics session on explicit end/logout or 30 minutes of inactivity; infer only an end, never successful completion. Retention = eligible starter cohort returning in a stated later window ÷ starters with that full observation window; show n/N and missing history. No mandatory return target. |

<a id="ADMIN-B0024"></a>
Qualifying use includes an authenticated conversation action, CFM start/results use, Blueprint work/approval or participant-requested export—not a failed login, token refresh or backend retry. Deduplicate multiple tabs for user counts. Accountless CFM is counted as attempts, not unique people; do not add login requirements, fingerprinting or cross-site tracking merely for analytics. Unknown coverage or zero denominator displays “Not enough data,” not 0%.

<a id="ADMIN-B0025"></a>
### 4. Participant journey events

<a id="ADMIN-B0026"></a>
Use Appendix A’s explicit allowlist and typed payloads. The server supplies environment, identity scope, version and canonical outcomes. Client signals can report presentation or intent; they cannot declare an approval, entitlement or save successful. All event definitions specify producer, trigger, permitted fields, destination, purpose and lifecycle. [P1-01, I; PRIV, §9]

<a id="ADMIN-B0027"></a>
Pipeline: authorized domain transaction → minimal audit/outbox entry → validated event projection → bounded aggregates → permissioned admin view. Commit required approval/grant evidence with the state change. Retry projections idempotently using stable event IDs; reconcile source counts, duplicate/drop counts and queue age. Reject extra fields before transmission; never retain rejected private values in a dead-letter queue.

<a id="ADMIN-B0028"></a>
Analytics failure must not block approved safety-resource guidance or fabricate an action failure after a real commit. Show stale/incomplete telemetry. A mutation requiring an authoritative receipt must not claim success when that transaction failed. Journey milestones follow T4/PJ’s confirmed workflow state: Free completion is a useful whole-life starting Blueprint and next step, not every field defined, an export click or more chat. [PJ, §4.2]

<a id="ADMIN-B0029"></a>
### 5. Conversation quality

<a id="ADMIN-B0030"></a>
Keep four dimensions separate. Do not publish a single artificial “Steward accuracy percentage.” Every metric shows its definition, denominator, period, environment, applicable release and coverage. Distinguish participant reports, application facts and synthetic judgments. [BRIEF; PJ, §§19–20; PRIV, O10]

<a id="ADMIN-B0031"></a>
#### A. Participant-reported usefulness

<a id="ADMIN-B0032"></a>
Provide optional Helpful / Not Helpful feedback without requiring a rating after every conversation. Count one current response per feedback target; a changed response replaces its contribution rather than adding a second vote. Show helpful count, not-helpful count and response count. Helpful share = helpful ÷ submitted binary ratings; it is not a rating of all conversations. Nonresponse is unknown. Keep any optional explanation in the authorized support/evidence route, not analytics.

<a id="ADMIN-B0033"></a>
Reserve “Did this help you know what to do next?” for later reviewed measurement. Do not require task creation, positive feedback or an upgrade to finish a conversation. Do not infer life alignment from usage, assessment score, subscription or a model’s sentiment analysis. [OI, §5; CFM; PRIV, O10]

<a id="ADMIN-B0034"></a>
#### B. Blueprint quality signals

<a id="ADMIN-B0035"></a>
| Signal | Calculation / interpretation |
| --- | --- |
| Proposal approval, edit and rejection | For a stated presentation cohort, count distinct presented proposal versions with a confirmed approval, participant edit or explicit rejection ÷ distinct presented versions. Report pending/no response separately. Editing and later approval may overlap; percentages need not sum to 100. |
| Approved revisions / completion | Count committed participant-approved revision IDs and confirmed Blueprint milestones. Report original completions separately from revisions/rebuilds. Approval is evidence of participant choice—not objective correctness or real-world practice. |
| Return vs new commitments | Count explicit structured selection of an existing Guardrail/Rhythm versus a new proposal, only where the product workflow actually supplies that signal. No text mining. Whether a new commitment was unnecessary is a synthetic rubric judgment, not an automated label on real participants. |
| Real-world action / return | Use only voluntary, authorized structured practice reports where implemented, explicitly labeled self-reported. Do not copy the action’s private content or infer an outcome from absence. Otherwise show “Not measured”; no added compulsory check-in or new commitment policy. |

<a id="ADMIN-B0036"></a>
#### C. Action honesty

<a id="ADMIN-B0037"></a>
Instrument confirmation claims for saved, scheduled, sent, activated, updated, synced, paid and cancelled. The response renderer should derive an action-status component from a committed receipt and its exact scope. Link the content-free claim record to the action attempt and confirmation. Record missing, mismatched, stale or overstated confirmation as an action-honesty defect; pending, accepted and delivered are not interchangeable. [P1-01, I/K; COM; PJ, §19]

<a id="ADMIN-B0038"></a>
This checks structured confirmations, not every natural-language claim. Test uncontrolled prose with synthetic fixtures and investigate participant-selected reports. Do not introduce a second model that routinely analyzes real transcripts for quality. A low detected-defect count is not proof that no false claim occurred.

<a id="ADMIN-B0039"></a>
#### D. Framework / source accuracy

<a id="ADMIN-B0040"></a>
Use original synthetic regression scenarios for Blueprint architecture and terminology, Legacy/Legacy Giving, inclusive Family wording, Faith + Identity as Bedrock, the Four Pillars, Drift + Return, participant approval, evidence versus approved content, commerce and Scripture boundaries. Keep per-requirement results and critical failures visible. No routine real-conversation inspection supplies these results. [T4; LG; OI; PJ; RIGHTS]

<a id="ADMIN-B0041"></a>
### 6. Safety observability

<a id="ADMIN-B0042"></a>
Implement three distinct paths; they are not a participant safety history. Normal conversation and approved resource guidance remain autonomous, including outside human support hours. A safety signal does not create a staff queue. [SAF, D02/D04/D07, §§8–9]

<a id="ADMIN-B0043"></a>
| Path | Required boundary |
| --- | --- |
| Ephemeral routing | Current-session routing state only. Count actual route/component invocations and failures without retaining raw triggering text or a permanent person-level category. |
| Restricted class-14 receipt | Create only for the material responses/failures or reviewed actual external actions specified in SAF §9. Use that allowlist and S3 access/lifecycle; participant reference is nullable and requires documented necessity. Not available to ordinary coaching or admin browsing. |
| Operational aggregate | A separate projection of counts, resource/fallback outcomes and applicable configuration versions. Remove participant, session, request and case join keys. Use reviewed time/category granularity and small-cell safeguards; suppress unsafe breakdowns. Aggregation alone is not anonymity. |

<a id="ADMIN-B0044"></a>
Show aggregate routing events, resource-component invocation/failure, model/fallback failure, submitted unsafe-response reports, synthetic safety results, safety version and stop-ship state. Broad categories are allowed only when approved and necessary. No permanent risk score, “high-risk” label, sponsor/church safety flag, marketing segment or automatic human escalation. A rendered resource does not prove reading, contact, care or safety.

<a id="ADMIN-B0045"></a>
Selected reports: preserve the exact participant-previewed, trimmed/redacted selection in the restricted class-15 evidence store, with optional additional messages individually selected. Confirm submission only after the case save succeeds. Queue the submitted complaint—not every routing signal—for authorized review. No automatic full transcript, screenshot or prompt attachment. [PRIV, P20; SAF, §12]

<a id="ADMIN-B0046"></a>
### 7. Technical accuracy / reliability

<a id="ADMIN-B0047"></a>
Capture counts, rates, latency and outcomes for OpenAI requests; Supabase operations; authentication and MFA; row-level-security (RLS) access denials; saves and approval persistence; exports/deletion; provider timeouts; tools/actions; and entitlement lookups. Include essential email delivery failures if enabled. Add optional reminders/notifications and ForgedLife synchronization metrics only with their separately released scope. [P1-01, L; PRIV, §§8–13; COM]

<a id="ADMIN-B0048"></a>
| Severity | Admin treatment / example |
| --- | --- |
| INFO | Searchable content-free operational facts and expected denied requests; no incident implication from one ordinary RLS denial. |
| WARNING | Prominent trend: elevated latency/retries, stale telemetry, rising denials or estimated cost anomaly. Record threshold/version, sample size and period. |
| ERROR | Visible unresolved failure: save/export/delete, approval persistence, provider/tool or entitlement failure. Show affected component, safe code, count, first/last occurrence and resolution state. |
| CRITICAL / STOP-SHIP | Persistent blocker banner and content-free alert to the actually assigned containment role. Map to SAF SS01–SS19 and applicable privacy/commerce/rights gates; do not invent a competing stop-ship policy. |

<a id="ADMIN-B0049"></a>
Core privacy exposure, unauthorized state changes, failed safety controls or credible critical/high harm cannot be averaged away. Unknown impact stays blocked pending investigation under SAF. Thresholds for ordinary performance/spend are versioned engineering configuration, not new policy exceptions or promised service levels. Error resolution is not authority to re-enable stopped processing. [SAF, §§12, 18, Appendix F]

<a id="ADMIN-B0050"></a>
### 8. Cost observability

<a id="ADMIN-B0051"></a>
Wrap every provider request/attempt with a content-free usage record. Record provider/service, actual model, operation class, request/attempt ID, timestamps, measured units, currency, pricing source/effective date, rate_card_version, estimated charge, reconciliation state and execution context. Include retry, failure and fallback usage where billed. Unknown usage or prices remain unknown—not free. This brief quotes no current vendor rates. [BRIEF; PRIV, §9/O10]

<a id="ADMIN-B0052"></a>
Normalize provider units into non-overlapping billable categories; do not charge cached input again as ordinary input or double-count a total that includes subcategories. Keep any aggregate invoice/service charge separate from request estimates, with an explicit reconciliation adjustment instead of adding both. Do not store messages, prompts, completions, tool arguments or participant-entered text in cost records.

<a id="ADMIN-B0053"></a>
| Measure | Calculation / implementation |
| --- | --- |
| Daily AI/API spend | Sum normalized billable request estimates by UTC day, provider and environment. Show estimate vs provider-reconciled amount and unpriced/unreported coverage. Keep synthetic development spend separate from later real use. |
| Cost per active user / conversation | Attributed period AI cost ÷ distinct active users in the same period. Per conversation: all attributed attempts in that conversation, including retries/fallbacks; separate in-progress and ended conversations and disclose unattributed cost. |
| Cost per Free / Full Build | Sum linked workflow cost across sessions; show per-started-build spend to date and total cost of completed-build cohorts separately. Display incomplete work and missing attribution. Full Build reporting activates only with that scope. |
| Storage / other provider costs | Measure service-level database/storage/egress and other material costs from actual usage/billing sources. Record shared/base charges and any allocation method separately; do not claim exact per-person storage cost from a guessed split. |

<a id="ADMIN-B0054"></a>
Support later unit-economics analysis of $19/month, $199/year, $149 Full Build and $299 first-year Build + Live With Steward. The $299 offer is one-time prepaid with no automatic renewal; ongoing access does not replace initial Full Build. Model only approved terms; include actual support, payment, infrastructure and other costs when known. AI spend alone does not establish profitability. No pricing, quota, grant, billing or live-payment change is authorized. [COM, D01–D14; PJ, §7]

<a id="ADMIN-B0055"></a>
Provide configurable spend/retry alerts and bounded retries in synthetic development. Production budgets and service behavior must follow reviewed configuration and approved commerce/safety boundaries; a spend alert must not silently change an entitlement or remove required resource access. [PRIV, §9; SAF; COM]

<a id="ADMIN-B0056"></a>
### 9. Version / release traceability

<a id="ADMIN-B0057"></a>
Attach a server-owned execution_context_id to every meaningful request, response, proposal, action and receipt. It resolves the exact application build/deployment, actual model, system/Steward instruction bundle, OI version, governing-source and serving-source bundles, safety/resource versions, Blueprint/assessment schemas, flags, tool versions and environment. Appendix D is the schema. [BRIEF; P1-01, I; SAF, §§9, 14; RIGHTS]

<a id="ADMIN-B0058"></a>
Capture the effective context at execution—not a mutable “current version” lookup later. A fallback or mid-session deployment creates a new context for the affected attempt/response; preserve its parent reference. Track response produced, delivered, failed and discarded separately, without content. Source deletion must not resurrect text through telemetry; retain context/receipt metadata only for its justified lifecycle.

<a id="ADMIN-B0059"></a>
Keep approved governing documents distinct from the rights-cleared AI-serving bundle. An approved source is not automatically licensed model input. A source/prompt/flag edit that changes behavior must create a traceable version and undergo the applicable release checks. [RIGHTS, D01–D06; PRIV, §10]

<a id="ADMIN-B0060"></a>
### 10. Regression / release testing

<a id="ADMIN-B0061"></a>
Build a permanent synthetic test harness now. Start with end-to-end coverage of the implemented slice and negative controls; expand toward approximately 50–100+ representative scenarios as scope grows. A target count is not an existing suite or a substitute for coverage. Every significant model, instruction, source, safety, Blueprint or application change must be testable against a fixed, versioned set before its applicable release. [BRIEF; SAF, §§13–14]

<a id="ADMIN-B0062"></a>
Cover Created for More, Free/Full Build, Foundation, Four Pillars, Guardrails, Drift + Return, Keystone Rhythms, Energy, Legacy, missed check-ins, uncertainty, participant disagreement, entitlements, action honesty, Scripture, sensitive conversations and safety. Use lawfully sourced, original fictional fixtures—not real conversations, copied support stories or “de-identified” participant records. [PRIV, O10; SAF, §12.2; RIGHTS]

<a id="ADMIN-B0063"></a>
Use deterministic state/permission assertions first and versioned behavioral rubrics where judgment is needed. Store each critical requirement’s result; an automated grader is not independent specialist review. Compare candidate and baseline on identical test/rubric versions, with repeat count where stochastic behavior matters. Show regressions, improvements, failures, blocked/not-run tests and coverage; never hide a critical failure in an overall pass rate.

<a id="ADMIN-B0064"></a>
Appendix E defines the record. Existing PRIV T01–T32, SAF PS01–PS40, COM CE01–CE50 and RIGHTS SR01–SR32 remain source-controlled specifications; import requirement IDs without inventing execution. Historical fictional-chat labels do not establish a current candidate pass. No Steward tests have been run by preparing this brief. [REG, §9; PRIV, §17; SAF/COM/RIGHTS test appendices]

<a id="ADMIN-B0065"></a>
### 11. Release health

<a id="ADMIN-B0066"></a>
Show application/model/instruction/source/safety versions; automated passed/failed/blocked/not-run counts; critical-safety and privacy/security counts; known issues; and deployment state. Valid display states include Development, Staging, Limited Pilot, Production and Blocked. Separate observed deployment, test evidence, gate state and written release authorization. A green indicator cannot authorize participants. [SAF, §§16–18, Appendix E]

<a id="ADMIN-B0067"></a>
Keep the source-qualified starting state: applicable evidence missing, tests not run, real participants unauthorized and live payments blocked. Do not seed fake “0 failed / 100% passed” data. Display zero observed failures only with its executed sample count; absent evidence displays “Not run” or “Not evidenced.”

<a id="ADMIN-B0068"></a>
### 12. Deployment process

<a id="ADMIN-B0069"></a>
Development → automated tests → staging → synthetic benchmark → separately authorized limited release → monitor → documented expansion or rollback. Pin code, configuration, source/rights bundles and feature flags; retain release notes, evidence links, migration compatibility and rollback targets. Staging remains synthetic; do not copy a real database for debugging. [P1-01, L; PRIV, Appendix C; SAF, §14]

<a id="ADMIN-B0070"></a>
A future authorized release binds its environment, candidate, enabled routes, population/envelope, expiry/review conditions, actual role assignments and evidence. Level 1 retains the invitation-only, Arizona-first, nonpaid adults-18+ pilot direction: initially up to 3, checkpoint before expansion to no more than 10, six-week review envelope. These are not authorization to enroll, retention periods or automatically selected entitlement dates. [PRIV, O11; SAF, D03; COM, RG05]

<a id="ADMIN-B0071"></a>
Containment leads actually appointed under SAF may stop affected processing without waiting for Mike. Re-enable critical/high-risk functionality only through the governing remediation, retest, independent review and authorization process. Rollback must preserve deletion/revocation state and compatible data migrations; reverting code alone is insufficient. Feature flags cannot bypass provider-fit, rights, permission or payment blocks. [SAF, D08/§18; PRIV, §§10–13]

<a id="ADMIN-B0072"></a>
### 13. Basic admin view — build now

<a id="ADMIN-B0073"></a>
Provide one internal authenticated debug route with synthetic-only account selection. Show session/CFM state, canonical Blueprint definition and content states, proposed versus approved wording, entitlement state, application/model/source versions, sanitized failures, measured API usage/cost and actual test runs. Fictional content may be inspected here to debug the synthetic slice; use no staff member’s real private life as a fixture. [BRIEF; PRIV, Appendix C; P1-01, L.5]

<a id="ADMIN-B0074"></a>
Start with simple server queries and read-only tables, not a broad staff console. Synthetic test setup/actions belong to an isolated harness; no reusable production “view any user” route. Show unavailable integrations as disabled and missing telemetry as unknown.

<a id="ADMIN-B0075"></a>
### 14. Level 1 owner dashboard — design now, build before Level 1

<a id="ADMIN-B0076"></a>
Use Appendix C’s seven sections: Usage, Journey, Quality, Safety, System Health, Cost and Release. Display only reviewed necessary metrics, appropriate suppression, data freshness and source/version context. Protect access server-side; do not provide routine private-record drill-through. Final configuration, privacy review and applicable release evidence must exist before real collection or dashboard use. [PRIV, O10; SAF, Appendix E]

<a id="ADMIN-B0077"></a>
### 15. Advanced analytics — defer

<a id="ADMIN-B0078"></a>
Defer complex executive BI, advanced cohort analytics, an A/B platform, predictive churn and a large staff operations console. Reserve schema extension points rather than collect extra data now. Conversation-content analytics, behavioral/sensitive profiling, AI user-risk scoring, broad church analytics and participant-content training/research are not authorized backlog items; current prohibitions and separate approval/release requirements remain. No preparation copies of real content. [PRIV, O08/O10; P1-01, M.C]

<a id="ADMIN-B0079"></a>
### 16. Privacy / data-minimization requirements

<a id="ADMIN-B0080"></a>
Maintain distinct logical boundaries for participant identity, Blueprint, conversation, continuity note, audit record, analytics event, security event, safety routing/receipt and support evidence. Implement these as cohesive modules and restricted stores/views, not unnecessary services. Analytics is a projection, never the system of record or a shadow copy of private content. [P1-01, C/I/M.A; PRIV, §9]

<a id="ADMIN-B0081"></a>
Reject unlisted names/fields/types and revealing event values before any SDK or vendor transmission. Disable prompt/completion capture, tool-argument dumps, private DOM/session replay, screenshots, full URLs, query literals, emails and short sensitive-text hashes in ordinary telemetry. Inventory browser, server, database, tracing, export, email and log-drain paths. Do not rejoin safety aggregates to participant, billing or journey data. [PRIV, §9]

<a id="ADMIN-B0082"></a>
Apply purpose, access, retention-policy and disposition metadata to every enabled store/projection. Keep a restricted identity mapping only where distinct-user measurement needs it. Test deletion across mappings, raw events, projections, queues, caches, vendors and restores. Preserve only independently justified proof/holds; pseudonymous records are not automatically anonymous. Exact retention schedules and real-session limits remain reviewed configuration, not invented durations. [P1-01, F–I; PRIV, O03–O05/§13]

<a id="ADMIN-B0083"></a>
### 17. Handoff and remaining release work

<a id="ADMIN-B0084"></a>
Jeremy can build the synthetic instrumentation, schemas, adapters, debug view and test harness from this brief without reopening a major product decision. Engineering choices are implementation defaults, subordinate to the cited standards. Use synthetic policy fixtures to exercise lifecycle and release blocks. Do not turn a missing production configuration into a permissive default.

<a id="ADMIN-B0085"></a>
Before Level 1, the already-required event/report catalogue review, exact retention/session settings, actual provider contractual/configuration fit, role assignments, nonpaid entitlement template, specialist findings, executed tests and final candidate-specific release authorization remain open. This brief closes none of them. Appendices A–G are the implementation handoff, not a replacement P1-10 release checklist. [PRIV; SAF, Appendix E; COM, RG01–RG07; RIGHTS]

<a id="ADMIN-B0086"></a>
### A. Minimum Event Taxonomy

<a id="ADMIN-B0087"></a>
Delivery: implement the collector, schemas and hooks now; emit only for implemented synthetic routes. All real collection remains gated. Optional/future events stay disabled until the underlying feature and its measurement scope are released. [BRIEF; PRIV, O10]

<a id="ADMIN-B0088"></a>
#### A1. Common contract; distinct destinations

<a id="ADMIN-B0089"></a>
Each registry entry fixes event_name, schema_version, producer/trigger, allowed fields, purpose, destination, lifecycle and phase. IDs are opaque; times UTC RFC 3339; versions nonempty strings; codes closed enums; counts nonnegative integers; costs decimal plus currency; optional fields null. Reject wrong types and extra fields; no arbitrary JSON/metadata. Use event_id, occurred_at, recorded_at, server-set environment and data_origin, execution_context_id, outcome and retention_policy_id. Action outcome uses pending/attempted/succeeded/failed/partial/unknown/denied/cancelled; response status uses produced/delivered/failed/discarded. Other families use their own closed state enums; never equate them.

<a id="ADMIN-B0090"></a>
Only necessary journey records add bounded analytics_subject_ref, analytics_session_id, workflow_id/type or resource/version refs. These are opaque, not names or content hashes. Keep identity resolution separately restricted. Required audit records use P1-01 I.2’s actor/authorization/attempt/idempotency/confirmation fields; restricted evidence stays outside analytics. Safety aggregates use a separate schema with no participant/session/request/case key. The table specifies destination and event-specific additions, not permission to add other fields.

<a id="ADMIN-B0091"></a>
Destinations: J = minimized journey/feedback projection; A = authoritative audit/receipt; O = operational/cost; S = restricted SAF §9 receipt/current-session path; G = separately minimized safety aggregate. A→J means a validated projection, not a duplicate evidence payload. Client presentation events are authenticated or attempt-scoped signals, not canonical outcomes.

<a id="ADMIN-B0092"></a>
| Event name(s) | Emit condition / bounded additions / destination |
| --- | --- |
| account_created<br>account_signed_in | Account service confirms creation or successful sign-in. J; no email/name. Sign-in alone is not qualifying product use. |
| session_started<br>session_ended | Analytics/workflow session service establishes start/end. J; session kind and end reason: explicit, logout, inactivity or unknown. End is not completion. |
| cfm_started<br>cfm_completed | First assessment work / validated assessment completion under CFM v4. J; attempt ID and assessment version, authenticated scope when available. No answers, scores or reflection bands. |
| cfm_results_viewed | Client confirms results surface was displayed; not proof of reading. J; assessment attempt/version only. |
| free_blueprint_started<br>free_blueprint_completed | Confirmed Free workflow start / source-conforming useful Free milestone under T4 and PJ §4.2. A→J; workflow and milestone-definition versions. Never require all sections to be Defined for This Season. |
| north_star_started<br>north_star_completed<br>starting_plan_completed | Source-conforming sub-milestone is established in the same Blueprint workflow. A→J; milestone, resource and version refs. Not separate participant products or extra assent requirements. |
| steward_conversation_started<br>steward_conversation_completed | Confirmed conversation start / explicit product conversation-finish transition. J; operational product mode. Timeout/logout emits session end, not successful conversation completion. Listening can finish without a task. |

<a id="ADMIN-B0093"></a>
Completion hooks must use the product’s source-based validation and actual state, not elapsed time, payment, a model’s assertion, page-count filling or a dashboard rule. Preserve adaptive order and authorized prior work; an imported completion without observed start is not invented funnel activity. Reopening does not erase the historical milestone. [T4, §§6–10; PJ, §§3–5]

<a id="ADMIN-B0094"></a>
#### A2. Approval, quality, operational and future events

<a id="ADMIN-B0095"></a>
| Event name(s) | Emit condition / bounded additions / destination |
| --- | --- |
| proposal_generated<br>proposal_presented | Proposal persisted / intended proposal version displayed. A→J / J; proposal/version refs, approved section code only if needed. Generated is not seen or approved. |
| proposal_edited_by_participant<br>proposal_approved<br>proposal_rejected | Actual edit / valid version-bound approval committed / explicit rejection recorded. A→J; proposal/version refs and response type; no wording. Click-only approval is not a committed approval. |
| blueprint_section_defined<br>blueprint_revision_approved<br>blueprint_export_generated | Canonical functional definition transition / exact approved revision commit / export object and manifest created. A→J; section/schema or revision/export version. Generated export is not downloaded, shared or saved elsewhere. |
| feedback_helpful<br>feedback_not_helpful<br>problem_report_submitted | Explicit rating / confirmed report save. J; bounded feedback target/type or minimized case status. Report case ID lives in permissioned support metadata; selected text remains restricted evidence, never J. |
| entitlement_checked<br>entitlement_granted<br>entitlement_expired | Server check/result / authorized grant commit / confirmed expiry transition. A→J; scoped benefit, state and grant-origin codes. Unknown lookup is not expiry; no AI/browser grant authority. |
| system_action_attempted<br>system_action_succeeded<br>system_action_failed<br>system_action_status_changed | Action service receipts. A→O; verb, attempt/confirmation refs and safe code. Success/failure requires that confirmed outcome; pending/partial/unknown uses status_changed. Provider acceptance is not completion. |
| response_status_recorded<br>action_claim_checked | Response produced/delivered/failed/discarded; structured confirmation checked against receipt. O; response/attempt refs, claim verb, match/mismatch/unknown. No response text or background real-content evaluator. |
| provider_request_finished<br>cost_reconciled<br>system_error_recorded | Request terminates, including timeout; usage reconciliation; sanitized failure. O; provider/service, units, latency, status, price version, cost adjustment, safe error/severity codes. No prompts or exception-object dumps. |
| security_control_event<br>admin_access_recorded | Auth/MFA/RLS control result or privileged access attempt. Restricted security/A; control/actor/purpose/scope/result. No secrets, private payload or product-analytics reuse of security identifiers. |
| safety_route_recorded<br>resource_component_invoked<br>resource_component_failed<br>fallback_failed | Current-session route/component facts; S receipt only under SAF §9 criteria. S→G projection: necessary counts and reviewed versions/category only; no user/session/request/case key or exact-event timeline. |
| test_run_recorded<br>release_state_recorded | Actual synthetic run record or authorized release-control state event. O/A; test-run/release refs, evidence status and source-gate refs. “Passed” needs actual evidence; display state never grants release. |
| Reserved — later scope | full_blueprint_started, full_blueprint_completed, living_mode_activity, existing_practice_selected, practice_report_recorded, notification_result, forgedlife_sync_result. Instrument when the relevant structured workflow exists; enable only within separately authorized scope. |

<a id="ADMIN-B0096"></a>
Delivery integrity: unique event IDs; canonical aggregate contributions deduplicated by business event/version; bounded retry; no client-supplied privileged identity or release status. Guard against duplicate grant/approval counts and out-of-order lifecycle updates. Persisted audit state—not analytics arrival order—governs participant records. [P1-01, I; COM, §7; PRIV, §9]

<a id="ADMIN-B0097"></a>
### B. Admin Permissions Matrix

<a id="ADMIN-B0098"></a>
Roles below describe capabilities, not new appointments. Only Michael J. Gauthier’s existing Product Owner/final owner release authority is named. Jeremy’s assignment here is synthetic implementation, not production support, privacy or safety ownership. Enforce least privilege in services, database roles, RLS, objects and exports—not UI visibility alone. [PRIV, §2/O12; SAF, D08]

<a id="ADMIN-B0099"></a>
| Capability | Product Owner | Engineering / debug | Support / case reviewer | Security / privacy / release roles |
| --- | --- | --- | --- | --- |
| Owner aggregates and versions | Read reviewed views | Read scoped health; synthetic views | Only task-needed operational view | Read within actual assigned remit |
| Synthetic content, proposals and fixtures | Authorized test scope only | Read/test in isolated synthetic environment | Synthetic rehearsal only | Synthetic review scope |
| Named real account / entitlement status | Only separate purpose-limited permission | No default; authorized metadata diagnostics only | Minimal case/account scope; no payment mutation by implication | Only designated account/commercial responsibility |
| Real transcript / private Blueprint search | No routine access | No routine access or production impersonation | No routine access | No routine access |
| Participant-selected evidence | No automatic owner privilege | No default; explicit necessary case grant only | Selected case scope after required authorization | Narrow authorized case scope; independent conflict handling |
| Safety receipts / incident evidence | No default browsing | No default browsing | No general list of safety receipts | Restricted legitimate case scope; never person-risk analytics |
| Privilege elevation / access review | Cannot self-approve sensitive elevation | Cannot self-approve | No self-approval or investigation of own misuse | Independent authorization/review under existing process |
| Deploy / stop / re-enable | Final written owner authorization as governed | Synthetic deploy; production only with actual delegation | No implied deployment powers | Appointed containment leads may stop; re-enable only through SAF process |
| Grant / cancel / refund / share / export private work | Dashboard adds no authority | Harness-only synthetic mutations | Only separately authorized deterministic workflow | Only existing domain-specific authority and gates |

<a id="ADMIN-B0100"></a>
Sponsors/church leaders: no access to this internal console, safety events or private records. Later sponsor reporting is limited to its separately approved privacy-reviewed aggregate catalogue; no named activation, completion, last-use or payment feeds. Service accounts: narrowly scoped writes/reads for their function, never broad admin keys in the browser or model. [PRIV, O08/§§2, 7, 11; COM]

<a id="ADMIN-B0101"></a>
#### Exceptional-access contract

<a id="ADMIN-B0102"></a>
Require authenticated identity and appropriate MFA/step-up; recorded case/purpose/authority; selected resource and version scope; the required independent approver; time-limited grant; audit of allow/deny, view/export and revocation; conflict-of-interest handling; and reviewed evidence disposition. Request additional content only through the authorized selection/exception route. No self-elevation, automatic full-account access, downloaded “just in case” copies or private evidence in alert emails. [PRIV, §2.3/P20/O12; SAF, §8]

<a id="ADMIN-B0103"></a>
At closure or expiry, revoke access and disposition eligible copies. Exceptional review does not become routine monitoring, authorize evaluation-corpus reuse or give a reviewer’s church/sponsor another access path. Break-glass handling, where applicable, remains the separately reviewed narrow procedure—not a general admin button. [SAF, §§8.3–8.4, 12.3]

<a id="ADMIN-B0104"></a>
### C. Level 1 Dashboard Wireframe / Field List

<a id="ADMIN-B0105"></a>
Build a simple read-only owner overview before Level 1. This is a field-level wireframe, not a request for a polished executive BI interface. No mock performance values are supplied. [BRIEF; PRIV, O10]

<a id="ADMIN-B0106"></a>
Page header: environment • data origin • UTC reporting window • as-of/last refresh • metric-definition version • current release • collection coverage/stale-data status. Fixed reviewed filters only; no arbitrary joins, cohort subtraction or participant drill-through.

<a id="ADMIN-B0107"></a>
| Panel | Minimum fields / data source |
| --- | --- |
| USAGE | Current participant-account count and cumulative created count where lawfully retained; approximate online count; active Steward/Blueprint/CFM sessions; DAU/WAU/MAU; new accounts; new/returning active users; sessions/user. Identity count projection + minimized qualifying events; exclude staff/test/probes. |
| JOURNEY | CFM starts/completions/results displayed; Free starts/completions; North Star and Starting Plan milestones; aggregate Blueprint state/progress counts. Show distinct starter-cohort n/N, pending and unknown/not-observed steps. Domain-state projections, not answers or private section wording. |
| QUALITY | Helpful/not-helpful counts and response denominator; proposal presented/approved/edited/rejected/pending; approved revisions; reported action-honesty defects; problem-report counts/status. Separate application-detected vs participant-reported. Existing-practice/real-world outcomes show “Not measured” until implemented and authorized. |
| SAFETY | Reviewed aggregate routing/resource counts; resource/fallback failures; unsafe-response report counts; synthetic critical-safety test status; current safety/resource versions; stop-ship state. Suppress unsafe small-cell/category/time breakdowns. No person, session, precise event or transcript links. |
| SYSTEM HEALTH | Request success/failure; request latency p50/p95 with sample count; provider timeout/error status; Supabase/auth/MFA/RLS events; save/approval/export/deletion failures; queues; observed availability with probe coverage. Content-free metadata only; distinguish denied access, failed operation and unknown provider state. |
| COST | AI/API estimate vs reconciled spend by day/provider/environment; usage/pricing coverage; attributed per-active-user and per-conversation/session estimate; Free workflow spend; storage/other material charges; retry/unattributed cost. No participant bill or private content. |
| RELEASE | Application/build/deployment; actual model(s); instruction/OI/source bundle; safety/resource/Blueprint/assessment versions; effective flags; benchmark results; critical-safety and privacy/security passed/failed/blocked/not-run; open blockers and evidence links; release authorization status. |

<a id="ADMIN-B0108"></a>
#### Display rules

<a id="ADMIN-B0109"></a>
Each card carries n/N where applicable, observation window, freshness, coverage and version. Use “Not instrumented,” “Not run,” “Not evidenced,” “Suppressed,” “Unknown” or “Disabled” accurately; absence of failures is not proof of health. A ratio with no denominator is unavailable. Low-volume Level 1 observations are descriptive, not evidence of causation or statistical improvement.

<a id="ADMIN-B0110"></a>
Current-state participant counts are not an undeletable all-time roster. Suppression and repeated-query safeguards must cover the combined panels, not just each card. Security and sensitive case details require their separate permissions; even an error link must not reveal a private conversation. [P1-01, C/G; PRIV, §§7, 9, 13]

<a id="ADMIN-B0111"></a>
Later extensions: Full Build/Living activity, sponsored/cohort counts and authorized entitlement views. They must preserve approved benefit/ownership distinctions and sponsor privacy. No dashboard status, online count or support-hours indicator changes AI autonomy, participant access or the actual release envelope. [COM; SAF, D02/D03/D08]

<a id="ADMIN-B0112"></a>
### D. Release-Version Metadata Schema

<a id="ADMIN-B0113"></a>
Implement immutable version records plus a small per-execution reference; do not repeat source documents or private prompts in each event. This schema is an engineering contract, not evidence of a deployed release. Version IDs alone are insufficient unless they resolve to the preserved, authorized build/configuration artifact. [P1-01, I; SAF, §14; RIGHTS]

<a id="ADMIN-B0114"></a>
| Record / field group | Required meaning / validation |
| --- | --- |
| Release manifest identity | release_id, manifest_schema_version, application/build ID, commit/artifact digest, deployment ID, environment, created/deployed times and prior/rollback release refs. Deployment time remains null until actual deployment. |
| Model configuration | Provider, endpoint/configuration reference, requested model ID, actual model ID where returned, available snapshot/version, generation-parameter config version and fallback-policy version. Do not label an unavailable model snapshot as known. |
| Instructions and authority | Steward/system instruction bundle ID + digest; OI v0.4 reference; separate SC v0.3 reference; governing-source manifest listing canonical source IDs, versions, status and approval dates; instruction-assembly version. |
| Serving-source and rights boundary | AI-serving bundle ID/digest, retriever/tool version, rights-policy version and clearance/configuration evidence refs. Governing-source inventory is distinct from the material actually served to a model; no implied NIV permission. |
| Safety and product schemas | Safety-policy version, resource-bundle/component versions, Blueprint schema version, T4 template version, assessment instrument/scoring version and relevant entitlement-policy/configuration version. |
| Flags / tools / operational configuration | Allowlisted effective behavior flags or immutable resolved-flag snapshot; tool/function versions; database migration version; metric/event allowlist version; provider/privacy, retention and rate-card configuration references. No secrets, sensitive flag values or user-targeting roster. |
| Evidence / release authority | Synthetic suite/rubric versions and actual run refs; namespaced source-gate refs; specialist-evidence refs; known-issue refs; separate authorization record/ref/status. No release authority inferred from test counts or a flag. |
| Execution context | execution_context_id, release ref, effective configuration snapshot, actual per-attempt model/tool overrides, effective time, parent context where applicable and completeness status. Immutable; create a new record when behavior changes. |
| Interaction/action receipt | Opaque response/action/request ID as appropriate; execution-context ref; attempted/produced/delivered/failed/discarded outcome; authoritative confirmation ref where relevant. Participant/resource linking only in the authorized domain record, not automatically in every projection. |

<a id="ADMIN-B0115"></a>
#### Validation and comparison

<a id="ADMIN-B0116"></a>
Before a shared synthetic deployment, require all applicable manifest fields or an explicit not-applicable reason; flag unavailable model details honestly. A candidate missing required traceability cannot be treated as release-ready. Capture effective versions before execution and use actual receipt overrides after fallback. Never silently replace an older receipt’s context with the newest deployment.

<a id="ADMIN-B0117"></a>
“What changed?” compares code/build, model, instruction assembly, serving and governing bundles, safety/resource policy, Blueprint/assessment schema, tools and effective flags. Compare performance on the same synthetic fixtures and metric definitions; distinguish a release change from a measurement-definition change. Retain source artifacts without private participant content. [BRIEF; SAF, §14]

<a id="ADMIN-B0118"></a>
Safety aggregate cells may carry reviewed release dimensions but not a universal execution-context join that recreates a participant trace. Restricted safety receipts retain the necessary version trace under SAF §9. Retention/disposition rules still apply; traceability is not permission for permanent identifiable histories.

<a id="ADMIN-B0119"></a>
### E. Regression-Test Record Schema

<a id="ADMIN-B0120"></a>
Store the test definition separately from each execution and each review. All new test definitions start NOT RUN; actual_result, executed timestamps and pass/fail remain null until an actual run. The following is a schema and test specification only. [BRIEF; SAF, §13; REG, §9]

<a id="ADMIN-B0121"></a>
| Field group | Contract |
| --- | --- |
| Definition | test_id, test_version, title/domain, original-synthetic fixture ref/digest, lawful fixture provenance, source requirement refs, expected critical requirements, assertion/rubric version, dependencies, required review type and applicability. |
| Run identity / candidate | run_id, test ID/version, suite version, candidate release/execution-context ref, environment, data_origin=synthetic, runner version, iteration/seed where supported, invoked model/configuration and baseline run ref where compared. |
| Execution facts | Execution status: NOT_RUN, RUNNING, COMPLETED, BLOCKED or ERROR. Start/end timestamps, actual synthetic output/state/evidence refs, actual_result summary, per-assertion result and failure codes. A blocked/error run cannot become PASS. |
| Result / review | Result: PASS, FAIL or null. Critical requirements checked individually. Review status: NOT_REQUIRED, PENDING, ACCEPTED or CHANGES_REQUIRED; reviewer identity/role, review time and rationale/evidence where applicable. Automated completion is not specialist acceptance. |
| Defect / release consequence | Severity and namespaced governing stop-ship/gate refs where relevant; defect/containment refs, retest linkage and unresolved conditions. Retests create new runs; they do not overwrite failed history. A waived low-risk issue does not silently become a passed test. |
| Integrity / lifecycle | Immutable run evidence references/digests; correction history; access and retention policy. Actual synthetic outputs may be kept in the test store under appropriate rights; no participant content or support evidence imports. |

<a id="ADMIN-B0122"></a>
#### Initial instrumentation acceptance pack — SPECIFIED / NOT RUN

<a id="ADMIN-B0123"></a>
| ID | Required synthetic demonstration |
| --- | --- |
| OBS-01 | All event schemas reject unlisted text/secrets before network export; no rejected payload survives logs, tracing, replay, queue or crash paths. |
| OBS-02 | Duplicate/out-of-order delivery and collector outage do not duplicate approvals/grants, invent success or corrupt canonical state; stale analytics is visible. |
| OBS-03 | Presence/session expiry, multi-tab use, no-response feedback and accountless CFM produce the documented counts without tracking or false completion. |
| OBS-04 | Owner/engineer/support/sponsor negative-access tests deny real-style private records; case grants stay scoped, independently controlled, audited and revocable. |
| OBS-05 | Safety routing is ephemeral; required receipts stay restricted; aggregates cannot join back to identities; resource failure alerts do not create automatic participant queues. |
| OBS-06 | Receipt mismatch, provider timeout, fallback and partial action produce honest status; every produced/delivered/discarded response resolves its actual context. |
| OBS-07 | Missing usage/rates, cache accounting, retries and reconciliation avoid invented zero cost or double billing; workflow costs include prior sessions. |
| OBS-08 | Delete/restore/purge tests respect selected synthetic lifecycle/hold fixtures; disabled payment/NIV/future routes stay blocked; release indicators cannot grant access. |

<a id="ADMIN-B0124"></a>
Link these engineering tests to applicable PRIV T, SAF PS/G/SS, COM CE/RG and RIGHTS SR/PG requirements; do not replace or renumber those source registers. Framework and safety benchmark content expands with the enabled scope under §10. No test in this appendix is marked passed.

<a id="ADMIN-B0125"></a>
### F. Jeremy Build-Now Checklist

<a id="ADMIN-B0126"></a>
All items below are work to implement and evidence in the synthetic slice—not completed tasks. The existing governing policy supplies the boundary; no new major owner product decision is required to begin.

<a id="ADMIN-B0127"></a>
| Item | Build-now output |
| --- | --- |
| F01 — Contracts | Versioned allowlist/destination registry; schemas, server-derived identity/environment, execution manifests and data-origin separation. |
| F02 — Capture | Domain audit/outbox hooks; deduplication/reconciliation; safe errors; minimal presence/session projection; provider usage/cost adapters; no content capture. |
| F03 — Boundaries | Separate participant/Blueprint/proposal, conversation/continuity, analytics/audit, security, safety and support evidence access/lifecycle. Isolated synthetic debug permissions. |
| F04 — Working view | Basic internal state/error/cost/version viewer and synthetic report/receipt path; disabled/unavailable features shown honestly. No polished owner dashboard required now. |
| F05 — Evidence | Executable OBS acceptance pack and implemented-scope synthetic benchmark; real run records only; rollback/feature-block rehearsal; source-gate mapping. |
| F06 — Handoff | Metric/data dictionary, schema migrations, retention test fixtures, sanitized logging inventory, configuration checklist and run instructions. Record gaps as open—not passed. |

<a id="ADMIN-B0128"></a>
### G. Build-Later Checklist

<a id="ADMIN-B0129"></a>
| Timing | Required work / boundary |
| --- | --- |
| Before any Level 1 use | Build Appendix C’s owner view; review the actual allowlist, linkage/suppression and lifecycle; test account/role restrictions, alerts, selected reporting, recovery and version evidence. Close inherited provider, specialist, entitlement-template and candidate-specific release gates. |
| With separately released features | Full Build/Living projections; sponsored/cohort counts; authorized entitlement operations; notification and ForgedLife result adapters. Keep live payments, exact NIV and future capabilities blocked until their own actual approvals and release conditions are satisfied. |
| After product validation | Consider richer BI/cohort analysis or experimentation only under an approved purpose and scope. Do not collect extra private content in anticipation. Predictive profiling, content analytics and user risk scoring are not authorized by this checklist. |

<a id="ADMIN-B0130"></a>
#### Document-boundary verification

<a id="ADMIN-B0131"></a>
The authored brief was checked for the boundaries below. This is a document review, not an executed Steward acceptance test or a release decision.

<a id="ADMIN-B0132"></a>
Preserved: no routine transcript monitoring; no permanent safety-risk profile; no existing test marked passed; no real participant authorization; no live-payment authorization; no exact NIV functionality authorization; no new product policy; synthetic evaluation separate from real usage analytics; and enough contracts for Jeremy to begin instrumentation without another major owner decision.

<a id="ADMIN-B0133"></a>
Not established: application implementation, production performance, privacy/security/safety certification, vendor contractual fit, professional review, rights clearance or actual release. Required reviews and execution evidence remain open under the governing sources.

### Preserved supplementary part: word/header1.xml

	STEWARD  /  PRODUCT DEVELOPMENT	ADMIN + OBSERVABILITY  /  v1

### Preserved supplementary part: word/footer1.xml

	ENGINEERING HANDOFF • NOT A GOVERNING STANDARD	 / 

<!-- END_SOURCE ADMIN -->

## Preserved source module KICKOFF
**Original source:** `Jeremy_Phase_1_Build_Kickoff_v1.docx`  
**Original status:** Phase 1 execution/kickoff v1; not a governing standard  
**Source class / role:** IMPLEMENTATION BASELINE / Engineering or website handoff; not a governing standard  
**Preservation form:** Original file bytes plus full structural text  
**Input SHA-256:** `a14e8eb5365b767894c02a850040ef4cc8b3bf92ab1b4cd72ca4550661af3960`
The source text below retains its own original terminology, approval labels, internal references and limitations. The draft wrapper does not upgrade it or adopt superseded references as current. Figures and native page layout remain in the preserved original; reference assets are not runtime-approved content.
<!-- BEGIN_SOURCE KICKOFF -->

<a id="KICKOFF-B0001"></a>
STEWARD / ENGINEERING EXECUTION

<a id="KICKOFF-B0002"></a>
JEREMY — PHASE 1 BUILD KICKOFF v1

<a id="KICKOFF-B0003"></a>
Status: ENGINEERING EXECUTION / KICKOFF — NOT A GOVERNING STANDARD

<a id="KICKOFF-B0004"></a>
| PHASE 1 OBJECTIVE<br>Prove the core Steward experience end-to-end with synthetic data: Created for More → Account → Steward → Proposal → Participant Approval → Saved Blueprint → My North Star → My Starting Plan → Free Blueprint Export. The milestone is trustworthy identity, approval, versioning, retrieval, rendering, and instrumentation—not feature breadth. |
| --- |

<a id="KICKOFF-B0005"></a>
1. Build this path first

<a id="KICKOFF-B0006"></a>
| # | STAGE | WHAT MUST WORK |
| --- | --- | --- |
| 1 | Created for More v4 | Complete the approved 28-item assessment and render correct synthetic results. |
| 2 | Account + identity | Create/sign in to an isolated synthetic account and attach only authorized assessment context. |
| 3 | Steward conversation | Use the participant’s assessment as evidence, not approved Blueprint content; explore what matters now. |
| 4 | Blueprint proposal | Steward proposes exact wording in a distinct approval state. |
| 5 | Approve / Edit / Not Yet | Only the final confirmed participant-approved version becomes canonical Blueprint content. |
| 6 | My North Star | Render the whole-life overview from the same authoritative record. |
| 7 | My Starting Plan | Render the next faithful step and supported starting-plan content from the same record. |
| 8 | Free Blueprint export | Generate the three-page Free Blueprint from approved content, with truthful success/failure states. |

<a id="KICKOFF-B0007"></a>
2. Build underneath it from day one

<a id="KICKOFF-B0008"></a>
• Event capture and audit/outbox hooks.

<a id="KICKOFF-B0009"></a>
• Application/model/instruction/source/safety version traceability.

<a id="KICKOFF-B0010"></a>
• Content-free error, latency, provider usage and cost instrumentation.

<a id="KICKOFF-B0011"></a>
• Isolated synthetic admin/debug view.

<a id="KICKOFF-B0012"></a>
• Permanent synthetic regression-test harness with actual NOT RUN / PASS / FAIL evidence.

<a id="KICKOFF-B0013"></a>
Source basis: Jeremy Production Build Brief v1; Steward Admin + Observability Implementation Brief v1; Steward + MJG Digital Experience Implementation Brief v1; current governing Project Sources.

<a id="KICKOFF-B0014"></a>
3. Phase 1 is done when Jeremy can demonstrate these 16 things

<a id="KICKOFF-B0015"></a>
1. A fictional participant completes Created for More v4 and sees correct results, including ties and incomplete-answer behavior.

<a id="KICKOFF-B0016"></a>
2. The fictional participant creates/signs into an isolated synthetic account.

<a id="KICKOFF-B0017"></a>
3. Steward receives the authorized assessment context without turning assessment evidence into approved Blueprint wording.

<a id="KICKOFF-B0018"></a>
4. Steward discusses the results naturally and does not automatically make the lowest score the priority.

<a id="KICKOFF-B0019"></a>
5. Steward proposes concise Blueprint wording in a visibly distinct proposal state.

<a id="KICKOFF-B0020"></a>
6. The participant can Approve, Edit, or Not Yet.

<a id="KICKOFF-B0021"></a>
7. Only the exact final approved wording becomes canonical Blueprint content; rejected/pending wording does not.

<a id="KICKOFF-B0022"></a>
8. Logout/login retrieves the exact approved Blueprint and its version/history.

<a id="KICKOFF-B0023"></a>
9. My North Star renders from that same authoritative record and preserves the approved architecture.

<a id="KICKOFF-B0024"></a>
10. My Starting Plan renders from that same record and contains a useful next faithful step without inventing missing content.

<a id="KICKOFF-B0025"></a>
11. The Free three-page Blueprint can be previewed/exported with truthful success/failure/unknown handling.

<a id="KICKOFF-B0026"></a>
12. Ending/deleting an eligible raw conversation does not delete independently approved Blueprint content or selected continuity records.

<a id="KICKOFF-B0027"></a>
13. Two synthetic accounts cannot access, query, export, or overwrite each other’s private records.

<a id="KICKOFF-B0028"></a>
14. Jeremy can show which application build, model, instruction bundle, source bundle, safety/resource version and relevant feature flags produced a response/action.

<a id="KICKOFF-B0029"></a>
15. Jeremy can show sanitized errors, provider/API usage and estimated cost, plus actual synthetic test results in the internal debug view.

<a id="KICKOFF-B0030"></a>
16. Real-user enrollment, live payments, exact NIV text, and other unreleased features remain technically disabled—not merely hidden in the UI.

<a id="KICKOFF-B0031"></a>
| EXIT RULE<br>Phase 1 is not “done” because screens look polished. It is done when the end-to-end synthetic path works, the canonical record behaves correctly, version history is truthful, isolation is demonstrated, unreleased routes stay blocked, and executed evidence is recorded. |
| --- |

<a id="KICKOFF-B0032"></a>
Source basis: Jeremy Production Build Brief v1; Admin + Observability Brief §§9–15; Digital Experience Brief §§5–10, 21–24; approved P1 architecture/privacy/safety/commerce/rights sources.

<a id="KICKOFF-B0033"></a>
4. Do NOT build yet

<a id="KICKOFF-B0034"></a>
• Stripe checkout, live charges, recurring subscriptions, refunds, or sponsor billing.

<a id="KICKOFF-B0035"></a>
• Native iPhone/Android app.

<a id="KICKOFF-B0036"></a>
• Apple Health or other connected-health integrations.

<a id="KICKOFF-B0037"></a>
• Deep ForgedLife synchronization.

<a id="KICKOFF-B0038"></a>
• Church/sponsor dashboard or named sponsor activity feeds.

<a id="KICKOFF-B0039"></a>
• Advanced executive BI, A/B testing, predictive churn, behavioral profiling, or user-risk scoring.

<a id="KICKOFF-B0040"></a>
• Persistent raw-conversation archive or broad staff/admin conversation browser.

<a id="KICKOFF-B0041"></a>
• Exact NIV rendering or an unlicensed NIV serving corpus.

<a id="KICKOFF-B0042"></a>
• Public real-user enrollment or production use with private participant data.

<a id="KICKOFF-B0043"></a>
5. Make it come alive — build these where they support Phase 1

<a id="KICKOFF-B0044"></a>
Resettable Demo Mode: Create a one-click reset for a small set of fictional personas. Demo accounts must be clearly synthetic and isolated from any future real environment.

<a id="KICKOFF-B0045"></a>
Signature North Star: Treat My North Star as a hero experience, not a data dump. It should make the product understandable in seconds and visibly update after an approved change.

<a id="KICKOFF-B0046"></a>
Approval Card: Make “Steward Suggests → Approve / Edit / Not Yet → Confirmed Save” one of the most polished interactions in Phase 1.

<a id="KICKOFF-B0047"></a>
CFM Transformation Moment: After results, show one useful insight/question and a natural next action: “Save my results + Build my Free Blueprint.” Do not turn results into a sales wall.

<a id="KICKOFF-B0048"></a>
Lightweight Feedback: Include optional Helpful / Not Helpful and a separate Report a Problem path. No mandatory survey after every conversation.

<a id="KICKOFF-B0049"></a>
Feature Flags: Make Full Build, payments, exact NIV, ForgedLife sync, Living Mode and other gated features explicitly disabled/enabled through traceable configuration.

<a id="KICKOFF-B0050"></a>
Model / Instruction Swappability: Keep model, instruction bundle and serving-source bundle versioned so the same synthetic benchmarks can compare future model choices such as GPT vs Claude.

<a id="KICKOFF-B0051"></a>
Beautiful Free Blueprint: Invest in the three-page Free Blueprint output. The user should leave with something tangible, coherent and worth keeping.

<a id="KICKOFF-B0052"></a>
Release Status Panel: In the synthetic debug view, show current build, model, instructions, source bundle, safety version, known blockers and actual benchmark status.

<a id="KICKOFF-B0053"></a>
6. Golden Demo — the 5–7 minute show-and-tell

<a id="KICKOFF-B0054"></a>
1. Load a resettable synthetic participant with a completed Created for More v4 result.

<a id="KICKOFF-B0055"></a>
2. Show useful results and the natural “Save my results + Build my Free Blueprint” transition.

<a id="KICKOFF-B0056"></a>
3. Enter Steward; demonstrate that Steward uses the assessment as evidence but lets the person choose what matters now.

<a id="KICKOFF-B0057"></a>
4. Have Steward propose one useful Blueprint statement/Guardrail/Rhythm; edit it once; approve it.

<a id="KICKOFF-B0058"></a>
5. Show the confirmed save and the exact update appearing in My North Star and My Starting Plan.

<a id="KICKOFF-B0059"></a>
6. Generate the Free three-page Blueprint.

<a id="KICKOFF-B0060"></a>
7. Log out/in and prove exact retrieval.

<a id="KICKOFF-B0061"></a>
8. Open the synthetic admin/debug view and show release/model/source versions, cost/error instrumentation and actual test status.

<a id="KICKOFF-B0062"></a>
Source basis: Digital Experience Brief v1; Admin + Observability Brief v1; Jeremy Production Build Brief v1. Demo Mode and Golden Demo are execution recommendations using synthetic data only.

<a id="KICKOFF-B0063"></a>
7. Tuesday kickoff — recommended working session

<a id="KICKOFF-B0064"></a>
| TIME | FOCUS | OUTCOME |
| --- | --- | --- |
| 0–10 min | Confirm scope | Review the one end-to-end Phase 1 path and the Do Not Build Yet list. |
| 10–25 min | Jeremy architecture walkthrough | Jeremy explains his proposed implementation: identity, Supabase schema/RLS, OpenAI call path, proposal/approval transaction, version manifests and synthetic environment. |
| 25–40 min | UX walkthrough | Confirm Home, CFM handoff, Steward conversation, approval card, North Star, Starting Plan and Free export priority. |
| 40–55 min | Instrumentation walkthrough | Confirm event allowlist, version traceability, cost/error tracking, feature flags, synthetic debug view and regression harness. |
| 55–65 min | Dependencies / blockers | List items that require counsel/provider/security review later; do not block synthetic work unless technically necessary. |
| 65–75 min | Commit to first demo | Jeremy identifies the first demo date, what will be real versus stubbed, and what evidence will be shown. |

<a id="KICKOFF-B0065"></a>
8. What Jeremy should have in front of him

<a id="KICKOFF-B0066"></a>
• Jeremy Production Build Brief v1 — functional/data path and canonical record behavior.

<a id="KICKOFF-B0067"></a>
• Steward + MJG Digital Experience Implementation Brief v1 (updated) — participant UX and screen priorities.

<a id="KICKOFF-B0068"></a>
• Steward Admin + Observability Implementation Brief v1 — telemetry, versioning, admin/debug, cost/error and testing requirements.

<a id="KICKOFF-B0069"></a>
• The clean 20-source governing Project corpus — controlling product/policy authority. Use issue-specific standards when detail is needed.

<a id="KICKOFF-B0070"></a>
9. Jeremy’s handback at the end of Phase 1

<a id="KICKOFF-B0071"></a>
• A working synthetic vertical slice and resettable demo fixture.

<a id="KICKOFF-B0072"></a>
• An as-built architecture diagram/data-flow summary showing OpenAI, Supabase, application, permissions and serving-source boundaries.

<a id="KICKOFF-B0073"></a>
• Schema migrations and RLS/role-policy summary.

<a id="KICKOFF-B0074"></a>
• Feature-flag and release/version manifest.

<a id="KICKOFF-B0075"></a>
• Metric/event dictionary plus cost/error instrumentation notes.

<a id="KICKOFF-B0076"></a>
• Executed synthetic test report with actual PASS / FAIL / BLOCKED / NOT RUN states.

<a id="KICKOFF-B0077"></a>
• Known issues, unresolved dependencies and items intentionally deferred.

<a id="KICKOFF-B0078"></a>
• Golden Demo runbook and a short release note for the current synthetic build.

<a id="KICKOFF-B0079"></a>
| PHASE 1 DECISION QUESTION<br>After the Golden Demo, ask one question before expanding scope: “Does this feel meaningfully different from a generic AI conversation because it produces a trustworthy, participant-owned Blueprint people can actually use?” If yes, improve and test the core. If no, fix the core experience before adding payments, integrations, dashboards or native apps. |
| --- |

<a id="KICKOFF-B0080"></a>
Source basis: This kickoff consolidates the existing implementation handoffs. It creates no new governing policy, does not authorize real participants or live payments, and does not authorize exact NIV functionality.

### Preserved supplementary part: word/header1.xml

STEWARD / PHASE 1 BUILD KICKOFF

### Preserved supplementary part: word/footer1.xml

	ENGINEERING EXECUTION / KICKOFF • NOT A GOVERNING STANDARD	1

<!-- END_SOURCE KICKOFF -->

## Preserved source module CFM-WEB
**Original source:** `CFM_Website_Handoff_original.md`  
**Original status:** Website handoff in original archive; non-governing; yields to CFM4, PRIV and current UX  
**Source class / role:** IMPLEMENTATION BASELINE / Engineering or website handoff; not a governing standard  
**Preservation form:** Original file bytes plus full structural text  
**Input SHA-256:** `06b6cd5c4610be98b7513f69da48656cba0de1054ef11eeee9026b1f76db4565`
The source text below retains its own original terminology, approval labels, internal references and limitations. The draft wrapper does not upgrade it or adopt superseded references as current. Figures and native page layout remain in the preserved original; reference assets are not runtime-approved content.
<!-- BEGIN_SOURCE CFM-WEB -->

<a id="CFM-WEB-B0001"></a>
# Created for More Check-In v4 — Website Update Notes for Jeremy

Revision date: September 11, 2026  
Companion document: `Created_for_More_Check-In_v4_Branded.docx`  
Status: Revised content for implementation; no live website changes or deployment are implied.

## 1. Scope and source of truth

Update the existing Created for More Check-In at the URL Mike supplied: https://michaeljgauthier.com/created-for-more-check-in.

The accompanying ten-page DOCX is the revised participant copy. It retains the existing assessment’s organization: welcome and purpose, framework and scoring instructions, seven scored layers, score interpretation, Blueprint Snapshot, next-step guidance, reassessment, reflection, and the onward journey.

The supplied v3 DOCX is the comparison baseline. This handoff does not claim an independent audit of the current website, its database keys, result-generation code, or email automations. Before release, reconcile this copy with the actual implementation. Do not overwrite historical responses or labels.

Source basis: the supplied `V.3 Created_for_More_Check-In_Stewardship_Blueprint_Assessment_Branded(1).docx`; Mike’s September 11 terminology and pathway decisions; Personal Stewardship Blueprint Template v4 as approved in the conversation; and `04_SB_Legacy_and_Legacy_Giving_Standard_v1`.

## 2. What remains unchanged

There are 28 scored statements: four in each of seven layers. Responses are integers from 1 through 5. Each complete layer is a simple sum from 4 through 20. The complete total ranges from 28 through 140. There are no reverse-scored statements or new weights. The Four Pillars still have one statement each within their shared layer; they are not four standalone validated subscales.

The response scale, layer-band boundaries and names, and overall-band boundaries and names are unchanged. Twenty-one scored statements are preserved exactly from the supplied v3 file. Seven scored statements are revised: three in Keystone Rhythms and all four in Legacy.

Layer bands:
- 17–20: Strong / Protect
- 13–16: Stable / Strengthen
- 9–12: Stretched / Focus
- 4–8: Drifting / Rebuild

Overall bands:
- 112–140: Aligned & Intentional
- 84–111: Aware but Stretched
- 56–83: Drifting in Key Layers
- Below 56: Time to Pause & Rebuild. For a complete assessment, the valid range here is 28–55, not 0–55.

The interpretation prose and recommended next steps are updated even though the numerical bands and names stay the same. Copy those revised tables from pages 6–7 of the new DOCX; do not leave old result/email language active behind the revised questions.

## 3. Exact changes to scored statements

The IDs below are position-based handoff labels, not a claim about existing database IDs. Map them to the actual item identifiers. Preserve both assessment version and item identity.

### L5_Q1

Previous: I have identified one or two habits that, if kept, would change everything else.

Revised: **I have identified one or two keystone rhythms that strengthen other important areas of my life.**

### L5_Q3

Previous: When a keystone habit slips, I notice quickly and recover instead of spiraling.

Revised: **When a keystone rhythm slips, I notice quickly and return instead of spiraling.**

### L5_Q4

Previous: My habits are shaping my identity, not just filling my to-do list.

Revised: **My rhythms support who I am becoming, rather than simply filling my to-do list.**

### L7_Q1

Previous: I am intentionally shaping what the next generation sees in me.

Revised: **I intentionally model the values I hope others will learn from my life.**

### L7_Q2

Previous: My time, money, and influence are aligned with what I want to leave behind.

Revised: **I use my time, resources, and influence to help others grow in what matters now.**

### L7_Q3

Previous: I have had a real conversation about legacy with someone I love.

Revised: **I model and explain generosity and invite others to practice it with me.**

### L7_Q4

Previous: I am building something today that will outlast me.

Revised: **I give others opportunities to practice what they are learning and encourage them to pass it on.**

## 4. Framework, interpretation, and visual copy

Use **Keystone Rhythms** for the formal layer/product term. Generic references to a habit may remain where they retain ordinary meaning; the unchanged Bedrock statement about a “Sunday habit” is intentional. Layer 5’s first revised item also replaces the absolute “change everything else” claim with “strengthen other important areas.” Its final revised item emphasizes the person becoming rather than implying that achievement earns identity.

Use **Foundation — Mission + Values + Direction** for the framework label. This does not rewrite the four Foundation statements.

Use **Family, Fitness, Fun, Finances** as the Four Pillars. Family includes actual family, friends, and community; it does not assume a spouse or children. Finances is not an additional layer. Drift + Return remains explicit in reflection and practice, but no eighth scoring layer is added.

Use **Personal Stewardship Blueprint** for the living guide and **My North Star — “My whole life in one view.”** for its visual overview. Do not introduce Essentials or Personal Compass as an active product/deliverable name.

Legacy leads with what life multiplies in people and through them while living. Legacy Giving means modeling, teaching, and equipping others to practice and pass on a lifestyle of generosity. Estate continuity supports this work but does not define it. The new items assess the participant’s modeling, use of resources, invitations, and equipping—not another person’s compliance or guaranteed outcomes.

The old raster cover diagram contained “Keystone Habits” and mortality-led Legacy language. The updated DOCX uses an editable overview with current labels. Check website images, accessible labels, mobile screens, result pages, downloadable reports, and email templates for the same old wording. Do not merely change the text next to an outdated graphic.

The lowest score starts a question; it does not determine the cause, establish a diagnosis, or automatically select a priority. Preserve all tied highest/lowest layers. Let the participant choose a priority in context. Show the individual Pillar responses when useful, even if the combined Four Pillars layer is not numerically lowest.

The Snapshot’s inferred “Drift Pattern” has become participant-centered “Pattern I recognize or want to understand.” Keep a generated interpretation distinct from a participant-confirmed observation. Assessment categories are not the Blueprint states Not Yet Explored, Taking Shape, or Defined for This Season. A high score does not qualify someone to lead a group; remove score-based leadership eligibility logic from recommendations.

## 5. Versioning, validation, and historical records

Suggested release identifier: `cfm-v4-2026-09-11`. This is a proposed identifier for implementation, not a record already created. The revision date is not the deployment date; record the actual release date separately.

Store or retain, using the actual application schema: assessment version, response date, exact item responses, scoring/interpretation version, layer totals, total, tied highest/lowest layers, individual Pillar responses, participant-chosen focus, and any approved next step. Keep questionnaire version and downstream marketing/CTA version distinguishable.

Do not replace v3 question text underneath earlier answers or relabel a v3 attempt as v4. Old reports must remain understandable in the version actually taken. Do not infer a version for an unlabeled historical record without checking the deployed content/release history.

Do not impute a missing answer as 0, 3, or “neutral.” A completed layer requires all four valid responses; the total requires all 28. Incomplete progress may be retained without manufacturing a completed score. Reject out-of-range, non-integer, or malformed responses rather than silently coercing them.

Do not silently join v3 and v4 results into a single improvement curve. Mark the version boundary and avoid an unqualified “improved by X points” statement across it. The same 140-point scale does not establish measurement equivalence after wording changes. No claim of clinical or psychometric validation is established by this revision.

Suggested scoring checks before release: all 1s → 28; all 3s → 84; all 4s → 112; all 5s → 140. Test both sides of 55/56, 83/84, and 111/112, and layer boundaries 8/9, 12/13, and 16/17. Test missing answers, invalid values, tied layers, and a high total paired with a low individual layer.

## 6. Public pathway — separate what is live from what is planned

Target experience: Created for More → immediate results and a useful next step → Steward helps create a Free Personal Stewardship Blueprint → optional Full Blueprint Build → optional ongoing Steward guidance.

There is no required seven-day wait. The existing seven-day pilot is a separate feedback/optional activation experience, not the cold-prospect prerequisite. The Free and Full versions are depths of one record; a paid transition must not restart the participant’s story.

For the current deployment, only enable actions that really work. While Steward and the guided Blueprint experience are not yet released, deliver the assessment result and practical starting plan. An optional “Notify me when Steward launches” action may be used only when its consent and delivery flow actually exist. Do not display a working “Start Steward” promise that leads to an unavailable product.

When Free Blueprint creation is released, the main next-step CTA can become “Build my free Personal Stewardship Blueprint.” Explain Steward in ordinary language before introducing a paid offer. Deliver genuine free value first; do not trigger an upgrade from a low score, shame, grief, spiritual doubt, crisis, or safety disclosure. No prices or payment rules are being changed in this assessment update.

The book, groups, church/facilitator pathways, and ForgedLife remain secondary, relevant options—not six competing mandatory steps. ForgedLife supports people and practice; it is not a required detour before receiving results or starting the public Free Blueprint experience.

## 7. Compass/group routing and optional feedback

Use known enrollment/channel information—not assessment score—to distinguish a six-week group participant from a public visitor. During Compass, the study and group remain primary. Preview later Blueprint personalization lightly; make the substantive Steward offer after the study. Sponsorship/activation rules remain governed separately and must not be inferred from taking the assessment.

Preserve the group reassessment cadence: before Week 1, end of Week 6, and 30 days after the challenge. Do not also start a competing standalone 30-day campaign. For public participants, retain the optional 30-day retake and lighter 60-day review concept.

An optional Quick Steward Check-In is a separate, brief practice-feedback experience—not another full assessment or a new score. A roughly 30-second check-in can ask what happened and what helped or got in the way. Recognize real progress, clarify possible drift, and encourage action and human connection. No response means unknown, not failure.

Notification cadence must be chosen and changeable; suppress duplicate group/Steward campaigns and respect quiet hours. Ask after the person understands the value. Keep marketing choices separate from account/service delivery. Avoid sensitive details in notification previews. Do not claim that a reminder is scheduled until an actual scheduling action succeeds.

## 8. Final handoff checks

Have Mike review the seven revised scored statements and the participant-facing guidance as the v4 release copy. Verify the exact 28 statements in the website, corresponding result copy, and any PDF/email outputs match the new version. Keep the prior source and historical records intact.

The ten-page DOCX is an assessment/reference document, not the three-page Free Personal Blueprint or thirteen-page Full Personal Blueprint. It does not replace the online-only Check-In instruction in study guides.

For Steward testing, identify this as the revised v4 assessment. Do not call it the live/deployed instrument until Jeremy confirms deployment. No website, billing, notification, participant record, or integration has been changed by preparing these files.


<!-- END_SOURCE CFM-WEB -->
