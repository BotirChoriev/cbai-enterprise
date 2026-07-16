# Repository → EPIC Map

**Audit date:** 2026-07-16  
**Repository:** `/Users/botirchoriev/Documents/cbai-enterprise`  
**Method:** Code and route inspection — not name assumptions.

---

## Routes

| Route | EPIC | Module | Maturity | Key files |
|-------|------|--------|----------|-----------|
| `/` | EPIC-02, EPIC-13 | Intelligence Canvas | live | `components/canvas/IntelligenceCanvas.tsx` |
| `/my-work` | EPIC-02 | Projects + Capability Passport | live | `components/my-work/MyWork.tsx` |
| `/search` | EPIC-08 | Search gateway | live | `components/search/gateway/` |
| `/countries` | EPIC-08 | Country intelligence | live | `components/countries/` |
| `/companies` | EPIC-08 | Company intelligence | live | `components/companies/` |
| `/universities` | EPIC-08 | University intelligence | live | `components/universities/` |
| `/research` | EPIC-07 | Research catalog | partial | `components/research/` (113 files) |
| `/knowledge` | EPIC-06 | Evidence infrastructure | partial | `app/(dashboard)/knowledge/` |
| `/graph` | EPIC-09 | Knowledge Universe | partial | `components/graph/GraphPageClient.tsx` |
| `/reports` | EPIC-02, EPIC-10 | Report readiness | partial | `components/reports/ReportsCenter.tsx` |
| `/reasoning` | EPIC-07 | Reasoning explorer | partial | `components/reasoning/ReasoningExplorer.tsx` |
| `/trust` | EPIC-01, EPIC-06 | Trust + accountability | live | `components/trust/TrustPageClient.tsx` |
| `/settings` | EPIC-12 | Operator preferences | live | `components/settings/` |
| `/account` | EPIC-15 | Cloud/local auth | partial | `components/account/` |
| `/about` | EPIC-01 | Platform identity | live | `components/about/AboutPageClient.tsx` |
| `/ai-control` | EPIC-01 | Supreme Constitution UI | partial | `components/governance-control/` |
| `/government` | EPIC-14 | Governance lens | preview | `components/workspaces/government/` |
| `/investor` | EPIC-14 | Economic lens | preview | `components/workspaces/investor/` |
| `/citizen` | EPIC-14 | Public lens | preview | `components/workspaces/citizen/` |
| `/core` | EPIC-15 | Core stub | planned | Redirect/honest stub |
| `/agents` | EPIC-15 | Agents stub | planned | Not active |
| `/workflows` | EPIC-15 | Workflows stub | planned | Not active |
| `/dashboard` | EPIC-02 | Legacy alias → `/` | redirect | `app/(dashboard)/dashboard/` |
| `/analytics` | EPIC-02 | Legacy alias → `/reports` | redirect | `app/(dashboard)/analytics/` |

---

## Engines and libraries

| Path | EPIC | Role | Maturity |
|------|------|------|----------|
| `lib/intelligence-os/` | EPIC-01, EPIC-02 | Mission runtime, pulse, accountability | functional (local) |
| `lib/intelligence-os/mission-lifecycle.ts` | EPIC-02 | Full lifecycle with next actions | functional |
| `lib/intelligence-os/legacy-trail.ts` | EPIC-02, EPIC-11 | Legacy from real artifacts | functional |
| `lib/missions/` | EPIC-14 | Declarative catalog — no runtime | schema only |
| `lib/research-mission/` | EPIC-05, EPIC-07 | Research lifecycle engine | functional (vertical) |
| `lib/capability/` | EPIC-03 | Capability Passport builder | foundation |
| `lib/discovery/` | EPIC-04 | Discovery engine (not connected) | foundation |
| `lib/evidence/`, `lib/foundation/` | EPIC-06, EPIC-08 | Platform Core evidence/entity | functional |
| `lib/intelligence/` | EPIC-15 | Alpha agent runtime | backend only |
| `lib/assistant/` | EPIC-12 | Personal Operator | functional (local) |
| `lib/epics/` | EPIC-01 | EPIC registry + safety rules | functional |
| `lib/constitution/` | EPIC-01 | Supreme principles | functional |
| `lib/governance/` | EPIC-01 | Constitution rules (declarative) | definitions only |

---

## Orphan / duplicate systems (honest)

| Issue | Location | Action |
|-------|----------|--------|
| Triple mission vocabulary | `intelligence-os`, `missions`, `research-mission` | Documented; only `intelligence-os` drives UI |
| BUILD-011 UI superseded | `components/intelligence-os/MissionThread.tsx`, etc. | Orphan — canvas replacements live |
| Duplicate home wrapper | `MissionCenter.tsx` = `IntelligenceCanvas` | Thin wrapper retained for tests |
| Marketing home stack | `components/platform/home/*` | Unwired after BUILD-013 |
| Entry cinematic unused | `EntryExperience.tsx` | Not routed |
| Dual navigation | `navigation.ts` + `navigation-operating.ts` | Both active (sidebar vs canvas) |

---

## Tests → EPIC coverage

| Test script | EPICs guarded |
|-------------|---------------|
| `test-epic-governance.ts` | EPIC-01, 03, 04, all |
| `test-epic-02-mission-os.ts` | EPIC-02 |
| `test-mission-runtime.ts` | EPIC-02, EPIC-10 |
| `test-intelligence-canvas.ts` | EPIC-02, EPIC-13 |
| `test-universal-intelligence-os.ts` | EPIC-01, EPIC-03 |
| `test-browser-regression.ts` | All primary routes |

---

## Misleading capabilities (restricted / honest labels)

- Live scientific API fetch — **not connected**
- PDF/CSV report export — **honestly unavailable**
- External collaborator matching — **not connected**
- Agent orchestration on `/agents` — **planned stub**
- Cloud sync without Supabase — **local-only default**
- Global human ranking — **forbidden by architecture**
