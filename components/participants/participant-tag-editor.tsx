"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Tag } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TagOption = {
  id: string;
  name: string;
  category: string | null;
};

export function ParticipantTagEditor({
  participantId,
  allTags,
  selectedTagIds,
}: {
  participantId: string;
  allTags: TagOption[];
  selectedTagIds: string[];
}) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [selected, setSelected] = useState<string[]>(selectedTagIds);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const grouped = useMemo(() => {
    return allTags.reduce<Record<string, TagOption[]>>((groups, tag) => {
      const key = tag.category || "general";
      groups[key] = groups[key] || [];
      groups[key].push(tag);
      return groups;
    }, {});
  }, [allTags]);

  function toggle(tagId: string) {
    setSelected((current) => (current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]));
    setMessage(null);
    setError(null);
  }

  async function save() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/participants/${participantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ tagIds: selected, actionToken }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Tags could not be saved.");
      setLoading(false);
      return;
    }

    setMessage("Tags updated in Supabase.");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selected.map((tagId) => {
          const tag = allTags.find((item) => item.id === tagId);
          return tag ? <Badge key={tag.id}>{tag.name}</Badge> : null;
        })}
        {!selected.length ? <p className="text-sm text-muted-foreground">No tags assigned yet.</p> : null}
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([category, tags]) => (
          <div key={category} className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{formatValue(category)}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = selected.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggle(tag.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button type="button" onClick={save} disabled={loading}>
        <Save className="h-4 w-4" />
        {loading ? "Saving..." : "Save tags"}
      </Button>
    </div>
  );
}

function formatValue(value: string) {
  return value.replaceAll("_", " ");
}
