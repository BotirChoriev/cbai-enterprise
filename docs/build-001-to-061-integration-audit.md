# CBAI BUILD-001 to BUILD-061 Legacy Integration Audit

**Audit:** Legacy Build Integration  
**Date:** July 2026  
**Scope:** Analyze BUILD-001–061 outputs; integrate valuable non-demo legacy into Alpha platform  
**Status:** Complete — platform wiring only; no new frameworks or features

---

## Executive Summary

This audit reviewed **44 build reports** in `docs/build-*.md` (BUILD-016, BUILD-018, BUILD-021–061, plus BUILD-030a) and the current repository. The Enterprise Alpha platform already retained BUILD-021–061 intelligence foundations under `lib/intelligence/`. BUILD-061 wired System Monitor to live observability data.

This sprint added a **platform read layer** (`lib/legacy-build-integration/`) that exposes factual legacy status on active routes without modifying `runtime/`, `agents/`, `reasoning/`, or `lib/intelligence/` internals. Demo dashboard metrics were previously removed in BUILD-061; no fake data was reintroduced.

---

## Useful Legacy Modules Found

### Epistemic pipeline (BUILD-021–039)

| Module | Path | Value | Alpha status |
|--------|------|-------|--------------|
| Intelligence Engine | `lib/intelligence/engine/` | Core pipeline orchestration | Active — test harness |
| Evidence collectors | `lib/intelligence/evidence/` | Entity adapters live | Active |
| Quality | `lib/intelligence/evidence/quality/` | Evidence quality rules | Active in pipeline |
| Contradictions | `lib/intelligence/contradictions/` | Deterministic conflict detection | Active |
| Confidence | `lib/intelligence/confidence/` | Evidence support assessment | Active — not UI scores |
| Trust | `lib/intelligence/trust/` | Governance gates | Active |
| Diagnostics | `lib/intelligence/diagnostics/` | Run health summaries | Integrated — posture on Reasoning/Reports |
| Trace | `lib/intelligence/trace/` | Reasoning trace structure | Active in pipeline |
| Test Harness | `lib/intelligence/testing/` | 34 deterministic scenarios | Integrated — Governance metadata |

### Orchestration & runtime (BUILD-040–045, 058–059)

| Module | Path | Value | Alpha status |
|--------|------|-------|--------------|
| Orchestrator | `lib/intelligence/orchestrator/` | Execution coordinator | Active — wired |
| Policy Engine | `lib/intelligence/runtime/policy/` | Deterministic runtime rules | Integrated — Governance rule catalog |
| Session Registry | `lib/intelligence/runtime/registry/` | Session tracking | Integrated — System Monitor |
| Runtime Queue | `lib/intelligence/runtime/queue/` | Queue foundation | Integrated — System Monitor metrics |
| Runtime Scheduler | `lib/intelligence/runtime/scheduler/` | Schedule foundation | Integrated — System Monitor metrics |
| Runtime Worker | `lib/intelligence/runtime/worker/` | Caller-driven worker | Integrated — System Monitor |
| Observability | `lib/intelligence/observability/` | Health snapshots | Integrated — System Monitor (BUILD-061) |
| Dashboard collector | `lib/intelligence/dashboard/` | Platform view model | Active — System Monitor |

### Agent layer (BUILD-046–057)

| Module | Path | Value | Alpha status |
|--------|------|-------|--------------|
| Agent Registry | `lib/intelligence/agents/registry/` | Capability catalog | Foundation — not UI-wired |
| Agent Task Store | `lib/intelligence/agents/tasks/store/` | In-memory task CRUD | Integrated — metrics when populated |
| Dispatcher | `lib/intelligence/agents/dispatch/` | Capability matching | Foundation — not orchestrator-wired |
| Execution Coordinator | `lib/intelligence/agents/execution/` | Local execution path | Foundation |
| Local Runtime Adapter | `lib/intelligence/agents/providers/local/` | Deterministic adapter | Integrated — status only |
| Queue/Scheduler integration | `lib/intelligence/agents/queue/`, `scheduler/` | Agent-runtime bridge | Foundation — tested in harness |

### Platform foundations (post-BUILD-061 Alpha sprints)

| Module | Path | Value |
|--------|------|-------|
| Evidence Explorer | `lib/evidence-explorer.ts` | Evidence architecture UI input |
| Indicator Explorer | `lib/indicator-explorer/` | Indicator self-explanation |
| Search Intelligence | `lib/search-intelligence/` | Registry navigation hub |
| Evidence Watch | `lib/evidence-watch/` | Evidence change transparency |
| Governance Control | `lib/governance-control-center.ts` | Constitutional rules UI |

---

## Integrated Modules (This Audit)

| Legacy capability | Integration point | Route |
|-------------------|-------------------|-------|
| Observability snapshot | `collectRuntimeDashboardData()` + `PlatformStatusCard` | `/dashboard` |
| Session Registry summary | `SessionRegistrySummaryCard` via `collectLegacyBuildIntegrationModel()` | `/dashboard` |
| Runtime Worker state | `RuntimeMetricsGrid` worker metrics | `/dashboard` |
| Agent Task Store counts | `RuntimeMetricsGrid` agents section | `/dashboard` |
| Local Runtime Adapter health | System summary + metrics | `/dashboard` |
| Test Harness catalog | `GovernanceTestHarnessSection` | `/ai-control` |
| Policy rule catalog | `GovernanceRuntimePolicySection` | `/ai-control` |
| Diagnostics posture | `ReasoningDiagnosticsSection` | `/reasoning` |
| Diagnostics posture (summary) | `ReportsDiagnosticsSection` | `/analytics` |
| Legacy foundation status | `CoreLegacyIntegrationPanel` | `/core` |
| Runtime integration status | `SearchRuntimeStatusPanel` | `/search` |
| System summary (always visible) | `SystemSummaryCard` fix — shows versions even at cold start | `/dashboard` |

**New platform layer:** `lib/legacy-build-integration/` — read-only bridge; does not modify intelligence modules.

---

## Intentionally Rejected Demo / Obsolete Modules

| Item | Source | Reason rejected |
|------|--------|-----------------|
| Fake token usage chart | Pre-BUILD-061 dashboard | Fabricated metrics — removed BUILD-061 |
| Fake agent/workflow counts (24 agents, 12 workflows) | Pre-BUILD-061 dashboard | Demo data |
| Fake AI gateway latency / provider health | Pre-BUILD-061 dashboard | Fake provider health |
| Fake recent activity events | Pre-BUILD-061 dashboard | Fabricated activity |
| `components/Stats.tsx`, landing demo sections | BUILD-016 | Deleted — marketing demo |
| Stub OpenAI/Anthropic/Gemini backends | BUILD-055 | Not connected — no fake health UI |
| Graph adapter placeholders as live graph | BUILD-024/026 | Shows "Evidence Source Not Connected" |
| Memory store placeholders | BUILD-026 | Shows "Evidence Source Not Connected" |
| Document ingestion adapter | BUILD-033 | Not connected — no fake documents |
| `MissionControl` fake running agents | `/core` | Already shows 0 / not connected |
| CommandCenter live execution | `/core` | Disabled — static export honest label |
| ThinkingPipeline animated processing | `/core` | Illustrative structure only — kept with disclaimer |
| Orchestrator → Worker → Agent E2E wiring | BUILD-060 debt | Not integrated — would imply live automation |
| Cloud AI provider dashboards | Various | Zero Demo Policy |
| Confidence/trust as UI scores | BUILD-026/027 | Epistemic layers — not dashboard rankings |

---

## Deleted / Ignored Legacy Pieces

| Piece | Disposition |
|-------|-------------|
| Landing page demo components | Deleted per BUILD-016 |
| Pre-BUILD-061 dashboard demo metrics | Removed BUILD-061 — not restored |
| BUILD-001–015 reports | Not present in repo — referenced only in BUILD-016/018 audits |
| BUILD-017, BUILD-019, BUILD-020 reports | Not present in repo |
| `StubLocalAgentBackend` duplicate | Ignored — map uses `localRuntimeAdapter` (BUILD-060) |
| Auto-executing worker loops | Ignored — caller-driven only (BUILD-059) |
| Browser storage runtime state | Never implemented — Cloudflare compatible |

---

## Active Platform Impact

| Route | Before audit | After audit |
|-------|--------------|-------------|
| `/dashboard` | BUILD-061 live metrics; summary hidden on cold start | Renamed header to System Monitor; Session Registry card; summary always visible |
| `/ai-control` | Governance rules only | Policy engine rules + test harness metadata |
| `/reasoning` | Pipeline explorer | Diagnostics posture section (factual not-connected labels) |
| `/analytics` | Reports center | Diagnostics posture summary |
| `/search` | Search gateway + intelligence | Runtime integration status strip |
| `/core` | Extended shell with honest labels | Legacy integration status panel + links |
| `/knowledge` | Evidence explorer + watch | Unchanged — already constitution-compliant |

**Static routes:** 21 — unchanged.

---

## Remaining Gaps

| Gap | Priority | Notes |
|-----|----------|-------|
| Orchestrator → Worker → dispatch → execution E2E | High | Foundation exists; not wired by design |
| Graph adapter live data | High | Diagnostics shows Not Connected |
| Memory store live data | High | Diagnostics shows Not Connected |
| Document ingestion | Medium | BUILD-033 placeholder only |
| Durable runtime persistence | Medium | In-memory resets per isolate |
| Policy decisions on live sessions | Medium | Rules shown; no sessions on static page load |
| Test harness execution in UI | Low | Metadata only — suite runs via harness API/CI |
| OpenAI/Anthropic/Gemini backends | Low | Stub contracts — intentionally disconnected |
| BUILD-001–015 documentation | Info | Reports not in repository |

---

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run build` | Pass — 21 static routes |
| Demo metrics restored | No |
| Fake AI/provider health | No |
| `lib/intelligence/` modified | No |
| `runtime/`, `agents/`, `reasoning/` modified | No |

### Manual checklist

- [ ] `/dashboard` — observability health, session registry, worker state, empty-state messages
- [ ] `/ai-control` — policy rules list, harness version/scenario count
- [ ] `/reasoning` — diagnostics posture with Not Connected labels
- [ ] `/analytics` — diagnostics summary section
- [ ] `/search` — runtime integration status
- [ ] `/core` — legacy integration panel with System Monitor link

---

## Compliance

Aligned with CBAI Constitution v1.0, Standards v1.0, Governance Framework v1.0, Zero Demo Policy, Evidence First, and User Value Before Expansion.

**No commits created per mission instructions.**
