# CBAI Current Progress

Snapshot as of EPIC-10 (**CBAI Platform RC-1** — Platform Core frozen) plus Research Intelligence
Phase 1 (Domain Foundation), Phase 2 (Domain Integration), Phase 3 (Workspace Contract), Phase 4
(Mission Engine), the First Live Vertical Slice, and Workspace Activation (Research Mission wired
into the live UI). Update this file, not a new one, as state changes.

## Real and working today

- **Research Intelligence** (`/research`, `/research/[topicId]`): 65 catalog topics, real
  static generation per topic, full Gap → Decision → Readiness → Health → Workflow engine
  stack, Research Cockpit, URL-driven evidence selection (`?evidence=`), honest empty states
  for notes/findings/timeline (no persistence exists yet, so these are always empty — not a
  bug).
- **Universal Intelligence Foundation** (`lib/foundation/`): ten pillars defined, one working
  adapter (Research), verified by successful `npm run build` (structural type-check against
  every real engine output).
- **Universal Relationship Engine** (`lib/relationships/`): builder + query engine over the
  Foundation's `Relationship` type; Research Intelligence's catalog relationships now flow
  through it. Not yet wired into any UI.
- **Universal Evidence Operating System** (`lib/evidence/`): build/validate/link/history/query
  engine over the Foundation's now-21-field `Evidence` type; Research Intelligence's catalog
  evidence flows through `buildEvidence`, verified by successful `npm run build`. Not yet wired
  into any UI beyond the existing evidence display, which already consumed the same underlying
  catalog data before this Epic.
- **Intelligence Reasoning Framework** (`lib/foundation/reasoning-types.ts` + `lib/reasoning/`):
  `buildReasoningResult` deterministically derives Observed Facts, Known Unknowns, Supporting/
  Conflicting Evidence, Reasoning Path, Possible Options, Trade-offs, Risks, Potential
  Consequences, and Open Questions from real Evidence/Relationship/Timeline input — zero model
  calls, zero fabricated confidence. Wired into `research-foundation-adapter.ts`
  (`IntelligenceFoundationView.reasoning`), verified for all 65 catalog topics by successful
  `npm run build`. Not yet wired into any UI.
- **Universal Intelligence Workflow Framework** (`lib/foundation/workflow-types.ts` +
  `lib/workflow/`): a 12-state, transition-audited state machine (`createWorkflow`,
  `applyWorkflowTransition`, `validateWorkflowTransition`, `validateWorkflowRecord`) that
  connects a subject's Question/Mission/Evidence/Relationships/Reasoning/Execution into one
  `Workflow` record. Every transition carries reason/timestamp/actor/evidenceReference
  (honestly nullable)/previousState/nextState. Wired into `research-foundation-adapter.ts`
  (`IntelligenceFoundationView.workflow`), verified for all 65 catalog topics by successful
  `npm run build`. Not yet wired into any UI.
- **Intelligence Orchestration Layer** (`lib/foundation/orchestration-types.ts` +
  `lib/orchestration/`): `runIntelligencePipeline` sequences Foundation → Evidence Discovery →
  Relationship Resolution → Reasoning → Workflow into one `IntelligenceResult`, with zero domain
  logic — domain-specific stages are supplied via a plugin contract
  (`IntelligencePipelineProviders`); Reasoning/Workflow are consumed directly from the real
  engines. Wired into `research-foundation-adapter.ts`
  (`researchIntelligencePipelineProviders`, `runResearchIntelligencePipeline`), verified
  structurally by successful `npm run build`. Not yet wired into any UI, and not yet exercised
  functionally for all 65 topics during the build (see below for why).
- **Global Intelligence Network** (`lib/foundation/network-types.ts` + `lib/network/`): a
  16-entity-kind vocabulary, `IntelligenceNetwork` (nodes + Relationship edges), and
  evidence-grounded collaboration discovery (`findCollaborationCandidates` — shared evidence or
  shared relationship target only, never a connection/popularity count). Wired into a new
  `research-entity-network-adapter.ts` mapping the real `lib/research/entities/` catalog onto
  the network. Verified structurally by successful `npm run build`. Not yet wired into any UI,
  and not yet exercised functionally during the build (same reason as the orchestration layer —
  see below).
- **Intelligence Workspace Platform** (`lib/foundation/workspace-types.ts` + `lib/workspace/`):
  `WorkspaceView` composes the nine required sections (Mission Center, Intelligence Brief,
  Evidence Center, Knowledge Network, Recommendations, Monitoring, Timeline, Open Questions,
  Activity) entirely from `IntelligenceResult` (EPIC-07) and `IntelligenceNetwork` (EPIC-08) —
  zero new intelligence logic. Wired into a new `research-workspace-adapter.ts`. Verified
  structurally by successful `npm run build`. Ships zero React, zero components, zero routes —
  the mission's explicit scope.
- **CBAI Platform RC-1** (`docs/CBAI-Platform-RC1.md`): the Platform Core (`lib/foundation/`
  through `lib/workspace/` plus `lib/foundation/adapters/`, 41 files, 2,761 lines) is audited and
  frozen. Zero circular dependencies confirmed by a full import-graph extraction; one real
  duplicate found and fixed (six identical validator-result interfaces consolidated into
  `lib/foundation/validation-types.ts`'s `PlatformValidationResult`); zero Constitution
  violations found inside the Platform Core across nine audited principles. See the audit
  document for the full Phase 1–4 findings.
- **Research Intelligence Domain Foundation, Phase 1** (`lib/research-domain/`): 27 Research
  entity type definitions (Research Mission through Research Impact), each extending
  `ResearchEntityBase`'s eight required concerns and reusing Platform Core pillars
  (`Relationship`, `Evidence`, `Mission`, `TimelineEvent`, `Question`) directly. Types only — no
  builder functions, no validators, no seed data. Built entirely as an extension with zero
  Platform Core files modified. Verified structurally by successful `npm run build`.
- **Research Intelligence Domain Integration, Phase 2** (`lib/research-domain/`): five new files
  — Builder, Adapter, Query, Validation (reuses EPIC-10's `PlatformValidationResult`), Providers
  (`researchDomainPipelineProviders`, implementing EPIC-07's `IntelligencePipelineProviders`) —
  wiring Phase 1's types to real data: 65 real topics → `ResearchTopicEntity` +
  `ResearchMissionEntity` (with real Evidence, Relationships, Questions), 1 real laboratory and 1
  real dataset from `lib/research/entities/`, Knowledge Graph `related_topic` edges. Researchers
  and Hypotheses honestly map to `[]` — no real data exists for either. Zero Platform Core files
  touched, zero Phase 1 files modified, zero legacy `lib/research/*` files modified. Verified
  structurally by successful `npm run build`.
- **Research Workspace Contract, Phase 3** (`lib/research-workspace/`): `ResearchWorkspaceContract`
  — 19 sections, 8 reused directly from Platform's `WorkspaceView`/`ReasoningResult`/Network
  (Mission Summary, Mission Progress, Evidence Summary, Potential Collaborators, Open Risks,
  Recommendations, Activity Timeline, Knowledge Network), 11 new thin compositions over Research
  Domain entities (Research Timeline, Research Questions, Open Hypotheses, Research Findings,
  Related Publications/Patents/Datasets/Technologies/Organizations, Research Team, Funding
  Opportunities). `buildResearchWorkspaceContract` + `ResearchWorkspaceProviders` +
  `researchWorkspaceProviders` (calling `runResearchIntelligencePipeline`,
  `buildResearchIntelligenceNetwork`, `buildAllResearchDomainEntities` — all unmodified). Zero
  Platform Core files touched, zero Research Domain files modified. **Now functionally active**,
  not just type-checked: rendered live on `/research/[topicId]` (see below) — gained
  `MissionSummarySection.intelligenceBrief` and `MissionProgressSection.recommendedNextStep`
  during that activation work (both reuse existing engines unmodified; see the vertical-slice
  entry below for why).
- **Research Mission Engine, Phase 4** (`lib/research-mission/`): `ResearchMission` — a real
  nine-state project lifecycle (`draft/planned/active/paused/blocked/review/completed/archived/
  cancelled`) with transition history (reason/timestamp/actor/evidenceReference), plus every
  "Support:" concern the mission named. 11 of 16 are direct references into Workspace Contract/
  Research Domain output (Research Questions, Hypotheses, Evidence, Timeline, Dependencies,
  Participants, Organizations, Risks, Related Publications/Patents/Datasets); Expected Outcomes
  is freshly filtered from Research Domain entities by kind; only Goal, Scope, Milestones, and
  Deliverables are genuinely new (Milestones/Deliverables use categorical status only, never a
  completion percentage). `MissionProviders` + `researchMissionProviders` (calling
  `buildResearchWorkspaceContract`, `buildAllResearchDomainEntities` — both unmodified). Zero
  Platform Core or Research Domain files touched. **Now functionally active**, not just
  type-checked: rendered live on `/research/[topicId]` (see below). `goal`/`scope` are now
  optional on `buildResearchMission`'s input, defaulting to real
  `ResearchMissionEntity.statement`/`ResearchTopicEntity.description` — the one minimal
  correction made to activate it.
- **Research Intelligence: First Live Vertical Slice, now with the Mission layer wired in** — the
  first real UI consumer of the whole stack, for real topic **`microbiology`** (the richest real
  topic: 3 real methods, 3 real evidence types, `catalog_available` status, the only topic with
  two real `lib/research/entities/` cross-references). Server component
  `components/research/topic/ResearchIntelligenceOverview.tsx` renders a "Research Intelligence"
  section on the existing `/research/[topicId]` route (one call to `buildResearchMission` — which
  itself embeds the same `ResearchWorkspaceContract` internally, so the UI still consumes exactly
  one Workspace object — alongside, never replacing, `ResearchTopicDetail`/`ResearchCockpit`).
  Now shows a "Mission lifecycle" stat (`mission.currentState`, honestly `draft` — no mission has
  ever transitioned). Verified by: `npm run build` (real static generation of all 65 real topic
  pages, not just type-checking), `npm run test:research-slice` (11/11 passing — see below), and
  a manual dev-server + curl pass confirming HTTP 200, real content, the existing
  `?evidence=`/review-workspace anchor still work, and no server-side errors logged.
  **Functionally active** — this is the first place in this repository that Platform Core,
  Research Domain, Workspace Contract, *and* Research Mission Engine output are all actually
  rendered together.
- **`npm run test:research-slice`** — a zero-dependency functional test harness
  (`scripts/test-research-slice.ts` + `scripts/register-alias-loader.mjs`) using only Node's
  built-in `node:test` runner and native TypeScript execution (no Jest/Vitest/ts-node/tsx
  installed). Covers: valid/unknown topic ID handling, no fabricated fields, empty data stays
  empty, evidence/relationship traceability, `humanDecisionRequired === true` at runtime, valid
  `WorkflowState`, Contract-reuses-pipeline verification, a data-layer throw check, and (new)
  confirmation that `buildResearchMission` and `buildResearchWorkspaceContract` share the same
  evidence set with real, non-empty `goal`/`scope` and a valid `MissionLifecycleState`. All 11
  pass. This is the first automated test coverage of any kind in this repository.
- **Public entry experience**: hero, three-ecosystem model, capability flow, audience section,
  trust section — all real, honest content, no fabricated statistics.
- **Public search / Evidence Core** (`/search`, `/countries`, `/companies`, `/universities`):
  functional profile search and review. The fabricated-confidence-score issue tracked here since
  EPIC-01 is now fixed — `/companies` and `/universities` were remediated on 2026-07-06 (see
  `docs/companies-constitution-compliance-report.md`, `docs/universities-constitution-compliance-report.md`)
  and re-verified directly against source during the Product Activation Audit
  (`docs/product-activation-audit.md`): no score fields remain in `lib/companies.ts`/
  `lib/universities.ts`, and `*IntelligencePanel` components are structurally identical to
  `CountryIntelligencePanel`. The audit found and fixed one residual inconsistency one layer
  below the UI (`lib/intelligence/evidence/adapters/entity/entity-evidence-mapper.ts` — see that
  doc §3).

## Honest placeholders (explicitly labeled as such in-product)

- `/research/evidence` and `/research/review` — standalone pages, each rendering a single
  hardcoded placeholder record with in-page copy stating "no live data is connected yet."
- Notes, Findings, and Workspace Timeline sections in the Review Workspace — always empty,
  because no persistence layer exists anywhere in this platform.
- `getWorkspaceMemory()` — always returns `undefined`; "Continue where you left off" always
  shows "No previous session recorded yet."

## In development / future workspace (labeled honestly on the homepage)

- **Governance Intelligence** — no live external data, no route from its ecosystem card.
- **Economic Intelligence** — same.

## Explicitly not started this Epic (by design)

- No deep rewrite of Research Intelligence's internal engines to literally implement the
  Foundation interfaces — only a translation adapter and three zero-risk type aliases
  (`ReviewOpenQuestion`, `EvidenceSourceType`, `VerificationStatus`). A full internal rewrite was
  judged too high-risk to attempt without a way to visually/behaviorally verify the result in
  this environment.
- No Governance or Economic foundation adapter — nothing real to adapt yet.
- No wiring of `IntelligenceFoundationView` into any UI component — it is currently proven only
  at the type level (`npm run build`) and is available for a future Epic to render.
- No AI (model-backed) reasoning, Executive Briefing, Voice Intelligence, Evidence-backed
  Recommendations, rendered Timeline, Knowledge Graph view, or Mission Execution — per EPIC-04's
  explicit scope boundary, the Evidence shape and engine are architecturally ready to support
  these (`relatedMissionIds`, `relatedQuestionIds`, `relatedRelationshipIds`, `timeline`,
  `history`), but no such UI or derivation logic was built in that Epic.
- No UI consumes `ReasoningResult` or `IntelligenceFoundationView.reasoning` — per EPIC-05's
  explicit scope boundary ("prepare reusable reasoning objects... React must consume the
  framework" once built), the framework is proven only at the type/build level this Epic.
- No UI consumes `Workflow` or `IntelligenceFoundationView.workflow`, and no real caller records
  real `WorkflowTransition`s yet — per EPIC-06's explicit scope ("No React logic. Everything
  belongs in lib/."), the framework is proven only at the type/build level this Epic. Every demo
  Workflow honestly starts and stays at `not_started` with empty history (see below for why).
- No project/task management was built — deliberately out of scope per the mission
  ("Do NOT build project management. Do NOT build task management.").
- No UI consumes `IntelligenceResult` — per EPIC-07's explicit scope ("React consumes
  orchestration. React never performs orchestration."), the layer is proven only at the
  type/build level this Epic.
- `runResearchIntelligencePipeline` is not called from `buildResearchFoundationView`'s
  static-generation path, so unlike `toReasoningResult`/`toWorkflow` it is type-checked by
  `npm run build` but not functionally executed for all 65 topics during the build. Calling it
  from that path would recompute the same evidence/relationships/reasoning/workflow composition
  a second time per page — deliberately avoided (see `docs/architecture.md`). No functional
  correctness issue is known; this is a verification-depth gap, not a behavior gap.
- `IntelligenceExtensionPoints` (`executiveBriefing`, `voiceIntelligence`,
  `knowledgeCollaboration`, `missionMonitoring`, `analytics`, `agentInsights`) are reserved but
  always empty — no Epic has implemented any of them yet.
- No UI consumes `IntelligenceNetwork` — per EPIC-08's explicit scope ("Extension only. No UI.
  No React."), the layer is proven only at the type/build level this Epic.
- `buildResearchIntelligenceNetwork()` is not called from any static-generation path, so — like
  `runResearchIntelligencePipeline` — it is type-checked by `npm run build` but not functionally
  executed for real data during the build. No functional correctness issue is known; this is a
  verification-depth gap, not a behavior gap.
- `NetworkExtensionPoints` (Research Collaboration, Funding Discovery, Innovation Partnerships,
  University Networks, Government Programs, Industrial R&D, International Collaboration,
  Mission Matching, Knowledge Exchange, Evidence Sharing) are reserved but always empty — no
  Epic has implemented any of them yet.
- No fabricated entities were added to demonstrate the network richly: the current real
  demonstration (`lib/research/entities/`) has only 10 seed entities, of which 7 map onto the
  network's vocabulary (5 `research_topic` → `mission`, 1 `laboratory`, 1 `dataset`) with 3 real
  edges between them. The network engine is correct and ready for richer real data (actual
  researcher, university, company, investor, grant, patent, and publication records); none exist
  in this repository yet.
- No dashboards, pages, or isolated UI were built for the Workspace Platform — deliberately out
  of scope per the mission ("Do NOT create dashboards. Do NOT create pages. Do NOT create
  isolated UI."). `lib/workspace/` contains zero React.
- No UI consumes `WorkspaceView` — per EPIC-09's explicit scope, the platform is proven only at
  the type/build level this Epic.
- `buildResearchWorkspaceView()` is not called from any static-generation path, so — like its two
  dependencies (`runResearchIntelligencePipeline`, `buildResearchIntelligenceNetwork`) — it is
  type-checked by `npm run build` but not functionally executed for real data during the build.
  No functional correctness issue is known; this is a verification-depth gap, not a behavior gap.
- No new Intelligence Engine, business domain, ecosystem, or feature was built this Epic —
  deliberately out of scope per the mission ("This mission is NOT feature development."). EPIC-10
  performed a platform audit and Core Freeze only.
- The `createWorkflow` → `buildWorkflow` naming-consistency rename was identified but not
  performed this Epic, to keep the freeze itself low-risk (see `docs/CBAI-Platform-RC1.md`).
- No test suite was added — the Platform Core's correctness continues to rely on TypeScript's
  structural type-checking (`npm run build`) and manual audit, not automated tests. This is a
  pre-existing, platform-wide condition (no test runner is configured anywhere in this repo),
  not introduced or newly discovered by this Epic, but explicitly noted as a Future Risk in the
  RC-1 health analysis.
- Phase 1 built no builder functions, validators, seed data, adapter, or UI — deliberately out of
  scope for that phase ("This is NOT a UI task... Define only relationships. Do not create fake
  data. Do not create business logic."). Phase 2 added the Builder, Adapter, Query, Validation,
  and Providers — see the entry above.
- No UI, React, components, or dashboard were built for Phase 2 either — deliberately out of
  scope per its own mission ("No UI. No React. No Dashboard. No Components."). Every function in
  `lib/research-domain/` remains a plain data function; nothing renders anything.
- `researchDomainPipelineProviders` is not called from any static-generation path and is not
  passed to `runIntelligencePipeline` anywhere in this repo yet — it is type-checked by
  `npm run build` against the real `IntelligencePipelineProviders` contract, but not functionally
  exercised. Same verification-depth status as `researchIntelligencePipelineProviders` (EPIC-07),
  `buildResearchIntelligenceNetwork` (EPIC-08), and `buildResearchWorkspaceView` (EPIC-09).
- No UI, React, components, or pages were built for Phase 3 — deliberately out of scope per its
  own mission ("No React. No Components. No Pages. No UI."). `lib/research-workspace/` remains a
  plain data-composition module.
- `buildResearchWorkspaceContract` is not called from any static-generation path — type-checked
  by `npm run build`, not functionally exercised. Same verification-depth status as every prior
  real-data adapter in this series.
- No UI, React, components, or pages were built for Phase 4 — deliberately out of scope per its
  own mission ("No UI. No React. No Pages. No Components."). `lib/research-mission/` remains a
  plain data-composition and state-machine module.
- `applyMissionTransition` is not called from any static-generation path or any UI — type-checked
  by `npm run build`, not functionally exercised. No mission has ever actually transitioned
  states anywhere in this repository; every real `ResearchMission` the live UI now builds
  honestly starts and stays at `draft` with empty history, rendered as-is (the "Mission
  lifecycle" stat shows `Draft` for every real topic today) — the same "no fabricated provenance"
  status `Workflow` (EPIC-06) and `Workflow`-based demos have always had.
- `buildResearchMission` (and therefore `lib/research-mission/`) **is now called from the live
  UI** — the "Workspace Activation" release resolved the disconnection previously recorded here.
- The vertical slice + activation work exercises only `microbiology`'s data path structurally
  (via tests) and by rendering it live; the other 64 real topics are exercised only by
  `npm run build`'s static generation (confirmed successful, but not individually spot-checked in
  a browser or by a dedicated test). No topic-specific bug is known, but only one topic received
  the full manual verification pass described above.
- `RecommendedNextStep`/`intelligenceBrief` (added to `ResearchWorkspaceContract` during the
  vertical slice) have no dedicated shortcut field on `ResearchMission` itself — they remain
  reachable only via `mission.workspaceContract?.missionSummary.intelligenceBrief` /
  `.missionProgress.recommendedNextStep`, unlike `risks`/`researchQuestions`/etc., which
  `ResearchMission` does expose directly. Not added — the live UI reads them off
  `mission.workspaceContract` directly today, so no current caller needs a shortcut.

## Known technical debt

- `/companies` and `/universities` fabricated-score issue (see above) — pre-existing, not
  addressed by EPIC-01, EPIC-02, or EPIC-03.
- `lib/research/entities/` (a separate, broader entity/relationship catalog — organisms,
  diseases, technologies, publications, etc.) is now connected to the Foundation via the Global
  Intelligence Network (EPIC-08's `research-entity-network-adapter.ts`), but only for the 7 of
  14 entity types with an honest match in `IntelligenceEntityKind`. It is still **not** connected
  to `research-foundation-adapter.ts`'s `toRelationships()`, which continues to derive
  relationships only from `ResearchTopic.relatedMethods` / `relatedEvidenceTypes` — so a topic's
  `IntelligenceResult.relationships` and its Network-layer edges remain two separate views over
  related-but-different data. Unifying them is flagged as a natural next integration point.
- `lib/research/entities/`'s `organism`, `disease`, `method`, `experiment`, `open_question`, and
  `negative_result` entity types have no honest match in the Network's 16-kind vocabulary and
  cannot participate in `IntelligenceNetwork` today. Extending `IntelligenceEntityKind` (or
  accepting these types stay network-invisible) is left as a future decision, not made this
  Epic.
- `lib/research/review/` (the standalone `ResearchReview`/`ReviewAssignment`/etc. domain from
  the RI-BUILD-027 series) remains disconnected from any real topic — still only consumed by
  the standalone `/research/review` placeholder page.
- **Three unmigrated graph/relationship systems**, found and documented during EPIC-03
  (`docs/architecture.md` has the full breakdown):
  - `lib/graph/` — real, live, wired to `/graph` (countries/companies/universities only).
  - `lib/research/graph/` — real, live, backs the Global Research Network on `/research`.
  - `lib/intelligence/graph/` — a large (150+ file), entirely dormant confidence/contradiction/
    graph backend from an earlier build era; nothing outside `lib/intelligence/` consumes it.
  None were touched this Epic — the first two are real, working features with no way to
  visually verify a migration here, and the third is far larger than this Epic's scope
  supports auditing safely. `lib/relationships/` is the intended long-term unification point.
- `IntelligenceFoundationView.relationships` is not yet wired into any UI — proven only via
  `npm run build`'s type-check, same status as the rest of the Foundation view.
- **A third, non-integrated Evidence model**, found and documented during EPIC-04
  (`docs/architecture.md` has the full breakdown): `lib/intelligence/evidence.types.ts` defines
  a numeric `relevance: number` (0–100) scoring model with its own quality-assessment layer
  (`lib/intelligence/evidence/quality/`). Deliberately not integrated with the new universal
  Evidence pillar — numeric scoring is philosophically incompatible with the categorical,
  never-fabricated approach this platform otherwise enforces everywhere. It remains untouched
  and unused outside `lib/intelligence/`; unifying or retiring it is left as future work.
- Research catalog evidence's `verificationStatus` is honestly derived from a coarse, three-value
  catalog connection status (`catalog_available | source_not_connected | human_review_required`)
  — it can currently only ever be `not_started`, `not_applicable`, or `verification_pending`,
  never `verified` or `failed`, because no real verification workflow exists yet. All other new
  Evidence fields (`authors`, `publicationDate`, `originalSource`, `reliability`, etc.) are
  `undefined` for every existing Research evidence record, since no real source metadata exists
  to populate them — shown as absent, not guessed.
- **A fourth, non-integrated dormant subsystem**, found and documented during EPIC-05
  (`docs/architecture.md` has the full breakdown): `lib/intelligence/engine/`,
  `lib/intelligence/orchestrator/`, and related types implement an earlier "governed inference
  pipeline" design built on a numeric `ConfidenceAssessment` model — the same philosophical
  mismatch as the numeric Evidence model found in EPIC-04. Confirmed unused outside
  `lib/intelligence/`; not integrated with the new Reasoning Framework.
- Because Research catalog `verificationStatus` currently never reaches `"verified"` (see
  above), `ReasoningResult.observedFacts` is always empty for every real topic today — an honest
  reflection of the fact that nothing in the catalog has actually been verified yet, not a bug in
  the reasoning engine. `possibleOptions` is populated (one per catalog `relatedMethods` entry,
  since `toRelationships()` derives a `uses` relationship for each), but every option carries
  `support: "unverified"` and zero supporting evidence, because those catalog-derived
  relationships carry no evidence of their own. `risks` and `potentialConsequences` are always
  empty, since `toRelationships()` only derives `uses`/`depends_on` relationships today — none of
  the `contradicts`/`affects` types the reasoning engine looks for. The framework is correct and
  ready; the richer relationship data that would populate these sections meaningfully does not
  exist yet.
- **A fifth, non-integrated dormant subsystem**, found and documented during EPIC-06
  (`docs/architecture.md` has the full breakdown): `lib/intelligence/agents/tasks/` (a real,
  well-built agent task dispatch lifecycle) and `lib/intelligence/runtime/`
  (scheduler/queue/worker) solve a different problem — agent task dispatch, not an intelligence
  process lifecycle — and were not integrated with the new Workflow framework. Confirmed unused
  outside `lib/intelligence/`.
- Every research topic's demo `Workflow` (via `toWorkflow()`) honestly starts and stays at
  `not_started` with empty `history` — the pre-existing Research Workflow Engine only ever
  produces a point-in-time stage signal (`WorkflowResult.currentStage`), never a real recorded
  transition with an actor/timestamp/reason, so synthesizing a fake transition history from it
  would fabricate provenance. The framework is correct and ready for a real caller to record
  real transitions as work actually happens; none exists yet for Research Intelligence.
- The pre-existing `lib/research/workflow/` (`WorkflowStage`, 5 values) remains a separate,
  narrower, Research-specific tool and was not merged into the new universal `WorkflowState` (12
  values) — they answer different questions at different granularities. Unifying them (so a
  topic's real stage signal could drive real universal-workflow transitions) is flagged as
  future work, not attempted this Epic to keep the change set verifiable.
- **A sixth, non-integrated dormant subsystem**, found and documented during EPIC-07
  (`docs/architecture.md` has the full breakdown): `lib/intelligence/orchestrator/` is a full,
  real, nine-stage pipeline orchestrator (`request → evidence-collection → contradiction-
  detection → confidence-assessment → trust-assessment → graph-context → memory-context →
  reasoning-trace → intelligence-result`) with its own `IntelligenceResult` type — same name as
  the new Foundation-tier type, different module, no import collision, but the closest conceptual
  analog to this Epic's own mission found anywhere in the repo. Built on the same numeric
  `ConfidenceAssessment`/`TrustAssessment` scoring model found incompatible in EPIC-04/EPIC-05.
  Confirmed unused outside `lib/intelligence/`; not integrated.
- `WorkspaceView.knowledgeNetwork.network` is optional and, in the current real demonstration,
  always the **global** `buildResearchIntelligenceNetwork()` (all research entities), not a
  network scoped to just the current subject and its immediate connections — every
  `buildResearchWorkspaceView` call recomputes the same full network. Scoping the network to a
  subject before composing the Workspace is left as future work, not attempted this Epic.
- The pre-existing `lib/workspaces/` (plural, persona-based evidence-coverage explorers behind
  `/investor`, `/citizen`, `/government`) remains a separate, unrelated system and was not
  unified with the new singular `lib/workspace/` — they solve different problems at different
  layers (UI-facing methodology explainer vs. a universal, UI-agnostic composed data shape).
- **`createWorkflow`/`CreateWorkflowInput` naming inconsistency**, found and documented during
  EPIC-10 (`docs/CBAI-Platform-RC1.md` has the full write-up): every sibling engine's
  constructor uses `build*`, but the Workflow engine's uses `create*`, visible even in
  `IntelligencePipelineProviders.buildWorkflow` (a field named `build...` defaulting to a
  function named `create...`). Not renamed this Epic — the rename's blast radius (three code call
  sites, four historical Epic doc records) exceeded the freeze's low-risk bar. Flagged for a
  future, non-freeze commit.
- **Six zero-caller validator exports**, found and documented during EPIC-10:
  `validateEvidenceRecord`, `validateReasoningInput`, `validateWorkflowRecord`,
  `validateIntelligenceNetwork`, `validateIntelligencePipelineProviders`, and
  `validateWorkspaceView` are published, deterministic structural checks with no current caller
  anywhere in the repo. Not removed — each is real, documented capability awaiting a future
  caller (a persistence layer, a UI form, or a new domain adapter), not orphaned code. Risk: with
  no test suite, a future refactor could silently break one without any call site catching it.
- **`lib/research-domain/` now has real callers via Phase 2's adapter and providers, but nothing
  outside `lib/research-domain/` itself calls them yet.** `buildAllResearchDomainEntities()` is
  not invoked from any static-generation path, and `researchDomainPipelineProviders` is not
  passed to `runIntelligencePipeline` anywhere. `npm run build`'s full-project TypeScript pass
  type-checks every file including full construction of all 27 entity interfaces (confirmed by a
  successful build), but no page render or script actually executes
  `buildAllResearchDomainEntities()` — a verification-depth gap, not a known behavior gap, the
  same status every prior real-data adapter (EPIC-07/08/09) already carries.
- Of the 27 `ResearchEntityKind` values, only 9 have any real backing data today
  (`research_topic`, `research_mission`, `research_question`, `finding` [always empty — no
  persistence], `laboratory`, `dataset`, plus the honestly-empty `researcher` and `hypothesis`
  mapping functions that exist and are correct). The remaining 17 kinds (Engineer, Scientist,
  Academic, Student Researcher, Research Center, University, Funding Opportunity, Grant, Sponsor,
  Peer Review, Publication, Patent, Technology, Methodology, Experiment, Research Outcome,
  Research Impact, Research Program, Research Project) have no adapter mapping yet — no real data
  source for any of them exists anywhere in this repository.
- `lib/universities.ts`'s `University` and `lib/research/entities/research-entity-types.ts`'s
  `ResearchEntityType`'s `research_topic`/`method`/`open_question`/`negative_result` values
  remain unconnected to `lib/research-domain/` — the first because no real per-university data
  source was mapped this phase (Organizations only covered the entities registry's one
  laboratory), the other three by deliberate exclusion (documented in `docs/architecture.md`).
- `researchDomainPipelineProviders` recomputes the full 65-topic entity collection
  (`buildAllResearchDomainEntities()`) on every single `resolveFoundation`/`discoverEvidence`/
  `resolveRelationships` call — the same accepted-debt pattern as `buildResearchIntelligenceNetwork()`
  (EPIC-08) and `buildResearchWorkspaceView()` (EPIC-09); no caching was introduced.
- **`buildResearchWorkspaceContract` recomputes everything on every call**, following the exact
  same accepted-debt pattern: `researchWorkspaceProviders`'s three functions each independently
  call their own underlying builder with no memoization, so a single contract build triggers a
  fresh 65-topic `buildAllResearchDomainEntities()`, a fresh `buildResearchIntelligenceNetwork()`,
  and a fresh `runResearchIntelligencePipeline()`. Acceptable at today's data scale (10 seed
  entities, 65 topics); a real caching layer is future work, not attempted here to keep this
  phase's change set a pure composition exercise.
- Given the current real data, 11 of `ResearchWorkspaceContract`'s 19 sections will honestly be
  empty for every subject today: Open Hypotheses, Research Findings, Related Publications,
  Related Patents, Related Technologies, and Research Team have zero real backing records
  anywhere in this repository (see Phase 2's own debt entries above); Research Timeline and
  Funding Opportunities are empty for the same reason. Related Organizations and Related Datasets
  each have exactly one real entry. This is the honest, correct output of a real, working
  contract over real, currently-sparse data — not a defect.
- `RelatedOrganizationsSection.organizations` and `ResearchTeamSection.team` are typed as
  `readonly ResearchDomainEntity[]` (the full 27-kind union) rather than a narrower
  organization-only or people-only union, since TypeScript has no built-in way to express "one of
  these five specific members of a larger discriminated union" as a single reusable named type
  without declaring a new one — declaring one was judged not worth it for two fields. Callers
  narrow further by `entityKind` themselves if needed, using the same `ofKind`-style pattern the
  Builder already uses internally.
- **Given the current real, sparse Research Domain data, most of `ResearchMission`'s fields will
  honestly be empty for every real subject today** — Hypotheses, Expected Outcomes, Milestones,
  Deliverables, Related Publications/Patents, Participants are empty for the same reasons
  documented in Phase 2/3's own debt entries (no real backing data exists yet). Evidence,
  Timeline, Dependencies, Organizations, Related Datasets each have at most a handful of real
  entries. This is the honest, correct output of a real, working engine over real,
  currently-sparse data — not a defect.
- `buildResearchMission` recomputes everything on every call — `researchMissionProviders`'s three
  functions each independently rebuild their underlying collection with no memoization, so a
  single mission build triggers a fresh full Research Domain entity collection build, a fresh
  Workspace Contract build (which itself triggers a fresh Network build and a fresh orchestration
  pipeline run). The same accepted-debt pattern as every prior phase in this series; a real
  caching layer remains future work.
- `MISSION_LIFECYCLE_STATES` and `MISSION_STATE_TRANSITIONS` are a new, independent vocabulary
  and graph, not literally reusing `lib/workflow/`'s `WorkflowState`/`WORKFLOW_TRANSITIONS` code
  — this is a deliberate design choice (the two concepts are genuinely different), but it does
  mean the transition-validation logic itself (the shape of `canTransitionMission`/
  `validateMissionTransition`/`applyMissionTransition`) is structurally duplicated from
  `lib/workflow/workflow-transition.ts`, even though no Platform Core file was modified or its
  code copied verbatim. A future generic "state machine" utility that both could share is a
  plausible refactor, not attempted here to avoid touching the frozen `lib/workflow/`.
- **Two disconnected id spaces inside `KnowledgeNetworkSection`**, found and documented during
  the First Live Vertical Slice: `IntelligenceNetwork` (EPIC-08) node ids come from
  `lib/research/entities/`'s raw registry ids (e.g. `re-entity-research-topic-microbiology`);
  `IntelligenceResult`/`ResearchDomainEntity` ids come from the real topicId or Phase 2's
  `research-topic:${topicId}` convention. Both are real and correct on their own, but they don't
  share a namespace, so `knowledgeNetwork.network`/`.collaborationCandidates` cannot be honestly
  cross-referenced against the current subject by id. The new UI works around this by sourcing
  "related entities" from the Contract's own `relatedOrganizations`/`relatedDatasets` sections
  instead. Not fixed — reconciling the two id schemes is an architectural decision, not a
  vertical-slice-blocking defect.
- **A pre-existing Next.js dev-server limitation**, found and confirmed (via `git stash`, tested
  against the clean `main` tree) during the First Live Vertical Slice: with `output: "export"`,
  requesting an unknown `/research/[topicId]` path in `npm run dev` throws a 500
  ("Page is missing param... required with output: export config") instead of a clean 404. Not
  introduced by this work; does not affect the real static export (`npm run build` only ever
  generates the 65 real topic paths — any other path 404s at the hosting layer, never reaching
  React). `buildResearchWorkspaceContract` itself returns `undefined` safely for an unknown id,
  confirmed by an automated test. Not fixed — out of scope, and not a defect in application code.
- **Recomputation debt now runs on every real static-generation build, not just hypothetically**:
  `researchWorkspaceProviders`'s four resolvers each independently rebuild the full 65-topic
  Research Domain entity collection and the full global Network on every call, and
  `ResearchIntelligenceOverview` calls `buildResearchWorkspaceContract` once per topic page — so
  `npm run build` now triggers this recomputation up to 65 times (once per statically generated
  topic page). Acceptable at today's catalog scale (build completes in ~2–3 seconds including
  this); a future optimization (memoizing the two subject-independent resolvers at module level)
  would remove the duplicate work cheaply. Not attempted — out of scope for "make one vertical
  slice work," and doing so would touch the already-shipped Workspace Contract more than the two
  minimal, targeted fixes this phase already made.
- **The live UI now recomputes one more layer per topic page**: `buildResearchMission` calls
  `resolveWorkspaceContract` (which itself triggers the full pipeline/network/domain-entity
  rebuild above) *and* independently calls `resolveResearchDomainEntities`/
  `resolveResearchMissionEntity` again for its own `expectedOutcomes`/`dependencies`/goal/scope
  derivation — so the 65-topic Research Domain entity collection is now rebuilt roughly twice per
  page (once inside `resolveWorkspaceContract`, once directly by `buildResearchMission`) rather
  than once. Still bounded and acceptable at today's scale (`npm run build` remains a few
  seconds); the same future module-level-memoization fix noted above would remove this too. Not
  attempted here, per the mission's "Do NOT create any new Platform capability" — a caching layer
  is a new capability, not an activation.

## Product Activation Audit (2026-07-11)

Full route/navigation/capability inventory plus the highest-value, safest P0/P1 fixes from the
"CBAI Product Activation Program" master mission. Six real, fully working routes (`/dashboard`,
`/reasoning`, `/government`, `/investor`, `/citizen`, `/ai-control`) had no sidebar entry point at
all — fixed by rendering `internalNavSections` (renamed "Workspaces") as a second sidebar section.
Page metadata normalized across Home/Countries/Companies/Universities/Dashboard/Research routes
under one `title.template`. One redundant `deriveResearchWorkflow` call removed from the research
topic page (lifted to the shared parent). Full inventory, the companies/universities score
re-verification, the research-topic-page duplication findings, and the complete backlog of phases
not attempted this pass are recorded in `docs/product-activation-audit.md` — not duplicated here.

## Personal Intelligence Assistant, Release 2

Device-local Assistant profile (`lib/assistant/`, localStorage — honestly not a real account, no
auth/backend exists in this static-export app) plus a deterministic command router, both reusing
the existing product rather than adding a new AI. Persistent Command Center in the Topbar on every
route. `/settings` activated from a placeholder into a real profile form. Deleted a fully dead
decorative "AI command center" mockup (`components/core/*`, `lib/core.ts`) found to have zero
references anywhere. Full detail: `docs/version-history.md` v3.8.

## Empty States, Missing Capabilities, and Global Discovery, Release 3

Repo-wide honest-empty-state audit fixed a real cluster of bare, unexplained text (mainly three
`/research/review` panels rendering 8 bare "Not yet" values with no visible reason). Activated two
capabilities that were fully built but never wired to any UI: Global Search's knowledge/evidence
result groups (computed every search, silently discarded before this release) and a new real
"Research Topics" search group over the actual 65-topic catalog (previously not searchable by name
at all). Extended the Command Center with real parameterized commands ("find country X") and an
honest "not recognized yet" fallback instead of silently guessing search intent for unmatched
input. New one-vocabulary status system (`lib/product-status.ts`, `StatusBadge`) used in the fixed
panels and a new `EntityDataStatus` section now on all three Country/Company/University panels. My
Work now shows Assistant identity when a profile is active, and real "Recently Viewed" history
(activating the existing `RecentEntities` component a second time). 13 new tests
(`test:product-activation`) alongside the unchanged 11 research-slice tests. Full detail, including
what was deliberately not attempted this pass (full status-vocabulary migration, wiring
`RuntimeActivityFeed`, new search categories with too little real data to justify one): see
`docs/product-activation-audit.md` §8.

## Connected Intelligence Experience, Release 4

Investigated what real cross-entity relationship data exists before building anything: real
Country↔Company↔University links were already computed and already live, just tucked behind a
collapsed disclosure — surfaced a real count of them instead of recomputing. Found and
deliberately left unwired a second, fully-computed, zero-caller relationship graph
(`lib/registry/entity-links.ts`) that would have duplicated the first. Confirmed research topics
have zero real links to any country/company/university record. Activated a cluster of fully-built,
zero-consumer country/company/university components — real domain-grouped Economy/Judicial
System/Education/Health sections, named official-source lists, and the country timeline engine
(company/university have no timeline builder, so honestly none was added there). New
`IntelligenceContextPanel` (real related-entity count, evidence, reports, open questions, status)
replaces the narrower Release 3 `EntityDataStatus`. The Assistant now derives current-page context
(real research topic or focused entity) with zero new tracking. 4 new tests directly covering the
new context-resolution logic, 28 total passing. Full detail, including what was deliberately left
unwired to avoid duplicating already-live information: `docs/product-activation-audit.md` §9.
