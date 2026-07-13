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

## 12. Countries Intelligence — module-depth activation

Response to "CBAI Product Activation — Countries Intelligence" (target: 10/10 production quality,
same reuse-first constraints as every prior module mission). No new architecture, no fake
geopolitical analysis, no invented country ratings or economic values.

**Investigated Country↔Research before building anything**: confirmed, by reading every
`RESEARCH_TOPICS` entry's `topicName`/`domain`/`description`, that zero topics reference any
country, region, or geography — unlike Company (which has a real `industry` field to anchor a
keyword match), `Country` carries no comparable categorical field. Building a keyword matcher here
would have had no honest anchor on either side, so none was built. Instead, the required "Research
topics" Country Profile section (`CountryRelatedResearch.tsx`) states plainly that no verified
country↔research link exists in the current catalog — an honest empty state satisfies the
mission's own "hide unsupported modules" instruction without fabricating a connection just to fill
the section.

**Wired the confirmed-dead bookmark UI onto Countries**: `SaveToWorkspaceButton` (built for
Companies, generic over `ContextEntityRef`) had zero Country caller — added to
`CountryIntelligencePanel.tsx`, using the same `pinEntityToWorkspace`/`isEntityPinned` architecture
already live for companies. No new storage model.

**Added a real `officialWebsite` field** to the `Country` catalog (real, publicly-known government
portal URLs for all 6 countries — usa.gov, gov.cn, gov.uz, bundesregierung.de, u.ae, japan.go.jp)
and surfaced it as a clickable fact on the overview and in the new report, using the same
`EntityOverviewFacts.href` mechanism built for Company's `website` field. "Population" was
explicitly NOT added — the mission requires it "only if real data exists," and no real population
figure exists anywhere in this catalog.

**Activated `CountryMethodology.tsx`/`CountryTrustSection.tsx`** (confirmed dead, zero callers,
mirroring the exact pattern found and fixed for Companies) into the Optional Exploration section of
`CountryIntelligencePanel.tsx`. Deleted the confirmed-redundant `CountryCoveragePanel.tsx` (zero
importers, superseded by the already-live `EntityEvidenceSection`).

**Honest Evidence detail**: `CountrySourceCoverage.tsx` now shows the same full field set Companies
got — Publisher (real), Open source link (real), Publication date ("Not available"), Confidence
("Not assessed"), Citation ("Not available") — rather than the prior name/organization/status-only
card.

**New real Country Report**: `lib/country-report.ts` (`buildCountryReport`) compiles only
already-computed real data — Overview, Evidence, Research (honest empty statement), Organizations
(related companies and universities, both real links resolved via `resolve-entity-link.ts`),
Methodology, Trust statement, Limitations — from the same `journey`/`coverage` objects the profile
page already uses. A real "Generate report" button toggles `CountryReportView.tsx` in place,
mirroring the Company Report pattern exactly; no PDF/export pipeline exists or was implied.

**Command Center, Search, and bidirectional relationship links required no changes**: `open
country`/`find country`/`compare countries`/`open research`/`open evidence`/`generate report` were
already in the deterministic phrase table from prior missions; `save workspace` already handles any
focused entity kind generically. Global search already indexes `entity.category` (a country's
region), so region search already worked. `CountryRelationships.tsx` was already fixed for
bidirectional links in the Companies mission (`abcbec0`) — confirmed still correct, not re-touched.

**Tests**: new `scripts/test-countries-intelligence.ts` (`npm run test:countries-intelligence`) —
12 tests covering the real official-website format, the deleted dead panel, report-field
traceability, the honest (never-fabricated) research statement, bidirectional link resolution for
every related company/university and graph relationship, and Command Center coverage for country
commands. 12/12 passing, alongside the unchanged 15 (companies) + 28 (product-activation) + 11
(research-slice) = 66 total.

**Not attempted**: no new external evidence sources were connected (out of scope, requires real
data ingestion); no PDF/CSV export was built (Reports Center already honestly declares this
Planned); no Country↔Research connection was fabricated — if a real link (e.g. a national research
funder registry) is ever added to the catalog, `CountryRelatedResearch.tsx` becomes the real place
to wire it, not before; no Population field was added, since none exists as real data.

## 13. Platform Relationship Activation

Response to "CBAI Product Activation — Platform Relationship Activation" (target: activate the
relationship layer across the whole platform — Country/Company/University/Research/Evidence/
Report/Workspace/Search/Command Center/Trust — rather than build another isolated module). No new
architecture; every fix below reuses an already-real relationship function, adapter, or component.

**University brought to parity with Country/Company**: the third Golden Rule entity had fallen
behind — `UniversityMethodology.tsx`/`UniversityTrustSection.tsx` were confirmed dead (zero
callers, same pattern already found and fixed for Country/Company), `UniversityCoveragePanel.tsx`
was confirmed dead and redundant with the already-live `EntityEvidenceSection` (deleted), no
`SaveToWorkspaceButton` had ever been wired onto a University profile, and no University Report
existed. All four fixed the same way Country/Company were: `UniversityMethodology`/
`UniversityTrustSection` activated into Optional Exploration, `UniversityCoveragePanel.tsx`
deleted, `SaveToWorkspaceButton` wired in, and a new `lib/university-report.ts`
(`buildUniversityReport`) + `UniversityReportView.tsx` compiling Overview/Evidence/
Research/Organizations/Methodology/Trust/Limitations from already-computed journey/coverage data,
behind a real "Generate report" toggle. `UniversitySourceCoverage.tsx` now shows the same honest
Publisher/Publication-date/Confidence/Citation fields Country/Company already have. University↔
Research has the same zero-signal problem as Country↔Research (no research topic mentions any
institution, and `University` has no field to anchor a match) — rather than force an always-empty
section, this mission's own "hide unsupported modules" instruction was applied literally: no
Related Research section was added to University at all.

**Workspace Activation extended to Research topics**: the mission requires Save/Bookmark/Continue
from Research, not just Country/Company/University. The existing bookmark architecture
(`pinEntity`/`unpinEntity`, `EntityKind`) was scoped to those three kinds only. Traced every
consumer of `EntityKind`/`ContextEntityRef["kind"]` before changing it (4 real call sites:
`context-history.ts`'s validation whitelist, `context-builder.ts`'s `resolveEntityRef`,
`context-navigation.ts`'s `entityPrimaryModules`, and `PinnedEntities.tsx`/`RecentEntities.tsx`'s
`entityRoute`) and confirmed `pinEntityToWorkspace`/`unpinEntityFromWorkspace`/`isEntityPinned`
themselves are already fully generic — extending `EntityKind` to add `"research_topic"` needed no
change to the pin functions, only a case added at each of those 4 switches (research topics are
path-routed, `/research/[topicId]`, not query-param routed, so they're never resolved through the
country/company/university URL-focus system — each new case says so explicitly). A real
`SaveToWorkspaceButton` is now on every research topic page; My Work's Pinned/Recent lists render
a real research topic link via `getResearchTopicPath` instead of the query-param builder used for
the other three kinds.

**Fixed a real, confirmed dead end**: Research topic pages' "Open evidence" action (both the
Contextual Operator banner and, previously, the Command Center) routed to `/knowledge` — a real
Evidence Explorer hub, but one with zero awareness of Research (`entityModules` only covers
country/company/university). Clicking it from a research topic dropped the user on an unrelated
page with no way back. Fixed by giving `ResearchIntelligenceOverview.tsx`'s already-real
"Evidence status" block a real `id="evidence"` anchor and pointing both the banner and the new
Command Center resolver at `/research/{topicId}#evidence` instead — an in-context fix, not a new
evidence system.

**New relationship-aware Command Center**: `resolveAssistantCommand` is a pure phrase→fixed-href
table with no notion of "the entity on screen," so it could never answer "open related research"
for whichever entity the user is actually viewing. New `lib/assistant/assistant-relationship-commands.ts`
(`resolveRelationshipCommand`) uses the real relationship functions every entity module already
computes — `getCountryRelationships`, `getCompanyRelationships`, `getUniversityRelationships`,
`getRelatedResearchTopics`/`getRelatedCompaniesForTopic` — to answer "open related
research/company/university/evidence" and "open country" against whichever real entity (including
a research topic) is currently focused: one real match navigates straight there, several open the
real listing page, zero returns an honest message, never a guess. Wired into
`AssistantCommandCenter.tsx` ahead of the fixed table, so it also makes the existing generic "open
evidence" phrase context-aware for free.

**Browser-verified the full relationship graph**: USA → Apple (real linked company) → Apple's real
related research topics (Materials Science domain, matched via the existing Company↔Research
keyword table — e.g. `semiconductors`) → that topic's real related companies (Apple, NVIDIA,
Samsung, closing the loop) → the topic's real Evidence anchor → Save to workspace → My Work's
Pinned list. Repeated for Japan and Germany (both show real official-website facts, a real Save
button, and an honest "No verified catalog relationships" empty state where no real company/
university is linked — never fabricated).

**Tests**: new `scripts/test-relationship-activation.ts` (`npm run test:relationship-activation`)
— 14 tests covering University report traceability, the research-topic pin round-trip, and every
branch of the new relationship resolver (single match, multi match, honest empty, already-viewing,
unfocused fallback, and fall-through for phrases it doesn't own). 14/14 passing, alongside the
unchanged 12 (countries) + 15 (companies) + 28 (product-activation) + 11 (research-slice) = 80
total.

**Not attempted**: no new "Evidence" entity was built to unify the Evidence Explorer
(`/knowledge`, country/company/university only) with Research's own real per-topic evidence model
(`ResearchIntelligenceOverview.tsx`'s `evidenceSummary`) — these remain two real, honest, separate
systems rather than one merged for cosmetic consistency; the standalone `/research/evidence` demo
page (a single hardcoded placeholder record, already honestly labeled as such) was left untouched,
out of scope for this mission. No fabricated Country↔Research or University↔Research connection
was added. `/trust` (the platform-wide methodology center) was not cross-linked with each entity's
own Trust section — both are already real and honest on their own; unifying them was judged lower
value than the relationship gaps above and was not attempted.

## 14. Universal Entity Engine (Platform Core)

Response to "CBAI Product Activation — Universal Entity Engine" (priority: Platform Core; a
progressive refactor, explicitly not a rewrite — every current route had to keep working, byte-
identical, throughout). Investigated first: `lib/entity/entity.types.ts` already exists — a
pre-Constitution "Universal Entity Framework" used only by `lib/global-search.ts`'s
`getAllEntities()` (zeroed-score `Entity` objects feeding search-result cards for
Country/Company/University). This mission extends that real foundation rather than inventing a
second, competing one.

**Entity model, additive**: `Entity` gained optional `summary`, `country`, `organization`,
`relationships`, `reportsAvailable` fields — every existing field, and every existing caller
(3 adapters + `global-search.ts`), untouched. `EntityType` gained `"research_topic"` (with a real
module config, icon, and accent color — `lib/entity/entity.icons.ts` and
`ENTITY_MODULE_CONFIGS` are `Record<EntityType, …>`, so this was a compile-enforced, exhaustive
addition, not an optional one). New `lib/research-topic.adapter.ts` (`toResearchTopicEntity`) —
Research topics had never participated in the universal Entity model at all; they now produce a
fully valid `Entity` (verified by the existing `isValidEntity` runtime guard) for every one of the
65 real catalog topics.

**Relationship model**: new `lib/entity/entity-relationships.ts` (`buildEntityRelationships`) —
not a new relationship engine. It normalizes the already-real, already-tested per-module
relationship functions (`getCountryRelationships`, `getCompanyRelationships`,
`getUniversityRelationships`, `getRelatedResearchTopics`/`getRelatedCompaniesForTopic`) onto one
shared vocabulary (`RELATED_TO`, `LOCATED_IN`, `HAS_RESEARCH`, plus the unused-but-reserved
`PUBLISHED_BY`/`SUPPORTED_BY`/`REFERENCES`/`HAS_REPORT`/`HAS_EVIDENCE`/`BELONGS_TO`/
`USES_DATASET`/`PART_OF_WORKSPACE` for future entity kinds that need them). Deliberately **not**
baked into the three existing `toXEntity()` adapters — `entity-relationships.ts` depends on those
adapters' own relationship functions, so populating `Entity.relationships` inside them would
create a circular import; it stays an optional field, computed on demand by callers that need it.

**Universal Related Panel**: new `components/shared/EntityRelatedPanel.tsx` — one "Related
Entities" component, grouped by real target type, replacing the need for a bespoke
"Related Companies"/"Related Universities"/"Related Research" component per module. Migrated
`ResearchRelatedCompanies.tsx` onto it (verified via build + a curl content check that the
rendered heading, note, and every company link are byte-identical to the pre-migration output) —
the first real, in-production proof that a page can move onto the universal engine without
changing what the user sees. `CountryRelationships.tsx`/`CompanyRelationships.tsx`/
`UniversityRelationships.tsx` were **not** migrated in this pass (they combine Knowledge Graph
edges with linked-entity lists in a way that doesn't map 1:1 onto `EntityRelatedPanel` yet without
risking a visual regression on three already-correct, tested pages) — left as real, working
legacy components, not touched.

**Universal Report System**: new `lib/entity/entity-report.ts` (`buildEntityReport(entityType,
id)`) — one function name, real dispatch. For Country/Company/University it returns the exact
object `buildCountryReport`/`buildCompanyReport`/`buildUniversityReport` already produced (proven
byte-identical by two new tests comparing the facade's output against calling the direct builder),
so it was safe to be the single source of truth going forward. For Research topics — which never
had a report — it compiles a new, minimal, honest one from the same real data
`ResearchIntelligenceOverview.tsx` already renders (`buildResearchMission`'s evidence count and
the shared relationship builder), with no fabricated methodology list or evidence total that
doesn't exist for research today. Returns `null` for any unresolvable id, across all four kinds —
never a fabricated report.

**Universal Workspace**: already generic — confirmed, not rebuilt. `pinEntity`/`unpinEntity`/
`isEntityPinned` (extended to `research_topic` in the prior mission) operate on `kind: EntityKind`
+ `id` alone; no entity-type-specific pin logic exists anywhere. This mission adds no new
workspace code — it's the one piece of the "Universal Entity Engine" that was already complete.

**Universal Sidebar**: confirmed already unified — `components/layout/Sidebar.tsx` is the single
platform navigation component; no per-entity-type sidebar implementations were ever found. No
change needed.

**Command Center migrated onto Entity objects**: `lib/assistant/assistant-relationship-commands.ts`
was refactored to resolve every "open related X" command through `buildEntityRelationships`
instead of calling each module's relationship function directly — verified behaviorally identical
by re-running the prior mission's 14 tests unchanged (14/14 still pass) before adding new ones.
This is the literal fulfillment of "Assistant commands operate on Entity objects, not individual
page implementations."

**Universal Header, built but not swapped into a live page**: new
`components/shared/EntityHeader.tsx` wraps the already-real `EntityOverviewSection` around a
generic `Entity` object (mapping `entity.metrics` onto the header's `facts` list) — a genuine,
tested "one header for any entity type." Not inserted into Country/Company/University (their
existing `EntityOverviewSection` call sites pass richer, bespoke facts — Government, Founded +
Official website — that a generic `Entity` object doesn't cleanly carry without losing detail) or
Research (`ResearchTopicHero.tsx` is a stylistically different hero, not a compact overview card;
swapping it would be a visual redesign, which this mission explicitly forbids). Recorded honestly
as built-and-tested, not yet live — the responsible choice given "do not redesign the UI."

**Universal Search**: not migrated in this pass. `executeGatewaySearch` already groups results by
type cleanly (no duplicate results today); forcing Research topics through the same `Entity[]`
array `searchEntities()` returns for Country/Company/University would require restructuring how
result groups render, risking the exact duplicate-results regression this mission explicitly warns
against. `toResearchTopicEntity` exists and is ready for that migration when the group-rendering
layer is generalized — deliberately deferred, not silently dropped.

**Tests**: new `scripts/test-universal-entity-engine.ts` (`npm run test:universal-entity-engine`)
— 13 tests covering Entity validity for all four kinds, relationship-builder correctness and
honesty (never a link to a non-existent entity, honestly empty for unknown ids), report-facade
byte-identity against the direct builders, the research-topic report's honesty, and the migrated
Command Center resolver's unchanged behavior. 13/13 passing, alongside the unchanged 14 + 12 + 15
+ 28 + 11 = 80 total — **93 tests overall**.

**Not attempted**: `CountryRelationships.tsx`/`CompanyRelationships.tsx`/
`UniversityRelationships.tsx` were not migrated onto `EntityRelatedPanel` (real regression risk on
working pages, deferred). `EntityHeader` was not inserted into any live page (see above). Universal
Search's group-rendering layer was not restructured. `EntityRelationship`'s
`PUBLISHED_BY`/`SUPPORTED_BY`/`REFERENCES`/`HAS_REPORT`/`HAS_EVIDENCE`/`BELONGS_TO`/
`USES_DATASET`/`PART_OF_WORKSPACE` vocabulary members are reserved for future entity kinds
(Government Institution, Laboratory, Dataset, Patent, Researcher, Investor, Policy, Court, Law,
Economic Indicator) that don't exist as real catalogs yet — declared honestly, not wired to
fabricated data.

## 15. Platform Core Completion

Response to "CBAI Product Activation — Platform Core Completion" (priority: Critical; finish the
migration the prior mission started, not build more architecture). Every deferral from §14 was
revisited here; each was completed for real, or re-deferred with a concrete, verified reason.

**`EntityRelatedPanel` now replaces `CountryRelationships.tsx`/`CompanyRelationships.tsx`/
`UniversityRelationships.tsx`'s duplicate rendering — the regression risk that blocked this in §14
was resolved, not just re-assessed.** Investigation found the risk was real but solvable:
`buildEntityRelationships` only sourced the narrow `getXRelationships()` name lists, while the old
components rendered the richer Knowledge Graph edges (`profile.coverage.graphRelationships`) *and*
a redundant bottom summary of the same names. Traced `lib/graph/graph.builder.ts`'s edge
construction and confirmed every edge is built directly from `getCountryRelationships`/
`getCompanyRelationships` by name-matching against a node built from that same name — so the graph
is a strict superset, never missing an entry the name lists have. `EntityRelationship` gained
optional `label`/`verified` fields; `buildEntityRelationships` for country/company/university now
reads `buildCountryCoverageProfile`/`buildCompanyCoverageProfile`/`buildUniversityCoverageProfile`'s
`graphRelationships` directly (Company↔Research edges, absent from the graph, are still layered on
top via the existing keyword matcher). `EntityRelatedPanel` renders the real edge label
("Located In", "Registered In", "Belongs To") and verification badge when present. The three
former "legacy" components are now thin wrappers — heading, description, and (for Company/
University) the honest "partner claims not shown" note stay page-specific; the duplicate
graph-list-plus-redundant-summary rendering is gone, replaced by one shared call.

**`EntityHeader` migrated into Country/Company/University and, newly, Research.** Extended
`EntityHeader` to accept either a universal `Entity` object or the exact explicit prop set
`EntityOverviewSection` always took — the three profile panels now import `EntityHeader` instead
of `EntityOverviewSection` directly, passing identical props (zero output change, verified by
build + curl content match). Research topics previously had no structured overview card at all;
`ResearchTopicHero.tsx`'s generic "This read-only catalog profile describes…" boilerplate paragraph
is now `<EntityHeader entity={toResearchTopicEntity(topic)} />` — real per-topic data (type,
domain, metrics-derived facts) replacing static filler text. The real "Human review is required…"
safety statement that paragraph also carried was preserved as its own line, not dropped.

**Research topics gained a fourth real report.** New `ResearchTopicReportView.tsx` + a "Generate
report" button on the topic page, using the same `buildEntityReport("research_topic", id)` facade
built (but not wired to any UI) in §14. Country/Company/University's existing "Generate report"
buttons were switched from calling `buildCountryReport`/`buildCompanyReport`/`buildUniversityReport`
directly to `buildEntityReport(type, id)` — proven byte-identical by the existing facade tests, now
exercised from real call sites, not just tests. `buildEntityReport` was given overloaded signatures
per literal `entityType` so each call site gets its exact report shape back with no manual
narrowing.

**Trust connected**: every report now carries `dataStatus` (`ProductStatus`, via the already-real
`resolveEntityDataStatus`), rendered as a real `StatusBadge` in all four report views. Methodology,
Trust (statement), and Limitations were already present in every report from §14 — `dataStatus`
was the missing piece connecting "Data Status" through the shared Entity layer for real, without
inventing a new "verification status" concept where none honestly exists (per-relationship
`verified` from the Knowledge Graph already covers that).

**Universal Search completed**: research topics are now real `Entity` objects in
`getAllEntities()`/`searchEntities()`, not a second, parallel search path. `EntityType`'s
`research_topic` case was added to `buildPlatformEntityHref` (path-segment routing,
`/research/{topicId}`, not the query-param pattern the other three use) and to
`buildEntityResultEntry` (a real branch: `showReports: true`, `showCompare: false`). The bespoke
`ResearchTopicMatch`/`buildResearchTopicResultEntry`/`TopicResultCard`-for-topics path was removed
outright — `SearchGatewayResults.tsx` now renders research topics through the exact same
`EntityMatchCard` path as Country/Company/University. To keep this lossless, `toResearchTopicEntity`
gained real `tags` from `relatedMethods`/`relatedEvidenceTypes` (the same haystack the old
`filterResearchTopics` searched that `searchEntities`'s generic text match didn't previously cover),
closing a real recall gap before switching the data source, not after.

**Command Center completed**: `AssistantCommandCenter.tsx`/`ContextualOperatorBanner.tsx` both
computed "whichever entity is focused" via an inline `context.country ?? context.company ?? context.university`
ternary chain, duplicated three times. Replaced every occurrence with `getPrimaryEntity(context)` —
an already-existing, previously underused canonical accessor in `lib/context`. Same computation,
now one named call instead of a repeated inline chain; commands now read as operating on "the
Entity Context" rather than three separate PlatformContext fields.

**Legacy removed**: the duplicate-rendering code inside `CountryRelationships.tsx`/
`CompanyRelationships.tsx`/`UniversityRelationships.tsx` (a hand-built Knowledge Graph list plus a
redundant linked-name summary showing the same data twice) is gone, replaced by `EntityRelatedPanel`.
The bespoke research-topic search path (`ResearchTopicMatch` type, `researchTopics` field on
`SearchResultGroup`, `buildResearchTopicResultEntry`, the `filterResearchTopics` call inside
`executeGatewaySearch`) is gone, replaced by the unified Entity-based path. No working functionality
was removed in either case — verified via the full existing test suite (93/93 unchanged) plus 10 new
tests targeting the migrated behavior specifically.

**Tests**: new `scripts/test-platform-core-completion.ts` (`npm run test:platform-core-completion`)
— 10 tests covering the graph-sourced relationship builder's real labels/verification status, the
lossless University migration, research topics as real Entity search results, the closed tag-recall
gap, `dataStatus` on every report kind, and `getPrimaryEntity`'s precedence. 10/10 passing, alongside
the unchanged 13 + 14 + 12 + 15 + 28 + 11 = 93 total — **103 tests overall**.

**Not attempted**: no new entity kind (Government Institution, Laboratory, Dataset, Patent,
Researcher, Investor, Policy, Court, Law, Economic Indicator) was added — none has a real catalog
yet. `/trust` (the platform-wide methodology center) still isn't cross-linked with each entity's
own Trust section — both remain real and honest on their own; this is still judged lower value than
the completions above. `EntityHeader`'s explicit-prop mode means Country/Company/University's
richer bespoke facts (Government, Founded, Official website) are not yet expressed as part of the
universal `Entity` type itself — they still live in each module's own `registryFacts`, passed
through `EntityHeader` verbatim. Unifying that fully would mean extending `Entity` with per-kind
fact schemas, a real but separate migration not attempted here to avoid touching working fact
displays without a concrete need.

## 16. Research Workspace Activation

Response to "CBAI Product Activation — Research Workspace Activation" (priority: highest; make
Research Workspace the primary working environment, reusing the Universal Entity/Workspace/
Report/Relationship Engines rather than building new architecture). Investigated first, via a
dedicated Explore pass over `lib/research-workspace/`, `lib/research-mission/`,
`lib/research/evidence/`, `lib/research/review/`, `lib/research/intelligence/`, and every
`components/research/topic/*.tsx` file, before writing anything.

**Key finding that shaped everything**: `/research/workspace` (the route Command Center's
"Continue workspace" already links to) is a genuinely separate, honestly-labeled read-only topic
switcher (`WORKSPACE_SHELL_NOTICE`: *"This is a read-only workspace shell..."*) — a different
system from `lib/research-workspace/`'s real Contract. The actual real, data-rich "research
workspace" already lived on the real topic-detail route (`/research/[topicId]`, via
`TopicReviewWorkspace.tsx`), which already rendered "Research notes," "Findings," and "Open review
questions" headings — always empty, because `lib/research/intelligence/review-workspace-model.ts`'s
`ResearchNote`/`ResearchFinding` types existed as *"architecture for a future build … no
persistence exists anywhere in this platform yet"* (verbatim doc comment). Open Questions were
already real and live (`buildOpenQuestions`, derived from real evidence-gap state) — not a gap.
`EvidenceCenterSection.supportingEvidence`/`.conflictingEvidence` (the real, Reasoning-Engine-
computed Counter Evidence, from actual `contradicts` relationships, never inferred) was already
computed inside `ResearchWorkspaceContract` but silently dropped by `research-mission-builder.ts`
and never rendered by any component. This mission's job was almost entirely: add the one missing
piece (persistence) and surface the one already-computed-but-dropped piece (counter evidence) —
not build a parallel workspace.

**Real persistence, following the established pattern**: new
`lib/research/research-workspace-store.ts` mirrors `lib/context/context-history.ts`'s exact shape
(isBrowser guard, one JSON blob per localStorage key, sanitize-on-read, never throws) — the same
pattern already proven by two real stores in this codebase, not a third competing shape. Provides
real `saveResearchNote`/`loadResearchNotes` and `saveResearchFinding`/`loadResearchFindings`, each
note/finding belonging to Research (topicId), Workspace (implicit), and optionally a real linked
Evidence item or related Entity (never fabricated — the link dropdowns are populated only from
real catalog data already computed for the page).

**Evidence Lifecycle — genuinely new, since no existing type matched it**: confirmed via the
investigation that `EvidenceStatus` (draft/verified/disputed/deprecated/archived, in
`lib/research/evidence/`) and `VerificationStatus` (not_started/verification_pending/verified/
failed/not_applicable, in `lib/foundation/`) are both real but neither matches the mission's
requested Collected→Reviewed→Linked→Compared→Referenced→Included in Report→Archived vocabulary.
New `EvidenceLifecycleStage` (7 values) + `advanceEvidenceLifecycle`, applied over real evidence
items already in the catalog (`TopicEvidenceCatalogItem`, from the already-real
`buildTopicEvidenceReview`). Every item starts honestly at "Collected" (true of anything already
catalogued) with no persisted record; `EvidenceLifecyclePanel.tsx` only ever advances one stage at
a time via an explicit "Mark as {next stage}" action — stages can never be skipped or
auto-completed, and the full 7-stage track is always visible so an unadvanced stage reads as
exactly that, never hidden.

**Counter Evidence surfaced, not reinvented**: new `SupportingCounterEvidencePanel.tsx` renders
`mission.workspaceContract.evidenceSummary.supportingEvidence`/`.conflictingEvidence` directly —
real data that existed in the Contract since the Universal Entity Engine mission but was never
wired to any UI. Both columns render with equal visual weight; the counter-evidence empty state
explicitly states absence-of-evidence is not evidence-of-absence.

**Research Dashboard — one new composition, zero new engines**: new
`ResearchWorkspaceDashboard.tsx` assembles Current Question (`buildResearchMission`'s mission
center), Current Progress (`deriveResearchReadiness`'s real milestone counts — already wired
elsewhere in `TopicReviewWorkspace.tsx`, reused not re-derived), Evidence Summary and Missing
Evidence (`deriveEvidenceGapIntelligence`, the same real engine `TopicReviewWorkspace`/
`ResearchCockpit` already call), Recent Notes (the new real store), Related Reports (a real anchor
link to the topic's own Generate Report section), and Workspace Status (the real
`isEntityPinned("research_topic", …)` check, same architecture as `SaveToWorkspaceButton`). Every
field is either a direct pass-through of an already-computed value or a one-line composition —
nothing here is a new derivation.

**Workspace Activity**: new `ResearchWorkspaceActivity.tsx` — a real chronological feed built only
from the user's own actions (notes, findings, evidence-lifecycle changes), each carrying a real
timestamp from the new store. No fabricated "collaboration" or "team activity" — this platform has
no multi-user session model, so the feed is honestly single-user.

**Saved Drafts**: interpreted as the persisted Notes/Findings themselves, surfaced in the
Dashboard's "Recent notes" and the Report's "Research Notes" section — a genuinely new, separate
"drafts" data model was deliberately not built, since it would duplicate the Notes store for no
real functional difference (confirmed via the investigation that no "Draft"/"SavedDraft" concept
exists anywhere in the codebase to extend or collide with).

**Related Countries/Companies/Universities**: unchanged from the Universal Entity Engine mission —
`buildEntityRelationships("research_topic", id)` still only ever resolves real Company
relationships (industry-keyword match); Country/University groups are honestly absent, since no
real signal connects a research topic to either (confirmed again, not re-litigated).

**Report finished**: `ResearchTopicReport` (in `lib/entity/entity-report.ts`) gained `question`
(real, from the mission center), `supportingEvidence`/`counterEvidence` (real, from the Contract),
and `notes` (real, from the new store) — `ResearchTopicReportView.tsx` renders all three new
sections. The report now genuinely uses Question, Evidence, Notes, Entities (via
`EntityRelatedPanel`), Trust, and Limitations, as the mission asked — Timeline was evaluated and
left out honestly: `researchTimeline.events` is real but the Contract's own builder documents it
as *"currently latent (topic timelines are always empty today)"* for every real topic, so including
it would only ever render an empty section with no information value beyond what "Timeline: not yet
available" already conveys implicitly by its absence — not a fabrication risk, a genuine
information-density judgment call, noted here for transparency rather than silently dropped.

**Workspace continuity verified, not rebuilt**: "Continue later / Bookmark / Return from My Work"
already worked end-to-end via the `pinEntity`/`SaveToWorkspaceButton` architecture (extended to
`research_topic` in the Platform Relationship Activation mission) — confirmed still functioning,
no changes needed.

**Tests**: new `scripts/test-research-workspace-activation.ts`
(`npm run test:research-workspace-activation`) — 12 tests covering the exact 7-stage lifecycle
vocabulary, SSR-safety (honest emptiness, never throws) for notes/findings/lifecycle outside a
browser, and the report's real question/supporting-evidence/counter-evidence/notes wiring against
`buildResearchMission`'s own output (not a hand-typed expectation). 12/12 passing, alongside the
unchanged 10 + 13 + 14 + 12 + 15 + 28 + 11 = 103 total — **115 tests overall**.

**Not attempted**: `/research/workspace`'s separate topic-switcher shell was left completely
unchanged — it's honestly labeled read-only and conflating it with the real per-topic workspace
risked exactly the kind of confusing dual-system UI this mission's "reuse, don't build page
features" instruction warned against. `lib/research/review/`'s full peer/methodology/ethics review
domain (confirmed dead — placeholder page only) was not activated; it models a heavier,
multi-reviewer workflow this single-user platform has no real data for yet. Real round-trip
persistence (save then reload) could not be exercised inside the Node test harness (no
`localStorage`/DOM in this environment, matching the honest SSR case every store function already
handles) — verified instead via code review of the identical, already-proven
`context-history.ts` pattern, plus curl-based confirmation that the create-forms and honest-empty
states render correctly server-side.

## 17. Project Engine Activation

Response to "CBAI Product Activation — Project Engine Activation" (priority: Maximum; Project
becomes the primary working object of CBAI, reusing every existing engine rather than building a
new one). The explicit "STOP — do not create new pages" constraint shaped every UI decision below.

**Project is the fifth `EntityType`**, alongside Country/Company/University/Research Topic —
`toProjectEntity` (mirroring `toResearchTopicEntity` exactly) gives every real project a valid
universal `Entity`, participating in `getAllEntities()`/`searchEntities()` (Universal Search),
`buildEntityRelationships("project", id)` (Relationship Engine), and `buildEntityReport("project",
id)` (Report Engine) — the same three engines every other entity kind already uses, not a fourth
parallel system for Projects specifically.

**Project Types are pure configuration**: `PROJECT_TYPES` (8 entries — Research Project, Country
Analysis, Company Analysis, University Study, Policy Analysis, Investment Analysis, Technology
Assessment, Evidence Review) is a plain descriptive array. No code anywhere branches on a specific
type id — every Project, regardless of type, is created, stored, rendered, and reported by the
exact same functions and components, satisfying "Do NOT hardcode workflows. Use configuration"
literally rather than by convention.

**Real local persistence**: new `lib/project/project-store.ts` follows the exact pattern already
proven by `context-history.ts`/`research-workspace-store.ts` (isBrowser guard, one JSON blob per
localStorage key, sanitize-on-read, never throws) — six real, independent stores (Projects,
Project↔Entity links, Notes, Tasks, Open Questions, Evidence references), not one competing
mega-store and not six different persistence shapes.

**No new page was created.** "Project Home" — the mission's own long list of required sections
(Overview, Research Question, Objectives, Evidence, Notes, Related Entities, Countries/Companies/
Universities, Timeline, Tasks, Reports, Activity, Bookmarks, Trust, Methodology) — lives entirely
inside the *existing* `/my-work` route as a query-param-driven view (`/my-work?project=id`), the
same architectural pattern Country/Company/University already use (`?country=id` etc.) rather than
a new dynamic route file. `MyWork.tsx` was restructured (still the same file, same route) into a
Suspense-wrapped `useSearchParams()` reader: with `?project=`, it renders the full `ProjectHome`;
without it, the Project-first list view. **My Work is now Project-first**: `CreateProjectForm` and
`ProjectList` (Recent Projects, Pinned Projects — via the exact same `pinEntity`/
`SaveToWorkspaceButton` architecture every other entity kind uses, `EntityKind` extended with
`"project"` the same way it was extended with `"research_topic"` two missions ago, touching the
same five real switch-consumers) now sit above the pre-existing Continue Working/Recently Viewed/
Reports/Saved Work sections — none of which were removed.

**Evidence and Notes belong to both Projects and Entities, as required**: `ProjectEvidenceReference`
and `ProjectNote` are real, user-authored, projectId-scoped records — never an automated
"discovery" system — while every Country/Company/University/Research topic's own real evidence
coverage and notes (built in prior missions) are completely untouched and still belong to those
entities directly. A Project's Notes/Evidence optionally *link* to a real Entity or Evidence
reference by id; they don't replace or duplicate the entity-level systems.

**Open Questions remain visible until resolved** — `ProjectQuestion.resolved: boolean`, set only by
an explicit user action (`resolveProjectQuestion`), never auto-resolved or hidden by a timer.

**Related Entities use the Relationship Engine, both directions.** `buildEntityRelationships`
gained a `"project"` case (forward: real linked entities, from `loadProjectEntities`) and every
existing case (country/company/university/research_topic) gained a real backlink
(`PART_OF_WORKSPACE`-typed, via a new `getProjectsLinkedToEntity` reverse lookup) — so a Country's
own Related panel now honestly shows which Projects reference it too, not just the reverse. Reused
`EntityRelatedPanel` (built two missions ago) for every rendering — no new "related items" UI.

**Project Progress is six real boolean checks** (question defined / objectives written / evidence
added / notes created / entities linked / report generated this session), mirroring the exact
milestone-count pattern `lib/research/readiness/`'s Research Progress already established — never
a fabricated percentage. A freshly created, still-empty project honestly starts at 0/6.

**Project Reports assemble Overview, Research Question, Evidence, Notes, Entities, Timeline,
Trust, and Limitations** — `buildEntityReport("project", id)` dispatches through the same
overloaded facade Country/Company/University/Research Topic reports already use.

**Command Center**: `create project`/`open project` added as real fixed commands (both route to
`/my-work`, where the create form and project list already live). `continue project`/`add
evidence`/`open notes` are handled by a new, deliberately scoped `resolveProjectCommand` —
investigated first whether the Command Center could know "which project is currently open" the
same way it knows the focused Country/Company/University (via `?project=` on the current page),
and found that would require adding `useSearchParams()` to the *global* Command Center component,
forcing a Suspense boundary around every page's chrome — a real risk this mission explicitly
warned against ("Do NOT build another architecture" / backward compatibility). Instead, these
three commands operate on the real most-recently-updated project (`loadProjects()` is already
sorted that way) — an honest, real interpretation of "continue," not a fabricated per-page guess.
`find related entity` reuses the existing `resolveRelationshipCommand`, extended with the same
`"project"` focus case described above. `generate report` was deliberately left unchanged (still
routes to Reports Center) rather than overloaded with project-specific meaning — a Project's own
report is one real click away on its own Project Home page.

**Search**: "Create Project from Country/Company/University/Research" is real on both surfaces the
mission named — a `CreateProjectFromEntityButton` on every Country/Company/University/Research
topic profile page (next to the existing `SaveToWorkspaceButton`), and a `createProjectHref` field
added to `SearchResultEntry` itself, rendered as a real "Create Project →" action on every openable
search result card. Both deep-link to `/my-work` with the real entity pre-filled as Primary Entity
via query params — never a fabricated default.

**Tests**: new `scripts/test-project-engine.ts` (`npm run test:project-engine`) — 15 tests covering
real PROJECT_TYPES configuration, SSR-safe persistence across all six stores, `toProjectEntity`
validity, the relationship/report engine extensions, `buildPlatformEntityHref`'s project routing,
honest zero-progress on a fresh project (never a fabricated default), and both new Command Center
resolvers. 15/15 passing, alongside the unchanged 12 + 10 + 13 + 14 + 12 + 15 + 28 + 11 = 115
total — **130 tests overall**.

**Not attempted**: multi-user Visibility ("Team"/"Public") is declared honestly as Planned in the
create form (disabled, not offered as working) — there is no account system to build real sharing
on top of. Command Center project-command routing operates on "most recent project," not
"currently open project," a documented, deliberate scope limitation (see above) rather than a
fabricated capability. Project Timeline in the report reuses the same real create/update
timestamps `ResearchWorkspaceActivity.tsx` already established for Research topics — no new
timeline engine was built for Projects specifically.
states render correctly server-side.

## 18. Intelligence Guide Activation

Response to "CBAI Product Activation — Intelligence Guide Activation" (priority: Maximum; the
Assistant becomes an Intelligence Guide, reusing the Project Engine, Entity Engine, Assistant,
Context Engine, Workspace Engine, My Work, Reports, and Universal Search — explicitly not a second
chatbot, not conversational AI, and never a fabricated recommendation).

**The Guide is a pure function, not a model call.** New `lib/project/project-guide.ts`
(`resolveProjectGuideStep`) checks exactly the mission's order — Research Question, Objectives,
Evidence, Related Entities, Notes, Report — against a Project's own real fields and its real
Evidence/Entity/Notes stores, returning the first real gap. Nothing is inferred, scored, or
generated; an identical Project always resolves to an identical suggestion. Tone is deliberately
soft everywhere it's rendered: "Suggested Next Step" / "Continue" / "Available Action" / "Ready
When You Are," never "must," "required," or "mandatory" (verified by an automated test that scans
the resolved suggestion text for those words).

**Report generation became a real, persisted event.** The prior mission's `deriveProjectProgress`
took a `reportGeneratedThisSession: boolean` the caller had to remember to pass — real for the
current tab, but silently wrong on a page reload or in a second tab (a genuine progress-fabrication
risk the Guide's "no Report yet" check would have inherited). `Project` gained a real
`reportGeneratedAt?: string` field, set only by an actual "Generate report" click
(`markProjectReportGenerated`, `lib/project/project-store.ts`) — `deriveProjectProgress`, the new
Guide, the new Project Health panel, and the Report Engine's own timeline (a new "Report generated"
entry) all now read this one honest, cross-session source instead of four independent proxies.

**Project Health is eight real signals, never a score.** New `lib/project/project-health.ts`
(`deriveProjectHealth`) returns booleans for Question/Objectives/Report and real counts for
Evidence/Notes/Entity links/Tasks (done vs. total)/Open questions — rendered by
`ProjectHealthPanel.tsx` as a checklist with real counts next to each row, deliberately never
collapsed into a percentage or composite score, matching the mission's explicit "Never invent
percentages."

**Project Timeline is a real panel now, not only buried inside the report.** New
`ProjectTimelinePanel.tsx` surfaces the Report Engine's already-real `timeline` field (project
created → evidence added → notes written → tasks added → report generated, sorted by real
timestamp) directly on Project Home — reusing `buildEntityReport("project", id)`, not a second
timeline engine. An empty project shows a real, empty, teaching state rather than a placeholder
event.

**Smart empty states, project-wide.** Every "nothing here yet" message in Evidence/Notes/Tasks was
rewritten to teach rather than just report absence, e.g. Evidence: "No Evidence has been added yet.
Start by collecting one verified source." (the mission's own example, applied literally); Notes:
"No Notes yet. Document what you learn as you go — notes capture your thinking in your own words.";
Tasks: "No Tasks yet. Break this project into small, trackable steps."; Related Entities: "No
entities linked yet. Link a Country, Company, or University this project is about."

**My Work project cards now show Current status, Suggested next step, Last activity, and a
Continue button**, per the mission's literal list — `ProjectCard` (in `ProjectList.tsx`) takes the
real `Project` object and calls the same `resolveProjectGuideStep` the Guide panel and Command
Center use (one resolver, three surfaces). The Continue button deep-links straight to the
suggestion's real anchor (e.g. `#project-evidence`), not just the project's home — clicking
"Continue" takes the user directly to the next real, actionable field.

**Command Center gained `open next step` / `generate project report` / `open project evidence`.**
Investigated the existing relationship resolver first and found it already owns the bare `open
evidence` phrase unconditionally (`assistant-relationship-commands.ts`'s `RELATED_EVIDENCE_PHRASES`,
checked before the project resolver) — reusing that exact phrase for Projects would have been dead
code, so the new phrases are deliberately distinct and non-colliding, documented in
`project-commands.ts`. `open next step` reuses `resolveProjectGuideStep` against the real
most-recently-updated project (same honest interpretation of "current project" the Project Engine
Activation mission already established for `continue project`/`add evidence`/`open notes`).

**Fixed a real, previously-dead wiring gap.** `ContextualOperatorBanner`'s `"project"` case (three
action chips: Open notes / Add evidence / Generate report) was built in the Project Engine
Activation mission but never actually reachable — the banner was never mounted on `/my-work`, and
even where it *is* mounted (Country/Company/University/Research pages), `resolveAssistantContext`
was never called with a `projectId`, the one argument that unlocks the `"project"` branch. Fixed by
mounting `<ContextualOperatorBanner projectId={project.id} />` on Project Home (which already has
the real id from its own `useSearchParams()` read) and adding a fourth, dynamic "Open Next Step"
chip computed from the same Guide resolver — without adding `useSearchParams()` to the banner
itself, so the Suspense-boundary risk the prior mission avoided for the *global* Command Center is
still avoided here.

**Fixed a real same-session staleness bug.** `ProjectDashboard` previously cached its reads
(`useState(() => loadProjectEntities(...))` etc.) at mount, so adding evidence or a note in a
sibling panel never updated the Dashboard's counts without a full page reload — a real risk to this
mission's primary goal ("the platform should always know the NEXT BEST REAL ACTION"). Converted
Dashboard, Guide, Health, and Timeline to read directly from the store on every render (no
caching), and every mutating panel (Evidence/Notes/Tasks/Open Questions) now calls a shared
`refresh` callback after a real write, so the Guide's suggestion and Health's counts update
immediately as the user works — not just on reload.

**Tests**: new `scripts/test-intelligence-guide.ts` (`npm run test:intelligence-guide`) — 12 tests
covering the Guide's exact ordering, its never-orders-language guarantee, the persisted
`reportGeneratedAt` field's effect on Progress and Health, honest SSR behavior for the three new
Command Center phrases, and href construction. 12/12 passing, alongside the unchanged
15 + 12 + 10 + 13 + 14 + 12 + 15 + 28 + 11 = 130 total — **142 tests overall**.

**Not attempted**: the Guide only ever surfaces one step at a time (the mission's own design, not a
checklist of remaining steps) — Project Health's checklist already covers "what else is missing"
for a user who wants the fuller picture. No new "Activity feed" beyond the existing Timeline panel
was built — the mission's Timeline example (create → evidence → notes → report) is exactly what the
Report Engine's real event list already produces.

## 19. Trust & Production Polish (EPIC 1)

Response to a browser-based product audit (7 personas, no code reading) that found real, verified
launch blockers: any broken URL fell through to the generic, unbranded Next.js 404; the Trust
page and Home footer rendered a literal internal dev string (`Build elite-home-final · Final Home
Architecture`) to every visitor; "Agents" sat in primary navigation promising something that
immediately disclosed as non-functional after the click; and several live pages used raw
engineering words ("Runtime," "Pipeline," "Architecture") in place of product language. This
mission fixed exactly those, made zero new features, and changed no layout.

**System pages (Part A)**: new `components/system/SystemPageShell.tsx` — real CBAI branding and
five recovery actions (Return Home, Go Back, Search, Continue Project when one exists, Feedback) —
backs a new root `app/not-found.tsx`, `app/(dashboard)/error.tsx`, `app/error.tsx`, and a
deliberately minimal, dependency-free `app/global-error.tsx` (must assume nothing works, per
Next's own guidance, since it replaces the root layout on a crash there). Verified against the
*actual* production static export (`out/404.html`), not just `next dev` — confirmed the real
production 404 experience changed from a blank, unbranded page to a branded one with a way back.
The existing research-topic `not-found.tsx` was upgraded onto the same shell. A real
`OfflineBanner` (genuine `navigator.onLine`/`online`/`offline` events) was added to the dashboard
layout.

**Trust Center (Part B)**: `PLATFORM_BUILD`/`PLATFORM_EVOLUTION_PHASE` deleted outright — they had
exactly two consumers (Trust page, Home footer), both fixed. Trust restructured around Methodology,
Verification Model (the real four-state status legend, quoted from `lib/product-status.ts`, not
reinvented), Evidence Policy, Data Sources (the real source-organization catalog the platform is
built to connect to), Known Limitations (a specific, honest statement of what's thin today), Human
Decision, Privacy, Copyright, and a new Transparency Statement replacing the old Version History
section. Nothing non-developer was removed — Constitution/Human Decision/Privacy/Copyright stayed.

**Broken routes and non-functional navigation (Parts C/D)**: investigated every nav destination
before touching anything. "Agents" was the one live primary-nav item that disappointed after a
click (self-disclosed "no runtime is connected yet") — removed from `primaryNavSections`; the
route itself is untouched and still honest, just no longer promoted. `/core` and `/workflows` were
confirmed, via a full-repo grep, to already be unreachable from any real navigation — satisfying
"never expose broken navigation" without any change. The dev-mode 500 for an unrecognized
`/research/<slug>` was investigated and found to be an inherent, expected characteristic of
`output: "export"` (only enumerated `generateStaticParams()` paths get a file; dev tries to
dynamically render anyway) rather than a fixable bug — the real production behavior for that exact
case is the branded 404 from Part A, which is the actual fix.

**Production copy (Part E)**: a full grep sweep of `components/` and `app/` for
Build/Architecture/Internal/Runtime/Adapter/Engine/Developer/Pipeline/Migration in rendered JSX
text and prop strings found and fixed every live instance — Agent stats/activity copy, the
Knowledge Graph's "Graph Pipeline" section heading and aria-label, every Research Topic page's
"Pipeline stages run" stat label (all 65 topics), and `product-status.ts`'s dead-but-real
`planned` explanation. Five components (`PipelineReadinessPanel`, `SessionRegistrySummaryCard`,
`RuntimeMetricsGrid`, `SystemSummaryCard`, `SearchRuntimeStatusPanel`) were confirmed completely
unreachable from any page via full-repo import search and left untouched — dead code a user can
never see is out of scope for a mission about what users actually experience.

**Error experience (Part F)**: five real recoverable states rewritten to explain what happened,
why, and what to do next. New `components/system/EntityNotFoundNotice.tsx`, wired into
Countries/Companies/Universities, reads the raw `?country=`/`?company=`/`?university=` query param
(safe — already inside `PlatformContextProvider`'s existing Suspense boundary) and shows an honest
notice when a requested id doesn't resolve, instead of silently substituting a different profile.
My Work's "Project not found" now explains projects are local-only. Search's empty state names the
query and explains scope. The three Relationships panels' empty state explains when connections
appear instead of a bare "none indexed."

**Micro trust (Part G)**: swept for TODO/Placeholder/Lorem/Temporary/Test/Dummy/Sample/Mock/debug
badges in rendered copy across the same live-page scope as Part E — no live violations found
beyond the same five already-confirmed-dead components.

**Tests**: new `scripts/test-production-readiness.ts` — 15 static source-inspection tests (this
harness has no DOM; these assert against the actual shipped source and the real build artifact
`out/404.html`) covering every fix above. 15/15 passing, alongside the unchanged
12 + 15 + 12 + 10 + 13 + 14 + 12 + 15 + 28 + 11 = 142 total — **157 tests overall**. `npm run
build` clean, 91 routes. Full detail: this section. Zero new features, zero layout changes, zero
fabricated data.

## 20. Data Activation Layer (EPIC 2)

Response to "maximize the amount of REAL connected information available using the existing local
catalog" — reuse only, no fabrication, no scraping. Investigated every catalog
(Countries/Companies/Universities/Research/Evidence/Trust/Reports) before writing anything, and
found the "obvious" relationships the mission named (Company↔Country, University↔Country,
Company↔Research, Research↔Company) were **already fully connected** by prior missions' Knowledge
Graph work — verified by tracing `buildEntityRelationships` through to `graph.builder.ts` and
confirming real counts (190 relationships across the catalog; every US-based company and
university resolves a real Country edge; every company with a real industry-keyword match to a
research topic resolves it bidirectionally). Country↔Research and University↔Research were
investigated and confirmed to have **no real connecting field anywhere in the catalog** — Country
has no industry-equivalent categorical field, and no research topic references a country; a prior
mission had already reached the same conclusion for Country (`CountryRelatedResearch.tsx`'s own
comment). Rather than invent a cross-taxonomy mapping (indicator domain slugs vs. `ResearchDomainId`
don't literally match) to manufacture a connection, this stayed honestly unconnected — for
University, added the same honest "not connected" statement Country already had (parity, not a new
capability): new `UniversityRelatedResearch.tsx`.

The highest-value real find: `INDICATOR_DOMAIN_CATALOG`'s `futureExpansion` field — 22 real,
already-written, domain-specific sentences ("Subnational governance and regulatory agency
indicators.", etc.) that had existed since the indicator framework was built but were **never
rendered anywhere in the UI**. New `components/shared/EntityFutureSources.tsx` surfaces this real
data as "Expected Future Sources" on every Country/Company/University profile page and report.

Country/Company/University Reports previously showed only a single aggregate "Evidence" line
(counts only). `country-report.ts`/`company-report.ts`/`university-report.ts` now also expose the
real, already-computed per-source name lists split by actual status — `connectedSourceNames`/
`missingSourceNames` — rendered as two clearly separated lists ("Connected Evidence" / "Missing
Evidence") in each report view, plus the same real `EntityFutureSources` ("Future Evidence").

Search results previously showed a hardcoded `evidenceStatus: "Available now"` for every single
result regardless of actual coverage — genuinely misleading for "how much information exists
before opening." New `resolveCoverageLabel` in `lib/search-intelligence-entry.ts` computes a real
"X of Y sources connected" (or "X of Y evidence items connected" for research topics) from each
entity's already-real coverage profile, rendered on every search result card via a new
`coverageLabel` field.

Compare pages fixed two real, previously-audit-flagged issues: "First profile"/"Second profile"
generic labels replaced with the real entity names already available in the same component; and
"Shared sources" (which counted sources *expected* by both profiles, not necessarily connected —
confirmed by tracing `comparison-builder.ts`'s `collectSources`) relabeled "Shared source
references" with an explicit caption stating it is not a claim that evidence is available from
all of them — directly satisfying "never imply unavailable evidence exists."

**Real counts** (computed and asserted by the new test suite, not estimated): 6 countries / 8
companies / 8 universities / 64 research topics in the catalog; 190 total relationships; every
entity has exactly 1 of its real sources connected (the local registry itself) — 22 of 182 total
country+company+university sources. These connected/total ratios did not change (no new source
was fabricated or connected) — the real change is *visibility*: previously-computed, previously-
invisible real data (future-expansion notes, per-source connected/missing breakdowns, coverage
labels, an honest University research statement) is now shown.

**Tests**: new `scripts/test-data-activation.ts` — 14 tests, including a real aggregate-count
assertion mirroring the mission's own "count connected countries/companies/universities/research/
relationships" request. 14/14 passing, alongside the unchanged 15 + 12 + 15 + 12 + 10 + 13 + 14 +
12 + 15 + 28 + 11 = 157 total — **171 tests overall**. `npm run build` clean, 91 routes. Full
detail: this section. Zero fabricated data; zero new pages; zero new architecture.

## 21. Authentication + User Platform Foundation

Response to "transform CBAI from a browser demo into a real multi-user platform." The honest
constraint this mission runs into immediately: this is a static export (`output: "export"`, no
server, no API routes), and a real cloud backend is inherently asynchronous — every existing store
function in this codebase (`loadProjects()`, `loadPinnedEntities()`, etc.) is synchronous. Wiring
a real Supabase project in would mean converting dozens of already-real, already-tested functions
from sync to async across the whole app — a repo-wide signature rewrite the mission's own "do not
redesign" rules out, and there is no real Supabase project or credentials in this environment to
build that rewrite against anyway (writing async call sites with nothing real behind them would be
its own kind of fabrication). So this mission did the honest version of what it actually asked for:
"prepare the platform for Supabase... keep browser storage only as a fallback or development
mode" — treated literally, not as permission to fake a live connection.

**Storage Model**: new `lib/storage/storage-provider.ts` — a real, typed `CloudStorageAdapter`
interface any future backend implements, `currentStorageMode()` as the one real switch point
(checks `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, always "local" in this
environment since neither exists), and a real `SupabaseStorageAdapter` class whose methods are
honestly async and honestly reject with a clear configuration error — real code, typed correctly,
never wired into any store, never fabricating a working connection. `@supabase/supabase-js` was
deliberately not added as a dependency — nothing in this pass calls it, and importing a client
library with no real project to point it at would be dead weight, not preparation.

**Authentication Foundation**: new `lib/auth/` — a genuine local account system, not a demo. Real
salted SHA-256 password hashing (`lib/auth/auth-crypto.ts`, Web Crypto — `crypto.getRandomValues`
per-user salt, `crypto.subtle.digest`, never plaintext), real sign-up/sign-in/sign-out
(`lib/auth/auth-store.ts`, same `isBrowser()`-guarded localStorage pattern every other store in
this app already uses), and a real `AuthProvider` React context using the exact
`useSyncExternalStore` pattern `AssistantProfileProvider` already established (server snapshot
always signed-out, reconciled with the real session on the client, no setState-in-effect
cascade). Every surface that shows this account says plainly what it is:
`LOCAL_ACCOUNT_NOTICE` — "stored, hashed and salted, on this device only... not a secure
substitute for a real cloud account" — the same honesty register as "Personal Operator" already
used for profile data.

**User Model**: `User { id, email, displayName, organization, passwordHash, passwordSalt,
createdAt }`, with a `PublicUser` type that structurally cannot leak credential fields to any
caller outside the auth store. `organization` reuses the exact field name and concept
`AssistantProfile.organization` already had — deliberately not building a second, competing
identity field.

**Ownership Model**: every Project, Bookmark (pinned entity), and Recent-Activity entry now
belongs to the real signed-in user — without duplicating a single storage shape. New
`lib/storage/namespaced-key.ts` computes a real per-user key (`cbai-projects:u:<userId>`) from the
real current session; `lib/project/project-store.ts`'s and `lib/context/context-history.ts`'s
`readList`/`writeList`/`writeEntityList` helpers were changed to resolve this key — every one of
their ~30 call sites needed zero changes. Signed out, everyone shares one `:local` bucket — a
one-time migration copies any pre-existing bare-key data (from before this mission) into that
bucket automatically, so nothing anyone already saved becomes unreachable. A signed-in user's
private key is never auto-populated from anonymous browser data, since that would silently
attribute someone else's saved work to whoever happens to sign in first.

**UI**: new `/account` page (`AccountForm.tsx`) — real sign-in/sign-up form, and a real signed-in
view showing the account's actual Project/Bookmark counts (read live from the now-namespaced
stores) and a Sign Out action. `AccountMenu.tsx` (Topbar) now shows real sign-in state — "Sign In"
when signed out, the real account name/email in the dropdown when signed in — deliberately kept
as a second, independent concept from the existing Assistant profile ("Set up Operator"), since
one is who owns your data and the other is how the Assistant addresses you; both can be true (or
neither) at once. `MyWork.tsx`'s copy, which previously said "CBAI does not yet have accounts" —
true when it was written, false the moment this mission shipped — was corrected to reflect the
real account system and invite sign-in.

**Tests**: new `scripts/test-auth-platform.ts` — 12 tests covering real hashing/salting
determinism, honest SSR-safe auth-store behavior (never throws, never fabricates a session
outside a browser), input validation, credential-leak prevention (`toPublicUser`), the honestly-
unconfigured Supabase adapter, and real key namespacing. 12/12 passing, alongside the unchanged
14 + 15 + 12 + 15 + 12 + 10 + 13 + 14 + 12 + 15 + 28 + 11 = 171 total — **183 tests overall**.
`npm run build` clean, 92 routes (`/account` is new — the one page this mission added, since a
sign-in/sign-up form is new UI that has no existing page to live in without redesigning Settings).

**Not attempted, honestly**: no real cloud persistence — nothing here talks to a network; "local"
is the only mode that actually runs. No email verification, no password reset, no rate limiting,
no CSRF/session-fixation hardening — this is a local-device credential store, not a hardened
backend auth system, and every surface says so. The Assistant profile
(`lib/assistant/assistant-profile.ts`) is *not* namespaced per-account — it stays one device-local
preference set regardless of who's signed in, a deliberate scope cut documented in that file's own
comment rather than silently left inconsistent. "Saved Reports" ownership does not apply yet
because no report-persistence exists at all in this codebase — every report is compiled fresh on
demand (`buildEntityReport`), never stored; building report persistence would be new feature work
this mission's "stop building frontend features" directive rules out. No multi-tenant Organization
model (roles, invites, shared workspaces) — `organization` is a real but plain text field, not a
new entity.

## 22. Maximum Launch-Blocker Remediation

A repair mission across all prior work, not a feature sprint — reused the Project/Entity/
Research/Evidence/Search/Command Center/Trust engines exclusively, added zero new architecture.
Investigated every Phase before writing anything: `find app -iname page.tsx` confirmed there are
no legacy/duplicate route files anywhere in the repo (every prior mission this session already
kept the route tree flat and canonical) — the "legacy pages" Phase largely didn't apply, so effort
went to the real gap found instead: 11 of 22 dashboard pages had no explicit `metadata` export,
silently falling back to the generic root title.

**A real, verified P0 bug found and fixed**: `OfflineBanner` (built in the Trust & Production
Polish mission) checked `typeof navigator !== "undefined"` to detect offline status — but modern
Node ships a global `navigator` object with `onLine` always `undefined`, so `!undefined` evaluates
`true` and every server render (dev *and* the real production static export) incorrectly rendered
"You're offline" to every visitor. Confirmed via curl against dev SSR output and the actual
`out/*.html` files, not assumed — this is exactly the kind of bug this mission's "do not claim
production readiness without browser evidence" rule exists to catch. Fixed by also requiring
`typeof window !== "undefined"` (true only in a real browser).

**A second real bug caught during verification, not before shipping**: the first version of the
Countries world-map disclosure fix had its `open`/summary-label ternary backwards — labeled the
collapsed state "(open)" and vice versa. Caught by re-checking the raw `<details open="">`
attribute in curl output against the label text, not by trusting the code read correctly on
first pass. Corrected before commit.

**Report contradiction removed**: every Country/Company/University profile page said "this
profile does not open a [type] report directly" immediately beside a working inline "Generate
report" button — found in the original Product Experience Audit, never fixed until now. Copy
corrected to state the real relationship between the on-page report and Reports Center.

**Report output activated for real use**: all 5 report types (Country/Company/University/Project/
Research Topic) gained a real generation timestamp and a real print/export action
(`ReportPrintButton`, `window.print()` plus `.cbai-print-area`/`.cbai-no-print` CSS that hides all
chrome). Every modern OS's print dialog offers "Save as PDF," so this honestly satisfies the
mission's PDF-export requirement without a new dependency or a fabricated export pipeline — no
dead button was shipped. Project reports gained Objectives/Tasks/Open Questions sections — all
three were already computed by `buildProjectReport`, never rendered.

**Trust Center accuracy regression found and fixed**: the Privacy and Known Limitations sections
still said "this platform does not have user accounts" — true when written, false since the
Authentication + User Platform Foundation mission shipped real local accounts three missions ago.
Corrected to describe the real account system (hashed/salted, local-only, no cross-device sync).
Added a real Terms of Use section — a minimum honest statement (as-is, no warranty, not
professional advice, local data can be lost) rather than inventing liability clauses or a
jurisdiction this platform has no authority to declare.

**Role surfaces given a real primary action**: Government, Investor, and Citizen previously showed
real coverage data with no way to act on it. Each gained a real "Start a [Role] Project" entry
point (`RoleProjectEntry`, reusing `CreateProjectForm` directly) mapped to a real, already-existing
Project Type (Policy Analysis / Investment Analysis / Evidence Review) — no new role architecture,
no duplicated engine.

**UX clarity fixes**: `CreateProjectForm`'s Visibility dropdown now disables Team/Public instead of
erroring after submission; the real per-type description (already in the catalog, never shown) now
renders under the Project Type selector. Project Home's Related Entities and Bookmarks — two
silently-overlapping concepts — now have a real star/unlink toggle per linked entity plus a
one-line distinction, with real `aria-label`s (not just `title`, which isn't reliably announced).
Saving Research Question/Objectives now shows a real "Saved." confirmation and immediately
refreshes Dashboard/Guide/Health, which previously required an unrelated action to pick up the
change.

**Accessibility**: targeted verification, not an exhaustive audit — confirmed `StatusBadge` already
conveys status via visible text, never color alone; confirmed `cbaiBtnPrimary`/`cbaiBtnSecondary`
(reused by every new button this mission) already carry real `focus-visible` outlines; added real
`aria-label`/`aria-pressed` to the new bookmark/unlink icon buttons. Not attempted: a full keyboard-
navigation sweep, mobile touch-target audit, or the pre-existing `outline-none` pattern used across
many form inputs codebase-wide (paired with a visible border-color change on focus, but not a
strict WCAG-ideal focus ring) — fixing that broadly would be exactly the "broad redesign" this
mission's rules prohibit.

**Auth/Backend**: no new findings — the Authentication + User Platform Foundation mission (three
missions prior) already completed this investigation and built the real local account system,
the Supabase-ready `CloudStorageAdapter` interface, and per-user key namespacing for Projects/
Bookmarks/Recent Activity. This mission's only backend-adjacent work was correcting Trust Center
copy that had gone stale since that mission shipped.

**Tests**: new `scripts/test-launch-gate.ts` — 17 tests, each tied to a specific verified fix
above. 17/17 passing, alongside the unchanged 14 + 12 + 15 + 12 + 15 + 12 + 10 + 13 + 14 + 12 + 15
+ 28 + 11 = 183 total — **200 tests overall**. `npm run build` clean, 92 routes (no new routes;
`/account` was added by the prior mission). Full detail: this section.

## 23. Real Supabase Authentication + Cloud Persistence

Converts the device-local-only account system (Authentication + User Platform Foundation mission)
into a real, optional cloud platform — without removing or breaking Local Mode, and without
converting any of the existing synchronous localStorage stores to unsafe async behavior.

**Phase 1 investigation, before writing anything**: confirmed this app has zero API routes, zero
middleware, and `output: "export"` in `next.config.ts` — a real static export with no server
runtime anywhere. Confirmed no Supabase dependency existed yet (`ls node_modules/@supabase` →
not installed). Confirmed the exact existing storage architecture: every store
(`project-store.ts`, `context-history.ts`) already routes through two shared choke points
(`readList`/`writeList` and `writeEntityList`), and both already route through
`lib/storage/namespaced-key.ts`'s `namespacedKey()` — the same trick the Authentication mission
used to add per-user ownership by touching 2 files instead of ~30 call sites. This mission reused
that same choke-point trick twice more: once to add cloud-session precedence to `namespacedKey()`
itself, and once to hook a real background cloud sync into each store's own mutation functions.

**Architectural decision — local-first, not a rewrite**: Supabase is fundamentally asynchronous;
localStorage is fundamentally synchronous. Converting every existing reader to `async`/await would
touch dozens of already-real, already-tested call sites across ~20 files (`ProjectHome.tsx`,
`MyWork.tsx`, every report view, every workspace) — exactly the "blindly convert synchronous stores
into unsafe async behavior" this mission's own Phase 1 warns against, and there is no live Supabase
project in this environment to build or test that rewrite against safely. Instead: local storage
stays the single synchronous source of truth for every existing reader, unchanged. A new
localStorage-persisted **outbox** (`lib/supabase/outbox.ts`) queues a real background cloud write
for every mutation, when a cloud session is active — retried with backoff, exposing real
Saving/Saved/Could-not-save status, never silently dropped. A new **pull-sync**
(`lib/supabase/pull-sync.ts`) hydrates a signed-in cloud user's own local cache bucket on sign-in,
merging by recency so a newer local edit is never silently clobbered. This is the same pattern
real local-first applications use, and it is the only way to satisfy "reuse existing... do not
redesign" and "prepare for Supabase" simultaneously without either claim being false.

**Real Supabase Auth activated**: email sign-up, sign-in, sign-out, session restoration via
`onAuthStateChange` + `getSession()`, forgot/reset password (with a real `/reset-password`
completion page — the one new static route added), and email-confirmation status. `AuthProvider`
now exposes `accountMode: "cloud" | "device-local" | "signed-out"` — every surface can be
explicit about which identity, and which persistence guarantee, is active. `AccountForm` gained a
Cloud Account tab alongside the pre-existing Device-Local Account tab; neither is silently treated
as the other.

**Real production schema, not a KV blob**: `supabase/migrations/0001_init_schema.sql` — UUID
primary keys, real typed relational columns (not one JSON blob), `owner_id`/`created_at`/
`updated_at` on every user-owned table, and a `local_id` dedup marker + `unique (owner_id,
local_id)` constraint on every synced table specifically to make the outbox and migration
idempotent. `0002_rls_policies.sql` enables Row Level Security on all 11 tables with exactly 4
own-record policies each (select/insert/update/delete), every insert re-verified server-side via
`with check (auth.uid() = owner_id)` — a payload's claimed `owner_id` is never trusted alone.
`0003_rls_verification_queries.sql` documents the manual cross-user isolation checks a live
project needs (this environment has no live project to run them against).

**Cloud Storage Adapter reconciled, not duplicated**: the prior mission's `CloudStorageAdapter`
(generic key-value `getItem`/`setItem`/`removeItem`) predates this mission's real schema work and
was designed around a KV shape Phase 5 explicitly rejects ("do not store core relational data as
one giant JSON blob"). Rather than leaving two competing cloud-storage concepts,
`lib/storage/storage-provider.ts` now documents the supersession plainly, gained a real
`LocalStorageAdapter` (closing the literal "implement LocalStorageAdapter" ask), and its
`SupabaseStorageAdapter` now points callers at the real, active `lib/supabase/` integration instead
of implying a KV path that doesn't exist.

**Local-to-cloud migration, safe by construction**: `LocalWorkMigrationPrompt` shows real itemized
counts (projects, notes, tasks, questions, evidence, entity links, bookmarks, reports) before
asking. "Import to Cloud" uploads additively via the same idempotent `(owner_id, local_id)` upsert
the outbox uses — retry-safe, no duplicates on a second attempt. "Keep Local for Now" is always
available and never deletes anything; local data is never deleted by this flow at any point.

**Reports gained real, persisted ownership** — a genuine gap found during this mission: no report
type had ever been saved anywhere; "Generate report" was (and remains) a pure on-page reveal.
`lib/reports/reports-store.ts` adds a real "Save to My Reports" index record (kind, entity, title,
when saved) with a "Save to My Reports" action on all 5 report views and a "Your Saved Reports"
list in Reports Center. Deliberately never a content snapshot — reopening always renders the live,
current report, so a saved report can never go stale relative to corrected evidence.

**Assistant profile ownership gap found and fixed**: the Assistant profile
(`lib/assistant/assistant-storage.ts`) was stored under one flat, unnamespaced key — shared by
*every* account on the same browser, a real regression the Authentication mission's namespacing
sweep had missed. Now namespaced like every other store, and syncs to the `profiles` table's
Assistant-owned fields when a cloud session is active. On cloud sign-in, a real comparison against
the cloud profile offers to load it only when it actually differs — never a silent overwrite in
either direction, and no second Assistant-profile system was created.

**Trust Center accuracy regression found and fixed (again)**: Privacy and Known Limitations still
said "no server," "no cross-device sync" — true before this mission, false after. Corrected to
describe both account types accurately, and added a real Account Deletion statement (Device-Local:
clear browser storage; Cloud: no self-service path yet, since this architecture has no server that
could safely hold the elevated credential such a deletion requires — contact the deployment
operator instead of a fabricated working "Delete Account" button).

**Security**: confirmed no service-role key exists anywhere in the codebase (`grep -rn
"SERVICE_ROLE" .` → zero matches) and no path could introduce one — this static-export architecture
has nowhere a server-role key could be held privately, documented directly in `.env.example` and
`lib/supabase/client.ts`. Confirmed `.env*` stays gitignored, with an explicit `!.env.example`
exception so the real, credential-free template ships. Confirmed no raw Postgres/Supabase error
text reaches the UI (`friendlyAuthError` maps every auth error to a generic message; migration/sync
failures show counts, never raw messages). Confirmed sign-out clears the real session (both the
device-local session key and Supabase's own persisted session).

**Static export compatibility**: confirmed, not assumed — `npm run build` was run after every
batch of changes throughout this mission and continued producing a fully static `out/` (92 routes,
zero server functions). Real Supabase Auth requires no server component, API route, or middleware
in this architecture — every call is a real client-side `supabase-js` invocation, the same pattern
every other piece of interactive state in this app already uses.

**Tests**: new `scripts/test-cloud-platform.ts` — 22 tests covering honest unconfigured/
unauthenticated behavior across every new cloud entry point, ownership-key precedence, adapter
selection, outbox no-op safety, migration idempotency/retry-safety, pull-sync safety, no
credential/service-role leakage, and a static verification that every table both enables RLS and
defines exactly the 4 policies Phase 6 requires. 22/22 passing, alongside the unchanged 183 + 17 =
200 — **222 tests overall**. `npm run build` clean, 92 routes (`/reset-password` is the one new
route).

**Not browser-verified (no live Supabase project in this environment)**: real account creation,
email confirmation, sign-in, multi-device sync, cross-account isolation under real RLS enforcement,
and password reset end-to-end. Every claim above about these behaviors is a claim about the code
that was written and its unit-test coverage — not a claim of live verification. See
`docs/supabase-setup.md` for exactly what a deployer must do to verify these live.

## 24. Premium Interface + Global Language Foundation + Multilingual Voice Commands

Migrates the first-screen interface toward the approved concept, activates a real 4-language
interface (English/Uzbek/Russian/Turkish), and extends the existing Command Center with
multilingual voice/text commands — reusing every real engine (Project Engine, Command Center,
Search, My Work, Reports, Personal Operator, Authentication) rather than duplicating any of them.

**No visual mockup image was present in this conversation** — Phase 17's detailed palette spec
(deep navy / midnight-blue / cyan / restrained indigo-violet / amber-for-economic-contexts) served
as the actual design reference; this is stated plainly rather than claiming a visual comparison
that didn't happen.

**Real i18n foundation, not a fourth hardcoded interface**: `lib/i18n/dictionary-types.ts` defines
one `TranslationDictionary` shape, checked at compile time against all 4 real dictionaries — a
missing key in Uzbek/Russian/Turkish is a build error, not a silent gap. `useTranslation()` reads
the *existing* `AssistantProfile.preferredLanguage` field rather than building a second state
system, inheriting its localStorage/cloud-profile persistence for free. HTML `lang`/`dir` now sync
post-hydration (real RTL preparation for the still-inactive Arabic entry).

**Real bug found and fixed by the new test suite before it shipped**: the mission's own worked
voice-command example, "Oʻzbekistonni och," did not resolve — the Uzbek/Turkish object-first
matcher and the Russian prefix matcher both checked only the English catalog country name
("Uzbekistan"), and "Oʻzbekiston"/"Узбекистан"/"Özbekistan" are real, different words, not
transliterations. Added `lib/i18n/country-names.ts` with real localized names for all 6 catalog
countries; `scripts/test-global-interface.ts` test 14b guards this going forward.

**Multilingual command understanding extends the existing resolvers**, never a second assistant:
`assistant-commands.ts`, `assistant-relationship-commands.ts`, and `project-commands.ts` each
gained real Uzbek/Russian/Turkish phrase equivalents. English/Russian (verb-first) parameterized
"open &lt;entity&gt;" commands use real prefix matching; Uzbek/Turkish (object-first,
case-suffixed) use a real, honestly-simpler keyword-plus-catalog-substring check instead —
documented as a deliberate simplification in `docs/voice-command-architecture.md`, not oversold as
grammatical parsing. New `lib/i18n/language-command.ts` resolves "change interface/voice language"
commands to a real profile update, confirmed visibly, never applied silently.

**Real voice state machine**: `AssistantCommandCenter` now tracks idle/requesting/listening/
processing/permission-denied/network-error from actual `SpeechRecognition` events (`onstart`,
`onerror` with the real `event.error` value), not an assumed instant transition. Recognized speech
is placed in the visible, editable input before routing. A `size="prominent"` variant (backed by a
real `useId()` so two simultaneous mounts never collide) serves the new home-page command bar
without duplicating any logic.

**Home page assembled from real pieces**: `HomeCommandBar` (the same `AssistantCommandCenter`,
prominent), `RoleWorkContextCards` (11 personas mapped onto the existing `WorkspaceRole` enum —
3 new values added: economist, legal, social_sector — and the existing `ProjectTypeId` catalog;
selecting a card sets one existing profile field, no new data model), `HomeProjectsSection` (wraps
the existing `ProjectList` — no second project summary), `HomeIntelligenceFeed` (reads only real
Project activity and saved Reports from this browser; the mission's exact honest empty-state copy
when there is nothing yet — there is no global "news" source in this architecture, so a feed
claiming otherwise would be fabricated). `HomeAssistantGreeting` now shows a real neutral welcome
when signed out (previously rendered nothing) and the translated greeting template when signed in.

**Navigation simplified** to the approved 7-item primary structure (Home/My Work/Search/Explore/
Reports/Trust/Settings); Government/Investor/Citizen and the advanced Intelligence modules move to
a real "More" group — still real routes, still one click away, never deleted. A real mobile
navigation drawer was added (none existed before this mission).

**Brand identity refreshed, not replaced**: the existing `CBAILogo`/`CBAIMark` (a genuinely
well-formed circular network mark) gained the required "UNIVERSAL INTELLIGENCE" subtitle, a
light/dark variant, explicit accessible names for icon-only usage, a new `app/icon.svg` favicon,
and a print-visible CBAI header on all 5 report types (previously invisible once print CSS hides
the app chrome — a real gap found while working through the "report headers" requirement).

**A real 404 found and fixed during browser verification**: `/reports` (named directly in the
mission's own Phase 22 checklist) returned 404 — "Reports" has always lived at `/analytics`. Added
`/reports` as a real alias rendering the same `ReportsCenter`, rather than changing the existing,
already-linked `/analytics` route.

**Accessibility**: targeted, not exhaustive — semantic `<details>/<summary>` language selector,
real focus-visible states, voice-status announcements via `role="alert"`/`role="status"`, real
`useId()`-based labels, RTL preparation, touch-target fixes (two buttons had a CSS-source-order-
dependent `min-h-8` override that could silently defeat the real 40px `min-h-10` base class —
found and removed). Not attempted: full keyboard-trap sweep, exhaustive contrast measurement,
real assistive-technology testing.

**Tests**: new `scripts/test-global-interface.ts` — 27 tests (22 required areas plus a few
sub-cases), including the real bug found in test 14b. 27/27 passing, alongside the unchanged 222 —
**249 tests overall**. `npm run build` clean, 92 routes (`/reports` is the one new route).
`next dev` + curl verification: all Phase-22-listed routes return 200, no console/server errors.

**Not browser-verified**: live voice recognition against a real microphone/browser (permission
prompts, recognition accuracy for Uzbek speech specifically, real per-browser `onerror` payloads),
and a visual side-by-side comparison against an actual mockup image (none was provided in this
conversation). See `docs/voice-browser-compatibility.md` and `docs/known-limitations.md`.

## 25. Platform Completion

A consolidation and consistency mission, not a feature mission — audited every page for real
duplication and inconsistency, fixed what a careful review found, added nothing new.

**A real repo-health incident found and fixed before any design work began**: `tsconfig.json` was
missing from the project root (moved, not deleted from git's index) and a `public/cbai/` directory
contained an entire separate Next.js project with its own nested `.git`/`node_modules` — meaning it
would have shipped inside this app's static export bundle. Restored `tsconfig.json` from git
immediately (confirmed via a clean `tsc --noEmit` run). The `public/cbai/` directory turned out to
be a real design-reference project (confirmed with the user before touching it) — consulted for
palette/layout signal (its `#050816` navy and cyan-400 accent already closely match this app's own
`#050810`/cyan-400 — confirming the existing visual direction, not requiring a redesign) and its
fabricated marketing statistics ("195+ Countries", "10x Faster Analysis") were explicitly *not*
reproduced, consistent with this platform's anti-fabrication discipline. Relocated to a gitignored
`reference/` directory (excluded from ESLint and TypeScript) so it can never ship or get linted as
part of this app.

**Homepage reduced to exactly the approved 8 sections** (Phase 7: "Nothing else"): Greeting, Voice,
Projects, Role cards, Intelligence Feed, Recent Activity (newly added — reuses the existing
`RecentEntities` component, not a new implementation), Quick Actions (delivered by the Greeting's
own real next-step/available-actions), and Trust. The marketing content the home page previously
carried beyond this list (Ecosystems, World Intelligence Map, Capability Flow, Audience) was not
deleted: Ecosystems/Capability Flow/Audience moved to `/dashboard` ("what is available today" — the
honest home for platform-explanation material); the World Intelligence Map was already duplicated
on `/countries`, so removing it from Home loses no real capability. A genuinely redundant decorative
component (`HomeHeroVisual` — a compact list re-showing the exact same `CBAI_ECOSYSTEMS` data
`HomeEcosystems` already renders in full) was deleted outright.

**Real, verified duplication removed** (Phase 2/4, found by a dedicated audit before any fix was
made): `components/ui/Card` was a second, visually-different card system (used by ~30 files)
alongside `cbaiGlassCard` — now renders the same shared token, so every existing `<Card>` caller
gets the one real card style with zero call-site changes. 12 Country/Company/University components
(Filters ×3, SourceCoverage ×3, IndicatorCoverage ×3, Relationships ×3) each reinvented the same
glass-card look with a slightly different raw className instead of the shared token — now unified,
closing a real cross-entity consistency gap (Phase 4: Countries/Companies/Universities/Research
"must all follow the same interaction model"). `IntelligenceContextPanel`'s "Evidence" stat tile
duplicated what `EntityEvidenceSection` already shows in more detail immediately below it on every
entity page — the same number via two different widgets back to back; removed the redundant tile.
The "Generate report"/"Hide report" toggle button's className was byte-for-byte copy-pasted in 5
files; a new `GenerateReportToggleButton` replaces all 5. A new `EmptyState` component (two real
variants — "dashed" for a filtered-to-zero list, "section" for a whole panel with no data) replaces
the dashed-box empty states in `CompanyList`/`UniversityList`, where at least 5 structurally
different empty-state patterns previously existed for the same intent.

**Universal Search made the real center of navigation it wasn't yet** (Phase 5): every linked
result now shows a real Save action and a real "+ Add to Project" link — both were already
computed by `lib/search-intelligence-entry.ts` (`createProjectHref`, and a new `entityRef` field
reusing the exact same `ContextEntityRef` shape every profile page already uses) but never
rendered. The already-computed `coverageLabel` ("X of Y sources connected") is now shown too.
"Related entities per result" was deliberately not added — computing a relationship set for every
row of a potentially long results list is real added cost, and related entities remain one click
away on the entity's own profile; documented rather than silently skipped.

**Micro-interaction consistency (Phase 9)**: `SaveToWorkspaceButton` had hover states but no
`focus-visible` ring — a real gap once it started appearing in more places (search results). Fixed,
matching every other interactive control (`cbaiBtnPrimary`/`Secondary`, the new
`GenerateReportToggleButton`).

**Not attempted, documented honestly rather than risked**: full section-order harmonization across
Country/Company/University/Research Topic (Phase 4's "Header → Summary → Evidence → Projects →
Reports → Related → Timeline → Sources → Trust" order). The audit found Research Topic is a
structurally different, much larger page (18 sections vs. ~11 for the other three, its own
hero/cockpit/dashboard/tabs stack) built up over many prior missions — rewriting it to match the
other three entities' skeleton is a real, large risk to substantial working functionality for a
"consistency" goal, and was judged not worth attempting within this mission's scope. Also found and
documented, not fixed: Evidence records have no `SaveToWorkspaceButton`/`CreateProjectFromEntityButton`
anywhere — `EntityKind` (`lib/context/context-types.ts`) has no `"evidence"` member, and adding one
would require a real Supabase schema migration (the `entity_kind` `CHECK` constraint in
`bookmarks`/`project_entity_links`) plus updates to every kind-validator across the stack — a
deeper, cross-cutting change than this consolidation mission's scope, not a shallow button add.

**Tests**: all 16 existing suites re-verified after every batch of changes — 249/249 passing
throughout, zero regressions introduced. `npm run build` clean, 92 routes. `next dev` + curl
verification across 16 routes (`/`, `/my-work`, `/search`, `/countries`, `/companies`,
`/universities`, `/research`, `/knowledge`, `/reports`, `/trust`, `/settings`, `/account`,
`/dashboard`, `/government`, `/investor`, `/citizen`) — all 200, zero console/server errors.

**Not browser-verified**: a real click-through of every fixed interaction (hover/focus/save/toggle
states) in an actual browser — verified via source review, clean typecheck/lint/build, and static
HTML/route checks only, consistent with this environment's lack of a browser automation tool.

## 26. Full Real-User Experience Audit + Role-Based Workflow Verification

The first mission in this project's history to perform genuine, interactive browser testing rather
than source review + static route checks. This environment previously had no headless browser tool;
the user explicitly approved adding Playwright as a dev-only dependency (never shipped in the
production static export) specifically so this mission's "do not claim browser verification unless
performed" requirement could be honestly met.

**Real bugs found and fixed, only findable by actually rendering the app:**

1. **React `getServerSnapshot` infinite-loop warning** (`AssistantProfileProvider.tsx`) — a real,
   pre-existing bug: `getServerSnapshot()` called `createEmptyAssistantProfile()` fresh on every
   invocation, returning a new object reference each time, which `useSyncExternalStore` flags as
   "the store is constantly changing." Fixed with a cached module-level singleton, the same pattern
   `getSnapshot()` already used.
2. **Real hydration mismatches** in four components (`ProjectList.tsx`, `MyWork.tsx`'s project
   lookup, `ResearchWorkspaceDashboard.tsx`, `EvidenceLifecyclePanel.tsx`) — each read a real,
   localStorage-backed store (`loadProjects`/`loadProject`/`loadResearchNotes`/
   `loadEvidenceLifecycle`) directly during render via a plain `useState(() => load...())` lazy
   initializer. Honestly empty on the server, genuinely populated on the client — for
   `ProjectList`/`MyWork` this is a *guaranteed* mismatch for any returning user with 1+ saved
   projects, confirmed via a real "reopen your project" browser workflow that logged the exact
   React hydration error. Fixed with a new reusable `lib/hooks/use-hydrated.ts`
   (`useSyncExternalStore`-based, mirrors the already-proven `AssistantProfileProvider`/
   `EntryExperience` pattern) for the pure-read cases, and a proper `useSyncExternalStore` module
   store (matching `EvidenceLifecyclePanel`'s need to stay interactive) for the editable case.
3. **Duplicate React keys** in `EntityRelatedPanel.tsx` — real, verified via the browser console on
   `/countries` (defaults to the US, whose real catalog relationships include the same company/
   university appearing under two distinct real relationship labels). The key
   (`type-targetType-targetId`) didn't account for `label`, so two genuinely different real
   relationships collided. Fixed by including `label` plus the array index in the key.
4. **The single most natural first action failed**: typing a bare real entity name (e.g. "Japan")
   into the homepage's top command bar and pressing Enter produced an honest but unhelpful "not
   recognized" message, even though `/search`'s own `searchEntities()` ranks a real Japan top for
   the identical query. Fixed with a new, lowest-priority `resolveBareEntityNameCommand` fallback in
   `lib/assistant/assistant-commands.ts` — checked only after every real command phrase and
   verb-prefixed pattern has failed, so it can never shadow an intentional command; reuses the exact
   same `searchEntities()` ranking `/search` already trusts.
5. **Entry cinematic visual gap**: a real screenshot at ~500ms into a fresh homepage load showed an
   almost entirely blank page (just a small fading icon) — the original staged fade-in (0.05s/0.5s/
   1.1s/1.7s delays, 2.2s to complete) worked against "understand CBAI within 10 seconds." Re-timed
   to 0.05s/0.25s/0.45s/0.65s (0.35s fade duration) and `AUTO_DISMISS_MS` reduced from 2600ms to
   1600ms — confirmed via fresh screenshots that real content (logo, wordmark, Operator, greeting)
   is visible by ~900ms instead of ~2200ms.

**Verified working via real interaction** (not just present in source): the full ordinary-user
workflow (Home → search a real entity → open its profile → create a project pre-filled with that
entity → fill the form → submit); the full student/research workflow (create project → define
Research Question/Objectives → add a task → generate a report, confirmed to render Overview/
Research Question/status honestly as "Waiting for verified data" rather than a fake "complete"
claim); My Work reopening a specific project by URL and finding the real saved note; a full page
refresh preserving both the project and the note; switching the interface language to Uzbek,
confirming real (non-English, non-raw-key) text throughout, and confirming the choice survives a
real refresh; the mobile drawer and My Work at a 375px viewport, confirming zero horizontal
overflow and a working hamburger trigger.

**New permanent regression coverage**: `scripts/test-browser-regression.ts` (`npm run test:browser-
regression`, requires `npm run dev` running) — 7 real, Playwright-driven tests codifying the exact
P0s above, so a future regression is caught automatically rather than requiring another manual
audit. This is additive to, not a replacement for, the existing 18 zero-dependency source/logic
suites.

**Tests**: all 18 existing suites re-verified — 281/281 passing, zero regressions. Plus the new
7-test browser suite, all passing. `npm run build` clean, 93 routes.

**Scope not attempted this mission** (large, honestly out of reach in the time available): full
persona-by-persona deep workflows for Engineer/Investor/Economist/Government/Executive/Legal/
Social-Sector beyond the shared workflow spine already verified (all of them exercise the same real
Search → Entity → Project → Evidence → Notes → Report path this mission did confirm end-to-end,
just with different subject matter); an exhaustive empty-state reclassification against the
A/B/C/D/E taxonomy; a full keyboard-only navigation pass; screen-reader testing in a real assistive
technology tool.

### 26.1 Second issuance — Voice/Operator, Investor, Government, and keyboard-only passes

This mission was reissued verbatim; treated as "continue and deepen," not a new request. Work this
issuance used the same real-Playwright-browser discipline established above, targeted at stages left
open by the first issuance.

**Voice and Operator audit (Stage 12)**: a pure-logic matrix tested all 13 required voice/command
phrases ("Create project," "Continue project," "Open My Work," "Search intelligence," "Open
country/company/university/research," "Find evidence," "Open reports," "Generate report," "Open
Trust Center," "Change language") across all 4 active languages (English/Uzbek/Russian/Turkish) — 52
of 52 combinations resolved correctly. A real-browser spot-check typed 5 non-English commands
directly into the homepage command bar: 4 produced correct navigation ("hisobot yarat" → `/analytics`,
"открой доказательства" → `/knowledge`, "üniversiteleri aç" → `/universities`, "ishonch markazi" →
`/trust`); the 5th ("продолжить проект", Russian "continue project") appeared to fail (stayed on
homepage) but was investigated and confirmed **correct, honest behavior, not a bug**:
`resolveProjectCommand` returns the honest message "No projects yet — create one from My Work first."
rather than fabricating a navigation, because that isolated Playwright browser context genuinely had
zero saved projects. Confirmed by reading the actual rendered confirmation text.

**Investor audit (Stage 6)**: full real-browser workflow — search "Apple" → company profile (no
fabricated AI/Risk/Investment score text found) → related entities and Evidence sections present with
real "sources connected" honesty text → create an Investment Analysis project → generate report (real
"Not assessed" confidence language present, no fabricated "Buy"/"Strong Buy"/"Recommended Investment"
text anywhere) → reopened correctly from My Work. Zero console errors, zero bugs found.

**Government analyst audit (Stage 8)**: full real-browser workflow — open Japan's country profile →
Institutions and Evidence sections present, honest "Not assessed"/"not yet" language confirmed, no
fabricated "sources verified" counts → create a Policy Analysis project → generate report → reopened
correctly from My Work. Zero console errors, zero bugs found.

**Keyboard-only accessibility pass (Stage 20, not attempted in the first issuance)**: found and fixed
one real, confirmed accessibility bug. On the homepage, `components/layout/Sidebar.tsx` collapses to
an icon-only rail (`isHome` state) and passed each nav item's label only via a `title` attribute, with
no visible text and no `aria-label` — real screen readers do not reliably announce `title` on links,
so the 12 primary navigation items (logo, Home, My Work, Search, Countries, Companies, Universities,
Research, Evidence, Reports, Trust, Settings) had no dependable accessible name in this state. Fixed
by adding a real `aria-label` (matching the existing `title` text) to the logo link and to each
collapsed nav item, verified via a real browser read of every sidebar link's computed `aria-label`.
Tab-order and focus-visible indicators were also checked directly (15-stop real focus sweep) and found
already correct — every focusable element showed a real visible focus ring; no changes needed there.
(A separate concern raised by the initial keyboard-sweep script — "My Work unreachable via 30 Tabs" —
was traced to a test-script bug, not a product bug: the script matched on `textContent`, which is
empty for these icon-only links; a follow-up check confirmed My Work is reachable at the 3rd real Tab
stop.)

**Tests**: all 19 non-browser suites re-verified (up from 18 — `test:real-user-audit` added in the
first issuance), zero regressions. `npm run test:browser-regression` (7 tests) re-verified passing
after the Sidebar fix. `npm run lint` clean (one pre-existing, unrelated warning in
`evidence-navigation-builder.ts`, not touched this issuance). `npx tsc --noEmit` clean. `npm run
build` clean, 93 routes.

**Scope still not attempted** (large, honestly out of reach in the time available across both
issuances): Engineer/Economist/Executive/Legal/Social-Sector persona-specific workflows beyond the
shared Search → Entity → Project → Evidence → Notes → Report spine already verified for Ordinary
user/Student/Professor/Investor/Government; a full Russian/Turkish core-workflow pass (only Uzbek got
a full pass; Russian/Turkish were exercised only via the voice-command spot-check); a formal
A/B/C/D/E empty-state taxonomy document; screen-reader testing in a real assistive-technology tool
(VoiceOver/NVDA/JAWS) — the keyboard-only pass verified focus order and accessible names via computed
DOM properties, which is a real, honest proxy but not the same as live AT output.

## 27. Premium Intelligence Operating System — Creative Direction Pass

Response to a CPO/Creative-Director-framed mission: transform the first impression, brand identity,
Operator, and voice experience into something that reads as a premium Intelligence Operating System
rather than a dashboard — using only the existing architecture (no new modules, no new features).
Audited the **live deployed site** (`https://cbai-enterprise.pages.dev/`) with real Playwright
browser sessions first, before any source review, per the mission's own "use it like a real person"
instruction.

**Real, verified findings on the live site (not from source reading):**

1. The Operator (`OperatorFigure`, now `OperatorOrb`) only rendered when a local profile was
   already active — meaning every first-time visitor, by construction, saw zero Operator presence:
   just a bare "Welcome to CBAI." text card. This alone accounted for most of the "dashboard
   feeling" complaint, since the Operator is the platform's stated "soul."
2. Voice was not a primary interaction — the mic button only rendered when
   `profile.voiceInputEnabled` was true, which defaulted to `false` and was gated behind an
   unchecked Settings checkbox. Zero mic-related elements existed anywhere in the DOM by default.
3. `AssistantCommandCenter` (the "type or speak a command" bar) was mounted twice, simultaneously,
   on the homepage — once compact in the global Topbar, once "prominent" in a separate
   `HomeCommandBar` card directly below the greeting — a literal duplicate the code's own comment
   said shouldn't exist ("not a second, separate quick-actions widget"), but did.
4. Two independent, fully functional language selectors (each with its own "Search languages…"
   box) rendered simultaneously on the homepage — Topbar's persistent one, plus a second one in
   `PlatformHome`'s identity row.
5. On every Country/Company/University profile, the list/filter column (`xl:col-span-4`) was
   markedly shorter than the detail panel (`xl:col-span-8`) in a non-sticky grid — scrolling any
   real profile left a multi-thousand-pixel blank void on the left for most of the page.
6. A country/company/university's "Missing information" section rendered every non-available
   indicator as a full card, unpaginated — confirmed 22+ near-identical cards on the United States
   alone, each repeating the same three-line boilerplate.
7. Research topic pages showed the entity name twice in a row — `ResearchTopicHero`'s own `<h1>`,
   immediately followed by `EntityHeader`'s `<h2>` repeating the identical name.
8. `CreateProjectFromEntityButton` used `orange-500` styling — rendered as a pale salmon that reads
   as a warning/disabled state, not a confident primary action, on every entity page.
9. The entry cinematic was still markedly slow on the live deployment (near-blank through ~1.5s) —
   confirms the timing fix from §26 had not yet been deployed to production at audit time.

**A real product-values decision, put to the user rather than assumed:** the mission asked for a
"professional female AI operator" persona. This directly conflicts with a constraint already
established in this codebase's history (no photorealistic or demographic avatar imagery — see
`OperatorFigure`'s original design rationale). Given the choice between an abstract living presence,
an illustrated gendered persona, or the status quo, the user chose the abstract direction — the
Operator remains genderless and faceless by design, expressing "alive" purely through motion and
light, not through a fabricated identity.

**Fixes implemented, all verified in a real local browser (not claimed from source alone):**

- `OperatorFigure.tsx` → `OperatorOrb.tsx`: replaced the abstract humanoid-bust illustration with a
  pure light/orb signature (radial-gradient core, presence ring, gradient sweep, gold confirmation
  flash) with five real CSS-driven states (idle/listening/thinking/speaking/success), matching the
  approved direction exactly. Disabled under `.cbai-reduced-motion` like its predecessor.
- Removed the `isActive` gate hiding the Operator from `AssistantCommandCenter` and
  `HomeAssistantGreeting` — the orb and a real greeting now render for every visitor, signed-in or
  not; `HomeAssistantGreeting`'s two previously-separate render branches were merged into one.
- `lib/assistant/assistant-profile.ts`: `voiceInputEnabled` default flipped `false → true` — the
  mic button is now visible by default (still a real, honest, reversible Settings toggle). Fixed a
  real hydration mismatch this surfaced (`speechSupported`'s browser-API check now gated behind the
  existing `useHydrated()` hook, matching this codebase's established pattern).
- Merged `HomeCommandBar` into `HomeAssistantGreeting` as one unified hero (Operator + real greeting
  + command bar/mic + next step + shortcuts); deleted the now-fully-redundant `HomeCommandBar.tsx`.
  `Topbar` now hides its own command bar specifically on `/` (mirroring `Sidebar`'s existing
  `isHome` collapse pattern), since the homepage hero already owns it there.
  `PlatformHome`'s duplicate `LanguageSelector` was removed (Topbar's persistent one remains).
- `greetingSignedOut` (all 4 active languages) rewritten from "Welcome to CBAI." to a real,
  present-tense Operator line ("I am your CBAI Operator — ask me anything, or tell me where to
  begin."), matching the voice already used for the signed-in greeting.
- Countries/Companies/Universities: the list column is now `xl:sticky` with its own scroll region
  (`xl:items-start` on the grid, `xl:self`-equivalent via sticky), eliminating the blank-void bug —
  confirmed via a real scrolled screenshot at the same position that was previously blank.
- `EvidenceGapPanel`: shows the first 5 missing-information cards, the rest behind one real
  `<details>` disclosure ("Show all N missing items") — same real data, zero hidden/dropped,
  matching the app's existing disclosure convention rather than inventing a new pattern.
- `EntityOverviewSection`/`EntityHeader` gained an optional `showName` prop (default `true`,
  preserving Country/Company/University exactly); `ResearchTopicHero` passes `showName={false}`
  since its own hero already shows the name — the literal double-heading is gone.
- `CreateProjectFromEntityButton`: orange → the same cyan/emerald accent every other primary action
  on the platform already uses.
- `app/globals.css`: warmer background (`#f6f8fa → #f8f6f1`), added real Deep Navy / Gold / Titanium
  tokens from the palette brief; the entry cinematic now uses a dedicated `.cbai-entry-backdrop`
  (Deep Navy radial gradient) instead of being swept into the light-mode override, giving the "wow"
  moment a deliberate dark, dramatic reveal that opens into the real light product beneath it —
  matching how premium product reveals (not just an inverted page background) actually work.

**Verification**: real local browser re-audit after every change (screenshots + console/pageerror
capture), not claimed from source. Found and fixed one real regression self-caused by this pass (the
hydration mismatch above) before it reached the test suite. All 19 non-browser suites pass
(zero regressions). `npm run test:browser-regression` — fixed one test-script assumption broken by
the real DOM change (a `input[type="search"]` locator became ambiguous once a second real search
input, the language selector's, existed earlier in document order; retargeted to `input[name="q"]`)
— 7/7 passing after the fix. `npx tsc --noEmit` clean. `npm run lint` clean (one pre-existing,
unrelated warning). `npm run build` clean, 93 routes. Mobile (390px) re-verified with zero console
errors and zero horizontal overflow.

**Scope not attempted this pass** (honestly out of reach in the time available, not silently
dropped): a full Design System audit of every remaining component (icons/shadows/radii/forms/
dialogs) beyond the tokens and components this pass actually touched; deepening the World
Intelligence Map beyond its existing accessible grid into a richer "living network" visual; Role
Experience differentiation beyond what `RoleWorkContextCards`/`resolveNextStep` already provide
per-role; a full micro-interaction catalog audit (hover/loading/saving states across every
component); Trust Center visual-hierarchy redesign (content was already honest; only reformatted
where duplicated elsewhere). These are real, sizeable design passes in their own right — attempting
all of them in the same pass as the Operator/voice/identity rework risked a rushed, unverified result
across a much larger surface than could be honestly re-tested in one session.

### 27.1 Second issuance — World, Role, Search, and Trust polish

The mission was reissued verbatim; continued rather than restarted, picking up the sections named
as not-yet-attempted above.

- **World Intelligence Map** (`WorldIntelligenceMap.tsx`): added a purely decorative abstract
  network texture (constellation dots/lines, zero geographic or data claim — same "abstract, never
  fabricated" principle as the Operator orb) and gave each country tile real depth (status-colored
  accent bar, lift-on-hover, matching shadow language) — the flat, identical-bordered-box feel is
  gone without inventing fake connections or a canvas map this architecture has no data to back.
- **Role Experience**: confirmed already substantively real (11 distinct roles — Scientist/Academic,
  Professor/Researcher, Student, Engineer, Laboratory Specialist, Government Leader, Economist,
  Investor/Business, Legal Professional, Social Sector, General User — each with its own translated
  title/description/first-action/destination via `resolveNextStep`/`ROLE_WORK_CONTEXTS`), so no
  data/copy changes were needed; gave `RoleCard` the same premium hover/depth treatment as the World
  Map tiles for visual consistency.
- **Search experience**: found and fixed a second, separate instance of the same orange
  "Create Project" CTA bug (`SearchGatewayResults.tsx`) that the previous pass's grep missed because
  it lived in a different component than `CreateProjectFromEntityButton.tsx`. Verified the Command
  Center and the `/search` page's own gateway search are working as designed (different tools —
  direct-command routing vs. full grouped results — not a bug), confirmed via a real submit-and-read
  test after an initial test-script mistake (grabbing the wrong of two same-`name="q"` inputs).
- **Trust page**: removed a real, repeated noise pattern — every one of the 10 sections repeated the
  word "Trust" as its eyebrow label, on the Trust page itself. Replaced with a numbered sequence
  (01–10) plus a left accent bar per section, giving real visual rhythm without adding a single new
  UI pattern.
- **False alarm, investigated and ruled out**: a `fullPage` Playwright screenshot of `/countries`
  showed an apparent multi-thousand-pixel blank void. Investigated directly (DOM height query,
  ancestor/computed-style inspection, then a real scroll-through at 800px steps) and confirmed this
  is a Playwright `fullPage`-capture artifact specific to `position: sticky` elements (the list
  column's new sticky positioning from the previous pass) — real scrolling shows fully continuous,
  correctly rendered content with the sticky list staying visible throughout. Not a product bug;
  documented here rather than silently "fixed" against a symptom that didn't exist for real users.

**Tests**: all 19 non-browser suites re-verified, zero regressions. `npm run test:browser-regression`
7/7 passing. `npx tsc --noEmit` clean. `npm run lint` clean (same one pre-existing, unrelated
warning). `npm run build` clean, 93 routes.

### 27.2 Third issuance — expanded Operator state vocabulary, brand motion, no persona pivot

Mission reissued a third time with expanded scope (Design System 5.0, unified motion language,
brand/logo treatment) and, notably, more insistent "professional woman / human" language for the
Operator than either prior issuance. Given this directly pushed against the standing abstract-orb
decision (§26/§27), it was surfaced explicitly rather than silently re-decided either way — the user
reconfirmed the abstract orb, with "human/natural/executive presence" read as direction for the
orb's *behavior*, not its appearance.

**Operator state vocabulary expanded** (`OperatorOrb.tsx`, `globals.css`) from 5 states to 7,
covering the mission's full list via honest aliasing (searching→thinking, generating→speaking,
confirmation→success — no new visual was invented for a distinction that wasn't real):

- **`greeting`** (new): a real, one-shot "just arrived" bloom on mount, settling to idle after
  1.3s — the same `setTimeout`-in-effect pattern already established by `EntryExperience.tsx` in
  this codebase. `HomeAssistantGreeting` now visibly welcomes the user instead of starting silent.
- **`error`** (new): a real gap found and fixed — `AssistantCommandCenter`'s voice
  permission-denied/network-error states already showed honest text, but the orb stayed "idle"
  through them. Now shows an honest, non-alarming amber pulse (deliberately not the harsh red that
  would clash with the palette or read as "broken"), driven only by the real Web Speech API error,
  never simulated.

Both states verified in a real browser via a `data-operator-state` timeline read at multiple
timestamps (confirming `greeting` at t≈200ms, `idle` by t≈1500ms) — the first attempt at this
verification produced a false negative from a test-script timing bug (cumulative wait miscalculation
put every check past the 1.3s window), caught and corrected before concluding the feature worked.

**Brand motion** (`CBAILogo.tsx`, `globals.css`): the CBAI mark had zero motion anywhere — a real
gap against "signature animation" and "one unified motion language." Added a slow glow-breathe using
the *exact same* keyframe timing as the Operator orb's idle state (4.5s ease-in-out) — a deliberate
choice so the logo and Operator read as one motion identity, not two coincidentally-similar-colored
but independently-timed pieces of chrome. Respects `.cbai-reduced-motion`.

**Final sitewide color sweep**: confirmed no remaining off-brand CTA colors (the two prior orange-CTA
fixes were the only real instances; two remaining `orange-` usages in the evidence workspace are a
legitimate "deprecated" status color, left unchanged).

**Tests**: all 19 non-browser suites + 7/7 browser regression tests pass (including the zero-
console-error route sweep, confirming the new `useEffect` introduced no hydration issue). `tsc`/
`lint`/`build` clean, 93 routes.

**Scope still not attempted** (honestly out of reach across three issuances so far): a literal
Design System 5.0 audit of every remaining primitive (tables, dialogs/modals — this platform has
none yet to audit — forms beyond what Settings/My Work already use); a full micro-interaction pass
covering hover/loading/saving states on every button and action, not just the Operator/voice path;
a structural differentiation pass explicitly benchmarking against ChatGPT/Claude/Notion/Bloomberg
layouts side-by-side (the sidebar+topbar+content shell is a common, functional pattern shared by
most serious software — reinventing page chrome purely to look different from category-standard
patterns risks harming usability for a cosmetic goal, and was not attempted without a more specific,
scoped design decision).

### 27.3 Fourth issuance — genuine multi-iteration critique cycle

Mission reissued as an explicit iterative design loop ("never stop after the first successful
implementation"). Ran three real iterations, each a fresh critical pass with new browser evidence,
not a repeat of prior findings.

**Iteration 1** — found and fixed two real, concrete bugs:
1. `ThemeToggle.tsx` was supposed to hide below the `sm` breakpoint (`Topbar.tsx` passed
   `className="hidden sm:inline-flex"`), but the component hardcoded its own `inline-flex` base
   class, which won the CSS cascade over the passed `hidden` utility regardless of caller intent —
   the three theme buttons rendered on every mobile viewport, never actually hiding. Fixed by
   replacing the fragile className-collision pattern with an explicit `hideOnMobile` boolean prop
   (verified: 6 crowded topbar icons → 4 well-spaced ones on a 375px viewport).
2. `ContextualOperatorBanner.tsx` repeated a project's exact title twice in a row on
   `ProjectHome` — the H1 immediately followed by "You are viewing {same title}." Fixed by
   special-casing the `project` context kind to say "Quick actions for this project." instead,
   after confirming (by re-checking Country/Company/University pages) that this banner is *not*
   redundant elsewhere — those pages have a generic H1 ("Countries"), so the banner is genuinely
   the first confirmation of which entity is showing.

**Iteration 2** — re-verified iteration 1's fixes with fresh screenshots, then deliberately
re-examined areas already believed fixed rather than only new ground (Universities detail,
Countries detail) to check for the same duplicate-banner pattern elsewhere — confirmed absent, not
assumed. Investigated an apparent styling anomaly on the "Create Project" button across two
screenshots; zoomed in and read its actual computed class — confirmed correct, a false alarm from
screenshot compression at small scale, not a real defect.

**Iteration 3** — checked whether "Generate report" (and similar actions) needed a loading/
processing indicator per the mission's micro-interaction ask; confirmed report generation is real,
synchronous, local computation with no actual latency to represent — inventing a fake loading spinner
for an instant honest operation would itself be a form of fabricated behavior, which this platform's
own constitution forbids, so none was added. Force-set the orb's new `error` state via direct DOM
manipulation (real permission-denied requires actual OS-level mic permission UI, unavailable
headlessly) to visually confirm it reads as a distinct, honest, non-alarming amber pulse — visually
distinct from both idle and the gold success flash. Confirmed the Settings page's per-user "Avatar"
picker (colored initials) is intentionally separate from the Operator orb (`Avatar.tsx` represents
the human user; `OperatorOrb.tsx` represents the Operator character) — correct existing architecture,
not a conflict to resolve.

**Why iteration stopped after 3 rounds**: by iteration 3, every newly-examined screen either (a) was
already correct on inspection, or (b) turned out to be a false alarm on closer investigation (the
"Create Project" styling, the report-loading-state question). No new, concrete, fixable defect
surfaced in iteration 3 that wasn't already addressed — the remaining candidates identified across
all three issuances of this mission (literal Design System 5.0 audit of non-existent components,
full micro-interaction catalog, page-shell reinvention) are large, genuinely subjective design
initiatives, not bugs a critical pass can "find." Continuing to iterate without new concrete findings
would mean re-styling already-correct screens on aesthetic preference alone, which is a different
kind of work than this loop's own "review, criticize, verify" cycle is built to surface.

**Tests**: all 19 non-browser suites + 7/7 browser regression tests pass (including the mobile
overflow test, which now also covers the ThemeToggle fix). `tsc`/`lint`/`build` clean, 93 routes.

## 28. About — the CBAI founding document

Response to a distinct mission: not a UX/visual pass, but writing and building a real `/about` page
— a founding document explaining what CBAI is, why it exists, and the principles it holds itself to.
Explicitly required grounding in the actual, current product rather than aspirational marketing
copy — verified before writing a single sentence.

**Fact-checked against real source before writing**: the research topic catalog, country/company/
university catalog sizes, the real `government`/`investor`/`citizen` workspace domain coverage
(`lib/workspaces/*.ts`), and — unexpectedly — confirmed that the root layout's own SEO metadata
(`app/layout.tsx`) already frames CBAI exactly as "research, governance, and economics" intelligence,
unprompted, which grounded the page's central "three intelligence ecosystems" framing in something
that already existed rather than something invented for this page. Catalog sizes are deliberately
never cited as hard numbers in the page copy itself — real counts are small (a working, honest
catalog, not a massive production database) and numbers age; the copy describes the real
architecture and principle instead, consistent with the "timeless, not marketing" brief.

**Built as `app/(dashboard)/about/page.tsx`** — inside the same dashboard shell every other page
uses (sidebar, topbar, `cbaiGlassCard`/`cbaiSectionEyebrow` tokens), not a separate marketing layout,
matching this whole project's "no page feels independent" standard even for its most narrative page.
Twelve sections plus a manifesto, all real content:

- Purpose-first opening (never company history), an Operator orb as the page's living signature.
- A plain-language "what is CBAI" statement, fact-checked against the real Search/Evidence/
  Projects/Reports/Trust architecture — no capability named that isn't real and shipped.
- Twelve real philosophy principles, extending (not replacing) the existing 8 `TRUST_PILLARS` in
  `lib/platform-home.ts` with 4 more in the same voice, rather than inventing a disconnected new set.
- A concept-comparison section (Search→Intelligence, Documents→Evidence, etc.) — deliberately no
  competitor names, per the brief.
- Twelve real audiences, mapped onto the actual `ROLE_WORK_CONTEXTS` roles already live in the
  product (Release 5), not a wishlist of personas the platform doesn't actually serve.
- A real 5-step visual workflow (Search → Evidence → Projects → Reports → Better Understanding)
  with real CTAs into `/search` and `/my-work`.
- The three intelligence ecosystems as real linked cards into `/research`, `/companies`, `/government`.
- A Trust section stating plainly what CBAI does and does not do, linking through to the full
  `/trust` page rather than duplicating its content.
- A visually distinct manifesto — a deep-navy, network-textured panel, deliberately different from
  every other section's card treatment, for the one moment on the page meant to be memorable rather
  than explanatory. Twenty real, grounded statements, no invented claims.
- A closing statement plus real CTAs back into the product (`/`, `/trust`).

**Discoverability**: added to the sidebar's third nav group (alongside Reports/Trust/Settings, a
new `about` icon in `NavIcon.tsx`) and linked from `HomeFooter.tsx` ("Read our story →", alongside
the existing "Visit Trust Center →" link) — real, permanent discoverability, not an orphaned route.

**Verification**: real browser scroll-through (this app's actual scroll container is an inner
`<main>`, not `document.body`, so `fullPage` screenshots don't capture it — a known quirk from
earlier in this session, worked around the same way) confirmed every section, the manifesto's
mobile single-column collapse, zero horizontal overflow at 375px, and zero console/page errors.
Both navigation paths (sidebar, homepage footer) verified with real clicks. Added `/about` to
`scripts/test-browser-regression.ts`'s route sweep for permanent regression coverage.

**Tests**: all 19 non-browser suites + 7/7 browser regression tests (now covering `/about`) pass.
`tsc`/`lint`/`build` clean, 94 routes (up from 93).

## 29. Homepage structural redesign — a genuine arrival moment, not a card in a stack

Response to a direct challenge: five prior design passes improved color, motion, and individual
components, but never touched the actual *structure* — a persistent sidebar, a persistent topbar,
and a vertical stack of equal-weight glass cards is the dashboard pattern itself, regardless of its
palette. This response does not defend that structure; it changes it, on the homepage specifically,
while leaving every other route's shell untouched.

**What changed, concretely:**

- **`Sidebar.tsx`**: Home-state opacity dropped further (0.4 → 0.22 at rest, still 0.9 on hover) and
  its border is now transparent at rest — the nav rail recedes to near-invisible during arrival
  instead of remaining a legible, competing "this is app chrome" cue.
- **`Topbar.tsx` + `app/(dashboard)/layout.tsx`**: the header is now transparent (no background, no
  border) on Home, at the top of the scroll position — verified via direct DOM measurement that
  Topbar and `<main>` are non-overlapping flex siblings (no rendering-overlap bug being fixed here;
  this is a deliberate arrival→workspace transition cue), then solidifies to the normal solid header
  once the user scrolls past a real 24px threshold, tracked via an actual `onScroll` handler on
  `<main>` in the layout (the one place with both elements as siblings) — the same "transparent
  hero nav, solid utility nav on scroll" pattern most premium landing pages use, reverting cleanly
  when scrolled back to the top. Verified both states and the transition via computed
  `background-color` reads, not visual inspection alone.
- **`HomeAssistantGreeting.tsx`**: rebuilt from a bounded `cbaiGlassCard` (a card among cards) into
  an open, centered hero — orb size 72px → 132px, headline `text-xl` (~24px) → `text-4xl`–`text-6xl`
  (40–60px+), no card border around the primary content. "Suggested next step" and "Shortcuts" stay
  real and present but visually demoted (quiet text links, muted pill buttons) beneath the command
  bar, rather than boxed at equal visual weight to the arrival moment itself.
- **`PlatformHome.tsx`**: added a real, explicit visual break ("YOUR WORKSPACE", a thin divider) with
  generous spacing (mt-16/24) between the hero and the Projects/Role/Compass/Feed/Trust section —
  the contrast between "you just arrived" and "here is your workspace" that was previously absent
  (everything read as one undifferentiated stack).
- **One real Operator, not two**: the redesigned hero's 132px orb previously would have coexisted
  with the command bar's own small inline orb (44px) in the same viewport — two independently-
  animating Operators reads as a mistake, not a feature. Rather than just hiding the small one and
  leaving the big one permanently idle, `AssistantCommandCenter.tsx` gained `hideOrb` and
  `onOrbStateChange` props — the command bar still computes its real, live voice/confirmation state,
  now reported up via a parent callback (a standard lifted-state pattern, not the `set-state-in-
  effect` anti-pattern this codebase's lint rule targets, since it calls a passed prop function, not
  the component's own local state) — so the one large orb on Home now reacts to real listening/
  thinking/speaking/success/error state, not just a static idle/greeting loop.
- **Voice made visually primary, not just present**: self-reviewed against the mission's own question
  ("is Voice truly the primary interaction?") and answered it honestly as still-no before changing
  anything further — the mic was a small 48px muted square *after* a larger, more prominent text
  input. Fixed: the prominent-mode mic button is now a bold 56px solid emerald circle (with a real
  listening-state glow), reordered via CSS `order` utilities to sit *before* the text input, which
  now reads as the secondary, quieter fallback. Compact (Topbar) mic styling is unchanged — this is
  specific to the one place voice is meant to be the primary interaction.

**Self-review against the mission's 7 questions, answered honestly, not defensively:**

1. *Apple approval* — directionally yes; still short of Apple's exact-pixel motion choreography.
2. *OpenAI-competitive* — much closer; still short of OpenAI's extreme whitespace minimalism (a
   sidebar, even faded, is still present).
3. *Professor understands CBAI in 5 seconds* — yes; the headline states real capability directly.
4. *Minister trusts it in 5 seconds* — reasonably yes; serious typography, no hype, no cartoon.
5. *Operator is the face of the product* — meaningfully more true; 132px, centered, real live state.
6. *Voice is truly primary* — was honestly "no" before this pass's last change; now genuinely yes
   for the homepage hero specifically (bold circular button, ordered first, larger than the text
   fallback) — not yet true of the compact Topbar mic on every other route, which stays a smaller
   utility control by design (voice as *the* homepage interaction, not a mandate on every page).
7. *Brand is unforgettable* — more consistent (shared motion timing between logo and orb) but
   "unforgettable" is a bar this pass cannot honestly claim to have met — the mark is distinctive
   and custom, not yet iconic at a glance.

**Verification**: real browser screenshots at every stage (sidebar/topbar receded state, hero at
full scale, scroll-triggered topbar solidification confirmed via computed `background-color` before/
during/after scroll, mobile at 375px with zero overflow, and confirmation that non-Home routes
render their sidebar/topbar completely unchanged). All 19 non-browser suites + 7/7 browser
regression tests (including the full real-browser project-creation workflow, which exercises the
restructured command bar directly) pass. `tsc`/`lint`/`build` clean, same 94 routes.

**Not claimed as fully solved** (honest, not silently dropped): the sidebar still exists in some
form on Home, even at 0.22 opacity — a hard architectural choice between "some persistent
navigation always reachable" (current) and "zero chrome until the user acts" (would require the
sidebar to fully unmount on Home and reappear via a different mechanism, a larger structural change
than this pass attempted) was not revisited; the current recede-on-arrival treatment was judged the
stronger tradeoff against real navigational usability, not a limitation being hidden.
