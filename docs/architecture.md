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
| Relationship | `{ relationshipId, sourceId, targetId, relationshipType }` | `relatedMethods` / `relatedEvidenceTypes` |
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

lib/foundation/                     universal Foundation (this Epic)
└── adapters/research-foundation-adapter.ts

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
correct). Only the adapter and the type alias in `review-workspace-model.ts` cross that
boundary, and both are additive, non-breaking changes.
