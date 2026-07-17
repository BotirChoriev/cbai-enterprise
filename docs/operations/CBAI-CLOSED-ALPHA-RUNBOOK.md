# CBAI Closed Alpha Runbook (BUILD-038)

## Prerequisites

- Supabase project with migrations 0001–0006 applied
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in build env
- Two test accounts for organization/collaboration journeys

## Pre-release gates

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:genesis-build034-038
npm run test:genesis-build029-033
npm run test:source-ingestion
npm run test:browser-regression
```

## Current environment verdict

**LOCAL INTEGRATION READY** — device-local org/collaboration; Chromium browser regression **12/12 pass** (BUILD-009 home continuity fixed).

## Rollback

Revert local commits; static export redeploy from prior build artifact. No Cloudflare changes in this program.
