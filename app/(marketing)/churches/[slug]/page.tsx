import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Mail, MapPin, Phone } from "lucide-react";
import { GroupCard, Initials } from "@/components/groups/group-card";
import { CONTAINER, Eyebrow } from "@/components/marketing/primitives";
import { getCurrentProfile } from "@/lib/auth/server";
import { getPublicChurch } from "@/lib/churches/profile";
import { adminChurchIdsFor } from "@/lib/churches/repository";
import { getFinderSettings, isGroupAdmin } from "@/lib/facilitator-groups/repository";
import { listPublicGroupsForChurch } from "@/lib/facilitator-groups/public";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const church = await getPublicChurch(slug);
  if (!church) return { title: "Church" };
  const place = [church.city, church.state].filter(Boolean).join(", ");
  return {
    title: `${church.name} — Find a Group`,
    description: church.description?.slice(0, 160) || `${church.name}${place ? ` in ${place}` : ""}: groups for the 6-Week Challenge.`,
    alternates: { canonical: `/churches/${church.slug}` },
  };
}

// A church's public page: its profile and the official groups its approved facilitators lead.
// Follows the Find a Group launch switch — before launch only admins and the church's own
// admins can see it.
export default async function ChurchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [church, settings, viewer] = await Promise.all([getPublicChurch(slug), getFinderSettings(), getCurrentProfile().catch(() => null)]);
  if (!church) notFound();
  if (settings.mode === "hidden") {
    const allowed = viewer && (isGroupAdmin(viewer.role) || (await adminChurchIdsFor(viewer.id)).includes(church.id));
    if (!allowed) notFound();
  }

  const groups = await listPublicGroupsForChurch(church.id);
  const place = [church.city, church.state].filter(Boolean).join(", ");
  const address = [church.addressLine1, church.addressLine2, [church.city, [church.state, church.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" · ");
  const [hero, ...more] = church.photos;
  const contact = [
    church.website ? { icon: Globe, label: church.website.replace(/^https?:\/\//, "").replace(/\/$/, ""), href: church.website } : null,
    church.email ? { icon: Mail, label: church.email, href: `mailto:${church.email}` } : null,
    church.phone ? { icon: Phone, label: church.phone, href: `tel:${church.phone.replace(/[^\d+]/g, "")}` } : null,
    address ? { icon: MapPin, label: address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${church.name} ${address}`)}` } : null,
  ].filter(Boolean) as { icon: typeof Globe; label: string; href: string }[];

  return (
    <div className={cn(CONTAINER, "py-10 md:py-14")}>
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Find a Group
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        {church.logoUrl ? (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-card p-2">
            <img src={church.logoUrl} alt={`${church.name} logo`} className="h-full w-full object-contain" />
          </div>
        ) : null}
        <div className="min-w-0">
          <Eyebrow>{[church.denomination, place].filter(Boolean).join(" · ") || "Church"}</Eyebrow>
          <h1 className="mt-2 text-balance font-display text-[clamp(2rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-tight">{church.name}</h1>
        </div>
      </div>

      {hero ? (
        <figure className="mt-8 overflow-hidden rounded-2xl border">
          <img src={hero.url} alt={hero.caption ?? church.name} className="aspect-[21/9] w-full object-cover" />
          {hero.caption ? <figcaption className="border-t bg-card px-4 py-2 text-sm text-muted-foreground">{hero.caption}</figcaption> : null}
        </figure>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-10">
          {church.description ? (
            <div className="space-y-4 text-[16px] leading-8 text-foreground/90">
              {church.description.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line text-pretty">{p}</p>)}
            </div>
          ) : null}

          <section>
            <h2 className="font-display text-2xl">Groups at {church.name}</h2>
            {groups.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {groups.map((g) => <GroupCard key={g.id} group={g} />)}
              </div>
            ) : (
              <p className="mt-2 text-muted-foreground">No groups are open right now. Check back soon.</p>
            )}
          </section>

          {more.length ? (
            <section>
              <h2 className="font-display text-2xl">Photos</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {more.map((p) => (
                  <figure key={p.url} className="overflow-hidden rounded-xl border bg-card">
                    <img src={p.url} alt={p.caption ?? church.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                    {p.caption ? <figcaption className="px-3 py-2 text-xs text-muted-foreground">{p.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {contact.length ? (
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Contact</p>
              <ul className="mt-3 space-y-3">
                {contact.map((c) => (
                  <li key={c.label} className="flex gap-3 text-[15px]">
                    <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="min-w-0 break-words hover:text-gold-deep dark:hover:text-gold-light">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {church.leaders.length ? (
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Church leadership</p>
              <ul className="mt-3 space-y-3">
                {church.leaders.map((l, i) => (
                  <li key={`${l.name}-${i}`} className="flex items-center gap-3">
                    <Initials name={l.name} photo={l.photoUrl} className="h-11 w-11" />
                    <div className="min-w-0">
                      <p className="font-medium">{l.name}</p>
                      {l.title ? <p className="text-sm text-muted-foreground">{l.title}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
