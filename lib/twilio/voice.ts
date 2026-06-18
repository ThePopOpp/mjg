import twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, TWILIO_TWIML_APP_SID, TWILIO_PHONE_NUMBER } from "@/lib/twilio/client";

export function generateVoiceAccessToken(profileId: string, identity: string): string {
  const { AccessToken } = twilio.jwt;
  const { VoiceGrant } = AccessToken;

  const key = TWILIO_API_KEY || TWILIO_ACCOUNT_SID;
  const secret = TWILIO_API_SECRET || process.env.TWILIO_AUTH_TOKEN || "";

  const token = new AccessToken(TWILIO_ACCOUNT_SID, key, secret, {
    identity,
    ttl: 3600,
  });

  const voiceGrant = new VoiceGrant({
    outgoingApplicationSid: TWILIO_TWIML_APP_SID || undefined,
    incomingAllow: true,
  });

  token.addGrant(voiceGrant);
  return token.toJwt();
}

export function buildInboundCallTwiml(callerNumber: string): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  response.say({ voice: "Polly.Joanna" }, "Thank you for calling. Please hold while we connect you.");

  const dial = response.dial({
    callerId: TWILIO_PHONE_NUMBER,
    record: "record-from-answer-dual",
    recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/recording`,
    recordingStatusCallbackMethod: "POST",
    timeout: 20,
  });

  dial.client("mjg-agent");

  response.say({ voice: "Polly.Joanna" }, "Sorry, we missed your call. Please leave a message after the tone and we will get back to you.");
  response.record({
    maxLength: 120,
    transcribe: true,
    transcribeCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/transcription`,
    action: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voice-status`,
  });
  response.say({ voice: "Polly.Joanna" }, "Thank you. Goodbye.");

  return response.toString();
}

export function buildOutboundCallTwiml(to: string): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  const dial = response.dial({
    callerId: TWILIO_PHONE_NUMBER,
    record: "record-from-answer-dual",
    recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/recording`,
    recordingStatusCallbackMethod: "POST",
  });

  dial.number(to);
  return response.toString();
}
