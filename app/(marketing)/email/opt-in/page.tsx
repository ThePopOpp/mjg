import type { Metadata } from "next";
import { ConsentPage } from "@/components/marketing/pages/consent";
import { CONSENT_COPY } from "@/lib/public-site/consent";

// Public email opt-in — submitted to Twilio alongside the SMS consent pages.
export const metadata: Metadata = {
  title: CONSENT_COPY.email["opt-in"].title,
  description: CONSENT_COPY.email["opt-in"].lede,
  alternates: { canonical: "/email/opt-in" },
};

export default function Page() {
  return <ConsentPage kind="email" mode="opt-in" />;
}
