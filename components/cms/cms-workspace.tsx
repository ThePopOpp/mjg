"use client";

import * as React from "react";
import { PanelsTopLeft, MousePointerClick, LayoutDashboard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CmsPagesList } from "@/components/cms/cms-pages-list";
import { FrontendEdits, type FrontendPage } from "@/components/cms/frontend-edits";
import { DashboardEdits } from "@/components/cms/dashboard-edits";
import type { CmsPage } from "@/lib/cms/types";

export function CmsWorkspace({ initialPages, frontendPages }: { initialPages: CmsPage[]; frontendPages: FrontendPage[] }) {
  return (
    <Tabs defaultValue="pages" className="w-full">
      <TabsList>
        <TabsTrigger value="pages" className="gap-1.5"><PanelsTopLeft className="h-3.5 w-3.5" /> Pages</TabsTrigger>
        <TabsTrigger value="frontend" className="gap-1.5"><MousePointerClick className="h-3.5 w-3.5" /> Frontend Edits</TabsTrigger>
        <TabsTrigger value="dashboard" className="gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" /> Dashboard Edits</TabsTrigger>
      </TabsList>
      <TabsContent value="pages" className="mt-4"><CmsPagesList initialPages={initialPages} /></TabsContent>
      <TabsContent value="frontend" className="mt-4"><FrontendEdits pages={frontendPages} /></TabsContent>
      <TabsContent value="dashboard" className="mt-4"><DashboardEdits /></TabsContent>
    </Tabs>
  );
}
