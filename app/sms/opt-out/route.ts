import { renderConsentPage } from "@/lib/public-site/consent";

// Public SMS opt-out — submitted to Twilio for A2P 10DLC review. Replying STOP to
// any message does the same thing; this page exists so the option is reachable
// without a phone in hand.
export const dynamic = "force-dynamic";

export function GET() {
  return renderConsentPage("sms", "opt-out");
}
