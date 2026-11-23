# Connecting OpenAI Codex to MJG

Codex (the CLI, IDE extension and `codex_local` agents in Paperclip) talks to the
MJG connector at `https://michaeljgauthier.com/mcp`. There are two ways to sign
it in. **Use an agent token unless a person is sitting at the keyboard.**

## Option 1: agent token (recommended for agents and automation)

1. In MJG go to **Claude & Agents → New agent token**. Name it after what it does
   (e.g. `Codex: Content & Social`) and tick only the areas it needs. The secret
   (`mjg_ag_…`) is shown once.
2. Put the secret in an environment variable on the machine that runs Codex:
   ```sh
   export MJG_AGENT_TOKEN="mjg_ag_…"        # PowerShell: $env:MJG_AGENT_TOKEN = "mjg_ag_…"
   ```
3. Add the server to `~/.codex/config.toml`:
   ```toml
   [mcp_servers.mjg]
   url = "https://michaeljgauthier.com/mcp"
   bearer_token_env_var = "MJG_AGENT_TOKEN"
   ```
4. Check it: `codex mcp list` shows `mjg`. In a Codex session, ask it to call
   `mjg_whoami`.

Calls show in **Recent activity** under **Agent**. High-risk actions (publishing,
sending to many people, deleting) don't run. They wait in **Waiting for your
approval**, and only a person can approve them. Pause or revoke the token on the
same page at any time.

## Option 2: OAuth sign-in (a person using Codex interactively)

```toml
[mcp_servers.mjg]
url = "https://michaeljgauthier.com/mcp"
```
Then run `codex mcp login mjg`. A browser opens the MJG consent page, and a Super
Admin approves it. This connection has **full access** with that person's
permissions, like Claude. It shows as **Codex** under AI clients, with its own
on/off switch and activity filter.

## Requirements

- The connector must be switched on (Claude & Agents → Connector).
- Only Super Admins can approve an OAuth sign-in or create agent tokens.
- Codex isn't held behind the ChatGPT switch; it has its own.
