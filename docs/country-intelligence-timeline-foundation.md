# CBAI Country Intelligence Timeline Foundation

**Version:** 1.0.0  
**Status:** Foundation layer — evidence readiness structure only

---

## Purpose

The Country Intelligence Timeline Foundation defines the **structural schema** for future country timelines. It displays evidence readiness across year slots — not historical events, political interpretation, or generated narratives.

CBAI Timelines:

- Map **year-level evidence posture** (verified, missing, future availability)
- Show **official source coverage** and **indicator methodology**
- Disclose **limitations** and require **human review**
- Display **"Evidence not connected."** when no time-series evidence exists

CBAI Timelines never:

- Generate historical, political, economic, or news events
- Describe wars, elections, crises, or government actions
- Produce AI summaries or fake timeline entries
- Imply conclusions or recommendations from year slots

---

## Architecture

```
lib/timeline/
├── timeline-types.ts       # Core type system and timeline model
├── timeline-version.ts     # Version manifest and lifecycle stages
├── timeline-readiness.ts   # Readiness assessment and year slot builder
├── timeline-builder.ts     # Country timeline builder from registry layers
├── timeline-summary.ts     # Factual summary sections
├── timeline-validation.ts  # Constitutional validation (no fake history)
├── timeline-query.ts       # Query API for country timelines
└── index.ts                # Public API

components/timeline/
├── TimelineReadinessPanel.tsx   # Readiness status and empty state
├── TimelineCoverage.tsx         # Year slot grid
├── TimelineEvidenceGap.tsx      # Missing and future years
├── TimelineSources.tsx          # Official source coverage
├── TimelineMethodology.tsx      # Methodology references
└── TimelineHumanReview.tsx      # Human review notice and limitations
```

### Integration layers

| Layer | Usage |
|-------|-------|
| Global Registry | Resolves `entityId` and validates registry links |
| Countries 2.0 | Country catalog input for timeline build |
| Indicator Framework | Methodology references and indicator coverage |
| Evidence Infrastructure | Official source connection status |
| Evidence Pipeline | Future — time-series ingestion gates |
| Decision Intelligence | Future — decision context binding per year |

---

## Timeline Model

Each `TimelineRecord` contains:

| Field | Description |
|-------|-------------|
| `timelineId` | Permanent ID — format `timeline-country-{slug}` |
| `entityId` | Global Registry entity reference |
| `entityType` | `country` (company/university reserved) |
| `supportedYears` | Structural year slots (default 10-year window) |
| `availableEvidenceYears` | Years with connected time-series evidence |
| `missingEvidenceYears` | Years without connected evidence |
| `futureEvidenceYears` | Missing years at or after reference year |
| `yearEntries` | Per-year status and honest label |
| `officialSources` | Source registry entries with year scope |
| `indicatorCoverage` | Per-indicator year availability |
| `methodologyReferences` | Indicator methodology disclosure |
| `limitations` | Constitutional constraints |
| `readinessStatus` | Evidence posture state |
| `humanReviewRequired` | Always `true` |
| `version` | Record schema version |

---

## Evidence Readiness

Readiness states describe **time-series evidence posture**:

| State | Meaning |
|-------|---------|
| `planned` | Structure defined, no time-series evidence connected |
| `partial` | Some indicator coverage, year-level gaps remain |
| `ready_for_evidence` | Year slots mapped, awaiting official source connection |
| `verified` | All year slots have connected and validated evidence |

Year entry statuses:

| Status | Label pattern |
|--------|---------------|
| `verified` | Verified evidence slot — time-series connected |
| `missing` | Evidence not connected. |
| `future` | Future evidence availability — source not yet connected |
| `partial` | Reserved for partial year coverage |

---

## Limitations

Standard limitations on every timeline:

1. Timeline displays evidence readiness only — not events or political interpretation
2. No wars, elections, crises, news, or government actions
3. Year slots are structural placeholders until official sources connect
4. Human review required before decision use
5. Static export — no live time-series ingestion

When no evidence exists, UI displays: **Evidence not connected.**

---

## UI Integration

Integrated into **Countries Intelligence 2.0** via `CountryTimelineSection`:

- Position: after **Evidence Coverage**, before **Methodology**
- Components: all six timeline components composed in section wrapper
- Empty state: dashed border with honest "Evidence not connected." message

---

## Validation

`validateTimelineRecord(record)` checks:

- Valid timeline ID format
- Entity exists in Global Registry
- No broken registry relationship links
- `humanReviewRequired` must be true
- Year entry labels contain no event-style or prohibited language

Prohibited patterns include: elections, wars, crises, news, recommendations, historical event claims.

---

## Future Official Integration

Reserved for future releases:

- Time-series evidence binding from World Bank, UN, IMF connectors
- Per-year indicator values from verified official publications
- Decision Intelligence context binding per year slot
- Export to Reports Center timeline briefs
- Company and university timeline builders

Migration manifest: `TIMELINE_MIGRATION_MANIFEST` in `timeline-version.ts`.

---

## Verification

```bash
npm run lint   # Expected: pass
npm run build  # Expected: pass — 21 static routes
```

Public API:

```typescript
import {
  getCountryTimelineModel,
  buildTimelineSummary,
  validateTimelineRecord,
} from "@/lib/timeline";
```

No runtime, HTTP, AI, or fake history in this foundation release.
