# CBAI Evidence Comparison Foundation

**Version:** 1.0.0  
**Status:** Foundation layer — evidence readiness comparison only

---

## Purpose

The Evidence Comparison Foundation lets users compare **evidence readiness between two entities of the same type** — country vs country, company vs company, or university vs university. It is transparency infrastructure, not scoring, ranking, investment advice, or political judgment.

CBAI Evidence Comparison:

- Derives all data from Evidence Gap Explorer profiles and Global Registry
- Compares shared indicators, available evidence, gaps, and official sources
- Uses constitutional comparison notes only
- Requires human review for all comparison output

CBAI Evidence Comparison never:

- Declares a winner, better entity, or rank
- Produces scores or percentages
- Offers recommendations or policy advice
- Compares different entity types
- Suggests fake comparison targets

---

## Architecture

```
lib/evidence-comparison/
├── comparison-types.ts       # Core type system and comparison model
├── comparison-version.ts     # Version manifest
├── comparison-builder.ts     # Comparison builder from gap profiles
├── comparison-query.ts       # Query API and status helpers
├── comparison-summary.ts     # Factual summary sections
├── comparison-validation.ts  # Constitutional validation
└── index.ts                  # Public API

components/evidence-comparison/
├── EvidenceComparisonPanel.tsx        # Main section with selector
├── EvidenceComparisonSelector.tsx       # Global Registry entity picker
├── EvidenceComparisonSummary.tsx      # Count summary
├── EvidenceComparisonMatrix.tsx         # Indicator comparison table
├── EvidenceComparisonGaps.tsx           # Gap difference breakdown
└── EvidenceComparisonLimitations.tsx    # Limitations and human review
```

### Integration layers

| Layer | Usage |
|-------|-------|
| Global Registry | Entity candidates and ID resolution |
| Evidence Gap Explorer | Per-entity gap profiles |
| Indicator Framework | Shared applicable indicators |
| Evidence Infrastructure | Source connection status |
| Connector Architecture | Expected connector references |
| Evidence Pipeline | Future — pipeline compatibility gates |

---

## Comparison Model

Each `EvidenceComparisonRecord` contains:

| Field | Description |
|-------|-------------|
| `comparisonId` | Permanent ID — `comparison-{type}-{left}-vs-{right}` |
| `leftEntityId` / `rightEntityId` | Global Registry entity references |
| `entityType` | `country`, `company`, or `university` |
| `sharedIndicators` | Indicator IDs applicable to both |
| `leftAvailableEvidence` / `rightAvailableEvidence` | Connected indicator IDs |
| `leftEvidenceGaps` / `rightEvidenceGaps` | Non-available indicator IDs |
| `sharedSources` / `missingSources` | Official source references |
| `indicatorRows` | Per-indicator status and comparison note |
| `methodologyReferences` | Methodology disclosure |
| `limitations` | Constitutional constraints |
| `readinessStatus` | Comparison readiness state |
| `humanReviewRequired` | Always `true` |

---

## Readiness States

| State | Meaning |
|-------|---------|
| `comparable` | Shared indicators mapped, comparison structurally valid |
| `partial` | Evidence connection posture differs between entities |
| `insufficient_evidence` | No connected evidence on either entity |
| `unsupported` | Type mismatch or fewer than two registry entities |

---

## Allowed Language

Comparison notes use only:

- more evidence connected on left
- more evidence connected on right
- same evidence status
- evidence gap differs
- source not connected
- methodology required

---

## Forbidden Language

Validation blocks:

- winner / better / worse / rank / score
- recommendation / invest here / policy advice
- likely / probably / estimated
- Fake percentages

---

## Limitations

- Same entity type only — cross-type comparison returns unsupported
- Entity selection from Global Registry only — no fake suggestions
- Fewer than two entities of a type shows comparison unavailable
- Per-entity evidence binding may expand in future — framework-level status today
- Human review mandatory before decision use

---

## UI Integration

Integrated into **Countries 2.0**, **Companies 2.0**, and **Universities 2.0**:

- Position: after **Evidence Gaps**, before **Pipeline Readiness**
- Interactive entity selector for comparison target
- Matrix table with constitutional comparison notes

---

## Future Expansion

Reserved for future releases:

- Per-entity live evidence binding (asymmetric comparisons)
- Cross-entity-type scoping with explicit rules
- Decision Intelligence context linking
- Export to Reports Center comparison briefs
- URL-persisted comparison selection via Platform Context

Migration manifest: `COMPARISON_MIGRATION_MANIFEST` in `comparison-version.ts`.

---

## Verification

```bash
npm run lint   # Expected: pass
npm run build  # Expected: pass — 21 static routes
```

Public API:

```typescript
import {
  getCountryEvidenceComparison,
  buildEvidenceComparison,
  validateEvidenceComparison,
} from "@/lib/evidence-comparison";
```

No runtime, HTTP, AI, or fake data in this foundation release.
