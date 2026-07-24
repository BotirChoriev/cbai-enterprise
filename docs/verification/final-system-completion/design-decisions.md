# Final System Completion — Design Decisions

**Branch:** `preview/spatial-world-intelligence`
**Format:** For each decision — three options scored 1–10, selection recorded. Implementation follows strongest option only.

---

## DD-001 — Verification artifact tree (Phase A)

**Selected:** **C** — parallel tree `final-system-completion/{before,after}`.
**Status:** ✅ Script `verify-final-system-completion.mjs` created.

---

## DD-002 — Navigation IA: Trust and Graph placement (Phase D)

**Selected:** **A** — Operations = Reports, Graph, Investor, Government; Oversight = Governance, Trust.
**Status:** ✅ Implemented in `lib/navigation.ts` + `navigation.oversight` (EN/UZ/RU/TR).

---

## DD-003 — Mission chrome deduplication (Phase C)

**Selected:** **A** — ribbon only; remove page-level `MissionOperatingContextBar` from shell.
**Status:** ✅ `OperatingPageShell` no longer mounts mission bar.

---

## DD-004 — Voice lifecycle test assertion (Phase J)

**Selected:** **A** — assert `cbai-voice-dock-btn-live` + CSS var, not `border-teal-500`.
**Status:** ✅ `test:voice-session-lifecycle` 11/11.

---

## DD-005 — Evidence panel localization (Phase I)

**Selected:** **B** — extend `evidenceExplorer` dictionary keys + client `useTranslation`.
**Status:** ✅ `EntityEvidenceCoverage`, `EvidenceSourceCoverage` localized.

---

## DD-006 — Knowledge Graph section placement (Phase 2)

| Option | Description | Clarity | IOS identity | Selected |
|--------|-------------|---------|--------------|----------|
| A | Graph under **Intelligence** (master task IA) | 9 | 9 | ✅ |
| B | Graph under Operations (prior DD-002) | 7 | 7 | |
| C | Graph in both sections | 4 | 3 | |

**Selected:** **A** — Intelligence = explore (Countries … Graph); Operations = produce/act (Reports, Investor, Government).
**Status:** ✅ `lib/navigation.ts` updated.

---
