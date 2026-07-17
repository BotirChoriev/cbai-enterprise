# CBAI Alpha Onboarding (BUILD-038)

## Operator setup

1. Create Supabase project; run migrations `0001` through `0006`.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in build environment.
3. Create two test accounts for organization/collaboration verification.
4. Run pre-release gates from `CBAI-CLOSED-ALPHA-RUNBOOK.md`.

## User onboarding

1. Sign in (Supabase Auth when configured) or use device-local mode with limitation banner.
2. Create organization from `/organization`.
3. Copy invitation link; second user accepts in separate browser profile.
4. Create mission → collaboration → share reviewed source explicitly.

## Honest messaging

Show persistence capability state on organization page — never imply multi-user without shared backend proof.
