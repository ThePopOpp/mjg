# Connecting ChatGPT to MJG

Expansion plan Phase 5. ChatGPT uses the **same endpoint, tools, rules and audit log** as Claude. Server prep is done in code (public-client OAuth + PKCE, dynamic registration, ChatGPT is labelled "ChatGPT" in Settings → Claude & Agents).

## Before you start — the plan question
On ChatGPT **Plus/Pro**, custom connectors in Developer Mode are **read-only**. Creating, updating and deleting needs **Business, Enterprise or Edu**. MJG is on **Pro** today, so either:
- upgrade to Business and get full CRUD, or
- connect on Pro for read-only use (reports, lookups) and keep every change in Claude.

Recheck OpenAI's current plan limits before deciding — they have changed before.

## Steps (workspace owner/admin)
1. In MJG: **Settings → Claude & Agents** — the connector is **On**. Copy the connector URL (`https://<your domain>/mcp`).
2. ChatGPT → **Workspace Settings → Permissions & Roles → Connected Data** → turn on **Developer mode**. (On Pro: Settings → Apps & Connectors → Advanced → Developer mode.)
3. **Settings → Connectors → Create**:
   - Name: `MJG`
   - Description: `MJG (michaeljgauthier.com) website, blog, groups, participants, email, SMS and dashboard. High-risk actions return a preview; confirm with mjg_confirm.`
   - URL: the connector URL from step 1
   - Authentication: **OAuth**. Let it discover the settings. If it asks for URLs: authorize `https://<domain>/oauth/authorize`, token `https://<domain>/api/oauth/token` (don't swap them). If it asks for a client registration method, choose dynamic registration (DCR).
4. Sign in with your **MJG Super Admin** account when prompted. If the first attempt fails, retry once.
5. Test in a chat while the connector is still a **draft** (checklist below). After each MJG deploy, press **Refresh** on the connector to pick up new tools.
6. Business only: **Workspace Settings → Apps → Drafts → Publish**. A published app on Business **can't be updated** — to change tools you recreate and republish it, so publish once the tool list is settled.

Turn ChatGPT off at any time in **Settings → Claude & Agents → AI clients** (Claude keeps working).

## Test checklist (run in Claude, then ChatGPT)
- [ ] `mjg_whoami` shows the right person, role and client (Claude / ChatGPT)
- [ ] Read: list participants, get one group roster
- [ ] Write: create a test contact, update it
- [ ] High: `contacts_delete` the test contact → preview → confirm → it's in `mjg_trash_list` → `mjg_restore` it (or Restore in Activity)
- [ ] Website: draft a section edit → preview link → discard the draft
- [ ] Blog: create a draft post → preview → leave it draft/hidden (no publish)
- [ ] SMS: `sms_check_consent` on Jeremy's number → `sms_send` to Jeremy only
- [ ] Church: an unapproved facilitator can't create an official church group (`group_create` with a `church_id` is refused)
- [ ] Settings → Claude & Agents → Activity shows every call above with the right client
- [ ] Connector switched off → both clients get "switched off" on the next call; ChatGPT switched off → only ChatGPT is refused
