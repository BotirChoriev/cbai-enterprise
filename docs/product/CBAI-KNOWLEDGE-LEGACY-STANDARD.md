# CBAI Knowledge Legacy Standard

**EPIC:** EPIC-11 (foundation), EPIC-02 (runtime)  
**Code:** `lib/intelligence-os/legacy-trail.ts`, `components/intelligence-os/LegacyTrail.tsx`

**Constitution:** [`docs/standards/01-cbai-constitution.md`](../standards/01-cbai-constitution.md)

---

## Purpose

Every meaningful mission should leave **reusable, explainable knowledge** for future people — from real stored artifacts, not generated summaries.

---

## Legacy artifact kinds

| Kind | Source |
|------|--------|
| Mission problem | `Mission.problem` |
| Success criteria | `Mission.successCriteria` |
| Open questions | `loadProjectQuestions()` |
| Evidence references | `loadProjectEvidence()` |
| Analysis notes | `loadProjectNotes()` |
| Intended benefit | Human impact assessment |
| Mitigation decisions | Human impact assessment |
| Documented knowledge gaps | `Mission.evidenceMissing` |

---

## Derivation rules

- `deriveLegacyTrail(mission)` — deterministic, no LLM generation
- Empty when no mission or no artifacts
- Each artifact includes kind, label, detail, and sourceId when available

---

## UI

Legacy Trail section on Intelligence Canvas when a mission exists. Shows artifact list with honest empty state when no reusable knowledge yet.

---

## Long-term preservation (EPIC-11 future)

Device-local today. Civilization-scale preservation requires EPIC-15 cloud architecture and explicit export/consent — not fabricated archival status.

---

## Principle expressed

**Knowledge Must Return to Humanity** — failed approaches, gaps, and evidence chains preserved as reusable artifacts.
