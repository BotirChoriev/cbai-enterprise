# BUILD-051 Report — Runtime Integration (Policy + Session Registry)

**Build:** BUILD-051  
**Date:** July 2026  
**Scope:** Wire Session Registry and Policy Engine into Orchestrator  
**Status:** Complete — first runtime integration milestone

---

## Purpose

BUILD-051 integrates existing Runtime foundations into the Intelligence Orchestrator execution lifecycle:

1. **Session Registry** — register and update `RuntimeSession` on every orchestrated run
2. **Policy Engine** — authoritative policy evaluation at execution checkpoints

No new runtime features, queue/scheduler wiring, agent execution, or AI providers were added.

---

## Runtime Integration

### Session Registry lifecycle

```
Orchestrator.execute()
  → create RuntimeSession
  → register(session) in defaultSessionRegistry
  → session.start()
  → update(session) in registry
  → ... stage loop with update(session) after milestones ...
  → complete | fail | cancel
  → update(session) in registry
```

Uses the single **`defaultSessionRegistry`** singleton. `RuntimeSession` behavior is unchanged — the registry only holds references and refreshes lifecycle metadata.

### Policy evaluation points

| Checkpoint | When |
|------------|------|
| After session start | Before stage loop begins |
| Before each stage | Pre-stage transition gate |
| After contradictions | Post-contradiction enforcement |
| After execution | Post-run final evaluation |

### Authoritative policy mapping

| Decision | Orchestrator behavior |
|----------|----------------------|
| `allow` | Continue |
| `continue` | Continue |
| `deny` | Stop execution; session → `failed` |
| `cancel` | Terminate session → `cancelled` |
| `pause` | Not supported — append deterministic warning and continue |

---

## New Module

| File | Responsibility |
|------|----------------|
| `runtime/integration/runtime-integration.ts` | Registry sync + policy evaluate/enforce |
| `runtime/integration/runtime-policy-diagnostics.ts` | Policy fields for diagnostics attachment |
| `runtime/integration/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `orchestrator/orchestrator.ts` | Registry + policy integration |
| `orchestrator/execution-context.ts` | `lastPolicyDecision` field |
| `orchestrator/types.ts` | Policy fields on `OrchestrationSummary` |
| `diagnostics/types.ts` | `policyDecision`, `policyName`, `decisionReason` |
| `diagnostics/diagnostics-builder.ts` | Attach policy fields when diagnostics run |
| `runtime/index.ts` | Export integration helpers |
| `testing/test-scenarios.ts` | 3 new scenarios + policy-stop handling |

**Not modified:** Queue, Scheduler, Agent Runtime Contract, RuntimeSession internals, intelligence algorithms, UI.

---

## Diagnostics

When diagnostics stage runs, `IntelligenceRunDiagnostics` includes:

- `policyDecision`
- `policyName`
- `decisionReason`

`OrchestrationSummary` also carries the last policy decision for runs that stop before diagnostics.

---

## Test Harness

| Scenario | Validates |
|----------|-----------|
| `policy-deny` | Blocking contradiction → policy deny + registry `failed` |
| `policy-cancel` | Harness cancel trigger → registry `cancelled` |
| `session-registry-updates` | Register + update → registry `completed` |

Entity-scoped scenarios accept **policy-stopped runs** when blocking contradictions trigger authoritative deny (BUILD-051 behavior).

---

## Why Queue and Scheduler Remain Detached

BUILD-051 integrates **session tracking** and **policy enforcement** only. Queue (BUILD-042) and Scheduler (BUILD-043) address *when* and *how* work is backloged or timed — they require a worker/poller layer not yet wired. Connecting them prematurely would imply background execution, which violates Cloudflare Pages constraints and the incremental integration plan from BUILD-050.

Future builds will bridge: Scheduler → Queue → Orchestrator dispatch.

---

## Cloudflare Compatibility

- No timers, workers, or external services added
- Registry and policy remain in-memory pure TypeScript
- Integration runs synchronously within orchestrator `execute()`

---

## Verification

```bash
npm run lint
npm run build
# Test harness: runIntelligenceTestSuite() — 12/12 scenarios
```

---

## Summary

BUILD-051 makes the Policy Engine authoritative in the Orchestrator and keeps the Session Registry synchronized with every runtime session lifecycle transition. Queue and Scheduler integration remain deferred.
