import { SectionHeader } from "@/components/dashboard/section-header";
import { SmsTabs } from "@/components/sms/sms-tabs";
import { SmsTemplateBuilder } from "@/components/sms/sms-template-builder";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function SmsTemplatesPage() {
  const supabase = createSupabaseAdminClient();
  const { data: templates } = await supabase
    .from("sms_templates")
    .select("id, name, slug, body, category, status, available_fields, updated_at")
    .in("status", ["draft", "active"])
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <SectionHeader title="SMS" description="Create and manage reusable SMS message templates." />
      <SmsTabs />
      <SmsTemplateBuilder templates={(templates ?? []) as any[]} />
    </div>
  );
}
