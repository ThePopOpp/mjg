// SMS / email opt-in and opt-out pages: the copy.
//
// These are the consent pages Twilio's A2P 10DLC review looks at, so the exact
// disclosure wording on the opt-in forms matters: program name, message frequency,
// "Msg & data rates may apply", STOP/HELP, and links to the Privacy Policy and
// Terms. Keep those intact if you restyle this — the disclosure itself lives in
// components/marketing/consent-form.tsx, word for word as it was reviewed.
//
// The pages are React inside the marketing layout (app/(marketing)/sms|email/...),
// so they share the site's navigation and footer. The forms post to the same
// /api/public/<kind>/<mode> endpoints as before.

export type ConsentKind = "sms" | "email";
export type ConsentMode = "opt-in" | "opt-out";

export const CONSENT_COPY = {
  sms: {
    "opt-in": {
      title: "Subscribe to SMS Updates",
      lede: "Get occasional encouragement and stewardship reminders by text.",
      submit: "Subscribe to texts",
      successTitle: "You’re subscribed.",
      successBody: "Reply STOP at any time to unsubscribe, or HELP for help.",
    },
    "opt-out": {
      title: "Unsubscribe from SMS",
      lede: "Enter the mobile number you'd like to stop receiving texts on. You can also reply STOP to any message.",
      submit: "Unsubscribe from texts",
      successTitle: "You’ve been unsubscribed.",
      successBody: "You won’t receive any more texts. You can opt back in at any time.",
    },
  },
  email: {
    "opt-in": {
      title: "Subscribe to Email Updates",
      lede: "Get new resources, teaching and stewardship encouragement by email.",
      submit: "Subscribe to emails",
      successTitle: "You’re subscribed.",
      successBody: "You can unsubscribe at any time using the link in any email.",
    },
    "opt-out": {
      title: "Unsubscribe from Email",
      lede: "Enter the email address you'd like to stop receiving messages at.",
      submit: "Unsubscribe from emails",
      successTitle: "You’ve been unsubscribed.",
      successBody: "You won’t receive any more emails. You can opt back in at any time.",
    },
  },
} as const;
