# CBAI Product Activation Audit

Response to the "CBAI Product Activation Program" master mission (full platform simplification,
system audit, and functional activation — 15 phases, P0/P1/P2 priority). This document records
what was actually inspected, what was fixed at real depth, and what remains open. It intentionally
does not claim more completeness than was achieved — a 15-phase, multi-week product overhaul does
not fit honestly into one session at full depth, and claiming otherwise would itself violate the
platform's own anti-fabrication constitution. This is a scoped first activation pass: real
inventory work across the whole product, plus the highest-value, safest P0/P1 fixes implemented
and verified end to end.

## 1. Executive diagnosis

The product is not fragmented at the data/engine layer — the Platform Core (RC-1) and Research
Intelligence series are coherent, well-tested, and honestly empty where no real data exists. The
fragmentation the mission describes is real, but it is concentrated in three places:

1. **Navigation, not capability.** Six fully working routes (`/dashboard`, `/reasoning`,
   `/government`, `/investor`, `/citizen`, `/ai-control`) had zero entry point in the rendered
   sidebar — `internalNavSections` existed in `lib/navigation.ts` but was never consumed by
   `Sidebar.tsx`. This is "functional but hidden," not "missing."
2. **Metadata inconsistency**, not fabrication. Most routes had no `<title>`/description at all
   (silently inheriting the root layout's), while the four `/research/*` routes each used a
   different, unrelated title format. No route displayed a false or misleading title.
3. **Duplicate presentation of the same underlying signal** on the research topic page
   (`/research/[topicId]`) — up to three cards independently computing and re-labeling
   "current stage," "next action," or "open questions," risking visible disagreement between
   cards even though every value traces back to real engines.

The previously-flagged fabricated-score issue on `/companies` and `/universities` (tracked since
EPIC-01) was investigated in this pass and found **already remediated** — see §3.

## 2. Route and capability inventory (Phase 1)

22 `page.tsx` files, 89 total routes after static generation (65 real research topic pages +
platform routes + Next internals). State legend: **LIVE** (real data, real actions) ·
**FUNCTIONAL BUT HIDDEN** (works, no discovery path) · **HONEST DEMO** (labeled placeholder,
no real data source yet) · **DUPLICATED** (same signal shown more than once).

| Route | State (before this pass) | State (after) |
|---|---|---|
| `/` | LIVE | LIVE |
| `/search` | LIVE | LIVE |
| `/countries`, `/companies`, `/universities` | LIVE (no page metadata) | LIVE, metadata added |
| `/knowledge` (Evidence) | LIVE | LIVE |
| `/research`, `/research/[topicId]` | LIVE, DUPLICATED (see §4) | LIVE, duplication reduced |
| `/research/workspace` | LIVE | LIVE |
| `/research/evidence`, `/research/review` | HONEST DEMO (placeholder static data, clearly a temporary state, not misleading) | unchanged — real persistence layer does not exist yet |
| `/analytics` (Reports) | LIVE | LIVE |
| `/dashboard`, `/reasoning`, `/government`, `/investor`, `/citizen`, `/ai-control` | **FUNCTIONAL BUT HIDDEN** — no sidebar entry | **LIVE and discoverable** — sidebar "Workspaces" section added |
| `/graph`, `/agents`, `/core` | LIVE, reachable only via direct URL or `/core`'s module grid | unchanged this pass — documented as backlog (§6) |
| `/settings`, `/workflows` | HONEST PREVIEW (explicit "coming soon" text, no fake controls) | unchanged — correctly labeled already |

Full per-component render trees, engine call graphs, and navigation component inventory (`Sidebar.tsx`,
`Topbar.tsx`, `HomeFooter.tsx`, `DashboardLayout`) were captured during this audit and are available
in the session record; not reproduced in full here to avoid duplicating source as documentation.

## 3. Companies/Universities score investigation — already compliant

`docs/companies-constitution-compliance-report.md` and `docs/universities-constitution-compliance-report.md`
document a prior remediation (dated 2026-07-06) that removed all fabricated AI/Investment/Risk
scores, ranking numbers, and AI-generated summary essays from `/companies` and `/universities`.
Verified directly against current source in this pass:

- `lib/companies.ts` / `lib/universities.ts` / `lib/countries.ts` — no score fields in any record.
- `CompanyIntelligencePanel`, `UniversityIntelligencePanel`, `CountryIntelligencePanel` — structurally
  identical, evidence-connection-count based, no raw score or percentage rendered anywhere.
- No `EntityScoreCard` component exists in the repo (removed as part of the prior remediation).

**One real residual issue found and fixed in this pass**, one layer below the UI: 
`lib/intelligence/evidence/adapters/entity/entity-evidence-mapper.ts` special-cased `type === "country"`
to emit an honest "scores withheld — assessment sources not connected" evidence excerpt, while
companies and universities fell through to a default path that emitted `"AI Score: 0/100"` /
`"Investment signal (platform-assessed): 0/100"` — technically not a fabricated *number* (the
underlying score is always genuinely `0`), but framed as if a real assessment ran, which is
inconsistent with the country path and with the constitution's own evidence-honesty standard.
Not currently rendered directly in any page (it only feeds the intelligence/evidence pipeline's
internal evidence set), but was a live inconsistency in evidence text that could surface in future
research/report views.

**Fix**: replaced the `entity.type === "country"` special case with `hasAssessedScores(entity)` —
a general check on whether any score is non-zero — so any entity type (not just country) gets the
honest "withheld" framing until a real scoring methodology actually produces a non-zero value.
This is the deeper, generalizable fix rather than adding a second per-type special case.

## 4. Research topic page duplication — bounded fix applied

A full audit of every component rendered by `/research/[topicId]` found duplicate presentation of:
topic identity (3 cards), current workflow stage (3 engines, 5 differently-labeled fields, 3
cards), recommended next action (computed twice via the same `deriveResearchWorkflow` call),
open questions (4 sources), evidence status (3 framings), recent activity (3 cards), and the same
6-item gap query rendered twice.

This pass fixed the **highest-confidence, lowest-risk** instance: `ResearchCockpit` and
`TopicReviewWorkspace` each called `deriveResearchWorkflow(topic.topicId)` independently and
rendered the identical "next action" value under two different headings ("Recommended next
action" vs. "Continue review"). Fixed by lifting the single `deriveResearchWorkflow` call to the
parent (`ResearchTopicDetail`) and passing it down as a prop to both children — matching this
codebase's established "one Workspace object, never re-derived" principle — and removing
`TopicReviewWorkspace`'s now-redundant "Continue review" footer entirely (its "Not yet available"
section, a genuinely unique signal, was kept).

**Not attempted in this pass** (documented as backlog, not silently dropped): consolidating the
topic-identity block shown in `ResearchTopicHero` + `WorkspaceContextBar` + `TopicQuickOverview`;
reconciling the three independent "current stage" engines (`deriveEvidenceGapIntelligence`,
`deriveResearchWorkflow`/`deriveResearchHealth`, `buildResearchMission`) into one authoritative
source now that the newer Research Mission chain (Phase 4) exists; consolidating "open questions"
and "recent activity" from 3-4 sources down to one. These require a genuine information-architecture
decision (which engine becomes authoritative) rather than a mechanical dedup, and are exactly the
kind of change the mission's own Phase 6 describes — sequencing them behind this session risked
either a rushed IA decision or an oversized, harder-to-verify diff.

## 5. What else was fixed at real depth this pass

- **Sidebar navigation** (`lib/navigation.ts`, `components/layout/Sidebar.tsx`): `internalNavSections`
  (6 real routes) renamed from "Internal" to "Workspaces" and rendered as a second sidebar section.
  No new routes, no new components — pure discoverability fix for capability that already existed
  and already worked.
- **Metadata consistency** (`app/layout.tsx` + 8 page files): root layout now defines a
  `title.template` (`"%s — CBAI"`) so every child page needs only its own short title. Added
  metadata to Countries, Companies, Universities, Dashboard (previously silently inheriting the
  root's title). Normalized the four `/research/*` titles from three unrelated formats
  (`"X — Research Intelligence"`, `"X — Global Research Network"`, `"X — Evidence Navigation"`) to
  the one shared template. Countries/Companies/Universities `page.tsx` were `"use client"` (Next.js
  does not allow a `metadata` export in a Client Component), so each was split into a thin Server
  Component `page.tsx` (metadata only) plus a sibling `*PageClient.tsx` carrying the unchanged
  client logic — the documented, supported Next.js pattern for this exact situation.

## 6. Backlog — audited, not implemented this pass

Recorded honestly rather than silently dropped, grouped by the mission's own phase numbers:

- **Phase 2** (top-level IA: Home/My Work/Explore/Ecosystems/Intelligence/Trust) — not restructured.
  The current flat "Platform" + new "Workspaces" two-section sidebar is a real improvement but not
  the full target IA. A full nav restructure touches every route's discoverability at once and
  deserves its own reviewed pass rather than being bundled into a mixed-fix commit.
- **Phase 3** (signed-in personal home) — no auth/session system exists anywhere in this repo
  (confirmed by exhaustive grep). Building an honest onboarding-only "home" is well-scoped future
  work; not started this pass.
- **Phase 4** (unified workspace shell across Government/Investor/Citizen/Research) — `lib/workspaces/`
  (government.ts, investor.ts, citizen.ts) inspected for file structure only, not yet compared
  section-by-section against Research's workspace contract for a shared shell.
- **Phase 7/8** country/university/company experience deepening — beyond the score-honesty fix in
  §3, no further changes.
- **Phase 9** government/org hierarchy typed contracts — not started.
- **Phase 10** search/location/language — not audited this pass.
- **Phase 11** visual system audit — not performed as a dedicated pass; changes made were
  additive within the existing visual grammar (no new colors, spacing scale, or component
  patterns introduced).
- **Phase 12** Trust/legal center — `docs/CBAI-Constitution-v1.md`, `docs/standards/`, and the
  three compliance reports exist but are not exposed as a public in-product route. Not started.
- **Phase 13** full action/control audit — not performed as a dedicated pass beyond the
  duplication findings in §4.
- **Phase 14** journey tests beyond the existing 11 in `scripts/test-research-slice.ts` — not added.
- **Phase 15** dedicated responsive/accessibility audit — not performed as a separate pass;
  no layout or interaction changes were made in this pass that would newly affect either.
- The pre-existing, already-documented technical debt in `docs/current-progress.md`'s "Known
  technical debt" section (recomputation-per-call, id-space mismatches, dormant `lib/intelligence/*`
  subsystems) is unchanged by this pass and remains accurately described there.

## 7. Verification performed

`npm run lint` (clean, one pre-existing unrelated warning), `npm run build` (89 routes generate,
including all 65 real research topic pages), `npm run test:research-slice` (11/11 passing, unchanged
by this pass — confirms the workflow-prop refactor didn't change any derived value), local dev
server smoke test of every changed route (`/`, `/research/microbiology`, `/companies`,
`/universities`, `/countries`, `/dashboard`, `/government`) returning 200 with no console/hydration
errors, and manual confirmation that the new "Workspaces" sidebar section renders with all six
labels in the served HTML.
