# CBAI Release Readiness Checklist

Programmatic gate: `npm run test:flagship-consolidation`

## Required Sequence (this repo)

1. **CODE** — focused feature changes with constitution compliance
2. **FOCUSED TESTS** — `test:research-canvas`, `test:flagship-consolidation`
3. **REGRESSION TESTS** — genesis, context continuity, mission, product, countries, global interface, governance
4. **LINT** — `npm run lint` (0 errors)
5. **TYPE CHECK** — via `npm run build`
6. **PRODUCTION BUILD** — `npm run build`
7. **STATIC EXPORT** — verify `/research/canvas` in route list
8. **LOCAL BROWSER SMOKE** — manual walkthrough or Playwright when available
9. **LOCAL COMMIT** — after all gates pass
10. **HUMAN APPROVAL** — before push
11. **PUSH** — not in automated consolidation tasks
12. **CLOUDFLARE DEPLOY** — not in automated consolidation tasks
13. **LIVE BROWSER VERIFICATION** — post-deploy

## Smoke Path (Research Canvas flagship)

1. Open `/research/canvas`
2. Create private Smart Idea
3. Upload artifact or manual input
4. Confirm interpretation
5. Create Idea Model + Measurement Plan + Passport
6. Confirm external search + run provider discovery
7. Compare with connected records
8. Create Mission + execution task
9. Open Reasoning / Reports with context
10. Record human decision
11. Refresh — verify device-local persistence

## Honest Capability Labels

Never ship **WORKING** without UI, persistence, tests, and visible limitations.
