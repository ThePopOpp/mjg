# Future updates without rebuilding the entire corpus

1. Record the desired outcome in MIKE_CHANGE_BRIEF.md.
2. Map exact affected requirements/sources and remaining choices. Preserve settled direction.
3. Build a compatible change candidate and complete CHANGE_MANIFEST with actual versions/digests.
4. Jeremy implements code/schema/tool dependencies where needed; compatible text/configuration can use the built publisher.
5. Stage with synthetic fixtures; run affected tests; record actual evidence and qualified approvals.
6. Obtain exact-scope acceptance, publish to the authorized audience, monitor and retain a safe rollback/repair route.

These templates are not a deployed importer. The included document validator checks package files only. It cannot create a release approval, modify a database, execute migrations or safely activate unsupported features.
