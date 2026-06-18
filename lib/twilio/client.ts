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

export function validateTwilioRequest(url: string, params: Record<string, string>, signature: string) {
  const { validateRequest } = twilio;
  return validateRequest(TWILIO_AUTH_TOKEN, signature, url, params);
}
