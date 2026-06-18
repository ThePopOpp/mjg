import { SectionHeader } from "@/components/dashboard/section-header";
import { SmsTabs } from "@/components/sms/sms-tabs";
import { SmsCompose } from "@/components/sms/sms-compose";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function SmsComposePage() {
  const supabase = createSupabaseAdminClient();

  const [{ data: templates }, { data: participants }] = await Promise.all([
    supabase
      .from("sms_templates")
      .select("id, name, body")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("participants")
      .select("id, first_name, last_name, phone, sms_opt_in")
      .eq("sms_opt_in", true)
      .not("phone", "is", null)
      .order("first_name"),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="SMS" description="Send single or bulk SMS messages." />
      <SmsTabs />
      <SmsCompose
        templates={(templates ?? []) as any[]}
        participants={(participants ?? []) as any[]}
      />
    </div>
  );
}
