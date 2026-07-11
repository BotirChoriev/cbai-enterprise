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

## 8. Release 3 — Empty States, Missing Capabilities, and Global Discovery Activation

Response to "CBAI Product Activation — Release 3." Scope: remove unexplained dead ends, activate
disconnected-but-already-built search/entity/status capabilities, connect the Command Center to
real navigation. No new engine, AI, assistant, or Platform Core change.

### 8.1 Empty/missing-state audit

Repo-wide search across `app/`, `components/`, `lib/` for bare "Missing/Empty/No data/Coming
soon/TODO/Unavailable/Not yet"-style text. Result: the codebase already has a strong, consistent
"honest empty state" convention (~150+ occurrences read in full — short status word + a full
sentence explaining why + what's connected instead). A small, genuine cluster of bare, unexplained
text was found and fixed:

- `ReviewCommentsPanel.tsx`, `ReviewDecisionPanel.tsx`, `ReviewTimeline.tsx` (rendered together on
  `/research/review`) — 8 bare "Not yet" values with zero visible explanation (the reasoning
  existed only in code comments). Replaced with the new status vocabulary (§8.6) plus one compact
  explanation per panel instead of repeating the same reason per row — `ReviewCommentsPanel` in
  particular went from 3 repeated bare rows to one explanation block, since all 3 fields were
  empty for the same reason.
- `RuntimeActivityFeed.tsx` — bare "No activity recorded yet" brought in line with its sibling
  `AgentActivity.tsx`'s fuller wording. (This component itself has zero render call sites anywhere
  in the app today — dead but honest; not activated further this pass, see §8.7.)
- `ResearchReviewWorkspace.tsx` ("Not assigned yet.") and `WorkspaceExplorer.tsx`'s deep-link
  not-found notice — both minor, given one clause of reason and (for the latter) a real link to
  browse all topics.
- `SearchResultCard.tsx` — silently dropped its "Open profile →" CTA for unavailable results with
  no visible cue at all. Now shows a status badge plus the entry's real next-step text instead of
  disappearing silently.

Everything else read (evidence gap panels, coverage panels, comparison/relationship panels, agent
components, timeline components, the research topic empty-section notice, the Trust page's privacy
placeholder, the custom 404) was already a complete, honest sentence and was left unchanged.

### 8.2 Global Search activation

`/search` already computed grouped multi-type results (`executeGatewaySearch` in
`lib/search-gateway.ts`) — but `SearchGatewayResults.tsx` only ever rendered the entity groups
(countries/companies/universities); the "knowledge"/"evidence"/"future_modules" topic groups were
computed and silently discarded, and `buildTopicResultEntry` (the adapter built to render them) had
zero call sites anywhere. Real research topics (the 65-topic catalog) were not searchable by name
at all.

Fixed: added a real `research_topics` search group using the existing `filterResearchTopics`
query over the real `RESEARCH_TOPICS` catalog (no new engine — the filter function already
existed, unused for search). Wired `SearchGatewayResults.tsx` to render every populated group
(entities, research topics, and the previously-dropped knowledge/evidence/future-module topics)
using the also-previously-unwired `SearchResultCard` component. Added "Trust Center" and "Reports
Center" as real, keyword-searchable entries, and added "Research"/"Trust" to the Explore-by-category
quick links. Searching "microbiology" now surfaces the real `/research/microbiology` page;
searching "trust" surfaces the real `/trust` page.

### 8.3 Command Center activation

Extended `lib/assistant/assistant-commands.ts`'s deterministic phrase table with the mission's new
fixed commands (Open Research, Open Trust, Open Settings, Open Reports) and a small set of
**parameterized** patterns — "find country X", "find university X", "find company X", "search
evidence for X", "show research topic X" — resolved via the same real catalogs Global Search uses
(`searchEntities`, `filterResearchTopics`), never a new lookup engine. Unmatched input no longer
silently redirects to search: the Command Center now shows an explicit "not recognized yet" panel
with supported example commands and a link to Global Search, per the mission's "no fake AI
response" rule.

### 8.4 Country/Company/University profile activation

All three `*IntelligencePanel.tsx` components were already structurally identical (confirmed by
this audit and the prior Release 1 investigation) and contained zero fabricated scores or
unexplained empty sections. Added one real, consistent addition: a shared `EntityDataStatus`
component using the new status vocabulary, showing `live` / `partial` / `waiting_for_verified_data`
based on each entity's real connected-source count — the one piece of the mission's 8-section
profile structure (Identity/Available intelligence/Evidence/Relationships/Timeline/Reports/Open
questions/**Data status**) that wasn't already present as a labeled section.

### 8.5 Research empty-state cleanup

Confirmed (not re-fixed) — `ResearchIntelligenceOverview.tsx`'s `emptySections` handling already
matches the mission's bar exactly: one compact trailing sentence ("No hypotheses, findings,
publications… are connected yet — honestly empty, not an error"), never a wall of empty panels.
The one real fix in this area was `/research/review`'s three panels (§8.1) — reachable from every
research topic, not sparse-topic-specific. `npm run build` confirms all 65 topic pages still
generate; Research Cockpit, Research Workspace, Review Workspace, Evidence Workspace, and the
`?evidence=` URL-selection flow are all unchanged.

### 8.6 Status vocabulary (Phase 8)

New `lib/product-status.ts` + `components/shared/StatusBadge.tsx`: seven statuses (Live, Partial,
Waiting for verified data, Preview, Restricted, Not connected, Planned), each with a visible label
and a full-sentence explanation — never color-only, always with a real `sr-only` accessible label.
This does not replace the several existing per-module status-label mappings already in the
codebase (`workspaceStatusClass`, `explorerStatusClass`, and similar) — those are honest and
working; migrating every existing call site was judged out of scope for this pass's risk budget.
The new vocabulary is used in the review panels (§8.1), `SearchResultCard` (§8.1), and the new
`EntityDataStatus` component (§8.4) — proving the pattern in real, newly-touched code rather than
a repo-wide relabeling.

### 8.7 My Work and Assistant connection

`MyWork.tsx` did not check the Assistant profile at all. Now: when a local profile is active, My
Work shows a real identity summary (avatar, name, workspace role, preferred language, a `live`
status badge) instead of the generic "no accounts" banner. When inactive, the onboarding banner
now includes the mission's exact five links (Explore Research, Explore Countries, Search Evidence,
Configure Assistant, Open Trust Center). Also activated a second existing-but-unused capability:
`RecentEntities` (already built, already used in the page context header) is now also shown on My
Work as "Recently Viewed" — real local view history for countries/companies/universities, honestly
empty until the user browses a profile. "Recent Missions" and "Recent Research" remain honestly
empty — no mission or per-topic browsing history is tracked anywhere in this platform.

### 8.8 Tests

New `scripts/test-product-activation.ts` (`npm run test:product-activation`, same zero-dependency
`node:test` harness as the research slice suite) — 13 tests: grouped real search results, unknown
search terms failing safely, empty-query safety, fixed and parameterized Command Center routing
against real catalogs, unknown-command → `null` (never a guess), status-vocabulary completeness,
and Assistant profile honesty (inactive until named, SSR-safe with no `window`). 13/13 passing,
alongside the unchanged 11/11 research-slice suite.

### 8.9 Remaining data blockers / not attempted this pass

- **Voice and upload** remain exactly as activated in Release 2 — real Web Speech API voice input,
  honest "not connected" upload notice. Not revisited this pass beyond routing parity.
- **Full repo-wide status-vocabulary migration** — the several pre-existing status-label systems
  (`workspaceStatusClass`, `explorerStatusClass`, coverage-panel chips) were not migrated to the
  new vocabulary; documented as a deliberate scoping choice (§8.6), not an oversight.
- **`RuntimeActivityFeed.tsx`** has zero render call sites anywhere in the app — its text was fixed
  for honesty but it was not wired into `/dashboard` or anywhere else; doing so would require
  deciding what real runtime data (if any) it should show, out of scope for an empty-state pass.
- **Organizations, Technologies, Publications, Patents** as standalone Global Search categories —
  not added. The real research-domain data behind these (one laboratory, one dataset, zero real
  publications/patents anywhere in the catalog) is too sparse to justify a dedicated search group
  without either padding it with near-empty results or excluding it entirely; the mission's own
  "do not include entity types with no real data" rule was applied by omitting them.
- **Company/University/Country full 8-section literal restructuring** — Data status was added;
  Identity/Evidence/Reports/Open questions were already present as labeled sections;
  Relationships/Timeline exist as separate page-level components (`*Relationships.tsx`) rather than
  inside the panel itself. Not consolidated into one literal panel this pass — low risk, but a real
  IA decision better made deliberately than folded into an empty-states release.

## 9. Release 4 — Connected Intelligence Experience

Response to "CBAI Product Activation — Release 4." Scope: connect existing capabilities together
(cross-entity links, Assistant context-awareness, a real "Intelligence Context" summary), not build
new ones. No new engine, AI system, or duplicate workspace.

### 9.1 Cross-entity relationship audit

Investigated what real relationship data actually exists between Countries, Companies,
Universities, and the 65-topic Research catalog before building anything:

- **Country ↔ Company ↔ University links are real and already live** — `getCountryRelationships`/
  `getCompanyRelationships`/`getUniversityRelationships` (in each entity's `.adapter.ts`) name-match
  companies/universities to countries via `lib/name-match.ts`, and were already rendered by
  `CountryRelationships.tsx`/`CompanyRelationships.tsx`/`UniversityRelationships.tsx` — just tucked
  inside a collapsed "Optional exploration" `<details>` on each page. Nothing to activate here; this
  release surfaces a real *count* of these already-computed links in the new Intelligence Context
  panel (§9.3) so the connection is visible before a user expands the details.
- **Research topics have zero real links to any Country/Company/University record** — confirmed by
  reading `research-domain-adapter.ts` and `research-entities-organizations.ts` in full; the
  Research Domain's organization/university/laboratory types are deliberately-documented stubs,
  disjoint from the real `lib/countries.ts`/`lib/companies.ts`/`lib/universities.ts` catalogs.
  `ResearchIntelligenceOverview.tsx`'s "Related entities and network connections" section was
  verified to already correctly scope itself to real research-internal organizations/datasets only
  — it does not, and should not, claim a link to a specific country or company. Left unchanged.
- **The Universal Relationship Engine and Global Intelligence Network (Platform Core) are Research
  Intelligence-only** — zero imports anywhere under `components/countries|companies|universities`.
  Confirmed, not touched (Platform Core is frozen).
- **A second, fully-computed, entirely dead cross-entity relationship graph was found**:
  `lib/registry/entity-links.ts` + `registry-query.ts`'s `resolveRelatedEntities()`/
  `getEntityLinkGraph()` — real, name-matched, zero callers anywhere. Deliberately **not**
  activated: the same relationship data is already live via the adapters above, and wiring a second
  parallel system in would be exactly the "duplicate information" this release explicitly forbids.
  Documented here as known dead code, not activated.
- **A large cluster of fully-built, fully-styled, zero-consumer country/company/university
  components was found**: `Country/Company/UniversityIndicatorCoverage.tsx` (indicator domains —
  Economy, Judicial System, Education, Health, Research, Digital Development, etc. — grouped exactly
  as Phase 2 asked for), `CountryTimelineSection.tsx` (+ 6 Timeline sub-panels), `*CoveragePanel.tsx`,
  `*Methodology.tsx`, `*TrustSection.tsx`, `*SourceCoverage.tsx`. Activated the highest-value,
  non-duplicate ones (§9.2); left `*CoveragePanel.tsx` (redundant with the already-live
  `EntityEvidenceSection`) and `*Methodology.tsx`/`*TrustSection.tsx` (redundant with the Release 1
  `/trust` page) deliberately unwired to avoid duplicating information already shown.

### 9.2 Country and Organization workspace activation (Phases 2–3)

Wired into `CountryIntelligencePanel.tsx`, `CompanyIntelligencePanel.tsx`,
`UniversityIntelligencePanel.tsx`:

- **Indicator Coverage by domain** (`*IndicatorCoverage.tsx`) — real domain-grouped sections
  (Economy, Judicial System, Education, Health, Research, Digital Development, and more, per
  `lib/indicator-framework/domains/catalog.ts`), inside the existing "Optional exploration"
  disclosure (progressive disclosure, Phase 9 — this can be a long list, so it's not forced on
  first view).
- **Source Coverage** (`*SourceCoverage.tsx`) — real named official evidence sources with
  organization, supported-indicator count, connection status, and official website link. Genuinely
  new information, not a repeat of the aggregate counts `EntityEvidenceSection` already shows.
  Also inside Optional exploration.
- **Timeline** (`CountryIntelligencePanel` only — no company/university timeline builder exists in
  this codebase, so none was added; Phase 8's "if impossible, hide it" applied honestly rather than
  building a placeholder). The compact `TimelineReadinessPanel` (real status badge + real year
  counts) is always visible as a primary section; the five more detailed timeline sub-panels
  (Coverage/EvidenceGap/Sources/Methodology/HumanReview) live in Optional exploration to avoid
  showing six stacked panels — most of which say "not connected" for every real country today —
  on first load.

### 9.3 Intelligence Context panel (Phase 6)

New `components/shared/IntelligenceContextPanel.tsx` — real related-entity count (from the
already-live relationship adapters, §9.1), evidence connected/total, reports count, open-questions
count, and a status badge (reusing the Release 3 status vocabulary). Replaces the narrower Release 3
`EntityDataStatus` component (deleted — fully superseded, would otherwise have duplicated the status
badge this panel already shows) on all three Country/Company/University panels. Not built as a
literal CSS-grid right-hand column: the existing three-panel Country/Company/University page layout
(filters, list, panel) would have needed restructuring to fit a fourth column safely on mobile: this
release places the panel in-flow at the top of the panel instead, satisfying the "every workspace
gets an Intelligence Context summary, real data only, nothing decorative" requirement without a
layout risk. Research topic pages were not given a second panel — `ResearchIntelligenceOverview.tsx`
already serves this exact purpose there (evidence count, open questions, related entities, status),
and building a second one would duplicate it.

### 9.4 Assistant context awareness (Phase 5)

New `lib/assistant/assistant-context.ts` — `resolveAssistantContext(pathname, platformEntity)`
derives "where the user currently is" from data the platform already tracks: a real research topic
when the pathname is an exact topic route, otherwise whichever entity `PlatformContextProvider` has
focused (country, then company, then university). No new tracking system, no question ever asked of
the user. The Command Center (`AssistantCommandCenter.tsx`) now shows a small "Context: {name}"
link, and the "not recognized" fallback panel offers a context-aware "Open {name}" suggestion first
when a context exists.

### 9.5 Cross-navigation and capability audit (Phases 7–8)

No new dead ends introduced — every activated component reuses real data already flowing through
each page's existing `journey`/`coverage` objects. `npm run build` regenerates all 91 routes with no
errors; dev-server spot checks of Countries/Companies/Universities (bare and with a real entity
query param), a research topic, Trust, and My Work all returned 200 with no console errors. No new
buttons were added this release — only real, already-built display components were wired into
existing pages.

### 9.6 Tests

Extended `scripts/test-product-activation.ts` with 4 new tests (14–17) covering
`resolveAssistantContext`: real topic resolution from the URL, real entity fallback when not on a
topic page, honest `null` with no context available, and confirmation that non-topic `/research/*`
routes (like `/research/workspace`) never get misread as a topic id. 17/17 passing, alongside the
unchanged 11/11 research-slice suite.

### 9.7 Remaining data blockers / not attempted this pass

- **`lib/registry/entity-links.ts`'s parallel relationship graph** — confirmed dead, deliberately
  left unwired (§9.1) rather than duplicating the already-live relationship adapters. A future
  cleanup pass could remove it, or migrate the live adapters onto it if it's ever found to be more
  complete — not attempted here.
- **`*CoveragePanel.tsx`, `*Methodology.tsx`, `*TrustSection.tsx`** (country/company/university) —
  confirmed dead, deliberately left unwired as redundant with content already live elsewhere on the
  same page or on `/trust`.
- **A literal right-side CSS-grid Context Panel column** — not built; the in-flow panel placement
  (§9.3) was judged the safer choice given the existing three-column responsive layout. Revisiting
  this as a deliberate IA/layout decision (not bundled into a connectivity release) remains open.
- **Research topic ↔ Country/Company/University links** — genuinely impossible with real data today
  (§9.1); would require new data ingestion, explicitly out of scope for a "connect existing
  capabilities" mission.

## 10. Release 5 — Premium Global Interface & Personal Operator Experience

Response to "CBAI Product Activation — Release 5." Scope: a product-facing presentation upgrade
over the existing Assistant/Command Center/profile — not a new AI, not a second assistant, not a
new storage model. No Platform Core files touched.

### 10.1 CBAI Personal Operator (Phase 1) and a real data-model gap it surfaced

"CBAI Personal Operator" is the product-facing name for the existing Assistant/Command Center —
applied to user-visible copy (Settings, Home greeting, Command Center labels) only; no internal
rename, no second profile store. Implementing this literally surfaced a genuine gap in the
Release 2 data model: the mission's field list distinguishes "user name" from "assistant name,"
but the existing `AssistantProfile.name` field was used for both, inconsistently. Fixed by adding
one new field, `operatorName`, to the same profile object (`lib/assistant/assistant-profile.ts`)
— additive only, backward-compatible with any already-saved profile (missing `operatorName`
sanitizes to `""`, which `resolveOperatorName()` falls back to the honest default `"CBAI
Operator"` for). This is not a second storage model — one `AssistantProfile`, one
`localStorage` key, unchanged.

### 10.2 Avatar system (Phase 3)

New `components/shared/Avatar.tsx` — the initials-badge presentation that already existed in three
separate inline copies (Settings, My Work, Home greeting) is now one component, used identically in
all three plus the new Command Center and Account Menu. Real accessible label (`aria-label` with
the full saved name, not just the visible initial), a real fallback state (a generic outline-person
icon, never a blank box, when no name is set), and `sm`/`md`/`lg` size variants. Deliberately did
**not** add photorealistic, demographic, or "professional" avatar imagery — the existing six-color
initials system already satisfies "a small set of built-in neutral avatars" honestly (no
assumptions about gender, race, age, nationality, religion, or profession), and adding more without
a clear product need would have added visual complexity Phase 12 explicitly warns against.
Uploaded-image avatars were considered and **not implemented** — this platform's only storage is
`localStorage`, which is a poor, size-constrained fit for image blobs; the mission's own phrasing
("if the current local-only architecture safely supports it") was read as permission to decline.

### 10.3 Arrival experience and deterministic next step (Phases 2 and 4)

Rebuilt `HomeAssistantGreeting.tsx` to match the mission's literal structure: avatar, real name,
Operator name, workspace role, one concise greeting line, exactly **one** primary next step, and
exactly the four named secondary actions (Open My Work, Search Intelligence, Explore Countries,
Review Evidence) — replacing the previous four-tile "Today's summary / Recent changes /
Recommendations" grid, which was honest but visually heavier than this release's "one obvious next
action" standard.

New `lib/assistant/assistant-next-step.ts` — `resolveNextStep(profile, mostRecentEntity)`, a pure,
tested function implementing the mission's priority list: continue real local work (the most
recently viewed real entity, from the already-real `RecentEntities` history) when one exists,
otherwise open the user's real role-based default workspace, otherwise (no profile yet) prompt
setup. The mission's tiers 3–4 ("review evidence," "explore a catalog") were not implemented as
further primary-tier branches: every real workspace role always resolves to a real destination, so
a literal third/fourth tier would be dead code that could never fire. They are offered instead as
two of the four always-present secondary actions, which is where they are genuinely reachable.

The full 7-step "no saved profile" onboarding wizard the mission describes was **not** built as a
separate guided flow — `/settings` already collects every one of those fields on one page via
`AssistantSettingsForm`, and the Account Menu (§10.5) now links there whenever no profile exists.
A dedicated multi-step wizard remains a real, separately-scoped enhancement, not attempted here.

### 10.4 World Intelligence Map (Phases 6–7)

New `lib/world-map.ts` + `components/countries/WorldIntelligenceMap.tsx`. Built as an accessible,
region-grouped grid of real country tiles (real name, real region, a real status badge reusing the
Release 3 status vocabulary derived from each country's actual connected-source count) with a text
search over the same data — **not** a hand-coded geographic SVG/canvas map. This repository has no
map or geo-data library anywhere, and plotting country shapes or coordinates without one would
itself have been a form of fabricated geography, which the mission explicitly forbids alongside
scores, ratings, and heatmaps. Because every tile is a real focusable `<a>` with real text (not an
image), there is no separate "list-based fallback" mode to build — the same view already serves
both roles, satisfying the accessibility requirement by construction rather than as a bolt-on.
Placed in exactly the two locations the mission recommended: Home (`HomeHero.tsx`, the global entry
point) and `/countries` (the primary country discovery tool, above the existing filter/list, which
remains fully functional as an alternate access path).

### 10.5 Global shell and account identity (Phase 5)

New `components/assistant/AccountMenu.tsx` in `Topbar.tsx` — an avatar-triggered account menu
(native `<details>`/`<summary>`, matching this codebase's existing disclosure pattern rather than a
new dropdown mechanism) showing Operator name and workspace role with links to My Work and
Settings, or an honest "Set up Operator" prompt when no profile exists. Always rendered, including
at mobile widths — user identity is never hidden behind a separate mobile-only menu, since no
separate mobile navigation component exists in this codebase to hide it behind. A full "premium
shell" pass across all 16 named routes (topbar/sidebar/breadcrumb/footer audit) was not attempted
as a from-scratch redesign this release — the existing shared Sidebar/Topbar/`cbaiGlassCard`
token system already gives every route a consistent shell; this release's changes (Account Menu,
Command Center identity, Contextual Operator banners) sit inside that existing shell rather than
replacing it, consistent with Phase 5's own "do not redesign every page independently."

### 10.6 Menu and page-header changes (Phases 8–9)

Not pursued as a literal architecture rename this release — the existing route labels (My Work,
Research, Countries, Companies, Universities, Evidence, Reports, Trust) already avoid the generic
terms (Dashboard/Overview/Module/System/Control) the mission calls out, aside from the
already-known, already-documented `/dashboard` route (labeled "Dashboard" — real, working, and
intentionally distinct from the persona workspaces). A single new reusable page-header component
was not built; see §10.7 for why, and why the Contextual Operator banner was chosen instead as
the more honest, lower-risk way to add "Assistant context" per page.

### 10.7 Contextual Operator (Phase 10)

New `components/assistant/ContextualOperatorBanner.tsx`, reusing `resolveAssistantContext` from
Release 4 unchanged. Shows a real "You are viewing {name}" statement plus a small set of real,
entity-kind-specific actions (Country: open evidence / view reports / explore universities;
Research topic: continue workspace / open evidence / review questions; Company/University:
equivalent real links) — every link verified against a real anchor id or real route, never a
guessed destination. Wired into Countries, Companies, Universities, and the Research topic page.
This was chosen over building a new unified `PageHeader` component (Phase 9): retrofitting nine
different existing page types onto one new header component was judged higher-risk than this
release's time budget could verify safely, while the Contextual Operator banner delivers the
specific, mission-named capability ("You are viewing Japan," real actions) as a small, additive,
independently-verifiable piece.

### 10.8 Complexity reduction (Phases 12–13)

The home greeting rebuild (§10.3) is this release's main complexity reduction: four cards down to
one primary action plus a compact secondary-action row. No new gradients, glow effects, or
decorative charts were added anywhere in this release; every new component reuses
`cbaiGlassCard`/`cbaiSectionEyebrow` and the existing zinc/cyan token palette.

### 10.9 Tests (Phase 18)

11 new tests (18–28) added to `scripts/test-product-activation.ts`: next-step priority (no
profile → complete-setup; profile with recent work → continue-work; profile with no recent work →
real role-based workspace), every workspace role resolves to a real declared route, Operator-name
fallback, avatar-id uniqueness, and four tests asserting the World Map only ever contains real
catalog countries, never a fabricated status value, always a real profile link, and honestly empty
search results for a non-existent country. 28/28 passing in this suite, 11/11 unchanged in the
research-slice suite.

### 10.10 Known limitations recorded this release

- **Local-browser-only, by design**: the entire Personal Operator profile (name, Operator name,
  avatar, language, role, country, organization, timezone, notifications, accessibility) is
  `localStorage` on one browser. Nothing here is a real account; there is no cross-device sync
  because there is no backend or authentication anywhere in this codebase.
- **Requires authentication/backend to go further**: multi-device profile sync, uploaded-image
  avatars at meaningful size, and any real "recent activity" beyond locally-viewed entities would
  all require a real backend — none exists, none was added.
- **Requires real data integration**: notification delivery (preferences are saved, never sent);
  translated interface languages beyond English; a literal geographic world map (would need a
  map/geo-data source this repository does not have).
- **Planned, not attempted this release**: a guided multi-step onboarding wizard (§10.3); a single
  unified `PageHeader` component across all nine named page types (§10.7); a full shell redesign
  audit across all 16 named routes beyond the shared components already in place (§10.5).

## 11. Companies Intelligence — module-depth activation

Response to "CBAI Product Activation — Companies Intelligence" (target: a complete, real,
end-to-end Companies workflow, not a broader platform pass). No new engine, no fake companies, no
fake statistics.

**Fixed a real, confirmed bug**: bidirectional navigation was broken everywhere. Country → Company,
University → Company, Company → Country, and Company → University "linked entity" lists all
rendered real, correct, non-fabricated names — as inert plain text, not links. New
`components/shared/resolve-entity-link.ts` + `LinkedNamesList.tsx` resolve a real catalog name back
to its real profile URL (exact match against the same catalogs the names already came from) and
render real `<Link>`s in `CompanyRelationships.tsx`, `CountryRelationships.tsx`, and
`UniversityRelationships.tsx`, including every Knowledge Graph relationship row.

**Activated a fully-built, zero-caller bookmark system**: `pinEntity`/`unpinEntity`
(`lib/context/context-history.ts`) existed only as "architecture hook for future UI" — no button
anywhere called them. Wired `pinEntityToWorkspace`/`unpinEntityFromWorkspace`/`isEntityPinned`
into `PlatformContextProvider`, added a new `SaveToWorkspaceButton` to the company profile, and
`PinnedEntities.tsx` (already used in the context header) now renders real links plus a real
"remove from workspace" action — the same component now also powers My Work's "Saved Work"
section, which previously stated no persistence layer existed. It does; it was simply unwired.

**New, honest Company↔Research connection**: confirmed zero real data-model link exists between
any company and any research topic (the Research Domain's organization types are documented
stubs). Rather than fabricate one, `lib/company-research.ts` matches a company's real `industry`
against real research topic domain/name/description text via a curated keyword table (the same
pattern `lib/search-gateway.ts`'s `SEARCH_TOPICS` already uses) — every match labeled "related by
subject matter," explicitly never a sponsorship or institutional claim. Wired both directions:
`CompanyRelatedResearch.tsx` on the company profile, `ResearchRelatedCompanies.tsx` on the
research topic page (hidden when empty).

**Added a real `website` field** to the `Company` catalog (real, publicly-known official URLs for
all 8 companies) and extended `EntityOverviewSection` to render a real fact as a clickable link
when an `href` is provided — additive, backward-compatible with its Country/University callers.

**Activated `CompanyMethodology.tsx`/`CompanyTrustSection.tsx`** (confirmed dead, zero callers) —
this mission explicitly asked for Trust and Methodology as sections of Company Intelligence
specifically, not just a link to the platform-wide `/trust` page. Deleted `CompanyCoveragePanel.tsx`
(also dead, confirmed redundant with the already-live `EntityEvidenceSection`).

**Honest Evidence detail**: `CompanySourceCoverage.tsx` now shows the full field set the mission
asked for per source — Publisher (real), Open source link (real), Publication date ("Not
available"), Confidence ("Not assessed" — the mission's own required wording), Citation ("Not
available"). No rich per-item evidence record (`CbaiEvidenceItem`, with citation/confidence/date)
exists anywhere in this platform for any entity type — confirmed architecture-only, never
instantiated. Shown honestly rather than fabricated.

**New real Company Report**: `lib/company-report.ts` (`buildCompanyReport`) compiles only
already-computed real data — Overview, Evidence, Research, Country, Methodology, Trust statement,
Limitations — from the same `journey`/`coverage` objects the profile page already uses, never
re-derived. A real "Generate report" button on the company profile toggles `CompanyReportView.tsx`
in place; no PDF/export pipeline exists (Reports Center already declares that Planned elsewhere),
so none was implied here.

**Command Center**: added `open company`/`compare companies` (mirroring the existing country
commands) and `generate report` (routes to Reports Center) to the deterministic phrase table.
`save workspace` is handled as a real action in `AssistantCommandCenter.tsx` itself, not the pure
resolver — it pins whichever entity `PlatformContextProvider` currently has focused, with a real
confirmation message, and an honest "nothing to save yet" message when no entity is focused, never
inventing something to save.

**Tests**: new `scripts/test-companies-intelligence.ts` (`npm run test:companies-intelligence`) —
15 tests covering real link resolution for every real catalog name, honest `null`/empty results
for unknown names and unmapped industries, report-field traceability, the real https website
format, and the new Command Center commands. 15/15 passing, alongside the unchanged 28
(product-activation) + 11 (research-slice) = 54 total.

**Not attempted**: no new external evidence sources were connected (would require real data
ingestion, out of scope); no PDF/CSV export was built (Reports Center already honestly declares
this Planned); the Company↔Research keyword table covers the 6 seeded industries only — a new
industry added to the catalog without a matching keyword entry would honestly show "No verified
data available" rather than silently guessing.
