# Supabase Setup Guide

How to activate Cloud Mode for a CBAI deployment. Every step below is real and required — there is
no shortcut that skips Row Level Security or the schema migrations.

## 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com) (or your own self-hosted Supabase
instance). Note the **Project URL** and the **anon/public API key** from
Project Settings → API — you will need both, and only those two.

## 2. Run the schema migrations

In the Supabase SQL editor (or via `supabase db push` with the CLI), run, in order:

1. `supabase/migrations/0001_init_schema.sql` — creates every table.
2. `supabase/migrations/0002_rls_policies.sql` — enables Row Level Security and every
   own-record policy. **Do not skip this file** — without it, every table is readable and
   writable by anyone with the anon key.
3. `supabase/migrations/0003_rls_verification_queries.sql` — not a migration; run the queries in
   it manually afterward to confirm RLS is actually enforced (see
   [`rls-policy-guide.md`](./rls-policy-guide.md)).

## 3. Configure environment variables

Copy `.env.example` to `.env.local` in the project root and fill in the two values from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both are safe to expose in the browser bundle by design — RLS is what actually protects data, not
secrecy of the anon key. **Never** add a service-role key here or to any `NEXT_PUBLIC_*`
variable — see [`deployment-guide.md`](./deployment-guide.md) for why this architecture has
nowhere safe to hold one.

Rebuild (`npm run build`) after adding the variables — Next.js inlines `NEXT_PUBLIC_*` values at
build time for a static export, so a running dev/build process will not pick up a `.env.local`
change without a restart.

## 4. Configure Auth redirect URLs

In Supabase Dashboard → Authentication → URL Configuration, add the deployment's real origin(s) —
for the production deployment at `https://checkbalanceai.global`:

- **Site URL:** `https://checkbalanceai.global`
- **Redirect URLs:** `https://checkbalanceai.global/reset-password`, plus the same for any preview
  or local dev origin you use (e.g. `http://localhost:3000/reset-password`).

The `/reset-password` route (`app/(dashboard)/reset-password/page.tsx`) is the one page in this app
that expects Supabase's recovery tokens in the URL — every other page ignores them.

## 5. Email templates (optional but recommended)

Supabase's default confirmation/recovery email templates work as-is. If you customize them, keep
the `{{ .ConfirmationURL }}` / `{{ .RecoveryURL }}` links intact — the app relies on Supabase's own
token-in-URL handling (`detectSessionInUrl: true` in `lib/supabase/client.ts`), not a custom
callback route.

## 6. Verify

With the environment variables set and a fresh `npm run build`, follow
[`docs/production-readiness-audit.md`](./production-readiness-audit.md)'s browser-verification
checklist or Phase 17 of the mission that added this: create an account, confirm email if enabled,
sign in, create a Project, refresh, sign out, sign back in, confirm the Project persisted. This
step requires a real configured project — it was not run against a live project in this
environment (see the mission's final report for exactly what was and wasn't verified).

## Local Mode (no configuration)

Leaving both variables unset is a fully supported, permanent mode — not a "not ready yet" state.
The app detects this via `isSupabaseConfigured()` (`lib/supabase/client.ts`) and stays in Local
Mode everywhere: real device-local accounts, real localStorage persistence, no network calls to
Supabase at all.
