# CBAI Current Progress

Snapshot as of EPIC-10 (**CBAI Platform RC-1** — Platform Core frozen) plus Research Intelligence
Phase 1 (Domain Foundation), Phase 2 (Domain Integration), and Phase 3 (Workspace Contract).
Update this file, not a new one, as state changes.

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
  Platform Core files touched, zero Research Domain files modified, zero UI/React/components.
  Verified structurally by successful `npm run build`.
- **Public entry experience**: hero, three-ecosystem model, capability flow, audience section,
  trust section — all real, honest content, no fabricated statistics.
- **Public search / Evidence Core** (`/search`, `/countries`, `/companies`, `/universities`):
  functional profile search and review; per the last constitution-compliance audit
  (`docs/platform-transformation-master-plan.md`), `/countries` is compliant but `/companies`
  and `/universities` still contain fabricated confidence scores — a known, pre-existing issue,
  not introduced by this Epic and not yet fixed.

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
