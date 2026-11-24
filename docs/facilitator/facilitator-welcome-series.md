# Facilitator Welcome Series

General welcome series for anyone who signs up through **ForgedLife** or **MJG** to facilitate any plan. First use: the Compass launch. It must work the same way for future facilitators, churches and studies.

## Purpose

- Congratulate and thank new facilitators
- Introduce MJG and Stewardship Blueprint
- Connect them with helpful resources

This series is **separate** from the study-specific automation tied to each person's chosen plan and start date. It must **not** promise that study materials will arrive through this series.

---

## Schedule

| Timing | Message | Channel |
|---|---|---|
| Immediately after confirmed facilitator signup | Email 1 | Email |
| Same day, during appropriate daytime hours | Welcome text | SMS (only with applicable SMS consent) |
| Two days after signup | Email 2 | Email |
| Five days after signup | Email 3 | Email |

## Enrollment rules

- **Once per person.** Do not re-enroll when someone facilitates another plan.
- **No duplicates across sources.** Someone registering through both ForgedLife and MJG receives the series once.
- **Study communications take priority.** If a welcome message overlaps with time-sensitive study communications, send the study message and delay the welcome message.
- **SMS** goes only to people with applicable SMS consent.
- **Assessment is optional.** The Created for More Check-In is an invitation, not a requirement for facilitating. It does not trigger reminders, and there are no assessment-reminder texts.

## Sender and personalization

- **Sender name:** Michael J. Gauthier | Stewardship Blueprint
- **From address:** authenticated MJG email address
- **Reply-to:** monitored inbox
- **First name:** `{{first_name}}` uses the person's preferred first name, with a natural fallback when it's missing (e.g. "Hi there,")

## Positioning (use throughout)

- **Stewardship Blueprint**: a whole-life stewardship framework.
- **Steward**: your personal guide for designing and living a life that matters.

Also review the **homepage** and **assessment pages** for older wording, and update them to match this positioning.

## Layout rules

- Each email's main resource link is the **primary button**.
- Social links (Instagram | Facebook | LinkedIn) go in a **smaller row beneath the signature**.
- Under the social row, every email has an **unsubscribe link** (to `/email/opt-out`) and the **postal address**. Both are legally required for these emails (CAN-SPAM).
- **Facebook:** display the link text as just "Facebook" and use the full destination URL, including the numeric ID.
- **Optional:** create a clean redirect such as `michaeljgauthier.com/facebook`. Use it only after it has been configured and tested.

---

## Email 1: Immediately after signup

**Subject:** Welcome—and thank you for stepping up
**Preview text:** You're helping create space for meaningful conversations and faithful next steps.

> Hi {{first_name}},
>
> Congratulations on taking this step, and thank you for signing up to facilitate. Your willingness to invest in others matters.
>
> I'm Michael J. Gauthier—Mike—a husband, father, and the creator of Stewardship Blueprint. This is a whole-life stewardship framework that connects faith, purpose, relationships, health, joy, resources, guardrails, habits, energy, and legacy. It helps people faithfully steward what God has entrusted to them and build lives that matter.
>
> Whether you're facilitating for the first time or have led groups for years, you don't need to have every answer. Thoughtful preparation, genuine care, and a willingness to grow alongside others are a strong place to begin.
>
> As a resource, I'd encourage you to keep our handbook, *Facilitating Meaningful Bible Study and Group Conversations*, close at hand.
>
> **[Open the Facilitator Handbook →]({{handbook_url}})**
>
> I'm grateful you're part of this. Thank you for making room for people to open Scripture, reflect honestly, and take a faithful next step together.
>
> Michael J. Gauthier
> Creator, Stewardship Blueprint
> MichaelJGauthier.com
>
> <small>Connect with Michael: Instagram | Facebook | LinkedIn</small>

**Primary button:** Open the Facilitator Handbook → `{{handbook_url}}`

---

## Welcome text: Same day (SMS consent only)

Send during appropriate daytime hours in the recipient's local time. We don't store a time zone per person, so texts go out **11am–5pm Arizona time**, which is daytime in every US time zone (8am Hawaii at the earliest, 8pm Eastern at the latest).

```
MJG | Stewardship Blueprint: Thanks for signing up to facilitate, {{first_name}}! Your facilitator handbook: {{handbook_url}}. Reply STOP to unsubscribe.
```

---

## Email 2: Two days after signup

**Subject:** There's room for your own growth, too
**Preview text:** You're part of the journey—not just the person guiding the conversation.

> Hi {{first_name}},
>
> One thing I hope you experience as a facilitator is that this journey is for you, too.
>
> You don't have to put your own growth on hold while helping others. You can reflect, ask questions, make adjustments, and practice the same honesty you hope to encourage in your group.
>
> A helpful place to begin is the Created for More Check-In. It offers a chance to pause, recognize what is healthy, and notice what may need your attention.
>
> **[Explore the Created for More Check-In →]({{assessment_url}})**
>
> This isn't a test of whether you're ready to lead. It's an invitation to see your own life more clearly and consider one faithful next step.
>
> Already completed it? You might simply revisit what you noticed and ask: What is worth protecting, and what needs attention in this season?
>
> You choose what to share with others. You don't need a polished story—just a willingness to keep growing.
>
> Michael J. Gauthier
> Creator, Stewardship Blueprint
> MichaelJGauthier.com
>
> <small>Connect with Michael: Instagram | Facebook | LinkedIn</small>

**Primary button:** Explore the Created for More Check-In → `{{assessment_url}}`

---

## Email 3: Five days after signup

**Subject:** A few resources for the life you're building
**Preview text:** Get to know MJG, Stewardship Blueprint, and the support available to you.

> Hi {{first_name}},
>
> I created MichaelJGauthier.com as a place to share teaching and practical resources that help people design and live a life rooted in faithful stewardship.
>
> Stewardship Blueprint is the framework. Assessments help you reflect on your current season. Studies create opportunities to explore Scripture, have meaningful conversations, and put what you're learning into practice.
>
> Steward is your personal guide for designing and living a life that matters. It offers help reflecting on what matters, clarifying your priorities, and developing your Personal Stewardship Blueprint.
>
> One way to begin is to ask:
>
> *"Help me reflect on this season of my life and choose one faithful next step."*
>
> ForgedLife supports community, practice, and accountability as you live out those commitments with others.
>
> **[Explore MJG and the Available Resources →]({{resources_url}})**
>
> There's no need to use everything. Begin with what is useful in your current season.
>
> Let's stay connected. I'd also love to connect with you on social media. Follow along for reflections, practical encouragement, and ideas for living out the Stewardship Blueprint in everyday life. Choose whichever platform you use most.
>
> Thank you again for investing in others. My hope is that you find encouragement and clarity for your own life along the way.
>
> Michael J. Gauthier
> Creator, Stewardship Blueprint
> MichaelJGauthier.com
>
> <small>Connect with Michael: Instagram | Facebook | LinkedIn</small>

**Primary button:** Explore MJG and the Available Resources → `{{resources_url}}`

---

## Link variables

| Variable | Used in | Status |
|---|---|---|
| `{{handbook_url}}` | Email 1, welcome text | **Ready:** `https://michaeljgauthier.com/facilitator-handbook` (Handbook v1, 17 pages). The link redirects to the PDF, so a v2 only changes the file it points to (`next.config.ts`) |
| `{{assessment_url}}` | Email 2 | Confirm the Created for More Check-In URL |
| `{{resources_url}}` | Email 3 | Confirm the destination page on MichaelJGauthier.com |
| Instagram URL | All email footers | Confirm |
| Facebook URL | All email footers | **Needed.** The full URL with numeric ID was referenced but not included in the brief |
| LinkedIn URL | All email footers | Confirm |
| Postal address | All email footers | **Needed.** Required by law. Mike prefers not to use a personal address: a PO box or a virtual mailbox works and keeps his home address private |
| Reply-to inbox | All emails | Recommended: `hello@michaeljgauthier.com`, the address every MJG email already sends from. Leaving `FACILITATOR_WELCOME_REPLY_TO` unset sends replies there; someone must check it |

## Pre-launch test checklist

- [ ] Test facilitator signup through **ForgedLife**
- [ ] Test facilitator signup through **MJG**
- [ ] Confirm duplicate enrollment is prevented (same person signs up through both)
- [ ] Confirm re-enrollment doesn't happen when a facilitator joins another plan
- [ ] Confirm study communications take priority and welcome messages are delayed when they overlap
- [ ] Verify the handbook link and all other links
- [ ] Verify the first-name fallback
- [ ] Check reply routing to the monitored inbox
- [ ] Check mobile formatting (button and social row)
- [ ] Check email unsubscribe and SMS STOP opt-outs
- [ ] Confirm SMS goes only to people with consent, during daytime hours
- [ ] Confirm no assessment-reminder texts fire

## Open items for Mike

1. ~~Final handbook file~~ Received (v1); hosted at `/facilitator-handbook`
2. Full Facebook URL, including the numeric ID (plus Instagram and LinkedIn)
3. Destination URLs for the Email 2 and Email 3 buttons
4. Decision on the `/facebook` redirect
5. Postal address for the email footer
6. Which inbox replies should go to

## Where it lives

- Built in `lib/facilitator-welcome/series.ts` (migrations 202611160143 and 202611170144). It is **off** until the handbook link, the postal address and at least one social link are set.
- Links, address and the on/off switch: **Emails → Automations → Facilitator Welcome Series**.
- Email copy: **Emails → Templates** (Facilitator Welcome Series). Keep `{{unsubscribe_html}}` in each template; an email without it won't send.