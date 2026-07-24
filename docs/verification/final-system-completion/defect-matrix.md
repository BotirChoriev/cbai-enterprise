# CBAI Final System Completion — Defect Matrix

**Branch:** `preview/spatial-world-intelligence`
**HEAD:** `2d1558995f355a899100a6ca15c7d924e913c690`
**Matrix date:** 2026-07-20
**Sources:** Code audit, `final-intelligence-os/scorecard.md`, `final-product-audit.md`, live broker probe, test runs

**Severity key:** P0 = broken/unusable/security; P1 = incoherent/misleading; P2 = polish

---

## P0 — Must fix before acceptance

| ID | Defect | Evidence | Affected routes | Fix phase | Status |
|----|--------|----------|-----------------|-----------|--------|
| P0-01 | **Voice live session blocked — invalid API key** | Upstream `401 invalid_api_key`; key length ~6 chars placeholder; `doctor:voice` FAIL | Voice globally | External | ⏸ **Paused external blocker** — product must remain honest |
| P0-02 | **`test:voice-session-lifecycle` test drift** | Asserts `border-teal-500` in dock; implementation uses `cbai-voice-dock-btn-live` CSS var | Voice tests | Phase J | 🔴 Open — fix test to match token-based styling |
| P0-03 | **Evidence advanced panels English under UZ** | `EntityEvidenceCoverage.tsx`, `EvidenceSourceCoverage.tsx` hardcoded EN headers/labels | `/knowledge` | Phase H/I | 🔴 Open |
| P0-04 | **Voice state must not lie** | Prior Safari: "not configured" + disabled mic was correct for missing key; verify no contradictory Ready+Error | Voice | Phase J | 🟡 Re-verify after key fix; internal states OK when broker classifies |

---

## P1 — Coherence / localization / shell

| ID | Defect | Evidence | Affected routes | Fix phase | Status |
|----|--------|----------|-----------------|-----------|--------|
| P1-01 | **Mission chrome duplication** | `OperatingPageShell` mounts `MissionOperatingContextBar` while layout has `LivingContextRibbon` + strips | Research, graph, entity routes | Phase C | 🔴 Open |
| P1-02 | **Research sub-panel EN leakage** | `DiscoveryTopicCard` methods; `ReviewTimeline.tsx`; evidence nav labels | `/research`, topic, canvas | Phase H/I | 🔴 Open |
| P1-03 | **Sidebar hardcoded EN aria-label** | `Sidebar.tsx` L21–22 English only | All routes | Phase C/I | 🔴 Open |
| P1-04 | **IA mismatch vs mandate** | Trust in Operations; Graph/Investor/Government in Advanced disclosure | Navigation | Phase D | 🟡 Document decision |
| P1-05 | **Research Canvas / Graph responsive min 8** | Prior scorecard — expert surfaces acceptable but below 9 gate on responsive | Canvas, graph | Phase L | 🟡 Target 9 or document expert mode |
| P1-06 | **Settings expert metrics EN** | `lib/intelligence-os/simplicity-metrics.ts` English in audit panel | `/settings` | Phase H/I | 🔴 Open |
| P1-07 | **OperatingNavigator raw zinc classes** | `border-zinc-800/60`, `text-zinc-700` in secondary disclosure | Sidebar | Phase B/C | 🔴 Open |
| P1-08 | **Safari manual verification pending** | Scorecard checklist unchecked; Chromium-only captures | All | Phase M | ⏸ Human approval gate |
| P1-09 | **Dev:voice port collision diagnostics** | Mandate requires detect-in-use + actionable message; partial via doctor | Dev runtime | Phase J | 🟡 Enhance `dev-voice.mjs` |
| P1-10 | **CreateLinkedWorkButton raw teal** | `border-teal-500/15` vs semantic tokens | Entity routes | Phase B | 🔴 Open |

---

## P2 — Polish / consistency

| ID | Defect | Evidence | Fix phase | Status |
|----|--------|----------|-----------|--------|
| P2-01 | Widespread raw Tailwind vs semantic tokens | 100+ `zinc-*`, `teal-*` hits | Phase B | 🔴 Open |
| P2-02 | Home hero + voice CTA semantic overlap | Hero speak + dock on other routes | Phase E | 🟡 Minor after prior fix |
| P2-03 | Trust long-document reading rail | Audit: hierarchy could improve | Phase H | 🔴 Open |
| P2-04 | Country proper names English under UZ | **By policy** — source language preserved | — | ✅ Accepted |
| P2-05 | Secondary nav disclosure contrast (dark) | `text-zinc-700` on dark sidebar | Phase B | 🔴 Open |
| P2-06 | `--cbai-surface-glass` alias clarity | Ribbon references; verify defined | Phase B | 🟡 Verify |

---

## Closed / repaired (prior pass — re-verify only)

| ID | Defect | Repair | Verify in this pass |
|----|--------|--------|---------------------|
| C-01 | Duplicate mission CTAs | `LivingContextRibbon` exclusions | ✅ Scorecard |
| C-02 | Light home voice CTA invisible | `.cbai-spatial-home-voice-btn` | ✅ Scorecard |
| C-03 | Light shell split | Shared sidebar/canvas tokens | ✅ Scorecard |
| C-04 | Reports orphan Review button | `ReportsEmptyIntro` | ✅ Scorecard |
| C-05 | Voice FAB center obstruction | Bottom-right pill + dock inset | ✅ Scorecard |
| C-06 | UZ entity UI leakage (Selected, Create Project, etc.) | `entity-ui-translation.ts` + card i18n | ✅ `test-rendered-uz-leakage` |
| C-07 | Voice upstream generic 502 | `upstream-diagnostics.ts` classification | ✅ Broker returns `invalid_api_key` |
| C-08 | Voice diagnostics missing in Settings | `VoiceDiagnosticsPanel.tsx` | ✅ Present |
| C-09 | Broker JSON truncation bug | `truncateDiagnosticMessage` split | ✅ Fixed prior session |

---

## Defect count summary

| Severity | Open | Paused external | Closed (re-verify) |
|----------|------|-----------------|-------------------|
| P0 | 3 | 1 | 0 |
| P1 | 9 | 1 | 0 |
| P2 | 5 | 0 | 0 |
| Prior repairs | — | — | 9 |

---

## Recommended fix order (Phases B→N)

1. **P0-02** — Lifecycle test drift (unblocks test suite)
2. **P0-03** — Evidence panel localization
3. **P1-01, P1-03, P1-07** — Shell coherence
4. **P1-02, P1-06** — Research/settings EN leakage
5. **P1-04** — IA decision + implementation
6. **P2-01, P1-10** — Token adoption sweep (focused files)
7. **P1-09** — Dev port collision UX
8. **Phase K** — Interpreter spec (no UI)
9. **Phase M** — Screenshot gate + scorecard
10. **P0-01** — Document external blocker; no false live claim

---

## Voice external blocker (mandated section)

| Check | Result |
|-------|--------|
| Broker reachable | ✅ |
| Origins allowed | ✅ |
| Key present in `.dev.vars` | ✅ (shape only — not valid) |
| Upstream credential | ❌ `401 invalid_api_key` |
| Ephemeral `ek_*` returned | ❌ |
| WebRTC + audible Safari test | ❌ Not performed |
| Product honesty | ✅ Mic disabled / classified error |

**Next action for live voice (user):** Replace placeholder with valid project key; restart `npm run dev:voice`; confirm `npm run test:voice-upstream` returns 200.
