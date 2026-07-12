# Deployment Guide — Static Export + Supabase

## Is the static-export architecture compatible with real Supabase Auth and cloud persistence?

**Yes, unchanged.** `next.config.ts` keeps `output: "export"` — this mission made no change to it.
Real Supabase Auth (email/password, session persistence, password reset) and real cloud
persistence (`lib/supabase/`) are both implemented entirely as client-side `@supabase/supabase-js`
calls from `"use client"` components, exactly like every other piece of interactive state in this
app (localStorage-backed stores, React context providers). Nothing in this mission required a
server, an API route, or middleware:

- **Sign-up/sign-in/sign-out/session restore** — `supabase.auth.*` calls from the browser, with
  the session persisted in the browser's own storage (`persistSession: true` in
  `lib/supabase/client.ts`).
- **Password reset** — Supabase emails a link containing recovery tokens in the URL; the browser
  client reads them (`detectSessionInUrl: true`) when the user lands on the static
  `/reset-password` page. No server-side callback route is needed or exists.
- **Cloud project/report/bookmark CRUD** — direct `supabase-js` calls against Postgres, protected
  by Row Level Security rather than server-side authorization code.

`npm run build` was run repeatedly throughout this mission and continues to produce a fully static
`out/` directory (92 routes, zero server functions) — confirmed after every batch of changes, not
just claimed. See `docs/production-readiness-audit.md`/`docs/architecture-freeze-audit.md` for the
export's prior verification history; this mission changed none of those constraints.

## Why there is no server client

A server client would need somewhere private to run — a server component, an API route, or
middleware, none of which exist in a static export deployed as pure HTML/JS/CSS to a CDN. Building
one anyway would either be dead code, or worse, a pressure to put a service-role key somewhere that
ends up in the client bundle. `lib/supabase/client.ts` documents this directly; only a browser
client exists.

## Cloudflare Pages (or any static host) deployment requirements

1. Build output is `out/` (`next build`), served as static files — no change from before this
   mission.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as **build-time** environment
   variables in the hosting provider's dashboard (Cloudflare Pages → Settings → Environment
   Variables) — Next.js inlines `NEXT_PUBLIC_*` values into the built JS at build time, so they
   must be present when `next build` runs, not just at request time.
3. No redirects, rewrites, or edge functions are required for Supabase Auth itself — every route
   Supabase needs (`/reset-password`) is a real static page already in the build output.
4. Ensure the existing SPA-style fallback/routing config for this static export (if any is already
   configured for this host) is unchanged — this mission added one new static route
   (`/reset-password`) and did not remove or restructure any existing one.
5. All existing public routes are preserved — see `scripts/test-launch-gate.ts` test 17's canonical
   route list, still intact and now also including `/reset-password`.

## Supabase Auth redirect configuration for `https://checkbalanceai.global`

In the Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://checkbalanceai.global`
- **Redirect URLs (allow list):** `https://checkbalanceai.global/reset-password`

Without this, Supabase will reject the redirect after a password-reset email link is clicked. See
[`supabase-setup.md`](./supabase-setup.md) for the full setup sequence. This exact configuration
was **not** applied against a live Supabase project in this environment — no live project exists
here to configure. Documented so the deployer can apply it directly.

## What was and wasn't verified here

- Verified: `npm run build` succeeds with the Supabase client installed and wired in, producing an
  unchanged static route count/shape.
- Not verified: an actual deployed Cloudflare Pages build reaching a live Supabase project,
  completing a real sign-up/email-confirm/sign-in/reset-password round trip. That requires a real
  Supabase project and a real deployment, neither of which exist in this environment — see the
  mission's final report.
