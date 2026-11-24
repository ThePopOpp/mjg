# Facilitator Welcome Series

General welcome series for anyone who signs up to facilitate any plan through **ForgedLife** or **MJG**. First used for the **Compass launch**, and built to work for future facilitators, churches and studies.

## Purpose

- Congratulate and thank new facilitators
- Introduce MJG and Stewardship Blueprint
- Connect them with helpful resources

**Scope:** This series is separate from the study-specific automation tied to the facilitator's chosen plan and start date. It must **not** promise that study materials will arrive through this series.

---

## Schedule

| Timing | Message | Channel |
|---|---|---|
| Immediately after confirmed facilitator signup | Email 1 | Email |
| Same day, during appropriate daytime hours | Welcome Text | SMS (only with applicable SMS consent) |
| Two days after signup | Email 2 | Email |
| Five days after signup | Email 3 | Email |

## Enrollment Rules

- **Once per person.** Do not re-enroll when they facilitate another plan.
- **Deduplicate across sources.** Someone registering through both ForgedLife and MJG receives the series only once.
- **Study communications take priority.** When a welcome message overlaps with time-sensitive study communications, delay the welcome message.
- **No assessment reminders.** The assessment is an optional invitation, not a qualification for facilitating, and it does not trigger additional reminders or texts.

## Sender Settings

| Setting | Value |
|---|---|
| Sender name | `Michael J. Gauthier \| Stewardship Blueprint` |
| From address | Authenticated MJG email address |
| Reply-to | Monitored reply inbox |
| Personalization | `{{first_name}}` = preferred first name, with a natural fallback when missing (e.g. "Hi there,") |

## Positioning (use throughout)

- **Stewardship Blueprint** — a whole-life stewardship framework.
- **Steward** — your personal guide for designing and living a life that matters.

---

## Email 1 — Immediately after signup

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
> Connect with Michael: Instagram | Facebook | LinkedIn

**Primary button:** Open the Facilitator Handbook → `{{handbook_url}}`

---

## Welcome Text — Same day (SMS consent required)

```
MJG | Stewardship Blueprint: Thanks for signing up to facilitate, {{first_name}}! Your facilitator handbook: {{handbook_url}}. Reply STOP to unsubscribe.
```

---

## Email 2 — Two days after signup

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
> Already completed it? You might simply revisit what you noticed and ask: *What is worth protecting, and what needs attention in this season?*
>
> You choose what to share with others. You don't need a polished story—just a willingness to keep growing.
>
> Michael J. Gauthier
> Creator, Stewardship Blueprint
> MichaelJGauthier.com
>
> Connect with Michael: Instagram | Facebook | LinkedIn

**Primary button:** Explore the Created for More Check-In → `{{assessment_url}}`

---

## Email 3 — Five days after signup

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
> Connect with Michael: Instagram | Facebook | LinkedIn

**Primary button:** Explore MJG and the Available Resources → `{{resources_url}}`

---

## Layout & Link Requirements

- Each email's main resource link is the **primary button**.
- Social links sit in a **smaller row beneath the signature**.
- **Facebook:** display the label simply as "Facebook," linking to the full destination URL including the numeric ID.
- **Facebook redirect:** create a clean MJG redirect (e.g. `michaeljgauthier.com/facebook`). Use it **only after it's configured and tested**.

## Merge Fields

| Field | Status |
|---|---|
| `{{first_name}}` | Preferred first name with fallback |
| `{{handbook_url}}` | **Pending** — publish *Facilitating Meaningful Bible Study and Group Conversations* at a permanent, branded URL; used in Email 1 and the Welcome Text |
| `{{assessment_url}}` | Created for More Check-In page |
| `{{resources_url}}` | MJG resources page |
| Instagram / Facebook / LinkedIn URLs | Social row |

## Related Site Work

- Review the **homepage** and **assessment pages** for older wording and align them with the positioning above.

## Pre-Launch Test Checklist

- [ ] Test facilitator signup through **ForgedLife**
- [ ] Test facilitator signup through **MJG**
- [ ] Confirm duplicate enrollment is prevented
- [ ] Verify the handbook link
- [ ] Verify all other links (buttons + social row)
- [ ] Check reply routing to the monitored inbox
- [ ] Check mobile formatting
- [ ] Check SMS consent gating and opt-outs (STOP)
- [ ] Confirm study communications take priority over welcome messages

## Open Items

- [ ] **Final handbook file** from Mike
- [ ] Facebook profile URL with numeric ID (referenced as "supplied above," but not included in the request)
- [ ] Confirm destination URLs for Email 2 and Email 3 buttons
- [ ] Instagram and LinkedIn URLs