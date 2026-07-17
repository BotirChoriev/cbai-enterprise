# CBAI Invitation Security (BUILD-037)

## Organization invitations

- Raw token returned once at creation (`OrganizationInvitationCreated.rawToken`).
- Persisted field: `tokenHash` (SHA-256) — see `lib/organization-os/invitation-token.ts`.
- Legacy plain tokens migrated on read via `isLegacyPlainToken()`.
- Acceptance binds recipient email and user id; replay after accept returns error.
- Expiry: 7 days (`INVITE_TTL_MS`).
- Revocation sets status `revoked`; token lookup fails.

## Verified tests

- `B034-T002` — hash stored, raw not persisted
- `B034-T003` — replay blocked after accept
- `B037-T002` — audit records acceptance

## Not verified

- Token guessing resistance at scale (no live rate limiting without Supabase)
- Email transport (link-only copy in UI)
- Cross-account browser acceptance (requires shared backend + two sessions)
