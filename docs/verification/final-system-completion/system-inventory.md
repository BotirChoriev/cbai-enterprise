# CBAI Final System Completion — System Inventory

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Inventory date:** 2026-07-20
**Changed files at inventory:** 147 (109 modified, 38 untracked)

---

## 1. Repository safety state

| Check | Status |
|-------|--------|
| Correct branch | ✅ `preview/spatial-world-intelligence` |
| User work preserved | ✅ No stash/reset/clean |
| `.dev.vars` gitignored | ✅ Local secrets excluded from VCS |
| Prior verification preserved | ✅ `docs/verification/final-intelligence-os/` intact |
| Voice external key | ⏸ Paused — invalid/placeholder key; architecture complete |

---

## 2. Application architecture

```
app/layout.tsx
└── app/(dashboard)/layout.tsx          ← Platform shell (sidebar, topbar, ribbon, voice, composer)
    ├── Sidebar + OperatingNavigator
    ├── Topbar + MobileNavDrawer
    ├── LivingContextRibbon (conditional)
    ├── MentalModelStrip / AmbientTrustStrip (conditional)
    ├── main.cbai-platform-main         ← Single scroll owner
    ├── VoiceOperatorDock
    ├── OperationalObjectComposer
    └── CommandClarifyCard
```

**Provider stack:** `AuthProvider` → `PlatformContextProvider` → `MissionContextProvider` → `UniversalWorkspaceProvider` → `OperationalObjectProvider` → `VoiceOperatorProvider`

---

## 3. Route inventory

| Route | Page | Primary component | Shell wrapper | Notes |
|-------|------|-------------------|---------------|-------|
| `/` | `app/(dashboard)/page.tsx` | `SpatialWorldIntelligenceHome` | Spatial atmosphere; ribbon excluded | Globe anchor |
| `/my-work` | `my-work/page.tsx` | `MyWorkPageClient` → `MyWork` | `OperatingPageShell` | Operational index |
| `/search` | `search/page.tsx` | `SearchGatewayClient` | `OperatingPageShell` | Intent route; ribbon excluded |
| `/countries` | `countries/page.tsx` | `CountriesPageClient` | Entity explore | `?country=` detail |
| `/companies` | `companies/page.tsx` | `CompaniesPageClient` | Entity explore | `?company=` detail |
| `/universities` | `universities/page.tsx` | `UniversitiesPageClient` | Entity explore | `?university=` detail |
| `/research` | `research/page.tsx` | `ResearchPageClient` | `OperatingPageShell` | Catalog |
| `/research/[topicId]` | `research/[topicId]/page.tsx` | Topic clients | Mission companion | Topic detail |
| `/research/canvas` | `research/canvas/page.tsx` | `ResearchCanvasPageClient` | Canvas workspace | Expert surface |
| `/research/workspace` | `research/workspace/page.tsx` | Workspace client | Structured workspace | Advanced nav |
| `/evidence` | — | **Alias → `/knowledge`** | — | Nav label only |
| `/knowledge` | `knowledge/page.tsx` | `EvidenceExplorer` | `OperatingPageShell` | Canonical evidence route |
| `/graph` | `graph/page.tsx` | `GraphPageClient` | `OperatingPageShell` | Knowledge graph |
| `/reports` | `reports/page.tsx` | `ReportsCenter` | `OperatingPageShell` | Reports hub |
| `/analytics` | `analytics/page.tsx` | Redirect → `/reports` | Legacy alias | |
| `/investor` | `investor/page.tsx` | `InvestorPageClient` | Ecosystem workspace | Non-advisory |
| `/government` | `government/page.tsx` | `GovernmentPageClient` | Ecosystem workspace | Public admin evidence |
| `/governance` | `governance/page.tsx` | `GovernancePageClient` | Governance control | Platform rules |
| `/ai-control` | `ai-control/page.tsx` | Legacy alias | → governance | |
| `/trust` | `trust/page.tsx` | `TrustPageClient` | Reference route | Long-form |
| `/settings` | `settings/page.tsx` | `SettingsPageClient` | Reference route | Voice diagnostics |
| `/about` | `about/page.tsx` | `AboutPageClient` | Reference route | Product identity |
| `/citizen` | `citizen/page.tsx` | Citizen lens | Advanced nav | Secondary |
| `/reasoning` | `reasoning/page.tsx` | Reasoning lens | Advanced nav | Secondary |

**Navigation source:** `lib/navigation.ts`, `lib/navigation-operating.ts`, `components/operating/OperatingNavigator.tsx`

**Canonical IA (mandate vs repo):**

| Mandate section | Repo mapping | Gap |
|-----------------|--------------|-----|
| MAIN: Home, My Work, Search | ✅ Primary section | — |
| INTELLIGENCE: Countries…Evidence | ✅ Intelligence section | Evidence → `/knowledge` href |
| OPERATIONS: Reports, Graph, Investor, Government | ⚠ Partial | Graph/Investor/Government in Advanced disclosure |
| OVERSIGHT: Governance, Trust | ⚠ Split | Trust in Operations; Governance in Advanced |
| SYSTEM: Settings, About | ✅ System section | — |

**Decision required (Phase D):** Reconcile Trust/Governance placement vs progressive disclosure — document in `design-decisions.md`.

---

## 4. Platform shell components

| Component | Path | Role |
|-----------|------|------|
| Dashboard layout | `app/(dashboard)/layout.tsx` | Shell orchestration, dock clearance |
| Sidebar | `components/layout/Sidebar.tsx` | Logo lockup, nav, search hint |
| Topbar | `components/layout/Topbar.tsx` | Command spine, theme, locale |
| Mobile nav | `components/layout/MobileNavDrawer.tsx` | Tablet/mobile drawer |
| Operating navigator | `components/operating/OperatingNavigator.tsx` | Sectioned IA + live states |
| Living context ribbon | `components/operating/LivingContextRibbon.tsx` | Mission continuity (excluded on home/search/reference) |
| Mission operating bar | `components/mission/MissionOperatingContextBar.tsx` | Page-level companion (potential duplication) |
| Operating page shell | `components/shared/OperatingPageShell.tsx` | Route chrome wrapper |
| Voice dock | `components/voice-operator/VoiceOperatorDock.tsx` | Closed/open/live states |
| Voice provider | `components/voice-operator/VoiceOperatorProvider.tsx` | Lifecycle, broker, mic |
| Operational composer | `components/operational-objects/OperationalObjectComposer.tsx` | Draft work card entry |
| Command clarify | `components/operational-objects/CommandClarifyCard.tsx` | Ambiguous command resolution |

**Progressive disclosure rules:** `lib/intelligence-os/progressive-disclosure.ts`

---

## 5. Design token system

**Primary source:** `app/globals.css` (~103 `--cbai-*` variables)

| Category | Tokens (sample) | Adoption |
|----------|-----------------|----------|
| Canvas | `--cbai-canvas`, `--cbai-shell-bg`, `--cbai-glass-surface` | Shell + many components |
| Text | `--cbai-text-primary/secondary/muted/inverse` | Widespread |
| Brand | `--accent`, `--trust`, `--intelligence`, `--gold` | Partial; raw teal/zinc remain |
| Interaction | `--cbai-accent-primary/hover`, `--cbai-border-active`, focus ring | Nav + buttons |
| Spacing | `--cbai-space-*`, `--cbai-dock-inset`, `--cbai-panel-padding` | Layout |
| Shape | `--cbai-radius-sm/md/lg/xl` | Cards, controls |
| Depth | `--cbai-shadow-soft/elevated` | Panels |
| Nav | `--cbai-nav-text-*`, `--cbai-nav-bg-active` | Sidebar |

**Supporting:** `components/brand/brand-classes.ts`, `docs/design-system.md`

**Gaps vs mandate:** No `lib/design/tokens.ts` module; raw Tailwind (`zinc-*`, `border-teal-500/*`) in 100+ components; `--cbai-surface-glass` referenced but alias unclear; typography tokens implicit (`.cbai-display` only).

**Regression tests:** `scripts/test-final-product-completion.ts`, `scripts/test-platform-shell.ts`

---

## 6. Spatial World Intelligence (Home)

| Piece | Path |
|-------|------|
| Home orchestrator | `components/spatial-world/SpatialWorldIntelligenceHome.tsx` |
| Globe | `components/spatial-world/SpatialGlobe.tsx` (WebGL) |
| Country panel | `components/spatial-world/SpatialCountryPanel.tsx` |
| Operator panel | `components/spatial-world/SpatialOperatorPanel.tsx` |
| Atmosphere | `lib/intelligence-os/intelligence-atmosphere.ts` |

**Prior verification:** `docs/verification/spatial-world-screenshots/`, `final-intelligence-os/final/desktop-*-home.png`

**Tests:** `scripts/test-spatial-world-intelligence.ts`

---

## 7. Operational Object System

| Layer | Path |
|-------|------|
| Types | `lib/operational-objects/operational-object.types.ts` |
| Interpreter | `lib/operational-objects/command-interpreter.ts` |
| Store | `lib/operational-objects/operational-object-store.ts` |
| Routing | `lib/operational-objects/operational-object-routing.ts` |
| Linked work | `lib/operational-objects/linked-work-draft.ts` |
| Provider | `components/operational-objects/OperationalObjectProvider.tsx` |
| Composer | `components/operational-objects/OperationalObjectComposer.tsx` |
| Draft card | `components/operational-objects/OperationalWorkCard.tsx` |
| Index | `components/operational-objects/OperationalObjectIndex.tsx` |
| Linked-work CTA | `components/operational-objects/CreateLinkedWorkButton.tsx` |
| Command center | `components/assistant/AssistantCommandCenter.tsx` |

**Flow:** command → interpret → clarify OR open composer → explicit confirm → save once → route → My Work index

**Tests:** `test-operational-objects`, `test-command-pipeline`, `test-composer`

**Storage:** localStorage only (no server persistence)

---

## 8. Localization system

| Layer | Path |
|-------|------|
| Core dictionaries | `lib/i18n/dictionaries/{en,uz,ru,tr}.ts` |
| Types | `lib/i18n/dictionary-types.ts` |
| Hook | `lib/i18n/use-translation.ts` |
| Modular copy | `lib/i18n/platform-copy-*.ts` (100+ slices) |
| Entity UI runtime | `lib/i18n/entity-ui-translation.ts` |
| Graph UI runtime | `lib/i18n/graph-ui-translation.ts` |
| Nav translation | `lib/i18n/nav-translation.ts` |
| Operational objects | `lib/i18n/operational-object-translation.ts` |

**Locale provenance fields:** `contentLocale`, `createdLocale` in operational object types (backward-compatible)

**Tests:** `test-localization-closure`, `test-locale-completeness`, `test-rendered-uz-leakage`

---

## 9. Voice Operator

| Layer | Path |
|-------|------|
| Broker core | `lib/voice-operator/session-broker/pages-voice-session-broker.ts` |
| Upstream diagnostics | `lib/voice-operator/session-broker/upstream-diagnostics.ts` |
| WebRTC session | `lib/voice-operator/realtime/openai-webrtc-session.ts` |
| Local broker | `scripts/local-voice-broker.mjs` |
| Dev stack | `scripts/dev-voice.mjs` |
| Doctor | `scripts/doctor-voice.mjs` |
| Upstream test | `scripts/test-voice-upstream.mjs` |
| Settings panel | `components/settings/VoiceDiagnosticsPanel.tsx` |

**Architecture:** client → local broker → ephemeral credential → WebRTC → `/v1/realtime/calls`

**External blocker:** `OPENAI_API_KEY` invalid/placeholder → upstream `401 invalid_api_key`. Product states honest; live audio **not verified**.

---

## 10. Verification artifacts (existing)

| Directory | Purpose | Count |
|-----------|---------|-------|
| `docs/verification/final-intelligence-os/` | Prior IOS pass (before) | 54 PNG |
| `docs/verification/final-intelligence-os/final/` | Prior IOS pass (after) | 54 PNG |
| `docs/verification/final-intelligence-os/safari-reality/` | Safari UZ/voice captures | 7 PNG |
| `docs/verification/operational-object-system/` | OOS flow captures | 25 PNG |
| `docs/verification/spatial-world-screenshots/` | Globe captures | 6+ PNG |
| `docs/verification/final-product-completion/` | Earlier completion pass | exists |

**Scripts:** `verify-final-intelligence-os.mjs`, `verify-operational-object-system.mjs`, `verify-final-product-completion.mjs` (needs extension for this mandate)

**Prior scorecard:** `docs/verification/final-intelligence-os/scorecard.md` — critical surfaces ≥9/10 post-repair (2026-07-20)

---

## 11. Test suite inventory (mandate-relevant)

| Script | Coverage area |
|--------|---------------|
| `test-platform-shell` | Shell tokens, layout |
| `test-operational-objects` | OOS store/types |
| `test-command-pipeline` | Interpret → compose flow |
| `test-composer` | Confirm-before-save |
| `test-final-product-completion` | Tokens, UZ forbidden strings |
| `test-localization-closure` | Dictionary parity |
| `test-locale-completeness` | Key coverage |
| `test-rendered-uz-leakage` | Runtime UZ EN leakage |
| `test-spatial-world-intelligence` | Globe/home |
| `test-voice-operator` | Voice UX states |
| `test-voice-session-broker` | Broker + upstream classification |
| `test-voice-session-lifecycle` | Mic cleanup (1 failing — test drift) |
| `test-voice-realtime-webrtc` | WebRTC path |
| `test-voice-upstream` | Live upstream probe |
| `doctor:voice` | Dev diagnostics |

---

## 12. Prior pass vs this mandate — delta

| Area | Prior pass status | This mandate adds |
|------|-------------------|-------------------|
| Visual scorecard | ≥9/10 critical surfaces | New 10-dimension scorecard under `final-system-completion/` |
| Design tokens | Partial consolidation | Full semantic token audit + regression |
| IA | Operating navigator exists | Canonical IA reconciliation (Operations/Oversight) |
| OOS E2E | Composer + linked work tested | Full capture set (draft card, validation, My Work) |
| Localization | UZ entity chrome fixed | Evidence panels, research sub-panels, About/Government closure |
| Voice | Upstream diagnostics added | Dev port resilience, lifecycle test fix, external blocker doc |
| Interpreter mode | Not specified | Architecture spec only (Phase K) |
| Safari | Human checklist pending | Stop for approval; no false live claim |

---

## 13. Implementation readiness

**Phase A complete.** Next phases proceed in order:

1. **Phase B** — Token consolidation + regression tests
2. **Phase C** — Shell deduplication (mission chrome)
3. **Phase D** — IA reconciliation
4. **Phase E–H** — Route repairs + localization closure
5. **Phase J** — Voice lifecycle test fix + dev port diagnostics
6. **Phase K** — Interpreter mode spec
7. **Phase L–M** — Responsive/a11y + screenshot gate
8. **Phase N** — Test additions
9. **Phase O** — Performance audit
10. **Final report**
