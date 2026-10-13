// The contact addresses the legal documents commit us to answering.
//
// These are not decoration. The 2026-10-09 package names specific inboxes as
// the route for privacy rights requests and support, which means publishing a
// policy that cites an address nobody monitors is a promise we are not keeping.
// Keeping them in one typed place means the footer, the consent copy and the
// legal pages cannot drift from each other or from the published policy.
//
// From 00_README_Contact_Decisions.md:
//   General help ................ support@
//   Privacy / access / deletion . privacy@
//   Optional future aliases ..... billing@ (payments), legal@ (formal notices)
//   Transactional sender ........ notifications@ ("ensure replies have a
//                                 monitored destination")
//
// MAIL IS NOT ON RESEND. These mailboxes are hosted on Hostinger and are not
// verified senders in Resend, so nothing should send *as* them through the
// Resend path in lib/email/smtp.ts. See MAIL_SERVER below and
// docs/legal/EMAIL_SETUP.md.

export type LegalContact = {
  address: string;
  /** What a person reaches by writing here. Shown in the dashboard. */
  purpose: string;
  /** True when a published legal document directs people to this address. */
  citedInPolicy: boolean;
  /** True when the address must be watched by a human before launch. */
  mustBeMonitored: boolean;
};

export const LEGAL_CONTACTS = {
  support: {
    address: "support@michaeljgauthier.com",
    purpose: "General account and product support.",
    citedInPolicy: true,
    mustBeMonitored: true,
  },
  privacy: {
    address: "privacy@michaeljgauthier.com",
    purpose: "Privacy inquiries, data access, correction, export and deletion requests.",
    citedInPolicy: true,
    mustBeMonitored: true,
  },
  legal: {
    address: "legal@michaeljgauthier.com",
    purpose: "Formal legal notices.",
    citedInPolicy: false,
    mustBeMonitored: true,
  },
  billing: {
    address: "billing@michaeljgauthier.com",
    purpose: "Payment, invoice and subscription issues.",
    citedInPolicy: false,
    mustBeMonitored: true,
  },
  hello: {
    address: "hello@michaeljgauthier.com",
    purpose: "Public enquiries and the current outbound marketing sender.",
    citedInPolicy: false,
    mustBeMonitored: true,
  },
  notifications: {
    address: "notifications@michaeljgauthier.com",
    purpose: "Transactional sender for automated mail.",
    citedInPolicy: false,
    // The package is explicit that a no-reply style sender still needs replies
    // to land somewhere a human reads.
    mustBeMonitored: true,
  },
} as const satisfies Record<string, LegalContact>;

export type LegalContactKey = keyof typeof LEGAL_CONTACTS;

export const SUPPORT_EMAIL = LEGAL_CONTACTS.support.address;
export const PRIVACY_EMAIL = LEGAL_CONTACTS.privacy.address;
export const LEGAL_EMAIL = LEGAL_CONTACTS.legal.address;
export const BILLING_EMAIL = LEGAL_CONTACTS.billing.address;

/** Every address in the registry, for the dashboard's contact panel. */
export function listLegalContacts(): Array<LegalContact & { key: LegalContactKey }> {
  return (Object.entries(LEGAL_CONTACTS) as Array<[LegalContactKey, LegalContact]>).map(
    ([key, contact]) => ({ key, ...contact }),
  );
}

/**
 * The Hostinger mailbox settings, recorded so the dashboard can show operators
 * what these addresses actually run on.
 *
 * SMTP on 465 is implicit TLS, which is what lib/email/smtp.ts already assumes
 * when SMTP_PORT is 465 — so pointing SMTP_HOST at Hostinger is configuration,
 * not new code. POP3 is listed only because the provider offers it; it deletes
 * server-side state that several people need to read, so IMAP is the one to use.
 */
export const MAIL_SERVER = {
  imap: { host: "imap.hostinger.com", port: 993, security: "SSL/TLS" },
  smtp: { host: "smtp.hostinger.com", port: 465, security: "SSL/TLS (implicit)" },
  pop3: { host: "pop.hostinger.com", port: 995, security: "SSL/TLS", recommended: false },
} as const;

/**
 * DKIM selector published for the Hostinger mailboxes.
 *
 * The public key is safe to keep in the repo — it is served to the world from
 * DNS by design, and signature verification depends on it being public. The
 * private half never leaves Hostinger.
 *
 * Recorded here so the dashboard can show operators which selector is live, and
 * so a future DNS migration has the previous value to compare against. SPF and
 * DMARC are NOT recorded because they were not supplied; see
 * docs/legal/EMAIL_SETUP.md, which lists them as outstanding.
 */
export const MAIL_DKIM = {
  selector: "hostingermail1",
  host: "hostingermail1._domainkey",
  type: "TXT",
  value:
    "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4qsLj041x13TUVUwSRBNYffaGgEigGvUa4U2U5fQV0W/SzFoUs3vMEyHYrMbn8ltBU1dnD3Ihkdy1wvfm66LDbPLqJOredn8v8h7+VqEb6bnYinmoIqWpGYDO1LRu94XlIHr5tyY2o4yyW6M0TZhBD4VBvwylPps4qOBYtBj4v6lxFqscCZ4fdYG/CSOH17g8VVf5/qKQpUFV5YhRr8u+XzfFRuiP/8PubnodXFcf7ljYEulsZMr1G+hZpeaiRdCANVm3CmOMGB0Jk2KeHwVIkGP0hMMcLc7j7+dJ6VuEPFrcI87INkH6p6GfRryq4XoJdc64y/4IRK8r0hbQZ9kUwIDAQAB",
} as const;

/**
 * The operating entity behind the legal documents.
 *
 * Note this is Stewardship Blueprint, LLC — not Michael J. Gauthier personally
 * and not Strategic Income Group. The package is emphatic that the distinction
 * matters, so the published pages read it from here rather than restating it.
 */
export const LEGAL_ENTITY = {
  name: "Stewardship Blueprint, LLC",
  addressLines: ["2330 W Ray Rd #3", "Chandler, AZ 85284"] as const,
  website: "https://www.michaeljgauthier.com",
} as const;
