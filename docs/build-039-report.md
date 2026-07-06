# BUILD-039 Report — Intelligence Engine Test Harness

**Build:** BUILD-039  
**Date:** July 2026  
**Scope:** Deterministic local test harness for the CBAI Intelligence Engine  
**Status:** Complete — framework-agnostic utilities; no test runner

---

## Purpose

BUILD-039 introduces `lib/intelligence/testing/` — a **deterministic local test harness** that runs predefined intelligence scenarios against existing local entity data. The harness validates pipeline structure, layer outputs, and diagnostics without Jest, Vitest, a CLI, UI integration, or external services.

The harness answers: **"Does the Intelligence Engine behave correctly for known local inputs?"** — not "Is the business conclusion correct?"

---

## Architecture

```
IntelligenceTestHarness
  ├── test-scenarios.ts    Predefined requests + structural validators
  ├── test-harness.ts      Runs DefaultIntelligenceEngine per scenario
  ├── test-reporter.ts     Structured pass/fail reports
  └── types.ts             Scenario and report types
```

### Usage (programmatic)

```typescript
import {
  defaultIntelligenceTestHarness,
  runIntelligenceTestSuite,
} from "@/lib/intelligence/testing";

const report = await runIntelligenceTestSuite();
// report.outcome === "pass" | "fail"
// report.scenarios[].evidenceCount, confidenceBand, trustLevel, ...
```

No CLI or UI is required — callers invoke the harness from scripts, REPLs, or future CI jobs.

---

## Scenarios

| Scenario ID | Purpose |
|-------------|---------|
| `empty-request` | No `subjectEntities` — conservative permissions and trust |
| `country-entity-request` | Local country entity (`usa`) produces entity-profile evidence |
| `company-entity-request` | Local company entity (`apple`) produces evidence |
| `university-entity-request` | Local university entity (`stanford`) produces evidence |
| `unsupported-entity-type` | `government` type emits `entity-type-not-connected` warning |
| `missing-entity-id` | Unknown country id emits `entity-not-found` warning, no fabricated evidence |
| `graph-enabled` | `includeGraph: true` → graph not connected + degraded diagnostic |
| `memory-enabled` | `includeMemory: true` → memory not connected + degraded diagnostic |
| `operational-request-blocked-by-trust` | `type: operational` → execution denied + blocked diagnostics |

All scenarios use **known local entity ids** from existing domain data (`usa`, `apple`, `stanford`). Validators check structural signals only — evidence counts, warnings, trust permissions, diagnostics health — never fabricated business conclusions.

---

## Scenario Report Shape

Each scenario produces:

```typescript
{
  scenarioId: string;
  scenarioName: string;
  outcome: "pass" | "fail";
  evidenceCount: number;
  confidenceBand: ConfidenceBand | "unknown";
  trustLevel: TrustLevel | "unknown";
  diagnosticsHealth: RunHealth | "unknown";
  warnings: string[];
  blockingIssues: string[];
  failures: string[];
  error?: string;
  durationMs: number;
}
```

Aggregated `IntelligenceTestReport` includes pass/fail counts and overall outcome.

---

## How It Validates the Intelligence Engine

The harness validates **governance and pipeline behavior**, not intelligence quality:

1. **Pipeline completion** — scenarios must not throw unless failure is expected
2. **Evidence grounding** — entity scenarios must produce bound evidence items
3. **Warning propagation** — unsupported/missing entities must emit adapter warnings
4. **Context flags** — graph/memory enabled scenarios must reflect not-connected status
5. **Trust gates** — operational requests must be blocked when trust denies execution
6. **Diagnostics integration** — BUILD-038 diagnostics must classify run health correctly

Confidence and trust **scoring formulas are not modified** — the harness observes their outputs.

---

## Trace vs Test Harness

| | Reasoning Trace | Test Harness |
|---|----------------|--------------|
| When | During every pipeline run | On-demand validation |
| Purpose | Audit record of execution | Regression verification |
| Output | Stage timeline, verification | Pass/fail scenario reports |
| Audience | Explainability, compliance | Engineering, CI |

---

## Future CI Path

| Phase | Enhancement |
|-------|-------------|
| Phase 1 | Programmatic harness utilities (BUILD-039) |
| Phase 2 | `npm run test:intelligence` script invoking `runIntelligenceTestSuite()` |
| Phase 3 | CI gate — fail build when `report.outcome !== "pass"` |
| Phase 4 | Snapshot comparison of scenario reports across builds |
| Phase 5 | Custom scenario registration for tenant-specific fixtures |

---

## Why No Test Runner Yet

- **Cloudflare Pages compatibility** — no Node test runner dependency in production bundle
- **Framework agnostic** — harness works in Node scripts, REPL, or future CI without Jest/Vitest config
- **Incremental adoption** — BUILD-039 establishes scenarios and validators before CI wiring
- **Deterministic scope** — structural validation does not require assertion libraries

Jest/Vitest can wrap `runIntelligenceTestSuite()` in a future build without changing harness internals.

---

## Constraints Honored

- No UI or dashboard changes
- No Entity Framework modifications
- No API routes or external services
- No AI models or fabricated business intelligence
- No changes to confidence/trust scoring or pipeline order

---

## Verification

```bash
npm run lint
npm run build
```

Both must pass with 18 static routes and no TypeScript errors.

---

## Files

### Created

- `lib/intelligence/testing/test-harness.ts`
- `lib/intelligence/testing/test-scenarios.ts`
- `lib/intelligence/testing/test-reporter.ts`
- `lib/intelligence/testing/types.ts`
- `lib/intelligence/testing/index.ts`
- `docs/build-039-report.md`

### Modified

- `lib/intelligence/index.ts` — public exports
