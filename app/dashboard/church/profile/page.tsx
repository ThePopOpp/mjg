import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ChurchProfileEditor } from "@/components/churches/church-profile-editor";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { adminChurchIdsFor, getChurch, listChurches } from "@/lib/churches/repository";
import { myChurchTitle } from "@/lib/churches/profile";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Church Profile: what a church admin shows publicly — name, contact, address, logo, photos and
// their own position. Super Admins can open any church with ?church=<id>.
export default async function ChurchProfilePage({ searchParams }: { searchParams: Promise<{ church?: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/church/profile");
  const isSuper = profile.role === ROLES.SUPER_ADMIN;
  if (!isSuper && profile.role !== ROLES.CHURCH_ADMIN) redirect("/access-restricted");

  const churchIds = isSuper ? (await listChurches()).map((c) => c.id) : await adminChurchIdsFor(profile.id);
  if (!churchIds.length) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Church Profile" description="You aren't an admin of any church right now. Contact MJG if that's a mistake." />
      </div>
    );
  }

  const { church: wanted } = await searchParams;
  const churchId = wanted && churchIds.includes(wanted) ? wanted : churchIds[0];
  const [church, title, choices] = await Promise.all([
    getChurch(churchId),
    myChurchTitle(profile.id, churchId),
    churchIds.length > 1 ? listChurches().then((all) => all.filter((c) => churchIds.includes(c.id))) : Promise.resolve([]),
  ]);
  if (!church) redirect("/dashboard/church");

  return (
    <div className="space-y-6">
      <SectionHeader title="Church Profile" description="How your church appears on its public page and on every official group's page." />
      {choices.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {choices.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/church/profile?church=${c.id}`}
              className={cn("rounded-full border px-3 py-1 text-sm", c.id === church.id ? "border-[#b88a4a] bg-[#b88a4a]/15 font-medium" : "hover:bg-muted")}
            >
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}
      <ChurchProfileEditor key={church.id} church={church} title={title} />
    </div>
  );
}
