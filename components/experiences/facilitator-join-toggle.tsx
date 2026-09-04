"use client";

import { CheckCircle2, Mail, UserCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type FacilitatorEmailTrack = "leader" | "participant";

/**
 * "Are you the facilitator of this group?" — shown immediately BEFORE the recipient list so
 * it's obvious whether the launcher themselves is in the challenge.
 *
 * Facilitators launching for their own group see this pre-checked (they almost always are);
 * admins see it off by default, since an admin launching on someone's behalf usually isn't.
 */
export function FacilitatorJoinToggle({
  joining,
  onJoiningChange,
  track,
  onTrackChange,
  actorName,
  variant,
  className,
}: {
  joining: boolean;
  onJoiningChange: (v: boolean) => void;
  track: FacilitatorEmailTrack;
  onTrackChange: (v: FacilitatorEmailTrack) => void;
  actorName?: string | null;
  /** "facilitator" = launching their own group; "admin" = launching on behalf of someone. */
  variant: "facilitator" | "admin";
  className?: string;
}) {
  const isFacilitator = variant === "facilitator";

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        joining ? "border-accent/60 bg-accent/5" : "bg-muted/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <UserCheck className={cn("mt-0.5 h-4 w-4 shrink-0", joining ? "text-accent" : "text-muted-foreground")} />
          <div>
            <p className="text-sm font-medium leading-snug">
              {isFacilitator
                ? "You're the facilitator of this group"
                : "Are you the facilitator of this group?"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isFacilitator
                ? "Turn this off if you're launching for someone else and shouldn't receive the emails."
                : "Turn this on to add yourself to the challenge and receive the emails."}
            </p>
          </div>
        </div>
        <Switch checked={joining} onCheckedChange={onJoiningChange} aria-label="Join this challenge as the facilitator" />
      </div>

      {joining ? (
        <div className="mt-3 space-y-2 border-t pt-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            Which emails should you receive?
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <TrackOption
              selected={track === "leader"}
              onSelect={() => onTrackChange("leader")}
              title="Leader emails"
              meta="5 coaching emails"
              body="Built for the person running the group — recruiting, weekly prompts, midpoint pulse."
            />
            <TrackOption
              selected={track === "participant"}
              onSelect={() => onTrackChange("participant")}
              title="Participant emails"
              meta="Same as your group"
              body="Walk through the challenge alongside your men and see exactly what they receive."
            />
          </div>
          <p className="flex items-start gap-1.5 rounded-md bg-background/60 px-2.5 py-2 text-xs text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              {actorName ? <span className="font-medium text-foreground">{actorName}</span> : "You"} will be added to this
              challenge{track === "leader" ? " on the leader track" : " with your group"}.
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function TrackOption({
  selected,
  onSelect,
  title,
  meta,
  body,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  meta: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-md border p-2.5 text-left transition-colors",
        selected ? "border-accent bg-accent/10" : "hover:border-accent/50 hover:bg-accent/5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">{title}</span>
        <span
          className={cn(
            "h-3.5 w-3.5 shrink-0 rounded-full border transition-colors",
            selected ? "border-accent bg-accent" : "border-muted-foreground/40",
          )}
        />
      </div>
      <p className="mt-0.5 text-[11px] font-medium text-accent">{meta}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{body}</p>
    </button>
  );
}
