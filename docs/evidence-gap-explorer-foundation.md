# CBAI Evidence Gap Explorer Foundation

**Version:** 1.0.0  
**Status:** Foundation layer — transparency for missing evidence only

---

## Purpose

The Evidence Gap Explorer Foundation helps users understand **what evidence exists**, **what is missing**, **why it is missing**, and **what official source or connector is expected** — without analytics, AI, predictions, recommendations, or fake percentages.

CBAI Evidence Gaps:

- Derive every gap from existing registries (Indicator Framework, Evidence Infrastructure, Connector Architecture, Global Registry)
- Report honest connection and verification posture per indicator
- Disclose methodology requirements before any evaluative use
- Require human review for all gap information

CBAI Evidence Gaps never:

- Invent missing indicators or blocked evidence
- Blame governments or imply hidden data
- Use speculative language (likely, probably, estimated)
- Display fake percentages or analytics scores
- Generate recommendations or predictions

---

## Architecture

```
lib/evidence-gap/
├── gap-types.ts        # Core type system and gap model
├── gap-version.ts      # Version manifest
├── gap-builder.ts      # Gap profile builder from registries
├── gap-query.ts        # Query API and status helpers
├── gap-summary.ts      # Factual summary sections
├── gap-validation.ts   # Constitutional validation
└── index.ts            # Public API

components/evidence-gap/
├── EvidenceGapPanel.tsx       # Main section wrapper
├── EvidenceGapCard.tsx        # Single indicator gap card
├── EvidenceGapSummary.tsx     # Count summary (no percentages)
├── EvidenceGapSources.tsx     # Official source coverage
└── EvidenceGapMethodology.tsx # Methodology references
```

### Integration layers

| Layer | Usage |
|-------|-------|
| Global Indicator Framework | Applicable indicators and methodology |
| Evidence Infrastructure | Official source connection and verification status |
| Connector Architecture | Expected connector per source |
| Global Registry | Entity ID resolution |
| Evidence Pipeline | Future — pipeline stage gates |
| Decision Intelligence | Future — decision context binding |

---

## Gap Model

Each `EvidenceGapRecord` contains:

| Field | Description |
|-------|-------------|
| `gapId` | Permanent ID — format `gap-{entityType}-{slug}-{indicatorSlug}` |
| `entityId` | Global Registry entity reference |
| `entityType` | `country`, `company`, or `university` |
| `indicatorId` | Global Indicator Framework ID |
| `expectedSource` | Official source name from infrastructure registry |
| `expectedConnector` | Connector name from connector registry |
| `currentStatus` | `available`, `planned`, `missing`, or `blocked` |
| `missingReason` | Constitutional missing reason (null when available) |
| `requiredEvidence` | Methodology required evidence text |
| `requiredMethodology` | Why the indicator exists |
| `verificationBlocker` | What prevents verification today |
| `nextPossibleStep` | Honest next integration step |
| `humanReviewRequired` | Always `true` |

---

## Gap Categories

### Status

| Status | Meaning |
|--------|---------|
| `available` | Indicator and source connected |
| `planned` | Indicator or source marked planned |
| `missing` | Evidence not connected |
| `blocked` | Verification failed or source deprecated |

### Missing reasons

| Reason | When used |
|--------|-----------|
| Evidence source not connected | Source not connected to platform |
| Indicator not mapped | No official source maps to indicator |
| Methodology pending | Methodology documentation incomplete |
| Official source unavailable | Source deprecated in infrastructure |
| Verification pending | Source verification not complete |
| Connector planned | Connector architecture defined, not implemented |

---

## Transparency Rules

Approved wording:

- Evidence not connected
- Verification pending
- Official source not yet connected
- Methodology not yet available
- Connector planned

Forbidden wording:

- missing because government failed
- missing because data hidden
- likely / probably / estimated
- Fake percentages or analytics scores
- Recommendations or predictions

Validation scans all gap records and summaries for prohibited patterns.

---

## UI Integration

Integrated into **Countries 2.0**, **Companies 2.0**, and **Universities 2.0**:

- Position: after **Evidence Coverage**, before **Pipeline Readiness**
- Components: `EvidenceGapPanel` with summary, gap cards, sources, and methodology
- Counts only — no percentage bars or fabricated metrics

---

## Future Official Integration

Reserved for future releases:

- Live connector binding updates gap status automatically
- Per-entity source applicability filtering
- Decision Intelligence context linking per gap
- Evidence Pipeline stage compatibility gates
- Export to Reports Center gap briefs

Migration manifest: `EVIDENCE_GAP_MIGRATION_MANIFEST` in `gap-version.ts`.

---

## Verification

```bash
npm run lint   # Expected: pass
npm run build  # Expected: pass — 21 static routes
```

Public API:

```typescript
import {
  getCountryEvidenceGaps,
  buildEvidenceGapSummary,
  validateEvidenceGapProfile,
} from "@/lib/evidence-gap";
```

No runtime, HTTP, AI, or fake data in this foundation release.
