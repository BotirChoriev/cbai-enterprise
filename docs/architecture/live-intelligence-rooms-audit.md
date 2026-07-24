# Phase 0 Audit — Live Intelligence Rooms

**Branch:** `preview/spatial-world-intelligence`  
**Date:** 2026-07-24

## Reusable architecture
- Global `VoiceOperatorProvider` (WebRTC + broker + teardown) — do not embed a second stack
- Operational Object composer (suggest → confirm) — rooms propose drafts only
- Namespaced localStorage + migrate patterns from shared persistence
- EN/UZ/RU/TR dictionary system + nav translation map
- Spatial OS theme tokens (`--cbai-*`) and glass/solid surfaces
- Static-export routing via query params (`?id=`) rather than dynamic segments

## Duplicated / avoid
- MissionRoom chat metaphor — wrong product identity
- Fake multi-party SFU — no signaling infra on Cloudflare Pages
- Second Realtime client inside rooms

## Missing primitives (addressed in this build)
- Canonical live session model + migration
- Translation routing with glossary uncertainty
- Room store lifecycle + consent
- Unified Meeting / Lab / Practice / Collaboration shell
- Country → rooms honest link panel

## Fragile lifecycle (pre-existing Voice P0)
- SPA route change previously kept mic live — fixed on branch (uncommitted P0): tear down tracks, preserve transcript
- Capture truth must use track `readyState`, not button intent

## Localization gaps found
- Hardcoded “Room type” / “mic live” — fixed via `liveRooms` copy
- New surfaces require leaf-key parity across EN/UZ/RU/TR

## Honesty constraints
- Multi-party audio: EXTERNAL_BLOCKED
- No fabricated globe activity / live expert counts
- Lab never implies physical CBAI experiment execution
- AI practice participants labeled `ai_simulated`

## Cloudflare / export
- No Next API routes for rooms; voice broker remains Pages Function only
- Client persistence for room records is acceptable for Preview MVP
