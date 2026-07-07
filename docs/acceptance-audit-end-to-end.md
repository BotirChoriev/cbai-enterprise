# Acceptance Audit 4.0 — End-to-End Product Journey

**Auditor role:** Independent Product Acceptance Auditor, first-time visitor  
**Scope:** Complete journey — Homepage → Search → Open Country → Overview → Available Information → Missing Information → Review Summary → Open Reports Center  
**Method:** Product review of current UI after Sprints 008–011. No code changes.

---

## Journey map (Japan happy path)

| Step | Screen | User question | What they see |
|------|--------|---------------|---------------|
| 1 | `/` | What is CBAI? What do I do? | Declarative headline, search, examples, “What you get”, Start exploring |
| 2 | `/search?q=Japan` | Did I find it? | Matched confirmation card, **Open profile →** |
| 3 | `/countries?country=japan&q=Japan` | What country? What’s available/missing? | Split layout: country list + profile sections |
| 4 | Overview | Who is this? | Name, code, capital, country, region, official information status |
| 5 | Available information | What do I have? | Checklist of connected topics + source count |
| 6 | Missing information | What’s missing? Why? | Gap cards with plain why/next step |
| 7 | Review summary | What’s the bottom line? | Four-bullet count summary |
| 8 | Reports | What’s next? | Honest Reports Center handoff → `/analytics` |

---

## Audit answers

### 1. Does every page answer the user's next question?

**FAIL**

| Screen | Answers next question? | Gap |
|--------|------------------------|-----|
| Homepage | **Yes** — search to start | — |
| Search | **Yes** — open profile | — |
| Countries (profile) | **Mostly** — sections chain via next-step buttons | Page chrome and left list don’t answer “am I done?” |
| Reports Center (`/analytics`) | **Partial** — lists report types | Does not answer “what about Japan?” — country context is lost |

The journey breaks at the handoff: profile prepares user for Reports Center, but Reports Center is generic and does not continue the country thread.

### 2. At any point, does the user stop and wonder: “What should I do next?”

**FAIL**

Friction points:

- **Homepage “Start exploring”** — five equal links (Search, Countries, Companies, Universities, Reports) compete with the primary search path.
- **Countries page** — full enterprise sidebar + topbar reappear; user leaves the focused home/search shell without warning.
- **Split layout** — left country list vs right profile: unclear whether to keep browsing or scroll the profile.
- **After Reports section** — **Compare** still appears below, extending the journey past the stated end state.
- **Reports Center** — no breadcrumb or “return to Japan”; user must infer next action.

Section-level next-step buttons (Overview → Available information → Missing information → Review summary) reduce confusion **within** the profile column.

### 3. Does every screen naturally lead to the next screen?

**FAIL**

Strong links: Home → Search (examples), Search → Profile (Open profile), Profile sections (hash next-step buttons), Review summary → Reports (Reports →).

Weak links:

- Home → Reports / Countries (bypass search).
- Profile → Reports Center (`/analytics`) — **context switch**, no country ID in URL.
- Profile → Compare — **after** Reports, not a natural “next” in the documented flow.
- Countries page header still references “decision package” while UI says “Review summary” — terminology drift breaks narrative continuity.

### 4. Are there duplicate explanations across the journey?

| Duplication | Where |
|-------------|--------|
| **Journey preview** | Home “What you get” (3 bullets) vs profile sections user later scrolls |
| **Example queries** | Home examples, search placeholder, search example chips, no-results examples |
| **Official information status** | Overview “Official information available.” vs Available information section list |
| **Topic counts** | Available information footer (“N topics listed above”) vs Review summary (“N topics with official information”) |
| **Missing topic counts** | Missing information gap cards vs Review summary (“N topics still need…”) |
| **Source connection** | Available information footer vs Review summary (“X of Y official sources connected”) |
| **Reports as next step** | Home “What you get” bullet 3, Review summary **Reports →**, Reports section **Open Reports Center →** |
| **Country identity** | Overview H2 name + Overview “Country” field (same name) |
| **Search vs profile promise** | Search “Open to see available official information.” vs same content on profile |
| **Page header** | Countries intro lists section sequence already visible in profile |

### 5. Is any information shown too early?

| Item | Where | Why too early |
|------|--------|----------------|
| **Full journey outcome** | Home “What you get” | Describes profile + reports before user has picked an entity |
| **Reports link** | Home “Start exploring” | Skips search and profile |
| **Countries / Companies / Universities browse** | Home Start exploring | Alternate paths before first search |
| **Compare / Open reports** | Search results (multi-match only) | Deep links before profile |
| **Human review required** | Review summary | Stated before user has absorbed gap detail (minor) |

### 6. Is any important information shown too late?

| Item | Where | Why too late |
|------|--------|--------------|
| **Reports Center honesty** | Bottom of profile scroll | User may expect an in-page country report until this section |
| **Enterprise demo chrome** | Countries page shell (sidebar Alpha, demo user, topbar search) | Trust signals degrade after clean home/search |
| **Compare tool** | After Reports | If needed, it’s only discoverable after the stated journey end |
| **Relationships / Knowledge Graph** | Below profile | Linked entities may matter for context but appear after Reports |
| **Which report applies to this country** | Reports Center (never) | Handoff loses entity context entirely |

### 7. Does Reports feel like the natural conclusion?

**FAIL**

Positive: Reports section is honest (“does not open a country report directly”) and **Open Reports Center →** is a clear CTA.

Undermining factors:

- **Compare** section still follows Reports on the same page.
- **Relationships** section follows the profile column.
- Reports Center is **generic** — not a country-specific conclusion.
- Home already offered Reports as a peer destination.
- Review summary repeats counts immediately before Reports — feels like a second “almost done” beat.

Reports is a **logical** handoff but not a **satisfying narrative** conclusion for the country journey.

### 8. Would a first-time user complete the journey without help?

**FAIL**

**Explanation:** A motivated user can complete Home → Search “Japan” → Open profile → scroll sections → Open Reports Center. Section next-step buttons and the search confirmation card help. However, the layout shift at Countries (split pane + enterprise chrome), the length of scroll (6+ sections + Compare + Relationships), duplicate summaries, and the context drop at `/analytics` will cause many first-time users to pause or exit before Reports. Users who click **Reports** from Home skip the intended path entirely.

### 9. Would a policymaker trust the entire journey?

**FAIL**

**Explanation:** Home and Search are materially cleaner after recent recovery sprints. Trust erodes on the Countries page: Enterprise Alpha branding, placeholder admin account, non-functional topbar search (agents/workflows), Knowledge Graph / local catalog language in Relationships, and framework-style topic titles on gap cards. Review summary is plain but still count-based without cited official documents or institutional attribution. Reports Center lists “Registry facts only” and methodology labels — reads as an internal platform, not an authoritative briefing product.

### 10. Would an investor understand the journey?

**PASS** (narrow)

**Explanation:** An investor can follow the logic: find a country → see what data exists vs gaps → read a short summary → go to Reports Center for document types. Topic names (economy, governance, etc.) align with due diligence mental models. Search confirmation and distinguishing facts (region) support quick identification. Gaps remain: no investment-specific deliverable at journey end, Compare is buried after Reports, and Reports Center does not surface Investor Brief in context of the country being viewed.

---

## Summary scorecard

| # | Question | Result |
|---|----------|--------|
| 1 | Every page answers next question | **FAIL** |
| 2 | User never wonders what to do next | **FAIL** |
| 3 | Screens lead naturally to next | **FAIL** |
| 4 | Duplicate explanations | **10 patterns** |
| 5 | Information too early | **5 items** |
| 6 | Information too late | **5 items** |
| 7 | Reports as natural conclusion | **FAIL** |
| 8 | First-time user completes without help | **FAIL** |
| 9 | Policymaker trust | **FAIL** |
| 10 | Investor understands | **PASS** (narrow) |

**Overall end-to-end acceptance:** **FAIL**

---

## Problem tiers

### Critical

1. **Context loss at Reports Center** — country journey ends at generic `/analytics` with no entity continuity.
2. **Compare and Relationships after Reports** — documented journey does not end cleanly.
3. **Shell regression on Countries** — demo chrome and enterprise nav return after clean home/search.
4. **Review summary duplicates** Available + Missing sections — same counts, different words.
5. **Home Start exploring** — parallel paths bypass the core Search → Country flow.

### Medium

1. Countries page header still says “decision package” (UI says Review summary).
2. Overview next-step label **Available evidence →** vs section title **Available information** (terminology mismatch).
3. Overview duplicates country name in H2 and Country field.
4. Multi-result search still exposes Compare / Open reports before profile.
5. Reports Center does not answer “what about the country I just viewed?”

### Minor

1. Example queries repeated four times across journey.
2. “From search: …” line easy to miss on profile.
3. Left country list redundant when arriving from search with a match.
4. Search result `shortDescription` still uses “evidence” wording (not shown on matched card).

---

## First recovery priority

**Close the journey at Reports with country context preserved.**

1. Remove or relocate **Compare** and **Relationships** below the Reports section (or collapse after Reports CTA).
2. Pass country context into Reports Center (query param or visible “Continuing review for Japan”) — display-only, no new architecture.
3. Recede enterprise demo chrome on Countries when arriving from search (same treatment as home/search).
4. Collapse Review summary into one line or merge with Reports intro to eliminate count duplication.

---

## Estimated product improvement

| Metric | Current (est.) | After priority recovery (est.) |
|--------|----------------|--------------------------------|
| Journey completion without help | ~45% | ~75% |
| “What do I do next?” clarity | ~55% | ~85% |
| Reports as satisfying conclusion | ~40% | ~70% |
| End-to-end trust (policymaker) | Low | Medium |
| Duplicate explanation burden | High | Low |

**Net product lift:** ~35–45% improvement in journey coherence and completion if Reports becomes a true continuation (with context) and post-Reports noise is removed.
