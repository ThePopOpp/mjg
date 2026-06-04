# MJG Dashboard Deployment

Temporary testing domain:

```txt
https://blueprint.michaeljgauthier.com
```

Dashboard routes should resolve under the same Next.js app:

```txt
https://blueprint.michaeljgauthier.com/dashboard
https://blueprint.michaeljgauthier.com/dashboard/participants
https://blueprint.michaeljgauthier.com/dashboard/user-management
```

Set these production environment variables in the hosting provider:

```env
NEXT_PUBLIC_SITE_URL=https://blueprint.michaeljgauthier.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=jw@michaeljgauthier.com
SMTP_PASSWORD=
NOTIFICATION_FROM_EMAIL=jw@michaeljgauthier.com
ADMIN_NOTIFICATION_EMAIL=jw@michaeljgauthier.com
IMAP_HOST=imap.hostinger.com
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=jw@michaeljgauthier.com
IMAP_PASSWORD=
```

Supabase Auth URL settings should include:

```txt
Site URL: https://blueprint.michaeljgauthier.com
Redirect URL: https://blueprint.michaeljgauthier.com/auth/callback
```

When the final domain is ready, update:

```env
NEXT_PUBLIC_SITE_URL=https://www.michaeljgauthier.com
```

and update the Supabase Auth Site URL / Redirect URLs to the final domain as well.
