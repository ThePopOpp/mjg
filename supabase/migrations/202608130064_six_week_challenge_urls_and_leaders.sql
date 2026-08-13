-- The Life You're Building — 6-Week Challenge — real URLs + leader sequence.
-- Re-upserts the 21 participant templates swapping the earlier merge-field placeholders
-- ({{guide_url}}, {{video_url}}, {{book_waitlist_url}}, …) for real destinations:
--   • weekly/closing videos  → michaeljgauthier.com/6-week-challenge/videos/<slug>
--   • guide/book/forgedlife/invite/feedback/dates → the /6-week-challenge hub (anchored)
--   • 30-day follow-up → /book ;  Check-In → /created-for-more-check-in
-- Also rebrands the 5 leader/facilitator templates into the branded shell and wires a
-- new "6 Week Challenge — Leader" experience type sequence. Idempotent (upsert by slug).

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 00 · Challenge Accepted', '6wc-participant-00-challenge-accepted', 'You said yes, {{first_name}}. Let''s build.', 'This is not about polished answers. It is about honest men building on purpose.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">You&rsquo;re In</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Challenge Accepted</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Protect the six weeks. Bring honesty and courage.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">I&rsquo;m grateful you said yes to The Life You&rsquo;re Building 6-Week Challenge. This is not another thing to impress anyone with. It&rsquo;s an honest six-week journey for men willing to slow down, look at the life they&rsquo;re actually building, and begin stewarding it with more purpose.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Over the next six weeks we&rsquo;ll look at the whole structure &mdash; faith and identity, purpose, family, fitness, fun, finances, guardrails, keystone habits, energy, and legacy. The point isn&rsquo;t to redesign your life overnight. It&rsquo;s to begin with enough honesty to take one faithful next step.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><strong>Three things to do now:</strong></p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Add all six dates to your calendar.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Reply with one sentence: &ldquo;My hope for these six weeks is&hellip;&rdquo; I really do want to hear from you.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Think of one man who may need this next. No pressure &mdash; just begin praying about who to invite into a future group.</td></tr></table><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">What kind of life am I actually building?</div></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Lock It In</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Add the six dates to your calendar</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Protect these six weeks the way you&rsquo;d protect anything that matters. Put every session on the calendar now, before the busy weeks arrive.</p><div><a href="https://michaeljgauthier.com/6-week-challenge#dates" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Add to calendar &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Glad you&rsquo;re in,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Challenge Accepted

Hi {{first_name}},
I'm grateful you said yes to The Life You're Building 6-Week Challenge. This is not another thing to impress anyone with. It's an honest six-week journey for men willing to slow down, look at the life they're actually building, and begin stewarding it with more purpose.
Over the next six weeks we'll look at the whole structure — faith and identity, purpose, family, fitness, fun, finances, guardrails, keystone habits, energy, and legacy. The point isn't to redesign your life overnight. It's to begin with enough honesty to take one faithful next step.
Three things to do now:
-Add all six dates to your calendar.
-Reply with one sentence: "My hope for these six weeks is..." I really do want to hear from you.
-Think of one man who may need this next. No pressure — just begin praying about who to invite into a future group.
What kind of life am I actually building?

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 01 · Welcome & What to Expect', '6wc-participant-01-welcome', 'Your guide is here, {{first_name}}. Start here.', 'Take 20 honest minutes before we begin. Awareness is where stewardship starts.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Before Week 1</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Welcome &mdash; Start Here</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Your guide, your Check-In, and your first honest steps.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">One week from now, we begin. Below is your Participant Guide. Before our first meeting, take 15&ndash;20 quiet minutes and complete the first steps. Don&rsquo;t rush them. The goal isn&rsquo;t to look impressive &mdash; it&rsquo;s to tell the truth about the life that&rsquo;s actually being built.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><strong>Before Week 1, please:</strong></p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Watch the short invite video.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Download your Participant Guide.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Read the opening pages and group covenant.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Complete the BEFORE column of the Created for More Check-In.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">The Check-In isn&rsquo;t a grade. It&rsquo;s a mirror and a map &mdash; it helps you see where you&rsquo;re aligned, where you may be drifting, and what needs attention next.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Come to our first meeting ready to share one word that describes your current season and one hope you have for the next six weeks.</p><p style="text-align:center;margin:8px 0 20px;"><a href="https://michaeljgauthier.com/6-week-challenge#guide" style="display:inline-block;background:#191815;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Download the Participant Guide</a></p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Complete your BEFORE Check-In</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Take the seven-layer Created for More Check-In before Week 1 to see where you&rsquo;re aligned and where drift is showing up. You&rsquo;ll retake it after Week 6 and watch your score move where you did the work.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Grateful you&rsquo;re here,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Welcome — Start Here

Hi {{first_name}},
One week from now, we begin. Below is your Participant Guide. Before our first meeting, take 15–20 quiet minutes and complete the first steps. Don't rush them. The goal isn't to look impressive — it's to tell the truth about the life that's actually being built.
Before Week 1, please:
-Watch the short invite video.
-Download your Participant Guide.
-Read the opening pages and group covenant.
-Complete the BEFORE column of the Created for More Check-In.
The Check-In isn't a grade. It's a mirror and a map — it helps you see where you're aligned, where you may be drifting, and what needs attention next.
Come to our first meeting ready to share one word that describes your current season and one hope you have for the next six weeks.
Download the Participant Guide

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 02 · Start Strong Reminder', '6wc-participant-02-start-strong', 'Two days out, {{first_name}} — your first 20 minutes matter', 'Do not overthink it. Just answer what is actually true right now.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">48 Hours Out</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Start Strong</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">One honest step before we meet.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">We begin in two days. This is your friendly reminder to complete the BEFORE column of the Created for More Check-In and the Week 1 pre-work.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Set a timer for 20 minutes. Put your phone away. Answer from current reality, not from what you wish were true. The first question is simple, but don&rsquo;t rush past it:</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">What kind of life am I actually building?</div><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Bring one word that describes your current season and one hope for these six weeks. You&rsquo;re not behind &mdash; you&rsquo;re beginning. And beginning with honesty is already a meaningful step.</p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Before We Meet</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Finish your BEFORE Check-In</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">It takes about 20 minutes. Answer honestly &mdash; this is the baseline you&rsquo;ll measure real change against in six weeks.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Complete the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">You&rsquo;re beginning,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Start Strong

Hi {{first_name}},
We begin in two days. This is your friendly reminder to complete the BEFORE column of the Created for More Check-In and the Week 1 pre-work.
Set a timer for 20 minutes. Put your phone away. Answer from current reality, not from what you wish were true. The first question is simple, but don't rush past it:
What kind of life am I actually building?
Bring one word that describes your current season and one hope for these six weeks. You're not behind — you're beginning. And beginning with honesty is already a meaningful step.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 03 · Week 1 — Wake Up', '6wc-participant-week-1', 'Week 1: Wake Up — {{first_name}}, what are you building?', 'Drift is subtle. Design is intentional. This week we start telling the truth.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week One</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 1 &mdash; Wake Up</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Name your current reality and notice the drift.</p></div></td></tr>
      <tr><td style="padding:8px 40px 36px;"><a href="https://michaeljgauthier.com/6-week-challenge/videos/week-1" style="text-decoration:none;display:block;"><img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" /></a></td></tr>
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week is Week 1: Wake Up. It&rsquo;s not about shame, panic, or a dramatic overhaul. It&rsquo;s about awareness. Most men don&rsquo;t decide to neglect what matters &mdash; drift usually happens quietly. One busy week becomes a busy season. One postponed conversation becomes distance.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">The first step isn&rsquo;t to fix everything. The first step is to see clearly. Watch this week&rsquo;s video, then come ready to share:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">One word that describes your current season.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">One hope you have for these six weeks.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">One area where you sense drift may be showing up.</td></tr></table><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">You cannot steward what you refuse to examine.</div></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Complete your BEFORE Check-In</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">If you haven&rsquo;t yet, take the seven-layer Created for More Check-In before we meet. You&rsquo;ll retake it after Week 6 and watch your score move where you did the work.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Let&rsquo;s build,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Week 1 — Wake Up

Hi {{first_name}},
This week is Week 1: Wake Up. It's not about shame, panic, or a dramatic overhaul. It's about awareness. Most men don't decide to neglect what matters — drift usually happens quietly. One busy week becomes a busy season. One postponed conversation becomes distance.
The first step isn't to fix everything. The first step is to see clearly. Watch this week's video, then come ready to share:
-One word that describes your current season.
-One hope you have for these six weeks.
-One area where you sense drift may be showing up.
You cannot steward what you refuse to examine.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 04 · Week 1 Follow-Up', '6wc-participant-04-week-1-followup', 'Week 1 follow-up: one sentence, one conversation', 'Keep your six-week intention where you can see it. Then have the conversation you named.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week 1 &middot; Action</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Keep the Intention Visible</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Move awareness into one visible step.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Thank you for showing up with honesty this week. Week 1 asked us to wake up to the life being built. Now the work moves from the room into real life. This week, take two simple actions:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Put your six-week intention somewhere visible &mdash; desk, mirror, phone lock screen, Bible, journal, or calendar.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Have one honest conversation with a spouse, friend, mentor, or accountability partner about the area that needs attention.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Don&rsquo;t make the conversation perfect. Make it honest. Then reply to this email with your one-sentence intention &mdash; I want to hear from you, and I&rsquo;ll be praying it moves from an idea to a real step.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Transformation begins with one honest step taken in the open.</div><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><em>P.S. If someone came to mind during Week 1, write his name down. There may be a man who needs this challenge next.</em></p></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">One honest step,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Keep the Intention Visible

Hi {{first_name}},
Thank you for showing up with honesty this week. Week 1 asked us to wake up to the life being built. Now the work moves from the room into real life. This week, take two simple actions:
-Put your six-week intention somewhere visible — desk, mirror, phone lock screen, Bible, journal, or calendar.
-Have one honest conversation with a spouse, friend, mentor, or accountability partner about the area that needs attention.
Don't make the conversation perfect. Make it honest. Then reply to this email with your one-sentence intention — I want to hear from you, and I'll be praying it moves from an idea to a real step.
Transformation begins with one honest step taken in the open.
P.S. If someone came to mind during Week 1, write his name down. There may be a man who needs this challenge next.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 05 · Week 2 — See the Blueprint', '6wc-participant-week-2', 'Week 2: See the Blueprint — identity before strategy', 'Before we fix the visible structure, we ask what the life is rooted in.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Two</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 2 &mdash; See the Blueprint</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Clarify bedrock, identity, values, mission, and daily purpose.</p></div></td></tr>
      <tr><td style="padding:8px 40px 36px;"><a href="https://michaeljgauthier.com/6-week-challenge/videos/week-2" style="text-decoration:none;display:block;"><img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" /></a></td></tr>
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week we move from awareness to foundation: Bedrock and Foundation. A blueprint can show where the walls go, but it can&rsquo;t tell you why the house is being built. That question comes first.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week we&rsquo;ll ask:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What is my life rooted in?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Where do I receive worth?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What values am I willing to protect?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What mission or daily purpose should guide this season?</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 2 video, then complete the pre-work in your guide. Don&rsquo;t wait for perfect language &mdash; a rough, honest mission statement is more useful than a polished sentence that never shapes a decision. Bring one value or sentence you want to carry into this season.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">A strong life is built from the inside out.</div></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Week 2 — See the Blueprint

Hi {{first_name}},
This week we move from awareness to foundation: Bedrock and Foundation. A blueprint can show where the walls go, but it can't tell you why the house is being built. That question comes first.
This week we'll ask:
-What is my life rooted in?
-Where do I receive worth?
-What values am I willing to protect?
-What mission or daily purpose should guide this season?
Watch the Week 2 video, then complete the pre-work in your guide. Don't wait for perfect language — a rough, honest mission statement is more useful than a polished sentence that never shapes a decision. Bring one value or sentence you want to carry into this season.
A strong life is built from the inside out.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 06 · Week 2 Follow-Up', '6wc-participant-06-week-2-followup', 'Week 2 follow-up: put it where you can see it', 'A value you never protect may be more preference than priority.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week 2 &middot; Action</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Put It Where You Can See It</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Make your mission and values visible and practical.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week you began drafting the foundation beneath your life &mdash; bedrock, mission, values, life verse, and daily purpose. Now make it visible.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Choose one value, verse, phrase, or sentence from your pre-work and put it somewhere you&rsquo;ll see it every day this week. Then use it as a decision filter and ask:</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">What would change if I lived from this instead of reaction, pressure, approval, or urgency?</div><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Reply with the sentence or value you chose. I want to hear what&rsquo;s becoming clearer. You don&rsquo;t need your whole future mapped out &mdash; you need enough clarity to take the next faithful step.</p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Go Deeper</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Join the book updates list</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">The Life You&rsquo;re Building goes deeper into this framework through story, Scripture, reflection, and practical action. Get updates, tools, and behind-the-scenes pieces as we go.</p><div><a href="https://michaeljgauthier.com/6-week-challenge#book" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Join the list &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Put It Where You Can See It

Hi {{first_name}},
This week you began drafting the foundation beneath your life — bedrock, mission, values, life verse, and daily purpose. Now make it visible.
Choose one value, verse, phrase, or sentence from your pre-work and put it somewhere you'll see it every day this week. Then use it as a decision filter and ask:
What would change if I lived from this instead of reaction, pressure, approval, or urgency?
Reply with the sentence or value you chose. I want to hear what's becoming clearer. You don't need your whole future mapped out — you need enough clarity to take the next faithful step.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 07 · Week 3 — Evaluate the Pillars', '6wc-participant-week-3', 'Week 3: Family. Fitness. Fun. Finances. One next step.', 'The goal is not perfect balance. The goal is faithful alignment.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Three</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 3 &mdash; Evaluate the Pillars</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Assess family, fitness, fun, and finances; choose one focus.</p></div></td></tr>
      <tr><td style="padding:8px 40px 36px;"><a href="https://michaeljgauthier.com/6-week-challenge/videos/week-3" style="text-decoration:none;display:block;"><img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" /></a></td></tr>
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week we move into the four visible pillars of the life you&rsquo;re building: Family, Fitness, Fun, and Finances. These aren&rsquo;t four unrelated categories &mdash; they&rsquo;re everyday areas of stewardship that support the whole structure. Neglect in one eventually affects the rest.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 3 video, complete the pillar evaluation, and ask honestly:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Are the people closest to me receiving presence, or leftovers?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Is my body supporting the life I&rsquo;m called to build?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Am I making room for joy, rest, and meaningful experiences?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Are my resources serving purpose, or carrying fear and comparison?</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Before we meet, choose <strong>one focus pillar</strong> for the next 90 days &mdash; the one that would create the most positive ripple if strengthened. Bring one win, one concern, and one focus pillar.</p></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Week 3 — Evaluate the Pillars

Hi {{first_name}},
This week we move into the four visible pillars of the life you're building: Family, Fitness, Fun, and Finances. These aren't four unrelated categories — they're everyday areas of stewardship that support the whole structure. Neglect in one eventually affects the rest.
Watch the Week 3 video, complete the pillar evaluation, and ask honestly:
-Are the people closest to me receiving presence, or leftovers?
-Is my body supporting the life I'm called to build?
-Am I making room for joy, rest, and meaningful experiences?
-Are my resources serving purpose, or carrying fear and comparison?
Before we meet, choose one focus pillar for the next 90 days — the one that would create the most positive ripple if strengthened. Bring one win, one concern, and one focus pillar.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 08 · Week 3 Follow-Up', '6wc-participant-08-week-3-followup', 'Week 3 follow-up: one pillar, seven days', 'Trying to fix everything usually fixes nothing. Choose the next faithful step.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week 3 &middot; Action</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">One Pillar, Seven Days</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Turn assessment into a small, real action.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week you named one pillar that needs focused attention. Now make the first step small enough to take this week:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;"><strong>Family</strong> &mdash; schedule one conversation, walk, meal, apology, encouragement, or act of presence.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;"><strong>Fitness</strong> &mdash; choose one capacity rhythm: walk, workout, bedtime, appointment, meal plan, or recovery.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;"><strong>Fun</strong> &mdash; schedule one life-giving experience this week and one larger one to plan.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;"><strong>Finances</strong> &mdash; review one spending, saving, giving, or planning pattern and name what money should serve.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Reply with your focus pillar and first seven-day action. I want to hear what you&rsquo;re putting into motion.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Repeated faithfulness becomes the architecture of character.</div></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$One Pillar, Seven Days

Hi {{first_name}},
This week you named one pillar that needs focused attention. Now make the first step small enough to take this week:
-Family — schedule one conversation, walk, meal, apology, encouragement, or act of presence.
-Fitness — choose one capacity rhythm: walk, workout, bedtime, appointment, meal plan, or recovery.
-Fun — schedule one life-giving experience this week and one larger one to plan.
-Finances — review one spending, saving, giving, or planning pattern and name what money should serve.
Reply with your focus pillar and first seven-day action. I want to hear what you're putting into motion.
Repeated faithfulness becomes the architecture of character.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 09 · Midpoint Pulse', '6wc-participant-09-midpoint-pulse', 'We''re halfway through, {{first_name}}. Tell me the truth.', 'Honest feedback is a gift. What is landing, what is unclear, what would help?', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Halfway</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Tell Me the Truth</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">A midpoint pulse &mdash; I want to hear from you.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">We&rsquo;re halfway through. Thank you for the honesty, effort, and courage you&rsquo;ve brought so far. This isn&rsquo;t meant to be a lecture series &mdash; it&rsquo;s meant to create reflection, conversation, action, and transformation.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">I&rsquo;d be grateful if you&rsquo;d reply with a few lines:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What has resonated most so far?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What has been least clear or hardest to apply?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What would make the next three weeks more useful?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Who is one man who may need this kind of challenge?</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Please tell me the truth. Encouragement helps. Friction helps too. I want this to genuinely serve men, families, churches, and communities.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><em>P.S. Nothing personal you share is used publicly without separate written permission. Feedback helps us build better; your story remains yours.</em></p></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Grateful for you,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Tell Me the Truth

Hi {{first_name}},
We're halfway through. Thank you for the honesty, effort, and courage you've brought so far. This isn't meant to be a lecture series — it's meant to create reflection, conversation, action, and transformation.
I'd be grateful if you'd reply with a few lines:
-What has resonated most so far?
-What has been least clear or hardest to apply?
-What would make the next three weeks more useful?
-Who is one man who may need this kind of challenge?
Please tell me the truth. Encouragement helps. Friction helps too. I want this to genuinely serve men, families, churches, and communities.
P.S. Nothing personal you share is used publicly without separate written permission. Feedback helps us build better; your story remains yours.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 10 · Week 4 — Install the Guardrails', '6wc-participant-week-4', 'Week 4: What boundary would protect what matters?', 'A guardrail is a decision made before pressure, not after regret.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Four</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 4 &mdash; Install the Guardrails</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Build one specific boundary that protects what matters.</p></div></td></tr>
      <tr><td style="padding:8px 40px 36px;"><a href="https://michaeljgauthier.com/6-week-challenge/videos/week-4" style="text-decoration:none;display:block;"><img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" /></a></td></tr>
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week is Week 4: Install the Guardrails. A guardrail isn&rsquo;t restriction for its own sake &mdash; it&rsquo;s protection. It&rsquo;s a decision made before the moment of pressure, exhaustion, temptation, fear, comparison, or drift.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 4 video, complete the guardrail reflection, and ask:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Where am I most vulnerable to drift right now?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What matters enough to protect before regret arrives?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What specific boundary would help me become the man I say I want to become?</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Good intentions aren&rsquo;t enough. A guardrail should be specific enough that you know whether you kept it. Bring one draft guardrail &mdash; you decide how much to share, but come prepared to be honest.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Good intentions are not guardrails.</div></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Week 4 — Install the Guardrails

Hi {{first_name}},
This week is Week 4: Install the Guardrails. A guardrail isn't restriction for its own sake — it's protection. It's a decision made before the moment of pressure, exhaustion, temptation, fear, comparison, or drift.
Watch the Week 4 video, complete the guardrail reflection, and ask:
-Where am I most vulnerable to drift right now?
-What matters enough to protect before regret arrives?
-What specific boundary would help me become the man I say I want to become?
Good intentions aren't enough. A guardrail should be specific enough that you know whether you kept it. Bring one draft guardrail — you decide how much to share, but come prepared to be honest.
Good intentions are not guardrails.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 11 · Week 4 Follow-Up', '6wc-participant-11-week-4-followup', 'Week 4 follow-up: guardrails need witnesses', 'Boundaries become stronger when someone else knows what they protect.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week 4 &middot; Action</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Tell One Trusted Person</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Move your guardrail from private intention to accountable protection.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week you drafted a guardrail. Now strengthen it by telling one trusted person what it is and what it protects &mdash; your spouse, a close friend, your accountability partner, a mentor, or someone from the group. Use this simple sentence:</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">&ldquo;I am putting this guardrail in place because I want to protect ________.&rdquo;</div><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">That last blank matters. Guardrails aren&rsquo;t merely about avoiding failure &mdash; they&rsquo;re about protecting the life, relationships, purpose, and legacy God has entrusted to you.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Reply if you&rsquo;d like to share your guardrail with me, or if there&rsquo;s a place you&rsquo;d like prayer. I want to hear from you.</p></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">One decision at a time,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Tell One Trusted Person

Hi {{first_name}},
This week you drafted a guardrail. Now strengthen it by telling one trusted person what it is and what it protects — your spouse, a close friend, your accountability partner, a mentor, or someone from the group. Use this simple sentence:
"I am putting this guardrail in place because I want to protect ________."
That last blank matters. Guardrails aren't merely about avoiding failure — they're about protecting the life, relationships, purpose, and legacy God has entrusted to you.
Reply if you'd like to share your guardrail with me, or if there's a place you'd like prayer. I want to hear from you.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 12 · Week 5 — Strengthen the Structure', '6wc-participant-week-5', 'Week 5: what small rhythm would create the biggest ripple?', 'The life you are building is shaped less by occasional intention and more by repeated rhythms.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Five</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 5 &mdash; Strengthen the Structure</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Choose one keystone habit and one renewal rhythm.</p></div></td></tr>
      <tr><td style="padding:8px 40px 36px;"><a href="https://michaeljgauthier.com/6-week-challenge/videos/week-5" style="text-decoration:none;display:block;"><img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" /></a></td></tr>
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week we focus on two things that make change sustainable: keystone habits and energy. A keystone habit is a small rhythm that pulls more than one part of life toward alignment &mdash; a morning prayer rhythm, weekly planning time, a workout, a family dinner, a monthly financial review, a phone-free evening, or a check-in with another man.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Energy matters because you can&rsquo;t faithfully steward what matters while constantly running on empty. Physical, emotional, mental, and spiritual energy all need renewal.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 5 video and complete the habit and energy snapshot. Bring one habit and one renewal rhythm you&rsquo;re willing to test for seven days.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Don&rsquo;t build a fantasy routine. Build a rhythm you can actually practice.</div></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Week 5 — Strengthen the Structure

Hi {{first_name}},
This week we focus on two things that make change sustainable: keystone habits and energy. A keystone habit is a small rhythm that pulls more than one part of life toward alignment — a morning prayer rhythm, weekly planning time, a workout, a family dinner, a monthly financial review, a phone-free evening, or a check-in with another man.
Energy matters because you can't faithfully steward what matters while constantly running on empty. Physical, emotional, mental, and spiritual energy all need renewal.
Watch the Week 5 video and complete the habit and energy snapshot. Bring one habit and one renewal rhythm you're willing to test for seven days.
Don't build a fantasy routine. Build a rhythm you can actually practice.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 13 · Week 5 Follow-Up', '6wc-participant-13-week-5-followup', 'Week 5 follow-up: test the rhythm', 'The goal is not intensity. The goal is a repeatable rhythm that strengthens the structure.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week 5 &middot; Action</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">One Habit, One Renewal Rhythm</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Test it for seven days.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week you named one keystone habit and one renewal rhythm. Now test them for seven days. Use this structure:</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">After I ________, I will ________.<br/>Minimum version: if the full habit feels too big, I will at least ________.</div><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">For energy, choose one drain to reduce and one renewal rhythm to protect &mdash; sleep, movement, prayer, solitude, a walk, a Sabbath block, a phone boundary, or a conversation that restores perspective.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Reply with the habit and renewal rhythm you&rsquo;re testing. I want to hear what you&rsquo;re building. And if you miss once, don&rsquo;t spiral &mdash; recover quickly. One miss doesn&rsquo;t have to become drift.</p></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Recover quickly,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$One Habit, One Renewal Rhythm

Hi {{first_name}},
This week you named one keystone habit and one renewal rhythm. Now test them for seven days. Use this structure:
After I ________, I will ________.
Minimum version: if the full habit feels too big, I will at least ________.
For energy, choose one drain to reduce and one renewal rhythm to protect — sleep, movement, prayer, solitude, a walk, a Sabbath block, a phone boundary, or a conversation that restores perspective.
Reply with the habit and renewal rhythm you're testing. I want to hear what you're building. And if you miss once, don't spiral — recover quickly. One miss doesn't have to become drift.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 14 · Week 6 — Design My Life', '6wc-participant-week-6', 'Week 6: bring your Personal Blueprint', 'The blueprint was never meant to sit in a drawer. It is meant to guide what you keep building.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Six</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 6 &mdash; Design My Life</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Assemble your Personal Blueprint and retake the Check-In.</p></div></td></tr>
      <tr><td style="padding:8px 40px 36px;"><a href="https://michaeljgauthier.com/6-week-challenge/videos/week-6" style="text-decoration:none;display:block;"><img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" /></a></td></tr>
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This week is Week 6: Design My Life. You&rsquo;ve named current reality, drafted a foundation, evaluated the pillars, built a guardrail, and chosen habits and energy rhythms. Now you bring the structure together into one Personal Blueprint.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 6 video, then complete these steps before we meet:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Review Weeks 1 through 5.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Complete your Personal Blueprint page.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Retake the Created for More Check-In and complete the AFTER column.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Choose your next 30-day commitment.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Prepare a three-minute share: what woke me up, what I&rsquo;m choosing, and my next faithful step.</td></tr></table><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">This week is not an ending. It is a commissioning.</div></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Complete your AFTER Check-In</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Retake the seven-layer Created for More Check-In and complete the AFTER column. Compare it with where you started &mdash; and see where the work moved the needle.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Finish strong,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Week 6 — Design My Life

Hi {{first_name}},
This week is Week 6: Design My Life. You've named current reality, drafted a foundation, evaluated the pillars, built a guardrail, and chosen habits and energy rhythms. Now you bring the structure together into one Personal Blueprint.
Watch the Week 6 video, then complete these steps before we meet:
-Review Weeks 1 through 5.
-Complete your Personal Blueprint page.
-Retake the Created for More Check-In and complete the AFTER column.
-Choose your next 30-day commitment.
-Prepare a three-minute share: what woke me up, what I'm choosing, and my next faithful step.
This week is not an ending. It is a commissioning.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 15 · Finish Strong Reminder', '6wc-participant-15-finish-strong', 'Tomorrow: finish strong, {{first_name}}', 'Come ready to share what changed, what you are choosing, and who will help you keep going.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">24 Hours Out</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Finish Strong</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">One last meeting. One clear next step.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Tomorrow is our final meeting. Before we gather, please complete your Personal Blueprint and the AFTER column of the Created for More Check-In.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Come ready to share three things in about three minutes:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What woke me up.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What I&rsquo;m choosing.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">My next 30-day step and who will help me keep it.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Don&rsquo;t worry about making it polished. Honest is better than impressive. I&rsquo;m grateful for the work you&rsquo;ve put in.</p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Before We Meet</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Complete your AFTER Check-In</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Retake the Created for More Check-In and complete the AFTER column so you can see, in your own words and numbers, what changed over six weeks.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Finish strong,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Finish Strong

Hi {{first_name}},
Tomorrow is our final meeting. Before we gather, please complete your Personal Blueprint and the AFTER column of the Created for More Check-In.
Come ready to share three things in about three minutes:
-What woke me up.
-What I'm choosing.
-My next 30-day step and who will help me keep it.
Don't worry about making it polished. Honest is better than impressive. I'm grateful for the work you've put in.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 16 · Final Thank-You & Next Step', '6wc-participant-16-final-thankyou', 'You finished, {{first_name}}. Now keep building.', 'The question now is not “Did I finish the study?” It is “How do I keep building?”', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">You Finished</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Now Keep Building</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Six weeks of honest work &mdash; here&rsquo;s your next step.</p></div></td></tr>
      <tr><td style="padding:8px 40px 36px;"><a href="https://michaeljgauthier.com/6-week-challenge/videos/closing" style="text-decoration:none;display:block;"><img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" /></a></td></tr>
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Thank you for the honesty, courage, and effort you brought to these six weeks. You did something many men never slow down long enough to do: you looked honestly at the life you&rsquo;re building. You named drift. You clarified what matters. You chose guardrails, habits, and a next faithful step. That matters.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the closing video, then take these next steps:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Complete your Final Reflection and Feedback.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Schedule your 30-day commitment and review date.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Share your Blueprint with someone close to you.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Reply with one sentence: &ldquo;The biggest thing that changed for me was&hellip;&rdquo;</td></tr></table><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">You were not created merely to keep up. You were created to steward a life that matters.</div><p style="text-align:center;margin:8px 0 20px;"><a href="https://michaeljgauthier.com/6-week-challenge#feedback" style="display:inline-block;background:#191815;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Complete final feedback</a></p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">What&rsquo;s Next</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Keep the momentum</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Your next step may be a personal 30-day plan, staying connected with this group, leading or hosting the next group, joining ForgedLife, or bringing this to your church or ministry.</p><div><a href="https://michaeljgauthier.com/6-week-challenge#forgedlife" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Join ForgedLife &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Now Keep Building

Hi {{first_name}},
Thank you for the honesty, courage, and effort you brought to these six weeks. You did something many men never slow down long enough to do: you looked honestly at the life you're building. You named drift. You clarified what matters. You chose guardrails, habits, and a next faithful step. That matters.
Watch the closing video, then take these next steps:
-Complete your Final Reflection and Feedback.
-Schedule your 30-day commitment and review date.
-Share your Blueprint with someone close to you.
-Reply with one sentence: "The biggest thing that changed for me was..."
You were not created merely to keep up. You were created to steward a life that matters.
Complete final feedback

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 17 · Keep Building', '6wc-participant-17-keep-building', 'One week later: don''t put the Blueprint in a drawer', 'The first week after a challenge is where many men go quiet. Do not drift back quietly.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week After</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Keep Building</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Your 30-day commitment starts here.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">It&rsquo;s been one week since we finished. This is the moment when a blueprint either becomes a lived structure or gets put in a drawer.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Pull out your Personal Blueprint today. Read your 30-day commitment. Then do one of these before the day ends:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Text your accountability person.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Schedule your protected rhythm.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Take the next step you named.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Have the conversation you postponed.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Move your guardrail from idea to practice.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Reply with one word: <strong>building</strong>. That lets me know you&rsquo;re still in motion. You don&rsquo;t need to prove anything &mdash; you need to keep practicing faithfulness.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><em>P.S. Know a man who should go through this next? Send him the invite link.</em></p><p style="text-align:center;margin:8px 0 20px;"><a href="https://michaeljgauthier.com/6-week-challenge#invite" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Invite another man</a></p></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep practicing faithfulness,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Keep Building

Hi {{first_name}},
It's been one week since we finished. This is the moment when a blueprint either becomes a lived structure or gets put in a drawer.
Pull out your Personal Blueprint today. Read your 30-day commitment. Then do one of these before the day ends:
-Text your accountability person.
-Schedule your protected rhythm.
-Take the next step you named.
-Have the conversation you postponed.
-Move your guardrail from idea to practice.
Reply with one word: building. That lets me know you're still in motion. You don't need to prove anything — you need to keep practicing faithfulness.
P.S. Know a man who should go through this next? Send him the invite link.
Invite another man

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 18 · Do Not Drift Back Quietly', '6wc-participant-18-do-not-drift', 'Three weeks later: a miss is not failure', 'Do not let one miss become drift. Recover quickly.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Three Weeks Out</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Do Not Drift Back Quietly</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Recover quickly. Refuse to disappear.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You&rsquo;re about three weeks into your 30-day commitment. This is usually where real life tests the plan. Travel happens. Work expands. Energy dips. The guardrail gets inconvenient. The habit gets interrupted. So here&rsquo;s the reminder: <strong>a miss is not failure.</strong> The question is what you do next.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Take five minutes today and answer honestly:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What&rsquo;s working?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What&rsquo;s resisting change?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What needs to be redesigned, not abandoned?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Who needs to hear from me?</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Reply with one phrase: <strong>still building</strong>, <strong>need prayer</strong>, or <strong>need to redesign</strong>. I want to hear from you either way.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Transformation is about recovering quickly and refusing to drift back quietly.</div></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Recover quickly,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Do Not Drift Back Quietly

Hi {{first_name}},
You're about three weeks into your 30-day commitment. This is usually where real life tests the plan. Travel happens. Work expands. Energy dips. The guardrail gets inconvenient. The habit gets interrupted. So here's the reminder: a miss is not failure. The question is what you do next.
Take five minutes today and answer honestly:
-What's working?
-What's resisting change?
-What needs to be redesigned, not abandoned?
-Who needs to hear from me?
Reply with one phrase: still building, need prayer, or need to redesign. I want to hear from you either way.
Transformation is about recovering quickly and refusing to drift back quietly.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 19 · 30-Day Check-In', '6wc-participant-19-30-day-checkin', '30-Day Check-In: what lasted, {{first_name}}?', 'Movement is seen over time, not in a single score.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">30 Days</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">What Lasted?</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Retake the Check-In before your follow-up.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">It&rsquo;s time for your 30-day follow-up. Before we meet, retake the Created for More Check-In and complete the 30-DAY column. Update your Blueprint Snapshot and review your 30-day commitment.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Don&rsquo;t only look at the number. Compare it with the actions you took, conversations you had, guardrails you built, habits you tested, and rhythms that lasted. Come ready to share:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What lasted?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What needed redesign?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Who noticed a difference?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What is one story of change?</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">What is the next faithful step?</td></tr></table><p style="text-align:center;margin:8px 0 20px;"><a href="https://michaeljgauthier.com/book" style="display:inline-block;background:#191815;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Confirm your 30-day follow-up</a></p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">A lower score after reflection doesn&rsquo;t automatically mean failure. Sometimes deeper honesty creates a more accurate mirror. The real evidence is what changed and what&rsquo;s still being practiced.</p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Complete your 30-DAY Check-In</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Retake the Created for More Check-In and complete the 30-DAY column. This is where you see what actually lasted.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Still building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$What Lasted?

Hi {{first_name}},
It's time for your 30-day follow-up. Before we meet, retake the Created for More Check-In and complete the 30-DAY column. Update your Blueprint Snapshot and review your 30-day commitment.
Don't only look at the number. Compare it with the actions you took, conversations you had, guardrails you built, habits you tested, and rhythms that lasted. Come ready to share:
-What lasted?
-What needed redesign?
-Who noticed a difference?
-What is one story of change?
-What is the next faithful step?
Confirm your 30-day follow-up
A lower score after reflection doesn't automatically mean failure. Sometimes deeper honesty creates a more accurate mirror. The real evidence is what changed and what's still being practiced.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · 20 · Multiply It', '6wc-participant-20-multiply-it', 'Who needs this next, {{first_name}}?', 'The work you did was not only for you. A well-built life begins to overflow.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Multiply</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Who Needs This Next?</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">A well-built life overflows.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You&rsquo;ve walked through the six-week challenge and a 30-day follow-up. Now the question isn&rsquo;t only what changed in you &mdash; it&rsquo;s what your life will multiply from here.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">There may be a man in your life who is quietly drifting, succeeding on a scoreboard that feels too small, or carrying pressure alone. Your invitation may be the thing that helps him begin. Choose one next step:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Invite one man to the next challenge.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Stay connected with your group and schedule a 90-day Blueprint review.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Join the book updates list for The Life You&rsquo;re Building.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Join ForgedLife for habits, prayer, challenges, and group follow-through.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Explore leading or hosting a future group, or bring this to your church or ministry.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You don&rsquo;t need to be an expert to encourage another man. You simply need to be honest about what helped you and willing to open the door.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">A well-built life overflows. Keep building.</div></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Pass It On</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Invite one man to the next group</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">The simplest way to multiply what you built: hand this to one man who&rsquo;s ready. Send him the invitation and open the door.</p><div><a href="https://michaeljgauthier.com/6-week-challenge#invite" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Invite a man &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Keep building,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Who Needs This Next?

Hi {{first_name}},
You've walked through the six-week challenge and a 30-day follow-up. Now the question isn't only what changed in you — it's what your life will multiply from here.
There may be a man in your life who is quietly drifting, succeeding on a scoreboard that feels too small, or carrying pressure alone. Your invitation may be the thing that helps him begin. Choose one next step:
-Invite one man to the next challenge.
-Stay connected with your group and schedule a 90-day Blueprint review.
-Join the book updates list for The Life You're Building.
-Join ForgedLife for habits, prayer, challenges, and group follow-through.
-Explore leading or hosting a future group, or bring this to your church or ministry.
You don't need to be an expert to encourage another man. You simply need to be honest about what helped you and willing to open the door.
A well-built life overflows. Keep building.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · Leader · 1 · Welcome & Recruit', '6wc-leader-welcome-recruit', 'You''re leading The Life You''re Building — let''s get your group set', 'Set your dates, invite 8–12 men, and share the invitation video.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Leader &middot; Setup</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Thank You for Stepping Up</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Set your dates, recruit your men, and get ready to lead.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You don&rsquo;t need to be a pastor, a counselor, or a polished speaker to lead this well. You need three things: a willingness to go first in honesty, the discipline to protect the structure of each meeting, and enough care to follow up with your men between sessions. Everything else is provided for you.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><strong>3&ndash;4 weeks out &mdash; your setup:</strong></p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Set all <strong>six dates</strong> and a location &mdash; same day and time each week. Predictability protects attendance.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Invite <strong>8&ndash;12 men</strong> personally. A direct ask beats any announcement, and the short invitation video helps them say yes.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Order or print the <strong>Participant Guides</strong>.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Invite men you respect and believe will engage honestly &mdash; not men you&rsquo;re trying to fix. The most powerful thing you bring isn&rsquo;t expertise. It&rsquo;s example.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">You go first in honesty. That gives every man permission to do the same.</div></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Recruit</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Share the invitation video</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Send the invitation video to each man you&rsquo;re asking. It carries the vision so your personal ask can simply be &mdash; &ldquo;I&rsquo;d like you in this with me.&rdquo;</p><div><a href="https://michaeljgauthier.com/6-week-challenge/videos/invitation" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the invitation video &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">You&rsquo;ve got this,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Thank You for Stepping Up

Hi {{first_name}},
You don't need to be a pastor, a counselor, or a polished speaker to lead this well. You need three things: a willingness to go first in honesty, the discipline to protect the structure of each meeting, and enough care to follow up with your men between sessions. Everything else is provided for you.
3–4 weeks out — your setup:
-Set all six dates and a location — same day and time each week. Predictability protects attendance.
-Invite 8–12 men personally. A direct ask beats any announcement, and the short invitation video helps them say yes.
-Order or print the Participant Guides.
Invite men you respect and believe will engage honestly — not men you're trying to fix. The most powerful thing you bring isn't expertise. It's example.
You go first in honesty. That gives every man permission to do the same.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · Leader · 2 · One Week Out', '6wc-leader-one-week-out', 'One week out — send the welcome and the BEFORE Check-In', 'Prep your men for Week 1.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Leader &middot; One Week Out</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">One Week Out</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Prepare your men so Week 1 lands well.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You&rsquo;re almost there. This week, prepare your men so Week 1 lands well:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Send the <strong>welcome</strong> with the guide.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Ask each man to complete the <strong>BEFORE column</strong> of the seven-layer Created for More Check-In and the Week 1 pre-work.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Read the leader guide once, then re-read Week 1.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Remember the standard rhythm &mdash; about <strong>75 minutes</strong>: welcome and prayer, a personal check-in round, the teaching video, guided discussion (depth over coverage), this week&rsquo;s action, and closing prayer. End on time.</p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Prep Your Men</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Share the BEFORE Check-In</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Make sure every man completes the Created for More Check-In before Week 1. It&rsquo;s the baseline you&rsquo;ll measure real change against after Week 6.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">For the men,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$One Week Out

Hi {{first_name}},
You're almost there. This week, prepare your men so Week 1 lands well:
-Send the welcome with the guide.
-Ask each man to complete the BEFORE column of the seven-layer Created for More Check-In and the Week 1 pre-work.
-Read the leader guide once, then re-read Week 1.
Remember the standard rhythm — about 75 minutes: welcome and prayer, a personal check-in round, the teaching video, guided discussion (depth over coverage), this week's action, and closing prayer. End on time.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · Leader · 3 · Weekly Session Reminder', '6wc-leader-weekly-reminder', 'This week''s session — a quick reminder', 'Run the meeting, play the video, capture a debrief.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Leader &middot; Each Session</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Your Session This Week</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Run the meeting, play the video, capture a debrief.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">A quick reminder as you lead this week&rsquo;s meeting:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Play this week&rsquo;s <strong>teaching video</strong> (~10&ndash;12 min), then add your own story and the key lesson.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Use <strong>two or three primary questions</strong> &mdash; depth over coverage. Ask one at a time and allow silence.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Close with <strong>this week&rsquo;s action</strong> and prayer. End on time.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Afterward, <strong>capture a short debrief</strong> &mdash; a few notes on what happened and who to follow up with.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Facilitate rather than perform. When you share honestly first, you give every man permission to do the same.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><em>This reminder is reusable &mdash; resend it (or reschedule a copy) before each weekly session.</em></p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">This Week</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Open the video library</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Grab this week&rsquo;s teaching video from the library so it&rsquo;s cued and ready before the men arrive.</p><div><a href="https://michaeljgauthier.com/6-week-challenge/videos" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the video library &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Lead well,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Your Session This Week

Hi {{first_name}},
A quick reminder as you lead this week's meeting:
-Play this week's teaching video (~10–12 min), then add your own story and the key lesson.
-Use two or three primary questions — depth over coverage. Ask one at a time and allow silence.
-Close with this week's action and prayer. End on time.
-Afterward, capture a short debrief — a few notes on what happened and who to follow up with.
Facilitate rather than perform. When you share honestly first, you give every man permission to do the same.
This reminder is reusable — resend it (or reschedule a copy) before each weekly session.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · Leader · 4 · Midpoint Pulse', '6wc-leader-midpoint-pulse', 'Midpoint — how is your group landing?', 'Take a pulse after Week 3 and adjust your support.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Leader &middot; Midpoint</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Midpoint Check</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Take a pulse and adjust your support for the second half.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You&rsquo;re halfway. Now is a good time to take a quiet pulse on how the group is landing and adjust your support for the second half:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Who is engaging, and who has gone quiet? Reach out personally to one or two men this week.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Is the discussion getting honest, or staying safe? Model a little more vulnerability if needed.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Are men actually taking their weekly action, or just talking? Gently raise the bar.</td></tr></table><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Transformation comes first &mdash; never turn the room into a survey while men are sharing. Let the Check-In do the measuring, before and after.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Reach the man who&rsquo;s gone quiet before the second half begins.</div></td></tr>
      
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Stay the course,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$Midpoint Check

Hi {{first_name}},
You're halfway. Now is a good time to take a quiet pulse on how the group is landing and adjust your support for the second half:
-Who is engaging, and who has gone quiet? Reach out personally to one or two men this week.
-Is the discussion getting honest, or staying safe? Model a little more vulnerability if needed.
-Are men actually taking their weekly action, or just talking? Gently raise the bar.
Transformation comes first — never turn the room into a survey while men are sharing. Let the Check-In do the measuring, before and after.
Reach the man who's gone quiet before the second half begins.

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

insert into public.email_templates (name, slug, subject, preheader, html_body, text_body, category, status, available_fields)
values ('6WC · Leader · 5 · Final Survey & 30-Day Follow-Up', '6wc-leader-final-30day', 'You finished — capture the growth and set the 30-day', 'Send the final survey and schedule the 30-day follow-up.', $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:40px 40px 30px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:36px 40px 28px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Leader &middot; Finish</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">You Finished the Six Weeks</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Capture the growth, then set the 30-day follow-up.</p></div></td></tr>
      
      <tr><td style="padding:0px 40px 40px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Well done. Now let&rsquo;s capture what happened &mdash; measurable growth and real stories &mdash; so you can encourage your men and, if you sense the call, multiply into more groups:</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Send the <strong>final survey</strong> to the group.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Have each man complete the <strong>AFTER column</strong> of the Created for More Check-In and compare it to their BEFORE score.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;"><strong>Schedule the 30-day follow-up</strong> &mdash; reconnect, complete the 30-DAY column, and gather what actually lasted.</td></tr><tr><td valign="top" style="padding:0 10px 8px 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;color:#C9A46E;font-weight:700;">&bull;</td><td style="padding:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#3a3632;">Ask who would recommend the group, and note the one or two ready to lead the next one.</td></tr></table><p style="text-align:center;margin:8px 0 20px;"><a href="https://michaeljgauthier.com/book" style="display:inline-block;background:#191815;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Schedule the 30-day follow-up</a></p></td></tr>
      <tr><td style="background:#191815;padding:40px 40px 40px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Measure the Growth</p><h2 style="margin:0 0 10px;font-family:Georgia, 'Times New Roman', serif;font-size:22px;line-height:1.25;color:#ffffff;font-weight:700;">Share the AFTER Check-In</h2><p style="margin:0 0 22px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#d8d2c8;">Have every man retake the Created for More Check-In and complete the AFTER column, then compare it to where he started. That&rsquo;s the evidence of six weeks of honest work.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:44px 40px 32px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:14px;color:#7a736a;">Multiply it,</p>
        <p style="margin:2px 0 0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:32px 40px 44px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The Life You&rsquo;re Building 6-Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, $txt$You Finished the Six Weeks

Hi {{first_name}},
Well done. Now let's capture what happened — measurable growth and real stories — so you can encourage your men and, if you sense the call, multiply into more groups:
-Send the final survey to the group.
-Have each man complete the AFTER column of the Created for More Check-In and compare it to their BEFORE score.
-Schedule the 30-day follow-up — reconnect, complete the 30-DAY column, and gather what actually lasted.
-Ask who would recommend the group, and note the one or two ready to lead the next one.
Schedule the 30-day follow-up

— Michael J. Gauthier
michaeljgauthier.com$txt$, 'six_week_challenge', 'draft', '{first_name,last_name,full_name,preferences_url,unsubscribe_url}')
on conflict (slug) do update set
  name = excluded.name, subject = excluded.subject, preheader = excluded.preheader,
  html_body = excluded.html_body, text_body = excluded.text_body,
  category = excluded.category, available_fields = excluded.available_fields, updated_at = now();

alter table public.experience_type_steps add column if not exists offset_value integer;
alter table public.experience_type_steps add column if not exists offset_unit text
  check (offset_unit is null or offset_unit in ('minute','hour','day','week','month'));

-- Create + wire the "6 Week Challenge — Leader" experience type (5-step leader drip).
insert into public.experience_types (name, slug, description, default_frequency, default_duration_weeks, category)
values ('6 Week Challenge — Leader', 'six-week-challenge-leader',
  'Leader/facilitator drip for running a 6-Week Challenge group: setup, one-week-out, weekly reminders, midpoint pulse, and final survey + 30-day follow-up.',
  'weekly', 5, 'Program')
on conflict (slug) do update set description = excluded.description, category = 'Program', updated_at = now();

do $$
declare
  v_type_id uuid;
begin
  select id into v_type_id from public.experience_types where slug = 'six-week-challenge-leader' limit 1;
  if v_type_id is null then raise notice 'leader type missing; skipping'; return; end if;
  delete from public.experience_type_steps where experience_type_id = v_type_id;
  insert into public.experience_type_steps (experience_type_id, step_number, label, email_template_id, subject_override, offset_value, offset_unit)
  select v_type_id, s.step_number, s.label, t.id, null, s.offset_value, 'day'
  from (values
    (1, 'Welcome & Recruit (setup)', '6wc-leader-welcome-recruit', 0),
    (2, 'One Week Out', '6wc-leader-one-week-out', 14),
    (3, 'Weekly Session Reminder (reuse each week)', '6wc-leader-weekly-reminder', 20),
    (4, 'Midpoint Pulse (after Week 3)', '6wc-leader-midpoint-pulse', 42),
    (5, 'Final Survey & 30-Day Follow-Up', '6wc-leader-final-30day', 90)
  ) as s(step_number, label, slug, offset_value)
  join public.email_templates t on t.slug = s.slug;
  update public.experience_types set default_duration_weeks = 5, updated_at = now() where id = v_type_id;
end $$;
