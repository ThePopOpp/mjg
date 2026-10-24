# Draft 0.6 — Independent Pre-handoff Review

## Decision
The actual uploaded archive is readable and preserves the core source bodies, doctrine, current pricing schedule and the intended Batch 02 wording corrections. **Do not mark it approved Steward V1.0 or a complete verified engineering handoff yet.** Focused fictional acceptance can use a deliberately selected fixed candidate, but package repair and actual acceptance outputs remain outstanding. No model or application test was executed in this review.

This review compared the real Draft 0.6 ZIP with the complete original Draft 0.4 ZIP available in this conversation's working files, plus the earlier Draft 0.5.1 ZIP. It did not assume the other project's workspace had those originals. The claimed unavailability there is resolved by supplying the exact original archive here.

## Actual measurements
- Uploaded archive: `SV2-DOCSET-D0.6-20260928.zip`
- Actual final ZIP SHA-256: `aaf352978c5e83268f5c6193768659edd76eae8951bdeedb5641e383350c9f51`; this agrees with the chat's release report.
- ZIP CRC/readability test: passed; 106 file members; no duplicate member names.
- Active `PROJECT_SOURCES`: 12; no missing numbered 01.
- All 29 preserved BEGIN_SOURCE/END_SOURCE bodies match original Draft 0.4 exactly; 7,683 numbered source blocks retained.
- All eleven full source tails beginning at the first BEGIN_SOURCE match Draft 0.4.
- All 12 archived Draft 0.4 active masters in this ZIP match the actual original Draft 0.4 masters.
- Statement of Faith: 2,633 bytes; unchanged; SHA-256 `b587d8af30ad22d695e48d78608cc6cbbf05d928cd3c6527c58ca305ac9e4e87`.
- Existing catalogue: 175 distinct test IDs, equal to Draft 0.4; these are definitions, not executed results.
- Project instructions: 6,205 LF characters / 6,227 CRLF characters; both below 8,000. SHA-256 `c6399dea1cb5dcf4e1389499bc2a18de5717c915797c8bc01fc7ef96ff26c880`.
- Both payload manifests list 105 entries: 103 match and 2 fail. Both failing entries are the manifest files themselves. All active source and instruction hashes match.
- The internal `MANIFESTS/ZIP_SHA256.txt` reports `a7730b4d10ebdd6d8eeae0d6895f0f361e440c94704c5516a8bca092b9efcccc`, which is NOT the final ZIP hash. This is a stale internal archive digest, not evidence of payload corruption.

## Material progress retained
Current C13/X16/M13 and the added entitlement-aware engineering clause expressly state that serial Full redevelopment is not Free merely because the participant starts each visit, splits requests, avoids scheduling or withholds saving. The instructions carry the same rule, retain bounded Free help and prohibit inventing quotas. C13/Q10 and instructions also distinguish controller inputs from real backend execution. These are documentation corrections; DEF-B02-FREE-SCOPE-001 still requires an actual retest. The approved commercial terms and exact protected historical source modules remain intact.

## Open package findings

### PKG06-01 — Original companion restoration incomplete (carried-forward engineering-handoff blocker)
The complete original D0.4 ZIP has 122 files and is available here: `Steward_Complete_Project_Package_Draft_0_4_2026-09-26.zip`, SHA-256 `c8c4ac2d4d9997bccc4d01fe4d9ad4c4e60942213b63cab0490ae31464642688`. It contains the actual detailed configurations, templates, validator, source-ledger/evidence and native files. Draft 0.6 still carries the smaller D0.5.1 substitutes. For example, the original feature catalogue has 48 structured entries (17,387 bytes); the new `CONFIG/feature_catalogue.disabled.json` is a 374-byte category list. The original agent registry is 20,162 bytes; the current CONFIG registry is 174 bytes. The original validator is 17,250 bytes and tests substantially more than the 569-byte current count/length-only script. File length alone is not the test: contents confirm lost structured detail, and no approved loss/disposition mapping is supplied for that reduction.

Recover exact originals; retain later approved amendments in the current counterparts. D0.4 is not a replacement for D0.6 behavior. The restoration kit also supplies the exact uploaded consolidated Batch 01/02 reviews, not all missing raw per-test transcripts. Individual source fidelity/rights/visual claims remain limited to the available evidence.

### PKG06-02 — Duplicated live clause IDs and mixed current routing (repair before final handoff)
Master05 has TWO current D23 headings: Batch 01 selected-note/action-status precision and Batch 02 evidence/entitlement boundaries. Master08 has TWO current E14 headings: Batch 01 prompt refinements and Batch 02 entitlement-aware response contract. Preserve original IDs and assign unique new ones, then update references. Do not delete either requirement body.

Master00 still calls the instruction file the replacement for D0.5.1 installation in its live front matter, alongside the new D0.6 table. Master11 DEC-12 still describes D0.4 as the current correction candidate. Older installation/overview/common-prompt files are present without uniformly clear current-versus-historical routing. Retaining historical labels is correct; leaving live routing ambiguous is not.

### PKG06-03 — Hash generation is self-referential (repair before final handoff)
The manifests hash their own/each other's earlier bytes and cannot match the final copies as packaged. Exclude hash-manifest files from the shared payload inventory and document exclusions. Finish all payloads, generate the manifest pair, archive, then compute the final archive digest in an external sidecar. An internal hash of an earlier archive must not be labeled as the hash of the archive containing it. CRC passed and all 103 nonmanifest listed payload hashes match; do not report all 105 matched.

### PKG06-04 — Acceptance outlines do not meet the requested no-relay scripts (testing-enablement gap)
The six files under ACCEPTANCE_SCRIPTS are approximately 0.8–1.3 KB each. They describe fixtures/procedures/expectations but lack complete initial identity/grant states, fixed participant turns, specific approval/receipt sequences, stop conditions and complete personal data for the Full/Premium examples. AC-02 lists an email-only partial-event variant after a complete-success variant without specifying a reset; these must use separate declared starting states. AC-06 states 'approved Blueprint and selected notes' without supplying actual records or dates. Thus they are useful outlines, not ready-to-paste complete conversations. Supplemental manual run cards are supplied in this review kit; they are newly authored fixtures, NOT executed tests or new product rules.

### PKG06-05 — Coverage map is compact, not product-complete (readiness gap)
The COVERAGE map contains ten broad rows. It does not provide a disposition/evidence row for all 48 baseline feature-catalogue entries or every approved launch feature/function. This does not mean the omitted requirements are absent from the masters. Preserve the detailed source catalogue and map scope, requirements, functions, tests, execution status and remaining implementation/review owners. Current promotion row cites B02-03 as partial evidence even though B02-03 tested selected-note capture; correct the evidence linkage.

### PKG06-06 — Known acceptance and release limits remain open
No isolated model runner ran. No supplied AC execution occurred. Owner acceptance cannot turn unrun high-priority behavioral checks into passes. Jeremy may receive a technical-review candidate with known issues; that is not the final approved engineering baseline or permission for real participants. Numeric Free/Premium allowances remain unset configuration and must not become an invented unlimited default. Privacy, safety, commerce, rights, rendering, load, data and nine-function application execution remain separately required evidence.

## Work completed by this review
Archive and manifest verification; exact comparison with original D0.4 and D0.5.1; source-body/block and catalogue identity checks; focused reading of changed rules, prompt/control metadata, scripts, coverage and readiness; recovery of original restoration inputs; authored manual acceptance fixtures. The uploaded D0.6 ZIP and its 12 active sources have NOT been edited. No external accounts/actions, LLM test calls, installations, release approvals or application tests occurred.

## Recommended short path
Restore from the supplied actual D0.4 original rather than generate another abbreviated reconstruction. Repair identifiers, routing and manifests in one controlled package operation. Preserve the current substantive D0.6 correction. Select one fixed acceptance candidate and run the short scripted conversations, returning complete transcripts once rather than every turn. Reconcile any later substantive edits with affected retests. Only then request owner approval of the exact engineering payload. Keep production gates separate.
