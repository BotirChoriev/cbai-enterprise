# BUILD-025 Report — Trust Assessment Layer

**Build:** BUILD-025  
**Date:** July 2026  
**Scope:** Trust Assessment Layer for the CBAI Intelligence Engine  
**Status:** Complete — evidence-grounded conservative trust

---

## Summary

BUILD-025 introduces `lib/intelligence/trust/` — the Trust Assessment Layer that determines whether an organization should rely on an intelligence result. Trust calculation is removed from pipeline placeholders and delegated to `DefaultTrustAssessor`.

With current empty evidence (BUILD-023), behavior is conservative:

| Field | Value |
|-------|-------|
| `trustLevel` | `unverified` |
| `trustScore` | `0` |
| `allowAutomation` | `false` |
| `allowRecommendation` | `false` |
| `allowExecution` | `false` |
| `reason` | `"No verified evidence available."` (or variant when no sources connected) |

No UI, dashboard, Entity Framework, API routes, external services, mock business intelligence, or fake AI decisions were added.

---

## Confidence vs Trust

These are **separate epistemic and governance dimensions** — never interchangeable.

| | Confidence (BUILD-024) | Trust (BUILD-025) |
|---|------------------------|-------------------|
| **Question** | "How certain is the reasoning given the evidence?" | "Should the organization rely on this result?" |
| **Nature** | Epistemic — evidence quality composite | Governance — organizational permission |
| **Score source** | Weighted evidence factors | Evidence sufficiency + diversity + caps |
| **Drives** | Explainability bands, caveats | Automation, recommendations, execution gates |
| **Empty evidence** | Score 0, band `insufficient` | Score 0, level `unverified`, all actions denied |

### BUILD-025 separation rule

**Trust is never derived directly from confidence score.**

`ConfidenceAssessment` is an input to `DefaultTrustAssessor` only for **governance caps** (e.g. when `confidence.degraded === true`, apply `confidence-degraded` cap limiting trust score to 50). The confidence numeric score is never copied into `trustScore`.

---

## File Structure

```
lib/intelligence/
├── trust.types.ts              Extended TrustAssessment + TrustLevel
└── trust/
    ├── index.ts                Public barrel exports
    ├── assessor.ts             TrustAssessor + DefaultTrustAssessor
    ├── levels.ts               Trust levels, permissions, score bands
    └── rules.ts                Evidence rules, caps, score computation
```

### Modified

| File | Change |
|------|--------|
| `lib/intelligence/trust.types.ts` | New `TrustLevel`, expanded `TrustAssessment` governance fields |
| `lib/intelligence/engine/stages.ts` | `stageTrustAssessment` delegates to assessor |
| `lib/intelligence/engine/engine.ts` | Verify cap renamed to `post-verify-review` |
| `lib/intelligence/index.ts` | Re-exports trust module |

`TrustTier` (spec §5.2 agent taxonomy) is retained for `AgentDecision` trace records — separate from `TrustLevel`.

---

## Assessor Contract

### `TrustAssessor` interface

```typescript
interface TrustAssessor {
  assess(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
    confidence: ConfidenceAssessment,
  ): Promise<TrustAssessment>;
}
```

### `DefaultTrustAssessor` flow

1. `buildTrustCaps(request, evidence, confidence)` — governance caps (not score copy)
2. `computeTrustScoreFromEvidence(evidence)` — evidence-only raw score
3. `applyTrustScoreCaps(rawScore, caps)` — conservative cap application
4. `resolveTrustLevel(trustScore)` — level from capped score
5. `resolveTrustPermissions(level)` — action gates
6. `buildTrustReason(evidence, caps)` — human-readable explanation

---

## Trust Levels

| Level | Score range | Automation | Recommendation | Execution |
|-------|-------------|------------|----------------|-----------|
| `unverified` | 0 | ✗ | ✗ | ✗ |
| `low` | 1–25 | ✗ | ✗ | ✗ |
| `moderate` | 26–50 | ✗ | ✓ | ✗ |
| `high` | 51–75 | ✗ | ✓ | ✗ |
| `verified` | 76–100 | ✓ | ✓ | ✓ |

Helpers: `resolveTrustLevel`, `resolveTrustPermissions`, `TRUST_LEVEL_PERMISSIONS`, `isUnverifiedTrustLevel`.

---

## Rules (BUILD-025)

| Rule | Implementation |
|------|----------------|
| Separate Trust from Confidence | `computeTrustScoreFromEvidence` never reads `confidence.score` |
| Trust may never exceed evidence | `isTrustEvidenceInsufficient` gates score to 0 |
| Empty evidence → unverified | `TRUST_CAP_NO_EVIDENCE` forces score 0 and unverified permissions |
| No sources connected | Additional cap `no-sources-connected` with explicit reason variant |
| Contradiction open | Cap score to max 25 |
| Confidence degraded | Cap score to max 50 (not copy confidence value) |

### Evidence-based trust score (when not capped to zero)

| Sufficiency | Base score |
|-------------|------------|
| `minimum` | 20 |
| `adequate` | 45 |
| `strong` | 70 |

Plus: source class diversity bonus (max +15), relevance contribution (15% of mean relevance).

---

## Why Trust Must Be Conservative

### 1. Governance is not epistemics

Allowing automation or execution on unverified intelligence would violate Intelligence Specification §5 and Constitution §4.4 (explainable, governed intelligence). Trust gates exist to prevent action — not to encourage it.

### 2. Empty evidence is the current normal case

With all source adapters disabled (BUILD-023), the only safe trust posture is **deny all actions**. A non-zero trust score would misrepresent organizational permission to rely on the result.

### 3. Confidence ≠ permission

High confidence with weak provenance must not unlock automation. Separating layers ensures confidence can rise with evidence quality while trust remains capped until governance criteria are met.

### 4. Explicit caps are auditable

`capsApplied[]` records why trust was limited — visible in traces and future compliance surfaces.

---

## Future Enterprise Approval Model

| Phase | Capability |
|-------|------------|
| **Phase 1** (BUILD-025) | Evidence-grounded trust with action permissions |
| **Phase 2** | RBAC — role-based override of `allowRecommendation` / `allowExecution` |
| **Phase 3** | Multi-tenant trust policies per organization |
| **Phase 4** | Approval workflows — analyst sign-off elevates to `verified` |
| **Phase 5** | Security Agent veto integration — hard block on automation |
| **Phase 6** | Audit export — trust decisions to SIEM/compliance systems |

Enterprise approval will set `humanVerified: true` and elevate `trustLevel` through governed workflow — not by inflating scores silently.

---

## Human Override Compatibility

The `TrustAssessment` model is designed for Specification §13 human override:

| Override type | Trust field impact (future) |
|---------------|---------------------------|
| Human correction | `humanVerified: true`, `trustLevel: verified`, custom `reason` |
| Flag for review | Cap `pending-human-review`, deny automation |
| Rejection | Force `unverified`, all permissions false |
| Approval | Elevate level with `humanVerified: true` |

BUILD-025 sets `humanVerified: false` on all pipeline outputs. Human T4 intelligence (Specification §13.5) will supersede system trust without re-running evidence collection.

The assessor contract accepts `IntelligenceRequest` — future override context can pass via request metadata or dedicated override envelope without changing the pipeline shape.

---

## Governance Roadmap

```
BUILD-025  Trust Layer (evidence-grounded permissions)
    ↓
BUILD-026  Enable search evidence → trust score rises from evidence rules
    ↓
BUILD-027  Graph/memory caps integration
    ↓
Phase 2    RBAC + tenant policies
    ↓
Phase 3    Human approval workflow → humanVerified elevation
    ↓
Phase 4    Automation gates wired to allowAutomation in agent runtime
    ↓
Phase 5    Security Agent kill switch + compliance audit export
```

---

## Pipeline

```
Request → Evidence → Confidence → Trust → Graph → Memory → Trace → Result
```

`stageTrustAssessment` → `defaultTrustAssessor.assess(request, evidence, confidence)`

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 18 static routes |
| Empty evidence trust | `unverified`, score 0, all actions false |
| Entity Framework | Unmodified |
| UI / dashboard | Unmodified |

---

## Usage Example (not wired to UI)

```typescript
import {
  defaultTrustAssessor,
  defaultEvidenceCollector,
  defaultConfidenceAssessor,
} from "@/lib/intelligence";

const request = {
  id: "req-001",
  question: "Evaluate investment risk",
  requestedAt: new Date().toISOString(),
};

const evidence = await defaultEvidenceCollector.collect(request);
const confidence = await defaultConfidenceAssessor.assess(request, evidence);
const trust = await defaultTrustAssessor.assess(request, evidence, confidence);

// trust.trustLevel === "unverified"
// trust.trustScore === 0
// trust.allowAutomation === false
// trust.reason === "No verified evidence available."
```

---

*BUILD-025 — Trust Assessment Layer. No commits created.*
