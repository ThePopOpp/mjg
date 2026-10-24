import type { Metadata } from "next";
import { ConsentPage } from "@/components/marketing/pages/consent";
import { CONSENT_COPY } from "@/lib/public-site/consent";

// Public SMS opt-in — one of the consent URLs submitted to Twilio for A2P 10DLC
// review. The disclosure wording on this form is what that review checks; see the
// note in lib/public-site/consent.ts before changing it.
export const metadata: Metadata = {
  title: CONSENT_COPY.sms["opt-in"].title,
  description: CONSENT_COPY.sms["opt-in"].lede,
  alternates: { canonical: "/sms/opt-in" },
};

export default function Page() {
  return <ConsentPage kind="sms" mode="opt-in" />;
}
