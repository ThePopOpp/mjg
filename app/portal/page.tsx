import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// The participant experience now lives in the scoped dashboard
// (/dashboard → ParticipantDashboard). Forward any old /portal links there.
export default function PortalRedirect() {
  redirect("/dashboard");
}
