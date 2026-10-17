import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { listStewardConfigGroup } from "@/lib/steward/config";
import { StewardSettings, type ConfigRow } from "@/components/steward/steward-settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Steward — MJG Dashboard" };

// Steward settings, Super Admin only.
//
// Guarded here AND on the API route. The page guard stops a participant seeing
// the console; requireSuperAdmin on the route stops anyone posting to it
// directly. §E05: important prohibitions are enforced in code and permissions,
// not only in the interface.

export default async function StewardSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== ROLES.SUPER_ADMIN) redirect("/access-restricted");

  const rows = await listStewardConfigGroup(["agent", "retention"]);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <header>
        <h1 className="font-serif text-3xl">Steward</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          How long Steward keeps what members tell it, and which AI provider is allowed to see it. Changes take
          effect without a redeploy.
        </p>
      </header>

      <div className="mt-8">
        <StewardSettings rows={rows as ConfigRow[]} />
      </div>

      <p className="mt-10 border-t pt-6 text-[12.5px] leading-relaxed text-muted-foreground">
        Every change is versioned — the previous value is kept, with who changed it and when, so a reply can be read
        back against the settings that were in force at the time.
      </p>
    </div>
  );
}
