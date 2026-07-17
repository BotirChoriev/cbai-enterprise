# CBAI Living Behavior Ledger

Living Intelligence behavior verification — July 16, 2026.

## Living Intelligence Score (honest)

| Dimension | Score | Blocker |
|-----------|-------|---------|
| Primary Living Intelligence | **8.6 / 10** | Browser journeys not re-run; focused home simplified but expert mode still dense |
| Research depth & translation | **8.2 / 10** | Lib-layer catalog English in open questions / negative results data |
| Voice/typing parity | **8.8 / 10** | Same resolver wired; permission UX unchanged |
| Knowledge explainability | **8.5 / 10** | Graph panel wiring partial |
| Continuity | **8.4 / 10** | Event bus exists; not all mutations audited this sprint |
| i18n completeness | **8.3 / 10** | UI shells complete; dynamic lib strings remain |

**≥9.0 not claimed** — browser workflow evidence and lib-layer translation debt block score.

---

## Behavior Ledger

### LB-001 — Home no-mission thinking desk
- **ID:** LB-001
- **Route:** `/`
- **Component:** `IntelligenceCanvas`
- **Action:** Load home without mission
- **Observed (before):** Dashboard grid, empty metrics, duplicate gateway
- **Expected:** Lead sentence, voice/type input, start mission, optional suggestions
- **Root cause:** Legacy canvas layout
- **Severity:** Major | **Confidence:** High
- **Affected:** Home, Operator
- **Correction:** No-mission branch simplified (prior + verified)
- **Regression risk:** Low
- **Test:** Visual; `test:epic-21-zero-learning-curve`
- **Status:** Fixed

### LB-002 — Home active mission thinking desk (focused)
- **ID:** LB-002
- **Route:** `/` (focused/standard density)
- **Component:** `IntelligenceCanvas`
- **Action:** Resume mission at home
- **Observed (before):** Six-cell grid + timeline + rail duplicated guidance
- **Expected:** Problem, question, stage, evidence, one next action, input
- **Root cause:** `primaryActionOnly` flag not applied to layout
- **Severity:** Major | **Confidence:** High
- **Correction:** Condensed desk + `KnowledgeBrainPanel` + `MissionOperatorPresence`
- **Test:** `test:knowledge-brain` §8
- **Status:** Fixed

### LB-003 — Knowledge route explainability
- **ID:** LB-003
- **Route:** `/knowledge`
- **Component:** `EvidenceExplorer`, `KnowledgeBrainPanel`
- **Action:** Open knowledge with mission
- **Expected:** Known/unknown/conflict/needs review buckets
- **Correction:** Panel above advanced evidence disclosure
- **Status:** Fixed

### LB-004 — Universal intent feedback
- **ID:** LB-004
- **Route:** Any command surface
- **Component:** `AssistantCommandCenter`
- **Action:** Type or speak recognized command
- **Expected:** Route + i18n intent category confirmation
- **Correction:** `resolveUniversalIntent` + category confirmation banner
- **Status:** Fixed

### LB-005 — Research topic translation shells
- **ID:** LB-005
- **Route:** `/research/[id]`
- **Component:** Open questions, negative results, evidence readiness, report view
- **Expected:** EN/UZ/RU/TR for all visible labels
- **Correction:** BUILD-026
- **Status:** Fixed (UI); catalog data English — deferred KB-D01

### LB-006 — ProjectHome live refresh
- **ID:** LB-006
- **Route:** `/my-work?project=`
- **Component:** `ProjectHome`
- **Action:** Mutate evidence/notes in sibling panel
- **Expected:** Summary updates without reload
- **Status:** Fixed (prior sprint `e6fe267`)

### LB-007 — Silent project entity link
- **ID:** LB-007
- **Route:** `/my-work`
- **Action:** Link/unlink entity to project
- **Expected:** Mission data revision fires
- **Status:** Fixed (prior sprint)

### LB-008 — Graph selection explanation depth
- **ID:** LB-008
- **Route:** `/graph`
- **Action:** Select node
- **Expected:** Knowledge brain buckets + mission relevance
- **Observed:** Partial — universal workspace inspector wired; graph-native panel may lag
- **Status:** Deferred (KB-D04)

### LB-009 — Mobile drawer focus trap
- **ID:** LB-009
- **Route:** Mobile nav
- **Action:** Open drawer, Tab, Escape
- **Expected:** Focus trapped; Escape closes; focus restored
- **Status:** Deferred — not re-verified in browser this sprint

### LB-010 — Mixed-language research catalog content
- **ID:** LB-010
- **Route:** `/research/[id]` open questions tab
- **Action:** Switch to RU/UZ/TR
- **Observed:** UI labels translated; category descriptions from lib still English
- **Status:** Deferred (KB-D01)

---

## Verification Gates (this sprint)

| Gate | Result |
|------|--------|
| `npm run lint` | Run at commit |
| `npx tsc --noEmit` | Run at commit |
| `npm run build` | Run at commit |
| `npm run test:knowledge-brain` | New — 8 tests |
| `test:*` (all) | Run at commit |
| Browser Playwright | Blocked — no browser in sandbox |
| Production preview journeys | Not run |

---

## Commits (this sprint)

Pending local commit after verification gate.

Push status: **Not pushed** (per program rules).
