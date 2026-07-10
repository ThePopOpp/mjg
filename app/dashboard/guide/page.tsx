import Link from "next/link";
import {
  Upload, UsersRound, LayoutDashboard, MousePointerClick, Camera, ClipboardCheck,
  SendHorizonal, Bot, Inbox, Info, ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const serif = { fontFamily: '"Fraunces", Georgia, serif' } as const;

function Card({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold leading-tight" style={serif}>{title}</h3>
        {badge ? (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {badge}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="relative pl-5 text-sm leading-6">
          <span className="absolute left-0 top-[9px] h-1.5 w-1.5 rounded-full bg-accent/80" />
          {it}
        </li>
      ))}
    </ul>
  );
}

export default function TeamGuidePage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Hero band */}
      <div className="overflow-hidden rounded-2xl border-b-[3px] border-accent bg-gradient-to-br from-[#1f3d2b] to-[#315f43] text-white shadow-sm">
        <div className="max-w-3xl px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e8cf9c]">Created for More</p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-[2.6rem]" style={serif}>
            Resources &amp; CMS — what&apos;s new and how it works
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-6 text-white/85">
            A short guide for Super Admins and the team on the new ways to send content and change requests into our build pipeline.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[13px]">
            <Info className="h-3.5 w-3.5" /> In the dashboard, click <b className="font-semibold">How it works</b> on any page for this same guide.
          </span>
        </div>
      </div>

      {/* Media Studio → Resources */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Media Studio</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.75rem]" style={serif}>Resources</h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-muted-foreground">
            A new <b>Resources</b> tab (next to Photos) for uploading reference material — feature requests, documents, designs, and assets. Every media type has a <b>Studio</b> sub-tab to create and a <b>Files</b> sub-tab for the library.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card icon={Upload} title="Uploading a resource">
            <Bullets items={[
              <><b>Upload</b> a PDF, JPEG, PNG, Word doc, text file, or other document type — or paste a <b>File URL</b> instead.</>,
              <>Add a <b>Title</b>, a <b>Resource type</b> (Feature request, Reference, Design, or Other), and <b>Description / notes</b>.</>,
              <>For feature requests, add as much detail as you like — it&apos;s read alongside the file.</>,
              <>Set <b>Status</b> and <b>Visibility</b>.</>,
            ]} />
          </Card>

          <Card icon={UsersRound} title="Share & notify" badge="Super Admin">
            <Bullets items={[
              <>Pick specific <b>Super Admins</b> to share a resource with.</>,
              <>Newly-added ones get a <b>dashboard notification</b> on save — editing later won&apos;t re-notify people already on it.</>,
              <>The <b>&quot;Share on&quot;</b> toggles choose where a published resource appears (Resources page, Frontend home, and more).</>,
            ]} />
          </Card>
        </div>

        <Link href="/dashboard/media-studio" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          Open Media Studio <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* CMS */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">CMS · Super Admin</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.75rem]" style={serif}>Frontend &amp; Dashboard editors</h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-muted-foreground">
            The CMS is where we review pages and collect, then triage, change requests from both the public site and the dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card icon={LayoutDashboard} title="Overview">
            <p className="text-sm leading-6 text-muted-foreground">
              The landing tab: quick-launch tiles plus at-a-glance stats — <b className="text-foreground">Pages</b>, <b className="text-foreground">Open requests</b>, <b className="text-foreground">Dev Queue</b>, <b className="text-foreground">In progress</b>, <b className="text-foreground">Completed</b>, and recent activity.
            </p>
          </Card>

          <Card icon={MousePointerClick} title="Frontend Editor">
            <Bullets items={[
              <>Open a public page and <b>click any element</b> — heading, card, section — to attach an edit or add request, with a type and priority.</>,
              <>Requests re-attach to the same element, so reviewers see exactly what you meant.</>,
            ]} />
          </Card>

          <Card icon={Camera} title="Dashboard Editor">
            <Bullets items={[
              <>The floating <b>Review</b> button captures and annotates a dashboard screen, then files a request.</>,
              <>These include a <b>screenshot</b>, can be <b>shared</b> with recipients, and support a <b>reply thread</b>.</>,
            ]} />
          </Card>

          <Card icon={ClipboardCheck} title="Edit Requests — triage">
            <Bullets items={[
              <>All requests, split into <b>Frontend Edits</b> and <b>Dashboard Edits</b> — Cards, List, or Table.</>,
              <>Open one to <b>reassign</b> the requester, change <b>status</b> (Open → In progress → Done), <b>Archive</b>, or <b>Delete</b>.</>,
            ]} />
          </Card>
        </div>

        <Link href="/dashboard/cms" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          Open CMS <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Hand-off */}
      <section className="space-y-5 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">The hand-off</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[1.75rem]" style={serif}>Send it to be built</h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-6 text-muted-foreground">
            Two actions appear on <b>each resource card</b> and <b>inside each edit request</b> — they connect your item to the build pipeline.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card icon={SendHorizonal} title="Send to Claude">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground">
                <SendHorizonal className="h-3.5 w-3.5" /> Send to Claude
              </span>
            </div>
            <Bullets items={[
              <>Adds the item to the <b>Dev Request Queue</b> — the list of things flagged to be implemented.</>,
              <>Captures all the detail, so the request is self-contained.</>,
              <>Re-sending updates the same entry (no duplicates); the button then reads <b>&quot;Queued for Claude.&quot;</b></>,
            ]} />
          </Card>

          <Card icon={Bot} title="Ask Steward">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-primary">
                <Bot className="h-3.5 w-3.5" /> Ask Steward
              </span>
            </div>
            <Bullets items={[
              <>Opens our in-app AI assistant, already loaded with that item.</>,
              <>Ask it to <b>summarize</b> the request, <b>outline</b> how it&apos;d be built, or <b>add it to the queue</b>.</>,
            ]} />
          </Card>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-primary/5 p-4">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary">
            <Inbox className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Dev Queue · CMS Overview</div>
            <p className="mt-0.5 text-sm">A tile on the CMS Overview shows how many items are waiting to be built. Click it to open Steward and triage the queue.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-4 text-sm text-muted-foreground shadow-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div>
            <b className="text-foreground">A note on access.</b> Sharing &amp; notify, Send to Claude, and the Dev Queue are <b className="text-foreground">Super Admin</b> features. Anyone on the team can upload resources and file edit requests.
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
          <span className="text-lg italic text-primary" style={serif}>Created for More.</span>
          <span className="text-right text-xs text-muted-foreground">Michael J. Gauthier · Dashboard team guide</span>
        </div>
      </div>
    </div>
  );
}
