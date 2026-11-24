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
