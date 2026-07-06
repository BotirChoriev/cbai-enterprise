# CBAI Evidence Pipeline Architecture

**Version:** 1.0.0  
**Schema:** `cbai-evidence-pipeline-v1`  
**Pipeline:** `pipeline-official-evidence-v1`  
**Implementation:** None — architecture definitions only

## Purpose

The Evidence Pipeline Architecture defines one unified, permanent evidence processing pipeline that every future official connector must traverse. This sprint creates the pipeline contract, stage graph, normalization requirements, validation rules, and flow helpers — without runtime execution, API calls, fetch, HTTP, databases, or fabricated data.

## Pipeline lifecycle

| Status | Meaning |
|--------|---------|
| `planned` | Pipeline defined; runtime not started |
| `ready` | Contract validated; official pipeline active (v1) |
| `processing` | Reserved — future runtime processing |
| `verified` | Reserved — governance-verified processing |
| `deprecated` | Superseded; retained for audit |

Lifecycle stages (declarative, not executed in v1):

`defined` → `validated` → `runtime-bound` → `processing` → `verified` → `deprecated` → `archived`

## Processing stages

Every connector must traverse these stages in order:

```
Connector
  ↓
Schema Validation
  ↓
Normalization
  ↓
Evidence Record
  ↓
Evidence Registry
  ↓
Indicator Resolution
  ↓
Entity Resolution
  ↓
Mission Availability
  ↓
Report Readiness
  ↓
Workspace Availability
```

## Pipeline model

| Field | Description |
|-------|-------------|
| `pipelineId` | Permanent ID — `pipeline-official-evidence-v1` |
| `pipelineName` | Human-readable pipeline name |
| `currentStage` | Default entry stage (`connector`) |
| `supportedConnectors` | All registered official connectors |
| `supportedEntities` | `country`, `company`, `university` |
| `supportedIndicators` | Global Indicator Framework IDs |
| `supportedReports` | Reports Center type IDs |
| `supportedWorkspaces` | Intelligence workspace IDs |
| `requiredNormalizers` | Normalization contract normalizer IDs |
| `validationRules` | Eight declarative validation rules |
| `status` | Pipeline lifecycle status |
| `version` | Pipeline record schema version |

## Validation strategy

| Rule ID | Stage | Check |
|---------|-------|-------|
| `connector_registered` | Connector | Connector exists in registry |
| `schema_valid` | Schema Validation | Record conforms to connector schema |
| `required_fields_present` | Schema Validation | Required fields present |
| `evidence_source_registered` | Evidence Record | Source in Evidence Infrastructure |
| `indicator_mapped` | Indicator Resolution | Indicator in Global Indicator Framework |
| `country_exists` | Entity Resolution | Country in local/Global Registry |
| `mission_compatibility` | Mission Availability | Mission requirements satisfied |
| `workspace_compatibility` | Workspace Availability | Workspace ID valid |

`evaluatePipelineCompatibility()` evaluates a context snapshot against these rules without execution.

## Normalization strategy

Six normalization contracts — architecture only, no implementation:

| Kind | Normalizer ID | Standard |
|------|---------------|----------|
| Country Codes | `norm-country-iso3166` | ISO 3166-1 |
| Languages | `norm-language-iso639` | ISO 639-1 |
| Currencies | `norm-currency-iso4217` | ISO 4217 |
| Units | `norm-unit-si` | SI Brochure |
| Dates | `norm-date-iso8601` | ISO 8601 |
| Identifiers | `norm-registry-entity-id` | CBAI Global Registry |

Applied at the Normalization stage per stage graph definition.

## Future runtime integration

When live processing is authorized:

1. Runtime binds stage executors outside this architecture layer
2. Connector adapter output enters at `connector` stage
3. Validation and normalization run sequentially per stage graph
4. Evidence records register in Evidence Infrastructure
5. Global Registry entity IDs attach at entity resolution
6. No scores, rankings, or synthetic values at any stage

**This sprint implements step 0 only** (architecture and validation).

## Integration

### Connector integration

All connectors from `lib/connectors/` are registered on `pipeline-official-evidence-v1`. Use `isConnectorOnOfficialPipeline(connectorId)` to verify.

### Mission integration

Mission Availability stage evaluates `MissionDefinition.requiredIndicators` and `requiredSources` via `evaluatePipelineCompatibility()`.

### Report integration

Report Readiness stage references `REPORT_TYPE_IDS` from Global Registry. Reports Center consumes resolved evidence when implemented.

### Workspace integration

Workspace Availability stage references `WORKSPACE_IDS`. Intelligence workspaces (government, investor, citizen) receive context when evidence resolves.

### Platform Context

Future runtime scopes pipeline queries by Platform Context URL parameters (`country`, `company`, `university`).

## Public API

```typescript
import {
  getOfficialEvidencePipeline,
  tracePipelineFlow,
  evaluatePipelineCompatibility,
  validateEvidencePipelineRegistry,
  getEvidencePipelineRegistry,
} from "@/lib/evidence-pipeline";

const trace = tracePipelineFlow("connector-world-bank");
const registry = getEvidencePipelineRegistry();
const report = validateEvidencePipelineRegistry(registry);
```

## No-live-API guarantee

- No `fetch`, HTTP clients, or network APIs
- No database connections
- No runtime side effects
- No sample evidence records or fabricated values
- Flow helpers describe movement only — they do not execute

## Verification

```bash
npm run lint
npm run build
```

## Compliance statement

- CBAI Constitution v1.0 — no fabricated data, honest evidence labels
- Official Source Priority — evidence source registration required
- Methodology Before Metrics — validation before display
- `lib/intelligence/`, runtime, agents, reasoning — not modified
