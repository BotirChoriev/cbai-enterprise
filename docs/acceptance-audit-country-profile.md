# Acceptance Audit 3.0 — Country Profile

**Auditor role:** Independent Product Acceptance Auditor, first-time visitor  
**Scope:** Country profile experience only — flow Search → Open Country → Overview → Available Evidence → Missing Information → Decision Package → Reports  
**Method:** Product review of current UI on `/countries?country={id}`. No code changes.

---

## Page structure (what the visitor sees)

### Shell

- Full **sidebar** (CBAI Enterprise / Enterprise Alpha, 15+ nav items)
- Full **topbar** (shell search for agents/workflows, demo profile, notifications)
- **Split layout:** left column = country filters + list cards; right column = profile sections

### Profile sections (top to bottom, primary flow)

1. Optional: “From search: "{query}"”
2. **Overview** — name, code · capital, Type, Country (shows **region**), Available information, Government
3. **Available evidence** — two stat tiles (count + source status), one sentence
4. **Missing information** — gap cards (title, status, why missing, expected source, next step)
5. **Decision package** — Available / Missing / Official sources / Limitations / Review required (+ “Reports →” in header)
6. **Reports** — report type list + “Open reports →” (links to `/analytics`)
7. **Compare** — side-by-side comparison tool (after Reports)

### Below profile (secondary)

8. **Relationships** — Knowledge Graph connections, linked companies/universities

---

## Audit answers

### 1. Within 15 seconds, do I understand what country I opened?

**PASS**

The profile headline shows the country name prominently (e.g. **Japan**), with ISO code and capital in the subtitle (e.g. **JP · Tokyo**). A first-time visitor can identify the country quickly from the Overview block.

**Caveat:** The Overview field labeled **“Country”** displays the **region** (e.g. “Asia”), not the country name — a labeling error that can momentarily confuse careful readers.

### 2. Can I immediately identify what information exists and what information is missing?

**FAIL**

| Dimension | What the page shows | Assessment |
|-----------|---------------------|------------|
| **Exists** | A single number (“Available now”) and source fraction (e.g. 3 / 12 sources connected) | **Counts only** — no list of what is actually available |
| **Missing** | Named gap cards with topic titles | **Clearer** — user sees specific missing topics |

The page is **asymmetric**: missing information is itemized; available information is not. A visitor cannot immediately answer “what do I have?” without inferring from opaque counts.

### 3. Does the page explain WHY information is missing?

**FAIL**

Gap cards include a **“Why missing”** field, which satisfies the structure of the question. However, reasons are **system-oriented**, not user-oriented:

- “Evidence source not connected”
- “Connector planned”
- “Verification pending”
- “Indicator not mapped”

**“Next step”** lines on gap cards add more internal language (e.g. “Await {name} connector implementation and source verification”, “Connect official evidence source through validated connector pipeline”). A visitor learns *that* something is not connected, not *why it matters to them* or what official body would supply it in plain terms.

### 4. Does the Decision Package help me understand the current evidence?

**FAIL**

The Decision Package **mirrors** Available evidence and Missing information sections with overlapping content:

- **Available information** — bullet list of item titles + “official source marked available”
- **Missing information** — same item titles + “not connected” / “planned, not yet connected”
- **Official sources**, **Limitations**, **Review required**

After UI sanitization, lines are cleaner but still **item-catalog lists**, not a coherent summary a decision-maker could read once and understand posture. It does not add clear synthesis beyond what gap cards and counts already show. Truncation (“+ N more items”) hides detail without offering a readable summary.

### 5. Is there any repeated information?

| Repetition | Where it appears |
|------------|------------------|
| **Available vs missing split** | Available evidence section, Missing information section, Decision package (Available information + Missing information) |
| **Same topic titles** | Gap card `indicatorTitle` and Decision package bullet lines |
| **Source / connection status** | Available evidence “Source status” tile, gap “Expected source”, Decision package “Official sources” |
| **Reports as next step** | Decision package header “Reports →”, Reports section “Open reports →”, page header mentions reports |
| **Evidence / information vocabulary** | “Available evidence”, “Available information”, “Missing information” used interchangeably across sections |
| **Journey described in page header** | Countries page intro lists same section sequence user already scrolls through |
| **Country identity** | Selected card in left list + Overview headline (same country shown twice) |
| **Review before decide theme** | Limitations / Review required in decision package; gap next steps mention human review (where shown) |

### 6. Are there confusing words?

| Term / phrase | Where |
|---------------|--------|
| **Available — CBAI Local Registry** | Overview → Available information |
| **Country** (label showing region) | Overview metadata |
| **Available evidence** vs **Available information** | Section titles / decision package |
| **Decision package** | Section heading |
| **Review evidence →** | Overview next-step button |
| **Decision package →** | Missing information next-step button |
| **Connected item(s)** | Available evidence body copy |
| **Source status** / **sources connected** | Available evidence tile |
| **Indicator** (implicit in gap titles) | Gap card titles (framework item names) |
| **Connector planned** / **Evidence source not connected** | Gap why-missing reasons |
| **Verification pending** | Gap status and reasons |
| **Expected source** | Gap cards (organization names help, label is abstract) |
| **Official sources** | Decision package section |
| **Review required** | Decision package section |
| **Registry facts only** | Reports list availability labels |
| **Country Intelligence Report** | Reports (Intelligence jargon) |
| **Knowledge Graph** / **verified edge(s)** | Relationships section |
| **Local catalog** | Relationships, linked entities |
| **Compare** | Section after Reports |
| **Enterprise Alpha** | Sidebar (on `/countries`) |
| **{n} indicator connected** | Left-list country cards |

### 7. Are there sections that feel secondary?

1. **Compare** — placed **after** Reports; breaks the stated user flow; feels like an advanced tool
2. **Relationships** — below the main profile column; Knowledge Graph framing; not part of Search → Reports journey
3. **Left country list + filters** — necessary for navigation but competes with profile on desktop (4/12 width)
4. **“From search: …”** — contextual but small; fine as secondary
5. **Decision package truncation footers** (“+ N more items”) — incomplete primary content feels secondary/incomplete
6. **Page-level Countries header** — repeats journey copy while user is already inside a profile

### 8. Is Reports the obvious next step?

**FAIL**

Reports **is present** and linked twice (Decision package → Reports, Reports → Open reports →). However:

- Section next-step buttons chain **Overview → Evidence → Missing → Decision package**, not directly to Reports
- **Compare** appears **after** Reports, suggesting further exploration beyond the stated end state
- “Open reports →” navigates to **`/analytics`**, not an in-context report for **this** country — break in mental model
- Multiple report types listed without highlighting which applies to **this** country profile

Reports is **available** but not the **single obvious culmination** of the scroll journey.

### 9. Would a policymaker trust this page?

**FAIL**

**Explanation:** The page reads as an **internal evidence-catalog viewer**, not an official country briefing. Overview cites “CBAI Local Registry” rather than named government or international sources. Available evidence is **numeric abstraction** without cited documents. Missing reasons describe **platform connection state**, not policy-relevant gaps (e.g. which national statistic is unavailable and from which ministry). Decision package lists framework item titles without institutional attribution. Relationships expose “Knowledge Graph” and “local catalog” language. Enterprise demo chrome (Alpha, placeholder user) on the route undermines institutional credibility. A policymaker would want source provenance, plain-language gap explanations, and a single authoritative summary — not connector status lists.

### 10. Would a non-technical person understand the page?

**FAIL**

**Explanation:** Section headings are mostly plain, and the country name is clear. Everything after Overview requires **platform vocabulary** (evidence, sources connected, decision package, indicators in gap titles, connector/verification states). Counts like “7 connected items” mean nothing without labels. Decision package bullets are topic names, not outcomes. Reports descriptions use “indicator methodology” and “registry facts.” A non-technical visitor could identify **Japan** and see **something is missing**, but could not confidently explain **what they have, what they lack, or what to do next** without training.

---

## Summary scorecard

| # | Question | Result |
|---|----------|--------|
| 1 | Understand country opened (15s) | **PASS** |
| 2 | Identify exists vs missing | **FAIL** |
| 3 | Explain WHY missing | **FAIL** |
| 4 | Decision package clarifies evidence | **FAIL** |
| 5 | Repeated information | **8 patterns listed** |
| 6 | Confusing words | **20+ listed** |
| 7 | Secondary sections | **6 listed** |
| 8 | Reports obvious next step | **FAIL** |
| 9 | Policymaker trust | **FAIL** |
| 10 | Non-technical understanding | **FAIL** |

**Overall country profile acceptance:** **FAIL** (2/9 pass on scored UX questions; Q5–Q7 are inventory)

---

## Problem tiers

### Critical

1. **Available information shown as opaque counts** — user cannot see what exists, only how many
2. **Decision package duplicates gap/evidence sections** without synthesis — adds scroll, not clarity
3. **“Why missing” reasons are connection-state jargon** — not policy- or citizen-readable
4. **Overview mislabels region as “Country”** — factual error in primary identity block
5. **Reports culminates at `/analytics`**, not a country-specific deliverable — breaks flow promise

### Medium

1. **Compare after Reports** — disrupts intended journey end state
2. **Relationships / Knowledge Graph** below profile — developer framing on user path
3. **“Available — CBAI Local Registry”** — product-internal, not source attribution
4. **Left list shows “indicator connected”** — jargon adjacent to profile
5. **Section next-step chain** does not align with documented flow ending at Reports

### Minor

1. Page header repeats section list user is already scrolling
2. Decision package “+ N more items” without summary expansion
3. Duplicate Reports CTAs (decision header + reports section)
4. “From search” line useful but easy to miss

---

## First recovery priority

**Make “what exists” as visible as “what is missing.”**

1. Fix Overview **Country → Region** labeling (or remove duplicate field).
2. Replace available-evidence **count-only** display with a **short list of connected topics or sources** (from existing coverage data — no new architecture).
3. Rewrite gap **“Why missing”** and **next step** strings at display layer into plain language (official source name + “not published here yet” style).
4. Collapse Decision package into a **3–5 line human summary** or remove duplication with Missing/Available sections.

---

## Estimated UX improvement

| Metric | Current (est.) | After priority recovery (est.) |
|--------|----------------|------------------------------|
| Exists vs missing clarity | ~30% | ~75% |
| Why missing comprehension | ~25% | ~60% |
| Decision package usefulness | ~20% | ~55% |
| Policymaker trust | Low | Medium |
| Non-technical comprehension | ~35% | ~65% |
| Reports as clear end step | ~45% | ~70% |

**Net country profile lift:** ~40–50% if available information is itemized, labeling is fixed, and decision package stops duplicating gap lists.
