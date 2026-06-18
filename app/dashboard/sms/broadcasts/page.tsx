import { SectionHeader } from "@/components/dashboard/section-header";
import { SmsTabs } from "@/components/sms/sms-tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function SmsBroadcastsPage() {
  const supabase = createSupabaseAdminClient();

  // Group send logs by broadcast_id
  const { data: logs } = await supabase
    .from("sms_send_logs")
    .select("broadcast_id, status, sent_by, created_at, template_id, sms_templates(name), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(500);

  // Aggregate by broadcast_id
  const broadcasts: Record<string, { id: string; templateName: string | null; sentBy: string | null; createdAt: string; sent: number; failed: number; skipped: number; total: number }> = {};
  for (const log of logs ?? []) {
    const bid = (log as any).broadcast_id ?? "manual";
    if (!broadcasts[bid]) {
      broadcasts[bid] = {
        id: bid,
        templateName: (log as any).sms_templates?.name ?? null,
        sentBy: (log as any).profiles?.full_name ?? null,
        createdAt: (log as any).created_at,
        sent: 0, failed: 0, skipped: 0, total: 0,
      };
    }
    const b = broadcasts[bid];
    b.total++;
    if ((log as any).status === "sent" || (log as any).status === "delivered") b.sent++;
    else if ((log as any).status === "failed") b.failed++;
    else if ((log as any).status === "skipped") b.skipped++;
  }

  const broadcastList = Object.values(broadcasts).slice(0, 50);

  return (
    <div className="space-y-6">
      <SectionHeader title="SMS" description="History of bulk SMS broadcasts." />
      <SmsTabs />

      <Card>
        <CardHeader><CardTitle>Broadcast history</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Sent by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Skipped</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcastList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">No broadcasts yet.</TableCell>
                </TableRow>
              )}
              {broadcastList.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.templateName ?? "—"}</TableCell>
                  <TableCell>{b.sentBy ?? "—"}</TableCell>
                  <TableCell>{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{b.total}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="text-xs">{b.sent}</Badge>
                  </TableCell>
                  <TableCell>
                    {b.failed > 0 ? <Badge variant="destructive" className="text-xs">{b.failed}</Badge> : "—"}
                  </TableCell>
                  <TableCell>{b.skipped > 0 ? b.skipped : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
