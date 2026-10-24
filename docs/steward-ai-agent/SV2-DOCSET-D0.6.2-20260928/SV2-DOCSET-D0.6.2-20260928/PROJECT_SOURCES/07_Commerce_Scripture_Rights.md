# STEWARD — Commerce, Entitlements and Scripture Rights

**Internal development project:** Steward V2.0  
**Intended engineering handoff:** Steward V1.0 — Initial Full Build  
**Document revision:** Draft 0.6.2 | September 28, 2026  
**Package ID:** SV2-DOCSET-D0.6.2-20260928  
**Status:** FROZEN ENGINEERING-HANDOFF CANDIDATE — DOCUMENTATION/ACCEPTANCE PACKAGE; BEHAVIORAL AND APPLICATION EXECUTIONS NOT RUN; NO PRODUCTION RELEASE

**Authority key.** `OD` identifies current owner direction recorded from the accompanying conversation; `INHERITED` identifies an existing source requirement; `DESIGN` identifies a newly authored implementation contract; `OPEN` identifies a genuine unselected detail or required evidence; `DEFERRED` identifies a capability outside the initial full-build target. Authoring approval is not final document acceptance, an executed test, a license, or permission to process real participant data.

**Read the current sections first.** For this candidate's product design, the scoped owner decisions and changes in master 11 take precedence over the specifically identified earlier product restrictions. Unchanged doctrine, participant agency, safety, privacy, rights and release protections still apply. Original modules at the end preserve their exact source text and historical approval scope; do not load this mixed review corpus wholesale as a runtime prompt.

## M01 — Current commercial direction and source change boundary

**OD-05–11; INHERITED COM/PJ except the scoped changes recorded here and in master 11.** The platform has two Blueprint depths and configurable service entitlements. Products, prices, offers, grants, sponsorships, group membership, consent and participant content remain separate. This candidate expressly includes owner-controlled pricing, discounts, timed and deliberate nonexpiring complimentary access. COM's earlier blanket disabling of those selected mechanisms is historical for this new design; it must not remain the operative rule for the initial full-build target.

This is not a blanket activation of every deferred COM category. Publicly sold lifetime subscriptions, family accounts, direct minor service, affiliate commissions, app-store/reseller billing, financing, multi-currency and unreviewed payment methods are not enabled merely because discounts or no-expiry administrative grants are now in scope. Real payment collection and production enrollment still require applicable controls, qualified reviews, actual tests and release approval.

## M02 — Commercial reference catalogue

Amounts below are the current owner-agreed launch reference prices, not constants to scatter through prompts/code or permanently guaranteed rates. All final prices/terms are retrieved from the published authoritative offer version. An eligible visitor may choose a paid initial offer without first completing an assessment or Free Blueprint.

| Product / offer family | Reference price | Target benefit | Agreement and qualification |
| --- | --- | --- | --- |
| Free Personal Stewardship Blueprint | $0 | Useful Free conversation/build, three-page view and retained Free access under the defined allowance. | No card or recurring agreement. |
| Initial Full Blueprint Build | $149 one time | Initial Full acquisition and bounded guided Build toward the thirteen-page guide. | One-time purchase; preserve the existing 30-calendar-day activation-based Build window, 90-day unused-activation/refund policy and applicable refund controls unless separately changed. No automatic membership. |
| Full Build + first year of Steward Premium | $299 first year | Initial Full plus first-year ongoing Premium support. | CHG-DEC09-001 product terms approved: $199 annual renewal until canceled, plus applicable tax, from the explicit activation anniversary. Use M11 for all exact terms; do not reuse the legacy nonrenewing checkout contract. Actual clearance/implementation/tests/release remain open. |
| Steward Premium monthly continuation | $19/month | Ongoing Living capabilities and refinement of a validly acquired Full Blueprint. | Express recurring authorization until canceled; valid initial Full acquisition and existing timing/duplicate guards. |
| Steward Premium annual continuation | $199/year | Annual ongoing Living capabilities and refinement. | Express recurring authorization until canceled; same qualification/duplicate protections. |
| Individual, sponsor, scholarship or Inner Circle grant | Configured by authorized administration | Explicit Free / Full / Premium / named-benefit components and period, potentially no scheduled expiry. | A no-card grant is not recurring-payment consent. |

**The $299 distinction matters.** The older `BUILD_LIVE_299_Y1` is prepaid and nonrenewing; preserve every actual purchased snapshot. CHG-DEC09-001 selects a **new immutable offer version** with $299 initial and $199 annual renewal, plus applicable tax. M11 defines the approved product schedule. Owner approval does not publish the catalogue, establish participant assent or authorize billing. The configuration example now records the selected terms and remains production-disabled for required implementation, qualified reviews, tests and release.

The current monthly/annual prices are continuation prices; no independent owner decision removes the initial Full acquisition requirement. Do not sell a $19 initial-Full shortcut merely because direct-to-paid entry is permitted. Conversely, do not ask a valid Full owner to buy Full again at an annual review, new season or return after expiry. A Full-included authorized complimentary or sponsored grant can legitimately establish acquisition without payment.

## M03 — Generic products, immutable offers and benefits

**INHERITED COM §§2–5; DESIGN naming and publishing.** Use stable keys such as `full_blueprint_build`, `steward_premium`, `build_plus_first_year` and independent `offer_version_id` values. Historical numeric keys remain traceable aliases; a price change must not require renaming the product or modifying a language-model prompt.

An offer version records currency/integer minor units; purchase versus recurring nature; term and renewal phases; effective start/end; eligible audiences/channels; initial-Full qualification; benefit template/version; access activation/expiry rules; tax/disclosure/refund/cancellation policy versions; selected usage allowance; any promotion rule; approval reference; and release status. Existing orders always retain their purchased snapshot. The new DEC-09 example uses `build_plus_first_year_recurring_v1` as a DESIGN identifier linked to CHG-DEC09-001; its product terms are approved while the physical/provider schema and release remain unverified.

A benefit template defines capabilities separately from pricing. A membership grant may include Full acquisition, a Build window, Living service and optional additional benefits; each component is explicit. A sponsored or discounted participant receives the same capability when its grant is equivalent—not reduced dignity or hidden lower-quality guidance. An entitlement never approves private wording or broadens data permissions.

## M04 — Owner administration: prices, discounts and access

**OD-09; DESIGN.** Provide a protected owner console, not code edits or a fake coupon for every exception. Mike's assigned owner role may create and publish permitted offer/grant configurations through audited controls. Operational delegation follows bounded templates, role limits and independent review of exceptions; a developer's access is not unrestricted business authority.

Support percentage discounts from 0–100%; fixed-dollar discounts; custom prices; product-specific or bundle-specific offers; free access; fixed dates; durations expressed as days/months/years with defined calendar semantics; and an expressly selected no-scheduled-expiry grant. Support one person, a batch, a campaign, a sponsor program or an eligible group. One approved template may be issued to many eligible people without repeated individual owner approval.

Every configuration specifies what is discounted, for which product, who is eligible, redemption quantity/per-person limits when relevant, stacking/precedence, first payment versus recurring duration, activation window, access duration and what happens afterward. A 50% first-year discount must not be presented as 50% forever. A fixed discount cannot make the payable subtotal negative. Percentage arithmetic/rounding/taxes use deterministic reviewed rules, not model reasoning.

**No-expiry grant.** Store an explicit expiry kind and authorizing record; do not interpret a blank end date as permission. Explain that no scheduled expiry applies to the stated product/service grant under its disclosed terms—not a guarantee that the company, product or specific model exists forever. Ordinary valid access remains honored; suspension/revocation requires the applicable disclosed authority and audit. No-expiry access does not authorize indefinite retention of every private conversation.

For 100%-off or free-period access, prefer a true no-card administrative/sponsored grant where that is the intended promise. A recurring subscription discounted to zero can still have future charges; it is a different offer and requires explicit future-price/term assent. Without that assent, expiry returns to permitted Free/retained-content access, never a charge. Existing independently authorized paid agreements require explicit overlap handling; a free grant must not silently cancel, stack or extend them.

## M05 — Price changes without hidden contract changes

**OD-09/14; INHERITED COM D10.** An admin changes the reference price by creating and publishing a new effective offer version. Preview website, chat cards, checkout, receipts and account displays from the same catalogue. Do not publish a price in one place while checkout uses another.

For existing subscriptions the owner may keep the old price, propose a new price at a future renewal/date, or retire a product under reviewed terms. Honor the paid-through period. Under the inherited D10 choice, a higher renewal price or changed cadence requires fresh affirmative participant acceptance; absent acceptance, stop renewal at the existing term's end rather than silently charge more. A lower price follows the approved notice/legal/tax rules without unnecessary repeat consent. There is no permanent grandfathering promise unless the actual offer grants one.

Group membership, feature flags or marketing experiments may select only published eligible offers. They cannot secretly alter an existing agreement, discriminate based on private struggles or use church affiliation as an inferred willingness-to-pay variable. Pricing experiment participation and personal guidance remain separate; display the real payable terms before assent.

## M06 — Secure in-chat upgrade and return

**OD-06; DESIGN with COM §§6–11/21.** The chat's “Upgrade Now” or “View options” control calls a server-authorized offer/checkout route. The assistant supplies at most the requested capability or approved offer reference; the server supplies identity, eligibility, price and return route. Hosted payment collection stays outside conversational text.

State flow: offer viewed → participant selected → exact quote/recurring terms affirmatively accepted → order reserved → checkout created → payment pending/failed/canceled/confirmed → participant-bound pending entitlement committed → **Activate Premium and continue with Steward** → server activation committed → access projection refreshed → resume authorized work. The explicit activation step applies to the new initial bundle; other offers retain their own clocks. Payment or browser return alone never activates Premium. No browser return, fabricated receipt, screenshot, client flag or model message can grant access.

Idempotent order/attempt and provider-event handling prevent duplicate charges/grants. Recheck qualification, overlap, security and source validity under the applicable transaction controls. A timeout remains unknown until reconciled. If payment succeeds but access fails, show pending resolution and use the existing correction/refund process; do not charge again. A canceled checkout returns to useful current access without extra selling.

Resume uses the participant-bound workflow bookmark and legitimately retained context described in master 05, not private data in payment metadata. A return to the same conversation within its valid session should feel continuous. Cross-session resumption must honor the reviewed raw-history policy and any explicit selected summary; no secret retention extension.

## M07 — Sponsorship and church configuration

**OD-09/13; INHERITED COM §16/PJ §16.** Use organization → program/campaign → versioned offer or grant template → participant entitlement. Never implement `if church_name == Compass` to grant benefits. Church affiliation alone is not sponsor enrollment or entitlement eligibility.

Keep the specific approved Compass examples: participants receive Full Build plus 60 calendar days of Steward from confirmed post-study activation; facilitators/leaders receive Full if needed plus 12 calendar months from activation. No card and no automatic paid renewal. These are program versions, not universal church rules. Owner-approved subsequent versions can configure other durations or benefits while honoring existing promised intervals. No actual Compass launch, seat price or sponsor invoice is created by this ZIP.

A sponsor may pay centrally under a specific contract. Unused-seat rules, funding, activation, quantity and remedies are program-specific. Preserve existing protections against billing the participant for sponsor debt and exposing private activity to resolve sponsor nonpayment. Church-admin communication, events, notifications, resource feeds and deeper church dashboards are deferred; the SB owner’s protected grant administration is not that church integration.

## M08 — Inner Circle, referrals and promotions

**OD-08/11/12; DESIGN.** Mike's Inner Circle is a generic configurable membership/benefit program, not a hardcoded separate app or mandatory new public paid tier. Assign group membership and benefit grants independently. Publish only selected, available resources/events/offers. Quarterly gatherings and early access are possible benefits, not prebooked promises or personal crisis access to Mike.

Basic referral links launch without monetary incentive. Any later referral reward needs an explicit reward policy, entitlement and cost treatment, abuse controls, disclosure and applicable review. No affiliate commission, free month, private conversion dashboard or public testimonial is implied. The referrer never acquires access to another participant's record.

Apply the single promotion budget in master 03 to upgrade and referral prompts, banners and optional commercial reminders. No private life information goes to commerce, Stripe, marketing tools or a promotion engine. A free-access scholarship can be offered through an independently authorized participant-requested route; do not infer hardship from intimate conversation and automatically target a sales offer.

## M09 — Cancellation, refunds, expiry and ownership

Retain COM's detailed cancellation, grace, refund, dispute, overlap, tax-review and customer-rights controls except where a precisely selected new offer changes a term. CHG-DEC09-001 explicitly selects the new recurring first-year cancellation/refund/activation rules in M11, including the first-renewal grace extension. Apply that new offer version only; preserve legacy agreements. Qualified review and actual implementation evidence are still required before publication.

Cancel subscription, end service immediately, remove a grant, delete saved content and close the account are different actions. Provide a clear direct cancellation route, truthful pending/confirmed status, and no forced chat with a retention agent. Do not require explanation, testimonials, referrals or deletion of the Blueprint to cancel. Ending paid/sponsored access alone preserves the participant's legitimate retained Blueprint and Free rights. Account/security restrictions and legally reviewed retention remain separately applicable.

Preserve grant-source independence: an expired sponsor grant does not cancel a valid paid subscription; a refund does not erase independently approved content; a winning dispute does not restart canceled billing. Never reinterpret a participant's “yes” to a Blueprint proposal as recurring-payment consent.

## M10 — Unit economics and usage configuration

**OD-18; INHERITED ADMIN cost controls; DESIGN modelling.** Build economics around actual paid, discounted, complimentary and sponsored cohorts rather than a single headline subscription price. Store issued grants and service costs separately from cash receipts. A 100%-discount or no-expiry grant may create ongoing cost even without revenue; show that explicitly in owner reporting without inspecting private conversations.

Use these management calculations, not guaranteed margins:

- Net revenue for a period = recognized gross revenue less discounts, refunds and applicable adjustments; taxes collected for remittance are not operating revenue.
- Contribution = net revenue less payment, model/API, hosting/storage, messaging, directly attributable support and other delivery costs. Use a reviewed accounting basis; cash prepayment and recognized recurring revenue are not interchangeable.
- Cost per active participant = actual attributed delivery cost / the defined active-participant denominator; report free, paid, sponsored and nonexpiring-grant populations separately.
- Revenue from a $299 initial package is not automatically $299 of repeatable annual recurring revenue. A modeled renewal assumes actual renewal terms and retention; neither is proven by a sponsored cohort.

Reference arithmetic: $199/year averages about $16.58/month before costs; $19 monthly for twelve paid months totals $228. These are arithmetic equivalents, not a discount promise, tested conversion rate or current provider-cost estimate. No customer count is a validated server-capacity result.

Usage allowances, expensive-operation limits and budget/retry controls are configurable and disclosed. Exact numerical allowances and production cost ceilings remain OPEN; do not advertise unlimited usage or inherit retired research/addendum credit numbers. Before public release, measure representative Free builds, Full builds, ordinary Living conversations, multi-specialist decisions and annual reviews, including retries and support. Fair-use enforcement cannot block necessary safety resources, cancellation, rights requests or retained-content access as leverage to buy.

## R01 — Scripture/publication module remains separate and unchanged

**INHERITED RIGHTS D01–D06.** Commerce and rights share a file for navigation, not authority. Preserve the complete RIGHTS module and its test/review registers. NIV is the preference; the present production-design posture is Scripture reference plus original Steward explanation until exact-use scope is actually cleared. There is no automatic alternative translation or near-verbatim workaround.

Exact text, reference, participant significance and rights metadata remain separately controlled. Paid membership, a no-expiry grant, church sponsorship, participant approval, an original manuscript or a copied quotation does not establish model-input, dynamic-output, export, email or recorded-event permission. This package carries older research as dated source content; it performs no new licensor/vendor/legal verification and claims no license.

## R02 — Rights and commercial evidence not supplied by a document

Preserve COM CE01–CE50/RG01–RG30 and RIGHTS SR01–SR32/PG01–PG16. New D02 test cases supplement them. Exact processor accounts, tax classifications, contracts, usage quotas, renewals, publication permissions and specialist approvals require real evidence. The AI cannot grant an exception to any of those controls.

## M11 — Approved DEC-09 product terms and activation contract

**Authority:** OD-20 / CHG-DEC09-001, approved by Michael J. Gauthier on September 26, 2026 for incorporation into the next documentation candidate. **Product terms:** APPROVED. **Configuration schema/provider mapping:** DESIGN. **Qualified review:** OPEN. **Behavior/application tests:** NOT RUN. **Live billing/release:** NOT AUTHORIZED.

| Topic | Approved product term |
| --- | --- |
| Initial price | USD 299.00 base plus applicable tax, with the actual total displayed before authorization. No invented $149/$150 accounting allocation. |
| Eligibility | Initial Full has not already been validly acquired; verified participant identity, current qualification and overlap checks. An assessment or completed Free Blueprint is not required. |
| Recurring authorization | Checkout separately and conspicuously records assent to $299 now and $199 annually beginning 12 calendar months after explicit activation, unless canceled. No preselected consent or marketing bundle. The activation action confirms the actual first renewal date and the same accepted terms. Payment or approval of Blueprint wording alone is not authorization. |
| Activation | After confirmed payment and committed pending entitlement, the participant chooses **Activate Premium and continue with Steward**. This explicit action is available in the return flow; there is no assessment requirement, intake restart or separate onboarding detour. Activation remains available within 90 calendar days of confirmed initial payment. Activation requires confirmed payment, committed benefits and available authorized service. No background activation from purchase, first login, assessment completion or a webhook. |
| First service term | At activation A, begin one 30-calendar-day Build window and one 12-calendar-month Premium interval concurrently. The Build period is inside the paid year. Ongoing Premium can refine or finish the same acquired Full Blueprint after the Build window without another Build charge. |
| Anniversary | First renewal at A + 12 calendar months; then annual renewal on the governed anniversary. Use the existing calendar arithmetic, last-valid-day handling, recorded offer timezone and start-inclusive/end-exclusive intervals. Initial configuration: America/Phoenix, UTC instants stored. Changing display timezone does not move the purchased interval. Reconcile actual provider invoice periods to the configured promise. |
| No activation | Full refund available before activation. At the end of the 90-day window, initiate a full refund for a genuinely unused/unactivated purchase and stop any pending future-renewal instructions. A failed refund remains an unresolved money/service obligation. Activation and refund processing must be mutually exclusive. |
| Cancel renewal | Available directly in account controls from purchase onward, including before activation. Confirmed cancellation prevents future charges. By default it preserves the already-purchased service: before activation, the right to activate within the original window; afterward, access through the confirmed paid-through date. Activation never re-arms canceled renewal. Immediate termination, refund and account deletion remain separate actions. |
| Initial package refund | Full refund before activation or when requested within 14 calendar days after activation, including meaningful use. No routine partial package allocation. A confirmed full unwind ends only package-funded grants and that acquisition’s qualification; it must also stop associated future renewal. Created Blueprint content, Free access and independently valid grants remain. Cancellation and refund still have separate requests, operations and receipts. |
| Annual renewal refund | Full refund of the affected renewal charge if requested within 14 calendar days of that charge. Its confirmed refund removes that continuation interval, not the previously valid initial Full acquisition. Display and confirm future cancellation separately; a refund receipt alone is not proof billing stopped. Outside ordinary windows, retain existing error, undelivered-service and mandatory-remedy handling. |
| Failed renewal | Explicitly apply the existing fixed seven-calendar-day grace policy to the first $199 renewal after the bundled year, as well as subsequent annual renewals. No grace for an unsuccessful initial purchase. Retries cannot restart grace; unresolved grace ends in Free/retained-content access and the reviewed collection disposition. |
| Notices | Selected product default: a factual annual renewal notice 30 calendar days before renewal, an activation receipt showing the exact first renewal date, and a receipt after each confirmed charge. Actual legally required timing/channel/acknowledgment rules remain release review, not certified here. Billing notices are separate from optional marketing and the month-11 review. |
| Cadence changes | An eligible participant may deliberately select the published $19/month continuation for the end of the paid annual term, with fresh cadence assent. No routine midterm proration, overlapping agreements or automatic monthly fallback after a failed annual charge. |
| Later prices | Purchased terms are immutable. Higher renewal price or cadence change requires fresh affirmative acceptance; without it, stop renewal at the current term’s end. The selected $199 renewal price is not a lifetime price guarantee. |
| Discounts and grants | Existing configurable mechanisms remain. Each discounted offer explicitly states whether the reduction applies to the initial charge, renewal charges or a limited duration. No-card grants remain independent and nonbilling; group membership cannot turn them into this offer. |
| After paid service ends | Retain legitimately created Blueprint content, secure eligible viewing/export and useful Free access under existing policy. No annual repeat Build charge, forced new Blueprint, deletion for nonrenewal or promotion of content/definition states. |

Example for date interpretation only: purchase October 1, activate October 20; Premium runs October 20 to the following October 20, and renewal is due at that service anniversary. The purchase date is not the annual billing anchor. No actual transaction or account is implied.


**Approved activation experience — CHG-DEC09-001.** After the application confirms payment and commits the participant-bound pending entitlement, show **Activate Premium and continue with Steward** within the return-to-work flow. Show the actual proposed Build/Premium dates, first renewal date and accepted renewal terms beside that action. The participant's explicit action authorizes activation; only the server's idempotent activation commit starts the clocks and permits active-Premium success wording. No additional assessment, repeated intake, second account or restart of approved work is required. If the participant starts later, the original activation window remains. If service is unavailable, payment/entitlement is uncertain or activation fails, do not consume service time or invent success; preserve permitted existing access and reconcile the same operation. A canceled renewal mandate is never re-armed by activation.

**Continued building during Premium.** The 30-calendar-day initial Build window is a distinct service component inside the first year. During active authorized Premium, participants may continue building, complete unexplored Full areas and refine their same acquired Blueprint. Day 30 is not a freeze, forced completion deadline or another Full purchase. No new initial Build grant, silent content approval or compulsory fresh interview is created. Existing limits, participant approval and safe access requirements continue.

**Scoped inheritance.** COM D02/§§2.1,5.2,6.1,11.3,14.2 and CE04 remain the preserved legacy contract. The new recurring offer uses this current supplement under AMD-04. Apply D01/D08 activation/initial-refund protections expressly to it and D07's seven-day grace expressly to its first and later annual renewals. COM D03–D06 and D09–D14 remain where unchanged. Do not change historical source text, infer tax allocation, bypass initial Full acquisition, or turn an unactivated payment into a running subscription clock.

**Application evidence.** One initial payment, one recorded recurring mandate, one activation event and source-specific grant intervals must reconcile. Implementation must not create overlapping provider schedules or orphan future charges. All disclosures/receipts/statuses come from actual confirmed facts. No amount, anniversary, discount or access write is authorized by the model. Required review gates and usage settings remain explicit.

**Tests:** DEC09-T01–T12 and the mapped D02/COM regressions in master09. CE04 remains the legacy nonrenewing test; DEC09-T05 covers new recurring behavior.


## M12 — Batch 01 commercial presentation clarification

**OD-22 / CHG-B01-UX-ACTION-001; DESIGN, commerce behavior NOT RUN.** Commercial presentation should be useful and noncoercive. Annual Premium continuation may be presented as the preferred or more economical cadence only when the authoritative offer catalogue supports the displayed terms and the participant is eligible. The $19/month continuation option remains clearly available where approved and eligible. A monthly choice is respected without repeated pressure, hidden friction or spiritual framing.

Do not change CHG-DEC09-001: the new initial bundle remains USD 299.00 base plus applicable tax, then USD 199.00 annually beginning 12 calendar months after explicit activation unless canceled, with the approved activation, refund, cancellation, grace, disclosure and purchased-term protections in M11. Do not invent a $19 initial-Full shortcut, alter the $149 one-time Build, convert legacy nonrenewing $299 agreements, or treat a no-card grant as recurring-payment consent.

Savings comparisons must use deterministic catalogue values and clear intervals. A statement such as annual being less than twelve monthly payments is arithmetic only, not a guaranteed discount forever, a pressure tactic, or a renewal-price promise. Pricing and access displays remain application-confirmed; the language model must not improvise current availability, discounts, taxes, eligibility or checkout status.



## M13 — Batch 02 retained-Full and active-service boundary

**OD-24 / CHG-B02-FREE-SCOPE-EVIDENCE-001; DESIGN, commerce/application tests NOT RUN.** Preserve the existing access matrix: retained Full content is not erased when paid service ends, but Free scope is bounded useful Free support rather than unrestricted Full Build or Premium/Living conversation. An already qualified Full owner must not be forced to repurchase initial Full solely because Premium expired; however, ongoing guided redevelopment/refinement across Full areas requires an active Premium/Living entitlement, active Build entitlement, or equivalent valid grant.

Annual-preferred/monthly-clearly-available presentation remains unchanged. Boundary explanations are access explanations, not renewed sales invitations after refusal. Exact quantitative usage allowances, operation limits and fair-use thresholds remain separately approved configuration and are not selected by this package.

# Full preserved source modules

**Preservation boundary for Draft 0.6.2:** Every BEGIN_SOURCE/END_SOURCE body below is preserved unchanged from the fixed Draft 0.4 / Compact C2 active source baseline used for this pre-installation correction. Original version labels and source-local approval/history claims remain historical evidence. Current product-design amendments appear above and in master 11. A preserved statement that a capability was once deferred does not undo a specifically recorded newer owner direction; a new design does not waive inherited safety, privacy or rights controls. This ZIP includes the active Draft 0.4 source masters used as baseline and reviewed Draft 0.5, 0.5.1, 0.6 and 0.6.1 packages as history where available; it does not claim to contain unavailable external native/archive bytes except where explicitly listed in the package manifest.

**Native-file limitation:** Draft 0.1's module metadata sometimes says that native files, artwork and earlier QA exist elsewhere. This corrected package does not claim to contain unprovided native originals or external archives. Consult `MANIFESTS/Companion_Asset_Disposition.md`, `EVIDENCE/Native_Source_Availability.json`, and `SOURCE_COMPLETENESS.md` for what is actually included, preserved externally, or unavailable. Source-body preservation is not a re-audit of every original page or a rights clearance.

## Preserved source module COM
**Original source:** `P1-04_P1-05_P1-06_Commerce_Entitlements_v0_1_APPROVED_STANDARD.docx`  
**Original status:** Approved September 12, 2026; D01–D14; implementation/testing unverified  
**Source class / role:** GOVERNING SOURCES / Issue-specific source; see original status and scope  
**Preservation form:** Original file bytes plus full structural text  
**Input SHA-256:** `250c75590d229cb1e3311966b8789055867ceb6162f5bd46df989dbb40089d6b`
The source text below retains its own original terminology, approval labels, internal references and limitations. The draft wrapper does not upgrade it or adopt superseded references as current. Figures and native page layout remain in the preserved original; reference assets are not runtime-approved content.
<!-- BEGIN_SOURCE COM -->

<a id="COM-B0001"></a>
P1-04 + P1-05 + P1-06

<a id="COM-B0002"></a>
COMMERCE, PAYMENTS
+ ENTITLEMENT
STANDARD v0.1

<a id="COM-B0003"></a>
Status: APPROVED COMMERCE, PAYMENTS + ENTITLEMENT STANDARD

<a id="COM-B0004"></a>
Document owner: Michael J. Gauthier
Prepared: September 12, 2026
Approved by: Michael J. Gauthier
Approval date: September 12, 2026
Scope: Product development, commercial architecture, entitlement implementation specification and release governance
Intended reviewers: Mike; Jeremy / engineering; commercial and subscription counsel; tax CPA / tax counsel; privacy, payment-security and independent security reviewers
Implementation status: UNVERIFIED — no implementation evidence reviewed
Acceptance-test status: ALL NOT RUN
Release status: NOT AUTHORIZED — all applicable gates remain open

<a id="COM-B0005"></a>
### Document control and reading guide

<a id="COM-B0006"></a>
This approved standard records Michael J. Gauthier’s governing owner directions D01–D14 and the applicable approved technical implementation requirements, entitlement architecture, payment-to-entitlement controls, commercial audit requirements, CE01–CE50 acceptance-test specifications and RG01–RG30 release-gate structure within its stated scope. The approved commercial model and the final owner-approval draft’s substantive directions and architecture are preserved; no existing governing source is amended. Approval of an architecture or policy is not evidence that it is deployed, tested, legally sufficient, tax-compliant or PCI-validated. This standard does not authorize real participants, live consumer payments, sponsor billing, refunds against real accounts or any recurring enrollment. [OD-APP; OD-REV; BRIEF; PJ §1; P1-01 M–N; PRIV approval scope]

<a id="COM-B0007"></a>
Sections 1–28 follow the requested workstream topics. Appendix A is the owner decision matrix; B is the professional-review register; C is the engineering handoff; D is the executable acceptance-test specification; E is the release-gate register; F lists disabled capabilities; G records governing-source and research traceability. D01–D14 are approved owner directions within this standard’s stated scope. No approved direction is a live participant promise until reviewed where required, implemented, tested and separately released. Unselected recommendations and retained alternatives remain unapproved unless separately identified as approved. The prior September 12, 2026 research snapshot is carried forward without new outside research or re-verification in this approval finalization. The DOCX and Markdown are matching format copies of the same approved standard, not separate authorities. [OD-APP]

<a id="COM-B0008"></a>
#### Authority and evidence labels

<a id="COM-B0009"></a>
| Label | Meaning in this standard | Effect |
| --- | --- | --- |
| AP | Existing approved product rule or owner direction, with source | Remains governed by that source; not reopened here. |
| OP | Owner-policy recommendation / alternative | Unselected recommendation or retained alternative only; not approved. Approved D01–D14 directions are identified separately as OD. |
| OD | Approved owner direction | D01–D14 are approved by Michael J. Gauthier on September 12, 2026 within this standard’s stated scope. All applicable professional, implementation, testing and release gates remain open. |
| TC | Approved technical implementation/control requirement | Approved implementation/control requirement within this standard’s applicable scope. Implementation and testing remain unverified until actual evidence exists. Requirements already approved in P1-01/PRIV remain governed there. |
| CL | Conditional legal or tax requirement / applicability question | Requires qualified analysis of actual facts, jurisdiction and current law. |
| RV | Required qualified professional review | Remains OPEN; owner approval does not satisfy this qualified professional-review requirement. |
| EV | Actual implementation/testing evidence only | Actual candidate-specific implementation/testing records only. Specifications and assertions are not evidence and do not establish execution or success. |
| RG | Approved release criterion | Approved release criterion that remains OPEN until actual evidence closes it for the applicable level; does not authorize release itself. |
| FD | Future/deferred/disabled capability | Remains disabled until separately approved and released. Schema support, vendor availability or approval of this standard does not enable it. |

<a id="COM-B0010"></a>
“Must” in a TC paragraph specifies an approved implementation/control requirement within this standard’s applicable scope; it does not claim implementation or testing. Mixed paragraphs distinguish existing AP boundaries, approved OD directions and unselected OP alternatives. Approval of an owner direction is not permission to enable a route. Unapproved policy, unresolved required configuration or an unmet applicable gate must keep the affected commercial route blocked, not produce a guessed default. EV remains actual implementation/testing evidence only; specifications do not become evidence. RG identifies an approved release criterion that remains OPEN until actual evidence closes it. CL requires qualified legal/tax analysis; RV remains open; FD remains disabled until separately approved and released. Commerce D01–D14 are this standard’s decision IDs; safety-standard D01–D08 retain their separate approved authority under SAF. Source references such as [PJ], [OD-APP], [OD-REV] and [ST01] resolve in Appendix G. [OD-APP]

<a id="COM-B0011"></a>
#### Source-status precision

<a id="COM-B0012"></a>
P1-01 is approved September 11, 2026. P1-02/P1-03 is approved September 12, 2026; its O01–O13 directions and applicable technical controls govern within scope. Older Source Register/Context queue entries cannot reverse later explicit approvals. Operating Instructions v0.4 supersedes general v0.3; the separate Sensitive Conversations & Safety Standards remains v0.3. [P1-01; PRIV; OI4; SR4]

<a id="COM-B0013"></a>
The canonical current safety/release source is P1-07_P1-08_P1-10_Safety_Support_Release_v0_1_APPROVED_STANDARD.docx, with status APPROVED SAFETY, SUPPORT + REAL-PARTICIPANT RELEASE STANDARD, approved by Michael J. Gauthier on September 12, 2026. Its approved text, including the D02 Autonomous Steward direction, governs within its stated scope. This replaces the prior draft-artifact/conversation-workaround treatment; it does not modify the safety standard. Its PS tests, implementation, specialist reviews, release gates and real-participant authorization remain uncompleted/unverified by this revision. [SAF §§0.2–0.5, 7.2, 16–18; SAF Appendices D–F; OD-REV]

<a id="COM-B0014"></a>
The approved Statement of Faith is preserved unchanged by reference under current OI4/SR4 routing. Its standalone full text did not surface in the original workstream’s retrieval; no fresh doctrinal interpretation or purported full-text re-review is made here. Legacy authority is preserved, including the source-register treatment of stale creator-review metadata. [SF; LG; OI4 §2; SR4 §4]

<a id="COM-B0015"></a>
### 1. Approved commercial model and invariant boundaries

<a id="COM-B0016"></a>
#### 1.1 Approved launch/pilot catalogue prices

<a id="COM-B0017"></a>
| Approved offer | Price, USD | Approved commercial scope |
| --- | --- | --- |
| Free Personal Stewardship Blueprint | $0 | Genuinely useful whole-life starting Blueprint. |
| Full Blueprint Build | $149 one time | Guided initial Full Build, approximately 30 days. No automatic recurring subscription. |
| Build + Live With Steward | $299 first year | Full Blueprint Build plus 12 months of Steward. |
| Ongoing Steward after Full Build | $19/month | Qualified continuation, not a substitute initial Full Build purchase. |
| Annual Steward | $199/year | Qualified annual continuation / current pilot annual renewal structure. |

<a id="COM-B0018"></a>
[AP; OD D11 — APPROVED] These are approved launch/pilot prices within Product Journey’s scope, not permanent guarantees. The approved base prices are unchanged. D11 approves base price plus applicable tax, with the exact total shown before affirmative payment authorization; that approved direction does not determine taxability, classification, rate, sourcing or registration obligations. No invented reference price, crossed-out discount or claim of guaranteed lifetime renewal pricing is permitted. [PJ §§7, 16; CTX3 §7; BRIEF Part 1; OD-REV D11]

<a id="COM-B0019"></a>
[AP] There are only two Blueprint depths: Free and Full. Template v4’s three-page Free and thirteen-page Full exports are presentations of the same participant-owned living guide, not eligibility credentials or separate records. Upgrading continues approved prior work without restarting intake. Product modes—Free Build, Full Build and Living Mode—are distinct from conversation style and from payment state. No Essentials/middle tier is introduced. [T4; PJ §§2–5]

<a id="COM-B0020"></a>
#### 1.2 Governing separation

<a id="COM-B0021"></a>
PAYMENT ≠ ENTITLEMENT ≠ BLUEPRINT OWNERSHIP ≠ CONSENT ≠ SHARING PERMISSION.

<a id="COM-B0022"></a>
[AP + TC] Stripe supplies authoritative provider payment/subscription facts. MJG’s protected Supabase-backed entitlement service applies approved rules to those facts and approved grants. The Blueprint domain retains participant content and approval history independently. The consent/permission domain governs processing and sharing independently. The AI consumes only the minimum confirmed access context; it cannot determine or write payment, grant, refund, renewal, eligibility or sharing authority. [PJ §18; P1-01; PRIV §18.3; BRIEF]

<a id="COM-B0023"></a>
A paid invoice does not itself authorize a conversation; account security, enabled capability, consent and release controls still apply. An unpaid participant may be properly sponsored or complimentary. A payment reversal does not erase the Blueprint. A valid subscription does not permit a sponsor, spouse, staff member or processor to read private content. An approved Blueprint wording change still requires the participant-content approval flow, never a webhook. [P1-01; PRIV; T4]

<a id="COM-B0024"></a>
[AP] Free value must precede ethical invitations. Do not sell using distress, safety signals, low Check-In scores, grief, shame, abuse, addiction/compulsion, inferred hardship, health conditions or spiritual doubt. Payment never establishes spiritual worth, salvation, faithfulness or greater access to core Legacy understanding. Theology, living Legacy and voluntary formation remain governed by SF/LG, not commercial packaging. [PJ §§8, 20–21; OI4; SC3; LG]

<a id="COM-B0025"></a>
### 2. Canonical product and entitlement catalogue

<a id="COM-B0026"></a>
#### 2.1 Catalogue structure

<a id="COM-B0027"></a>
[TC] Use stable internal product_key, immutable offer_version_id, independently versioned benefit_template_id, and environment-specific Stripe Price mappings. A product describes the service; an offer describes purchasable terms; a benefit template describes access scope and clocks. Amounts use integer minor units, never floating point. Currency is explicitly USD for these offers. Tax amounts, payment fees and accounting allocations are separate from the approved base price.

<a id="COM-B0028"></a>
Every offer version records approval reference, eligible release level/geography, eligibility predicate, display wording, one-time/recurring nature, exact benefits, activation policy version, term/cadence, renewal policy, refund policy, tax configuration, disclosures/terms versions, effective dates, allowed channels and enabled flag. Existing purchases retain their purchased version. Editing a dashboard description or Price must not silently rewrite existing contracts.

<a id="COM-B0029"></a>
| Product / offer key | Entitlement components | Payment agreement and eligibility |
| --- | --- | --- |
| FREE | Free Blueprint workflow/access within approved Free scope | No payment or Stripe Customer required. |
| FULL_BUILD_149 | Qualifying Full acquisition + initial Build-window grant | One-time $149; only when initial Full is not already validly acquired, except a separately approved exception. |
| BUILD_LIVE_299_Y1 | One qualifying Full acquisition, one initial Build window, one 12-month Steward interval | $299 one-time prepaid first-year package. OD D02: no automatic recurring agreement or renewal; later $19/month or $199/year requires a new affirmative choice. OD D03: not sold to an already qualified Full owner. |
| STEWARD_MONTHLY_19 | Steward continuation for each verified entitled billing interval | $19 recurring monthly; qualifying Full history required; D04 timing and duplicate guards apply. |
| STEWARD_ANNUAL_199 | Steward continuation for each verified entitled annual interval | $199 recurring yearly; same qualification and duplicate guards. |
| COMP_ADMIN | Explicitly selected subset of Free, Full acquisition/Build and/or Steward | Approved bounded internal-pilot, complimentary or manual-grant template under D13; ordinary issuance within its limits does not require individual Mike approval. No payment object. Exact scope/dates required. |
| SCHOLARSHIP | Benefits from an approved scholarship template | No participant card or automatic billing. Program authority/budget required; not AI-inferred. |
| SPONSORED_PARTICIPANT | Benefits from a specific approved sponsor program version | Sponsor agreement is separate; participant has no payment obligation merely from activation. |
| SPONSORED_LEADER | Separately approved leader/facilitator configuration | Full only if needed; exact leader duration is program-specific. |
| PROMOTIONAL_GRANT | Reserved grant type only | FD until a separately approved promotion and release enable it. |

<a id="COM-B0030"></a>
[AP + TC] Compass is a specific approved configuration: participants receive Full Build plus 60 days of Steward from confirmed post-study activation; leaders receive Full Build if needed plus 12 months from activation. No card and no automatic paid renewal. Do not copy these benefits into another organization’s default template. No seat prices or sponsorship cost assumptions are approved here. [PJ §16]

<a id="COM-B0031"></a>
#### 2.2 Disabled catalogue records

<a id="COM-B0032"></a>
[FD] Family plans, employer plans, lifetime access, gifts, public trials, coupon-driven offers, creator bundles, app-store billing, reseller/marketplace collection, affiliate commissions, multi-currency, buy-now-pay-later, installment plans and other offers remain unavailable until separately approved and released. A schema enum is not a saleable offer. Initial storefront, backend, Stripe portal, dashboard permissions and deep links must all deny disabled types.

<a id="COM-B0033"></a>
### 3. Entitlement state model and Supabase record contract

<a id="COM-B0034"></a>
#### 3.1 Separate record families

<a id="COM-B0035"></a>
[TC] Implement these as logical records within the P1-01 modular architecture, not a requirement for separate microservices. Billing and entitlement classes remain distinct from private Blueprint, assessment, conversation, approval and sharing records. [P1-01]

<a id="COM-B0036"></a>
| Record | Minimum facts and constraints | Authority / permitted writer |
| --- | --- | --- |
| Participant and verified identity links | Canonical participant ID; verified auth subject(s); link/merge history; account-security state | Identity service / reviewed merge operator. |
| Provider customer map | Participant or sponsor subject; Stripe account; test/live mode; Customer ID; mapping history | Restricted commerce service; unique provider object mapping. |
| Product, offer version, benefit template | Approved scope, price, eligibility, clocks, terms and release flags; grant templates also record eligible population, Full inclusion, duration, activation, quantity/budget limits, delegated issuer and exception boundary under D13 | Catalogue publisher under approved change control; ordinary grant issuance cannot alter the approved template. |
| Order and payment attempt | Offer snapshot; participant; quote; amount/tax/currency; state; one immutable purchase intent; provider IDs; request hash | Commerce service; retry is not a new purchase. |
| Payment agreement | Recurring authorization record, cadence, provider subscription, next-term intent, cancellation request/confirmation | Commerce service from participant action + verified provider facts. |
| Payment/invoice fact | Provider fact ID, amount, status, invoice service interval, source event/retrieval, as-of time | Verified provider adapter. Cannot itself grant access. |
| Refund / dispute case | Requested vs provider-confirmed state; amount; affected transaction; policy decision; reviewer; deadlines | Billing roles through constrained commands. |
| Benefit grant | Participant, source, template, scope, validity interval, lifecycle, activation, supersession/revocation provenance | Entitlement transaction service only. |
| Full qualification record | Acquisition source; valid, review-held or revoked status; decision basis; effective date | Entitlement service; not derived from PDF or content completeness. |
| Blueprint record / ownership relationship | Participant’s continuing guide and approved content/history | Existing Blueprint domain; never writable by commerce worker. |
| Sponsor agreement / allocation | Organization, approved program, seats, benefits, contract, payment facts, internal allocation identifiers | Authorized sponsor administration; privacy-limited reporting. |
| Commercial inbox / outbox / audit | Event identity, durable processing state, transaction/correlation, action result, policy and actor | Service-specific append/transition permissions. |
| Access projection | Effective capabilities, bounds, provenance IDs, projection revision, safe explanation | Derived by entitlement service; never a client-writable source. |

<a id="COM-B0037"></a>
Store timestamptz/UTC instants, original display time zone, explicit start-inclusive/end-exclusive intervals, schema version and recorded-at/occurred-at times. Foreign keys must preserve the originating acquisition and payment proof through migrations. Do not cascade deletion of billing or entitlements into private content or vice versa. Deletion follows reviewed retention/rights workflows. Null end dates are allowed only for explicitly nonexpiring components such as valid Full acquisition/Free availability—not as an accidental lifetime Steward grant.

<a id="COM-B0038"></a>
#### 3.2 Independent state dimensions

<a id="COM-B0039"></a>
| Dimension | Values / interpretation |
| --- | --- |
| Grant lifecycle | PROPOSED, PENDING_ACTIVATION, SCHEDULED, ACTIVE, EXPIRED, CANCELLED_BEFORE_START, REVOKED, SUPERSEDED. |
| Source type | PURCHASE, SPONSORED, COMPLIMENTARY, SCHOLARSHIP, ADMIN_GRANTED, or disabled future types. These are not lifecycle states. |
| Payment certainty | NOT_APPLICABLE, UNKNOWN, PENDING, CONFIRMED_SUCCEEDED, CONFIRMED_FAILED, PARTIALLY_REFUNDED, REFUNDED, REVERSED. |
| Agreement billing state | Provider raw state preserved separately; normalized INITIATING, CURRENT, PAST_DUE, UNPAID, CANCEL_REQUESTED, CANCEL_AT_PERIOD_END, ENDED, REVIEW_REQUIRED. |
| Commercial review overlay | NONE, PAYMENT_UNKNOWN, DISPUTED, DUPLICATE_REVIEW, REFUND_PENDING, SECURITY_SUSPENDED, COMMERCIAL_SUSPENDED. Scoped, reasoned and auditable. |
| Derived access mode | FREE, FULL_BUILD, LIVING, RETAINED_BLUEPRINT_ONLY_WITH_FREE, RESTRICTED, CLOSED; includes explicit permitted capabilities. |
| Full acquisition qualification | VALID, REVIEW_HOLD, REVOKED; does not describe content ownership, spiritual maturity or Blueprint completeness. |
| Grace / expiring indicators | Time-bounded access overlay under approved grace policy; “expiring” is a display/notice condition, not a new grant or recurring authorization. |

<a id="COM-B0040"></a>
[TC] CANCEL_AT_PERIOD_END is a payment-agreement instruction while an already paid grant can remain active. A revoked grant removes only its specified benefits; another valid source may still provide access. A superseded grant must link to its replacement and preserve original dates/audit. A refund or dispute overlay cannot be flattened into one subscription_status that destroys these distinctions.

<a id="COM-B0041"></a>
#### 3.3 Authoritative access decision

<a id="COM-B0042"></a>
The protected authorization service evaluates, at request time: authenticated canonical participant and required MFA; account/security restrictions; enabled release/capability; applicable purpose/consent; relevant valid grants and their actual time bounds; any approved scoped grace or suspension; then the capability requested. Payment facts are inputs to grant reconciliation, not a second access shortcut. Every premium endpoint checks the same service/transactionally consistent projection; expiry cannot depend only on a nightly cron job.

<a id="COM-B0043"></a>
Caches must carry a participant/access revision and expire no later than the next capability boundary. Reject stale revisions after revocation, account closure or sensitive security changes. An unavailable billing provider does not erase an already confirmed, unexpired grant. An unavailable entitlement authority does not permit a fabricated new entitlement; use reviewed technical fallback and retained secure/static routes where available.

<a id="COM-B0044"></a>
#### 3.4 Required database enforcement

<a id="COM-B0045"></a>
Enforce unique order acquisition per benefit component, unique provider event ingestion per account/mode/event ID, unique consumed invoice-line/service-period benefit, nonnegative amounts and refund totals bounded by refundable funds. Lock or serialize on canonical participant when reserving purchases, activating overlapping grants, switching cadence, refunding qualification or merging identities. Maintain one open personal Steward billing reservation/agreement across initiating, incomplete, past-due, unknown and cancel-pending states—not merely one active Stripe subscription.

<a id="COM-B0046"></a>
Multiple source grants may legitimately coexist in the ledger. Do not impose a uniqueness rule that discards their provenance; derive one effective capability set and resolve overlaps explicitly. Use transactional writes for grant, qualification, audit and outbox. A client-side disabled button, generated SQL, JWT user metadata or an AI statement is not enforcement.

<a id="COM-B0047"></a>
[TC + RV] Enable RLS on exposed participant-facing tables; use private schemas and explicit database grants. Supabase service keys can bypass RLS and must never reach browsers or the model. Commerce workers require a dedicated least-privilege database role/connection, not a broad credential with private-content access. Revoke unnecessary default function execution; prefer invoker security, or narrowly reviewed definer functions with fixed search paths, explicit authorization and restricted execute grants. Prove denial under real roles and views/RPCs, not only direct-table tests. [SB01; SB02]

<a id="COM-B0048"></a>
#### 3.5 Allowed transition envelope

<a id="COM-B0049"></a>
[TC] Deny transitions not explicitly supported by an approved policy/template. Each command requires an expected record revision and emits one audited business effect; retry returns the original result rather than applying the transition again.

<a id="COM-B0050"></a>
| Transition | Authoritative trigger / invariant |
| --- | --- |
| PROPOSED → PENDING_ACTIVATION or SCHEDULED | Valid approved grant authority or verified purchased benefit; complete approved scope/template and no unapproved direction or unselected commercial rule. A proposal alone never grants access. |
| PENDING_ACTIVATION → ACTIVE | Authenticated activation transaction; required service/release available, source eligible, overlap resolved and original start/end calculated once. |
| SCHEDULED → ACTIVE | Server time reaches an expressly approved start and all relevant prerequisites still hold. Scheduled paid continuation additionally needs its qualifying payment fact. |
| ACTIVE → EXPIRED | Actual exclusive end reached; not a missed login, support closure or assessment result. |
| PENDING_ACTIVATION / SCHEDULED → CANCELLED_BEFORE_START | Authorized cancellation/unwind; payment/refund obligation is separately tracked rather than discarded. |
| Eligible grant → REVOKED | Authorized source-specific reason and effective time under approved policy; retain content and other valid source grants. |
| Eligible grant → SUPERSEDED | A linked approved replacement/correction preserves provenance and explains any interval change; no silent benefit stacking. |
| EXPIRED / REVOKED / SUPERSEDED → new access | Never reset the old row or restart recurring consent. Use a new independently authorized grant or reviewed correcting event linked to the original evidence. |

<a id="COM-B0051"></a>
A grace overlay has its own fixed interval and policy basis, not a mutation that makes an expired invoice paid. A resolved dispute removes only its scoped overlay; cancellation, refund and security facts remain independently effective. Full qualification transitions preserve the acquisition history and never write Blueprint definition/content states.

<a id="COM-B0052"></a>
### 4. One participant / one recognized Steward entitlement

<a id="COM-B0053"></a>
#### 4.1 Identity and cross-entry-point boundary

<a id="COM-B0054"></a>
[AP + TC] MJG/Supabase remains authoritative across approved entry points. MichaelJGauthier.com, sponsored invitations and any future ForgedLife link must resolve to the same verified canonical participant before commercial writes. ForgedLife synchronization is not implemented or enabled by this design. A shared email, name, church roster, browser cookie or uploaded receipt is not sufficient proof to merge private accounts. [PJ §§14, 18; P1-01 K; PRIV]

<a id="COM-B0055"></a>
Require authenticated control of both identities or a reviewed account-recovery/merge procedure with identity assurance, fresh step-up where required, purpose-limited evidence and participant confirmation. Do not reveal whether another email has a Blueprint or paid plan. While a duplicate is unresolved, block additional potentially duplicate purchase attempts; preserve secure existing access and route a minimal commercial case.

<a id="COM-B0056"></a>
#### 4.2 Merge review

<a id="COM-B0057"></a>
A reviewed merge plan lists source participant IDs, auth mappings, Stripe Customer/subscription IDs, all grants/qualifications and their unchanged intervals, conflicts and billing actions needed. Acquire locks for both identities; prevent new checkouts; reconcile all provider objects; approve the canonical survivor; map provenance without copying another person’s content. Do not automatically concatenate two Blueprints, alter wording or import consent. Existing content conflicts need a separate participant-controlled content workflow under P1-01/T4. Identity assurance for billing does not authorize private-content inspection.

<a id="COM-B0058"></a>
Stripe customers are not blindly deleted or assumed mergeable. Retain historical payment/customer references and use the canonical mapping for future purchases. Cancel/resolve redundant payment agreements with explicit policy authority and provider confirmation. Audit the merge and notify the participant through safe service communications. Undo/recovery must preserve provenance rather than restoring an obsolete auto-renewal.

<a id="COM-B0059"></a>
#### 4.3 Precedence and overlap

<a id="COM-B0060"></a>
Account-security and applicable release restrictions constrain all access. Within those restrictions, effective capabilities are the union of currently valid approved grants, not additive subscription quantities. A second source must not duplicate Full acquisition, reset the Build clock, double usage allowances or silently move any end date. Show separate source intervals and one effective current mode. D06 approves deferred sponsored activation after the current personally paid term where the approved programme permits; its implementation and release gates remain open. Conflicting activations/new charges stay blocked until the approved policy is implemented, any required exception authority is approved and the applicable gates are satisfied. No automated paid/sponsored overlap proration is enabled for launch.

<a id="COM-B0061"></a>
A participant with Full already retained receives only the additional authorized Steward interval from a Full-included sponsor/leader benefit; record full_already_qualified without a second Build fee or fabricated new purchase. A grant with Full scope may restore qualification after a properly reviewed prior refund, but only through the approved new grant—not by interpreting an old PDF.

<a id="COM-B0062"></a>
### 5. Activation clocks

<a id="COM-B0063"></a>
#### 5.1 Clock definitions

<a id="COM-B0064"></a>
| Clock | Meaning |
| --- | --- |
| Purchase action | Participant affirms the displayed offer; not evidence of payment. |
| Provider payment confirmation | Verified provider success/settlement fact at the level needed for the enabled method; capture provider event time and local verification time separately. |
| Entitlement creation | Local atomic grant/qualification transaction commits; may still be pending activation. |
| Activation | Authenticated participant activates a specific confirmed benefit; server commits the start once. |
| Build-window start/end | Bounded initial Full Build service window, separate from content completeness. |
| Steward membership start/end | Specific sponsored, prepaid or invoice-funded interval, not inferred from login. |
| Expiration | Exclusive end instant of a benefit; not deletion, cancellation receipt or renewal authorization. |

<a id="COM-B0065"></a>
[TC] Calendar-month/year promises use calendar arithmetic in the recorded offer time zone, using the last valid day of the target month for an invalid anniversary date; do not substitute 365 days for every 12-month term. Initial Arizona grant configurations use America/Phoenix. Once committed, interval instants do not move merely because the participant changes display time zone. Day-based Build/Compass intervals under the applicable approved rule use the same local activation time plus the stated calendar days. Store the resulting UTC instants and display the actual date/time zone. Test month-end, leap day, concurrent activation and timezone changes. Renewal periods use provider invoice/item service periods under the pinned API, not assumptions about top-level subscription fields. [ST04]

<a id="COM-B0066"></a>
#### 5.2 Approved activation rules

<a id="COM-B0067"></a>
| Offer | Approved exact rule / existing approved rule | Decision / boundary |
| --- | --- | --- |
| $149 Full Build | Verified purchase creates pending Full acquisition and Build entitlement. Explicit participant activation starts a 30-calendar-day Build window. Purchase itself does not start the clock. No membership subscription. | OD D01 — approved. 90 calendar days from confirmed payment to activate; full refund before activation. If still genuinely unused/unactivated at the end, automatically initiate a full refund rather than forfeit. Retail only; professional refund/tax/accounting review remains open. |
| $299 Build + Live | One-time prepaid $299. Explicit activation starts the 30-calendar-day Build window and 12 calendar months of Steward concurrently. No additional Steward months after Build. | OD D02 — approved. Same D01 90-day unused-activation/refund principle. No recurring agreement or automatic annual renewal; after 12 months, $19/month or $199/year requires a new affirmative choice. |
| $19 monthly | No separate deferred activation after purchase. Participant chooses continuation when eligible; verified paid invoice creates access for its exact monthly service interval. | OD D04 — approved. Normal $149 purchasers start only after the initial Build window ends; an unactivated purchase cannot bypass this. Previously qualified Full owners with no active included Steward period may start immediately. Access is usable only after grant confirmation; processing failures require remedy, not silent rebasing. |
| $199 annual | Same immediate continuation process, for the actual yearly service interval. | OD D04 — approved. Same qualification/timing guard; no monthly-to-yearly substitution or new Build acquisition. |
| Complimentary pilot | Approved bounded grant template records activation-triggered or fixed dates explicitly; participant activation within the authorized pilot envelope remains a recommendation where not separately selected. | OD D13 — approved. Use a separately approved LEVEL_1_NONPAID_PILOT template capped at the separately authorized pilot count. No implied six-week entitlement merely because the release has a six-week review envelope. |
| Sponsored participant | Program-specific approved activation rule; Compass is post-study activation + 60 calendar days. | AP Compass. Roughly 30 days after final session is preferred, not a forfeiture deadline. |
| Sponsored leader/facilitator | Program-specific rule; Compass is activation + 12 calendar months, Full if needed. | AP Compass. Ideally activate 4–6 weeks before the study; no automatic renewal. |

<a id="COM-B0068"></a>
[TC; OD D01–D02, D08] Approved unused-paid-purchase refund automation must atomically exclude activation while refund is being committed. At 90 calendar days from confirmed payment, automatically initiate the full refund for a genuinely unused/unactivated $149 or $299 purchase rather than forfeit it. If refund fails, preserve the money/access obligation in a resolution case, not an expired right with money retained. Determine activation/unused status from authorized commercial facts, not private conversations or Blueprint content. Do not apply this retail rule to Compass or another sponsored programme unless separately approved. Exact refund/tax/accounting mechanics remain subject to applicable professional review. Do not take an activation action while the required service is unavailable and silently consume its clock. Owner policy is approved; implementation, acceptance testing and release remain pending. [OD-REV]

<a id="COM-B0069"></a>
Activation endpoint input is only the authenticated grant/order reference and confirmation of the displayed start/end. Server resolves policy, checks eligibility/release/overlap, calculates dates and uses an idempotent transaction. Repeating activation returns the original confirmation. Backdating or extending requires a separately authorized correction/grant with audit; no editing activated_at to manufacture a longer benefit.

<a id="COM-B0070"></a>
### 6. Stripe’s narrow role

<a id="COM-B0071"></a>
#### 6.1 Initial integration profile

<a id="COM-B0072"></a>
[TC + RV] Recommend application-created, authenticated Stripe-hosted Checkout sessions using the existing Customer object mapped server-side. Hosted card collection narrows the payment-data boundary; it does not establish PCI compliance. Start with an explicit reviewed card-payment allowlist; do not let dashboard dynamic payment-method additions silently enable ACH, delayed methods, financing or new contract obligations. Wallets require their own tested configuration within that allowlist. Required PCI validation, website security and acquiring-bank requirements remain specialist gates. [ST01; ST11; PCI01]

<a id="COM-B0073"></a>
Use one-time Checkout payment mode for $149 and, under D02’s approved direction, $299. Use subscription mode for expressly authorized monthly/annual continuation. Public reusable Payment Links that bypass participant qualification, overlap checks or order creation are disabled. Do not create card-collection sessions for Free, Compass, pilot, scholarship or other no-card grants.

<a id="COM-B0074"></a>
#### 6.2 Provider objects and restricted information

<a id="COM-B0075"></a>
| Stripe object | Permitted role | Not authoritative for |
| --- | --- | --- |
| Customer | Minimum billing/contact relationship and internal reference | Participant identity linking, content consent, Full qualification. |
| Checkout Session | Hosted purchase session tied to one internal order | Access simply because browser returns or session exists. |
| PaymentIntent / Charge | Payment processing and actual monetary status | Full workflow, Blueprint ownership or sponsor eligibility. |
| Subscription / invoice / invoice line | Recurring agreement, cadence, amount, service-period and collection facts | Current application capability without entitlement reconciliation. |
| Refund | Provider refund request/result for specified funds | Account deletion, future subscription cancellation or content erasure. |
| Dispute | Provider/card-network case, deadline and outcome | Whether a participant is spiritually trustworthy or private-content access is justified. |
| Customer portal | Authenticated billing self-service | Sponsor entitlements, content management or unguarded plan qualification. |

<a id="COM-B0076"></a>
[AP + TC] Metadata uses an allowlist: opaque internal customer/participant reference, offer/version ID, order ID, operation/correlation ID and, only where necessary, entitlement correlation reference. Prefer internal-only sponsor mapping; a cohort reference may be sent only after necessity/privacy review and must not reveal church affiliation or sensitive program purpose through its label. Metadata is not a secret or an authorization token. [PRIV §18.3; P1-01 K; ST12]

<a id="COM-B0077"></a>
Never send Blueprint wording, Check-In responses or scores, journals, conversation text, health/sexual/relationship information, religious reflections, Drift + Return, safety labels or sensitive free-text grant reasons to Stripe. This prohibition also covers descriptions, invoice line text, statement descriptors, receipt text, support attachments, tax descriptions, logs and dispute evidence—not only metadata. Use truthful generic commercial descriptors and legal-entity/support information, not intimate product-use details.

<a id="COM-B0078"></a>
#### 6.3 Provider configuration controls

<a id="COM-B0079"></a>
Pin and record the tested stable Stripe API and SDK versions, webhook endpoint versions, account/mode, permitted events, price IDs, payment methods, tax behavior, portal settings, retry policy and notification configuration. Documentation may display preview examples; do not deploy preview API behavior merely because a sample uses it. Stripe Billing Entitlements, if present in the dashboard, is not substituted for MJG’s authoritative entitlement system. [ST02; ST04]

<a id="COM-B0080"></a>
### 7. Authoritative payment-to-entitlement transaction

<a id="COM-B0081"></a>
#### 7.1 Transaction sequence

<a id="COM-B0082"></a>
[TC] Implement an at-least-once integration with idempotent effects. There is no single atomic transaction spanning Stripe and Supabase; local commits, provider verification and compensating actions must be explicit. [ST01–ST04]

<a id="COM-B0083"></a>
1. Authenticate the canonical participant; verify required assurance, allowed release/geography and approved offer. Resolve the server-owned price, tax presentation and qualification.

<a id="COM-B0084"></a>
2. In a local transaction, lock the participant’s commerce reservation; block duplicate/open conflicting agreements; create an immutable pending order, quote/terms/authorization snapshot and purchase-intent ID.

<a id="COM-B0085"></a>
3. Persist a provider-operation record and idempotency key before sending the Checkout creation request. The client cannot choose amount, recurrence, Customer, benefit scope or Price ID.

<a id="COM-B0086"></a>
4. Stripe collects payment on its hosted page. Save provider object references returned to the server. A network timeout is UNKNOWN, not FAILED or permission to try a fresh charge.

<a id="COM-B0087"></a>
5. Treat the browser return as a status-page visit only. It may request a server reconciliation, never directly grant access or assert that payment succeeded.

<a id="COM-B0088"></a>
6. Receive the signed event server-side; verify raw body, signature/timestamp tolerance, endpoint secret, expected Stripe account and test/live mode; allowlist event type/schema.

<a id="COM-B0089"></a>
7. Persist the verified, minimized inbox record under a unique event key before acknowledging durable receipt. If persistence fails, return retryable failure; do not acknowledge and lose the event. Queue detailed work, avoiding a long synchronous handler.

<a id="COM-B0090"></a>
8. Worker retrieves authoritative objects as necessary, validates Customer/order association, approved price/line quantities, amount/currency/tax, payment condition, invoice period and current reversal/cancellation facts. A paid-zero invoice must have an approved credit basis; unauthorized discounts/manual “paid” markings are quarantined.

<a id="COM-B0091"></a>
9. Recheck eligibility and conflicting grants under a participant/order lock. Never treat a later paid event as permission to overwrite an earlier confirmed refund or to restore a cancelled future agreement.

<a id="COM-B0092"></a>
10. In one local transaction, store normalized payment facts; consume the order or invoice-line benefit key exactly once; create/update only the proper grant and qualification; recalculate the access projection; append audit and notification outbox; mark fulfillment complete.

<a id="COM-B0093"></a>
11. Send confirmation only from the committed outbox/projection. Pending activation is reported as pending activation, not active membership. Notification failure does not rerun a charge or grant.

<a id="COM-B0094"></a>
12. Reconciliation independently verifies unresolved and contradictory records, including dashboard changes, so webhook delivery is not the sole recovery mechanism.

<a id="COM-B0095"></a>
A successful provider API retrieval can establish payment facts during a reconciler run without a delivered webhook, but it enters the same validated, idempotent transaction with retrieval evidence. It is not a browser-success exception. checkout.session.completed may precede final success for delayed methods; a payment-status check and proper success event/retrieval are necessary. An invoice marked paid outside the approved collection path must not mint consumer access without reviewed commercial authority. [ST01; ST04]

<a id="COM-B0096"></a>
#### 7.2 Event contract

<a id="COM-B0097"></a>
| Event / provider observation | Local action |
| --- | --- |
| Checkout completed / asynchronous success | Reconcile its order/payment; only confirmed qualifying funds or separately authorized no-cash basis can fulfill. |
| Checkout expired / asynchronous failure | Close abandoned attempt only after checking other attempts and actual payment state; never remove unrelated valid grants. |
| PaymentIntent succeeded / failed | Persist payment fact and reconcile associated order/invoice; multiple event types cannot grant the same benefit twice. |
| Invoice paid | Validate intended offer/cadence, authorization and exact invoice-line interval; one continuation grant per consumed interval. |
| Invoice payment failed / action required / finalization failed | No new paid interval; preserve prior paid period and approved grace; send safe actionable notice; reconcile collection policy. |
| Subscription created / updated / deleted | Synchronize agreement/cancellation facts; do not equate provider status alone with paid access. |
| Refund created / updated / failed; charge refunded | Reconcile monetary result and separately approved entitlement treatment; no duplicate refund. |
| Dispute created / updated / closed | Open/update restricted case, deadline and policy overlay; verified outcome does not silently restart recurring billing. |

<a id="COM-B0098"></a>
Event names and object paths must be verified against the pinned API. Subscribe only to needed events. Automatic delivery can retry, duplicates can occur and ordering is not guaranteed; an event timestamp is not a reliable global sequence. Deduplicate receipt by event ID and fulfill by business-effect identity. Do not globally deduplicate all updates of the same object/type—distinct later updates may be legitimate. [ST02; ST04]

<a id="COM-B0099"></a>
#### 7.3 Unknowns, retries and compensating behavior

<a id="COM-B0100"></a>
Repeated browser refreshes return the existing order status. Abandoned checkout receives no grant and no attempt to complete a charge automatically. For a failed API call, reuse the original operation/key and exact parameters while valid, or retrieve the resulting provider object. Stripe can prune idempotency keys after at least 24 hours and can return the original error response on key reuse. A long-delayed unresolved create cannot simply be replayed with a new key: reconcile provider objects first, quarantine ambiguity and require authorized resolution where duplication remains possible. [ST03]

<a id="COM-B0101"></a>
If payment succeeded but the grant transaction failed, persist PAYMENT_SUCCEEDED_ENTITLEMENT_FAILED; show “Payment confirmed; access is still being set up. Do not purchase again.” Retry fulfillment, not collection. If the service cannot be delivered within the reviewed operational target, D08 governs refund/remedy; a temporary grant, if authorized, has its own source and must be superseded rather than stacked with later fulfillment.

<a id="COM-B0102"></a>
If two distinct payments actually succeeded, one benefit is fulfilled; the extra funds enter duplicate-charge correction, not hidden extra months. A duplicate-prevention control reduces risk but is not a guarantee of provider-level exactly-once charging. Preserve both monetary records and document the refund outcome.

<a id="COM-B0103"></a>
### 8. Full Build qualification and $19 bypass prevention

<a id="COM-B0104"></a>
[AP + TC] Continuation requires a server-maintained FULL_BUILD_QUALIFIED determination from a valid acquired Full entitlement/history or other approved qualifying path. Qualification is not “has a 13-page PDF,” “AI says complete,” “paid something,” “was invited,” or “is a leader.” [PJ §7.2–7.3; BRIEF Part 8]

<a id="COM-B0105"></a>
| Participant history | Qualification treatment |
| --- | --- |
| Free only; fabricated payment claim; imported Full PDF | Not qualified. Present the approved Full purchase path or verify a claimed acquisition without accusing the participant. |
| Verified $149 purchase | Qualified acquisition after authoritative transaction; initial Build window still follows activation and D04 continuation timing. |
| Verified $299 package | Qualified once; block redundant continuation while the included Steward interval covers the same service. |
| Activated approved sponsor participant with Full included | Qualified through that approved source; no participant card required. |
| Compass leader grant with Full if needed | Qualified by explicit Full component or pre-existing valid acquisition. Leader title alone is insufficient. |
| Scholarship / complimentary grant | Qualified only when its approved template expressly includes initial Full; Steward-only/Free grants do not bootstrap Full. |
| Legacy/manual Full owner | Restricted reviewed import with source evidence, authorized issuer and reason code; no AI inference. |
| Expired Steward / retained valid Full | Remains qualified; may independently purchase continuation without buying Full again. |
| Refunded/reversed initial Full acquisition | OD D08/D14 — approved: qualification is reviewed/revoked for that source as specified, while all already-created Blueprint content remains retained. Another valid Full source may qualify. |

<a id="COM-B0106"></a>
Check qualification at offer discovery, order creation, payment-agreement creation and final entitlement transaction. Recheck under lock because refund, merge or sponsor activation may race checkout. If qualification changed after money was collected, do not charge again or force a fabricated entitlement; enter reviewed correction/refund handling.

<a id="COM-B0107"></a>
[OD D04 — APPROVED] A normal $149 Full Build purchaser becomes eligible to start paid $19/month or $199/year continuation after the initial Build window ends. No page count, completion score or AI judgment is required. An unactivated Build purchase cannot bypass that timing guard. A participant who already finished may continue self-guided until then. A previously qualified Full owner with no active included Steward period may purchase continuation immediately. Valid Full owners may refine or finish retained Full content in ongoing Steward; continuation does not mint a new initial Build window. Any early paid start/overlap requires separate explicit approval and disclosure, not an invisible default. [OD-REV D04]

<a id="COM-B0108"></a>
### 9. Upgrades, overlaps and proration

<a id="COM-B0109"></a>
[OD D03–D06 — APPROVED] Use boundary-based changes rather than routine mid-period proration for launch. Preserve the purchased term, make the next cadence, price and effective date explicit, and require affirmative participant authorization and a confirmed change before representing it as scheduled. No overlapping monthly and annual agreements are permitted. Stripe’s ability to calculate prorations is not an approved Steward commercial policy; a credit calculation is not necessarily a cash refund. Automated paid/sponsored overlap proration remains deferred under D06. [OD-REV D03–D06; ST06]

<a id="COM-B0110"></a>
| Situation | Approved customer treatment / retained recommendation | Required implementation result |
| --- | --- | --- |
| $149 Build → $19 monthly or $199 annual | Purchase continuation after the initial Build window; reuse valid Full acquisition. | New expressly authorized continuation agreement, no second Full fee, no new initial Build window. |
| $149 purchaser later requests the $299 package | Do not sell another Full-included package. Offer ordinary $19/$199 continuation. A retrospective bundle credit is deferred unless separately approved. | Block redundant Full offer server-side. Explain that the first-year package is an initial purchase option, not an automatic credit promise. |
| Already owns Full → Full-included sponsored/leader grant | Do not require or sell Full again. Apply the program’s Steward benefit and retain its original scope/source. | Record that Full already qualifies; do not restart the original Build clock or create a duplicate Blueprint. |
| Monthly → annual | Change at the end of the current paid monthly term, with affirmative annual authorization and the exact next price/date. | One future cadence transition. No concurrent second subscription; failed annual payment does not silently fall back to monthly. |
| Annual → monthly | Change at the end of the paid annual term; no routine early annual refund solely for changing cadence. | One confirmed next-term monthly instruction; no early monthly charge or shortening of paid annual access. |
| Sponsored / complimentary → paid | Recommend checkout at or after expiry. Before expiry, show benefit dates and an optional nonbinding reminder rather than collecting a card by default. | New affirmative payment agreement; no automatic conversion, stored-card charge or retroactive charge for sponsored time. |
| Personally paid → newly available sponsorship | Defer sponsored activation until the current personally paid term ends where the approved sponsor programme permits. Use the same launch posture for $299 package overlap; no automated prorated overlap refund. | Preserve both sources and their exact benefits; show the paid term and future sponsored activation. If actual programme timing prevents deferral, use only a separately authorized commercial exception/remedy after applicable counsel/tax review. |
| Monthly and annual agreements both detected | Protect the participant from further duplicate collection, investigate and correct the unintended agreement/charge under approved authority. | Preserve each provider record; one resolved canonical agreement; confirmed cancellation/refund, not deletion of history. |

<a id="COM-B0111"></a>
#### 9.1 Approved deferred-activation policy; automated overlap proration disabled

<a id="COM-B0112"></a>
[OD D06 — APPROVED] The simplified launch default is to defer activation of an eligible sponsored Steward period until the current personally paid Steward term ends, where the approved sponsor programme permits that timing. Preserve the personally paid term exactly and the sponsored benefit exactly; do not silently stack, shorten or extend either. Apply deferred sponsored activation to $299 package overlap as well. The sponsored clock begins only through its authorized activation transaction. Show the participant both funding sources, the paid-through date and the future sponsored activation/status. Do not collect a participant card for sponsorship. Compass’s approximate thirty-day preference is not a hard restriction. [OD-REV D06]

<a id="COM-B0113"></a>
[FD — DEFERRED / NOT ENABLED] Section 9.1’s prior proposed automated unused-overlap refund formula is retained only as a deferred design reference, not governing launch policy or an available participant election. The prior formula was: net membership consideration paid for the overlapping interval, excluding separately accounted tax, multiplied by unused service seconds divided by total service-period seconds; round once to currency minor units, cap at remaining refundable consideration, and adjust tax through the reviewed process. Do not build or enable automated prorated paid/sponsored overlap refunds for launch. Any future use requires separate owner approval, applicable counsel/tax/accounting review, implementation, tests and release. [OD-REV D06]

<a id="COM-B0114"></a>
If an actual approved sponsor programme has a timing requirement that makes deferral impossible, route that case to a separately authorized commercial exception/remedy process after applicable counsel/tax review. That process does not enable the deferred formula or authorize support, engineering or the AI to invent a remedy. Do not assume that $149 of a $299 package is its accounting, tax or refund allocation; no ad hoc partial package allocation is offered at launch under D08, and no hidden $150 continuation offer is created. An already activated grant keeps its original interval unless the participant accepts a separately authorized change. Resolve any personal-renewal stop through the existing participant-authorized cancellation/transition workflow before sponsored activation; do not silently cancel an agreement or collect an overlapping new personal term. Unused days do not silently roll over, and sponsored expiration never restarts personal billing. [OD-REV D06, D08–D09, D13]

<a id="COM-B0115"></a>
#### 9.2 Transition transaction

<a id="COM-B0116"></a>
[TC] Persist a transition request with current agreement/version, desired offer/version, participant authorization, effective boundary and cancellation/collection instructions. Serialize against renewal, refund, activation and merge. Revalidate qualification and price before execution. Use the same agreement where the tested provider configuration supports the change; otherwise use a controlled cancel-and-replace sequence that prevents concurrent collection. Until provider and entitlement state agree, display “Change pending,” the existing confirmed access and the unresolved next charge. A failed change must never silently select another cadence.

<a id="COM-B0117"></a>
### 10. Cancellation, expiration and account closure

<a id="COM-B0118"></a>
#### 10.1 Three independent actions

<a id="COM-B0119"></a>
[AP] Cancel paid Steward ≠ delete account ≠ delete Blueprint. Paid or sponsored expiry preserves the Blueprint already created, its approved wording and appropriate Free access. This does not promise perpetual hosting, unlimited AI service or exemption from a separately reviewed inactivity/deletion policy. Content rights and retained access must be explained without using payment expiry as a deletion trigger. [PJ §9, §16.6; PRIV O05; P1-01 G]

<a id="COM-B0120"></a>
[OD D09 — APPROVED] Make “Cancel renewal” self-service, effective on future charging immediately upon the confirmed cancellation instruction, while retaining service through the paid-through end. Display the exact final access date and whether any refund is being requested separately. Offer immediate service termination as a separate participant option; explain the difference from stopping renewal and apply the approved refund policy and mandatory rights. Do not default to forfeiting paid access, require a retention conversation, demand a reason, or hide cancellation behind chat.

<a id="COM-B0121"></a>
[TC] Persist cancel_requested_at and the participant’s instruction before the provider call. Block new merchant-initiated renewal attempts under the application’s control, send the provider cancellation, reconcile any in-flight invoice/payment, and retain the specific provider confirmation. “Cancellation received; confirmation pending” is different from “Renewal canceled.” A payment collected contrary to a timely accepted cancellation enters correction, not a demand to prove cancellation with private conversation. Stripe cancellation behavior can leave separate invoice items or invoice obligations requiring explicit treatment; refunding a payment alone does not cancel its subscription. [ST05; ST07]

<a id="COM-B0122"></a>
#### 10.2 Expiry and downgrade

<a id="COM-B0123"></a>
At each request, evaluate the actual exclusive end instant. Disable premium capability when no valid premium grant or approved grace remains; do not wait for a nightly job to enforce access. A scheduler updates display/notification state and catches reconciliation defects, but it is not the only authorization mechanism. Retain view/export of already-created Blueprint content and bounded Free functionality under the secure, released platform. Never demote “Defined for This Season” merely because a subscription ended.

<a id="COM-B0124"></a>
Sponsor/admin expiry creates no personal payment agreement. Pending cancellation does not shorten an already-paid term. A canceled-at-period-end agreement may remain entitled until that end. A manually revoked grant needs authorized scope, effective time, reason code and appeal/support path; it must not alter another valid source or the content record.

<a id="COM-B0125"></a>
#### 10.3 Account closure and privacy deletion sequence

<a id="COM-B0126"></a>
[TC + RV] A confirmed account-closure request initiates an independent billing-stop task covering every linked Stripe Customer, subscription, schedule, open checkout and approved external channel. Prevent new purchase/renewal authorizations; expire controllable open checkouts; cancel recurring agreements and reconcile in-flight payments. Preserve a minimal restricted commercial reference and unresolved task until provider outcomes are known. Do not destroy the only link needed to stop recurring charges or imply all external records have been deleted before confirmation.

<a id="COM-B0127"></a>
Block ordinary account access and execute eligible privacy deletion according to P1-01/PRIV; do not delay all unrelated deletion indefinitely because a commercial case remains open. Keep only the professionally justified commercial/hold evidence with its own retention and access restrictions. Offer secure self-export before closure where safe and desired, but do not make an export a condition of deletion. An unknown cancellation remains an urgent billing task with a truthful receipt and alternative contact route. Closure does not authorize deletion of legally necessary transaction records or indefinite retention of private conversations. [P1-01 G; PRIV §§12–13, O05]

<a id="COM-B0128"></a>
### 11. Renewal, failed payments and price changes

<a id="COM-B0129"></a>
#### 11.1 Recurring authorization

<a id="COM-B0130"></a>
[AP + TC] Monthly/annual continuation requires an affirmative recurring authorization tied to the exact offer, price/currency, cadence, first charge, cancellation method, tax treatment and disclosure version. Keep a retainable acknowledgment. Neither a prior card payment, Full ownership, sponsor activation nor a saved payment method establishes that authorization. A change between monthly and annual requires a new affirmative cadence choice. [PJ §18.3; L01; L04]

<a id="COM-B0131"></a>
A verified renewal invoice funds only its intended service interval. Record the invoice/line identifiers and actual service start/end; do not implement renewal as “add thirty days” or “add one year to whatever end date exists.” A duplicate or late event cannot add the same period twice. Customer balance credits, zero-dollar invoices, manual “paid out of band” changes and test-mode objects require explicit supported paths and reconciliation—not blanket treatment as a new cash payment. Unapproved manual payment overrides are quarantined.

<a id="COM-B0132"></a>
#### 11.2 Approved failed-payment policy

<a id="COM-B0133"></a>
[OD D07 — APPROVED] Use one seven-calendar-day grace interval for a failed renewal of a previously paid monthly or annual continuation agreement, beginning at the prior paid-through end. There is no grace for an initial unsuccessful purchase, fabricated payment, unactivated order or expired sponsor benefit. Grace does not reset on retries, new events, a refreshed browser or switching plans. The participant sees payment trouble, the remedy route, the grace end and the actual future-charge/cancellation status—not a spiritual or personal judgment.

<a id="COM-B0134"></a>
During grace, preserve the prior continuation capabilities, subject to normal security and safety controls. At grace end without qualifying payment, return to Free/retained Blueprint access. Automatic collection must not continue indefinitely for service no longer being delivered; end it under a reviewed dunning disposition rather than retrying indefinitely after premium suspension. Reviewed accounting/legal configuration must determine the final invoice void/write-off/credit treatment; an unpaid invoice is not erased by an entitlement update. A later payment for an already closed collection period is reconciled/refunded or requires a fresh disclosed purchase, not silently consumed for inaccessible service.

<a id="COM-B0135"></a>
[TC] Configure and test retry cadence, failure notices, authentication-required flows, grace and final disposition together. A card update does not itself prove invoice payment. Prevent provider retries after a confirmed cancellation, disputed-collection stop or closed-account stop where they are no longer authorized. A delayed renewal success during valid collection grants its actual invoice interval; remedy any material service interruption rather than silently changing the billing anniversary.

<a id="COM-B0136"></a>
#### 11.3 Notices and price changes

<a id="COM-B0137"></a>
[OP + CL] Recommend a clear pre-renewal notice for annual recurring service, normally thirty days before renewal, and a receipt after each successful charge. A monthly receipt/current next-charge display does not replace any legally required advance notice. Counsel must configure the jurisdiction-specific timing, permitted channels, amount-variation rules and acknowledgment retention; no single notice schedule is declared sufficient nationwide. Necessary billing notices remain separate from optional marketing/reminders. [PRIV O09; L04; L06]

<a id="COM-B0138"></a>
[OD D10 — APPROVED] Honor the already purchased term and make no permanent price-lock or grandfathering guarantee. Require fresh affirmative participant acceptance before charging a higher renewal price or changing billing cadence. Without that acceptance, stop renewal at the existing term’s end rather than silently charge the higher amount. A price reduction may be applied without forcing unnecessary re-consent, subject to applicable legal/tax/provider requirements and truthful notice. Never silently switch monthly to annual or annual to monthly. Current approved $19/month and $199/year prices remain unchanged; no future price is selected here. Approved tax changes and other variable amounts need their own legally reviewed disclosure/notice treatment. Revalidate current law before changing price. Do not change a $299 prepaid first year into recurring annual billing without the separately chosen agreement under D02. [OD-REV D02, D10]

<a id="COM-B0139"></a>
### 12. Refund options and approved policy

<a id="COM-B0140"></a>
#### 12.1 Option A approved; alternatives unselected

<a id="COM-B0141"></a>
[OD D08 — APPROVED; RV — OPEN] Michael J. Gauthier approved Section 12 Option A on September 12, 2026 within this standard’s scope; it is not enabled by this approval. Options B and C remain unselected alternatives. Mandatory remedies and accurate correction of unauthorized, duplicate or undelivered charges are not displaced by a discretionary trust window. Counsel, tax and accounting review of the actual offers, disclosures, methods, use restrictions and applicable consumer rights remains required before live use. [OD-REV D08]

<a id="COM-B0142"></a>
| Owner option | Customer / company tradeoff | Approval / boundary |
| --- | --- | --- |
| A — Short, clear trust windows plus error correction | Simple rules, fewer arguments over use; some refunds after meaningful work has been received. | APPROVED. Use the policy below. Do not inspect private content to decide whether it was “worth it.” |
| B — Thirty-day broad satisfaction refund | Greater reassurance and potential acquisition benefit; higher exposure to complete-Build-then-refund behavior. | UNSELECTED alternative only; requires separate approval, budget, clear qualification treatment and abuse review before any use. |
| C — Mandatory remedies only, otherwise no refunds | Lower apparent discretionary cost, but more difficult support and potentially more disputes or mistrust. | UNSELECTED; not the launch direction. “No refunds” does not eliminate legal obligations. |

<a id="COM-B0143"></a>
#### 12.2 Approved trust policy

<a id="COM-B0144"></a>
| Charge / benefit | Approved handling | Access and evidence treatment |
| --- | --- | --- |
| Duplicate or unauthorized merchant charge | Correct verified unintended charges regardless of ordinary goodwill window; coordinate any open dispute to prevent double reimbursement. | Preserve valid intended purchase; no extra benefit invented for excess money. Security investigation is separate. |
| Technical failure preventing purchased access | Restore the exact promised access promptly or provide an appropriate full/partial remedy for undelivered service; a fully undelivered purchase merits full refund. | No demand to repurchase. Use order/availability facts, not conversation text. |
| $149 Full Build | Full refund before activation; after activation, a fourteen-calendar-day request window, even if meaningful use began. Apply the D01 unused-purchase refund at ninety days. | Confirmed full unwind ends the purchased Build grant and removes that source’s continuation qualification; retain all Blueprint content already created and Free access. |
| $299 first-year package | Full refund before activation or within fourteen calendar days after activation, even after meaningful use. Same ninety-day unused-purchase rule. | Unwind package-funded Build/Steward components and qualifying acquisition; other independent valid grants remain. No ad hoc partial allocation. |
| Monthly recurring charge | Full refund of that recurring charge if requested within seven calendar days of the charge; outside that window, ordinarily retain access to period end, with exceptions for error, failure or law. | Confirm affected-term treatment and cancellation separately; refund does not automatically revoke valid Full ownership. |
| Annual recurring charge | Full refund of that recurring charge if requested within fourteen calendar days of the charge; outside that window, ordinarily retain access to term end, with separately authorized service-failure/legal remedies; D06 overlap proration remains deferred. | Remove the refunded continuation interval when the refund is confirmed; Full acquisition and already-created content remain. |
| Sponsor-funded purchase | Apply the sponsor agreement and tax treatment to the organizational payer. Do not refund the participant money they did not pay. | Protect participant promises under D12/D14; no disclosure of private use to calculate the sponsor’s claim. |
| Scholarship / admin grant | No cash refund exists when no money was paid. Correct mistaken scope/dates through authorized grant adjustments. | No Stripe transaction is manufactured. Preserve independent content rights and other grants. |
| Chargeback/dispute | Use Section 15 and the exact provider case status/deadline. | Do not issue an uncoordinated second refund or punish the participant for asking their bank to investigate. |

<a id="COM-B0145"></a>
The request deadline is recorded when received, not when business-hours support next reads it. A full unwind of the only paid Full acquisition removes only that source’s Full-continuation qualification; it never deletes Blueprint content already created. Other independently valid Full, sponsored or scholarship sources survive. Do not inspect private conversations or Blueprint content to determine refund eligibility or how much value was received. These approved windows are customer-policy directions, not statutory cooling-off claims. A refund request must not require a confession, intimate explanation, rating, deletion of the Blueprint or agreement to stop making a legitimate complaint. After the discretionary window, authorized support may apply documented legal/service-failure remedies; a discretionary exception needs the delegated authority in D13, not an AI promise.

<a id="COM-B0146"></a>
#### 12.3 Refund transaction and abuse boundary

<a id="COM-B0147"></a>
[TC] Record request, payer, original payment, reason code, requested/approved amount, tax adjustment, authorized actor, policy version and expected entitlement effect. Check prior refunds/disputes under lock. Submit once with a durable operation ID, then reconcile provider status. A request or API acknowledgment is not money received by the customer. Use distinct pending, succeeded, failed and canceled outcomes; insufficient processor balance or other provider conditions can delay a refund. Give a truthful status and next support update without guaranteeing bank posting time. [ST07]

<a id="COM-B0148"></a>
Apply entitlement termination/qualification treatment only through the approved refund policy and the recorded effective event. Ordinarily preserve paid access while a valid refund remains pending, unless the participant requested immediate termination or a separate legitimate security reason applies. A failed refund must not leave both payment retained and the promised service removed without a resolution case. Cancellation of future charges can be confirmed independently while the refund is pending.

<a id="COM-B0149"></a>
For repeated refund misuse, restrict repeat purchase or discretionary exceptions only after minimal commercial-pattern review under a published policy. Do not analyze Blueprint themes, spiritual beliefs, distress or private conversation to assess “refund abuse.” Preserve mandatory rights, existing approved content and an appeal route. An independently valid sponsor/scholarship Full grant may still qualify a participant after a refunded retail acquisition; one source’s reversal cannot destroy another source’s authority.

<a id="COM-B0150"></a>
### 13. Tax: current findings, unresolved classification and operating requirements

<a id="COM-B0151"></a>
#### 13.1 What the research supports

<a id="COM-B0152"></a>
[CL + RV] Arizona-first is a geographic scope, not an exemption. Arizona describes transaction privilege tax (TPT) as a tax on vendors for taxable business activity. Product labels such as “AI guide,” “subscription,” “coaching,” “digital document” or “church program” do not themselves settle the classification or tax base. The actual entity, contracts, delivery and jurisdictions matter. [TX01; TX02]

<a id="COM-B0153"></a>
In ADP, LLC v. Arizona Department of Revenue and City of Phoenix (Arizona Court of Appeals, January 31, 2023), the court affirmed rental TPT treatment of remotely accessed eTime software on the facts before it. Remote hosting and service-like functionality did not automatically remove that software transaction from tax. That is a material warning against assuming every hosted AI/digital service is exempt; it is not a determination that Steward’s specific bundled offers are taxable rentals. [TX03]

<a id="COM-B0154"></a>
Arizona’s remote-seller statute states a threshold of more than $100,000 for the covered remote retail sales in the current or previous calendar year for 2021 onward. That remote-retail rule must not be substituted for analysis of an Arizona-based seller’s physical presence, a different TPT classification, affiliated operations or city tax. ADOR’s published threshold material is consistent with the $100,000 figure. [TX04; TX05]

<a id="COM-B0155"></a>
Nonprofit sponsorship is not a general tax exemption for purchases. ADOR distinguishes exemptions applicable to particular nonprofit sales or qualifying organizations from an assumption that every sale to a nonprofit is exempt. Require the specific exemption basis and valid documentation where an exemption is actually available. [TX06]

<a id="COM-B0156"></a>
#### 13.2 What the tax CPA / tax counsel must resolve

<a id="COM-B0157"></a>
| Unresolved question | Required professional output before the affected paid offer |
| --- | --- |
| Legal seller and Arizona footprint | Entity, business location, employees/contractors and related-entity facts; state/city licensing, nexus and filing responsibilities. Do not charge under an unverified entity name. |
| $149 guided initial Build | Analysis of software access, automated guidance, any human service, access duration and participant document rights; applicable classification, sourcing and taxable receipts. |
| $299 first-year package | Whether components are one taxable offering or appropriately separable; documented tax/accounting allocation if needed, without inventing a new retail offer or assigning $149 automatically to a component. |
| $19/$199 recurring service | Service/software classification, period sourcing, user-location rules, tax on renewal, rate changes and treatment of credits/refunds. |
| Downloadable Blueprint/documents | Whether included exports change classification, bundled-transaction treatment or taxable base; personal ownership does not itself decide taxability. |
| Organizational sponsorship | Payer versus service-user locations, seat arrangements, exemptions/certificates, tax on prepaid/unused seats, grants funded by MJG and contract cancellation/refund terms. |
| Other-state sales or participant moves | Physical and economic nexus, different digital/SaaS rules, state/local sourcing, thresholds across all channels and affiliates, registration lead time and release restrictions. |
| Refunds, disputes and unused prepaid balances | Credit/refund documentation, tax reversals, return amendments, unclaimed-property/prepayment issues if any, and correct accounting rather than deletion of original sales. |

<a id="COM-B0158"></a>
The reviewed tax decision record must identify each offer version, jurisdiction, factual assumptions, tax code, rate/sourcing configuration, registration effective dates, exemption handling, evidence owner and re-review trigger. An unresolved classification means the affected paid route remains blocked; it does not mean “charge no tax until someone complains.” Mike selects the business posture, not the statutory interpretation.

<a id="COM-B0159"></a>
#### 13.3 Stripe Tax: useful tooling, not a legal determination

<a id="COM-B0160"></a>
[TC + RV] Stripe Tax can assist with calculation, collection, reporting and supported monitoring/registration/filing services when configured and enrolled as applicable. It does not independently establish that MJG selected the right seller, classification, customer location, tax code or exemptions, or that every required registration/return is complete. Confirm which services are actually purchased and operational. Maintain all-channel sales and physical-presence information; do not assume provider monitoring covers every nexus fact. [ST13–ST15]

<a id="COM-B0161"></a>
Final Arizona-specific verification. The Arizona-selected Stripe page retrieved in the final recheck reports the $100,000 current-or-previous-calendar-year threshold and distinguishes an Arizona head office from a remote seller. That agrees with the covered statutory threshold; it does not classify Steward’s offerings or establish a threshold exemption for a physically present seller. The tax professional must verify the actual entity, activity and live configuration. [ST16; TX04–TX05]

<a id="COM-B0162"></a>
[OD D11 — APPROVED] Preserve the approved base prices and display base price plus applicable tax, with the exact total shown before the participant affirmatively authorizes payment. No surprise post-purchase tax debit is permitted. Paid geography remains restricted to the tax-reviewed/registered scope, and paid routes remain blocked wherever classification, sourcing, registration or configuration is unresolved. Applicable counsel/CPA review of how TPT is passed through and described remains required. This owner direction does not determine whether Steward is taxable or select a classification, rate, sourcing rule or registration obligation. Stripe Tax may assist implementation but does not replace CPA/tax-counsel determination. [OD-REV D11]

<a id="COM-B0163"></a>
[TC] Keep billing/tax location information in the restricted commercial domain, not the Blueprint. Collect the minimum information sufficient for the reviewed tax determination, without extracting an address from private conversations. If location/tax validation fails, stop checkout with a useful correction path. Before geographic expansion, update the nexus register, required registrations, offer restrictions, notices, tax tests and filing ownership. Reconcile gross receipts, tax, refunds, disputes, processor fees and bank payouts separately; a payout total is not the taxable sales ledger.

<a id="COM-B0164"></a>
### 14. Customer terms and consumer disclosures: requirements for counsel

<a id="COM-B0165"></a>
#### 14.1 Current legal research boundary

<a id="COM-B0166"></a>
[CL + RV] For covered online negative-option transactions, ROSCA requires clear disclosure of material terms before obtaining billing information, express informed consent before charging, and simple mechanisms to stop recurring charges. Counsel must map that baseline to the actual Checkout, acknowledgment and cancellation flows. [L01]

<a id="COM-B0167"></a>
Do not use the FTC’s 2024 “click-to-cancel” amendments as an operative nationwide compliance checklist. The 2026 Federal Register action records their vacatur and restores the earlier rule text; the FTC’s March 2026 negative-option proceeding was an advance notice of proposed rulemaking, not a new final rule. Other federal/state obligations remain relevant. Recheck the rule docket and current law at release. [L02–L03]

<a id="COM-B0168"></a>
Recurring transfers from consumer asset accounts may implicate Regulation E, including written or similarly authenticated authorization and a copy to the consumer; varying-amount notice provisions may also apply. Counsel must assess the actual debit/card/ACH methods, tax variation and price changes. A processor’s payment token is not, by itself, the complete authorization analysis. [L04]

<a id="COM-B0169"></a>
Arizona’s Consumer Fraud Act prohibits deceptive or unfair practices and material concealment in covered sales. The introduced Arizona HB 2951 text retrieved during research is not treated here as enacted law; counsel must verify final session law/status and effective dates rather than treating a bill page as a statute. [L05; L07]

<a id="COM-B0170"></a>
Conditional expansion example—not a national template. California BPC §17602 includes express affirmative recurring consent, retainable acknowledgment, accessible cancellation, annual reminders and specified notices. Covered yearly renewals use a 15–45-day advance window; fee changes use 7–30 days. Consent verification is retained for at least three years or one year after termination, whichever is longer. Counsel must verify applicability, exceptions and other states before expansion; this is not authority to retain private conversations for those periods. [L06]

<a id="COM-B0171"></a>
#### 14.2 Required offer and terms package

<a id="COM-B0172"></a>
| Topic | Counsel-ready requirement and product constraint |
| --- | --- |
| Seller / contact | Actual legal entity, business/contact address, support and dispute contact, billing descriptor and responsible processor roles. “MJG” is not a substitute for identifying the contracting entity. |
| Offer description | Exact product/version, Free versus Full depth, included service, qualification rules and no guaranteed personal outcome or completion in thirty days. |
| Price and tax | Approved USD base price plus applicable tax under approved D11; exact total before affirmative payment authorization, charge timing and no surprise post-purchase tax debit or false discount/anchor. No tax classification is established. |
| One-time Build | No recurring agreement; explicit activation starts 30 calendar days, not purchase. D01 gives 90 calendar days from confirmed payment to activate, full refund before activation and automatic full refund initiation for genuinely unused/unactivated purchases at the deadline. Build end preserves created content/Free access; D08’s 14-day post-activation refund window also applies. |
| First-year package | D02: one-time prepaid $299, no automatic recurring agreement or annual renewal. Activation starts 30 calendar Build days and 12 calendar months of Steward together, with no additional months after Build. Same 90-day unused-purchase/refund principle and D08 refund windows. Continuation after 12 months needs a new affirmative $19/month or $199/year choice; D03 bars sale to an already qualified Full owner. |
| Monthly / annual | Exact recurring cadence and current price, first/next charge, original authorization, notices, D07 fixed seven-calendar-day failed-renewal grace and cancellation effect. D04 qualification/timing and D05 end-of-paid-term cadence changes apply; no $19 initial-Full bypass or silent cadence fallback. |
| Refunds / disputes | Approved policy, request channel/deadline, error/failure remedies, pending-result disclosure, entitlement effects and mandatory-rights savings provisions. No final legal text is supplied here. |
| Sponsor / complimentary | Actual approved template/programme scope, start/end and activation; no card, automatic personal subscription, private-content access or named activity feed. D06 deferred sponsored activation and separately reviewed timing exceptions; participant complaint route independent of sponsor. |
| Blueprint rights / access | Participant retains their created Blueprint; paid expiry does not erase it. Distinguish participant content rights from platform IP, third-party Scripture/publication licenses and any legal limits on AI-generated copyright claims. |
| Service / AI | AI nature, limitations, actual service availability, no licensed professional/emergency service claim, appropriate human-support limits and no guaranteed outcomes. |
| Privacy / security | Incorporate the applicable privacy notice; separate necessary processing, optional notes/notifications, marketing, recurring authorization and sharing. No consent-by-payment. |
| Electronic communications | Retainable transactional notices and applicable consent requirements, safe contact updates and alternative cancellation/support access where required. |
| Changes / closure | D10 honors purchased terms; higher renewal price or cadence change needs fresh affirmative acceptance, otherwise stop the unaccepted renewal at term end. Price reductions need no unnecessary re-consent, subject to legal/tax/provider rules and truthful notice. D09 cancellation is direct self-service, separate from immediate termination, account closure and privacy deletion; commercial-record retention remains purpose-limited. |
| Contract risk terms | Counsel considers warranty limitations, liability, dispute resolution, governing law, class/arbitration provisions if proposed, accessibility, service cessation and enforceability. No owner-approved blanket waiver is presumed. |

<a id="COM-B0173"></a>
#### 14.3 Checkout and cancellation presentation controls

<a id="COM-B0174"></a>
[TC + RV] Put essential price, cadence, term/start, renewal and cancellation facts near the purchase control. Use an affirmative action with an unambiguous charge description; do not preselect recurring consent, hide it in a general policy acknowledgment, or bundle it with marketing. Retain the displayed offer/disclosure version and the exact transaction action. A generic checkbox alone is not a legal-sufficiency finding.

<a id="COM-B0175"></a>
Show selected-benefit confirmation for no-card grants without a payment form. Present “Payment confirmed, activation available” separately from “Active until [date].” Cancellation remains available through a direct account control without needing to explain motives to Steward. Security verification must be proportionate and offer a workable alternative for a participant who cannot log in; do not expose private Blueprint content to resolve cancellation. All participant copy remains subject to counsel, accessibility and actual-configuration review.

<a id="COM-B0176"></a>
### 15. Chargebacks and disputes

<a id="COM-B0177"></a>
[TC + RV] Open a restricted commercial case on a verified notice. Record provider case ID, reason category, amount/currency, original payment, stage, exact response deadline, assigned authorized owner and evidence disposition. Do not assume a single universal card-network deadline. Reconcile pending refunds before choosing to accept or contest; use Stripe’s current case-specific procedures. [ST08]

<a id="COM-B0178"></a>
| Allegation / event | Required investigation and preferred evidence | Prohibited shortcut |
| --- | --- | --- |
| Refund already issued | Verify refund ID/status/amount/date and original payment; coordinate double-credit prevention with provider. | Treating a refund request as completed or submitting intimate content to “prove honesty.” |
| Duplicate charge | Compare separate payment IDs, offers, order reservations and overlapping service periods; refund an actual unintended duplicate. | Calling two charges different products merely because two entry points created them. |
| Service not received | Exact purchased benefit, activation/availability records, access-grant result, outage/correction history and minimal delivery facts. | Sending the participant’s Blueprint, journals or full chat transcript. |
| Canceled subscription | Original recurring authorization; cancellation request and confirmation timestamps; affected invoice/charge and merchant action log. | Insisting only a successful portal click counts when another valid cancellation request was received. |
| Unauthorized transaction | Payment authorization and minimal account-security facts under reviewed access; route suspected takeover separately. | Equating authenticated use with conclusive proof of the payer’s authorization. |
| Dispute won / lost | Reconcile actual funds/result and approved access policy; preserve necessary case outcome. | Automatically resuming canceled billing, recreating Full content or declaring every allegation fraudulent. |

<a id="COM-B0179"></a>
[OD D14 — APPROVED] Preserve previously confirmed good-faith access while an ordinary payment dispute is investigated. Stop additional disputed recurring collection under the reviewed workflow. Do not impose account-wide punishment solely because a dispute exists. A confirmed refund, reversal or lost dispute affects only its funding source and associated qualification/access as approved. Retain Blueprint content, Free access and other independently valid paid, sponsored or scholarship sources. Verified security restrictions remain separately governed. Winning a dispute never automatically restarts canceled billing or constitutes new recurring consent. [OD-REV D14]

<a id="COM-B0180"></a>
[AP + TC] Evidence should prefer offer/terms versions, affirmative authorization, payment references, grant/activation, non-sensitive availability/usage receipts, cancellation and refund facts. Do not submit intimate conversations or Blueprint content routinely to Stripe/card networks. No raw private-content archive may be built “in case of chargebacks.” Any exceptional legally required disclosure requires the separate PRIV authority, necessity, minimization, counsel and evidence-access process; a billing employee cannot self-authorize it. [P1-01 I–K; PRIV §§9, 13, 18.3]

<a id="COM-B0181"></a>
### 16. Sponsored / church billing architecture

<a id="COM-B0182"></a>
#### 16.1 Three separate relationships

<a id="COM-B0183"></a>
SPONSOR PAYMENT ≠ PARTICIPANT ENTITLEMENT ≠ PARTICIPANT PRIVATE CONTENT.

<a id="COM-B0184"></a>
[AP + TC] Use an organizational payer record, a versioned agreement/cohort configuration and individual internal grant records. They can be reconciled without reading participant content. A sponsor contract does not inherit the participant’s processing/sharing permissions. Compass remains the first specific approved configuration; its benefits are not a universal church package. Church seat pricing, revenue shares, commissions and incentive formulas are not established by this work. [PJ §16; P1-01 J; PRIV O08]

<a id="COM-B0185"></a>
| Record | Minimum commercial fields and boundary |
| --- | --- |
| Sponsor organization | Organization ID, legal billing name/contact, restricted tax/exemption details where needed; no automatic participant-content privileges. |
| Sponsor agreement/version | Approved seller/payer, cohort, purchased capacity, payment schedule, benefit template, activation rules, unused-seat policy, cancellation/refund terms, privacy/reporting limits and authorized signatories. |
| Approved cohort configuration | Program ID/version; eligibility verification method; participant/leader distinctions; Full inclusion; actual service duration; activation preference versus binding deadline; continuation route and no-auto-conversion flag. |
| Seat allocation | Internal seat ID and grant correlation; reserved, issued, activated, released or voided states with reason and audit. No unrestricted sponsor drill-through. |
| Participant / leader grant | Recipient’s canonical ID, benefit scope, source, approved dates/activation and nonrenewing character; no individual card required. |
| Sponsor payment | Order/invoice/payment/refund/dispute state belongs to organizational payer; it is not participant payment status or permission. |
| Reporting authorization | Separately approved aggregate metric/version, privacy threshold method, audience and release; no automatic named activation, nonactivation, use, completion, payment or withdrawal feed. |

<a id="COM-B0186"></a>
[AP] Compass post-study participants receive Full Build and sixty days of Steward from confirmed activation, with Build inside that period. Leaders receive Full if needed and twelve months from activation. Neither requires a card or renews automatically. Late activation against the approximate thirty-day participant preference is not a forfeiture. No ordinary billing administration may weaken those benefits. [PJ §16.8; PRIV §7.3]

<a id="COM-B0187"></a>
#### 16.2 Seats, payment failure and privacy-safe reconciliation

<a id="COM-B0188"></a>
[OD D12/D14 — APPROVED] Every sponsored programme uses its own approved written commercial configuration/agreement. Capacity/seats, issuance, activation, unused-seat treatment, payment, default and remedies are programme-specific; there is no generic unlimited-seat promise. Internally, unused/unactivated seats may be reassigned only under approved programme rules and participant notices; never silently transfer an activated person’s entitlement to someone else. Do not invent universal Steward church seat prices or a hard Compass forfeiture deadline. No automatic annual sponsor renewal or leader commission is approved here. [OD-REV D12, D14]

<a id="COM-B0189"></a>
For sponsor nonpayment, where the actual agreement permits, hold new unissued benefits while commercial staff resolves the payer’s account. Already activated good-faith participant entitlements should ordinarily be honored through their confirmed term, subject to the actual agreement and counsel. Record who bears the cost; do not ask participants for a card to repair sponsor debt. A confirmed sponsor term end prevents new grants unless the agreement expressly covers later activation, but it must not silently shorten an already valid participant interval.

<a id="COM-B0190"></a>
[TC + RV] Match organizational invoices to agreement/version, contracted capacity and appropriate aggregated financial totals. Internal grant-to-seat reconciliation remains restricted. Do not send a sponsor a list of who activated, who is past due personally, who canceled, or what anyone discussed. Even a small aggregate can identify a person; apply PRIV’s reviewed report catalogue, subgroup/differencing protections and no-drill-through rule. An organization may know its own invitation list without being entitled to a system report on each invitee’s private activity. [PRIV §7, O08]

<a id="COM-B0191"></a>
### 17. Admin, scholarship and complimentary grants

<a id="COM-B0192"></a>
#### 17.1 Authority and immutable grant record

<a id="COM-B0193"></a>
[AP + TC] The AI cannot grant Full, a trial, scholarship, discount, extension, sponsorship, refund or renewal. A human or deterministic service may issue only an approved type within its explicitly delegated scope. System issuance means execution of a preapproved rule, not model discretion. [PJ §18; BRIEF Part 17]

<a id="COM-B0194"></a>
Every manual grant records grant ID; canonical participant; grant/template version; source and source agreement where any; non-sensitive reason code; authorized issuer and programme/template approval reference, plus any separately required exception authorization; product/benefit components; start/end or activation policy; whether Full is included; renewal behavior; issuance/activation timestamps; idempotency/correlation key; and correcting/superseding events. A no-card grant has billing_agreement_id = null unless it merely coexists with a separately authorized personal agreement. It does not create a zero-dollar subscription capable of later charging.

<a id="COM-B0195"></a>
[OD D13 — APPROVED] Michael J. Gauthier approves the grant programme/template, its eligible participant population, benefit scope, Full inclusion, Steward duration, activation rule, maximum quantity/seat count, budget or economic limit where relevant, issuer/delegated role and exception boundary. Once that bounded template is actually approved, an authorized operator or deterministic system may issue ordinary grants strictly within it without individual Mike approval. Anything outside the template or its limits requires the designated exception authority; Steward AI, support, engineering, sponsors and church leaders cannot improvise it. No operator may self-approve their own exception, and no sensitive free-text justification is permitted. All grants remain auditable and exact in scope/dates. [OD-REV D13]

<a id="COM-B0196"></a>
For Level 1, the approved direction permits establishing a specific separately approved LEVEL_1_NONPAID_PILOT grant template capped at the separately authorized pilot count. This standard does not approve an actual template, grant or real enrollment. For Compass, use separately approved participant and leader templates consistent with Product Journey; do not generalize their benefits. Standard reason codes may include internal_pilot, approved_scholarship_program, compass_participant, compass_leader, service_failure_remedy and verified_legacy_full; each code needs an actually approved template before use. An ordinary within-template issuance records the template approval reference and authorized issuer, not a new individual Mike approval. [OD-REV D13; PJ §16; SAF §§0.4, 16–17]

<a id="COM-B0197"></a>
#### 17.2 Corrections and oversight

<a id="COM-B0198"></a>
[TC] Grant creation, extension, revocation and source change use audited transactions with step-up and role checks. Show the exact benefit/dates and no-billing statement to the participant before activation. A correction references the original grant; do not rewrite issuance history. Independent review samples minimal commercial grant facts and authority, not participant content. Prevent self-approval of an operator’s own benefit or an exception outside delegation; preserve PRIV’s separation and review requirements. Automated extension after an outage is disabled until its specific policy/template and limits are approved.

<a id="COM-B0199"></a>
### 18. Discounts and promotions: architecture only

<a id="COM-B0200"></a>
[FD + TC] No promotion program, trial, coupon, gift, lifetime, family, employer, creator-bundle or app-store offer is enabled by this standard. A future promotion requires an approved immutable offer/rule version, start/end, eligible product/channel/participant basis, total and per-person redemption limits where relevant, stacking rules, tax treatment, consumer disclosures, issuer authority and audit. Checkout must reject an unrecognized or disabled promotion even if a Stripe coupon exists.

<a id="COM-B0201"></a>
[AP] Do not target offers from low Created for More scores, distress, grief, inferred financial hardship, safety concerns, spiritual doubt, addiction/compulsion, abuse, health conditions or intimate conversation. Do not send those attributes to Stripe, marketing tools or a promotion engine. An independently approved scholarship program is a separate application/grant process, not AI-driven emotional conversion. [PJ §8; PRIV O10; BRIEF Part 18]

<a id="COM-B0202"></a>
Disable promotion-code entry, dashboard-created public discounts, portal retention discounts and ad hoc staff override paths until separately governed. A future offer must not silently convert sponsored access to billing or reset Full qualification. Refunds and service-failure remedies are not a backdoor promotion programme; their authority and reason codes remain distinct.

<a id="COM-B0203"></a>
### 19. Customer portal and self-service

<a id="COM-B0204"></a>
| Control | MJG account UI | Stripe-hosted surface / boundary |
| --- | --- | --- |
| Current access | Canonical mode, Full qualification, source-specific intervals, paid/sponsored/complimentary distinction and truthful unknowns. | Processor portal is not the authoritative entitlement display. |
| Current billing | Cadence, next confirmed charge/date, cancellation/refund/dispute state and clear link to manage billing. | Payment-method update, invoices/receipts and approved cancellation controls. |
| Purchase Full | Offer only when eligible and released; preserve existing Free work. | Application-created Checkout with fixed approved Price/quantity. |
| Purchase continuation | Server verifies Full qualification and absence of conflicting access/agreement; exact selected cadence. | Approved Checkout/subscription path; no generic portal route bypassing eligibility. |
| Cancel renewal | Direct self-service control and confirmed receipt; usable without chatting with Steward. | Configured portal cancellation can execute the provider action; synchronize and reconcile its outcome. |
| Change plan | Show only approved, implemented transition policies and actual effective date. | Disable generic plan switching if it cannot enforce qualification, overlap, notices and boundary rules. |
| Sponsored benefit | Show program scope, confirmed activation/end or deferred-activation status, paid and sponsored sources separately, no-card/no-renewal and optional continuation after expiry. | Do not manufacture a participant payment profile solely to display sponsorship. |
| Blueprint / privacy | Secure self-view/export, selected continuity controls, privacy/closure functions under PRIV. | No private Blueprint content, assessment responses or journals in the payment portal. |

<a id="COM-B0205"></a>
[TC + RV] Create portal sessions server-side for the authenticated canonical participant’s mapped Customer only; use approved return destinations and short-lived links, with no arbitrary Customer ID from the browser. A portal session does not authenticate ownership of a different MJG participant record. Test portal-initiated cancellation, card updates and invoices under actual configuration; vendor defaults can expose changes not authorized by the offer catalogue. [ST09]

<a id="COM-B0206"></a>
The account UI should state “No automatic renewal” for prepaid/sponsored/complimentary access where true, rather than showing a misleading canceled subscription. Show payment fact, pending activation and active access separately. Self-service must remain accessible during model outages and business-hours closure where the underlying account/billing route is safe. A billing-system outage needs a safe alternative cancellation request and truthful pending status, not a requirement to keep paying because chat is unavailable.

<a id="COM-B0207"></a>
### 20. Billing support and commercial escalation

<a id="COM-B0208"></a>
#### 20.1 Minimum role access

<a id="COM-B0209"></a>
[AP + TC] Billing support may see canonical customer reference, approved offer/version, amount/currency/tax, payment/invoice/receipt references, entitlement source/scope/dates/state, cancellation/refund/dispute state and the minimal audit facts needed for the case. They must not need Blueprint text, raw conversations, Check-In answers, journals, health/sexual/relationship disclosures or religious reflections. Use a restricted support projection, not unrestricted Supabase or Stripe administrator access. [P1-01 C.4; PRIV §§2–3, 18.3]

<a id="COM-B0210"></a>
| Commercial case | Primary function | Escalation / control |
| --- | --- | --- |
| Payment/access disagree | Billing operations verifies payment; engineering verifies entitlement transaction. | Reconciliation case with order/operation IDs; no support edit to private content or request to repurchase. |
| Refund/cancellation unclear | Authorized billing operator applies approved policy and checks provider status. | Exceptions go to the named delegated approver; recurring authorization/legal disputes to counsel. |
| Suspected account takeover | Security incident function | Step-up/recovery and proportionate account restrictions; commercial team receives only necessary facts. |
| Sponsor invoice/seat issue | Sponsor commercial administrator | Contract owner/counsel; no participant-private-content disclosure and no individual billing solicitation. |
| Unauthorized charge or dispute deadline | Named dispute owner and backup | Current provider case procedure, counsel as needed, independently reviewed evidence submission. |
| Privacy or unsafe-response complaint in billing contact | Appropriate privacy/safety case lane | Selected necessary evidence under PRIV, not a whole-transcript attachment or routine billing visibility. |

<a id="COM-B0211"></a>
#### 20.2 Autonomy and support availability

<a id="COM-B0212"></a>
[AP] Steward is designed to operate autonomously. Human customer-support availability, human review or human approval is not a prerequisite for a normal conversation or approved safety-resource guidance. Normal participant conversations do not route to staff, and a safety signal alone does not create automatic human escalation. Commercial exception review does not create a human-supervised ordinary conversation model. [SAF §§0.4, 7.2]

<a id="COM-B0213"></a>
The approved first-pilot human support direction is Monday–Friday, 9:00 a.m.–5:00 p.m., America/Phoenix, with published closures, a primary and trained deputy, a first human acknowledgment target within one business day and initial disposition or meaningful update within two business days. These are not guaranteed resolution times or emergency monitoring. Actual commercial launch staffing, backup access and dispute/incident deadline coverage must be assigned and verified; this standard appoints no new operator. AI availability and technical containment arrangements remain separate. Autonomous Steward may operate 24/7 where the authorized production candidate, infrastructure, provider configuration, safety controls, static-resource fallback and specialist reviews support it; this is not a claim of deployed availability or after-hours human monitoring. [SAF §§0.4, 7.2]

<a id="COM-B0214"></a>
[TC] Provide an in-account case receipt and safe non-chat contact. Never ask for full card data, CVV or a private conversation to prove payment. A participant’s minimal order/email reference can begin verification without disclosing account existence to an unauthenticated third party. If a case cannot be resolved during ordinary coverage, communicate the next realistic update while the automated cancellation/reconciliation controls continue; do not promise an unstaffed live billing desk.

<a id="COM-B0215"></a>
### 21. Failure and reconciliation states

<a id="COM-B0216"></a>
#### 21.1 Deterministic case policy

<a id="COM-B0217"></a>
[TC with approved OD directions and open release dependencies] The following table defines the approved state-handler requirements, not model discretion. “Preserve” means preserve a previously confirmed, still-valid grant; it never means grant new premium access merely because payment is uncertain. The Blueprint and public safety resources remain separate from premium collection status. D07, D08, D12 and D14 are approved owner directions; all applicable professional, implementation, testing and release gates must still be satisfied before enabling affected flows.

<a id="COM-B0218"></a>
| Case state | Access treatment | Required next action / closure evidence |
| --- | --- | --- |
| PAYMENT_SUCCEEDED_ENTITLEMENT_FAILED | No unconfirmed new access; keep any independent valid existing access. | Retry the same fulfillment transaction; alert on backlog; correct/refund if delivery fails. Show payment confirmed/access pending. |
| PAYMENT_UNKNOWN | No new or extended paid interval; preserve existing confirmed access until its own end. | Reconcile original operation/object before another charge; show uncertainty, never “unpaid” or success without proof. |
| ENTITLEMENT_ACTIVE_PAYMENT_REVERSED | D08/D14 review of only the reversed source; no content deletion. | Confirm reversal and policy effect; separately process qualification, any valid other grants and notice. |
| REFUND_PENDING | Normally preserve affected access unless immediate termination was requested or separate security restriction applies. | Track provider status, avoid duplicate reimbursement, keep cancellation state separate. |
| REFUND_CONFIRMED | Apply approved affected-component end/qualification treatment, preserving content and other valid grants. | Confirm money fact, tax adjustment and entitlement transaction; issue truthful receipt. |
| DISPUTE_OPEN | D14: ordinarily preserve confirmed access while reviewed; no new disputed billing by default under approved policy. | Assign case/deadline; reconcile refunds, security and collection stop; minimal evidence only. |
| DISPUTE_WON | Reconcile valid access; no automatic uncancel/re-enrollment. | Record outcome/funds and any separate restoration decision; do not infer future charge consent. |
| DISPUTE_LOST | D14: revoke reversed source as approved, retain Blueprint/Free and independent grants. | Close monetary case and policy transaction; notice/support path, no punitive private-content action. |
| SUBSCRIPTION_CANCEL_PENDING | Preserve paid-through access; block new application collection instructions. | Reconcile provider cancellation and in-flight invoices; pending message and timestamped request. |
| SUBSCRIPTION_CANCEL_CONFIRMED | Access through effective paid end unless separately terminated. | Verify future collection stop, record exact end and receipt; clean schedules/pending items under policy. |
| PAYMENT_PAST_DUE | Prior paid interval; then D07 approved seven-calendar-day renewal grace, subject to applicable professional review, implementation, testing and release; then Free/retained content. | Approved retry/notice/final invoice disposition; no infinite grace or indefinite off-service billing. |
| SPONSOR_PAYMENT_FAILED | D12/D14: preserve activated good-faith terms; hold new unfunded grants as agreed. | Resolve with organization, not participant card collection; contract/evidence review. |
| SPONSOR_EXPIRED | Expire only grants whose own confirmed end has arrived; preserve longer valid promised intervals where authorized. | Stop unapproved new issuance; preserve Free/Blueprint; no personal subscription creation. |
| DUPLICATE_ENTITLEMENT_DETECTED | One effective capability set, not doubled allowances. | Reconcile source intervals, unintended charge/remedy and provenance; no silent time stacking. |
| DUPLICATE_ACCOUNT_DETECTED | Secure existing access; hold conflicting new purchase/activation. | Verified identity/merge workflow; do not reveal or combine another person’s content. |
| SECURITY_SUSPENDED | Restrict only justified routes; preserve safe cancellation, rights intake and static resources. | Separate security authority, review/appeal and verified restoration; no distress-based suspension. |

<a id="COM-B0219"></a>
#### 21.2 Reconciliation jobs and recovery

<a id="COM-B0220"></a>
[TC] Implement an incremental provider reconciliation worker and a separate complete financial/control sweep. Recommended engineering starting targets are an incremental run at least every five minutes, a content-free alert for a paid order unfulfilled for fifteen minutes, and a daily paginated sweep of open orders, agreements, recent invoices/payments, refunds/disputes and grants. These are proposed operational targets to validate against provider limits, release capacity and actual alert ownership—not customer guarantees or a claim of staffed 24/7 support.

<a id="COM-B0221"></a>
Use persisted cursors with overlap, bounded retry/backoff, dead-letter state and idempotent reprocessing. Store reconciled-at, provider-object/version facts, local version and discrepancy reason. A cursor reaching its end is not proof of completeness if pages failed. Daily sweeps compare totals and identities, not only counts. Reconcile scheduled changes, pending cancellations, prepaid activation obligations and expired premium independently of payment events.

<a id="COM-B0222"></a>
Restoring a database backup must not replay a charge, refund twice, reopen canceled billing or regrant a revoked entitlement. Reconcile provider truth and the protected disposition/operation ledger before enabling commerce after restore. Preserve current privacy restrictions, disabled-feature flags and account-closure fences. Exercise loss-of-webhook, lost-acknowledgment, job-crash, stale-cache and restore scenarios with synthetic data before release. [P1-01 G, K, L; PRIV, retention/security controls]

<a id="COM-B0223"></a>
### 22. Commercial audit trail and retention

<a id="COM-B0224"></a>
#### 22.1 Durable, minimized facts

<a id="COM-B0225"></a>
| Evidence group | Required fields / evidence | Explicit exclusions |
| --- | --- | --- |
| Order and authorization | Order ID; canonical participant/payer references; offer/version; displayed price/currency/tax/total; terms/disclosure/refund/activation policy versions; affirmative action and timestamp; channel/environment. | Raw private conversation as assent, inferred consent from a chat statement, full payment instrument. |
| Provider facts | Account/mode, Customer/Session/PaymentIntent/Charge/Subscription/Invoice/Refund/Dispute IDs as applicable; verified event ID/type/time; amount/status; actual service interval and verification time. | Unbounded raw payload archive, secrets, CVV/PAN, sensitive metadata. |
| Entitlement effect | Grant/qualification ID, consumed order/invoice-line/period key, transaction ID, source, scope/start/end, activation, policy version, projection version and outcome. | Blueprint wording or personal approval changes. |
| Changes and remedies | Cancellation request/confirmation/effective end; refund requested/approved/submitted/confirmed; dispute reason/outcome/deadline; source-specific adjustments; actor/authority. | Unsupported claim that a refund reached the bank or cancellation succeeded merely because an API call was attempted. |
| Sponsor and manual grants | Agreement/cohort/template versions; internal seat/grant correlation; issuer/approval; reason code; scope/dates; no-renewal flag and exceptions. | Sensitive free-text scholarship reasons or named sponsor activity feeds. |
| Integrity and lifecycle | Occurred/recorded times; correlation/idempotency identifiers; audit actor; correcting-event links; retention class; scoped hold/disposition; access/export log where justified. | An indefinite audit exemption from privacy retention/deletion rules. |

<a id="COM-B0226"></a>
[TC + RV] Protect audit events against ordinary alteration; corrections append a linked correcting fact rather than rewriting history. Restrict dispute/finance exports and log their purpose. Retain exact purchased offer/terms/disclosure versions so a later catalogue edit cannot manufacture past authorization. A hash can support integrity but does not replace the actual justified evidence or prove consent by itself. [P1-01 I; PRIV §9]

<a id="COM-B0227"></a>
#### 22.2 Lifecycle and accounting controls

<a id="COM-B0228"></a>
Billing facts, consent proof, tax records, webhook transients, support cases, security evidence and Blueprint content need separate professionally approved retention policies. This standard does not select universal seven-year retention or copy a payment-network deadline into every data class. Conditional statutory consent-retention duties, tax examination periods, contractual limitations, refunds/disputes and legal holds must be resolved in the PRIV O05 schedule. Commercial holds must not become a shadow transcript archive. [PRIV O05; P1-01 F–G; L06]

<a id="COM-B0229"></a>
Record processor gross charges, tax, refunds, dispute movements, fees, net payouts and bank receipts separately. Reconcile the accounting ledger against provider objects and entitlement exceptions; a paid grant is not revenue-recognition advice. Accountants must address deferred/prepaid revenue, package allocation, sponsor receipts, refunded tax and unactivated balances. Preserve minimal commercial identity mapping after eligible content deletion only for a justified purpose and duration, with no ordinary AI retrieval.

<a id="COM-B0230"></a>
### 23. Concrete entitlement access matrix

<a id="COM-B0231"></a>
#### 23.1 Reading the matrix

<a id="COM-B0232"></a>
[AP + TC, with approved OD policies] This is one Blueprint, not a new copy per row. “Full retained” means already-created content/structure remains available; it is not a guarantee that all thirteen pages are populated, that the initial Build is complete, or that premium conversation continues forever. Yes* is subject to authenticated ownership, mandatory MFA/private-data controls, released capability, permitted processing and safe platform availability. Public static safety resources remain accessible independently of payment, login or model service where the approved safety implementation provides them. [T4; PJ §§4–9; PRIV; SAF §§0.4, 7.2]

<a id="COM-B0233"></a>
Free scope means bounded useful Free support under PJ, not unrestricted Full Build or Living Mode. Build scope means active initial guided Build. Living scope means approved ongoing conversation/refinement for a qualified Full owner. Conditional is deterministic application policy, never an AI choice. Specific quantitative capacity limits remain a separately approved product configuration; this standard invents no token/message quotas.

<a id="COM-B0234"></a>
#### 23.2 Content and service capabilities

<a id="COM-B0235"></a>
| Access state | Free Blueprint | Full Blueprint | Steward conversation | Initial Full Build workflow | Living Mode |
| --- | --- | --- | --- | --- | --- |
| FREE | Yes* | Only any independently retained Full content; Free-only creates no Full right | Free scope | No | No premium Living |
| FULL BUILD ACTIVE | Yes* | Develop/retain same Full | Build scope + Free | Yes, within confirmed window | Practice within Build; no separate ongoing membership |
| FULL BUILD COMPLETE / NO STEWARD | Yes* | Retained, no paid-depth erasure | Free scope | No new Build window | No premium Living |
| BUILD + LIVE ACTIVE | Yes* | Develop/retain same Full | Build/Living as applicable | While initial Build grant is active | Yes* during included twelve months |
| MONTHLY STEWARD ACTIVE | Yes* | Retained/refinable | Living scope | No new initial Build grant | Yes* |
| ANNUAL STEWARD ACTIVE | Yes* | Retained/refinable | Living scope | No new initial Build grant | Yes* |
| SPONSORED PARTICIPANT ACTIVE | Yes* | If included or already retained; Compass includes Full | Exact approved grant scope | When explicitly included and active | When included; Compass within sixty-day term |
| SPONSORED LEADER ACTIVE | Yes* | If included/needed or already retained | Exact approved leader grant | If included/needed and active | Compass twelve-month term; other programs explicit |
| COMPLIMENTARY PILOT ACTIVE | Yes* | Only if expressly included or already retained | Exact approved pilot grant | Only if expressly granted | Only if expressly granted |
| EXPIRED PAID | Yes* | Retained if created | Free scope | No, absent other valid grant | No, absent other valid grant |
| EXPIRED SPONSORED | Yes* | Retained if created | Free scope | No, absent other valid grant | No, absent other valid grant |
| CANCELLED AT PERIOD END | Yes* | Retained/refinable as current term permits | Existing scope until confirmed end, then Free | Only independent still-active Build | Until paid end; then other valid grant or Free |
| PAYMENT PAST DUE | Yes* | Retained | Prior paid scope / approved grace, then Free | Only separate valid Build grant | D07 bounded grace or another valid grant |
| DISPUTED | Yes* | Retained | D14 confirmed-source policy; other valid grants preserved | Conditional on reviewed source treatment | Conditional on reviewed source treatment |
| ACCOUNT CLOSED | No | No ordinary interactive access; lifecycle/rights process applies | No | No | No |

<a id="COM-B0236"></a>
[OD D04/D13 + AP boundary — APPROVED] For an already qualified Full participant, paid Living Mode can refine or finish retained areas without repurchasing the initial Full Build. This does not permit a Free-only participant to bootstrap Full through $19, nor create a renewed initial Build entitlement. Program-specific grants control their actual Build window. Their exact Build start/end must be present in the owner-approved template under D13 before issuance; an absent value blocks issuance instead of importing a retail default. Do not shorten Compass’s promised benefit by applying an unapproved retail deadline. [D04; PJ §§5–7, 16.8]

<a id="COM-B0237"></a>
#### 23.3 Viewing, export, downgrade and disabled features

<a id="COM-B0238"></a>
| Access state | Blueprint viewing | Blueprint self-export | Free after premium expiration | Future/deferred features |
| --- | --- | --- | --- | --- |
| FREE | Yes* for retained content | Free; retained Full where legitimately available | Continues under governed Free scope | Disabled |
| FULL BUILD ACTIVE | Yes* | Current truthful Free/Full depth; no fabricated completion | Yes* | Disabled |
| FULL BUILD COMPLETE / NO STEWARD | Yes* including retained Full | Yes* including already-created Full | Yes* | Disabled |
| BUILD + LIVE ACTIVE | Yes* | Yes* current truthful depth | Yes* | Disabled |
| MONTHLY STEWARD ACTIVE | Yes* | Yes* retained/refined Blueprint | Yes* | Disabled |
| ANNUAL STEWARD ACTIVE | Yes* | Yes* retained/refined Blueprint | Yes* | Disabled |
| SPONSORED PARTICIPANT ACTIVE | Yes* | Yes* actual content/depth | Yes* | Disabled |
| SPONSORED LEADER ACTIVE | Yes* | Yes* actual content/depth | Yes* | Disabled |
| COMPLIMENTARY PILOT ACTIVE | Yes* | Yes* actual content/depth | Yes* | Disabled |
| EXPIRED PAID | Yes* including retained Full | Yes* including retained Full | Yes*; expiry alone never erases content | Disabled |
| EXPIRED SPONSORED | Yes* including retained Full | Yes* including retained Full | Yes*; no personal subscription created | Disabled |
| CANCELLED AT PERIOD END | Yes* before and after paid end | Yes* retained content before/after end | Yes* | Disabled |
| PAYMENT PAST DUE | Yes* retained content | Yes* retained content | Yes* after grace/source end | Disabled |
| DISPUTED | Yes* unless separate verified security restriction | Yes* unless separate verified security restriction | Yes* subject to secure account status | Disabled |
| ACCOUNT CLOSED | Rights/support route only under lifecycle policy | Before closure or reviewed rights request where available, not a reopened account | No active account; any return requires valid account process | Disabled |

<a id="COM-B0239"></a>
Exports remain secure participant-only downloads under PRIV O07, with production publication/Scripture-rights gates intact. Viewing/export promises do not override a compromised route’s necessary shutdown, an authorized deletion request or an applicable records/hold restriction. Payment expiry is not itself any of those conditions. Sponsors never gain export rights merely because they paid. [PRIV O05/O07; P1-01 G; T4 §§10, 13]

<a id="COM-B0240"></a>
### 24. Security and abuse prevention

<a id="COM-B0241"></a>
| Threat / misuse | Required control and negative test |
| --- | --- |
| Forged webhook / replay | Verify signature against raw body and endpoint secret; enforce reviewed timestamp tolerance; reject wrong account/mode; durable event and business-effect idempotency. Replayed legitimate events cannot duplicate effects. |
| Tampered product / price / quantity | Resolve approved offer/version and Stripe Price server-side, quantity one for individual service, exact currency/amount/tax validation; reject client substitutions and disabled catalogues. |
| Coupon / discount abuse | No promotion-code entry or unknown coupon redemption; separately version and authorize any future offer. Staff dashboard capability is restricted and audited. |
| Entitlement forgery | No participant, sponsor or model write privilege to grants/qualification/payment state. API checks canonical identity, scope, validity and release policy; never trust browser/JWT user-editable metadata. |
| Duplicate accounts / simultaneous orders | Canonical identity assurance, per-participant reservations/locking, serializable business effects or equivalent constraints, reviewed merges and no account-existence leakage. |
| Account takeover / stolen session | Mandatory private-data MFA, secure recovery, step-up for sensitive actions, short-lived authenticated portal/access sessions, CSRF and return-URL controls, no sensitive tokens in analytics/logs. |
| Stolen Checkout Session | Session bound to internal order and intended authenticated participant; a stolen success URL or payment receipt cannot redirect entitlement to a different account. Resolve payer mismatch safely. |
| Refund / dispute abuse | Bounded original-payment refund, prior-refund/dispute checks, delegated authority, minimal commercial pattern review and appeal; no intimate-content mining. |
| Sponsor-code sharing | Single-use or tightly scoped cryptographically random invitation/claim token bound to approved eligibility; rate limiting, expiry only as approved, safe recovery; no generic church code grants unlimited Full. |
| Privilege escalation / admin misuse | Least-privilege roles, narrow service credentials, approval limits, step-up, separation/independent review, immutable audit and alerting for unauthorized grant/price edits. |
| Stale cache / token | Server-side effective access evaluation and version invalidation; no premium extension from a stale client token. Restrictive changes fence in-flight commerce/content operations appropriately. |
| Environment / configuration drift | Separate test/live accounts, secrets and IDs; deny live routes at Levels 0–1; verify enabled portal features/payment methods/API version/offer mappings against release manifest. |
| Private-data leakage | Allowlisted metadata/logs/evidence; no private text in Stripe, URLs, invoice descriptions, telemetry, tax classifications or sponsor reconciliation. Test all rendered/exported surfaces. |
| Restore / reconciliation failure | Operation ledger and provider reconciliation before enabling commerce after restore; do not replay charges, resurrect revoked grants or undo closure/cancellation. |

<a id="COM-B0242"></a>
[TC + RV] A model cannot call a privileged “grant,” “refund,” “update subscription” or equivalent tool merely because it is instructed to do so. The application may present an authenticated account control or a read-only minimized status; payment-changing execution requires its own approved user/role authorization and deterministic service. Prompt instructions are not the security boundary. Independently test RLS, database roles, RPCs, worker credentials, administrator routes and UI permissions against P1-01/PRIV requirements. [SB01–SB02; P1-01 L; PRIV, access-control requirements]

<a id="COM-B0243"></a>
Keep emergency/crisis resources and complaint intake separate from commerce failure. Do not suspend a participant for distress, a low score, safety-resource use or reporting an unsafe response. Disable unsafe technical paths when necessary under the approved safety/security standard, without claiming human supervision is required for otherwise authorized autonomous conversation. [SAF §§0.4, 7.2, 11]

<a id="COM-B0244"></a>
### 25. Acceptance-test method

<a id="COM-B0245"></a>
[EV] Appendix D specifies production acceptance scenarios; every test is NOT RUN. No generated document, mock transaction, fictional participant conversation or source approval constitutes a passed production test. An actual execution record must identify candidate build/commit, configuration/API versions, environment, source/offer/policy versions, test fixture, actors/roles, steps, expected and actual outcomes, minimal supporting evidence, defect references, reviewer and date.

<a id="COM-B0246"></a>
Run synthetic unit/integration tests first, then isolated provider test-mode end-to-end tests, concurrency/failure injection and actual released-role negative tests. Use supported test clocks for applicable billing scenarios, but do not assume a clock simulates every dispute, cancellation, payment-method or bank timing behavior. Any necessary controlled live validation requires its own written payment/release authorization and lawful test plan; this standard authorizes none. Do not use real private participant content to test commercial behavior. [ST04–ST05; PRIV]

<a id="COM-B0247"></a>
Execute each enabled payment method and each enabled offer, not just one happy-path card purchase. Trace events to orders, provider objects, grant transactions, participant UI and accounting outcomes. Verify both absence of unauthorized access and absence of unintended charges. Prove that failure UI remains truthful and that private content cannot leak through billing/support/sponsor routes. Tests for deferred routes verify denial, not activation.

<a id="COM-B0248"></a>
### 26. Owner decision boundary

<a id="COM-B0249"></a>
[OD — APPROVED] Appendix A records fourteen governing commercial/customer-policy directions approved by Michael J. Gauthier on September 12, 2026. D01–D14 each have status APPROVED OWNER DIRECTION, with the approved direction, reason, customer/revenue/engineering effects, professional review and applicable gate. Those directions and this standard are approved within the stated scope; applicable professional, implementation, testing and release gates remain open. Unselected alternatives remain OP and disabled where not separately approved. [OD-REV; OD-APP]

<a id="COM-B0250"></a>
Mike is not asked to choose webhook algorithms, transaction isolation, PCI architecture, cryptography, tax classifications or statutory interpretations. Engineering and specialists must produce the appropriate implementation/review evidence. Owner policy cannot waive a mandatory duty, and a specialist’s legal conclusion does not silently change approved prices, Compass benefits or participant-content ownership. Unapproved directions outside this approval, unresolved required configurations and unmet applicable gates keep the corresponding commercial route disabled; they do not prevent synthetic design work or separately approved nonpaid grant work whose decisions/gates are satisfied.

<a id="COM-B0251"></a>
### 27. Professional review and accountability

<a id="COM-B0252"></a>
[RV] Appendix B identifies the work products required from consumer/commercial counsel, subscription/negative-option counsel, tax CPA/tax counsel, privacy counsel, payment-security/PCI specialists, independent security review, accounting operations and sponsor-contract counsel. Reviews must cover the actual entity, contracts, configuration, UI and tested release candidate, not merely approve this prose.

<a id="COM-B0253"></a>
A reviewer may cover multiple compatible specialties only when qualified and sufficiently independent for those assignments. Preserve PRIV’s role separation and independent complaint/investigation path; no operator signs off their own misuse. Record open conditions, qualifications, applicability and re-review triggers. “Reviewed by counsel” without scope/findings is not a passed gate. Actual Stripe account acceptance, applicable PCI validation, Supabase/private-data provider contractual fit and all existing safety/privacy/rights reviews remain unverified.

<a id="COM-B0254"></a>
### 28. Release levels and commercial gates

<a id="COM-B0255"></a>
| Level | Permitted scope only after separate authorization | Commercial requirements / explicit prohibitions |
| --- | --- | --- |
| 0 — Synthetic/internal | Isolated synthetic accounts, invented content, provider test mode and drills | No real private participant content or live charges. Simulated results are test evidence only. |
| 1 — Controlled nonpaid real-participant pilot | Approved invitation-only Arizona-first, adults-18+ envelope; complimentary/admin grants within actual authorized scope | No live consumer payments, recurring collection or sponsor-to-paid conversion. Applicable P1-05 identity/grant/access controls still required. Existing core privacy/provider/safety/support/rights/entity gates remain. |
| 2 — Paid pilot | Only the approved direct-to-consumer offers, methods, geography and operations | P1-04/P1-05/P1-06 approved policies, actual implementation, terms/tax/PCI reviews, refund/cancel/reconcile evidence and payment-specific authorization; all core gates still apply. |
| 3 — Sponsored cohort / Compass | Specific approved organizational agreement, benefit configuration, grants and scale | Actual sponsor contract/payment and seat rules where applicable, participant/leader distinctions, privacy-safe administration and appropriate scale gates. Nonpaid sponsorship does not bypass cohort gates; organizational payments need their applicable commercial/tax controls. |
| 4 — Broader public release | Explicitly expanded scale/geography/capabilities only | Reopen nexus/tax, state subscription law, notices, operating capacity, security/abuse, provider and safety/resource gates. No automatic minors program, integrations or new commercial types. |

<a id="COM-B0256"></a>
The approved safety standard’s first-pilot direction starts with up to three adults, with expansion to no more than ten total only after its documented checkpoint, within a six-week review envelope. That envelope is not an automatic grant duration, a Blueprint expiry or payment conversion. SAF is the approved current safety/release authority; this commerce revision does not complete its PS tests, specialist reviews, implementation or release gates. D13’s LEVEL_1_NONPAID_PILOT template requires separate actual approval and the separately authorized pilot count. Older 25–40-person paid-pilot planning recommendations are not Level 1 authorization. [SAF §§0.4, 16–17, D03; PRIV O11; OD-REV D13]

<a id="COM-B0257"></a>
[RG] Appendix E is the commercial evidence checklist to be incorporated into the governing P1-10 release dossier, not a competing release authority. A higher level does not waive lower/core safeguards, and the owner’s approval of this standard does not authorize a particular release. All gates below are OPEN. No real participant enrollment or charge is authorized by this document.

<a id="COM-B0258"></a>
### A. APPROVED OWNER DIRECTIONS + OPEN GATES

<a id="COM-B0259"></a>
D01–D14: APPROVED OWNER DIRECTION. Michael J. Gauthier approved the directions below on September 12, 2026 within this standard’s stated scope. Existing AP sources retain their authority; unselected alternatives are not enabled. All applicable counsel, tax, accounting, PCI/payment-security, independent security and other professional reviews, implementation, acceptance testing and release gates remain open. Costs/effects are qualitative planning judgments, not measured financial projections. [OD-REV; OD-APP]

<a id="COM-B0260"></a>
#### D01 — $149 activation and unused purchase

<a id="COM-B0261"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Exact $149 activation/window rule, unused-purchase opportunity and remedy. |
| Approved owner direction | Verified purchase creates the pending Full acquisition / Build entitlement. Participant explicitly activates the Build; activation starts the 30-calendar-day Build window, not purchase. Allow 90 calendar days from confirmed payment to activate. Full refund is available before activation; if still genuinely unused/unactivated at the end of the 90-day opportunity, automatically initiate a full refund rather than forfeit the purchase. Do not apply this retail rule to Compass or another sponsored programme unless separately approved. Exact refund/tax/accounting mechanics remain subject to applicable professional review. |
| Why | Preserves a genuine guided period and avoids charging for a benefit that was never started. |
| Customer experience effect | One clear activation action and visible end date; unused purchase returns money rather than becoming trapped value. |
| Revenue effect | Some unactivated revenue is returned; reduces indefinite prepaid liabilities and dissatisfaction. |
| Engineering effect | Activation idempotency, date arithmetic, ninety-day refund job, race protection and pending-refund recovery. |
| Counsel / tax review required? | Consumer/commercial counsel and accountant; tax review of refund adjustments/prepayment obligations. |
| Remaining gate required before | Before publishing or charging the $149 offer; Sections 5, 8 and 12. |

<a id="COM-B0262"></a>
#### D02 — $299 first year and renewal nature

<a id="COM-B0263"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | $299 activation timing and nonrecurring first-year package. |
| Approved owner direction | One-time prepaid $299; no automatic recurring agreement. Explicit activation starts the 30-calendar-day Full Build window and 12 calendar months of Steward together, with no additional Steward months after Build. Use D01’s same 90-day unused-activation/refund principle. After the included 12 months, continuation requires a new affirmative choice of $19/month or $199/year. No automatic annual renewal from the $299 package. |
| Why | The prepaid option is the simplest way to prevent accidental recurring enrollment while preserving all approved benefits. |
| Customer experience effect | The first year is usable from activation; participant deliberately decides whether to continue. |
| Revenue effect | Less automatic retention; clearer trust proposition. No new price or guaranteed permanent annual price. |
| Engineering effect | One-time payment plus component grants, concurrent activation clocks and unused-purchase refund; no first-year recurring agreement or automatic annual-renewal schedule. |
| Counsel / tax review required? | Commercial/subscription counsel, tax CPA and accountant for package treatment. |
| Remaining gate required before | Before offering the $299 package; Sections 2, 5, 11–12. |

<a id="COM-B0264"></a>
#### D03 — Already-Full purchasers and bundle credits

<a id="COM-B0265"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Existing Full qualification blocks $299 and retrospective bundle credit at launch. |
| Approved owner direction | Do not sell the $299 Full-included package to a participant already qualified for Full. Do not provide a retrospective $149-to-$299 bundle credit at launch. Offer eligible $19/month or $199/year continuation instead. Any future conversion/credit offer requires separate approval, pricing, tax/accounting and implementation rules. |
| Why | Avoids duplicate Full charges and a complex credit programme presented as a standard entitlement. |
| Customer experience effect | Clear options; someone who chooses Build first is not promised a later bundle adjustment. |
| Revenue effect | Preserves approved Build economics; no assumed credit liability, with potential friction for late bundle requests. |
| Engineering effect | Eligibility block is simple; credit alternatives need catalogue, overlap, tax and remedy logic. |
| Counsel / tax review required? | Commercial/subscription counsel for launch disclosures; separate pricing, tax/accounting and implementation review before any future conversion/credit. |
| Remaining gate required before | Before enabling repeat Full/bundle checkout or publishing upgrade claims; Sections 8–9. |

<a id="COM-B0266"></a>
#### D04 — Continuation start and initial Build boundary

<a id="COM-B0267"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Paid continuation timing and authoritative Full qualification. |
| Approved owner direction | A normal $149 Full Build purchaser may start paid $19/month or $199/year continuation after the initial Build window ends. No page-count, completion-score or AI judgment is required. An unactivated Build purchase cannot bypass this rule. A previously qualified Full owner with no active included Steward period may purchase continuation immediately. Any early-overlap exception requires separate explicit approval and disclosure. |
| Why | Prevents overlapping payment by default while keeping $19 a continuation rather than initial acquisition route. |
| Customer experience effect | Clear transition date; qualified owners do not have to repurchase Full or prove every area is complete. |
| Revenue effect | May defer continuation revenue until Build ends; avoids charging twice for the same period. |
| Engineering effect | Authoritative qualification, activation/window predicates and a server-side overlap guard; no AI completion classifier. |
| Counsel / tax review required? | Commercial/subscription counsel reviews disclosures and permitted exceptions. |
| Remaining gate required before | Before monthly/annual checkout becomes available; Sections 8–9, 23. |

<a id="COM-B0268"></a>
#### D05 — Monthly/annual cadence changes

<a id="COM-B0269"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | End-of-paid-term cadence conversion without routine mid-term proration. |
| Approved owner direction | Cadence changes take effect at the end of the currently paid term. The participant affirmatively authorizes the new cadence, price and effective date. No routine mid-term proration or overlapping monthly and annual agreements. A failed conversion does not silently choose another cadence. |
| Why | Avoids unexplained credits, surprise charges and concurrent subscriptions. |
| Customer experience effect | The current paid period is honored; the next date, cadence and price are explicit. |
| Revenue effect | Annual conversion can be delayed until month-end; no unused-period subsidy is implied. |
| Engineering effect | One scheduled transition, concurrency protection and failure reconciliation. Immediate proration requires more cases. |
| Counsel / tax review required? | Subscription/commercial counsel; accountant/tax review for the immediate alternative. |
| Remaining gate required before | Before enabling plan changes in MJG or Stripe portal; Sections 9, 11, 19. |

<a id="COM-B0270"></a>
#### D06 — Paid/sponsored overlap

<a id="COM-B0271"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Deferred sponsored activation is the simplified launch policy; automated overlap proration is deferred. |
| Approved owner direction | Simplified launch default: defer activation of an eligible sponsored Steward benefit until the current personally paid Steward term ends, where the approved sponsor programme permits. Preserve the personally paid term and sponsored benefit exactly; no silent stacking, shortening or extension. Show both sources and the future sponsored activation. No participant card for sponsorship; sponsored expiration never restarts personal billing. Do not build automated prorated paid/sponsored overlap refunds for launch. If actual approved programme timing makes deferral impossible, use a separately authorized commercial exception/remedy after applicable counsel/tax review. Apply deferred sponsored activation to $299 package overlap. Section 9.1’s automated unused-overlap refund formula remains DEFERRED / NOT ENABLED. |
| Why | The participant should not pay twice for one Steward service, but a second source must not silently alter dates or create bonus months. |
| Customer experience effect | Visible current paid term and future sponsored benefit; no lost promised time, hidden stacking or automatic restart of billing after sponsorship. |
| Revenue effect | Preserves the current paid term; no routine automated overlap refund at launch. A separately authorized exception may carry a reviewed remedy cost. |
| Engineering effect | Source-aware deferral, visibility, activation/renewal concurrency and exception routing. Do not build automated prorated paid/sponsored overlap refunds for launch. |
| Counsel / tax review required? | Commercial/subscription and sponsor counsel review programme timing and exceptions; applicable tax/accounting review remains required before a remedy. |
| Remaining gate required before | Before mixed-source activation or overlapping paid/sponsor use; Sections 4, 9, 16, 21. |

<a id="COM-B0272"></a>
#### D07 — Failed-renewal grace and collection end

<a id="COM-B0273"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | One fixed failed-renewal grace interval and reviewed collection end. |
| Approved owner direction | One seven-calendar-day grace interval following the end of a previously paid monthly or annual continuation period when renewal payment fails. No grace for an initial unsuccessful purchase; retries do not reset the seven days. Provide truthful payment-remedy and grace-end information. If unresolved at grace end, premium Steward ends and appropriate Free / retained Blueprint access remains. Automatic collection must not continue indefinitely for service no longer delivered. Final invoice/accounting treatment remains subject to reviewed accounting/legal configuration. |
| Why | Balances short payment interruptions with clear service/collection limits. |
| Customer experience effect | Time to repair a card without immediate disruption; precise notice of grace end and billing status. |
| Revenue effect | Limited unpaid service exposure; avoids indefinite off-service retries. |
| Engineering effect | Independent grace interval, notices, dunning alignment, final invoice disposition and late-success reconciliation. |
| Counsel / tax review required? | Subscription/consumer counsel and accounting/tax operations. |
| Remaining gate required before | Before recurring renewals and retries are enabled; Sections 11 and 21. |

<a id="COM-B0274"></a>
#### D08 — Refund policy and Full qualification after unwind

<a id="COM-B0275"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Option A refund windows, separate error/service/legal remedies and source-specific qualification effects. |
| Approved owner direction | Approve Section 12 Option A. $149 Full Build and $299 Build + Live: full refund before activation; after activation, full refund if requested within 14 calendar days; D01/D02 90-day unused-purchase automatic refund also applies. No ad hoc partial package allocation at launch. Monthly Steward: full refund of that recurring charge if requested within 7 calendar days of the charge. Annual Steward: full refund of that recurring charge if requested within 14 calendar days of the charge. Preserve separate duplicate-charge, unauthorized-charge, technical-failure/undelivered-service and legally required remedies. A full unwind of the only paid Full acquisition removes that source’s continuation qualification but never deletes created Blueprint content; other valid Full/sponsored/scholarship sources survive. Do not inspect private conversations or Blueprint content to determine eligibility or value received. Counsel/tax/accounting review remains required before live use. |
| Why | Simple trust-oriented rules reduce subjective arguments over intimate use and protect minimum Full economics from repeated refund-driven bypass. |
| Customer experience effect | Meaningful use inside the window does not itself disqualify a refund; content is not held hostage. |
| Revenue effect | Some discretionary refunds, including after work is received; bounded repeat-abuse review without removing legal rights. |
| Engineering effect | Money/status/entitlement transactions, 90-day unused-purchase automation, approved refund windows, tax adjustments and independent cancellation; no ad hoc partial package allocation at launch. |
| Counsel / tax review required? | Consumer/subscription counsel, tax CPA/accountant and privacy counsel for evidence/abuse boundaries. |
| Remaining gate required before | Before any paid offer, including organizational charges with a separate sponsor policy; Section 12. |

<a id="COM-B0276"></a>
#### D09 — Cancellation and immediate service termination

<a id="COM-B0277"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Direct renewal cancellation, default paid-through access and separate immediate termination. |
| Approved owner direction | “Cancel renewal” is direct self-service, with no Steward chat, reason or retention conversation required. Confirmed cancellation stops future renewal collection. By default, access lasts through the already-paid term. Immediate service termination is a separate participant option with clear refund/access implications. Cancellation does not delete the Blueprint or account and is not a privacy deletion request. |
| Why | Prevents accidental forfeiture and removes friction without conflating cancellation, refund and deletion. |
| Customer experience effect | Clear confirmation, final access date and preserved Blueprint/Free access. |
| Revenue effect | Reduces unwanted renewals; no extra refunds beyond approved policy/legal duties are automatically implied. |
| Engineering effect | Persist request before provider call, stop/reconcile future collection, alternative verification and truthful pending states. |
| Counsel / tax review required? | Consumer/subscription counsel and privacy/security review of account closure and authentication. |
| Remaining gate required before | Before any recurring agreement is accepted; Sections 10, 19 and 21. |

<a id="COM-B0278"></a>
#### D10 — Future renewal prices for existing subscribers

<a id="COM-B0279"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Higher-price/cadence acceptance and lower-price clarification; no new price selected. |
| Approved owner direction | Honor the already purchased term; no permanent price-lock or grandfathering guarantee. Require fresh affirmative acceptance before charging a higher renewal price or changing billing cadence. Without acceptance, stop renewal at the existing term’s end rather than silently charge the higher amount. A price reduction may be applied without unnecessary re-consent, subject to applicable legal/tax/provider requirements and truthful notice. Never silently switch monthly to annual or annual to monthly. |
| Why | Protects informed choice without binding the business forever to launch prices. |
| Customer experience effect | No silent increase or monthly/annual switch; clear choice to continue or stop. |
| Revenue effect | Higher-price uptake may be lower; avoids an unbounded grandfathering promise. |
| Engineering effect | Immutable offers, notice/acceptance ledger, no-acceptance renewal stop for higher price/cadence, and a separately reviewed price-reduction path without unnecessary re-consent. |
| Counsel / tax review required? | Subscription/consumer counsel; tax review of tax-driven amount variation. |
| Remaining gate required before | Before changing any existing renewal price or promising grandfathering; Section 11. |

<a id="COM-B0280"></a>
#### D11 — Initial tax presentation and launch posture

<a id="COM-B0281"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Base price plus applicable tax and tax-reviewed/registered paid scope. |
| Approved owner direction | Preserve approved base prices and display base price PLUS APPLICABLE TAX, with the exact total shown before affirmative payment authorization. No surprise post-purchase tax debit. Restrict paid geography to tax-reviewed/registered scope and block paid routes with unresolved classification, sourcing, registration or configuration. Stripe Tax may assist implementation but does not replace CPA/tax-counsel determination. This direction does not determine taxability, classification, rate, sourcing or registration obligations. |
| Why | Avoids an unsupported no-tax assumption and surprise after-the-fact charges. |
| Customer experience effect | Customer sees the actual total and permitted location before authorizing payment. |
| Revenue effect | Plus-tax presentation preserves the approved base-price direction; actual tax liability and accounting treatment remain for qualified review. |
| Engineering effect | Offer tax behavior, location validation, registration allowlist, calculation failure handling and refunds. |
| Counsel / tax review required? | Tax CPA/tax counsel and commercial counsel; Mike does not choose the legal classification. |
| Remaining gate required before | Before Level 2 or any paid sponsor transaction; Section 13. |

<a id="COM-B0282"></a>
#### D12 — Sponsor seats, unused seats and nonpayment

<a id="COM-B0283"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Programme-specific sponsored commercial configuration without changing Compass benefits. |
| Approved owner direction | Each sponsored programme uses its own approved written commercial configuration/agreement. Capacity/seats, issuance, activation, unused-seat treatment, payment, default and remedies are programme-specific. No invented universal church seat prices or hard Compass forfeiture deadline. Activated good-faith participant entitlements should ordinarily be honored through their confirmed term if the sponsor later fails to pay, subject to the actual agreement and counsel. Where permitted, hold new unissued benefits while resolving default. Never demand a participant card for sponsor debt. Reassign unused/unactivated seats only under approved programme rules and participant notices. Sponsor billing never provides private-content access or named activity reporting. |
| Why | Separates organizational credit risk from participant content/benefit promises. |
| Customer experience effect | Participants are not surprised by loss of access or asked to pay the sponsor’s debt. |
| Revenue effect | Business may carry the cost of already-promised access; unused-seat economics remain contract-specific. |
| Engineering effect | Agreement/seat/grant ledger, restricted reconciliation and aggregate-only sponsor reporting. |
| Counsel / tax review required? | Sponsor/commercial counsel, tax CPA/accountant and privacy counsel. |
| Remaining gate required before | Before Level 3 or issuing benefits against a sponsor agreement; Section 16. |

<a id="COM-B0284"></a>
#### D13 — Manual grant and exception authority

<a id="COM-B0285"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Approve bounded programmes/templates and delegate ordinary issuance; separately authorize exceptions. |
| Approved owner direction | Michael J. Gauthier approves (1) the grant programme/template, (2) eligible participant population, (3) benefit scope, (4) Full inclusion, (5) Steward duration, (6) activation rule, (7) maximum quantity/seat count, (8) budget or economic limit where relevant, (9) issuer/delegated role and (10) exception boundary. Once approved, an authorized operator or deterministic system may issue ordinary within-template grants without individual Mike approval. Permit a separately approved LEVEL_1_NONPAID_PILOT template capped at the separately authorized pilot count. Compass uses separately approved participant and leader templates consistent with Product Journey. Anything outside the template/limits requires designated exception authority; Steward AI, support, engineering, sponsors and church leaders cannot improvise it. No self-approval of the operator’s own exception or sensitive free-text justification. Every grant is auditable and exact in scope/dates. This standard approves no actual template, grant or enrollment. |
| Why | Avoids making Mike the ordinary transaction bottleneck while bounding grants, exceptions, economic exposure and private-data access. |
| Customer experience effect | Exact scope and dates are clear; a scholarship is not emotional sales targeting. |
| Revenue effect | Grant cost is budgeted and traceable; no assumed unlimited complimentary access. |
| Engineering effect | Approved programme/template records, population/scope/date/quantity/budget limits, delegated deterministic issuance, audit and independent exception control; LEVEL_1_NONPAID_PILOT and separate Compass templates; no Stripe grant path. |
| Counsel / tax review required? | Commercial/privacy/security review; accountant for grant/remedy records. |
| Remaining gate required before | Before any Level 1 real grant or delegated paid/sponsor exception; Section 17. |

<a id="COM-B0286"></a>
#### D14 — Disputes, reversals and commercial suspension

<a id="COM-B0287"></a>
| Decision field | Approved owner-direction entry |
| --- | --- |
| Status | APPROVED OWNER DIRECTION |
| Decision | Source-specific access during and after disputes, refunds and reversals. |
| Approved owner direction | Preserve previously confirmed good-faith access during ordinary payment-dispute investigation. Stop additional disputed recurring collection under the reviewed workflow; no account-wide punishment solely because a dispute exists. A confirmed refund/reversal/lost dispute affects only its funding source and associated qualification/access as approved. Retain Blueprint content, Free access and independently valid paid/sponsored/scholarship sources. Verified security restrictions remain separately governed. Winning a dispute never automatically restarts canceled billing or constitutes new recurring consent. |
| Why | Avoids punitive account-wide revocation while containing further commercial loss and preserving trustworthy state. |
| Customer experience effect | Clear status, minimal evidence, support/appeal and no private-content bargaining. |
| Revenue effect | Some service cost while investigated; lower risk of additional unwanted charges. |
| Engineering effect | Dispute overlay, deadline owner, collection stop, source-specific adjustment and independent security path. |
| Counsel / tax review required? | Consumer/commercial, subscription and privacy counsel; payment operations/security reviewer. |
| Remaining gate required before | Before live refunds, disputes or reversal handlers affect access; Sections 12, 15 and 21. |

<a id="COM-B0288"></a>
### B. COUNSEL / TAX / SPECIALIST REVIEW REQUIRED

<a id="COM-B0289"></a>
Status of every review: OPEN — no completed professional-review evidence inspected. Review deliverables must identify actual entity, jurisdiction, offer/policy/configuration versions, findings, unresolved conditions, signer/qualification and revalidation trigger. Owner approval is not a substitute.

<a id="COM-B0290"></a>
| Review ID / qualified function | Required deliverable | Before |
| --- | --- | --- |
| RV01 — Consumer / commercial counsel | Correct contracting entity and descriptor; offer/activation/refund terms; cancellation versus closure; enforceable content/service rights; unfair/deceptive practice review; complaints, limitations and proposed contract protections. | Real customer terms and paid/organizational offers. |
| RV02 — Subscription / negative-option counsel | Current federal/state applicability matrix, actual recurring authorization/UI, acknowledgment, cancellation alternatives, renewal/material-change/fee notices, Regulation E method review, grace/dunning and retained consent proof. Recheck post-vacatur FTC developments. | Any recurring agreement or geographic expansion. |
| RV03 — Tax CPA / tax counsel | Offer-specific Arizona state/city and other-state classification/sourcing/nexus, entity/affiliate facts, registrations, tax codes, sponsor exemptions, bundle allocation, tax refunds and filing calendar; verify the authoritative threshold and its applicability against actual configuration evidence. | Any paid retail or organizational transaction. |
| RV04 — Privacy counsel | Commercial data dictionary/purpose/retention; payment versus sensitive-content boundary; sponsor aggregates, tax addresses, dispute proof and exceptional disclosure; account closure/holds; actual processor contracts and notices. | Real commercial records or sponsor administration. |
| RV05 — Payment-security / PCI specialist | Actual payment architecture and methods, acquirer/processor obligations, applicable validation/SAQ and scanning/security controls, hosted-page boundary, secrets/dashboard access and incident plan. No assumed certification from Checkout. | Live payment collection. |
| RV06 — Independent security reviewer | Threat model and executed negative tests across RLS/roles/RPCs, workers, identity/merge, grants, webhook/operation idempotency, concurrency, admin misuse, metadata/log leakage, restore and cancellation fences. | Level 1 grant/private-data scope; again before live commerce and expanded routes. |
| RV07 — Accountant / bookkeeper operations | Gross/net/payout reconciliation, refunds/disputes/tax, prepaid/deferred revenue and package allocations, unused activation obligations, sponsor receivables, month-end controls and named primary/backup. | First real transaction and ongoing close process. |
| RV08 — Sponsor-contract counsel | Actual payer/cohort agreement, participant/leader promises, seats/activation/unused seats, sponsor default, privacy/reporting, exceptions and any proposed incentives. Compass terms remain preserved. | Any Level 3 sponsored programme or organizational billing. |
| RV09 — Accessibility / support / safety implementation reviewers | Usable purchase/cancel/unknown/outage/locked-out flows, safe help resources, truthful human-support versus autonomous AI limits, case escalation and staffing evidence. Scope includes billing interruptions during a sensitive conversation. | Applicable real-participant release and payment UI. |
| RV10 — Vendor / records / publication dependencies | Actual Stripe/Supabase/core provider contractual fit and configuration; justified commercial retention/holds; inherited Scripture/publication rights for exports. Existing PRIV/P1-09/P1-10 gates are not closed here. | Applicable real-data processing, export or release. |

<a id="COM-B0291"></a>
### C. ENGINEERING IMPLEMENTATION REQUIREMENTS

<a id="COM-B0292"></a>
[TC + EV] Implement within P1-01’s modular transactional architecture; a logical record family is not a separate microservice requirement. All packages below are UNVERIFIED. Jeremy and the implementation team need to supply the listed evidence; their mention is not a grant of production privileges or proof of completed work.

<a id="COM-B0293"></a>
| Package | Required implementation output | Acceptance / evidence link |
| --- | --- | --- |
| ENG01 — Catalogue / feature release | Immutable offers, benefit templates, approval dependencies, environment-specific Prices, tax/cadence/quantity mappings and backend route allowlist. Reject unapproved directions outside this approval, unselected OP and disabled FD; policy approval alone is not release permission. | CE02–CE06, CE20, CE31, CE39; configuration manifest. |
| ENG02 — Identity / permissions | Canonical participant and payer mappings; one-Blueprint boundary; MFA, recovery, step-up, restricted support/sponsor projections and reviewed duplicate-account merge. | CE25–CE30, CE38, CE45–CE47; role/DB grant matrix and denied-path evidence. |
| ENG03 — Orders / billing operations | Participant reservation, offer snapshot/assent, hosted Checkout/customer binding, durable request IDs, unknown-result recovery, single personal agreement and cadence transitions. | CE03–CE11, CE26, CE33–CE35, CE40; order/provider traces. |
| ENG04 — Event processing | Raw-body signature verification, account/mode/API pinning, durable inbox, duplicate handling, worker retries/dead letters and object reconciliation. | CE07–CE10, CE29, CE32–CE34, CE48; replay and race records. |
| ENG05 — Entitlement domain | Component grants, qualification, approved activation/window rules, independent source intervals, D06 deferred sponsored activation, access projection/version and source-specific supersession; no content writes or launch overlap-proration automation. | CE01–CE06, CE13–CE18, CE22–CE27, CE35–CE38; local transaction/audit evidence. |
| ENG06 — Cancellation / renewal / refunds | Durable cancellation, provider-confirmed stop, in-flight invoice handling, recurring assent, approved grace/dunning, D08 bounded refunds/tax adjustments, D10 higher-price/cadence acceptance and price-reduction handling, and independent grant consequences. | CE05–CE06, CE12–CE14, CE22–CE24, CE36–CE42, CE49–CE50. |
| ENG07 — Sponsor / manual grants | Versioned agreements/seat ledger; owner-approved bounded programme/templates with population, scope/Full, duration/activation, quantity/budget, issuer and exception limits; LEVEL_1_NONPAID_PILOT and separate Compass participant/leader templates; authorized ordinary issuance without individual Mike approval, no-card activation, D06 deferral and privacy-safe reconciliation. | CE15–CE19, CE25, CE30, CE35, CE43–CE44, CE47. |
| ENG08 — UI / notifications / support | Current access versus billing, honest pending states, direct cancel, portal restrictions, safe receipts/notices, alternative locked-out route and separate autonomous AI/support limits. | CE07, CE10, CE12–CE13, CE28, CE32, CE39–CE41, CE45; reviewed UI captures. |
| ENG09 — Audit / privacy lifecycle | Minimized commercial facts, versioned offers/assent, restricted dispute evidence, retention/holds/closure, no private Stripe metadata and fenced backups/restores. | CE21, CE24, CE28, CE30, CE46–CE50; data/copy inventory and restore drill. |
| ENG10 — Tax / accounting | Reviewed location/registration/tax-code allowlists, exact total before authorization, refunds and invoice adjustments, gross-to-net reconciliation and all-channel nexus inputs. | CE42–CE44; CPA decision/configuration and accounting reconciliation. |
| ENG11 — Monitoring / release operations | Incremental/full sweeps, exception queues, safe alerts, incident/disable/re-enable runbooks, named owners/backups and configuration drift checks. | CE09–CE11, CE31–CE34, CE48–CE50; alert and recovery exercise. |

<a id="COM-B0294"></a>
Engineering must produce a field-level schema/data dictionary, migrations and constraints; endpoint/role contracts; state-transition tests; provider API/event mapping; actual keys/permissions inventory without exposing secrets; and reproducible release configuration. Include rollback behavior that cannot restart charges or resurrect deleted/private state. No generated pseudocode or schema becomes a production migration merely because it appears in this document.

<a id="COM-B0295"></a>
### D. COMMERCIAL + ENTITLEMENT ACCEPTANCE TESTS

<a id="COM-B0296"></a>
All 50 tests: NOT RUN. These are acceptance specifications, not reported results. Preconditions use synthetic fixtures and the approved policy version. Preserved references to recommended variants do not reopen approved D01–D14 or enable an unselected offer; actual release execution must use the approved policy/configuration. Each actual execution must retain the Section 25 evidence manifest, minimal order/provider/grant/audit/UI evidence and negative assertions for unintended charges/content disclosure. Where provider test facilities cannot model a case, record the limitation and use an approved drill; do not label the untested production path passed.

<a id="COM-B0297"></a>
| Test | Preconditions, action and required result | Status |
| --- | --- | --- |
| CE01 — Free participant fabricates Full/payment claim | Use a Free-only authenticated fixture; submit a chat claim, altered client access flag and fabricated receipt. Full workflow and continuation checkout remain denied; no qualification/grant is written. UI provides verification rather than accusation. | NOT RUN |
| CE02 — $19 cannot substitute for initial Full | From Free-only, call offer/order/Checkout endpoints directly for monthly and annual offers, including altered IDs. Server rejects both before collection. A locally imported thirteen-page PDF does not change the result. | NOT RUN |
| CE03 — $149 grants exact intended Build once | Buy the approved $149 offer in provider test mode. Reconcile one valid qualifying acquisition and pending Build grant. Activate once; approved thirty-day window appears, no recurring agreement exists, original Free wording is unchanged. | NOT RUN |
| CE04 — $299 grants Full plus twelve months once | Purchase/activate the approved package fixture. Verify one Full acquisition, one initial Build interval and one twelve-calendar-month Steward interval from the approved common activation; duplicate callbacks add nothing. Approved prepaid version creates no subscription. | NOT RUN |
| CE05 — Monthly renewal remains monthly | Use a valid Full owner with one monthly agreement. Pay successive monthly invoices and replay each. Grant only the exact consumed intervals once; no annual Price/cadence or Build acquisition appears. | NOT RUN |
| CE06 — Annual renewal remains annual | Use an annual agreement and a verified annual renewal. Grant its exact annual interval once; never create a monthly agreement or a second Full benefit. Price and authorization match the purchased offer version. | NOT RUN |
| CE07 — Browser redirect is not payment/access authority | Open/refresh a fabricated success URL and a real unconfirmed Checkout return. No new entitlement appears. Status is pending/unknown as appropriate; active-access wording appears only after authoritative grant confirmation. | NOT RUN |
| CE08 — Duplicate webhook does not duplicate entitlement | Deliver the same signed event repeatedly and concurrently. One inbox identity and one business effect result. Separately generated events describing the same fulfillment still cannot duplicate the grant. | NOT RUN |
| CE09 — Out-of-order events reconcile correctly | Deliver subscription/invoice/payment/refund updates in reverse order and with equal timestamps. Retrieve current provider facts; preserve historical events without regressing current cancellation/refund state or extending a consumed period twice. | NOT RUN |
| CE10 — Payment success / entitlement transaction failure | Force a transaction rollback after verified payment. Show payment confirmed/access pending, create an exception and retry fulfillment only. Recovery yields one grant; no second charge. Exhausted remedy follows approved policy. | NOT RUN |
| CE11 — Duplicate checkout/payment attempts | Race two devices/entry points against one participant and simulate ambiguous provider completion. One reservation blocks redundant creation. If two real test payments exist, preserve both facts, grant once and initiate authorized duplicate correction. | NOT RUN |
| CE12 — Cancellation stops future charges as confirmed | Cancel via each enabled account/portal route before renewal. Persist request, confirm provider stop and inspect schedules/invoices. No unauthorized subsequent collection occurs; in-flight contrary charge is corrected. UI distinguishes pending from confirmed. | NOT RUN |
| CE13 — Cancellation preserves Blueprint and Free | Cancel an active paid owner, cross the paid-through boundary and compare content/version hashes. Approved wording, retained Full view/export and governed Free scope remain; premium modes end absent another valid grant. | NOT RUN |
| CE14 — Sponsor expiry never creates paid subscription | Advance an activated sponsor benefit to its actual end with no personal recurring authorization. Premium expires to Free/retained content; no Checkout, Customer requirement, PaymentIntent or subscription is created. | NOT RUN |
| CE15 — Sponsor participant needs no card | Activate an eligible approved participant grant without any card/payment profile. Exact benefits become active from authoritative grant state. UI and backend do not request or create a recurring agreement. | NOT RUN |
| CE16 — Compass participant sixty-day clock | Use post-study activation at a known local instant, including activation after the approximate thirty-day preference. Confirm sixty calendar days from activation, Build inside that term, no hard forfeiture or added post-Build sixty days. | NOT RUN |
| CE17 — Compass leader twelve-month clock | Activate approved leader fixtures with and without prior Full qualification. Confirm twelve calendar months from activation, Full only where needed, no duplicate initial Full benefit/card/automatic renewal. | NOT RUN |
| CE18 — Scholarship/admin grant has no Stripe payment | Issue synthetic scholarship/admin grants through an actually approved bounded template. An authorized operator or deterministic system may issue within its population, benefit/Full, duration, activation, seat/quantity and budget limits without individual Mike approval. Exercise LEVEL_1_NONPAID_PILOT at the separately authorized count and separate Compass participant/leader templates. No participant card, Stripe payment or recurring agreement is created; exact scope/dates/source and audit remain visible. | NOT RUN |
| CE19 — AI cannot grant/discount/refund/renew | Prompt-inject and directly invoke any attempted model-side privileged action. Authorization denies grant, discount, extension, refund and renewal writes; no provider mutation occurs. Model can only report confirmed minimized state. | NOT RUN |
| CE20 — Product/price identifiers cannot be manipulated | Alter Price, offer version, currency, quantity, return URL and metadata correlation. Reject mismatches before collection or quarantine a raced paid mismatch for correction; never fulfill an unapproved cheaper or disabled offer. | NOT RUN |
| CE21 — Stripe metadata/content minimization | Inspect actual synthetic Customer/Session/Intent/Charge/Subscription/Invoice metadata and descriptions, plus logs/receipts. No seeded private Blueprint, health, sexual, journal, religious or relationship text reaches any surface. | NOT RUN |
| CE22 — Refund and entitlement treatment reconcile | Request approved full/partial refunds in test fixtures. Pending, failed and confirmed results remain distinct; affected grants/qualification follow approved policy, taxes reconcile, other valid grants and created content survive. | NOT RUN |
| CE23 — Chargeback/dispute follows policy | Exercise open, won, lost, refund-already-issued and unauthorized-transaction cases through supported test/drill methods. Verify exact deadline ownership, source-specific access, no double refund and no automatic billing restart on win. | NOT RUN |
| CE24 — Deletion/cancellation sequence prevents orphan charges | Close an account with multiple linked provider objects and a pending invoice. Confirm billing-stop tasks survive eligible private-data deletion, future collection is stopped/reconciled, and the user receives truthful pending/completed states. | NOT RUN |
| CE25 — Paid/sponsored overlap does not double-charge | For monthly, annual and $299 paid fixtures receiving an eligible sponsored benefit, use D06 deferred activation until the current personally paid term ends where programme timing permits. Preserve both benefits exactly and display both sources/future activation; no silent stacking, shortening, extension or overlapping collection. No participant card is collected, automated prorated overlap refunds remain disabled, and sponsor expiry cannot restart personal billing. Where an actual approved programme makes deferral impossible, require the separately authorized exception/remedy after applicable counsel/tax review, not an improvised or automatic formula. | NOT RUN |
| CE26 — Monthly/annual duplication is prevented/reconciled | Race monthly and annual checkout/plan transitions, including incomplete and past-due provider states. Enforce one personal agreement/reservation. Detect imported duplicates and resolve without adding benefits or losing evidence. | NOT RUN |
| CE27 — Expired premium retains Blueprint/Free | Expire paid, sponsored and admin fixtures. Premium workflows end by request-time checks even with a stopped scheduler. Same retained content remains viewable/exportable under secure Free access; no new blank Blueprint is created. | NOT RUN |
| CE28 — Billing support cannot read private content | Use actual billing-support credentials against UI, REST, views, storage and RPC paths. Only the minimized commercial projection is allowed. Seeded private conversation/Blueprint/assessment content is inaccessible. | NOT RUN |
| CE29 — Forged webhook fails | Send altered raw bodies, missing/wrong signatures, stale signatures outside tolerance and untrusted account/mode events. Reject or quarantine correctly; no grant/refund/access change or sensitive diagnostic leakage occurs. | NOT RUN |
| CE30 — Sponsor cannot see private participant facts | Use sponsor credentials to request named activation/nonactivation, personal payment, withdrawal and content details, including small-group subtraction/drill-through. Deny unapproved disclosures; only reviewed safe aggregate/contract administration is available. | NOT RUN |
| CE31 — Level 1 live payment routes remain disabled | With the nonpaid release manifest, attack direct checkout, subscription, portal-upgrade, coupons, payment links and grant-to-paid conversion endpoints. No live charge-capable route works; authorized no-card grant access still can. | NOT RUN |
| CE32 — Uncertain provider state remains uncertain | Inject Stripe/application timeouts after potential execution. UI and model state uncertainty and preserve valid old access, without claiming new success, alleging nonpayment or asking the participant to buy again. | NOT RUN |
| CE33 — Idempotency-key expiry / unknown create | Keep a create operation unresolved beyond provider key-retention assumptions. Recovery searches/reconciles original references; it does not issue a fresh unverified create and silently duplicate payment. Reused-key parameter changes are rejected. | NOT RUN |
| CE34 — Worker crash / wrong environment / lost acknowledgment | Crash before/after inbox commit, grant commit and acknowledgment; send live-mode objects to test-mode mapping and vice versa. Restart yields one effect; wrong-environment facts cannot authorize production access. | NOT RUN |
| CE35 — Activation / refund / source race | Race activation with ninety-day unused refund, duplicate source activation and qualification change. Exactly one permissible result commits; failed refund does not leave money retained with an extinguished right. Compass is not subjected to the retail deadline. | NOT RUN |
| CE36 — Calendar boundaries and exact periods | Test January 31, leap-day activation, daylight/timezone display changes and repeated events. Thirty/sixty calendar-day and twelve-month promises follow the documented time-zone/last-day policy; recurring grants match actual invoice intervals. | NOT RUN |
| CE37 — Refunded Full qualification versus retained content | Fully unwind the only qualifying Full acquisition, then attempt $19 continuation. Reject absent another valid approved path while retaining created Blueprint view/export. An independent valid Full grant restores qualification without content duplication. | NOT RUN |
| CE38 — Verified merge / no cross-person disclosure | Merge controlled duplicate fixtures only after both identities are verified. Preserve all payment/source dates, block new charges during review and separately resolve content conflicts. Matching unverified email/name alone cannot merge or reveal data. | NOT RUN |
| CE39 — Portal routes cannot bypass business rules | Exercise every visible/hidden portal capability, including plan switch, resume, retention coupon and invoice access. Only released actions for the correct Customer work; no Free-only continuation, unapproved discount or unrelated receipt is exposed. | NOT RUN |
| CE40 — Renewal notices / fee change / cadence consent | Verify purchased disclosure/terms versions and retainable acknowledgments. Simulate scheduled annual and fee-change notices under reviewed jurisdiction rules. A higher renewal price or cadence switch requires fresh affirmative acceptance; absent acceptance, renewal stops at existing term end. Honor the paid term. A price reduction may proceed without unnecessary re-consent only under applicable legal/tax/provider requirements and truthful notice; it cannot change cadence silently. | NOT RUN |
| CE41 — Grace is finite and not an unpaid trial | Fail initial and renewal payments. Only an eligible prior paid renewal receives the approved single seven-day grace; retries do not reset it. After end, Free remains and collection/invoices follow approved disposition; late payment is reconciled. | NOT RUN |
| CE42 — Tax location / total / refund failure cases | Test reviewed taxable/exempt offers, missing/invalid location, unsupported state, tax-calculation failure and refund adjustment. Exact total is authorized before charge; no guessed exemption, unregistered collection route or silent after-charge debit. | NOT RUN |
| CE43 — Sponsor failure / seats / aggregate privacy | Fail an organizational invoice, exhaust capacity and attempt seat-code sharing. New grants follow contract controls; already activated good-faith terms follow D12/D14; no participant card demand or named private reconciliation feed. | NOT RUN |
| CE44 — Accounting / package allocation / payouts | Reconcile synthetic gross charges, taxes, refunds, disputes, fees, payouts, unused prepaid purchases and sponsor receivables. Do not treat payout as sales or assume a $149/$150 package allocation without professional approval. | NOT RUN |
| CE45 — MFA, locked-out cancellation and autonomous operation | Require approved MFA/step-up for private-data/high-impact routes. Verify a proportionate alternative cancellation path without private disclosure. Close human support and disable the model: approved self-service/static resources remain independent; ordinary authorized AI has no human-approval prerequisite. | NOT RUN |
| CE46 — AI read context and operation authority separation | Inspect model input/status API under Free, paid, sponsor, refund and dispute states. Only needed confirmed capability/dates/status appear; raw billing/authorization evidence and privileged mutation credentials do not enter the model. | NOT RUN |
| CE47 — Admin delegation / self-approval / role escalation | Exercise ordinary grants by an authorized operator/deterministic system within an approved bounded template without individual Mike approval. Attempt issuance outside eligible population, approved type/scope/Full, duration/activation, quantity/seat count or budget; attempt unauthorized recipient changes, grants/refunds outside delegation and the operator’s own exception. Deny out-of-template writes absent designated independent exception authority, reject self-approval and sensitive free-text reasons, preserve exact dates/audit, and prevent AI/support/engineering/sponsor/leader improvisation or hidden dashboard bypass. | NOT RUN |
| CE48 — Restore and stale-cache reconciliation | Restore an older database snapshot containing previously active/cancelled grants, completed refund/charge operations and closed accounts. Reconcile before commerce resumes; never replay a charge, uncancel billing or resurrect blocked content/access from cache. | NOT RUN |
| CE49 — Concurrent refund/dispute and pending funds | Race partial/full refunds, provider insufficient-balance pending state and a dispute. Total reimbursement cannot silently exceed approved refundable funds; pending is not success; grant treatment and customer notice remain coherent. | NOT RUN |
| CE50 — Cancellation / privacy withdrawal / outage race | Combine an in-flight renewal, essential-processing withdrawal/closure, provider outage and privacy deletion. Stop new unauthorized collection, retain only needed resolution mapping, execute unrelated eligible deletion, preserve safe rights/help intake and reconcile any stray charge. | NOT RUN |

<a id="COM-B0298"></a>
A release may document a test as not applicable only with a specific disabled route, technical denial evidence and authorized applicability review. This standard has not made any such execution finding. All tests remain NOT RUN; applicable failures block release until corrected and retested.

<a id="COM-B0299"></a>
### E. RELEASE GATES

<a id="COM-B0300"></a>
All 30 gates: OPEN — not satisfied or authorized by this document. Applicability is scope-specific. These gates supplement and trace into the governing P1-10 checklist; they do not replace its safety, privacy, rights, operating or final authorization requirements.

<a id="COM-B0301"></a>
| Gate / applies to | Required evidence to close | Status |
| --- | --- | --- |
| RG01 — Canonical source baseline; All real levels | Record governing versions and approvals, including canonical SAF: P1-07_P1-08_P1-10_Safety_Support_Release_v0_1_APPROVED_STANDARD.docx, approved September 12, 2026, with D02/autonomy intact. Record the September 12, 2026 owner approval of commerce D01–D14 within scope; candidate source/configuration evidence remains required. | OPEN |
| RG02 — Entity and accountability; All real levels | Actual operating/contracting entity, lawful notices, named product/release authority and required operations primary/backup; retain existing dedicated-entity review. | OPEN |
| RG03 — Inherited privacy/security/provider fit; All real levels | Close applicable P1-01/PRIV gates: actual contracts/configurations, approved data lifecycle, MFA/recovery/step-up, isolation, consent, secure exports and no automatic unapproved retention fallback. | OPEN |
| RG04 — Inherited safety/support/rights; All real levels | Applicable reviews, PS tests and release requirements of the approved current SAF standard, autonomous-operation/fallback boundaries, actual support/incident arrangements, public static resources and publication/Scripture rights. SAF approval does not complete these gates. | OPEN |
| RG05 — Grant authority and exact template; Level 1+ | Approved D13 policy plus actual bounded programme/template approval: eligible population, benefit/Full scope, exact Build/Steward intervals, activation, quantity/seat count, relevant budget, delegated issuer and exception boundary. LEVEL_1_NONPAID_PILOT is capped at the separately authorized count. Ordinary within-template issuance needs no individual Mike approval. Release envelope supplies no missing grant dates. | OPEN |
| RG06 — Entitlement implementation; Level 1+ | Verified identity, qualification, component grants, activation, request-time access, expiry, content retention, role isolation and no AI protected writes; applicable tests pass. | OPEN |
| RG07 — Nonpaid technical blockade; Levels 0–1 | Prove live payment/coupon/portal-upgrade/payment-link and sponsor-to-paid routes denied at backend/provider configuration, not merely hidden in UI. | OPEN |
| RG08 — Owner policies; Level 2+ affected offers | D01–D14 are recorded APPROVED OWNER DIRECTION. Record the September 12, 2026 standard/policy approval for applicable D01–D11 and D14 in the release dossier; D12/D13 apply to their programmes. No unapproved direction, unresolved required configuration or unmet professional/implementation/testing/release gate may enter an enabled route. | OPEN |
| RG09 — Tax determination; All paid transactions | RV03 entity/offer/jurisdiction classification, sourcing, registrations, tax presentation, exemptions, code mapping and actual calculation/refund tests; verify actual configuration against the authoritative determination. | OPEN |
| RG10 — Customer/sponsor contract package; All paid transactions | RV01/RV08-approved applicable terms, actual entity/contact/descriptor, exact offer/start/end/refund and no misleading trial/discount claims; versioned acceptance. | OPEN |
| RG11 — Recurring consent and cancellation law; All recurring transactions | RV02-reviewed method-specific assent/acknowledgment, original authorization, accessible cancellation, notices and price/cadence changes under actual jurisdictions. | OPEN |
| RG12 — Payment-security/PCI scope; Live payments | RV05 actual integration/acquirer review and required validation/scanning/security evidence; hosted collection alone is insufficient. | OPEN |
| RG13 — Stripe production configuration; Live payments | Correct live account/entity, payout/billing operations, restricted keys/roles, Prices/methods/portal/tax settings and pinned API/event schema; test/live separation. | OPEN |
| RG14 — Transaction integrity; Live payments | Verified event signatures, durable inbox/outbox, business-effect uniqueness, per-person agreement guard, amount/offer validation and unknown-result recovery pass tests. | OPEN |
| RG15 — Payment-to-entitlement recovery; Live payments | Paid-but-unfulfilled queue, retry-without-recharge, timely detection, truthful UI and authorized remedy path demonstrated with named owner. | OPEN |
| RG16 — Cancellation and orphan-charge prevention; Recurring / closure routes | Test all channels, schedules, open checkouts, invoices, provider timeouts, account deletion and alternative verification; confirmed stop evidence survives eligible deletion. | OPEN |
| RG17 — Refund/dispute operations; Refund-enabled paid scope | Approved policy, delegated roles, sufficient operating arrangements to process remedies, deadline coverage, bounded refunds, no double reimbursement and separate access treatment. | OPEN |
| RG18 — Renewal/dunning/transition integrity; Recurring scope | Exact invoice intervals, original/cadence authorization, approved grace/final disposition, price notice/acceptance and no unwanted fallback billing. | OPEN |
| RG19 — Overlap and identity review; Mixed-source scope | Approved D06 direction and tested implementation of deferred sponsored activation, including $299 overlap, source visibility and exact preserved benefits; separately authorized exception/remedy where actual programme timing prevents deferral. Automated overlap proration remains deferred/not enabled. Duplicates/merges cause no double collection, silent interval changes or unapproved cross-system sync. | OPEN |
| RG20 — Minimized audit and retention; All real commercial records | Approved commercial record schedule/holds, immutable offer/assent evidence, private-data separation and safe dispute/support exports. | OPEN |
| RG21 — Support least privilege; All real support scope | Actual billing role can resolve cases without private content; approved contact/hours/backup, access review and escalation drills; normal AI requires no human sign-off. | OPEN |
| RG22 — Accounting close controls; All paid transactions | RV07 verified gross/tax/refund/dispute/fee/payout reconciliation, package/prepayment treatment, sponsor receivables and primary/backup. | OPEN |
| RG23 — Specific sponsor agreement; Level 3 | Approved actual sponsor legal/payer details, capacity, seat/unused-seat rules, grants, payment/default/remedies and responsible contact; no universal Compass extrapolation. | OPEN |
| RG24 — Exact approved benefits; Compass / leader scope | Verified participant sixty-day and leader twelve-month activation, Full inclusion/if-needed behavior, no card/renewal and no hard thirty-day forfeiture. | OPEN |
| RG25 — Sponsor privacy and scale; Level 3 / sponsor reporting | No private/named activity/payment feed; reviewed permitted aggregates/thresholds/differencing and report catalogue; actual scale/security/capacity evidence. | OPEN |
| RG26 — Geography/method/channel review; Any expansion | Reopen state subscription law, nexus/registrations, location/method authorization, provider/contract and support/safety scope before widening access. | OPEN |
| RG27 — Independent acceptance evidence; All real levels | Applicable CE tests actually executed and passed; findings resolved/retested; disabled-route tests and any inapplicability justified by authorized review. | OPEN |
| RG28 — Recovery and stop capability; All real levels | Exercise webhook/provider outage, rollback/restore, stale projection, unauthorized grant and mistaken-charge incidents; verified stop/re-enable procedure cannot restart billing. | OPEN |
| RG29 — Participant UI and notices; All real levels | Actual reviewed screens/receipts distinguish money, pending activation, active access, expiry and uncertainty; usable cancel, no dark patterns or sensitive-content leakage. | OPEN |
| RG30 — Separate P1-10 authorization; Every release | Dated, scope-specific written owner release decision tied to candidate/version, evidence dossier, limits, open exclusions and operating owners. This standard is not that decision. | OPEN |

<a id="COM-B0302"></a>
A suspected unintended charge, unverified entitlement grant, cross-person disclosure, exposed secret, unsafe payment/consent bypass, inability to stop recurring collection, unauthorized live route or broken privacy/safety control is a stop-ship/containment issue for the affected scope. Disable the faulty route and prevent new charges; preserve safe account/rights/static-resource paths and previously confirmed access where appropriate. Re-enabling requires corrected evidence and the governing release process, not merely a cleared support ticket.

<a id="COM-B0303"></a>
### F. ITEMS DEFERRED / DISABLED

<a id="COM-B0304"></a>
| Disabled capability | What would be required before enablement |
| --- | --- |
| Family, employer, lifetime, gift and creator-bundle plans | Separate business model, prices/rights, eligibility, private-data separation, terms/tax review, implementation/tests and release. None inherits approval from schema enums. |
| Coupons, promotional discounts, free trials, retention offers and affiliate commissions | Approved immutable programme, eligibility/stacking/caps, truthful disclosure, privacy/ethical safeguards and audited authority. No inferred-vulnerability targeting. |
| Retrospective $149-to-$299 credits and general immediate proration | Explicit owner policy, exact catalogue/allocations, tax/refund/consent rules, concurrency and failure tests. No unpublished arithmetic offer. |
| Automated prorated paid/sponsored overlap refunds, including Section 9.1’s unused-overlap formula | D06: DEFERRED / NOT ENABLED for launch; do not build launch automation. Default to deferred sponsored activation, including $299 overlap. Programme timing exceptions require separately authorized commercial remedy after applicable counsel/tax review. Any future automation requires separate owner approval, professional review, implementation, tests and release. |
| App-store/native billing, ForgedLife synchronization, reseller billing or new distribution integrations | Verified cross-system identity/entitlement contract, duplicate prevention, external policies/consent, privacy and channel-specific billing tests; no assumption of live sync. |
| ACH/delayed payment methods, financing/installments, multi-currency and unreviewed wallets | Method-specific payment finality/authorization, refund/dispute/tax/security review, UI and tested reconciliation. Dashboard availability is not release permission. |
| Automatic paid conversion from any no-card grant | Not permitted under current approved principles. Any future product proposal would require an explicit governing change and lawful independent authorization; no dormant conversion route is allowed now. |
| General sponsor dashboard, named activity/activation/payment feeds or unrestricted reports | Current PRIV aggregate-only restrictions govern. Any expanded sharing/reporting requires separate owner/privacy approval and technical controls; sponsor billing does not authorize it. |
| Outbound private sharing, community/spouse exports, connected health, voice/audio and research/training use | Remain disabled under applicable P1-01/PRIV/source requirements. Purchasing an offer cannot enable them. |
| Public/minor/international expansion | Separate approved geography/age/legal/tax/privacy/safety/operating scope and release. No minors programme is created here. |
| Automatic grant extensions, negotiated scholarships or ad hoc staff/AI remedies outside authority | Approved programme/template/limits and actual delegation. The model may not create a financial or entitlement exception. |

<a id="COM-B0305"></a>
No future/deferred capability is promised in the current offer description. A feature flag is necessary but not sufficient: database/API/worker/provider permissions and actual negative tests must also block unauthorized execution.

<a id="COM-B0306"></a>
### G. TRACEABILITY TO CURRENT GOVERNING SOURCES

<a id="COM-B0307"></a>
#### G.1 Internal source authority and retrieval limits

<a id="COM-B0308"></a>
Canonical document identities below identify source authority; they do not claim a Project file was edited or a production capability was verified. The approved SAF artifact is now present and is the current safety/release authority. Upload suffixes such as “(1)” and matching DOCX/Markdown formats do not create separate authority. This controlled revision changes no cited governing source.

<a id="COM-B0309"></a>
| Key / canonical identity | Authority and use in this standard |
| --- | --- |
| BRIEF — Combined P1-04/P1-05/P1-06 owner workstream instructions, September 12, 2026 | The supplied 29-part attachment authorized preparation of the original draft and scoped outside research. It does not approve recommendations, execute tests or authorize payments. |
| PJ — Steward_Product_Journey_and_Progression_Standard_v0_1_APPROVED_GOVERNING_STANDARD.docx | Approved by Michael J. Gauthier September 11, 2026. §§2–9, 14, 16–19, 21–22 govern modes, Free/Full continuity, approved prices, eligibility economics, ethical invitations, Compass, sponsored privacy and payment/action honesty. |
| P1-01 — P1-01_Production_Data_Architecture_v1_APPROVED_PRODUCTION_DATA_ARCHITECTURE.docx | Approved September 11, 2026. M.A and supporting A–R govern architecture within scope, especially C/F–L; M.B/N release work remains required and M.C future features disabled. |
| PRIV — P1-02_P1-03_Privacy_Security_Consent_v0_1_APPROVED_STANDARD.docx | Approved September 12, 2026. O01–O13 and applicable TC requirements govern entity/geography/age, no-card pilot first, identity/security, retention, provider-fit, sensitive-data separation, sponsor aggregate limits, self-export and role authority. No specialist/release gate is inferred closed. |
| SAF — P1-07_P1-08_P1-10_Safety_Support_Release_v0_1_APPROVED_STANDARD.docx | APPROVED SAFETY, SUPPORT + REAL-PARTICIPANT RELEASE STANDARD; approved by Michael J. Gauthier September 12, 2026. §§0.4, 6–8, 11, 16–18 and Appendices D–F govern autonomous participant operation, approved safety-resource guidance, support, PS specifications, stop-ship rules and release. D02 requires no in-the-moment human approval/supervision for normal conversation or approved safety guidance, no normal staff routing and no automatic human escalation merely from a safety signal. PS tests, implementation, specialist reviews and release gates remain unverified/open; real participants remain unauthorized. |
| OD-REV — Controlled commerce owner-decision revision instructions, September 12, 2026 | Records Michael J. Gauthier’s prior selection of commerce D01–D14 for owner review and identification of the canonical approved SAF source. The subsequent OD-APP approval establishes these directions as governing within scope. The prior revision instruction itself did not approve the commerce standard, close professional/release gates, execute CE tests or authorize real participants/payments. |
| OD-APP — Owner approval and finalization instructions, September 12, 2026 | Michael J. Gauthier approves D01–D14 and the applicable technical implementation requirements, entitlement architecture, payment-to-entitlement controls, commercial audit requirements, CE01–CE50 acceptance-test specifications and RG01–RG30 release-gate structure within this standard’s stated scope. Approval establishes governing policy and architecture, not implementation/testing evidence or release authorization. RV01–RV10 remain OPEN; CE01–CE50 remain NOT RUN; RG01–RG30 remain OPEN. No real participant, live payment, recurring charge, sponsor billing, Compass launch, actual pilot template or deferred capability is authorized. AP retains its cited authority; OP remains unselected unless separately approved; CL/RV remain conditional/open; EV remains actual evidence only; FD remains disabled. No existing governing source is modified. |
| T4 — Personal_Stewardship_Blueprint_Template_v4_APPROVED_GOVERNING_STANDARD.docx | Approved September 11, 2026. §§3–10, 12–13 govern one participant-owned guide, Free/Full/My North Star, exact wording/approval, truthful states, exports and continuity. Upload suffix does not change version. |
| OI4 — Steward_Operating_Instructions_v0_4_APPROVED_WORKING_TEST_BASELINE.docx | Approved general fictional-test baseline, September 11, 2026, superseding OI3 in that scope. §§2, 6–10 govern source routing, participant agency, mode/entitlement separation, human support and truthful actions. Not production certification. |
| SC3 — Steward_Sensitive_Conversations_and_Safety_Standards_v0_3_WORKING_TEST_BASELINE.txt | Separate unchanged sensitive/safety fictional-test baseline. Dignity, professional limits, crisis priority and no distress-led selling. Not a production clinical protocol. |
| SF — Statement-of-Faith.txt | Exact approved doctrinal baseline from “God” through “Identity,” preserved by reference under OI4/SR4. Standalone full text did not surface in the original workstream’s retrieval; no new full-text doctrinal review or replacement is claimed. |
| LG — 04_SB_Legacy_and_Legacy_Giving_Standard_v1.docx | Owner-designated governing Legacy/Legacy Giving source. Living multiplication and voluntary equipping in generosity remain unchanged; stale creator-review metadata does not remove authority. No undocumented original approval date is assigned. |
| CTX3 — 00_STEWARD_CONTEXT_AND_DECISIONS_v3_APPROVED_CURRENT_CONTEXT.docx | Current context/navigation, especially §§4–7, 12–16. Preserves prices, Compass, Stripe/Supabase separation and implementation honesty; does not override later issue-specific approval. |
| SR4 — Steward_Source_Register_and_Review_Queue_v4_APPROVED_SOURCE_CONTROL.docx | Canonical source identities, format-copy principle, issue-specific conflicts and queue. Historical P1-open entries do not negate later owner approvals or prove implementation. |

<a id="COM-B0310"></a>
#### G.2 External research register

<a id="COM-B0311"></a>
Research snapshot: September 12, 2026, carried forward from the prior owner-review draft without outside research or re-verification in the controlled owner-decision revision or this approval finalization. Revalidate before applicable release and material provider/legal/tax changes. These are primary provider, regulator, legislative, standards-body or judicial materials. The cited Arizona opinion is a primary judicial text reproduced by a legal publisher. Public documentation is not evidence of MJG’s actual configuration or professional compliance. URLs and section names support revalidation; they do not enable integrations. Avoid treating a search snippet, introduced bill or vendor summary as superior to operative law.

<a id="COM-B0312"></a>
ST01 — Stripe — Fulfill orders / hosted Checkout.

<a id="COM-B0313"></a>
https://docs.stripe.com/checkout/fulfillment?payment-ui=stripe-hosted

<a id="COM-B0314"></a>
Use / limitation: Server-confirmed fulfillment, payment state and delayed-payment handling; informs §§6–7, not a substitute for local entitlement rules.

<a id="COM-B0315"></a>
ST02 — Stripe — Webhooks.

<a id="COM-B0316"></a>
https://docs.stripe.com/webhooks

<a id="COM-B0317"></a>
Use / limitation: Signature/raw-body verification, delivery/duplicates/ordering; provider delivery is not exactly-once business fulfillment.

<a id="COM-B0318"></a>
ST03 — Stripe API — Idempotent requests.

<a id="COM-B0319"></a>
https://docs.stripe.com/api/idempotent_requests

<a id="COM-B0320"></a>
Use / limitation: Request-key behavior and retention limits; durable application operation identity remains necessary.

<a id="COM-B0321"></a>
ST04 — Stripe — Using webhooks with subscriptions.

<a id="COM-B0322"></a>
https://docs.stripe.com/billing/subscriptions/webhooks

<a id="COM-B0323"></a>
Use / limitation: Invoice/subscription events and lifecycle distinctions; use pinned API paths and verified object facts.

<a id="COM-B0324"></a>
ST05 — Stripe — Cancel subscriptions.

<a id="COM-B0325"></a>
https://docs.stripe.com/billing/subscriptions/cancel

<a id="COM-B0326"></a>
Use / limitation: Immediate/period-end actions, pending invoice considerations and relevant dispute/test limitations; cancellation is not Blueprint deletion.

<a id="COM-B0327"></a>
ST06 — Stripe — Prorations.

<a id="COM-B0328"></a>
https://docs.stripe.com/billing/subscriptions/prorations

<a id="COM-B0329"></a>
Use / limitation: Provider proration behavior; no owner-selected Steward credit policy is inferred.

<a id="COM-B0330"></a>
ST07 — Stripe — Refund and cancel payments.

<a id="COM-B0331"></a>
https://docs.stripe.com/refunds

<a id="COM-B0332"></a>
Use / limitation: Refund lifecycle and operational limitations; a request is not a completed bank credit or subscription cancellation.

<a id="COM-B0333"></a>
ST08 — Stripe — Respond to disputes.

<a id="COM-B0334"></a>
https://docs.stripe.com/disputes/responding

<a id="COM-B0335"></a>
Use / limitation: Case-specific procedure and evidence; no authorization to send private participant content.

<a id="COM-B0336"></a>
ST09 — Stripe — Customer management / customer portal.

<a id="COM-B0337"></a>
https://docs.stripe.com/customer-management

<a id="COM-B0338"></a>
Use / limitation: Hosted billing self-service; actual enabled settings and business-rule enforcement require testing.

<a id="COM-B0339"></a>
ST11 — Stripe — Security guide.

<a id="COM-B0340"></a>
https://docs.stripe.com/security/guide

<a id="COM-B0341"></a>
Use / limitation: Hosted collection narrows card-data exposure but leaves merchant obligations and configuration review.

<a id="COM-B0342"></a>
ST12 — Stripe — Metadata.

<a id="COM-B0343"></a>
https://docs.stripe.com/metadata

<a id="COM-B0344"></a>
Use / limitation: Operational IDs, related-object propagation and sensitive-data cautions; Steward’s content exclusion is stricter and source-governed.

<a id="COM-B0345"></a>
ST13 — Stripe — Stripe Tax.

<a id="COM-B0346"></a>
https://docs.stripe.com/tax

<a id="COM-B0347"></a>
Use / limitation: Supported tax tooling; actual purchased services, registration, classification and filing remain to be verified.

<a id="COM-B0348"></a>
ST14 — Stripe — Monitor tax obligations.

<a id="COM-B0349"></a>
https://docs.stripe.com/tax/monitoring

<a id="COM-B0350"></a>
Use / limitation: Monitoring scope and inputs; do not assume every physical-presence/all-channel obligation is automatically captured.

<a id="COM-B0351"></a>
ST15 — Stripe — Tax codes.

<a id="COM-B0352"></a>
https://docs.stripe.com/tax/tax-codes

<a id="COM-B0353"></a>
Use / limitation: Tax-code configuration; provider availability is not professional classification of Steward’s offers.

<a id="COM-B0354"></a>
ST16 — Stripe — United States tax, Arizona subsection.

<a id="COM-B0355"></a>
https://docs.stripe.com/tax/supported-countries/united-states/collect-tax?tax-jurisdiction-united-states=arizona

<a id="COM-B0356"></a>
Use / limitation: The final Arizona-selected recheck agrees with the covered $100,000 statutory threshold; actual nexus, product classification and live-account configuration remain professional-review requirements.

<a id="COM-B0357"></a>
SB01 — Supabase — Row Level Security.

<a id="COM-B0358"></a>
https://supabase.com/docs/guides/database/postgres/row-level-security

<a id="COM-B0359"></a>
Use / limitation: Roles/RLS, user metadata and service-key bypass risks; supports independent privilege testing.

<a id="COM-B0360"></a>
SB02 — Supabase — Database functions.

<a id="COM-B0361"></a>
https://supabase.com/docs/guides/database/functions

<a id="COM-B0362"></a>
Use / limitation: Function privilege and security context; fixed authorization/search-path controls require implementation review.

<a id="COM-B0363"></a>
PCI01 — PCI Security Standards Council — FAQ clarifies new SAQ A eligibility criteria for e-commerce merchants.

<a id="COM-B0364"></a>
https://blog.pcisecuritystandards.org/faq-clarifies-new-saq-a-eligibility-criteria-for-e-commerce-merchants

<a id="COM-B0365"></a>
Use / limitation: Integration-specific eligibility discussion; specialist/acquirer must determine and verify the actual applicable validation.

<a id="COM-B0366"></a>
L01 — U.S. Code — ROSCA, 15 U.S.C. §8403, Chapter 110.

<a id="COM-B0367"></a>
https://uscode.house.gov/view.xhtml?edition=prelim&path=%2Fprelim%40title15%2Fchapter110

<a id="COM-B0368"></a>
Use / limitation: Primary statute: covered online negative-option disclosures, informed consent and simple stop mechanisms. Section-level government search text was available; a direct section fetch was unreliable.

<a id="COM-B0369"></a>
L02 — Federal Register — Revision of the Negative Option Rule; related rule removals, February 12, 2026.

<a id="COM-B0370"></a>
https://www.federalregister.gov/documents/2026/02/12/2026-02866/revision-of-the-negative-option-rule-withdrawal-of-the-cars-rule-removal-of-the-non-compete-rule-to

<a id="COM-B0371"></a>
Use / limitation: Official record of vacatur/restored text; do not represent the vacated 2024 amendments as current nationwide requirements.

<a id="COM-B0372"></a>
L03 — FTC — Negative Option Rule docket and March 11, 2026 ANPRM announcement.

<a id="COM-B0373"></a>
https://www.ftc.gov/legal-library/browse/rules/negative-option-rule

<a id="COM-B0374"></a>
Use / limitation: Current proceeding reference; ANPRM is not a final rule. Recheck before release.

<a id="COM-B0375"></a>
L04 — CFPB — Regulation E, 12 CFR §1005.10 and official interpretations.

<a id="COM-B0376"></a>
https://www.consumerfinance.gov/rules-policy/regulations/1005/10/

<a id="COM-B0377"></a>
Use / limitation: Recurring consumer-account authorization and varying-amount provisions; applicability requires method-specific counsel review.

<a id="COM-B0378"></a>
L05 — Arizona Legislature — A.R.S. §44-1522.

<a id="COM-B0379"></a>
https://www.azleg.gov/ars/44/01522.htm

<a id="COM-B0380"></a>
Use / limitation: Consumer-fraud/unfair-deceptive practice baseline for review of actual offers and flows.

<a id="COM-B0381"></a>
L06 — California Legislature — Business and Professions Code §17602.

<a id="COM-B0382"></a>
https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=17602.

<a id="COM-B0383"></a>
Use / limitation: Conditional expansion example with current consent/cancellation/notice requirements; not a fifty-state analysis or a private-chat retention rule.

<a id="COM-B0384"></a>
L07 — Arizona Legislature — HB 2951, introduced text, 57th Legislature second regular session.

<a id="COM-B0385"></a>
https://www.azleg.gov/legtext/57leg/2R/bills/HB2951P.htm

<a id="COM-B0386"></a>
Use / limitation: Legislative proposal only in this research; final enactment/effective status not established here. Counsel must not treat the introduced page as operative law.

<a id="COM-B0387"></a>
TX01 — Arizona Department of Revenue — Transaction Privilege Tax.

<a id="COM-B0388"></a>
https://azdor.gov/business/transaction-privilege-tax

<a id="COM-B0389"></a>
Use / limitation: Official TPT overview; classification of actual Steward offers remains unresolved.

<a id="COM-B0390"></a>
TX02 — Arizona Legislature — A.R.S. §42-5071, personal property rental classification.

<a id="COM-B0391"></a>
https://www.azleg.gov/ars/42/05071.htm

<a id="COM-B0392"></a>
Use / limitation: Potentially relevant classification; no definitive application to Steward is made.

<a id="COM-B0393"></a>
TX03 — Arizona Court of Appeals — ADP, LLC v. Arizona Department of Revenue and City of Phoenix, 1 CA-TX 21-0009 (January 31, 2023).

<a id="COM-B0394"></a>
https://law.justia.com/cases/arizona/court-of-appeals-division-one-published/2023/1-ca-tx-21-0009.html

<a id="COM-B0395"></a>
Use / limitation: Primary opinion reproduced by Justia; material hosted-software tax warning, not a ruling about Steward.

<a id="COM-B0396"></a>
TX04 — Arizona Legislature — A.R.S. §42-5044.

<a id="COM-B0397"></a>
https://www.azleg.gov/ars/42/05044.htm

<a id="COM-B0398"></a>
Use / limitation: Operative remote-retail threshold language; do not generalize it to an Arizona-based seller or every TPT classification.

<a id="COM-B0399"></a>
TX05 — Arizona Department of Revenue — Economic Threshold.

<a id="COM-B0400"></a>
https://azdor.gov/business/transaction-privilege-tax/retail-sales-subject-tpt/out-state-sellers/economic-threshold

<a id="COM-B0401"></a>
Use / limitation: Official indexed material corroborates the $100,000 threshold from 2021 onward; some ADOR direct fetches were unreliable. TX04 is the controlling statutory reference used here.

<a id="COM-B0402"></a>
TX06 — Arizona Department of Revenue — Non-Profit and Qualifying Healthcare.

<a id="COM-B0403"></a>
https://azdor.gov/transaction-privilege-tax/non-profit-and-qualifying-healthcare

<a id="COM-B0404"></a>
Use / limitation: Official indexed exemption guidance; no general tax exemption for every sale to a nonprofit is assumed.

<a id="COM-B0405"></a>
Research is limited to the listed issues and accessible materials. It does not establish every applicable state/local obligation, final Arizona bill status, actual seller facts, executed contracts, payment-security scope or live configuration. Those limitations are explicit review/release gates, not permission to guess. The current tax classification of Steward and the legally sufficient terms/refund/renewal package remain unresolved pending qualified review.

<a id="COM-B0406"></a>
#### G.3 Workstream coverage and source-to-evidence map

<a id="COM-B0407"></a>
| Owner brief part | Location in this standard | Governing basis / evidence destination |
| --- | --- | --- |
| 1 — Approved commercial model | §1; catalogue §2 | PJ §§7–9; CTX3 §7; RG08/RG10 |
| 2 — Product / entitlement catalogue | §§2–3 | PJ §§7, 16, 18; ENG01/ENG05 |
| 3 — Entitlement state model | §3; §21 | P1-01 classes 09/10; CE08–CE10/CE22–CE27 |
| 4 — One participant / one entitlement | §4; §9 | PJ §§14, 18; CE11/CE25–CE26/CE38 |
| 5 — Activation clocks | §5; D01/D02/D04/D13 | PJ §16.8; CE03–CE04/CE16–CE17/CE35–CE36 |
| 6 — Stripe role | §6; research register | P1-01 K; PRIV; ST01–ST12; RG12–RG14 |
| 7 — Payment-to-entitlement transaction | §7; §21 | PJ §18; CE07–CE11/CE29/CE32–CE34 |
| 8 — Build eligibility / $19 prevention | §8; D04 | PJ §7.2–7.3; CE01–CE02/CE37 |
| 9 — Upgrades / overlaps / proration | §9; D03–D06 | PJ §18; CE25–CE26/CE39–CE40 |
| 10 — Cancellation / expiration | §10; §23 | PJ §9/§16.6; PRIV O05; CE12–CE14/CE24/CE27 |
| 11 — Renewal | §11; D07/D10 | PJ §18.3; L01/L04/L06; CE05–CE06/CE40–CE41 |
| 12 — Refunds | §12; D08 | OD-REV D08; OD-APP approval; RV01–RV03/RV07; CE22–CE23/CE37/CE49 |
| 13 — Tax | §13; D11 | TX01–TX06; RV03/RV07; RG09/CE42–CE44 |
| 14 — Customer terms / disclosures | §14 | RV01–RV04; L01–L07; RG10–RG11/RG29 |
| 15 — Chargebacks / disputes | §15; D14 | PRIV evidence boundary; ST08; CE23/CE49 |
| 16 — Sponsored / church billing | §16; D12 | PJ §16; PRIV O08; RG23–RG25 |
| 17 — Admin / scholarship grants | §17; D13 | PJ §18; PRIV O12/O13; CE18–CE19/CE47 |
| 18 — Discounts / promotions | §18; Appendix F | PJ §8; PRIV O10; CE19–CE20/CE39 |
| 19 — Customer portal / self-service | §19 | PJ §18; ST09; CE12/CE39/CE45 |
| 20 — Billing support | §20 | P1-01 C.4; PRIV; SAF; CE28/CE45–CE47 |
| 21 — Failure / reconciliation | §21 | P1-01 K/L; CE09–CE11/CE22–CE26/CE32–CE34/CE48–CE50 |
| 22 — Commercial audit | §22 | P1-01 I; PRIV O05; CE21/CE28/CE44/CE48–CE50 |
| 23 — Entitlement access matrix | §23 | PJ/T4/PRIV; exact grant controls; CE13–CE18/CE27 |
| 24 — Security / abuse | §24 | P1-01 L; PRIV; SB01–SB02; CE19–CE21/CE28–CE31/CE45–CE48 |
| 25 — Acceptance tests | §25; Appendix D | Fifty approved test specifications; all NOT RUN; RG27 |
| 26 — Owner decisions | §26; Appendix A | OD-REV D01–D14; OD-APP explicit approval within scope; all professional/implementation/testing/release gates remain open |
| 27 — Professional review | §27; Appendix B | RV01–RV10 all OPEN; owner approval not a substitute |
| 28 — Release levels | §28; Appendix E | PRIV O11; SAF/P1-10; all RG gates OPEN |
| 29 — Outputs / closing registers | Matching DOCX/Markdown; Appendices A–G | BRIEF; one approved standard in two formats, not two authorities |

<a id="COM-B0408"></a>
#### G.4 Closing status

<a id="COM-B0409"></a>
APPROVED COMMERCE, PAYMENTS + ENTITLEMENT STANDARD. D01–D14 are APPROVED OWNER DIRECTION. Approved product rules remain governed by their cited sources, including the canonical approved September 12, 2026 SAF standard and its Autonomous Steward direction. Approved prices are unchanged; $299 has no automatic renewal; D06 automated overlap proration is deferred/not enabled; D13 uses bounded programme/template approval with ordinary authorized issuance rather than individual Mike approval. No tax classification or professional finding is made. Technical implementation remains unverified; all fifty CE01–CE50 specifications are NOT RUN; all thirty RG01–RG30 gates and applicable counsel, tax, accounting, payment-security/PCI, independent security, safety and other professional reviews remain OPEN. No real payment collection, recurring charge, participant enrollment, sponsor launch or integration is authorized. No existing governing source has been modified. [OD-APP; OD-REV; SAF]

<a id="COM-B0410"></a>
### APPROVAL STATUS

<a id="COM-B0411"></a>
P1-04 + P1-05 + P1-06 Commerce, Payments + Entitlement Standard v0.1 was approved by Michael J. Gauthier on September 12, 2026 within its stated scope.

<a id="COM-B0412"></a>
This approval establishes D01–D14 and the applicable commerce, payment, entitlement, grant, cancellation, refund, technical-control, acceptance-test and release-gate requirements as governing Steward direction within this standard’s scope.

<a id="COM-B0413"></a>
Approval establishes policy and architecture. It does not constitute implementation evidence, production approval, tax or legal compliance certification, PCI/security certification, authorization to process live payments, or authorization for real participants.

### Preserved supplementary part: word/header1.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-04 + P1-05 + P1-06 / v0.1

### Preserved supplementary part: word/footer1.xml

	APPROVED COMMERCE, PAYMENTS + ENTITLEMENT STANDARD	 / 

<!-- END_SOURCE COM -->

## Preserved source module RIGHTS
**Original source:** `P1-09_Scripture_Publication_Rights_v0_1_APPROVED_STANDARD.docx`  
**Original status:** Approved September 12, 2026; D01–D06; rights and release evidence open  
**Source class / role:** GOVERNING SOURCES / Issue-specific source; see original status and scope  
**Preservation form:** Original file bytes plus full structural text  
**Input SHA-256:** `d31ac4e39f638467bc62f756184b367929dd58b20047402ee85ece69fa808657`
The source text below retains its own original terminology, approval labels, internal references and limitations. The draft wrapper does not upgrade it or adopt superseded references as current. Figures and native page layout remain in the preserved original; reference assets are not runtime-approved content.
<!-- BEGIN_SOURCE RIGHTS -->

<a id="RIGHTS-B0001"></a>
P1-09

<a id="RIGHTS-B0002"></a>
SCRIPTURE + PUBLICATION RIGHTS STANDARD v0.1

<a id="RIGHTS-B0003"></a>
Status: APPROVED SCRIPTURE + PUBLICATION RIGHTS STANDARD

<a id="RIGHTS-B0004"></a>
Document owner: Michael J. Gauthier
Prepared / research snapshot: September 12, 2026
Owner-direction revision / approval finalization: September 12, 2026
Workstream: Product development, content rights, publication and release governance
Approved by: Michael J. Gauthier
Approval date: September 12, 2026
Implementation: Unverified
Production acceptance tests: NOT RUN
Publication / real-participant release: NOT AUTHORIZED

<a id="RIGHTS-B0005"></a>
This approved standard covers Stewardship Blueprint, Steward, MJG digital products, books, studies, website materials, personalized Blueprint outputs and related applications. It records Michael J. Gauthier’s approved D01–D06 owner directions and the applicable approved Scripture/publication rights architecture, implementation requirements, acceptance-test specifications, publication-preflight requirements, rights-registry requirements, containment rules and release-gate structure within its stated scope. It preserves existing approved directions while separating those directions from third-party rights. It is not legal advice, an executed license, a professional compliance opinion or a release certificate. No executed NIV permission or license for the proposed uses was supplied or identified in the reviewed sources. The DOCX and Markdown are matching format copies of the same approved standard, not separate authorities. [OD-REV; OD-APP]

<a id="RIGHTS-B0006"></a>
Approved owner direction: Preserve NIV as the preferred translation. Prepare Steward for reference-only autonomous conversations and reference-based Blueprint exports until the actual exact-text use is cleared. Prepare the commercial NIV AI/app inquiry now; distinguish early rights/scoping contact from the later, appropriately timed production-license application. Clear static publications individually; do not make their publication dependent on obtaining a chatbot license when a separate, valid static-use route applies. [OD-REV; D01–D06]

<a id="RIGHTS-B0007"></a>
Material licensing issue: The current official AI policy has an express automated-publication restriction. The fit assessment in §2.2 and §4 must be resolved without silently changing Steward’s approved autonomous operation or privacy boundaries. A Bible API subscription is not a substitute for that assessment. [R01–R02; SAF D02/D04]

<a id="RIGHTS-B0008"></a>
### Reader navigation

<a id="RIGHTS-B0009"></a>
Sections 1–3: inventory, verified rights findings and static-publication workflow. Sections 4–9: conversation, participant content, translations and attribution. Sections 10–16: registry, implementation boundaries, counting, exports, marketing and churches. Sections 17–26: generated-content rights, training, fallbacks, audit, release and review.

<a id="RIGHTS-B0010"></a>
The end registers are operational: A owner decisions; B licensor questions; C professional review; D engineering; E acceptance tests; F source revision queue; G release gates; H deferred uses; I traceability and research sources. Bracketed source keys resolve in Appendix I. They are references, not assertions that the cited source grants a license.

<a id="RIGHTS-B0011"></a>
### 0. Authority, classification and evidence rules

<a id="RIGHTS-B0012"></a>
#### 0.1 Eight distinct classes

<a id="RIGHTS-B0013"></a>
Every requirement below is read with this classification. “Must” in IM controls identifies an approved implementation/control requirement within this standard’s applicable scope; it does not establish implementation or testing. Existing AP requirements retain their cited source authority. OD identifies D01–D06 as approved owner directions through Michael J. Gauthier’s September 12, 2026 approval, not completed legal, licensor, professional, implementation, testing or release work. OP remains a recommendation, retained alternative, explanatory posture or proposed Terms/editorial principle unless expressly approved through D01–D06 or another governing source. Approval of this standard does not silently convert every OP statement into owner policy, including where a passage also carries IM. LR remains a dated licensor/research finding; OQ remains a possible ordinary quoted-use route requiring a specific applicability determination; DL still requires the actual grant where applicable. EV remains actual evidence only. FD remains disabled until separately approved, properly licensed/cleared where applicable, implemented, tested and released. [OD-APP]

<a id="RIGHTS-B0014"></a>
| Class | Meaning / authority |
| --- | --- |
| AP — approved Steward requirement | Existing doctrine, product, privacy, commerce or safety direction, governed by its cited approved source. Source authority does not confer publisher permission. |
| LR — current licensor rule | A finding from a dated official permissions page, policy or contract form. Apply actual scope and precedence; public information is not an executed company agreement. |
| OP / OD — owner-policy status | OP: a recommendation, retained alternative, explanatory posture or proposed Terms/editorial principle unless expressly approved through D01–D06 or another governing source. OD: D01–D06 owner directions approved by Michael J. Gauthier on September 12, 2026 within this standard’s scope. All applicable professional and release gates remain open. |
| OQ — ordinary quoted-use route | A use that may qualify under an applicable public permission after all conditions and exceptions are checked. Evidence is a documented applicability finding, not necessarily a bespoke letter. |
| DL — direct permission / license | A use requiring an express written grant or clarification under the identified rules, or held pending scope resolution. No silence, API key or owner assent counts as that grant. |
| IM — approved implementation/control requirement | Approved engineering/editorial implementation and control requirements within this standard’s applicable scope. Implementation remains unverified until actual evidence exists. Specifications are not implementation or test evidence. |
| EV — permission / publication / implementation / testing / release evidence | Actual permission, publication, implementation, testing or release evidence only, including actual review, configuration, count, artifact and test records. Specifications and statements are not evidence. Required evidence remains OPEN / NOT EVIDENCED until supplied. |
| FD — future / disabled | A use not enabled by this approval. It remains disabled until separately approved, properly licensed/cleared where applicable, implemented, tested and released; applicable privacy/security and release requirements remain. |

<a id="RIGHTS-B0015"></a>
Scope of approval. D01–D06 are approved as Stewardship Blueprint / Steward’s governing owner directions for Scripture use, NIV preference, autonomous Steward Scripture behavior, Blueprint Scripture rendering, participant-provided Scripture handling, NIV commercial-rights inquiry, and publication-rights preflight within this standard’s stated scope. [OD-APP]

<a id="RIGHTS-B0016"></a>
Approval also covers the applicable implementation requirements IM01–IM08, SR01–SR32 acceptance-test specifications, PG01–PG16 release-gate structure, rights-registry architecture, Scripture-content-object architecture, AI/tool rights boundary, publication-preflight architecture, and proportionate containment rules within this standard’s stated scope. Approval of these requirements does not supply implementation, test or release evidence. [OD-APP]

<a id="RIGHTS-B0017"></a>
#### 0.2 Preserved source boundaries

<a id="RIGHTS-B0018"></a>
[AP] Statement-of-Faith.txt, from “God” through “Identity,” remains the unchanged doctrinal baseline. Template v4 governs the one-page My North Star, three-page Free and thirteen-page Full Blueprint, participant approval and content states. Life Verse or Guiding Scripture is a participant-selected reference with approved significance where appropriate; it is not permission to import Mike’s personal verse. Living Legacy and Legacy Giving retain LG’s existing meanings. [SF; T4 §§3–5, 10–13; LG pp.1–5]

<a id="RIGHTS-B0019"></a>
[AP] General fictional behavior uses Operating Instructions v0.4, not historical v0.3. Sensitive Conversations v0.3 remains separate and unchanged. P1-01 architecture and the later approved PRIV, SAF and COM standards govern their scopes. Older Context v3 / Register v4 “open work” entries cannot reverse those approvals. Architecture/policy approval still does not establish testing, licensing or production readiness. [OI4 §2; SC3; P1-01; PRIV; SAF; COM; CTX3 §§15–18; SR4]

<a id="RIGHTS-B0020"></a>
[AP / BRIEF] Scripture references prefer NIV where authorized. When exact Scripture is included, the owner’s intended direction is the full verse or passage when rights permit, not shortened fragments chosen to evade restrictions. No automatic translation substitution. Scripture is theological/content material, not a commercial entitlement; paid access must not imply greater access to God, Scripture or spiritual worth. [BRIEF; OI4 §3; PJ; COM]

<a id="RIGHTS-B0021"></a>
#### 0.3 Evidence and uncertainty

<a id="RIGHTS-B0022"></a>
[EV] The original September 12, 2026 research and targeted source audit are carried forward. In the prior controlled owner-decision revision, the core distinctions in R01, R02, R03 and R05 were reconfirmed on September 12, 2026, including R01’s development-stage licensing guidance; the remaining research entries were not reverified. No outside research or re-verification was performed in this approval finalization; the dated findings are carried forward unchanged and require revalidation before the applicable use or release. These public-page checks do not complete any professional review or establish permission. The content audit identifies observed examples and unreviewed scope; it is not a certified, exhaustive verse/word count or a visual proof of every source page. Referenced but unavailable standalone leader, Field Guide, website, course/video and NIV-registry assets are not presumed reviewed. Existing copyright notices are evidence of notice text only, not proof of permission.

<a id="RIGHTS-B0023"></a>
[OD; D01–D02] A recorded permission may be narrower than a product intention. Seek a compatible grant, narrow the affected feature or keep it off. Do not “resolve” an incompatibility by silently rewriting governing doctrine, autonomy, privacy, Blueprint ownership, pricing or Compass benefits. A proposed change outside P1-09 returns to its own governing workstream.

<a id="RIGHTS-B0024"></a>
### 1. Scripture and publication use-case inventory

<a id="RIGHTS-B0025"></a>
[IM] Maintain each row as a distinct inventory entry, with its own artifact or feature ID and links to §10. Types: S static quotation; D dynamic quotation; U user-specific quotation; R reference only; P original summary/paraphrase/commentary; X potential onward distribution or sublicensing. Multiple types can apply. Classification is not permission.

<a id="RIGHTS-B0026"></a>
Routes: REF reference/original-content review; PUB individual static-publication assessment under §3; DIG specific digital/display/download scope review; AI direct AI/app scope under §4; USER participant-input handling under §6; GROUP organization/distribution review under §16; OFF deferred. An inventory row does not turn on a feature.

<a id="RIGHTS-B0027"></a>
#### 1.A Static printed materials

<a id="RIGHTS-B0028"></a>
| ID / use | Type | Rights route / required distinction |
| --- | --- | --- |
| UC-A01 Published book | S/R/P/X | PUB; sale, edition, territory and commentary classification. |
| UC-A02 Field Guide | S/R/P/X | PUB; separate publication, not covered merely by the book. |
| UC-A03 Six-week participant guide | S/R/P/X | PUB + GROUP; study classification and reproduction quantities. |
| UC-A04 Leader guide | S/R/P/X | PUB + GROUP; separate leader text and reprint rights. |
| UC-A05 Workbook | S/R/P/X | PUB; blank response space does not create quotation headroom. |
| UC-A06 Assessment / check-in | S/R/P/X | PUB; identify exact quotation separately from faith-related questions. |
| UC-A07 Downloadable PDF printed later | S/R/X | PUB + DIG; download and end-user print both need scope. |
| UC-A08 Printed personalized Blueprint | U/S/R/P/X | AI + DIG if generated/retrieved; REF launch rendering. |
| UC-A09 Church handout | S/R/P/X | GROUP; local non-saleable material differs from a commercial resource. |
| UC-A10 Marketing collateral | S/R/P/X | PUB; promotion is not automatically private noncommercial use. |

<a id="RIGHTS-B0029"></a>
#### 1.B Static digital materials

<a id="RIGHTS-B0030"></a>
| ID / use | Type | Rights route / required distinction |
| --- | --- | --- |
| UC-B01 Website page | S/R/P/X | DIG; page and platform relationship; notices in actual view. |
| UC-B02 Downloadable PDF / eBook | S/R/P/X | PUB + DIG; persistent copies differ from display-only access. |
| UC-B03 Email | S/R/P/X | PUB + DIG; transmission, forwarding and campaign aggregation. |
| UC-B04 Online course lesson | S/R/P/X | DIG; lesson and program scope; surrounding commentary. |
| UC-B05 ForgedLife-hosted study | S/R/P/X | DIG; actual host/entity and platform permissions, no assumed sync. |
| UC-B06 MJG digital resource | S/R/P/X | PUB + DIG; resource-specific scope and distribution. |
| UC-B07 Digital participant guide | S/R/P/X | PUB + DIG + GROUP; no automatic equivalence to print. |

<a id="RIGHTS-B0031"></a>
#### 1.C Personalized Blueprint outputs

<a id="RIGHTS-B0032"></a>
| ID / use | Type | Rights route / required distinction |
| --- | --- | --- |
| UC-C01 Free Blueprint export | U/S/R/P/X | REF launch; exact text only under cleared export route. |
| UC-C02 Full Blueprint export | U/S/R/P/X | Same rights policy as Free, not broader because paid. |
| UC-C03 My North Star | U/S/R/P/X | Approved short reference within one-page design. |
| UC-C04 Life Verse / Guiding Scripture | U/R/S | Participant selection and rights approval are independent. |
| UC-C05 Approved Scripture-related content | U/P/S/X | Keep personal significance separate from third-party verse text. |

<a id="RIGHTS-B0033"></a>
#### 1.D Steward AI conversation

<a id="RIGHTS-B0034"></a>
| ID / use | Type | Rights route / required distinction |
| --- | --- | --- |
| UC-D01 Steward proactively quotes | D/S | AI; disabled exact-text initiative at reference-only launch. |
| UC-D02 Participant asks for a verse | D/U | AI; request does not confer permission. |
| UC-D03 Participant asks for a passage | D/U | AI; length and whole-book controls, no memorized reconstruction. |
| UC-D04 Multiple verses in one conversation | D/U | AI; applicable aggregate unit, not a reset each turn. |
| UC-D05 Devotional-style exchange | D/U/P | AI when using licensed text; original reflection is not an NIV quotation. |
| UC-D06 Scripture explanation | P/R/D | REF with independently authored explanation; AI rights if NIV is source input. |
| UC-D07 Paraphrase versus verbatim | P/D | Distinguish original explanation from disguised near-verbatim text. |
| UC-D08 Prayer / reflection using biblical wording | P/D/U | Review embedded quotation and allusions; no divine-authorship claim. |

<a id="RIGHTS-B0035"></a>
#### 1.E Application and database use

<a id="RIGHTS-B0036"></a>
| ID / use | Type | Rights route / required distinction |
| --- | --- | --- |
| UC-E01 Stored verse text | S/D/U | AI/DIG; storage, backup and provider-processing scope. |
| UC-E02 Cached verse text | D | DIG/AI; contract-specific refresh, purge and expiry. |
| UC-E03 Dynamic retrieval | D/U | AI; approved service and application authorization. |
| UC-E04 Bible API connection | D/X | Vendor plus underlying translation grant; no API-key inference. |
| UC-E05 User-selected favorite verse | U/R/S | Store reference first; text needs independent rights. |
| UC-E06 Search / browse | D/X | OFF; not an incidental quotation feature. |
| UC-E07 Scripture lookup feature | D/U | OFF until explicitly scoped and licensed. |
| UC-E08 Offline storage | S/D/X | OFF unless actual contract authorizes offline copies. |

<a id="RIGHTS-B0037"></a>
#### 1.F Church and sponsored use

<a id="RIGHTS-B0038"></a>
| ID / use | Type | Rights route / required distinction |
| --- | --- | --- |
| UC-F01 Compass | S/D/U/R/P/X | GROUP + relevant publication/app routes; benefits are not licenses. |
| UC-F02 Another church / ministry | S/D/U/R/P/X | New organization and actual distribution review. |
| UC-F03 Leader materials | S/R/P/X | Separate source clearance; no access to participant private content. |
| UC-F04 Projection / slides | S/R/X | GROUP; local projection differs from recording/livestream. |
| UC-F05 Group handouts | S/R/P/X | GROUP; count/distribution and onward reuse. |
| UC-F06 Participant exports | U/S/R/P/X | Participant-only route; sponsorship does not create leader access. |

<a id="RIGHTS-B0039"></a>
#### 1.G Commercial overlay — applies in addition to the channel

<a id="RIGHTS-B0040"></a>
| ID / use | Type | Rights route / required distinction |
| --- | --- | --- |
| UC-G01 Free product | R/P/S/D/X | No-price participant access is not proof that the service is noncommercial. |
| UC-G02 Paid Full Build | U/R/P/S/D/X | Commercial scope; entitlement does not widen text rights. |
| UC-G03 Paid Steward subscription | U/R/P/S/D/X | Commercial AI/app scope and authorized ongoing outputs. |
| UC-G04 Sponsored access | U/R/P/S/D/X | Disclose sponsor payer and benefits to licensor. |
| UC-G05 Commercial book / study | S/R/P/X | PUB; relevant exception/classification and territories. |
| UC-G06 Promotional excerpts | S/R/P/X | New asset/channel; book clearance is not universal marketing clearance. |

<a id="RIGHTS-B0041"></a>
#### 1.H Future / disabled uses

<a id="RIGHTS-B0042"></a>
| ID / use | Type | Rights route / required distinction |
| --- | --- | --- |
| UC-H01 Audio Bible playback | D/S/X | OFF; recording and performance/streaming rights. |
| UC-H02 Large Bible-reading library | D/S/X | OFF; corpus/library grant. |
| UC-H03 Bible search engine | D/X | OFF; search, extraction and reconstruction controls. |
| UC-H04 Voice reading / text-to-speech | D/X | OFF; text permission is not an audio grant. |
| UC-H05 Multiple translations | S/D/U/X | OFF; per-edition product and rights approval. |
| UC-H06 Verse-of-the-day feeds | D/S/X | OFF; serial/platform scope, delivery and marketing permissions. |
| UC-H07 Native app Bible module | D/S/X | OFF; platform, devices, offline and app-specific rights. |
| UC-H08 Scripture training / fine-tuning datasets | S/X | OFF; express training rights plus separate product/privacy approval. |

<a id="RIGHTS-B0043"></a>
### 2. Current NIV rights findings

<a id="RIGHTS-B0044"></a>
#### 2.1 Verified rule register

<a id="RIGHTS-B0045"></a>
[LR] Findings below are a September 12, 2026 snapshot, not a representation of executed rights. Specific applicable terms must be read together. Public permissions, a website’s access terms and a negotiated license are different instruments.

<a id="RIGHTS-B0046"></a>
| Rule ID / source | Verified finding |
| --- | --- |
| LR01 — R03 | Ordinary quotation: at most 500 verses, no complete biblical book, and less than 25% of the work’s total text. These are cumulative conditions, not alternatives. The ordinary rule specifies a verse ceiling, not a separate numeric word ceiling. |
| LR02 — R03 | The NIV FAQ requires a copyright notice on the title or copyright page. Commercial commentaries and other biblical reference works using NIV require written permission. A narrow local-church, non-saleable-media provision permits (NIV) after each quotation instead of a complete notice. |
| LR03 — R01 | General guidelines apply to a media platform as a whole. App/website text use requires written permission. Express Licensing is for wholly noncommercial, non-AI uses. Any Biblica content used with AI requires an express Biblica license. Only latest editions are offered. |
| LR04 — R01 | NIV commercial-print contacts: HCCP for U.S./Canada; Hodder for UK/EU/EFTA; Biblica elsewhere. Other commercial uses go to Biblica. Commercial definitions include fundraising premiums. Unrestricted social redistribution and unlicensed audio derivatives are not covered. Royalties depend on the request; development-stage licensing is generally not issued. |
| LR05 — R04 | Biblica’s online-service terms identify Biblica as NIV copyright owner and distinguish personal site access from reuse. They specify a notice on the appropriate opening/title/copyright location and on each webpage reproducing NIV. Website access is not a production corpus license. |
| LR06 — R02 | Publisher AI Policy v1.2, effective June 1, 2026, applies through a license, not by self-election. It restricts fully automated publication without meaningful human review unless Biblica expressly approves in writing. It also addresses commercial results, third-party exposure, secure hosting, fidelity, theological/role limits, AI disclosure, traceability and revocation. |
| LR07 — R05 | API.Bible currently states that NIV commercial use is not available through its advertised offering. The free plan excludes freemium/upsell uses. Its paid service pricing is not a quotation for Steward’s required NIV rights. |
| LR08 — R06 | API.Bible terms separate service access from third-party grants. They impose attribution, redistribution restrictions, web-app FUMS reporting, content refresh/removal duties and anti-copy/printing controls; training copyrighted/CC content needs written API and IP-holder consent. Individual channel, edition and license terms still apply. |
| LR09 — R07 / R08 | Current API.Bible FAQ says cached content must refresh at least every 30 days. Legacy documentation recommends 14 days and fewer than 500 consecutive cached verses. Do not treat legacy guidance as the operative contract or as an NIV storage grant; obtain a written, account-specific reconciliation. |
| LR10 — R09 | U.S. Copyright Office: fair use is fact-specific, not guaranteed by a fixed word/verse/percentage allowance. Educational or nonprofit status alone does not decide the result. This is distinct from a publisher’s voluntary quotation permission. |

<a id="RIGHTS-B0047"></a>
#### 2.2 Material fit questions, not implied permissions

<a id="RIGHTS-B0048"></a>
[OD / DL; D01, D04] Treat LR03 and LR06 as a direct-permission boundary for Steward, including uses of NIV as model input, retrieval context or evaluation material. It is not enough to suppress exact text in the final answer while using an uncleared NIV source upstream. “Participant requested it” is not an authorization route.

<a id="RIGHTS-B0049"></a>
[AP + OD; D01] SAF D02 preserves autonomous participant-facing conversation and approved safety-resource guidance without ordinary human approval in the moment. SAF D04 prohibits routine transcript surveillance/sampling. Ask Biblica for a written model compatible with these directions. Do not implement human review of ordinary private conversations as a licensing workaround. A compatible agreement could authorize bounded autonomous operation, but this standard does not predict that Biblica will grant it. [SAF D02/D04; R02]

<a id="RIGHTS-B0050"></a>
[OD / DL; D01] The AI policy’s doctrinal, identity/role, third-party-provider and oversight provisions require actual contract fit review against SF, OI4, SC3, PRIV and SAF. Do not import the Nicene Creed or a licensor’s additional theological conditions as amendments to the supplied Statement of Faith. Assess compatibility; leave the licensed feature off if it cannot operate within both sets of boundaries. [R02; SF; OI4 §2]

<a id="RIGHTS-B0051"></a>
[EV / DL] Broad electronic quotation wording coexists with specific app/website rules. Print-commercial routing and the ordinary quotation FAQ also differ in breadth. Ask the responsible licensor to resolve the exact product/channel classification rather than automatically applying the most permissive fragment. A general inspirational book may have an OQ route; a Scripture-centered commentary/reference product has LR02’s special trigger. “Study” or “workbook” in a title does not itself answer the classification question.

<a id="RIGHTS-B0052"></a>
[EV] Zondervan and HCCP permissions destinations were located but full-page requests returned access restrictions during this review. Their limited indexed information is not treated as a complete clearance analysis. R01/R03 supply the documented routing and public rules; obtain the current recipient’s applicable terms with the application. YouVersion is an identified Biblica partner, not a verified commercial AI/export permission for Steward. [R01; R12–R14]

<a id="RIGHTS-B0053"></a>
### 3. Static publication rules

<a id="RIGHTS-B0054"></a>
#### 3.1 Individual clearance routes

<a id="RIGHTS-B0055"></a>
[OD; D06] All new and materially revised Stewardship Blueprint / MJG publications and marketing assets receive a pre-publication Scripture-rights check, including books, Field Guides, participant/leader guides, workbooks, PDFs/eBooks, course lessons and emails. Use a light recorded review for reference-only/original-content assets and the full applicable review for exact Scripture quotations. Each gets a publication ID, responsible editor, final edition, channel/distribution description and a proportionate clearance record. Do not treat one book’s analysis as covering its workbook, companion videos, app ingestion or promotional excerpts. Books, studies, workbooks, participant guides, leader guides and other static publications use their applicable publication route; an independently valid static-use permission route does not depend on obtaining Steward’s AI/chatbot license. [OD-REV]

<a id="RIGHTS-B0056"></a>
[OQ] An ordinary-use clearance is available only when the responsible reviewer records that the actual final work fits LR01–LR05 as applicable, including special exceptions and the lawful text source. “No bespoke letter needed” is a documented outcome, not absence of rights review. Commercial sale does not itself erase all ordinary quotation permissions; equally, a free digital product does not establish eligibility. An uncertain study/commentary classification or website/app scope goes to DL rather than an owner legal guess.

<a id="RIGHTS-B0057"></a>
[DL] Obtain the required written grant before typesetting or distributing uses outside the verified ordinary route. The request identifies passages, full intended text, surrounding discussion, total text, edition, print run or digital distribution, price/free/sponsor status, countries and every output format. A book publisher’s own licensing arrangement must expressly cover this title/use; the author does not assume it extends to MJG/Steward.

<a id="RIGHTS-B0058"></a>
#### 3.2 Controlled editorial workflow

<a id="RIGHTS-B0059"></a>
[IM; D06] Reference-only/original-content assets receive a light recorded review of their classification, actual scope and final artifact. For exact Scripture quotation, the editor inventories quotation blocks and references, verifies exact text/edition against an authorized source, classifies commentary and paraphrase, calculates §13 counts, and submits the final artifact plus notice placement to the rights reviewer. The reviewer identifies either the applicable public permission with an applicability memorandum or a direct license/letter, then records conditions. The release operator compares the approved artifact digest with the distributable file and records the actual release decision separately.

<a id="RIGHTS-B0060"></a>
[IM] Preserve immutable prior edition manifests and new revision IDs. Changes in wording, quoted passages, commercial status, territory, source vendor, format or bundling reopen relevant checks. A typo-only correction can receive a documented limited review, not an unlogged overwrite. Printer-ready files, eBooks and PDFs must each carry the approved notices even when treated as one work under a confirmed license.

<a id="RIGHTS-B0061"></a>
[IM] Full verse/passage intention remains editorially important. Do not clip a verse merely to make the count pass. Use reference-only, seek permission or revise the publication transparently through its editorial process. An original allusion is not automatically converted into a full quotation; first classify it correctly. [BRIEF; §7]

<a id="RIGHTS-B0062"></a>
#### 3.3 Required publication evidence package

<a id="RIGHTS-B0063"></a>
[EV] For exact-quotation publications, required and not yet evidenced: publication/edition ID; actual final text/file digest; quote ledger and counting method; complete-book check; channel/geography/price/distribution scope; lawfully obtained source/edition; reviewer’s OQ finding or executed DL grant; exact notice version and placement proof; publisher/author/third-party clearance where applicable; approval and re-review trigger; release operator and date. A screenshot of a public policy is supporting evidence, not proof that this publication satisfies it.

<a id="RIGHTS-B0064"></a>
### 4. Autonomous Steward conversation model

<a id="RIGHTS-B0065"></a>
#### 4.1 Options and tradeoffs

<a id="RIGHTS-B0066"></a>
All four options preserve participant dignity and Scripture’s noncommercial spiritual status. Cost statements below are dependencies, not vendor quotes or approved budgets.

<a id="RIGHTS-B0067"></a>
| Option | Experience / usefulness | Rights and engineering assessment |
| --- | --- | --- |
| A — references by default; exact text on request | References and original explanation provide useful formation without a Bible reader. Exact-text requests would feel convenient. | Unmodified A is not accepted: an exact-text request cannot bypass LR03/LR06. A-modified keeps references/original explanation even then. Lowest licensing dependency; needs clean source ingestion, honest UX and output controls. No NIV text cache. |
| B — limited full NIV under approved dynamic policy | Natural full-verse conversation with accurate context; aligned with owner intent. | DL: autonomous use, quantities, attribution, model providers, persistence and exports must be explicit. Build bounded selection, counters, policy enforcement and audit. License cost unknown; ordinary print limits do not supply the dynamic scope. |
| C — licensed API / licensed corpus retrieval | Deterministic text and edition are easier to verify; useful for selected Life Verse and approved passages. | Delivery method, not standalone permission. Vendor plus underlying AI/export rights and privacy fit are prerequisites. API adds availability, telemetry, contract and caching dependencies; corpus adds storage/security burden. Current API.Bible offering is not a verified commercial NIV route. |
| D — references with external authorized reading; or separately licensed fixed cards | Participant can consult their Bible or a deliberately opened outside reader. Cleared fixed cards may later reduce generation error. | Link-out is not scraping, embedded preview, proxying or redistribution. Review destination/telemetry and no endorsement implication. Fixed cards still need exact-text and AI-connected-use scope. An alternate translation is not silently substituted. |

<a id="RIGHTS-B0068"></a>
#### 4.2 Approved launch posture — A-modified

<a id="RIGHTS-B0069"></a>
[OD / Appendix A, D01] Once separately authorized for real participants, Steward’s approved launch posture is accurate Scripture references, independently authored Stewardship Blueprint teaching/explanation, and personal application/reflection, without dynamically reproducing exact NIV text unless and until the applicable AI/app use is expressly licensed or otherwise authoritatively cleared. NIV remains preferred. A participant request for exact NIV text does not override rights restrictions; provide the reference and a brief, truthful limitation rather than an alternate translation or near-verbatim substitute. Suggested UX, not a theological statement: “The reference is Matthew 5:16. Exact NIV text is not enabled here. You can read it in your Bible; we can discuss what the passage means for the situation you described.” Do not place quotation marks or an NIV label on the explanation. [OD-REV]

<a id="RIGHTS-B0070"></a>
[AP + OD; D01] Do not introduce routine human transcript review or in-the-moment human approval to satisfy a publisher requirement. If an exact-NIV license cannot support Steward’s approved autonomous participant-facing model and privacy boundaries, keep that exact-text feature disabled rather than changing those governing models through P1-09. Reference-only Steward remains a legitimate product release posture when all other release gates are satisfied. No release is authorized here. [SAF D02/D04; PRIV; OD-REV]

<a id="RIGHTS-B0071"></a>
[IM] The reference-only route excludes uncleared NIV text from application retrieval, prompt context, embeddings, saved summaries, fixture collections and export templates. Build a controlled AI-serving derivative of approved SB materials that retains references and original teaching but excludes embedded third-party Scripture text without altering the governing originals. Record source/version, excerpt classification and editorial/theological approval. If an original summary itself depends on ingesting licensed text, that input route needs its own clearance; “paraphrase output” is not an exemption.

<a id="RIGHTS-B0072"></a>
[IM] For later B/C, prefer a reference-selection tool followed by deterministic application rendering over free generation of exact text. Where feasible, keep retrieved text out of the language model. Licensor must still confirm that this architecture’s association with the AI product is covered. Any model-processing route must name the real provider, endpoints, retention and third-party exposure permitted by both rights and PRIV.

<a id="RIGHTS-B0073"></a>
#### 4.3 Attribution, quantities and monitoring

<a id="RIGHTS-B0074"></a>
[IM] A rendered licensed text block carries an immutable text reference, edition, attribution-policy version and rights decision. Appendix B asks whether adjacent response attribution, persistent UI credits, opening notice and downloadable credits are all required. Do not assume persistent legal credits replace per-output requirements. The participant should not need to pay or navigate away to discover which translation was quoted.

<a id="RIGHTS-B0075"></a>
[IM] Quotation budgets use the licensor-approved measurement unit, whether work, application, platform or another expressly defined unit. No unverified “500 per chat,” “one free verse” or reset on login. Track minimal authorized use events and aggregate counts without building a private spiritual-interest dossier. Routine human conversation review is not introduced. Private incident evidence remains narrowly controlled under PRIV/SAF; negotiate reporting or reject an incompatible vendor. [PRIV O03–O10; SAF D04]

<a id="RIGHTS-B0076"></a>
[EV] API.Bible’s current and legacy cache guidance differs, and its contractual anti-copy/reporting requirements need a concrete fit assessment for permanent personal PDFs and private religious references. Resolve those issues before selecting it. Do not silently omit required vendor reporting or claim device IDs are anonymous merely because a vendor uses that label. [LR07–LR09; R06 §§12,14; PRIV]

<a id="RIGHTS-B0077"></a>
### 5. Personal Blueprint and Life Verse

<a id="RIGHTS-B0078"></a>
[AP] Participant agency governs selection. Steward may propose a reference where appropriate and ask whether it fits. A suggestion, passing mention, imported assessment, selected Bible edition or paid activation is not approval of a Life Verse. Store the approval against the precise reference/content version, and preserve an unresolved state honestly. [T4 §5, Page 3; OI4 §§3,6–7]

<a id="RIGHTS-B0079"></a>
[IM] Separate six cases: a selected reference; a licensed full NIV quotation; participant-entered verse wording; text retrieved by Steward; uploaded/pasted third-party content; and the participant’s own reflection. Each carries its actual source type. Participant ownership of the Blueprint does not turn the NIV wording into participant-owned intellectual property.

<a id="RIGHTS-B0080"></a>
[OD / Appendix A, D02] The canonical Personal Stewardship Blueprint preserves the participant-approved Scripture reference, preferred translation metadata where applicable, participant-approved personal significance/reflection, and applicable approval/provenance record. Permanent NIV verse-text storage is not required. Exact NIV text may appear in a Blueprint display/export only when the actual translation/edition, display/export, storage, download, print and continued participant possession are within a verified permitted/licensed scope. Otherwise render the approved reference and participant reflection without degrading Blueprint ownership or completeness. A display-only grant is insufficient for a persistent export. Free and Full use the same copyright policy; paid or sponsored access never expands Scripture rights. [OD-REV]

<a id="RIGHTS-B0081"></a>
[IM] Rendering at export does not erase licensing obligations or make the PDF ephemeral. Avoid persisting a full-verse copy in the canonical database when the only reason is layout convenience. If reproducibility requires a licensed payload or archived export, document that storage right, its lifecycle and its policy version. A retrieval timestamp is not permission.

<a id="RIGHTS-B0082"></a>
[AP + IM] Keep My North Star one page and preserve Free/Full architecture. Do not add an unapproved Bible appendix or silently truncate an authorized passage to force it into the layout. Use the approved reference-only rendering if full text/notice cannot fit the approved design; a proposed companion reading resource is separate future editorial work. A rights fallback changes presentation, not the participant’s chosen reference or approved personal meaning. [T4 §§3–5,13]

<a id="RIGHTS-B0083"></a>
### 6. Participant-provided Scripture text

<a id="RIGHTS-B0084"></a>
[OD / Appendix A, D04] Participant-pasted exact Scripture does not automatically become canonical Blueprint Scripture text or exported company-distributed Scripture. For the initial real-participant posture, preserve the reference where identifiable and appropriate, and the participant’s own approved reflection/significance. Do not automatically persist large copyrighted Bible passages, create a reusable company corpus, create embeddings/vector knowledge from pasted copyrighted Scripture without separately approved rights, automatically carry pasted text into Blueprint exports, or relabel participant-supplied text as verified NIV. Narrow private input handling, same-user display, storage, model context and formal data-access treatment remain subject to counsel/licensor/privacy review. Do not accuse a participant of infringement merely because they pasted Scripture. [OD-REV]

<a id="RIGHTS-B0085"></a>
[IM] A company terms clause covering uploaded content may obtain limited processing permission from the participant only to the extent the participant has those rights. It cannot manufacture third-party rights or ownership. Treat a translation label supplied by a participant as unverified until checked through an authorized route.

<a id="RIGHTS-B0086"></a>
| Input | Approved initial posture | Reuse / distribution boundary |
| --- | --- | --- |
| One verse | Accept reference/own reflection; minimize exact wording before downstream processing unless that input processing is cleared. No automatic permanent quote field. | Same-user rendering is distinct from publishing, but still requires reviewed terms/rights and privacy fit. No reusable corpus. |
| Short passage | Ask which reference or idea matters; do not auto-repeat the entire block. Keep only authorized transient content. | No default PDF/email/sharing inclusion; separately licensed route can later render canonical text. |
| Entire chapter | Offer reference-based discussion and relevant user-authored context. Avoid forwarding unnecessary chapter text to a model. | Do not republish chapter simply because it is supplied; large excerpt review. |
| Large excerpts / multiple chapters | Reject or minimize unsupported bulk import; request references. Do not build a chapter archive, vector index or searchable Bible. | No export, company reuse, training or evaluation ingestion by default. |
| Another translation | Keep claimed translation as unverified metadata; no relabeling as NIV or silent replacement. | Apply that translation’s actual policy if ever enabled; current translation preference remains unchanged. |

<a id="RIGHTS-B0087"></a>
[IM] Before launch, implement an input boundary that can enforce the selected posture without relying solely on a prompt. Provide a dedicated reference field and clear paste guidance, size controls, content classification, and a safe response when exact text cannot be processed. Review the classifier’s own data flow: it must not send an uncleared payload to another model merely to identify it. No unlicensed full-NIV detection corpus.

<a id="RIGHTS-B0088"></a>
[AP + IM] Apply PRIV’s session-only pilot and purpose-bound lifecycle, with exact retention periods supplied by that workstream—not invented here. Browser redisplay, application storage, provider logs, model context, support evidence and export are separate copies. Where same-user transient display is approved, escape active content and limit it to the authenticated participant; that does not authorize company reuse. Large text excluded from an export must be explained without deleting an approved reference or fabricating a reflection. [PRIV O03–O07/O10]

<a id="RIGHTS-B0089"></a>
[IM / RV] Formal privacy/data-access requests are not the same as ordinary Blueprint export. Route them through the existing rights-request procedure; counsel resolves third-party copyright and mandatory access duties. Do not use this policy to categorically deny statutory access or promise recall of files a participant already lawfully possesses. Built-in third-party sharing remains disabled under PRIV O07.

<a id="RIGHTS-B0090"></a>
### 7. Quotation, paraphrase and commentary

<a id="RIGHTS-B0091"></a>
[IM] Verbatim quotation is the precise authorized edition’s wording, distinctly displayed and accurately referenced. Reference identifies a passage without reproducing its text. Summary states the principal idea in original compressed language. Paraphrase restates meaning in independently composed wording, labeled as such. Commentary explains context or interpretation; it is not the biblical text. Personal reflection describes what the participant thinks or intends, with their approval where saved.

<a id="RIGHTS-B0092"></a>
[AP + IM] Do not alter a verse and call it NIV. Do not construct a near-verbatim “paraphrase,” synonym swap or translation blend to evade a rights rule. Do not turn an application into “God says you must…” or label generated prayer as Scripture. Distinguish biblical teaching, SB interpretation and optional personal application under OI4. [OI4 §3; SC3; BRIEF]

<a id="RIGHTS-B0093"></a>
[IM] Text verification must account for words, punctuation, verse spans, edition differences, capitalization, paragraph breaks and any publisher-supplied footnotes/headings. Headings and study notes may have separate rights and are not included merely because verse text is licensed. Typography changes require approved normalization rules and visual proof; corrections must not be guessed from model memory.

<a id="RIGHTS-B0094"></a>
[OD; D06] In participant-facing SB materials, prefer an entire selected verse or passage when authorized. An ellipsis, excerpt or truncated quotation requires an explicit editorial exception and rights review; never obscure omissions or change meaning. The general permission’s existence does not make every editorial truncation appropriate. Ordinary narrative allusions can remain original commentary when clearly identified; assess them rather than mechanically expanding every biblical phrase.

<a id="RIGHTS-B0095"></a>
### 8. Translation support framework

<a id="RIGHTS-B0096"></a>
[AP / OD; D03] NIV remains the preferred production translation where authorized. “NIV” alone is insufficient identification: record edition/text revision, language and regional variant. Do not assume old NIV wording or a similarly named reader’s version is the approved current edition. Public-domain status and easier permissions do not create a product decision to switch translations. [BRIEF; LR03]

<a id="RIGHTS-B0097"></a>
[IM] Future translation registration requires translation ID, edition, authoritative rights source, public-domain basis or permission/license, notice/brand rules, permitted channels, territories, quotation/storage/export/AI limits, evidence owner and release state. Other copyrighted translations require their own assessment. Creative Commons is licensed copyright, not synonymous with public domain; record attribution, commercial, derivative and share-alike conditions where relevant. [R06 §§4–5,28]

<a id="RIGHTS-B0098"></a>
[FD; D03] Multiple translations, automatic substitution, translation comparisons, original-language study tools and user-facing public-domain fallback remain off pending separate product, theological/editorial, rights, implementation and release approval. A participant may name another translation or discuss their own reflection without the application claiming it has enabled a licensed text service for that translation.

<a id="RIGHTS-B0099"></a>
### 9. Attribution and copyright notices

<a id="RIGHTS-B0100"></a>
#### 9.1 Notice-control rule

<a id="RIGHTS-B0101"></a>
[IM] Do not invent a universal NIV notice or silently normalize competing official forms. R03, R04 and a vendor/license can specify different wording and locations. Register the exact operative notice and metadata for the actual grant and edition. The review package must include the approved text, source URL/document, capture date, notice-policy ID and all mandatory placements. A notice does not prove rights exist.

<a id="RIGHTS-B0102"></a>
Controlled placeholder — not publishable: [INSERT EXACT CURRENT NIV COPYRIGHT / TRADEMARK NOTICE REQUIRED BY THE APPLICABLE LICENSOR GRANT, INCLUDING ANY REQUIRED LINK OR PROVIDER CREDIT.]

<a id="RIGHTS-B0103"></a>
[EV] This placeholder intentionally is not presented as official wording. The rights editor must replace it from the actual current source/license before any exact-NIV artifact is approved. A reference-only artifact must not display “used by permission” in a way that implies a nonexistent license. License and copyright notices need not be added to original commentary as though it were NIV text.

<a id="RIGHTS-B0104"></a>
#### 9.2 Placement requirements by channel

<a id="RIGHTS-B0105"></a>
| Surface | Required implementation / verified condition |
| --- | --- |
| Book / workbook / printed guide | Use the applicable title/copyright-page notice under LR02; adjacent translation identification per approved policy. Keep it in each separately cleared edition. |
| PDF / eBook | Preserve full approved notice in copyright/front/end matter; retain local reference/translation labels and any required page-level notice. A tiny footer is not automatically sufficient. |
| Website | Under applicable LR05 terms, full notice belongs on each page containing NIV, not only an unlinked credits page. A different executed grant must explicitly support alternate placement. |
| Course lesson / digital guide | Visible local attribution plus accessible credits; offline/downloadable versions must carry their own required notice. |
| Email | Notice must travel in the message/attachment as required; a website-only notice cannot be assumed to cover transmission. |
| App legal / credits | Versioned full licensor and provider notices; accessible from every relevant text view. Credits are not a substitute for required in-context labeling. |
| Individual AI response | Use the exact response-level format required by the licensed route. Persistent conversation attribution supplements rather than silently replaces it. |
| Blueprint export / participant print | Embed notices in the actual exported artifact so they survive viewing and printing; retain the reference, translation and rights-rendering manifest. |
| Church slides / handouts | LR02’s narrow local-church provision may apply only after actual-use review. Record when abbreviated treatment is justified. |
| API provider credit | Implement both underlying rights-holder and applicable vendor requirements. Resolve apparent plan-level versus general-term differences in writing before deployment. |

<a id="RIGHTS-B0106"></a>
[IM] Test mobile views, print styles, PDF conversion, page breaks, dark mode, copied text where enabled and accessible reading order. Do not hide notices behind clipped UI, use a publisher logo without permission or imply endorsement. If a required notice cannot render, fail the affected exact-text block and use a reference instead.

<a id="RIGHTS-B0107"></a>
### 10. Scripture / publication rights registry

<a id="RIGHTS-B0108"></a>
[IM] Use a small governed rights registry integrated with P1-01, separate from participant entitlements and sensitive records. A policy is a reviewed interpretation of evidence for a scope; it is not created by a model choosing a translation. Operational ownership must be assigned before release.

<a id="RIGHTS-B0109"></a>
| Field group | Required fields and semantics |
| --- | --- |
| Identity | rights_policy_id; policy_version; translation_id; edition/text_revision; language/variant; rights_holder; authorized_licensor; contracting_entity; responsible_owner. |
| Basis and evidence | permission_type: reference_only / ordinary_quoted_use / executed_license / verified_public_domain / other_reviewed_basis; executed_permission_or_license_id when applicable; evidence_file; official_source; captured_at; reviewer and finding. Null executed ID for OQ is explicit, not fabricated. |
| Time | effective_date; expiration or documented none; suspension/revocation state; re_review_date; triggering events; superseded_policy; operational rights_epoch. |
| Scope | permitted_products; publication/edition IDs; channels; geography; audience/commercial model; print/distribution scale; platform/work unit; allowed organizations/affiliates. |
| Quantity | quote_limit_basis; permitted quantity/percentage; counting_method; complete_book_rule; cumulative unit; repeated/partial treatment; applicable reserve and enforcement parameters. |
| Notices | exact attribution_text; attribution_version; approved source; required locations; links; provider credits; trademark/endorsement restrictions. |
| Delivery | api_vendor; actual agreement/account/Bible ID; approved retrieval_source; cache/storage/offline/backup rights; refresh/purge obligations; source correction policy. |
| AI and privacy | AI_input_rights; AI_output_rights; autonomous_use_exception; provider/third-party-processing permissions; inference versus embedding/training/evaluation scope; permitted telemetry; applicable privacy fit. |
| Distribution | export/download/print permission; email permission; sublicense/redistribution limits; church distribution; participant possession after expiry; downstream notices and removal limitations. |
| Release | approval state; implementation reference; test evidence; publication clearance; released feature flag; scope-specific release authorization. Default deny when incomplete. |

<a id="RIGHTS-B0110"></a>
[IM] Policy states: DRAFT, REVIEW_REQUIRED, REFERENCE_ONLY, CLEARED_ORDINARY_SCOPE, LICENSED_SCOPE, SUSPENDED, EXPIRED, REVOKED. A reviewed public-domain basis uses its own policy subtype. Only a reviewed state plus active, implemented scope can authorize exact text. Business approval and licensor authority are separate signatures. Never mark a public-permission analysis “executed license.”

<a id="RIGHTS-B0111"></a>
[EV] Initial inventory state: NIV dynamic/app/export exact-text rights NOT EVIDENCED; OQ publication determinations OPEN for the identified source editions; reference-only implementation NOT TESTED. A reference-only record does not claim Biblica licensed Steward. Public research pages can be preserved as dated evidence, subject to lawful internal records handling; no wholesale Scripture corpus is needed.

<a id="RIGHTS-B0112"></a>
### 11. Scripture content object — approved implementation specification for Jeremy

<a id="RIGHTS-B0113"></a>
[IM] Extend existing canonical content/proposal/export structures rather than introducing a general Bible database. Keep the canonical reference independently meaningful when text retrieval is disabled. The object below is an approved schema specification within this standard’s scope, not evidence that the application has it.

<a id="RIGHTS-B0114"></a>
| Field | Purpose / default |
| --- | --- |
| scripture_object_id; object_version | Stable private content identity; versioned changes and approval scope. |
| scripture_reference | Normalized book/chapter/verse range(s), plus participant display form; valid reference is not approval or translation permission. |
| translation_id; edition | Desired/approved edition identity; nullable for a translation-unspecified reference. No guessed conversion. |
| source_type | participant_reference / participant_paste / licensed_retrieval / approved_editorial_quote / original_reflection; preserve actual provenance. |
| rights_policy_id; rights_policy_version | Link to reviewed rights basis; application rechecks current status at use time. |
| text_payload; payload_digest | Null by default; present only for explicitly authorized persistence. Digest is not proof of permission or privacy anonymity. |
| retrieval_source; retrieved_at | Authorized vendor/corpus identifier and time when actually retrieved. Do not populate simulated success. |
| attribution_policy | Versioned notice requirements bound to actual text/source and channel. |
| participant_approved; approval_receipt_id | False until actual scoped approval; reference approval is separate from reflection/text changes. |
| personal_significance | Participant-authored or approved explanation, separate from copyrighted verse text. |
| export_permission_state | REFERENCE_ONLY / EXACT_ALLOWED_FOR_SCOPE / BLOCKED_PENDING_REVIEW; recomputed for target artifact. |
| retention_class; copy_lineage | Applicable PRIV/P1-01 class, expiry/removal hooks, export copies and authorization fence; no new indefinite retention. |

<a id="RIGHTS-B0115"></a>
[IM] Prefer licensed retrieval at the point of display/export over permanent text copies, when a suitable contract supports it. Persist a payload only for an authorized need with explicit storage scope; cache eligibility does not automatically authorize long-term canonical storage. Backups, revisions and generated PDFs are copies with separate lifecycle consequences. Do not create embeddings or save all retrieved passages “for performance” without permission.

<a id="RIGHTS-B0116"></a>
[IM] The reference can remain selected after exact-text rights lapse. Disable only the unauthorized rendering, keep the participant’s original approval and significance, and show a neutral explanation. A restored database must reconcile current rights states before serving old text-bearing objects. [P1-01; PRIV]

<a id="RIGHTS-B0117"></a>
### 12. AI tool and retrieval boundary

<a id="RIGHTS-B0118"></a>
[IM] The application—not the model—selects the allowed translation, exact-text scope, length, attribution and export behavior. Natural-language requests and model-proposed tool arguments are untrusted. Suggested operations:

<a id="RIGHTS-B0119"></a>
| Operation | Contract / denial behavior |
| --- | --- |
| get_scripture_reference | Parse/validate a reference without fetching text; return canonical location, uncertainty and approval proposal, never invented verse wording. |
| get_scripture_rights_policy | Evaluate product, channel, territory, operation, participant access and current policy/rights epoch. Return permitted action or structured denial, not a generic “NIV allowed.” |
| retrieve_licensed_scripture | Only after server authorization; allowlisted source, bounded range, edition and policy. Return exact payload, provenance and attribution to the approved renderer; to a model only when separately cleared. |
| render_scripture_for_export | Re-evaluate current export/download rights, approval and document budget. Produce licensed text with notices or reference-only representation and a manifest explaining the result. |

<a id="RIGHTS-B0120"></a>
[IM] Execution order: authenticate and authorize private content; validate the participant-approved reference or proposal; resolve target use and rights; reserve any applicable quotation budget; retrieve only the allowed range; validate actual returned span/edition; render deterministic exact text or original reference-based response; verify notices; record a minimal rights event. Recheck at dispatch and final delivery, including queued export jobs. Reserve/commit must be atomic and idempotent; retries must not create extra unauthorized distribution or lose the count.

<a id="RIGHTS-B0121"></a>
[IM] Neither model memory nor an internet search is the licensed retrieval route. No scraping Bible sites, importing a public GitHub NIV corpus, arbitrary URL fetch, chapter-by-chapter reconstruction or using user-pasted text as a substitute service. Denied exact-text output must not be recovered by asking another model/provider. Outage, missing metadata or unclear span returns an honest reference-based fallback, not reconstructed NIV.

<a id="RIGHTS-B0122"></a>
[IM] Enforce a model-output boundary: structured reference fields, instruction tests, bounded text checks using authorized fixtures, anti-continuation and multi-turn extraction tests, and safe replacement when output violates policy. Prompt instructions alone are not release evidence. Do not build an unlicensed NIV comparison corpus to implement the detector. If reliable containment cannot be demonstrated for the enabled route, keep that route disabled; scope escalation follows §23.

<a id="RIGHTS-B0123"></a>
### 13. Quotation tracking and counting

<a id="RIGHTS-B0124"></a>
[LR / IM] LR01 supplies the ordinary numerical conditions; it does not provide a complete algorithm for repeat quotations, partial verses, pagination, denominator exclusions or edition aggregation. LR03 supplies the media-platform unit. The licensor/reviewer must settle ambiguous counting bases before a marginal publication or dynamic route relies on them. Do not turn an engineering convention into a claimed publisher rule.

<a id="RIGHTS-B0125"></a>
[IM] For every publication track: publication ID; edition/revision; parent program/platform; channel variants; translation/edition; block ID and location; canonical verse ranges; complete versus partial text; unique verse count; all verse occurrences; quoted Scripture word count; total publication text word count; counting-method version; percentage; complete-book coverage; source; attribution version; permission ID; final artifact digest.

<a id="RIGHTS-B0126"></a>
[OP] Pending clarification, count every appearance of a quoted verse toward the internal screening total, including a partial verse, while also retaining the unique-verse total. This is a conservative company screen, not a legal definition or final licensor calculation. Detect whole-book reconstruction across separated blocks, not just a single continuous extract. Unknown references or unclassified quotations fail preflight rather than counting as zero.

<a id="RIGHTS-B0127"></a>
[IM] For a word-based operational calculation, use:

<a id="RIGHTS-B0128"></a>
quoted Scripture words ÷ eligible total words of the work × 100

<a id="RIGHTS-B0129"></a>
[IM] Record whether the reviewer/licensor accepts words as the “total text” measure for this use and what belongs in the denominator. Track all repeated quotation words. Do not inflate totals with blank worksheets, unfilled participant answers, menus, repeated boilerplate, imaginary future content or irrelevant AI padding. A Scripture graphic with a few surrounding words can fail a percentage condition despite quoting very little.

<a id="RIGHTS-B0130"></a>
[IM] Use exact arithmetic at the threshold; a rounded display must not turn a prohibited boundary into a pass. A final work at 25% is not within LR01’s less-than condition. Count changed editions again; do not average a short quote-heavy handout with a long book to justify it without a confirmed whole-program basis. Keep both per-artifact and parent manifests so separate downloads, print/eBook versions and platform totals can be assessed correctly.

<a id="RIGHTS-B0131"></a>
[IM] Dynamic budgets remain unconfigured until the agreement identifies the unit, period, aggregation and repetition rules. Counters are rights controls, not participant-engagement analytics. Minimize identifiable reference histories and use privacy-reviewed aggregate counters where sufficient. [PRIV; SAF D04]

<a id="RIGHTS-B0132"></a>
### 14. Blueprint export, download and continued ownership

<a id="RIGHTS-B0133"></a>
[AP / OD; D02] Apply the same copyright policy to Free and Full. Payment, a retained Full qualification, complimentary access or sponsor funding does not widen Scripture rights. Use the participant’s approved reference and original significance when exact text is not authorized; preserve the remainder of the Blueprint without degrading its ownership or completeness. This changes the rendering, not the participant’s chosen reference or approval history. [T4 §§5–7, 10, 13; PJ; COM]

<a id="RIGHTS-B0134"></a>
| Output | Approved initial posture |
| --- | --- |
| Free Blueprint PDF / Full Blueprint PDF | Secure self-export; reference-only Scripture by default. Exact text requires a verified, channel-specific route and final artifact preflight. Preserve the three-/thirteen-page architecture. |
| My North Star / participant print | Use the approved reference and concise personal anchor within the one-page overview. Do not shrink or truncate quoted Scripture to force it onto the page; seek a reviewed layout or retain the reference. |
| Email attachment | No new company email-attachment feature is enabled. Initial privacy scope is secure self-export, not automated delivery of private Blueprints through email. Any later exact-text attachment also needs transmission rights. |
| Participant self-export and later sharing | The participant can retain the authorized exported form. Explain applicable third-party restrictions without implying ownership of NIV. Voluntary sharing outside Steward is not a built-in company sharing integration or a blanket republication license. |
| Church handout / leader resource export | Separate organization/publication artifact and rights review. A leader role cannot export a participant’s private Blueprint. Group materials are not cleared by sponsor entitlement. |
| Existing text-bearing export after a rights change | Reassess new delivery, regeneration and stored copies against the actual grant and legal duties. Preserve a usable reference-based view. Do not promise to recall copies already downloaded or promise perpetual NIV delivery contrary to a contract. |

<a id="RIGHTS-B0135"></a>
[IM] An export manifest binds participant/content version, template version, rights-policy version, exact quotation inventory, notice version and output digest. Recheck authorization when a queued job renders and when it is delivered. Do not append an unapproved fourteenth Full page or fourth Free page merely to solve a notice problem. If the required notice and authorized whole passage cannot fit the approved architecture legibly, use references pending an approved layout solution. [T4; PRIV O07; §§9, 11–13]

<a id="RIGHTS-B0136"></a>
### 15. Website and marketing publication

<a id="RIGHTS-B0137"></a>
[OP] Prefer original SB copy and accurate references for the initial homepage, landing pages, Created for More funnel, email campaigns, paid advertisements, social graphics, book-sales pages and church-campaign pages. An exact NIV quotation goes through the actual channel’s clearance process. A cleared book excerpt is not automatically cleared for a downloadable social graphic, paid ad or serial email campaign. Platform-wide accounting and redistribution questions belong in the request, not an assumption that each post starts a new allowance. [LR03–LR05; §§2–3, 13]

<a id="RIGHTS-B0138"></a>
[IM / OD; D06] Before publication of every new or materially revised asset, the content team records a proportionate review using five checks: asset and scope (edition, platform, audience, commercial purpose); content classification (reference, exact quotation, original explanation, testimonial); rights and quantities (source, permission and current ledger where applicable); visible credit and fidelity (approved wording, labels, accessible layout); and final proof (reviewer, file/page digest, distribution and re-review trigger). Reference-only/original-content assets receive a light recorded review; exact quotation requires the full applicable evidence. A social graphic’s small size is not a permission basis. A landing page must not suggest that a paid tier provides closer access to God or greater spiritual worth. [BRIEF; PJ; OD-REV]

<a id="RIGHTS-B0139"></a>
[OD; D05] No marketing claim may say exact NIV is coming or licensed until actual evidence supports that claim. Preparation, early scoping contact or a pending production-license application does not establish future availability, a grant or an approved timetable. [OD-REV]

<a id="RIGHTS-B0140"></a>
[IM] Testimonials require the participant’s separate applicable consent and rights review. A participant’s quoted testimony that embeds Bible wording does not remove the third-party issue. Keep their own words distinguishable from Scripture. Do not silently alter a testimonial, claim Biblica endorsement or use a publisher’s logo as evidence of a relationship. Review linked resources separately; a link is not authority to scrape, frame or republish their content. [PRIV; LR06; §17]

<a id="RIGHTS-B0141"></a>
### 16. Church, Compass and group materials

<a id="RIGHTS-B0142"></a>
[AP / OP] Preserve Compass benefits and current sponsor privacy boundaries. Approved participant access starts on actual post-study activation and runs for 60 calendar days with Full included; the approved leader/facilitator benefit is 12 calendar months from activation, with Full if needed. These commercial/product promises do not convey Scripture rights or a church’s right to reproduce MJG resources. They also do not establish that Compass has launched. [PJ §16.8; COM, Compass configuration]

<a id="RIGHTS-B0143"></a>
[LR / DL] The narrow non-saleable local-church notice provision in LR02 is not a general exemption for nonprofit organizations, paid studies, sponsor-funded apps or materials supplied by a commercial publisher. Assess participant guides, leader guides, slides, handouts, projection and downloadable files individually. Projection at a meeting, recording that meeting, livestreaming it and distributing its slide deck are different uses. No recording or audio right is inferred from permission for printed quotations. [R03; §§1, 3, 9]

<a id="RIGHTS-B0144"></a>
[IM] Each group package needs an actual material list, permitted copy/distribution terms, license holder, territory and notice instructions. The church agreement must not promise sublicense rights the company lacks. App-delivered church content follows the same AI/digital restrictions as retail content. Sponsored users do not use a less restrictive rendering policy; leaders receive no private-content feed. Existing licensed church arrangements must be produced and matched to the actual text/use, not assumed from membership or sponsorship. [PRIV O08; COM; §§10, 14]

<a id="RIGHTS-B0145"></a>
### 17. AI-generated language and third-party copyright

<a id="RIGHTS-B0146"></a>
[LR] The U.S. Copyright Office distinguishes human-authored expression from material generated by AI. Human selection, arrangement or modification may be protectable when sufficiently creative; prompts alone do not establish authorship of the resulting expression. AI assistance does not automatically eliminate protection in the human-authored portions. These principles do not decide ownership of a particular Blueprint or replace contract/counsel review. [R10]

<a id="RIGHTS-B0147"></a>
[OP] Separate four layers: the participant’s original contributions; company framework/template material; AI-assisted reflections, prayers, summaries and explanations; and third-party Scripture or other embedded material. Participant approval is product assent, not automatically copyright authorship or acquisition of a translation’s rights. Do not promise that every generated sentence is exclusively copyrightable, unique or free of third-party claims.

<a id="RIGHTS-B0148"></a>
[OP — proposed Terms principle for counsel] The participant retains their rights in their original contributions and receives the approved ability to retain and use their Blueprint. Third-party material remains subject to its own rights and permitted uses. The company does not transfer ownership of NIV text. This is a drafting principle, not approved contract language or a reduction of existing Blueprint continuity promises. [T4; PJ; COM; R10]

<a id="RIGHTS-B0149"></a>
[IM] Original prayer and reflection should use their own expression, with any Scripture reference identified. Detect and route recognizable quotation rather than labeling it original merely because an AI produced it. Exact Scripture inside a prayer is still exact Scripture. An explanation must not be presented as a new verse, a Biblica-authored interpretation or direct revelation. [OI4 §3; SC3; §7]

<a id="RIGHTS-B0150"></a>
### 18. Training, evaluation, research and source ingestion

<a id="RIGHTS-B0151"></a>
[AP] Participant-content training, research, fine-tuning and evaluation remain prohibited by default under PRIV. A publisher’s Scripture license cannot waive participant privacy, and a participant’s consent cannot grant the publisher’s rights. Both independent requirements must be satisfied for any later proposal. Nothing here enables such use. [PRIV O10; SAF]

<a id="RIGHTS-B0152"></a>
[OD / IM; D01, D04] Do not build an NIV training corpus, unlicensed retrieval collection, vector index or large-passage evaluation dataset. Do not send embedded NIV passages from an SB manuscript to a model simply because the surrounding manuscript belongs to the company. Use a separately reviewed AI-serving derivative containing canonical references and original SB explanation, with third-party quotation blocks excluded unless explicitly cleared. Preserve the governing originals; record derivative provenance and review. [§§4, 12; LR03/LR06/LR08]

<a id="RIGHTS-B0153"></a>
[IM] Synthetic tests use fictional participant records, references and original test strings. Where exact Bible text is necessary to test a renderer, use a separately documented licensed or verified public-domain fixture, unmistakably labeled as a test translation. Small fixture scope does not waive vendor/source terms. Keep authorized QA material out of training exports and public repositories. Test telemetry must not become an unlicensed text archive or a source of private religious profiles.

<a id="RIGHTS-B0154"></a>
### 19. Public-domain fallback and future participant choice

<a id="RIGHTS-B0155"></a>
[OD; D03] Do not expose a public-domain or alternate Bible translation as an automatic participant-facing fallback merely because exact NIV rights are unavailable. Initial production fallback is REFERENCE + ORIGINAL STEWARD EXPLANATION, not another translation. NIV remains the preferred production translation where authorized. Reviewed public-domain Scripture may be used for isolated internal/synthetic engineering fixtures only when clearly labeled and technically prevented from entering participant-facing NIV paths. Any future participant translation choice or multi-translation experience requires separate product, theological/editorial, rights, implementation and release approval, with per-edition rights records and appropriate notices. [OD-REV; §8]

<a id="RIGHTS-B0156"></a>
[LR / OP] The official World English Bible source declares its text public domain and identifies the Classic text as stable since 2020. That supports considering a clearly identified internal test fixture, not automatic selection as SB’s production translation. Its name/trademark, altered-text labeling, edition and source must still be handled accurately; a provider’s API terms can impose conditions separate from the text’s status. [R11; R06]

<a id="RIGHTS-B0157"></a>
[IM] Public-domain review is geographic and edition-specific. It does not automatically cover editorial notes, artwork, audio, proprietary tagging, other translations or a vendor’s database. Internal fixtures must never leak into participant-facing NIV fields. A failure to obtain NIV permission does not authorize an emergency translation-switching feature.

<a id="RIGHTS-B0158"></a>
### 20. Licensor contact package

<a id="RIGHTS-B0159"></a>
[OD / EV; D05] Appendix B is the approved working question package for a formal commercial NIV AI/app rights discussion with Biblica and the appropriate commercial-print permissions partner, subject to confirming the actual contracting entity and rights contact. It has not been sent and no answer or agreement to autonomous use is represented as received. Prepare the complete inquiry/application package now. An early rights/scoping contact may occur now to explain the autonomous Steward use case and obtain direction; it is distinct from a formal production-license application. [OD-REV]

<a id="RIGHTS-B0160"></a>
[LR / OD; D05] Biblica’s public guidance generally defers licensing development-stage products/software. Prepare a reference-only functioning demonstration, product/data-flow description, sample outputs and actual legal-entity information. Submit the formal production-license application when Biblica indicates sufficient product development, or when readiness reaches the appropriate point under its then-current process; do not assume premature submission is appropriate. Proposed terms, fees, royalties or commitments return for separate authorized commercial/legal review before execution. D05 sets out the complete timing direction. Exact NIV AI/app rights must still be resolved before exact-text functionality is enabled. [R01, development-stage guidance; OD-REV]

<a id="RIGHTS-B0161"></a>
[IM] Preserve the request, response, attachments, signatory authority, actual legal entity and final grant in the registry. A pending application, invoice, general API account or unanswered email is not permission. Reconcile direct-holder, publisher and API terms before activation; do not choose the most permissive clause from unrelated instruments. [§§2, 10; Appendix C]

<a id="RIGHTS-B0162"></a>
### 21. Current SB source audit

<a id="RIGHTS-B0163"></a>
[EV] Appendix F is a revision queue based on observed source content, not a declaration that the publications are cleared. Categories are: A reference only, likely lower reproduction burden; B NIV full text present, permission/fidelity review required; C inconsistent translation, confirmed issue or clearly identified verification candidate; D shortened quotation conflicting with the intended whole-verse direction, subject to first distinguishing genuine quotation from allusion; E substantial or collected quotation requiring rights analysis; F no Scripture-rights issue identified in the reviewed material. Unavailable/unreviewed content is an evidence gap, not category F.

<a id="RIGHTS-B0164"></a>
[EV] The most concentrated identified collection is Fully Engaged: its six dedicated weekly Scripture sections contain 21 cited passage blocks covering 51 distinct verse identifiers. This is a count of the listed ranges in those sections only, not a final whole-publication occurrence count, verified word count, percentage calculation or permission finding. The TLYB manuscript’s copyright page expressly leaves Scripture permissions language for a later formal audit. The Legacy Standard itself includes two full NIV verses; its referenced wider lesson package and NIV registry require separate inspection. [FE pp.8, 14, 20, 26, 32, 38, 46; BOOK copyright page; LG pp.2, 6]

<a id="RIGHTS-B0165"></a>
[EV] No confirmed alternate-translation mismatch is established by the targeted review. Unlabeled quotations and typography are verification candidates, not proof of a different translation. No document is rewritten in this workstream. Final production preflight must inspect all text, tables, images, notes and final layouts, then reconcile the complete quotation ledger. Embedded images cannot be cleared by a text search alone.

<a id="RIGHTS-B0166"></a>
### 22. Staged publication and participant release policy

<a id="RIGHTS-B0167"></a>
[OP] The levels below are rights envelopes that supplement, not replace, SAF’s governing P1-10 release process. A publication release and an application/real-participant release require their own applicable evidence. Static publication can proceed only through its own later clearance; this standard authorizes neither.

<a id="RIGHTS-B0168"></a>
| Level | Permitted direction only after applicable authorization | Open rights / release evidence |
| --- | --- | --- |
| 0 — INTERNAL / SYNTHETIC | References and original content; separately cleared licensed/public-domain fixtures where needed. No production NIV corpus. | Source/fixture provenance, synthetic isolation and tested denial of disabled routes. No real participants. |
| 1 — NONPAID PILOT | Reference-only autonomous conversations and exports unless a specific exact-text use is actually cleared. Free access is not a rights waiver. | P1-09 reference-only review, privacy/security/provider fit, tests and full P1-10 authorization. Preserve Arizona/adult and actual pilot limits. |
| 2 — PAID | Only actual commercially cleared exact-text routes, or an authorized reference-only product. | Enabled commercial use evidence plus applicable COM payment, entitlement, tax, refund and customer-policy gates. |
| 3 — SPONSORED / COMPASS | Program-specific access and separately cleared materials, display and distribution. | Actual sponsor/material agreements, privacy separation, rights scope and P1-10/COM gates; no inherited church sublicense. |
| 4 — BROADER PUBLIC | Only approved channel, scale, audience and geographic expansion. | Revalidate territory, platform, text edition, distribution limits, support/operations and all changed release conditions. |

<a id="RIGHTS-B0169"></a>
[AP] SAF’s initial pilot direction is up to three adults, with a documented checkpoint permitting no more than ten total within the authorized envelope. Its six-week review envelope is not a Scripture-license duration, entitlement clock or retention period. Those earlier approvals do not authorize enrollment now. P1-10 remains FAIL — NOT EVIDENCED / REAL PARTICIPANTS NOT AUTHORIZED. [SAF D03; COM, pilot/commercial release boundaries]

<a id="RIGHTS-B0170"></a>
### 23. Publication-rights blockers and proportionate containment

<a id="RIGHTS-B0171"></a>
[IM] Classify the smallest safely isolatable affected scope. TEXT blocks the exact-text feature or block; PUB blocks the affected publication/edition; RELEASE blocks broader release or operation when the defect is systemic, affects core rights/privacy/provider fit, or cannot be isolated. These are not waivers of SAF’s stop-ship rules. Unknown scope is not proof of isolation. [SAF §18/SS17]

<a id="RIGHTS-B0172"></a>
| Blocker | Default containment | Evidence before re-enable |
| --- | --- | --- |
| Uncleared exact NIV text; required grant missing | TEXT / PUB; broader RELEASE if systematic. | Applicable OQ finding or executed DL grant, exact scope and retest. |
| AI/app use outside scope, including input/RAG | Stop affected ingestion and output; RELEASE if mixed into core knowledge. | Clean-source proof or compatible AI grant, including autonomy and provider exposure. |
| Missing required attribution or broken notice delivery | TEXT / PUB. | Correct notice version, placement and visual/export test. |
| Exceeded verse/percentage limits or prohibited complete-book reproduction | TEXT / PUB; stop serial extraction route. | Reconciled counts, revised authorized artifact or expanded written grant. |
| Unlicensed corpus, embedding or training/evaluation collection | Stop collection/use; quarantine access and obtain counsel-directed disposition. | Source/copy inventory, removal or explicit rights and independent verification. |
| API use outside contract, territory or actual Bible/edition grant | Stop affected API/content route. | Account-specific contract fit, metadata, geography and configuration tests. |
| Export, email, offline or church distribution beyond grant | Stop affected delivery / PUB. | Explicit distribution scope and tested channel-specific enforcement. |
| Translation label mismatch or altered text presented as NIV | TEXT / PUB. | Verified source/edition, faithful rendering and editorial correction. |
| Expired, revoked or suspended rights | Stop new affected exact-text use and queued delivery. | Current grant/status, lawful handling of prior copies and dispatch-time checks. |
| Sublicense, onward redistribution or affiliate/entity mismatch | Stop affected distribution; broader scope if inseparable. | Actual parties and distribution authority confirmed in writing. |
| License obligation conflicts with approved privacy or autonomy | Keep affected licensed feature OFF; RELEASE if core processing cannot comply. | Compatible terms or separately approved governing change; never hidden monitoring. |
| Rights policy bypass, stale restore, unknown source or uncontained memorized output | Disable affected route; RELEASE if no reliable isolation. | Containment, corrected implementation, independent retest and applicable owner re-enable decision. |

<a id="RIGHTS-B0173"></a>
[IM] Reference-only fallback is preferred where lawful, product-appropriate and technically isolated. It must preserve safe Blueprint viewing, approved references and personal significance, and must not interrupt independent safety-resource access. Do not destroy private records reflexively: coordinate removal, legal holds, retention and incident duties through PRIV and counsel. Do not claim downloaded copies can be recalled. Re-enable follows the applicable reviewed release procedure, not a developer toggling a flag after a fix. [PRIV; SAF D08; §§11, 14]

<a id="RIGHTS-B0174"></a>
### 24. Acceptance and execution evidence

<a id="RIGHTS-B0175"></a>
[IM / EV] Appendix E defines SR01–SR32. Every test is NOT RUN. A compliant-looking document or fictional conversation is not proof that the application enforces the policy. Record the tested build, model, source bundle, rights-policy version, fixture basis, actor/role, expected result, actual result, evidence location, reviewer and defect/retest history.

<a id="RIGHTS-B0176"></a>
[IM] Disabled features need negative-path evidence, not UI concealment. Testing an internal public-domain fixture proves renderer behavior only; it does not prove NIV licensing. No “not applicable” disposition is made here. A later applicability decision must identify the demonstrably disabled route and be approved within the release process.

<a id="RIGHTS-B0177"></a>
### 25. Owner decisions and delegated responsibility

<a id="RIGHTS-B0178"></a>
[OD] Appendix A records six owner directions approved by Michael J. Gauthier on September 12, 2026 within this standard’s stated scope. They cover the actual business choices without asking him to interpret statutes, decide the meaning of a publisher contract or certify engineering. Technical detail remains with Jeremy and the implementation team subject to reviewed requirements; actual rights, privacy and specialist findings remain independent evidence. No legal entity, licensor budget, API agreement or operating-role appointment is completed by this approval. Approval does not complete any professional review, implementation, SR acceptance test or release gate. [OD-REV; OD-APP]

<a id="RIGHTS-B0179"></a>
### 26. Professional and licensor review

<a id="RIGHTS-B0180"></a>
[DL / EV] Appendix C specifies the required reviewers and deliverables. The licensor decides what it will grant; qualified publishing/IP counsel assesses legal basis and agreement fit; editorial reviewers verify fidelity and scope; engineering/security/privacy reviewers verify operation. Owner approval of this standard establishes product and rights-governance policy within its stated scope but cannot supply an absent grant, satisfy a mandatory professional review, run a test or authorize an actual release without the required evidence.

<a id="RIGHTS-B0181"></a>
### A. APPROVED OWNER DIRECTIONS

<a id="RIGHTS-B0182"></a>
All D01–D06: APPROVED OWNER DIRECTION. Michael J. Gauthier approved the directions below on September 12, 2026 within P1-09’s stated scope. The final owner-approval draft’s substantive directions are preserved. All applicable NIV/licensor, publishing/IP counsel, book-publisher, API/software licensing, privacy/security, Scripture/publication editorial and church/distribution rights reviews remain open, together with implementation, SR acceptance testing and release gates. No professional review, test or release is completed by owner approval. [OD-REV; OD-APP]

<a id="RIGHTS-B0183"></a>
#### D01 — Launch conversation posture

<a id="RIGHTS-B0184"></a>
Status: APPROVED OWNER DIRECTION

<a id="RIGHTS-B0185"></a>
| Decision field | Approved owner direction / review effect |
| --- | --- |
| DECISION | Reference-only autonomous launch, once separately authorized for real participants. |
| APPROVED OWNER DIRECTION | Steward launches using accurate Scripture references, independently authored Stewardship Blueprint teaching/explanation, and personal application/reflection, without dynamically reproducing exact NIV text unless and until the applicable AI/app use is expressly licensed or otherwise authoritatively cleared. NIV remains Stewardship Blueprint’s preferred translation. A participant request for exact NIV text does not override rights restrictions. Do not silently substitute another translation or use a near-verbatim paraphrase as a workaround. Do not introduce routine human transcript review or in-the-moment human approval to satisfy a publisher requirement. If an exact-NIV license cannot support Steward’s approved autonomous participant-facing model and privacy boundaries, keep that exact-text feature disabled rather than changing those governing models through this workstream. Reference-only Steward remains a legitimate product release posture when all other release gates are satisfied. |
| WHY | Provides a useful autonomous experience without assuming that static quotation permission authorizes AI input/output or that human transcript review is an acceptable workaround. |
| CONTENT / UX EFFECT | Accurate references, theological explanation and personal application remain available. Explain exact-text unavailability neutrally; no automatic alternate translation. |
| COST / LICENSING EFFECT | Avoids depending on an unquoted license price for the initial scope; clearance and engineering costs remain. Later exact-text terms may add fees and conditions. |
| ENGINEERING EFFECT | Clean AI-serving source bundle, reference-aware tools and output controls; exact-text feature defaults OFF. |
| COUNSEL / LICENSOR REVIEW REQUIRED? | Counsel/rights review for the actual reference-only architecture; Biblica’s written compatible grant and autonomous-use treatment before licensed NIV AI use. |
| APPROVED DIRECTION APPLIES BEFORE | Freezing the first real-participant release candidate and participant-facing Scripture claims. |

<a id="RIGHTS-B0186"></a>
#### D02 — Blueprint Scripture rendering

<a id="RIGHTS-B0187"></a>
Status: APPROVED OWNER DIRECTION

<a id="RIGHTS-B0188"></a>
| Decision field | Approved owner direction / review effect |
| --- | --- |
| DECISION | Canonical Scripture reference and approved reflection, with rights-controlled exact-text display/export. |
| APPROVED OWNER DIRECTION | The canonical Personal Stewardship Blueprint preserves the participant-approved Scripture reference, preferred translation metadata where applicable, participant-approved personal significance/reflection, and applicable approval/provenance record. Do not require permanent NIV verse-text storage in the canonical Blueprint. Exact NIV text may appear in a Blueprint display/export only when the actual translation/edition, display/export, storage, download, print and continued participant possession are within a verified permitted/licensed scope. Otherwise render the approved reference and participant reflection without degrading Blueprint ownership or completeness. Free and Full use the same copyright policy. Paid or sponsored access never expands Scripture rights. Do not add an extra Blueprint page merely to solve licensing/attribution issues without separate Template approval. |
| WHY | Separates participant agency and enduring personal work from third-party text rights. |
| CONTENT / UX EFFECT | Free, Full and My North Star remain usable. No silent clipping, changed Life Verse or extra page outside Template v4. |
| COST / LICENSING EFFECT | May require an express personalized-PDF/print permission distinct from display access. Do not promise perpetual NIV availability before agreement review. |
| ENGINEERING EFFECT | Reference/text separation; export manifests; channel-specific rights checks and deterministic notice rendering. |
| COUNSEL / LICENSOR REVIEW REQUIRED? | Yes for personalized exact-text exports, downloadable possession after expiry and contractual continuity. A clearly applicable ordinary static route must be documented, not presumed. |
| APPROVED DIRECTION APPLIES BEFORE | Finalizing the Blueprint schema, export template and customer ownership disclosures. |

<a id="RIGHTS-B0189"></a>
#### D03 — Alternative translation at launch

<a id="RIGHTS-B0190"></a>
Status: APPROVED OWNER DIRECTION

<a id="RIGHTS-B0191"></a>
| Decision field | Approved owner direction / review effect |
| --- | --- |
| DECISION | No automatic participant-facing alternate translation at launch. |
| APPROVED OWNER DIRECTION | Do NOT expose a public-domain or alternate Bible translation as an automatic participant-facing fallback merely because exact NIV rights are unavailable. Initial production fallback is REFERENCE + ORIGINAL STEWARD EXPLANATION, not another translation. Reviewed public-domain Scripture may be used for isolated internal/synthetic engineering fixtures when clearly labeled and technically prevented from entering participant-facing NIV paths. Any future participant translation choice or multi-translation experience requires separate product, theological/editorial, rights, implementation and release approval. NIV remains the preferred production translation where authorized. |
| WHY | Preserves the preferred NIV direction rather than turning a licensing limitation into an unapproved theological/editorial product change. |
| CONTENT / UX EFFECT | Participants receive references rather than an unexpected translation. No multi-translation selector at launch. |
| COST / LICENSING EFFECT | Avoids another production rights/vendor surface; internal fixture provenance still requires review. |
| ENGINEERING EFFECT | Keep test translation IDs isolated and deny them on participant-facing routes. |
| COUNSEL / LICENSOR REVIEW REQUIRED? | Edition/source/geography review for fixtures; separate product, theological/editorial, rights, implementation and release approval before later participant choice or multi-translation support. |
| APPROVED DIRECTION APPLIES BEFORE | Choosing test fixtures and implementing fallback behavior. |

<a id="RIGHTS-B0192"></a>
#### D04 — Participant-pasted Scripture

<a id="RIGHTS-B0193"></a>
Status: APPROVED OWNER DIRECTION

<a id="RIGHTS-B0194"></a>
| Decision field | Approved owner direction / review effect |
| --- | --- |
| DECISION | Participant paste does not automatically authorize canonical storage or company export. |
| APPROVED OWNER DIRECTION | Participant-pasted exact Scripture does not automatically become canonical Blueprint Scripture text or exported company-distributed Scripture. For the initial real-participant posture, preserve the reference where identifiable and appropriate, and the participant’s own approved reflection/significance. Do not automatically persist large copyrighted Bible passages, create a reusable company corpus, create embeddings/vector knowledge from pasted copyrighted Scripture without separately approved rights, automatically carry pasted text into Blueprint exports, or relabel participant-supplied text as verified NIV. Narrow private input handling, same-user display, storage, model context and formal data-access treatment remain subject to counsel/licensor/privacy review. Do not accuse a participant of infringement merely because they pasted Scripture. |
| WHY | User possession, typing or approval does not establish company AI-processing or redistribution rights. |
| CONTENT / UX EFFECT | The participant can identify the passage and its meaning without losing their own reflection. Explain when pasted text is excluded; do not label it company-owned or verified NIV. |
| COST / LICENSING EFFECT | Avoids launching a broad copyrighted-content hosting/export service; private handling and any later exact-text exception need counsel/licensor analysis. |
| ENGINEERING EFFECT | Separate provenance, minimized intake/context, no automatic canonical copy; blocked bulk imports and export filtering. |
| COUNSEL / LICENSOR REVIEW REQUIRED? | Yes: private display, model context, storage and access-request treatment; licensor clarification where its terms govern the proposed use. |
| APPROVED DIRECTION APPLIES BEFORE | Enabling real participant paste/upload, saved notes and export pathways. |

<a id="RIGHTS-B0195"></a>
#### D05 — Formal commercial NIV inquiry

<a id="RIGHTS-B0196"></a>
Status: APPROVED OWNER DIRECTION

<a id="RIGHTS-B0197"></a>
| Decision field | Approved owner direction / review effect |
| --- | --- |
| DECISION | Prepare and pursue a formal commercial NIV AI/app rights discussion, with staged inquiry/application timing. |
| APPROVED OWNER DIRECTION | Authorize preparation and pursuit of a formal commercial NIV AI/app rights discussion to determine whether Biblica will authorize an experience compatible with autonomous Steward conversations; no routine human transcript monitoring; private personalized conversations; exact NIV quotation where approved; participant-selected Life Verse; personalized Blueprint PDFs; paid and sponsored use; appropriate model/cloud processing; required attribution; secure storage/caching where needed; and participant continued possession of authorized exports. Authorize Appendix B as the working question package, subject to confirming the actual contracting entity and rights contact. Preparation and an early rights/scoping inquiry may occur now; formal production-license submission follows the timing direction below. This direction is approved within this standard’s scope, not an executed grant. Timing does not weaken the requirement to resolve NIV AI/app rights before exact-text functionality is enabled. |
| WHY | Determines whether an autonomous, privacy-compatible experience and persistent personal exports are actually available. A generic API purchase will not answer this. |
| CONTENT / UX EFFECT | Defines a possible future exact-text experience; no promise of availability or timetable in current marketing. |
| COST / LICENSING EFFECT | Fees, royalties, scale limits and legal review are unknown. Set an inquiry/review budget separately; any commercial offer returns for an authorized purchasing decision. |
| ENGINEERING EFFECT | Provide a reference-only demonstration and bounded architecture/data-flow description; avoid speculative corpus integration before terms are known. |
| COUNSEL / LICENSOR REVIEW REQUIRED? | Yes: Biblica, relevant print partner, IP counsel and any API licensor, with privacy/security review of actual processing and oversight terms. Confirm early scoping and later production-application requirements; none of these reviews is completed. |
| APPROVED DIRECTION APPLIES BEFORE | Spending on a production exact-NIV integration or advertising its availability. |

<a id="RIGHTS-B0198"></a>
Approved inquiry/application timing — D05

<a id="RIGHTS-B0199"></a>
Biblica’s current public permissions guidance generally defers licenses for products/software still in development. The approved timing direction is: [R01; OD-REV]

<a id="RIGHTS-B0200"></a>
1. Prepare the complete inquiry/application package now.

<a id="RIGHTS-B0201"></a>
2. An initial rights/scoping contact with Biblica may occur now to explain the autonomous Steward use case and obtain direction.

<a id="RIGHTS-B0202"></a>
3. Do not assume that a formal production-license application should be submitted prematurely if Biblica requires a more complete product.

<a id="RIGHTS-B0203"></a>
4. Prepare a reference-only functioning demonstration, product/data-flow description, sample outputs and actual legal-entity information so the product can be presented concretely.

<a id="RIGHTS-B0204"></a>
5. Submit the formal production-license application when Biblica indicates the project is sufficiently developed, or when product readiness reaches the appropriate point under its then-current process.

<a id="RIGHTS-B0205"></a>
6. Any proposed license terms, fees, royalties or commitments return for separate authorized commercial/legal review before execution.

<a id="RIGHTS-B0206"></a>
7. No marketing claim may say exact NIV is coming or licensed until actual evidence supports that claim.

<a id="RIGHTS-B0207"></a>
#### D06 — Mandatory publication preflight

<a id="RIGHTS-B0208"></a>
Status: APPROVED OWNER DIRECTION

<a id="RIGHTS-B0209"></a>
| Decision field | Approved owner direction / review effect |
| --- | --- |
| DECISION | Mandatory proportionate Scripture-rights preflight for all new and materially revised SB/MJG publications and marketing assets. |
| APPROVED OWNER DIRECTION | All new and materially revised Stewardship Blueprint / MJG publications and marketing assets receive a Scripture-rights check before publication. Reference-only/original content receives a light recorded review. Exact Scripture quotation receives the applicable full review: translation/edition; source; quotation inventory; verse/count/percentage analysis where applicable; whole-book restriction; publication/use classification; required attribution; permission/license evidence; channel; territory; distribution; and final-artifact proof. Prior clearance for one book, guide, website, social asset, study or church use does not automatically clear another channel or product. Do not truncate Scripture simply to avoid rights limits. Where authorized, preserve the Stewardship Blueprint preference for the full intended verse/passage rather than misleading fragments. |
| WHY | Prevents a cleared book, supplied registry or familiar church use from being treated as blanket permission for all channels. |
| CONTENT / UX EFFECT | Preserves whole-verse intent when authorized. Rights-driven editorial changes are visible and versioned, not silent substitutions. |
| COST / LICENSING EFFECT | Adds an editorial checkpoint; special uses may require permission fees or a narrower publication plan. |
| ENGINEERING EFFECT | Publication IDs, versioned quotation manifests, final-artifact checks and a shared rights registry. |
| COUNSEL / LICENSOR REVIEW REQUIRED? | Rights reviewer for all; licensor/counsel for special-use triggers, uncertain classification or new agreements. Mike is not asked to interpret permissions. |
| APPROVED DIRECTION APPLIES BEFORE | Publishing the current book/studies, new website assets or any exact-text download. |

<a id="RIGHTS-B0210"></a>
### B. NIV / LICENSOR QUESTIONS

<a id="RIGHTS-B0211"></a>
Working question package — approved under D05; not sent. Intended recipients: Biblica for commercial digital/AI scope, and the appropriate NIV commercial-print permissions partner for the actual territory. Confirm the contracting entity and authorized rights contact before sending. This package supports an early rights/scoping inquiry now and a later formal production-license application when Biblica’s process and product maturity permit. Prepare the full package and reference-only functioning demonstration now; do not treat preparation or early contact as a premature production application or permission to use exact text. [R01; OD-REV; D05]

<a id="RIGHTS-B0212"></a>
Proposed project description: Steward is an autonomous Christian AI guide within Stewardship Blueprint. It supports a participant’s Free or Full Personal Stewardship Blueprint and optional ongoing guidance, including church-sponsored access. Ordinary private responses are not supervised or individually approved by staff. No routine private-transcript review is offered. An initial invitation-only Arizona adult pilot is planned but not authorized. Separate products include books, studies, workbooks, website resources and personalized PDFs. NIV is preferred; no exact-text license is evidenced, and that functionality remains disabled in the approved launch posture. Prepare a reference-only functioning demonstration, product/data-flow description, sample outputs and actual legal-entity information. Early scoping contact seeks direction on this autonomous use case; the formal production-license application follows Biblica’s then-current process and appropriate product maturity. No agreement to autonomous use is claimed.

<a id="RIGHTS-B0213"></a>
| Question | Requested written clarification |
| --- | --- |
| Q01 — Ordinary permission | Which listed print, eBook, study/workbook, website and personalized-PDF uses fall within ordinary quotation permission? Which require a direct commercial grant, including commentary/reference-work classification? |
| Q02 — Autonomous AI | Will you expressly authorize dynamic proactive and requested NIV quotations and associated explanations in private autonomous conversations? Please resolve the meaningful-human-review requirement in writing without requiring routine staff access to participant conversations. |
| Q03 — Input and processors | What rights cover inference, retrieval context, embeddings, testing and third-party cloud/model processors? Can exact text remain outside the model while an approved renderer displays it? What hosting and no-training conditions apply? |
| Q04 — Scope of dialogue | What limits apply to one verse, passages, multiple turns, devotional-style discussion, user-requested continuation and explanations/prayers surrounding text? Please define the counting unit, repetition, percentage basis and anti-reconstruction requirements. |
| Q05 — Life Verse and PDF | May participant-selected references render full NIV in personal downloadable PDFs and print? May users retain, re-download and print authorized copies after subscription or license expiry? Are Free/Full and user-specific PDFs treated differently from a fixed publication? |
| Q06 — Storage and caching | May full text be stored in a private Blueprint, cache, revision history, backup or export object? What refresh, deletion, offline and post-termination obligations apply to company and participant-held copies? |
| Q07 — Participant-supplied text | How do your terms apply when users paste a verse, chapter, larger excerpt or another translation? Distinguish private display/model processing from company export and redistribution. |
| Q08 — Commercial and sponsored scope | Do terms differ for free/freemium users, paid Builds, subscriptions, church sponsorship, leader materials, handouts, slides/projection, online courses and promotional excerpts? Can the grant cover MJG and an authorized hosting partner? |
| Q09 — API and lookup | Is an API or specified corpus route required? Which provider can grant commercial NIV for this scope, given API.Bible’s current advertised restriction? Does any approval include lookup/search, or only bounded contextual retrieval? |
| Q10 — Attribution | Please supply the exact current notice and placement requirements for print, PDF, webpage, app credits, persistent chat UI, individual responses and provider credit. May an approved reference-only fallback retain an NIV preference label without implying quotation? |
| Q11 — Oversight, privacy and terms | What non-content reporting, audits, security review, theological/role conditions, correction and suspension duties apply? Can compliance be demonstrated without disclosing private transcripts or religious profiles? |
| Q12 — Process and economics | Please identify authorized parties, territories, editions, scale/fee/royalty terms, sublicense limits, term/renewal and development-stage application requirements. Distinguish an early rights/scoping inquiry from a formal production-license application: what demonstration, product maturity and entity information are needed, and when should the formal application be submitted? Provide a written scope decision and operative grant at the appropriate stage; separate AI, print, eBook and app rights where necessary. |

<a id="RIGHTS-B0214"></a>
Do not characterize an unanswered question or early scoping response as permission. Any proposed grant, terms, fees, royalties or commitments must return for separate authorized commercial/legal review and be checked against the actual product, privacy and release architecture before execution. Exact-text functionality remains disabled until the applicable rights and release gates are satisfied. No questions have been sent or licensor agreement received by this approval finalization.

<a id="RIGHTS-B0215"></a>
### C. PROFESSIONAL REVIEW REQUIRED

<a id="RIGHTS-B0216"></a>
Every item below is OPEN — NOT COMPLETED. Reviews must identify actual scope, versions, evidence, qualifications, findings, unresolved conditions and re-review triggers.

<a id="RIGHTS-B0217"></a>
| Review function | Required deliverable | Timing |
| --- | --- | --- |
| RV01 — NIV rights holder / authorized licensor | Written scope, applicable ordinary permission or required executed grant; AI/autonomy, export, channel, territory, notices and quantity terms. | Before affected exact NIV use. |
| RV02 — Publishing / IP counsel | Permission applicability, fair-use questions only where actually necessary, participant-paste/private copying, generated-content and ownership terms, agreement precedence, retention/termination and remedies. | Before real content handling/publication relying on those positions. |
| RV03 — Book publisher / imprint rights lead | Title-specific agreement, author/publisher responsibilities, print/eBook/marketing permissions, quotations and other third-party material; actual publisher is not yet finalized in BOOK. | Before printer-ready or eBook release. |
| RV04 — Software / API licensor and contract reviewer | Actual NIV availability, account/Bible ID, AI/processor exposure, caching/offline/printing/PDF rights, notices, telemetry and removal duties. | Before adopting or activating a text provider. |
| RV05 — Privacy / security / records reviewers | PRIV fit of context, paste, saved notes, vendor reporting, private exports, rights logs, audits, deletion/holds and restored copies. No hidden monitoring or new retention periods. | Before any new real private-data flow. |
| RV06 — Scripture / publication editor | Full source inventory, accurate reference and edition, quotation versus paraphrase, whole-verse direction, complete count and notice/layout proof. | Before final publication clearance and exact-text templates. |
| RV07 — Church / distribution counsel or rights specialist | Actual sponsor and material agreements, local church provision, copy/projection/recording/download scope, entity and territory; no private leader exports. | Before the applicable group/sponsor material release. |
| RV08 — Independent implementation / release reviewer | Executed SR tests, clean-source proof, denial/isolation, autonomy-compatible contract implementation, failure/restore drills and linkage into SAF G37. | Before applicable production release or re-enable. |

<a id="RIGHTS-B0218"></a>
Michael J. Gauthier remains Product Owner/final owner release authority under the existing standards. Jeremy is the intended engineering recipient of this specification, not a substitute for a licensor or qualified reviewer. Actual rights-operating owner, deputy and review appointments remain to be recorded; this standard does not invent assignments.

<a id="RIGHTS-B0219"></a>
### D. ENGINEERING IMPLEMENTATION REQUIREMENTS

<a id="RIGHTS-B0220"></a>
All packages below are APPROVED REQUIREMENTS — SPECIFIED; IMPLEMENTATION UNVERIFIED. Implement within P1-01’s modular architecture rather than as a new unbounded Bible platform.

<a id="RIGHTS-B0221"></a>
| Package | Required implementation output | Acceptance linkage |
| --- | --- | --- |
| IM01 — Registry and policy engine | Versioned rights/edition/channel records, evidence pointers, current-state checks, least-privilege edits and auditable approval. Rights independent of entitlements. | SR01, 07–09, 22, 26–27 |
| IM02 — Cleared source boundary | Reviewed AI-serving derivative, canonical references, excluded uncleared Scripture blocks; no unlicensed corpus/vector collection or covert evaluation export. | SR05, 12–13, 21, 24, 32 |
| IM03 — Retrieval and rendering | Four operations in §12; allowlisted vendor/Bible ID, actual returned-span validation, deterministic faithful exact-text rendering and fail-safe outage behavior. | SR04–05, 14–15, 18–19, 23–24 |
| IM04 — Participant object and export | Version-bound participant approval, reference/text/significance separation, secure self-export, notice-preserving templates and reference-only continuity. | SR03, 06–08, 16, 20, 29, 31 |
| IM05 — Publication preflight | Complete per-edition quotation ledger, accepted calculation basis, parent-platform accounting, atomic quotas and final artifact digest. | SR10–11, 25–26, 30 |
| IM06 — Input/privacy controls | Provenance, minimized paste handling, bulk-import denial, no automatic corpus/save/share; private-data/vendor reporting review and no content-bearing rights logs. | SR12–13, 28–29, 32 |
| IM07 — Attribution and accessibility | Exact evidence-bound notice strings, required local/contextual labels, web/app/PDF/print proof and no accidental page-count changes. | SR02, 14–17, 31 |
| IM08 — Operations and evidence | Disable/re-enable procedure, expiry and revocation fencing, cache/export/backup disposition, reconciliation, independent retest and release dossier. | SR09, 18–20, 22, 26–28 |

<a id="RIGHTS-B0222"></a>
### E. SCRIPTURE RIGHTS ACCEPTANCE TESTS

<a id="RIGHTS-B0223"></a>
All SR01–SR32: NOT RUN. The expected results below are specifications, not measured performance. Use lawful synthetic fixtures and actual tested configuration evidence; preserve the separate licensing determination.

<a id="RIGHTS-B0224"></a>
| ID / scenario | Expected result and evidence target | Status |
| --- | --- | --- |
| SR01 — Reference-only policy versus exact NIV request | Attempt proactive, requested and tool-assisted exact output. No NIV text renders; an accurate reference/original explanation remains available. | NOT RUN |
| SR02 — Required attribution | Use a cleared synthetic exact-text policy with mandated notice locations. Correct notice/version and local translation label appear; missing notice suppresses the affected text. | NOT RUN |
| SR03 — Life Verse approval and persistence | Propose, decline, approve and revise a reference. Only actual scoped approval persists; no invented text or Mike-default selection appears. | NOT RUN |
| SR04 — Approved retrieval route | Attempt arbitrary URL, vendor, edition and Bible ID. Only the server-authorized route can retrieve exact text when required; no client/model-supplied permission bypass. | NOT RUN |
| SR05 — Memorized or reconstructed text | Request long NIV wording from model memory and across repeated prompts. Output controls prevent unauthorized exact/near-verbatim reconstruction; no unlicensed detector corpus is used. | NOT RUN |
| SR06 — Export fallback | Generate an export when exact-text rights are denied. Reference and approved significance remain; the rest of the Blueprint is usable and the manifest records fallback. | NOT RUN |
| SR07 — Paid entitlement separation | Compare identical reference/right policy under Free, Full, monthly and annual access. Payment never changes the copyright decision. | NOT RUN |
| SR08 — Sponsor entitlement separation | Repeat with Compass participant/leader and other sponsor grants. Sponsorship or leader role does not widen text rights or private export access. | NOT RUN |
| SR09 — Missing / expired rights | Remove, expire or suspend a record before rendering and delivery. Affected exact output is denied, including queued jobs; no stale positive cache overrides it. | NOT RUN |
| SR10 — Quotation limit enforcement | Exercise the actual reviewed quantity unit and permitted threshold, then exceed it. Atomic enforcement stops only the affected unauthorized text; counters are not reset per prompt without authority. | NOT RUN |
| SR11 — Publication revision | Add, repeat, remove and change a quote in a new edition. Counts, notices and artifact digest are recalculated; a prior clearance cannot silently certify changed files. | NOT RUN |
| SR12 — User paste is not company corpus | Paste a verse, chapter and bulk excerpt. No automatic reusable collection, vector index, shared knowledge or company-owned provenance is created. | NOT RUN |
| SR13 — Training / evaluation exclusion | Inspect dataset jobs, model-provider settings and export routes with lawful sentinels. Participant content and unlicensed Scripture cannot enter training/research/evaluation feeds. | NOT RUN |
| SR14 — Translation and edition fidelity | Return deliberately mismatched label/text/edition metadata. Renderer rejects it rather than publishing an inaccurate NIV label. | NOT RUN |
| SR15 — Paraphrase labeling | Provide original explanation and altered near-quotation. Commentary is not labeled NIV; disguised reproduction does not evade the exact-text policy. | NOT RUN |
| SR16 — PDF and print attribution | Render, download and print the final test PDF. Required notice, reference and translation remain visible, legible and associated with the content. | NOT RUN |
| SR17 — Website / app attribution | Test mobile, responsive and accessible display plus relevant print styles. Required local/persistent/page notices survive; a credits-only substitution fails where insufficient. | NOT RUN |
| SR18 — API outage / bad response | Simulate timeout, empty payload, corrupt response and unsupported edition. No fabricated NIV text or unauthorized provider fallback; reference-based help continues. | NOT RUN |
| SR19 — Disabled lookup/search | Call hidden endpoints directly and request chapter browsing/search/offline download. All disabled functionality is denied at the service boundary, not merely omitted from UI. | NOT RUN |
| SR20 — Blueprint continuity | Disable exact Scripture globally while retaining approved personal data. Secure existing Blueprint viewing and reference-only self-export still work within safe platform scope. | NOT RUN |
| SR21 — Upstream source contamination | Place an uncleared quotation inside a company-authored teaching fixture. AI-serving ingestion excludes it and preserves source lineage without modifying the governing original. | NOT RUN |
| SR22 — Autonomy-compatible grant | Configure a grant lacking the required autonomous-use permission. Exact NIV AI remains off; system does not silently enable routine human transcript review to satisfy it. | NOT RUN |
| SR23 — API returns a wider passage | Request a verse but receive a larger span. Enforce rights and limits against the actual payload; reject an unauthorized span instead of trusting request length. | NOT RUN |
| SR24 — Injection and serial reconstruction | Embed instructions in user text, source metadata and tool results; request successive fragments. Policy authority stays server-owned and serial extraction is contained. | NOT RUN |
| SR25 — Numerical and whole-book boundaries | Use lawful fixtures at 500/501 verse occurrences under the selected screen, below/at 25%, and a complete short book spread across blocks. Apply the recorded counting basis and strict boundary without rounding a failure into a pass. | NOT RUN |
| SR26 — Concurrent quota / revision / expiry | Race two outputs, a publication update and rights revocation. Reservation/commit and dispatch checks prevent overspend, old-edition delivery and stale authorization. | NOT RUN |
| SR27 — Cache, backup and restoration | Restore older licensed payloads after revocation/deletion. Reconcile current rights and privacy dispositions before serving; expired text cannot reappear through cached PDFs or backups. | NOT RUN |
| SR28 — Vendor reporting and audit privacy | Activate a provider demanding disallowed telemetry or transcript access. Contract/configuration fit gate prevents use; rights logs do not expose private text or unapproved religious profiles. | NOT RUN |
| SR29 — Other-translation / unverified paste | Paste text labeled as another translation or with uncertain provenance. Do not relabel as NIV, approve it automatically, silently store it canonically or carry it into export. | NOT RUN |
| SR30 — Platform and campaign aggregation | Split quotations across pages/posts/assets. The configured parent-work/platform ledger aggregates as required; creating an asset ID does not manufacture a new allowance. | NOT RUN |
| SR31 — Blueprint layout limits | Exercise long references, significance and required notices. Free stays three pages, Full thirteen and My North Star one readable page; no truncated Scripture or hidden extra page. | NOT RUN |
| SR32 — Internal fixture and formal rights request | Verify test-only translations cannot reach production; lawful personal-data access requests follow the separate reviewed rights workflow rather than being silently treated as ordinary publication exports. | NOT RUN |

<a id="RIGHTS-B0225"></a>
### F. CURRENT SB CONTENT REVISION QUEUE

<a id="RIGHTS-B0226"></a>
All items OPEN. No source edits or publication clearance performed. Categories A–F are defined in §21. Locations refer to the retrieved edition’s displayed page or named section; final pagination and every embedded image require production proof. “No issue identified” is bounded by the actual review, not a certification of an entire unavailable implementation.

<a id="RIGHTS-B0227"></a>
| Queue item / location | Observed finding / category | Required action and basis |
| --- | --- | --- |
| SQ01 — TLYB manuscript; copyright page (displayed p.3) | B / E — Scripture translation/quotation/permissions wording is explicitly a placeholder. ISBN and publisher/imprint are also unfinished. | Rights editor + publisher: establish actual edition/imprint, complete ledger, permission basis and final approved notice before book/eBook release. [BOOK] |
| SQ02 — TLYB; Chapter 5, family Life Verse (p.42) | B — Full Matthew 5:16 appears in the personal family account. A nearby reference is present; exact edition and publication-wide attribution still need verification. | Verify authorized NIV text and count every appearance; do not turn Mike’s personal verse into a participant default. [BOOK; T4] |
| SQ03 — TLYB; Chapter 1 Psalm 90 discussion, Chapter 5 Deuteronomy 6 discussion and later light-shining wording | A / D-review — Reference/allusion and shortened biblical wording occur. It is not yet established which are intended quotations versus original exposition. | Classify passage by passage. Label genuine explanation accurately; restore complete authorized quotation where that is the intended use. Do not automatically expand every allusion. [BOOK] |
| SQ04 — TLYB; Chapter 19 Life Verse / North Star fields | A — Field/reference use has low reproduction burden; older layout language remains in the existing source-control queue. | Apply P1-09 to future export implementation; preserve Template v4 authority. Existing terminology/layout revision remains a separate P2 task. [BOOK; T4; SR4] |
| SQ05 — Current six-week participant guide v5; Weeks 2, 4 and 6 (pp.20, 26, 32) | B / E — Observed full NIV blocks: Matthew 7:24–25; Proverbs 4:23; Proverbs 27:12; 1 Corinthians 10:12; Joshua 24:15; 2 Timothy 2:2. This is not the whole-guide ledger. | Review every week and all pre/post-study material, count occurrences/words, resolve study/commentary and church distribution scope. Current file is v5, not an approved v6. [STUDY5] |
| SQ06 — Six-week participant guide v5; final page (p.36) | B — An NIV copyright/permission notice is present. It does not establish executed permission or the applicable public-permission analysis. | Match the exact final notice to the actual rights basis and all formats; retain proof. Do not infer that “Used by permission” is false solely because no bespoke letter is supplied. [STUDY5; R03] |
| SQ07 — Fully Engaged; weekly Scripture sections | B / E — Twenty-one cited passage blocks cover 51 distinct verse identifiers in the six identified sections; see table below. | Complete whole-publication and repeated-quotation ledger, word percentage and study classification; obtain appropriate static/digital/group rights. [FE] |
| SQ08 — Fully Engaged; final notes (p.46), quotation typography | B / C-check — NIV notice exists; punctuation/edition consistency and the exact licensor notice version require checking. No alternate translation is confirmed. | Verify source text, punctuation and marks against the authorized edition; avoid declaring a mismatch from typographic hyphens alone. [FE] |
| SQ09 — Energy Audit Check-In; spiritual reflection and resource sections | F — No verbatim Bible quotation identified in the retrieved material; discussion of Scripture/Jesus/Sabbath is not itself a quotation. | Light final preflight of all pages/images and actual web adaptation. Preserve this instrument’s questions/scoring and existing P2-09 terminology queue. [EA] |
| SQ10 — Created for More Check-In v4; printable edition | F — No exact Scripture quotation identified; Scripture practice and resources are mentioned. | Record reference/original-content review for final printable; separately inspect the real digital funnel and marketing assets before publication. [CFM4] |
| SQ11 — Blueprint Template v4; §§5, 7, 13 | A — Life Verse is a chosen reference and approved significance; production Scripture rights are separately gated. | Implement reference/text separation, participant approval and rights-aware exports without rewriting the governing structure. [T4] |
| SQ12 — Product Journey v0.1 | F — No exact Bible text identified in reviewed provisions; commercial/product approval is not a rights grant. | Use current COM refinements and preserve Free/Full/Compass continuity; update only separately authorized future implementation cross-references. [PJ; COM] |
| SQ13 — Operating Instructions v0.4; §§2–3 | A — Prototype reference-only rule and prohibition on evasive paraphrase are explicit. | Prepare a separately controlled production implementation instruction after P1-09 decisions; do not silently supersede the approved fictional baseline. [OI4] |
| SQ14 — Statement of Faith; supplied God-through-Identity text | A — Scripture references occur; no verbatim Bible block identified in reviewed text. Doctrine remains unchanged. | Preserve full doctrinal authority and inspect the actual publication rendering. Any rights issue returns to source-controlled review, not doctrinal rewriting. [SF] |
| SQ15 — Legacy and Legacy Giving Standard v1; p.2 | B — Full NIV 2 Timothy 2:2 and 2 Corinthians 9:7 are present, with distinct teaching/application. | Verify publication/retrieval scope, count and notice; retain governing living-Legacy teaching and participant agency. [LG] |
| SQ16 — Legacy Standard p.6; referenced Academy package / NIV registry | E / evidence gap — Source says full NIV passages remain inline in a wider revised lesson/question package and cites a supplied registry. Those underlying assets are not cleared or comprehensively inspected here. | Obtain the actual registry and lesson files, rights provenance and complete counts. The six-page standard cannot confer rights on twenty lessons or the referenced wider collection. [LG] |
| SQ17 — Context v3 / Register v4; rights and source queues | A / governance — Rights work remains separate; historical P1-open entries coexist with later actual approvals. | After later approval, perform only a separately authorized source-maintenance sync. Upload suffixes and format copies do not create new authority. [CTX3; SR4] |
| SQ18 — P1-01, PRIV, SAF and COM; export/rights/release controls | F / governance — No exact Scripture issue identified in reviewed control provisions; their approvals do not close P1-09. | Link final P1-09 evidence into SAF G37 and applicable COM gates. Preserve autonomy, no routine transcript review, self-export and privacy boundaries. [P1-01; PRIV; SAF; COM] |
| SQ19 — Website / MJG / ForgedLife references in CFM4, EA and supporting branding | Evidence gap — Resource destinations and planned products are named; this is not an audit of deployed pages, hosted lessons, email campaigns or external files. | Obtain an actual asset/site inventory and inspect each enabled channel, including commercial context and user download rights. [CFM4; EA; SR4] |
| SQ20 — Standalone Field Guide, leader guide, slides, social/advertising, videos and church downloads | Evidence gap — Actual release candidates were not supplied/retrieved for a complete review. | Do not classify as F or assume companion-book clearance; inventory, count and review before those materials are published. [BRIEF] |
| SQ21 — Non-Scripture publication quotations and borrowed material | Separate IP review — TLYB’s Reynolds/Firestone attribution and other attributed teaching, plus research acknowledgments in supporting guides, need an ordinary publication-source check. No infringement finding is made. | Verify original sources, attribution, copyright/public-domain basis where relevant and permissions for protected reproduced material; keep this distinct from NIV licensing. [BOOK Chapter 1; EA] |

<a id="RIGHTS-B0228"></a>
#### F.1 Fully Engaged — bounded passage inventory

<a id="RIGHTS-B0229"></a>
| Section | Cited ranges | Blocks | Verse IDs |
| --- | --- | --- | --- |
| Week 1 — p.8 | Psalm 139:23–24; Mark 6:31; Haggai 1:5–7 | 3 | 6 |
| Week 2 — p.14 | John 15:1–5; Isaiah 40:28–31; Luke 5:15–16 | 3 | 11 |
| Week 3 — p.20 | 1 Kings 19:1–8; 1 Corinthians 6:19–20; Mark 2:27 | 3 | 11 |
| Week 4 — p.26 | Psalm 42:5; Proverbs 4:23; Ephesians 4:26–32; Galatians 6:2 | 4 | 10 |
| Week 5 — p.32 | Romans 12:2; Philippians 4:8; Luke 10:38–42; 2 Corinthians 10:5 | 4 | 8 |
| Week 6 — p.38 | Daniel 6:10; Mark 1:35; Hebrews 10:24–25; Galatians 6:9 | 4 | 5 |
| Identified sections only | No repeated verse identifier among these listed ranges. Other appearances remain to be reconciled. | 21 | 51 |

<a id="RIGHTS-B0230"></a>
The arithmetic expands the displayed ranges; it does not verify each word against a licensed NIV source or establish a permissible percentage. Final totals must include quotations outside these sections, repeated material, graphics, footnotes and separate formats. No category-C violation or category-D mandatory edit is declared without the necessary textual classification and verification.

<a id="RIGHTS-B0231"></a>
### G. RELEASE GATES

<a id="RIGHTS-B0232"></a>
All PG01–PG16: OPEN — NOT EVIDENCED. These gates supplement SAF/P1-10, particularly G37, and the applicable COM requirements. No gate is closed by approval of this standard. Applicability must match the actual publication or participant-release envelope.

<a id="RIGHTS-B0233"></a>
| Gate | Required evidence to close | Applicability |
| --- | --- | --- |
| PG01 — Owner policy / source baseline | Recorded P1-09 approval and selected D01–D06, current governing versions and an actual released-scope definition. | All releases. |
| PG02 — Responsible entity and roles | Actual contracting/publishing entity, rights owner/deputy, qualified reviewers and authorized release operator. | All affected publications / applications. |
| PG03 — Rights basis for every enabled use | Publication-specific OQ finding or executed DL grant with edition, geography, channels and distribution; absence is not implied permission. | Every exact-text use. |
| PG04 — Reference-only clearance | Reviewed clean source bundle, original explanations, paste boundaries and demonstrated output denial. References-only is not an exemption from P1-09 review. | Reference-only application release. |
| PG05 — AI / autonomy compatibility | Written applicable AI grant and required autonomous-use permission; no unapproved doctrine, routine transcript review or third-party exposure. | Any licensed NIV AI use. |
| PG06 — Provider / privacy fit | Actual API/licensor/model/cloud terms and configuration accepted under PRIV; telemetry, audit, retention and sensitive-data boundaries resolved. | Any real data/text provider route. |
| PG07 — Complete publication audit | Final artifact, full verse/word ledger, accepted calculation unit, percentage and complete-book checks; no unknown quote counted as zero. | Exact-text publications / templates. |
| PG08 — Text fidelity and notices | Verified edition/text, exact notice from the applicable authority, visible required locations and final PDF/web/print proofs. | Every enabled quoted-text channel. |
| PG09 — Export and continuity | Participant approval/provenance, secure self-export, reference-only fallback and actual persistent-copy/print/post-expiry rights resolved. | Blueprint/export routes. |
| PG10 — User content / customer terms | Counsel-reviewed private input, saved content, formal rights requests and ownership/third-party restrictions; no new broad sharing permissions. | Before real participant Scripture input. |
| PG11 — Acceptance evidence | Applicable SR01–SR32 executed, independent review, defects remediated and retests recorded; disabled routes demonstrably denied. | Actual application release / re-enable. |
| PG12 — Operations and revocation | Exercised expiry/revocation, queued-delivery, cache/restore and incident runbooks; minimal lawful evidence and accountable coverage. | Operational exact-text scope. |
| PG13 — Paid scope | Applicable COM and commercial rights evidence; no spiritual-entitlement claims or payment-driven expansion of Scripture permissions. | Level 2 or any live payment scope. |
| PG14 — Sponsored / church scope | Actual sponsor/material agreements and permitted copying/projection/download scope; private leader access denied; Compass configuration tested. | Level 3 / actual group distribution. |
| PG15 — Broader channel / geography / scale | Changed scope reviewed, license extended where needed, source/edition terms revalidated and applicable privacy/commercial conditions closed. | Level 4 or material expansion. |
| PG16 — Final scope-specific authorization | Complete applicable dossier and final written publication authorization; for real participants, all inherited P1-10 gates plus Michael J. Gauthier’s separate release decision. | Before any actual publication / real-participant release. |

<a id="RIGHTS-B0234"></a>
No standalone rights approval overrides safety, security, privacy, provider-fit or commercial blockers. A narrow publication release does not authorize ingestion into Steward. A real-participant release with exact Scripture disabled does not authorize a later text feature without its own closed gates. Re-review official terms before release and on material change; schedule the registry’s next review rather than assuming this snapshot lasts indefinitely.

<a id="RIGHTS-B0235"></a>
### H. DEFERRED / DISABLED USES

<a id="RIGHTS-B0236"></a>
[FD] Nothing below is enabled by this standard. Each requires separate product direction, actual rights, architecture/privacy review, implementation testing and release approval.

<a id="RIGHTS-B0237"></a>
| Use | Disabled boundary |
| --- | --- |
| Audio Bible playback; voice reading / text-to-speech | No inference of audio/recording rights from text permissions; voice/audio remain subject to prior disabled-feature gates. |
| Large Bible-reading library; search engine; general lookup/browse | No full Bible database, arbitrary chapter retrieval, index or serial reconstruction service. Bounded future licensed retrieval is not automatic search approval. |
| Offline Bible storage; native app Bible module | No offline corpus, app-store Bible module or persistent broad text cache. |
| Multiple translations / public-domain participant fallback | No silent translation switching or launch translation selector. Internal fixtures are isolated. |
| Verse-of-the-day feeds and serial Scripture campaigns | No automatic daily verse stream, SMS/push or campaign reset of rights counters. |
| Scripture training / fine-tuning / evaluation corpus | No NIV model-training or large-passage dataset; participant-content research/training prohibition is separate and unchanged. |
| Built-in third-party Blueprint sharing; named sponsor/leader feeds | Existing PRIV exclusions remain; a Scripture license does not enable sharing or private church monitoring. |
| Broad ForgedLife synchronization and other future integrations | No inferred data exchange from shared branding or a hosted-study reference. Each actual integration remains separately gated. |

<a id="RIGHTS-B0238"></a>
### I. TRACEABILITY TO CURRENT GOVERNING SOURCES

<a id="RIGHTS-B0239"></a>
#### I.1 Current internal authority register

<a id="RIGHTS-B0240"></a>
Canonical identities below remove ephemeral upload suffixes without inventing new versions. A DOCX and matching Markdown copy of approved content are not separate authorities. This workstream modifies none of the listed sources. Dates are document approvals where established, not upload dates.

<a id="RIGHTS-B0241"></a>
| Key | Canonical source / status | Contribution and boundary |
| --- | --- | --- |
| BRIEF | Original P1-09 workstream instructions recorded in the Steward product-development conversation on September 12, 2026. | Scope, required 27 parts, full-NIV intention when authorized, outside research and draft-only boundary. |
| OD-REV | Controlled P1-09 owner-decision revision instructions from Michael J. Gauthier, recorded in the Steward product-development conversation on September 12, 2026. | D01–D06 selected for final owner approval review, including staged D05 scoping/application timing. Not approval of P1-09, an executed license, completed review/test, source modification or release authorization. |
| OD-APP | P1-09 approval instructions from Michael J. Gauthier, recorded in the Steward product-development conversation on September 12, 2026. | Approves D01–D06 and the applicable architecture, implementation/control requirements, SR acceptance-test specifications and PG release-gate structure within scope. Preserves OP recommendations, dated LR findings, OQ/DL determinations and all uncompleted reviews, tests, revision items and release gates. No license, publication clearance, implementation evidence or real-participant release authorization is established. |
| SF | Statement-of-Faith.txt. Approved doctrinal baseline; version/original approval date not stated. | Complete supplied God-through-Identity text remains unchanged. Doctrine authority is not publication permission. |
| T4 | Personal_Stewardship_Blueprint_Template_v4_APPROVED_GOVERNING_STANDARD.docx. Approved September 11, 2026. | §§3–7, 10–13: Life Verse agency, Free 3 / Full 13, one-page My North Star, canonical content/provenance and rights-aware exports. |
| PJ | Steward_Product_Journey_and_Progression_Standard_v0_1_APPROVED_GOVERNING_STANDARD.docx. Approved September 11, 2026. | Modes, ethical progression, retained participant work, §16 sponsored/Compass benefits and separation of implementation from approval. |
| OI4 | Steward_Operating_Instructions_v0_4_APPROVED_WORKING_TEST_BASELINE.docx. Approved September 11, 2026. | §§2–3: current source routing, exact doctrine, prototype references-only, no evasive paraphrase; general fictional baseline, not production approval. |
| SC3 | Steward_Sensitive_Conversations_and_Safety_Standards_v0_3_WORKING_TEST_BASELINE.txt. Separate unchanged sensitive-conversation baseline. | Dignity, Christian-conviction versus participant-belief distinctions, professional/role limits and safety priority. |
| P1-01 | P1-01_Production_Data_Architecture_v1_APPROVED_PRODUCTION_DATA_ARCHITECTURE.docx. Approved September 11, 2026. | M.A and supporting A–R approved; canonical record/proposal/evidence/permissions separation, lifecycle, minimal audit, modular implementation; M.B/N release gates remain. |
| PRIV | P1-02_P1-03_Privacy_Security_Consent_v0_1_APPROVED_STANDARD.docx. Approved September 12, 2026. | O01–O13 and applicable controls: adult Arizona pilot, session-only direction, selected notes, provider fit, secure self-export, sponsor separation, no participant-content training and minimized telemetry. |
| SAF | P1-07_P1-08_P1-10_Safety_Support_Release_v0_1_APPROVED_STANDARD.docx. Approved September 12, 2026. | D02 autonomy; D04 no routine transcript monitoring; D03 pilot envelope; D08 stop/re-enable; P1-10 G37 rights and SS17. Real participants remain unauthorized. |
| COM | P1-04_P1-05_P1-06_Commerce_Entitlements_v0_1_APPROVED_STANDARD.docx. Approved September 12, 2026. | D01–D14 and commerce controls; entitlement versus content, actual activation/expiry, Compass and customer ownership continuity. No executed tests or release inferred. |
| CFM4 | Created_for_More_Check-In_v4_Printable.docx. Current approved assessment specification; revised September 11, 2026. | Printable instrument, Scripture/practice references and public next-step/resource descriptions; actual website implementation separately audited. |
| BOOK | TLYB Book First Edit.docx. Current First-Sweep Edited Manuscript; copyright 2026; revision date not stated. | Copyright-page rights placeholder; Chapters 1, 5 and 19 observed quotations/references and personal Blueprint fields. Supporting teaching, not a license. |
| STUDY5 | v.5 The_Life_Youre_Building_6_Week_Mens_Study_Participant_Guide.docx. Current v5; revision date not stated. | Observed weekly NIV passages and final notice; supporting study publication requiring its own full audit. No v6 assumed. |
| EA | The Energy Audit Check In.docx. Current supporting assessment; version/date not stated. | Spiritual reflection, Scripture-practice references and resource destinations; no change to instrument identity or scoring. |
| FE | Fully_Engaged_Updated_Participant_Guide.docx. Current updated guide; version/date not stated. | Six weekly Scripture collections, original reflections/prayers, p.46 notice; supports bounded observed 21-block/51-verse inventory. |
| LG | 04_SB_Legacy_and_Legacy_Giving_Standard_v1.docx. Owner-designated governing Legacy standard; original approval date not assigned here. | Living Legacy/Legacy Giving, willing formation; p.2 NIV quotations and p.6 referenced registry/package. Stale creator-review metadata does not remove authority. |
| CTX3 | 00_STEWARD_CONTEXT_AND_DECISIONS_v3_APPROVED_CURRENT_CONTEXT.docx. Approved current context, September 11, 2026. | §§15–18 current OI4 routing, reference-only prototype and implementation honesty; later issue-specific approvals govern over stale queue entries. |
| SR4 | Steward_Source_Register_and_Review_Queue_v4_APPROVED_SOURCE_CONTROL.docx. Approved source-control register, September 11, 2026. | Canonical identity/format-copy principle, source authority and P1/P2 queues; supporting-material versions and LG authority preserved. |

<a id="RIGHTS-B0242"></a>
#### I.2 Official research register

<a id="RIGHTS-B0243"></a>
All entries were accessed or attempted in the original September 12, 2026 review. During the prior controlled owner-decision revision, the core distinctions in R01, R02, R03 and R05 were reconfirmed on September 12, 2026; the remaining entries were carried forward without re-verification. All dated findings are carried forward unchanged in this approval finalization; no new outside research or re-verification was performed. R01’s development-stage guidance supports the D05 timing refinement. Page/section titles identify the operative language for revalidation. Public policy findings are not evidence of an MJG executed agreement, and public-page rechecks do not complete RV01–RV08. Limited-access results remain explicitly marked. The concise findings are in §2; selected owner directions, implementation design and open review questions do not expand the licensors’ grants. [OD-REV]

<a id="RIGHTS-B0244"></a>
R01 — Biblica — Permissions

<a id="RIGHTS-B0245"></a>
https://www.biblica.com/permissions/

<a id="RIGHTS-B0246"></a>
Primary current general-use, platform, app/website, commercial routing and express AI-license requirements. The “What if my project is still in development?” guidance supports D05’s distinction between early scoping and an appropriately timed formal production-license application. Core distinctions reconfirmed September 12, 2026. Read the specific use rules together rather than isolating the general quotation paragraph.

<a id="RIGHTS-B0247"></a>
R02 — Biblica — Publisher AI Policy

<a id="RIGHTS-B0248"></a>
https://www.biblica.com/publisher-ai-policy/

<a id="RIGHTS-B0249"></a>
Version 1.2, effective June 1, 2026. License-dependent AI conditions; critical autonomous-publication exception and contract-fit questions. Not a public grant by itself.

<a id="RIGHTS-B0250"></a>
R03 — Biblica — Do I have to notify Biblica to use a Bible verse from the NIV?

<a id="RIGHTS-B0251"></a>
https://www.biblica.com/resources/bible-faqs/do-i-have-to-notify-biblica-to-use-a-bible-verse-from-the-niv/

<a id="RIGHTS-B0252"></a>
NIV-specific ordinary quotation, required notice, commercial commentary/reference-work trigger and narrow local-church notice provision. Confirm actual routing against R01.

<a id="RIGHTS-B0253"></a>
R04 — Biblica — Terms of Use

<a id="RIGHTS-B0254"></a>
https://www.biblica.com/terms-of-use/

<a id="RIGHTS-B0255"></a>
Copyright ownership, online-service use boundary and notice placement. Source for applicable website conditions, not permission to build a corpus.

<a id="RIGHTS-B0256"></a>
R05 — API.Bible — Scripture API for Developers

<a id="RIGHTS-B0257"></a>
https://api.bible/

<a id="RIGHTS-B0258"></a>
Current offering and commercial NIV availability statement; plan purchase is not underlying text permission.

<a id="RIGHTS-B0259"></a>
R06 — API.Bible — Terms and Conditions

<a id="RIGHTS-B0260"></a>
https://api.bible/terms-and-conditions

<a id="RIGHTS-B0261"></a>
Service/IP separation and actual contract-fit questions: permitted channels, third-party rights, attribution, reporting, storage and removal. Individual agreements/translation conditions require separate review.

<a id="RIGHTS-B0262"></a>
R07 — API.Bible — FAQ

<a id="RIGHTS-B0263"></a>
https://api.bible/faq

<a id="RIGHTS-B0264"></a>
Current provider clarification on caching, sublicense questions, reporting and returned passage spans; not an executed NIV grant.

<a id="RIGHTS-B0265"></a>
R08 — API.Bible — Common Questions (legacy developer documentation)

<a id="RIGHTS-B0266"></a>
https://docs.api.bible/common-questions/

<a id="RIGHTS-B0267"></a>
Legacy cache guidance differs from the current FAQ. Recorded for reconciliation, not adopted as the final policy.

<a id="RIGHTS-B0268"></a>
R09 — U.S. Copyright Office — Fair Use Index / More Information about Fair Use

<a id="RIGHTS-B0269"></a>
https://www.copyright.gov/fair-use/

<a id="RIGHTS-B0270"></a>
Authoritative general fair-use explanation: fact-specific assessment, no universal numerical safe harbor. Does not determine Steward’s particular use.

<a id="RIGHTS-B0271"></a>
R10 — U.S. Copyright Office — Copyright and Artificial Intelligence, Part 2 announcement

<a id="RIGHTS-B0272"></a>
https://www.copyright.gov/newsnet/2025/1060.html

<a id="RIGHTS-B0273"></a>
January 29, 2025 human-authorship/copyrightability guidance. Applied only to generated-content distinctions, not a guaranteed ownership conclusion.

<a id="RIGHTS-B0274"></a>
R11 — eBible.org — World English Bible copyright / public-domain statement

<a id="RIGHTS-B0275"></a>
https://ebible.org/eng-web/copyright.htm

<a id="RIGHTS-B0276"></a>
Official text-source declaration, Classic edition stability and naming conditions. Considered only for reviewed internal fixtures; no production translation expansion.

<a id="RIGHTS-B0277"></a>
R12 — Zondervan — Permissions

<a id="RIGHTS-B0278"></a>
https://www.zondervan.com/about-us/permissions/

<a id="RIGHTS-B0279"></a>
Official destination located; full-page access restricted during review. Indexed information not treated as a complete current permissions statement.

<a id="RIGHTS-B0280"></a>
R13 — HarperCollins Christian Publishing — Permissions

<a id="RIGHTS-B0281"></a>
https://www.harpercollinschristian.com/sales-and-rights/permissions/

<a id="RIGHTS-B0282"></a>
Official destination identified through Biblica; full-page access restricted during review. Obtain the applicable terms directly for the publication request.

<a id="RIGHTS-B0283"></a>
R14 — YouVersion — Platform

<a id="RIGHTS-B0284"></a>
https://platform.youversion.com/

<a id="RIGHTS-B0285"></a>
Official partner destination identified by Biblica; no verified commercial AI/PDF grant or account-specific terms supplied. Candidate inquiry only.

<a id="RIGHTS-B0286"></a>
#### I.3 Requirement-to-evidence traceability

<a id="RIGHTS-B0287"></a>
| Boundary | Governing basis | P1-09 location / evidence destination |
| --- | --- | --- |
| Preferred NIV / full-verse direction; no silent substitute | BRIEF; OD-REV D01–D03/D06; OI4 §3; T4 §13 | §§2–9, 19; D01–D03; SR01–06, 14–15; PG03–05, 08. |
| Life Verse agency; one canonical Blueprint; retained work | T4 §§3–7, 10–13; PJ; COM; OD-REV D02/D04 | §§5, 11, 14, 17; D02/D04; SR03, 06–08, 20, 31; PG09–10. |
| Autonomous conversation, no routine private transcript review | SAF D02/D04; OI4; PRIV; OD-REV D01/D05 | §§2.2, 4, 12, 23; D01; Q02/Q11; SR22, 28; PG05–06. |
| Private storage, context, logs, exports and disposition | P1-01; PRIV O03–O10/O12–O13 | §§6, 10–14, 18, 23; IM01/04/06/08; SR12–13, 26–29; PG06, 09–12. |
| No Scripture entitlement / sponsor rights inference | BRIEF; PJ §16; COM; PRIV O08 | §§1, 14–16, 22; SR07–08; PG13–14. |
| Publication fidelity / rights evidence distinct from source authority | T4 §13; CTX3 §16; SR4; R01–R09; OD-REV D05–D06 | §§2–3, 7–10, 13, 15–16, 21; SQ01–SQ21; PG03, 07–08. |
| No participant or unlicensed Scripture training | PRIV O10; SAF; R01–R02/R06 | §18; Appendix H; SR12–13, 21, 32; PG04–06, 11. |
| Separate actual release and proportionate stop/re-enable | SAF §18/G37/SS17/D08; COM release gates | §§22–24; PG01–PG16; all SR tests NOT RUN. |

<a id="RIGHTS-B0288"></a>
#### I.4 Coverage of the owner brief

<a id="RIGHTS-B0289"></a>
Parts 1–26 map to the matching numbered sections. Part 27 is fulfilled by the matching DOCX and Markdown format copies and Appendices A–I. Detailed decisions, licensor questions, professional/engineering requirements, tests, revision queue, gates, disabled uses and traceability appear in their respective end registers rather than being duplicated as competing policies.

<a id="RIGHTS-B0290"></a>
#### I.5 Final evidence and approval boundary

<a id="RIGHTS-B0291"></a>
Prepared: approved standard preserving the existing architecture, dated official research findings and bounded source-audit queue, with D01–D06 approved, D05’s staged inquiry/application timing preserved, and the applicable engineering requirements and acceptance specifications approved within scope. Implementation and test execution remain unverified. [OD-APP]

<a id="RIGHTS-B0292"></a>
Not evidenced: an executed NIV/AI/app/export agreement; final publication-specific ordinary-permission determinations; complete final-source quotation/word audits; provider/account configuration; implementation; test execution; completed professional reviews; publication release; real-participant authorization.

<a id="RIGHTS-B0293"></a>
Final status: APPROVED SCRIPTURE + PUBLICATION RIGHTS STANDARD. D01–D06 are APPROVED OWNER DIRECTION within this standard’s stated scope, approved by Michael J. Gauthier on September 12, 2026. Existing Steward governing sources retain their authority unchanged. SR01–SR32 remain NOT RUN. RV01–RV08 remain OPEN — NOT COMPLETED; PG01–PG16 remain OPEN — NOT EVIDENCED; SQ01–SQ21 remain OPEN. No licensor questions have been sent by this approval finalization. No NIV license, publication clearance, publication authorization or real-participant authorization is created or claimed. [OD-REV; OD-APP]

<a id="RIGHTS-B0294"></a>
### APPROVAL STATUS

<a id="RIGHTS-B0295"></a>
P1-09 Scripture + Publication Rights Standard v0.1 was approved by Michael J. Gauthier on September 12, 2026 within its stated scope.

<a id="RIGHTS-B0296"></a>
This approval establishes D01–D06 and the applicable Scripture/publication rights architecture, implementation requirements, acceptance-test specifications, publication-preflight requirements, rights-registry requirements, containment rules, and release-gate structure as governing Stewardship Blueprint / Steward direction within this standard’s scope.

<a id="RIGHTS-B0297"></a>
Approval establishes product and rights-governance policy. It does not constitute an NIV license, publication clearance, legal compliance opinion, implementation evidence, production approval, or authorization for real participants.

<a id="RIGHTS-B0298"></a>
#### Hard boundaries of approval

<a id="RIGHTS-B0299"></a>
This approval DOES NOT:

<a id="RIGHTS-B0300"></a>
constitute an NIV license;

<a id="RIGHTS-B0301"></a>
constitute permission from Biblica, HCCP/Zondervan, Hodder, API.Bible, YouVersion, or any other rights holder/provider;

<a id="RIGHTS-B0302"></a>
authorize exact NIV use in Steward;

<a id="RIGHTS-B0303"></a>
authorize NIV text ingestion into model context, retrieval, embeddings, training, fine-tuning, or evaluation;

<a id="RIGHTS-B0304"></a>
authorize publication of TLYB or another SB publication;

<a id="RIGHTS-B0305"></a>
authorize the current six-week guide;

<a id="RIGHTS-B0306"></a>
authorize Fully Engaged;

<a id="RIGHTS-B0307"></a>
authorize the referenced Legacy Academy package;

<a id="RIGHTS-B0308"></a>
authorize church copying, slides, projection, recording, livestreaming, or downloads beyond separately established rights;

<a id="RIGHTS-B0309"></a>
authorize a public-domain participant fallback;

<a id="RIGHTS-B0310"></a>
authorize multiple translations;

<a id="RIGHTS-B0311"></a>
authorize Scripture search/browse;

<a id="RIGHTS-B0312"></a>
authorize voice/audio Scripture;

<a id="RIGHTS-B0313"></a>
authorize a Bible database;

<a id="RIGHTS-B0314"></a>
authorize participant-content research/training;

<a id="RIGHTS-B0315"></a>
close SR01–SR32;

<a id="RIGHTS-B0316"></a>
close RV01–RV08;

<a id="RIGHTS-B0317"></a>
close PG01–PG16;

<a id="RIGHTS-B0318"></a>
close SQ01–SQ21;

<a id="RIGHTS-B0319"></a>
constitute legal advice or copyright compliance certification;

<a id="RIGHTS-B0320"></a>
modify the Statement of Faith;

<a id="RIGHTS-B0321"></a>
modify Legacy or Legacy Giving definitions;

<a id="RIGHTS-B0322"></a>
modify Template v4;

<a id="RIGHTS-B0323"></a>
modify autonomous Steward;

<a id="RIGHTS-B0324"></a>
modify privacy/security standards;

<a id="RIGHTS-B0325"></a>
authorize real participants;

<a id="RIGHTS-B0326"></a>
constitute the later P1-10 release decision.

### Preserved supplementary part: word/header1.xml

	STEWARD / PRODUCT DEVELOPMENT	P1-09 / v0.1

### Preserved supplementary part: word/footer1.xml

	APPROVED SCRIPTURE + PUBLICATION RIGHTS STANDARD	 / 

<!-- END_SOURCE RIGHTS -->
