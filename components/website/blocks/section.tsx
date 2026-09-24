import Link from "next/link";
import { cn } from "@/lib/utils";
import { mdToHtml } from "@/lib/cms/md";

/**
 * Shared chrome for every registered block (spec §26 — approved settings only,
 * never author-supplied class names). The five shared props from the registry
 * map onto design-system presets here and nowhere else, so the whole site stays
 * consistent no matter what Mike or Steward assemble.
 */

export type SectionProps = {
  background?: string;
  spacing?: string;
  width?: string;
  align?: string;
  hideOnMobile?: boolean;
};

const BACKGROUND: Record<string, string> = {
  default: "bg-background text-foreground",
  muted: "bg-[#f7f4ee] text-foreground dark:bg-[#17161a]",
  gold: "bg-[#b88a4a]/10 text-foreground",
  ink: "bg-[#14131a] text-[#f5f1ea] dark:bg-[#0d0c11]",
};

const SPACING: Record<string, string> = {
  none: "py-0",
  sm: "py-8",
  md: "py-12 md:py-16",
  lg: "py-20 md:py-28",
};

const WIDTH: Record<string, string> = {
  narrow: "max-w-3xl",
  standard: "max-w-[1160px]",
  wide: "max-w-[1400px]",
};

/** True when a block sits on a dark band and needs light-on-dark treatment. */
export function isInkBackground(props: SectionProps): boolean {
  return (props.background ?? "default") === "ink";
}

export function Section({
  block,
  className,
  children,
}: {
  block: SectionProps;
  className?: string;
  children: React.ReactNode;
}) {
  const background = BACKGROUND[block.background ?? "default"] ?? BACKGROUND.default;
  const spacing = SPACING[block.spacing ?? "md"] ?? SPACING.md;
  const width = WIDTH[block.width ?? "standard"] ?? WIDTH.standard;
  const centered = (block.align ?? "left") === "center";

  return (
    <section className={cn(background, spacing, block.hideOnMobile && "hidden sm:block")}>
      <div className={cn("mx-auto w-full px-6 sm:px-8", width, centered && "text-center", className)}>{children}</div>
    </section>
  );
}

/** Section heading + optional eyebrow and intro copy, used by most blocks. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  centered,
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  centered?: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  if (!eyebrow && !title && !description) return null;
  const big = Heading === "h1";
  return (
    <div className={cn(centered && "mx-auto max-w-3xl", className)}>
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
          <span aria-hidden>✦</span> {eyebrow}
        </span>
      ) : null}
      {title ? (
        <Heading
          className={cn(
            "font-serif font-semibold tracking-tight",
            big ? "mt-6 text-5xl leading-[1.05] sm:text-6xl" : "mt-4 text-3xl leading-tight sm:text-4xl",
          )}
        >
          {title}
        </Heading>
      ) : null}
      {description ? (
        <p className={cn("mt-4 text-lg leading-8 text-muted-foreground", centered && "mx-auto max-w-2xl")}>{description}</p>
      ) : null}
    </div>
  );
}

/**
 * Author copy → HTML. mdToHtml escapes first and then applies a small Markdown
 * subset, so nothing a content field holds can execute (spec §60/§61).
 */
export function RichText({ content, className }: { content?: string; className?: string }) {
  if (!content?.trim()) return null;
  return (
    <div
      className={cn(
        "space-y-4 text-[17px] leading-8 text-muted-foreground",
        "[&_a]:font-medium [&_a]:text-[#b88a4a] [&_a]:underline [&_a]:underline-offset-2",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: mdToHtml(content) }}
    />
  );
}

export type BlockLink = { label?: string; href?: string; newTab?: boolean };

/**
 * Renders a CTA. Internal links go through next/link for soft navigation;
 * external ones get rel="noopener noreferrer". A link with no href renders as
 * nothing rather than a dead button.
 */
export function ActionLink({
  link,
  variant = "primary",
  className,
}: {
  link?: BlockLink | null;
  variant?: "primary" | "outline" | "quiet";
  className?: string;
}) {
  const label = link?.label?.trim();
  const href = link?.href?.trim();
  if (!label || !href) return null;

  const styles = {
    primary: "bg-[#b88a4a] text-white hover:bg-[#a67a3d]",
    outline: "border border-[#b88a4a] text-[#b88a4a] hover:bg-[#b88a4a]/10",
    quiet: "text-[#b88a4a] underline underline-offset-4 hover:opacity-80",
  }[variant];

  const classes = cn(
    "inline-flex h-12 items-center justify-center rounded-md px-6 text-base font-semibold no-underline transition-colors",
    variant === "quiet" && "h-auto px-0",
    styles,
    className,
  );

  if (link?.newTab || /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={classes} target={link?.newTab ? "_blank" : undefined} rel={link?.newTab ? "noopener noreferrer" : undefined}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}

/** A row of CTAs that collapses cleanly on phones. */
export function ActionRow({ centered, children }: { centered?: boolean; children: React.ReactNode }) {
  return <div className={cn("mt-8 flex flex-wrap items-center gap-3", centered && "justify-center")}>{children}</div>;
}

const COLUMNS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

/** Responsive grid: one column on phones, the authored count from `sm` up. */
export function BlockGrid({ columns, className, children }: { columns?: string; className?: string; children: React.ReactNode }) {
  return <div className={cn("grid grid-cols-1 gap-6", COLUMNS[String(columns ?? "3")] ?? COLUMNS["3"], className)}>{children}</div>;
}

/**
 * Images are plain <img>: block content comes from a CMS at request time, so the
 * URLs are not known at build and next/image would need every future host
 * allow-listed. `loading="lazy"` keeps the public pages fast (spec §59).
 */
export function BlockImage({
  src,
  alt,
  className,
  priority,
}: {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src?.trim()) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt?.trim() ?? ""}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

export function asItems(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

export function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function asLink(value: unknown): BlockLink | null {
  if (!value || typeof value !== "object") return null;
  const v = value as BlockLink;
  return { label: text(v.label), href: text(v.href), newTab: v.newTab === true };
}
