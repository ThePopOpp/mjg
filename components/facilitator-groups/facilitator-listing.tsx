"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type { TileConfig } from "@/lib/maps/config";
import { scheduleLabel, type FinderMode, type OwnerGroup } from "@/lib/facilitator-groups/shared";
import { groupApi } from "./api";
import { GroupEditor } from "./group-editor";
import { GroupRoster } from "./group-roster";
import { FacilitatorProfileEditor, type FacilitatorProfileView } from "./facilitator-profile-editor";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-primary/15 text-primary",
  draft: "bg-muted text-muted-foreground",
  closed: "bg-muted text-muted-foreground",
};

export function FacilitatorListing({
  initialGroups, profile, fallbackName, tiles, experiences, churches = [], finder, ownerName, ownerId,
}: {
  initialGroups: OwnerGroup[];
  profile: FacilitatorProfileView | null;
  fallbackName: string;
  tiles: TileConfig;
  experiences: Array<{ id: string; name: string }>;
  churches?: Array<{ id: string; name: string }>;
  finder: { mode: FinderMode; opensLabel: string | null };
  ownerName?: string | null; // set when an admin manages someone else's listing
  ownerId?: string | null;
}) {
  const actionToken = useDashboardActionToken();
  const router = useRouter();
  const params = useSearchParams();
  const [groups, setGroups] = useState(initialGroups);
  const [selected, setSelected] = useState<string | "new" | null>(() => params.get("group") ?? initialGroups[0]?.id ?? null);
  const [view, setView] = useState<"details" | "roster">(() => (params.get("group") ? "roster" : "details"));
  const [prof, setProf] = useState(profile);
  const group = groups.find((g) => g.id === selected) ?? null;

  useEffect(() => setGroups(initialGroups), [initialGroups]);

  async function reloadGroups() {
    try {
      const qs = ownerId ? `?facilitator=${encodeURIComponent(ownerId)}` : "";
      const data = await groupApi<{ groups: OwnerGroup[] }>(`/api/facilitator/groups${qs}`, "GET", undefined, actionToken);
      setGroups(data.groups);
    } catch {
      router.refresh();
    }
  }

  function saved(g: OwnerGroup) {
    setGroups((list) => (list.some((x) => x.id === g.id) ? list.map((x) => (x.id === g.id ? g : x)) : [...list, g]));
    setSelected(g.id);
  }

  const finderNote =
    finder.mode === "open"
      ? "Find a Group is live — published groups are taking requests."
      : finder.mode === "preview"
        ? `Find a Group is in preview — people can browse published groups; requests open ${finder.opensLabel ?? "at launch"}.`
        : `Find a Group isn't public yet. Get your listing ready now — it goes live ${finder.opensLabel ?? "at launch"}.`;

  return (
    <Tabs defaultValue="groups" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="groups">My Groups</TabsTrigger>
          <TabsTrigger value="profile">Public Profile</TabsTrigger>
        </TabsList>
        <p className="text-xs text-muted-foreground">{ownerName ? `Managing ${ownerName}'s listing. ` : ""}{finderNote}</p>
      </div>

      <TabsContent value="groups" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <div className="space-y-2">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => { setSelected(g.id); setView("details"); }}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${selected === g.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{g.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLE[g.status] ?? ""}`}>{g.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{scheduleLabel(g)}</p>
                <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {g.spotsTaken}/{g.capacity}</span>
                  {g.city ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {g.city}</span> : null}
                  {g.pendingCount ? <span className="font-semibold text-primary">{g.pendingCount} to review</span> : null}
                </p>
              </button>
            ))}
            <Button variant={groups.length ? "outline" : "default"} className="w-full" onClick={() => { setSelected("new"); setView("details"); }}>
              <Plus className="mr-2 h-4 w-4" /> {groups.length ? "Add another group" : "Create your group"}
            </Button>
          </div>

          <Card>
            {selected === "new" ? (
              <>
                <CardHeader><CardTitle>New group</CardTitle></CardHeader>
                <CardContent>
                  <GroupEditor key="new" group={null} ownerId={ownerId ?? null} tiles={tiles} experiences={experiences} churches={churches} actionToken={actionToken} onSaved={saved} onCancel={groups.length ? () => setSelected(groups[0].id) : undefined} />
                </CardContent>
              </>
            ) : group ? (
              <>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                  <CardTitle>{group.title}</CardTitle>
                  <div className="flex rounded-md border border-border p-0.5">
                    {(["details", "roster"] as const).map((v) => (
                      <Button key={v} size="sm" variant={view === v ? "default" : "ghost"} onClick={() => setView(v)} className="h-8">
                        {v === "details" ? "Details" : `People${group.pendingCount ? ` · ${group.pendingCount} new` : ""}`}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  {view === "details" ? (
                    <GroupEditor key={group.id} group={group} tiles={tiles} experiences={experiences} churches={churches} actionToken={actionToken} onSaved={saved} />
                  ) : (
                    <GroupRoster key={group.id} group={group} actionToken={actionToken} onChanged={reloadGroups} />
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Create your group to list it on Find a Group — when you meet, where, and how many spots you have.
              </CardContent>
            )}
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="profile">
        <Card>
          <CardContent className="pt-6">
            <FacilitatorProfileEditor initial={prof} ownerId={ownerId ?? null} fallbackName={fallbackName} actionToken={actionToken} onSaved={setProf} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
