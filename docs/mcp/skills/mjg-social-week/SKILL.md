---
name: mjg-social-week
description: Plan a week of MJG social posts from templates and save them as drafts or scheduled posts. Use for "plan this week's social", "schedule posts for next week".
---

# Social week plan

1. `list_social_accounts` — which platforms are connected (only plan for those). `list_social_templates` — active templates and automations.
2. `list_social_posts` (scheduled) — don't double-book days already covered. Recent `list_blog_posts` give fresh things to share.
3. Propose the week first as a short table: day · platform · template · one-line hook. Wait for a yes or edits.
4. Create each with `create_social_post` — status `draft`, or `scheduledAt` (ISO time) if they said to schedule. Fix wording later with `social_post_update`.
5. `publish_social_post` only if they ask for something to go out now — preview → `mjg_confirm` after a yes.

Voice: warm, direct, faith-forward, no hype; follow `get_brand_kit`. Hashtags sparingly (max 3).
