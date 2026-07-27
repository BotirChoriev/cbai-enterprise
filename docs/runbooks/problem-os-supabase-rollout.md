# Problem OS Supabase rollout

This runbook activates durable Problem Space persistence without replacing CBAI's local-first
architecture. It does not deploy the application and it does not authorize a production change.
The Voice Operator remains on the existing Platform Action pipeline.

## Human approval gates

1. A human names the target Supabase project and confirms it is not production, or explicitly
   approves production.
2. A human reviews the preflight output and the current database backup/PITR status.
3. A human approves applying `0008_problem_os.sql`.
4. A human reviews the postflight and live two-user RLS results.
5. Only a human approves application deployment or rollback.

## Before the migration

- Confirm the target project reference in the Supabase dashboard/CLI. Never infer it from a URL.
- Confirm a recent backup or point-in-time recovery is available.
- Record the current application release/version and migration history.
- Run `supabase/verification/problem_os_preflight.sql` in the target database.
- Stop if any prerequisite is `blocked`.
- If any result is `review_existing_install`, do not rerun the migration. Inspect the existing
  tables, policies, triggers, and functions for a partial or prior install.

## Apply and verify in staging

1. Apply `supabase/migrations/0008_problem_os.sql` once, followed immediately by
   `supabase/migrations/0009_problem_os_function_hardening.sql`.
2. Run `supabase/verification/problem_os_postflight.sql`.
3. Confirm:
   - both tables exist and RLS is enabled;
   - snapshot policies are exactly SELECT, INSERT, UPDATE for the owner;
   - audit has only the owner SELECT policy;
   - both triggers and both functions exist;
   - neither trigger function is directly executable by `anon` or `authenticated`;
   - audit has no client mutation policy.
4. Configure two isolated, non-production test accounts through the environment variables listed
   by `npm run test:problem-rls-live`.
5. Run `npm run test:problem-rls-live`. A skip is not a pass.
6. In the app, sign in as each account and confirm Problems never cross accounts, queued writes
   display honestly, refresh hydration works, and Local Mode remains device-only.

The live suite deliberately leaves one clearly prefixed `rls-verification-*` Problem per run
because Problem history has no client delete policy. Remove test fixtures only through an
approved administrator process after retaining any required audit record.

## Production gate

Do not continue from staging automatically. A human must compare the migration hash, postflight
output, RLS test output, backup status, and target project reference before approving production.
Repeat the same ordered steps against production; do not treat staging evidence as production
evidence.

## Recovery and rollback

Prefer recovery that preserves evidence and decision history:

1. Stop the application rollout or return the app to the previously recorded release.
2. Keep `problem_snapshots` and `problem_audit_events` intact.
3. Confirm pending local outbox entries remain on user devices; do not clear browser storage.
4. Diagnose using Supabase/PostgREST logs and the postflight queries.
5. Correct forward with a new additive migration after human review.

Do not drop the Problem tables as a routine rollback. Dropping them destroys decision history and
audit evidence. A destructive database rollback is allowed only if a human explicitly confirms
that no real Problem data exists (or has verified a restorable backup), identifies the exact
target project, and approves the exact SQL. Restore from the verified backup if real data may have
been affected.
