# CHECKBALANCEAI.GLOBAL — Adaptive Workspace & Canonical Brand Identity

**Status:** Implementation, tests, and visual verification complete — **stopped for approval**.

## Branch / HEAD

- **Branch:** `preview/spatial-world-intelligence`
- **HEAD:** `16a8f8876f61081d6ff57ed28be1f4001234bab1` (unchanged; no commit)

## Safety confirmations

- No commit
- No push
- No deploy
- `main` untouched
- No secrets exposed
- Existing user data / working-tree work preserved

## Architecture decisions

1. **Single brand registry** at `lib/brand/canonical-identity.ts` — About, Voice, and FAQ consume it; no duplicated founder/platform facts.
2. **Templates + draft flow** reuse Operational Objects (`openComposer`) — no parallel persistence; confirm before create.
3. **Primary IA** stays seven destinations: Home, My Work, Search, Global Activity, World Intelligence, Research & Evidence, Reports. Live Rooms moved under **Collaborate**; Trust/Privacy/About under **Trust**.
4. **Discovery** is empty-by-default and filters `visibility === "public"` only.
5. **Groups/meetings/media** are typed with honest capability states (`live_audio_pipeline_required`, `configuration_required`).

## Canonical identity behavior

| Fact | Value |
|------|--------|
| Public platform | CheckBalanceAI.Global |
| Product/OS | CBAI Intelligence Operating System |
| Founder | Botir Choriev |
| Relationship | CBAI Intelligence OS powers CheckBalanceAI.Global |
| About last updated | 2026-07-24 |

Uzbek full intro matches the required semantic baseline. Short identity is used after first-run. Invented founders are rejected by `assertsNoInventedFounder`.

## Role onboarding

Detect → interpret → show draft → Confirm / Save draft / Cancel. Confirm opens OO composer only. Max three missing follow-ups. Privacy default: **private**.

## Workspace templates

Eight templates in `lib/adaptive-workspace/templates.ts`: student, researcher/scientist, academic/educator, economist, government, investor/analyst, organization, general.

## Voice navigation / confirmation

Instructions require confirmation for create/save/publish/share/join/upload/delete/privacy/record/export. Safe navigation may proceed immediately. `publish` transcripts classify as level 3.

## Public discovery / privacy

`/discover` shows honest empty state. No fabricated popularity. New work defaults private.

## Multilingual model

EN/UZ/RU/TR brand copy + adaptive workspace copy. Original content view preserves language; translation states are typed.

## Source transparency / groups / meetings / media

Provenance stack retained. Groups/meetings/media types in `lib/collaboration/groups-meetings-media.ts`. PDF remains local/config-required honesty.

## Changed / added files (this pass)

**Core**

- `lib/brand/canonical-identity.ts`
- `lib/adaptive-workspace/templates.ts`
- `lib/adaptive-workspace/role-discovery.ts`
- `lib/discovery/global-activity.ts`
- `lib/collaboration/groups-meetings-media.ts`
- `lib/i18n/platform-copy-adaptive-workspace.ts`
- `lib/voice-operator/identity/cbai-identity.ts` (adapter)
- `lib/voice-operator/instructions.ts`
- `lib/voice-operator/identity/action-levels.ts`
- `lib/navigation.ts`
- `lib/i18n/nav-translation.ts` + EN/UZ/RU/TR dictionaries + types

**UI**

- `components/adaptive-workspace/AdaptiveWorkspaceClient.tsx`
- `components/discovery/GlobalActivityClient.tsx`
- `components/about/PlatformIdentitySection.tsx`
- `components/about/AboutPageClient.tsx`
- `components/my-work/MyWorkPageClient.tsx`
- `app/(dashboard)/discover/page.tsx`

**Tests / docs / verification**

- `scripts/test-adaptive-workspace.ts` + `package.json` script
- Updated voice/shell/final-10/final-product-completion tests for new brand/IA truth
- `docs/architecture/adaptive-workspace/*.md`
- `scripts/verify-adaptive-workspace.mjs`
- `docs/verification/adaptive-workspace/**`

## Test results

| Gate | Result |
|------|--------|
| `test:adaptive-workspace` | PASS (15/15) |
| `test:voice-operating-navigator` | PASS |
| `test:voice-operator` | PASS |
| `test:voice-session-lifecycle` | PASS |
| `test:voice-session-broker` | PASS |
| `test:voice-platform-operator` | PASS |
| `test:cbai-final-10` | PASS |
| `test:final-product-completion` | PASS |
| `test:platform-shell` | PASS |
| `test:live-intelligence-rooms` | PASS |
| `test:operational-objects` | PASS |
| `test:locale-completeness` | PASS |
| `test:localization-closure` | PASS |
| `test:spatial-world-intelligence` | PASS |
| TypeScript (`tsc --noEmit`) | PASS |
| Lint (`npm run lint`) | PASS (0 errors; pre-existing warnings) |
| Production build | PASS (`/discover` included) |

Logs: `docs/verification/adaptive-workspace/gates/`

## Screenshot paths

Base: `docs/verification/adaptive-workspace/`

- Desktop: `desktop/my-workspace.png`, `role-onboarding-student.png`, `role-draft-economist.png`, `researcher-templates.png`, `government-draft.png`, `general-draft.png`, `global-activity.png`, `about-platform-identity.png`, `rooms-groups.png`, `pdf-scientific.png`, `privacy-settings.png`, `source-evidence.png`
- Mobile: `mobile/my-workspace.png`, `global-activity.png`, `about-identity.png`, `navigation.png`, `economist-draft.png`
- Voice: `voice/voice-operator-open.png`
- Modes: `modes/home-dark.png`, `modes/home-light.png`
- Manifest: `screenshot-manifest.json` (20 captures, **overflow=0**)

Manual review notes: IA labels Discover/Create present; economist draft shows private + awaiting confirmation; About shows Platform identity with CheckBalanceAI.Global / CBAI / Botir Choriev; Global Activity honest empty; mobile nav intact.

## Known limitations

1. Confirmed workspace still opens OO composer — full “personal workspace dashboard” assembly is progressive on existing My Work / OO infrastructure.
2. Live meeting audio translation and cloud media upload remain capability-gated (honest states).
3. External news connectors not implemented — updates stay “source not connected” / empty discovery.
4. Light-mode home capture may still read dark on spatial surfaces depending on theme token coverage.
5. Sidebar “Intelligence Cabinet” progressive disclosure remains an expandable secondary area (not primary).
6. Full package-wide historical epic suites were not re-run end-to-end in this pass; focused gates above all passed.

## Stop

Awaiting visual and functional approval before any commit, push, merge, or deploy.
