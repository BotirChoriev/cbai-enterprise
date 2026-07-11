# CBAI Build Ledger

Grouped by series. Individual commit messages are the authoritative per-commit record
(`git log`); this ledger tracks series-level milestones so the shape of the work is legible
without reading 60+ commits.

## RI-BUILD series (001–033) — Research Intelligence catalog and UI foundation

Established the canonical `ResearchTopic` catalog, the topic detail page, the global research
network graph, workspace explorer, evidence navigation with URL-driven selection, and the
Research Review domain scaffolding (`lib/research/review/`). Consolidated a duplicate
`ResearchTopic` model (RI-BUILD-033B) after a naming collision was caught before it shipped.

## BUILD-004x series — Deterministic intelligence engines

| Build | Commit | What it added |
|---|---|---|
| 004A | `f50c5aa` | Evidence Gap Intelligence Engine — `lib/research/intelligence/` |
| 004B | `e0c8fa1` | Research Mission Workspace (mission, known info, unknowns, gaps) |
| 004C | `d61d53a` | Research Decision Engine — one deterministic recommendation |
| 004D | `8f2cb86` | URL-driven evidence selection (`?evidence=`), server-first |

## BUILD-005 — Review Operating System foundation (`5f1f54a`)

`TopicReviewWorkspace`, `ResearchReviewWorkspaceState`, honest empty states for notes/findings,
process-level open questions derived from real gap/review state.

## EPIC series — Platform-wide transformation (frozen at EPIC-10, RC-1)

| Epic | Commit | Scope |
|---|---|---|
| — | `40796cf` | Research Workspace professionalization (Context Bar, Mission Control Panel) |
| — | `d9533fb` | Research Readiness Engine — deterministic milestones, `lib/research/readiness/` |
| — | `bc77bea` | Research Health Engine — Healthy/Stable/Weak/Critical, `lib/research/health/` |
| — | `067b101` | Research Workflow Engine — stage, next action, real action links, `lib/research/workflow/` |
| — | `4cf366c` | Research Cockpit — one operational surface, consolidated Mission Control Panel + Timeline |
| EPIC-01 | `b8d65e3` | Universal product identity, positioning, and public entry experience |
| EPIC-02 | `a9f419c` | Universal Intelligence Foundation — `lib/foundation/`, research adapter |
| EPIC-03 | `05777e7` | Universal Relationship Engine — `lib/relationships/`, 16-type vocabulary, richer `Relationship` envelope; found and documented three pre-existing, unmigrated graph/relationship systems (`lib/graph/`, `lib/research/graph/`, `lib/intelligence/graph/`) |
| EPIC-04 | `0401f22` | Universal Evidence Operating System — `lib/evidence/` engine (build, validate, link, history, query/compare/trace); `Evidence` enriched to 21 fields; `EvidenceSourceType`/`VerificationStatus` promoted from existing Research/evidence-infrastructure modules (aliased, not duplicated); shared `Confidence` extracted for Relationship + Evidence; found and documented a third, non-integrated numeric-scoring Evidence model in `lib/intelligence/` |
| EPIC-05 | `32b8700` | Intelligence Reasoning Framework — `lib/foundation/reasoning-types.ts` (shape) + `lib/reasoning/` (engine): `buildReasoningResult` deterministically derives Observed Facts, Known Unknowns, Supporting/Conflicting Evidence, Reasoning Path, Possible Options, Trade-offs, Risks, Potential Consequences, Open Questions, and an always-`true` Human Decision Required flag from real Evidence/Relationship/Timeline input — never a model call; wired into `research-foundation-adapter.ts` (`IntelligenceFoundationView.reasoning`) and proven for all 65 catalog topics via `npm run build`; found and documented a fourth, non-integrated dormant subsystem (`lib/intelligence/engine/`, `orchestrator/`, numeric `ConfidenceAssessment`) |
| EPIC-06 | `0455def` | Universal Intelligence Workflow Framework — `lib/foundation/workflow-types.ts` (shape) + `lib/workflow/` (engine): `Workflow` connects Question/Mission/Evidence/Relationships/Reasoning/Execution to a 12-state, transition-audited state machine (`createWorkflow`, `applyWorkflowTransition`, `validateWorkflowTransition`, `validateWorkflowRecord`); every transition carries reason/timestamp/actor/evidenceReference (nullable, never fabricated)/previousState/nextState; wired into `research-foundation-adapter.ts` (`IntelligenceFoundationView.workflow`) and proven for all 65 catalog topics via `npm run build`; found and documented a fifth, non-integrated dormant subsystem (`lib/intelligence/agents/tasks/`, `lib/intelligence/runtime/`) |
| EPIC-07 | `bc3bb44` | Intelligence Orchestration Layer — `lib/foundation/orchestration-types.ts` (shape: `IntelligenceResult`, `pipelineTrace`, `IntelligenceExtensionPoints`) + `lib/orchestration/` (engine: `runIntelligencePipeline`, a plugin-based `IntelligencePipelineProviders` contract, `validateIntelligencePipelineProviders`); connects Foundation → Evidence Discovery → Relationship Resolution → Reasoning → Workflow into one pipeline with zero domain logic — Reasoning/Workflow consumed directly from `lib/reasoning/`/`lib/workflow/`, never re-derived; wired into `research-foundation-adapter.ts` (`runResearchIntelligencePipeline`), verified structurally via `npm run build`; found and documented a sixth, non-integrated dormant subsystem — a full parallel pipeline orchestrator in `lib/intelligence/orchestrator/` built on the same numeric scoring model flagged in EPIC-04/05 |
| EPIC-08 | `288884f` | Global Intelligence Network — `lib/foundation/network-types.ts` (shape: `IntelligenceEntityKind` 16-value vocabulary, `IntelligenceNetwork`, `CollaborationCandidate`, `NetworkExtensionPoints`) + `lib/network/` (engine: `buildIntelligenceNetwork`, `validateIntelligenceNetwork`, query primitives reusing `lib/relationships/`, `findCollaborationCandidates`); nodes are real Intelligence Entities (not a social graph — no followers, no messaging, no popularity), edges reuse the Foundation's `Relationship` type unmodified so every connection is evidence-aware/traceable by construction; every collaboration candidate traces to a real shared Evidence or relationship-target id, never a connection count; wired into a new `research-entity-network-adapter.ts` mapping the pre-existing `lib/research/entities/` catalog onto the network (resolving previously-documented technical debt), verified structurally via `npm run build` |
| EPIC-09 | `b3d8c21` | Intelligence Workspace Platform — `lib/foundation/workspace-types.ts` (shape: `WorkspaceView` and its nine sections — Mission Center, Intelligence Brief, Evidence Center, Knowledge Network, Recommendations, Monitoring, Timeline, Open Questions, Activity) + `lib/workspace/` (engine: `buildWorkspaceView`, `validateWorkspaceView`, boolean query readers); every section is a pass-through or trivial default over `IntelligenceResult` (EPIC-07) and `IntelligenceNetwork` (EPIC-08) — zero new intelligence logic, zero UI, zero components, zero routes; `extensions` reuses `IntelligenceExtensionPoints` directly rather than declaring a parallel vocabulary; wired into a new `research-workspace-adapter.ts` composing the EPIC-07/EPIC-08 pipelines with no new logic, verified structurally via `npm run build` |
| EPIC-10 | `298b834` | **CBAI Platform RC-1** — full Platform Core audit (Foundation through Workspace, 41 files/2,761 lines), Constitution audit, health analysis, and Core Freeze declaration. No new capability, no new domain, no new ecosystem. One real duplicate found and fixed: six identical `{valid, issues}` validator-result interfaces consolidated into `lib/foundation/validation-types.ts`'s `PlatformValidationResult` (zero-behavior-change alias, matching the `Confidence`/`EvidenceSourceType`/`VerificationStatus` promotion pattern). Zero circular dependencies confirmed by full import-graph audit. One doc-precision fix. One naming inconsistency (`createWorkflow` vs. `build*`) and six zero-caller validator exports identified and deliberately left as documented technical debt rather than risk-bearing renames/deletions. Zero Constitution violations found in the Platform Core across nine audited principles. Full audit trail: `docs/CBAI-Platform-RC1.md`. Platform Constitution amended with a ratified Platform Core Principles section (`docs/standards/01-cbai-constitution.md`) |

## Research Intelligence series — extensions built on the frozen Platform Core

Built after CBAI Platform RC-1 (EPIC-10). Each entry extends the Platform Core via the four
sanctioned Extension Points (`docs/CBAI-Platform-RC1.md`) — none modifies a frozen module.

| Build | Commit | Scope |
|---|---|---|
| Phase 1 | `95466c7` | Research Domain Foundation — `lib/research-domain/` (types only, no builders, no validators, no seed data): 27 Research entity interfaces (Research Mission through Research Impact), each extending `ResearchEntityBase`'s eight required concerns (Identity, Lifecycle, Relationships, Evidence Links, Mission Links, Organization Links, Timeline, Traceability), reusing `Evidence`/`Mission`/`Relationship`/`TimelineEvent`/`Question` from `lib/foundation/` directly rather than redeclaring them; a new, small, closed lifecycle vocabulary (`proposed \| active \| completed \| archived`) deliberately distinct from `WorkflowState`; `RESEARCH_RELATIONSHIP_PATTERNS` documents 30 realistic entity-pair connections using 15 of the Platform's existing 16 `RelationshipType` values — no new relationship vocabulary needed. Zero Platform Core files touched. |
| Phase 2 | `e1aa340` | Research Domain Integration — five new files in `lib/research-domain/`: `research-domain-builder.ts` (`buildResearchEntityBase`), `research-domain-adapter.ts` (real-data mapping from `lib/research/research-topics.ts`, `evidence/evidence-topic-builder.ts`, `intelligence/review-workspace-engine.ts`, `intelligence/workspace-shell-engine.ts`, `graph/`, `entities/`, plus `research-foundation-adapter.ts`'s existing `toSubject`/`toMission`/`toEvidence`/`toRelationships`), `research-domain-query.ts`, `research-domain-validation.ts` (reuses EPIC-10's `PlatformValidationResult`), and `research-domain-providers.ts` (`researchDomainPipelineProviders: IntelligencePipelineProviders`, EPIC-07's contract, unmodified). 65 real topics + missions + questions mapped, 1 real laboratory + 1 real dataset from the entities registry, Knowledge Graph `related_topic` edges converted to Relationships (uses_method/requires_evidence deliberately excluded as duplicates of `toRelationships()`; future_supports excluded as non-real). Researchers/Hypotheses honestly mapped to `[]` — no real data exists yet. Zero Platform Core files touched, zero Phase 1 files modified, zero legacy `lib/research/*` files modified. |
| Phase 3 | *(this)* | Research Workspace Contract — new `lib/research-workspace/` directory (five files, mirroring `lib/research-domain/`'s own separation from the Platform Core it sits on): `research-workspace-contract.ts` (`ResearchWorkspaceContract`, 19 sections — 8 are direct reuse/wraps of Platform's `WorkspaceView` sections, `ReasoningRisk`, and `CollaborationCandidate`; 11 are new thin compositions over Research Domain entities), `research-workspace-providers.ts` (`ResearchWorkspaceProviders`, mirroring `IntelligencePipelineProviders`'s injection-contract role), `research-workspace-builder.ts` (`buildResearchWorkspaceContract` — calls `buildWorkspaceView` (EPIC-09) for the reused sections, narrows a Research Domain entity collection by kind for the new ones, calls `findCollaborationCandidates` (EPIC-08) directly for Potential Collaborators), `research-workspace-query.ts`, `research-workspace-validation.ts` (reuses EPIC-10's `PlatformValidationResult`). Zero Platform Core files touched, zero Research Domain files modified, zero UI/React/components/pages. |

## Pattern established across every engine build

1. Inspect the real, existing data model before writing anything.
2. New engine consumes the engine directly below it — never re-derives.
3. Every "not yet possible" state renders an honest empty state or non-interactive requirement,
   never fabricated content.
4. `npm run lint && npm run build` before every commit; `git diff --stat` reviewed to confirm
   the change is scoped to what was intended.
