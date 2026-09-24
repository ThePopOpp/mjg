"use client";

// Frontend Editor workspace — the tabbed home of CMS → Editor (spec §5).
//
// Overview · Pages · Navigation · Media · Global content · Settings, plus a
// Steward panel that can be opened from anywhere in the module.

import * as React from "react";
import { Bot, Globe, ImageIcon, LayoutDashboard, Link2, PanelsTopLeft, Settings, Wand2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFabVisible } from "@/components/layout/fab-visibility";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import { EditAPage } from "./edit-a-page";
import { GlobalsManager } from "./globals-manager";
import { MediaManager } from "./media-manager";
import { NavigationManager } from "./navigation-manager";
import { PagesList } from "./pages-list";
import { SettingsPanel } from "./settings-panel";
import { WebsiteOverview } from "./overview";
import type { WebsitePageSummary } from "@/lib/website/types";

type View = "overview" | "edit" | "pages" | "navigation" | "media" | "globals" | "settings";

const STEWARD_CONTEXT =
  "The user is in the MJG Frontend Editor (CMS → Editor), which manages the public website: pages, sections, " +
  "navigation, global content and SEO. Use the website_* tools for anything about the public site. Always read " +
  "before you write, propose changes into the draft, and never publish without explicit approval.";

const STEWARD_PROMPTS = [
  "What pages are on the website and which have unpublished changes?",
  "Create a new page called Steward AI explaining what it does, with a pricing call to action.",
  "Rewrite the hero on the Kingdom Stewardship page.",
  "Add Steward AI under Resources in the navigation.",
  "Which pages are missing an SEO title or description?",
  "Check the site for broken internal links.",
  "Show me what changed on the website this week.",
];

export function WebsiteWorkspace({
  initialPages,
  displayName,
}: {
  initialPages: WebsitePageSummary[];
  displayName?: string;
}) {
  const [view, setView] = React.useState<View>("overview");
  const [stewardOpen, setStewardOpen] = React.useState(false);
  // The quick-actions FAB owns the bottom-right corner on md+ screens. Step aside
  // when it is there, and reclaim the corner when it is hidden.
  const { visible: fabVisible } = useFabVisible();
  const [newPageSignal, setNewPageSignal] = React.useState(0);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase text-primary">{displayName ? `${displayName} · Super Admin` : "Super Admin"}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">Website Editor</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Manage the public website — pages, sections, navigation, media and SEO — without touching code. Everything you
          or Steward change lands in a draft first, is previewable, is versioned, and can be rolled back.
        </p>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="w-full">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="edit" className="gap-1.5"><Wand2 className="h-3.5 w-3.5" /> Edit a page</TabsTrigger>
          <TabsTrigger value="pages" className="gap-1.5"><PanelsTopLeft className="h-3.5 w-3.5" /> Pages</TabsTrigger>
          <TabsTrigger value="navigation" className="gap-1.5"><Link2 className="h-3.5 w-3.5" /> Navigation</TabsTrigger>
          <TabsTrigger value="media" className="gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Media</TabsTrigger>
          <TabsTrigger value="globals" className="gap-1.5"><Globe className="h-3.5 w-3.5" /> Global content</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> Settings &amp; history</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <WebsiteOverview
            nav={{
              pages: () => setView("pages"),
              navigation: () => setView("navigation"),
              media: () => setView("media"),
              steward: () => setStewardOpen(true),
              editPage: () => setView("edit"),
              newPage: () => { setView("pages"); setNewPageSignal((n) => n + 1); },
            }}
          />
        </TabsContent>
        <TabsContent value="edit" className="mt-5"><EditAPage pages={initialPages} /></TabsContent>
        <TabsContent value="pages" className="mt-5">
          <PagesList key={newPageSignal} initialPages={initialPages} />
        </TabsContent>
        <TabsContent value="navigation" className="mt-5"><NavigationManager /></TabsContent>
        <TabsContent value="media" className="mt-5"><MediaManager /></TabsContent>
        <TabsContent value="globals" className="mt-5"><GlobalsManager /></TabsContent>
        <TabsContent value="settings" className="mt-5"><SettingsPanel /></TabsContent>
      </Tabs>

      {!stewardOpen ? (
        <button
          onClick={() => setStewardOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#b88a4a] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90",
            // The FAB is a 48px circle inset 20px, and is hidden below md.
            fabVisible && "md:right-[5.5rem]",
          )}
        >
          <Bot className="h-4 w-4" /> Ask Steward
        </button>
      ) : null}

      {stewardOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setStewardOpen(false)} aria-hidden />
          <div className="relative z-10 w-full max-w-2xl">
            <button
              onClick={() => setStewardOpen(false)}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <AgentChat
              title="Steward"
              subtitle="Website editor"
              audio
              extraContext={STEWARD_CONTEXT}
              suggestions={STEWARD_PROMPTS}
              placeholder="Ask Steward about the website…"
              heightClassName="h-[68vh] min-h-[420px]"
              emptyTitle="Steward — website editor"
              emptyHint="I can read the site, draft pages and propose changes. Everything lands in a draft for you to preview; I never publish without your approval."
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
