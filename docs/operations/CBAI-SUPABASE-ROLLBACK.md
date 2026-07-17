# CBAI Supabase Rollback (BUILD-039)

## Application rollback

Revert commit `BUILD-039` locally. Redeploy prior static export artifact. Device-local adapters activate automatically when env vars are removed.

## Database rollback

Prefer **forward-fix** migrations over destructive rollback in production.

If 0007 RPC must be removed:

```sql
drop function if exists public.accept_organization_invitation_by_token(text);
drop function if exists public.create_organization_with_owner(text, text, text, text, text);
```

Do not drop 0005 tables if production data exists without backup.

## RLS

Disabling RLS is an emergency measure only — document incident in `docs/security/CBAI-OPEN-RISKS.md`.
