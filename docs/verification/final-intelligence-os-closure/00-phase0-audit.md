# Phase 0 — Protect and Inventory Audit

**Date:** 2026-07-24
**Authorized branch:** `preview/spatial-world-intelligence`
**HEAD (start):** `839b59966cd76becedac1197ad14ff1f696bb692`
**origin/main:** `d09b25e8907ebda55f7692a8ad590853f6b5fa1d` (untouched)
**Prior session branch before checkout:** `preview/voice-research-integration` @ `f1190fa` (left; untracked work preserved)

## Git / process baseline

| Item | Value |
|------|-------|
| Tracked modifications | 0 |
| Untracked entries (start after checkout) | ~44 |
| Running Next (3000) | free |
| Running voice broker (8788) | free |
| Commit / push / deploy | **forbidden for this closure** |

See `starting-git-state.txt` for raw `git status --short` snapshot.

## Secrets meta (no values)

| Check | Result |
|-------|--------|
| `.dev.vars` file | PRESENT |
| `.dev.vars` gitignored | YES (`.gitignore:42`) |
| `OPENAI_API_KEY` | PRESENT |
| Modified `.dev.vars` | NO (do not edit) |

## Integration presence

| Capability | Present | Primary paths |
|------------|---------|---------------|
| Spatial World Intelligence | YES | `components/spatial-world/*`, `lib/spatial-world/*`, `scripts/test-spatial-world-intelligence.ts` |
| Voice Operator | YES | `components/voice-operator/*`, `lib/voice-operator/*`, `functions/api/voice/` |
| Operational Object System | YES | `lib/operational-objects/*`, `components/operational-objects/*` |
| EN/UZ/RU/TR dictionaries | YES | `lib/i18n/dictionaries/{en,uz,ru,tr}.ts` + platform-copy builds |
| Investor workspace | YES | `components/workspaces/Investor*` |
| Government workspace | YES | `components/workspaces/Government*` |
| Governance Control Center | YES | `components/governance-control/*` |
| Locale provenance | YES | `lib/canonical-contracts/locale.ts`, `lib/ontology/migrations.ts` |
| Approved CBAI logo | YES | `components/brand/CBAILogo.tsx` |
| Natural Earth globe assets | YES | `lib/spatial-world/data/ne_110m_*.json`, `globe-natural-earth-texture.ts` |

## Relevant npm scripts (selected)

- App: `dev`, `build`, `lint`, `start`
- Voice: `dev:voice`, `dev:voice:preview`, `doctor:voice`, `test:doctor-voice`, `test:voice-*`
- Product: `test:spatial-world-intelligence`, `test:platform-shell`, `test:operational-objects`, `test:command-pipeline`, `test:composer`
- i18n: `test:locale-completeness`, `test:localization-closure`, `test:rendered-uz-leakage`
- Shell/OS: `test:global-interface`, `test:platform-activation`, `test:intelligence-canvas`, `test:mission-center`

## Prior verification assets (do not trust blindly)

- `docs/verification/final-intelligence-os/` (+ `final/`) — prior scorecard claims ≥9/10
- `docs/verification/intelligence-os-final-closure/`
- `docs/verification/final-product-closure/`, `final-system-completion/`
- `docs/verification/operational-object-system/`
- Preview alias historically: `https://preview-voice-research-integ.cbai-enterprise.pages.dev/`

## Preliminary defect hypotheses (to verify live)

1. **`dev:voice` exits on busy 8788** instead of reusing a healthy CBAI broker (`scripts/dev-voice.mjs` lines 82–88).
2. **`doctor:voice` primarily probes one app origin** — must explicitly validate both `localhost:3000` and `127.0.0.1:3000`.
3. Prior visual “pass” reports may predate regressions; must re-inspect current tree + live UI.
4. Government vs Governance must remain separate surfaces (present as distinct modules — preserve).

## Hard constraints for this closure

- NO COMMIT / NO PUSH / NO DEPLOY / NO Cloudflare config changes
- MAIN UNTOUCHED
- Preserve all tracked + untracked work
- Never expose `OPENAI_API_KEY`
- Never put secrets in `NEXT_PUBLIC_*`
