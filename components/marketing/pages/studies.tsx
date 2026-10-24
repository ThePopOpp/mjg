// /studies (studies.dc.html). The six week tiles come from the challenge itself
// (lib/six-week-challenge), so titles and availability match /6-week-challenge.

import Link from "next/link";
import { Play } from "lucide-react";
import { videoAvailability } from "@/components/six-week-challenge/availability-chip";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageStudies } from "@/lib/marketing/content/scopes/page-studies";
import { listChallengeVideos } from "@/lib/six-week-challenge/repository";
import { MediaFrame } from "../media";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, Split, StatusPill, keepTogether } from "../primitives";

const WEEK_SLUGS = ["week-1", "week-2", "week-3", "week-4", "week-5", "week-6"];

function toneOf(value: string): "live" | "soon" | "future" {
  return value === "live" || value === "future" ? value : "soon";
}

export async function StudiesPage() {
  const [{ hero, current, more, lead }, videos] = await Promise.all([getScopeContent(pageStudies), listChallengeVideos()]);
  const weeks = videos.filter((v) => WEEK_SLUGS.includes(v.slug)).sort((a, b) => a.order - b.order);

  return (
    <>
      <Band>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          <Prose text={hero.body} className="mx-auto mt-6 max-w-2xl text-[18px] leading-8 text-muted-foreground" />
          <Actions center>
            <ButtonLink cta={hero.primaryCta} />
          </Actions>
        </div>
      </Band>

      {/* Current Experience */}
      <Band tone="muted">
        <Split align="start">
          <div>
            <Eyebrow>{current.eyebrow}</Eyebrow>
            <div className="mt-3">
              <StatusPill tone="live">{current.status}</StatusPill>
            </div>
            <Heading title={current.title} level={2} className="mt-4" />
            <Prose text={current.body} className="mt-4 text-base leading-7 text-muted-foreground" />
            {weeks.length ? (
              <ol className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {weeks.map((week) => {
                  const state = videoAvailability(week);
                  return (
                    <li key={week.slug} className="flex min-w-0 flex-col rounded-lg border bg-card p-3.5">
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-gold-deep dark:text-gold-light">{week.badge}</span>
                      <span className="mt-1 flex-1 text-pretty font-display text-[15px] leading-snug">{keepTogether(week.title)}</span>
                      {state !== "none" ? (
                        <span className="mt-2.5">
                          <StatusPill tone={state === "available" ? "live" : "soon"}>
                            {state === "available" ? "Available" : "Coming Soon"}
                          </StatusPill>
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            ) : null}
            <Actions>
              <ButtonLink cta={current.primaryCta} />
              <ButtonLink cta={current.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <div className="rounded-2xl bg-band p-4 sm:p-5">
            <Link
              href={current.videoHref || "/6-week-challenge/videos"}
              aria-label={current.videoLabel}
              className="group relative block overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <MediaFrame media={current.video} ratio="16/9" sizes="(min-width: 768px) 540px, 100vw" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/10">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-white shadow-lg transition group-hover:scale-105">
                  <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
                </span>
              </span>
            </Link>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <MediaFrame media={current.photo} ratio="4/3" sizes="(min-width: 768px) 260px, 50vw" />
              <MediaFrame media={current.secondPhoto} ratio="4/3" sizes="(min-width: 768px) 260px, 50vw" />
            </div>
          </div>
        </Split>
      </Band>

      {/* Additional Experiences */}
      <Band>
        <SectionIntro eyebrow={more.eyebrow} title={more.title} className="max-w-3xl" />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {more.experiences.map((exp) => (
            <li key={exp.id} className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
              {exp.image.src || exp.image.mock ? (
                <MediaFrame media={exp.image} ratio="16/9" rounded="rounded-none" sizes="(min-width: 768px) 360px, 100vw" />
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <div>
                  <StatusPill tone={toneOf(exp.statusTone)}>{exp.status}</StatusPill>
                </div>
                <h3 className="mt-4 text-pretty font-display text-xl font-medium leading-snug">{keepTogether(exp.title)}</h3>
                <p className="mt-3 text-pretty text-[15px] leading-7 text-muted-foreground">{keepTogether(exp.body)}</p>
              </div>
            </li>
          ))}
        </ul>
        <Actions>
          <ButtonLink cta={more.cta} variant="outline" />
        </Actions>
      </Band>

      {/* Invite a Group */}
      <Band tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <SectionIntro eyebrow={lead.eyebrow} title={lead.title} body={lead.body} center />
          <Actions center>
            <ButtonLink cta={lead.primaryCta} variant="gold" />
            <ButtonLink cta={lead.secondaryCta} variant="ghost" />
          </Actions>
        </div>
      </Band>
    </>
  );
}
