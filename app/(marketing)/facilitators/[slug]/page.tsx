import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GroupCard, Initials } from "@/components/groups/group-card";
import { CONTAINER, Eyebrow } from "@/components/marketing/primitives";
import { getCurrentProfile } from "@/lib/auth/server";
import { getFinderSettings, isGroupAdmin } from "@/lib/facilitator-groups/repository";
import { getPublicFacilitator } from "@/lib/facilitator-groups/public";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicFacilitator(slug);
  if (!data) return { title: "Facilitator" };
  return { title: `${data.facilitator.name} — Facilitator`, description: data.facilitator.bio?.slice(0, 160) ?? `Groups led by ${data.facilitator.name}.` };
}

export default async function FacilitatorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, settings, viewer] = await Promise.all([getPublicFacilitator(slug), getFinderSettings(), getCurrentProfile().catch(() => null)]);
  if (!data) notFound();
  if (settings.mode === "hidden" && !(viewer && (isGroupAdmin(viewer.role) || viewer.id === data.facilitator.profileId))) notFound();
  const f = data.facilitator;

  return (
    <div className={cn(CONTAINER, "py-10 md:py-14")}>
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Find a Group
      </Link>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Initials name={f.name} photo={f.photoUrl} className="h-24 w-24 text-3xl" />
        <div>
          <Eyebrow>Facilitator</Eyebrow>
          <h1 className="mt-2 font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-tight tracking-tight">{f.name}</h1>
          {f.churchOrg || f.city ? <p className="mt-1 text-muted-foreground">{[f.churchOrg, [f.city, f.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}</p> : null}
        </div>
      </div>
      {f.bio ? (
        <div className="mt-8 max-w-3xl space-y-4 text-[16px] leading-8 text-foreground/90">
          {f.bio.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line text-pretty">{p}</p>)}
        </div>
      ) : null}
      <h2 className="mt-12 font-display text-2xl">{data.groups.length ? `${f.name.split(" ")[0]}’s groups` : "No open groups right now"}</h2>
      {data.groups.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.groups.map((g) => <GroupCard key={g.id} group={g} />)}
        </div>
      ) : (
        <p className="mt-2 text-muted-foreground"><Link href="/groups" className="text-gold-deep underline underline-offset-4 dark:text-gold-light">Browse other groups</Link></p>
      )}
    </div>
  );
}
