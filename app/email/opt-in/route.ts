import { renderConsentPage } from "@/lib/public-site/consent";

// Public email opt-in — submitted to Twilio alongside the SMS consent pages.
export const dynamic = "force-dynamic";

export function GET() {
  return renderConsentPage("email", "opt-in");
}
