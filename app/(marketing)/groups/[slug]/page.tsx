import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Globe, MapPin, Users } from "lucide-react";
import { GroupActions } from "@/components/groups/group-actions";
import { GroupLocationMap } from "@/components/groups/group-location-map";
import { Initials, spotsText, startLabel } from "@/components/groups/group-card";
import { CONTAINER, Eyebrow } from "@/components/marketing/primitives";
import { getCurrentProfile } from "@/lib/auth/server";
import { tileConfig } from "@/lib/maps/config";
import { getFinderSettings, isGroupAdmin } from "@/lib/facilitator-groups/repository";
import { getPublicGroup, getViewerReservation } from "@/lib/facilitator-groups/public";
import { AUDIENCES, FORMATS, scheduleLabel } from "@/lib/facilitator-groups/shared";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = await getPublicGroup(slug);
  if (!g) return { title: "Find a Group" };
  return {
    title: `${g.title} — Find a Group`,
    description: `${scheduleLabel(g)} · ${g.areaLabel}. Led by ${g.facilitator.name}. ${spotsText(g)}.`,
    alternates: { canonical: `/groups/${g.slug}` },
  };
}

export default async function GroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [group, settings, viewer] = await Promise.all([getPublicGroup(slug), getFinderSettings(), getCurrentProfile().catch(() => null)]);
  if (!group) notFound();
  if (settings.mode === "hidden" && !(viewer && (isGroupAdmin(viewer.role) || viewer.id === group.facilitator.profileId))) notFound();

  const signedIn = Boolean(viewer && viewer.status === "active" && viewer.id !== "local-preview");
  const reservation = signedIn ? await getViewerReservation(viewer!.id, group.id) : null;
  const pct = Math.min(100, ((group.capacity - group.spotsLeft) / group.capacity) * 100);
  const facts = [
    { icon: CalendarDays, label: "When", value: scheduleLabel(group) },
    { icon: Clock, label: "Length", value: `${group.durationWeeks} weeks${group.startDate ? ` · starts ${startLabel(group.startDate)}` : ""}` },
    { icon: group.format === "online" ? Globe : MapPin, label: "Where", value: `${group.areaLabel}${group.format === "hybrid" ? " · or join online" : ""}` },
    { icon: Users, label: "Who", value: `${AUDIENCES[group.audience]} · ${FORMATS[group.format]}${group.language !== "English" ? ` · ${group.language}` : ""}` },
  ];

  return (
    <div className={cn(CONTAINER, "py-10 md:py-14")}>
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All groups
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <Eyebrow>{group.churchOrg || "The 6-Week Challenge"}</Eyebrow>
          <h1 className="mt-3 text-balance font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-tight">{group.title}</h1>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label} className="flex gap-3 rounded-xl border bg-card p-4">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{f.label}</dt>
                  <dd className="mt-0.5 text-[15px]">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          {group.description ? (
            <div className="mt-8 space-y-4 text-[16px] leading-8 text-foreground/90">
              {group.description.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line text-pretty">{p}</p>)}
            </div>
          ) : null}

          {group.format !== "online" && group.lat != null && group.lng != null ? (
            <div className="mt-10">
              <h2 className="font-display text-2xl">Where you&rsquo;ll meet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {group.exact
                  ? [group.venueName, group.addressLine, group.areaLabel.replace(`${group.venueName} · `, "")].filter(Boolean).join(" · ")
                  : `${group.areaLabel} — the exact address is shared once your spot is confirmed.`}
              </p>
              <div className="mt-4 h-72 overflow-hidden rounded-xl border">
                <GroupLocationMap point={{ id: group.id, lat: group.lat, lng: group.lng, exact: group.exact, label: group.exact ? group.venueName || "Here" : "Around here", title: group.title }} tiles={tileConfig()} />
              </div>
            </div>
          ) : null}

          <div className="mt-10 rounded-xl border bg-card p-5">
            <div className="flex items-center gap-4">
              <Initials name={group.facilitator.name} photo={group.facilitator.photoUrl} className="h-14 w-14 text-lg" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Your facilitator</p>
                <p className="font-display text-xl">{group.facilitator.name}</p>
                {group.facilitator.churchOrg || group.facilitator.city ? (
                  <p className="text-sm text-muted-foreground">{[group.facilitator.churchOrg, [group.facilitator.city, group.facilitator.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}</p>
                ) : null}
              </div>
            </div>
            {group.facilitator.bio ? <p className="mt-4 line-clamp-4 text-pretty text-[15px] leading-7 text-muted-foreground">{group.facilitator.bio}</p> : null}
            {group.facilitator.slug ? (
              <Link href={`/facilitators/${group.facilitator.slug}`} className="mt-3 inline-block text-sm font-semibold text-gold-deep underline-offset-4 hover:underline dark:text-gold-light">
                View {group.facilitator.name.split(" ")[0]}&rsquo;s profile
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="font-display text-2xl">{group.spotsLeft > 0 ? `${group.spotsLeft} spot${group.spotsLeft === 1 ? "" : "s"} left` : "This group is full"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{group.capacity - group.spotsLeft} of {group.capacity} filled</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} /></div>
            <div className="mt-5">
              <GroupActions
                groupId={group.id}
                slug={group.slug}
                facilitatorName={group.facilitator.name}
                spotsLeft={group.spotsLeft}
                bookingMode={group.bookingMode}
                mode={settings.mode}
                opensLabel={settings.opensLabel}
                signedIn={signedIn}
                isOwner={Boolean(viewer && viewer.id === group.facilitator.profileId)}
                reservation={reservation}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
