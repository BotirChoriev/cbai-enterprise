# CBAI Collaboration Privacy (BUILD-037)

## Default policy

`DEFAULT_SHARE_POLICY` — share nothing except minimum mission identity required for collaboration context.

## Object-level sharing

Each shared object record includes: collaboration id, canonical object reference, access level, sharer, version, status.

Revocation sets shared object status `revoked`; `loadSharedObjects()` excludes revoked records.

## Verified (device-local)

- `B035-T002` — revoke shared object removes access for participant
- Participant revocation emits `participant_revoked` notification
- Graph projection scoped by collaboration id

## Not verified

- Adversarial direct URL access to unshared evidence (static export — client-side only)
- Cross-account privacy boundary (requires shared backend + two browser contexts)
- Private mission notes isolation under concurrent collaboration (manual review pending)
