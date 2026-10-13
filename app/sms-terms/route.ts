import { renderLegalRoute } from "@/lib/public-site/legal";

// Public SMS Messaging Terms. The 2026-10-09 package proposes this exact path
// and the SMS consent checkboxes link to it, so the slug is not arbitrary.
//
// There is deliberately NO file fallback: this page does not exist until the
// draft is published from CMS -> Legal, and 404 is the honest answer until then.
// Publishing is blocked while the draft still carries placeholders such as
// "[INSERT MAX OR ACCURATE EXPECTED FREQUENCY]" — a messaging terms page with a
// fake frequency is worse than no page at all for carrier review.
export const dynamic = "force-dynamic";

export function GET() {
  return renderLegalRoute({
    slug: "sms-terms",
    title: "SMS Messaging Terms",
    eyebrow: "Legal",
  });
}
