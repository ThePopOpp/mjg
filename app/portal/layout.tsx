import { redirect } from "next/navigation";
import blackLogo from "@/docs/mjg-logos/mjg_black_white.png";
import whiteLogo from "@/docs/mjg-logos/mjg_white.png";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCurrentProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

// The participant portal — a logged-in space for pilot participants (the admin
// dashboard is role-gated separately). Any authenticated, active profile may
// view it; admins are routed here from /dashboard only if they are participants.
export default async function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/portal");
  if (profile.status !== "active") redirect("/access-restricted");

  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <span className="relative block h-8 w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={blackLogo.src} alt="MJG" className="h-full w-full object-contain object-left dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={whiteLogo.src} alt="MJG" className="hidden h-full w-full object-contain object-left dark:block" />
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{name}</span>
            <ThemeToggle />
            <form action="/auth/logout" method="post">
              <Button type="submit" variant="outline" size="sm">Sign out</Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
