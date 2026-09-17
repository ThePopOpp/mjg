import twilio from "twilio";

let _client: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (_client) return _client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required.");
  _client = twilio(sid, token);
  return _client;
}

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "+14804393335";
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
export const TWILIO_API_KEY = process.env.TWILIO_API_KEY ?? "";
export const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET ?? "";
export const TWILIO_TWIML_APP_SID = process.env.TWILIO_TWIML_APP_SID ?? "";

/**
 * Messaging Service that carries the approved A2P 10DLC campaign.
 *
 * Sending with `messagingServiceSid` instead of a bare `from` number is what routes traffic
 * through the registered campaign. Sending from the raw number only works when that number is
 * attached to the campaign's service — otherwise US carriers reject every message with
 * error 30034 ("message from an unregistered number") and it silently never arrives.
 */
export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID ?? "";

export function validateTwilioRequest(url: string, params: Record<string, string>, signature: string) {
  const { validateRequest } = twilio;
  return validateRequest(TWILIO_AUTH_TOKEN, signature, url, params);
}

/**
 * Fetches the finalized price of a call from Twilio. Twilio reports price as a
 * negative string (a charge) and may not populate it until shortly after the
 * call completes. Returns the positive magnitude, or null if not yet available.
 */
export async function fetchCallPrice(callSid: string): Promise<{ price: number; priceUnit: string | null } | null> {
  if (!callSid) return null;
  try {
    const call = await getTwilioClient().calls(callSid).fetch();
    if (call.price == null || call.price === "") return null;
    const value = Math.abs(parseFloat(String(call.price)));
    if (Number.isNaN(value)) return null;
    return { price: value, priceUnit: call.priceUnit ?? null };
  } catch (error) {
    console.error("fetchCallPrice error:", error);
    return null;
  }
}
