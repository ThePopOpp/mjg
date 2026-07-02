"use client";

import * as React from "react";
import { PanelsTopLeft, MousePointerClick, ClipboardList } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CmsPagesList } from "@/components/cms/cms-pages-list";
import { FrontendEdits, type FrontendPage } from "@/components/cms/frontend-edits";
import { EditRequests } from "@/components/cms/edit-requests";
import type { CmsPage } from "@/lib/cms/types";

type View = "pages" | "editor" | "requests";

export function CmsWorkspace({ initialPages, frontendPages }: { initialPages: CmsPage[]; frontendPages: FrontendPage[] }) {
  const [view, setView] = React.useState<View>("pages");

  // The Frontend Editor is a focused, full-width view: the CMS tabs + page header
  // are hidden (it has its own "Back to CMS" toolbar) so there's max room to work.
  if (view === "editor") {
    return <FrontendEdits pages={frontendPages} onBack={() => setView("pages")} onOpenRequests={() => setView("requests")} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Super Admin"
        title="CMS"
        description="Build frontend pages, and capture edit requests for both the public site (Frontend Edits) and the dashboard (Dashboard Edits). Super Admin only."
      />
      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="w-full">
        <TabsList>
          <TabsTrigger value="pages" className="gap-1.5"><PanelsTopLeft className="h-3.5 w-3.5" /> Pages</TabsTrigger>
          <TabsTrigger value="editor" className="gap-1.5"><MousePointerClick className="h-3.5 w-3.5" /> Frontend Editor</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Edit Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="pages" className="mt-4"><CmsPagesList initialPages={initialPages} /></TabsContent>
        <TabsContent value="requests" className="mt-4"><EditRequests /></TabsContent>
      </Tabs>
    </div>
  );
}
