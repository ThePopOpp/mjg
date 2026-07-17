import { renderLegalPage } from "@/lib/public-site/legal";

// Public Privacy Policy — required by Twilio A2P 10DLC and linked from the footer,
// the opt-in forms and the Terms. Source of truth is the markdown file.
export const dynamic = "force-dynamic";

export function GET() {
  return renderLegalPage({
    file: "MJG-Privacy-Policy-A2P-10DLC.md",
    title: "Privacy Policy",
    eyebrow: "Legal",
  });
}
