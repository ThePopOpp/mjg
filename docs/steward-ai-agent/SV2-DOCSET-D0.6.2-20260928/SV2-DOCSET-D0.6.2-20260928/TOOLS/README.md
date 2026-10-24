# Document validator

Run `python TOOLS/validate_package.py .` from the extracted package folder, or pass the package ZIP as its argument. The script uses only the Python standard library. It checks exact file hashes, source-body/faith preservation, source anchor order, the nine functions, 27 original direction entries, test IDs and disabled configuration examples. It rejects unexpected/missing files, checksum mismatches and unsafe ZIP paths/symlinks. It reads a ZIP without extracting or executing its content.

The manifest and validator are not a trusted digital signature. Authenticity and production approval require a separately trusted process. A PASS is document integrity only: no model/application behavior, database security, contract fit, licensing, clinical review or production deployment has been validated.

Draft 0.4 checks archived Draft 0.3 and compact C1, current C2 character count (including spaces and line breaks), 175 definitions, preserved owner-reported conversational FAIL, fresh-chat-only unrun rerun state, disabled configuration and synchronized extracts. This executes documentation checks only; it does not run the onboarding correction or the five behavioral regressions.
