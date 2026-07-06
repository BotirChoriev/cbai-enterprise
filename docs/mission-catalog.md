# CBAI Mission Catalog

**Version:** 1.0.0  
**Schema:** `cbai-mission-catalog-v1`

## Purpose

The Mission Catalog is the first layer of the CBAI Mission Engine. It defines reusable, persona-scoped missions that declare evidence, indicator, source, workspace, and report requirements — without executing anything.

This sprint is **architecture only**: no UI, no pages, no runtime execution.

## Architecture

```
mission-catalog.ts (declarative entries)
        ↓
mission-builder.ts (resolve indicators → evidence + sources)
        ↓
mission-registry.ts (cached singleton)
        ↓
mission-query.ts / mission-validation.ts
```

Integrations:

| Layer | Role |
|-------|------|
| Global Registry | Entity types missions scope (`country`, `company`, `university`) |
| Indicator Framework | `requiredIndicators` validation and resolution |
| Evidence Infrastructure | `requiredSources` from official source catalog |
| Platform Context | Workspace IDs align with intelligence workspaces |
| Reports Center | `requiredReports` reference report type IDs |

## Mission structure

| Field | Description |
|-------|-------------|
| `missionId` | Permanent ID — `mission-{persona}-{slug}` |
| `missionName` | Human-readable mission title |
| `persona` | Target audience persona |
| `description` | Constitutional scope statement |
| `supportedEntities` | Entity types the mission applies to |
| `requiredIndicators` | Global Indicator Framework IDs |
| `requiredEvidence` | Evidence anchors — `evidence-{indicator-slug}` |
| `requiredSources` | Evidence Infrastructure source IDs |
| `requiredWorkspaces` | Intelligence workspace IDs |
| `requiredReports` | Reports Center type IDs |
| `status` | `defined` in v1 (catalog only) |
| `version` | Mission record schema version |

## Personas

| Persona | Initial missions |
|---------|------------------|
| Citizen | 4 — public services, healthcare, education, budget |
| Investor | 4 — evaluate country, compare markets, companies, procurement |
| Government | 4 — infrastructure, budget, procurement, digital government |
| Researcher | 3 — research country, industry, university |
| Academic | 3 — methodology, indicator, evidence review |
| Enterprise | 3 — country risk, supply chain, partner discovery |
| Student | Reserved — persona ID valid; missions TBD |

**Total:** 21 defined missions

## Mission lifecycle

Catalog v1 supports declarative lifecycle stages only:

1. **defined** — registered in mission catalog (current state)
2. **validated** — passes `validateMissionCatalog()`
3. **readiness-checked** — future: evidence/source connection gates
4. **executable** — future: Mission Engine permits start
5. **running** — future: active mission instance
6. **completed** — future: auditable completion record
7. **archived** — future: retired mission definition

No stage beyond **defined** is executed in this release.

## Future Mission Engine

The Mission Engine (future) will:

1. Load mission definition from catalog by `missionId`
2. Bind to Platform Context entity selection (Global Registry `entityId`)
3. Verify `requiredIndicators`, `requiredSources`, and `requiredEvidence` readiness
4. Produce scoped output through Reports Center — not fabricated scores
5. Record audit trail with governance validation

`missionIds` on Global Registry entity records will link entities to applicable missions.

## Mission execution flow (future)

```
User selects mission + entity context
        ↓
Mission Engine loads MissionDefinition
        ↓
Readiness check (indicators, sources, evidence connected?)
        ↓
If insufficient → honest label (Evidence Source Not Connected)
        ↓
If ready → generate scoped report artifact (future)
        ↓
Audit log + governance validation
```

## Validation

`validateMissionCatalog()` checks:

- Duplicate mission IDs
- Invalid ID format
- Unknown entity types
- Unknown indicator IDs
- Unknown evidence anchor format
- Unknown source IDs
- Broken workspace references
- Unknown report IDs

## Constitutional compliance

- No mission execution or fake outcomes
- No investment advice, political recommendations, or sentiment scoring
- Requirements trace to real Indicator Framework and Evidence Infrastructure IDs
- Enterprise missions scope due diligence — no fabricated risk scores

## Module layout

| File | Role |
|------|------|
| `mission-types.ts` | Core type system |
| `mission-catalog.ts` | 21 declarative mission entries |
| `mission-builder.ts` | Definition materialization |
| `mission-registry.ts` | Cached catalog singleton |
| `mission-query.ts` | Query helpers |
| `mission-validation.ts` | Integrity validation |
| `mission-version.ts` | Version and lifecycle constants |
| `index.ts` | Public API |
