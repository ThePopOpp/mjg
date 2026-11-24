# Steward V2.0 — D0.7.3-R1 independent test-index reconciliation (owner-review patch)

This is a **source-index consistency patch only** to the user-supplied D0.7.3 owner-review package, not a new product-direction decision, accepted owner approval, application release or test pass. **Do not silently install.** The original D0.7.3 user-supplied archive remains unchanged and should be retained. Original archive SHA-256: `b84b24ac2d72d6b98ebd6eb76434e13659b2c7936f22948921cca422b5a9e7c4`.

## Why the patch exists

Independent audit found that the validated `MATRICES/Feature_Requirement_Test_Crosswalk.csv` and `TESTS/Acceptance_Test_Matrix.csv` agreed with each other, but the test lists in `MATRICES/Feature_Requirement_Coverage.csv` were out-of-sync in **25 of 43 feature rows**, and the test-list column in `EFFECTIVE_CURRENT_REQUIREMENTS.md` was out-of-sync in **24 of 43 feature rows**. The existing reciprocal validator did not check those other views. These are **documentation cross-reference problems**, not evidence that the feature requirements or 193 test scenarios were absent.

## Exact changes

1. Synchronized the `test_ids` column of `MATRICES/Feature_Requirement_Coverage.csv` with the canonical, validated association list in `MATRICES/Feature_Requirement_Test_Crosswalk.csv` for all 43 features.
2. Synchronized the **Test definitions** column in `EFFECTIVE_CURRENT_REQUIREMENTS.md` with the same canonical list, without changing other requirement text. Added a narrow R1 annotation in that file.
3. Corrected the fixture protocol's outdated “10 selected cases” statement to **14**, matching the actual JSON fixture inventory. These still validate structure/arithmetic only.
4. Added `TESTS/check_three_view_traceability.py` to reject mismatches among the feature-coverage table, feature/test crosswalk, effective-current requirements table, and acceptance-test matrix.
5. Added this notice and regenerated `FINAL_PACKAGE_MANIFEST.json` for the whole amended package.

**No changes:** All 12 frozen Draft 0.6.2 governing files, the exact Statement of Faith, the eleven proposed master files, 193 test definitions, 14 JSON fixtures, the October Retreat original source inputs, pricing and offer terms, public-first direction, privacy/safety/rights/release requirements, or actual application configurations. All AI, backend, payments, security and rights tests remain **NOT RUN**.

## Evidence / required next steps

The legacy `check_bidirectional_traceability.py`, the existing fixture/static validators and the new three-view checker must all exit 0 in the extracted package. This proves file/index consistency only, not application behavior or official CFM4 layer scoring. The user/owner can accept this R1 candidate for **engineering assignment**, preserving production as a separate release decision. Jeremy should verify the deployed codebase, exact commercial product IDs and activation/recurring consent, authoritative assessment scoring, rights-cleared teaching corpus, and public-access release gates in staging.

**Release framing:** Public-first, Compass-referred users receive identical public Free Steward access, and no automatic Premium, church affiliation, or content sharing. Campaign attribution is not entitlement. Full V2 design is documented, with scoped enablement of gated features.
