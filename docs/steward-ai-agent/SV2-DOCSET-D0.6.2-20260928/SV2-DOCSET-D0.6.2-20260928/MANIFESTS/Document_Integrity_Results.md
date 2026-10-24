# Document integrity results — Draft 0.6.2

Actual checks run on the final package build:

- `unzip -t` on final ZIP: PASS.
- Validator on final extracted package: PASS.
- Validator on final ZIP: PASS.
- Corrupted-payload negative control: PASS. A disposable extracted copy was modified by appending text to `README.md` without updating manifests; the validator rejected it.
- Payload manifests exclude `MANIFESTS/PAYLOAD_SHA256.json`, `MANIFESTS/PAYLOAD_SHA256.txt`, `PACKAGE_MANIFEST.json`, and `SHA256SUMS.txt`.
- Instruction length: 6,486 LF characters / 6,508 CRLF characters, both below 8,000.
- Preserved source modules/blocks: 29 / 7,683.

These are document/package checks only. They are not behavior, application, security, legal, rights, production, or billing approvals.
