import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/server";
import { PrototypeBanner } from "@/components/steward/prototype-banner";
import {
  BLUEPRINT_PAGES,
  EXAMPLE_BLUEPRINT,
  STATE_STYLE,
  type DefinitionState,
} from "@/lib/steward/blueprint";

export const dynamic = "force-dynamic";
export const metadata = { title: "Steward" };

// Member home.
//
// Opens on where you are and the one next step — not on a chat box. The docset
// is pointed about this: the purpose is "clearer decisions, meaningful action,
// renewal, return, and stronger human relationships — not merely a completed
// document or more AI engagement." A home screen that opens on a conversation
// optimises for engagement; this one opens on the step you already committed to.

export default async function StewardHome() {
  const profile = await getCurrentProfile();
  const firstName = profile?.firstName?.trim() || "there";

  const states = BLUEPRINT_PAGES.map((p) => EXAMPLE_BLUEPRINT[p.slug]?.state ?? "Not Yet Explored");
  const counts = states.reduce<Record<DefinitionState, number>>(
    (acc, s) => ({ ...acc, [s]: acc[s] + 1 }),
    { "Not Yet Explored": 0, "Taking Shape": 0, "Defined for This Season": 0 },
  );

  const nextStep = EXAMPLE_BLUEPRINT["starting-plan"]?.entries?.[0];

  // What to pick up next: the first page nobody has touched.
  const unexplored = BLUEPRINT_PAGES.filter(
    (p) => (EXAMPLE_BLUEPRINT[p.slug]?.state ?? "Not Yet Explored") === "Not Yet Explored",
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <PrototypeBanner />

      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">Your Blueprint</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">Hello, {firstName}.</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Rebuilding after a hard year. Here is where things stand.
        </p>
      </header>

      {/* The step, first and largest. */}
      {nextStep ? (
        <section className="mt-7 rounded-2xl border border-[#b88a4a] bg-[#b88a4a]/[0.06] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b88a4a]">My next faithful step</p>
          <p className="mt-2.5 font-serif text-xl leading-snug">{nextStep.value}</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button className="inline-flex items-center gap-1.5 rounded-md bg-[#b88a4a] px-4 py-2 text-sm font-semibold text-white">
              <Check className="h-4 w-4" /> I did this
            </button>
            <Link
              href="/steward/conversation"
              className="inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium no-underline hover:bg-muted"
            >
              Talk it through
            </Link>
          </div>
        </section>
      ) : null}

      {/* Where the Blueprint actually stands — honest counts, not a progress bar.
          A percentage would imply a finish line the docset does not have. */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg">Where your Blueprint stands</h2>
          <Link href="/steward/blueprint" className="text-sm text-[#b88a4a] no-underline hover:underline">
            See all 13 pages
          </Link>
        </div>

        <dl className="mt-3 grid grid-cols-3 gap-3">
          {(
            [
              ["Defined for This Season", counts["Defined for This Season"]],
              ["Taking Shape", counts["Taking Shape"]],
              ["Not Yet Explored", counts["Not Yet Explored"]],
            ] as [DefinitionState, number][]
          ).map(([label, n]) => (
            <div key={label} className="rounded-xl border p-4">
              <dd className="font-serif text-2xl tabular-nums">{n}</dd>
              <dt className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* What to pick up next. Named pages, not a nudge to "keep going". */}
      {unexplored.length ? (
        <section className="mt-8">
          <h2 className="font-serif text-lg">Not started yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing here is overdue. These are simply the parts you have not come to.
          </p>
          <ul className="mt-3 divide-y rounded-xl border">
            {unexplored.slice(0, 4).map((page) => (
              <li key={page.slug}>
                <Link
                  href={`/steward/blueprint/${page.slug}`}
                  className="flex items-center gap-3 px-4 py-3 no-underline hover:bg-muted/50"
                >
                  <span className="w-6 shrink-0 text-right font-serif text-sm text-muted-foreground tabular-nums">
                    {page.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{page.title}</span>
                    <span className="block truncate text-[12px] text-muted-foreground">{page.purpose}</span>
                  </span>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATE_STYLE["Not Yet Explored"]}`}>
                    Not Yet Explored
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

