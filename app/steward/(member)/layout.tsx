import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { MemberNav } from "@/components/steward/member-nav";

// The authenticated Steward app shell.
//
// A route group, so it wraps /steward, /steward/blueprint and
// /steward/conversation WITHOUT wrapping /steward/pricing — the pricing page is
// public marketing and keeps the site chrome.

export default async function StewardMemberLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/steward");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MemberNav />
      {/* Bottom padding clears the phone nav bar. */}
      <main className="flex-1 pb-24 md:pb-10">{children}</main>
    </div>
  );
}
