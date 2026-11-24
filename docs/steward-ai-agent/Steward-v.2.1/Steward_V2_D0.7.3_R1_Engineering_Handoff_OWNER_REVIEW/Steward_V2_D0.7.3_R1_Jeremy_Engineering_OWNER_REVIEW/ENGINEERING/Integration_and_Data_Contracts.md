## D0.7.2 latest integration boundary — one public participant experience

The church/facilitator/ForgedLife integration is an **independent gated workstream**. Do not make its deployment or Compass-specific grants a prerequisite for the public Created for More → Free Steward experience. An attributed Compass QR/link is operational campaign metadata only, never participant affiliation, authenticated cohort status, Premium access, sponsor authorization, or data sharing. Any earlier examples to the contrary are superseded for the D0.7.2 launch. Explicit organization role grants, consent, data minimization, interoperability testing, and privacy review remain prerequisites to integration activation.

---

# STEWARD V2.0 — PROPOSED CONSOLIDATED ENGINEERING HANDOFF

**Candidate:** SV2-JEREMY-PROPOSED-D0.7.3-20261111  
**Prepared:** November 11, 2026  
**Status:** OWNER-REVIEW CANDIDATE; NOT ACCEPTED, NOT INSTALLED, NOT DEPLOYED  
**Internal name:** Steward V2.0 | **Historical engineering handoff:** Steward V1.0 — Initial Full Build  
**Source baseline:** SV2-DOCSET-D0.6.2-20260928 (frozen; unchanged in BASELINE_D0.6.2_UNCHANGED)

This is one proposed implementation assignment with issue-specific source authority, not a competing runtime source collection. The approved direction on November 11 authorizes preparation of the package and the five product-direction changes; it does **not** certify individual design details, legal/privacy/rights approval, application implementation, testing, handoff transmission or release. The proposed masters are not active until exact owner acceptance and controlled installation.

## Trust boundaries and logical interfaces (DESIGN, not implemented)
Application owns participant identity/claims. AI receives server-selected minimum data only. Never use a language-model tool argument as authorization. Data domains: verified account, private approved Blueprint, proposed wording, selected continuity/evidence, assessments, entitlements, consent, organization membership, referral attribution, provider events and operational telemetry.

### Proposed API contracts (names illustrative; versioned)
- `GET /v1/assessments/{id}/interpretation-context`: authenticated subject, actual instrument/version/date, layer/category score, item completeness, consent and access flags; never allow client-supplied arbitrary participant ID. Response cannot imply content approval.
- `GET /v1/blueprint/current?scope=`: current authoritative approved version plus field/section definition state, content state, gaps and permissions, no inferred practice from missing activity.
- `POST /v1/blueprint/proposals`: candidate target, exact wording, purpose, expected-version and source references; creates Proposed content only.
- `POST /v1/blueprint/approval`: authenticated exact-wording/version/scope consent, CSRF/step-up where appropriate, immutable receipt; save in atomic transaction; independently recalculate functional section state.
- `POST /v1/continuity/selected-note`: exact selected content and distinct purpose with choice and receipt; no default raw-chat auto-archive.
- `POST /v1/retreat/sessions`: participant chooses review period and eligible source classes; create privacy-scoped session. `POST /v1/retreat/preview` rechecks revocation; `POST /v1/retreat/exports` gives signed expiring download after authorized rendering; do not mutate Blueprint.
- `GET /v1/organizations/{org}/administration`: server-verifies role, grant scope, organization, expiry, operation, and only admin-eligible operational fields. Default-deny per participant private content even to org owner.
- `POST /v1/integrations/forgedlife/events`: verified signature, replay nonce, schema version, event idempotency, source system, minimal participant-binding reference, explicit mapped data scope, permission revision and provenance; rejects unapproved fields; preserves pending/failed outcome without unauthorized retry expansion.
- `POST /v1/notifications`: separately chosen channel/purpose/grant; scheduling acceptance ≠ delivered receipt.
- `POST /v1/offers/checkout-intents`: published eligible snapshot and explicit assent; payment backend verifies fulfillment. Activation is independent explicit operation with actual successful receipt.

### Required permission model
Actor `{subject, org_role, verified_membership, MFA_state}` + action + resource owner + feature flag + entitlement + purpose + opt-in/share consent + data-class sensitivity + current lifecycle revision must be checked server-side for retrieval AND action AND export AND scheduled dispatch. Org membership cannot override personal scope. Participant correction or withdrawal invalidates derived views/cache/jobs where required. Rollback never recreates revoked permissions.

### Organization onboarding workflow
Owner-approved organization created → legal/organizational owner authority verified → admin granted minimal role → facilitator invitation/verification → participant independently registered/verified → optional affiliation entered (independent) → sponsorship program grant checked → distinct opt-in to any intended data exchange/share → admin sees only authorized aggregate/operational fields. Facilitator can manage selected approved cohort logistics, not private coaching notes unless a *separately approved* future sharing design permits explicitly selected content and recipient rights. No church broadcast, directory identity join or data access inferred by default.

### ForgedLife mapping and audit
Each event records source event ID, originating system, granted purpose, user binding, payload schema version, mapping version, receipt timestamps, verified signature/replay decision, consent reference, access evaluation, processing status, retry/quarantine and deletion lineage. Invalid, unknown identity, ambiguous mapping, missing consent or stale authorization → reject/quarantine without copying participant records. Avoid transmitting scores/private Blueprint by default. One verified test endpoint is not production rollout proof.

### Security tests
Cross-org horizontal/vertical authorization; suspended facilitator; revoked participant opt-in; malicious webhook/schema; duplicate/out-of-order events; ID mapping collisions; leaked link; unverified account; withdrawal while export queued; deletion and recovery; sponsor nonpayment; app flags attempting permission bypass; data minimization, telemetry redaction and provider contractual fit.
