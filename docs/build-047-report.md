# BUILD-047 Report — Agent Runtime Contract

**Build:** BUILD-047  
**Date:** July 2026  
**Scope:** Provider-agnostic Agent Runtime Contract foundation  
**Status:** Complete — contract and stub backends only; no execution

---

## Purpose

BUILD-047 introduces `lib/intelligence/agents/runtime/` — the **Agent Runtime Contract**, a stable interface between the CBAI Intelligence Runtime and future provider-specific agent backends.

The contract defines request/response envelopes, runtime context, lifecycle states, and backend operations (`prepare`, `validate`, `describe`, `supports`, `health`). The `execute()` method exists as a **signature only** — stub backends return `unsupported` with no SDK calls and no fabricated output.

---

## Architecture

```
Intelligence Runtime (BUILD-041)
        ↓
Agent Registry (BUILD-046) — metadata lookup
        ↓
Agent Runtime Contract (BUILD-047)
        ↓
StubOpenAIAgentBackend      ← not connected
StubAnthropicAgentBackend   ← not connected
StubGeminiAgentBackend      ← not connected
StubLocalAgentBackend       ← not connected
        ↓
Future: real provider adapters with SDK integration
```

### New modules

| File | Responsibility |
|------|----------------|
| `runtime/types.ts` | Support, health, operation result types |
| `runtime/provider-kinds.ts` | `ProviderKind` union and labels |
| `runtime/agent-lifecycle.ts` | Agent runtime lifecycle states |
| `runtime/agent-context.ts` | Agent context envelope |
| `runtime/agent-request.ts` | Agent request envelope |
| `runtime/agent-response.ts` | Agent response envelope |
| `runtime/agent-contract.ts` | `AgentRuntimeContract` + stub backends |
| `runtime/index.ts` | Barrel exports |

### Modified modules

| File | Change |
|------|--------|
| `agents/index.ts` | Re-exports runtime contract |
| `lib/intelligence/index.ts` | Public exports |

**Not modified:** Runtime execution wiring, Orchestrator, UI, EF, evidence, confidence, trust, queue, scheduler, session registry.

---

## AgentRuntimeContract

| Method | Behavior (BUILD-047) |
|--------|----------------------|
| `prepare(request)` | Validate envelope; advance lifecycle to `prepared` |
| `validate(request)` | Validate envelope and optional registry definition |
| `describe(request)` | Return factual backend + agent metadata description |
| `supports(request)` | Declare whether provider kind matches request |
| `health()` | Return `unconfigured` stub health — no external calls |
| `execute(request)` | **Signature only** — returns `unsupported` response |

---

## Envelopes

### AgentRequest

`envelopeId`, `agentId`, `providerKind`, `requestId`, `context`, optional `question`, `requestedAt`, `lifecycle`, optional `agentDefinition`

### AgentResponse

`envelopeId`, `requestEnvelopeId`, `agentId`, `providerKind`, `status`, `lifecycle`, `reason`, `warnings`, `blocking`, `timestamp`, `contractVersion`

No model content, tokens, or fabricated intelligence in responses.

---

## Agent Lifecycle

| Status | Meaning |
|--------|---------|
| `created` | New request envelope |
| `prepared` | Passed prepare step |
| `validated` | Passed validate step |
| `ready` | Ready for future execute |
| `executing` | Reserved for future execution |
| `completed` | Reserved terminal success |
| `failed` | Validation or contract failure |
| `cancelled` | Reserved cancellation |

---

## Provider Kinds

`openai` | `anthropic` | `gemini` | `local`

Each has a stub backend class implementing `AgentRuntimeContract`:

- `StubOpenAIAgentBackend`
- `StubAnthropicAgentBackend`
- `StubGeminiAgentBackend`
- `StubLocalAgentBackend`

Resolved via `resolveAgentRuntimeContract(providerKind)` or `STUB_AGENT_RUNTIME_CONTRACTS`.

---

## Future Provider Integration

1. Replace stub backend with real adapter implementing the same contract.
2. Wire Runtime/Orchestrator to call `prepare` → `validate` → `execute`.
3. Bind `AgentDefinition` from registry before dispatch.
4. Route by `ProviderKind` and capability match.
5. Enforce Policy Engine decisions before `execute`.

BUILD-047 keeps all provider paths behind the same contract boundary.

---

## Cloudflare Compatibility

- Pure TypeScript — no SDKs, timers, workers, or browser storage
- Stub `health()` — no network calls
- Stub `execute()` — returns deterministic unsupported response
- Edge-safe deterministic envelopes for testing

---

## Verification

```bash
npm run lint
npm run build
# Test harness: runIntelligenceTestSuite()
```

Expected: lint clean, build succeeds (18 static routes), test harness 9/9 scenarios pass.

---

## Summary

BUILD-047 establishes the Agent Runtime Contract between Runtime and future OpenAI, Anthropic, Gemini, and Local agent backends. All operations are metadata-only; execution is explicitly deferred.
