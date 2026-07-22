# Design decisions — Intelligence OS final closure

For each major decision: A minimal patch · B component repair · C canonical system. Score 1–5 for consistency, maintainability, accessibility, clarity, risk (higher = better except risk inverted in prose).

## DD-IOS-001 Theme / white-card fragmentation
- A: Patch individual routes with Tailwind
- B: Fix OperatingPageShell only
- C: Semantic tokens + dark-theme white-bg guardrails + brand helper token migration
**Chosen: C** (consistency 5, maintainability 4, a11y 4, clarity 5, risk medium)
Implement: `globals.css` dark-theme white overrides; `brand-classes` text tokens.

## DD-IOS-002 Information architecture
- A: Leave collab routes unlinked
- B: Dump all into primary Operations
- C: Primary CORE/INTELLIGENCE/OPERATIONS/OVERSIGHT + Collaboration progressive disclosure
**Chosen: C** — `lib/navigation.ts` Collaboration section; EN/UZ/RU/TR keys.

## DD-IOS-003 Voice navigation reliability
- A: Only fix one UZ phrase
- B: New second command engine
- C: Harden existing registry path (guest gate on tools + dual-fire suppression)
**Chosen: C** — forbid second engine per safety rules.

## DD-IOS-004 Government vs Governance
Keep separate routes and copy (already correct). No merge.

## DD-IOS-005 Evidence vs forensics
`/knowledge` = research evidence workspace. Forensics remains design-only — do not fake.

## DD-IOS-006 Empty states
Reuse `components/shared/EmptyState.tsx` with semantic text colors — no fabricated metrics.

## DD-IOS-007 My Work action hierarchy
- A: Leave competing Begin / Mission Engine / Create Project / Continue cards
- B: Hide Create Project only
- C: One primary next action (Mission Home) + demote engine/create behind `<details>` + secondary text explore row; cabinet Continue demoted from prominent box
**Chosen: C** (clarity 5, consistency 4, risk low)

## DD-IOS-008 Voice announce-after-navigation
- A: Keep immediate “Opening…” on `router.push`
- B: Change copy only
- C: Defer assistant transcript until `pathname` matches allowlisted href (generation token + timeout failure)
**Chosen: C** — operator must not claim success before route lands.
