// /contact (contact.dc.html). The phone is the one the previous contact page
// published; the emails, company name and address default to the ones the legal
// documents commit to (lib/legal/addresses.ts), so /contact and /legal agree —
// never the Strategic Income Group address (owner, 2026-10-23).
// Messages land in Dashboard → Emails → Form Submissions (form_type "contact")
// and are emailed to the active Super Admins.

import { LEGAL_ENTITY, PRIVACY_EMAIL, SUPPORT_EMAIL } from "@/lib/legal/addresses";
import { defineScope, defineSection } from "../kit";
import { f, seoSection } from "./shared";

export type ContactTopic = { id: string; label: string; description: string };

export type ContactContent = {
  eyebrow: string;
  title: string;
  body: string;
  topicsLabel: string;
  topics: ContactTopic[];
  separationTitle: string;
  separationBody: string;
  formEyebrow: string;
  formTitle: string;
  marketingOptIn: string;
  submitLabel: string;
  storageConsent: string;
  directLabel: string;
  phone: string;
  email: string;
  emailLabel: string;
  address: string;
  mapUrl: string;
  privacyEmail: string;
  privacyLabel: string;
  successTitle: string;
  successBody: string;
  resetLabel: string;
};

const contact = defineSection<ContactContent>({
  key: "contact",
  label: "Contact page",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.text("topicsLabel", "Topics heading", 60),
    f.list(
      "topics",
      "Topics",
      [
        { key: "label", label: "Label", kind: "text", required: true, maxLength: 40 },
        f.text("description", "Description", 140),
      ],
      6,
      "Topic",
    ),
    f.text("separationTitle", "Separation note heading", 60),
    f.textarea("separationBody", "Separation note", 800),
    f.text("formEyebrow", "Form eyebrow", 40),
    f.text("formTitle", "Form heading", 80),
    f.text("marketingOptIn", "Optional updates checkbox", 200),
    f.text("submitLabel", "Button", 40),
    { key: "storageConsent", label: "Required consent checkbox", kind: "textarea", required: true, maxLength: 300 },
    f.text("directLabel", "Direct contact heading", 60),
    f.text("phone", "Phone", 30),
    f.text("email", "Support email", 80),
    f.text("emailLabel", "Support email label", 120),
    { key: "address", label: "Company and address (one line per row)", kind: "textarea", maxLength: 200 },
    { key: "mapUrl", label: "Map link", kind: "url" },
    f.text("privacyEmail", "Privacy email", 80),
    f.text("privacyLabel", "Privacy email label", 120),
    f.text("successTitle", "Thank-you title", 80),
    f.textarea("successBody", "Thank-you message", 300),
    f.text("resetLabel", "Send-another link", 40),
  ],
  defaults: {
    eyebrow: "Contact",
    title: "Let’s Connect.",
    body: "Have a question about the Stewardship Blueprint, an assessment, a study, a church experience, or your account? Send us a note and help us understand what you need.\n\nWe want to make it easy to find the right next step.",
    topicsLabel: "What Can We Help With?",
    // ids are what ?topic= selects (facilitator maps to church).
    topics: [
      { id: "general", label: "General Question", description: "The framework, book, articles, or available resources." },
      { id: "church", label: "Church or Group", description: "A study, facilitator question, or potential partnership." },
      { id: "steward", label: "Steward & Account", description: "Access, billing, privacy, or troubleshooting." },
      { id: "media", label: "Speaking & Media", description: "Invitations and interview inquiries." },
    ],
    separationTitle: "A Clear Separation",
    separationBody:
      "The Stewardship Blueprint is an educational and personal development experience. It is separate from Strategic Income Group’s investment advisory services. Inquiries through this site should not be treated as a request for investment advice.\n\nIf you need professional financial, legal, medical, or other specialized help, consult an appropriately qualified professional.",
    formEyebrow: "Contact Form",
    formTitle: "Tell Us What You Need.",
    marketingOptIn: "I would also like to receive Stewardship Blueprint resources and updates.",
    submitLabel: "Send a Message",
    storageConsent: "I consent to michaeljgauthier.com storing my submitted information so they can respond to my inquiry.",
    directLabel: "Reach Us Directly",
    phone: "(480) 466-7070",
    email: SUPPORT_EMAIL,
    emailLabel: "General account and product support",
    address: [LEGAL_ENTITY.name, ...LEGAL_ENTITY.addressLines].join("\n"),
    // Searched without the ZIP so the map finds the building either way.
    mapUrl: "https://www.google.com/maps/search/?api=1&query=2330+W+Ray+Rd+%233,+Chandler,+AZ",
    privacyEmail: PRIVACY_EMAIL,
    privacyLabel: "To access, correct, export or delete your personal information",
    successTitle: "Thanks for reaching out.",
    successBody: "We received your message and will follow up through the appropriate contact channel.",
    resetLabel: "Send another message",
  },
});

export const pageContact = defineScope({
  key: "page:contact",
  label: "Contact",
  path: "/contact",
  sections: {
    _seo: seoSection({
      title: "Contact",
      description:
        "Questions about the Stewardship Blueprint, an assessment, a study, a church experience, Steward, or speaking? Send a note and we will help you find the right next step.",
    }),
    contact,
  },
});
