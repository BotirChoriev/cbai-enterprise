# Stage 1 — Canonical contracts only

**Branch:** `preview/spatial-world-intelligence`
**Scope:** Additive types, ownership interfaces, import-direction rules, compatibility adapter stubs, deprecation/quarantine markers, architecture tests, documentation.

**Not in Stage 1:** deletions, store merges, data migration, UI redesign, broker auth (SF-1), auth replacement, publication enablement, Stage 2.

## Artifacts

| Path | Role |
|------|------|
| `lib/canonical-contracts/**` | Contracts, ownership registry, adapter stubs |
| `scripts/test-architecture-boundaries.ts` | Import-direction regression |
| `scripts/test-canonical-contracts.ts` | Contract/unit asserts |
| `dependency-rules.md` | Human-readable rules |
| `remaining-out-of-boundary-consumers.md` | Documented non-canonical consumers |
| `STAGE-1-FINAL-REPORT.md` | Completion report |

## Commands

```bash
npm run test:architecture-boundaries
npm run test:canonical-contracts
```

## Rollback

Delete `lib/canonical-contracts/`, Stage 1 docs under this folder, the two test scripts, and the two `package.json` script entries; revert quarantine JSDoc on `lib/intelligence/{index,evidence/index,graph/index}.ts` and the comment on `lib/platform-actions/types.ts`. No data repair.
