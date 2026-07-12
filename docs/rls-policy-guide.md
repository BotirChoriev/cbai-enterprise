# Row Level Security Policy Guide

Reference for `supabase/migrations/0002_rls_policies.sql`. RLS is what actually protects data in
this architecture — the anon key shipped to every browser has no other restriction, so every table
must have RLS enabled and correct before real user data touches it.

## The pattern

Every user-owned table gets exactly 4 policies:

```sql
create policy <table>_select_own on public.<table> for select using (auth.uid() = owner_id);
create policy <table>_insert_own on public.<table> for insert with check (auth.uid() = owner_id);
create policy <table>_update_own on public.<table> for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy <table>_delete_own on public.<table> for delete using (auth.uid() = owner_id);
```

(`profiles` uses `id` instead of `owner_id` — same idea, since `profiles.id` **is** the user.)

`using` controls which existing rows are visible/affected; `with check` controls what a new or
updated row is allowed to contain. Both matter: `using` alone would let a signed-in user see only
their own rows but still let them **write** a row claiming someone else's `owner_id` — `with check`
is what makes that impossible. A payload's `owner_id` field is never trusted on its own; Postgres
re-verifies it against the real authenticated session (`auth.uid()`) on every write.

## Why no public/team visibility policy exists yet

`projects.visibility` can hold `"team"` or `"public"`, but no policy here grants access based on
that value — every row is readable only by its own `owner_id`, full stop. `CreateProjectForm`
disables the Team/Public `<option>` elements in the UI for the same reason
(`lib/project/project-types.ts`'s `PROJECT_VISIBILITY_LABELS` declares them Planned). Activating
real shared visibility means writing and reviewing a new policy deliberately — never a default this
migration should silently turn on.

## Verifying RLS is actually enforced

`supabase/migrations/0003_rls_verification_queries.sql` has the exact queries. In short:

1. Query `pg_class.relrowsecurity` for every table — confirm `true`.
2. Query `pg_policies` grouped by `tablename` — confirm exactly 4 policies per table.
3. **The real test**: sign in as two different real users via the Supabase client (not the SQL
   editor, which runs as a superuser and bypasses RLS by default) and confirm user B cannot select,
   update, or delete a row created by user A.
4. Attempt an insert with a spoofed `owner_id` (someone else's real UUID) — confirm it's rejected.
5. With no session (anon key only), confirm every table returns zero rows and every write fails.

`scripts/test-cloud-platform.ts` (tests 21–22) statically verifies every table's RLS is enabled and
every table has exactly 4 policies, and that every insert policy's `with check` references
`auth.uid()` — by reading the real migration SQL, not by mocking a database. It cannot verify
runtime enforcement (steps 3–5 above require a live project); that verification is the deployer's
responsibility before handling real user data.
