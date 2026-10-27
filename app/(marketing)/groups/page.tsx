import type { Metadata } from "next";
import Link from "next/link";
import { GroupFinder, type FinderFilters } from "@/components/groups/group-finder";
import { Band, Eyebrow, Heading, buttonClass } from "@/components/marketing/primitives";
import { getCurrentProfile } from "@/lib/auth/server";
import { tileConfig } from "@/lib/maps/config";
import { getFinderSettings, isGroupAdmin } from "@/lib/facilitator-groups/repository";
import { listPublicGroups } from "@/lib/facilitator-groups/public";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find a Group",
  description: "Find a 6-Week Challenge group near you — see when and where each group meets, how many spots are open, and who leads it.",
  alternates: { canonical: "/groups" },
};

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function FindAGroupPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const [settings, viewer] = await Promise.all([getFinderSettings(), getCurrentProfile().catch(() => null)]);
  const adminPreview = settings.mode === "hidden" && viewer && isGroupAdmin(viewer.role);

  // Before launch: a "coming soon" page instead of listings (admins still see the finder).
  if (settings.mode === "hidden" && !adminPreview) {
    return (
      <Band>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow pill>The 6-Week Challenge</Eyebrow>
          <Heading title="Find a Group" level={1} className="mt-6" />
          <p className="mx-auto mt-6 max-w-[36rem] text-pretty text-[17px] leading-8 text-muted-foreground">
            Groups are forming now. Starting {settings.opensLabel ?? "soon"}, you&rsquo;ll be able to browse groups near you, see when and where they meet, and save your spot.
          </p>
          <div className="mx-auto mt-8 grid max-w-md gap-3 sm:grid-cols-2">
            <Link href="/register" className={buttonClass("primary")}>Create your account</Link>
            <Link href="/lead-a-group" className={buttonClass("outline")}>Lead a group</Link>
          </div>
        </div>
      </Band>
    );
  }

  const filters: FinderFilters = {
    near: one(sp.near).slice(0, 80),
    radius: one(sp.radius),
    day: /^[0-6]$/.test(one(sp.day)) ? one(sp.day) : "",
    tod: ["morning", "afternoon", "evening"].includes(one(sp.time)) ? one(sp.time) : "",
    format: ["in_person", "online", "hybrid"].includes(one(sp.format)) ? one(sp.format) : "",
    audience: one(sp.for),
    open: one(sp.open) === "1",
  };
  const { groups, center, nearNotFound } = await listPublicGroups({
    day: filters.day ? Number(filters.day) : null,
    tod: (filters.tod || null) as "morning" | "afternoon" | "evening" | null,
    format: (filters.format || null) as "in_person" | "online" | "hybrid" | null,
    audience: filters.audience || null,
    open: filters.open,
    near: filters.near || null,
    radius: Number(filters.radius) || 25,
  });

  return (
    <>
      <section className="mx-auto w-full max-w-[1400px] px-5 pb-8 pt-12 sm:px-8 md:pt-16">
        <Eyebrow pill>The 6-Week Challenge</Eyebrow>
        <Heading title="Find a Group" level={1} className="mt-5" />
        <p className="mt-4 max-w-[40rem] text-pretty text-[17px] leading-8 text-muted-foreground">
          Every group walks through The Life You&rsquo;re Building together. Find one that fits your schedule, see how many spots are open, and save yours.
        </p>
        {adminPreview ? (
          <p className="mt-4 inline-block rounded-md border border-dashed border-gold px-3 py-1.5 text-sm">Admin preview — this page is hidden from the public.</p>
        ) : settings.mode === "preview" ? (
          <p className="mt-4 inline-block rounded-md bg-gold/10 px-3 py-1.5 text-sm">Browse now — requests and messages open {settings.opensLabel ?? "soon"}.</p>
        ) : null}
      </section>
      <GroupFinder groups={groups} tiles={tileConfig()} center={center} filters={filters} nearNotFound={nearNotFound} />
    </>
  );
}
