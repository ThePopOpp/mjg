import { renderConsentPage } from "@/lib/public-site/consent";

// Public SMS opt-in — one of the consent URLs submitted to Twilio for A2P 10DLC
// review. The disclosure wording on this form is what that review checks; see the
// note in lib/public-site/consent.ts before changing it.
export const dynamic = "force-dynamic";

export function GET() {
  return renderConsentPage("sms", "opt-in");
}
