-- Create a branded dashboard invitation email template and wire it to the
-- user_invitation event key so invites use it instead of the bare fallback.
--
-- The mapping row for user_invitation already exists (template_id = null).
-- This migration inserts the template and updates the mapping to point to it.

DO $$
DECLARE
  v_template_id uuid;
  v_html        text;
  v_text        text;
BEGIN

-- ─── HTML body ───────────────────────────────────────────────────────────────
v_html := $HTML$<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>You're Invited — MJG Dashboard</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;background:#f0ede7;font-family:'Geist',Arial,sans-serif;}
  img{border:0;display:block;max-width:100%;height:auto;}
  table{border-collapse:collapse;}
  a{color:inherit;}
</style>
</head>
<body style="margin:0;padding:0;background:#f0ede7;">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all;">Your exclusive access to the Michael J. Gauthier Dashboard is ready. Here is how to get started.&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;&zwnj;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede7;padding:32px 0;">
  <tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

    <!-- Header: dark brand bar with white logo -->
    <tr>
      <td style="background:#111111;border-radius:12px 12px 0 0;padding:36px 40px;text-align:center;">
        <img src="https://my.michaeljgauthier.com/mjg-logos/mjg_white.png" width="200" alt="Michael J. Gauthier" style="display:inline-block;width:200px;max-width:100%;height:auto;" />
      </td>
    </tr>

    <!-- Gold accent bar -->
    <tr>
      <td style="background:#c77c43;height:4px;font-size:0;line-height:0;">&nbsp;</td>
    </tr>

    <!-- Main body -->
    <tr>
      <td style="background:#ffffff;padding:48px 40px 40px;">

        <!-- Eyebrow label -->
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#c77c43;">
          Exclusive Dashboard Access
        </p>

        <!-- Headline -->
        <h1 style="margin:0 0 8px;font-size:36px;font-weight:800;line-height:1.12;color:#0f1f1a;">
          You're officially invited.
        </h1>
        <h2 style="margin:0 0 24px;font-size:20px;font-weight:400;line-height:1.4;color:#2f6848;">
          Welcome to the MJG Dashboard, {{first_name}}.
        </h2>

        <!-- Intro paragraph -->
        <p style="margin:0 0 28px;font-size:16px;line-height:1.75;color:#334155;">
          This is the Michael J. Gauthier command center &#8212; a private dashboard built for the people closest to this mission. Full visibility, real-time data, and every tool you need to stay aligned and engaged with what God is doing through Created for More.
        </p>

        <!-- Divider -->
        <div style="border-top:2px solid #f0ede7;margin:0 0 28px;font-size:0;line-height:0;">&nbsp;</div>

        <!-- What's inside heading -->
        <p style="margin:0 0 20px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0f1f1a;">
          What you'll find inside
        </p>

        <!-- Feature list -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
          <tr><td style="padding:0 0 14px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;padding-top:1px;">
                  <div style="width:22px;height:22px;border-radius:50%;background:#2f6848;color:#ffffff;font-size:12px;font-weight:700;line-height:22px;text-align:center;">1</div>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0;font-size:15px;font-weight:700;color:#0f1f1a;">Participants &amp; Journey Tracking</p>
                  <p style="margin:3px 0 0;font-size:14px;line-height:1.55;color:#64748b;">Full visibility into every participant, their progress, and their story through the 7-Day journey.</p>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:0 0 14px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;padding-top:1px;">
                  <div style="width:22px;height:22px;border-radius:50%;background:#2f6848;color:#ffffff;font-size:12px;font-weight:700;line-height:22px;text-align:center;">2</div>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0;font-size:15px;font-weight:700;color:#0f1f1a;">Email, Media &amp; Content Studio</p>
                  <p style="margin:3px 0 0;font-size:14px;line-height:1.55;color:#64748b;">Campaign emails, audio devotionals, video content, and the complete media library.</p>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:0 0 14px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;padding-top:1px;">
                  <div style="width:22px;height:22px;border-radius:50%;background:#2f6848;color:#ffffff;font-size:12px;font-weight:700;line-height:22px;text-align:center;">3</div>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0;font-size:15px;font-weight:700;color:#0f1f1a;">Reports &amp; Live Analytics</p>
                  <p style="margin:3px 0 0;font-size:14px;line-height:1.55;color:#64748b;">Real-time data on engagement, check-ins, survey responses, and mission impact.</p>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px;vertical-align:top;padding-top:1px;">
                  <div style="width:22px;height:22px;border-radius:50%;background:#2f6848;color:#ffffff;font-size:12px;font-weight:700;line-height:22px;text-align:center;">4</div>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0;font-size:15px;font-weight:700;color:#0f1f1a;">Contacts, Leads &amp; Communications</p>
                  <p style="margin:3px 0 0;font-size:14px;line-height:1.55;color:#64748b;">Manage every contact, send direct messages, and track outreach &#8212; all in one place.</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>

        <!-- Divider -->
        <div style="border-top:2px solid #f0ede7;margin:0 0 32px;font-size:0;line-height:0;">&nbsp;</div>

        <!-- CTA section -->
        <p style="margin:0 0 24px;font-size:16px;line-height:1.75;color:#334155;">
          Your invitation is active and ready. Click below to create your secure account and step inside. The dashboard is waiting for you.
        </p>

        <!-- Primary CTA button -->
        <div style="text-align:center;margin:0 0 16px;">
          <a href="{{invite_url}}" style="display:inline-block;background:#c77c43;color:#ffffff;text-decoration:none;padding:18px 48px;border-radius:8px;font-size:17px;font-weight:700;letter-spacing:0.03em;">
            Accept Your Invitation &#8594;
          </a>
        </div>

        <p style="margin:0 0 24px;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;">
          This link is secure and expires in 14 days.
        </p>

        <!-- Secondary: login link -->
        <div style="background:#f8f6f1;border-radius:8px;padding:16px 20px;text-align:center;">
          <p style="margin:0;font-size:14px;color:#64748b;">
            Already have your account?
            <a href="{{site_url}}/login" style="color:#2f6848;font-weight:700;text-decoration:none;">
              Log in to the dashboard &#8594;
            </a>
          </p>
        </div>

      </td>
    </tr>

    <!-- Quote banner -->
    <tr>
      <td style="background:#2f6848;padding:32px 40px;text-align:center;">
        <p style="margin:0 0 10px;font-size:18px;font-style:italic;line-height:1.6;color:#d4ebe0;">
          &#8220;Every resource you steward is a seed for something greater.&#8221;
        </p>
        <p style="margin:0;font-size:13px;font-weight:600;color:#a8d5be;letter-spacing:0.12em;text-transform:uppercase;">
          &#8212; Michael J. Gauthier
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#1a1a1a;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;">
          Michael J. Gauthier &bull; Created for More
        </p>
        <p style="margin:0;font-size:12px;color:#6b7280;">
          <a href="{{preferences_url}}" style="color:#9ca3af;text-decoration:underline;">Preferences</a>
          &nbsp;&bull;&nbsp;
          <a href="{{unsubscribe_url}}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>$HTML$;

-- ─── Plain text fallback ──────────────────────────────────────────────────────
v_text := $TEXT$YOU'RE OFFICIALLY INVITED — MJG DASHBOARD
==========================================

Welcome to the dashboard, {{first_name}}.

This is the Michael J. Gauthier command center — a private dashboard
built for the people closest to this mission. Full visibility, real-time
data, and every tool you need to stay aligned and engaged.

WHAT YOU'LL FIND INSIDE:
  1. Participants & Journey Tracking
     Full visibility into every participant, their progress, and story.

  2. Email, Media & Content Studio
     Campaign emails, audio devotionals, video content, and media library.

  3. Reports & Live Analytics
     Real-time data on engagement, check-ins, and mission impact.

  4. Contacts, Leads & Communications
     Manage every contact, send direct messages, and track outreach.

─────────────────────────────────────────

ACCEPT YOUR INVITATION:
{{invite_url}}

This link is secure and expires in 14 days.

Already have your account? Log in here:
{{site_url}}/login

─────────────────────────────────────────
"Every resource you steward is a seed for something greater."
— Michael J. Gauthier

Michael J. Gauthier · Created for More
Preferences: {{preferences_url}}
Unsubscribe: {{unsubscribe_url}}$TEXT$;

-- ─── Insert or update the email template ─────────────────────────────────────
INSERT INTO public.email_templates (
  name, slug, subject, preheader,
  html_body, text_body,
  category, status,
  created_at, updated_at
)
VALUES (
  'Dashboard Invitation',
  'dashboard-invitation',
  'You''re invited — access the MJG Dashboard',
  'Your exclusive dashboard access is ready. Here''s how to get started inside.',
  v_html,
  v_text,
  'new_user_signup',
  'active',
  now(), now()
)
ON CONFLICT (slug) DO UPDATE SET
  name      = EXCLUDED.name,
  subject   = EXCLUDED.subject,
  preheader = EXCLUDED.preheader,
  html_body = EXCLUDED.html_body,
  text_body = EXCLUDED.text_body,
  category  = EXCLUDED.category,
  status    = EXCLUDED.status,
  updated_at = now()
RETURNING id INTO v_template_id;

-- ─── Wire the template to the user_invitation event key ──────────────────────
-- The mapping row was seeded with template_id = null. Update it to point to
-- the new branded template so invitations no longer fall back to bare HTML.
INSERT INTO public.email_template_mappings (event_key, template_id, enabled, created_at, updated_at)
VALUES ('user_invitation', v_template_id, true, now(), now())
ON CONFLICT (event_key) DO UPDATE SET
  template_id = EXCLUDED.template_id,
  enabled     = true,
  updated_at  = now();

END $$;
