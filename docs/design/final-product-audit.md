# CBAI Final Product Audit

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Audit date:** 2026-07-20
**Changed files at audit:** 95 (69 modified, 26 untracked)

## Preserved systems (confirmed present)

| System | Status |
|--------|--------|
| Spatial World + interactive globe | Present (`components/spatial-world/`) |
| Voice Operator + WebRTC Realtime | Present (`components/voice-operator/`, broker in `lib/voice-operator/`) |
| Operational Object System + Draft Work Card | Present (`components/operational-objects/`) |
| Country / Graph linked-work | Present |
| EN / UZ / RU / TR dictionaries | Present |
| Verification screenshots | 71 PNGs under `docs/verification/` |
| User projects/missions (local storage) | Not modified by this sprint |

---

## Route audit matrix

Scoring: **Blocker** = prevents Intelligence OS feel; **Major** = visible product defect; **Minor** = polish.

### Home `/`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Spatial command surface exists; globe strong | — |
| Primary action | Speak to CBAI (hero) + floating Voice dock duplicate | Major |
| Duplication | Mission banner + Voice CTA when dock visible | Major |
| Hierarchy | Hero readable after token pass; ecosystem cards still navy-hardcoded | Minor |
| Contrast | Dark-green on navy reduced via semantic tokens | Minor |
| Spacing | Globe + rail balanced; lower sections compact | Minor |
| Localization | Spatial copy fully i18n | — |
| Voice overlap | Dock hidden on home (closed); hero action remains | Minor |
| Empty state | Projects/evidence honest empty copy | — |
| IOS gap | Needs unified intelligence signals from real counts only | Major |

### My Work `/my-work`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Operational index | — |
| Primary action | Create via composer pipeline | — |
| Duplication | Mission companion bar on some density modes | Minor |
| Voice overlap | Dock inset may cover lower cards on mobile | Major |
| Localization | Mostly i18n | Minor |

### Search `/search`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Universal intelligence search | — |
| Localization | Gateway localized; SearchLimitations "Timeline" English | Minor |
| Empty state | Honest no-results | — |
| IOS gap | Command bar + search gateway compete visually | Minor |

### Research `/research`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Scientific catalog | — |
| Duplication | Large hero + mission bar | Major |
| Localization | DiscoveryTopicCard "Shared methods"; network panels English | Major |
| Spacing | Hero typography oversized in some breakpoints | Major |
| IOS gap | Social-feed card density | Major |

### Research topic `/research/[topic]`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Localization | Evidence navigation labels English in subcomponents | Major |
| IOS gap | Strong when topic data present; navigation path labels leak | Major |

### Research Canvas `/research/canvas`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | 8-stage workflow | — |
| IOS gap | Workspace explorer strings partially English | Major |

### Evidence `/knowledge`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Evidence infrastructure | — |
| Duplication | Mission CTA + operating status | Minor |
| Localization | EntityEvidenceCoverage, EvidenceSourceCoverage, Graph edges English | **Blocker (UZ)** |
| Spacing | Advanced panels add vertical bulk | Major |
| IOS gap | Status overview good; detail panels feel admin-template | Major |

### Countries `/countries`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | World registry | — |
| Localization | **WorldIntelligenceMap fully English** | **Blocker (UZ)** |
| Spacing | Map section large but structured | Minor |
| IOS gap | Entity pattern good once map localized | Major |

### Country detail

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Localization | EntityNotFoundNotice English; trust section partial | Major |
| IOS gap | Overview/evidence/gaps pattern exists | Minor |

### Companies / Universities index & detail

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Localization | Filters localized (universities); Share default "Share"; report field labels English | Major |
| IOS gap | Shared entity shell; inconsistent badge language | Major |

### Reports `/reports`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Report readiness | — |
| Duplication | Mission bar removed (fixed) | — |
| Spacing | Empty state still sparse | Major |
| IOS gap | Needs honest "what creates a report" structure | Major |

### Trust `/trust`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Constitution & methodology | — |
| Hierarchy | Long card stack; needs reading rail | Major |
| Localization | Body i18n; version string hardcoded | Minor |

### Governance `/governance`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Rule registry | — |
| Decorative data | Pillar chart now captioned (registry counts) | Minor |
| IOS gap | Distinguish from Government workspace in copy | Minor |

### Investor `/investor`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Localization | Fully i18n (prior pass) | — |
| IOS gap | Non-advisory boundary preserved | — |

### Knowledge Graph `/graph`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Relationship canvas | — |
| Voice overlap | Dock inset applied | Minor |
| IOS gap | Canvas width adequate at lg | — |

### Settings `/settings`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Purpose | Preferences | — |
| Localization | Expert audit metrics English; capability offer from lib | Major |
| Voice | No diagnostics panel yet | **Blocker** |
| IOS gap | Form-card appearance reduced; needs Voice DX section | Major |

### About `/about`

| Dimension | Finding | Severity |
|-----------|---------|----------|
| Localization | Fully i18n | — |
| IOS gap | Meets editorial standard | — |

---

## Cross-cutting defects

1. **Mission context duplication** — GlobalMissionContextBar + MissionOperatingContextBar + page CTAs on multiple routes.
2. **English leakage clusters** — World map, evidence advanced panels, research navigation, entity report labels, Share button defaults.
3. **Voice** — Local setup honestly diagnosed; live Realtime not verified without `.dev.vars` key; no Settings diagnostics UI.
4. **Light/dark cohesion** — Semantic tokens in place; some components still use raw `zinc-*` / `#0a1528`.
5. **Playwright** — Browser install blocked by stale lock (environment); screenshot gate pending.

---

## What prevents 10/10 Intelligence OS feel

- Residual **English system UI** under UZ on high-traffic routes (countries, evidence).
- **Repeated mission chrome** instead of one living context ribbon.
- **Evidence and research sub-panels** still read as internal admin tools, not intelligence surfaces.
- **Trust** document stack without navigable reading system.
- **Reports** empty state lacks operational guidance tied to evidence/mission completion.
- **Voice diagnostics** not surfaced in Settings for engineers/operators.
- **Screenshot QA gate** not yet executed with scored recapture loop.
