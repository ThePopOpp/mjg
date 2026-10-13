# Email setup for the legal contact addresses

The 2026-10-09 legal package names specific inboxes as the route for privacy
rights requests and support. Publishing a policy that cites an address nobody
reads is a promise we are not keeping, so this file records what exists, what is
actually wired, and what is still outstanding.

Code: `lib/legal/addresses.ts` holds the addresses, the server settings and the
DKIM record as typed constants. `lib/email/smtp.ts` is the send path.

## The addresses

| Address | Purpose | Cited in a policy? |
| --- | --- | --- |
| `support@michaeljgauthier.com` | General account and product support | **Yes** — Privacy Policy, Terms, SMS Terms, AI Trust Notice |
| `privacy@michaeljgauthier.com` | Privacy inquiries, access, correction, export, deletion | **Yes** — same four documents |
| `legal@michaeljgauthier.com` | Formal legal notices | No (package calls it an optional future alias) |
| `billing@michaeljgauthier.com` | Payment, invoice and subscription issues | No (optional future alias) |
| `hello@michaeljgauthier.com` | Public enquiries; current outbound marketing sender | No |
| `notifications@michaeljgauthier.com` | Transactional sender for automated mail | No |

The two marked **Yes** are the ones that matter legally. Once the Privacy Policy
is published, `privacy@` is the address a person uses to exercise a data right,
and it has to be monitored by a human. The package is also explicit that even a
no-reply style sender needs replies landing somewhere real, so
`notifications@` is not exempt.

## Mailbox server (Hostinger)

| Protocol | Hostname | Port | Security |
| --- | --- | --- | --- |
| IMAP (incoming) | `imap.hostinger.com` | 993 | SSL/TLS |
| SMTP (outgoing) | `smtp.hostinger.com` | 465 | SSL/TLS (implicit) |
| POP3 (incoming) | `pop.hostinger.com` | 995 | SSL/TLS — **not recommended** |

Use IMAP, not POP3. POP3 moves message state onto one device, which breaks as
soon as more than one person needs to read an inbox that a published policy
points at.

Port 465 is implicit TLS. `lib/email/smtp.ts` already treats port 465 as secure
without extra configuration, so pointing `SMTP_HOST` at Hostinger is
configuration rather than new code.

## DKIM

Published in DNS for the Hostinger mailboxes:

```
Host:  hostingermail1._domainkey
Type:  TXT
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4qsLj041x13TUVUwSRBNYffaGgEigGvUa4U2U5fQV0W/SzFoUs3vMEyHYrMbn8ltBU1dnD3Ihkdy1wvfm66LDbPLqJOredn8v8h7+VqEb6bnYinmoIqWpGYDO1LRu94XlIHr5tyY2o4yyW6M0TZhBD4VBvwylPps4qOBYtBj4v6lxFqscCZ4fdYG/CSOH17g8VVf5/qKQpUFV5YhRr8u+XzfFRuiP/8PubnodXFcf7ljYEulsZMr1G+hZpeaiRdCANVm3CmOMGB0Jk2KeHwVIkGP0hMMcLc7j7+dJ6VuEPFrcI87INkH6p6GfRryq4XoJdc64y/4IRK8r0hbQZ9kUwIDAQAB
```

The public key belongs in DNS and in this repo — verification depends on it
being public. The private half stays with Hostinger.

### Live DNS, checked 2026-10-13

An earlier draft of this file said SPF and DMARC were missing. That was wrong —
both exist. Actual records:

| Record | Name | Value |
| --- | --- | --- |
| MX | `michaeljgauthier.com` | `mx1.hostinger.com` (5), `mx2.hostinger.com` (10) |
| SPF | `michaeljgauthier.com` | `v=spf1 include:_spf.mail.hostinger.com ~all` |
| DMARC | `_dmarc.michaeljgauthier.com` | `v=DMARC1; p=none` |
| DKIM | `hostingermail1._domainkey` | Hostinger mailboxes (410 chars) |
| DKIM | `resend._domainkey` | Resend (218 chars) |
| SPF | `send.michaeljgauthier.com` | `v=spf1 include:amazonses.com ~all` |
| MX | `send.michaeljgauthier.com` | `feedback-smtp.us-east-1.amazonses.com` |

**Resend and Hostinger do not conflict**, and the reason is worth understanding
before anyone "tidies up" these records:

- Different DKIM selectors. DNS supports any number, so `hostingermail1._domainkey`
  and `resend._domainkey` coexist with no interaction.
- Resend's SPF lives on the `send.` subdomain, not the root. SPF is evaluated
  against the envelope MAIL FROM domain, so Resend passes via `send.`, Hostinger
  passes via the root, and there is only ever one SPF record per name. **Adding
  `include:amazonses.com` to the root SPF is not needed and risks the two-record
  permerror that breaks SPF entirely.**
- DMARC still passes for Resend mail because its DKIM signs with
  `d=michaeljgauthier.com`, which aligns with a `From:` at that domain.

**The one real gap: `p=none` is monitor-only.** It satisfies providers that want
a policy present but enforces nothing, so it does not stop someone spoofing the
domain. Tightening to `p=quarantine` is the eventual move, but only after
confirming from DMARC reports that every legitimate sender passes — tightening
first is how you silently start dropping your own mail.

## How sending actually resolves — read this before changing anything

`sendSmtpEmail()` in `lib/email/smtp.ts` checks Resend **first**:

```ts
export async function sendSmtpEmail(input: SendEmailInput) {
  if (hasResendConfig()) {          // true whenever RESEND_API_KEY is set
    return sendViaResend(input);    // sends as RESEND_FROM_EMAIL
  }
  // ... nodemailer via SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD
}
```

So **adding SMTP settings does not switch transports.** While `RESEND_API_KEY`
is present, every message goes through Resend and is sent as
`RESEND_FROM_EMAIL`, whatever the SMTP variables say.

### Current state (checked 2026-10-13, local `.env.local`)

| Variable | Value | Effect |
| --- | --- | --- |
| `RESEND_API_KEY` | set | **Resend is the active transport** |
| `RESEND_FROM_EMAIL` | `hello@michaeljgauthier.com` | every outbound message is from here |
| `SMTP_HOST` | `smtp.hostinger.com` | correct, but unused while Resend is set |
| `SMTP_PORT` | `465` | correct, but unused |
| `SMTP_USER` / `SMTP_PASSWORD` | set (`jw@michaeljgauthier.com`) | unused |
| `NOTIFICATION_FROM_EMAIL` | `jw@michaeljgauthier.com` | the SMTP `from`, so also unused |

Two things follow:

1. The Hostinger settings are already in place and already correct. Nothing is
   missing except the decision to use them.
2. **None of the six new addresses currently sends anything.** Mail goes out as
   `hello@`, and the SMTP fallback is pointed at the personal `jw@` mailbox.

### Do these addresses work with Resend? Yes.

`michaeljgauthier.com` is **verified** in the Resend account (since
2026-07-21, region us-east-1, all three DNS records verified). Resend authorises
a **domain**, not individual addresses, so every one of the six — and any other
address at the domain — can send through the existing configuration with no new
setup, no per-address verification and no DNS changes.

**But the app can only send as one of them.** `sendViaResend()` builds the `from`
header solely from `RESEND_FROM_EMAIL`; `SendEmailInput` has no `from` field, so
there is no per-message sender. Only `replyTo` can be varied per send. Sending
billing notices as `billing@` and support replies as `support@` therefore needs a
small change to `SendEmailInput` and `sendViaResend`, not anything in Resend.

Receiving is separate and already correct: MX points at Hostinger, so mail *to*
`privacy@` lands in the Hostinger mailbox. Resend does not receive it. Do not
point the root MX at a sending provider — that would break every mailbox the
legal documents tell people to write to.

### To send through Hostinger instead (optional, and not recommended for bulk)

In Coolify (and `.env.local` for local work):

1. Remove or blank `RESEND_API_KEY`. This is the step that actually switches
   transport; leaving it set makes the rest inert.
2. Keep `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`.
3. Set `SMTP_USER` and `SMTP_PASSWORD` to the mailbox that should send — most
   likely `notifications@michaeljgauthier.com` for automated mail.
4. Set `NOTIFICATION_FROM_EMAIL` to that same address. It is the SMTP `from`,
   and it defaults to `SMTP_USER` if absent, so set it explicitly.
5. Send one message and confirm it passes DKIM at the receiving end. The signing
   domain has to line up with the `from` domain or the signature buys nothing.

Deliverability note: Resend is a deliverability product and a shared Hostinger
mailbox is not. Moving the pilot and 6-Week Challenge sequences onto Hostinger
SMTP puts bulk sequence mail through a mailbox meant for correspondence, which
risks the sequence mail and the `privacy@` replies sharing one reputation. A
reasonable split is transactional and policy-contact mail on Hostinger, bulk
sequences staying on a deliverability provider.

## Before the Privacy Policy is published

- `support@` and `privacy@` are monitored by a named person, with a response
  path for access, correction, export and deletion requests.
- `privacy@` does not forward into Strategic Income Group systems, and SIG
  personnel have no access to it. The package is explicit about this and
  `05_SIG_Separation_and_Conflict_Policy_INTERNAL.md` treats contact-channel
  segregation as a mandatory control.
- DMARC tightened past `p=none` once reports confirm every sender passes.
- The in-app path the Privacy Policy promises for access and deletion exists, or
  the policy says "email `privacy@`" instead. The draft currently reads
  `[VERIFIED IN-APP PATH]`, which is one of the placeholders blocking publication.
