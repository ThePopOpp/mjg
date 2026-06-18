import Link from "next/link";
import { SectionHeader } from "@/components/dashboard/section-header";
import { CommunicationsManager } from "@/components/communications/communications-manager";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function CommunicationsPage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: participants }, { data: profilesRaw }] = await Promise.all([
    supabase
      .from("participants")
      .select("id, first_name, last_name, email, phone, sms_opt_in, email_opt_in, sms_opt_in_at, sms_opt_out_at, email_opt_in_at, email_opt_out_at")
      .order("first_name"),
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, sms_opt_in, email_opt_in, sms_opt_in_at, sms_opt_out_at, email_opt_in_at, email_opt_out_at")
      .neq("role", "participant")
      .order("full_name"),
  ]);

  const participantRecords = (participants ?? []).map((p: any) => ({
    id: p.id,
    name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
    email: p.email,
    phone: p.phone ?? null,
    sms_opt_in: p.sms_opt_in ?? true,
    email_opt_in: p.email_opt_in ?? true,
    sms_opt_in_at: p.sms_opt_in_at ?? null,
    sms_opt_out_at: p.sms_opt_out_at ?? null,
    email_opt_in_at: p.email_opt_in_at ?? null,
    email_opt_out_at: p.email_opt_out_at ?? null,
    entityType: "participant" as const,
  }));

  const profileRecords = (profilesRaw ?? []).map((p: any) => ({
    id: p.id,
    name: p.full_name ?? p.email,
    email: p.email,
    phone: p.phone ?? null,
    sms_opt_in: p.sms_opt_in ?? true,
    email_opt_in: p.email_opt_in ?? true,
    sms_opt_in_at: p.sms_opt_in_at ?? null,
    sms_opt_out_at: p.sms_opt_out_at ?? null,
    email_opt_in_at: p.email_opt_in_at ?? null,
    email_opt_out_at: p.email_opt_out_at ?? null,
    entityType: "profile" as const,
  }));

  const stats = {
    participants: {
      total: participantRecords.length,
      smsOptIn: participantRecords.filter((p) => p.sms_opt_in).length,
      emailOptIn: participantRecords.filter((p) => p.email_opt_in).length,
      smsOptOut: participantRecords.filter((p) => !p.sms_opt_in).length,
      emailOptOut: participantRecords.filter((p) => !p.email_opt_in).length,
    },
    profiles: {
      total: profileRecords.length,
      smsOptIn: profileRecords.filter((p) => p.sms_opt_in).length,
      emailOptIn: profileRecords.filter((p) => p.email_opt_in).length,
      smsOptOut: profileRecords.filter((p) => !p.sms_opt_in).length,
      emailOptOut: profileRecords.filter((p) => !p.email_opt_in).length,
    },
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Communications"
        description="Manage SMS and email opt-in/opt-out status for participants and dashboard users."
      />

      <div className="flex gap-2 border-b pb-4">
        <Link href="/dashboard/user-management" className="text-sm text-muted-foreground hover:text-foreground">Users</Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Communications</span>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 space-y-1">
        <p className="font-semibold">A2P 10DLC Compliance</p>
        <p>
          Opt-in pages: <a href="/sms/opt-in" target="_blank" className="underline">/sms/opt-in</a> · <a href="/email/opt-in" target="_blank" className="underline">/email/opt-in</a>
        </p>
        <p>
          Opt-out pages: <a href="/sms/opt-out" target="_blank" className="underline">/sms/opt-out</a> · <a href="/email/opt-out" target="_blank" className="underline">/email/opt-out</a>
        </p>
      </div>

      <CommunicationsManager
        participants={participantRecords}
        profiles={profileRecords}
        stats={stats}
      />
    </div>
  );
}
