# MichaelJGauthier.com — Website Alignment and Steward V2.0 QA Review

**Date:** November 11, 2026  
**Status:** Public-content review and launch-readiness recommendations; **not** a complete live-browser, account, payment, accessibility, performance, or penetration test.  
**Reviewer basis:** Accessible web snapshots of the public site, reviewed against the approved Stewardship Blueprint/Created for More v4 direction and the owner-approved *one public Free Steward experience* strategy. Public snapshots were indexed approximately 2–8 weeks before the review; recently changed live pages may differ.

## Executive conclusion

The site's overall positioning—whole-life stewardship, Christian faith, meaningful action, and a useful assessment—is directionally strong. The highest-impact work is **content alignment and accuracy of the assessment-to-Steward journey**, not a new site design. Three high-priority items deserve immediate verification: (1) the live Created for More assessment against the **exact approved v4 instrument**, (2) an outdated Wave 2 article that implies MJG staff routinely review private Blueprint content, and (3) public Free/Premium journeys, disclosures, and participant records after the V2.0 launch. The third item could not be functionally tested in this review.

## Priority findings

### P0-01 — Created for More online questions differ materially from approved v4

**Page:** https://michaeljgauthier.com/created-for-more-check-in  
**Approved comparison:** `Created_for_More_Check-In_v4_Printable.docx` (September 11, 2026), governing 28 statements, seven layers and 140-point total.

The accessible public page correctly describes 28 questions and seven layers, but several visible statements retain earlier wording. Examples:

| Field | Approved v4 | Public-page snapshot |
| --- | --- | --- |
| Foundation label | Mission + Values + **Direction** | Mission, Values & **Purpose** |
| Keystone Rhythms core prompt | "Do my repeated rhythms support the life I say I want?" | "Do my daily habits move me toward the life I say I want?" |
| Keystone Rhythms, first statement | "I have identified one or two keystone rhythms that strengthen other important areas of my life." | "I have identified one or two habits that, if kept, would change everything else." |
| Keystone Rhythms, fourth statement | "My rhythms support who I am becoming, rather than simply filling my to-do list." | "My habits are shaping my identity, not just filling my to-do list." |
| Legacy core prompt | "What am I helping others learn, practice, and pass on while I am living?" | "What is my life producing beyond me?" |
| Legacy, first statement | "I intentionally model the values I hope others will learn from my life." | "I am intentionally shaping what the next generation sees in me." |
| Legacy, third statement | "I model and explain generosity and invite others to practice it with me." | "I have had a real conversation about legacy with someone I love." |
| Legacy, fourth statement | "I give others opportunities to practice what they are learning and encourage them to pass it on." | "I am building something today that will outlast me." |

**Action:** Verify the *currently deployed* form (the accessible snapshot may be stale). If still different, replace all nonmatching prompts and statements with v4 exactly—not a merely similar paraphrase. Validate statement IDs, score categories, incomplete responses, tie handling, results save, exact response payload passed to Steward, and correct version recorded in the participant's assessment. Do not change approved v4 questions without a separate owner decision.

### P0-02 — Wave 2 article appears inconsistent with the current privacy and autonomy model

**Page:** https://michaeljgauthier.com/resources/welcome-to-wave-3 (page title: *Welcome to Wave 2*).

The page describes an invitation-oriented experience in which the "MJG team" understands each participant's story, receives their priorities, and reviews their Blueprint before a conversation. The current Steward model expressly does **not** authorize routine staff access to private participant Blueprints, assessment answers, journals, or transcripts; the product is public-first, and personal sharing requires explicit scoped authorization.

**Action:** Unpublish the page from current navigation or replace its copy with the present public self-directed model. If a distinct staff-supported professional service exists, label that as a *separate, expressly opted-in* service—not the default Steward experience. Fix the title/URL mismatch (Wave 2 at `/welcome-to-wave-3`).

### P0-03 — Public Free and Premium journeys require functional verification

**Pages not fully fetchable:** `/meet-steward`, `/steward/pricing`, `/personal-blueprint`, `/start`, `/assessments`, authenticated account flows.

**Action:** In a staging browser, demonstrate: public and Compass-referred users take the **same** Created for More form, receive equally substantive Free Steward guidance, can create the same Free three-page Blueprint, and can voluntarily buy the appropriate Full/Premium offer. Do **not** infer Compass affiliation from an inbound link or grant automatic Premium benefits. Verify checkout success, consent, receipts, entitlements, payment failure, cancellation, refund and account recovery. Separate the new approved recurring $299 first-year offer (only with explicit recurring authorization and subsequent activation) from legacy prepaid nonrenewing $299 agreements. No purchase-flow correctness is established by this textual audit.

### P0-04 — Review public-facing privacy/legal disclosures for current AI and age requirements

**Pages:** https://michaeljgauthier.com/privacy and https://michaeljgauthier.com/terms (both accessible versions dated July 16, 2026).

The general privacy policy lists collection of assessments and submissions but does not visibly explain in product-specific language Steward's AI processing, selection of continuity notes, raw-session handling, limits of staff/church access, or applicable new service-specific choices. These matters may be covered elsewhere; this audit could not verify that. The Terms permit interactive features for minors when parent/guardian-authorized/supervised, whereas the original Steward pilot direction was adults 18+.

**Action:** Have privacy/legal counsel and Jeremy reconcile the current deployed notices, actual vendor/data practices, account permissions, product-age limits and public-access scope. Verify that form consents and retention match real implementation. Do not merely modify legal text without verifying operations.

### P0-05 — Review NIV publication rights for existing public quotation

**Page:** https://michaeljgauthier.com/about

The accessible About page prints an extended passage attributed to **1 Timothy 6:17–19 (NIV)**. The approved source requirements distinguish Scripture references + original explanation in AI from separately licensed static publication use. No NIV rights clearance is established by the available evidence.

**Action:** Ask the publication-rights owner/counsel to verify whether the public quotation and attribution comply with applicable permissions; do not assume violation or authorization solely from the existence of the page. If unclear, prefer a citation and original commentary until rights review is complete.

### P1-01 — Homepage emphasis and framework terminology are mixed

**Page:** https://michaeljgauthier.com/

The retrieved page starts with a **"Meet Steward AI"** hero before introducing the Stewardship Blueprint, although the October development direction was to lead with the framework. It also uses **"Keystone Habits"** in a layer navigation and in the interactive framework text, while the approved current term is **"Keystone Rhythms."** The framework navigation omits explicit **Drift + Return**, even though it belongs in the overall framework (not as an eighth scored assessment layer). The text **"Layer 01 Crepidoma"** appears in the Bedrock area; this specialized architectural term risks confusing visitors.

**Action:** If the owner still prefers Blueprint-first positioning, lead with the life-building question and assessment CTA, then introduce Steward as the guide. Fix formal terminology throughout navigation, components, image text, tooltips and SEO. Keep the full seven scored layers, with Drift + Return as a living principle, not a scored layer. Review the unusual architectural label.

### P1-02 — Public demo uses a specific real household name

**Page:** https://michaeljgauthier.com/

The Steward example says a fictional participant's Blueprint names being present with "Kristi and the kids". This resembles the owner's real household rather than a clearly synthetic test persona; it may cause confusion about who is being depicted or how private information is used.

**Action:** Replace with a plainly fictional and generic example; do not display a real individual's private Blueprint data by implication. Make clear that proposals are not saved until actual participant approval and application confirmation.

### P1-03 — About page contains potentially stale positioning

**Page:** https://michaeljgauthier.com/about

The visible About page emphasizes **25,000 people / $1 billion** and says **Chapters 1 and 2 are live** and the book is being written chapter-by-chapter. Those may be historical targets rather than the current whole-life movement narrative. The page and footer also use an older navigation/visual treatment than the retrieved homepage.

**Action:** Ask Mike whether to retain historical numerical goals as dated milestones, move them into an earlier financial-stewardship initiative, or align the public page with today's Stewardship Blueprint direction and living Legacy. Confirm the book status and update assertions about available chapters. Unify site navigation/CTA terminology across templates.

### P1-04 — Six-week challenge and ForgedLife wording need a launch-readiness pass

**Pages:** https://michaeljgauthier.com/6-week-challenge and `/6-week-challenge/videos`.

The indexed video library labels **Week 3 and Week 6 "Coming Soon"**. The challenge landing page describes ForgedLife early access and asks participants to reply to emails with "ForgedLife". Confirm whether this matches the current launch plan. The Week 3 video description suggests choosing a single focus Pillar for 90 days; confirm that it doesn't imply the lowest-scoring Pillar is automatically selected.

**Action:** Verify final week-by-week assets, actual study start dates, facilitator links, approved ForgedLife entry instructions, and all links to the same public assessment. Do not let old pilot copy imply a special Steward entitlement. Complete media before those sessions are promoted as available.

### P1-05 — One-on-one booking could create an avoidable owner-capacity bottleneck

**Page:** https://michaeljgauthier.com/book and Resources quick-access links.

A public **30-minute Stewardship Consultation with Michael** is offered alongside a 45-minute pastor/church call and 15-minute MJG team discovery call. These can be useful offerings, but a high-volume public funnel could generate more personal sessions than the owner intends to deliver.

**Action:** Decide deliberately which consultation types are public, qualify them where necessary, and route routine individual questions to Steward rather than making a personal appointment the assumed next step. Preserve a distinct church/strategic partnership pathway.

### P1-06 — Subscription consent/supporting copy should say exactly what it does

**Page:** https://michaeljgauthier.com/

The visible "Join the Journey" form has separate options for email, SMS, anonymous feedback and personal follow-up, but the line beneath says information will **only** be used to send Blueprint updates. That simplified promise may not accurately describe separately opted-in feedback/follow-up uses.

**Action:** Align the short description with actual consent choices and the privacy notice. Keep permissions separate and optional. Verify a real form does not imply permission from unchecked boxes.

### P2-01 — Review older resource articles for tone, proof and licensed imagery

**Examples:** `/resources/stewardship-blueprint-embracing-god-s-call-to-generous-living` and `/resources/when-success-creates-concentration`.

The older generous-living article uses broad marketing claims and a "Testimonials" heading without identified, verifiable testimonials on the page. Some article images link to third-party domains. The faith/family/finance article legitimately focuses on a subset of the Blueprint, but some generic text could be mistaken for a full description of the framework.

**Action:** Remove unsupported testimonials/overgeneralized transformation claims, verify image rights, and identify older thematic articles as one lens on a complete four-Pillar framework. Preserve useful personal storytelling, especially the thoughtful "The Watch and the Wrong Scoreboard" piece.

## What's working well

- The homepage and Check-In present stewardship as more than money, frame assessment as reflection rather than a grade, and invite concrete action.
- The framework clearly includes Family, Fitness, Fun, and Finances as the Four Pillars.
- The current homepage uses living Legacy language in several places and describes Steward as participant-controlled.
- The public assessment entry is naturally usable both by direct visitors and Compass-referred visitors.
- The book and six-week study have discoverable supporting pages.

## Steward V2.0 functional validation plan — run on staging, then deployed version

1. **Instrument fidelity:** For each of the 28 approved v4 statements, compare visible exact wording and stable identifiers; verify 7 subtotals / 140 total, missing values, tie handling, date/version storage and interpreting results as evidence, not verdict.
2. **First Free response:** Give Steward a synthetic assessment with one protected strength and one meaningful area of tension. The reply should state correct section scores, explain a relevant Blueprint principle and *why* it matters, suggest one realistic next step, and invite the participant to choose a useful direction.
3. **Public/Compass parity:** Repeat the same test through a generic public link and a Compass referral link; outputs, access and Premium pricing should be materially equivalent. Attribution must not change permissions or entitlements.
4. **Free Blueprint:** Draft, approve, save, retrieve and edit exact participant-selected wording; show actual saved state, not an unsupported success claim. Preserve the 3-page Free architecture and keep Full-specific content gated.
5. **Premium commercial path:** Verify genuine value before upgrade; test purchase/activation with sandbox payments, legacy vs new recurring agreement, renewals, cancellation, refund/error handling, and access transitions.
6. **Returning participant:** Verify separately authorized continuity notes, accurate prior commitments, corrections and deletion; no automatic staff/church sharing, invented history or unauthorized record promotion.
7. **Conversational quality:** Test Listen First, Help Me Think, Help Me Take a Step, Guardrails, Drift + Return, protection rather than continual optimization, difficult choices, and scripture-reference rights boundaries.
8. **Operational QA:** Mobile/desktop usability, keyboard accessibility, signup/password reset, broken links, performance, analytics consent, security and privacy review. Use the actual 193-test engineering matrix; this shortlist does not replace it.

## Coverage and limitations

**Public text inspected:** Homepage; About; Mission; Created for More; Resources index; three Resources articles; six-week challenge landing; video library and Week 3; book waitlist; booking page; Privacy Policy; Terms of Service (approximately 14–15 unique pages).

**Not fully inspectable through current web access:** Meet Steward chat, pricing/checkout, personal Blueprint app, authentication/password reset, account/dashboard pages, most new learning/church pages, dynamic assessment submit/results behavior, actual forms, site rendering on mobile/desktop, integration/webhooks, analytics events and cookies. Several linked pages returned fetch/cache errors. Those are **access limitations, not evidence that the live pages are broken**. Public web text may be stale by weeks relative to the deployed code.

**Recommended handoff:** Send this findings register to Jeremy as a **site-content and journey QA punch list**, with P0 items verified in the live deployment. Keep the V2.0 engineering package authoritative; this document is a verification supplement and does not alter the Statement of Faith, current Blueprint instrument or release requirements.
