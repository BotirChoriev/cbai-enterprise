# CBAI Incident Response (BUILD-038)

## Severity

| Level | Example | Response |
|-------|---------|----------|
| S1 | Cross-tenant data leak | Disable shared backend; revoke sessions |
| S2 | Invitation token bypass | Revoke affected invitations; patch + redeploy |
| S3 | UI shows fake shared state | Hotfix honesty banner; communicate limitation |

## Steps

1. Confirm with reproduction (test account, audit log).
2. Contain (disable feature flag / Supabase policy tighten if live).
3. Fix in branch; run `test:genesis-build034-038` + browser regression.
4. Document in `docs/security/CBAI-OPEN-RISKS.md`.

## Contacts

Alpha: repository maintainer — no 24/7 on-call in Closed Alpha.
