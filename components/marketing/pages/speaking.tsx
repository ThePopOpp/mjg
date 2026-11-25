// /speaking — Speaking & Podcasts. Copy lives in lib/marketing/content/scopes/page-speaking.ts
// (editable in the dashboard); the page order follows Mike's brief: hero → featured
// video → about → topics → formats → invitation form → link back to the framework.

import Image from "next/image";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageSpeaking } from "@/lib/marketing/content/scopes/page-speaking";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { Actions, Band, Eyebrow, Heading, PillCloud, Prose, SectionIntro, Split, TextLink, keepTogether } from "../primitives";
import { SpeakingInquiryForm, SpeakingVideo, TrackedButton } from "../speaking";

export async function SpeakingPage() {
  const { hero, video, bio, topics, formats, inquiry } = await getScopeContent(pageSpeaking);
  const site = publicSiteUrl();

  // Person only, with facts the page states. A VideoObject needs an upload date and
  // thumbnail URL from Vimeo; add it once those are confirmed.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Michael J. Gauthier",
    url: `${site}/speaking`,
    image: `${site}${bio.photo.src}`,
    description: bio.shortBio,
    founder: { "@type": "Organization", name: "Strategic Income Group" },
    knowsAbout: ["Faith", "Purpose", "Leadership", "Stewardship", "Generosity", "Personal finance", "Family"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* 01 · Hero */}
      <Band>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mx-auto mt-6 max-w-[20ch]" />
          <Prose text={hero.body} className="mx-auto mt-6 max-w-[40rem] text-[17px] leading-8 text-muted-foreground" />
          <Actions center>
            <TrackedButton cta={hero.primaryCta} variant="gold" />
            <TrackedButton cta={hero.secondaryCta} variant="outline" />
          </Actions>
        </div>
      </Band>

      {/* 02 · Featured video */}
      <Band tone="muted" id="watch">
        <SectionIntro eyebrow={video.eyebrow} title={video.title} body={video.body} center />
        <div className="mx-auto mt-10 max-w-[1040px]">
          <SpeakingVideo embed={video.embed} poster={video.poster} label={`Play: ${video.title}`} />
          {video.caption ? <p className="mt-3 text-center text-[13px] text-muted-foreground">{keepTogether(video.caption)}</p> : null}
        </div>
      </Band>

      {/* 03 · About Michael */}
      {/* Full-height cut-out standing on the section's bottom edge; his feet overlap the
          line into the Topics band (z-10 keeps them above the next section). */}
      <Band flush>
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12">
          <div className="relative z-10 order-last -mb-8 flex justify-center md:order-none md:-mb-10 md:items-end">
            {bio.photo.src ? (
              <div className="relative w-[230px] sm:w-[260px] md:w-[300px] lg:w-[350px]">
                <span aria-hidden className="absolute -bottom-1 left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-md" />
                <Image
                  src={bio.photo.src}
                  alt={bio.photo.alt}
                  width={479}
                  height={1024}
                  sizes="(min-width: 1024px) 350px, (min-width: 768px) 300px, 260px"
                  className="relative h-auto w-full"
                />
              </div>
            ) : null}
          </div>
          <div className="self-center md:pb-[72px]">
            <SectionIntro eyebrow={bio.eyebrow} title={bio.title} body={bio.body} />
            {bio.shortBio ? (
              <div className="mt-8 rounded-xl border-l-4 border-gold bg-muted/60 p-5 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{bio.shortBioLabel}</p>
                <p className="mt-3 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(bio.shortBio)}</p>
              </div>
            ) : null}
          </div>
        </div>
      </Band>

      {/* 04 · Topics */}
      <Band tone="muted" id="topics">
        <SectionIntro eyebrow={topics.eyebrow} title={topics.title} body={topics.body} center />
        <ol className="mt-12 grid gap-5 md:grid-cols-2">
          {topics.featured.map((t) => (
            <li key={t.id} className="flex gap-5 rounded-2xl border bg-card p-6 sm:p-7">
              <span aria-hidden className="font-display text-2xl leading-none text-gold">
                {t.number}
              </span>
              <div className="min-w-0">
                <h3 className="text-balance font-display text-xl font-medium leading-snug">{keepTogether(t.title)}</h3>
                <p className="mt-2 text-pretty text-[15px] leading-relaxed text-muted-foreground">{keepTogether(t.body)}</p>
              </div>
            </li>
          ))}
        </ol>
        {topics.more.length ? (
          <div className="mt-10">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{topics.moreLabel}</p>
            <ul className="mt-5 grid gap-5 md:grid-cols-2">
              {topics.more.map((t) => (
                <li key={t.id} className="flex gap-4 border-t border-gold/30 pt-5">
                  <span aria-hidden className="font-display text-lg leading-snug text-gold">
                    {t.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-balance font-display text-lg font-medium leading-snug">{keepTogether(t.title)}</h3>
                    <p className="mt-1.5 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(t.body)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Band>

      {/* 05 · Formats & fit */}
      <Band>
        <Split>
          <SectionIntro eyebrow={formats.eyebrow} title={formats.title} body={formats.body} />
          <PillCloud items={formats.formats.map((x) => x.label)} className="md:justify-center" />
        </Split>
      </Band>

      {/* 06 · Invitation form */}
      <Band tone="muted" id="invite">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14">
          <div>
            <SectionIntro eyebrow={inquiry.eyebrow} title={inquiry.title} body={inquiry.body} />
          </div>
          <SpeakingInquiryForm content={inquiry} />
        </div>
      </Band>

      {/* 07 · Back to the framework */}
      <Band innerClassName="py-12 md:py-14">
        <p className="text-pretty text-center text-[15.5px] text-muted-foreground">
          {keepTogether(inquiry.footerText)} <TextLink cta={inquiry.footerLink} />
        </p>
      </Band>
    </>
  );
}
