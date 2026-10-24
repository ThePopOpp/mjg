// The marketing site's building blocks — the handful of shapes every designed
// page is made of (see docs/mjg-frontend-updates/…/MJG Site Mockups - Handoff).
// Server components: no state, so they cost nothing on the client.

import { Children, isValidElement } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { Cta } from "@/lib/marketing/content/kit";
import { cn } from "@/lib/utils";

/** The page box that lines up with the nav: 1160px, 2rem gutters (1.25rem on phones). */
export const CONTAINER = "mx-auto w-full max-w-[1160px] px-5 sm:px-8";

export type Tone = "plain" | "muted" | "dark";

/**
 * A full-width section. `muted` is the warm band with hairlines top and bottom;
 * `dark` is the #141211 band, which stays dark in both themes.
 */
export function Band({
  tone = "plain",
  id,
  className,
  innerClassName,
  children,
  flush,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  /** No bottom padding — for a photo that sits on the section's bottom edge. */
  flush?: boolean;
}) {
  return (
    <section
      id={id}
      data-tone={tone}
      className={cn(
        "scroll-mt-20",
        tone === "muted" && "border-y bg-muted/60",
        tone === "dark" && "dark-band bg-band text-[#f4f1ea]",
        className,
      )}
    >
      <div className={cn(CONTAINER, "py-16 md:py-[72px]", flush && "pb-0 md:pb-0", innerClassName)}>{children}</div>
    </section>
  );
}

/** Gold uppercase label above a heading. `pill` is the outlined hero chip with ✦. */
export function Eyebrow({ children, pill, className }: { children: React.ReactNode; pill?: boolean; className?: string }) {
  if (!children) return null;
  if (pill) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light [.dark-band_&]:border-gold-light/50 [.dark-band_&]:text-gold-light",
          className,
        )}
      >
        <span aria-hidden>✦</span> {children}
      </span>
    );
  }
  return (
    <p
      className={cn(
        "text-[11.5px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light [.dark-band_&]:text-gold-light",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * Binds a text's last two words with a non-breaking space so a line never ends
 * on a single word (a standing rule here; text-wrap: pretty alone misses some).
 * Skipped when the pair is too long to share a line on a phone.
 */
export function keepTogether(text: string | null | undefined): string {
  if (!text) return "";
  // A short title wraps better on its own; gluing its last two words can strand the first.
  if (text.trim().split(/\s+/).length < 4) return text;
  const match = /\s+(\S+\s*)$/.exec(text);
  if (!match) return text;
  const before = text.slice(0, match.index);
  const prev = /\S+$/.exec(before)?.[0] ?? "";
  if (prev.length + match[1].trim().length > 18) return text;
  return `${before} ${match[1]}`;
}

/** Splits a title so its last word can carry the gold accent, keeping hyphenated words whole. */
function accentLast(title: string) {
  const words = title.trim().split(/\s+/);
  const last = words.pop() ?? "";
  // Keep a short final pair together; a longer one could overflow a phone-width headline.
  const prev = words.at(-1) ?? "";
  const glue = words.length >= 3 && prev.length + last.length <= 14 ? " " : " ";
  return { lead: words.join(" "), last, glue };
}

/**
 * A Fraunces heading. `level={1}` is the page headline with the last word in
 * gold; level 2 is a section heading (accent off unless asked for).
 */
export function Heading({
  title,
  level = 2,
  accent,
  className,
  italic,
}: {
  title: string;
  level?: 1 | 2 | 3;
  accent?: boolean;
  className?: string;
  italic?: boolean;
}) {
  const Tag = (`h${level}` as unknown) as "h1";
  const withAccent = accent ?? level === 1;
  const { lead, last, glue } = accentLast(title);
  return (
    <Tag
      className={cn(
        "text-balance font-display tracking-tight",
        level === 1 && "text-[clamp(2.4rem,5.2vw,3.75rem)] font-semibold leading-[1.05]",
        level === 2 && "text-[clamp(1.75rem,3.4vw,2.4rem)] font-medium leading-[1.12]",
        level === 3 && "text-xl font-medium leading-snug",
        italic && "italic",
        className,
      )}
    >
      {withAccent ? (
        <>
          {lead ? `${lead}${glue}` : ""}
          <em className="whitespace-nowrap not-italic text-gold [.dark-band_&]:text-gold-light dark:text-gold-light">{last}</em>
        </>
      ) : (
        keepTogether(title)
      )}
    </Tag>
  );
}

/** Inline markup inside a paragraph: **bold** and *italic* (Fraunces). */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={j} className="font-semibold text-foreground [.dark-band_&]:text-[#f4f1ea]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={j} className="font-display italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

/**
 * Paragraphs from content text. Blank lines separate paragraphs; **words** are
 * bold, *words* are italic Fraunces (quoted questions), and a paragraph that
 * starts with "> " is a pull-quote. Text is never parsed as HTML — content is
 * escaped like everything else React renders.
 */
export function Prose({ text, className, paragraphClassName }: { text: string; className?: string; paragraphClassName?: string }) {
  if (!text?.trim()) return null;
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    // text-pretty: no paragraph ever ends on a single word (a standing rule here).
    <div className={cn("space-y-4 text-pretty", className)}>
      {paragraphs.map((p, i) =>
        p.startsWith("> ") ? (
          <blockquote
            key={i}
            className="border-l-2 border-gold py-1 pl-4 font-display text-[1.2em] leading-snug text-foreground [.dark-band_&]:text-[#f4f1ea]"
          >
            {inline(keepTogether(p.slice(2)))}
          </blockquote>
        ) : (
          <p key={i} className={paragraphClassName}>
            {inline(keepTogether(p))}
          </p>
        ),
      )}
    </div>
  );
}

export type ButtonVariant = "primary" | "outline" | "gold" | "ghost";

const BUTTON = {
  base: "inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 text-[15px] font-semibold no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  primary: "bg-foreground text-background hover:bg-foreground/85",
  outline: "border border-border bg-transparent text-foreground hover:border-gold hover:text-gold-deep dark:hover:text-gold-light",
  gold: "bg-gold text-white hover:bg-gold-hover",
  // Outline on the dark band.
  ghost: "border border-white/20 bg-transparent text-[#f4f1ea] hover:border-gold-light hover:text-gold-light",
} as const;

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(BUTTON.base, BUTTON[variant], className);
}

function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

/** A link styled as a button. Renders nothing when the content leaves it empty. */
export function ButtonLink({
  cta,
  variant = "primary",
  className,
}: {
  cta: Cta | null | undefined;
  variant?: ButtonVariant;
  className?: string;
}) {
  if (!cta?.label || !cta.href) return null;
  if (isExternal(cta.href)) {
    return (
      <a href={cta.href} className={buttonClass(variant, className)}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={buttonClass(variant, className)}>
      {cta.label}
    </Link>
  );
}

/**
 * A pair (or row) of buttons, always equal width: full width on phones, stacked
 * at the width of the longest label in narrow columns; from lg up, side by side when
 * both fit the column and stacked when they do not.
 * Equal widths at every breakpoint is a standing design rule for this site.
 */
export function Actions({ children, className, center }: { children: React.ReactNode; className?: string; center?: boolean }) {
  // Buttons whose content is empty render nothing, so they do not count.
  const shown = Children.toArray(children).filter(
    (child) => !isValidElement(child) || !("cta" in (child.props as object)) || Boolean((child.props as { cta?: Cta | null }).cta?.label),
  );
  const single = shown.length === 1;
  return (
    <div
      className={cn(
        "mt-8 grid w-full gap-3 sm:w-fit sm:min-w-[15rem] [&>*]:w-full [&>*]:whitespace-nowrap lg:[&>*]:px-4",
        single
          ? // One button keeps its natural width (at least 15rem) at every size above phones.
            center && "sm:mx-auto"
          : center
            ? // Centred rows: equal columns sized to the longest label, centred as a group.
              "sm:mx-auto lg:grid-flow-col lg:auto-cols-fr lg:[&>*]:min-w-[15rem]"
            : // Side by side when both fit the column, stacked when they do not; equal either way.
              "lg:w-full lg:max-w-[34rem] lg:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Gold text link with an arrow. */
export function TextLink({ cta, className }: { cta: Cta | null | undefined; className?: string }) {
  if (!cta?.label || !cta.href) return null;
  const cls = cn(
    "inline-flex items-center gap-1 text-[15px] font-semibold text-gold-deep no-underline underline-offset-4 hover:underline dark:text-gold-light [.dark-band_&]:text-gold-light",
    className,
  );
  return isExternal(cta.href) ? (
    <a href={cta.href} className={cls}>
      {cta.label}
    </a>
  ) : (
    <Link href={cta.href} className={cls}>
      {cta.label}
    </Link>
  );
}

/** The heading block most sections open with. */
export function SectionIntro({
  eyebrow,
  title,
  lead,
  body,
  center,
  level = 2,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  body?: string;
  center?: boolean;
  level?: 1 | 2;
  className?: string;
}) {
  return (
    <div className={cn(center && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow ? <Eyebrow pill={level === 1}>{eyebrow}</Eyebrow> : null}
      <Heading title={title} level={level} className={eyebrow ? (level === 1 ? "mt-6" : "mt-3") : undefined} />
      {lead ? <p className="mt-5 text-lg font-medium leading-relaxed">{lead}</p> : null}
      {body ? (
        <Prose
          text={body}
          className={cn("mt-4 text-base leading-7 text-muted-foreground [.dark-band_&]:text-band-text", center && "mx-auto max-w-2xl")}
        />
      ) : null}
    </div>
  );
}

/** Status pill: live/free (green), upcoming (amber), future (grey). */
export function StatusPill({ tone, children }: { tone: "live" | "soon" | "future"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.12em]",
        tone === "live" && "bg-status-live/10 text-status-live dark:bg-status-live/20 dark:text-[#7cc4a2]",
        tone === "soon" && "bg-status-soon/10 text-status-soon dark:bg-gold/15 dark:text-gold-light",
        tone === "future" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function CheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function PillCloud({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2.5", className)}>
      {items.map((item) => (
        <li key={item} className="rounded-full border bg-card px-4 py-2 text-sm font-medium">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Two columns that collapse to one below md. `reverse` puts the second child first on desktop. */
export function Split({
  children,
  className,
  reverse,
  align = "center",
}: {
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  reverse?: boolean;
  align?: "center" | "start" | "end";
}) {
  return (
    <div
      className={cn(
        "grid gap-10 md:grid-cols-2 md:gap-12",
        align === "center" && "md:items-center",
        align === "end" && "md:items-end",
        className,
      )}
    >
      <div className={cn("min-w-0", reverse && "md:order-2")}>{children[0]}</div>
      <div className={cn("min-w-0", reverse && "md:order-1")}>{children[1]}</div>
    </div>
  );
}
