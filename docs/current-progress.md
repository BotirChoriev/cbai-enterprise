# CBAI Current Progress

Snapshot as of EPIC-07. Update this file, not a new one, as state changes.

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

## Known technical debt

- `/companies` and `/universities` fabricated-score issue (see above) — pre-existing, not
  addressed by EPIC-01, EPIC-02, or EPIC-03.
- `lib/research/entities/` (a separate, broader entity/relationship catalog — organisms,
  diseases, technologies, publications, etc.) is not yet connected to the Foundation's
  `Relationship` pillar or to the topic detail page's workflow at all. The Foundation's
  research adapter currently derives relationships only from `ResearchTopic.relatedMethods` /
  `relatedEvidenceTypes`. Flagged as a natural next integration point, not attempted this Epic
  to keep the change set verifiable.
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
