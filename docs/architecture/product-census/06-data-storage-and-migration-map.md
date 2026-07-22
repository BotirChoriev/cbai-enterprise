# Data storage and migration map

## Build / runtime

| Item | Evidence | Status |
|------|----------|--------|
| Package manager | npm (`package.json`; no `packageManager` field) | PROVEN |
| Next.js | `16.2.10` | PROVEN |
| React | `19.2.4` | PROVEN |
| Export mode | `next.config.ts` `output: "export"` | PROVEN |
| Cloudflare Pages Function | `functions/api/voice/session.ts` | PROVEN |
| IndexedDB | ripgrep for indexedDB/openDB in ts/tsx | UNVERIFIED (none found) |

## Persistence layers

### 1. Static catalog / in-memory builders
Entity intelligence, investor/government coverage builders, spatial geo assets. No user mutation of core catalogs.

### 2. Browser `localStorage` / `sessionStorage` (primary user data today)
Resolved via `resolveStorageKey` helpers in stores. Sample keys (names only):

| Key pattern | Module | Notes |
|-------------|--------|-------|
| `cbai-auth-users`, `cbai-auth-session` | `lib/auth/auth-store.ts` | device-local identity |
| `cbai-projects`, `cbai-project-*` | `lib/project/project-store.ts` | |
| `cbai-missions`, `cbai-current-mission-id` | `lib/intelligence-os/mission-store.ts` | |
| `cbai-operational-objects` | `lib/operational-objects/*` | |
| `cbai-organizations`, memberships, invitations, audit | `lib/organization-os/*` | |
| `cbai-mission-collaborations`, share policies, collab audit | `lib/collaboration/*` | UI-orphaned |
| `cbai-living-relationships` | LON | |
| `cbai-saved-reports` | reports | |
| `cbai-saved-knowledge-sources`, reviews | knowledge-ingestion | |
| `cbai-research-*`, canvas keys | research | |
| `cbai-genesis-*` | genesis | many keys |
| `cbai-scientific-intake-records` | scientific-intake | metadata only |
| `cbai-voice-onboarding`, pending auth intent | voice | |
| session voice session key | voice provider | sessionStorage |

**Migration rule:** never drop unknown JSON fields; additive schema only; dual-read old/new; idempotent migrators versioned (pattern already used in ontology migration version key `cbai-ontology-migration-version`).

### 3. Supabase (optional cloud)
| Artifact | Path |
|----------|------|
| Client/auth | `lib/supabase/*` |
| Migrations | `supabase/migrations/0001_init_schema.sql` … `0007_organization_rpc_functions.sql` |
| Tests | `scripts` `test:rls`, `test:shared-persistence`, `test:cloud-platform` |

Status: PARTIAL — depends on env configuration (names in `.env.example` only; values not inventoried from secrets).

### 4. Object / blob storage
No production upload pipeline PROVEN. Scientific intake queues metadata (`queued_pending`). EXTERNAL_BLOCKED for CDN/S3-like integration.

### 5. OpenAI Realtime ephemeral sessions
Broker returns ephemeral credentials; must never persist `sk-*` (`pages-voice-session-broker.ts` guards). Session audio not a durable CBAI store.

## Dual-write / conflict risks

1. Organization OS vs collaboration stores — same domain, different keys.
2. Ontology objects vs operational objects.
3. Device-local vs Supabase cloud for same logical user — outbox/pull-sync paths exist; completeness UNVERIFIED.
4. Research evidence lifecycle vs platform knowledge sources.

## Migration compatibility principles (Stage 1)

1. Read old records without new fields.
2. Preserve `unknownFields`.
3. Idempotent migrators with version stamps.
4. No silent translation of user text (`locale-provenance-policy.md`).
5. No delete/rename of product data during audit or casual refactors.
