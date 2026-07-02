"use client";

import * as React from "react";
import { PanelsTopLeft, MousePointerClick, ClipboardList } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CmsPagesList } from "@/components/cms/cms-pages-list";
import { FrontendEdits, type FrontendPage } from "@/components/cms/frontend-edits";
import { EditRequests } from "@/components/cms/edit-requests";
import type { CmsPage } from "@/lib/cms/types";

export function CmsWorkspace({ initialPages, frontendPages }: { initialPages: CmsPage[]; frontendPages: FrontendPage[] }) {
  return (
    <Tabs defaultValue="pages" className="w-full">
      <TabsList>
        <TabsTrigger value="pages" className="gap-1.5"><PanelsTopLeft className="h-3.5 w-3.5" /> Pages</TabsTrigger>
        <TabsTrigger value="editor" className="gap-1.5"><MousePointerClick className="h-3.5 w-3.5" /> Frontend Editor</TabsTrigger>
        <TabsTrigger value="requests" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Edit Requests</TabsTrigger>
      </TabsList>
      <TabsContent value="pages" className="mt-4"><CmsPagesList initialPages={initialPages} /></TabsContent>
      <TabsContent value="editor" className="mt-4"><FrontendEdits pages={frontendPages} /></TabsContent>
      <TabsContent value="requests" className="mt-4"><EditRequests /></TabsContent>
    </Tabs>
  );
}
