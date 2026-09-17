import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REFLECTION_QUESTIONS, SECTION_MAX, TOTAL_MAX, interpretationFor, sectionByKey } from "@/lib/energy-audit/energy-audit";
import type { EnergyAuditSubmission } from "@/lib/energy-audit/submissions";
import { cn } from "@/lib/utils";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * The full detail of one completed Energy Audit — scores, interpretation, the next step the
 * person committed to, and (optionally) their reflections.
 *
 * `showReflections` is off by default: reflections are private journaling, so a facilitator or
 * admin viewing someone else's audit sees the scores and commitments but not that writing.
 */
export function EnergyAuditDetail({
  audit,
  showReflections = false,
  heading,
}: {
  audit: EnergyAuditSubmission;
  showReflections?: boolean;
  heading?: string;
}) {
  const total = audit.total_score ?? 0;
  const interpretation = interpretationFor(total);
  const sections = audit.layer_scores ?? [];
  const nextStep = audit.details?.nextStep ?? {};
  const focusKey = nextStep.lowestEnergySource ?? audit.lowest_layer;
  const focus = focusKey ? sectionByKey(focusKey) : null;
  const reflections = Object.entries(audit.details?.reflections ?? {}).filter(([, v]) => (v ?? "").trim());

  const commitments = [
    nextStep.renewalFocus && { label: "The energy I most need to renew", value: nextStep.renewalFocus },
    nextStep.nextAction && { label: "This week, I will", value: nextStep.nextAction },
    nextStep.conversationPerson && { label: "One person to talk with", value: nextStep.conversationPerson },
    nextStep.renewalRhythm && { label: "One rhythm to renew this energy", value: nextStep.renewalRhythm },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="rounded-xl border">
      {/* Score header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
        <div>
          {heading ? <p className="font-medium">{heading}</p> : null}
          <p className="text-sm text-muted-foreground">{fmtDate(audit.created_at)}</p>
          <p className="mt-1 font-semibold">{interpretation.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-right">
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-sm text-muted-foreground"> / {TOTAL_MAX}</span>
          </p>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/energy-audit/${audit.id}/pdf`}>
              <Download className="mr-1.5 h-4 w-4" /> PDF
            </a>
          </Button>
        </div>
      </div>

      {/* Four energies */}
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => {
          const isFocus = focusKey === s.key;
          return (
            <div key={s.key}>
              <div className="flex items-baseline justify-between text-xs">
                <span className={cn("font-medium", isFocus && "text-[#b88a4a]")}>{s.title.replace(" Energy", "")}</span>
                <span className="tabular-nums text-muted-foreground">{s.score}/{SECTION_MAX}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-[#b88a4a]" style={{ width: `${(s.score / SECTION_MAX) * 100}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{s.level}{isFocus ? " · renewing" : ""}</p>
            </div>
          );
        })}
      </div>

      {/* Interpretation + what they committed to */}
      <div className="space-y-3 border-t p-4">
        <p className="text-sm leading-6 text-muted-foreground">{interpretation.meaning}</p>
        <p className="font-serif text-sm italic">{interpretation.reflection}</p>

        {focus ? (
          <div className="rounded-lg border border-[#b88a4a]/40 bg-[#b88a4a]/[0.06] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#b88a4a]">Renewing</p>
            <p className="mt-0.5 font-medium">{focus.title}</p>
            <ul className="mt-2 space-y-1">
              {focus.refills.map((r) => (
                <li key={r} className="text-sm leading-6 text-muted-foreground">• {r}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {commitments.length ? (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next step</p>
            {commitments.map((c) => (
              <p key={c.label} className="text-sm leading-6">
                <span className="text-muted-foreground">{c.label}:</span> {c.value}
              </p>
            ))}
          </div>
        ) : null}

        {showReflections && reflections.length ? (
          <div className="space-y-3 border-t pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your reflections ({reflections.length})
            </p>
            {reflections.map(([index, text]) => (
              <div key={index}>
                <p className="text-xs font-medium text-muted-foreground">{REFLECTION_QUESTIONS[Number(index)]}</p>
                <p className="mt-0.5 text-sm leading-6">{text}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
