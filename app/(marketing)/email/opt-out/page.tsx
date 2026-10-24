import type { Metadata } from "next";
import { ConsentPage } from "@/components/marketing/pages/consent";
import { CONSENT_COPY } from "@/lib/public-site/consent";

// Public email opt-out — submitted to Twilio alongside the SMS consent pages.
export const metadata: Metadata = {
  title: CONSENT_COPY.email["opt-out"].title,
  description: CONSENT_COPY.email["opt-out"].lede,
  alternates: { canonical: "/email/opt-out" },
};

export default function Page() {
  return <ConsentPage kind="email" mode="opt-out" />;
}
