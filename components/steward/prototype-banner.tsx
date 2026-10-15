import { FlaskConical } from "lucide-react";

/**
 * Marks every prototype screen as a prototype.
 *
 * Lives in its own file rather than being exported from a page, because a
 * page.tsx may only export the default plus Next's known config keys — any
 * other named export fails the production type check.
 *
 * It is on every screen on purpose: the docset forbids manufacturing a
 * finished-looking participant, and example content presented without that
 * caveat is exactly that.
 */
export function PrototypeBanner() {
  return (
    <div className="mb-7 flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-[13px]">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="leading-relaxed">
        <strong>Design prototype.</strong> The content here is an example, not a real participant, and Steward&rsquo;s
        replies are written in advance rather than generated. It is here to review the layout, the wording and the flow.
      </p>
    </div>
  );
}
