# User-data storage audit (read-only — Stage 0)

**No migrations executed. No localStorage mutated by this audit.**

Namespace helper: `lib/storage/namespaced-key.ts`
Effective keys: `{base}:cloud:{id}` | `{base}:u:{id}` | `{base}:local`
Legacy bare `{base}` → one-time copy into `:local` only when signed out (`migrateLegacyKeyIfNeeded`). Idempotent skip if `:local` already set. Does **not** auto-attribute anonymous data to a signed-in user.

## Priority domains

### Missions
| Item | Detail |
|------|--------|
| Keys | `cbai-missions`, `cbai-current-mission-id` |
| Store | `lib/intelligence-os/mission-store.ts` |
| Schema version | No explicit schemaVersion field; validate via `isMission` (id, problem, status) |
| Timestamps | `createdAt`, `updatedAt` ISO strings on create/update |
| Relationships | `projectId` optional on mission |
| Backward compat | Unknown fields: filter keeps objects that pass `isMission`; extra fields may be dropped on rewrite if not copied — **PARTIAL risk** if update path clones only known fields |
| Idempotent migrator | Namespace legacy migrate only |
| Data-loss risks | Strict `isMission` drops corrupt entries on read; updateMission must preserve fields |

### Projects
| Item | Detail |
|------|--------|
| Keys | `cbai-projects`, `cbai-project-entities`, `cbai-project-notes`, `cbai-project-tasks`, `cbai-project-questions`, `cbai-project-evidence-refs` |
| Store | `lib/project/project-store.ts` |
| Schema | Typed in `lib/project/project-types.ts`; sanitize-on-read via validators |
| Cloud | Optional outbox upsert when cloud session (`enqueueSync`) — dual-write; local remains source in Local Mode |
| Preservation | IDs generated `project-…`; timestamps on records |
| Risks | Dual cloud/local divergence if outbox fails (UNVERIFIED completeness) |

### Operational objects
| Item | Detail |
|------|--------|
| Key | `cbai-operational-objects` |
| Store | `lib/operational-objects/operational-object-store.ts` |
| Schema version | `OPERATIONAL_OBJECT_SCHEMA_VERSION` / `version` field; `sanitizeObject` + `isOperationalObject` |
| Relationships | `relatedObjectIds[]` |
| Unknown fields | Spread of validated base; fields outside type may be lost if not in `OperationalObject` — **REQUIRES_HUMAN_REVIEW** for unknown-field bag |
| Writes | Debounced 280ms — crash mid-debounce risk of last write loss |

### Companion / living memory
| Item | Detail |
|------|--------|
| Keys | `cbai-living-memory-flow`, `cbai-living-memory-cleared`, `cbai-companion-thought` |
| Store | `lib/intelligence-os/living-memory.ts` |
| Backend | **sessionStorage** (not durable across browser sessions) |
| Risks | Cleared flag in sessionStorage; users may expect durability — **PARTIAL** |

### Auth / session (device-local)
| Item | Detail |
|------|--------|
| Keys | `cbai-auth-users`, `cbai-auth-session` (**not** namespaced — identity root) |
| Store | `lib/auth/auth-store.ts` |
| Contents | passwordHash + passwordSalt in localStorage |
| Risks | XSS → credential theft; not production identity alone (see security freeze) |

### Team / collaboration / org
| Item | Detail |
|------|--------|
| Org | `cbai-organizations`, `cbai-organization-memberships`, `cbai-organization-invitations`, `cbai-organization-audit` |
| Collab (UI-orphaned stores) | `cbai-mission-collaborations`, participants, shared-objects, share-policies, review-assignments, `cbai-collaboration-audit` |
| Team drafts UI | `cbai-team-drafts` in `components/teams/TeamsWorkspaceClient.tsx` |
| Audit writability | Client localStorage — **not append-only / not tamper-evident** |

### Publication drafts
| Item | Detail |
|------|--------|
| Persistence | **In-memory React state only** (`PublicationReadinessClient.tsx`) — refresh loses progress |
| Rights workflow | Incomplete (blocker) |

### Scientific-document metadata
| Item | Detail |
|------|--------|
| Key | `cbai-scientific-intake-records` |
| Store | `lib/scientific-intake/scientific-intake.ts` |
| Fields | metadata + `fileName` / size / mime; status includes `queued_pending`; **no blob storage** |
| Locale | `createdLocale`, `contentLocale`, `provenanceOriginalText` |
| Risks | Filename-only; file bytes not preserved by CBAI |

### Ontology (explicit migrator)
| Item | Detail |
|------|--------|
| Keys | `cbai-ontology-objects`, `cbai-ontology-relationships`, `cbai-ontology-audit`, `cbai-ontology-migration-version` |
| Migrator | `lib/ontology/migrations.ts` — documents idempotent, unknownFields counted, `CURRENT_ONTOLOGY_MIGRATION_VERSION = 1` |
| Stage 0 | **Not executed** |

## Cross-cutting data-loss risks

1. Sanitize-on-read filters that drop unknown shapes.
2. Debounced OO writes.
3. sessionStorage companion memory vs localStorage expectations.
4. Publication state not durable.
5. Dual auth buckets (`:local` vs `:u:` vs `:cloud:`) — signing in does not merge anonymous data (by design).
6. Client-writable “audit” keys can be edited/deleted in DevTools.

## Stage 0 confirmation

- Schemas documented from source only.
- No `localStorage`/`sessionStorage` writes performed by Stage 0 tooling.
- No ontology/project migrations invoked.
