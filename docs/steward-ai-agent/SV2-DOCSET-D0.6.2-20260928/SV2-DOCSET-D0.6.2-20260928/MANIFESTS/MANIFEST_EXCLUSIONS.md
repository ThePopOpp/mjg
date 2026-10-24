# Manifest exclusions

`MANIFESTS/PAYLOAD_SHA256.json` and `MANIFESTS/PAYLOAD_SHA256.txt` are excluded from the payload hash manifests to avoid self-referential or mutually referential hashes. The final ZIP SHA-256 is computed externally after archive creation and is not stored inside the ZIP.
