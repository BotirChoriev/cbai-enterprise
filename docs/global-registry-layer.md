# CBAI Global Registry Layer

**Version:** 1.0.0  
**Schema:** `cbai-global-registry-v1`

## Purpose

The Global Registry Layer is CBAI's permanent identity foundation. It replaces string-based cross-entity relationships with stable platform identifiers while preserving backward-compatible legacy registry IDs for existing modules.

This layer does **not** add intelligence, UI, or external API integration.

## Architecture

```
Source catalogs (Countries, Companies, Universities)
        ↓
registry-builder.ts → unified RegistryEntityRecord[]
        ↓
entity-registry.ts (cached singleton)
        ↓
entity-index.ts (byId, bySlug, byType, byCountryCode)
        ↓
registry-query.ts / entity-links.ts / registry-validation.ts
```

Cross-module consumers (Platform Context, Knowledge Graph, Mission Engine, API) read permanent IDs from this layer without duplicating identity state.

## Identity model

Every materialized entity supports:

| Field | Description |
|-------|-------------|
| `entityId` | Permanent ID — `{type}-{slug}` |
| `entityType` | `country`, `company`, or `university` |
| `slug` | Stable slug without prefix |
| `displayName` | Human-readable name from local registry |
| `countryCode` | ISO-style code when resolvable |
| `relatedEntityIds` | Permanent IDs — never display names |
| `indicatorIds` | Global Indicator Framework IDs |
| `evidenceIds` | Connected evidence anchors (`evidence-{indicator-slug}`) |
| `sourceIds` | Evidence Infrastructure source IDs |
| `workspaceIds` | Intelligence workspace IDs |
| `reportIds` | Reports Center type IDs |
| `missionIds` | Reserved for Mission Engine (empty in v1) |
| `status` | `active`, `planned`, or `deprecated` |
| `version` | Entity record schema version |
| `legacyRegistryId` | Original module catalog ID |

### Entity ID format (stable, never random)

| Example | Legacy ID |
|---------|-----------|
| `country-usa` | `usa` |
| `country-jpn` | `japan` |
| `company-apple` | `apple` |
| `university-stanford` | `stanford` |

Country slugs use canonical mappings (`japan` → `jpn`) for ISO-aligned stability.

## Relationship model

Relationships are derived from local catalogs using name normalization — the same derivation rules as entity adapters, but outputs are **permanent entity IDs**:

- Country → linked companies and universities in same country
- Company → headquarters country + universities in same country
- University → country + companies in same country

`entity-links.ts` provides outbound resolution; `getEntityLinkGraph()` adds inbound edges.

## Registry lifecycle

1. **Build** — `buildGlobalRegistry()` merges source catalogs at startup
2. **Index** — `buildRegistryIndex()` creates lookup maps
3. **Validate** — `validateGlobalRegistry()` checks duplicates and broken references
4. **Query** — modules use `findEntityById`, `findEntityByLegacyId`, etc.
5. **Migrate** — `REGISTRY_MIGRATION_MANIFEST` declares future schema evolution (not executed in v1)

## Versioning

| Constant | Value |
|----------|-------|
| `REGISTRY_VERSION` | `1.0.0` |
| `ENTITY_RECORD_VERSION` | `1.0.0` |

`rebuildGlobalRegistry()` supports cache invalidation for tests and future migrations.

## Validation

`validateGlobalRegistry()` checks:

- Duplicate entity IDs and slugs
- Invalid ID format
- Unknown entity types
- Missing related entity references
- Broken relationship warnings for unlinked entities

## Future integrations

### Mission Engine readiness

- `missionIds` field reserved on every record
- Future `mission` entity type declared in type system
- Permanent IDs stable across mission assignment

### API readiness

- `EntityReference` lightweight export type
- Query helpers: by ID, slug, type, country code
- Registry version metadata for API headers

### Platform Context

- `legacyIdToEntityId()` bridges existing URL params
- `entityIdToLegacyRegistryId()` for backward compatibility

### Knowledge Graph

- Graph edges should reference `entityId` instead of display names (future wiring)

## Constitutional compliance

- Local registry facts only — no fabricated relationships
- No scores, rankings, or external API data
- Empty partner/competitor/mission lists until real catalogs connect
- Validation enforces referential integrity

## Module layout

| File | Role |
|------|------|
| `types.ts` | Core type system |
| `entity-id.ts` | ID construction and parsing |
| `entity-registry.ts` | Cached singleton registry |
| `registry-builder.ts` | Unified registry builder |
| `entity-index.ts` | Lookup indexes |
| `entity-links.ts` | Relationship resolution |
| `entity-reference.ts` | Lightweight references |
| `registry-query.ts` | Query helpers |
| `registry-validation.ts` | Integrity validation |
| `registry-version.ts` | Version and migration manifest |
| `index.ts` | Public API |
