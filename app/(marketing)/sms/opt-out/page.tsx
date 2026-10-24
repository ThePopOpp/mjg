import type { Metadata } from "next";
import { ConsentPage } from "@/components/marketing/pages/consent";
import { CONSENT_COPY } from "@/lib/public-site/consent";

// Public SMS opt-out — submitted to Twilio for A2P 10DLC review. Replying STOP to
// any message does the same thing; this page exists so the option is reachable
// without a phone in hand.
export const metadata: Metadata = {
  title: CONSENT_COPY.sms["opt-out"].title,
  description: CONSENT_COPY.sms["opt-out"].lede,
  alternates: { canonical: "/sms/opt-out" },
};

export default function Page() {
  return <ConsentPage kind="sms" mode="opt-out" />;
}
