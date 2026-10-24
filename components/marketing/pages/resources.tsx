// /resources (resources.dc.html). The articles are the real published blog
// posts (lib/content/blog.ts); each links to /resources/<slug>. The mockup's
// queue of planned articles is not shown — nothing here links to a page that
// does not exist yet. ?topic=<area id> narrows the grid to one Blueprint area.

import Link from "next/link";
import { getPublishedPosts, normalizePostTags } from "@/lib/content/blog";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageResources, type ResourceTopic } from "@/lib/marketing/content/scopes/page-resources";
import { cn } from "@/lib/utils";
import { MediaFrame } from "../media";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, Split, TextLink, keepTogether } from "../primitives";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_text: string | null;
  author_name: string | null;
  featured_image_url: string | null;
  publish_at: string | null;
  created_at: string | null;
  category: { name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
};

function toPost(row: any): Post {
  return { ...row, category: row.category ?? null, tags: normalizePostTags(row) };
}

/** Category and tag slugs a post carries. */
function slugsOf(post: Post): string[] {
  return [post.category?.slug, ...post.tags.map((t) => t.slug)].filter((s): s is string => Boolean(s));
}

function matchesTopic(post: Post, topic: ResourceTopic): boolean {
  const wanted = new Set(
    [topic.id, ...topic.match.split(",")].map((s) => s.trim().toLowerCase()).filter(Boolean),
  );
  return slugsOf(post).some((s) => wanted.has(s));
}

/** ~230 words a minute, at least one. */
function readMinutes(post: Post): number | null {
  const words = post.content_text?.trim().split(/\s+/).length ?? 0;
  return words ? Math.max(1, Math.round(words / 230)) : null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export async function ResourcesPage({ topic: topicParam }: { topic?: string }) {
  const [{ hero, featured, browse, articles }, rows] = await Promise.all([
    getScopeContent(pageResources),
    getPublishedPosts().catch(() => []),
  ]);
  const posts = (rows as any[]).map(toPost);

  const feature = posts.find((p) => featured.slug && p.slug === featured.slug) ?? posts.find((p) => p.slug.includes("watch")) ?? posts[0];
  const counts = new Map(browse.topics.map((t) => [t.id, posts.filter((p) => matchesTopic(p, t)).length]));
  const active = browse.topics.find((t) => t.id === topicParam);
  const shown = active ? posts.filter((p) => matchesTopic(p, active)) : posts.filter((p) => p !== feature);

  return (
    <>
      {/* Hero */}
      <Band>
        <div className="max-w-3xl">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          <Prose text={hero.body} className="mt-6 text-[17px] leading-8 text-muted-foreground" />
          <Actions>
            <ButtonLink cta={hero.primaryCta} />
          </Actions>
        </div>
      </Band>

      {/* Featured Insight */}
      {feature ? (
        <Band tone="muted">
          <Split>
            <MediaFrame
              media={feature.featured_image_url ? { src: feature.featured_image_url, alt: feature.title } : featured.fallbackImage}
              ratio="4/3"
              sizes="(min-width: 1024px) 560px, 100vw"
            />
            <div>
              <Eyebrow>{featured.eyebrow}</Eyebrow>
              <div className="mt-4 flex flex-wrap gap-2">
                {[feature.slug === featured.slug ? featured.topic : feature.category?.name, feature.slug === featured.slug ? featured.kind : null]
                  .filter(Boolean)
                  .map((tag) => (
                    <span key={tag} className="rounded-full border border-gold/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gold-deep dark:text-gold-light">
                      {tag}
                    </span>
                  ))}
              </div>
              <Heading title={feature.title} className="mt-4" />
              <Prose
                text={feature.slug === featured.slug && featured.summary ? featured.summary : (feature.excerpt ?? "")}
                className="mt-5 text-[16px] leading-8 text-muted-foreground"
              />
              <p className="mt-5 text-[13.5px] text-muted-foreground">
                {[feature.author_name || "Michael J. Gauthier", readMinutes(feature) ? `${readMinutes(feature)} min read` : null].filter(Boolean).join(" · ")}
              </p>
              <TextLink cta={{ label: featured.readMore, href: `/resources/${feature.slug}` }} className="mt-5" />
            </div>
          </Split>
        </Band>
      ) : null}

      {/* Explore by Blueprint Area */}
      <Band id="browse">
        <SectionIntro eyebrow={browse.eyebrow} title={browse.title} className="max-w-3xl" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {browse.topics.map((t) => {
            const n = counts.get(t.id) ?? 0;
            const on = active?.id === t.id;
            return (
              <li key={t.id}>
                <Link
                  href={on ? "/resources#articles" : `/resources?topic=${t.id}#articles`}
                  scroll={false}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "flex h-full flex-col rounded-xl border bg-card p-5 text-foreground no-underline transition-colors",
                    on ? "border-gold ring-1 ring-gold" : "hover:border-gold/60",
                  )}
                >
                  <span className="font-display text-lg leading-snug">{keepTogether(t.title)}</span>
                  <span className="mt-2 flex-1 text-pretty text-[14px] leading-relaxed text-muted-foreground">{keepTogether(t.body)}</span>
                  <span className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-gold-deep dark:text-gold-light">
                    {n ? `${n} article${n === 1 ? "" : "s"}` : browse.emptyLabel}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Band>

      {/* Articles */}
      <Band tone="muted" id="articles">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionIntro
            eyebrow={articles.eyebrow}
            title={active ? articles.filteredTitle.replace("{area}", active.title) : articles.title}
            className="max-w-3xl"
          />
          {active ? <TextLink cta={{ label: articles.showAll, href: "/resources#articles" }} /> : null}
        </div>
        {shown.length ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/resources/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card text-foreground no-underline transition-colors hover:border-gold/60"
                >
                  <MediaFrame
                    media={post.featured_image_url ? { src: post.featured_image_url, alt: post.title } : featured.fallbackImage}
                    ratio="16/10"
                    rounded="rounded-none"
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-deep dark:text-gold-light">
                      {[post.category?.name, formatDate(post.publish_at ?? post.created_at)].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-2 text-pretty font-display text-xl leading-snug">{keepTogether(post.title)}</p>
                    {post.excerpt ? <p className="mt-2 line-clamp-3 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(post.excerpt)}</p> : null}
                    <span className="mt-auto pt-4 text-[14px] font-semibold text-gold-deep group-hover:underline dark:text-gold-light">{articles.readLabel}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-xl border bg-card p-6 sm:p-8">
            <p className="max-w-xl text-pretty text-[15.5px] leading-relaxed text-muted-foreground">{articles.empty}</p>
            <Actions>
              <ButtonLink cta={hero.primaryCta} />
            </Actions>
          </div>
        )}
      </Band>
    </>
  );
}
