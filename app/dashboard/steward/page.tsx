import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { listStewardConfigGroup } from "@/lib/steward/config";
import { SectionHeader } from "@/components/dashboard/section-header";
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
    // Same shell as every other dashboard page: the layout owns the gutters and
    // the width, so Steward lines up with Workspace, Plans and the rest.
    <div className="space-y-6">
      <SectionHeader
        title="Steward"
        description="How long Steward keeps what members tell it, and which AI provider is allowed to see it. Changes take effect without a redeploy."
      />

      <StewardSettings rows={rows as ConfigRow[]} />

      <p className="border-t pt-6 text-[12.5px] leading-relaxed text-muted-foreground">
        Every change is versioned — the previous value is kept, with who changed it and when, so a reply can be read
        back against the settings that were in force at the time.
      </p>
    </div>
  );
}
