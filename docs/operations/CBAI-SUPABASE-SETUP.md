# CBAI Supabase Setup (BUILD-039)

## Required variables

Copy `.env.example` to `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never add `SUPABASE_SERVICE_ROLE_KEY` to client env.

## Migrations

Apply in order:

```text
0001_init_schema.sql
0002_rls_policies.sql
0004_evidence_bookmarks.sql
0005_organization_collaboration_graph.sql
0006_rls_organization_collaboration.sql
0007_organization_rpc_functions.sql
```

Use Supabase SQL editor or CLI against your project.

## Test accounts (test environment only)

```text
CBAI_TEST_USER_A_EMAIL
CBAI_TEST_USER_A_PASSWORD
CBAI_TEST_USER_B_EMAIL
CBAI_TEST_USER_B_PASSWORD
CBAI_TEST_USER_C_EMAIL      # optional — unrelated user RLS tests
CBAI_TEST_USER_C_PASSWORD
```

## Live verification commands

```bash
npm run test:shared-persistence
npm run test:rls
npm run test:organization-multi-user   # dev server + Playwright
```

## Current environment

**Not configured** in this workspace — BUILD-039 remains INFRASTRUCTURE BLOCKED until credentials and migrations are applied.
