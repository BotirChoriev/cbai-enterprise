# CBAI Official Evidence Connector Architecture

**Version:** 1.0.0  
**Schema:** `cbai-official-evidence-connector-v1`  
**Implementation:** None — architecture definitions only

## Purpose

The Official Evidence Connector Architecture prepares CBAI for future integrations with official evidence publishers. This layer defines permanent connector contracts without HTTP clients, fetch calls, credentials, tokens, or scraping.

Connectors bridge three existing platform foundations:

- **Evidence Infrastructure** — source registry and adapter contracts
- **Global Registry** — entity identity and cross-reference resolution
- **Mission Catalog** — future evidence requirements per mission persona

## Architecture

```
Evidence Infrastructure (source IDs, slugs)
        ↓
connector-builder.ts → ConnectorDefinition[]
        ↓
connector-registry.ts (cached singleton)
        ↓
connector-query.ts / connector-validation.ts
        ↓
Future: Mission Engine · Platform Context · Evidence Explorer
```

## Connector model

Every connector supports:

| Field | Description |
|-------|-------------|
| `connectorId` | Permanent ID — `connector-{slug}` |
| `connectorName` | Human-readable publisher name |
| `organization` | Publishing organization |
| `officialWebsite` | Official portal URL (reference only) |
| `coverage` | Summary, supported countries, supported languages |
| `supportedEntities` | Entity types served |
| `supportedIndicators` | Global Indicator Framework indicator IDs |
| `authentication` | Declarative auth kind — no secrets |
| `rateLimits` | Declarative limits for future runtime |
| `updateFrequency` | Publication cadence |
| `license` | Data license terms |
| `capabilities` | Data surfaces exposed when implemented |
| `status` | Lifecycle status |
| `version` | Connector record schema version |
| `evidenceSourceId` | Evidence Infrastructure source binding |
| `registryEntityTypes` | Global Registry types enriched |

### Connector ID format (stable, never random)

| Connector | ID |
|-----------|-----|
| World Bank | `connector-world-bank` |
| United Nations | `connector-united-nations` |
| IMF | `connector-imf` |
| WHO | `connector-who` |
| UNESCO | `connector-unesco` |
| OECD | `connector-oecd` |
| Open Budget | `connector-open-budget` |
| National Statistics | `connector-national-statistics` |
| National Procurement | `connector-national-procurement` |
| National Open Data | `connector-national-open-data` |
| CBAI Local Registry | `connector-cbai-local-registry` |

## Connector status lifecycle

| Status | Meaning |
|--------|---------|
| `planned` | Defined; implementation not started |
| `ready` | Contract validated; awaiting credential provisioning |
| `connected` | Active — CBAI Local Registry only in v1 |
| `maintenance` | Temporarily unavailable |
| `deprecated` | Superseded; retained for audit |

Lifecycle stages (declarative, not executed in v1):

`defined` → `validated` → `readiness-checked` → `credential-provisioned` → `implementable` → `active` → `maintenance` → `deprecated` → `archived`

## Capabilities

| Capability | Description |
|------------|-------------|
| `registry` | Entity registry lookups |
| `indicators` | Indicator Framework value slots |
| `evidence` | Verified evidence records (required) |
| `datasets` | Structured official datasets |
| `reports` | Official publications |
| `timeline` | Time-series and revision tracking |

## Validation

`validateConnectorRegistry()` checks:

- Duplicate connector IDs
- Invalid ID format
- Unknown indicators (resolved from Global Indicator Framework)
- Unknown entity types
- Broken capabilities (unknown or missing required `evidence`)
- Broken coverage (empty summary or country scope)
- Unknown evidence source references
- Invalid authentication declarations

Run validation:

```typescript
import { getConnectorRegistry, validateConnectorRegistry } from "@/lib/connectors";

const report = validateConnectorRegistry(getConnectorRegistry());
```

## Security model

1. **No secrets in code** — authentication kinds declare vault key references only (`vaultKeyRef`), never values.
2. **No network in v1** — connector registry is built synchronously from local catalogs.
3. **Credential provisioning gate** — connectors must reach `ready` status before future vault binding.
4. **Constitution compliance** — connectors declare indicators and evidence slots; they do not emit scores, rankings, or fabricated data.
5. **Audit trail** — deprecated connectors retained with version metadata for migration history.

## Versioning

| Artifact | Version |
|----------|---------|
| Connector registry | `1.0.0` |
| Connector record schema | `1.0.0` |
| Schema identifier | `cbai-official-evidence-connector-v1` |

Future migrations declared in `CONNECTOR_MIGRATION_MANIFEST`:

- **1.0.0 → 1.1.0** — Secure credential vault binding and health probes
- **1.1.0 → 2.0.0** — Live API client interfaces and adapter pipelines (breaking)

## Integration with platform layers

### Global Registry

Connectors declare `registryEntityTypes` (`country`, `company`, `university`) to specify which registry records they may enrich. Future implementation resolves entity IDs from the Global Registry Layer before issuing evidence requests.

### Evidence Infrastructure

Each connector binds to an Evidence Infrastructure source via `evidenceSourceId` and `evidenceSourceSlug`. Adapters and normalizers in `lib/evidence-infrastructure/` transform external structures into the CBAI Evidence Model when implemented.

The existing `lib/evidence-infrastructure/connectors/catalog.ts` provides lightweight contract stubs; this architecture layer is the permanent, enterprise-grade connector registry.

### Mission Catalog

Missions declare `requiredSources` derived from indicator requirements. Future Mission Engine wiring will attach `missionIds` to connectors and validate that mission evidence requirements have matching connector definitions before execution.

### Platform Context

Platform Context URL parameters (`country`, `company`, `university`) will scope connector queries in future implementation — selecting which connectors are relevant for the active entity context.

### Indicator Framework

Connector `supportedIndicators` resolve to full indicator IDs (`ind-*`) from indicator slugs at build time. Validation rejects unknown indicator references.

## Future implementation

When live integrations are authorized:

1. Provision credentials in secure vault (never in repository)
2. Transition connector status from `planned` → `ready` → `connected`
3. Implement HTTP client in isolated runtime module (outside this architecture layer)
4. Route responses through Evidence Infrastructure adapters and normalizers
5. Attach evidence records to Global Registry entity IDs
6. Surface connection status in Evidence Explorer with honest labels

**This sprint implements steps 0–1 only** (architecture and validation).

## Public API

```typescript
import {
  getConnectorRegistry,
  getConnectorRegistryIndex,
  findConnectorById,
  findConnectorsByEvidenceSourceId,
  validateConnectorRegistry,
} from "@/lib/connectors";
```

## Compliance statement

- No HTTP, fetch, API clients, credentials, tokens, or scraping
- No modification to `lib/intelligence/`, `runtime/`, `agents/`, or reasoning internals
- Static export and Cloudflare compatibility preserved
- CBAI Local Registry is the only connector with `connected` status

## Verification

```bash
npm run lint
npm run build
```
