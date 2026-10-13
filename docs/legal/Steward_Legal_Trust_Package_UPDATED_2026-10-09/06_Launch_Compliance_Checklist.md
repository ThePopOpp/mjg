# Steward Legal & Compliance Implementation Plan

**Prepared:** October 9, 2026 | **Status:** Draft — not legal approval

## Website and contact decisions
- Steward primary public website: https://www.michaeljgauthier.com.
- General service, login, account, billing-support questions: support@michaeljgauthier.com.
- Privacy rights, deletion, access and privacy complaints: privacy@michaeljgauthier.com.
- Both are intended aliases; **test receiving and replying before publication** and restrict mailbox access to Steward-authorized operators.
- Optional operational aliases if needed later: billing@michaeljgauthier.com (billing disputes / invoices) and legal@michaeljgauthier.com (formal legal notices). They are not needed to launch if support/privacy is monitored.
- Ensure site-wide MJG content and separately operated products have the appropriate legal-entity and privacy disclosures; do not claim this Steward policy governs unrelated site services without confirming controller and data flows.

## Locked decisions
- Operator: Stewardship Blueprint, LLC, 2330 W Ray Rd #3, Chandler, AZ 85284.
- Adults 18+ only.
- Persistent Blueprint/history with functional user deletion controls.
- No sale, targeted advertising use, or default external sharing of personal Blueprint/chat data.
- Email, optional SMS check-ins, and optional SMS promotions with separate consents.
- Prices and subscription design unresolved; checkout-specific offers control.
- Churches/institutions get no individualized data; privacy-protected aggregate reporting only unless a user specifically directs otherwise.
- SIG common ownership disclosed; no individual data flow in either direction; no referral compensation.

## BLOCKERS before public launch
1. [ ] Confirm exact entity formation spelling, business identification, ownership and service domain; verify support@michaeljgauthier.com and privacy@michaeljgauthier.com aliases.
2. [ ] Inventory production data flows: Supabase and auth; OpenAI/Anthropic endpoint(s); hosting; Stripe billing; Twilio; email vendor; security/analytics; error logging; backups; optional church reporting. For every vendor, record data types, purpose, contract, region, retention, deletion support, access, subprocessors, and training settings.
3. [ ] Implement actual export and deletion controls, including identity verification, backups, logs and processor erasure routes. Define and approve retention schedules.
4. [ ] Obtain counsel review of Terms, Privacy Policy, SMS Terms, jurisdictional notices, subscription offer, liability and dispute provisions, faith positioning, and professional-advice boundaries.
5. [ ] Implement age gate and account registration consent with versioned records, not prechecked marketing boxes.
6. [ ] Verify separate SMS transactional/check-in vs promotional opt-ins; campaign registration, sender identification, frequency, HELP/STOP, consent evidence, suppression; review TCPA and applicable state laws.
7. [ ] Finalize subscriptions: one-time payment or auto-renew; renewal notice, cancellation flow, tax/refund rules, future price-change notices. Publish actual terms before any charge; test Stripe portal behavior.
8. [ ] Confirm accessibility, cookies/analytics, privacy rights handling, security controls, incident-response plan, MFA for staff, secrets rotation, vendor access, and breach notification logic.
9. [ ] SIG CCO reviews common ownership disclosure, outside business interest filings, Form ADV, shared office controls, lack of steering and any noncash cross-marketing incentives. Document independent access audits.
10. [ ] Institutional programs: written partner agreement limits access, reports use cell suppression/minimum cohort size; participants separately control intentional sharing; prohibit partners from demanding individual data.
11. [ ] Run prelaunch acceptance, marketing opt-out, SMS STOP/HELP, export/deletion, failed payments, subscription cancellation, and security tests with recorded evidence.

## Suggested implementation workstreams

### Legal and user-facing
- Public Privacy Policy `https://www.michaeljgauthier.com/privacy` [CONFIRM PATH AND LIVE PAGE].
- Public Terms `/terms`.
- SMS Terms `/sms-terms`.
- AI & Trust `/trust`.
- Statement of Faith linked separately.
- Subscription offer and cancellation terms at checkout; Refund Policy when finalized.
- Cookie disclosure if used and state-specific supplements if required.

### Vendor due diligence
- **Stripe:** transparent product offering, real contact details, checkout/subscription disclosures, business identity, refunds and cancellation; review any restricted-business classifications before go-live.
- **Twilio:** A2P 10DLC registration with public Terms and Privacy URLs, separate campaign consent, mobile opt-in privacy wording, HELP/STOP, screenshots where flows are gated.
- **OpenAI & Anthropic:** commercial API terms, training defaults, storage and retention per API feature, no unsupported zero-retention representations, incident/data processing terms.
- **Supabase/hosting/analytics/email:** DPA, locations, roles, backups, logging redaction, access, breach assistance and retention.
- **SIG:** no vendor/subprocessor role; no connected account system; review affiliate-related regulatory disclosures independently.

### Data-control architecture
- Tag `user_content`, `assessment`, `chat`, `blueprint`, `mobile_number`, `sms_consent`, `marketing_consent`, `account`, `payment_ref`, `security_log`, `institution_group`, and `share_grant`.
- Apply least-privilege row-level security; limit staff access; segregate production from testing.
- Keep consent events append-only (source, user, text/version, timestamp, program, channel, IP if justified); permit user revocation.
- Never put personal conversation content in advertising pixels, routine event tracking, URL query strings, or unrestricted logs.
- Aggregate church reports only above an approved cohort threshold and suppress or combine small cells to prevent inference.
- Share/export requires explicit resource selection, destination review, purpose notice, and audit log. No blanket consent for access by SIG or church leaders.

## Outstanding facts / unresolved
- [ ] Verify primary site and test support@michaeljgauthier.com and privacy@michaeljgauthier.com delivery, authorization, reply behavior, and retention.
- [ ] Current data subprocessor list, actual OpenAI/Anthropic usage and training controls.
- [ ] Whether any web analytics, ad pixels, email marketing vendors, or cookies are enabled.
- [ ] Subscription structure, pricing, renewal model, refund rules and cancellation method.
- [ ] Data deletion SLAs, archive/backup retention, user exports, and security logs.
- [ ] SMS program expected maximum frequency and Twilio sender number.
- [ ] How institutions purchase licenses, and whether group reporting even exists at launch.
- [ ] Shared employees, building premises, and any operational resources with SIG.
- [ ] Exact state/nation distribution of eligible users and any location-specific regulations.

## Initial operational decisions for the founder to approve
1. **No cross-company data sharing** means none, including client lists and analytics, not merely no automatic referral fee.
2. **Common ownership disclosure** on Terms and Trust pages; not necessary to repeat SIG's name in every marketing asset, but do not obscure the affiliation where material.
3. **Flexible price experiments** are allowed for future sales; every checkout freezes that buyer's disclosed transaction terms and price-change rules.
4. **SMS marketing** always has independent, optional affirmative consent even when user has opted into check-ins.
5. **No church administrator surveillance**; make aggregate reporting genuinely privacy-protective.

## Official resource links (recheck at launch)
- SEC adviser marketing rule: https://www.sec.gov/resources-small-businesses/small-business-compliance-guides/investment-adviser-marketing
- SEC Reg S-P guide: https://www.sec.gov/file/regulation-s-p-small-entity-compliance-guide
- Twilio A2P onboarding: https://help.twilio.com/articles/11847054539547
- Twilio privacy review: https://www.twilio.com/docs/api/errors/30932
- FTC negative option guidance: https://www.ftc.gov/legal-library/browse/rules/negative-option-rule
