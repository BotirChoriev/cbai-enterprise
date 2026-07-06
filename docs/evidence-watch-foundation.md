# CBAI Evidence Watch Foundation

**Version:** 1.0.0  
**Status:** Foundation layer — official evidence change transparency only

---

## Purpose

The Evidence Watch Foundation provides the constitutional architecture for **tracking official evidence availability changes**. Users can understand what changed, when it changed (registry snapshot), which official source changed, and which entities, indicators, reports, missions, and workspaces are affected — **without interpreting the meaning of the change**.

CBAI Evidence Watch:

- Derives every watch record from existing registries (Evidence Infrastructure, Connector Architecture, Global Registry, Indicator Framework, Mission Catalog, Reports Center)
- Describes factual posture changes only — not predictions or notifications
- Discloses registry snapshot timestamps honestly — not live monitoring
- Requires human review for all watch information

CBAI Evidence Watch never:

- Generates warnings, alerts, severity levels, or recommendations
- Draws political or economic conclusions
- Monitors user activity
- Delivers notifications
- Invent fake events or fabricated timestamps

---

## Architecture

```
lib/evidence-watch/
├── watch-types.ts        # Core type system and watch model
├── watch-version.ts      # Version manifest and registry snapshot epoch
├── watch-builder.ts      # Watch record builder from registries
├── watch-query.ts        # Query API and status helpers
├── watch-summary.ts      # Factual summary sections
├── watch-validation.ts   # Constitutional validation
└── index.ts              # Public API

components/evidence-watch/
├── EvidenceWatchPanel.tsx              # Main selector + detail view
├── EvidenceWatchSummary.tsx            # Count summary and record list
├── EvidenceWatchAffectedEntities.tsx   # Affected entity IDs
├── EvidenceWatchMethodology.tsx        # Methodology reference
├── EvidenceWatchLimitations.tsx        # Constitutional limits
├── ReportsEvidenceWatchSection.tsx     # Reports Center entry point
└── SearchEvidenceWatchSection.tsx      # Search Intelligence entry point
```

### Integration layers

| Layer | Usage |
|-------|-------|
| Evidence Infrastructure | Source connection and verification posture |
| Connector Architecture | Connector status changes |
| Global Registry | Affected entity resolution |
| Indicator Framework | Affected indicator and methodology version |
| Mission Catalog | Affected missions and workspaces |
| Reports Center | Affected report types |
| Evidence Explorer | Primary Evidence Watch panel |
| Search Intelligence | Summary watch section |
| Reports Center | Full Evidence Watch panel |

---

## Watch Model

Each `EvidenceWatchRecord` contains:

| Field | Description |
|-------|-------------|
| `watchId` | Permanent ID — format `watch-{changeType}-{anchorId}` |
| `sourceId` | Evidence Infrastructure source reference |
| `connectorId` | Connector Architecture reference (nullable) |
| `entityIds` | Global Registry entities affected |
| `indicatorIds` | Global Indicator Framework indicators affected |
| `changeType` | Supported change type enum |
| `changeTimestamp` | Registry snapshot timestamp (static, not live) |
| `affectedReports` | Report type IDs consuming affected scope |
| `affectedMissions` | Mission IDs requiring affected indicators |
| `affectedWorkspaces` | Workspace IDs from affected missions |
| `methodologyReference` | Standard reference and description |
| `limitations` | Constitutional disclosure |
| `humanReviewRequired` | Always `true` |

---

## Supported Change Types

| Change Type | Derived From |
|-------------|--------------|
| `new_source_connected` | Source `connectionStatus === "connected"` |
| `new_dataset_available` | Connected source with declared indicator mappings |
| `dataset_updated` | Connected source with declared update frequency |
| `methodology_updated` | Global Indicator Framework version registration |
| `connector_verified` | Connector `status === "connected"` |
| `connector_deprecated` | Source or connector deprecated status |
| `verification_status_changed` | Source verification posture `verified` |

Change descriptions state registry facts only — no interpretation of impact.

---

## Limitations

- **Registry snapshot only** — `changeTimestamp` uses `EVIDENCE_WATCH_REGISTRY_SNAPSHOT_AT`, not live detection
- **No notification delivery** — architecture definitions only
- **No user activity monitoring** — entity lists reflect indicator mappings, not user behavior
- **No severity or urgency** — change types are categorical, not ranked
- **Human review required** — always `true`

---

## Future Notification Integration

| Capability | Status |
|------------|--------|
| Live connector diff ingestion | Reserved in migration manifest v1.1.0 |
| Notification routing | Out of scope — not implemented |
| Email / push delivery | Forbidden on this layer |
| Runtime monitoring | Out of scope — `runtime/`, `agents/`, `reasoning/`, `lib/intelligence/` not modified |

Future notification integration must remain constitution-compliant: describe changes factually, require human review, no automated recommendations.

---

## Verification

Constitutional validation (`watch-validation.ts`) enforces:

- Valid watch ID format
- `humanReviewRequired` always `true`
- Known source and connector references
- `changeTimestamp` matches registry snapshot constant
- Prohibited language scan (warnings, alerts, severity, risk, recommendations, predictions, fake percentages)

### Manual verification checklist

- [ ] Evidence Explorer — Evidence Watch panel with record selector and detail
- [ ] Reports Center — Evidence Watch section present
- [ ] Search — Evidence Watch summary section present
- [ ] No alerts, severity, or recommendations in UI or summaries
- [ ] All watch data traceable to registries

---

## Compliance

Aligned with:

- CBAI Constitution v1.0 — Evidence First, Transparency, No Fake Data
- CBAI Standards v1.0 — Registry as source of truth
- Governance Framework v1.0 — Human review required

**Does not modify:** `runtime/`, `agents/`, `reasoning/`, `lib/intelligence/`
