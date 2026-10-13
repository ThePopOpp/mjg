import { renderLegalRoute } from "@/lib/public-site/legal";

// Public Privacy Policy — required by Twilio A2P 10DLC and linked from the footer,
// the opt-in forms and the Terms. Served from legal_documents when published,
// falling back to the A2P markdown so this URL can never 404.
export const dynamic = "force-dynamic";

export function GET() {
  return renderLegalRoute({
    slug: "privacy",
    title: "Privacy Policy",
    eyebrow: "Legal",
    fallbackFile: "MJG-Privacy-Policy-A2P-10DLC.md",
  });
}
