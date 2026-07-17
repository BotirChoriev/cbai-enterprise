# CBAI Security Threat Model (BUILD-037)

## Scope

Static-export Next.js client with optional Supabase Auth and RLS.

## Trust boundaries

| Boundary | Enforcement |
|----------|-------------|
| Authentication | Supabase Auth session (when configured) |
| Organization data | RLS + `authorizeOrganizationAction()` |
| Collaboration objects | Participant checks + share records |
| Living graph | Permission-filtered projection — unauthorized nodes excluded |
| Invitations | SHA-256 token hash, expiry, single accept |

## Critical open items (this environment)

- RLS not verified against live Supabase (no credentials)
- Two-user browser journeys blocked without shared backend
- Service-role key correctly absent from client bundle

## Residual risks

- Device-local mode is not multi-user safe — UI discloses limitation
- Email invitation transport not implemented (link-only)
