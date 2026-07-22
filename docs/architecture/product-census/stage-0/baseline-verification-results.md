# Baseline verification results (Stage 0)

Captured: 2026-07-22T03:00:37Z → 03:01:09Z (UTC)
Logs: `docs/architecture/product-census/stage-0/baseline-logs/`
**No product code fixes applied during Stage 0.**

| Check | Command / script | Exit | Result |
|-------|------------------|------|--------|
| TypeScript | `npx tsc --noEmit` | 0 | PASS |
| Lint | `npm run lint` | 0 | PASS |
| Production build | `npm run build` | 0 | PASS |
| Spatial world | `npm run test:spatial-world-intelligence` | 0 | PASS |
| Platform shell | `npm run test:platform-shell` | 0 | PASS |
| Operational objects | `npm run test:operational-objects` | 0 | PASS |
| Locale completeness | `npm run test:locale-completeness` | 0 | PASS |
| Localization closure | `npm run test:localization-closure` | 0 | PASS |
| Voice operating navigator | `npm run test:voice-operating-navigator` | 0 | PASS |
| Voice command orchestrator | `npm run test:voice-command-orchestrator` | 0 | PASS |
| Auth collaboration / pubs shells | `npm run test:auth-collaboration-voice-os` | 0 | PASS |
| Shared persistence / migration helpers | `npm run test:shared-persistence` | 0 | PASS |
| Ontology + FDE | `npm run test:ontology-forward-deployed-engines` | 0 | PASS |

## Stage 1/2 blockers from baseline

**None from failing checks** — all listed checks passed.

Security freeze blockers (`security-freeze-blockers.md`) remain **product release blockers**, not baseline-test failures.

## Notes

- Live OpenAI Realtime with real credentials: not part of these unit/script checks; still **EXTERNAL_BLOCKED** for audio E2E.
- Build artifacts `.next/` / `out/` remain gitignored; not part of recovery commit set.
