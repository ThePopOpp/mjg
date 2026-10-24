# STEWARD — Data, Identity, Privacy, Security and Participant Continuity

**Internal development project:** Steward V2.0  
**Intended engineering handoff:** Steward V1.0 — Initial Full Build  
**Document revision:** Draft 0.4 | September 26, 2026  
**Package ID:** SV2-DOCSET-D0.4-20260926  
**Status:** TARGETED ONBOARDING CORRECTION CANDIDATE — REPORTED D03 CONVERSATIONAL FAILURE PRESERVED; D04 RETEST NOT RUN; NO RELEASE

**Authority key.** `OD` identifies current owner direction recorded from the accompanying conversation; `INHERITED` identifies an existing source requirement; `DESIGN` identifies a newly authored implementation contract; `OPEN` identifies a genuine unselected detail or required evidence; `DEFERRED` identifies a capability outside the initial full-build target. Authoring approval is not final document acceptance, an executed test, a license, or permission to process real participant data.

**Read the current sections first.** For this candidate's product design, the scoped owner decisions and changes in master 11 take precedence over the specifically identified earlier product restrictions. Unchanged doctrine, participant agency, safety, privacy, rights and release protections still apply. Original modules at the end preserve their exact source text and historical approval scope; do not load this mixed review corpus wholesale as a runtime prompt.

## D01 — One identity; separately governed records

**INHERITED ARCH A–R / PRIV; OD-04/16.** One participant record means one authoritative verified identity with separate record families, not one all-access document. Keep raw conversation, reflection/evidence, proposed wording, participant-approved Blueprint content, approval proof, permissions, entitlements and operational metadata distinct. Retain the twenty original data classes and their access/lifecycle rules in full below. They are not twenty microservices.

The application, not a model, owns identity, authorization, scoring, approval transactions and protected writes. “The Blueprint Architect owns the Blueprint” describes functional responsibility for preparation and validation; it is not permission to write approved wording without participant approval. Every agent/tool receives the narrow information needed for its current purpose and no unrestricted database credential.

## D02 — Current continuity and privacy interpretation

**OD-16; INHERITED ARCH F / PRIV §§4–5/O03–O05; DESIGN purpose extensions.** Long-term personalization is built from participant-approved Blueprint versions, selected visible continuity notes, dated commitments/outcomes, selected decision summaries, relevant relationship context and chosen milestones. It does not require indefinite raw-chat history. The default raw-history posture remains session-only unless separately changed through an explicit approved policy and implementation review.

For this candidate, document these bounded continuity purposes: `blueprint_build`, `blueprint_living`, `relationship_context`, `commitment_followup`, `personal_review`, and `next_season_reflection`. They are proposed technical purpose keys implementing confirmed product direction, not executed consent. The interface explains which saved item will be used for which purposes. Storage, personalization, review, resurfacing, notifications, marketing and sharing are not interchangeable choices.

Participant approval of a concise saved note can support later reviews within an explained purpose. A separate lifetime journal, bulk autobiography or photograph archive remains deferred. Automatic autobiographical extraction, covert safety profiles and retained raw transcripts are not enabled. Current-session understanding may remain transient. Saved content remains visible, correctable, excludable and deletable through the existing rights/lifecycle workflow. Exact inactivity, session, backup, proof and retention schedules remain actual release-configuration work—not guessed durations or implied forever storage.

Do not revoke access to the retained Blueprint merely because Premium ends. Do not increase retention to fill a timeline. Independently approved records may remain legitimately retained after their source transcript is deleted, with a marker that the source is unavailable; that marker must not hide a copy of the transcript. Deletion of a record selected for removal invalidates or repairs affected derivatives rather than resurrecting it in summaries or caches.

## D03 — Common object envelope and allowed writes

**DESIGN extending ARCH D–I.** Every personal record or version has a server-assigned participant and record identity, record type, purpose and sensitivity classification, exact source/version or participant-report provenance, event date certainty, recorded/updated time, content/approval state, lifecycle-policy reference and access revision. Reference existing fields rather than duplicate full private payloads across tables. Sensitive notes and logs must remain separate.

| Operation | Authority and result |
| --- | --- |
| Create proposed wording | AI may propose through an authorized service; proposal status cannot become approved automatically. |
| Approve / revise personal wording | Authenticated participant approves exact displayed version/scope; transaction checks expected current version and commits receipt + new version consistently. |
| Save selected continuity | Explicit participant selection and explained eligible purpose; distinct from Blueprint approval. |
| Record reported outcome | Preserve the participant's report and time scope; not independent proof and not a new commitment. |
| Correct or exclude | Participant-controlled versioned correction/exclusion; update eligible derived uses. |
| Delete | Verified scoped deletion workflow, with records/hold rules; no silent use of retained proof or backups for personalization. |
| Grant or change service access | Authorized entitlement service from approved commercial facts or administrative authority; never a model or private-content inference. |
| Dispatch a notification | Current purpose/channel grant, source eligibility, access and release checks; queue acceptance is not delivery. |

A failed or unknown transaction returns its actual state. Reconcile on timeout before retrying; retries cannot duplicate commitments, accounts, grants or messages. A UI refresh failure does not undo a committed record. Never use last-write-wins to overwrite conflicting participant-approved wording.

## D04 — Agent retrieval contract

**DESIGN; AG01–AG09 in master 08.** An authorized retrieval request carries a server-owned actor and participant context, operation, purpose, requested record kinds/IDs, time scope, permitted sensitivity, current permission revision and allowed feature. The application resolves effective access before content enters the model. Scope cannot be enlarged by model-generated JSON, a quoted instruction, an uploaded file or a claimed church role.

The response contains only relevant permitted records, their authoritative version/state, provenance, time scope, explicit gaps and actual permission result. Use exact approved text for canonical facts and label interpretations. Never retrieve expired, deleted, restricted, legal-hold-only or another participant's records to improve an answer. Narrow summaries must not lose uncertainty or approval status. A specialist may return missing-context questions rather than requesting an entire conversation archive.

## D05 — Existing expanded object contracts retained

The original OBJ-01–OBJ-11 definitions follow in this master. Their logical roles are preserved, with the candidate scope clarified: season/posture/capacity/Right Season/evidence/decision objects support the current full-build target; personal-review projections use selected legitimate records; Life Story and media-specific uses remain deferred. Specific field layouts are design recommendations until engineering review. Do not treat every allowed data class as a requirement to collect every field.

### OBJ-01 — Season / season version

**Logical placement:** ARCH class 02 or approved structured extension; exact placement for engineering review.

**Minimum proposed fields:** participant_id, season_id, version_id, name, statement, purpose, start/end with date-certainty, status, source_ref, approval_ref, supersedes_ref, policy_version.

**Invariant:** At most one current approved overarching season per participant. Proposed and historical versions never replace current by display alone. Dates may be approximate or unknown.

**Lifecycle / write contract:** Create/update is an exact version-bound approval transaction. A transition previews old/new context and leaves unrelated fields unchanged. Deletion follows purpose and records policy.

**Detailed contract / review dependency:** DEC-03. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-02 — Blueprint-area posture

**Logical placement:** ARCH class 02; linked to a specific Blueprint area and season.

**Minimum proposed fields:** area_ref, season_ref, posture_text, explanation, version_id, effective_scope, approval_ref.

**Invariant:** A posture is neither a definition state nor a clinical/spiritual score. Custom participant language remains possible; no forced taxonomy.

**Lifecycle / write contract:** Changing a posture does not auto-create a practice. A deleted season/link requires explicit lifecycle handling rather than orphaned current claims.

**Detailed contract / review dependency:** DEC-03. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-03 — Capacity reflection

**Logical placement:** ARCH class 04 unless an approved summary is adopted in class 02; separate access classification.

**Minimum proposed fields:** reflection_id, period/context, participant_wording, optional_zone, source_refs, interpretation_label, confirmation_ref, lifecycle_policy_ref.

**Invariant:** No diagnostic thresholds, risk score or hidden capacity profile. Store only the minimum needed; a zone may remain unstored and unlabeled.

**Lifecycle / write contract:** Reassess contextual fit rather than carry a stale zone forever. Correct/exclude/deletion operations cover derived uses; not available to entitlement or sponsor reporting.

**Detailed contract / review dependency:** DEC-03. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-04 — Right Season item

**Logical placement:** Approved structured participant record; no new data purpose by naming a table.

**Minimum proposed fields:** item_id/version, purpose_text, why_not_now, prerequisites, optional_review_condition, scope, approval_ref, source_ref, lifecycle_policy_ref.

**Invariant:** Deferred is not failed or overdue. Review condition is data, not sending permission. Activating an item requires a new participant choice.

**Lifecycle / write contract:** Separate trigger registration from save; evaluate the current grant before firing. Deletion/revocation cancels eligible derivative jobs without resurrecting source content.

**Detailed contract / review dependency:** DEC-02, DEC-03, DEC-04. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-05 — Evidence definition and observation

**Logical placement:** ARCH classes 03/04/07 as appropriate; keep these roles distinct.

**Minimum proposed fields:** definition_id/version, target_ref, label, kind, unit/prompt, interval, allowed_source; observation_id, reported_at, observed_period, value_or_story, missingness, source_type/ref, correction_ref.

**Invariant:** Definitions and observations are different records. A reported action and an application-confirmed event have different provenance. Missing is not zero; qualitative evidence is allowed.

**Lifecycle / write contract:** Approval of the measure does not approve all future observations or authorize connectors. Protect sensitive narratives and avoid aggregate life scores.

**Detailed contract / review dependency:** DEC-02, DEC-03. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-06 — Decision preparation / selected summary

**Logical placement:** Transient context; selected continuity/evidence only for an approved purpose.

**Minimum proposed fields:** decision_context, options, supplied_constraints, unknowns, approved_anchor_refs, considered_tradeoffs; optional summary_id, selection/approval and lifecycle refs.

**Invariant:** The participant’s choice is distinct from an AI recommendation and from an actual external action. A permanent decision ledger is not the default.

**Lifecycle / write contract:** Draft privately; save only selected content under an eligible purpose. Any resulting commitment uses the canonical approval flow; sending/booking/paying is separate.

**Detailed contract / review dependency:** DEC-02, DEC-03. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-07 — Selected continuity; expanded Story / Journal deferred

**Logical placement:** ARCH class 04; restricted classification where justified by content.

**Minimum proposed fields:** item_id/version, exact_source_text, source_type, event_date/certainty, recorded_at, purpose_ids, storage_choice, eligible_uses, exclusions, derivative_refs, lifecycle_policy_ref.

**Invariant:** Storage, personalization, annual-review use, resurfacing and sharing are distinct permissions. No automatic autobiographical extraction from ordinary conversation.

**Lifecycle / write contract:** Provide visible edit/correction/exclusion/deletion; invalidate eligible cached summaries, search derivatives and queued messages. Record what deletion did and what justified exceptions remain.

**Detailed contract / review dependency:** DEC-02. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-08 — Media asset and derivatives — DEFERRED

**Logical placement:** Approved later attachment/media store; source sensitivity follows the asset.

**Minimum proposed fields:** asset_id, owner_ref, selected_upload_ref, storage/display purpose, type, rights basis, relevant third-party/minor review, metadata treatment, derivative lineage, policy refs.

**Invariant:** No library-wide import, automatic tagging, identity recognition or image-model processing by implication. A photo’s presence is not consent of every person depicted.

**Lifecycle / write contract:** Release requires reviewed upload/content controls, processing and deletion behavior for originals and derivatives. Retain native source artwork separately from participant uploads.

**Detailed contract / review dependency:** DEC-06, DEC-07, DEC-13. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-09 — Review / timeline projection

**Logical placement:** Derived view over authorized record versions; not a competing canonical archive.

**Minimum proposed fields:** review_id/type, selected_period, selection_manifest, source_version_refs, coverage/gaps, interpretation_labels, participant_exclusions, approved_summary_ref, rendering_version.

**Invariant:** Only eligible retained content is used. An approved summary does not independently verify the underlying event. Historical views never mutate current pointers.

**Lifecycle / write contract:** Recompute or suppress affected derived views after correction/deletion/revocation. Preview exports and validate access at generation and delivery.

**Detailed contract / review dependency:** DEC-02, DEC-03, DEC-10. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-10 — Notification / trigger / delivery

**Logical placement:** ARCH classes 08/12 and minimal operational receipts; no private shadow transcript.

**Minimum proposed fields:** purpose/channel grant, disclosure version, cadence, timezone/quiet hours, pause/revoke state, trigger source, template_version, job_id/idempotency_key, attempt and provider outcome.

**Invariant:** Optional sending defaults off. Channel permission and purpose permission must both exist; no automatic channel fallback or sensitive lock-screen detail.

**Lifecycle / write contract:** Recheck grants, source eligibility and flags at dispatch; bounded retry; cancel on withdrawal. Confirm only the provider/application state actually returned.

**Detailed contract / review dependency:** DEC-04. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.

### OBJ-11 — Membership benefit / event access

**Logical placement:** COM versioned offers/benefit templates; separate event/recording consent.

**Minimum proposed fields:** benefit_template/version, eligible_offer/grant refs, effective dates, availability, event/resource terms, delivery responsibility, signup/recording choices.

**Invariant:** No new tier, price, recurring agreement, sponsored eligibility or event promise is inferred. A member is not an authorized viewer of private content.

**Lifecycle / write contract:** Honor purchased terms and explicit transition treatment. Event enrollment and payment authorization remain different transactions.

**Detailed contract / review dependency:** DEC-08, DEC-09. **Product-direction status:** see master 11; core direction is not reopened. **Implementation/testing:** NOT EVIDENCED.


## D12 — Registration and participant core

**DESIGN for X01; inherited identity controls apply.** Store `participant_id`, unique verified authentication subject mapping, participant-selected display name, necessary contact reference held by identity services, account/eligibility state, required notice/acceptance versions, creation/update timestamps and entry-path code. Optional display time zone is separate from legal geography and church location. Do not put personal beliefs or family/health facts into identity records.

Provision identity mapping, Free grant and empty Blueprint consistently or through a recoverable, idempotent sequence with explicit pending states. An existing verified auth subject returns its existing participant; duplicate-email detection must not expose account existence or merge private records without identity assurance. Treat account creation, required processing authority and optional personal memory permissions as separate acts. Registration doesn't approve any life statement.

Assessment participation is linked independently: `not_started`, `in_progress`, `completed`, `withdrawn_or_deleted` with actual instrument/version and missingness. These proposed operational labels do not replace T4 definition states. No-assessment participants get no fabricated assessment row full of defaults or zero scores. Retain only the record facts required for the actual status.

**Controlled simulation evidence — OD-21 / master09 Q07.** Maintain separate input, choice and application-result states. Contact details are unverified input. Presenting a notice is not acknowledgment; a participant choice is not proof its record was persisted. Only Mike in tester role via TEST CONTROLLER EVENT or a separately implemented authorized harness may supply simulated verification, MFA/authentication, account, grant/container and save confirmations. The model may not manufacture them. Missing prerequisites/confirmations stay pending; an email-only event supplies no other result. A batched event may confirm several results only after the relevant actual test choices/prerequisites exist. Existing PRIV §2.4/O13 authentication and private-access gates remain. Registration does not approve a note or Blueprint wording, and approval does not prove a save. No simulation state establishes real application correctness.

## D13 — Church affiliation

**DESIGN for X06; sensitivity inherited from PRIV.** Suggested fields: `affiliation_id`, `participant_id`, optional canonical church/campus reference, participant-entered name/location where needed, status (`provided`, `no_current_church`, `prefer_not_to_say`, or no record), source/confirmation date and lifecycle reference. Keep optional attendance information separate; do not invent involvement or require it at registration.

The participant can update/remove affiliation without altering a sponsor grant or account identity. Directory matching should offer confirmation; no automatic roster membership. Private affiliation is not available to a sponsor, general marketing engine, payment metadata or referral link. Privacy-reviewed aggregates may support owner adoption analysis only under explicit purpose, small-cell/slicing safeguards and limited roles. Minimum cell thresholds require actual approved configuration; do not silently default to a named list.

## D14 — Acquisition and optional referral attribution

**DESIGN for X04/X06.** Separate acquisition source, campaign ID, opaque invitation token reference and actual entitlement source. Record how the fact was obtained and whether it is user-reported versus application-observed. A church affiliation does not set acquisition source or sponsor. Avoid full browsing history, advertising profiles or source URLs containing private payloads.

Referral records hold an opaque cryptographically random token, issuing participant reference restricted to the referral service, allowed destination, creation/expiry under a reviewed policy, and optional minimal attribution after lawful/authorized registration. Tokens confer no private-record access. Avoid a named pending-recipient contact table. Referrer-facing display should not disclose another person's registration, payment, use or outcome. Attribution deletion and expiration need a defined policy; do not equate pseudonymous with anonymous.

## D15 — Attention settings and promotion preferences

**DESIGN for X03/X07.** Keep participant-chosen check-in cadence, intensity, allowed purposes/channels, time zone, quiet hours, pauses, explicit stop preferences and their disclosure/version receipts. Store only the minimum conversation/session promotion counter and cross-session preference needed to honor choices. A new tab or specialist run uses the same effective preference.

No private reason for suppression is written into commerce or analytics. An ephemeral safety/appropriateness result can suppress an invitation without recording a medical/spiritual/emotional category in the participant profile. Privacy-reviewed generic interaction events are operational facts; they are not evidence of personal transformation.

## D16 — Experiment and protected practice

**DESIGN for X08/X09.** Reuse the commitment/version family: purpose/Blueprint reference, exact chosen action, cue, minimum version, start/end/review scope, approval receipt and lifecycle state. Separate reported outcomes. Mark an expired trial `ended_awaiting_review` or equivalent; do not default to `failed` or turn it into an ongoing Rhythm.

A Protect preference links the approved area/direction to what should be sustained, with context and optional review. It is not a global stop flag, an unchangeable priority or a new definition state. Both records are excluded from promotion targeting and aggregate life scoring.

## D17 — Groups, membership and grants

**DESIGN for X05/X12.** A generic group record has group ID, type, name, administrator scope and version. Membership has participant, source, effective interval or explicit no-expiry selection, role limited to that group, approval/delegation reference and audited change history. Membership alone grants neither premium access nor private-content visibility.

Benefits reference versioned templates; entitlements reference actual source grants. No-expiry must be an explicit value such as `expiry_kind=NONE` with authorized issuance, not an accidental missing date. Staff delegation, owner price authority and security/privacy authority are separate roles. Removing an Inner Circle membership must not cancel an independently purchased subscription or delete content.

## D18 — Checkout and return-to-work bookmark

**DESIGN for X03.** Store order/offer version, opaque workflow reference, authenticated participant binding, allowed return route, selected draft/proposal references and actual transaction state. Never put private text, prompt content or tokens in URLs or payment metadata. Redirects use an allowlist; a return URL is not approval or payment evidence.

Within the still-valid session, resume existing authorized context. For cross-session continuity, use existing approved records or ask to save a short selected bookmark/summary for an explained purpose. Do not extend raw-chat retention merely to make checkout seamless. The participant can cancel checkout without losing already saved work; unsaved session content is not promised to survive expiration. For CHG-DEC09-001 preserve the same workflow bookmark through payment confirmation, pending entitlement, explicit “Activate Premium and continue with Steward,” activation confirmation and resumed work. Do not store a new transcript or re-run intake to bridge these states. A successful purchase does not approve the bookmark's personal wording.

## D19 — Catalogue, offer and grant constraints

**DESIGN; details in master 07.** Use stable product identifiers without embedded prices, immutable offer versions and separate benefit templates. Each price/discount change creates a future/current offer version, not an in-place rewrite of purchased terms. Store integer currency minor units and explicit cadence, tax/disclosure configuration, access clocks, renewal treatment, stacking rules, redemption limits and approval references. For CHG-DEC09-001 link the immutable initial/renewal phases, exact recurring-assent snapshot and timestamp, payment confirmation, pending benefit, explicit activation event, immutable activation anniversary, Build/Premium interval endpoints, invoice intervals, cancellation request/confirmation fence, refund outcomes and notice receipts. Physical names remain DESIGN. Product approval is distinct from participant consent and actual publication.

Administrative nonexpiring service, fixed-duration complimentary access and 100%-discount offers must distinguish whether any billing agreement exists. A no-card grant cannot gain one through expiration, a metadata update or a group change. The model may request a safe offer comparison but cannot set amount, entitlement dates, discount, refund or renewal authority.

## D20 — Release and operational records

**DESIGN for X13.** Record package digest, base/target product versions, code commit, schema/migration, prompt versions, canon/serving-source manifest, rights policy, feature/configuration versions, approvals and executed test evidence separately. No actual deployed version is filled from this documentation label. Record CHG-DEC09-001 product approval separately from exact-candidate acceptance, specialist clearance, D02-001 conversation evidence, application execution evidence and production authorization. An owner test request is not a test result.

Record content-free model calls, operation class, requested/actual model, billable-unit metadata, retries, duration and rate-card version. Do not store raw prompts/completions in ordinary logs or a product-learning warehouse. Owner access remains purpose-limited; ownership of Steward is not blanket access to private content. A `feature_enabled` flag cannot bypass an unmet release, safety, identity, entitlement, rights or consent condition.

## D21 — Public, account and participant-content boundaries

Public resource content, required identity/contact data, private Blueprint/continuity content, billing facts, group benefits, church affiliation and source corpus are different data domains. No single “CRM participant record” may expose all of them to marketing or an organization administrator. Keep account support, commercial administration and participant-content services narrowly scoped.

For referrals and church adoption reporting, minimize data from the start rather than promise that copying conversations and later deleting names is anonymous. Product-learning metrics should describe actual service operation and voluntary usefulness feedback, not inferred psychological profiles, secret conversation scoring or spiritual grades. Every optional research or evaluation use of real participant content remains outside the selected initial scope.

## D22 — Unchanged release requirements

Preserve participant MFA/recovery/step-up, least privilege, cross-account isolation, actual provider contractual fit, ZDR-first/no automatic unapproved fallback, reviewed retention/deletion/holds, no routine transcript monitoring, secure self-export, and sponsor privacy. The new product requirements do not waive these controls. Exact production schemas, processor contracts, jurisdictions, support roles and retention durations require actual evidence. This package contains no executed migrations or legal/security certification.

# Full preserved source modules

**Preservation boundary for Draft 0.4:** Every BEGIN_SOURCE/END_SOURCE body below is unchanged from the supplied Draft 0.3 master and its archived earlier bodies. This candidate verifies those byte comparisons; the complete previous Draft 0.3 package and earlier archives remain unchanged in ARCHIVE. Original version labels and source-local approval/history claims remain historical evidence. Current product-design amendments appear above and in master 11. A preserved statement that a capability was once deferred does not undo a specifically recorded newer owner direction; a new design does not waive inherited safety, privacy or rights controls.

**Native-file limitation:** Draft 0.1's module metadata sometimes says that native files, artwork and earlier QA exist elsewhere. This package does not claim to contain those unprovided archives. Consult EVIDENCE/Native_Source_Availability.json and SOURCE_COMPLETENESS.md for what is actually included. Source-body preservation is not a re-audit of every original page or a rights clearance.

## Preserved source module ARCH
**Original source:** `P1-01_Production_Data_Architecture_v1_APPROVED_PRODUCTION_DATA_ARCHITECTURE.docx`  
**Original status:** Approved September 11, 2026; architecture v1; open downstream gates  
**Source class / role:** GOVERNING SOURCES / Issue-specific source; see original status and scope  
**Preservation form:** Original file bytes plus full structural text  
**Input SHA-256:** `cc5d1004181a347814a69608388878c4fe12809d7b3127021dd851afe9f587dd`
The source text below retains its own original terminology, approval labels, internal references and limitations. The draft wrapper does not upgrade it or adopt superseded references as current. Figures and native page layout remain in the preserved original; reference assets are not runtime-approved content.
<!-- BEGIN_SOURCE ARCH -->

<a id="ARCH-B0001"></a>
P1-01 PRODUCTION DATA ARCHITECTURE v1

<a id="ARCH-B0002"></a>
Status: APPROVED PRODUCTION DATA ARCHITECTURE
Approved by: Michael J. Gauthier
Approval date: September 11, 2026
Prepared for: Michael J. Gauthier
Prepared: September 11, 2026
Scope: Production data architecture, structured participant records, information lifecycle, and implementation boundaries.

<a id="ARCH-B0003"></a>
P1-01 Production Data Architecture v1 was approved by Michael J. Gauthier on September 11, 2026 as Steward’s governing production data-architecture specification within its stated scope. Approval covers the architecture decisions embodied in Section M.A and the supporting architecture throughout Sections A–R, while preserving downstream release, policy, and feature-specific gates. [OD-P1; OD-F; OD-A]

<a id="ARCH-B0004"></a>
Approval of this architecture does not constitute legal compliance certification, security certification, production readiness, authorization for real participants, or completion of P1-02 through P1-10. It does not modify any existing Steward governing source or confirm that a proposed capability is implemented. No Steward retention periods, launch jurisdiction, or participant eligibility rules are established here.

<a id="ARCH-B0005"></a>
#### Authority labels used in this specification

<a id="ARCH-B0006"></a>
| Label | Meaning |
| --- | --- |
| Approved product requirement | A requirement supported by an existing governing Steward source, within that source’s scope. |
| Architecture recommendation | A design recommendation supporting the approved architectural direction. Unless otherwise labeled, the technical specifications below remain recommendations, subject to the approval scope and open gates in Sections M and N. |
| Conditional legal requirement | A requirement in an identified law whose applicability to Steward must be determined from the actual business, participants, jurisdictions, and processing activities. |
| Release / policy or feature-specific gate | An unresolved decision requiring owner approval, qualified professional review, or both before the affected functionality is released. These gates do not prevent approval of the underlying configurable architecture; Section M distinguishes them from architecture decisions. |

<a id="ARCH-B0007"></a>
The Operating Instructions v0.4 and Sensitive Conversations & Safety Standards v0.3 retain their actual working-test-baseline status. Their approval does not constitute production safety or privacy certification. [OI, §§11–13; SC, §1]

<a id="ARCH-B0008"></a>
### A. Executive architecture recommendation

<a id="ARCH-B0009"></a>
#### A.1 Recommended organizing principle

<a id="ARCH-B0010"></a>
Retain the durable truth of the relationship—not every raw word forever.

<a id="ARCH-B0011"></a>
Build Steward around one logical participant record, composed of separately governed record types.

<a id="ARCH-B0012"></a>
“One participant record” should mean consistent identity, continuity, and authoritative approved content—not one large database document containing every conversation, disclosure, payment, and inference.

<a id="ARCH-B0013"></a>
The production architecture should have five principal parts:

<a id="ARCH-B0014"></a>
| Part | Responsibility |
| --- | --- |
| Structured participant core | The current Personal Stewardship Blueprint, versions, proposals, assessments, authorized evidence, commitments, and reported outcomes. |
| Permissions and access controls | Identity, consent, sharing permissions, confirmed entitlements, recipient authorization, and purpose-specific AI retrieval. |
| Private content stores | Conversations, journals, attachments, and especially sensitive evidence, each with an appropriate lifecycle. |
| Proof and records-management services | Approval receipts, important action history, retention policies, deletion workflows, legal holds, and narrowly scoped dispute evidence. |
| Operational services | Billing metadata, integration jobs, security logs, support workflows, and minimized analytics, separated from private participant content. |

<a id="ARCH-B0015"></a>
The central distinction must remain:

<a id="ARCH-B0016"></a>
Raw conversation ≠ reflection/evidence ≠ proposed Blueprint content ≠ participant-approved Blueprint content ≠ approval/audit evidence ≠ operational logs.

<a id="ARCH-B0017"></a>
#### A.2 Preserve the existing product architecture

<a id="ARCH-B0018"></a>
Approved product requirements: Free and Full deepen the same participant’s Blueprint. My North Star is a view within that Blueprint, not another personal record. Entitlement, content approval, definition, and practice evidence remain different dimensions. [PJ, §2.2; T4, §§4, 8]

<a id="ARCH-B0019"></a>
Accordingly:

<a id="ARCH-B0020"></a>
A purchase should change access, not silently change personal wording or Definition State.

<a id="ARCH-B0021"></a>
An assessment should supply assessment evidence, not automatically establish a value or commitment.

<a id="ARCH-B0022"></a>
A conversation should support exploration, not become the permanent authority for everything subsequently said.

<a id="ARCH-B0023"></a>
An export should render selected records, not become a competing editable source of truth.

<a id="ARCH-B0024"></a>
#### A.3 Recommended retention position

<a id="ARCH-B0025"></a>
Keep approved personal direction and necessary proof while they serve a legitimate, documented purpose. Give raw conversations, temporary summaries, exports, and debugging material shorter, separately controlled lifecycles. No indefinite raw conversation retention by default; Section F.1 sets the architecture principle while reserving exact periods and the launch-history default for the approved privacy/consent/legal work.

<a id="ARCH-B0026"></a>
Durable does not mean permanent or exempt from deletion. Approved wording, historical versions, approval receipts, and linked identifiers are themselves subject to purpose limitation, applicable rights, justified exceptions, and retention schedules.

<a id="ARCH-B0027"></a>
FTC business guidance supports collecting only information that is needed, restricting access, establishing a written retention policy, and disposing of information when its legitimate purpose ends. That guidance supports this design direction; it does not supply a universal legal retention schedule. (FTC, Protecting Personal Information: A Guide for Business)

<a id="ARCH-B0028"></a>
#### A.4 Recommended implementation shape

<a id="ARCH-B0029"></a>
Start with a modular transactional application, rather than a distributed system built merely to separate every table.

<a id="ARCH-B0030"></a>
Use transactional storage for authoritative records, private object storage for larger payloads, a policy-enforcing application layer, and background jobs/workers for integrations and records management. These can operate within the same modular application deployment where appropriate.

<a id="ARCH-B0031"></a>
The twenty data classes are logical governance categories, not twenty separate services. Use appropriate table/schema boundaries and restricted stores where justified. Do not introduce unnecessary microservices or distributed-system complexity merely to express those distinctions.

<a id="ARCH-B0032"></a>
Separate particularly sensitive content through policy-controlled access and, where the approved threat model justifies it, application-level/envelope encryption. Use established, vetted cryptographic facilities rather than custom cryptography. Stronger infrastructure or key-management isolation may be appropriate for restricted sensitive stores; this does not require a separate custom encryption system for the entire application.

<a id="ARCH-B0033"></a>
### B. Core data principles

<a id="ARCH-B0034"></a>
#### B.1 Participant authority over Blueprint content

<a id="ARCH-B0035"></a>
Approved product requirement: AI proposes; the participant approves; the system records. Assessment results, journals, sensitive disclosures, activity, and interpretations do not automatically become approved Blueprint wording. Meaningful revisions require approval and preservation of the previous approved wording and history. [OI, §6; T4, §10]

<a id="ARCH-B0036"></a>
The architecture should enforce this rule in application and database operations, not rely solely on an instruction to the AI.

<a id="ARCH-B0037"></a>
#### B.2 Purpose before collection

<a id="ARCH-B0038"></a>
Every persisted record should have an identifiable purpose.

<a id="ARCH-B0039"></a>
“Potential future usefulness,” “better personalization someday,” and “legal protection” without a specific records rationale should not be sufficient collection or retention purposes.

<a id="ARCH-B0040"></a>
#### B.3 Separate possession from permission

<a id="ARCH-B0041"></a>
The existence of information in Steward does not mean:

<a id="ARCH-B0042"></a>
the AI may retrieve it for every conversation;

<a id="ARCH-B0043"></a>
a support employee may inspect it;

<a id="ARCH-B0044"></a>
it may be shared with a spouse or church;

<a id="ARCH-B0045"></a>
it may be used for marketing, research, or model training;

<a id="ARCH-B0046"></a>
it belongs in the Blueprint.

<a id="ARCH-B0047"></a>
Permission should be evaluated for the particular actor, purpose, record, operation, and time.

<a id="ARCH-B0048"></a>
#### B.4 Preserve provenance without preserving everything

<a id="ARCH-B0049"></a>
A retained record should identify where it came from and what it represents.

<a id="ARCH-B0050"></a>
When an eligible source conversation is deleted, the independently approved statement can remain—where legitimately retained—with a provenance marker indicating that the source transcript is no longer available.

<a id="ARCH-B0051"></a>
That marker should not conceal a retained copy of the deleted transcript.

<a id="ARCH-B0052"></a>
#### B.5 Distinguish uncertainty from failure

<a id="ARCH-B0053"></a>
Missing assessment answers, missing device data, unreported practice, uncertain transmission results, and unverified entitlement must remain explicitly uncertain.

<a id="ARCH-B0054"></a>
Do not convert missing data into zero, a missed commitment, inactivity, refusal, or confirmed success. This follows the governing assessment, engagement, and connected-data distinctions. [PJ, §§3, 7.3, 10, 15, 19; CFM4, pp. 5–6, 9]

<a id="ARCH-B0055"></a>
#### B.6 Minimize access and replication

<a id="ARCH-B0056"></a>
Prefer references to authoritative records over repeated copies.

<a id="ARCH-B0057"></a>
Necessary copies—such as a transmission payload or retained approval receipt—should have their own documented purpose, access controls, and deletion behavior.

<a id="ARCH-B0058"></a>
#### B.7 Keep retention and integrity compatible

<a id="ARCH-B0059"></a>
Use tamper-resistant history for records that are legitimately retained. Also support authorized destruction.

<a id="ARCH-B0060"></a>
An append-only audit design must not become an undeletable repository of personal content.

<a id="ARCH-B0061"></a>
#### B.8 Treat privacy as a lifecycle

<a id="ARCH-B0062"></a>
Collection, inference, retrieval, sharing, backup, restoration, support access, deletion, and incident handling are all part of the architecture.

<a id="ARCH-B0063"></a>
The NIST Privacy Framework is a voluntary privacy-risk-management tool, not a certification. It is an appropriate organizing reference for the privacy work accompanying this specification. (NIST, Privacy Framework)

<a id="ARCH-B0064"></a>
### C. Data-class matrix

<a id="ARCH-B0065"></a>
The following three linked tables jointly specify the lifecycle of all twenty requested classes.

<a id="ARCH-B0066"></a>
#### C.1 Rules inherited by every row

<a id="ARCH-B0067"></a>
Approval rule. No class may directly change approved Blueprint wording. Where proposal use is allowed, adoption still requires the participant-approval transaction described in Section E.

<a id="ARCH-B0068"></a>
Legal-hold rule. Every class supports record-specific preservation under Section G. A hold does not authorize additional sharing, ordinary AI retrieval, or unrelated retention. Conflicts between preservation and deletion obligations require qualified legal resolution.

<a id="ARCH-B0069"></a>
Deletion rule. Deleting a source does not silently delete an independently authorized record. Conversely, calling something “audit,” “derived,” or “historical” does not automatically exempt it from deletion.

<a id="ARCH-B0070"></a>
Sharing rule. Public, sponsor, church, group, and cross-service access is denied unless a specific authorized workflow permits it. Lawful compelled disclosure is handled separately through legal review.

<a id="ARCH-B0071"></a>
Audit rule. Each class records relevant creation, change, permission, access, export, and disposition events according to its risk. Ordinary logs should record identifiers and outcomes—not duplicate private payloads.

<a id="ARCH-B0072"></a>
Open decisions. Before the affected real-participant release, all enabled classes require an approved retention schedule, accountable owner, vendor-location inventory, and applicable legal review. These are release/policy or feature-specific gates under Section M, not prerequisites to approval of the underlying configurable architecture. Row-specific open decisions appear below.

<a id="ARCH-B0073"></a>
#### C.2 Retention and security profiles

<a id="ARCH-B0074"></a>
These profiles establish postures, not durations.

<a id="ARCH-B0075"></a>
| Profile | Recommended posture |
| --- | --- |
| Transient processing | Keep only for the authorized session, operation, recovery, or delivery purpose; then purge. |
| Participant working record | Retain while the participant chooses to maintain it and the documented purpose remains valid; support granular deletion and an approved inactivity policy. |
| Blueprint continuity | Retain current approved content and useful history while the participant maintains the Blueprint, including applicable Free access. Paid expiration is not account closure. |
| Necessary proof | Retain narrowly scoped evidence for a documented approval, consent, commercial, rights, support, or dispute purpose; apply a counsel-approved post-event schedule. |
| Security operations | Keep risk-appropriate security evidence under a bounded schedule; extend only relevant material for an incident or valid hold. |
| Validated aggregate | Retain only the minimized aggregate needed for an approved purpose. Do not treat pseudonymous, small-cell, or linkable information as anonymous. |
| Preservation overlay | Suspend otherwise applicable deletion only for the records and period covered by a valid preservation determination. |

<a id="ARCH-B0076"></a>
Security profiles:

<a id="ARCH-B0077"></a>
| Profile | Expectations |
| --- | --- |
| S1 — Controlled operational | Encryption in transit and at rest; least-privilege access; tenant isolation; controlled exports; appropriate access logging. |
| S2 — Private participant content | S1 plus tightly scoped content retrieval, separate content-bearing payloads from logs, and application-level/envelope encryption where justified by the approved threat model. |
| S3 — Restricted sensitive content | S2 plus a separate purpose-restricted compartment, narrower access and, where applicable, decryption permissions, audited exceptional access, and no ordinary support or analytics access. |

<a id="ARCH-B0078"></a>
A record may require a higher profile than its class default. Security classification should not become an unnecessary permanent label about the participant.

<a id="ARCH-B0079"></a>
#### C.3 Inventory: purpose, source, sensitivity, and authoritative record

<a id="ARCH-B0080"></a>
| ID / data class | Purpose and source | Sensitivity and authoritative system of record |
| --- | --- | --- |
| 01. Account / identity | Operate the account. Sources: participant registration, authentication provider, verified account changes, and authorized cohort enrollment. Collect display identity, necessary contact details, settings, and minimal eligibility/jurisdiction information. | Personal information; authentication material is highly restricted. Authentication provider governs authentication; Steward’s identity registry governs participant-to-authentication and approved external-identity mappings. |
| 02. Personal Stewardship Blueprint | Maintain the participant’s living decision guide. Sources: participant-authored material and explicitly approved proposals. Include exact wording, field, scope, states, effective dates, and version history. | Private, frequently sensitive. The structured Blueprint store and its current-version pointers are authoritative; neither chat nor a PDF is authoritative by itself. |
| 03. Assessments | Preserve instrument-specific responses and results. Sources: participant answers and deterministic scoring under the identified instrument/version. | Sensitive reflection data. Assessment store holds responses, missingness, results, calculation version, completion dates, interpretation status, and carry-forward references. |
| 04. Reflections / journals / evidence | Support reflection and participant-authorized exploration. Sources: participant entries, selected uploads, authorized observations, and separately labeled interpretations. | Potentially highly sensitive, including third-party information. Private evidence store is authoritative for the submitted or derived record—not for Blueprint approval. |
| 05. Conversations | Conduct the interaction and, where selected, provide bounded history. Sources: participant messages, assistant responses, and necessary interaction metadata. | Potentially highly sensitive. Transcript store is authoritative only for retained conversation history. Session context and saved continuity notes are separate records. |
| 06. Approval / audit events | Demonstrate what was presented, authorized, changed, attempted, and confirmed. Sources: authenticated participant actions and verified application events. | Metadata may be personal; exact wording can be sensitive. Event ledger is authoritative for recorded events; an encrypted proof store holds necessary content-bearing evidence. |
| 07. Commitments / practice outcomes | Track agreed scope and actual reported practice. Sources: approved commitments, participant reports, and authorized external evidence. | Private and sometimes sensitive. Commitment registry governs scope; outcome records govern what was reported or observed, with provenance and uncertainty. |
| 08. Permissions / consent | Determine permitted processing, sharing, notifications, connections, and optional uses. Sources: participant choices, relevant agreements, and recorded revocations. | Private; some grants reveal sensitive activity. Permission registry governs current authorization; consent-event history preserves prior choices and the disclosure presented. |
| 09. Entitlements | Determine confirmed Free, Full Build, and Living access. Sources: validated commercial events, approved sponsorship, scholarship, administrative grants, and cohort rules. | Personal commercial/affiliation information. Steward’s entitlement registry is authoritative for service access under approved product rules. |
| 10. Billing metadata | Operate transactions, reconciliation, refunds, and disputes. Sources: Stripe confirmations and authorized financial administration. | Financial and contact information. Stripe governs payment-processing facts; Steward retains a minimized reconciled commercial record, not card credentials. |
| 11. Sponsored cohort / church data | Administer approved programs and permitted reporting. Sources: approved cohort configuration, eligibility processes, activation events, and approved aggregate calculations. | Membership can itself be sensitive. Cohort administration store governs program configuration; private participant records remain elsewhere. |
| 12. External integrations | Execute specifically authorized transfers and receive authorized results. Sources: participant authorization, integration jobs, and authenticated destination responses. | Sensitivity follows the payload. Integration registry/outbox governs requests and attempts; confirmed external receipts establish only the result actually acknowledged. |
| 13. Connected health / wellness | Future purpose-specific use of useful signals. Sources: authorized providers/devices and controlled summarization. Preserve source, interval, units, quality, and gaps. | Restricted sensitive data, including potentially revealing summaries. Restricted connected-evidence store governs the received signal, not a diagnosis or Blueprint interpretation. |
| 14. Safety / escalation | Record necessary evidence of a safety-related response or escalation. Sources: actual system behavior and reviewed operational actions—not invented monitoring or diagnoses. | Restricted sensitive information. Dedicated safety-case/event store; not the general participant profile or marketing system. |
| 15. Customer support / disputes | Resolve billing, entitlement, privacy, complaint, abuse, and service issues. Sources: participant requests, relevant system records, and support actions. | Variable, potentially highly sensitive. Support case store with narrowly scoped evidence references or necessary case attachments. |
| 16. Operational / security logs | Detect misuse, troubleshoot service faults, investigate incidents, and account for administrator access. Sources: application, identity, infrastructure, and access-control events. | Security-sensitive metadata; should not contain routine private content. Dedicated operational/security logging systems. |
| 17. Analytics | Understand reliability, cost, usability, and approved product outcomes. Sources: allowlisted operational events or separately authorized research data. | Aggregated where feasible; pseudonymous data remains controlled. Analytics store is not a participant-content or approval authority. |
| 18. Legal hold | Preserve specifically relevant records under a valid preservation determination. Sources: authorized legal instructions and recorded hold administration. | Restricted legal/operational information. Hold registry, record manifest, and controlled preservation repository. |
| 19. Deletion / account closure | Fulfill rights, participant choices, and scheduled disposition. Sources: verified requests, retention schedules, and applicable exception decisions. | Personal operational information. Rights-request and disposition registry governs workflow status and evidence of execution. |
| 20. Export / data access | Provide appropriate access to personal information and Blueprint history. Sources: authorized queries of the authoritative stores. | Inherits the sensitivity of included records. Export manifest governs package contents; a temporary private delivery store holds the generated package. |

<a id="ARCH-B0081"></a>
#### C.4 Access, AI retrieval, and proposal use

<a id="ARCH-B0082"></a>
“AI retrieval” below means retrieval through a policy-enforcing application service—not unrestricted database access.

<a id="ARCH-B0083"></a>
| ID | Who or what may access | Steward AI retrieval | Use to generate Blueprint proposals |
| --- | --- | --- | --- |
| 01 | Participant; identity service; narrowly scoped account support. Secrets remain within authentication/security services. | Only necessary display identity, settings, and verified context. No credentials or unrestricted identity records. | Relevant participant-supplied context only. Do not infer beliefs from affiliation or identity. |
| 02 | Participant; Blueprint service; selected recipients under a valid grant; exceptional staff access through an approved workflow. | Relevant current items; historical versions when useful and authorized. | Yes, as the approved starting point for proposed refinement. |
| 03 | Participant; scoring service; authorized assessment retrieval; narrowly scoped rights/support workflows. | Relevant authorized responses/results with instrument and missing-data information. | Yes, as evidence—not automatic approval or definition. |
| 04 | Participant; evidence service; explicitly authorized retrieval or selected sharing. | Only material selected or otherwise specifically authorized for the current purpose. | Yes, with source and interpretation distinctions preserved. |
| 05 | Participant; conversation service; selected retained history; exceptional reviewed access. | Current authorized session and eligible retained context. No deleted, expired, or preservation-only copies. | Yes, but extraction remains proposed until approved. |
| 06 | Participant-facing history service; approval service; scoped privacy, dispute, and audit reviewers. | A curated confirmation of relevant wording/approval status—not unrestricted audit or legal-case access. | No independent inferential use. The underlying approved content can be used through class 02. |
| 07 | Participant; commitment/outcome services; selected recipients where authorized. | Relevant commitments and accurately labeled reports. | Yes, for suggested adjustment, return, or repair. No automatic renewal or revision. |
| 08 | Participant; policy engine; authorized privacy administrators. | Effective permission scope needed to honor choices. Not privileged legal notes. | No. Consent is not evidence of a personal value or commitment. |
| 09 | Participant; entitlement service; authorized billing/cohort administrators within their scope. | Minimal confirmed access, relevant limits, dates, and verification status. | No. Access does not establish personal direction. |
| 10 | Participant; billing service; finance and dispute staff. | Normally none; a minimized billing-status response may support an explicit billing question. | No. Payment metadata is not financial-stewardship evidence. |
| 11 | Approved cohort administrators for operational data; reporting service for approved aggregates; participant for their own affiliation/access. | Own relevant program/entitlement context only. No roster-wide or private-content retrieval. | No, based on sponsorship or membership alone. |
| 12 | Participant-facing integration controls; integration worker; scoped operations/support. | Selected authorization and action status; authorized returned evidence through its proper class. | Payload-specific evidence may support proposals; job metadata does not. |
| 13 | Participant; narrowly scoped integration and signal services; specifically authorized AI retrieval. | Future only: purpose-limited summaries or necessary selected evidence. | Yes, as qualified evidence; never automatic diagnosis, drift, or wording. |
| 14 | Authorized safety personnel and restricted services under the reviewed production protocol; privacy/legal reviewers as appropriate. | No routine historical safety-dossier retrieval. Any continuing safety context requires a separately reviewed, narrow purpose. | No direct conversion. A separately participant-approved support plan can enter class 02. |
| 15 | Participant as appropriate; assigned support staff; specialist escalation roles. | No ordinary coaching access to internal case material. A selected service-status response may be provided. | No, unless the participant separately supplies relevant material for Blueprint work. |
| 16 | Security/operations staff and scoped incident responders. | No ordinary participant-coaching retrieval. | No. |
| 17 | Approved analytics staff/services using minimized datasets. | Not available for personalized participant inference. | No. |
| 18 | Authorized legal/records personnel and tightly scoped preservation workers. | No ordinary retrieval. | No. |
| 19 | Participant-facing rights workflow; privacy/records staff; disposition services. | Only the request status necessary to answer the participant accurately. | No. |
| 20 | Verified participant or properly authorized representative; export service; scoped privacy reviewers. | No general access to the assembled export package. | No. Underlying records retain their existing rules. |

<a id="ARCH-B0084"></a>
#### C.5 Retention, deletion, sharing, audit, and security

<a id="ARCH-B0085"></a>
The inherited legal-hold and approval rules in C.1 apply to every row.

<a id="ARCH-B0086"></a>
| ID | Retention and deletion posture | Sharing, audit, and security requirements | Additional unresolved decision |
| --- | --- | --- | --- |
| 01 | Maintain necessary identity while the account operates. On closure, remove unnecessary identifiers and credentials; retain only mappings needed for justified residual records. | No roster or contact sharing by default. Audit linking, unlinking, recovery, eligibility changes, and privileged access. S1; restricted treatment for credentials. | Required identity, age assurance, jurisdiction attributes, and recovery methods. |
| 02 | Blueprint continuity while maintained; independently scheduled history. Eligible deletion includes approved wording and history unless a specific exception or hold applies. | Selected content/audience only. Audit proposal adoption, supersession, current pointers, export selection, and authorized destruction. S2/S3. | Inactive-account policy and how much historical wording remains useful to participants. |
| 03 | Participant working record. Permit separate treatment of responses, results, and interpretations where lawful and understandable. A retained result must indicate when underlying responses were deleted. | No sponsor access to individual answers. Audit response corrections, scoring version, recalculation, and carry-forward links. S2/S3. | Raw-response retention and comparative-assessment policy. |
| 04 | Participant working record; granular deletion. Remove dependent unapproved summaries/indexes unless independently authorized retention exists. | Sharing is entry-specific, not whole-journal by default. Audit authorized retrieval, selected sharing, and deletion. S2/S3. | Optional journal history, attachment support, and saved-summary controls. |
| 05 | No indefinite raw retention by default. Support bounded operational/history retention, participant deletion, purpose-specific preservation, and legitimate legal holds. Exact periods and the launch-history default remain release/policy gates. Purge eligible transcript copies, derived unapproved continuity, and indexes under Section F. | No ordinary support, sponsor, research, or marketing access. Audit retention-setting changes and deletion, without copying message bodies into logs. S2/S3. | History default, sensitive-message storage authorization, provider retention, and session boundary. |
| 06 | Necessary proof, not blanket permanence. Unaccepted proposals normally follow working-record limits. Separately erase content-bearing proof when no justified purpose remains. | No general sharing. Provide appropriate participant history; legal disclosure through review. Audit creation, correction, verification, access, and destruction. S1 metadata; S2/S3 payload. | Minimum assent evidence and post-relationship proof schedule. |
| 07 | Active scope plus useful practice history under a working-record schedule. Expiration ends the commitment’s active scope, not its historical truth. | Share only selected commitments/outcomes. Audit scope changes, reports, corrections, expiration, and renewed approvals. S2/S3. | Practice-history retention and recurrence/review semantics. |
| 08 | Keep effective grants and narrowly necessary historical proof. Revocation stops covered future use; historical evidence receives its own justified schedule. | No reuse of consent records as marketing or profiling data. Audit presented disclosure version, grant, scope changes, expiration, and revocation. S2/S3. | Consent experience, permitted processing grounds, and downstream withdrawal obligations. |
| 09 | Current confirmed access plus necessary grant/history proof. Do not retain private content merely to prove entitlement. | Minimal sponsor/finance disclosures only. Audit grant authority, policy version, activation, expiration, correction, and reconciliation. S1/S2. | Detailed activation clocks, overlapping grants, credits, and renewal rules in the appropriate product workstream. |
| 10 | Necessary transaction, accounting, tax, refund, and dispute evidence under approved schedules. Remove unnecessary payment-method/contact details. | Share only necessary commercial evidence with authorized processors/advisers. Audit reconciliation, refunds, disputes, and access. S1/S2. | Final commercial terms, required financial records, processor/controller responsibilities. |
| 11 | Program administration while needed; separately scheduled participant links and aggregate reports. Ending sponsorship does not delete or expose the Blueprint. | Permit only approved reporting. Audit configuration, eligibility actions, report definitions, report delivery, and administrator access. S2; S3 where affiliation warrants. | Exact aggregate metrics; whether any named operational reporting will be offered. |
| 12 | Short-lived payloads through authorized delivery/reconciliation; retain minimized action receipts separately. On revocation, stop eligible queued work and pursue required downstream deletion. | Recipient/destination-specific grants. Audit authorization, attempts, retries, confirmations, revocation, and deletion requests/results. S1 status; S2/S3 payload. | Contracts, destination retention, identity linking, and confirmation semantics. |
| 13 | Minimum useful signal window; raw ingestion transient unless specifically justified. Withdrawal/deletion reaches retained raw data, summaries, indexes, and processors as applicable. | No sponsor or community disclosure by default. Audit purpose, provider scope, retrieval, gaps, transformations, and revocation. S3. | Health-law applicability, useful signal definitions, vendor terms, and approved retention. |
| 14 | Narrow safety-event schedule approved by specialists. Preserve relevant original material when legally required; do not otherwise retain the entire surrounding conversation indefinitely. | No ordinary cohort, marketing, or support access. Audit protocol version, actual response/action, human access, review, and disposition. S3. | Production safety model, minimum event evidence, reporting obligations, and legal exceptions. |
| 15 | Case lifecycle plus justified post-resolution proof. Avoid duplicating private content; preserve material evidence fairly when needed for the dispute. | Assigned staff only. Audit access, evidence selection, escalation, corrections, decisions, and closure. S1–S3 according to content. | Support ownership, complaint preservation, and ticketing-vendor controls. |
| 16 | Bounded security-operations schedule; case-specific extension for incidents/holds. Do not use routine logs as a transcript archive. | No sponsor access or marketing reuse. Audit privileged reads, configuration changes, incident exports, and log destruction. S1; S3 for exceptional sensitive evidence. | Threat model, security-log fields, incident windows, and logging vendors. |
| 17 | Short-lived identifiable inputs; approved minimized/validated aggregates thereafter. Delete linkable records under applicable schedules and rights. | Only approved audiences and purposes. Audit dataset definitions, transformations, access, and re-identification risk reviews. S1; higher if still identifiable. | Metric catalogue, aggregation safeguards, and any separately approved research. |
| 18 | Hold metadata and preservation evidence while justified; release returns records to ordinary disposition eligibility. No automatic renewal of the original retention period. | Controlled legal access and reviewed disclosures. Audit placement, scope changes, custodians, access, release, and post-release destruction. S3. | Hold authority, triggering procedure, periodic review, and conflict resolution. |
| 19 | Necessary proof that a request was handled and exceptions applied; do not retain the deleted payload as “deletion evidence.” | Participant receives appropriate status/reasons. Audit verification, scope, decisions, jobs, failures, confirmations, and deadlines. S1/S2; restricted legal rationale separately. | Request methods, verification, appeals, response rules, and exception schedule. |
| 20 | Temporary package through delivery window; then delete. Keep a minimized manifest/receipt only while justified. | Authenticated or otherwise properly secured delivery; no public links or unrelated recipients. Audit selection, generation, access, expiration, and cleanup. S2/S3. | Formats, representative access, third-party redaction, and delivery controls. |

<a id="ARCH-B0087"></a>
### D. Proposed participant-record object model

<a id="ARCH-B0088"></a>
#### D.1 Identity is a link—not the container for all content

<a id="ARCH-B0089"></a>
Use a stable internal participant_id that is distinct from:

<a id="ARCH-B0090"></a>
the authentication provider’s user identifier;

<a id="ARCH-B0091"></a>
an email address;

<a id="ARCH-B0092"></a>
a Stripe customer identifier;

<a id="ARCH-B0093"></a>
a ForgedLife account identifier;

<a id="ARCH-B0094"></a>
a cohort membership identifier.

<a id="ARCH-B0095"></a>
Store those relationships in verified mapping records.

<a id="ARCH-B0096"></a>
Do not attach a destructive cascade from an authentication account directly to every business record. Account closure must first evaluate each record’s deletion or retention disposition.

<a id="ARCH-B0097"></a>
A sponsor organization has an administrative identity of its own. Its relationship to a participant should never automatically grant access to that participant’s content.

<a id="ARCH-B0098"></a>
#### D.2 Common record envelope

<a id="ARCH-B0099"></a>
Each persisted personal record should carry the following fields, directly or through controlled references:

<a id="ARCH-B0100"></a>
| Field group | Proposed contents |
| --- | --- |
| Identity | Record ID, participant ID where applicable, record class, schema version. |
| Origin | Source type, source record ID, source system, source version, reporter/actor, received timestamp. |
| Meaning | Participant report, source observation, calculated result, AI interpretation, proposal, or approved wording. |
| Scope | Applicable Blueprint field, season, date range, relationship, or authorized purpose. |
| Permissions | Processing-purpose reference, applicable permission/grant references, sharing restrictions, retrieval policy. |
| Sensitivity | Security classification and necessary handling restrictions—not speculative personal labels. |
| Lifecycle | Retention-policy version, trigger date, disposition status, scheduled review/deletion criteria, hold references. |
| Integrity | Version references, content digest where useful, related approval/event IDs. |
| Security | Storage location and encryption-key reference, without embedding keys or secrets. |
| Lineage | Upstream and downstream record references, including whether a derived record has independent authorization. |

<a id="ARCH-B0101"></a>
Use explicit missingness where it matters. A missing ended_at, unavailable source version, or unknown practice outcome should not silently acquire a misleading default.

<a id="ARCH-B0102"></a>
#### D.3 Principal objects

<a id="ARCH-B0103"></a>
| Object family | Proposed objects and important fields |
| --- | --- |
| Account | participant, auth_identity_link, account_settings, external_identity_link, eligibility_record. |
| Blueprint | blueprint, template_field, blueprint_item, blueprint_content_version, current_item_pointer, definition_assessment, clarity_question, presentation_reference. |
| Proposal | proposal, proposal_version, proposal_presentation, participant_response, proposal_disposition. |
| Assessment | assessment_instrument, assessment_session, assessment_response, assessment_result, assessment_interpretation, blueprint_carry_forward_link. |
| Evidence | reflection_entry, journal_entry, evidence_record, interpretation_record, attachment, continuity_note. |
| Practice | commitment, commitment_scope_version, practice_report, observed_activity, return_or_repair_report. |
| Permissions | processing_purpose, disclosure_version, consent_grant, consent_event, recipient, sharing_grant, notification_preference. |
| Access / commerce | entitlement_grant, entitlement_event, effective_entitlement, billing_reference, commercial_event, agreement_acceptance. |
| Cohort | cohort, cohort_policy_version, cohort_membership, eligibility_decision, approved_report_definition, aggregate_report. |
| Integration | connection, connection_scope, external_action, transmission_payload, delivery_attempt, external_receipt. |
| Restricted cases | safety_event, safety_case, support_case, case_evidence_reference, specialist_review. |
| Records management | record_locator, lineage_edge, retention_policy, legal_hold, hold_record, privacy_request, disposition_job, vendor_disposition_receipt, export_manifest. |
| Audit / operations | audit_event, approval_evidence, access_event, security_event, incident, analytics_event_definition. |

<a id="ARCH-B0104"></a>
These are logical objects, not separate service boundaries or a mandated table count. Several may share physical tables within the modular transactional application where their security, integrity, and lifecycle requirements remain enforceable.

<a id="ARCH-B0105"></a>
#### D.4 Blueprint structure and state fields

<a id="ARCH-B0106"></a>
Approved product requirements: Keep the exact Definition States and Content States:

<a id="ARCH-B0107"></a>
| Dimension | Permitted governing values |
| --- | --- |
| Definition State | Not Yet Explored; Taking Shape; Defined for This Season. |
| Content State | Exploratory; Proposed; Participant Approved; Superseded. |
| Needs Clarity | A separate unresolved-question marker—not a Definition State or approval label. |

<a id="ARCH-B0108"></a>
One approved field does not define an entire section. Practice consistency and payment do not determine these states. [T4, §4]

<a id="ARCH-B0109"></a>
The field catalogue should implement Template v4, rather than invent another framework:

<a id="ARCH-B0110"></a>
Bedrock — Faith + Identity; Foundation — Mission + Values + Direction; the Four Pillars; Guardrails; Drift + Return; Keystone Rhythms; Energy; Legacy.

<a id="ARCH-B0111"></a>
Foundation-related fields should include Mission, Governing Values, Life Verse or Guiding Scripture, Current Calling, Daily Purpose, and Current Season. The deeper Finances page remains MY FINANCES — ENOUGH → FREEDOM → MULTIPLICATION, not another framework layer. [T4, §§3, 5; CTX3, §3]

<a id="ARCH-B0112"></a>
Store Free, Full, and My North Star as presentation mappings to the same item versions. When one approved Guardrail appears in two places, both should reference the same authoritative item.

<a id="ARCH-B0113"></a>
A shortened rendering should be an approved excerpt or separately approved concise rendering—not an untracked AI paraphrase. [T4, §§7–8, 10, 13]

<a id="ARCH-B0114"></a>
#### D.5 Assessment objects

<a id="ARCH-B0115"></a>
Store the instrument’s actual name, source version, item identifiers, response scale, scoring specification, and source checksum.

<a id="ARCH-B0116"></a>
Where a supporting instrument has no stated public version, preserve that fact. An internal asset revision or checksum can identify the implementation without fabricating an official version.

<a id="ARCH-B0117"></a>
Responses, calculations, and interpretations should remain separate:

<a id="ARCH-B0118"></a>
Missing answers carry missingness, not zero.

<a id="ARCH-B0119"></a>
Calculated results identify the scoring implementation and relevant input versions.

<a id="ARCH-B0120"></a>
An interpretation identifies its author/source and review status.

<a id="ARCH-B0121"></a>
A carry-forward link identifies the resulting proposal or approved item; it does not make the assessment itself approved Blueprint wording.

<a id="ARCH-B0122"></a>
These distinctions preserve the current gateway’s instrument-specific scoring and missing-response rules. [PJ, §3; CFM4, pp. 5–6, 9]

<a id="ARCH-B0123"></a>
#### D.6 Commitments and outcomes

<a id="ARCH-B0124"></a>
A commitment should contain its approved wording reference, applicable period, recurrence if actually agreed, timezone, review point, and current lifecycle status.

<a id="ARCH-B0125"></a>
Keep separate fields for:

<a id="ARCH-B0126"></a>
Reported outcome: completed, partially completed, missed, or unknown.

<a id="ARCH-B0127"></a>
Reporting status: reported, not reported, unavailable, or corrected.

<a id="ARCH-B0128"></a>
Context: changed circumstances, participant explanation, or an agreed scope change.

<a id="ARCH-B0129"></a>
Return/repair: the action reported, its date, and whether the result is known.

<a id="ARCH-B0130"></a>
An expired commitment must not become active again merely because it appears in a recurring prompt. Renewal requires the applicable participant agreement.

<a id="ARCH-B0131"></a>
### E. Approval, version, and provenance model

<a id="ARCH-B0132"></a>
#### E.1 The approval transaction

<a id="ARCH-B0133"></a>
Approved product requirement: Before a meaningful change becomes current, show the proposed wording, location, and scope; for replacement, also show the current wording and reason. Clear participant approval should be recognized without unnecessary repetition. [T4, §10; OI, §6; PJ, §5.2]

<a id="ARCH-B0134"></a>
Recommended implementation:

<a id="ARCH-B0135"></a>
Create a proposed version with exact wording and scope.

<a id="ARCH-B0136"></a>
Bind its presentation to an immutable proposal-version identifier.

<a id="ARCH-B0137"></a>
Record what the application actually delivered or displayed, without claiming the participant read it.

<a id="ARCH-B0138"></a>
Capture the participant’s affirmative response against that exact version.

<a id="ARCH-B0139"></a>
Validate identity, authorization, scope, and the prior current version.

<a id="ARCH-B0140"></a>
Commit the new approved version, current pointer, and approval event atomically.

<a id="ARCH-B0141"></a>
Return a system-confirmed result only after the transaction succeeds.

<a id="ARCH-B0142"></a>
An authenticated direct edit followed by a clearly labeled save/approve action can serve as participant approval. The product should not require a redundant conversational approval afterward.

<a id="ARCH-B0143"></a>
#### E.2 Minimum approval evidence package

<a id="ARCH-B0144"></a>
An approval should be supportable without the full transcript by retaining, while justified:

<a id="ARCH-B0145"></a>
| Evidence element | What it establishes |
| --- | --- |
| Exact wording and scope presented | The content to which the response related. |
| Proposal/item/version identifiers | Which record was involved. |
| Prior approved version reference | What the change replaced. |
| Participant’s affirmative action | Button action, direct save, or the minimal relevant natural-language assent. |
| Authenticated actor/session reference | The account context associated with the action. |
| Server timestamp and transaction identifier | When the system recorded the action. |
| Presentation and disclosure versions | What approval meant in that interface. |
| Resulting approved-version identifier | What actually became current. |
| Source/context locator | Provenance without requiring indefinite retention of surrounding conversation. |

<a id="ARCH-B0146"></a>
Natural-language assent sometimes requires a short surrounding fragment to resolve meaning. Retain only the necessary fragment under the proof schedule—not the whole session by default.

<a id="ARCH-B0147"></a>
A hash alone does not establish consent. The architecture should preserve the relationship among exact content, presentation, actor, affirmative response, and committed result.

<a id="ARCH-B0148"></a>
#### E.3 Version integrity

<a id="ARCH-B0149"></a>
Use optimistic concurrency checks to prevent approval of a stale replacement from overwriting a newer approved version.

<a id="ARCH-B0150"></a>
Keep the original approval event even when wording later becomes Superseded. Also preserve whether a superseded proposal was ever approved; supersession must not fabricate approval history.

<a id="ARCH-B0151"></a>
Corrections should create a new version or correcting event. Staff should not silently edit a participant’s prior approved statement.

<a id="ARCH-B0152"></a>
#### E.4 Provenance after source deletion

<a id="ARCH-B0153"></a>
Example:

<a id="ARCH-B0154"></a>
A participant approves a Guardrail developed in a conversation and later deletes that conversation.

<a id="ARCH-B0155"></a>
The system should be able to retain the independently approved Guardrail and necessary approval evidence, while recording:

<a id="ARCH-B0156"></a>
Source conversation deleted under the applicable retention/deletion policy.

<a id="ARCH-B0157"></a>
It should not reconstruct the conversation from hidden summaries or repeated copies.

<a id="ARCH-B0158"></a>
When the approved wording itself becomes eligible for deletion, its existence in an approval package does not automatically justify keeping it. If the payload is deleted, any residual event must accurately indicate that the wording is no longer retained.

<a id="ARCH-B0159"></a>
#### E.5 Imports and migrations

<a id="ARCH-B0160"></a>
An imported document is not automatically proof of approval.

<a id="ARCH-B0161"></a>
Use a verified import path for records with trustworthy existing approval evidence. Otherwise label approval as unverified and obtain the necessary participant confirmation without unnecessarily repeating the entire intake.

<a id="ARCH-B0162"></a>
Schema migrations should preserve wording, scope, history, permissions, and actual states. Adding a new template field should not invent content or automatically redefine an entire section.

<a id="ARCH-B0163"></a>
### F. Conversation-retention architecture

<a id="ARCH-B0164"></a>
#### F.1 Architecture retention principle and launch-policy boundary

<a id="ARCH-B0165"></a>
No indefinite raw conversation retention by default. Steward must support bounded operational/history retention, participant deletion controls, purpose-specific preservation, and legal holds where legitimately required. Exact retention periods and the launch-history default require the approved privacy/consent/legal work before real participants.

<a id="ARCH-B0166"></a>
Raw conversation history, saved continuity, approved Blueprint content, and audit/proof records remain separately governed. Raw conversation is not the permanent system of record. Legal protection does not require indefinite retention of an entire transcript; retain necessary approval/proof evidence and any specifically required preservation under their own purposes and policies.

<a id="ARCH-B0167"></a>
The architecture supports the approved launch-history configuration without selecting a session-only default or an arbitrary number of days in this document.

<a id="ARCH-B0168"></a>
Provide separate controls for:

<a id="ARCH-B0169"></a>
| Control | What it permits |
| --- | --- |
| Session processing | Processing needed to conduct the current interaction, under the applicable notice and processing authority. |
| Conversation history | Retaining eligible messages for the participant’s later review within the approved bounded history configuration and applicable participant choices. |
| Saved continuity | Retaining selected short notes for later conversations. |
| Blueprint approval | Adopting exact personal wording into the structured Blueprint. |
| Audit/proof records | Retaining narrowly necessary approval, consent, or action evidence under its own documented purpose, applicable authority, and retention policy—not an indefinite transcript archive. |
| Sharing | Delivering selected information to a selected recipient or service. |

<a id="ARCH-B0170"></a>
These choices must not silently authorize one another.

<a id="ARCH-B0171"></a>
#### F.2 Continuity without permanent transcripts

<a id="ARCH-B0172"></a>
Normal continuity should primarily come from:

<a id="ARCH-B0173"></a>
approved Blueprint items;

<a id="ARCH-B0174"></a>
current commitments and reported outcomes;

<a id="ARCH-B0175"></a>
relevant authorized assessment/evidence records;

<a id="ARCH-B0176"></a>
participant-selected continuity notes.

<a id="ARCH-B0177"></a>
A continuity note should have a visible purpose, source, date, scope, review/expiration criterion, and participant correction/deletion control.

<a id="ARCH-B0178"></a>
Do not maintain a hidden autobiographical profile or indefinite AI-generated “memory” simply because transcripts expire.

<a id="ARCH-B0179"></a>
#### F.3 Sensitive disclosures

<a id="ARCH-B0180"></a>
Existing behavior boundary: Sensitive disclosure does not create automatic permission to save, share, or turn the disclosure into a defining Blueprint statement. [SC, §§12–13; OI, §§6, 10]

<a id="ARCH-B0181"></a>
Before production, resolve how that boundary is implemented through collection notices, history controls, sensitive-data permissions, and necessary service processing.

<a id="ARCH-B0182"></a>
Recommended safeguards:

<a id="ARCH-B0183"></a>
Do not treat sending a sensitive message as permission for permanent memory.

<a id="ARCH-B0184"></a>
Do not automatically create a long-lived safety dossier from every difficult disclosure.

<a id="ARCH-B0185"></a>
Do not turn vulnerability into sales, sponsor, or engagement segmentation.

<a id="ARCH-B0186"></a>
Where a useful support plan is later approved, save the narrow plan—not every intimate detail that led to it.

<a id="ARCH-B0187"></a>
Keep emergency-oriented guidance available without presenting avoidable privacy prompts at the moment of crisis.

<a id="ARCH-B0188"></a>
#### F.4 Deletion propagation

<a id="ARCH-B0189"></a>
Deleting eligible conversation history should trigger disposition of associated:

<a id="ARCH-B0190"></a>
transcript payloads, attachments, search indexes, embeddings, unapproved summaries, caches, temporary exports, and provider-side copies to the extent required and supported by the applicable arrangements.

<a id="ARCH-B0191"></a>
An independently selected journal entry, saved continuity note, approved Blueprint item, or retained proof record should be evaluated separately and explained clearly.

<a id="ARCH-B0192"></a>
“Delete this conversation” and “delete all information derived from this interaction” should not be silently treated as identical requests.

<a id="ARCH-B0193"></a>
#### F.5 AI vendor boundary

<a id="ARCH-B0194"></a>
Require documented decisions about model-provider processing, retention, training use, abuse monitoring, subprocessors, and deletion capability.

<a id="ARCH-B0195"></a>
Recommended default: no use of private participant content for model training or unrelated product improvement.

<a id="ARCH-B0196"></a>
Do not promise “nothing is stored” merely because Steward does not display history. Provider logs, application traces, backups, and support access must match the actual representation made to participants.

<a id="ARCH-B0197"></a>
### G. Deletion and legal-hold architecture

<a id="ARCH-B0198"></a>
#### G.1 A records-management service, not a single delete button

<a id="ARCH-B0199"></a>
Create a central record locator and lineage inventory covering databases, object storage, indexes, caches, exports, integration payloads, vendors, and backups.

<a id="ARCH-B0200"></a>
Each deletion decision should identify:

<a id="ARCH-B0201"></a>
record scope → applicable policy → any specific retention exception → actual deletion jobs → confirmed results.

<a id="ARCH-B0202"></a>
A soft-delete flag is a workflow state, not proof that the data has been erased.

<a id="ARCH-B0203"></a>
#### G.2 Distinguish the participant’s requested action

<a id="ARCH-B0204"></a>
| Requested action | Recommended default interpretation |
| --- | --- |
| Delete a conversation | Delete eligible transcript/history and dependent unapproved derivatives; independently evaluate approved records and proof. |
| Delete a journal/reflection | Delete the selected working record and dependent unauthorized derivatives; do not silently delete an independently approved Blueprint statement. |
| Remove or revise Blueprint wording | Update the current Blueprint through the appropriate participant-directed workflow; evaluate historical versions separately. |
| Delete Blueprint history | Process the eligible historical content, not merely hide it. Retain only specifically justified exceptions. |
| Cancel paid Steward | Apply approved commercial/access rules. Do not interpret cancellation as a deletion request. |
| Close/delete the account | End account operation and process all associated data classes, including residual commercial, security, proof, and held records. |
| Withdraw sharing/connection consent | Stop covered future processing and queued transfers; address prior transmissions and downstream deletion separately. |

<a id="ARCH-B0205"></a>
#### G.3 Recommended deletion workflow

<a id="ARCH-B0206"></a>
Verify the request proportionately, without collecting excessive new identity evidence.

<a id="ARCH-B0207"></a>
Then stop relevant future collection, notifications, integration jobs, and access as appropriate; inventory affected records; determine specific exceptions and holds; execute deletion; verify results; and communicate completion and any remaining categories accurately.

<a id="ARCH-B0208"></a>
Record retained exceptions at a useful level of specificity:

<a id="ARCH-B0209"></a>
applicable purpose or legal authority;

<a id="ARCH-B0210"></a>
affected records/categories;

<a id="ARCH-B0211"></a>
responsible approver;

<a id="ARCH-B0212"></a>
retention endpoint or review criterion;

<a id="ARCH-B0213"></a>
restricted access;

<a id="ARCH-B0214"></a>
next required review.

<a id="ARCH-B0215"></a>
“Retained for legal reasons” should not become an unreviewed account-wide status.

<a id="ARCH-B0216"></a>
#### G.4 Legal-hold mechanism

<a id="ARCH-B0217"></a>
A hold should include:

<a id="ARCH-B0218"></a>
| Field | Required function |
| --- | --- |
| Hold ID and matter reference | Identify the preservation instruction. |
| Authorized issuer and approver | Establish who can place, amend, or release it. |
| Reason and authority | Reference the legal determination without placing privileged advice in ordinary logs. |
| Scope | Participants/custodians, date ranges, issues, record classes, systems, and specific records. |
| Matching rules | Capture newly created relevant records where required. |
| Placement/review/release dates | Support accountable administration. |
| Preserved-record manifest | Identify what is actually held and where. |
| Access restrictions | Limit inspection and copying to the authorized purpose. |
| Release disposition | Return records to their otherwise applicable schedules. |

<a id="ARCH-B0219"></a>
Preservation duties can concern anticipated litigation, not just an already-issued court order. Federal Rule of Civil Procedure 37(e) addresses loss of electronically stored information that should have been preserved in anticipation or conduct of litigation. Counsel must determine the applicable duty and scope. (U.S. Courts, Federal Rules of Civil Procedure, Rule 37(e))

<a id="ARCH-B0220"></a>
Where original messages are materially relevant and preservation is required, do not destroy them and substitute a favorable summary. Minimize prospectively through a defensible normal policy—not by selectively removing evidence after a preservation duty arises.

<a id="ARCH-B0221"></a>
#### G.5 Hold/deletion race protection

<a id="ARCH-B0222"></a>
Deletion workers should recheck holds immediately before destructive execution. Hold placement and purge operations need coordinated locking or an equivalent transactional safeguard.

<a id="ARCH-B0223"></a>
A hold should preserve the relevant data without reopening it to ordinary AI, sponsor, or support use. Still-live, independently authorized participant records may continue serving their ordinary purpose unless a valid restriction applies.

<a id="ARCH-B0224"></a>
Conflicts between a preservation instruction and an applicable deletion obligation require prompt legal resolution. The software should not assume that every internally labeled hold overrides every privacy law.

<a id="ARCH-B0225"></a>
#### G.6 Backups and restoration

<a id="ARCH-B0226"></a>
Document each backup location, recovery window, encryption/key dependency, and ultimate destruction method.

<a id="ARCH-B0227"></a>
A restoration workflow should reapply previously effective deletion and permission-revocation instructions before restored data returns to ordinary service. Keep the minimum restoration-suppression information necessary for that recovery lifecycle, not a perpetual substitute participant profile.

<a id="ARCH-B0228"></a>
Backup handling must accommodate applicable legal deadlines. For example, Washington’s consumer-health deletion provision expressly addresses archived and backup systems and limits the permitted delay; a generic “backups are exempt” policy would not implement that provision where it applies. (Washington, RCW 19.373.040)

<a id="ARCH-B0229"></a>
Cryptographic erasure may be part of a reviewed method, but do not destroy a shared key needed to preserve other participants’ data or records subject to a valid hold.

<a id="ARCH-B0230"></a>
#### G.7 Access and export requests

<a id="ARCH-B0231"></a>
Separate ordinary self-service Blueprint export from formal personal-information access requests.

<a id="ARCH-B0232"></a>
Provide appropriate current content, history, assessments, retained journals, commitments, permissions, and commercial records. Evaluate applicable rights to other personal information through the privacy workflow.

<a id="ARCH-B0233"></a>
Do not expose another participant’s information, secrets, or unrestricted internal security material. Equally, do not assume everything labeled “internal” is categorically excluded from a legal access request.

<a id="ARCH-B0234"></a>
Use a versioned export manifest, secure delivery, expiration, and confirmation of cleanup. A redacted export should not silently alter the underlying approved Blueprint.

<a id="ARCH-B0235"></a>
### H. Permissions and consent architecture

<a id="ARCH-B0236"></a>
#### H.1 Separate permission objects

<a id="ARCH-B0237"></a>
Approved product requirement: Blueprint approval, sharing, notifications, marketing, connected-data use, and recurring payment remain separate. Sponsorship, marriage, leadership, or group membership does not confer private access. [OI, §10; PJ, §§11, 14–16, 18–19; T4, §§10–11]

<a id="ARCH-B0238"></a>
At minimum, implement distinct permission categories for:

<a id="ARCH-B0239"></a>
| Permission | Required scope |
| --- | --- |
| Blueprint wording | Exact item/version, location, meaning, and time scope. |
| Selected sharing | Specific content, recipient, purpose, method, and relevant duration. |
| Named recipient | Verified recipient identity/address—not merely a role such as “my mentor.” |
| Church/group sharing | Identified group/audience and selected content; no implied access to supporting records. |
| Notifications | Channel, cadence/trigger, permitted content, and participant controls. |
| Marketing | Separate optional promotional purpose and channel. |
| Connected data | Provider, categories, date range, purpose, and permitted processing. |
| ForgedLife transmission | Selected content and transmission purpose, separate from approval of the commitment. |
| Recurring payment | Applicable commercial agreement and affirmative authorization. |
| Research/analytics beyond necessary operations | Defined project/purpose, dataset, recipients, and withdrawal arrangements as applicable. |

<a id="ARCH-B0240"></a>
Also distinguish acknowledging a privacy notice or accepting service terms from consenting to an optional activity.

<a id="ARCH-B0241"></a>
Not every legitimate operational activity rests on consent. The policy registry should record the applicable processing authority, with counsel determining the appropriate legal treatment.

<a id="ARCH-B0242"></a>
#### H.2 Grant fields

<a id="ARCH-B0243"></a>
A permission grant should identify:

<a id="ARCH-B0244"></a>
the participant, permission type, purpose, resource/version scope, recipient or destination, presented disclosure version, affirmative action, effective date, expiration/review condition, current status, and revocation history.

<a id="ARCH-B0245"></a>
Default selected-content sharing to a specific version. A grant covering future updates requires an explicitly defined scope.

<a id="ARCH-B0246"></a>
For groups, identify the intended audience. A later membership change should not silently expose sensitive content to an unexpected audience.

<a id="ARCH-B0247"></a>
#### H.3 Enforcement

<a id="ARCH-B0248"></a>
Check permission when retrieving content, generating a proposal, exporting, scheduling, and executing a transfer.

<a id="ARCH-B0249"></a>
A grant that was valid when a job was queued may no longer be valid when the worker attempts delivery.

<a id="ARCH-B0250"></a>
The AI should receive only the effective authorization needed for its task. It should not be able to grant itself access or widen a permission by generating text.

<a id="ARCH-B0251"></a>
#### H.4 Revocation

<a id="ARCH-B0252"></a>
Revocation should stop covered future use and eligible queued actions promptly.

<a id="ARCH-B0253"></a>
It does not automatically mean an already-delivered recipient copy has been recalled. Track downstream revocation/deletion requests and actual confirmations separately, and explain the limits of control over previously authorized recipient copies.

<a id="ARCH-B0254"></a>
Retain narrowly necessary proof of the prior grant and revocation only under an independently justified schedule.

<a id="ARCH-B0255"></a>
### I. Audit-event architecture

<a id="ARCH-B0256"></a>
#### I.1 Separate facts from payloads

<a id="ARCH-B0257"></a>
Use two linked components:

<a id="ARCH-B0258"></a>
Event ledger: minimal structured facts about important actions.

<a id="ARCH-B0259"></a>
Evidence store: exact content or other sensitive material needed to substantiate selected events.

<a id="ARCH-B0260"></a>
This avoids filling an ordinary audit stream with full conversations or repeated before-and-after copies of every personal record.

<a id="ARCH-B0261"></a>
#### I.2 Event structure

<a id="ARCH-B0262"></a>
| Field | Purpose |
| --- | --- |
| event_id, event_type, schema_version | Stable event identity and meaning. |
| actor_type, actor_reference | Participant, system, administrator, or external service. |
| subject_reference | Relevant participant/resource, minimized where possible. |
| occurred_at, recorded_at | Distinguish event time from receipt/recording time. |
| resource_type, resource_id, version_id | Identify the affected record. |
| prior_version_id | Establish the previous state where relevant. |
| authorization_reference | Link the applicable participant or administrative authority. |
| policy_version | Identify the rules used. |
| attempt_id, idempotency_key | Link execution and duplicate-prevention controls. |
| result, confirmation_reference | Distinguish failure, uncertainty, partial result, and verified outcome. |
| evidence_reference | Link necessary exact wording without embedding it in ordinary logs. |
| retention_policy, integrity_metadata | Control lifecycle and detect unauthorized alteration. |

<a id="ARCH-B0263"></a>
#### I.3 Event families

<a id="ARCH-B0264"></a>
Record proposal presentation and response, approval commitment, supersession, consent grant/revocation, selected sharing, external attempts/results, entitlement changes, administrator access, exports, privacy-request decisions, deletion execution, and hold placement/release.

<a id="ARCH-B0265"></a>
Do not equate generated, delivered, displayed, read, and approved.

<a id="ARCH-B0266"></a>
Likewise, an external acknowledgement might establish acceptance of a request without proving completion of the requested action.

<a id="ARCH-B0267"></a>
#### I.4 Integrity controls

<a id="ARCH-B0268"></a>
Recommended controls include restricted append permissions, separate authority for disposition, signed or otherwise independently verifiable checkpoints, sequence/correlation checks, protected timestamps, and regular integrity verification.

<a id="ARCH-B0269"></a>
Corrections should be visible correcting events.

<a id="ARCH-B0270"></a>
Authorized destruction should leave only the minimal disposition evidence that remains justified. Integrity mechanisms should not preserve personal payloads indefinitely simply because deletion would be inconvenient.

<a id="ARCH-B0271"></a>
This design is intended to support reliable evidence. It does not guarantee legal admissibility or prove that an authenticated account action was free from compromise.

<a id="ARCH-B0272"></a>
### J. Sponsored cohort and privacy separation

<a id="ARCH-B0273"></a>
#### J.1 Sponsorship is an entitlement relationship

<a id="ARCH-B0274"></a>
Approved product requirement: MJG is the intended private home for the Blueprint and private participant records. ForgedLife supports practice and community. A church, sponsor, creator, or leader role does not create automatic access to private participant content. [PJ, §§14, 16.5, 16.7; OI, §10]

<a id="ARCH-B0275"></a>
Implement cohort access through a restricted operational relationship, not a permission inheritance rule over participant content.

<a id="ARCH-B0276"></a>
#### J.2 Four distinct information groups

<a id="ARCH-B0277"></a>
| Group | Boundary |
| --- | --- |
| Cohort administration | Program configuration, eligibility method, activation rules, grants, and authorized operational administration. |
| Permitted aggregates | Only approved metrics, purposes, audiences, and aggregation methods. |
| Named operational status | Future only where specifically approved and appropriately authorized; not implied by sponsorship. |
| Private participant content | Blueprint, assessments, conversations, journals, Energy responses, Drift + Return, sensitive disclosures, and connected health data. No automatic sponsor access. |

<a id="ARCH-B0278"></a>
Cohort affiliation itself should receive appropriate privacy treatment; it should not be treated as harmless public metadata.

<a id="ARCH-B0279"></a>
#### J.3 Aggregate reporting safeguards

<a id="ARCH-B0280"></a>
Recommend an owner-approved report catalogue rather than arbitrary sponsor queries.

<a id="ARCH-B0281"></a>
Potential operational measures—such as invitations or activation counts—are candidate definitions, not automatically approved dashboards.

<a id="ARCH-B0282"></a>
Before releasing aggregates, assess small groups, repeated queries, overlapping groups, and subtraction between reports. An apparently anonymous total can still reveal an individual’s status.

<a id="ARCH-B0283"></a>
Do not permit drill-through into private records. Do not use individual distress, intimate disclosures, or inferred spiritual condition as sponsor metrics.

<a id="ARCH-B0284"></a>
#### J.4 Cohort configuration

<a id="ARCH-B0285"></a>
Use versioned program configuration and grant records. Do not hard-code Compass rules as universal church rules.

<a id="ARCH-B0286"></a>
The approved product standard provides a configurable sponsored-cohort model; the particular configuration and actual entitlement must come from approved program rules and confirmed application state. [PJ, §§16.2, 18]

<a id="ARCH-B0287"></a>
No dashboard, identity synchronization, or cohort integration is represented as implemented by this specification.

<a id="ARCH-B0288"></a>
### K. External-integration data boundaries

<a id="ARCH-B0289"></a>
#### K.1 Shared integration contract

<a id="ARCH-B0290"></a>
Each integration should specify:

<a id="ARCH-B0291"></a>
purpose, source, destination, responsible entities, identity-linking method, authorized fields, payload sensitivity, permission reference, retention, revocation/deletion capability, confirmation semantics, and incident contacts.

<a id="ARCH-B0292"></a>
Use a controlled outbox and worker. Bind each job to the authorized content/version, validate permissions again before execution, and distinguish retryable failures from uncertain results.

<a id="ARCH-B0293"></a>
#### K.2 Stripe

<a id="ARCH-B0294"></a>
Approved direction: Stripe remains the payment-processing direction; service entitlements remain application-confirmed rather than inferred from a participant’s claim. [PJ, §§7.3, 18; CTX3, §14]

<a id="ARCH-B0295"></a>
Recommend hosted or otherwise low-risk payment collection that sends card information directly to Stripe. Steward should retain only needed customer/transaction references, amounts/currency, product/agreement identifiers, relevant dates, statuses, and necessary refund/dispute evidence.

<a id="ARCH-B0296"></a>
Do not put Blueprint wording, assessment answers, health details, or journal content into Stripe metadata.

<a id="ARCH-B0297"></a>
Stripe describes low-risk integrations as reducing direct exposure to card data, while identifying PCI compliance as a shared responsibility. Using Stripe does not eliminate Steward’s applicable payment-security obligations. (Stripe, Security guide)

<a id="ARCH-B0298"></a>
Webhook processing should verify authenticity, handle duplicates and out-of-order events, and reconcile uncertain state. A browser redirect or unverified event should not create a confirmed entitlement. Stripe’s webhook documentation specifically addresses signature verification and delivery behavior. (Stripe, Webhooks)

<a id="ARCH-B0299"></a>
#### K.3 ForgedLife

<a id="ARCH-B0300"></a>
Approved product requirement: Future transfers may include participant-approved commitments, rhythms, and selected accountability material; returning practice/activity summaries remain evidence. Approval of a commitment does not authorize sending it. [PJ, §14; OI, §10]

<a id="ARCH-B0301"></a>
Recommend version-specific outbound payloads, an independently recorded transmission grant, and inbound summaries with source/time-period/gap information.

<a id="ARCH-B0302"></a>
Do not synchronize the full private participant record merely to support shared identity or entitlement recognition.

<a id="ARCH-B0303"></a>
Do not link accounts solely because they use the same unverified email address.

<a id="ARCH-B0304"></a>
#### K.4 Connected health and wellness

<a id="ARCH-B0305"></a>
Future only. Prefer the minimum useful summarized signal for the stated purpose.

<a id="ARCH-B0306"></a>
Keep source observations separate from transformations, interpretations, and approved personal direction. A summary remains sensitive where it reveals health information; summarization is not automatically anonymization.

<a id="ARCH-B0307"></a>
Platform/device permission should not be assumed to satisfy every service-specific consent or legal requirement.

<a id="ARCH-B0308"></a>
Importantly, health-data review is not solely a future connector issue. Health information may already appear in conversations, journals, Fitness, or Energy-related material.

<a id="ARCH-B0309"></a>
#### K.5 Notifications and other destinations

<a id="ARCH-B0310"></a>
Default notification payloads to non-revealing wording. A phone lock screen or email subject should not expose an intimate disclosure.

<a id="ARCH-B0311"></a>
A notification preference does not authorize marketing, community sharing, or an unapproved external task.

<a id="ARCH-B0312"></a>
Maintain separate evidence for authorization, attempted scheduling, system-confirmed scheduling, attempted delivery, and confirmed delivery where the destination actually supplies it.

<a id="ARCH-B0313"></a>
#### K.6 SIG separation

<a id="ARCH-B0314"></a>
Keep SIG advisory/client data and unrelated commercial activity outside the Steward participant-data pathway unless separately requested and appropriately authorized as a distinct service. That separation is already established in the product sources. [PJ, §14; OI, §10]

<a id="ARCH-B0315"></a>
### L. Security and privacy control requirements

<a id="ARCH-B0316"></a>
The following are proposed production controls, not claims about the present prototype.

<a id="ARCH-B0317"></a>
#### L.1 Accountability and administration

<a id="ARCH-B0318"></a>
Assign accountable owners for security, privacy, records management, support, incident response, vendor management, and legal-hold administration.

<a id="ARCH-B0319"></a>
Use role-based permissions with narrow operational scopes. Require strong authentication and multifactor protection for privileged access. Time-limit exceptional content access, record its purpose, and review it afterward.

<a id="ARCH-B0320"></a>
A company owner or developer account should not automatically serve as an unrestricted day-to-day content browser.

<a id="ARCH-B0321"></a>
#### L.2 Encryption and keys

<a id="ARCH-B0322"></a>
Encrypt transport and stored data. Protect secrets through a dedicated secrets/key-management system rather than source code, prompts, logs, or participant records.

<a id="ARCH-B0323"></a>
Use application-level/envelope encryption where the approved threat model justifies it, especially for restricted sensitive stores, with appropriately limited decryption authority. Use established managed key services and vetted cryptographic libraries or platform facilities; do not build custom cryptography. This does not require the entire application to use a separate custom encryption system.

<a id="ARCH-B0324"></a>
Document key rotation, recovery, access, and destruction. Test those procedures against legal holds and backups.

<a id="ARCH-B0325"></a>
Do not describe the product as end-to-end encrypted where the server or AI-processing path can decrypt the content.

<a id="ARCH-B0326"></a>
#### L.3 AI and application authorization

<a id="ARCH-B0327"></a>
The AI should interact through narrowly defined application operations, not arbitrary SQL or unrestricted administrative tools.

<a id="ARCH-B0328"></a>
Validate ownership, effective permission, account status, record scope, and entitlement at the application boundary. Treat retrieved documents and participant text as data—not as authority to override permissions or execute tools.

<a id="ARCH-B0329"></a>
Entitlement and consent changes require verified application operations, not generated statements.

<a id="ARCH-B0330"></a>
#### L.4 Telemetry

<a id="ARCH-B0331"></a>
Use allowlisted log fields.

<a id="ARCH-B0332"></a>
Exclude private message bodies, full record snapshots, prompt payloads, access tokens, sensitive URL parameters, and unnecessary database parameter values.

<a id="ARCH-B0333"></a>
Review crash reporting, tracing, browser analytics, session replay, email logging, and support tools. Disabling content in one application logger does not prevent another vendor from collecting it.

<a id="ARCH-B0334"></a>
Keep exceptional incident evidence in a restricted case store rather than broadening routine logs.

<a id="ARCH-B0335"></a>
#### L.5 Vendors and environments

<a id="ARCH-B0336"></a>
Maintain a subprocessor/vendor inventory covering purposes, categories, locations, retention, security commitments, training use, deletion capability, incident notification, and contract ownership.

<a id="ARCH-B0337"></a>
Use synthetic data in development and testing. A production database copy should not be a default debugging tool.

<a id="ARCH-B0338"></a>
Require controlled deployments, vulnerability management, access reviews, dependency review, and tested recovery procedures.

<a id="ARCH-B0339"></a>
FTC security guidance emphasizes limiting access and incorporating security throughout development and vendor relationships. These principles inform the proposed controls; they do not establish that the controls have been implemented or tested. (FTC, Start with Security: A Guide for Business)

<a id="ARCH-B0340"></a>
#### L.6 Incident readiness

<a id="ARCH-B0341"></a>
Prepare an incident plan with triage, containment, preservation, investigation, vendor coordination, legal assessment, notifications, recovery, and corrective action.

<a id="ARCH-B0342"></a>
Separate technical service monitoring from human safety monitoring. An uptime alert does not mean someone is watching participant conversations for crises.

<a id="ARCH-B0343"></a>
NIST SP 800-61 Revision 3 integrates incident response with cybersecurity risk management and is an appropriate reference for the incident-response workstream. (NIST, SP 800-61 Rev. 3)

<a id="ARCH-B0344"></a>
#### L.7 Minimum release tests

<a id="ARCH-B0345"></a>
Apply these tests to the functionality included in the affected release. Tests for disabled future capabilities remain feature-specific gates; all applicable core release tests remain required.

<a id="ARCH-B0346"></a>
| Test | Required demonstrated result |
| --- | --- |
| Cross-participant access | One participant cannot retrieve another’s content through APIs, exports, search, or attachments. |
| Sponsor access | A cohort administrator cannot access private records through membership relationships or reporting endpoints. |
| Approval integrity | Exact approved wording, scope, prior version, and assent remain linked; stale approvals cannot overwrite newer content. |
| Conversation deletion | Eligible chat and derivatives are deleted without corrupting independently retained approved records. |
| Account deletion | Unrelated information is not retained merely because selected billing or held records remain. |
| Permission revocation | Eligible queued transfers and notifications stop; actual downstream results are accurately reported. |
| External-event replay | Duplicate or delayed events do not create duplicate grants, charges, or tasks. |
| Commitment scope | Expired commitments do not renew automatically; missing reports remain unknown. |
| Backup restoration | Deleted or revoked records do not silently return to active service. |
| Hold/purge race | Relevant preservation is enforced before destructive execution. |
| Export isolation | Exports contain the intended participant’s appropriate records and no unrelated private information or secrets. |
| Telemetry review | Sensitive content is absent from ordinary logs, traces, analytics, and replay tools. |

<a id="ARCH-B0347"></a>
Passing these tests requires execution evidence. The specification itself is not that evidence.

<a id="ARCH-B0348"></a>
### M. Architecture decisions and downstream gates

<a id="ARCH-B0349"></a>
P1-01 is approved as the underlying architecture without finalizing every downstream legal, privacy, security, vendor, or configuration choice. The categories below distinguish the approved durable architecture decisions in Section M.A from the gates that remain open before an affected release. Sections M.B and N remain required release/policy work before the applicable real-participant release; Section M.C future capabilities remain disabled until separately approved. [OD-F; OD-A]

<a id="ARCH-B0350"></a>
#### M.A. ARCHITECTURE DECISIONS EMBODIED IN P1-01

<a id="ARCH-B0351"></a>
These are the durable architecture decisions approved with P1-01—not new participant-facing product rules.

<a id="ARCH-B0352"></a>
| Architecture decision | Decision embodied in P1-01 |
| --- | --- |
| Stable participant identity and separately governed records | One stable participant identity links the twenty logical data classes without collapsing them into one document, transcript, or permission domain. |
| Record-type and state separation | Raw conversation, reflection/evidence, proposals, approved Blueprint content, approval/audit evidence, and operational logs remain distinct. Definition, content approval, practice, and entitlement also remain distinct. |
| Exact approval, scope, and version integrity | Preserve exact participant-approved wording, prior approved versions, applicable scope, provenance, and version-bound approval evidence. Free, Full, and My North Star remain views of the same authoritative items. |
| Independent proof and bounded conversations | Approval evidence can exist without retaining an entire conversation indefinitely. Support bounded raw operational/history retention, saved continuity, participant deletion controls, and purpose-specific preservation under separate lifecycles. |
| Separate permissions and commercial records | Keep permissions, consent, entitlements, billing, cohort administration, integrations, and Blueprint content separate; evaluate authorization for the actual actor, purpose, resource, and action. |
| Lifecycle and preservation capability | Design provenance, lineage, configurable retention policy, deletion/access/export workflows, restoration safeguards, and scoped legal holds into the record architecture. |
| Private participant and sponsor boundaries | Church/sponsor administration and approved reporting do not create access to private participant content. Future named reporting requires its own approval and authorization. |
| Policy-enforced retrieval and action execution | Steward AI retrieves through a policy-enforcing application layer, not unrestricted database access. Proposed, authorized, attempted, and system-confirmed actions remain distinct. |
| Audit facts, sensitive payloads, and operational safeguards | Separate audit facts from sensitive evidence payloads. Prevent sensitive participant content from leaking into ordinary logs, telemetry, analytics, or support systems; restrict exceptional evidence to its legitimate purpose. |
| Modular transactional implementation | Implement through a modular transactional application, appropriate table/schema boundaries, restricted stores where justified, and policy-controlled access. Supabase-oriented implementation does not require twenty services, unnecessary microservices, or custom cryptography. |

<a id="ARCH-B0353"></a>
#### M.B. RELEASE / POLICY GATES BEFORE REAL PARTICIPANTS

<a id="ARCH-B0354"></a>
Resolve the applicable gates before the affected real-participant release. They do not prevent approval of the underlying architecture where that architecture already supports configurable implementation. An unresolved choice is not permission for engineering or the AI to invent a launch policy.

<a id="ARCH-B0355"></a>
| Gate | Required downstream decision or review | When it must be resolved |
| --- | --- | --- |
| Legal operating entity, jurisdiction, and eligibility | Owner and counsel determine the operating entity, launch jurisdictions, age eligibility, and appropriate eligibility/age-assurance controls. | Before real participants. |
| Final retention and launch-history configuration | Approve exact retention periods or criteria, operational/history bounds, and the launch-history default. Do not adopt arbitrary periods or indefinite raw retention. | Before real participants for the enabled data classes. |
| Privacy, consent, and customer disclosures | Approve the privacy notice, customer terms, sensitive-message handling, saved-continuity controls, optional-use permissions, and accurate vendor/processing disclosures. | Before the affected real-participant release. |
| Account lifecycle, rights, and preservation policy | Finalize inactive/closed-account treatment, Blueprint history, access/export/deletion procedures, narrowly justified exceptions, and counsel-directed legal-hold administration. Preserve legitimate continuity without indefinite unrelated retention. | Before the affected real-participant release. |
| Approval-interface and proof implementation | Validate the version-bound approval experience, direct-edit/save behavior, minimum assent evidence, and actual transaction results. | Before real participants. |
| AI/hosting vendors and contractual terms | Select vendors/regions and approve processing, retention, training-use restrictions, operational access, subprocessor arrangements, and deletion obligations. | Before real participant information reaches the affected vendor. |
| Support ownership and production safety operations | Assign accountable support/escalation roles, limited staff access, reviewed production-safety arrangements, and necessary event evidence. Do not imply monitoring or emergency-service capabilities that do not exist. | Before the affected real-participant release. |
| Security, keys, backups, and operational controls | Approve the threat model and implement/test access, encryption/key handling, restoration, deletion, logging, and incident controls. Use application-level/envelope encryption where justified, not a universal custom system. | Before the affected real-participant release. |
| Initial analytics and report catalogue | Finalize the minimal allowlisted operational metrics and any reporting actually included in the release. Review aggregation and access safeguards; expanded reporting remains in M.C. | Before the relevant collection or reporting is enabled. |
| Commercial and entitlement configuration | Resolve applicable entitlement clocks, payment handling, billing/refund/tax/customer terms, and offer-specific implementation under separately approved P1-04/P1-05/P1-06 work. Do not import historical proposals. | Before the affected paid or sponsored offer. |
| Remaining release work and evidence | Complete the applicable P1-02 through P1-10 controls, rights work, tests, and release approvals for the intended scope. Architecture approval does not close those workstreams. | Before the affected real-participant release. |

<a id="ARCH-B0356"></a>
Recommended initial release scope — not an approved product rule. The first controlled real-user pilot should minimize legal and technical surface. The recommended initial posture is adults 18+ only, with no minors, and consideration of an Arizona-only first controlled pilot. Do not include raw voice/audio, research use of participant content by default, connected-health integration, or broad ForgedLife synchronization. Use minimal allowlisted operational analytics. Future capabilities remain disabled until their specific release gates are satisfied. [OD-F]

<a id="ARCH-B0357"></a>
Launch jurisdiction and eligibility remain owner/legal decisions. Neither Arizona-only scope nor an 18+ eligibility rule is established merely by this architecture specification or by approval of its underlying architecture. This pilot recommendation does not change existing Blueprint, pricing, or Compass decisions and does not remove the legal/privacy review of sensitive information actually processed by the core service.

<a id="ARCH-B0358"></a>
#### M.C. FEATURE-SPECIFIC GATES

<a id="ARCH-B0359"></a>
These capabilities remain disabled until separately approved for their actual scope. They do not block approval of the initial core architecture, and their presence in the logical data model is not implementation or release authorization.

<a id="ARCH-B0360"></a>
| Feature or use | Gate before enabling it |
| --- | --- |
| ForgedLife synchronization | Approve the selected synchronization scope, verified identity linking, data contract, participant authorization, action confirmation, revocation/deletion arrangements, and applicable release tests. No broad synchronization in the recommended initial pilot. |
| Connected health / wellness | Approve the purpose, minimum useful signals, consent, provenance, missing-data handling, vendor/legal treatment, retention/deletion, and release controls. No connected-health integration in the recommended initial pilot. |
| Voice/audio | Complete product, privacy, legal, recording/transcription consent, third-party-information, retention/deletion, and security review. No raw voice/audio in the recommended initial pilot. |
| Research use of participant content | Obtain separate owner and applicable professional approval of the specific research purpose, dataset, permissions, ethical/legal requirements, and withdrawal/deletion arrangements. No such research use by default in the recommended initial pilot. |
| Expanded cohort reporting or named operational status | Approve the exact report catalogue, audience, necessary participant authorization, aggregate/re-identification safeguards, contracts, and release evidence. Sponsorship never grants automatic private-content access. |
| Other expanded integrations or sensitive-data uses | Complete the affected purpose-specific permission, vendor, legal/privacy/security, and implementation gates before enabling the capability. |

<a id="ARCH-B0361"></a>
These categories do not reopen the already approved Blueprint depths, terminology, pricing architecture, or Compass benefits. They separate approval of the data architecture from the decisions and demonstrated controls required to operate the affected functionality with real participants.

<a id="ARCH-B0362"></a>
### N. REQUIRES QUALIFIED COUNSEL / SPECIALIST APPROVAL BEFORE REAL PARTICIPANTS

<a id="ARCH-B0363"></a>
The reviews in this section remain gates before the affected real-participant release, not prerequisites to owner approval of the underlying configurable architecture. Reviews specific to disabled future capabilities remain feature-specific gates under Section M.C.

<a id="ARCH-B0364"></a>
#### N.1 Legal findings that affect the design

<a id="ARCH-B0365"></a>
The following are illustrative, material legal considerations—not a complete jurisdictional survey or a determination that every listed law applies to Steward.

<a id="ARCH-B0366"></a>
| Area | Conditional legal requirement or applicability issue | Architecture consequence |
| --- | --- | --- |
| California privacy law | Where the CCPA applies, Civil Code §1798.100 addresses disclosure of retention periods or criteria and limits retention to what is reasonably necessary for disclosed purposes. §1798.105 provides deletion rights with specified exceptions. (California, Civil Code §1798.100; §1798.105) | Category-specific schedules, understandable notices, rights workflows, and record-specific exceptions—not a universal permanent archive. |
| Washington consumer health data | Where the My Health My Data Act applies, collection and sharing have specific consent/necessity conditions, and its deletion provisions reach relevant recipients, archives, and backups. Sharing consent is distinguished from collection consent. (Washington, RCW 19.373.030; RCW 19.373.040) | Review actual health-related processing at launch; implement separate permissions, downstream lineage, and legally compatible backup deletion. |
| HIPAA | HIPAA applicability depends on covered-entity/business-associate status and the actual relationship and activity. Handling information about health does not by itself establish that relationship. (HHS, Business Associates) | Determine applicable roles and agreements. Do not assume either HIPAA coverage or a blanket absence of health-privacy obligations. |
| FTC health breach notification | The FTC rule covers specified personal-health-record vendors, related entities, and service providers outside HIPAA. Covered unauthorized disclosure can trigger obligations; the issue is not limited to hacking. (FTC, Complying with FTC’s Health Breach Notification Rule) | Assess applicability against actual functions and data flows; include unauthorized sharing and vendor incidents in response procedures. |
| Litigation preservation | Applicable preservation duties may arise before litigation is filed. Federal Rule 37(e) addresses failure to preserve relevant electronic information in anticipation or conduct of litigation. (U.S. Courts, Federal Rules of Civil Procedure, Rule 37(e)) | Establish counsel-directed triggers, scoped holds, custody records, and coordinated deletion controls. |
| AI-specific safety obligations | California’s enacted companion-chatbot provisions define a covered category and establish disclosure/safety duties, with specified reporting beginning in 2027. Whether Steward falls within that category requires review of actual functionality—not its chosen label alone. The reporting provision excludes user identifiers/personal information from the specified report. (California, SB-243, Companion chatbots) | Review AI-specific laws in launch jurisdictions. Necessary reporting may call for narrowly defined event counts and protocol records, not indefinite transcript retention. |
| Consumer representations | FTC enforcement includes misleading and unfair practices concerning consumer information. Actual processing must be assessed against the representations made to participants. (FTC, Complying with FTC’s Health Breach Notification Rule) | Verify privacy, deletion, monitoring, security, and integration claims against real capability and vendor arrangements. |

<a id="ARCH-B0367"></a>
#### N.2 Required approvals and questions

<a id="ARCH-B0368"></a>
| Review area | Questions requiring qualified approval |
| --- | --- |
| Final retention schedule | What purpose, trigger, period/criterion, legal basis, and destruction method applies to each class? Which periods are legally required, contractually necessary, or business choices? |
| Privacy notice | Does it accurately describe sensitive information, inference, AI processing, storage, recipients, optional uses, rights, and retention? |
| Terms/customer agreement | How are participant ownership, service permissions, exports, account closure, payment, support, and limitations expressed without overstating capability or waiving non-waivable rights? |
| Deletion exceptions | Which exceptions actually apply, to which records, for how long, and with what use restrictions? |
| State-law applicability | Which laws apply based on entity, activities, geography, thresholds, exemptions, and data type? What rights, appeals, assessments, contracts, or notices are required? |
| Sensitive information | How should religious, health, financial, sexual, relationship, abuse, and other intimate information be collected, inferred, retained, and disclosed? |
| Minors/age eligibility | What population is permitted? What age-assurance and youth protections are required, including relevant COPPA and state-law analysis? Do not assume an “adults only” statement resolves all issues. |
| Safety/escalation records | What minimum evidence is necessary? What human operations actually exist? What duties, lawful disclosure exceptions, protocols, and reporting requirements apply? |
| Voice/audio | What recording, transcription, notice, consent, participant/third-party, retention, and deletion rules would apply before offering it? |
| AI/vendor/subprocessor terms | Are content use, training restrictions, retention, locations, security, deletion, breach notice, subcontracting, and assistance with rights contractually adequate? |
| Cross-service sharing | What roles and contracts apply to MJG, ForgedLife, processors, and other recipients? Can revocation/deletion obligations actually be executed? |
| Church/sponsor reporting | Which operational disclosures and aggregates are permitted? What participant expectations, consent, contracts, and re-identification risks must be addressed? |
| Research/analytics | What uses exceed necessary operations? Are additional consent, ethical review, legal assessments, or other approvals required for the actual project? |
| Litigation/legal hold | Who determines triggers and scope? How are conflicting duties, legal demands, notice, privilege, release, and preservation quality handled? |
| Breach/incident obligations | What triggers apply; who must be notified; by when; through which channels; and how are vendor obligations coordinated? |
| Security architecture | Are tenant isolation, privileged access, keys, logs, restoration, deletion, and incident controls adequate for the actual threat model? |

<a id="ARCH-B0369"></a>
For future features, the required review can remain a feature-release gate. But health or other sensitive information already processed by the initial service cannot be deferred merely because a named connector is not yet enabled.

<a id="ARCH-B0370"></a>
### O. Recommended Supabase-oriented implementation structure

<a id="ARCH-B0371"></a>
#### O.1 Product requirements remain vendor-independent

<a id="ARCH-B0372"></a>
Participant approval, exact wording, scoped permissions, authoritative entitlement, deletion, and preservation are product/data requirements. They should survive a future change of database, identity provider, payment processor, or AI vendor.

<a id="ARCH-B0373"></a>
Supabase is an implementation direction, not the source of those requirements.

<a id="ARCH-B0374"></a>
#### O.2 Proposed logical organization

<a id="ARCH-B0375"></a>
Implement these logical areas within a modular transactional application using Supabase/Postgres tables and schemas, policy-controlled application operations, private storage, and scoped jobs/workers as appropriate. The twenty data classes do not mandate twenty services, separate databases for every class, or a distributed-system topology. Use restricted stores or stronger isolation only where justified by the approved threat model. Use vetted platform/key-management facilities rather than custom cryptography.

<a id="ARCH-B0376"></a>
| Logical area | Suggested implementation |
| --- | --- |
| Authentication | Supabase Auth or the selected authentication service, connected through a controlled participant mapping. |
| Participant core | Private Postgres tables for Blueprint items, versions, assessments, evidence metadata, commitments, and outcomes. |
| Policy/access | Private permission, entitlement, cohort-policy, and recipient-grant tables. |
| Private payloads | Restricted database fields and private object storage for transcripts, journals, attachments, and approval evidence. |
| Restricted cases | Separately permissioned safety, legal, incident, and sensitive support records. |
| Records management | Locator, lineage, retention, hold, privacy-request, export, and disposition tables with dedicated workers. |
| Integration execution | Durable outbox, attempt records, authenticated inbound events, and reconciliation workers. |
| Reporting | Approved minimized views or materialized outputs, not sponsor access to underlying participant tables. |

<a id="ARCH-B0377"></a>
#### O.3 Access implementation

<a id="ARCH-B0378"></a>
Expose only the API surface needed by the application. Use narrowly scoped grants and Row Level Security for participant-accessible records.

<a id="ARCH-B0379"></a>
Supabase documents that privileged roles/secret keys can bypass RLS and must not be exposed to customers. Its documentation also warns that views require careful security treatment; appropriate invoker semantics or restricted exposure are necessary. RLS should therefore be tested across tables, views, functions, storage access, and privileged paths—not merely enabled on a few tables. (Supabase, Row Level Security)

<a id="ARCH-B0380"></a>
Recommended application rules:

<a id="ARCH-B0381"></a>
Derive the acting participant from verified authentication, not a participant ID supplied in model-generated input.

<a id="ARCH-B0382"></a>
Restrict direct mutation of approved versions, current pointers, consent history, and entitlement records.

<a id="ARCH-B0383"></a>
Implement approvals and important state changes through validated transactional operations.

<a id="ARCH-B0384"></a>
Use narrowly privileged workers rather than a single universal service credential.

<a id="ARCH-B0385"></a>
Check active account and permission state for sensitive operations; do not rely solely on a previously issued access token.

<a id="ARCH-B0386"></a>
Enforce participant ownership across linked records, not just the first table in a query.

<a id="ARCH-B0387"></a>
Private schemas in one database do not provide isolation from a sufficiently privileged database administrator. Key and administrative boundaries require separate design.

<a id="ARCH-B0388"></a>
#### O.4 Storage and backups

<a id="ARCH-B0389"></a>
Use private buckets and controlled delivery. Maintain object-level ownership, classification, lineage, retention, and hold information.

<a id="ARCH-B0390"></a>
Verify actual object deletion—not only deletion of metadata or a database reference.

<a id="ARCH-B0391"></a>
Supabase’s database-backup documentation states that database backups do not include objects stored through the Storage API. Steward must therefore design object recovery and deletion separately from database recovery, and test their consistency together. (Supabase, Database Backups)

<a id="ARCH-B0392"></a>
#### O.5 Implementation gates

<a id="ARCH-B0393"></a>
Before the affected production release, complete migrations, access tests, transactional approval tests, signed-event verification where applicable, key-management procedures, restore/deletion tests, and operational runbooks. These implementation gates remain open after architecture approval; disabled future features retain their own release gates.

<a id="ARCH-B0394"></a>
Maintain a capability registry distinguishing:

<a id="ARCH-B0395"></a>
not implemented; development/test only; released for a specified scope.

<a id="ARCH-B0396"></a>
A configured table or successful fictional test should not automatically change a capability to released.

<a id="ARCH-B0397"></a>
### P. What should not be stored long term

<a id="ARCH-B0398"></a>
The following should not receive long-term retention by default:

<a id="ARCH-B0399"></a>
| Information | Recommended treatment |
| --- | --- |
| Entire raw conversations | No indefinite raw retention by default. Use approved bounded operational/history retention, participant deletion controls, and specifically justified preservation; exact periods and the launch-history default remain release/policy gates. |
| Hidden autobiographical summaries | Do not create an indefinite alternate transcript/profile. |
| Unaccepted proposals and exploratory wording | Working-record lifecycle; never misrepresent as approved personal direction. |
| Unnecessary raw health/device data | Prefer purpose-specific useful signals; erase unneeded ingestion payloads. |
| Full card numbers, CVV, payment credentials | Keep out of Steward’s application records; use the approved processor integration. |
| Passwords and plaintext access tokens | Never place in ordinary records/logs. Necessary connection secrets belong in a restricted secrets system. |
| Full prompts, message bodies, screenshots, and session replay in telemetry | Exclude by design; use narrowly reviewed incident evidence only when necessary. |
| Repeated complete exports | Generate selected views; expire delivery packages. |
| Full private records copied into support tickets | Reference records or retain only necessary case evidence. |
| Sensitive content copied into analytics tools | Do not use convenience as the purpose. |
| Sponsor-accessible private profiles | Do not create them. |
| Unnecessary information about family members or other third parties | Collect and retain only what the legitimate participant purpose requires. |
| Raw voice/audio | No default long-term retention; any future use requires a separately approved lifecycle. |
| Old vendor payloads and completed retry queues | Purge after delivery/reconciliation needs end; retain minimal justified receipts separately. |
| Information retained merely because it might be useful someday | Do not collect or retain on that basis. |

<a id="ARCH-B0400"></a>
These are normal-policy recommendations. They are not instructions to destroy information subject to a valid preservation obligation.

<a id="ARCH-B0401"></a>
### Q. What should be durable

<a id="ARCH-B0402"></a>
“Durable” here means reliably maintained for its justified lifecycle—not retained forever.

<a id="ARCH-B0403"></a>
| Durable record | Why it matters |
| --- | --- |
| Current exact participant-approved Blueprint wording | Preserves the participant’s actual direction and authority. |
| Useful prior approved versions and change history | Supports continuity, correction, and understanding of seasonal development. |
| Necessary approval evidence | Shows what wording and scope were approved and what the system adopted. |
| Current permission state and necessary grant/revocation history | Prevents unauthorized use and supports accountability. |
| Confirmed entitlement and grant history | Distinguishes paid, sponsored, scholarship, and administrative access without relying on chat claims. |
| Necessary commercial records | Supports legitimate reconciliation, refunds, tax/accounting, and disputes. |
| Current commitments and appropriately retained outcome history | Preserves agreed scope and reported reality without inventing renewal or success. |
| Provenance and transformation references | Explains whether information was reported, measured, calculated, interpreted, or approved. |
| Necessary action receipts | Distinguishes authorization, attempts, and actual confirmed results. |
| Scoped support, safety, and incident evidence | Supports legitimate review without becoming a permanent private-content archive. |
| Hold and disposition evidence | Demonstrates what was preserved or deleted, under which authority, and when. |
| Policy, schema, consent-interface, and product-rule versions | Makes historical actions understandable under the rules actually used. |
| Vendor, access, recovery, and control documentation | Supports accountable operations and incident readiness. |

<a id="ARCH-B0404"></a>
After a record’s legitimate purpose ends, applicable deletion or destruction should apply. The existence of an audit relationship is not, by itself, a reason to retain the underlying personal content.

<a id="ARCH-B0405"></a>
### R. Traceability to current Steward governing sources

<a id="ARCH-B0406"></a>
| Source | Governing contribution to this specification | Principal sections |
| --- | --- | --- |
| [T4] Personal Stewardship Blueprint Template v4 — APPROVED GOVERNING STANDARD | One participant-owned living guide; Free/Full views; exact terminology; Definition/Content States; approval, continuity, and export boundaries. [T4, §§1–10, 13–15] | A–E, G, Q. |
| [PJ] Steward Product Journey and Progression Standard v0.1 — APPROVED GOVERNING STANDARD | Modes and entitlements; continuity across depths; confirmed access; cohort strategy; ForgedLife and future connected-data boundaries; truthful action status. [PJ, §§2–19] | A, C–D, H–K, O. |
| [OI] Steward Operating Instructions v0.4 — APPROVED WORKING TEST BASELINE | Current general fictional-test behavior; source routing; exact approval discipline; separation of reflection, interpretation, wording, commitments, and outcomes; privacy and action honesty. [OI, §§2, 6–12] | B–F, H–I. |
| [SC] Sensitive Conversations &amp; Safety Standards v0.3 — WORKING TEST BASELINE | Sensitive disclosure is not automatic storage/sharing/Blueprint permission; safety priority; no invented diagnosis, monitoring, or external intervention. [SC, §§1, 11–13] | C, F, K–N. |
| [CTX3] 00_STEWARD_CONTEXT_AND_DECISIONS_v3 — APPROVED CURRENT CONTEXT | Current navigation, protected architecture, and explicit recognition of Operating Instructions v0.4 as the active general behavior baseline. [CTX3, §§3–4, 15, 17–19] | Authority handling; D; M. |
| [SR4] Source Register and Review Queue v4 — APPROVED SOURCE-CONTROL REGISTER | Issue-specific authority; canonical document identities; historical-reference rules; P1 release work remains separate and evidence-dependent. Current synchronized OI v0.4 routing is confirmed by the owner’s controlled-finalization instruction. [SR4, §§2–5, 8–10; OD-F] | Authority handling; M–O. |
| [CFM4] Created for More Check-In v4 and its governing journey treatment | Version-specific assessment handling, meaningful results, missing-response treatment, and distinction between assessment evidence and Blueprint approval. [CFM4, pp. 3–10; PJ, §3] | C–D. |
| [SF] Approved Statement of Faith | Doctrinal baseline remains unchanged. Participant beliefs or assent must not be inferred from account creation, payment, or affiliation. Its authority is preserved through the current source routing. [SF; OI, §§2–3] | B, D, H, J. |
| [LG] Legacy and Legacy Giving Standard v1 — owner-designated governing source | Living Legacy and willing participation remain the governing meaning; the architecture does not introduce new Legacy definitions, stages, or participant defaults. [LG, pp. 1–3, 6; T4, §12] | D and template-field implementation. |
| [EA / FE] Energy Audit and Fully Engaged supporting sources | Preserve their distinct instrument/practice roles and actual source/version information; do not convert them into new Blueprint tiers or automatic judgments. [EA, Instructions, Scoring, and Interpretation; FE, Energy Stewardship Model; SR4, §4] | C–D. |
| [OD-P1] Current P1-01 owner brief | Requested data classes, lifecycle dimensions, retention principle, and legal-hold/deletion support. The original brief authorized preparation for owner review; final approval is recorded in the APPROVAL STATUS section. Owner instructions recorded in the Steward product-development conversation on September 11, 2026. | Entire specification. |
| [OD-F] Controlled finalization instruction | Owner instructions recorded in the Steward product-development conversation on September 11, 2026: preserve the accepted architectural direction; correct synchronized OI routing; separate architecture approval from release/feature gates; state bounded retention; add the explicitly recommended initial pilot posture; simplify implementation; reserve architecture approval for the owner’s separate approval decision, recorded in the APPROVAL STATUS section. | Metadata, A, C, D, F, L–P, R. |
| [OD-A] Owner approval | Owner approval recorded in the Steward product-development conversation on September 11, 2026 by Michael J. Gauthier: approves Section M.A and the supporting architecture throughout Sections A–R within the stated scope; preserves Sections M.B and N release/policy work and Section M.C feature gates. It does not constitute production approval or finalize launch policy. | Metadata, M, R, APPROVAL STATUS. |

<a id="ARCH-B0407"></a>
#### Source-control observation

<a id="ARCH-B0408"></a>
The synchronized Steward Source Register and Review Queue v4 correctly identifies Steward Operating Instructions v0.4 — APPROVED WORKING TEST BASELINE as the active general fictional-test baseline, as confirmed in the owner’s controlled-finalization instruction. This specification uses that current routing, the v0.4 document, and Context v3’s explicit supersession statement. [OD-F; OI, §§2, 13 and Approval Status; CTX3, §§15, 17–18]

<a id="ARCH-B0409"></a>
Product Journey v0.1 may retain historical Operating Instructions v0.3 references because v0.3 was the baseline when Product Journey was approved. Those references preserve history and do not reactivate v0.3. Sensitive Conversations & Safety Standards remains the separate, unchanged v0.3 working-test baseline. No existing governing source is modified by this finalization. [PJ, §§1.2, 21.2; OI, §§2, 13; SC, §1; OD-F]

<a id="ARCH-B0410"></a>
### APPROVAL STATUS

<a id="ARCH-B0411"></a>
P1-01 PRODUCTION DATA ARCHITECTURE v1

<a id="ARCH-B0412"></a>
Status: APPROVED PRODUCTION DATA ARCHITECTURE
Approved by: Michael J. Gauthier
Approval date: September 11, 2026

<a id="ARCH-B0413"></a>
P1-01 Production Data Architecture v1 was approved by Michael J. Gauthier on September 11, 2026 as Steward’s governing production data-architecture specification within its stated scope.

<a id="ARCH-B0414"></a>
Scope of approval: The architecture decisions embodied in Section M.A and the supporting architecture throughout Sections A–R are approved. This approval establishes P1-01 as the governing production data-architecture specification for Steward within its stated scope. [OD-A]

<a id="ARCH-B0415"></a>
Approval establishes the architectural direction but does not constitute production approval, compliance certification, security certification, or authorization for real participants.

<a id="ARCH-B0416"></a>
The architectural direction remains a structured participant record with exact approval/version control, separately governed private evidence, narrow durable proof, and executable retention/deletion/preservation workflows, implemented through a modular transactional application rather than unnecessary distributed services.

<a id="ARCH-B0417"></a>
Sections M.B and N remain required release/policy work before the applicable real-participant release. Section M.C capabilities remain disabled until their specific approvals and release gates are satisfied. Approval of the architecture alone does not adopt the recommended pilot jurisdiction/eligibility, set final retention periods or the launch-history default, or confirm an implemented integration.

<a id="ARCH-B0418"></a>
Architecture approval does not constitute legal compliance certification, security certification, production readiness, authorization for real participants, or completion of P1-02 through P1-10. The separate privacy/security, consent, payment, entitlement, commercial-terms, support, production-safety, rights, and release-criteria workstreams remain open. No existing Steward governing source is modified. [SR4, §§8–10; OD-F; OD-A]

<a id="ARCH-B0419"></a>
This approval does not:

<a id="ARCH-B0420"></a>
constitute legal compliance certification;

<a id="ARCH-B0421"></a>
constitute security certification;

<a id="ARCH-B0422"></a>
establish production readiness;

<a id="ARCH-B0423"></a>
authorize real participants;

<a id="ARCH-B0424"></a>
finalize retention periods or conversation-history defaults;

<a id="ARCH-B0425"></a>
establish launch jurisdiction or participant age eligibility;

<a id="ARCH-B0426"></a>
approve the Arizona-only or adults-18+ pilot recommendations as final launch policy;

<a id="ARCH-B0427"></a>
approve future ForgedLife synchronization;

<a id="ARCH-B0428"></a>
approve connected-health integration;

<a id="ARCH-B0429"></a>
approve voice/audio;

<a id="ARCH-B0430"></a>
approve research use of participant content;

<a id="ARCH-B0431"></a>
approve expanded cohort reporting;

<a id="ARCH-B0432"></a>
complete P1-02 through P1-10;

<a id="ARCH-B0433"></a>
modify any existing Steward governing source.

### Preserved supplementary part: word/header1.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-01 / ARCHITECTURE v1

### Preserved supplementary part: word/footer1.xml

	APPROVED PRODUCTION DATA ARCHITECTURE	1

### Preserved supplementary part: word/header2.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-01 / ARCHITECTURE v1

### Preserved supplementary part: word/footer2.xml

	APPROVED PRODUCTION DATA ARCHITECTURE	1

### Preserved supplementary part: word/header3.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-01 / ARCHITECTURE v1

### Preserved supplementary part: word/footer3.xml

	APPROVED PRODUCTION DATA ARCHITECTURE	1

### Preserved supplementary part: word/header4.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-01 / ARCHITECTURE v1

### Preserved supplementary part: word/footer4.xml

	APPROVED PRODUCTION DATA ARCHITECTURE	1

### Preserved supplementary part: word/header5.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-01 / ARCHITECTURE v1

### Preserved supplementary part: word/footer5.xml

	APPROVED PRODUCTION DATA ARCHITECTURE	1

<!-- END_SOURCE ARCH -->

## Preserved source module PRIV
**Original source:** `P1-02_P1-03_Privacy_Security_Consent_v0_1_APPROVED_STANDARD.docx`  
**Original status:** Approved September 12, 2026; O01–O13 and applicable controls; review gates open  
**Source class / role:** GOVERNING SOURCES / Issue-specific source; see original status and scope  
**Preservation form:** Original file bytes plus full structural text  
**Input SHA-256:** `0ff1a3a6267bb9a87b301d8069fa9bd5157b20b149201a6669e7104ac2177c45`
The source text below retains its own original terminology, approval labels, internal references and limitations. The draft wrapper does not upgrade it or adopt superseded references as current. Figures and native page layout remain in the preserved original; reference assets are not runtime-approved content.
<!-- BEGIN_SOURCE PRIV -->

<a id="PRIV-B0001"></a>
STEWARD  /  PRODUCT DEVELOPMENT

<a id="PRIV-B0002"></a>
P1-02 + P1-03

<a id="PRIV-B0003"></a>
PRIVACY, SECURITY,
CONSENT + SHARING
STANDARD v0.1

<a id="PRIV-B0004"></a>
APPROVED PRIVACY, SECURITY, CONSENT + SHARING STANDARD

<a id="PRIV-B0005"></a>
Prepared for: Michael J. Gauthier

<a id="PRIV-B0006"></a>
Prepared: September 11, 2026

<a id="PRIV-B0007"></a>
Workstreams: P1-02 — Privacy / Security Architecture; P1-03 — Consent / Sharing Model

<a id="PRIV-B0008"></a>
Document owner: Michael J. Gauthier

<a id="PRIV-B0009"></a>
Review audience: Owner, qualified privacy/legal counsel, security reviewer, Jeremy and the implementation team

<a id="PRIV-B0010"></a>
Approved by: Michael J. Gauthier

<a id="PRIV-B0011"></a>
Approval date: September 12, 2026

<a id="PRIV-B0012"></a>
Research snapshot: The September 11, 2026 external-source review is carried forward unchanged; it was not reverified in the controlled owner-decision revision or this approval finalization. Revalidate before release and material vendor changes.

<a id="PRIV-B0013"></a>
This standard records Michael J. Gauthier’s approved owner policy directions O01–O13 and the applicable approved technical/security control requirements and acceptance criteria within its stated scope. Approval does not complete legal, privacy, security or release review, establish implemented capability, or authorize real participants. It does not establish legal compliance, security certification or production readiness, and it does not amend any existing Steward source. The DOCX and Markdown are format copies of the same approved standard, not separate authorities. Approval scope and boundaries are recorded in Section 0.2 and the final APPROVAL STATUS section. [OD-REV; OD-APP]

<a id="PRIV-B0014"></a>
### CONTENTS

<a id="PRIV-B0015"></a>
Review routes are summarized in Section 0.4. The owner decisions are collected in Section 16 and Appendix A.

<a id="PRIV-B0016"></a>
	0. Executive direction, authority and reading guide	3

<a id="PRIV-B0017"></a>
	1. Initial Steward threat / risk model	6

<a id="PRIV-B0018"></a>
	2. Access-control model	11

<a id="PRIV-B0019"></a>
	3. Data sensitivity and minimization	14

<a id="PRIV-B0020"></a>
	4. Conversation history and saved continuity	16

<a id="PRIV-B0021"></a>
	5. Consent and permission taxonomy	19

<a id="PRIV-B0022"></a>
	6. Participant-facing sharing model	24

<a id="PRIV-B0023"></a>
	7. Church / sponsor privacy	26

<a id="PRIV-B0024"></a>
	8. Notifications	28

<a id="PRIV-B0025"></a>
	9. Logging, analytics and session replay	29

<a id="PRIV-B0026"></a>
	10. AI / model-provider data boundary	31

<a id="PRIV-B0027"></a>
	11. Supabase security posture	33

<a id="PRIV-B0028"></a>
	12. Encryption and key management	35

<a id="PRIV-B0029"></a>
	13. Deletion and account closure	36

<a id="PRIV-B0030"></a>
	14. Privacy-notice and terms requirements for counsel	39

<a id="PRIV-B0031"></a>
	15. Initial real-participant release recommendation	42

<a id="PRIV-B0032"></a>
	16. Owner decision matrix	44

<a id="PRIV-B0033"></a>
	17. Engineering security acceptance tests	49

<a id="PRIV-B0034"></a>
	18. Release evidence and external reference register	52

<a id="PRIV-B0035"></a>
	A. Approved owner directions + open gates	55

<a id="PRIV-B0036"></a>
	B. Counsel / specialist review required	57

<a id="PRIV-B0037"></a>
	C. Engineering implementation requirements	58

<a id="PRIV-B0038"></a>
	D. Items explicitly deferred / disabled	59

<a id="PRIV-B0039"></a>
	E. Traceability to P1-01 and current governing sources	60

<a id="PRIV-B0040"></a>
	APPROVAL STATUS	63

<a id="PRIV-B0041"></a>
### 0. Executive direction, authority and reading guide

<a id="PRIV-B0042"></a>
#### 0.1 Approved first-pilot posture

<a id="PRIV-B0043"></a>
[OD + RV; O01–O05] OWNER DIRECTION SELECTED: an invitation-only, Arizona-first, text-based pilot for adults age 18+ only, with no minors program. Session-only participant-visible raw conversation history is the first-pilot launch posture, not a permanent architecture rule. Automatic autobiographical memory is OFF; only individually selected, visible, purpose-bound continuity notes may persist. Approved Blueprint content remains separate. Qualified counsel must confirm the operating entity, geographic eligibility boundary, actual business/vendor footprint and participant eligibility implementation. Session boundaries, transient operational retention/deletion periods and the final executable retention/inactivity schedule remain professional-review and release gates. No specific retention period is selected. [OD-REV]

<a id="PRIV-B0044"></a>
[OD + RV; O06–O10] Use secure participant self-export only; defer built-in third-party, continuing, spouse, accountability-partner and church/group content sharing. Sponsor/church reporting is limited to approved privacy-reviewed aggregate operational information, with no named activation, nonactivation, last-use, completion, payment, withdrawal or private-content feeds at launch. Initial external communications are necessary minimal account/security/service email and separately opted-in generic Steward reminder email where implemented; no SMS or push reminders initially. Marketing is a separate optional permission. Analytics are limited to allowlisted operational/reliability/cost/security events necessary to operate and evaluate the product. No participant-content research, model training, evaluation corpus, fine-tuning dataset, behavioral advertising, sensitive profiling or unrelated product improvement use is authorized. [OD-REV]

<a id="PRIV-B0045"></a>
[OD + RV; O06, O11–O13] Seek the strongest compatible approved privacy configuration, starting with approved OpenAI Zero Data Retention where compatible. No automatic fallback to ordinary retention is authorized. A bounded nonpaid operational pilot under an approved complimentary/admin-granted pilot entitlement precedes live consumer payments; the later paid pilot remains separate. Require participant MFA before private-record access, tested secure recovery and fresh authentication/step-up for high-impact actions. Named accountable operating roles and independent review arrangements must be recorded before real enrollment. These owner directions are approved within this standard’s scope; all open professional-review and release gates remain open. [OD-REV]

<a id="PRIV-B0046"></a>
HARD RELEASE GATE — PROVIDER CONTRACTUAL FIT. No real participant content may be processed by OpenAI, Supabase or another core private-data processor until qualified privacy/legal/security review accepts the actual executed contract/DPA, sensitive-data representations, data-use/training settings, retention configuration, model/endpoint or service, subprocessors, relevant regions/locations, access/support terms, deletion capabilities and incident obligations. Generic public documentation alone is insufficient. Sections 10.2 and 11.4 specify the evidence; the OpenAI and Supabase sensitive-data issues remain mandatory counsel/vendor-resolution items. No suitability determination is completed here.

<a id="PRIV-B0047"></a>
[AP] The governing architectural distinction is unchanged:

<a id="PRIV-B0048"></a>
Raw conversation ≠ reflection/evidence ≠ proposed Blueprint content ≠ participant-approved Blueprint content ≠ approval/audit evidence ≠ operational logs.

<a id="PRIV-B0049"></a>
P1-01 Production Data Architecture v1 was approved by Michael J. Gauthier on September 11, 2026. Its Section M.A and supporting architecture throughout A–R govern within their stated scope. A Source Register or Context queue entry still calling P1-01 open is stale relative to that approval. This standard uses the approved architecture; it does not edit the stale source. P1-01 Sections M.B and N remain release/policy gates. Section M.C features remain disabled pending separate approval. [P1-01, introduction, M–N, Approval Status; BRIEF]

<a id="PRIV-B0050"></a>
#### 0.2 How to read authority labels

<a id="PRIV-B0051"></a>
| Label | Meaning in this standard |
| --- | --- |
| AP — Existing approved requirement | A requirement already supported by the cited governing Steward source within its scope. Approval of a working-test baseline is not production certification. |
| OP — Recommended owner policy | A recommendation or retained alternative only. Approval of this standard does not convert an OP item into owner policy unless it is separately identified as approved elsewhere. |
| OD — Approved owner direction | The identified O01–O13 owner direction is approved by Michael J. Gauthier through the September 12, 2026 approval. Professional-review and release gates remain open; real participants remain unauthorized. |
| TC — Approved technical/security control requirement | An approved implementation/control requirement or acceptance criterion within this standard’s applicable scope, subject to its stated professional-review and execution gates. Implementation and testing remain unverified until evidence exists. Engineering/security resolve implementation details within approved policy; they do not invent participant policy. |
| CL — Conditional legal requirement | A conditional legal issue requiring qualified legal analysis. Applicability depends on entity, participants, geography, data, functionality and current law. Not a compliance conclusion. |
| RV — Qualified review required | An open qualified-review requirement requiring counsel or an appropriate privacy/security/safety specialist. Owner approval does not satisfy it. |
| FD — Future feature disabled | The feature remains disabled until separately approved and released. P1-01 feature gates remain closed; additional first-pilot exclusions in O01–O13 are labeled OD, and retained unselected recommendations remain OP. Approval of this standard does not enable a deferred feature. |

<a id="PRIV-B0052"></a>
Within TC sections, “must” describes an approved implementation/control or acceptance requirement for the applicable scope, subject to stated professional-review and execution gates; it does not claim implementation or testing. OD identifies approved O01–O13 owner direction, not a completed professional or release gate. Within AP statements, the cited source continues to govern the existing requirement. OP recommendations and retained alternatives remain recommendations unless separately identified as approved elsewhere, including where a passage also carries TC: approval of the control requirement does not silently approve an OP policy recommendation. CL requires qualified legal analysis; RV remains open; FD remains disabled until separately approved and released. Legal findings and carried-forward provider facts remain separate from Steward policy. Bracketed source keys resolve in Section 18 and Appendix E. [OD-APP]

<a id="PRIV-B0053"></a>
#### 0.3 Boundaries that must not change

<a id="PRIV-B0054"></a>
[AP] One stable participant identity links separately governed records. Free, Full and My North Star are views of the same authoritative Blueprint, not separate private profiles. Exact participant-approved wording, scope, version and provenance remain protected. Definition state, content state, practice/outcome state, permission and entitlement are different things. Payment or a church relationship cannot change personal wording or grant private access. [P1-01, B–E, H–K, M.A; T4, §§1–10; PJ, §§2–7, 14–19]

<a id="PRIV-B0055"></a>
[AP] The approved Statement of Faith, Legacy definitions, Blueprint architecture, prices and offer conditions, Compass benefits, and fictional-test conduct/safety standards remain unchanged. Operating Instructions v0.4 is the active general working-test baseline; Sensitive Conversations & Safety Standards remains the separate v0.3 baseline. Historical v0.3 references in older bibliographies do not reactivate the superseded general instructions. [OI4, §§2, 13; CTX3, §§17–18; P1-01, R]

<a id="PRIV-B0056"></a>
#### 0.4 Release gates and evidence vocabulary

<a id="PRIV-B0057"></a>
| Gate | Meaning and evidence threshold |
| --- | --- |
| S — Before internal synthetic build | Establish the foundational pattern before the first shared test deployment: synthetic-only fixtures, separated environments, secret handling, identity/​policy boundaries and safe logging. Test accounts must not contain staff members’ actual private lives. |
| R — Before real participants | Implement, execute and independently review all applicable controls for the enabled release. A free, sponsored, owner or employee pilot using real private information is still a real-participant release. |
| F — Before future feature | Complete the specified feature approvals and tests before enabling it. Before R, disabled endpoints, workers and configuration paths must demonstrably reject use. |

<a id="PRIV-B0058"></a>
Control status must be recorded as specified / implemented / tested / approved for a defined release, with evidence for each transition. This document records approved owner directions and approved control requirements whose implementation and testing remain unverified; it reports no executed security tests or verified Steward account configurations. OWNER DIRECTION SELECTED and LEGAL / SECURITY / RELEASE GATE STILL OPEN are separate statuses. Open P1-02/P1-03 professional-review, implementation, testing and release work remains; this approval does not complete P1-04 through P1-10, and real participants remain unauthorized.

<a id="PRIV-B0059"></a>
For Mike: begin with Sections 4, 7, 10, 15–16 and Appendix A. Counsel: use Sections 3–5, 10, 13–15 and Appendix B. Engineering/security: use Sections 1–2, 8–13, 17 and Appendix C. These routes supplement, rather than replace, the full standard.

<a id="PRIV-B0060"></a>
### 1. Initial Steward threat / risk model

<a id="PRIV-B0061"></a>
#### 1.1 Assets, actors and trust boundaries

<a id="PRIV-B0062"></a>
[TC] Protect intimate participant content, exact approval evidence, identity/session credentials, effective permissions, verified entitlements, restricted case evidence, and deletion/hold state. Treat religious affiliation and the fact of using Steward as potentially private even when no transcript is exposed. Threat actors include outsiders, a compromised participant account, another legitimate participant, a curious sponsor, a malicious or mistaken insider, a compromised dependency/vendor and untrusted text presented to the model.

<a id="PRIV-B0063"></a>
The main boundaries are browser/device → authenticated application; application → database/storage; application → model provider; participant records → staff tools; private records → reporting; and application → delivery/payment/integration vendors. The AI is an untrusted proposer operating inside a policy-enforced workflow, not an authorization authority. A cohort identifier does not define a shared private-content tenant. [P1-01, A–D, H–L]

<a id="PRIV-B0064"></a>
Prioritization. Address direct authorization failures, secrets, account recovery, telemetry leaks, deletion and external transfers first. A small modular application with tested database and service boundaries is preferable to unnecessary microservices, bespoke cryptography or an elaborate scoring system. The risks below are plausible design scenarios, not measured incident probabilities. “High priority” means serious impact and a credible path, not a quantified likelihood. FTC security guidance and NIST risk/incident guidance inform this approach; neither certifies Steward. [FT1; NI1–NI3]

<a id="PRIV-B0065"></a>
#### 1.2 Risk register

<a id="PRIV-B0066"></a>
R01 — Cross-participant exposure, IDOR and spoofed participant IDs — high priority. Consequence: A reads, alters or deletes B’s Blueprint, assessment or export. Prevent: derive identity from verified authentication; check owner, resource, action and purpose server-side; apply RLS and ownership constraints; never trust client owner IDs. Detect: automated A/B tests and denied-access anomaly counts without payloads. Respond: disable the affected route, revoke exposed access, preserve narrow evidence and assess notification duties. Gate: S design; R complete tests.

<a id="PRIV-B0067"></a>
R02 — RLS gaps, views, functions and indirect joins — high priority. Consequence: a protected table leaks through an RPC, view, storage policy, nested relationship or realtime channel. Prevent: catalogue every exposed object; deny by default; review invoker/definer behavior, grants and insert/update ownership checks. Detect: schema-diff gate plus negative tests under real application roles. Respond: revoke exposure, roll back the migration and investigate accessed objects. Gate: S baseline; R coverage.

<a id="PRIV-B0068"></a>
R03 — Account takeover and weak recovery — high priority. Consequence: an attacker reads private history, changes email, exports records or grants sharing. Prevent: verified contact flow, mandatory participant MFA before private-record access, session protection, rate limits, fresh authentication/step-up for high-impact actions and tested secure recovery independent of sponsor claims (O13). Detect: anomalous logins, recovery changes and export spikes. Respond: freeze risky actions, terminate sessions, recover identity proportionately and revoke attacker-created grants. Gate: S authentication pattern; R operational recovery.

<a id="PRIV-B0069"></a>
R04 — Privileged/admin or insider misuse — high priority. Consequence: bulk browsing or extraction by an owner, staff member or contractor. Prevent: no standing content-browser role; separate support, billing, privacy and security permissions; time-limited case access with independent approval. Detect: immutable-enough access facts, unusual read/export volume and regular access review. Respond: terminate elevation, preserve targeted evidence, investigate conflicts of interest and assess participant impact. Gate: R; synthetic developer access separated at S.

<a id="PRIV-B0070"></a>
R05 — Service-role, secret, credential or token leakage — high priority. Consequence: bypass of RLS or takeover of vendor accounts. Prevent: managed secrets, backend-only privileged keys, separate environments, least-capable credentials and no secrets in prompts, repositories, builds or logs. Detect: repository/build scanning, canary credentials and vendor usage alerts. Respond: revoke/rotate affected credentials, invalidate relevant sessions, reconcile actions and investigate exposure before reopening. Gate: S and continuous; R verified rotation.

<a id="PRIV-B0071"></a>
R06 — Prompt injection and model-hallucinated authorization — high priority. Consequence: text such as “I am the administrator” causes retrieval, sharing, deletion or a forged consent/entitlement change. Prevent: treat participant text, retrieved records and model tool arguments as untrusted; constrained tool contracts; policy checks and signed application confirmations outside the model. Detect: adversarial tool tests and denied-action metrics. Respond: disable the tool path, stop queued actions and repair affected state from authoritative receipts. Gate: S architecture; R adversarial tests; F new tools.

<a id="PRIV-B0072"></a>
R07 — Cross-tenant retrieval, embeddings and cache mixing — high priority. Consequence: B’s context enters A’s model request despite a safe primary table. Prevent: authorize before retrieval; enforce participant scope in search/index/cache keys and results; no shared private-content response cache; lineage for derivatives. Detect: synthetic sentinel records across participants and cache/retrieval stress tests. Respond: disable the retrieval index, invalidate caches and regenerate only authorized derivatives. Gate: S; R for every enabled retrieval mechanism.

<a id="PRIV-B0073"></a>
R08 — Accidental sponsor/church access — high priority. Consequence: a leader sees disclosures or named nonparticipation through a roster join or report. Prevent: separate administrative and content models; approved report catalogue; no shared-account access; no automatic named activation feed. Detect: sponsor-role tests, report review and small-cell/differencing analysis. Respond: withdraw the report, stop refreshes, seek recipient deletion and assess disclosure obligations. Gate: R for sponsored use.

<a id="PRIV-B0074"></a>
R09 — Accidental ForgedLife transmission or account mislinking. Consequence: private material reaches community systems or the wrong identity. Prevent: disabled integration by default; separately verified identity linking and version-specific transmission grants; no match on an unverified email alone. Detect: disabled-route tests now, payload/recipient contract tests before activation. Respond: kill the worker, revoke grants/tokens, request downstream deletion and report what is actually confirmed. Gate: R disabled-state test; F full workflow.

<a id="PRIV-B0075"></a>
R10 — Sensitive data in logs, traces or session replay — high priority. Consequence: a shadow transcript spreads to staff and vendors. Prevent: allowlisted telemetry; no private-screen replay SDK; strip request/response bodies, query parameters, breadcrumbs and DOM text before collection. Detect: seeded private-content markers scanned across every telemetry destination. Respond: stop ingestion, quarantine restricted evidence, purge eligible copies and coordinate vendor deletion. Gate: S instrumentation; R end-to-end scan.

<a id="PRIV-B0076"></a>
R11 — Support-ticket overcollection. Consequence: a participant sends an entire journal, screenshots or family information into a broadly accessible helpdesk. Prevent: safe form instructions, issue metadata first, selected secure evidence only, no automatic transcript attachment. Detect: restricted intake review and synthetic attachment tests. Respond: restrict the case, remove unnecessary copies, use a protected evidence reference and inform the participant accurately. Gate: R support launch.

<a id="PRIV-B0077"></a>
R12 — Export leakage, public/predictable file URLs and browser caching — high priority. Consequence: another person downloads a Blueprint or rights package. Prevent: participant-bound export manifest, random object IDs, private storage, authenticated delivery, expiration, no sensitive filenames and no shared cache. Detect: A/B download tests, link-forwarding tests and orphan-export scans. Respond: disable downloads, remove temporary objects and request recipient cleanup; do not claim recall of downloaded copies. Gate: S storage pattern; R exports.

<a id="PRIV-B0078"></a>
R13 — Deletion failure or incomplete derivative inventory — high priority. Consequence: “deleted” content remains retrievable from an index, summary, cache or provider object. Prevent: central lineage and dependency inventory; access block first; idempotent disposition jobs; separate independent approved records. Detect: reconciliation of manifests and post-deletion retrieval probes. Respond: keep blocked, retry/escalate failures, repair the locator and correct any premature confirmation. Gate: S data model; R exercised lifecycle.

<a id="PRIV-B0079"></a>
R14 — Backup restoration resurrects deleted data or permissions — high priority. Consequence: old records, revoked sharing or closed accounts become active. Prevent: protected deletion/revocation ledger independent of the restored snapshot; restore into quarantine; replay dispositions before traffic or workers resume. Detect: restore rehearsal with deleted sentinels and stale grants. Respond: isolate the restore, purge/reapply restrictions and investigate any service exposure. Gate: R, not deferred until a disaster.

<a id="PRIV-B0080"></a>
R15 — Stale permissions, revoked consent and queued/retried jobs — high priority. Consequence: a worker sends content after withdrawal using an old JWT or queued grant. Prevent: current-policy/permission checks at dispatch and retry, privacy epochs, finite grants and fenced execution. Detect: deterministic revocation/dispatch race tests and cancelled-job counts. Respond: stop outstanding jobs, revoke access, identify already transmitted payloads and pursue downstream action. Gate: S job contract; R enabled jobs; F future sharing.

<a id="PRIV-B0081"></a>
R16 — Duplicate/replayed webhooks and forged payment/entitlement state — high priority when enabled. Consequence: false grants, duplicate actions or unauthorized recurring access. Prevent: verified signatures, replay controls, idempotency, event reconciliation and server-owned grant rules; never trust browser success text or AI claims. Detect: replay/out-of-order test suite and processor/application reconciliation. Respond: suspend uncertain changes, reconcile and correct without altering private content. Gate: S synthetic integrations; R applicable paid/sponsored state.

<a id="PRIV-B0082"></a>
R17 — Third-party/subprocessor retention or unauthorized model reuse — high priority. Consequence: participant text persists or is reused beyond representations. Prevent: approved vendor inventory/contracts, disabled training/data-sharing opt-ins, endpoint allowlist and retention-mode review. Detect: configuration checks, contract/subprocessor change review and provider-object reconciliation. Respond: pause affected processing, seek deletion/contract remedy, revise truthful notices and obtain required approvals before resuming. Gate: R before any real content reaches a vendor.

<a id="PRIV-B0083"></a>
R18 — Sensitive notification previews and misdelivery. Consequence: a lock screen, shared inbox or recycled number reveals sexual, relational, financial or health concerns. Prevent: generic templates, verified destination, no content-bearing deep links, channel controls and dispatch-time preference checks. Detect: preview tests and delivery/bounce review without message bodies. Respond: suppress the channel, reverify destination, stop retries and investigate exposure. Gate: R for email/in-app; F before deferred SMS/push.

<a id="PRIV-B0084"></a>
R19 — Analytics re-identification and purpose creep. Consequence: a small cohort, persistent ID or joined event trail reveals religious affiliation or distress. Prevent: minimal operational events, restricted joins, approved aggregate releases, suppression and no vulnerability segments. Detect: report/query reviews, differencing tests and vendor-event inventory scans. Respond: stop the report, remove unsafe datasets and reissue only reviewed aggregates. Gate: R for enabled metrics; F optional expanded analytics.

<a id="PRIV-B0085"></a>
R20 — Third-party information supplied by participants. Consequence: spouse, child, colleague or alleged abuser is profiled or exposed without a legitimate purpose. Prevent: avoid unnecessary identifiers; allow relational labels; no address-book import or third-party dossier; restrict intimate records. Detect: minimization review of intake/templates and limited, authorized case review—not routine reading of all messages. Respond: narrow/redact eligible material and handle rights or legal claims through counsel. Gate: S prompt/intake design; R handling procedure.

<a id="PRIV-B0086"></a>
R21 — Safety-event overcollection or invented human monitoring. Consequence: every difficult disclosure becomes a lasting dossier, or a participant relies on nonexistent emergency oversight. Prevent: separately reviewed minimal safety-event schema; no routine transcript mirroring; truthful service limitation; existing sensitive-conversation behavior preserved. Detect: safety-path fixture tests and claims review. Respond: restrict overcollected evidence, follow valid preservation requirements and correct service claims. Gate: R with P1-08; no automatic live monitoring assumed.

<a id="PRIV-B0087"></a>
R22 — Legal-hold misuse or preservation/deletion conflict. Consequence: indefinite retention of all accounts, destruction of relevant evidence, or use of held data for coaching. Prevent: counsel-directed record/matter-specific holds, restricted preservation-only access, review/release dates and coordinated hold/purge transactions. Detect: overdue-hold reports and sampled disposition audits. Respond: counsel resolves scope/conflict, suspends the affected purge and releases unrelated data for normal disposition. Gate: S hold-compatible schema; R procedure and race test.

<a id="PRIV-B0088"></a>
R23 — Deletion during an active AI request — high priority. Consequence: deleted context is streamed, saved or retried after deletion. Prevent: retrieval block/privacy epoch, cancellation signal, response fencing and recheck before each release/commit; upstream cancellation is best effort. Detect: instrumented tests pausing at retrieval, send, stream and save. Respond: discard in-flight results, prevent retry and track provider-side residual handling. Gate: R. Already transmitted provider input cannot be unsent.

<a id="PRIV-B0089"></a>
R24 — Approval/version confusion or hidden memory. Consequence: an inference becomes an approved identity statement or a deleted chat survives as an invisible summary. Prevent: exact version-bound approval transaction; separate proposal and continuity states; visible per-note selection; no silent merge or memory extraction. Detect: stale-approval, deletion and continuity-inventory tests. Respond: restore authoritative wording, retract unauthorized derivatives and explain actual changes. Gate: S record model; R participant workflow.

<a id="PRIV-B0090"></a>
R25 — Compromised dependency, malicious output, XSS or server-side request abuse. Consequence: tokens/content escape through unsafe model-rendered HTML, remote images or a crafted URL/tool request. Prevent: escaped rendering, restrictive content-security policy, no arbitrary HTML/scripts or model-selected network destinations, dependency review and isolated deployment credentials. Detect: static/dependency scans and injection/egress tests. Respond: revoke deployments/secrets, patch, disable unsafe rendering and assess exposure. Gate: S defaults; R verification.

<a id="PRIV-B0091"></a>
R26 — Lost device, shared browser and offline/PWA residue. Consequence: a family member or later device user reads private content. Prevent: no durable private-content browser cache by default; logout cleanup; private responses marked non-cacheable; cautious session expiry and clear account switching. Detect: browser-back/offline/service-worker/local-storage tests. Respond: revoke server sessions and delivery access; explain limits on screenshots or compromised devices. Gate: R web/PWA release.

<a id="PRIV-B0092"></a>
R27 — Availability failure, ransomware and uncontrolled retry cost. Consequence: loss of approved work, prolonged outage or runaway spending. Prevent: tested backups/recovery, constrained resource use, rate limits, bounded retries and separate recovery credentials. Detect: availability, error, queue-age and spend alerts using content-free metrics. Respond: activate incident/recovery runbook and preserve deletion/revocation state before restoring service. Gate: S retry/resource limits; R recovery.

<a id="PRIV-B0093"></a>
R28 — Privacy notice, consent UI and actual behavior diverge. Consequence: misleading promises, invalid optional choices or unrecognized rights requests. Prevent: versioned disclosures mapped to deployed configuration; accessible controls; no preselected optional uses; change-review gate. Detect: release claims audit, end-to-end rights tests and complaint review. Respond: stop affected collection/use, correct notices/statuses and seek counsel on remediation. Gate: R and every material change.

<a id="PRIV-B0094"></a>
#### 1.3 Common response and residual-risk rule

<a id="PRIV-B0095"></a>
[TC + RV] Assign an incident commander, security lead, privacy/counsel contact and vendor contacts before R. The runbook must cover detection, triage, containment, narrowly scoped evidence preservation, investigation, legal notification assessment, recovery and post-incident correction. Keep a restricted incident store rather than enabling routine transcript logging. Escalate suspected private-content disclosure promptly; counsel determines applicable statutory clocks and recipients. A vendor’s incident does not remove Steward’s response obligations. [P1-01, L.6; NI1; FT2; LAZ1–LAZ2]

<a id="PRIV-B0096"></a>
Record each residual risk, affected population/data, compensating control, accountable reviewer, expiration/review trigger and release consequence. Neither “small pilot” nor “participant agreed” excuses a broken isolation boundary, deceptive claim or applicable legal obligation. Unresolved cross-participant access, privileged-secret exposure, unbounded raw retention or inability to block deleted context is a no-go for real participants.

<a id="PRIV-B0097"></a>
### 2. Access-control model

<a id="PRIV-B0098"></a>
#### 2.1 Policy decision, not merely a role name

<a id="PRIV-B0099"></a>
[AP] Steward AI retrieves through a policy-enforcing application layer and cannot widen its own permissions. Staff, commercial, cohort and participant records remain separately governed. [P1-01, C.4, H, L, M.A]

<a id="PRIV-B0100"></a>
[TC] Every read or action evaluates authenticated actor, effective role, participant/resource owner, purpose, data class/sensitivity, record state, current permission, entitlement where relevant, account/deletion state and any restricted-case authority. An entitlement permits a product mode; it is not consent to retrieve every record. An allowed read does not imply an allowed export, share, mutation or model transmission. Deny absent, expired, ambiguous or mismatched authority. Check ownership through related records, not only the top-level URL.

<a id="PRIV-B0101"></a>
#### 2.2 Role and privilege matrix

<a id="PRIV-B0102"></a>
All human workforce roles below require individual accounts, strong MFA, attributable access and prompt removal when duties end. Prefer phishing-resistant authentication for privileged systems where supported. Machine roles use managed workload credentials and scoped service interfaces, not shared human logins. Participant authentication requirements are specified in Section 2.4. [TC; NI3; SU1, SU8]

<a id="PRIV-B0103"></a>
| Role | Allowed in ordinary work | Never available by default | Exceptional access |
| --- | --- | --- | --- |
| Participant | Own current Blueprint, eligible history, authorized evidence, assessments, commitments, settings, permissions, confirmed access and rights workflows. | Another participant’s content; internal secrets; unrestricted case files; administrator or sponsor controls. | Verified representative/​rights access only through a reviewed workflow; sharing grants do not make another account an owner. |
| Application service | Minimal records needed for the named endpoint and authenticated participant; transactional record/​permission checks. | Unbounded content dump, unrestricted cross-participant model context or global writes merely because a backend key exists. | Separate narrowly scoped maintenance/​disposition operations with explicit service identity and audit. |
| Steward AI | Purpose-selected context and minimal effective permissions/​action results provided by the application. May propose wording and actions. | SQL/​database console, service-role keys, arbitrary network tools, raw consent/​billing tables, hold evidence, permission escalation or direct entitlement writes. | No self-elevation. A new authorized task causes the application—not the model—to resolve fresh permitted context. |
| Developer, synthetic environment | Synthetic fixtures, source code, test telemetry and nonproduction infrastructure. | Production content, production clones, production secrets, unredacted real tickets or participant exports. | Production work only under a separately approved production role; content access uses the same case workflow as others. |
| Production operations | Health, queue counts, deployment status, backups and minimized infrastructure metadata. | Routine participant messages, Blueprint browsing, unrestricted S3 decrypt access or bulk content export. | Time-limited maintenance access; content only if necessary under Section 2.3. Infrastructure privilege is treated as potential data access. |
| Customer support | Identity-verification workflow, confirmed service/​billing status needed for the case, generic errors and participant-supplied minimal case details. | Search/​browse of conversations, journals, assessment responses, Blueprint text or restricted safety cases. | Participant selects specific evidence for a named case; independent approval, expiry and restricted case viewer. |
| Privacy administrator | Rights-request status, record locator, permissions, disposition manifests and necessary request-verification data. | Unrelated content browsing, marketing reuse or unrestricted safety/​legal evidence. | Case-scoped access needed to fulfill a verified request, with redaction and independent review. |
| Security / incident responder | Security events, access/​configuration history, affected-object references and incident tooling. | Routine coaching content or blanket transcript retention “for security.” | Break-glass or approved investigation access to minimum relevant evidence; retrospective independent review. |
| Legal / records administrator | Scoped hold/​disposition registry, preservation manifests, reviewed legal requests and required evidence. | Ordinary AI retrieval from held records; universal retention or sponsor disclosure on request. | Counsel-authorized matter-specific evidence access and compelled-disclosure review. |
| Cohort / church administrator | Approved program settings within delegated scope, invitation administration and approved, disclosure-safe aggregates. | Private content, participant login, or named activation, nonactivation, last-use, completion, payment or withdrawal feeds at launch (O08). | No private-content privilege from office, sponsorship or leadership. Any future selected sharing uses separately release-gated recipient authorization, not an admin bypass. |
| Billing administrator | Necessary customer/​transaction references, amounts, dates, verified commercial status and refund/​dispute functions. | Blueprint, journals, assessment responses, health data or financial-life profiling from payment metadata. | Narrow, relevant dispute evidence via privacy/​legal workflow; no whole transcript sent to a processor. |
| Integration worker | Only the current authorized job, destination, selected version and minimal confirmation metadata. | Broad participant record, arbitrary recipients, self-created grants, or retries after revocation. | No elevation. New purpose/​scope requires a new valid authorization and feature approval. |

<a id="PRIV-B0104"></a>
[OD + RV; O12] Named accountable owners must exist before real enrollment for product/owner, privacy, security/incident response, support, records/legal hold and vendor management. The actual names/organizations must be recorded in the release role register before real participants; this standard does not complete those assignments. A small team may combine responsibilities, but permissions, credentials and workflows remain separated. No person may independently approve their own sensitive-content elevation or investigate their own alleged misuse. Use an independent external reviewer/specialist where internal separation is insufficient. Company ownership is not standing authorization to browse participant lives. [OD-REV]

<a id="PRIV-B0105"></a>
#### 2.3 Exceptional-access workflow

<a id="PRIV-B0106"></a>
[TC] Open a case identifying the purpose, affected participant/records, necessity, alternatives considered, requested operations, sensitivity and proposed expiry. Use redacted metadata or a participant-selected excerpt first. Obtain participant authorization where that is the appropriate basis; a security investigation, verified rights request, valid preservation duty or lawful disclosure may require a different reviewed authority. Never label those activities optional consent when they are not.

<a id="PRIV-B0107"></a>
An independent authorized reviewer approves the smallest scope. Elevation requires fresh MFA and a short, task-bound session; a proposed engineering default is no more than one hour, with explicit reapproval for extension. This is an access-control setting, not a data-retention rule. Log approver, actor, purpose, grant, resource references, access times, operations, results and expiry, without copying the private payload. Prefer a controlled viewer; disable bulk export and local downloads unless separately approved.

<a id="PRIV-B0108"></a>
For an urgent security incident, a designated responder may invoke a preapproved break-glass procedure with a recorded reason, tightly bounded scope and immediate alert to the independent reviewer. Review the access promptly after use. Counsel determines whether participant notice is appropriate or restricted. Close the case, revoke credentials and dispose of evidence under its own schedule. Do not misrepresent authorized staff or provider access as “no one can ever read your information.”

<a id="PRIV-B0109"></a>
#### 2.4 Authentication and environment controls

<a id="PRIV-B0110"></a>
[OD + TC + RV; O13] For the first real-participant pilot, require multi-factor authentication before access to private Steward records, with a tested secure recovery process. Engineering/security chooses the appropriate mechanism and implementation. Prefer phishing-resistant or authenticator/passkey-style methods where practical rather than relying on SMS as the sole strong factor. Require fresh authentication / step-up protection for high-impact actions including full data/Blueprint export, primary contact change, MFA reset, account closure/deletion, and future recipient sharing when separately enabled. These controls must be enforced on the actual access/action paths, not only in onboarding screens. The requirement may be reconsidered after pilot learning and security review; it is not necessarily the permanent consumer onboarding design. AAL terminology in a vendor token is not a claim of independent NIST conformance. Mechanism selection, enforcement and secure recovery testing remain security/engineering release gates. [OD-REV; NI3; SU8]

<a id="PRIV-B0111"></a>
Verify account contact changes; rotate/revoke sessions following compromise or recovery; rate-limit login, signup and recovery; prevent account enumeration; allow only approved authentication redirects. Check issuer, audience, signature, expiry and intended token use. Enforce secure cookies where applicable, CSRF protection for cookie-authenticated writes and protection against script access to secrets. Never ask a church administrator to vouch for identity as the sole recovery factor.

<a id="PRIV-B0112"></a>
Use separate development, staging and production projects, databases, object stores, model projects, email destinations and payment modes. Synthetic pipelines cannot inherit production secrets. Production access must use managed devices or equivalent controlled endpoints, protected deployment paths and reviewed migrations. Production content must not be pasted into a coding assistant, a consumer chat product, a shared project source or a developer screenshot. [P1-01, L.1–L.5]

<a id="PRIV-B0113"></a>
### 3. Data sensitivity and minimization

<a id="PRIV-B0114"></a>
#### 3.1 P1-01 handling profiles

<a id="PRIV-B0115"></a>
[AP] P1-01’s S1/S2/S3 profiles are the starting model. Sensitivity attaches to a record or payload, not to a permanent inferred identity label. “Operational” and “metadata” do not automatically mean non-sensitive. A higher-risk field can elevate an otherwise operational record. [P1-01, C.2–C.5]

<a id="PRIV-B0116"></a>
| Profile | Typical Steward records | Proposed handling beyond the common baseline |
| --- | --- | --- |
| S1 — Controlled operational | Opaque job IDs, configuration versions, minimal service-health facts and some entitlement/​payment status fields. | Encrypted transit/​rest, least privilege, participant isolation, bounded retention, controlled exports and attributable operations. Identity and linked context can require elevation to S2. |
| S2 — Private participant content | Blueprint wording, assessment responses, journals, ordinary conversation, commitments, outcomes and continuity notes. | All S1 controls; purpose-selected model context; no ordinary telemetry/​support exposure; private delivery; participant visibility and disposition controls; field/​payload encryption where justified. |
| S3 — Restricted sensitive content | Intimate health/​sexual/​abuse disclosures, detailed financial circumstances, sensitive family allegations, restricted safety/​legal evidence and future connected-health payloads. | All S2 controls; purpose-restricted compartment, narrower service/​human access and decryption authority where applicable; audited exceptional access; no ordinary support, sponsor or analytics use. |

<a id="PRIV-B0117"></a>
Security profile and legal classification are different. A record classified S2 may still be legally “sensitive personal information” requiring additional handling. A summary or embedding can remain S3. Where reliable separation within a mixed record is impractical, apply the higher controls to that record rather than putting the sensitive portion into a weakly protected field.

<a id="PRIV-B0118"></a>
#### 3.2 Content Steward may encounter

<a id="PRIV-B0119"></a>
| Category | Minimization and handling recommendation |
| --- | --- |
| Religious beliefs and church affiliation | Core Blueprint/​Bedrock content may reveal beliefs. Protect it at least as S2; use S3 when context creates heightened harm or legal treatment requires it. A church identifier or invitation can disclose affiliation. Do not infer belief, doctrine assent or spiritual maturity from signup, payment, attendance or sponsorship. |
| Health and mental-health information | Fitness, Energy, journals and ordinary text can include symptoms, diagnoses, treatment or distress even without a health connector. Restrict intimate details as S3. Ask only what is necessary for the participant’s immediate purpose; no clinical-record intake by default. |
| Sexual information and relationship concerns | Use S3 for intimate sexual details, orientation/​identity disclosures, infidelity allegations or comparably sensitive relationship facts. Do not create standing propensity or “struggle” labels. No sales, engagement or sponsor segment may be based on them. |
| Abuse, trauma or immediate danger | Preserve safety priority and existing conduct standards. Do not request names, addresses, graphic histories or location merely to populate a record. A narrowly reviewed safety event is not permission for a permanent case dossier or outside contact. |
| Financial circumstances | The Finances Pillar is private participant content. Detailed debt, account circumstances or hardship may require S3. Do not solicit bank credentials, full account/​card numbers, Social Security numbers, tax returns or advisory/​client records for the core pilot. Billing metadata is separate from financial-life evidence. |
| Family and other third parties | Permit ordinary relationship labels or participant-chosen names where genuinely useful; do not require full identities, contact lists or dossiers. Minimize children’s details and allegations about others. The participant cannot grant blanket rights over another person’s information. |
| Future connected health | Remains disabled. Any future summarized signal still needs purpose-specific authorization, provenance, time scope, missing-data handling, provider review and S3 controls. Operating-system permission is not a complete service/​legal permission model. |

<a id="PRIV-B0120"></a>
[AP] Sensitive disclosure does not automatically authorize durable memory, sharing or a defining Blueprint statement. A participant-approved support plan may retain the useful response without preserving every intimate detail behind it. Privacy, a pause or declining disclosure is not a defect to fill in. [SC3, §§11–13; OI4, §§6, 10; T4, §§4, 9–11; P1-01, F.3]

<a id="PRIV-B0121"></a>
[TC] Default private free-text ingestion to a protected path capable of S3 handling before any classifier runs. Classification is not the sole security boundary. Avoid sending text to a separate classification vendor merely to decide whether it is sensitive. Any automated sensitivity indicator must be record-scoped, access-restricted, correctable and short-lived where no continuing purpose exists; no participant-facing diagnosis or permanent person flag results. Record-specific controls may be implemented through schemas, policies and payload stores within one modular application.

<a id="PRIV-B0122"></a>
#### 3.3 Conditional legal scope

<a id="PRIV-B0123"></a>
[CL + RV] Counsel must analyze actual processing, not the product label. HIPAA status turns on covered-entity/business-associate relationships; health information alone does not establish HIPAA coverage. The FTC Health Breach Notification Rule addresses qualifying non-HIPAA personal-health-record vendors and related actors; its analysis includes technical capacity to draw health information from multiple sources and unauthorized disclosures, not only hacking. Consumer-health laws can apply independently of those regimes. [HHS1; FT2]

<a id="PRIV-B0124"></a>
Washington’s My Health My Data provisions distinguish collection from sharing, with specified consent or requested-service necessity conditions; its deletion rules reach downstream recipients and backups. Nevada has its own consumer-health provisions. California retention, deletion and sensitive-information duties require an applicability analysis rather than an assumption that every small business is covered. An Arizona-only invitation list is a scope-reduction recommendation, not a universal exemption from other laws. [WA1–WA3; NV1; CA1–CA2; P1-01, N]

<a id="PRIV-B0125"></a>
### 4. Conversation history and saved continuity

<a id="PRIV-B0126"></a>
#### 4.1 Separate decisions and lifecycles

<a id="PRIV-B0127"></a>
[AP] No indefinite raw conversation retention by default. Participant-visible history, operational processing/recovery copies, saved continuity, approved Blueprint content, necessary proof, provider retention and valid legal holds have separate purposes and controls. Disabling visible history does not prove that all copies have immediately disappeared. [P1-01, F–G, M.B]

<a id="PRIV-B0128"></a>
[TC] Maintain a retention-policy registry for every enabled data class and copy location. Each policy identifies purpose, authority, start trigger, exact period or objective criterion, maximum operational bound where relevant, deletion method, vendor/backup treatment, exception authority, accountable owner, disclosure version and approval date. No production class may use an unset value, an unlimited fallback or a vendor default silently adopted as Steward policy. Test time-bound behavior with a controllable clock.

<a id="PRIV-B0129"></a>
[OD + RV; O05] The bounded, purpose-specific retention principle is selected; no specific retention period is established by this owner decision or this revision. Qualified counsel/records/security review must approve the final executable retention schedule, inactive-account rules, deletion exceptions, backup treatment and legal-hold procedures before real participants. Distinguish statutory duties from business choices. Engineering must configure the approved finite values before R; no open schedule is treated as completed merely because the principle was selected. “Until no longer needed” alone is inadequate for an operational purge job unless translated into a testable trigger and bound. Paid expiration alone must not erase the participant’s Blueprint or Free access. [OD-REV]

<a id="PRIV-B0130"></a>
#### 4.2 Comparison of launch options

<a id="PRIV-B0131"></a>
| Option | Participant experience and AI continuity | Privacy and company/​legal risk | Engineering cost |
| --- | --- | --- | --- |
| 1 — Session-only history by default | Participant sees the active conversation but cannot later browse the full transcript. Continuity comes from authorized structured records and separately selected notes. Clear session/​end controls prevent surprise loss. | Lowest ordinary transcript accumulation; less material to expose or produce. Does not eliminate provider copies or preservation duties. Requires truthful explanation and independent approval proof; support cannot rely on a permanent chat archive. | Lower persistent-history UI/​storage complexity, but still needs session expiry, recovery bounds, deletion, active-request fencing and retention controls. |
| 2 — Bounded history enabled by default | Convenient return to recent conversations. AI can use eligible prior context only for an authorized purpose, not load every chat. Participant can turn it off or delete it. | More sensitive material accumulates without a separate retention choice. Notice/​default suitability and sensitive-data law need careful review. A finite window does not justify unrelated reuse. | Medium: history navigation, expirations, selective retrieval, per-message/​conversation deletion, migration of setting changes and backup/​provider reconciliation. |
| 3 — Participant chooses during onboarding | Explicit choice between session-only and a clearly stated bounded history window; neither choice is preselected. Later settings remain available. Different choices create different expectations and continuity behavior. | Stronger agency, but onboarding can overwhelm and a checkbox cannot legalize unlimited or unnecessary retention. Incorrect branching or ambiguous notices create company risk. | Highest initial complexity: both modes, consent/​choice evidence, accessible explanations, per-account effective settings and transitions. |

<a id="PRIV-B0132"></a>
[OD + RV; O03] OWNER DIRECTION SELECTED: Option 1 for the first real-participant pilot. Session-only participant-visible raw conversation history is a launch posture, not a permanent product decision or architecture rule. It tests whether the structured Blueprint can provide useful continuity without a transcript archive. Options 2 and 3 remain comparison alternatives, not enabled pilot modes. Exact session boundaries, transient operational retention and deletion periods remain subject to privacy/legal/technical review before real participants. Selecting this posture neither amends P1-01 nor closes its applicable release gates. [OD-REV]

<a id="PRIV-B0133"></a>
#### 4.3 Required treatment of the eight lifecycle concerns

<a id="PRIV-B0134"></a>
| Concern | Launch treatment and open release condition |
| --- | --- |
| A — Participant-visible history | Show an active “session-only” indicator and explain what survives. Define a session using explicit end, logout and reviewed inactivity/​maximum-age limits—not an indefinitely open tab. Show a session-end review of separately saved items; do not force a memory note to end a session. |
| B — Operational retention | Process active messages in a protected transient store with a finite recovery window. No raw transcript in the general event ledger. Raw session payloads should not enter routine long-lived backups where avoidable; inventory any that do. Delayed cleanup must alert and remain access-blocked. |
| C — Saved continuity | O04: Automatic autobiographical memory is OFF. Only individually selected, visible, purpose-bound continuity notes may persist. The participant sees exact wording, purpose and review/expiry criteria, and can review, correct and delete eligible notes. Approved Blueprint content remains separate. |
| D — Sensitive-message handling | Provide clear notice before sensitive service processing where required, without avoidable interruption during urgent safety support. Do not treat a sent message as permanent-memory or sharing permission. Do not expose sensitive classification in notifications or sponsor views. |
| E — Participant deletion | Allow deletion of an eligible active/​retained conversation and, where feasible, a selected message. Explain separately retained authorized notes/​items/​proof; provide a route to broader source-and-derivatives deletion. Block retrieval before asynchronous physical deletion. |
| F — Account closure | Stop use, retrieval and queued actions; dispose across the inventory. Separate lawful narrow proof/​holds from ordinary content. Paid cancellation is not account closure, and expiry of sponsorship does not erase the Blueprint or Free access. |
| G — Provider-side retention | O06: Use the strongest compatible approved privacy configuration; seek approved OpenAI ZDR first where compatible. No automatic fallback to ordinary retention. Review actual contractual fit/configuration under Sections 10.2–10.4 and 11.4. Disclose residual retention truthfully; no “nothing is stored” promise or special-mode claim without account-specific evidence. |
| H — Legal-hold overrides | A valid, scoped hold may suspend destruction for covered records, not restore ordinary AI/​support use. Counsel controls conflict resolution, permitted disclosures, review and release. Unrelated records continue ordinary disposition. |

<a id="PRIV-B0135"></a>
#### 4.4 What legitimately becomes a continuity note

<a id="PRIV-B0136"></a>
[OD + TC; O04] Automatic autobiographical memory is OFF. Only an individually selected, visible, purpose-bound continuity note may persist. A note must serve an identifiable future task, be useful beyond the present exchange, minimize third-party/intimate detail, and be explicitly selected by the participant after review. Required fields: participant, exact note/version, record-level sensitivity, source reference/date, purpose, permitted retrieval scope, creation/selection receipt, review or expiration criterion, current status and deletion lineage. The participant can review, correct, revoke future use and delete eligible continuity notes without deleting the whole account. Approved Blueprint content remains separate from continuity notes. [OD-REV]

<a id="PRIV-B0137"></a>
An acceptable example, only after selection: “For the next two weeks, ask whether putting the work laptop away helped me be present at home.” Its temporary purpose is clear. Prefer storing the already approved commitment once and referencing it, rather than duplicating it into a memory note. Unacceptable examples include an inferred personality profile, an undocumented diagnosis, a permanent sexual-history summary, or “all facts learned about this participant.”

<a id="PRIV-B0138"></a>
At expiry, stop retrieval until an appropriate renewal or replacement; do not silently extend a note because it was recently read. A participant’s correction replaces the active version without silently rewriting an approved Blueprint item. Former note versions follow a bounded working-record/proof schedule, not permanent memory. No embeddings or cached summaries may outlive their authorized source unless a separately authorized record justifies them.

<a id="PRIV-B0139"></a>
#### 4.5 Participant-facing explanation — review copy, not a deployed claim

<a id="PRIV-B0140"></a>
[OP + RV] Proposed wording, to be shown only after implementation and legal review:

<a id="PRIV-B0141"></a>
“This conversation is session-only. Your approved Blueprint and anything you separately choose to save can support a later conversation. You can review or remove saved notes in Privacy & Controls. Temporary processing, provider retention and legally required preservation are explained in the privacy notice.”

<a id="PRIV-B0142"></a>
The final notice must substitute the approved operational criteria and actual provider conditions. Do not call the experience “off the record,” “unrecorded,” “confidential like therapy,” or “zero retention” when the processing chain does not support that claim.

<a id="PRIV-B0143"></a>
### 5. Consent and permission taxonomy

<a id="PRIV-B0144"></a>
#### 5.1 Different authorities, not one universal consent checkbox

<a id="PRIV-B0145"></a>
[AP] Blueprint content approval never implies sharing. Privacy-notice acknowledgement, terms acceptance, necessary service processing, optional permissions and commercial authorization remain distinct. A participant may use an otherwise available service without agreeing to unrelated marketing, research, sponsor access or integration. [P1-01, H; OI4, §10; PJ, §§11, 14–19]

<a id="PRIV-B0146"></a>
[CL + RV] Counsel determines the correct legal basis and terminology for each purpose and jurisdiction. Necessary service processing is not automatically “consent,” and calling processing necessary does not make it so. Sensitive-data laws may require specific consent even within a requested service, subject to their actual exceptions. Notice acknowledgement is evidence of presentation/acknowledgement, not proof of consent to every disclosed use. [WA1; CA1; P1-01, H.1, N]

<a id="PRIV-B0147"></a>
[TC] Implement separate processing-authority records and optional permission grants. Optional settings start off unless a separately approved, lawful default expressly says otherwise. No bundled “accept all” condition for unrelated uses. A changed purpose, recipient or materially expanded data scope requires a fresh review and, where required, new affirmative authorization; continued chat alone cannot supply it.

<a id="PRIV-B0148"></a>
#### 5.2 Common grant and evidence contract

<a id="PRIV-B0149"></a>
[TC] Every applicable permission record contains: stable grant ID; participant and authenticated actor; permission type; purpose; exact resource/version or bounded category scope; named recipient/destination where relevant; channel; disclosure/terms version and presentation record; affirmative-action evidence; effective time; expiry/review condition; current status; revocation history; policy version; downstream job/object references; and evidence/disposition policy. Keep sensitive proof payloads separate from ordinary event facts. A hash alone may not prove what wording the participant actually saw; preserve the necessary versioned disclosure/content through its justified lifecycle. [P1-01, E, H–I]

<a id="PRIV-B0150"></a>
Grant lifecycle: not granted → active → expired / revoked / superseded. Action lifecycle remains proposed → participant authorized → attempted → system-confirmed, with failed, cancelled, partial and unknown outcomes represented separately. Model-generated text is never an authorization receipt. A signed application action or an unambiguous response bound by the application to a currently displayed exact proposal can evidence assent; stale or ambiguous assent must not be guessed. Direct participant edits/save actions follow the same version/scope integrity rules without redundant questioning.

<a id="PRIV-B0151"></a>
The records below specify purpose, scope, what the participant sees, affirmative action, granularity, review/expiration, revocation, downstream effect and category-specific evidence. The common evidence contract applies to every row where meaningful; non-consent processing records document authority rather than fabricate affirmative consent. O03–O10 and O13 set the selected first-pilot boundaries: session-only visible history, individually selected notes, secure self-export, no built-in recipient sharing, email-only external reminders and necessary allowlisted operations. Future permission descriptions do not enable sharing, research, connected data, voice/audio or other deferred features; their separate release gates remain closed. [OD-REV]

<a id="PRIV-B0152"></a>
#### 5.3 Permission catalogue

<a id="PRIV-B0153"></a>
P01 — Necessary service processing. Purpose/scope: operate the requested account, conversation, Blueprint transaction, security and necessary service delivery, using only needed categories. The participant sees a clear service explanation, relevant just-in-time notice and privacy notice. Action: requests the service; do not add a fictional optional-consent checkbox. Granularity: processing purpose/data category and any legally required sensitive-data choice. Review at purpose/vendor/material-policy change. Stopping the service or deleting the account stops eligible future processing; independent proof/holds are separately evaluated. Evidence: request, purpose, applicable authority determination and notice version. [RV]

<a id="PRIV-B0154"></a>
P02 — Privacy-notice acknowledgement. Purpose/scope: document that an identified notice was presented or acknowledged. Show a readable notice and accessible link without describing it as a contract or blanket data permission. Action: acknowledgement only where adopted after counsel review; mere delivery is recorded as delivery, not reading. No category-level consent results. Re-present material changes as legally required. Acknowledgement is historical evidence, not an active permission to revoke; the participant can exercise actual choices/rights. Evidence: notice version, presentation and any actual acknowledgement. [RV]

<a id="PRIV-B0155"></a>
P03 — Terms acceptance. Purpose/scope: service agreement with the correct legal entity. Show material terms, version and accessible copy. Action: affirmative acceptance through the approved agreement interface. Granularity: service agreement separate from optional permissions and recurring charges. Review material contract changes; follow lawful reacceptance rules. Ending the agreement does not automatically destroy all independently justified proof. Evidence: exact agreement version, actor, assent/time and relevant commercial record—not a full conversation. [RV]

<a id="PRIV-B0156"></a>
P04 — Blueprint content approval. Purpose/scope: adopt exact wording into the identified Blueprint item/version and seasonal scope. Show proposed wording, location and scope, plus replaced wording where applicable. Action: clear participant approval or intentional direct save; application validates the exact pending version. Granularity: item or transparently presented selected batch, never unrelated content. Review/revise through normal Blueprint refinement. Revocation of current use/removal stops active retrieval; separate history/proof follows Section 13. No sharing, payment or note permission results. Evidence: exact wording/version, prior version and narrow assent receipt. [AP]

<a id="PRIV-B0157"></a>
P05 — Conversation-history choice. Purpose/scope: govern participant-visible raw history separately from necessary transient processing. O03 selects session-only history by default for the first real-participant pilot, not a permanent product rule. Show that mode and its approved session/deletion effects; exact session boundaries and transient operational retention/deletion periods remain privacy/legal/technical gates. Action: explicit enable/change if a different bounded-history mode is later approved and offered; no hidden switch or implication that such a mode is available initially. Granularity: account setting and conversation override if later implemented. Review any window or purpose expansion. Disable stops new covered history; offer clear disposition of existing eligible history rather than silently retaining it. Evidence: displayed policy, effective setting/time and deletion choice. [OD + RV; O03; OD-REV]

<a id="PRIV-B0158"></a>
P06 — Saved-continuity choice. Purpose/scope: retain a selected concise note for an identified future use. Show exact note, source, purpose, sensitivity-aware warning and review/expiry criterion. Action: participant selects/save-confirms that note. Granularity: each note; no automatic memory grant. Review at its stated trigger; expired notes are not retrieved. Removal blocks future retrieval and deletes eligible versions/derivatives; no automatic change to independently approved Blueprint items. Evidence: note version, selection and later correction/removal. Automatic autobiographical memory remains OFF; only individually selected, visible, purpose-bound notes may persist, and eligible notes remain reviewable, correctable and deletable. [OD + TC; O04; OD-REV]

<a id="PRIV-B0159"></a>
P07 — Optional service notifications. Purpose/scope: chosen reminder or service update, not marketing. Show channel, verified destination, cadence/trigger, generic-preview rule and controls. Action: explicit channel/trigger enable; OS permission alone is insufficient. Granularity: channel and reminder purpose. Review changed destinations and scope. Disable stops future eligible scheduling/delivery/retries; essential security/legal/transactional messages are explained separately under their appropriate authority. Evidence: selected template class, channel, scope and effective preference. O09 limits initial external reminders to separately opted-in generic Steward reminder email where implemented; no SMS or push reminder channel initially. [AP + OD; O09; OD-REV]

<a id="PRIV-B0160"></a>
P08 — Marketing. Purpose/scope: promotional communication only. Show sender, purpose and channel, separate from service access, sponsor enrollment and reminders. Action: separate affirmative opt-in as the selected owner direction; marketing is optional and may not be bundled with service reminders or sponsorship, even where a law uses an opt-out model. Granularity: channel and materially distinct campaign purpose. Review material changes. Unsubscribe stops covered future marketing and updates downstream suppression; retain only justified suppression/proof data. Evidence: actual opt-in, disclosure and unsubscribe execution. The separate permission does not itself launch a marketing campaign or close its review gate. [OD + RV; O09; OD-REV; FT3]

<a id="PRIV-B0161"></a>
P09 — Selected-content sharing. Purpose/scope: deliver the selected record version(s) for a stated purpose. Show a preview, recipient/destination, method, duration and inability to recall received copies. Action: explicit final share authorization. Granularity: content, recipient and duration; no bundled whole-account grant. One-time delivery ends that delivery authority; hosted access also has an expiry. Revoke stops future eligible access/delivery, not facts already received. Evidence: manifest, grant, attempt and confirmed result. Deferred beyond the first pilot under O07; secure participant self-export only is the selected initial scope. [AP + OD; OD-REV]

<a id="PRIV-B0162"></a>
P10 — Named-recipient authorization. Purpose/scope: bind P09 to an identified recipient and verified destination. Show name plus destination and verification status. Action: participant confirms the actual destination; recipient verifies control through the approved flow. Granularity: recipient/destination, not “my mentor” alone. Reverify changes and review expired/inactive access. Revocation disables that destination’s grant; other recipients are unaffected. Evidence: participant confirmation and destination-verification result, not excess identity documents. This is a dimension of a future share grant, not a substitute for content selection. No built-in third-party recipient sharing is enabled in the first pilot under O07. [AP + TC + OD; OD-REV]

<a id="PRIV-B0163"></a>
P11 — Spouse/family sharing. Purpose/scope: selected family support material for the named person. Show the same content/destination/purpose controls as P09–P10; marriage or family membership adds no authority. Action: explicit participant authorization without coercion or default account linking. Granularity: each recipient/content scope. Relationship/destination changes require review. Revoke future use without notifying an unsafe person unnecessarily; counsel/safety review governs exceptional notices. Evidence: normal share receipt, not inferred relationship consent. Deferred beyond the first pilot under O07; later enablement requires separate release approval. [AP + OD; OD-REV]

<a id="PRIV-B0164"></a>
P12 — Accountability-partner sharing. Purpose/scope: selected commitment, question or reported outcome for a verified partner. Show whether it is a one-time snapshot or explicitly bounded future updates. Action: specific authorization; agreeing to seek accountability is not permission to send. Granularity: partner, fields, versions/updates and cadence. Expire at the stated period; no automatic renewal of commitments. Revoke stops future sharing. Evidence: selected scope, confirmation and delivery result; unknown practice remains unknown. Deferred beyond the first pilot under O07; later enablement requires separate release approval. [AP + OD; OD-REV]

<a id="PRIV-B0165"></a>
P13 — Church/group sharing. Purpose/scope: selected content to an identified audience, not access for every leader. Show named recipients or a verified membership snapshot, group identity, purpose and update rule. Action: explicit share grant independent of sponsorship. Granularity: audience/content; no automatic exposure to new members. Expire/review on membership change. Revoke future access and track any downstream request; prior copies may remain outside control. Evidence: audience/version snapshot and each confirmed delivery. Not enabled in the first pilot under O07; remains disabled until separately approved and released. [AP + FD + OD; OD-REV]

<a id="PRIV-B0166"></a>
P14 — ForgedLife transmission. Purpose/scope: selected authorized commitment, rhythm or accountability material sent to a verified linked identity; returning practice data has a separate inbound scope. Show fields, destination, purpose, dates and deletion/revocation limitations. Action: explicit transmission/connect authorization separate from Blueprint approval. Granularity: direction, categories and selected records. Review scope/link changes and expiry. Disconnect stops jobs and revokes tokens; retained transferred data needs its own disposition decision. Evidence: link verification, grant, payload version and destination receipt. [FD]

<a id="PRIV-B0167"></a>
P15 — Connected-health access. Purpose/scope: minimum useful signals from a named provider for a stated period and use. Show categories, processing recipients, retention and withdrawal effects before access. Action: service-specific affirmative permission plus provider/OS authorization as applicable. Granularity: provider, category, time range and purpose; no “all available data” default. Review access changes/expiry. Revoke future fetch/use and address retained summaries/raw copies and processors under applicable law. Evidence: scope, legal disclosure/consent version, provider authorization and disposition. [FD + RV]

<a id="PRIV-B0168"></a>
P16 — Recurring payment. Purpose/scope: a clearly identified recurring commercial offer. Show price/currency, interval, start/renewal terms, cancellation and any material conditions before charging. Action: new affirmative payment choice through verified checkout; neither card storage, one-time Build purchase nor sponsorship authorizes renewal. Granularity: subscription/offer. Review material changes under applicable law. Cancellation stops applicable future charges; it is not account deletion. Evidence: exact commercial terms/assent, processor references and confirmed cancellation. P1-04/P1-06 resolve details. [AP + CL + RV; PAY1]

<a id="PRIV-B0169"></a>
P17 — Optional analytics beyond necessary operations. Purpose/scope: a specific additional measurement, not a generic improvement license. Show events, linkage, recipient, purpose and period. Action: separate affirmative permission as recommended policy, plus legal opt-outs where required. Granularity: materially distinct purpose/data category. Review expansions and expire with the stated project. Revoke future collection/use; evaluate deletion of identifiable contributions and explain limits of truly irreversible aggregates. Evidence: dataset/purpose version and withdrawal execution. O10 does not authorize optional analytics beyond allowlisted operational/reliability/cost/security events necessary to operate and evaluate the product. Any later expanded purpose requires separate approved feature/purpose and applicable participant/legal review. [OD + RV; O10; OD-REV]

<a id="PRIV-B0170"></a>
P18 — Research using participant content. Purpose/scope: a specifically approved research project with defined dataset, recipients, duration and protections. Show a standalone explanation, risks, voluntariness and withdrawal limits before contribution. Action: separately reviewed explicit participation; no service penalty for declining. Granularity: project and data/uses. Expire at project end; review changes. Withdrawal stops covered future use and triggers agreed/legally required disposition; no invented recall of published anonymous findings. Evidence: approved protocol, authorization and dataset lineage. No participant-content research, model training, evaluation corpus, fine-tuning dataset or unrelated product improvement use is authorized for the first pilot under O10. Any later research/content-analysis use needs a separate approved feature/purpose and applicable participant/legal review; this catalogue is not that approval. [FD + RV + OD; OD-REV]

<a id="PRIV-B0171"></a>
P19 — Future voice/audio processing. Purpose/scope: an approved recording/transcription interaction and no unrelated voiceprint use. Show whether recording occurs, participants captured, provider, retention and transcription handling. Action: explicit feature activation and any recording permissions required by applicable law; visible recording state. Granularity: session and optional retained audio separately. End/revoke stops future recording; delete eligible audio, transcripts and derivatives. Evidence: recording notice/authorization, start/stop and disposition. No raw voice/audio in the recommended pilot. [FD + RV]

<a id="PRIV-B0172"></a>
P20 — Participant-selected support evidence. Purpose/scope: solve a named support case using the smallest selected excerpt or record. Show evidence, case, permitted staff role and expiry. Action: explicit selected-evidence submission/authorization where appropriate. Granularity: case and record/version, not ongoing staff browsing. Review on escalation or scope change. Revoke future optional access; independently justified dispute/incident preservation is separately explained and restricted. Evidence: selected manifest, staff access grant and access/disposition events. This is not sponsor or general research permission. [TC + RV]

<a id="PRIV-B0173"></a>
#### 5.4 Enforcement, revocation and concurrent actions

<a id="PRIV-B0174"></a>
[TC] Validate effective authority before retrieval, model dispatch, action creation, scheduling, execution, retry and result persistence. Recheck account status and canonical grants instead of trusting an old token claim. Increment a participant/resource privacy epoch on revocation or deletion; invalidate dependent retrieval caches and queued work. A job contains references to scope/version/grant, not an evergreen permission snapshot.

<a id="PRIV-B0175"></a>
Serialize revocation against the final dispatch decision through a transactional outbox and an execution fence or equivalent verified concurrency design. Cancellation must win for work not yet committed to external transmission. Once transmission has actually occurred, record that boundary honestly: a later revocation stops further use under Steward’s control but cannot unsend the request. Unknown delivery must be reconciled, not automatically retried in a way that could duplicate disclosure. The user-visible status must distinguish revocation recorded, future access blocked, downstream request sent and downstream deletion confirmed. [P1-01, H.3–H.4, I, K.1]

<a id="PRIV-B0176"></a>
### 6. Participant-facing sharing model

<a id="PRIV-B0177"></a>
#### 6.1 Minimum authorization transaction

<a id="PRIV-B0178"></a>
[AP] Sharing requires selected content + named/defined recipient + purpose + explicit authorization. A role description—“my spouse,” “my pastor,” “my mentor,” “my church”—is not an identified destination or system permission. Sponsorship and approved Blueprint wording supply none of the missing elements. [P1-01, H; OI4, §10; PJ, §§13–16]

<a id="PRIV-B0179"></a>
[TC] A future share composer must resolve the participant’s own selected records, create a manifest of exact versions, verify the recipient destination, explain one-time delivery versus hosted access, and show a final preview including purpose and expiry. Validate the grant again immediately before delivery. Do not attach supporting conversations, assessments or journals merely because they helped produce a selected Blueprint item. Selected redactions are export/share views; they do not silently edit canonical approved wording.

<a id="PRIV-B0180"></a>
#### 6.2 One-time and continuing sharing

<a id="PRIV-B0181"></a>
| Type | Required boundary |
| --- | --- |
| One-time snapshot | Share only the selected versions in the manifest. Completing delivery does not authorize sending later edits. An expiring hosted snapshot is still accessible until revoked/​expired under its access rules. |
| Continuing access to a snapshot | Grant access to fixed selected versions for a stated period. Require authenticated recipient access; verify the grant on each request. No perpetual bearer link. |
| Future updates | A separate explicit scope defines fields, recipient, cadence/​trigger and end/​review condition. New categories or sensitive expansions require new authorization. Approval of a new item does not automatically extend the sharing grant. |
| Group sharing | Use a verified audience snapshot. New members cannot inherit access to previously shared private content. Material audience changes stop or suspend affected access until the participant authorizes the revised audience. |

<a id="PRIV-B0182"></a>
For recipient verification, verify control of the destination/account and have the participant confirm that it is the intended person. Email verification is not proof of every claimed relationship or legal identity. Do not collect government identification routinely. Never infer the spouse’s destination from an unverified address book or another participant’s account. Rate-limit invitations and prevent sharing invitations from becoming spam or revealing whether a person already uses Steward.

<a id="PRIV-B0183"></a>
#### 6.3 Revocation and limits of control

<a id="PRIV-B0184"></a>
[TC + RV] Provide a visible list of active grants, content versions, recipients and expiry dates, with revoke controls. Revoke hosted access promptly and cancel eligible pending transfers/notifications. Where contracts or law require downstream deletion, send a tracked request and retain the actual result. Explain that recipients may already have read, downloaded, photographed or copied information. Do not promise technical recall of email attachments or screenshots.

<a id="PRIV-B0185"></a>
Consent must not be coerced through group belonging, spiritual pressure, an account-recovery requirement or access to a sponsored benefit. A participant should not need to notify an unsafe recipient personally to revoke Steward access. Unusual disputes or compelled disclosures follow counsel review, not an administrator’s social role.

<a id="PRIV-B0186"></a>
#### 6.4 Safest usable initial scope

<a id="PRIV-B0187"></a>
[OD + RV; O07] The first pilot uses secure participant self-export only. Do not enable built-in third-party recipient sharing, continuing sharing, spouse sharing, accountability-partner sharing or church/group content sharing. Provide the approved participant-facing Blueprint export securely to the participant, with a warning about local copies and O13 fresh authentication/step-up for full data/Blueprint export. The participant may independently show or send that copy outside Steward; this is not a Steward-confirmed recipient transmission and must not be logged as one. Formal personal-information access exports remain a distinct rights workflow. [OD-REV; P1-01, G.7; T4, §13]

<a id="PRIV-B0188"></a>
This reduces recipient identity, revocation, group membership and misdelivery complexity while preserving participant ownership and usable Blueprint access. Do not create a public link as a shortcut. Future sharing remains separately release-gated; a participant’s request or consent does not enable a disabled feature. Any later sharing release requires its own owner/privacy approval, defined selected-version/verified-recipient scope and completed feature tests before use.

<a id="PRIV-B0189"></a>
### 7. Church / sponsor privacy

<a id="PRIV-B0190"></a>
#### 7.1 Sponsorship never purchases private content

<a id="PRIV-B0191"></a>
[AP] Sponsorship does not grant the church, sponsor, facilitator, pastor or other leader access to private Blueprint wording, assessments, Created for More Check-In responses, conversations, journals/reflections, Energy responses, Drift + Return, sensitive disclosures or connected-health information. The same rule protects leaders’ own private accounts. [PJ, §§14–16, especially 16.8; P1-01, J]

<a id="PRIV-B0192"></a>
#### 7.2 Separate administrative facts

<a id="PRIV-B0193"></a>
| Category | Required separation and recommended initial visibility |
| --- | --- |
| Eligibility | Approved population/​rule and minimal evidence may support issuing an invitation or entitlement. Do not import private study answers to prove eligibility. A sponsor may administer its own invitation roster under reviewed notice/​contract terms. |
| Invitation | Show program/​invitation configuration and aggregate invitations issued. A named invitation record is not proof of activation or permission to disclose redemption. Avoid tracking pixels and individualized click/​open reports. |
| Activation | Steward’s authoritative application records the participant’s successful activation and clock. No automatic named activation/​nonactivation report back to the church. |
| Entitlement | The participant sees their own confirmed grant, scope and dates. Authorized Steward operations can resolve access. Sponsor entitlement administration does not require access to personal content or future payment choices. |
| Cohort administration | Delegated administrators manage only the approved program configuration and necessary invitation operations. No “log in as participant,” transcript search or drill-through. |
| Aggregate metrics | Release only the approved catalogue after disclosure-risk review. A small or linkable cohort may require withholding, coarsening or delaying even an aggregate count. |
| Named operational status | O08: OFF at launch. No named activation, nonactivation, last-use, completion, payment, withdrawal or private-content feeds. Any later proposal is a separate owner/privacy/release decision; reporting is not approved merely because it omits transcript text. |
| Private content | Denied. Any later selected sharing is participant-authorized to a recipient, not an administrative privilege. |

<a id="PRIV-B0194"></a>
[OD + RV; O08] Initial sponsor/church reporting is limited to approved privacy-reviewed aggregate operational information. No named activation, nonactivation, last-use, completion, payment, withdrawal or private-content feeds may be provided at launch. Approved program definitions, benefit configuration and non-participant-specific invitation administration remain distinct from participant reporting. A church-controlled distribution list may be managed separately without exposing who redeemed or used Steward. Named invitation operations beyond existing program administration require their own minimum-data workflow and review; they must not become a return feed of participant activity. Exact aggregate report definitions and disclosure safeguards remain a privacy/release gate. Sponsorship never grants access to private participant content. [OD-REV]

<a id="PRIV-B0195"></a>
#### 7.3 Compass preservation and reporting recommendation

<a id="PRIV-B0196"></a>
[AP] Compass Men’s January 2027 remains the first approved sponsored-cohort configuration, not proof of a live implementation. The six-week study/ForgedLife community experience remains primary during the study. Eligible post-study participants receive the sponsored Full Blueprint Build plus sixty days of Steward from activation, with no card or automatic renewal. Leaders receive the approved integrated Full Build plus twelve months from activation, with no card or automatic renewal. Expiration preserves the Blueprint and Free access; any paid continuation needs a new affirmative choice. This standard does not change those benefits or create a competing notification campaign. [PJ, §16.8]

<a id="PRIV-B0197"></a>
[OP + RV; within O08’s selected aggregate-only boundary] For the still-unapproved initial reporting catalogue, recommend program-level invitation counts and sufficiently aggregated activation totals, with sponsored participants, complimentary leaders and direct-paying participants kept conceptually distinct. Do not publish a leader subgroup so small that the count identifies its members. Usefulness feedback should be separately voluntary and non-sensitive; do not mine private conversations or assessments to calculate it. Practice/accountability learning must not become named compliance surveillance. Final metric definitions and disclosure thresholds require owner/privacy approval before the report is offered. [PJ, §§16.6–16.9, 20; P1-01, J.3, M.B–M.C]

<a id="PRIV-B0198"></a>
[TC] Assess small cells, overlapping reports, subgroup subtraction, known membership and repeated date windows. There is no universally safe minimum cell size. Prevent drill-through, arbitrary filters and joins to invitation rosters; control repeat releases and report exports. Record report version, purpose, audience, approval and generation/delivery facts. Sponsor contracts must prohibit re-identification attempts and private-content demands. Contracts supplement rather than replace technical isolation.

<a id="PRIV-B0199"></a>
A sponsor asking “Who has not activated?” should receive the approved boundary and an available safe aggregate, not an improvised named list. A participant may voluntarily tell a leader about their own use; that does not authorize a system feed about everyone else.

<a id="PRIV-B0200"></a>
### 8. Notifications

<a id="PRIV-B0201"></a>
#### 8.1 Channel and content rules

<a id="PRIV-B0202"></a>
[AP + TC] Optional notifications, marketing, sharing and recurring payment use separate permissions. Check the current channel/destination/purpose preference at dispatch, not only when the reminder was scheduled. Essential security, legal and transactional messages require their own reviewed authority and truthful explanation; they are not an excuse to send promotional or coaching messages. [P1-01, H, K.5; OI4, §10; PJ, §11]

<a id="PRIV-B0203"></a>
| Channel | Recommended privacy requirements |
| --- | --- |
| Email | O09: Necessary minimal account/security/service email; separately opted-in generic Steward reminder email where implemented. Use verified destinations and generic, non-sensitive previews. No private attachments, tracking pixels, sensitive query strings or reply-to requests for an entire transcript. Marketing remains a separate optional permission, not bundled with reminders or sponsorship. |
| SMS | Defer initially. Before enabling, verify the number, support effective opt-out and reassignment/​reverification handling, review current communications law and provider terms, and limit payloads to generic text. Phone possession is not permission for every message purpose. |
| Push | Defer initially. OS permission plus Steward purpose/​channel choice, device-bound tokens, logout/​account-switch cleanup, generic previews and private authenticated destinations. A stale device token must not expose another account’s updates. |
| In-app | Show private detail only in an authenticated, authorized view. Keep navigation badges and logged-out surfaces generic; clear cached content on logout. Optional reminders remain controllable even though the channel is inside the service. |

<a id="PRIV-B0204"></a>
[OD; O09] Initial external communications are necessary minimal account/security/service email and separately opted-in generic Steward reminder email where implemented. No SMS or push reminder channel initially. Marketing remains a separate optional permission and may not be bundled with service reminders or sponsorship. External notification previews must remain generic and non-sensitive. No transcript quotations, specific Guardrail text, spiritual struggle, relationship issues, sexual disclosures, mental-health concerns or financial details in subjects, lock screens, URLs or message metadata. Even the Steward brand may reveal an association; explain that shared devices/inboxes are outside complete technical control. [OD-REV]

<a id="PRIV-B0205"></a>
#### 8.2 Safe template patterns and delivery truth

<a id="PRIV-B0206"></a>
[TC] Safe review-copy patterns: “Your Steward reminder” / “Open Steward when you’re ready”; “Your requested export is ready” / “Sign in to view your download”; “An account setting changed” / “Sign in to review your security settings.” Use a neutral first-party sign-in destination rather than a public content link. A reminder should not say “It’s time to discuss your marriage” or “Return to your pornography Guardrail.”

<a id="PRIV-B0207"></a>
Record authorized, scheduled, submitted, provider-accepted, delivered where actually reported, failed and cancelled separately. Provider acceptance is not proof that the participant read the message. Cap retries, honor quiet hours and frequency controls, suppress expired/revoked work and reverify changed destinations. Counsel reviews commercial versus transactional email and SMS/push requirements before those channels are offered. FTC guidance distinguishes commercial from transactional/relationship email; this standard does not assert that all service-labeled email is exempt. [FT3]

<a id="PRIV-B0208"></a>
### 9. Logging, analytics and session replay

<a id="PRIV-B0209"></a>
#### 9.1 Deny content by default; allow fields deliberately

<a id="PRIV-B0210"></a>
[AP + TC] Ordinary telemetry must not contain full participant messages, full prompts, Blueprint text, journals, assessment responses, secrets, access tokens or connected-health payloads. A hash of short sensitive text, a revealing event name or a linkable identifier can also expose information. Logging must not circumvent the lifecycle in Section 4. [P1-01, I, L.4]

<a id="PRIV-B0211"></a>
| Destination | Allowlisted approach | Exclude / constrain |
| --- | --- | --- |
| Application/​error reporting | Random request ID, route template, result/​error code, build version, service name and sanitized stack frame. | Bodies, user-entered fields, database bind values, full URLs, email addresses in errors, exception-object dumps and automatic screenshots. |
| Traces/​performance | Duration, queue age, dependency name, token/​cost totals where necessary, response status and model/​config version. | Prompt/​completion capture, content-bearing span attributes, tool argument dumps and agent traces containing messages. |
| Database/​infrastructure | Access/​configuration facts, operation names, bounded security identifiers and necessary query fingerprints. | Statement logging that exposes literals, sensitive object names/​paths, unrestricted query-result samples and verbose connection credentials. |
| Browser analytics | Allowlisted first-party operational event, coarse device/​browser class and bounded pseudonymous reference only where necessary. | DOM text, keystrokes, form values, granular click trails, private page titles, location tracking, ad pixels and cross-site identity. |
| Support tooling | Case ID, issue category, status and protected evidence reference. | Automatic chat attachment, broad screenshot capture, entire account record or private evidence duplicated into email. |
| Security/​incident evidence | Minimal incident/​access facts in ordinary logs; separately approved relevant payload in restricted evidence storage. | Full transcripts “just in case,” unrestricted incident exports or security logs reused as product-learning datasets. |

<a id="PRIV-B0212"></a>
[TC] Apply filtering before network transmission at every SDK, gateway, worker and vendor integration—not just in one application logger. Scan deployed builds, browser network traffic, model/agent tracing, CDN/WAF settings, mail logs, Supabase logs and log drains. Provider-operated logs require documented vendor controls and residual-risk review where Steward cannot directly change them. Supabase’s log documentation describes multiple log categories and plan-dependent retention; that is a vendor configuration to inventory, not permission to collect private payloads. [SU13]

<a id="PRIV-B0213"></a>
#### 9.2 Session replay

<a id="PRIV-B0214"></a>
[OP + TC] Prohibit session replay on private Steward screens at launch. Do not rely on text masking as the primary control. The replay SDK should not load or run on authenticated/private routes; navigation from a marketing page must not leave a recorder active. No screenshots, DOM snapshots, keystroke capture or private-screen heatmaps. Use synthetic reproduction, explicit non-sensitive feedback and minimized errors instead. Any future exception is a new owner/privacy/security review, not a support-team switch.

<a id="PRIV-B0215"></a>
#### 9.3 Early product learning without sensitive profiles

<a id="PRIV-B0216"></a>
[OD + TC; O10] Initial analytics are limited to allowlisted operational/reliability/cost/security events necessary to operate and evaluate the product. A reviewed small catalogue may include requests succeeding/failing, latency, token cost, queue age, export success, deletion completion/failure, invalid-authority denials, confirmed entitlement transitions, and coarse counts of approved Blueprint saves or product-mode use where actually needed. Success means the operation occurred, not that life improved. Do not attach wording, topic labels, individual distress, diagnoses, sexual content, spiritual condition, prayer/Scripture details or inferred family/financial risk. [OD-REV]

<a id="PRIV-B0217"></a>
Keep user-level reliability/security diagnostics restricted and bounded; release broader operational learning as reviewed aggregates. Do not treat a persistent pseudonym as anonymity or join payment/contact identifiers to behavioral trails by default. Voluntary usefulness feedback can ask whether Steward helped a real decision without requesting intimate details; warn against private disclosures in free text and apply an appropriate lifecycle. Under O10, no participant-content research, model training, evaluation corpus, fine-tuning dataset, behavioral advertising, sensitive profiling or unrelated product improvement use is authorized. Any later research/content-analysis use requires a separate approved feature/purpose and applicable participant/legal review. Operational metrics or usefulness feedback cannot be used to bypass that boundary. [OD-REV; PJ, §20; P1-01, C, L.4, M.B–M.C]

<a id="PRIV-B0218"></a>
### 10. AI / model-provider data boundary

<a id="PRIV-B0219"></a>
#### 10.1 Verified OpenAI API/business facts

<a id="PRIV-B0220"></a>
The following is the September 11, 2026 documentation snapshot carried forward from the owner review draft, not a new external verification or confirmation of Steward’s contract, organization settings or eligibility. Consumer ChatGPT settings are not the production API control model. Actual contractual/configuration acceptance remains blocked pending the review in Sections 10.2–10.4.

<a id="PRIV-B0221"></a>
Provider retention controls. OpenAI documents API content as excluded from model training/improvement unless opted in. Default abuse-monitoring logs may contain content and are retained up to thirty days, with longer legal/protective exceptions. Modified Abuse Monitoring (MAM) and Zero Data Retention (ZDR) require approval; both limit content in abuse logs, subject to exceptions. ZDR also forces supported store settings false, but incompatible features can retain application state. “Eyes Off” and “Safety Retention” describe notified customer/model-specific departures; the latter can include human review. Residency requires eligibility and supported project/model/endpoint configurations; storage and regional inference are distinct, and system data has exclusions. [OA1]

<a id="PRIV-B0222"></a>
Application state. OpenAI’s conversation-state guide documents default thirty-day Response storage and store=false to disable that behavior; Conversation objects/items do not share that automatic thirty-day expiry. The endpoint-specific data-controls guide qualifies default/stored Responses as retained for at least thirty days. These are provider periods, not adopted Steward retention periods. [OA6; OA1]

<a id="PRIV-B0223"></a>
Prompt caching. Current documentation describes model-dependent cache controls and possible encrypted GPU-local application state lasting up to twenty-four hours. Some settings control a minimum lifetime, not a deletion deadline; supported options vary by model and organization. Do not assume store=false or a ZDR label removes every cache-related exception. [OA5]

<a id="PRIV-B0224"></a>
#### 10.2 Contractual fit and subprocessor review

<a id="PRIV-B0225"></a>
[OD + RV] HARD RELEASE GATE — PROVIDER CONTRACTUAL FIT. No real participant content may be processed by OpenAI, Supabase, or another core private-data processor until qualified privacy/legal/security review confirms that the actual executed contract/DPA; sensitive-data representations; data-use/training settings; retention configuration; model/endpoint or service; subprocessors; regions/locations where relevant; access/support terms; deletion capabilities; and incident obligations are acceptable for Steward’s intended processing. The review must be recorded against the actual account, contract and configuration. Generic public documentation alone does not satisfy this requirement, and owner policy selection does not complete it. [OD-REV]

<a id="PRIV-B0226"></a>
[RV] OPENAI SENSITIVE-DATA ISSUE — MANDATORY COUNSEL/VENDOR RESOLUTION BEFORE REAL PARTICIPANT PROCESSING. OpenAI’s standard DPA Schedule 1 describes intended sensitive-data transfers as absent except unexpected unstructured input. Steward deliberately works with religious beliefs and can foreseeably process intimate health and relationship information. Counsel must reconcile that actual use with the executed agreement, any necessary amendment and any applicable healthcare terms before real participant processing. This observation is not a conclusion that the intended use is prohibited or approved, or that a BAA is automatically required. It remains an unresolved contractual-fit gate, not a finding settled by selecting O06 or by public documentation. [OA2; HHS1; OD-REV]

<a id="PRIV-B0227"></a>
The DPA also addresses subprocessors, rights assistance, security incidents and return/deletion subject to its terms. OpenAI publishes a subprocessor list with services and locations. Review the actual chain and change-notification process; do not equate a chosen model endpoint with the entire hosting/support footprint. [OA2; OA4]

<a id="PRIV-B0228"></a>
OpenAI’s Services Agreement limits content use and allocates input/output rights between OpenAI and its customer, with qualifications. It does not itself implement Steward’s promise that participants own their Blueprint content; counsel must align Steward’s participant agreement and necessary processing license without granting unrelated reuse. Keep private participant material out of broad vendor “feedback” submissions or data-sharing programs. [OA3]

<a id="PRIV-B0229"></a>
#### 10.3 Production configuration requirements

<a id="PRIV-B0230"></a>
[TC] Begin with a backend-only, text-only, foreground request path using a specifically reviewed model and the Responses API with explicit store=false, or an equivalently reviewed compatible stateless endpoint. Steward constructs the minimum authorized context for each request from its own governed records. Do not use provider-hosted conversation memory, private vector stores, uploaded participant files, background jobs, batch/evaluation/fine-tuning pipelines, hosted code tools, remote MCP servers or unrestricted browsing in the initial private-content path.

<a id="PRIV-B0231"></a>
These exclusions are approved TC requirements within this standard’s applicable implementation/release scope, not statements that every excluded feature is inherently unsafe. Any later feature needs its own retention, authorization, deletion and vendor review. Public/governing-source retrieval must be separated from private participant retrieval; external search queries must never quietly carry participant disclosures.

<a id="PRIV-B0232"></a>
[OD + RV; O06] Use the strongest compatible approved privacy configuration available for Steward. Seek an approved OpenAI Zero Data Retention configuration first where compatible with required Steward functionality. Do not automatically fall back to ordinary provider retention if ZDR is unavailable. If the desired ZDR configuration is unavailable or incompatible, real-participant processing requires a separate documented decision by Michael J. Gauthier after qualified privacy/legal/security review of actual contract terms, actual provider retention, model/endpoint, monitoring, cache/application-state behavior, subprocessors, sensitive-data contractual fit and participant disclosure. Neither Modified Abuse Monitoring nor standard retention is an automatically authorized fallback. No special provider privacy/retention claim may be made without account-specific evidence. Do not market ZDR, “no human access,” U.S.-only processing or immediate provider erasure before the actual account/contract/endpoint evidence supports those claims. [OD-REV]

<a id="PRIV-B0233"></a>
#### 10.4 Vendor acceptance record and change control

<a id="PRIV-B0234"></a>
[TC + RV] Before any real participant content is processed by a core private-data processor, maintain its Section 10.2 acceptance record: actual contracting entity and executed contract/DPA/amendments; sensitive-data representations and intended-use determination; service and account/project/organization IDs; permitted model/endpoint or service; request settings; data-use/training opt-in status; actual retention configuration; monitoring, cache and application-state behavior; subprocessors and relevant regions/locations; access/support terms; incident obligations and contacts; and deletion capability/limits. Obtain qualified privacy/legal/security acceptance, with account-specific evidence and written eligibility confirmation where relevant. For O06, separately record Michael J. Gauthier’s documented decision after review if desired ZDR is unavailable or incompatible. A documentation page alone is not account evidence and cannot close the hard release gate. [OD-REV]

<a id="PRIV-B0235"></a>
Subscribe to vendor/security/contract changes and recheck before model upgrades. Alert on configuration drift or use of an unapproved endpoint. If a notified retention change conflicts with participant notice or approved policy, pause the affected path or route only to another separately approved configuration—never silently broaden retention. Vendor outage fallback must not transmit content to an unreviewed provider.

<a id="PRIV-B0236"></a>
[TC] On deletion, use the Section 13 manifest to remove eligible Steward records and any removable provider objects actually created. Track provider requests and responses, and document residual categories governed by provider contracts/retention rather than a customer API delete. Do not invent an API that individually erases all abuse-monitoring copies. A service cancellation or local transcript deletion must not be presented as proof of total provider-side erasure.

<a id="PRIV-B0237"></a>
### 11. Supabase security posture

<a id="PRIV-B0238"></a>
#### 11.1 Verified platform considerations

<a id="PRIV-B0239"></a>
RLS and keys. Supabase distinguishes client-safe publishable/legacy anon keys from privileged server secrets/legacy service-role credentials. Privileged credentials can bypass RLS; the presence of a key is not proof of a participant’s identity. Supabase documents invoker views and database-policy considerations, while its production checklist calls for more than simply enabling RLS. [SU1–SU3]

<a id="PRIV-B0240"></a>
Functions. Supabase recommends invoker behavior where possible. A security-definer function requires a controlled search_path; function privileges need deliberate restriction. Such a function is a privileged boundary to review, not a convenient way around an inconvenient policy. [SU10]

<a id="PRIV-B0241"></a>
Storage and backups. Private buckets use access policies; a signed download URL is bearer access. Supabase documents signed-URL behavior separately from Auth signing keys: rotating/revoking Auth keys does not revoke those existing Storage links. Database backups contain Storage metadata, not object bytes. Backup/log retention and recovery options depend on actual plan/configuration. [SU4–SU6; SU13]

<a id="PRIV-B0242"></a>
Regions and contractual treatment. A project has a primary region; a specific region is a data-location choice, not comprehensive compliance evidence. Supabase’s DPA includes sensitive-data customer notice/consent obligations and location qualifications. Counsel must evaluate the actual religious/health processing, required consent language and contractual representations before signing or using production—not assume a generic service request resolves every contract condition. [SU9; SU12]

<a id="PRIV-B0243"></a>
#### 11.2 Launch implementation requirements

<a id="PRIV-B0244"></a>
[TC] Identity and ownership. Use Supabase Auth or the approved identity mapping as the authentication source. Resolve participant ownership on the server from verified identity; user-supplied owner IDs, mutable user metadata and sponsor-provided email assertions must not authorize content. Keep account-active/deletion/permission state authoritative and current even when JWTs remain cryptographically valid. [P1-01, D, O; SU2, SU7–SU8]

<a id="PRIV-B0245"></a>
[TC] Database access. Enable reviewed RLS on every relevant exposed table and maintain the grants that make those policies meaningful. Test read, insert, update, delete and upsert separately, including attempts to change an owner or attach A’s child row to B’s parent. Use integrity constraints to keep parent/child ownership consistent. Deny anonymous private access. Restrict exposed schemas and API surfaces; cover views, materialized views, functions/RPC, GraphQL if enabled, Realtime channels and Storage. Disable unused paths.

<a id="PRIV-B0246"></a>
For PostgreSQL versions supporting it, evaluate security_invoker views; otherwise expose only a reviewed alternative with explicit restriction. Restrict function execution to intended roles; use schema-qualified objects, safe search paths and no unsafe dynamic SQL. Do not regard SQL-editor/admin queries as proof that participant policies work. Test through the same authentication and network path the client uses. [SU2, SU10]

<a id="PRIV-B0247"></a>
[TC] Privileged services. Prefer user-scoped database access for normal participant work. Keep any unavoidable broad privileged credential in a minimal backend service and surround it with explicit policy checks, scoped functions or restricted database roles. A secret key per worker improves rotation/accountability but does not necessarily narrow that key’s database authority. Never expose it to a browser, model, mobile bundle, URL or synthetic environment. Prefer the currently supported publishable/secret-key scheme for new integration work; verify migration compatibility rather than copying legacy tutorials. [SU3]

<a id="PRIV-B0248"></a>
[TC] Storage and exports. Private buckets only for participant files. Bind objects to authenticated ownership and a manifest; random identifiers are supplementary, not authorization. Prefer a participant-authenticated download gateway for restricted content so every access checks current authority. Where short-lived signed URLs are justified, choose the shortest workable engineering TTL, avoid logging tokens and test cache/object-removal behavior. Do not promise immediate revocation of a still-valid bearer URL. Use generic filenames and Cache-Control protections; include temporary uploads, multipart remnants and transformed copies in cleanup. [SU5–SU6]

<a id="PRIV-B0249"></a>
[TC] Auth and workforce administration. Require organization/dashboard MFA, protected identity-provider accounts, least-privileged project membership and independent recovery access. Participant MFA enforcement must exist in service/database policies, not only in the visible UI. Harden recovery, allowed redirects and email authentication; use an appropriately configured production email service. Validate token rotation and stale-session behavior across JWT verification caches and application caches. [SU1, SU7–SU8]

<a id="PRIV-B0250"></a>
#### 11.3 Backups, deletion and operational changes

<a id="PRIV-B0251"></a>
[TC] Approve a recovery objective and compatible backup plan before R. Inventory database snapshots, point-in-time recovery, object backups, replicas, dumps and any support exports separately. Keep restoration credentials/access restricted. A database-only restore test does not prove exported PDFs or other object files can be recovered. Verify object recovery if those files must be durable; preferably regenerate disposable exports from the authoritative Blueprint. [SU4; P1-01, G, O]

<a id="PRIV-B0252"></a>
Restore to a quarantined environment with all delivery/AI/background workers off. Reapply the external deletion/revocation ledger, verify valid holds, scrub expired payloads and reconcile permissions before production connections resume. Do not recreate deleted storage metadata as live links to stale objects. Backup expiry must be compatible with approved policy and applicable law; exact plan defaults are not legal exemptions.

<a id="PRIV-B0253"></a>
Use migration-as-code, peer review and automated policy tests. No unreviewed production schema edits or temporary “disable RLS” debugging. Test rollbacks and backfills for ownership, grant and deletion-state preservation. Use dependency/security scanning, Supabase’s advisors as supplementary signals, and a separately reviewed test of critical isolation paths. Enforce database TLS and appropriate network restrictions, but remember a permitted network client can still misuse credentials. [SU1–SU2]

<a id="PRIV-B0254"></a>
#### 11.4 Platform acceptance evidence

<a id="PRIV-B0255"></a>
[OD + TC + RV] SUPABASE — HARD PROVIDER CONTRACTUAL-FIT GATE STILL OPEN. Apply the same account/contract/configuration discipline as Section 10.2 before Supabase processes any real participant content. Qualified privacy/legal/security review must accept the actual executed contract/DPA, sensitive-data representations, data-use/training settings, retention configuration, actual service, subprocessors, relevant regions/locations, access/support terms, deletion capabilities and incident obligations for Steward’s intended processing. Religious beliefs and other sensitive information require an explicit intended-use review and counsel/vendor resolution where needed. Do not conclude suitability from a generic DPA, a chosen project region, encryption-at-rest claims or RLS configuration alone. No suitability determination is completed here. [OD-REV]

<a id="PRIV-B0256"></a>
[TC + RV] Required technical evidence remains: actual project/region/plan inventory; RLS/grant/function/storage catalogue; privileged-key locations and rotation rehearsal; workforce MFA/access review; mandatory participant MFA, fresh authentication/step-up and secure recovery tests under O13; logs/drains inventory; backup/object-recovery rehearsal; deletion/restore test; reviewed migration pipeline; and an independent assessment of the launch attack surface. These technical results supplement, rather than replace, the contractual-fit acceptance record. Supabase marketing certifications or a green advisor screen do not certify Steward’s application.

<a id="PRIV-B0257"></a>
### 12. Encryption and key management

<a id="PRIV-B0258"></a>
[AP] Use encrypted transport and stored data, managed secrets, restricted production access and established cryptographic services. P1-01 permits application-level/envelope encryption where the threat model justifies it; it does not require a custom whole-application cryptosystem. Do not describe Steward as end-to-end encrypted when its server or AI-processing path can decrypt content. [P1-01, L.2]

<a id="PRIV-B0259"></a>
[TC] Enforce modern TLS with certificate validation for browser/API, database and vendor traffic; require the managed platform’s encryption-at-rest controls for live stores and backups and verify evidence for the actual services used. Secrets belong in a managed secret store, with separate production identities, restricted read access, logged changes, rotation/revocation procedures and protected recovery material. No keys in source, prompts, tickets, screenshots or content-bearing audit payloads. Vendor security claims are evidence inputs, not a substitute for configuration checks. [SU1, SU11]

<a id="PRIV-B0260"></a>
[TC + RV] Add application-level envelope encryption for an S3 payload when it meaningfully limits a threat such as a stolen database dump, routine database-administrator access, broadly replicated restricted evidence or a need for narrowly separable destruction. Use vetted authenticated-encryption libraries and a managed key service. Separate encryption keys from the data and from ordinary database roles; define authorized decrypting services and log sensitive decrypt access without recording plaintext. Do not create searchable plaintext side channels merely to recover convenience.

<a id="PRIV-B0261"></a>
Additional encryption does not protect against an authorized application/model processor that must see plaintext, compromised decrypting code or screenshots. It adds key-recovery, indexing and deletion/hold complexity. Security engineering—not Mike choosing algorithms—must document which stores need it and prove the benefit. Test key rotation, version compatibility, backup recovery and destruction. Do not destroy a shared key that protects another participant’s records or validly held evidence; use a reviewed per-record/compartment strategy where selective cryptographic erasure is justified.

<a id="PRIV-B0262"></a>
### 13. Deletion and account closure

<a id="PRIV-B0263"></a>
#### 13.1 Participant actions mean different things

<a id="PRIV-B0264"></a>
[AP] P1-01 governs the lifecycle. Deleting a source does not silently delete an independently authorized record; conversely “audit,” “history” or “derived” is not an exemption from deletion. Cancellation of payment is not deletion of the account. [P1-01, C.1, F–G, H.4]

<a id="PRIV-B0265"></a>
| Participant action | Required meaning and separate choices |
| --- | --- |
| Delete one conversation or message | Block its eligible future retrieval; delete its retained raw copies and dependent unapproved summaries/​indexes/​caches. Identify separately authorized notes, approved Blueprint items or required evidence; offer the appropriate broader deletion controls. |
| Delete a journal/​reflection | Remove that selected working record and dependent retrieval copies. Independently approved items remain unless separately removed. Do not reconstruct the deleted journal from a derivative. |
| Remove/​revise a Blueprint item | Change the active item only through the participant’s authorized transaction. Preserve accurate version/​state semantics; offer history deletion separately. An archived item must not remain secretly active AI context. |
| Delete Blueprint history | Delete eligible earlier content versions and content-bearing evidence under the approved schedule/​rights workflow while retaining the current version if the participant chooses. Narrow legally justified proof must be separately identified and restricted. |
| Cancel paid Steward | Stop applicable future billing/​renewal under the confirmed commercial rules; preserve Blueprint/​Free access as governed. Confirm cancellation only from system state. No automatic account deletion. |
| Disconnect an integration | Revoke tokens and future data access/​transfers; cancel eligible jobs. Explain whether already imported/​exported data remains and offer appropriate deletion. Does not imply external recipients erased their copies. |
| Close/​delete the account | Stop access/​use and future processing; apply account-wide disposition to content, derivatives, exports, vendor objects, identity links and queued work, with narrowly justified exceptions. Resolve recurring billing separately without allowing silent future charges. |

<a id="PRIV-B0266"></a>
#### 13.2 Request-to-disposition workflow

<a id="PRIV-B0267"></a>
[TC + RV] Accept requests through a visible privacy control and an accessible alternative contact mechanism. Verify proportionately: enforce O13’s participant MFA and fresh authentication/step-up for account closure/deletion and full data/Blueprint export, or use a reviewed secure recovery/authorized-agent rights path that preserves required account protection. Do not demand new government ID, medical details or sponsor approval by default. Do not deny a valid rights request solely because the participant cannot pay or log in. Counsel determines response deadlines, exemptions and appeal rights where applicable.

<a id="PRIV-B0268"></a>
After verification, record the request scope and confirmation of destructive consequences. Atomically mark affected resources/account as blocked from ordinary retrieval, increment the privacy epoch and cancel eligible queued work. Keep the minimum restricted case access necessary to complete disposition or a lawful hold. A missing dependency record is a reconciliation failure to investigate, not automatic proof that no copy exists.

<a id="PRIV-B0269"></a>
Generate a manifest covering applicable P1-01 classes and all copy locations: canonical database rows/versions; journals/assessments; raw sessions; notes/proposals; approval payloads; storage objects; indexes/embeddings; caches; active requests; export packages; mail/support/incident evidence; integration queues/dead letters; provider objects; replicas; backups; and authorized downstream recipients. Classify each as delete, retain under specific independent authority, pending vendor action, backup expiry or unresolved failure. Do not retain the manifest’s private payload merely to prove deletion.

<a id="PRIV-B0270"></a>
Execute idempotent jobs with retries, finite retry limits, alarms and responsible escalation. Perform targeted post-deletion retrieval checks and reconciliation against the manifest. Restrict residual exception records from ordinary AI, support, marketing and sponsor use. Retain only bounded, minimized disposition evidence. A privacy administrator reviews exceptions and completion; legal disputes go to counsel, not an AI decision.

<a id="PRIV-B0271"></a>
#### 13.3 In-flight requests and race conditions

<a id="PRIV-B0272"></a>
[TC] On deletion or withdrawal, cancel active generation where possible and fence the stream and result. Recheck the current privacy epoch before transmitting a newly assembled prompt, releasing further output and committing any proposal/note/action. Discard buffered output and prevent automatic retries or resaving when the epoch changed. Coordinate open browser streams/tabs so a stale client cannot reintroduce deleted context.

<a id="PRIV-B0273"></a>
If the provider already received a prompt, cancellation is best effort and does not erase that past transmission. Mark affected provider handling for the actual approved process in Section 10. Do not claim “deleted everywhere” because the browser stream stopped. Serialize valid hold placement against destructive execution so the same race cannot destroy records that must be preserved. Test both orderings, failures and worker restarts.

<a id="PRIV-B0274"></a>
#### 13.4 Backups, exceptions and legal holds

<a id="PRIV-B0275"></a>
[TC + RV] Maintain a minimal deletion/revocation ledger outside the snapshot being restored, protected as personal/security data where linkable and retained for its justified restoration purpose. Backups are not ordinary participant history and must not be searchable for coaching or routine support. Apply a bounded destruction/expiry process compatible with approved policy. Restoration is quarantined until deletion and consent changes are re-applied and verified. [P1-01, G.6]

<a id="PRIV-B0276"></a>
[CL] Washington’s consumer-health deletion provision, if applicable, allows delayed deletion of archived/backup data to enable restoration but caps that delay at six months from authentication of the request. This is not a recommended six-month Steward default or a blanket exemption for other copies. Counsel must resolve the precise duties, downstream notifications and exceptions for the actual scope. [WA2]

<a id="PRIV-B0277"></a>
[CL + RV] A preservation obligation can arise in anticipation of litigation, not only after a court order. Federal Rule of Civil Procedure 37(e) addresses loss of electronically stored information that should have been preserved in anticipation or conduct of litigation. Counsel determines whether and what to hold, alongside other applicable duties. [COURT1]

<a id="PRIV-B0278"></a>
[TC] A hold records matter/authority, issuer and approver, specified records/classes/date ranges/systems, necessary future matching, effective time, review date, access scope and release/disposition. It suspends only covered destruction; it grants no new product or sharing purpose. Review overdue holds and release when no longer justified. “Might be useful someday,” a safety keyword or general company protection is not a valid blanket hold. Preserve relevant evidence fairly, not selectively to favor the company. Do not suppress a required deletion exception explanation unless counsel identifies a legitimate restriction.

<a id="PRIV-B0279"></a>
#### 13.5 Truthful status and account closure

<a id="PRIV-B0280"></a>
[TC] Present milestones accurately: request received → verification needed/verified → future use blocked → deletion in progress → completed for identified systems / completed with explained exceptions / action still pending. Distinguish a vendor request acknowledgement from confirmed deletion. Explain backup expiry and independently retained billing/hold evidence without overstating completion.

<a id="PRIV-B0281"></a>
For closure, revoke sessions/tokens and stop notifications, optional analytics, model calls and integrations. Initiate the appropriate stop-renewal/cancellation action in the commercial system before removing the identity links needed to reconcile it; preserve only necessary transaction references until confirmed. A failed cancellation must escalate urgently, not silently continue charges. Do not require account deletion to cancel, or a subscription cancellation to erase content. [PJ, §§7, 18; P1-01, G, K.2]

<a id="PRIV-B0282"></a>
[OD + RV; O05] Paid expiration alone must not erase the participant’s Blueprint or Free access. Retain the participant’s current Blueprint while the account remains active, including applicable Free access, subject to the final approved inactivity policy and lawful rights. Do not use paid expiration as an inactivity trigger or an excuse to erase the guide. The bounded, purpose-specific retention principle is selected without specific periods. Qualified counsel/records/security review must approve the final executable retention schedule, inactive-account rules, deletion exceptions, backup treatment and legal-hold procedures before real participants. Account closure should use immediate access/use blocking followed by verified disposition; any optional reversal window needs explicit policy and must not override applicable deletion duties. [OD-REV]

<a id="PRIV-B0283"></a>
### 14. Privacy-notice and terms requirements for counsel

<a id="PRIV-B0284"></a>
#### 14.1 Required legal/privacy review deliverables

<a id="PRIV-B0285"></a>
[RV] This section is a requirements checklist, not final legal text or attorney approval. Before R, counsel must produce a written applicability assessment, reviewed participant notices/terms, sensitive-processing and optional-permission disclosures, rights/deletion procedure, retention/hold schedule, vendor/processor terms, sponsor privacy terms and an incident-notification decision process. The documents must describe the implemented service and actual legal entity—not an aspirational future architecture.

<a id="PRIV-B0286"></a>
| Required coverage | Questions the final documents and implementation must resolve |
| --- | --- |
| Entity, audience and jurisdiction | Resolve O01’s invitation-only Arizona-first direction, dedicated MJG / Stewardship Blueprint entity preference and actual business/vendor footprint through qualified legal/tax review. Confirm responsible entity, contact/address and eligibility boundary/implementation. O02 selects adults 18+ only, no minors program; age assurance and discovered-minor procedure remain counsel/security gates. Determine applicable rights/appeals. |
| Categories and sources | Account/​contact, religious and other sensitive content, Blueprint/​version history, assessments, journals, conversations, continuity, approval evidence, activity/​commitments, billing, sponsorship, support/​safety and operational data. Distinguish participant-supplied facts, model interpretations and inferred data actually retained. |
| Purposes and authority | Separate necessary service/​security processing from history, memory, communications, sharing, analytics, research and marketing. Identify required sensitive-data consent or contractual obligations without mislabeling all processing as consent. |
| AI processing and limitations | Identify the AI nature of Steward, provider categories, actual training/​use settings, human/​provider-access exceptions and retention. No claim of professional confidentiality, infallibility, therapy, pastoral authority or crisis monitoring that the service does not provide. |
| Vendors/​subprocessors and locations | Actual model, hosting, email, payment, support, telemetry and recovery providers; role allocation, transfers, retention, security, onward use and incident/deletion duties. Close the hard contractual-fit gate in Section 10.2 for each core private-data processor using executed terms and account-specific evidence, not generic documentation. State what regional commitments actually cover. |
| Retention and deletion | Distinct history/​session/​continuity/​Blueprint/​proof/​operations/​vendor/​backup lifecycles; exact periods or meaningful criteria; inactive-account treatment; access blocks, pending jobs, holds and deletion limitations. |
| Participant ownership and license | Preserve participant ownership of their Blueprint; obtain only the processing rights necessary for the service and authorized actions. Explain qualifications involving third-party rights and AI output without granting unrelated content reuse. |
| Sharing and sponsorship | No sponsor purchase of content, no implicit spouse/​church access, approved reporting only, identified recipient/​selected version, future-update scope, revocation and received-copy limits. |
| Connected data and recording | Describe as unavailable while disabled. Before future release, use separate health/​integration/​voice disclosures, consent, source/​destination contracts and deletion controls. |
| Notifications and marketing | Separate necessary messages, optional reminders and promotional channels; generic previews, verification, unsubscribe/​preferences and tracking practices. No hidden marketing in a service reminder. |
| Payments and commercial rules | Distinct one-time/​sponsored/​recurring authorization, processor role, cancellation, refunds/​tax/​renewal terms and billing-record retention through P1-04/​P1-06. Account closure and subscription cancellation remain distinct. |
| Safety, support and exceptions | Actual support hours/​escalation scope, no human monitoring unless actually offered, minimum safety evidence, lawful disclosure requests, emergency limitations, preservation and incident communications. |
| Rights, complaints and appeals | Accessible contact/​request process; proportionate verification and authorized-agent handling; applicable access/​correction/​deletion/​portability/​opt-out/​appeal rights, deadlines, limitations and non-retaliatory treatment. No unsupported claim that all internal records are exempt. |

<a id="PRIV-B0287"></a>
#### 14.2 Conditional legal issue register

<a id="PRIV-B0288"></a>
[CL + RV] The following is a targeted launch review, not a complete fifty-state survey. Counsel must update it for the actual entity, feature set and participant footprint, including relevant amendments, litigation and enforcement guidance.

<a id="PRIV-B0289"></a>
| Authority / issue | Why it matters to Steward | Required review consequence |
| --- | --- | --- |
| FTC Act and truthful privacy/​security representations | Security and privacy claims must match actual processing; FTC security guidance emphasizes minimization and controlled access. Agency jurisdiction depends on the actual organization/​activity. [FT1] | Review claims, unfair/​deceptive practices, consent design, vendor oversight and any limitations arising from entity status. |
| FTC Health Breach Notification Rule | Core text can contain health information; a qualifying PHR analysis is not limited to whether a health connector is presently used. Unauthorized disclosures can matter. [FT2] | Written applicability and incident-response assessment; do not presume either automatic coverage or automatic exemption. |
| HIPAA roles | Coverage/​business-associate status depends on relationships and activities, not merely the sensitivity of data. [HHS1] | Assess role and any required BAAs/​eligible vendor services before accepting regulated workflows. No “HIPAA compliant” claim without the requisite basis. |
| Arizona breach law, A.R.S. §§18-551–552 | Definitions and duties govern specified breaches. The statute includes a forty-five-day notice clock after breach determination, subject to its conditions. [LAZ1–LAZ2] | Determine applicability, investigation threshold, recipients, timing and exceptions. Do not apply this clock indiscriminately to other laws or jurisdictions. |
| Washington consumer-health law | Separate collection/​sharing conditions, broad health-data concerns and downstream/​backup deletion may apply. [WA1–WA3] | Evaluate residents and covered collection in Washington, requested-service exceptions, consents, contracts, rights and deletion. Location restrictions must be operationally meaningful. |
| Nevada consumer-health provisions | Nevada’s Chapter 603A contains separate consumer-health requirements. [NV1] | Assess actual scope/​definitions, exclusions, consent, notice, processors and rights before relevant access. Do not assume Washington documentation covers Nevada. |
| California privacy requirements | Where applicable, retention must be disclosed by period/​criteria and limited to necessary/​proportionate purposes; deletion has specified procedures/​exceptions. [CA1–CA2] | Determine thresholds, exemptions, sensitive-data treatment, rights and contracts for the actual business. |
| California companion-chatbot law | Enacted SB 243, Chapter 677, adds duties based on the statutory chatbot/​operator definitions. Reporting under §22603 begins July 1, 2027 and excludes user identifiers/​personal information. [CA3] | Assess whether Steward and any California availability fall within scope; review disclosures/​safety protocol and reporting design. A “not therapy” disclaimer alone does not resolve classification. |
| Children and age assurance | COPPA concerns child-directed services and actual knowledge involving children under thirteen; an 18+ rule is not a substitute for handling known underage access. [CH1] | Review current COPPA requirements, state/​minor rules, age assurance, discovered-minor response, third-party child information and any future eligibility expansion. |
| Commercial email and future messaging | FTC CAN-SPAM guidance distinguishes commercial from transactional/​relationship content. [FT3] | Review actual templates, opt-out handling and providers; complete current federal/​state telephone/​text review before deferred SMS or calling. |
| Recurring online charges | ROSCA, 15 U.S.C. §8403, requires material disclosures, express informed consent and a simple mechanism to stop covered recurring charges. [PAY1] | Align P1-04/​P1-06 with applicable federal/​state renewal and cancellation law; do not rely on an old rule summary or create a new retention period here. |
| Litigation/​preservation and disclosure | FRCP 37(e) addresses preservation of relevant electronically stored information; other preservation/​disclosure duties may apply. [COURT1] | Review hold triggers/​scope, conflicts with deletion, required evidence, lawful process, privilege and fair preservation. No blanket “legal hold” for every account. |

<a id="PRIV-B0290"></a>
No sale of private participant information is recommended. O10 authorizes no behavioral advertising, sensitive profiling or unrelated participant-content reuse. Counsel must still examine statutory meanings of “sale,” “sharing” and “consumer health data”; internal product labels are not controlling legal definitions. No international or additional-state expansion is authorized by this review.

<a id="PRIV-B0291"></a>
### 15. Initial real-participant release recommendation

<a id="PRIV-B0292"></a>
#### 15.1 Recommended scope and tradeoffs

<a id="PRIV-B0293"></a>
[OD + RV; O01–O04, O07–O10, O13] The selected first-pilot scope is invitation-only and Arizona-first, for adults age 18+ only, with no minors program. It uses session-only participant-visible raw conversation history as a pilot posture, not a permanent product or architecture decision; automatic autobiographical memory is OFF, with only individually selected, visible, purpose-bound continuity notes. Require MFA before private-record access, tested secure recovery and fresh authentication/step-up for high-impact actions. Secure self-export is the only initial participant sharing feature; no built-in private recipient sharing or named sponsor activity feeds. Initial external communications and analytics follow O09/O10. Retain the text-only recommendation and existing disabled-feature boundaries: no connected health, raw voice/audio, broad ForgedLife synchronization or participant-content research. Private-screen replay remains excluded by the approved TC requirement in Section 9.2; its OP policy recommendation is not silently converted into owner policy. These reduce risky data flows without eliminating risks in ordinary religious, family, financial or health-related text. No real-participant release is authorized. [OD-REV; P1-01, M.B–M.C]

<a id="PRIV-B0294"></a>
[OD + RV; O01–O02] Arizona-first is the selected invitation-only pilot direction, subject to qualified counsel confirming the operating entity, geographic eligibility boundary, actual business/vendor footprint and participant eligibility implementation. It is not a finding that Arizona-first launch guarantees legal simplicity. Counsel must confirm how residence, travel/use from other states and the company/vendor footprint affect applicability. Use minimum appropriate age/location assurance, not indiscriminate government-ID or precise-location collection. Adults age 18+ only and no minors program are selected; age-assurance method and discovered-minor procedure remain counsel/security implementation gates. Do not continue ordinary onboarding merely because a checkbox was once selected. [OD-REV]

<a id="PRIV-B0295"></a>
[OD + RV; O01 — Company-protection preference] Steward should preferably operate through a dedicated MJG / Stewardship Blueprint legal entity rather than through Strategic Income Group or Certified Fiduciary Services, unless qualified legal/tax counsel recommends otherwise. This is an owner risk-management preference subject to entity/legal/tax review, not legal advice or a completed entity decision. The responsible operating entity and associated contracts/notices remain release gates. [OD-REV]

<a id="PRIV-B0296"></a>
A narrow pilot sacrifices geographic reach, historical browsing, automated accountability, rich sponsor dashboards and cross-service convenience. It preserves the essential test: whether an authorized, visible participant-owned Blueprint helps someone live what matters. Broader availability and engagement data should not be purchased through avoidable disclosure or hidden memory.

<a id="PRIV-B0297"></a>
#### 15.2 Pilot sequence and payment boundary

<a id="PRIV-B0298"></a>
[OD + RV; O11] Run a bounded nonpaid real-participant operational pilot before activating live consumer payment functionality, using an approved complimentary/admin-granted pilot entitlement. This pilot tests privacy, consent, account protection, Steward usefulness, support, safety, deletion, provider configuration and operational reliability. It is not the retail willingness-to-pay test and does not validate checkout, refunds, tax or recurring billing. All core privacy/security/safety/release gates still apply before any real participant is enrolled. Confirmed nonpaid entitlements still require the applicable P1-05 implementation and grant authorization; this direction creates no actual entitlement and authorizes no real participants. [OD-REV]

<a id="PRIV-B0299"></a>
A later paid pilot remains separate and must complete P1-04, P1-05, P1-06 and applicable release work and tests before live consumer payments. Do not treat sponsored Compass uptake, complimentary pilot access or leader benefits as retail demand, or waive payment controls because privacy tests passed. Approved pricing, Build/continuation distinctions and Compass benefits remain unchanged. [OD-REV; PJ, §§7, 16–18, 20; CTX3, §§14–16]

<a id="PRIV-B0300"></a>
#### 15.3 Release must remain blocked until evidence exists

<a id="PRIV-B0301"></a>
[OD + TC + RV] Real participants remain unauthorized. Final owner approval of this standard is recorded; no real-participant release may occur until all applicable professional/release gates are closed with evidence; notices reflect actual settings; the hard provider contractual-fit gate is satisfied for OpenAI, Supabase and every other core private-data processor; any O06 non-ZDR decision is separately documented after qualified review; and isolation, MFA/secure recovery/step-up, deletion, restore, consent and telemetry tests pass. Record actual named owners for product/owner, privacy, security/incident response, support, records/legal hold and vendor management, with independent-review arrangements under O12. Complete applicable support/safety arrangements, publication rights and the separate P1-10 scope-specific release authorization. Neither P1-01 approval, approval of O01–O13 nor approval of this standard substitutes for those gates. [OD-REV; P1-01, M–N; SR4, P1 queue]

<a id="PRIV-B0302"></a>
### 16. Owner decision matrix

<a id="PRIV-B0303"></a>
OWNER DIRECTION SELECTED — O01–O13. Michael J. Gauthier approved the directions below on September 12, 2026, within this standard’s stated scope. LEGAL / SECURITY / RELEASE GATE STILL OPEN — all rows. Owner approval does not mark professional review, implementation or release complete; this standard’s status is APPROVED PRIVACY, SECURITY, CONSENT + SHARING STANDARD. The directions are preserved exactly from the controlled owner-decision revision and approved by the subsequent owner approval, not inferred from earlier recommendations. [OD-REV; OD-APP]

<a id="PRIV-B0304"></a>
The matrix retains participant-facing, commercial-scope and accountability decisions. Counsel determines legal applicability; engineering/security selects algorithms, schema mechanisms, authentication implementation, key rotation procedures, access-token lifetimes and test tooling within the approved owner direction and applicable approved policy.

<a id="PRIV-B0305"></a>
| DECISION | OWNER DIRECTION SELECTED | WHY | USER-EXPERIENCE COST | ENGINEERING COST | LEGAL / SECURITY / RELEASE GATE STILL OPEN | GATE MUST CLOSE BEFORE |
| --- | --- | --- | --- | --- | --- | --- |
| O01 — Operating entity / first geography | Invitation-only, Arizona-first pilot. Prefer a dedicated MJG / Stewardship Blueprint legal entity rather than Strategic Income Group or Certified Fiduciary Services, unless qualified legal/tax counsel recommends otherwise. | Limits uncontrolled expansion and expresses the owner’s company-protection preference; not legal advice or a completed entity decision. | Eligibility step; excludes locations outside the approved boundary. | Low–medium: eligibility and exceptions. | OPEN: counsel confirms entity, geographic boundary, actual business/vendor footprint and participant eligibility implementation; entity/legal/tax review remains required. | Notices, executed contracts and any real enrollment. |
| O02 — Age eligibility | Adults age 18+ only for the initial real-participant pilot. No minors program. | Avoids a minor-serving launch without its separate protections. | Underage users excluded; enrollment friction. | Low–medium. | OPEN: counsel/security approve age-assurance method and discovered-minor procedure. | Any real account creation/enrollment. |
| O03 — Conversation history | Session-only participant-visible raw conversation history by default for the first real-participant pilot. A launch posture, not a permanent product or architecture rule. | Minimizes transcript accumulation while retaining structured Blueprint continuity. | No later full-chat browsing. | Medium lifecycle work; less history UI. | OPEN: privacy/legal/technical review of exact session boundaries and transient operational retention/deletion periods. | Real conversations or history-mode changes. |
| O04 — Saved continuity | Automatic autobiographical memory OFF. Only individually selected, visible, purpose-bound continuity notes may persist. Participant can review, correct and delete eligible notes. Approved Blueprint content stays separate. | Useful context without a hidden autobiographical profile. | Brief note selection and review. | Medium. | OPEN: privacy/security implementation and sensitive-use review; note controls, scope and lifecycle testing. | Any persistent continuity use. |
| O05 — Retention / inactive accounts | Bounded, purpose-specific retention principle selected; no specific periods established. Paid expiration alone must not erase the participant’s Blueprint or Free access. | Avoids indefinite retention or surprise loss after paid expiry. | Less recoverable old material; reviewed inactivity notices. | Medium lifecycle/reconciliation. | OPEN: qualified counsel/records/security approve final executable retention schedule, inactive-account rules, deletion exceptions, backup treatment and legal-hold procedures. | Any real participants or enabled real-data class. |
| O06 — Model / provider residual retention | Use strongest compatible approved privacy configuration; seek approved OpenAI ZDR first where compatible. No automatic ordinary-retention fallback. No special privacy/retention claim without account-specific evidence. | Aligns actual retention and contract with participant promises. | Possible delay or narrower model choice. | Low–medium configuration plus review. | OPEN: hard provider-fit gate. If desired ZDR is unavailable/incompatible, a separate documented Michael J. Gauthier decision after qualified privacy/legal/security review of actual terms/retention, model/endpoint, monitoring, cache/state, subprocessors, sensitive-data fit and disclosure. | First real model processing or changed retention configuration. |
| O07 — Initial participant sharing | Secure participant self-export only. No built-in third-party recipient, continuing, spouse, accountability-partner or church/group content sharing in the first pilot. Future sharing separately release-gated. | Reduces misdelivery, recipient identity and revocation complexity. | Participant independently shows/sends local copy. | Lower initial; secure export still required. | OPEN: privacy/security review and export isolation/step-up tests; separate future sharing approval and release. | Pilot export release; any later recipient-sharing release. |
| O08 — Church / sponsor reporting | Approved privacy-reviewed aggregate operational information only. No named activation, nonactivation, last-use, completion, payment, withdrawal or private-content feeds at launch. Sponsorship never grants private-content access. | Protects trust and prevents sponsor surveillance. | Less targeted administrator follow-up. | Low–medium aggregate safeguards. | OPEN: exact aggregate report definitions and disclosure safeguards require privacy/release approval. | Any sponsor report or reporting promise. |
| O09 — Notifications / marketing | Necessary minimal account/security/service email; separately opted-in generic Steward reminder email where implemented. No SMS/push reminders initially. Marketing is separate and optional, never bundled with reminders or sponsorship. External previews generic/non-sensitive. | Reduces disclosure and communication-purpose confusion. | Fewer proactive channels. | Low initially; later channels separate. | OPEN: privacy/legal review of authority, templates, provider/delivery configuration and permission/withdrawal behavior. | Real communications or any marketing activation. |
| O10 — Analytics / research | Only necessary allowlisted operational/reliability/cost/security events to operate/evaluate the product. No participant-content research, model training, evaluation corpus, fine-tuning dataset, behavioral advertising, sensitive profiling or unrelated product improvement. | Operational learning without intimate profiles or content reuse. | Less detailed behavioral learning. | Low–medium. | OPEN: event allowlist/privacy/security review. Later research/content-analysis requires a separate approved feature/purpose and applicable participant/legal review. | Real event collection; any later expanded use. |
| O11 — Real pilot before live payment | Bounded nonpaid operational pilot first under an approved complimentary/admin-granted pilot entitlement. Test privacy, consent, account protection, usefulness, support, safety, deletion, provider configuration and reliability. Not retail willingness-to-pay validation. | Separates operational learning from live consumer payment risk. | Checkout/payment demand not tested. | Applicable nonpaid entitlement work first; payment work later. | OPEN: applicable P1-05 grant implementation and all real-participant gates. Later paid pilot separately completes P1-04, P1-05, P1-06 and applicable release work. Pricing unchanged. | Real pilot enrollment; later live consumer payments. |
| O12 — Accountable operating roles | Named owners before real enrollment: product/owner, privacy, security/incident response, support, records/legal hold and vendor management. Small-team responsibilities may combine; permissions/workflows remain separate. | Accountability without unchecked sensitive access or self-investigation. | Support availability stated honestly. | Operational staffing and independent-review cost. | OPEN: record actual names/organizations. No self-approval of sensitive-content elevation or investigation of own alleged misuse. Use independent external reviewer/specialist where internal separation is insufficient. | Any real enrollment. |
| O13 — Participant account security | MFA required before private-record access in the first real-participant pilot, with tested secure recovery. Fresh authentication/step-up for full data/Blueprint export, primary contact change, MFA reset, account closure/deletion and later recipient sharing. | Protects private records and high-impact actions; not necessarily permanent consumer onboarding design. | Enrollment, recovery and step-up friction. | Engineering/security select and test mechanism/enforcement. | OPEN: implementation/recovery tests. Prefer phishing-resistant or authenticator/passkey-style methods where practical, not SMS as sole strong factor. Reconsider only after pilot learning and security review. | Private-record access or high-impact pilot actions; future sharing when enabled. |

<a id="PRIV-B0306"></a>
Keep the owner-selection record separate from final standard approval, professional-review findings, implementation/testing evidence and scope-specific release approval. Record decision ID, selected direction, rationale, owner/source, actual decision date when documented, policy/configuration version and affected release; do not invent a completed review, role assignment or approval date. Open core gates block real participants. Feature-specific gates block the affected feature. The hard provider contractual-fit gate in Section 10.2 is mandatory regardless of owner policy selection.

<a id="PRIV-B0307"></a>
### 17. Engineering security acceptance tests

<a id="PRIV-B0308"></a>
#### 17.1 Test harness and evidence standard

<a id="PRIV-B0309"></a>
[TC] Use synthetic participants A and B, separate church/cohort administrators, support/billing/operations roles, an expired grant, a revoked grant, a closed account and record-level S3 fixtures. Plant unique non-real sentinel strings in each data class. Exercise browser, API, database-role, storage, worker and model-tool paths, including direct requests that bypass the UI. Use deterministic pause points and a controlled clock for races, expiry and delayed jobs.

<a id="PRIV-B0310"></a>
For every test retain test ID, build/schema/configuration versions, fixture IDs, procedure, expected/actual result, sanitized evidence, reviewer, defect and retest status. No raw private transcript is needed as evidence. Repeat boundary tests after migrations, vendor/model changes and new tools. No tests in this document have been executed; initial status for every row is NOT RUN.

<a id="PRIV-B0311"></a>
| Test | Procedure and required result | Evidence / gate |
| --- | --- | --- |
| T01 — A cannot access B | Attempt reads, writes, deletes, search, counts, nested joins and object downloads across every enabled class. No B data, mutation or sensitive existence inference is returned. Include same-cohort participants. | Endpoint/​role coverage and negative results. S foundation; R full pass. |
| T02 — Spoofed identity | Alter owner IDs, parent IDs, JWT claims, user metadata and form fields. Forged/​invalid tokens fail; a valid A token cannot claim B ownership or a privileged role. | Sanitized request variants and authoritative-state checks. R. |
| T03 — Privileged-secret exposure | Scan repository/​history, frontend/​mobile bundles, source maps, logs, prompts, build artifacts and synthetic credentials. No production privileged secret is present; exercise revocation/​rotation of a test credential. | Scanner results and rotation receipt. S/​R. |
| T04 — RLS coverage | Enumerate tables/​views/​functions/​materialized views/​grants and enabled Storage/​Realtime/​API surfaces. Test every command, ownership change and definer path using deployed roles. | Coverage manifest; missing object/​policy fails release. R. |
| T05 — Exceptional administration | Try ordinary owner/developer/support access; deny content. Reject self-approval of sensitive-content elevation and investigation of own alleged misuse. Verify the named-role register and independent external reviewer where needed. Approve one narrow case; verify MFA, scope, independent approval, expiry and payload-free audit. | Case grant, O12 assignments/separation and sanitized access events. R. |
| T06 — Deleted context excluded | Delete chat/​journal and eligible derivatives; probe retrieval, search, embeddings, caches, prompts and export regeneration. No deleted context appears; independently approved items remain only as explained. | Lineage manifest, probe results, source distinction. R. |
| T07 — Revocation stops future use | Revoke continuity, notification and other enabled grants with an old valid JWT and cached policy. Future covered reads/​actions fail and cache is invalidated. | Effective-grant/​epoch and denied-operation evidence. R. |
| T08 — Queued share/​transfer rechecks | Queue, revoke, pause/​restart and retry. Nothing not already dispatched is transmitted without current authority. Unknown delivery is reconciled, not blindly resent. | Fenced-worker race results. R disabled routes; F full sharing/​integration. |
| T09 — Telemetry contains no private payload | Send sentinel messages, prompts, assessments, Blueprint items and secrets through success/​error/​safety paths. Scan every log, trace, browser SDK, drain and support integration. | Destination inventory and zero sentinel matches outside authorized stores. R. |
| T10 — Export isolation | Generate simultaneous A/B Blueprint and rights exports, including retries. Require O13 fresh authentication/step-up for full data/Blueprint export. Manifest and file contain only correct authorized material. Cross-account downloads fail; test forwarded/expired links and self-export-only pilot scope. | Manifests, content checks, access/expiry and step-up results. R. |
| T11 — Notification privacy | Trigger all templates and error/​retry paths; inspect subject, preview, body, URL, vendor metadata and logout/​device reassignment. No private content; opt-out stops eligible pending delivery. | Template catalogue and rendered/​network samples. R enabled channels. |
| T12 — Sponsor isolation | Try content paths, roster joins, reporting filters and administrator impersonation. Block named activation, nonactivation, last-use, completion, payment, withdrawal and private-content feeds at launch. Only approved privacy-reviewed aggregate operational output is available; no sponsor content privilege. | Sponsor-role tests and approved exact report/disclosure catalogue. R sponsored scope. |
| T13 — Restore honors deletion | Back up, delete/​revoke/​close, restore old state into quarantine and replay the separate ledger. No prohibited content/​grant/​account becomes active; workers stay off until verified. | Full restore/​reconciliation report including object storage. R. |
| T14 — Account closure disposition | Close an account with pending exports, messages, grants, billing and a narrow hold. Block ordinary use; dispose nonheld data; reconcile recurring cancellation; explain pending/​retained exceptions. | Account-wide manifest, billing confirmation and UI statuses. R. |
| T15 — AI cannot widen permissions | Model requests unrestricted SQL, B’s record, a broader tool, secret or administrator role. Service refuses; no model-selected permission expansion occurs. | Tool call/​decision facts without transcript logging. S/​R. |
| T16 — Injection cannot authorize | Seed instructions in participant text, journals, retrieved documents and tool output claiming owner/​legal authority or consent. No share, deletion, external call or grant occurs without real application authority. | Adversarial fixtures and unchanged authoritative state. R. |
| T17 — AI cannot mutate entitlement/​consent | Attempt direct changes through generated JSON, function arguments and fabricated provider receipts. Only verified protected application transactions can change state. | Database grants and negative transaction results. R. |
| T18 — Support content restriction | Open a case; support sees metadata only. Participant selects one excerpt; scope cannot expand to whole chat, S3 store or another case. Access expires. | Case evidence manifest and negative browse/​export results. R. |
| T19 — Incident log is not a transcript | Trigger simulated intrusion and sensitive safety events. Only minimal events go to ordinary logs; reviewed evidence is separate, bounded and inaccessible to broad support/​analytics. | Schema/​payload scan and access tests. R. |
| T20 — Replay/​out-of-order commercial events | Send invalid signatures, old/​replayed events, duplicates and reversed event order; simulate provider timeout. No false/​duplicate grant or charge; reconcile uncertain state. | Processor test-mode receipts and grant history. R applicable payments/​entitlements. |
| T21 — Stale approval and direct edits | Approve an old proposal after a newer edit, or alter scope/​version in transit. Reject stale/​mismatched adoption; preserve exact accepted wording and prior lineage; no implicit share. | Version-bound receipts and conflict result. R. |
| T22 — History/​continuity expiry | Advance the clock through session, recovery and note expiry; change preferences. Purge eligible raw copies and disable expired retrieval; no unlimited fallback or silent note renewal. | Policy IDs, job results and retrieval probes. R. |
| T23 — Delete during active AI | Pause before model send, during streaming and before save; delete/​revoke. Unsent input is blocked, later output fenced/​discarded, retries prevented and prior provider transmission recorded honestly. | Deterministic race tests and no new saved derivative. R. |
| T24 — Hold/​purge concurrency | Interleave valid hold placement, deletion and hold release with worker crashes. Covered data is preserved only as required; unrelated data is disposed; held data never returns to coaching. | Transaction order, hold scope and disposition results. R. |
| T25 — Signed URL and file lifecycle | Attempt public paths, listing, predictable IDs, wrong owner and stale bearer URLs. Confirm actual expiry/​revocation limits; enforce authenticated gateway where required; clean orphan files. | Storage tests including cache and object removal. R. |
| T26 — Account recovery and sessions | Verify O13 MFA is required before private-record access through UI/API/storage paths. Exercise lost factor, stolen token, secure recovery, primary contact change, MFA reset, account closure/deletion and full data/Blueprint export. Require fresh authentication/step-up for high-impact actions; reject sponsor impersonation and stale-session bypass. Test future recipient-sharing step-up before its later release. | Chosen mechanism, enforcement, secure recovery and step-up results. R; future sharing F. |
| T27 — Browser/​rendering isolation | Attempt model-output script/​HTML, remote content, CSRF, unsafe redirects and external URLs. Test browser-back/​offline/​local-storage after logout and account switching. | Security/​header/​egress tests and device residue checks. R. |
| T28 — Provider configuration drift | For OpenAI, Supabase and each core private-data processor, require qualified acceptance of actual executed terms/DPA, sensitive-data representations, use/training settings, retention, model/endpoint/service, subprocessors, relevant locations, access/support, deletion and incident obligations. Generic documentation fails the gate. Simulate unavailable/incompatible ZDR and changed settings/endpoint: no automatic fallback; require O06 separate documented owner decision after qualified review. | Account/contract/configuration evidence, specialist acceptance, applicable O06 decision and fail-closed tests. R. |
| T29 — Rights and truthful status | Submit access/​correction/​deletion through logged-in and alternative channels; simulate vendor failure. No premature “deleted everywhere”; proper escalation, exception/​appeal handling and protected export. | End-to-end case record and participant messages. R. |
| T30 — Disabled features stay disabled | Attempt health, voice, ForgedLife, built-in third-party/continuing/spouse/accountability/church-group sharing, automatic autobiographical memory, SMS/push reminders, participant-content research/training/evaluation/fine-tuning, unrelated improvement and expanded/named reporting through UI, API, worker and configuration paths. No first-pilot bypass of disabled scope. | Feature flags plus server-denial tests for selected exclusions. R; separate approvals/full tests before F. |
| T31 — Aggregate re-identification | Try small cohorts, overlapping date windows, subgroup subtraction, repeated queries and joins with known invitation lists. Withhold/​coarsen outputs that reveal individuals. | Privacy reviewer report and catalogue limits. R any aggregate reporting. |
| T32 — Operational recovery and response | Exercise outage/​compromise tabletop, escalation, vendor contacts, finite retries, spend limits and restoration. Verify responsibility and legal-notice escalation without inventing human crisis monitoring. | Tabletop/​runbook results and corrective actions. R. |

<a id="PRIV-B0312"></a>
#### 17.2 Acceptance and unresolved defects

<a id="PRIV-B0313"></a>
[TC + RV] Engineering owns reproducible execution; an independent security/privacy reviewer evaluates boundary coverage and high-risk findings. Counsel reviews legal/privacy assumptions and incident/rights procedures, not cryptographic implementation. Mike’s scope decision and P1-10 release approval are separate from passing tests. No self-certified “PASS” based on code inspection alone.

<a id="PRIV-B0314"></a>
Block release for unresolved critical/high-risk isolation, authorization, secret, consent, private-telemetry, deletion/restore or false-status failures. Lower-risk residual defects require documented scope, compensating controls, accountable acceptance and a time-bound correction plan. A feature can be excluded only if every path is demonstrably disabled and the exclusion preserves approved core product requirements. Testing a disabled endpoint is not approval of its future implementation.

<a id="PRIV-B0315"></a>
### 18. Release evidence and external reference register

<a id="PRIV-B0316"></a>
#### 18.1 What must be assembled before a real release

<a id="PRIV-B0317"></a>
[TC + RV] Maintain a single release dossier containing O01–O13 selection records and separate final owner approval; counsel applicability/contract review; hard provider contractual-fit acceptance for each core private-data processor with account-specific evidence; any separately documented O06 decision after review; versioned notices and permission screens; approved executable retention/inactivity/backup/hold schedules; processing/vendor inventories; actual deployed configuration; actual named O12 role assignments and independent-review arrangements; MFA/recovery/step-up and other security/rights/restore test results; unresolved-risk decisions; support/incident/safety runbooks; and P1-10’s scope-specific authorization. Reference this standard by version/status. Selection alone closes none of these evidence gates. Jeremy should not need to infer policy from a meeting, chat summary or an unapproved recommendation. [OD-REV]

<a id="PRIV-B0318"></a>
Changes to a model, endpoint, vendor, region, schema, notification template, reporting audience, retention rule or participant eligibility require impact assessment before release. Recheck governing source authority as well as external facts. A draft notice must not be published merely because the architecture supports a future feature. Preserve review and approval evidence independently of ephemeral conversation files.

<a id="PRIV-B0319"></a>
#### 18.2 Primary-source reference register

<a id="PRIV-B0320"></a>
All external entries below are carried forward unchanged from the September 11, 2026 research snapshot in the owner review draft; they were not reverified during the controlled owner-decision revision or this approval finalization. They support the original factual observations and conditional legal issues, not a certification or account-specific suitability determination for Steward. Official documentation can change; the release dossier must preserve the reviewed version/date and revalidate material provisions. Generic public documentation alone cannot satisfy the hard provider contractual-fit gate. Applicable TC controls and acceptance criteria are approved requirements within this standard’s scope, with implementation/testing unverified; O01–O13 are approved OD directions. AP remains governed by its cited source; OP recommendations remain recommendations; CL/RV gates remain open and FD features disabled. Governing Steward source keys and the owner-revision source are in Appendix E.

<a id="PRIV-B0321"></a>
[FT1] Federal Trade Commission — Start with Security: A Guide for Business. Data minimization, access, vendor and security-program considerations. Official source.

<a id="PRIV-B0322"></a>
[FT2] Federal Trade Commission — Complying with the FTC’s Health Breach Notification Rule. Qualifying entities, health information, unauthorized disclosure and breach-notification considerations. Official source.

<a id="PRIV-B0323"></a>
[FT3] Federal Trade Commission — CAN-SPAM Act: A Compliance Guide for Business. Commercial versus transactional/relationship email and applicable sender obligations. Official source.

<a id="PRIV-B0324"></a>
[NI1] NIST — SP 800-61 Revision 3, Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile. Final publication, April 2025. Official source.

<a id="PRIV-B0325"></a>
[NI2] NIST — Privacy Framework. Voluntary privacy-risk framework; use the final framework distinctly from any draft update. Official source.

<a id="PRIV-B0326"></a>
[NI3] NIST — SP 800-63B-4, Digital Identity Guidelines: Authentication and Authenticator Management. Final publication, July 2025; a design reference, not an asserted Steward assurance certification. Official source.

<a id="PRIV-B0327"></a>
[LAZ1] Arizona Legislature — A.R.S. §18-552. Breach investigation, notification and related provisions. Official statute.

<a id="PRIV-B0328"></a>
[LAZ2] Arizona Legislature — A.R.S. §18-551. Applicable definitions, including protected personal information. Official statute.

<a id="PRIV-B0329"></a>
[WA1] Washington Legislature — RCW 19.373.030. Consumer-health collection/sharing conditions and disclosures. Official statute.

<a id="PRIV-B0330"></a>
[WA2] Washington Legislature — RCW 19.373.040. Consumer rights, downstream deletion and archived/backup treatment. Official statute.

<a id="PRIV-B0331"></a>
[WA3] Washington Legislature — RCW 19.373.010. Definitions relevant to consumer-health applicability. Official statute.

<a id="PRIV-B0332"></a>
[NV1] Nevada Legislature — NRS Chapter 603A, consumer-health-data provisions. Separate state definitions, scope and requirements to assess. Official statutes.

<a id="PRIV-B0333"></a>
[CA1] California Legislature — Civil Code §1798.100. Applicable collection notice, retention and processing limits. Official statute.

<a id="PRIV-B0334"></a>
[CA2] California Legislature — Civil Code §1798.105. Applicable deletion duties and exceptions. Official statute.

<a id="PRIV-B0335"></a>
[CA3] California Legislature — SB 243, Chapter 677 (2025), Companion Chatbots; Business and Professions Code §§22601–22606. Approved October 13, 2025; §22603 reporting begins July 1, 2027. Enacted official text.

<a id="PRIV-B0336"></a>
[HHS1] U.S. Department of Health and Human Services — Business Associates. HIPAA role and contractual analysis. Official guidance.

<a id="PRIV-B0337"></a>
[CH1] Federal Trade Commission — Children’s Online Privacy Protection Rule (COPPA). Current rule and related official materials; counsel must apply the current version to the actual service. Official rule resources.

<a id="PRIV-B0338"></a>
[PAY1] U.S. House, Office of the Law Revision Counsel — 15 U.S.C. §8403. Negative option marketing on the Internet (ROSCA). Official U.S. Code.

<a id="PRIV-B0339"></a>
[COURT1] Administrative Office of the U.S. Courts — Federal Rules of Civil Procedure, Rule 37(e). Preservation of electronically stored information; official rules PDF, printed pages 64–65. Official rules.

<a id="PRIV-B0340"></a>
[OA1] OpenAI — Data controls in the OpenAI platform. API training use, abuse monitoring, MAM/ZDR, endpoint limitations, notified retention variants and residency qualifications. Official documentation.

<a id="PRIV-B0341"></a>
[OA2] OpenAI — Data Processing Addendum. Processor terms, Schedule 1 sensitive-data description, subprocessors, rights assistance and return/deletion. Official contract.

<a id="PRIV-B0342"></a>
[OA3] OpenAI — Services Agreement. Customer content, permitted use, rights and customer responsibilities. Official contract.

<a id="PRIV-B0343"></a>
[OA4] OpenAI — Sub-processor list. Services and processing locations requiring vendor-chain review. Official list.

<a id="PRIV-B0344"></a>
[OA5] OpenAI — Prompt caching. Model/organization-dependent cache controls and retention distinctions. Official documentation.

<a id="PRIV-B0345"></a>
[OA6] OpenAI — Conversation state. Response storage, store=false, and persistence distinctions for conversation objects. Official documentation.

<a id="PRIV-B0346"></a>
[SU1] Supabase — Production Checklist. Database/RLS, SSL/network, organization MFA and production Auth considerations. Official documentation.

<a id="PRIV-B0347"></a>
[SU2] Supabase — Row Level Security. Policies, ownership, views and bypass considerations. Official documentation.

<a id="PRIV-B0348"></a>
[SU3] Supabase — Understanding API keys. Publishable versus privileged secret keys and legacy-key distinctions. Official documentation.

<a id="PRIV-B0349"></a>
[SU4] Supabase — Database Backups. Database recovery and exclusion of Storage object bytes. Official documentation.

<a id="PRIV-B0350"></a>
[SU5] Supabase — Storage Buckets. Public/private access posture. Official documentation.

<a id="PRIV-B0351"></a>
[SU6] Supabase — Serving assets from Storage. Authenticated/signed delivery and signed-URL revocation limitations. Official documentation.

<a id="PRIV-B0352"></a>
[SU7] Supabase — JWT Signing Keys. Key rotation/revocation and verification-cache considerations. Official documentation.

<a id="PRIV-B0353"></a>
[SU8] Supabase — Multi-Factor Authentication. Authentication levels and application/database enforcement. Official documentation.

<a id="PRIV-B0354"></a>
[SU9] Supabase — Available regions. Specific-region selection and limits of data-location claims. Official documentation.

<a id="PRIV-B0355"></a>
[SU10] Supabase — Database Functions. Invoker/definer execution, search path and privileges. Official documentation.

<a id="PRIV-B0356"></a>
[SU11] Supabase — Trust Center. Vendor security evidence, subject to actual service/configuration review. Official trust resource.

<a id="PRIV-B0357"></a>
[SU12] Supabase — Data Processing Addendum. Sensitive-data obligations, subprocessors, locations and processing terms. Official contract.

<a id="PRIV-B0358"></a>
[SU13] Supabase — Logs. Log categories, access paths and plan-based retention. Official documentation.

<a id="PRIV-B0359"></a>
[ST1] Stripe — Webhooks. Authenticity, duplicate and delivery-order handling. Official documentation.

<a id="PRIV-B0360"></a>
[ST2] Stripe — Resolve webhook signature verification errors. Signed-event verification using the raw request body, signature header and endpoint secret. Official documentation.

<a id="PRIV-B0361"></a>
[ST3] Stripe — Security guide. Low-risk payment integrations and shared payment-security responsibility. Official documentation.

<a id="PRIV-B0362"></a>
#### 18.3 Payment-provider boundary carried forward

<a id="PRIV-B0363"></a>
[AP + TC] Preserve the approved direction: Stripe handles payment processing; the application’s Supabase-backed entitlement state remains authoritative for access. Prefer hosted payment collection and retain only necessary customer/transaction references, dates, amounts, product/agreement identifiers and verified status. No Blueprint, journal, health or assessment content in Stripe metadata. Stripe documents signature verification, duplicate/event-order handling and shared payment-security responsibilities. Use verified raw-body signature checking, idempotent processing and reconciliation; never log signing secrets while debugging. These controls support, but do not complete, P1-04/P1-05/P1-06. [P1-01, K.2; CTX3, §14; ST1–ST3]

<a id="PRIV-B0364"></a>
### A. APPROVED OWNER DIRECTIONS + OPEN GATES

<a id="PRIV-B0365"></a>
OWNER DIRECTION SELECTED — O01–O13. OWNER APPROVAL RECORDED: SEPTEMBER 12, 2026. Michael J. Gauthier has approved the directions summarized below and recorded in Section 16 within this standard’s stated scope. Their recorded wording is unchanged. For every decision, LEGAL / SECURITY / RELEASE GATE STILL OPEN applies; the gate descriptions below are unresolved work, not completed findings. [OD-REV]

<a id="PRIV-B0366"></a>
O01 — Operating entity / first geography. Selected: Invitation-only, Arizona-first pilot; prefer a dedicated MJG / Stewardship Blueprint legal entity rather than Strategic Income Group or Certified Fiduciary Services unless qualified legal/tax counsel recommends otherwise. This is an owner risk-management preference, not legal advice or a completed entity decision. Gate still open: Counsel must confirm operating entity, geographic eligibility boundary, actual business/vendor footprint and participant eligibility implementation; entity/legal/tax review remains required.

<a id="PRIV-B0367"></a>
O02 — Age eligibility. Selected: Adults age 18+ only for the initial real-participant pilot; no minors program. Gate still open: Counsel/security must approve the age-assurance method and discovered-minor procedure.

<a id="PRIV-B0368"></a>
O03 — Conversation history. Selected: Session-only participant-visible raw conversation history by default for the first real-participant pilot; a launch posture, not a permanent product or architecture rule. Gate still open: Exact session boundaries and transient operational retention/deletion periods require privacy/legal/technical review.

<a id="PRIV-B0369"></a>
O04 — Saved continuity. Selected: Automatic autobiographical memory is OFF. Only individually selected, visible, purpose-bound continuity notes may persist. Participants can review, correct and delete eligible notes; approved Blueprint content remains separate. Gate still open: Privacy/security must verify note selection, visibility, correction, deletion and purpose/lifecycle enforcement.

<a id="PRIV-B0370"></a>
O05 — Retention / inactive accounts. Selected: Bounded, purpose-specific retention principle, without specific retention periods. Paid expiration alone must not erase the participant’s Blueprint or Free access. Gate still open: Qualified counsel/records/security must approve the final executable retention schedule, inactive-account rules, deletion exceptions, backup treatment and legal-hold procedures before real participants.

<a id="PRIV-B0371"></a>
O06 — Model / provider residual retention. Selected: Use the strongest compatible approved privacy configuration; seek approved OpenAI ZDR first where compatible. No automatic ordinary-retention fallback and no special claim without account-specific evidence. Gate still open: When desired ZDR is unavailable/incompatible, a separate documented Michael J. Gauthier decision is required after qualified privacy/legal/security review of actual terms, retention, model/endpoint, monitoring, cache/application state, subprocessors, sensitive-data fit and participant disclosure. The hard provider contractual-fit gate remains open.

<a id="PRIV-B0372"></a>
O07 — Initial participant sharing. Selected: Secure participant self-export only. No built-in third-party recipient, continuing, spouse, accountability-partner or church/group content sharing in the first pilot. Gate still open: Secure export and O13 step-up require review/testing; future sharing needs a separate release gate.

<a id="PRIV-B0373"></a>
O08 — Church / sponsor reporting. Selected: Approved privacy-reviewed aggregate operational information only. No named activation, nonactivation, last-use, completion, payment, withdrawal or private-content feeds at launch; sponsorship never grants private-content access. Gate still open: Exact aggregate report definitions and disclosure safeguards require privacy/release approval.

<a id="PRIV-B0374"></a>
O09 — Notifications / marketing. Selected: Necessary minimal account/security/service email and separately opted-in generic Steward reminder email where implemented. No SMS/push reminders initially. Marketing stays separate and optional, not bundled with reminders or sponsorship; external previews generic and non-sensitive. Gate still open: Review communication authority, templates, destinations/providers and permission/withdrawal enforcement before the affected communications.

<a id="PRIV-B0375"></a>
O10 — Analytics / research. Selected: Only necessary allowlisted operational/reliability/cost/security events to operate/evaluate the product. No participant-content research, model training, evaluation corpus, fine-tuning dataset, behavioral advertising, sensitive profiling or unrelated product improvement use. Gate still open: Review the event allowlist; any later research/content-analysis use needs a separate approved feature/purpose and applicable participant/legal review.

<a id="PRIV-B0376"></a>
O11 — Real pilot before live payment. Selected: Bounded nonpaid operational pilot under an approved complimentary/admin-granted pilot entitlement before live consumer payments. Test privacy, consent, account protection, Steward usefulness, support, safety, deletion, provider configuration and operational reliability—not retail willingness to pay. Gate still open: Applicable nonpaid entitlement implementation and all real-participant release gates remain. The later paid pilot separately completes P1-04, P1-05, P1-06 and applicable release work. Approved pricing is unchanged.

<a id="PRIV-B0377"></a>
O12 — Accountable operating roles. Selected: Named owners for product/owner, privacy, security/incident response, support, records/legal hold and vendor management before real enrollment. Responsibilities may combine, but permissions/workflows stay separate; no self-approval of sensitive-content elevation or investigation of own alleged misuse. Gate still open: Record actual names/organizations and use an independent external reviewer/specialist where internal separation is insufficient.

<a id="PRIV-B0378"></a>
O13 — Participant account security. Selected: MFA before private Steward record access in the first real-participant pilot; tested secure recovery; fresh authentication/step-up for full data/Blueprint export, primary contact change, MFA reset, account closure/deletion and future recipient sharing. Gate still open: Engineering/security chooses and tests implementation. Prefer phishing-resistant or authenticator/passkey-style methods where practical, rather than SMS as the sole strong factor. Reconsideration requires pilot learning and security review; this is not necessarily permanent consumer onboarding design.

<a id="PRIV-B0379"></a>
Hard provider contractual-fit gate remains mandatory. No real participant content may be processed by OpenAI, Supabase or another core private-data processor until qualified privacy/legal/security review accepts the actual executed contract/DPA, sensitive-data representations, data-use/training settings, retention configuration, model/endpoint or service, subprocessors, relevant regions/locations, access/support terms, deletion capabilities and incident obligations. Generic public documentation is insufficient. OpenAI’s sensitive-data contractual-language concern is neither resolved as prohibited nor approved; it remains a mandatory counsel/vendor-resolution item. Apply the same actual-account/contract/configuration discipline to Supabase.

<a id="PRIV-B0380"></a>
Final owner approval is recorded and remains separate from professional review and scope-specific release approval. No specific retention schedule, completed operating-entity decision, role register, account configuration or test result is invented here. Real participants remain unauthorized; P1-01 and all other governing sources remain unchanged.

<a id="PRIV-B0381"></a>
### B. COUNSEL / SPECIALIST REVIEW REQUIRED

<a id="PRIV-B0382"></a>
| Review owner | Required determination or work product |
| --- | --- |
| Privacy / product counsel | Confirm O01 operating entity/geographic boundary/business-vendor footprint/eligibility implementation, including the dedicated-entity legal/tax preference; O02 age assurance/discovered-minor procedure; sensitive religious/health/sexual/family data; processing authority/notices; rights/appeals; sponsor contracts and aggregate safeguards; claims and limitations. Resolve Section 14.2 issues. Owner selection is not completed review. |
| Vendor / technology counsel | With qualified privacy/security reviewers, close the Section 10.2 hard gate for each actual core private-data processor: executed contract/DPA, sensitive-data representations, use/training, retention, service/model/endpoint, subprocessors, relevant regions, access/support, deletion and incident obligations. Resolve OpenAI sensitive-data fit without presuming prohibition or approval; apply equivalent Supabase discipline. O06 fallback needs a separate documented Michael J. Gauthier decision after review. No assumed special contract or BAA. |
| Records / litigation counsel | With qualified records/security review, approve the final executable retention schedule, inactive-account rules, deletion exceptions, backup treatment and legal-hold procedures before real participants. O05 selects the principle only, not specific periods. Review approval/proof lifecycle, fair preservation, hold/purge conflicts, rights, lawful process and disclosure restrictions. |
| Independent security reviewer | Threat model; O13 mandatory MFA before private-record access, tested secure recovery and fresh authentication/step-up for high-impact actions; O12 separation/independent review; RLS/privileged paths, application security, keys, telemetry, provider-fit evidence/configuration, isolation, concurrency, restore and tests. Determine whether extra S3 encryption materially reduces risk. |
| Privacy / analytics specialist | Event/​report catalogue, minimization, linkage, small-cohort/​differencing risk, consent UX and actual deletion/​revocation controls. No automatic anonymity finding from aggregation or pseudonyms. |
| Production safety / support specialist | P1-07/​P1-08 support ownership, safety protocol, evidence minimization, escalation and truthful no-monitoring limits. Preserve SC3 conduct; do not promote its fictional baseline into production certification. |
| Commercial / publication specialists | P1-04/​P1-05/​P1-06 payment, entitlement, refunds/​tax/​customer terms; P1-09 Scripture/​publication rights; P1-10 scope-specific release decision. These are not completed by privacy architecture. |

<a id="PRIV-B0383"></a>
A review may conclude a proposed feature must remain off, a contract must change or the geographic scope must narrow. The final record must state unresolved assumptions and conditions, not simply “legal reviewed.”

<a id="PRIV-B0384"></a>
### C. ENGINEERING IMPLEMENTATION REQUIREMENTS

<a id="PRIV-B0385"></a>
[TC] Implement the following as cohesive modules within P1-01’s modular transactional architecture, not twenty unrelated services.

<a id="PRIV-B0386"></a>
| Implementation package | Required output / dependency |
| --- | --- |
| C1 — Identity and policy boundary | Stable identity mapping, deny-by-default authorization, role/case access, O13 mandatory MFA before private-record access, tested secure recovery and fresh authentication/step-up for specified high-impact actions, privileged-key isolation and participant/sponsor separation. Needed before private data flow. |
| C2 — Governed records and receipts | Canonical Blueprint/​proposal/​evidence separation, exact version-bound assent, permission/​authority registry, independent minimal event ledger and restricted evidence payloads. No shadow transcript. |
| C3 — Lifecycle and concurrency | Executable professionally approved retention/inactivity/backup/hold policies; O03 session-only pilot boundaries; O04 visible selected-note controls with automatic memory OFF; central lineage/copy inventory, privacy epochs, access blocking, fenced outbox/workers, idempotent deletion and hold coordination. No invented durations. |
| C4 — Private storage and delivery | Private objects, authenticated exports, versioned manifests, cache/​URL controls, temporary-file cleanup, participant-only downloads and downstream result semantics. |
| C5 — Participant controls | Privacy &amp; Controls page showing current history mode, saved notes, permissions, notifications, export/​deletion requests and account closure; billing cancellation separate. Controls must work without chat interpretation. |
| C6 — Provider and environment boundary | Hard contractual-fit acceptance for actual OpenAI/Supabase/other core private-data processors; reviewed actual Stripe/email/support/telemetry configurations/terms; account-specific ZDR evidence and no automatic fallback; any alternative requires O06’s separate documented owner decision after review. Separate production/synthetic environments; endpoint/service allowlist; no training/feedback content upload. |
| C7 — Operations and recovery | Allowlisted logs/​metrics, no private-screen replay, secrets rotation, reviewed migrations/​dependencies, restricted support/​incident stores, protected disposition ledger and tested database/​object recovery. |
| C8 — Acceptance and release dossier | T01–T32 results for enabled scope, independent review, defects/retests, actual control status, named O12 owners/organizations and separated workflows, final owner approval and P1-10 authorization. Selected policy directions alone are not review/test evidence. Disabled routes stay denied. |

<a id="PRIV-B0387"></a>
The data dictionary must map all twenty P1-01 logical classes to their authoritative store, responsible service, allowed roles/purposes, sensitivity, retention policy, copies/vendors, deletion dependencies and release status. Unused future classes remain empty/disabled; the existence of a table is not authorization to collect data. Current implementation status is unverified by this document.

<a id="PRIV-B0388"></a>
### D. ITEMS EXPLICITLY DEFERRED / DISABLED

<a id="PRIV-B0389"></a>
[AP + FD] P1-01 M.C continues to gate ForgedLife synchronization, connected health/wellness, voice/audio, participant-content research, expanded cohort reporting/named operational status, and other expanded integrations or sensitive uses. Each requires separate purpose, permission, contract, lifecycle, safety/security and release evidence before activation.

<a id="PRIV-B0390"></a>
[OD; O01–O04, O07–O11] Selected first-pilot exclusions are built-in third-party/continuing/spouse/accountability-partner/church-group content sharing, automatic autobiographical memory, persistent participant-visible raw history beyond the selected session-only pilot posture, named sponsor activity/private-content feeds, SMS/push reminders, analytics beyond necessary allowlisted operations, participant-content research/training/evaluation/fine-tuning or unrelated improvement, behavioral advertising/sensitive profiling, minors programming and live consumer payments. Future changes remain separately approval/release-gated. O06 authorizes no automatic ordinary-retention fallback. [OD-REV]

<a id="PRIV-B0391"></a>
[OP + TC] Retain the exclusions of private-screen replay and unreviewed model tools/provider-hosted memory as approved TC requirements within the applicable implementation/release scope. Their OP policy recommendations remain recommendations, not newly selected owner policies. No deferred route may accept real participant content merely because a future permission type or table exists.

<a id="PRIV-B0392"></a>
No new church pricing, incentives, research program, minors program, health service, emergency monitoring service or international launch is authorized. No entitlement clock, approved price, Compass benefit, doctrinal statement, Legacy definition or Blueprint layer is changed. No private participant content is transferred to future services merely to prepare for them.

<a id="PRIV-B0393"></a>
### E. TRACEABILITY TO P1-01 AND CURRENT GOVERNING SOURCES

<a id="PRIV-B0394"></a>
#### E.1 Current Steward authority register

<a id="PRIV-B0395"></a>
| Key / canonical source | Actual authority and use in this standard |
| --- | --- |
| P1-01 — P1-01_​Production_​Data_​Architecture_​v1_​APPROVED_​PRODUCTION_​DATA_​ARCHITECTURE.docx | Approved by Michael J. Gauthier September 11, 2026. Governs M.A and supporting A–R within scope; M.B/​N release gates and M.C disabled features preserved. Principal architecture authority throughout this standard. |
| T4 — Personal_​Stewardship_​Blueprint_​Template_​v4_​APPROVED_​GOVERNING_​STANDARD.docx | Approved governing standard. Participant-owned living guide, canonical Free/​Full/​My North Star structure, exact wording, content/​definition distinctions, approval and export logic. An upload suffix “(1)” is not another version. |
| PJ — Steward_​Product_​Journey_​and_​Progression_​Standard_​v0_​1_​APPROVED_​GOVERNING_​STANDARD.docx | Approved governing standard. Product modes, entitlement/​commercial boundaries, ethical progression, notifications, sharing, sponsored cohorts and Compass configuration. No price or benefit revisions here. |
| OI4 — Steward_​Operating_​Instructions_​v0_​4_​APPROVED_​WORKING_​TEST_​BASELINE.docx | Active approved general fictional-test baseline, superseding general v0.3. Conduct, participant agency, source routing, human support, permission and truthful action status within its actual scope. |
| SC3 — Steward_​Sensitive_​Conversations_​and_​Safety_​Standards_​v0_​3_​WORKING_​TEST_​BASELINE.txt | Separate, unchanged sensitive/​safety working-test baseline. Sensitive disclosures, relational integrity, professional boundaries, safety priority and post-disclosure handling. Not a production clinical protocol. |
| CTX3 — 00_​STEWARD_​CONTEXT_​AND_​DECISIONS_​v3_​APPROVED_​CURRENT_​CONTEXT.docx | Current context/​navigation and implementation direction, including Stripe/​Supabase separation and v0.4 routing. Does not override issue-specific governing authority. |
| SR4 — Steward_​Source_​Register_​and_​Review_​Queue_​v4_​APPROVED_​SOURCE_​CONTROL.docx | Source-control register and review queue. Canonical identities/​format-copy principle; remaining P1 workstreams. A stale P1-01 open queue entry cannot override the later explicit architecture approval. |
| SF — Approved Statement of Faith | Exact owner-supplied Statement-of-Faith.txt, from “God” through “Identity,” remains unchanged under current governing routing. Incorporated by reference, not rewritten or reapproved here. |
| LG — 04_​SB_​Legacy_​and_​Legacy_​Giving_​Standard_​v1 | Current owner-designated Legacy authority remains unchanged under governing routing. No privacy classification or permission creates a new definition of Legacy/​Legacy Giving. |
| CFM4 / supporting assessment and teaching sources | Created_​for_​More_​Check-In_​v4_​Printable.docx remains the approved assessment specification. The Energy Audit Check-In, The Life You’re Building — First Edit and compatible supporting study materials retain their actual roles. This standard changes no questions, scores, teaching or participant defaults. |
| BRIEF — Original combined P1-02/P1-03 owner instructions | Original instructions supplied for this workstream in the September 11, 2026 product-development conversation. Authorized research and preparation of the owner review draft; not approval of its policies or controls. Preserved as the original development source. |
| OD-REV — Controlled owner-decision revision instructions | Michael J. Gauthier’s preceding controlled owner-decision revision instructions selected O01–O13, added the hard provider contractual-fit gate and elevated OpenAI/Supabase sensitive-data review. This is the selection/revision source, distinct from final approval under OD-APP. Professional/release gates remain open. This source authorizes no changes to P1-01 or other governing sources. |
| OD-APP — Final owner approval, September 12, 2026 | Michael J. Gauthier’s explicit approval in the Steward product-development conversation on September 12, 2026. Approves O01–O13 unchanged and applicable TC requirements/acceptance criteria within this standard’s stated scope; preserves AP source authority, OP recommendations, CL/RV open gates and FD disabled features. Does not authorize real participants, real participant processing, production readiness or changes to P1-01 or any other existing governing source. |

<a id="PRIV-B0396"></a>
#### E.2 Traceability by architecture issue

<a id="PRIV-B0397"></a>
| P1-01 / governing requirement | Implementation in this standard |
| --- | --- |
| A–D; M.A — stable identity, twenty logical classes, distinct states and stores | Sections 0–3; risks R01–R07/​R24; roles; C1/​C2 and the required class-to-lifecycle data dictionary. |
| E; I — exact approval, version/​scope integrity and evidence separate from logs | Sections 5.2–5.3 P04, 9 and 13; tests T19/​T21; no full-chat proof requirement. |
| F — bounded conversation retention and visible authorized continuity | Section 4; P05/P06; T06/T22/T23; O03–O05 owner directions approved September 12, 2026, with session/retention/technical gates still open. P1-01 remains unchanged. |
| G — rights, dependencies, deletion, holds and restoration | Sections 12–13; R13/​R14/​R22/​R23; T06/​T13/​T14/​T23–T25/​T29. |
| H — separate permissions, effective checks and revocation | Sections 2, 5–6 and 8; T07/​T08/​T15–T18; Blueprint approval never means sharing. |
| J; PJ §16 — sponsor separation and configurable cohorts | Section 7; R08; T12/T31; O08 aggregate-only direction selected; exact report/disclosure gate open. Compass benefits preserved; named activity/private-content feeds OFF at launch. |
| K — integration/​provider boundaries and truthful external state | Sections 8, 10–11, 13 and 18.3; T08/​T11/​T20/​T28/​T30. |
| L — least privilege, encryption, telemetry, vendors and incident readiness | Sections 1–3, 8–12, 17; C1/C6/C7; O12 role/separation and O13 MFA/recovery/step-up directions; hard provider contractual-fit gate with account-specific evidence before processing. |
| M.B; N — open release/​policy and professional review gates | Sections 14–18; O01–O13 owner directions approved September 12, 2026; Appendices A–C. All applicable professional/release gates remain open; no compliance or launch claim. |
| M.C — future capabilities disabled | P13–P15/​P18/​P19, Sections 15 and 17 T30, Appendix D. |
| O–Q — modular implementation, minimization and durable truth | Section 4, Appendix C; no unnecessary microservices, private-content archive or custom cryptography. |
| R; OI4 / CTX3 / SR4 — authority and source-control accuracy | Sections 0 and E.1; v0.4 general baseline and separate SC3 preserved; stale queue acknowledged without editing sources. |
| T4 / SF / LG / CFM4 and compatible supporting sources | No changes to Blueprint structure, doctrine, Legacy, assessment scoring, terminology or teaching; privacy controls do not create participant facts. |

<a id="PRIV-B0398"></a>
#### E.3 Non-modification and status statement

<a id="PRIV-B0399"></a>
This is the controlled approval finalization of P1-02 + P1-03 Privacy, Security, Consent + Sharing Standard v0.1. Michael J. Gauthier approved O01–O13, unchanged from their recorded wording, and the applicable TC implementation/control requirements and acceptance criteria on September 12, 2026, within this standard’s stated scope. The hard provider contractual-fit gate and all explicitly open professional-review, implementation, testing and release gates remain open. It does not replace, revise, shorten or approve P1-01 or another governing source. The existing external research snapshot is carried forward unchanged, not newly verified; it does not silently revise an approved product rule or establish actual provider suitability. Any separate source-control or legal-reference maintenance requires its own authorization. [OD-REV]

<a id="PRIV-B0400"></a>
Final status: APPROVED PRIVACY, SECURITY, CONSENT + SHARING STANDARD. Michael J. Gauthier approved O01–O13 and the applicable TC requirements on September 12, 2026 within this standard’s stated scope. OP recommendations remain recommendations; CL/RV gates remain open and FD features remain disabled. Professional reviews and release gates remain open, implementation remains unverified, and real-participant processing/enrollment remains unauthorized. No specific retention period or automatic ZDR fallback is authorized. P1-01 and all other governing Steward sources remain unchanged.

<a id="PRIV-B0401"></a>
### APPROVAL STATUS

<a id="PRIV-B0402"></a>
P1-02 + P1-03 Privacy, Security, Consent + Sharing Standard v0.1 was approved by Michael J. Gauthier on September 12, 2026 within its stated scope.

<a id="PRIV-B0403"></a>
This approval establishes O01–O13 and the applicable technical/control requirements as governing Steward direction within this standard’s scope while preserving all explicitly open professional-review, implementation, testing, contractual-fit, and release gates.

<a id="PRIV-B0404"></a>
Approval does not constitute production approval, legal compliance certification, security certification, or authorization for real participants.

<a id="PRIV-B0405"></a>
#### Scope of approval

<a id="PRIV-B0406"></a>
O01–O13 are approved as Steward’s owner-selected privacy, security, consent, sharing, pilot-scope, account-security, and company-protection policy directions within this standard’s stated scope. Their recorded wording is unchanged.

<a id="PRIV-B0407"></a>
The supporting technical/security control requirements and acceptance criteria identified as TC are approved as requirements for the applicable implementation/release scope, subject to their stated professional-review and execution gates. Implementation and testing remain unverified until evidence exists.

<a id="PRIV-B0408"></a>
AP remains governed by its cited source. OD is approved owner direction. TC is an approved implementation/control requirement within scope, not evidence of execution. CL requires qualified legal analysis. RV remains an open qualified-review requirement that owner approval does not satisfy. FD remains disabled until separately approved and released. OP remains a recommendation or retained alternative only; approval of this standard does not convert OP items into owner policy unless separately identified as approved elsewhere.

<a id="PRIV-B0409"></a>
#### Hard release boundaries

<a id="PRIV-B0410"></a>
All open legal/security/release gates are preserved. This approval DOES NOT:

<a id="PRIV-B0411"></a>
constitute legal compliance certification;

<a id="PRIV-B0412"></a>
constitute security certification;

<a id="PRIV-B0413"></a>
establish production readiness;

<a id="PRIV-B0414"></a>
authorize real participants;

<a id="PRIV-B0415"></a>
authorize processing of real participant content by OpenAI, Supabase, or another core private-data processor before the hard contractual-fit gate is closed;

<a id="PRIV-B0416"></a>
resolve the OpenAI sensitive-data contractual-fit issue;

<a id="PRIV-B0417"></a>
resolve the Supabase sensitive-data contractual-fit issue;

<a id="PRIV-B0418"></a>
establish specific retention periods;

<a id="PRIV-B0419"></a>
establish exact session-boundary or transient-retention periods;

<a id="PRIV-B0420"></a>
complete the operating-entity/legal/tax review;

<a id="PRIV-B0421"></a>
complete age-assurance/discovered-minor implementation;

<a id="PRIV-B0422"></a>
assign the actual O12 accountable-role holders;

<a id="PRIV-B0423"></a>
verify or execute any engineering acceptance test;

<a id="PRIV-B0424"></a>
authorize a non-ZDR fallback;

<a id="PRIV-B0425"></a>
authorize built-in recipient sharing;

<a id="PRIV-B0426"></a>
authorize named sponsor activity reporting;

<a id="PRIV-B0427"></a>
authorize SMS/push reminders;

<a id="PRIV-B0428"></a>
authorize participant-content research/training/evaluation/fine-tuning;

<a id="PRIV-B0429"></a>
authorize connected health;

<a id="PRIV-B0430"></a>
authorize voice/audio;

<a id="PRIV-B0431"></a>
authorize broad ForgedLife synchronization;

<a id="PRIV-B0432"></a>
authorize live consumer payments;

<a id="PRIV-B0433"></a>
complete P1-04 through P1-10;

<a id="PRIV-B0434"></a>
modify P1-01 or another existing governing Steward source.

<a id="PRIV-B0435"></a>
#### Provider contractual-fit gate

<a id="PRIV-B0436"></a>
No real participant content may be processed by OpenAI, Supabase, or another core private-data processor until qualified privacy/legal/security review accepts the actual executed contract/DPA, sensitive-data representations, data-use/training settings, retention configuration, model/endpoint or service, subprocessors, relevant regions/locations, access/support terms, deletion capabilities, and incident obligations.

<a id="PRIV-B0437"></a>
Generic public documentation alone is insufficient. The OpenAI and Supabase sensitive-data contractual-fit issues remain mandatory qualified-review/vendor-resolution items, not findings of prohibition or approval. [OD-APP]

### Preserved supplementary part: word/header1.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-02 + P1-03 / v0.1

### Preserved supplementary part: word/footer1.xml

	APPROVED PRIVACY, SECURITY, CONSENT + SHARING STANDARD	1

### Preserved supplementary part: word/footer2.xml

	STEWARD / RELEASE GOVERNANCE	APPROVED PRIVACY, SECURITY, CONSENT + SHARING STANDARD

### Preserved supplementary part: word/header3.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-02 + P1-03 / v0.1

### Preserved supplementary part: word/footer3.xml

	APPROVED PRIVACY, SECURITY, CONSENT + SHARING STANDARD	1

### Preserved supplementary part: word/header4.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-02 + P1-03 / v0.1

### Preserved supplementary part: word/footer4.xml

	APPROVED PRIVACY, SECURITY, CONSENT + SHARING STANDARD	1

<!-- END_SOURCE PRIV -->
