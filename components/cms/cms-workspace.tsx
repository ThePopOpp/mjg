"use client";

import * as React from "react";
import { PanelsTopLeft, MousePointerClick, ClipboardList, Info, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CmsPagesList } from "@/components/cms/cms-pages-list";
import { FrontendEdits, type FrontendPage } from "@/components/cms/frontend-edits";
import { EditRequests } from "@/components/cms/edit-requests";
import type { CmsPage } from "@/lib/cms/types";

type View = "pages" | "editor" | "requests";

const PAGE_INFO = "Build frontend pages, and capture edit requests for both the public site (Frontend Edits) and the dashboard (Dashboard Edits). Super Admin only.";

export function CmsWorkspace({ initialPages, frontendPages }: { initialPages: CmsPage[]; frontendPages: FrontendPage[] }) {
  const [view, setView] = React.useState<View>("pages");
  const [infoOpen, setInfoOpen] = React.useState(false);

  // The Frontend Editor is a focused, full-width view: the CMS tabs + page header
  // are hidden (it has its own "Back to CMS" toolbar) so there's max room to work.
  if (view === "editor") {
    return <FrontendEdits pages={frontendPages} onBack={() => setView("pages")} onOpenRequests={() => setView("requests")} />;
  }

  return (
    <div className="space-y-5">
      {/* Title + info icon (description lives in the modal to save vertical space) */}
      <div>
        <p className="text-xs font-semibold uppercase text-primary">Super Admin</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-normal sm:text-3xl">
          CMS
          <button onClick={() => setInfoOpen(true)} title="About this page" aria-label="About this page"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Info className="h-4 w-4" />
          </button>
        </h1>
      </div>

      {/* Single row of primary tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="w-full">
        <TabsList>
          <TabsTrigger value="pages" className="gap-1.5"><PanelsTopLeft className="h-3.5 w-3.5" /> Pages</TabsTrigger>
          <TabsTrigger value="editor" className="gap-1.5"><MousePointerClick className="h-3.5 w-3.5" /> Frontend Editor</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Edit Requests</TabsTrigger>
        </TabsList>
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
    </div>
  );
}
