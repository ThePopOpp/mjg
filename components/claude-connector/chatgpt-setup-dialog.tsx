"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// What it takes to connect ChatGPT to MJG — the same steps as docs/mcp/chatgpt-setup.md,
// shown beside the ChatGPT switch in Settings → Claude & Agents → AI clients.

export function ChatgptSetupDialog({ connectorUrl, enabled }: { connectorUrl: string; enabled: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = connectorUrl.replace(/\/mcp$/, "");
  const copy = (value: string) => {
    navigator.clipboard?.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1500);
  };
  const CopyRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 font-mono text-[12.5px]">
      <span className="shrink-0 font-sans text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate">{value}</span>
      <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => copy(value)} aria-label={`Copy ${label}`}>
        {copied === value ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          Setup steps
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connecting ChatGPT to MJG</DialogTitle>
          <DialogDescription>
            ChatGPT uses the same connector, tools, rules and activity log as Claude. It's {enabled ? "switched on" : "switched off"} — while it's off,
            ChatGPT can sign in but every call is refused.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <section className="rounded-lg border border-[#b88a4a]/60 bg-[#b88a4a]/10 p-4">
            <h3 className="font-semibold">1 · Decide on the ChatGPT plan</h3>
            <p className="mt-1 text-muted-foreground">
              On ChatGPT <strong>Plus or Pro</strong>, custom connectors are <strong>read-only</strong> — ChatGPT could look things up in MJG but not
              create, change or delete anything. Full access needs a <strong>Business, Enterprise or Edu</strong> workspace. MJG is on Pro today, so
              either upgrade or use ChatGPT for read-only work and keep changes in Claude. Recheck OpenAI's current limits first — they change.
            </p>
          </section>

          <section>
            <h3 className="font-semibold">2 · Turn ChatGPT on here</h3>
            <p className="mt-1 text-muted-foreground">Flip the ChatGPT switch in AI clients. The connector itself must be On too (top of this page).</p>
          </section>

          <section>
            <h3 className="font-semibold">3 · Turn on Developer mode in ChatGPT</h3>
            <p className="mt-1 text-muted-foreground">
              Business: <em>Workspace Settings → Permissions &amp; Roles → Connected Data → Developer mode</em>. Pro: <em>Settings → Apps &amp; Connectors →
              Advanced → Developer mode</em>.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold">4 · Create the connector</h3>
            <p className="text-muted-foreground">
              In ChatGPT: <em>Settings → Connectors → Create</em>. Name it <strong>MJG</strong>, choose <strong>OAuth</strong> and let it discover the
              settings (pick dynamic registration if it asks). Only if it asks for addresses, use these — and don't swap the two:
            </p>
            <CopyRow label="Connector URL" value={connectorUrl} />
            <CopyRow label="Authorize" value={`${origin}/oauth/authorize`} />
            <CopyRow label="Token" value={`${origin}/api/oauth/token`} />
            <CopyRow
              label="Description"
              value="MJG (michaeljgauthier.com) website, blog, groups, participants, email, SMS and dashboard. High-risk actions return a preview; confirm with mjg_confirm."
            />
          </section>

          <section>
            <h3 className="font-semibold">5 · Sign in</h3>
            <p className="mt-1 text-muted-foreground">Sign in with your MJG Super Admin account when ChatGPT asks. If the first attempt fails, try once more.</p>
          </section>

          <section>
            <h3 className="font-semibold">6 · Test while it's a draft</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                Ask ChatGPT to run <code className="rounded bg-muted px-1">mjg_whoami</code> — it should show your account and client “ChatGPT”.
              </li>
              <li>List participants; create a test contact, then delete it (preview → confirm) and restore it.</li>
              <li>Check Recent activity below — filter by ChatGPT; every call should be there.</li>
              <li>Switch ChatGPT off here and confirm its next call is refused while Claude keeps working.</li>
            </ul>
            <p className="mt-2 text-muted-foreground">After each MJG update, press <strong>Refresh</strong> on the connector in ChatGPT to pick up new tools.</p>
          </section>

          <section>
            <h3 className="font-semibold">7 · Publish (Business only)</h3>
            <p className="mt-1 text-muted-foreground">
              <em>Workspace Settings → Apps → Drafts → Publish</em>. A published app on Business can't be updated — changing it means recreating and
              republishing — so publish once the tool list is settled.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
