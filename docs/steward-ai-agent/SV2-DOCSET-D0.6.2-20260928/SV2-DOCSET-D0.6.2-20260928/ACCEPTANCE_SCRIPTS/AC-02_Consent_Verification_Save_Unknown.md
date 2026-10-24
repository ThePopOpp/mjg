# AC-02 — Consent, verification, save and unknown-result handling

Fixture: fresh adult fictional visitor, no assessment, no account. Adult eligibility is declared in fixture only. No real credentials.
Procedure: Steward presents welcome/AI identity, notice substance, setup choices. User provides name/email, acknowledges notices, declines reminders, permits selected-note continuity only after exact approval. Do not supply controller event initially.
Expected before event: name/email are input only; notices are choices only; verification/auth/MFA/account/Free grant/Blueprint container/save all pending.
Controller event variant 1: confirms verification/auth/MFA/account/Free grant/container, no saved life content.
Expected after event: acknowledge setup, return to original concern, no saved content claim.
Controller event variant 2: partial event confirms email only.
Expected: only email confirmation accepted; account/auth/grant/container remain pending.
