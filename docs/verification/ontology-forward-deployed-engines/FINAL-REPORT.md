# Ontology + Forward-Deployed Engines — FINAL REPORT

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690` (unchanged)
**Date:** 2026-07-21
**Status:** Foundation complete — stopped for approval (no commit / push / deploy)

---

## Git status

| Metric | Starting (gap report) | Final |
|--------|----------------------|-------|
| Total porcelain paths | 181 | **199** |
| Modified | 134 | **137** |
| Untracked | 47 | **62** |
| Staged | 0 | **0** |

HEAD commit unchanged. `main` untouched. No stash/reset/clean/restore.

---

## Explicit confirmations

- **No commit**
- **No push**
- **No deploy**
- **`main` untouched**
- **User data preserved** (localStorage keys unchanged; adapters are read/projective; migrations idempotent + unknown-field tolerant)
- **Secrets not exposed** (no API keys in client sources; broker pattern preserved)

---

## Architecture decisions (selected options)

Documented in `docs/architecture/ontology-forward-deployed-engines-decisions.md`:

1. **Device-local ontology store** (not Supabase-first)
2. **Operational Objects remain canonical** for real work; ontology links beneath
3. **Plan-only engines + allowlisted platform actions** for execution
4. **Explicit 11-state engine lifecycle**
5. **Dedicated ontology object lifecycle** (`draft → awaiting_confirmation → … → archived`)
6. **Extend platform-actions with `engine.*` IDs** (voice/text parity)
7. **Reusable EngineWorkspace + route entry strips** (no page rewrites)

Gap inventory: `docs/architecture/ontology-forward-deployed-engines-gap-report.md`

---

## Ontology inventory

**Module:** `lib/ontology/` (types, object-kinds, relationship-kinds, schema-registry, validation, normalization, migrations, provenance, permissions, query, ontology-service, legacy-adapters)

**Object kinds (27):** person, organization, country, region, company, university, research_topic, research_question, hypothesis, claim, evidence, source, dataset, indicator, project, mission, work_plan, task, decision, review, report, risk, limitation, policy, standard, meeting, translation_session

**Relationship kinds include:** contains, supported_by, contradicted_by, derived_from, concerns, located_in, produced_by, reviewed_by, depends_on, part_of (typed allowlist)

**Migration strategy:** idempotent, non-destructive, unknown-field preservation, legacy adapters for Operational Objects / Projects / Missions / registry / research topics — existing records never deleted or renamed.

Docs: `docs/architecture/cbai-ontology.md`, `docs/architecture/ontology-migration-policy.md`

---

## Engine registry (7)

| Engine | ID | Default |
|--------|-----|---------|
| Research | `research` | plan + confirm |
| Evidence | `evidence` | read-only default |
| Country Intelligence | `country_intelligence` | read-only default |
| Organization Intelligence | `organization_intelligence` | read-only default |
| Mission | `mission` | plan + confirm |
| Governance Review | `governance_review` | plan + confirm |
| Multilingual Meeting | `multilingual_meeting` | foundation only — honest limitations |

**Module:** `lib/forward-deployed-engines/`
Docs: `docs/architecture/forward-deployed-engines.md`, `docs/architecture/engine-security-boundaries.md`

### Confirmation & security boundaries

- No mutation from model suggestion alone
- Engine start opens workspace / plan — **does not** write records
- Confirm actions require explicit human confirmation
- Execution only via allowlisted action IDs
- Arbitrary hrefs / javascript URLs rejected
- Voice stop/close lifecycle preserved
- Official source material kept distinct from localized UI copy

---

## Route integrations

`EngineRouteEntryStrip` + `EngineWorkspaceProvider` (dashboard layout):

| Route | Engine entry |
|-------|----------------|
| `/` | Mission |
| `/research` | Research |
| `/knowledge` | Evidence |
| `/graph` | Evidence (relationships) |
| `/countries`, `/companies`, `/universities` | Country / Organization (via EntityExploreShell) |
| `/my-work` | Mission |
| `/reports`, `/governance` | Governance Review |
| `/government` | Evidence (public administration) |

UX components: `components/forward-deployed/*` (Objective, Context, ProposedPlan, MissingInputs, EvidenceRequirements, Risk, Confirmation, Timeline, Result, StatusBadge)

---

## Localization

EN / UZ / RU / TR forward-deployed copy modules:

- `lib/i18n/platform-copy-forward-deployed-{en,uz,ru,tr}.ts`

Wired into dictionary types. Locale completeness suite passes.

---

## Accessibility notes

- Semantic section structure in EngineWorkspace panels
- Status badges for engine lifecycle
- Confirmation gate before mutation
- Mobile 390×844 captures show no horizontal overflow on Evidence / Research entry strips
- Reduced-motion / Safari mic cleanup: existing Voice Operator paths preserved (manual Safari audio still required)

---

## Tests and build

| Suite | Result |
|-------|--------|
| `npm run test:ontology-forward-deployed-engines` | **21/21 PASS** |
| `npm run test:operational-objects` | **9/9 PASS** |
| `npm run test:command-pipeline` | **6/6 PASS** |
| `npm run test:composer` | **4/4 PASS** |
| `npm run test:voice-platform-operator` | **31/31 PASS** |
| `npm run test:spatial-world-intelligence` | **15/15 PASS** |
| `npm run test:locale-completeness` | **16/16 PASS** |
| `npm run test:final-product-completion` | **23/23 PASS** |
| `npx tsc --noEmit` | **PASS** |
| `npm run lint` | **0 errors** (warnings only, pre-existing + unused imports cleaned in ontology test) |
| `npm run build` | **PASS** |

---

## Screenshots

**Directory:** `docs/verification/ontology-forward-deployed-engines/`
**Count:** 36 PNGs
**Capture log:** `capture-log.json` — **0 console errors**, **0 hydration issues**

Includes:

- 1920×1080 / 1440×900 / 390×844 dark captures for Research, Evidence, Country, Organization, Governance, My Work, Reports, Government, Graph, Home
- States: research engine opened (`awaiting_confirmation` + proposed plan), confirmation/timeline samples, light theme, UZ stress samples

Manual inspection: Research Engine overlay shows Objective → Context → What CBAI understands → Proposed plan → Evidence requirements with **AWAITING CONFIRMATION** gate. Mobile Evidence shows Operational Workspace entry without overflow.

---

## Changed-file focus (this mission)

Primary additions:

- `lib/ontology/**`
- `lib/forward-deployed-engines/**`
- `components/forward-deployed/**`
- `lib/i18n/platform-copy-forward-deployed-*.ts`
- `scripts/test-ontology-forward-deployed-engines.ts`
- `scripts/verify-ontology-forward-deployed-engines-ui.mjs`
- Architecture docs under `docs/architecture/*ontology*`, `*forward-deployed*`, `engine-security-boundaries.md`
- Verification screenshots under `docs/verification/ontology-forward-deployed-engines/`

Route wiring touches (additive only):

- `EntityExploreShell`, `GraphPageClient`, `GovernancePageClient`, `ReportsCenter`, `GovernmentPageClient`, `SpatialWorldIntelligenceHome`
- Platform-action engine start now also navigates to allowlisted workspace routes (preserves chemistry → `/research` behavior)

Large pre-existing uncommitted work (voice platform actions, operational objects, spatial world, etc.) **preserved intact**.

---

## Known limitations

1. **Multilingual Meeting Engine** is foundation-only — simultaneous interpretation is **not** claimed complete.
2. Ontology store is **device-local**; no cloud ontology table.
3. Engines produce **plans**; they do not autonomously complete research or verify evidence.
4. Governance rules remain declarative; review engine produces checklists, not runtime enforcement.
5. Screenshot UZ stress depends on localStorage profile keys; full RU/TR longest-label stress and Voice + proposed-plan audio path need **manual Safari** follow-up.
6. `test:mission-center` still has a pre-existing Sidebar `/w-56/` assertion failure unrelated to this foundation.

---

## Manual Safari checks still required

- [ ] Hard refresh `/knowledge` — hydration + EvidencePrimaryStatesPanel
- [ ] Voice: research phrase → engine workspace → confirm → Stop/Close releases mic
- [ ] Voice never silently creates projects / saves OO / publishes reports
- [ ] RU/TR longest labels in EngineWorkspace confirmation footer
- [ ] Light/dark engine overlay contrast on Safari

---

## Stop for approval

Foundation is ready for review. No commit, push, or deploy performed.
