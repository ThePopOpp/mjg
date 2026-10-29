---
name: mjg-edit-website-page
description: Edit a page on michaeljgauthier.com safely — draft the change, share a preview link, publish only on a clear yes. Use for "change the wording on…", "update the … section", "add a section to …".
---

# Edit a website page

1. **Find it.** `website_list_pages` (or `website_search` for a phrase). Marketing pages with fixed layouts (home, Steward, Blueprint…) are edited with the `content_*` tools instead: `content_list_pages` → `content_get`.
2. **Read before writing.** `website_get_page` (or `content_get`) — always, so you keep every section id and field you aren't changing.
3. **Draft the change.**
   - One section: `website_edit_section` (or `content_save_draft` with only the changed fields).
   - Several sections: `website_propose_change` with the FULL ordered section list.
   - Only approved components (`website_list_components`). If something new is needed, `website_request_component` — don't fake it.
4. **Preview.** `website_create_preview_link` (or `content_preview_link`) and send the link. Say exactly what changed.
5. **Publish** only when asked: `website_publish_page` / `content_publish` return a preview → show it → `mjg_confirm` after a clear yes. Every publish is versioned (`website_list_versions`, `content_versions`) and can be rolled back.
6. Throw a draft away with `content_discard_draft` if they change their mind.

Typography rules for MJG pages: no line ending on a single orphan word; centred lines roughly equal; buttons in a pair the same width; nothing should clip on a phone.
