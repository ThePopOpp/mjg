export const DEFAULT_SMS_FIELDS = [
  "first_name",
  "last_name",
  "full_name",
  "email",
  "phone",
  "wave",
  "source",
  "participant_type",
  "check_in_status",
  "survey_status",
  "sms_opt_out_url",
  "site_url",
] as const;

export type SmsField = (typeof DEFAULT_SMS_FIELDS)[number];

export const SMS_STOP_KEYWORDS = ["STOP", "QUIT", "CANCEL", "END", "UNSUBSCRIBE"];
export const SMS_START_KEYWORDS = ["START", "YES", "UNSTOP"];
export const SMS_HELP_KEYWORDS = ["HELP", "INFO"];

export const SMS_STOP_REPLY =
  "You have been unsubscribed from Created for More SMS messages. Reply START to re-subscribe. Msg&Data rates may apply.";

export const SMS_START_REPLY =
  "You have been re-subscribed to Created for More SMS messages. Reply STOP to unsubscribe. Msg&Data rates may apply.";

export const SMS_HELP_REPLY =
  "Created for More by Michael J. Gauthier. Msg&Data rates may apply. Reply STOP to unsubscribe, START to re-subscribe. Support: jw@michaeljgauthier.com";

export const SMS_OPT_IN_DISCLOSURE =
  "By opting in, you agree to receive SMS messages from Created for More. Msg freq varies. Msg&Data rates may apply. Reply STOP to unsubscribe, HELP for info.";
