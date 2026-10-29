---
name: mjg-approve-facilitators
description: Review and decide facilitator applications and get their Find a Group listings live. Use for "who's waiting to be approved", "approve the facilitators from <church>", "publish the new groups".
---

# Approve facilitators & groups

1. **What's waiting.** `facilitator_applications_list` (pending first). For each: `facilitator_application_get` — applicant, church, what they wrote.
2. **Check the church.** `church_get` for the church they named. Official church groups need the church's approval; a church admin normally decides — Super Admins can decide too.
3. **Decide.** `facilitator_application_decide` (approve or reject, with a short note) returns a preview → show it → `mjg_confirm` after a yes. Decide one person at a time unless told "approve all of these".
4. **Their groups.** `groups_list` (status draft) → for the approved facilitator's group, check it's complete (day, time, city/online). Fix details with `group_update`.
5. **Go live.** `group_set_status` published (preview → confirm). Find a Group itself must be open or in preview: `group_finder_status`.
6. Report back: who was approved/rejected, which groups went live, anything missing.

Never approve someone for a church they didn't name. An unapproved facilitator can't run an official church group — the app refuses it.
