import { renderLegalPage } from "@/lib/public-site/legal";

// Public Terms of Service — required by Twilio A2P 10DLC and linked from the
// footer, the opt-in forms and the Privacy Policy.
export const dynamic = "force-dynamic";

export function GET() {
  return renderLegalPage({
    file: "MJG-Terms-of-Service-A2P-10DLC.md",
    title: "Terms of Service",
    eyebrow: "Legal",
  });
}
