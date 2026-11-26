import Image from "next/image";
import { ArrowDown } from "lucide-react";
import type { ScopeValues } from "@/lib/marketing/content/kit";
import type { pageAnnualRetreat } from "@/lib/marketing/content/scopes/page-annual-retreat";
import { RetreatRequestForm } from "./request-form";

// /annual-retreat: Mike's brief §2–§4. The headline sits in the page layout, not
// over the photo. Desktop: photo beside the headline. Phone: photo right under
// the intro, then the form. One main action: "Send Me the Free Guide".

type Content = ScopeValues<typeof pageAnnualRetreat>;

const PAGES = [
  { src: "/marketing/annual-retreat/guide-v1-0-cover.webp", alt: "The guide's cover: Annual Stewardship Blueprint Retreat Guide." },
  { src: "/marketing/annual-retreat/guide-v1-0-modes.webp", alt: "A page from the guide describing the four stewardship modes: Restore, Build, Protect and Multiply." },
  { src: "/marketing/annual-retreat/guide-v1-0-one-page-blueprint.webp", alt: "The guide's one-page Stewardship Blueprint summary worksheet." },
];

const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export function AnnualRetreatLanding({ content, preview }: { content: Content; preview: boolean }) {
  const { hero, movements, inside, faq, form } = content;
  const formCopy = { button: hero.button, emailLabel: form.emailLabel, nameLabel: form.nameLabel, note: form.note, sending: form.sending };
  const photo = hero.image?.src ? (
    <figure className="overflow-hidden rounded-2xl bg-[#efe8da] shadow-[0_18px_50px_-24px_rgba(16,17,15,0.45)] dark:bg-[#1d1e1a]">
      <Image src={hero.image.src} alt={hero.image.alt} width={900} height={675} priority sizes="(min-width: 1024px) 520px, 100vw" className="aspect-[4/3] h-auto w-full object-cover" />
    </figure>
  ) : null;

  return (
    <>
      {preview ? (
        <div className="border-b border-[#e2ca9a] bg-[#f6eedc] px-4 py-2 text-center text-[13px] text-[#6b5326] dark:border-[#4a3f27] dark:bg-[#231f15] dark:text-[#e2ca9a]">
          Preview: only you can see this page. It isn&apos;t public or indexed until it&apos;s released.
        </div>
      ) : null}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:pb-20 lg:pt-16">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9a7a45] dark:text-[#e2ca9a]">{hero.eyebrow}</p>
          <h1 className="mt-3 text-balance font-display text-[clamp(2.1rem,5.2vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.01em]">{hero.title}</h1>
          <div className="mt-5 space-y-4 text-pretty text-[17px] leading-relaxed text-[#3d4741] dark:text-[#c9cfc8]">
            {paragraphs(hero.body).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          {/* Phone: the photo comes right after the intro. */}
          <div className="mt-7 max-w-xl lg:hidden">{photo}</div>
          <div className="mt-8 max-w-xl rounded-2xl border border-[#e6dcc9] bg-white p-5 shadow-sm sm:p-6 dark:border-[#2e2d27] dark:bg-[#151612]">
            <RetreatRequestForm copy={formCopy} id="request" />
          </div>
        </div>
        <div className="hidden min-w-0 lg:block lg:pt-2">{photo}</div>
      </section>

      {/* ── Four movements ───────────────────────────────────────────────── */}
      <section aria-labelledby="movements-title" className="border-y border-[#ece4d4] bg-white dark:border-[#24231f] dark:bg-[#141511]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9a7a45] dark:text-[#e2ca9a]">{movements.eyebrow}</p>
          <h2 id="movements-title" className="mt-2 text-balance font-display text-[clamp(1.7rem,3.6vw,2.4rem)] font-medium leading-tight">
            {movements.title}
          </h2>
          {/* A real sequence: the guide moves through these in order. */}
          <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {movements.items.map((m, i) => (
              <li key={m.id} className="relative rounded-2xl border border-[#ece4d4] bg-[#faf8f4] p-6 dark:border-[#2a2925] dark:bg-[#10110f]">
                <span aria-hidden className="font-display text-[15px] text-[#b9975a]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-[21px] font-medium leading-snug">{m.title}</h3>
                <p className="mt-2 text-pretty text-[15px] leading-relaxed text-[#4a5550] dark:text-[#b9c0b9]">{m.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── What's inside, with real pages from the guide ────────────────── */}
      <section aria-labelledby="inside-title" className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:py-20">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9a7a45] dark:text-[#e2ca9a]">{inside.eyebrow}</p>
          <h2 id="inside-title" className="mt-2 font-display text-[clamp(1.7rem,3.6vw,2.4rem)] font-medium leading-tight">
            {inside.title}
          </h2>
          <ul className="mt-6 space-y-3">
            {inside.items
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((item) => (
                <li key={item} className="flex gap-3 text-[16px] leading-relaxed">
                  <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9aa70]" />
                  <span>{item}</span>
                </li>
              ))}
          </ul>
        </div>
        <figure className="min-w-0">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {PAGES.map((p, i) => (
              <div key={p.src} className={`overflow-hidden rounded-md border border-[#e6dcc9] bg-white shadow-[0_10px_30px_-18px_rgba(16,17,15,0.5)] dark:border-[#33312a] ${i === 1 ? "sm:-translate-y-3" : ""}`}>
                <Image src={p.src} alt={p.alt} width={720} height={932} sizes="(min-width: 1024px) 200px, 31vw" className="h-auto w-full" />
              </div>
            ))}
          </div>
          <figcaption className="mt-3 text-center text-[13px] text-[#5f6d66] dark:text-[#a7b0aa]">{inside.pageCaption}</figcaption>
        </figure>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-title" className="border-t border-[#ece4d4] bg-white dark:border-[#24231f] dark:bg-[#141511]">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9a7a45] dark:text-[#e2ca9a]">{faq.eyebrow}</p>
          <h2 id="faq-title" className="mt-2 font-display text-[clamp(1.7rem,3.6vw,2.4rem)] font-medium leading-tight">
            {faq.title}
          </h2>
          <div className="mt-7 divide-y divide-[#ece4d4] border-y border-[#ece4d4] dark:divide-[#2a2925] dark:border-[#2a2925]">
            {faq.items.map((item) => (
              <details key={item.id} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden className="text-xl leading-none text-[#b9975a] transition group-open:rotate-45 motion-reduce:transition-none">
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-pretty text-[16px] leading-relaxed text-[#3d4741] dark:text-[#c9cfc8]">{item.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="#request" className="inline-flex items-center gap-2 rounded-lg bg-[#c9aa70] px-6 py-3.5 text-[16px] font-semibold text-[#10110f] transition hover:bg-[#b9975a]">
              {hero.button}
              <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
