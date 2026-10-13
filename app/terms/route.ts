import { renderLegalRoute } from "@/lib/public-site/legal";

// Public Terms of Service — required by Twilio A2P 10DLC and linked from the
// footer, the opt-in forms and the Privacy Policy. Served from legal_documents
// when published, falling back to the A2P markdown so this URL can never 404.
export const dynamic = "force-dynamic";

export function GET() {
  return renderLegalRoute({
    slug: "terms",
    title: "Terms of Service",
    eyebrow: "Legal",
    fallbackFile: "MJG-Terms-of-Service-A2P-10DLC.md",
  });
}
