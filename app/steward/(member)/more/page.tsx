import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PrototypeBanner } from "@/components/steward/prototype-banner";

export const dynamic = "force-dynamic";
export const metadata = { title: "More — Steward" };

// "More" is where the promises in the Privacy Policy become buttons.
//
// The policy commits to export, correction and deletion, and to messaging
// choices being separate from each other. Listing them here is what keeps that
// a real commitment rather than a paragraph — the docset's own note is to
// "publish only controls actually implemented", so each one below is marked
// with whether it exists yet.

const GROUPS = [
  {
    heading: "My Blueprint",
    items: [
      { label: "Export my Blueprint", note: "PDF, yours to keep", href: "#", ready: false },
      { label: "Version history", note: "See earlier seasons", href: "#", ready: false },
    ],
  },
  {
    heading: "My plan",
    items: [
      { label: "Plans and pricing", note: "Free, Full Build, Premium", href: "/steward/pricing", ready: true },
      { label: "Receipts and billing", note: "Invoices and payment method", href: "#", ready: false },
    ],
  },
  {
    heading: "My data",
    items: [
      { label: "Download my information", note: "Everything we hold", href: "#", ready: false },
      { label: "Correct something", note: "Fix what is wrong", href: "#", ready: false },
      { label: "Delete my account", note: "Permanently", href: "#", ready: false },
    ],
  },
  {
    heading: "Messages",
    items: [
      { label: "Email preferences", note: "Separate from texts", href: "/email/opt-out", ready: true },
      { label: "Text message preferences", note: "Separate from email", href: "/sms/opt-out", ready: true },
    ],
  },
  {
    heading: "Trust",
    items: [
      { label: "How Steward uses AI", note: "What it can and cannot do", href: "/ai-trust", ready: false },
      { label: "Privacy Policy", note: "", href: "/privacy", ready: true },
      { label: "Terms of Service", note: "", href: "/terms", ready: true },
    ],
  },
];

export default function MorePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8">
      <PrototypeBanner />
      <h1 className="font-serif text-3xl">More</h1>

      {GROUPS.map((group) => (
        <section key={group.heading} className="mt-7">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{group.heading}</h2>
          <ul className="mt-2 divide-y rounded-xl border">
            {group.items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 no-underline hover:bg-muted/50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px]">{item.label}</span>
                    {item.note ? (
                      <span className="block text-[12px] text-muted-foreground">{item.note}</span>
                    ) : null}
                  </span>
                  {!item.ready ? (
                    <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Not built yet
                    </span>
                  ) : null}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-8 text-[12px] leading-relaxed text-muted-foreground">
        Steward is operated by Stewardship Blueprint, LLC. For privacy requests, email privacy@michaeljgauthier.com.
      </p>
    </div>
  );
}
