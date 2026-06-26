import Link from "next/link";
import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wizard — Social Media — MJG" };

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Connect your platforms",
    body: (
      <>
        Go to <Link href="/dashboard/social-media/settings" className="text-primary underline">Settings</Link> and enter credentials for{" "}
        <strong>Facebook</strong> and <strong>LinkedIn</strong> (Page/Org IDs, access tokens, profile URLs). Set the account to{" "}
        <strong>Connected</strong> and <strong>Active</strong>. You can add more platforms later — the model is extendable.
      </>
    ),
  },
  {
    title: "2. Build a post template",
    body: (
      <>
        Open the <Link href="/dashboard/social-media/editor" className="text-primary underline">Block Editor</Link>. Drag in heading, text,
        quote, image, link, call-to-action, and hashtag blocks. Reorder them, watch the live preview, and use{" "}
        <code>{"{{merge_fields}}"}</code> like <code>{"{{event_title}}"}</code> for reusable copy. Save it to your{" "}
        <Link href="/dashboard/social-media/templates" className="text-primary underline">Templates</Link> library.
      </>
    ),
  },
  {
    title: "3. Compose & schedule",
    body: (
      <>
        In <Link href="/dashboard/social-media/compose" className="text-primary underline">Compose</Link>, pick an account, optionally load a
        template, fill in any merge fields, and choose <strong>Save draft</strong>, <strong>Schedule</strong> (date + time), or{" "}
        <strong>Publish now</strong>. Everything you create shows up under{" "}
        <Link href="/dashboard/social-media/history" className="text-primary underline">History</Link>.
      </>
    ),
  },
  {
    title: "4. Automate",
    body: (
      <>
        Use <Link href="/dashboard/social-media/automations" className="text-primary underline">Automations</Link> to bind a template to an
        event — e.g. auto-draft a promo post when a blog post or event is published. Drafts wait in History for your review before going out.
      </>
    ),
  },
  {
    title: "5. Manage the inbox",
    body: (
      <>
        The <Link href="/dashboard/social-media/inbox" className="text-primary underline">Inbox</Link> gathers messages, comments, reviews,
        and mentions. Reply, mark read, and archive. (Live syncing turns on once platform connections are finalized.)
      </>
    ),
  },
  {
    title: "6. Review analytics & ask Siggey",
    body: (
      <>
        <Link href="/dashboard/social-media/analytics" className="text-primary underline">Analytics</Link> shows cadence, engagement, and top
        posts. In the <Link href="/dashboard/ai-agent" className="text-primary underline">AI Agent</Link>, ask Siggey to draft posts, build
        templates, schedule content, summarize your reports, and analyze what&apos;s performing.
      </>
    ),
  },
];

export default function SocialWizardPage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Wizard" description="A guided walkthrough of the whole social workflow — from connecting platforms to letting Siggey help." />
      <SocialTabs active="wizard" />
      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <details key={i} open={i === 0} className="group rounded-xl border border-border bg-card">
            <summary className="cursor-pointer list-none px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between">{s.title}<span className="text-muted-foreground transition-transform group-open:rotate-90">›</span></span>
            </summary>
            <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">{s.body}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
