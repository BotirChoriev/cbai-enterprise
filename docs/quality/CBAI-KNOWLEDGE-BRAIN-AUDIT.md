# CBAI Knowledge Brain Audit

Knowledge Brain & Living Intelligence Completion — July 16, 2026.

## Baseline

| Item | Value |
|------|-------|
| HEAD at audit start | `d0e37bb` |
| Branch | local, 4 commits ahead of `origin/main` |
| Push | Not pushed (per program rules) |

## Summary

| Status | Critical | Major | Minor |
|--------|----------|-------|-------|
| Found | 0 | 6 | 8 |
| Fixed (this sprint) | 0 | 5 | 3 |
| Deferred | 0 | 1 | 5 |

---

## Fixed

### KB-001 — No unified knowledge explainability contract
- **Route:** `/knowledge`, universal workspace, graph inspector
- **Component:** (none — lib gap)
- **Severity:** Major | **Confidence:** High
- **Observed:** Universal Object contract existed but no progressive Known/Unknown/Conflict/Needs review buckets consumed by surfaces.
- **Expected:** One internal `KnowledgeExplanation` model with categorical trust states.
- **Root cause:** Fragmented evidence panels without shared brain resolver.
- **Correction:** `lib/intelligence-os/knowledge-brain.types.ts`, `knowledge-brain.ts`, `knowledge-source-contract.ts`, `KnowledgeBrainPanel.tsx` wired to `EvidenceExplorer` and `UniversalInspector`.
- **Regression risk:** Low — additive panel, wraps existing `resolveUniversalObject`.
- **Test:** `npm run test:knowledge-brain`
- **Status:** Fixed

### KB-002 — Voice and typing used parallel resolution paths
- **Route:** All routes with `AssistantCommandCenter`
- **Component:** `AssistantCommandCenter.tsx`
- **Severity:** Major | **Confidence:** High
- **Observed:** Voice called `route()` which used `resolveAssistantCommand` directly without intent categorization metadata.
- **Expected:** One normalized intent path with i18n category feedback.
- **Root cause:** No `resolveUniversalIntent` integration.
- **Correction:** `lib/intelligence-os/universal-intent.ts` + command center uses same resolver for voice and typing.
- **Test:** `test:knowledge-brain` §3, §6
- **Status:** Fixed

### KB-003 — Four research panels English-only
- **Route:** `/research/[topic]` tabs
- **Component:** `OpenResearchQuestions`, `NegativeResultsOverview`, `ResearchEvidenceReadiness`, `ResearchTopicReportView`
- **Severity:** Major | **Confidence:** High
- **Observed:** Hardcoded English headings and empty states.
- **Correction:** BUILD-026 `researchTopicCompletion` keys in EN/UZ/RU/TR.
- **Test:** `test:knowledge-brain` §7; `tsc` dictionary parity
- **Status:** Fixed

### KB-004 — Active mission home duplicated 6-cell grid in focused mode
- **Route:** `/` with active mission, focused/standard density
- **Component:** `IntelligenceCanvas.tsx`
- **Severity:** Major | **Confidence:** High
- **Observed:** `primaryActionOnly` still rendered full operating grid + timeline + context rail.
- **Expected:** One thinking desk — problem, question, stage, evidence, next action, input.
- **Correction:** Condensed desk when `primaryActionOnly`; timeline and rail gated by disclosure flags.
- **Test:** `test:knowledge-brain` §8
- **Status:** Fixed

### KB-005 — BUILD-026 i18n not in dictionaries
- **Severity:** Major | **Confidence:** High
- **Correction:** `knowledgeBrain`, `researchTopicCompletion`, `universalIntent` in `dictionary-types.ts` + all four dictionaries.
- **Status:** Fixed

### KB-006 — Project entity link mutations silent on mission refresh
- **Route:** `/my-work`
- **Severity:** Major | **Confidence:** High (prior sprint)
- **Correction:** `notifyMissionDataChanged("project")` on link/unlink — verified in prior commit `d0e37bb`.
- **Status:** Fixed (prior)

### KB-007 — Duplicate My Work mission guidance
- **Route:** `/my-work`
- **Severity:** Minor | **Confidence:** High (prior sprint)
- **Correction:** Removed duplicate next-action column from `MissionHomeSummary`.
- **Status:** Fixed (prior)

### KB-008 — No-mission home dashboard noise
- **Route:** `/`
- **Severity:** Minor | **Confidence:** High (prior sprint)
- **Correction:** Single intelligence lead + start mission + optional goal chips.
- **Status:** Fixed (prior)

---

## Deferred

### KB-D01 — Lib-layer English in research catalog helpers
- **Files:** `lib/research/open-questions/*`, `lib/research/negative-results/*`, layer status labels
- **Severity:** Major | **Confidence:** High
- **Observed:** Category descriptions and status labels remain English in catalog data surfaced in translated UI shells.
- **Reason:** Catalog content translation requires content strategy — UI labels translated, data deferred.
- **Proposed:** Translate catalog helper maps or pass through i18n resolver at query layer.
- **Status:** Deferred

### KB-D02 — Mission lifecycle stage labels English in lib
- **File:** `lib/intelligence-os/mission-lifecycle.ts`
- **Severity:** Minor
- **Status:** Deferred

### KB-D03 — Browser/responsive/a11y live verification
- **Severity:** Major | **Confidence:** Medium
- **Observed:** Playwright browser not available in CI sandbox; mobile drawer focus trap not re-verified live.
- **Status:** Deferred — requires local browser run

### KB-D04 — Graph selection → Knowledge Brain explanation
- **Route:** `/graph`
- **Severity:** Major | **Confidence:** Medium
- **Observed:** `UniversalInspector` wired; graph entity panel may not yet mount `KnowledgeBrainPanel` on all selection paths.
- **Proposed:** Wire graph side panel to same panel when selection resolves object ref.
- **Status:** Deferred

### KB-D05 — Evidence primary state detail strings English
- **File:** `lib/intelligence-os/evidence-primary-states.ts`
- **Severity:** Minor
- **Status:** Deferred — `knowledgeBrain.evidenceState*Detail` keys exist for future wiring

### KB-D06 — Topbar hides command center on home
- **Route:** `/`
- **Severity:** Minor
- **Observed:** Home compensates via `MissionOperatorPresence` prominent command — intentional.
- **Status:** Deferred (by design)

---

## Architecture Map (post-sprint)

| Module | Role |
|--------|------|
| `knowledge-brain.types.ts` | Universal explainability + source contracts |
| `knowledge-brain.ts` | Resolves objects/missions into buckets |
| `knowledge-source-contract.ts` | Future source taxonomy, honesty strings |
| `universal-intent.ts` | Deterministic intent categorization |
| `KnowledgeBrainPanel.tsx` | Progressive UI consumer |
| `universal-object.ts` | Existing object contract (wrapped, not replaced) |
| `mission-activation-events.ts` | Continuity bus (unchanged) |
