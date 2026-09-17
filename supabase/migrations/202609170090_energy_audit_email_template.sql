-- Energy Audit results email — the branded template sent to the taker after they complete
-- the audit. Seeded as an editable email_templates row (rather than hardcoded HTML) so the
-- team can revise the copy in the Email Templates editor without a deploy.
--
-- Dynamic fields are supplied per-send via EmailRecipient.merge_data
-- (lib/energy-audit/results-email.ts). Table-shaped values that {{...}} can't express —
-- the four score rows — arrive pre-rendered as energy_rows_html / energy_rows_text.
insert into public.email_templates (name, slug, subject, preheader, category, status, available_fields, html_body, text_body)
values (
  $q$Energy Audit — Your Results$q$,
  $q$energy-audit-results$q$,
  $q$Your Energy Audit results, {{first_name}}$q$,
  $q$Where your tank is full, where it's leaking, and one next step.$q$,
  $q$assessment$q$,
  $q$active$q$,
  array[
    'first_name','full_name','email','total_score','total_max','interpretation_title','interpretation_meaning',
    'interpretation_reflection','focus_title','focus_refills_html','focus_refills_text','energy_rows_html',
    'energy_rows_text','next_action','next_action_block_html','conversation_person','renewal_rhythm',
    'strongest_title','audit_date','audit_url','dashboard_url','retake_url','site_url'
  ],
  $q$<div style="background:#f1eee7;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">

  <!-- Header -->
  <tr><td style="padding:26px 40px 0;text-align:center;">
    <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="104" alt="Michael J. Gauthier" style="width:104px;height:auto;border:0;" />
  </td></tr>
  <tr><td style="padding:16px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>

  <!-- Title -->
  <tr><td style="padding:22px 40px 2px;">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A46E;font-weight:700;">A Stewardship Blueprint Assessment</p>
    <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;line-height:1.25;color:#191815;font-weight:700;">Your Energy Audit</h1>
    <p style="margin:10px 0 0;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}}, thank you for taking the time to look honestly at where your tank sits. Here is your snapshot from {{audit_date}}.</p>
  </td></tr>

  <!-- Score -->
  <tr><td style="padding:18px 40px 0;">
    <div style="text-align:center;border:1px solid #e7e1d5;border-radius:10px;padding:22px;">
      <div style="font-size:42px;font-weight:700;color:#191815;line-height:1;">{{total_score}}<span style="font-size:18px;color:#7a736a;"> / {{total_max}}</span></div>
      <div style="font-size:16px;font-weight:700;color:#191815;margin-top:6px;">{{interpretation_title}}</div>
      <p style="font-size:14px;line-height:1.7;color:#7a736a;margin:10px 0 0;">{{interpretation_meaning}}</p>
      <p style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:#191815;margin:14px 0 0;">{{interpretation_reflection}}</p>
    </div>
  </td></tr>

  <!-- Four energies -->
  <tr><td style="padding:22px 40px 0;">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Where your tank sits</p>
    <table role="presentation" width="100%" style="border-collapse:collapse;">{{energy_rows_html}}</table>
  </td></tr>

  <!-- Begin renewing -->
  <tr><td style="padding:24px 40px 0;">
    <div style="background:#faf8f4;border-left:3px solid #C9A46E;border-radius:6px;padding:18px 20px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Where to begin renewing</p>
      <p style="margin:0 0 10px;font-family:Georgia,serif;font-size:19px;font-weight:700;color:#191815;">{{focus_title}}</p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#3a3632;">You don&rsquo;t need all of these. You need one.</p>
      {{focus_refills_html}}
    </div>
  </td></tr>

  <!-- What they committed to -->
  {{next_action_block_html}}

  <!-- CTA -->
  <tr><td style="padding:26px 40px 8px;text-align:center;">
    <a href="{{dashboard_url}}" style="display:inline-block;background:#191815;color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:8px;font-size:15px;font-weight:700;">View your results &amp; download the PDF &rarr;</a>
  </td></tr>
  <tr><td style="padding:0 40px 4px;text-align:center;">
    <a href="{{retake_url}}" style="font-size:13px;color:#7a736a;text-decoration:underline;">Take the Energy Audit again</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>
  <tr><td style="padding:18px 40px 30px;text-align:center;">
    <p style="margin:0 0 10px;font-family:Georgia,serif;font-style:italic;font-size:14px;line-height:1.7;color:#7a736a;">You were not created to run on empty.<br />You were created to be fully engaged in a life that matters.</p>
    <p style="margin:0 0 4px;font-size:13px;color:#3a3632;">&mdash; Michael J. Gauthier</p>
    <p style="margin:12px 0 0;font-size:11px;color:#9a948b;">
      <a href="{{site_url}}" style="color:#9a948b;text-decoration:underline;">michaeljgauthier.com</a>
      &nbsp;&middot;&nbsp;
      <a href="{{preferences_url}}" style="color:#9a948b;text-decoration:underline;">Email preferences</a>
      &nbsp;&middot;&nbsp;
      <a href="{{unsubscribe_url}}" style="color:#9a948b;text-decoration:underline;">Unsubscribe</a>
    </p>
  </td></tr>

</table></td></tr></table></div>$q$,
  $q$Your Energy Audit

Hi {{first_name}}, thank you for taking the time to look honestly at where your tank sits. Here is your snapshot from {{audit_date}}.

Score: {{total_score}} / {{total_max}} — {{interpretation_title}}
{{interpretation_meaning}}

Reflection: {{interpretation_reflection}}

WHERE YOUR TANK SITS
{{energy_rows_text}}

WHERE TO BEGIN RENEWING: {{focus_title}}
You don't need all of these. You need one.
{{focus_refills_text}}

View your results and download the PDF: {{dashboard_url}}
Take the Energy Audit again: {{retake_url}}

You were not created to run on empty. You were created to be fully engaged in a life that matters.

— Michael J. Gauthier
{{site_url}}$q$
)
on conflict (slug) do nothing;
