import { SectionHeader } from "@/components/dashboard/section-header";
import { loadProjectManagerData } from "@/lib/project-manager/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/server";
import { ProjectManagerClient } from "./project-manager-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Project Manager — MJG Dashboard" };

export default async function ProjectManagerPage() {
  const [data, profile] = await Promise.all([loadProjectManagerData("default"), getCurrentProfile()]);

  const supabase = createSupabaseAdminClient();
  const { data: staff } = await supabase
    .from("profiles")
    .select("full_name")
    .in("status", ["active", "invited"])
    .order("full_name");
  const staffOptions = (staff ?? []).map((s) => s.full_name).filter((n): n is string => Boolean(n));
  const currentUserName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace"
        title="Project Manager"
        description="Plan stewardship and operations work across projects, phases, tasks, and milestones — with templates, dependencies, and multiple views."
      />
      <ProjectManagerClient initialData={data} staffOptions={staffOptions} currentUserName={currentUserName} />
    </div>
  );
}
