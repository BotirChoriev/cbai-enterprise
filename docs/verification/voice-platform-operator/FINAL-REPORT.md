# Voice Platform Operator — Design Decisions

Branch: `preview/spatial-world-intelligence`
Scope: P0 platform navigator (Phases 1–2 architecture)

## Root causes (pre-implementation)

| Gap | Root cause |
|-----|------------|
| Voice text commands did not navigate | `VoiceOperatorProvider` called `submitCommand(..., "creation_only")`, skipping navigation |
| Three divergent intent paths | Topbar → `interpretCommand`; voice text → same but creation-only; Realtime → no tool loop |
| Unsafe navigation tool | `navigate_internal` accepted raw `href` from model |
| No chemistry/domain layer | Research routing relied on catalog topic names only |
| Identity copy drift | Uzbek intro did not match approved operator spec |

## Selected architecture (3-option evaluation)

### Canonical action system

| Option | Safety | Determinism | Maintainability | Verdict |
|--------|--------|-------------|-----------------|---------|
| A. Extend `assistant-commands` only | Medium | High | Low (duplicate with Realtime) | Rejected |
| B. New `lib/platform-actions` registry + shared resolver | High | High | High | **Selected** |
| C. Model-only routing | Low | Low | Low | Rejected |

### Realtime tool execution

| Option | Safety | Verdict |
|--------|--------|---------|
| A. Client executes after `response.function_call_arguments.done` | High (allowlist + validation) | **Selected** |
| B. Server-side navigation proxy | Medium (more moving parts) | Rejected |
| C. Trust model `href` | Low | Rejected |

### Post-navigation guidance

| Option | UX clarity | Verdict |
|--------|------------|---------|
| A. Dismissible `OperatorGuidanceCard` in dock | High, non-blocking | **Selected** |
| B. Permanent floating overlay | Low (obstruction) | Rejected |
| C. Spoken-only guidance | Medium (no visual focus) | Rejected |

## Canonical registry

- Typed IDs: `navigate.*`, `entity.*`, `research.open_topic`, `voice.stop|close`, `*.compose`
- Mutations open Draft Work Card only; `operational_object.confirm_create` never auto-saves
- `isAllowedNavigationHref()` blocks external URLs and arbitrary paths
- Realtime exposes single tool: `execute_platform_action` with enum `action_id`

## Realtime flow

1. Broker session includes `tools: buildPlatformRealtimeTools()`
2. Data channel receives `response.function_call_arguments.done`
3. Client validates args, dedupes `call_id`, executes allowlisted action
4. Client sends `conversation.item.create` (`function_call_output`) + `response.create`
5. Stale/disconnected sessions ignore late results

## Typed / voice parity

- `interpretCommand`: search → creation → platform navigation → voice fallback
- Voice dock text: `resolvePlatformAction` + `applyPlatformActionResult` + full `submitCommand`
- Topbar: unchanged entry through `interpretCommand`

## Confirmation boundaries

- All `*.compose` actions → draft only
- User must confirm in Operational Object composer before save
- Tool results include `requiresConfirmation: true` when draft opened

## Security

- `OPENAI_API_KEY` remains in `.dev.vars` / broker only
- Client receives ephemeral `ek_*` credentials
- No raw tool payloads in user-facing UI

## Known limitations

- Chemistry has no dedicated catalog topic; routes to materials-science-related topic or `/research` fallback
- Realtime tool handler opens navigation href directly; draft composer from tool calls still requires wiring through `openComposer` in tool callback (partial — draft flag only sets dock state)
- Safari manual 20-step checklist requires human verification in browser

## Safari manual verification

**Status: REQUIRES_HUMAN** — stack healthy (`doctor:voice` PASS, `:3000` + `:8788` listening). Automated agent cannot verify microphone/audio in Safari.

## Explicit confirmations

- No commit, push, deploy
- `main` untouched
- `.dev.vars` uncommitted
- API key not printed in doctor output or tests
