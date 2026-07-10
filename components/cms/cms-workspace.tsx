"use client";

import * as React from "react";
import { LayoutDashboard, PanelsTopLeft, MousePointerClick, ClipboardList, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CmsPagesList } from "@/components/cms/cms-pages-list";
import { FrontendEdits, type FrontendPage } from "@/components/cms/frontend-edits";
import { EditRequests } from "@/components/cms/edit-requests";
import { CmsOverview, type CmsNav } from "@/components/cms/cms-overview";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import { PageHelp } from "@/components/dashboard/page-help";
import { CMS_HELP, CMS_HELP_INTRO, CMS_HELP_TITLE } from "@/lib/content/help-text";
import type { CmsPage } from "@/lib/cms/types";

type View = "overview" | "pages" | "editor" | "requests";

const STEWARD_CONTEXT =
  "You are Steward helping with the MJG CMS. You can list, create, and update CMS DRAFT pages and answer questions about pages and edit requests. Everything you author is a draft for a Super Admin to review — never publish or edit the live site.";

export function CmsWorkspace({ initialPages, frontendPages, displayName }: { initialPages: CmsPage[]; frontendPages: FrontendPage[]; displayName?: string }) {
  const [view, setView] = React.useState<View>("overview");
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
          <PageHelp title={CMS_HELP_TITLE} intro={CMS_HELP_INTRO} sections={CMS_HELP} />
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
