# CBAI Open Security Risks (BUILD-037)

## Critical

None verified in static analysis of client bundle (no service-role key found).

## Major

| Risk | Mitigation status |
|------|-------------------|
| Device-local org/collaboration presented as shared | UI shows `persistenceDeviceLocal` banner |
| RLS not live-tested | Migrations + matrix documented; apply with Supabase |
| No two-user browser verification | Blocked on credentials |

## Minor

- Email invitation transport not implemented
- Rate limiting on invitation accept attempts — design in migration comments only
- Firefox/WebKit security journeys not run this session (Chromium 12/12 pass)

## Dependency audit

Run `npm audit` before Closed Alpha deploy; record results in release checklist.
