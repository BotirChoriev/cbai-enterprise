# CBAI Architecture

## Layering

```
Foundation                  lib/foundation/
    ↓
Intelligence Engines         lib/research/{evidence,intelligence,readiness,health,workflow,review}
    ↓
Workspace                    lib/research/intelligence/review-workspace-*, workspace-shell-*
    ↓
Experience                   components/research/topic/*, components/platform/*
```

Rule: intelligence logic never lives in React. Components consume already-computed engine
output; they do not derive, score, or decide anything themselves. Every research UI component
built so far follows this — none contain `useState`/`useEffect` for business logic, and none
re-derive a signal an engine already produced.

## The Intelligence Foundation (`lib/foundation/`)

Introduced in EPIC-02. Ten domain-agnostic pillars every future ecosystem (Research, Governance,
Economic, Education, Engineering, Legal, ...) is expected to express its concepts through:

| Pillar | Shape | Research Intelligence's current instance |
|---|---|---|
| Subject | `{ subjectId, subjectLabel, subjectKind }` | `ResearchTopic` |
| Mission | `{ subjectId, statement }` | `buildMissionStatement` output |
| Question | `{ questionId, question }` | `ReviewOpenQuestion` (now a direct type alias) |
| Evidence | see "Universal Evidence Operating System" below | `TopicEvidenceCatalogItem` |
| Relationship | see "Universal Relationship Engine" below | `relatedMethods` / `relatedEvidenceTypes` |
| Analysis | `{ subjectId, summary, reasons }` | `EvidenceGapIntelligence` |
| Recommendation | `{ recommendationId, label, reason }` | `WorkflowResult.nextAction` / `.reason` |
| Execution | `{ label, href }` | `WorkflowResult.actionLink` |
| TimelineEvent | `{ eventId, occurredAt, description }` | `WorkspaceTimelineEvent` |
| Knowledge | `{ knowledgeId, body, createdAt }` | `ResearchNote` / `ResearchFinding` |

`lib/foundation/foundation-model.ts` defines the ten interfaces. `lib/foundation/foundation-view.ts`
defines `IntelligenceFoundationView`, the composed shape a full subject view resolves to.

Domain modules do **not** rewrite their internals to use these names directly — that would be a
large, high-risk change with no runtime verification available in this environment. Instead,
each domain owns an **adapter** (`lib/foundation/adapters/<domain>-foundation-adapter.ts`) of
pure functions that translate the domain's real engine output into the foundation shape. Today
there is exactly one: `research-foundation-adapter.ts`, whose `buildResearchFoundationView(topicId)`
composes `buildTopicEvidenceReview`, `deriveEvidenceGapIntelligence`, `deriveResearchWorkflow`,
`buildResearchReviewWorkspace`, and `getWorkspaceTimeline` — every existing Research Intelligence
engine, unmodified — into one `IntelligenceFoundationView`. No engine internals changed; the
adapter's correctness is verified entirely by TypeScript's structural type-checking at build
time (`npm run build`), which would fail if any research engine's real shape stopped matching
what the foundation expects.

One direct structural connection was made, not just an adapter: `ReviewOpenQuestion` (used by
the existing Review Workspace and Cockpit UI) is now `export type ReviewOpenQuestion = Question`
— its fields were already an exact match, so this is a zero-risk, zero-behavior-change alias
that makes the two concepts provably the same type, not merely convertible.

## Universal Relationship Engine (`lib/relationships/`)

Introduced in EPIC-03. Deepens the Foundation's Relationship pillar (`lib/foundation/
foundation-model.ts`) with a richer, still-optional envelope — `direction`, `strength`,
`evidence` (reusing the Foundation's own `Evidence` type), `confidence`, `time`, `status`,
`source`, and `limitations` — plus a required `explanation`. Sixteen relationship types are
defined in `lib/foundation/relationship-types.ts` (`supports`, `contradicts`, `depends_on`,
`collaborates_with`, `funded_by`, `regulated_by`, `creates`, `uses`, `improves`, `replaces`,
`extends`, `references`, `affects`, `measures`, `belongs_to`, `related_to`), extensible by
adding more values as real ecosystems need them.

`strength` is categorical (`weak | moderate | strong | unknown`), never a numeric magnitude.
`confidence` is categorical and **deterministically derived from evidence count**
(`deriveRelationshipConfidence`: 0 evidence → `unverified`, 1 → `single_source`, 2+ →
`corroborated`; `disputed` is available for a caller to set when a real, known contradiction
exists) — never a fabricated score.

`lib/relationships/relationship-builder.ts` (`buildRelationship`) constructs honest records;
`lib/relationships/relationship-query.ts` provides pure, in-memory graph-traversal primitives
(`findRelationshipsForSubject`, `findRelationshipsByType`, `resolveConnectedSubjectIds`,
`findRelationshipsAmongSubjects`) — this is the engine a future visual Knowledge Graph
consumes; no rendering or layout logic lives here, so a graph UI can be built without touching
this file. `research-foundation-adapter.ts`'s `toRelationships()` now calls `buildRelationship`
instead of constructing `Relationship` objects by hand.

### Known duplication this Epic did not resolve

Inspection for this Epic found **three separate, pre-existing graph/relationship systems**,
confirming the exact problem this Foundation exists to eventually solve:

- **`lib/graph/`** — real, active, wired to the live `/graph` route (`GraphCanvas`,
  `GraphPipeline`, etc.). `GraphEdgeType` is hardcoded to countries/companies/universities
  (`located-in | partner | competitor | research-partner | industry | investment`).
- **`lib/research/graph/`** — real, active, backs the Global Research Network on `/research`.
  Its own relationship vocabulary (`belongs_to_domain`, `uses_method`, `requires_evidence`,
  `related_topic`, `future_supports`) is research-specific and distinct from both `lib/graph/`
  and the new universal vocabulary.
- **`lib/intelligence/graph/`** — a large, sophisticated, but **entirely dormant** graph/
  confidence/contradiction backend (`traversal.ts`'s `traverseGraphSkeleton` always returns an
  empty result; its own comments say "skeleton — Knowledge Graph adapter not connected").
  Confirmed via repo-wide search that nothing outside `lib/intelligence/` consumes any of
  `lib/intelligence/graph/`, `lib/intelligence/confidence/`, or `lib/intelligence/contradictions/`.

None of these three were migrated or touched this Epic — the first two are real, live, working
features with no way to visually verify a migration in this environment, and the third is a
much larger (150+ file) subsystem than this Epic's scope supports auditing safely. The new
`lib/relationships/` engine is the one intended to eventually unify them, but that migration is
explicitly deferred — see `docs/current-progress.md`.

## Universal Evidence Operating System (`lib/evidence/`)

Introduced in EPIC-04. Evidence is now a first-class Foundation pillar, not a Research-only
concept: `lib/foundation/foundation-model.ts`'s `Evidence` interface carries all 21 fields the
mission named — identity, original source, source type, origin organization, authors,
publication date, version, language, original language, verification status, reliability,
confidence, known limitations, supporting/conflicting evidence links, related subjects/
missions/questions/relationships, timeline, and an append-only history log. Only `evidenceId`,
`label`, and `status` are required — every new field is optional and left `undefined` when the
real value is genuinely unknown, so every existing Evidence record (catalog items, Relationship
evidence arrays) remains valid without any migration.

Two vocabularies were **promoted, not duplicated**, from real pre-existing domain modules into
`lib/foundation/evidence-types.ts`:

- `EvidenceSourceType` (`publication | dataset | experiment | patent | laboratory | researcher |
  institution | company | government | other`) — promoted from
  `lib/research/evidence/evidence-types.ts`, which now re-exports the Foundation type as a
  zero-behavior-change alias.
- `VerificationStatus` (`not_started | verification_pending | verified | failed |
  not_applicable`) — promoted from `lib/evidence-infrastructure/types.ts` (a real, active,
  philosophically-aligned "no scores or rankings" system), which now re-exports the Foundation
  type the same way.

`EvidenceReliability` (`unknown | low | moderate | high`) is new — no existing module defined an
equivalent concept. `Confidence` (`unverified | single_source | corroborated | disputed`) was
extracted out of EPIC-03's `RelationshipConfidence` into a shared `lib/foundation/confidence.ts`
so Evidence and Relationship use one definition, not two; `RelationshipConfidence` is now
`export type RelationshipConfidence = Confidence` and `deriveRelationshipConfidence` delegates to
the shared `deriveConfidenceFromSourceCount`. All four vocabularies are categorical, never
numeric — no fabricated score is ever attached to a piece of evidence.

`lib/evidence/` is the reusable Evidence Engine:

- `evidence-builder.ts` — `buildEvidence`, constructs an honest record with every unsupplied
  field left undefined.
- `evidence-validation.ts` — `validateEvidenceRecord`, deterministic structural checks only
  (has an identity/label/status, does not claim to support or conflict with itself or claim both
  relations to the same record) — never a quality or truth score.
- `evidence-linking.ts` — `linkSupportingEvidence` / `linkConflictingEvidence`, additive and
  deduplicated.
- `evidence-history.ts` — `appendEvidenceHistory`, append-only (history is never rewritten in
  place).
- `evidence-query.ts` — `findEvidenceForSubject`, `groupEvidenceBySourceType`,
  `groupEvidenceByVerificationStatus`, `compareEvidence` (relation derived only from a record's
  own declared supporting/conflicting links, never inferred from content similarity), and
  `traceEvidence` (provenance/history summary).

`research-foundation-adapter.ts`'s `toEvidence()` now calls `buildEvidence` instead of
constructing `Evidence` objects by hand, and honestly maps the Research catalog's coarse
`TopicEvidenceCatalogStatus` to `VerificationStatus` (`catalog_available → not_started`,
`source_not_connected → not_applicable`, `human_review_required → verification_pending`) — it
never claims `verified`, since nothing in the catalog has actually been verified.

### Prepared for, not implemented, this Epic

Per the mission's explicit scope boundary, the following remain **architectural placeholders
only** — the Evidence shape and engine are ready to support them, but no UI or derivation logic
was added: AI reasoning over evidence, Executive Briefing generation, Voice Intelligence,
Evidence-backed Recommendations, a rendered Timeline, a Knowledge Graph view, and Mission
Execution. Each can consume `Evidence.relatedMissionIds` / `.relatedQuestionIds` /
`.relatedRelationshipIds` / `.timeline` / `.history` once built, without another shape change.

### Known non-integration: `lib/intelligence/evidence.types.ts`

Inspection for this Epic found a third, pre-existing "Evidence" concept in the large, mostly-
dormant `lib/intelligence/` subsystem: a numeric `relevance: number` (0–100) scoring model with
an `EvidenceQualityBand`/`EvidenceQualityDimensionScore` quality-assessment layer
(`lib/intelligence/evidence/quality/quality.types.ts`). This was deliberately **not** integrated
with the new universal Evidence pillar — it is philosophically incompatible with the categorical,
never-fabricated-score approach used everywhere else in the Foundation. It remains untouched,
internally consistent, and unused outside `lib/intelligence/`; unifying or retiring it is left as
known technical debt (see `docs/current-progress.md`).

## Research Intelligence module map (current)

```
lib/research/
├── research-topics.ts              canonical ResearchTopic catalog (single source of truth)
├── evidence/                       ResearchEvidence domain model, builder, engine, query
├── evidence/evidence-topic-builder.ts   topic → catalog evidence items (TopicEvidenceReview)
├── intelligence/
│   ├── intelligence-engine.ts      Gap Engine — deriveEvidenceGapIntelligence
│   ├── decision-engine.ts          Decision Engine — deriveResearchDecision
│   ├── review-workspace-engine.ts  buildResearchReviewWorkspace (notes/findings/questions/progress)
│   └── workspace-shell-engine.ts   getWorkspaceMemory / getWorkspaceTimeline (honest stubs)
├── readiness/                      Readiness Engine — deriveResearchReadiness (milestones)
├── health/                         Health Engine — deriveResearchHealth (Healthy/Stable/Weak/Critical)
├── workflow/                       Workflow Engine — deriveResearchWorkflow (stage, next action, links)
└── review/                         Standalone ResearchReview domain (not yet topic-connected)

lib/foundation/                     universal Foundation (EPIC-02)
├── relationship-types.ts           universal relationship vocabulary (EPIC-03)
├── evidence-types.ts               universal evidence vocabulary (EPIC-04)
├── confidence.ts                   shared Confidence type + deriveConfidenceFromSourceCount (EPIC-04)
└── adapters/research-foundation-adapter.ts

lib/relationships/                  Universal Relationship Engine (EPIC-03)
├── relationship-builder.ts         buildRelationship, deriveRelationshipConfidence
└── relationship-query.ts           findRelationshipsForSubject, resolveConnectedSubjectIds, ...

lib/evidence/                       Universal Evidence Operating System (EPIC-04)
├── evidence-builder.ts             buildEvidence
├── evidence-validation.ts          validateEvidenceRecord
├── evidence-linking.ts             linkSupportingEvidence, linkConflictingEvidence
├── evidence-history.ts             appendEvidenceHistory
└── evidence-query.ts               findEvidenceForSubject, groupEvidenceBy*, compareEvidence, traceEvidence

components/research/topic/
├── ResearchTopicDetail.tsx         page orchestrator ("/research/[topicId]")
├── ResearchCockpit.tsx             operational summary (workflow + health, replaces old Mission Control Panel)
├── TopicReviewWorkspace.tsx        full narrative flow (mission, evidence, notes, findings, questions, milestones)
├── WorkspaceContextBar.tsx         sticky "where am I" strip
└── ...
```

## Dependency direction

Every arrow above points one way. `lib/foundation/` has zero dependency on `components/`.
`lib/research/*` engines have zero dependency on `lib/foundation/` (the Foundation depends on
Research, not the reverse — Research predates the Foundation and remains independently
correct). `lib/relationships/` and `lib/evidence/` depend only on `lib/foundation/`. Only the
research adapter and the type aliases in `review-workspace-model.ts`,
`lib/research/evidence/evidence-types.ts`, and `lib/evidence-infrastructure/types.ts` cross the
Research↔Foundation boundary, and all are additive, non-breaking changes.
