# Notifications

Notification logic starts in `lib/notifications/notify.ts`.

## Events

The current implementation creates dashboard notifications for:

- New Check-In completed
- New general survey completed
- New Pastor/Elder survey completed
- Inner Circle form submitted

The schema supports additional notifications for:

- Participant requests follow-up
- Story/interview permission granted
- Church or small-group interest
- Email journey issue/error
- Public form submission error

## Destinations

The first destination is `dashboard`. Email and SMS destinations can be added later after provider credentials are configured.

## Provider Safety

No real email or SMS notification is sent without explicit environment configuration.
