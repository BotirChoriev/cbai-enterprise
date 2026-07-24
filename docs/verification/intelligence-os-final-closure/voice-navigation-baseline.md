# Voice navigation baseline

## Architecture (canonical — do not fork)
Realtime tool / transcript → `executeVoiceCommand` / `resolvePlatformActionFromIntent` → `applyPlatformActionResult` → allowlisted `router.push`
Registry: `lib/platform-actions/registry.ts`
Provider layout-scoped: `app/(dashboard)/layout.tsx` → `VoiceOperatorProvider`

## Session lifecycle
Internal navigation **must not** tear down Realtime (`void pathname` policy).
Teardown: Stop / Close / End / unmount / fatal / unload.

## Baseline defects addressed in this closure
1. **Guest gate missing on Realtime `onToolCall`** → FIXED: `guestMayExecute` before apply; pending intent + `/account?resume=pending`
2. **Dual transcript + tool navigation** → FIXED: `recentToolStatementRef` suppresses duplicate transcript orchestration within 3.5s
3. Historical href-ignore / mutation-skip / pathname teardown — already fixed in prior work; keep regression tests green

## Still PARTIAL / EXTERNAL
- Live Realtime E2E with valid broker credentials: EXTERNAL_BLOCKED until secrets/ops verified (values never logged)
- Broker origin-only mint: SF-1 production blocker (documented; not fully remediated in this pass beyond policy honesty)
- Level 2/3 confirmation is composer/UI gated; continue using OO draft cards for mutations
