// Frontend Editor — the rendered form of every registered component.
//
// One React component per entry in lib/website/registry.ts. These are server
// components (no client JS) except the three in ./interactive. Every one of them
// takes the same shape — `props` straight from the validated block — and applies
// the shared Section chrome, so a page assembled from any combination stays on
// the MJG design system and stays responsive (spec §26, §58).

import Link from "next/link";
import { cn } from "@/lib/utils";
import { videoEmbedSrc } from "@/lib/cms/md";
import { getPublishedPosts } from "@/lib/content/blog";
import { loadPublicEvents } from "@/lib/booking/data";
import {
  ActionLink,
  ActionRow,
  BlockGrid,
  BlockImage,
  RichText,
  Section,
  SectionHeader,
  asItems,
  asLink,
  isInkBackground,
  text,
  type SectionProps,
} from "./section";

type P = { props: Record<string, unknown> };

const centeredOf = (props: Record<string, unknown>) => (props.align ?? "left") === "center";

const CARD = "rounded-xl border border-border bg-card p-6 shadow-sm";

// ── Layout ───────────────────────────────────────────────────────────────────

export function HeroBlock({ props, isFirst }: P & { isFirst?: boolean }) {
  const layout = text(props.layout) || "centered";
  const split = layout === "split" || layout === "splitReverse";
  const reverse = layout === "splitReverse";
  const centered = !split && centeredOf(props);
  const imageUrl = text(props.imageUrl);

  const copy = (
    <div>
      <SectionHeader
        eyebrow={text(props.eyebrow)}
        title={text(props.title)}
        description={text(props.description)}
        centered={centered}
        as={isFirst ? "h1" : "h2"}
      />
      <ActionRow centered={centered}>
        <ActionLink link={asLink(props.primaryCta)} variant="primary" />
        <ActionLink link={asLink(props.secondaryCta)} variant="outline" />
      </ActionRow>
    </div>
  );

  if (!split || !imageUrl) {
    return (
      <Section block={{ ...(props as SectionProps), align: centered ? "center" : (props.align as string) }}>{copy}</Section>
    );
  }

  return (
    <Section block={props as SectionProps}>
      <div className={cn("grid items-center gap-10 lg:grid-cols-2 lg:gap-14", reverse && "lg:[&>*:first-child]:order-2")}>
        {copy}
        <BlockImage src={imageUrl} alt={text(props.imageAlt)} priority={isFirst} className="w-full rounded-xl object-cover" />
      </div>
    </Section>
  );
}

export function DividerBlock({ props }: P) {
  const style = text(props.style) || "line";
  return (
    <Section block={{ ...(props as SectionProps), spacing: text(props.spacing) || "sm" }}>
      {style === "dots" ? (
        <div aria-hidden className="flex justify-center gap-2 text-[#b88a4a]">
          <span>•</span>
          <span>•</span>
          <span>•</span>
        </div>
      ) : (
        <hr className={cn("border-0 border-t", style === "gold" ? "border-t-2 border-[#b88a4a]/50" : "border-border")} />
      )}
    </Section>
  );
}

const SPACER_HEIGHT: Record<string, string> = { sm: "h-8", md: "h-16", lg: "h-28" };

export function SpacerBlock({ props }: P) {
  return <div aria-hidden className={SPACER_HEIGHT[text(props.size) || "md"] ?? SPACER_HEIGHT.md} />;
}

// ── Content ──────────────────────────────────────────────────────────────────

export function RichTextBlock({ props }: P) {
  const centered = centeredOf(props);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centered} />
      <RichText content={text(props.content)} className={cn(text(props.title) && "mt-6", centered && "mx-auto max-w-2xl")} />
    </Section>
  );
}

export function TwoColumnBlock({ props }: P) {
  const centered = centeredOf(props);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centered} />
      <div className="mt-8 grid gap-10 md:grid-cols-2">
        {(["left", "right"] as const).map((side) => {
          const title = text(props[`${side}Title`]);
          const content = text(props[`${side}Content`]);
          if (!title && !content) return null;
          return (
            <div key={side} className="text-left">
              {title ? <h3 className="font-serif text-2xl font-semibold">{title}</h3> : null}
              <RichText content={content} className={cn(title && "mt-3")} />
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function ImageContentBlock({ props }: P) {
  const imageLeft = text(props.imagePosition) === "left";
  const imageUrl = text(props.imageUrl);
  return (
    <Section block={props as SectionProps}>
      <div className={cn("grid items-center gap-10 lg:gap-14", imageUrl && "md:grid-cols-2")}>
        {imageUrl ? (
          <BlockImage
            src={imageUrl}
            alt={text(props.imageAlt)}
            className={cn("w-full rounded-xl object-cover", imageLeft ? "md:order-1" : "md:order-2")}
          />
        ) : null}
        <div className={cn("text-left", imageUrl && (imageLeft ? "md:order-2" : "md:order-1"))}>
          <SectionHeader eyebrow={text(props.eyebrow)} title={text(props.title)} />
          <RichText content={text(props.content)} className="mt-4" />
          <ActionRow>
            <ActionLink link={asLink(props.cta)} variant="outline" />
          </ActionRow>
        </div>
      </div>
    </Section>
  );
}

export function FeatureGridBlock({ props }: P) {
  const items = asItems(props.items);
  const centered = centeredOf(props);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader eyebrow={text(props.eyebrow)} title={text(props.title)} description={text(props.description)} centered={centered} />
      {items.length ? (
        <BlockGrid columns={text(props.columns)} className="mt-10 text-left">
          {items.map((item, i) => (
            <div key={i}>
              <h3 className="font-serif text-xl font-semibold">{text(item.title)}</h3>
              {text(item.description) ? <p className="mt-2 leading-7 text-muted-foreground">{text(item.description)}</p> : null}
            </div>
          ))}
        </BlockGrid>
      ) : null}
    </Section>
  );
}

export function CardGridBlock({ props }: P) {
  const items = asItems(props.items);
  const centered = centeredOf(props);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} description={text(props.description)} centered={centered} />
      <BlockGrid columns={text(props.columns)} className="mt-10 text-left">
        {items.map((item, i) => {
          const href = text(item.href);
          const inner = (
            <>
              <BlockImage src={text(item.imageUrl)} alt={text(item.imageAlt)} className="mb-4 aspect-[16/10] w-full rounded-lg object-cover" />
              <h3 className="font-serif text-xl font-semibold">{text(item.title)}</h3>
              {text(item.description) ? <p className="mt-2 leading-7 text-muted-foreground">{text(item.description)}</p> : null}
              {href ? (
                <span className="mt-4 inline-block text-sm font-semibold text-[#b88a4a]">{text(item.linkLabel) || "Read more"} →</span>
              ) : null}
            </>
          );
          return href ? (
            <Link key={i} href={href} className={cn(CARD, "block no-underline transition-shadow hover:shadow-md")}>
              {inner}
            </Link>
          ) : (
            <div key={i} className={CARD}>
              {inner}
            </div>
          );
        })}
      </BlockGrid>
    </Section>
  );
}

export function FaqBlock({ props }: P) {
  const items = asItems(props.items).filter((i) => text(i.question).trim());
  const centered = centeredOf(props);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} description={text(props.description)} centered={centered} />
      {/* <details> keeps this keyboard- and screen-reader-accessible with zero JS. */}
      <div className="mt-8 divide-y divide-border border-y border-border text-left">
        {items.map((item, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-['']">
              {text(item.question)}
              <span aria-hidden className="shrink-0 text-[#b88a4a] transition-transform group-open:rotate-45">+</span>
            </summary>
            <RichText content={text(item.answer)} className="mt-3" />
          </details>
        ))}
      </div>
    </Section>
  );
}

export function TimelineBlock({ props }: P) {
  const items = asItems(props.items);
  const centered = centeredOf(props);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} description={text(props.description)} centered={centered} />
      <ol className="mt-10 space-y-8 border-l border-[#b88a4a]/40 pl-6 text-left">
        {items.map((item, i) => (
          <li key={i} className="relative">
            <span aria-hidden className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#b88a4a]" />
            {text(item.marker) ? (
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">{text(item.marker)}</span>
            ) : null}
            <h3 className="mt-1 font-serif text-xl font-semibold">{text(item.title)}</h3>
            {text(item.description) ? <p className="mt-2 leading-7 text-muted-foreground">{text(item.description)}</p> : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function ResourceCardBlock({ props }: P) {
  const items = asItems(props.items);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centeredOf(props)} />
      <div className="mt-8 space-y-4 text-left">
        {items.map((item, i) => (
          <div key={i} className={cn(CARD, "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-xl font-semibold">{text(item.title)}</h3>
                {text(item.fileType) ? (
                  <span className="rounded-full bg-[#b88a4a]/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#b88a4a]">
                    {text(item.fileType)}
                  </span>
                ) : null}
              </div>
              {text(item.description) ? <p className="mt-2 leading-7 text-muted-foreground">{text(item.description)}</p> : null}
            </div>
            <ActionLink
              link={{ label: text(item.linkLabel) || "Download", href: text(item.href) }}
              variant="outline"
              className="h-11 shrink-0 text-sm"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Media ────────────────────────────────────────────────────────────────────

const ASPECT: Record<string, string> = { "16/9": "aspect-video", "4/3": "aspect-[4/3]", "1/1": "aspect-square" };

export function VideoBlock({ props }: P) {
  const src = videoEmbedSrc(text(props.videoUrl));
  if (!src) return null;
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centeredOf(props)} />
      <div className={cn("mt-6 overflow-hidden rounded-xl bg-black", ASPECT[text(props.aspect)] ?? ASPECT["16/9"])}>
        <iframe
          src={src}
          title={text(props.title) || text(props.caption) || "Video"}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {text(props.caption) ? <p className="mt-3 text-sm text-muted-foreground">{text(props.caption)}</p> : null}
    </Section>
  );
}

export function GalleryBlock({ props }: P) {
  const items = asItems(props.items).filter((i) => text(i.imageUrl));
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centeredOf(props)} />
      <BlockGrid columns={text(props.columns)} className="mt-8">
        {items.map((item, i) => (
          <figure key={i}>
            <BlockImage src={text(item.imageUrl)} alt={text(item.imageAlt)} className="aspect-[4/3] w-full rounded-lg object-cover" />
            {text(item.caption) ? <figcaption className="mt-2 text-sm text-muted-foreground">{text(item.caption)}</figcaption> : null}
          </figure>
        ))}
      </BlockGrid>
    </Section>
  );
}

export function LogoGridBlock({ props }: P) {
  const items = asItems(props.items).filter((i) => text(i.imageUrl));
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centeredOf(props)} />
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
        {items.map((item, i) => {
          const logo = (
            <BlockImage
              src={text(item.imageUrl)}
              alt={text(item.imageAlt)}
              className="h-10 w-auto opacity-70 transition-opacity hover:opacity-100"
            />
          );
          const href = text(item.href);
          return href ? (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer">
              {logo}
            </a>
          ) : (
            <span key={i}>{logo}</span>
          );
        })}
      </div>
    </Section>
  );
}

// ── Conversion ───────────────────────────────────────────────────────────────

export function CtaBlock({ props }: P) {
  const centered = (props.align ?? "center") === "center";
  return (
    <Section block={{ ...(props as SectionProps), background: text(props.background) || "gold", align: centered ? "center" : "left" }}>
      <SectionHeader eyebrow={text(props.eyebrow)} title={text(props.title)} description={text(props.description)} centered={centered} />
      <ActionRow centered={centered}>
        <ActionLink link={asLink(props.primaryCta)} variant="primary" />
        <ActionLink link={asLink(props.secondaryCta)} variant="outline" />
      </ActionRow>
    </Section>
  );
}

export function ButtonGroupBlock({ props }: P) {
  const items = asItems(props.items);
  const centered = centeredOf(props);
  return (
    <Section block={{ ...(props as SectionProps), spacing: text(props.spacing) || "sm" }}>
      <div className={cn("flex flex-wrap gap-3", centered && "justify-center")}>
        {items.map((item, i) => (
          <ActionLink
            key={i}
            link={{ label: text(item.label), href: text(item.href), newTab: item.newTab === true }}
            variant={(text(item.style) || "primary") as "primary" | "outline" | "quiet"}
          />
        ))}
      </div>
    </Section>
  );
}

export function BlueprintSectionBlock({ props }: P) {
  const items = asItems(props.items);
  const centered = centeredOf(props);
  return (
    <Section block={{ ...(props as SectionProps), background: text(props.background) || "muted" }}>
      <SectionHeader
        eyebrow={text(props.eyebrow) || "The Stewardship Blueprint"}
        title={text(props.title)}
        description={text(props.description)}
        centered={centered}
      />
      {items.length ? (
        <BlockGrid columns="3" className="mt-10 text-left">
          {items.map((item, i) => (
            <div key={i} className="border-l-2 border-[#b88a4a]/50 pl-4">
              <h3 className="font-serif text-xl font-semibold">{text(item.title)}</h3>
              {text(item.description) ? <p className="mt-2 leading-7 text-muted-foreground">{text(item.description)}</p> : null}
            </div>
          ))}
        </BlockGrid>
      ) : null}
      <ActionRow centered={centered}>
        <ActionLink link={asLink(props.cta)} variant="primary" />
      </ActionRow>
    </Section>
  );
}

export function PricingBlock({ props }: P) {
  const items = asItems(props.items);
  const centered = centeredOf(props);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} description={text(props.description)} centered={centered} />
      <BlockGrid columns={String(Math.min(4, Math.max(2, items.length || 3)))} className="mt-10 text-left">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(CARD, "flex flex-col", item.featured === true && "border-[#b88a4a] ring-1 ring-[#b88a4a]/40")}
          >
            <h3 className="font-serif text-xl font-semibold">{text(item.name)}</h3>
            <p className="mt-3">
              <span className="font-serif text-4xl font-semibold">{text(item.price)}</span>
              {text(item.cadence) ? <span className="ml-1 text-sm text-muted-foreground">{text(item.cadence)}</span> : null}
            </p>
            {text(item.description) ? <p className="mt-3 leading-7 text-muted-foreground">{text(item.description)}</p> : null}
            {text(item.features) ? (
              <ul className="mt-5 flex-1 space-y-2 text-[15px]">
                {text(item.features)
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, j) => (
                    <li key={j} className="flex gap-2">
                      <span aria-hidden className="text-[#b88a4a]">✓</span>
                      <span>{line}</span>
                    </li>
                  ))}
              </ul>
            ) : null}
            <ActionLink
              link={{ label: text(item.ctaLabel), href: text(item.ctaHref) }}
              variant={item.featured === true ? "primary" : "outline"}
              className="mt-6 w-full"
            />
          </div>
        ))}
      </BlockGrid>
    </Section>
  );
}

export function SubscriptionCtaBlock({ props }: P) {
  const items = asItems(props.items);
  const ink = isInkBackground(props as SectionProps);
  return (
    <Section block={{ ...(props as SectionProps), background: text(props.background) || "ink" }}>
      <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div className="text-left">
          {text(props.eyebrow) ? (
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d6ab6d]">{text(props.eyebrow)}</span>
          ) : null}
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{text(props.title)}</h2>
          {text(props.description) ? (
            <p className={cn("mt-4 text-lg leading-8", ink ? "text-[#c9c3bb]" : "text-muted-foreground")}>{text(props.description)}</p>
          ) : null}
        </div>
        <div className="text-left">
          {items.length ? (
            <ul className="space-y-2 text-[15px]">
              {items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="text-[#d6ab6d]">✓</span>
                  <span>{text(item.title)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <ActionRow>
            <ActionLink link={asLink(props.cta)} variant="primary" />
          </ActionRow>
        </div>
      </div>
    </Section>
  );
}

export function BookingCtaBlock({ props }: P) {
  const centered = (props.align ?? "center") === "center";
  const cta = asLink(props.cta);
  return (
    <Section block={{ ...(props as SectionProps), align: centered ? "center" : "left" }}>
      <SectionHeader eyebrow={text(props.eyebrow)} title={text(props.title)} description={text(props.description)} centered={centered} />
      <ActionRow centered={centered}>
        <ActionLink link={{ label: cta?.label || "Check availability", href: cta?.href || "/book", newTab: cta?.newTab }} variant="primary" />
      </ActionRow>
    </Section>
  );
}

// ── Proof ────────────────────────────────────────────────────────────────────

export function TestimonialBlock({ props }: P) {
  const items = asItems(props.items).filter((i) => text(i.quote).trim());
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centeredOf(props)} />
      <BlockGrid columns={String(Math.min(3, Math.max(1, items.length)))} className="mt-10 text-left">
        {items.map((item, i) => (
          <figure key={i} className={CARD}>
            <blockquote className="text-[17px] leading-8">&ldquo;{text(item.quote)}&rdquo;</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <BlockImage src={text(item.imageUrl)} alt="" className="h-10 w-10 rounded-full object-cover" />
              <span>
                <span className="block font-semibold">{text(item.name)}</span>
                {text(item.role) ? <span className="block text-sm text-muted-foreground">{text(item.role)}</span> : null}
              </span>
            </figcaption>
          </figure>
        ))}
      </BlockGrid>
    </Section>
  );
}

export function QuoteBlock({ props }: P) {
  return (
    <Section block={{ ...(props as SectionProps), width: text(props.width) || "narrow" }}>
      <figure className="border-l-4 border-[#b88a4a] pl-6 text-left">
        <blockquote className="font-serif text-2xl leading-relaxed sm:text-3xl">&ldquo;{text(props.quote)}&rdquo;</blockquote>
        {text(props.attribution) ? (
          <figcaption className="mt-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {text(props.attribution)}
          </figcaption>
        ) : null}
      </figure>
    </Section>
  );
}

export function StatsBlock({ props }: P) {
  const items = asItems(props.items);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centeredOf(props)} />
      <BlockGrid columns={String(Math.min(4, Math.max(2, items.length || 3)))} className="mt-8 text-center">
        {items.map((item, i) => (
          <div key={i}>
            <p className="font-serif text-4xl font-semibold text-[#b88a4a] sm:text-5xl">{text(item.value)}</p>
            {text(item.label) ? <p className="mt-2 text-sm text-muted-foreground">{text(item.label)}</p> : null}
          </div>
        ))}
      </BlockGrid>
    </Section>
  );
}

export function TeamMemberBlock({ props }: P) {
  const items = asItems(props.items);
  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} centered={centeredOf(props)} />
      <BlockGrid columns={String(Math.min(4, Math.max(2, items.length || 3)))} className="mt-10 text-left">
        {items.map((item, i) => (
          <div key={i}>
            <BlockImage src={text(item.imageUrl)} alt={text(item.name)} className="aspect-square w-full rounded-xl object-cover" />
            <h3 className="mt-4 font-serif text-xl font-semibold">{text(item.name)}</h3>
            {text(item.role) ? <p className="text-sm font-semibold text-[#b88a4a]">{text(item.role)}</p> : null}
            {text(item.bio) ? <p className="mt-2 leading-7 text-muted-foreground">{text(item.bio)}</p> : null}
            {text(item.href) ? (
              <Link href={text(item.href)} className="mt-3 inline-block text-sm font-semibold text-[#b88a4a]">
                Read more →
              </Link>
            ) : null}
          </div>
        ))}
      </BlockGrid>
    </Section>
  );
}

// ── Data-backed blocks ───────────────────────────────────────────────────────
// Content comes from the existing Blog Posts and Bookings & Events modules, so
// the page stays current without anyone re-editing it.

export async function BlogFeedBlock({ props }: P) {
  const limit = Math.min(12, Math.max(1, Number(props.limit) || 3));
  const posts = await getPublishedPosts().catch(() => [] as Record<string, unknown>[]);
  const items = (posts as Record<string, unknown>[]).slice(0, limit);
  if (!items.length) return null;

  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} description={text(props.description)} centered={centeredOf(props)} />
      <BlockGrid columns={String(Math.min(3, items.length))} className="mt-10 text-left">
        {items.map((post) => (
          <Link key={String(post.id)} href={`/post/${String(post.slug ?? "")}`} className={cn(CARD, "block no-underline transition-shadow hover:shadow-md")}>
            <BlockImage src={text(post.featured_image_url)} alt="" className="mb-4 aspect-[16/10] w-full rounded-lg object-cover" />
            <h3 className="font-serif text-xl font-semibold">{text(post.title)}</h3>
            {text(post.excerpt) ? <p className="mt-2 leading-7 text-muted-foreground">{text(post.excerpt)}</p> : null}
            <span className="mt-4 inline-block text-sm font-semibold text-[#b88a4a]">Read more →</span>
          </Link>
        ))}
      </BlockGrid>
    </Section>
  );
}

export async function EventFeedBlock({ props }: P) {
  const limit = Math.min(12, Math.max(1, Number(props.limit) || 3));
  const events = await loadPublicEvents().catch(() => [] as Record<string, unknown>[]);
  const items = (events as unknown as Record<string, unknown>[]).slice(0, limit);
  if (!items.length) return null;

  const fmt = (iso: unknown) => {
    const value = text(iso);
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <Section block={props as SectionProps}>
      <SectionHeader title={text(props.title)} description={text(props.description)} centered={centeredOf(props)} />
      <div className="mt-8 space-y-4 text-left">
        {items.map((event) => (
          <Link
            key={String(event.id)}
            href={`/events/${text(event.slug)}`}
            className={cn(CARD, "flex flex-col gap-2 no-underline transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between")}
          >
            <div>
              <h3 className="font-serif text-xl font-semibold">{text(event.title)}</h3>
              {text(event.location) ? <p className="text-sm text-muted-foreground">{text(event.location)}</p> : null}
            </div>
            <span className="shrink-0 text-sm font-semibold text-[#b88a4a]">{fmt(event.starts_at ?? event.start_at)}</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
