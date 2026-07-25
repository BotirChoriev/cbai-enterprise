# Adaptive User Intelligence Workspace — Implementation Plan

**Branch:** `preview/spatial-world-intelligence` @ `16a8f88`  
**Constraint:** no commit / push / deploy / main

## Reuse (do not rebuild)

| Need | Existing system |
|------|-----------------|
| Founder / identity answers | `lib/voice-operator/identity/cbai-identity.ts` → will consume brand registry |
| First-run intro gating | `lib/voice-operator/identity/voice-onboarding.ts` |
| Voice instructions | `lib/voice-operator/instructions.ts` |
| Role preferences | `AssistantProfile.workspaceRole` + `role-work-contexts.ts` |
| Work creation | Operational Objects draft → confirm → My Work |
| Provenance / updates | Final-10 provenance + Global Updates |
| Rooms / meetings MVP | Live Intelligence Rooms |
| PDF honesty | Local PDF intake |

## Architecture decisions

1. **Brand:** One module `lib/brand/canonical-identity.ts`. Voice, About, FAQ, and intro phrases read only from it. No duplicated founder strings in components.
2. **Identity wording:** Public platform = CheckBalanceAI.Global; OS = CBAI Intelligence Operating System; founder = Botir Choriev. Uzbek semantic baseline as specified. Intro once per session / on identity questions — not every turn.
3. **Onboarding:** Staged detect → interpret → confirm → persist. Uses existing profile + OO draft; never silent save.
4. **Templates:** Registry of field schemas mapped to OO / project types — not separate page products.
5. **Discovery:** One Global Activity surface; only opted-in public items; honest empty until public content exists.
6. **IA:** Reorganize primary nav toward Today / Discover / Create / Collaborate / Trust while keeping route compatibility.
7. **Groups/media:** Canonical types + honest empty/unavailable states; no fabricated live translation or cloud upload.

## Delivery order

1. Canonical brand registry + Voice/About wiring + tests  
2. Role discovery + template registry + command draft confirmation UI  
3. My Workspace adaptive surface + Global Activity + privacy defaults  
4. Groups/meetings/media models + empty states  
5. Localization, gates, Playwright evidence, final report  

## Honesty boundaries

- No invented partners, awards, popularity, or news  
- No silent record creation  
- No cloud PDF success without storage  
- Realtime voice broker remains EXTERNAL_BLOCKED until env is configured  
