# CBAI Canonical Ontology

**Branch:** `preview/spatial-world-intelligence`
**Module:** `lib/ontology/`

## Purpose

The canonical ontology provides a typed, versioned semantic layer connecting all core platform objects — without replacing Operational Objects, Projects, Missions, or static registries.

## Object Kinds (27)

`person`, `organization`, `country`, `region`, `company`, `university`, `research_topic`, `research_question`, `hypothesis`, `claim`, `evidence`, `source`, `dataset`, `indicator`, `project`, `mission`, `work_plan`, `task`, `decision`, `review`, `report`, `risk`, `limitation`, `policy`, `standard`, `meeting`, `translation_session`

## Required Fields

Every ontology object supports:

| Field | Description |
|-------|-------------|
| `id` | Branded `{kind}-{uuid}` |
| `kind` | One of 27 kinds |
| `title` | Human-readable label |
| `description` | Longer text |
| `status` | Lifecycle state |
| `contentLocale` | Language of content |
| `createdLocale` | Language at creation |
| `provenance` | Source, engine, legacy refs |
| `sourceReferences` | Official source material |
| `relationshipIds` | Linked relationship records |
| `createdAt` / `updatedAt` | ISO timestamps |
| `schemaVersion` | Currently `1` |
| `metadata` | Kind-specific fields |

Unknown fields from future schema versions are preserved during migration.

## Relationships

Typed, directional where appropriate. Examples:

- `project` **CONTAINS** `task`
- `claim` **SUPPORTED_BY** / **CONTRADICTED_BY** `evidence`
- `evidence` **DERIVED_FROM** `source`
- `report` **PRODUCED_BY** `mission`

See `relationship-kinds.ts` for allowlist pairs.

## Lifecycle

```
draft → awaiting_confirmation → active → blocked → completed → archived
```

No mutation occurs merely because a model suggested it. Confirmation is required for engine-inferred objects.

## Persistence

Device-local storage (`cbai-ontology-objects`, `cbai-ontology-relationships`, `cbai-ontology-audit`). Matches existing platform pattern.

## Legacy Adapters

| Legacy system | Adapter | Strategy |
|---------------|---------|----------|
| Operational Objects | `operationalObjectToOntologyDraft` | Lazy hydration |
| Projects | `projectToOntologyDraft` | Lazy hydration |
| Missions | `missionToOntologyDraft` | Lazy hydration |
| Registry entities | `registryEntityToOntologyRecord` | Read-only projection |
| Research topics | `researchTopicToOntologyRecord` | Read-only projection |

Existing localStorage keys and Supabase tables are **not** modified.

## Service API

`OntologyRepository` (`ontology-service.ts`):

- `getObject` / `listObjects`
- `createDraft` / `confirmCreation`
- `updateObject`
- `linkRelationship` / `unlinkRelationship`
- `traverse` / `relatedWork` / `dependencies`
- `getAuditLog`
