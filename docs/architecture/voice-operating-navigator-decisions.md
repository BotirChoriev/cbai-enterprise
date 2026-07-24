# Voice Operating Navigator — Architecture Note (Phase 0)

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Working tree (end):** 209 paths (137 modified, 72 untracked, 0 staged)

## Existing foundation (do not duplicate)

| System | Status |
|--------|--------|
| Voice Command Orchestrator (`lib/voice-operator/commands/*`) | ✅ wraps platform-actions |
| Platform-actions registry + Realtime tool | ✅ allowlisted navigation/mutation |
| Operational Objects + composer confirm | ✅ |
| Domain resolver (chemistry profession) | ✅ → `/research?q=chemistry` |
| EN/UZ/RU/TR voice + platform copy | ✅ partial; identity FAQ missing |
| Mic/WebRTC lifecycle | ✅ Stop/Close/unmount |

## Gaps vs this mission

1. No canonical CBAI positioning / creator / FAQ module.
2. Intro phrase is short; first-run is session-only (`introduced` flag), not versioned onboarding.
3. Identity questions (“CBAI nima?”) not typed intents.
4. Safe-action levels 0–3 not explicit (only safe vs confirmation).
5. Chemist flow navigates immediately without localized “Tushundim…” + next-step choice.
6. Mission requires route-teardown mic release (restore pathname cleanup).

## Design decisions (3 options → select)

### D1 — Identity storage
| Option | Clarity | Consistency | Safety | i18n | Maintain | Compat | A11y | Total |
|--------|---------|-------------|--------|------|----------|--------|------|-------|
| **A. Central `lib/voice-operator/identity/` + dictionary keys** | 10 | 10 | 10 | 10 | 10 | 10 | 9 | **69** |
| B. Only Realtime instructions string | 6 | 5 | 7 | 4 | 4 | 8 | 5 | 39 |
| C. Hardcode in Dock JSX | 4 | 2 | 5 | 3 | 2 | 7 | 4 | 27 |

**Selected: A**

### D2 — First-run persistence
| Option | … | Total |
|--------|---|-------|
| **A. Versioned localStorage onboarding key (no audio)** | | **70** |
| B. sessionStorage only | | 52 |
| C. Assistant profile cloud field | | 41 |

**Selected: A** — `cbai-voice-onboarding` `{ introVersion, completedAt }` idempotent migration.

### D3 — Chemist statement
| Option | … | Total |
|--------|---|-------|
| **A. Session context + navigate Research catalog + spoken follow-up clarify** | | **68** |
| B. Clarify-only (no navigate) | | 55 |
| C. Auto-create research project | | 28 |

**Selected: A** — matches acceptance example; never auto-creates.

### D4 — Route-change mic policy
| Option | … | Total |
|--------|---|-------|
| **A. Release capture on pathname change (mission requirement)** | | **66** |
| B. Keep session across navigation | | 58 |

**Selected: A** — aligns with “route teardown” + lifecycle tests in this brief.

## Implementation order

1. Identity + FAQ + first-run modules
2. Intent extensions (`explain_*`, chemist follow-up)
3. Action levels 0–3
4. Provider/dock wiring + pathname cleanup restore
5. i18n EN/UZ/RU/TR
6. Tests, screenshots, FINAL-REPORT
