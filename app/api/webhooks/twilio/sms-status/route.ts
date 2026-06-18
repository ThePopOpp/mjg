import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const messageSid = String(formData.get("MessageSid") ?? "");
    const messageStatus = String(formData.get("MessageStatus") ?? "");
    const errorCode = formData.get("ErrorCode") ? String(formData.get("ErrorCode")) : null;
    const errorMessage = formData.get("ErrorMessage") ? String(formData.get("ErrorMessage")) : null;

    if (!messageSid || !messageStatus) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createSupabaseAdminClient();
    const update: Record<string, unknown> = { status: messageStatus };
    if (messageStatus === "delivered") update.delivered_at = new Date().toISOString();
    if (errorCode) update.error_code = errorCode;
    if (errorMessage) update.error_message = errorMessage;

    await supabase
      .from("sms_messages")
      .update(update)
      .eq("twilio_message_sid", messageSid);

    await supabase
      .from("sms_send_logs")
      .update({ status: messageStatus === "delivered" ? "delivered" : messageStatus === "failed" || messageStatus === "undelivered" ? "failed" : "sent" })
      .eq("twilio_message_sid", messageSid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SMS status webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
