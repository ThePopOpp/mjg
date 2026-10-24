import { Check, Pencil, X } from "lucide-react";
import type { ChatMessage, ChatProposal } from "@/lib/marketing/content/scopes/page-home";
import { cn } from "@/lib/utils";
import { keepTogether } from "./primitives";

/**
 * A static picture of a Steward conversation: member and Steward bubbles, then
 * the proposal card Steward offers ("Proposed guardrail · Add to my Blueprint").
 * It is an illustration, so it is presented as an image to assistive tech
 * rather than as interactive controls.
 */
export function ChatMock({
  messages,
  proposal,
  heading,
  tone = "dark",
  className,
}: {
  messages: ChatMessage[];
  proposal: ChatProposal;
  heading?: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  const summary = `Example conversation. ${messages.map((m) => `${m.from === "member" ? "Member" : "Steward"}: ${m.text}`).join(" ")} ${proposal.label}: ${proposal.text}`;

  return (
    <div
      role="img"
      aria-label={summary}
      className={cn(
        "rounded-2xl border p-5 sm:p-6",
        dark ? "border-white/10 bg-white/[0.04] backdrop-blur" : "bg-card shadow-sm",
        className,
      )}
    >
      {heading ? (
        <div className={cn("mb-4 flex items-center gap-2 border-b pb-3 text-[12px] font-semibold", dark ? "border-white/10 text-band-text" : "text-muted-foreground")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/steward/anim/s-steps-gold.svg" alt="" aria-hidden className="h-4 w-4" />
          {heading}
        </div>
      ) : null}
      <div className="space-y-3" aria-hidden>
        {messages.map((m) =>
          m.from === "member" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[85%] rounded-[12px_12px_2px_12px] bg-gold px-4 py-2.5 text-[14px] leading-relaxed text-white">{keepTogether(m.text)}</p>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <p
                className={cn(
                  "max-w-[85%] rounded-[12px_12px_12px_2px] px-4 py-2.5 text-[14px] leading-relaxed",
                  dark ? "bg-white/[0.08] text-[#f4f1ea]" : "bg-muted text-foreground",
                )}
              >
                {keepTogether(m.text)}
              </p>
            </div>
          ),
        )}
        {proposal.text ? (
          <div className={cn("rounded-xl border border-dashed p-4", dark ? "border-gold-light/50 bg-gold/10" : "border-gold/60 bg-gold/5")}>
            <p className={cn("text-[11px] font-bold uppercase tracking-[0.16em]", dark ? "text-gold-light" : "text-gold-deep")}>{proposal.label}</p>
            <p className={cn("mt-1.5 font-display text-[16px] leading-snug", dark ? "text-[#f4f1ea]" : "text-foreground")}>{keepTogether(proposal.text)}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[12.5px] font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-white">
                <Check className="h-3.5 w-3.5" /> {proposal.approve}
              </span>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1", dark ? "border-white/20 text-[#f4f1ea]" : "")}>
                <Pencil className="h-3 w-3" /> {proposal.edit}
              </span>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1", dark ? "border-white/20 text-band-text" : "text-muted-foreground")}>
                <X className="h-3 w-3" /> {proposal.dismiss}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
