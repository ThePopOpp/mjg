-- Rebuilds The 6 Week Challenge templates to match the approved mockup:
-- centered hero with a WEEK badge, the real full-width video-placeholder image
-- (linked to {{video_url}}), content, CTA band, signature, and footer.

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week One</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 1 &mdash; Wake Up</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Name your current reality and notice drift.</p></div></td></tr>
      <tr><td style="padding:8px 40px 12px;"><a href="{{video_url}}" style="text-decoration:none;display:block;">
        <img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" />
      </a></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Most men don&rsquo;t drift because they stop caring. Life just gets full &mdash; calendars fill, work expands, and somewhere along the way we stop asking one of the most important questions we could ask. This week we slow down and tell the truth about the life we&rsquo;re actually building.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the short Week 1 video, complete your pre-work reading, and come ready to share one honest insight. Your one step this week: notice a single area where you&rsquo;ve been drifting.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">What kind of life am I actually building?</div></td></tr>
      <tr><td style="background:#f6efe2;padding:26px 40px 26px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 8px;font-family:Georgia, 'Times New Roman', serif;font-size:21px;line-height:1.25;color:#191815;font-weight:700;">Complete your BEFORE Check-In</h2><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#4a453f;">Take the seven-layer Created for More Check-In before Week 1 to see where you&rsquo;re aligned and where drift is showing up. You&rsquo;ll retake it after Week 6 and watch your score move where you did the work.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-participant-week-1';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Two</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 2 &mdash; See the Blueprint</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Clarify bedrock, identity, values, mission, and daily purpose.</p></div></td></tr>
      <tr><td style="padding:8px 40px 12px;"><a href="{{video_url}}" style="text-decoration:none;display:block;">
        <img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" />
      </a></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">A life is built from the ground up &mdash; on what you believe (your Bedrock) and what you&rsquo;re building toward (your Foundation). This week we get clear on identity, values, and daily purpose, so the everyday decisions have something solid to rest on.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 2 video and complete the reading. Your one step: draft a one-sentence purpose statement you can use to make a real decision this week.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Is my identity rooted in something deeper than performance and pressure?</div></td></tr>
      <tr><td style="background:#f6efe2;padding:26px 40px 26px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 8px;font-family:Georgia, 'Times New Roman', serif;font-size:21px;line-height:1.25;color:#191815;font-weight:700;">Track your progress</h2><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#4a453f;">Revisit the Created for More Check-In any time to see how the layers you&rsquo;re working on are moving.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-participant-week-2';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Three</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 3 &mdash; Evaluate the Pillars</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Assess family, fitness, fun, and finances; choose one priority.</p></div></td></tr>
      <tr><td style="padding:8px 40px 12px;"><a href="{{video_url}}" style="text-decoration:none;display:block;">
        <img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" />
      </a></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">The Four Pillars &mdash; Family, Fitness, Fun, and Finances &mdash; carry the weight of everyday life. They matter deeply, but they can only stand as long as what is beneath and around them is solid. This week we assess each honestly and choose one to focus on.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 3 video and complete the reading. Your one step: choose your Focus Pillar and take one visible action in it.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Are the areas I stand on every day actually able to hold weight?</div></td></tr>
      <tr><td style="background:#f6efe2;padding:26px 40px 26px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 8px;font-family:Georgia, 'Times New Roman', serif;font-size:21px;line-height:1.25;color:#191815;font-weight:700;">Track your progress</h2><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#4a453f;">Your Four Pillars sub-scores in the Check-In point to the pillar that most needs your attention this week.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-participant-week-3';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Four</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 4 &mdash; Install the Guardrails</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Build specific boundaries that protect what matters most.</p></div></td></tr>
      <tr><td style="padding:8px 40px 12px;"><a href="{{video_url}}" style="text-decoration:none;display:block;">
        <img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" />
      </a></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Guardrails are pre-decided boundaries that protect what matters before regret arrives. Good intentions rarely hold under pressure &mdash; a clear line does. This week we build a few specific ones and invite a brother to help us keep them.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 4 video and complete the reading. Your one step: write one guardrail and tell one man who will help you keep it.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Do I have boundaries in place before I need them, not just after damage is done?</div></td></tr>
      <tr><td style="background:#f6efe2;padding:26px 40px 26px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 8px;font-family:Georgia, 'Times New Roman', serif;font-size:21px;line-height:1.25;color:#191815;font-weight:700;">Track your progress</h2><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#4a453f;">See how your Guardrails layer is moving as you put real boundaries in place.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-participant-week-4';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Five</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 5 &mdash; Strengthen the Structure</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Design keystone habits and steward energy.</p></div></td></tr>
      <tr><td style="padding:8px 40px 12px;"><a href="{{video_url}}" style="text-decoration:none;display:block;">
        <img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" />
      </a></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Small repeated rhythms pull the rest of life into alignment &mdash; and energy is the fuel beneath every other resource. This week we design one or two keystone habits and protect the renewal that keeps us from running on empty.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 5 video and complete the reading. Your one step: choose one keystone habit and attach it to a rhythm you already have.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">Do my daily habits move me toward the life I say I want?</div></td></tr>
      <tr><td style="background:#f6efe2;padding:26px 40px 26px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 8px;font-family:Georgia, 'Times New Roman', serif;font-size:21px;line-height:1.25;color:#191815;font-weight:700;">Track your progress</h2><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#4a453f;">Watch your Keystone Habits and Energy layers strengthen as your rhythms take hold.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-participant-week-5';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Week Six</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">The Life You&rsquo;re Building &middot; 6-Week Men&rsquo;s Study</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Week 6 &mdash; Design My Life</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Assemble a Personal Blueprint, name a legacy, commit to 30 days.</p></div></td></tr>
      <tr><td style="padding:8px 40px 12px;"><a href="{{video_url}}" style="text-decoration:none;display:block;">
        <img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" />
      </a></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">This is where it comes together. You&rsquo;ll assemble your Personal Blueprint, name the legacy you&rsquo;re building, and commit to a 30-day plan. A life that lasts is built one faithful step at a time.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Watch the Week 6 video and complete your work. Your one step: complete your AFTER Check-In and commit to a 30-day plan you&rsquo;ll revisit in a month.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">What is my life producing beyond me?</div></td></tr>
      <tr><td style="background:#f6efe2;padding:26px 40px 26px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 8px;font-family:Georgia, 'Times New Roman', serif;font-size:21px;line-height:1.25;color:#191815;font-weight:700;">Complete your AFTER Check-In</h2><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#4a453f;">Retake the seven-layer Check-In now that you&rsquo;ve done the work, and compare it to your BEFORE score. Then set a reminder for the 30-day column one month from now.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-participant-week-6';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Get Started</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Thank you for stepping up.</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Recruit your group, set your dates, and share the invite video.</p></div></td></tr>
      <tr><td style="padding:8px 40px 12px;"><a href="{{video_url}}" style="text-decoration:none;display:block;">
        <img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" />
      </a></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You don&rsquo;t need to be a pastor, a counselor, or a polished speaker to lead this well. You need three things: a willingness to go first in honesty, the discipline to protect the structure of each meeting, and enough care to follow up with your men between sessions. This guide gives you the rest.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;"><strong>3&ndash;4 weeks out:</strong> set all six dates and a location (same day and time each week &mdash; predictability protects attendance). Invite 8&ndash;12 men personally &mdash; a direct ask beats any announcement, and the invite video helps them say yes. Order or print the Participant Guides.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Invite men you respect and believe will engage honestly &mdash; not men you&rsquo;re trying to fix.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">The most powerful thing you bring is not expertise. It is example.</div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-leader-welcome-recruit';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">One Week Out</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">One week out</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Prepare your men so Week 1 lands well.</p></div></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You&rsquo;re almost there. This week, send the welcome email with the guide attached, and ask each man to complete the <strong>BEFORE column</strong> of the seven-layer Created for More Check-In and the Week 1 pre-work. Read this guide once, then re-read Week 1.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Remember the standard rhythm &mdash; about 75 minutes: welcome &amp; prayer, a personal check-in round, the teaching video, guided discussion (depth over coverage), this week&rsquo;s action, and closing prayer. End on time.</p></td></tr>
      <tr><td style="background:#f6efe2;padding:26px 40px 26px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 8px;font-family:Georgia, 'Times New Roman', serif;font-size:21px;line-height:1.25;color:#191815;font-weight:700;">Share the BEFORE Check-In</h2><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#4a453f;">Send your men the Created for More Check-In link so their BEFORE scores are captured before Week 1.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-leader-one-week-out';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Each Session</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Your session this week</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Run the meeting, play the video, capture a debrief.</p></div></td></tr>
      <tr><td style="padding:8px 40px 12px;"><a href="{{video_url}}" style="text-decoration:none;display:block;">
        <img src="https://michaeljgauthier.com/email-assets/video-placeholder.png" width="520" alt="Watch this week&rsquo;s video" style="display:block;width:100%;max-width:520px;height:auto;border:0;margin:0 auto;border-radius:12px;" />
      </a></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">A quick reminder as you lead this week&rsquo;s meeting. Play this week&rsquo;s teaching video (~10&ndash;12 min), then add your own story and the key lesson. Use two or three primary questions &mdash; depth over coverage. Ask one question at a time and allow silence.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Close with this week&rsquo;s action and prayer, and end on time. Afterward, capture a short debrief &mdash; a few notes on what happened and who to follow up with.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Facilitate rather than perform. When you share honestly first, you give every man permission to do the same.</p></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-leader-weekly-reminder';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Midpoint</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">Midpoint check</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">See how the group is landing and adjust your support.</p></div></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">You&rsquo;re halfway. Now is a good time to take a quiet pulse on how the group is landing and adjust your support for the second half.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Who is engaging, and who has gone quiet? Reach out personally to one or two men this week. Is the discussion getting honest, or staying safe? Model a little more vulnerability. Are men actually taking their weekly action, or just talking? Gently raise the bar.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Transformation comes first &mdash; never turn the room into a survey while men are sharing. Let the Check-In do the measuring, before and after.</p></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-leader-midpoint-pulse';

update public.email_templates set html_body = $html$<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1eee7;padding:24px 0;margin:0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:30px 40px 14px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="88" alt="Michael J. Gauthier" style="display:block;width:88px;max-width:100%;height:auto;margin:0 auto 8px;" />
        <div style="font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.22em;color:#191815;">MICHAEL J. GAUTHIER</div>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 40px 10px;"><div style="text-align:center;margin:0 0 14px;"><span style="display:inline-block;background:#191815;color:#C9A46E;font-family:Arial, Helvetica, sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:6px 15px;border-radius:16px;">Final Week</span></div><div style="text-align:center;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Leader &amp; Campaign Guide &middot; The Life You&rsquo;re Building</p><h1 style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:30px;line-height:1.15;color:#191815;font-weight:700;">You finished the six weeks.</h1><p style="margin:12px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.6;color:#7a736a;">Capture the growth and set the 30-day follow-up.</p></div></td></tr>
      <tr><td style="padding:14px 40px 6px;"><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Hi {{first_name}},</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Well done. Now let&rsquo;s capture what happened &mdash; measurable growth and real stories &mdash; so you can encourage your men and, if you sense the call, multiply into more groups.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Send the final survey to the group. Have each man complete the <strong>AFTER column</strong> of the Created for More Check-In and compare it to their BEFORE score. Schedule the 30-day follow-up to reconnect, complete the 30-DAY column, and gather what actually lasted.</p><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:15px;line-height:1.7;color:#3a3632;">Ask who would recommend the group, and note the one or two ready to lead the next one.</p><div style="border-left:3px solid #C9A46E;padding:4px 18px;margin:4px 0 20px;font-family:Georgia, 'Times New Roman', serif;font-style:italic;font-size:17px;color:#4a453f;">A measurable rise in each man&rsquo;s Blueprint Alignment Score, and change still in place 30 days later.</div></td></tr>
      <tr><td style="background:#f6efe2;padding:26px 40px 26px;"><p style="margin:0 0 8px;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A46E;font-weight:700;">Your Stewardship Blueprint</p><h2 style="margin:0 0 8px;font-family:Georgia, 'Times New Roman', serif;font-size:21px;line-height:1.25;color:#191815;font-weight:700;">Share the AFTER Check-In</h2><p style="margin:0 0 16px;font-family:Arial, Helvetica, sans-serif;font-size:14px;line-height:1.7;color:#4a453f;">Send your men the Check-In link to capture their AFTER scores, then again at 30 days.</p><div><a href="https://michaeljgauthier.com/created-for-more-check-in" style="display:inline-block;background:#C9A46E;color:#191815;text-decoration:none;padding:13px 26px;border-radius:6px;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:700;">Open the Check-In &rarr;</a></div></td></tr>
      <tr><td style="padding:26px 40px 8px;"><div>
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="42" alt="MJG" style="display:block;width:42px;height:auto;margin:0 0 8px;" />
        <p style="margin:0;font-family:Georgia, 'Times New Roman', serif;font-size:18px;color:#191815;">Michael J. Gauthier</p>
        <p style="margin:2px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a736a;">Author &middot; The Stewardship Blueprint</p>
      </div></td></tr>
      <tr><td style="padding:0px 40px 0px;"><div style="border-top:1px solid #e7e1d5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:20px 40px 32px;"><div style="text-align:center;">
        <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="54" alt="MJG" style="display:block;width:54px;height:auto;margin:0 auto 10px;" />
        <p style="margin:0;font-family:Arial, Helvetica, sans-serif;font-size:12px;color:#7a736a;">michaeljgauthier.com</p>
        <p style="margin:8px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;">You&rsquo;re receiving this as part of The 6 Week Challenge.</p>
        <p style="margin:6px 0 0;font-family:Arial, Helvetica, sans-serif;font-size:11px;color:#9a948b;"><a href="{{preferences_url}}" style="color:#7a736a;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="{{unsubscribe_url}}" style="color:#7a736a;">Unsubscribe</a></p>
      </div></td></tr>
    </table>
  </td></tr>
</table>$html$, available_fields = '{first_name,last_name,full_name,video_url,preferences_url,unsubscribe_url}', updated_at = now() where slug = '6wc-leader-final-30day';
