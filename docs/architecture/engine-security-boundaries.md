# Engine Security Boundaries

## Confirmation Gates

| Action | Gate |
|--------|------|
| Create ontology object | `draft` → explicit `confirmCreation()` |
| Engine run execution | `awaiting_confirmation` → `confirmEngineRun()` |
| Operational object save | Existing composer confirm flow |
| Voice mutation | Never silent — `awaitingConfirmation: true` on apply |

## Allowlisting

- Platform actions: fixed `PlatformActionId` registry (~52 actions including engine.*)
- Navigation: `isAllowedNavigationHref()` — no arbitrary hrefs
- Engine actions per engine: `allowlistedActions` in engine registry
- Realtime tool: `execute_platform_action` only — no raw mutation payloads

## Forbidden

- Model-generated hrefs
- Arbitrary tool execution
- Silent project/mission/report creation via voice
- Claiming evidence verified without source references
- Autonomous agent loops

## Voice Lifecycle

- `voice.stop` — stops microphone capture
- `voice.close` — releases WebRTC resources, closes dock
- Engine workspace cancel — `cancelEngineRun()` without side effects

## Government vs Governance

| Surface | Route | Engine |
|---------|-------|--------|
| Government workspace | `/government` | Evidence (read-only lens) |
| Governance control | `/governance` | Governance Review Engine |

Platform actions and intent matcher disambiguate `navigate.government` vs `navigate.governance`.

## Provenance Exposure

Every engine result exposes: user-provided inputs, inferred inputs, missing evidence, limitations, engine version, schema version, confirmation event, execution history.

Official source text remains in `sourceReferences` — distinct from localized UI copy (`forwardDeployed.*` dictionary keys).
