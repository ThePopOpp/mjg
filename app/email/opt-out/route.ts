import { renderConsentPage } from "@/lib/public-site/consent";

// Public email opt-out — submitted to Twilio alongside the SMS consent pages.
export const dynamic = "force-dynamic";

export function GET() {
  return renderConsentPage("email", "opt-out");
}
