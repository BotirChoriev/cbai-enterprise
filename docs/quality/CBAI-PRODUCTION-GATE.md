# CBAI Production Gate

Closed Alpha gate checklist — updated per build.

## Required commands

| Command | BUILD-027 | Notes |
|---------|-----------|-------|
| `npm run lint` | required | |
| `npx tsc --noEmit` | required | |
| `npm run build` | required | |
| All `test:*` | required | browser test needs dev server |
| Playwright browser install | recommended | `npx playwright install chromium` |

## BUILD-027 gate

- [ ] Truth ledger GEN-T001–T006 fixed with regression tests
- [ ] Workflow telemetry typed and emitting on core journeys
- [ ] No sensitive content in telemetry
- [ ] User-test task mode functional
- [ ] `test:genesis-truth` passes
- [ ] `test:workflow-telemetry` passes

## BUILD-028 gate

- [ ] Crossref adapter with real network smoke test
- [ ] API route server-side only
- [ ] Provenance preserved in canonical records
- [ ] Search results not auto-labeled reviewed evidence
- [ ] Integration registry updated

## Closed Alpha (BUILD-033)

Not started — see program section 18.

## Current verdict

**NOT READY** for Closed Alpha — BUILD-027–033 in progress.

Push: not pushed | Deploy: not deployed | Cloudflare: unchanged
