import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import {
  BLUEPRINT_PAGES,
  EXAMPLE_BLUEPRINT,
  FREE_PAGES,
  STATE_STYLE,
  type DefinitionState,
} from "@/lib/steward/blueprint";

export const dynamic = "force-dynamic";

// One Blueprint page.
//
// The empty state is the important one to review. When a page has nothing in it
// this screen still shows what the page is FOR and invites a conversation — it
// does not show a blank form, a completion prompt, or a generated draft the
// participant never approved. Content reaches a Blueprint only by the
// participant approving the exact wording.

export default async function BlueprintPageDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = [...BLUEPRINT_PAGES, ...FREE_PAGES].find((p) => p.slug === slug);
  if (!page) notFound();

  const entry = EXAMPLE_BLUEPRINT[slug];
  const state: DefinitionState = entry?.state ?? "Not Yet Explored";
  const entries = entry?.entries ?? [];
  const hasContent = entries.some((e) => e.value.trim().length > 0);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      <Link
        href="/steward/blueprint"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> My Blueprint
      </Link>

      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-serif text-sm text-muted-foreground tabular-nums">Page {page.number}</span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${STATE_STYLE[state]}`}>
            {state}
          </span>
          {entry?.updated ? (
            <span className="text-[12px] text-muted-foreground">
              Updated {new Date(`${entry.updated}T00:00:00Z`).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </span>
          ) : null}
        </div>

        <h1 className="mt-2.5 font-serif text-3xl leading-tight">{page.title}</h1>
        {page.tagline ? (
          <p className="mt-1.5 font-serif text-base italic text-[#b88a4a]">{page.tagline}</p>
        ) : null}
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{page.purpose}</p>
      </header>

      {hasContent ? (
        <section className="mt-7 space-y-3">
          {entries.map((e) => (
            <div key={e.label} className="rounded-xl border p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{e.label}</p>
              {e.value.trim() ? (
                <p className="mt-1.5 text-[15px] leading-relaxed">{e.value}</p>
              ) : (
                <p className="mt-1.5 text-[15px] italic text-muted-foreground">Nothing here yet.</p>
              )}
              {e.needsClarity ? (
                <p className="mt-2.5 inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-500">
                  Needs clarity
                </p>
              ) : null}
            </div>
          ))}
        </section>
      ) : (
        /* The empty state. Says what the page is for and offers the only route
           in — a conversation. No blank form, because a Blueprint is not a form
           and nothing lands here without being approved first. */
        <section className="mt-7 rounded-xl border border-dashed p-7 text-center">
          <p className="font-serif text-lg">You haven&rsquo;t come to this one yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            That is not a gap to fix today. When it is the right time, talk it through and nothing is written here
            until you have approved the words.
          </p>
          <Link
            href={`/steward/conversation?page=${page.slug}`}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#b88a4a] px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            <MessageCircle className="h-4 w-4" /> Talk about this with Steward
          </Link>
        </section>
      )}

      {hasContent ? (
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link
            href={`/steward/conversation?page=${page.slug}`}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium no-underline hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" /> Work on this page
          </Link>
        </div>
      ) : null}

      <p className="mt-8 border-t pt-5 text-[12px] leading-relaxed text-muted-foreground">
        Steward proposes wording. Nothing appears on your Blueprint until you approve it, and you can change or remove
        anything here at any time.
      </p>
    </div>
  );
}
