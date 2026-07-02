"use client";

import * as React from "react";
import { LayoutDashboard, PanelsTopLeft, MousePointerClick, ClipboardList, Info, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CmsPagesList } from "@/components/cms/cms-pages-list";
import { FrontendEdits, type FrontendPage } from "@/components/cms/frontend-edits";
import { EditRequests } from "@/components/cms/edit-requests";
import { CmsOverview, type CmsNav } from "@/components/cms/cms-overview";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import type { CmsPage } from "@/lib/cms/types";

type View = "overview" | "pages" | "editor" | "requests";

const PAGE_INFO =
  "Your control center for MJG's frontend and dashboard content. From here you can build and edit CMS pages (Block Builder), visually review and annotate live pages (Frontend Editor), capture and triage edit requests from both the public site and the dashboard, track status and who requested what, and hand work to Steward AI. Super Admin only.";

const STEWARD_CONTEXT =
  "You are Steward helping with the MJG CMS. You can list, create, and update CMS DRAFT pages and answer questions about pages and edit requests. Everything you author is a draft for a Super Admin to review — never publish or edit the live site.";

export function CmsWorkspace({ initialPages, frontendPages, displayName }: { initialPages: CmsPage[]; frontendPages: FrontendPage[]; displayName?: string }) {
  const [view, setView] = React.useState<View>("overview");
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [stewardOpen, setStewardOpen] = React.useState(false);

  const nav: CmsNav = {
    pages: () => setView("pages"), editor: () => setView("editor"),
    requests: () => setView("requests"), steward: () => setStewardOpen(true),
  };

  // The Frontend Editor is a focused, full-width view: the CMS tabs + page header
  // are hidden (it has its own "Back to CMS" toolbar) so there's max room to work.
  if (view === "editor") {
    return <FrontendEdits pages={frontendPages} onBack={() => setView("overview")} onOpenRequests={() => setView("requests")} />;
  }

  return (
    <div className="space-y-5">
      {/* Title + info icon (description lives in the modal to save vertical space) */}
      <div>
        <p className="text-xs font-semibold uppercase text-primary">{displayName ? `${displayName} · Super Admin` : "Super Admin"}</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-normal sm:text-3xl">
          CMS
          <button onClick={() => setInfoOpen(true)} title="About this page" aria-label="About this page"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Info className="h-4 w-4" />
          </button>
        </h1>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="w-full">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="pages" className="gap-1.5"><PanelsTopLeft className="h-3.5 w-3.5" /> Pages</TabsTrigger>
          <TabsTrigger value="editor" className="gap-1.5"><MousePointerClick className="h-3.5 w-3.5" /> Frontend Editor</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Edit Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-5"><CmsOverview pages={initialPages} nav={nav} /></TabsContent>
        <TabsContent value="pages" className="mt-5"><CmsPagesList initialPages={initialPages} /></TabsContent>
        <TabsContent value="requests" className="mt-5"><EditRequests /></TabsContent>
      </Tabs>

      {infoOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setInfoOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><Info className="h-4 w-4 text-primary" /> About CMS</h2>
              <button onClick={() => setInfoOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{PAGE_INFO}</p>
          </div>
        </div>
      )}

      {stewardOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setStewardOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl">
            <button onClick={() => setStewardOpen(false)} className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"><X className="h-4 w-4" /></button>
            <AgentChat title="Steward AI" subtitle="CMS assistant" audio extraContext={STEWARD_CONTEXT}
              suggestions={["What edit requests are still open?", "Create a draft landing page for the Stewardship Blueprint.", "Summarize the requests for the Home page.", "List my CMS pages and their status."]}
              placeholder="Ask Steward about pages or requests…" heightClassName="h-[68vh] min-h-[420px]"
              emptyTitle="Steward — CMS assistant" emptyHint="I can draft & edit CMS pages and answer questions about pages and edit requests. Drafts only — I won't publish or touch the live site." />
          </div>
        </div>
      )}
    </div>
  );
}
