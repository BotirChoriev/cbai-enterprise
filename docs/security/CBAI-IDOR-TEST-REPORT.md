# CBAI IDOR Test Report (BUILD-037)

## Application-layer tests (pass)

| Resource | Actor | Result |
|----------|-------|--------|
| organization | non-member stranger | denied (`not_authorized`) |
| organization | null actor | denied (`not_authenticated`) |
| graph org node | non-member | filtered from projection |
| collaboration shared object | revoked participant | empty shared list |

## Not verified (blocker: no shared backend)

- Direct Supabase REST IDOR by UUID substitution
- Cross-session invitation token acceptance with mismatched email JWT
- Notification enumeration across users

## Test command

```bash
npm run test:genesis-build034-038
```
