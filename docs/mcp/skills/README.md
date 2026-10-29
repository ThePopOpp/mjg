# MJG workflows — Claude skills and ChatGPT instructions

Each folder is one workflow, written once (expansion plan §7). They only call MJG connector tools, so they behave the same in either client.

| Skill | Use it for |
|---|---|
| `mjg-blog-post` | Mike pastes an article + title → house-style draft post + preview |
| `mjg-edit-website-page` | Draft a page change → preview link → publish on a clear yes |
| `mjg-approve-facilitators` | Facilitator applications → decisions → groups live |
| `mjg-weekly-status` | Read-only weekly report |
| `mjg-social-week` | A week of social drafts / scheduled posts |

## Claude
Zip each folder (the zip must contain the folder with `SKILL.md` inside), then **Claude → Settings → Capabilities → Skills → Upload skill**. For a Team/Enterprise org, an owner can add them for everyone. Claude picks a skill up automatically from its `description`.

## ChatGPT
Create a **Project** called "MJG", open **Project instructions**, and paste the body of each `SKILL.md` (everything under the `---` header) one after another, each under its own `## <skill name>` heading. Make sure the MJG connector is enabled for chats in that project.
