# Acceptance Audit 2.0 — Search Experience Audit

**Auditor role:** Independent Product Acceptance Auditor, first-time visitor  
**Scope:** Search experience only — `/search` and the flow Home → Search → Results → Open Profile  
**Method:** Product review of current UI copy and behavior. No code changes.

---

## User flow reviewed

1. **Home** — hero search or example links → `/search?q=…`
2. **Search page** — search field, optional intro line, results or examples
3. **Results** — result cards with actions, or auto-redirect for single match
4. **Profile** — `/countries|companies|universities?{entity}=…&q=…`

---

## What the visitor sees on `/search`

### Shell (not home)

- **Sidebar:** Full width, “CBAI Enterprise / Enterprise Alpha”, 15+ nav links, footer “Start with Search” mentioning decision package
- **Topbar:** Second search field (“Search agents, workflows, documents…”), notifications, “Jane Doe / Admin”
- **Main column:** Narrow centered column (`max-w-2xl`) with search form + results

### Empty search (`/search` no query)

- Line: “Find a country, company, or university.”
- Large search input, placeholder “Japan, Apple, Harvard University”
- Example chips: Japan (Country), Apple (Company), Harvard University (University)

### With query — single entity match (Japan, Apple, Harvard University)

- Brief message: “Opening {name}…”
- **Auto-redirect** to entity list page with entity selected (no result card shown)

### With query — multiple entity matches

- Count line: “{n} results · pick one to open”
- Cards: name, type, country/region, short description, next step, buttons (Open profile →, Compare →, Open reports →)

### No results

- “No matching country, company, or university was found.”
- Same three example chips

---

## Audit answers

### 1. Can I immediately understand what I am searching for?

**PASS**

Placeholder, empty-state line, and aria labels all state: country, company, or university. Scope is clear within seconds.

### 2. Is the search box the dominant element?

**FAIL**

The hero search field is large and centered in the main column, but the **topbar search reappears** on `/search` with a different placeholder (agents, workflows, documents). Full sidebar and demo chrome compete for attention. Two search boxes split focus; the shell feels heavier than the search task.

### 3. Are example searches useful?

**PASS**

Japan, Apple, and Harvard University are recognizable, varied by entity type, and one-click. They match the stated scope and the input placeholder.

### 4. When I search Japan / Apple / Harvard University, do I immediately recognize the correct result?

**PASS** (with caveat)

For these queries the catalog returns a **single entity match**, triggering auto-redirect to the correct profile. The user reaches the right destination without choosing wrong card.

**Caveat:** The user **never sees a result card** — only “Opening {name}…” for a moment. There is no confirmation step to verify the match before navigation. Trust depends on the redirect being correct.

### 5. Do result cards answer: What is this? / Why should I open it? / What happens next?

**FAIL**

| Question | Card content | Assessment |
|----------|--------------|------------|
| What is this? | Name, type label, country/region | **Adequate** |
| Why open it? | Generic one-liner per type (“Official country profile with evidence and reports.”) | **Weak** — same template for all; no differentiator |
| What happens next? | “Review evidence, gaps, and reports.” | **Partial** — direction given but abstract |

`evidenceStatus` (“Available now”) is computed but **not shown** on cards. Compare and Reports buttons appear before the user understands the primary profile content.

### 6. Can I reach the correct profile with one obvious action?

**PASS**

“Open profile →” is the clear primary button (white, first in row). Single-match queries skip the card but still land on profile in one step.

### 7. If there are multiple results, are they easy to compare?

**FAIL**

Cards use **identical boilerplate** for `shortDescription` and `nextStep` within each entity type (and nearly identical across types). No snippet, industry, founding year, or match reason surfaced. User must compare names and type labels only — difficult when names are similar or unfamiliar.

### 8. If there are no results, is the guidance useful?

**PASS**

Clear negative message plus the same three examples gives a concrete next action. No dead end.

### 9. Is there any repeated information?

| Repetition | Where |
|------------|--------|
| **Japan / Apple / Harvard University** | Home examples, search placeholder, search example chips, no-results examples |
| **“Find / search country, company, university”** | Home hero, search empty line, search label/aria, sidebar Search item |
| **“evidence and reports”** | Result `shortDescription` and `nextStep` on every card |
| **“Review evidence, gaps, and reports”** | Identical `nextStep` for country, company, and university |
| **Search entry points** | Sidebar Search, sidebar footer CTA, topbar search, hero search, Home hero search |
| **Example entity types** | Country / Company / University labels on every example chip |

### 10. Is there any developer wording?

| Term | Where visible on search flow |
|------|------------------------------|
| **Enterprise Alpha** | Sidebar branding on `/search` |
| **CBAI Enterprise** | Sidebar branding |
| **agents, workflows, documents** | Topbar search placeholder |
| **Jane Doe / Admin** | Topbar profile |
| **decision package** | Sidebar footer CTA |
| **evidence** | Result descriptions and next step |
| **gaps** | Result next step (“Review evidence, gaps, and reports”) |
| **profile** | “Open profile →” ( mild; acceptable but product-internal ) |
| **Compare** | Button without “compare what?” |
| **reports** | Button and copy (outcome undefined) |
| **Opening {name}…** | System redirect message (transient) |
| **⌘K** | Topbar search hint |
| **Intelligence / Workspaces / Governance** | Sidebar section titles |
| **Evidence Explorer / Reasoning** | Sidebar nav labels |

### 11. Does the page feel like Google, Bloomberg, Notion, or an internal admin tool?

**Internal admin tool** (closest match)

- **Not Google:** Two search boxes, enterprise sidebar, no single-purpose focus.
- **Not Bloomberg:** Lacks authoritative data density and source attribution on results; demo user and Alpha label undermine terminal-grade trust.
- **Not Notion:** Too much chrome and sectioned enterprise nav for a clean search-first surface.
- **Admin tool:** Dashboard layout, placeholder user, notifications, “Enterprise Alpha,” and a secondary topbar search for agents/workflows signal internal prototype rather than public product.

### 12. Would a completely non-technical person understand the page?

**FAIL**

**Explanation:** They can understand *what to type* (a name) and *that they should press Search*. They cannot confidently predict what “evidence,” “gaps,” or “reports” mean, why “Compare” exists before opening a profile, or why two search bars appear. Auto-redirect without a confirmation card may feel abrupt or opaque. Sidebar labels (Governance, Reasoning, Evidence Explorer) add noise without explanation.

---

## Summary scorecard

| # | Question | Result |
|---|----------|--------|
| 1 | Understand search scope | **PASS** |
| 2 | Search box dominant | **FAIL** |
| 3 | Useful examples | **PASS** |
| 4 | Recognize Japan / Apple / Harvard | **PASS** (no confirmation UI) |
| 5 | Cards answer what / why / next | **FAIL** |
| 6 | One obvious action to profile | **PASS** |
| 7 | Easy to compare multiple results | **FAIL** |
| 8 | Useful no-results guidance | **PASS** |
| 9 | Repeated information | **6 patterns** |
| 10 | Developer wording | **14+ terms** |
| 11 | Product feel | **Internal admin tool** |
| 12 | Non-technical person | **FAIL** |

**Overall search acceptance:** **FAIL** (5 pass, 4 fail on scored UX questions)

---

## Problem tiers

### Critical

1. **Dual search on `/search`** — topbar shell search returns and conflicts with gateway search (regression from homepage fix scope).
2. **Result cards are interchangeable** — generic copy prevents comparison and weak “why open.”
3. **Single-match auto-redirect with no confirmation** — correct for happy path, risky for trust if match is unexpected.
4. **Enterprise demo chrome on search** — Alpha label, fake admin, notifications on primary discovery route after Home.

### Medium

1. **“Review evidence, gaps, and reports”** on every card — jargon before user sees profile.
2. **Compare → and Open reports →** on results compete with primary action before user understands entity.
3. **Examples duplicated** across Home, placeholder, and no-results state.
4. **`evidenceStatus` hidden** — status computed but not shown to help user choose.

### Minor

1. No page title or H1 on search — only helper line when empty.
2. “{n} results · pick one to open” is functional but terse.
3. Result count line and example chips repeat empty-state guidance after search.

---

## First recovery priority

**One search on `/search` and one differentiated result line per card.**

1. Hide or harmonize topbar search on `/search` (same rule as Home).
2. Show one distinguishing fact per result (country, industry, or city — already in catalog).
3. Replace identical `nextStep` with plain language: “Open to see what information is available.”
4. For single-match queries, show a **confirmation card for ~1 second** or a visible “Matched: Japan — Open profile →” before auto-redirect (product choice).

---

## Estimated UX improvement

| Metric | Current (est.) | After priority fixes (est.) |
|--------|----------------|----------------------------|
| Search as dominant action | ~55% | ~90% |
| Multi-result compare clarity | ~25% | ~65% |
| Non-technical comprehension | ~50% | ~75% |
| Trust on search route | Low–Medium | Medium–High |

**Net lift on search conversion:** ~30–40% improvement in focus, result clarity, and path-to-profile confidence.
