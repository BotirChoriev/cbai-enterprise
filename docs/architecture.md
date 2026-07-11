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
| Evidence | `{ evidenceId, label, status, note? }` | `TopicEvidenceCatalogItem` |
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
└── adapters/research-foundation-adapter.ts

lib/relationships/                  Universal Relationship Engine (EPIC-03)
├── relationship-builder.ts         buildRelationship, deriveRelationshipConfidence
└── relationship-query.ts           findRelationshipsForSubject, resolveConnectedSubjectIds, ...

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
correct). `lib/relationships/` depends only on `lib/foundation/`. Only the research adapter and
the type alias in `review-workspace-model.ts` cross the Research↔Foundation boundary, and both
are additive, non-breaking changes.
