import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { ROLES } from "@/lib/rbac/roles";
import { getEnergyAuditById } from "@/lib/energy-audit/submissions";
import { energyAuditPdfFilename, renderEnergyAuditPdf } from "@/lib/energy-audit/pdf";

// Node runtime: pdfkit needs Node APIs and its on-disk font metrics.
export const runtime = "nodejs";

/**
 * Download one Energy Audit as a branded PDF.
 *
 * Authorized for exactly three cases, since an audit is personal:
 *   1. the person it belongs to (signed-in email matches the audit's email),
 *   2. an admin who can manage participants,
 *   3. the facilitator of a team the audit's owner belongs to.
 * Anyone else gets a 404 rather than a 403, so ids can't be probed for existence.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const profile = await getCurrentProfile().catch(() => null);
    if (!profile || profile.id === "local-preview") {
      return NextResponse.json({ error: "Sign in to download this report." }, { status: 401 });
    }

    const audit = await getEnergyAuditById(id);
    if (!audit) return NextResponse.json({ error: "Report not found." }, { status: 404 });

    const auditEmail = (audit.email ?? "").toLowerCase();
    const isOwner = Boolean(auditEmail && auditEmail === profile.email.toLowerCase());
    const isAdmin = can(profile.role, PERMISSIONS.MANAGE_PARTICIPANTS);
    const isFacilitator =
      !isOwner && !isAdmin && profile.role === ROLES.FACILITATOR
        ? await facilitatorLeadsAuditOwner(profile.id, auditEmail)
        : false;

    if (!isOwner && !isAdmin && !isFacilitator) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const pdf = await renderEnergyAuditPdf(audit);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${energyAuditPdfFilename(audit)}"`,
        "content-length": String(pdf.length),
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[energy-audit pdf] failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Unable to build the report." }, { status: 500 });
  }
}

/** True when the audit's owner (by email) is a participant on one of this facilitator's teams. */
async function facilitatorLeadsAuditOwner(facilitatorId: string, auditEmail: string) {
  if (!auditEmail) return false;
  const supabase = createSupabaseAdminClient();

  const { data: participant } = await supabase.from("participants").select("id").ilike("email", auditEmail).maybeSingle();
  if (!participant) return false;

  const { data: teams } = await supabase.from("facilitator_teams").select("id").eq("facilitator_id", facilitatorId);
  const teamIds = (teams ?? []).map((t) => t.id);
  if (!teamIds.length) return false;

  const { data: membership } = await supabase
    .from("facilitator_team_members")
    .select("id")
    .eq("participant_id", participant.id)
    .in("team_id", teamIds)
    .maybeSingle();
  return Boolean(membership);
}
