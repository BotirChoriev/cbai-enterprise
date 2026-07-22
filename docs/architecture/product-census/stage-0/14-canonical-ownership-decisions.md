# Canonical ownership decisions (Stage 0.5)

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Scope:** Documentation only — no runtime behavior change.
**Evidence base:** product census (`docs/architecture/product-census/*`), Stage 0 manifests, import/route audits.

---

## A. Voice commands and navigation

| Field | Decision |
|-------|----------|
| **Canonical owner** | `lib/platform-actions` (action registry + resolve/apply) |
| **Execution / confirmation boundary** | `lib/forward-deployed-engines` + `components/forward-deployed/*` (deterministic plans, Level 2/3 confirmation) |
| **I/O adapter** | `lib/voice-operator` + `components/voice-operator/*` (Realtime / transcript / mic lifecycle) |
| **Non-owners** | `lib/intelligence/**` orchestrator/agents (ORPHANED — quarantine); independent URL inventing outside registry |
| **Allowed deps** | voice-operator → platform-actions → (optional) FDE confirmation → router via allowlisted href/`action_id` |
| **Forbidden deps** | platform-actions ← intelligence orchestrator; FDE ← inventing actions not in registry; voice → arbitrary `router.push(modelUrl)` |
| **Compatibility** | Legacy `lib/voice/*` helpers may remain for speech prefs/transcripts but must not own navigation |
| **Data owner** | Session: `cbai-voice-operator-session` (sessionStorage); onboarding/pending intent localStorage keys |
| **Security authority** | Broker: `functions/api/voice/session.ts` (SF-1 incomplete); action policy: `auth-action-policy.ts` |
| **Maturity** | PARTIAL (live Realtime often EXTERNAL_BLOCKED) |
| **Stage 1 permitted** | Action-level contracts, import-direction tests, deprecation markers on intelligence orchestrator |
| **Stage 2+ only** | Broker auth/rate limits; deleting orphan intelligence; UI redesign |

---

## B. Evidence

| Field | Decision |
|-------|----------|
| **Canonical owner** | Evidence workspace at **`/knowledge`** — `lib/evidence-explorer.ts` + `components/evidence/*` + infra/gap/comparison/runtime |
| **Domain adapter** | `lib/research/evidence/*` + research stores — research topic view; types MERGE later, keys preserved |
| **Forensics** | Separate governed concept (design-only `09-evidence-integrity-and-forensics.md`) — **not** `/knowledge` |
| **Quarantine** | `lib/intelligence/evidence/*` unless a live app/components consumer is newly proven |
| **Non-owners for “platform Evidence” nav** | evidence-pipeline (fold into infra/readiness); raw `lib/evidence` behind runtime |
| **Allowed deps** | entity panels → gap/comparison; knowledge page → explorer/runtime |
| **Forbidden deps** | treating Claim/Analysis/Decision as EvidenceItem interchangeably; forensic custody in research stores |
| **Data owner** | `cbai-saved-knowledge-sources`, reviews, research lifecycle keys — preserve all |
| **Security authority** | none server-side in Local Mode |
| **Maturity** | PROVEN UI / PARTIAL ontology unity |
| **Stage 1 permitted** | Canonical EvidenceItem/Source/Claim type contracts + ownership interfaces |
| **Stage 2+ only** | Store consolidation / key merges |

---

## C. Knowledge graph

| Field | Decision |
|-------|----------|
| **Canonical owner** | `lib/graph` + `lib/living-graph` + `lib/living-object-network` + `components/graph` → `/graph` |
| **Quarantine** | `lib/intelligence/graph` |
| **DELETE_CANDIDATE (future only)** | `GraphPersonas`, `KnowledgeUniverseViews` if still zero importers |
| **Data owner** | `cbai-living-relationships` (+ optional Supabase graph migrations) |
| **Allowed deps** | organization page may consume LON |
| **Forbidden deps** | new app imports of `lib/intelligence/graph` |
| **Maturity** | PROVEN_AND_INTEGRATED |
| **Stage 1** | Graph ownership contracts + quarantine import lint |
| **Stage 2+** | physical quarantine/archive |

---

## D. Work artifacts (OO / Project / Mission)

| Object | Lifecycle responsibility | Store keys |
|--------|--------------------------|------------|
| **Operational Object** | Command-created / linked work artifacts; composer + interpreter | `cbai-operational-objects` |
| **Project** | Owned work container: notes, tasks, questions, evidence refs | `cbai-projects`, `cbai-project-*` |
| **Mission** | Operating context / continuity / problem framing | `cbai-missions`, `cbai-current-mission-id` |

| Field | Decision |
|-------|----------|
| **Canonical owners** | OO → `lib/operational-objects`; Project → `lib/project`; Mission → `lib/intelligence-os` |
| **Relationships** | Mission may reference `projectId`; OO may create/link projects via existing helpers — **do not merge schemas in Stage 0.5/1** |
| **Non-owners** | genesis execution stores (MERGE later); ontology objects (MERGE carefully later) |
| **Forbidden** | Silent schema merge; dropping unknown fields; auto-creating projects from voice identity statements |
| **Maturity** | PROVEN |
| **Stage 1** | Relationship contracts + ID preservation rules |
| **Stage 2+** | Store consolidation |

---

## E. Authentication and trust

| Field | Decision |
|-------|----------|
| **Device-local identity owner** | `lib/auth/auth-store.ts` (`cbai-auth-users`, `cbai-auth-session`) |
| **Cloud identity owner (when configured)** | `lib/supabase/cloud-auth.ts` + Supabase Auth |
| **Rule** | Browser-local identity is **not** team/collaboration authorization (SF-2) |
| **Future authority** | Server/cloud + RLS for team/publication/forensics mutations |
| **Trust layers (remain distinct)** | Guest public → Personal cabinet → Team → Publication → Forensics |
| **Namespace** | `lib/storage/namespaced-key.ts` — `:local` / `:u:` / `:cloud:` |
| **Stage 1** | Trust-tier interfaces + documentation; no auth replacement |
| **Stage 2+** | Auth replacement / cloud-required gates |

---

## F. Collaboration (teams / messages / files)

| Field | Decision |
|-------|----------|
| **Provisional canonical owner** | `lib/organization-os` + `/organization` for org/membership/invites |
| **UI drafts** | `/teams` (`cbai-team-drafts`) — PARTIAL; must bind to org-OS later |
| **Messages / files** | PLACEHOLDER shells (`SimpleEmptyWorkspace`) — **no production-safe owner** |
| **Non-owner / quarantine growth** | `lib/collaboration/*` (stores + tests; **0 component imports**) — preserve keys; no new UI on this store until decision revisit |
| **Maturity** | PARTIAL |
| **Security** | localStorage is **not** secure shared collaboration |
| **Stage 1** | Collaboration trust interfaces only |
| **Stage 2+/4** | Real team workspace + server authz |

---

## G. Publication and copyright

| Field | Decision |
|-------|----------|
| **Canonical owner (future)** | Publication registry module (not yet durable) |
| **Current** | `PublicationReadinessClient` in-memory — PARTIAL |
| **Rules** | Private by default; explicit human confirmation; rights/license/consent provenance required; **no** Voice Level-3 single-shot publish |
| **Security gate** | SF-5 |
| **Stage 1** | Rights/consent interface types only |
| **Stage 2+/6** | Enablement |

---

## H. Locale provenance

| Field | Decision |
|-------|----------|
| **Canonical owner** | `lib/i18n/*` + `docs/architecture/locale-provenance-policy.md` |
| **Rules** | Preserve user-entered content exactly; translate deterministic system labels at render; `contentLocale` / `createdLocale` backward compatible; no silent MT of official quotations |
| **Stage 1** | Locale contract types + architecture tests for non-rewrite |
| **Stage 2+** | Broad UI closure |

---

## I. Storage matrix

| Domain | Canonical current store | Future authoritative store | Compatibility adapter | Migration risk | Data-loss risk | Cloud required? |
|--------|-------------------------|----------------------------|----------------------|----------------|----------------|-----------------|
| Missions | `cbai-missions` (+ current id) via mission-store | Same shape → optional Supabase mission table | namespaced-key | Medium if dual-write diverges | Sanitize drops invalid | No (local OK) |
| Projects | `cbai-projects` + related keys | Supabase `projects` + outbox when cloud | namespaced-key + outbox | Medium | Dual-write gap | No for personal; Yes for shared |
| Operational Objects | `cbai-operational-objects` | TBD cloud table | namespaced-key; schemaVersion on records | Medium | Debounced write loss | No for personal |
| Files | none (PLACEHOLDER) | Object storage + metadata | n/a | High when introduced | Metadata-only today | Yes for real blobs |
| Messages | none (PLACEHOLDER) | Server message store | n/a | High | n/a | Yes |
| Teams | `cbai-team-drafts` + org-OS keys | org-OS + RLS | map drafts→memberships later | High if naive merge | Draft loss if wiped | Yes for real teams |
| Publications | in-memory only | Durable publication + rights objects | export checklist state if any | Low today (ephemeral) | Refresh loses UI state | Yes for public registry |
| Audit events | client keys (`cbai-*-audit`) | Append-only server audit | dual-write later | High | Client tampering (SF-3) | Yes for integrity |

---

## Capability → canonical owner (quick index)

| Capability | Canonical owner module |
|------------|------------------------|
| Voice I/O | `lib/voice-operator` |
| Actions / navigation commands | `lib/platform-actions` |
| Engine confirmation | `lib/forward-deployed-engines` |
| Evidence workspace | evidence-explorer stack @ `/knowledge` |
| Research evidence view | `lib/research` (adapter) |
| Graph | `lib/graph` + LON |
| Missions | `lib/intelligence-os` |
| Projects | `lib/project` |
| Operational Objects | `lib/operational-objects` |
| Org / team membership | `lib/organization-os` (provisional for teams) |
| Auth local | `lib/auth` |
| Auth cloud | `lib/supabase` |
| i18n | `lib/i18n` |
| Spatial home | `components/spatial-world` + `lib/spatial-world` |
| Investor/Gov lenses | `components/workspaces` |
| Trust copy | `components/trust` |
| Orphan intelligence engine | QUARANTINE (`lib/intelligence`) |

Human agreement on this table closes Stage 1 entry gate #5.
