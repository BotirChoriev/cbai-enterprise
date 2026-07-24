# CBAI Live Intelligence Rooms — Architecture

**Branch:** `preview/spatial-world-intelligence`  
**Status:** Preview foundation (host Voice Operator + translation routing; multi-party transport EXTERNAL_BLOCKED)

## Mission

Unify multilingual collaboration into a living Intelligence OS layer — not a generic meeting app — connecting people, languages, evidence, projects, missions, Operational Objects, and Voice Operator.

## Three-option decision (selected: B)

| Option | Summary | Score (avg) |
|--------|---------|-------------|
| A | Full multi-party WebRTC SFU product | Clarity 6 · Feasibility 3 · Privacy 5 · Risk 9 — **rejected** (no signaling infra; would fabricate) |
| **B** | Canonical room store + host Voice Operator + deterministic translation router + simulated listeners | Clarity 9 · OS identity 9 · Feasibility 9 · Privacy 9 · A11y 8 · i18n 9 · Scale 7 · Compat 10 · Longevity 8 · Risk 3 — **selected** |
| C | Extend MissionRoom chat only | Clarity 5 · OS identity 4 · Feasibility 8 — **rejected** (wrong metaphor; “no generic chat rooms”) |

## Text architecture

```
UI (/rooms, /rooms/session)
  ├─ RoomShell (Meeting / Lab / Practice / Collaboration views)
  ├─ TranscriptPanel (original ≠ translated)
  ├─ Glossary + Consent
  └─ Operational Object proposals → existing Composer (confirm-gated)
         │
lib/live-intelligence-rooms
  ├─ types + migration (unknown-field safe)
  ├─ store (namespaced localStorage)
  ├─ translation-routing (deterministic + glossary)
  ├─ object-proposals
  └─ transport-adapter (EXTERNAL_BLOCKED multi-party)
         │
Existing CBAI
  ├─ VoiceOperatorProvider (global mic / Realtime broker)
  ├─ OperationalObjectProvider
  └─ EN/UZ/RU/TR dictionaries
```

## Privacy / navigation

Route-change mic teardown remains the Voice Operator privacy rule (Safari). Ending a room session stops host capture via Voice Operator Stop/Close/End; room record retains transcript.

Client room lists/sessions use `useSyncExternalStore` + stable snapshots so static-export hydration reads localStorage correctly (React #185 avoided).

## Honesty labels

- Multi-party live audio: EXTERNAL_BLOCKED  
- Laboratory: CBAI does not perform physical experiments  
- AI practice participants: labeled `ai_simulated`  
- Translation: never claimed perfect; uncertain terms require clarification
