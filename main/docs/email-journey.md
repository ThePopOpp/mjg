# Email Journey

The email journey shell is defined in `lib/email/journey.ts`.

## Sequence

- Email 0: Welcome / thank you / begin with the Check-In
- Email 1: Day 1 — What Kind of Life Are You Actually Building?
- Email 2: Day 2 — Faith at the Center
- Email 3: Day 3 — Purpose, Scoreboards, and Drift
- Email 4: Day 4 — Family and Relationships
- Email 5: Day 5 — Fitness, Energy, and Capacity
- Email 6: Day 6 — Fun, Joy, Money, and Meaningful Resources
- Email 7: Day 7 — One Faithful Next Step
- Email 8: Final survey invitation
- Email 9: Survey reminder
- Email 10: Thank-you / share request
- Email 11: Inner Circle invitation
- Email 12: Behind-the-scenes follow-up / what I am learning

## Current Behavior

When a participant completes the Check-In and opts in to the journey, the app creates scheduled rows in `email_journey_events`.

No real email is sent yet. The `provider` field is set to `manual_or_pending`, which supports Wave 0 manual testing.

## SMTP Provider Wiring

Hostinger SMTP/IMAP values are prepared through environment variables:

- `SMTP_HOST=smtp.hostinger.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=jw@michaeljgauthier.com`
- `SMTP_PASSWORD`
- `IMAP_HOST=imap.hostinger.com`
- `IMAP_PORT=993`
- `IMAP_SECURE=true`
- `IMAP_USER=jw@michaeljgauthier.com`
- `IMAP_PASSWORD`
- `NOTIFICATION_FROM_EMAIL`
- `NEXT_PUBLIC_SITE_URL`

The server-only SMTP helper lives in `lib/email/smtp.ts`. It does not send unless `SMTP_PASSWORD` is configured.

The journey worker still needs to be added: it should read pending `email_journey_events`, send the matching template, update `status`, `sent_at`, and `provider_message_id`, and record any error in `error_message`.
