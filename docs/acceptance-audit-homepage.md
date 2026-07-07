# Acceptance Audit 1.0 — Homepage UX Audit

**Auditor role:** Product QA Engineer, first-time visitor  
**Scope:** Homepage only (`/` — hero content plus surrounding shell visible on first load)  
**Method:** Top-to-bottom product review. No code changes.

---

## What the visitor sees (top to bottom)

### Shell (always visible)

- **Sidebar:** “CBAI Enterprise” / “Enterprise Alpha”; nav sections Start, Intelligence, Workspaces, Governance (~15 links); footer card “Start with Search”
- **Topbar:** Second search field (“Search agents, workflows, documents…”), ⌘K hint, notifications bell, “Jane Doe / Admin” profile
- **Main column:** Narrow centered hero (`max-w-2xl`) inside wider dashboard padding

### Hero content

1. **Header:** CBAI → “What is CBAI?” → “Search a country, company, or university.” → “See official evidence. Know what is available. Review before you decide.”
2. **Primary search:** “Where do I start? Search below.” + large search input + Search button
3. **Try an example:** Japan / Apple / Harvard University
4. **What happens after search:** 5 numbered steps
5. **Available today:** 5 checkmarked capabilities
6. **Start exploring:** Search, Countries, Companies, Universities, Reports

---

## Audit answers

### 1. Within 5 seconds — Do I understand what CBAI is?

**FAIL**

The headline is a question (“What is CBAI?”), not an answer. A visitor can infer *partially* that CBAI helps you search countries, companies, or universities and review evidence — but they do not learn what CBAI stands for, what category of product it is (research tool, due diligence platform, public data portal), or who it is for. Sidebar branding (“Enterprise Alpha”) reinforces “internal beta” rather than product identity.

### 2. Within 10 seconds — Do I know what I should do?

**PASS**

“Search a country, company, or university,” “Where do I start? Search below,” the prominent search field, placeholder examples, and “Try an example” cards all point to the same action. A motivated visitor knows to search or tap an example within 10 seconds.

### 3. Is Search obviously the main action?

**FAIL**

The hero search is visually strong, but the page presents **two search boxes** (topbar vs hero) with different placeholders and implied purposes. The sidebar offers 15+ alternate destinations at equal permanence. “Start exploring” presents five peer buttons that compete with search. Search is *a* main action in the hero, not *the* unambiguous main action for the whole page.

### 4. Can I understand the value without reading everything?

**PASS**

The first header block (three lines under the title) communicates enough value to continue: find entities, see official evidence, know gaps, review before deciding. The lower sections are optional for basic comprehension.

### 5. Are there confusing words?

| Word / phrase | Why it confuses |
|---------------|-----------------|
| **CBAI** | Acronym never expanded; meaning unknown |
| **Enterprise Alpha** | Signals unfinished / internal release |
| **CBAI Enterprise** | Sounds like a company plan tier, not a user benefit |
| **Evidence** | Ambiguous — legal proof, news, datasets, or scores? |
| **Official evidence** | Better, but still undefined source type |
| **Decision package** | Product-internal term; not plain language |
| **Decision summary** | Same family of jargon |
| **Reports** | Unclear what reports contain or who they're for |
| **Compare** | Compare what, to what end? |
| **Intelligence** (nav) | Vague enterprise label |
| **Workspaces** (nav) | Implies separate products inside the product |
| **Governance** (nav) | Institutional; unclear user benefit on homepage |
| **Evidence Explorer** (nav) | Explorer of what, for whom? |
| **Reasoning** (nav) | Abstract; could mean AI or logic |
| **Agents, workflows, documents** (topbar search) | Different product vocabulary from hero |
| **Admin** (profile) | Demo account reduces credibility |
| **Available today** | Release-notes tone; implies other days differ |

### 6. Are there repeated ideas?

| Repeated idea | Where it appears |
|---------------|------------------|
| **“Search first”** | Hero subtitle, “Where do I start?”, hero search, examples (→ search), sidebar Search link, sidebar footer CTA, Available today “Search by name”, Start exploring “Search” |
| **Entity types (country / company / university)** | Hero subtitle, search placeholder, examples, Start exploring links, sidebar nav |
| **Evidence journey** | “See official evidence”, after-search steps 2–3, Available today “View evidence”, sidebar footer “follow evidence…to reports” |
| **Reports** | After-search step 5, Available today, Start exploring |
| **Post-search workflow** | “What happens after search” (5 steps) vs “Available today” (5 bullets) — same story, two formats |
| **Browse without searching** | Examples, Start exploring, full sidebar nav |
| **Trust / review before decide** | “Review before you decide”, after-search “Read the decision summary”, Available today “Review decision package” |

### 7. Are there unnecessary sections (on homepage)?

1. **“What happens after search”** — largely duplicates “Available today”; adds scroll before action
2. **“Available today”** — reads like a changelog; redundant if the hero already explains value
3. **“Start exploring”** — duplicates sidebar navigation and partial overlap with examples
4. **Sidebar footer “Start with Search”** — redundant when user is already on Home with search above the fold
5. **Topbar search on homepage** — competes with hero search; placeholder suggests a different product

### 8. Is the visual hierarchy correct?

**FAIL**

**Explanation:** The hero search and H1 correctly dominate the main column. Hierarchy breaks at the page level: enterprise chrome (sidebar + topbar) consumes significant viewport and attention before hero content on desktop. Below the fold, four sections use the same secondary heading style and similar list density — nothing signals “read this first” vs “optional detail.” The H1 being a question weakens the top of the funnel compared to a declarative value statement. Competing search in the topbar splits focal attention.

### 9. Would a Bloomberg user trust this homepage?

**FAIL**

**Why:** “Enterprise Alpha” and a placeholder admin profile (“Jane Doe / Admin”) signal prototype, not production intelligence software. A non-functional or mismatched topbar search (agents/workflows) undermines polish. The homepage reads like a well-intentioned internal onboarding doc rather than a confident terminal-grade research entrance. Jargon (“decision package”) and duplicate instructional sections feel pre-release. Bloomberg-tier users expect immediate category clarity, authoritative branding, and zero demo chrome.

### 10. Would an ordinary person understand it?

**FAIL**

**Explanation:** The core action — search for a country, company, or university — is understandable. Everything after that introduces abstract nouns (evidence, decision package, reports, compare) without concrete examples or outcomes (“Will I get a PDF? a score? a summary?”). The surrounding app shell exposes many paths (Government, Investor, Citizen, Reasoning) that an ordinary visitor cannot map to their goal. They can *start* searching but cannot confidently predict what happens next or why they should trust the results.

---

## Summary verdict

| # | Question | Result |
|---|----------|--------|
| 1 | Understand what CBAI is in 5s | **FAIL** |
| 2 | Know what to do in 10s | **PASS** |
| 3 | Search obviously main action | **FAIL** |
| 4 | Value without reading all | **PASS** |
| 5 | Confusing words | **14+ terms listed** |
| 6 | Repeated ideas | **7 patterns listed** |
| 7 | Unnecessary sections | **5 listed** |
| 8 | Visual hierarchy | **FAIL** |
| 9 | Bloomberg trust | **FAIL** |
| 10 | Ordinary person | **FAIL** |

**Overall homepage acceptance:** **FAIL** (4/10 pass, 6/10 fail on scored questions)

---

## Problem tiers

### Critical

1. Dual search boxes with conflicting mental models (hero vs topbar)
2. H1 asks “What is CBAI?” instead of answering it
3. Demo / alpha chrome (Enterprise Alpha, Jane Doe Admin, notifications) erodes trust
4. Three consecutive sections repeat the same post-search story
5. Full enterprise nav dilutes homepage focus (~15 alternatives to searching)

### Medium

1. “Decision package” / “decision summary” on homepage path
2. “Start exploring” redundant with sidebar
3. CBAI acronym never defined; no audience line (investor, citizen, analyst)
4. Flat visual weight among lower sections — no progressive disclosure
5. “Reports” link without outcome description

### Minor

1. Numbered after-search list with mono indices feels technical
2. “Available today” release-note framing
3. Examples section partially overlaps with placeholder text in search field
4. Sidebar footer CTA redundant on Home

---

## First fix priority

**Unify to one search and one sentence of identity above the fold.**

1. On homepage, hide or retarget topbar search so only the hero search exists (or make topbar search identical behavior/copy).
2. Replace “What is CBAI?” with a declarative one-line product definition + optional subtitle (who it’s for).
3. Remove or merge “What happens after search” + “Available today” into a single short “What you get” block (max 3 bullets).
4. Strip or soften demo chrome visible on first load (Alpha badge, placeholder user) for external-facing acceptance.

---

## Estimated UX improvement

If first-priority fixes are applied (no new features):

| Metric | Current (est.) | After fix (est.) |
|--------|----------------|------------------|
| 5s “what is this?” comprehension | ~35% | ~75% |
| 10s “what do I do?” clarity | ~80% | ~95% |
| Search as sole primary action | ~50% | ~90% |
| Trust (professional user) | Low | Medium–High |
| Scroll depth before action | High (4 sections) | Low (1–2 sections) |

**Net UX lift:** ~40–50% improvement in first-impression clarity and action confidence, primarily from eliminating competition, answering the headline question, and cutting repeated instructional copy.
