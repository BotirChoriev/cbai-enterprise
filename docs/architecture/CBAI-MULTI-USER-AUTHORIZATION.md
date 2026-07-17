# CBAI Multi-User Authorization (BUILD-039)

## Layers

1. **Supabase Auth** — session, JWT email claim for invitation binding
2. **RLS** — direct table access enforcement (migration 0006)
3. **RPC** — atomic org create and invitation accept (migration 0007)
4. **Application policy** — `authorizeOrganizationAction()` for UX and device-local path
5. **Session mirror** — shared org cache for synchronous authorization reads after hydration

## Actor resolution

`resolveActorId()` returns cloud user id when `shared_backend_ready`, else device-local session id.

## Live verification status

| Check | Status |
|-------|--------|
| App-layer IDOR tests | pass (device-local) |
| Direct RLS tests | **blocked** — no credentials |
| Two-user Playwright | **blocked** |
