import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PrototypeBanner } from "@/components/steward/prototype-banner";
import {
  BLUEPRINT_PAGES,
  EXAMPLE_BLUEPRINT,
  FREE_PAGES,
  STATE_STYLE,
  type DefinitionState,
} from "@/lib/steward/blueprint";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Blueprint — Steward" };

// All thirteen pages, each showing its real state.
//
// Two things this screen deliberately does NOT do:
//
//   1. No completion percentage or progress bar. The docset's purpose is
//      "useful whole-life stewardship ... not merely a completed document", and
//      a progress bar turns a life into a task list with a finish line.
//   2. No hiding of unfinished pages. "Retain the page's purpose and framework
//      visibility when content is unfinished; do not manufacture a
//      finished-looking participant." An empty page still shows what it is for,
//      which is how someone decides whether it is worth opening today.

export default function BlueprintIndex() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <PrototypeBanner />

      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">Full Blueprint</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight">My Current Stewardship Blueprint</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          A living decision guide for the person I am becoming and the life I am building.
        </p>
      </header>

      <Card className="mt-7 overflow-hidden">
        <ul className="divide-y">
          {BLUEPRINT_PAGES.map((page) => {
            const entry = EXAMPLE_BLUEPRINT[page.slug];
            const state: DefinitionState = entry?.state ?? "Not Yet Explored";
            const clarity = entry?.entries?.filter((e) => e.needsClarity).length ?? 0;

            return (
              <li key={page.slug}>
                <Link
                  href={`/steward/blueprint/${page.slug}`}
                  className="flex items-start gap-3.5 px-4 py-3.5 no-underline transition-colors hover:bg-muted/50"
                >
                  <span className="w-6 shrink-0 pt-0.5 text-right font-serif text-sm text-muted-foreground tabular-nums">
                    {page.number}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-medium">{page.title}</span>
                      {/* "Needs Clarity" is a CONTENT marker, never a definition
                          state — keeping the two visually distinct is the
                          STATE-001 fix made visible. */}
                      {clarity > 0 ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 bg-amber-500/15 text-[10px] text-amber-700 dark:text-amber-500"
                        >
                          {clarity} needs clarity
                        </Badge>
                      ) : null}
                    </span>
                    {page.tagline ? (
                      <span className="mt-0.5 block font-serif text-[13px] italic text-muted-foreground">
                        {page.tagline}
                      </span>
                    ) : null}
                    <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{page.purpose}</span>
                  </span>

                  <span className="flex shrink-0 items-center gap-2 pt-0.5">
                    <Badge variant="outline" className={`text-[10px] ${STATE_STYLE[state]}`}>
                      {state}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* The Free depth, shown for comparison. */}
      <Card className="mt-9 bg-muted/40">
        <CardContent className="flex items-start gap-2.5 p-5">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <h2 className="font-serif text-base">On the Free Blueprint you see three pages</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              There are only two depths — there is no middle edition. The Free Blueprint is genuinely useful on its own:
            </p>
            <ol className="mt-3 space-y-1.5">
              {FREE_PAGES.map((p) => (
                <li key={p.slug} className="flex gap-2.5 text-[13px]">
                  <span className="w-4 shrink-0 text-right font-serif text-muted-foreground tabular-nums">
                    {p.number}
                  </span>
                  <span>{p.title}</span>
                </li>
              ))}
            </ol>
            <Button asChild variant="outline" size="sm" className="mt-4 gap-1.5">
              <Link href="/steward/pricing">
                See what the Full Build adds <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
