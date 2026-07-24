# Final Visual Acceptance — Design Decisions

Decisions from the 54-screenshot inspection loop. Each problem evaluated with three internal options; **Option B (structured Intelligence OS)** selected unless noted.

## 1. Living context vs duplicate mission bars

| Option | Approach | Score (clarity / IOS / a11y) |
|--------|----------|------------------------------|
| A | Keep page-level `MissionOperatingContextBar` on every route | 6 / 5 / 7 |
| B | **Single `LivingContextRibbon` in layout; remove entity/page duplicates** | **9 / 9 / 9** |
| C | Full-width animated mission hero on each route | 4 / 3 / 5 |

**Implemented:** Ribbon only in layout; excluded `/`, `/my-work`, `/search`, reference routes. Removed bar from `EntityExploreShell` and workflow pages.

## 2. Light theme spatial home contrast

| Option | Approach | Score |
|--------|----------|-------|
| A | Force entire app light including globe canvas | 5 / 4 / 6 |
| B | **Dark spatial canvas + forced light type on `.cbai-spatial-world-home`** | **9 / 9 / 9** |
| C | Separate light-theme globe texture swap | 7 / 8 / 7 |

**Implemented:** CSS overrides for h1, eyebrow, and primary voice CTA on spatial home in `theme-light`.

## 3. Voice closed CTA placement

| Option | Approach | Score |
|--------|----------|-------|
| A | Center-bottom full-width bar | 5 / 4 / 5 |
| B | **Bottom-right pill on mobile/desktop; increased main scroll padding** | **9 / 8 / 9** |
| C | Hide closed CTA entirely | 7 / 6 / 8 |

**Implemented:** `justify-end` on sm+, compact rounded-full on mobile, `cbai-voice-reserved-main` padding increased.

## 4. Reports empty state

| Option | Approach | Score |
|--------|----------|-------|
| A | Fabricate sample report cards | 2 / 1 / 3 |
| B | **`ReportsEmptyIntro` first + hide orphan Review nav without mission/entity** | **9 / 9 / 9** |
| C | Giant illustration-only empty canvas | 4 / 3 / 6 |

**Implemented:** `ReportsPrimaryActions` returns null when no mission project and no entity context.

## 5. Personal Cabinet English limitation

| Option | Approach | Score |
|--------|----------|-------|
| A | Keep hardcoded selector string | 3 / 3 / 5 |
| B | **Use existing `genesisOs.deviceLocalLimitation` i18n key** | **10 / 9 / 10** |
| C | Remove limitation notice | 6 / 5 / 7 |

**Implemented:** `PersonalCabinetPanel` uses `t("genesisOs.deviceLocalLimitation")`.

## 6. My Work mission summary styling

| Option | Approach | Score |
|--------|----------|-------|
| A | Large teal-bordered hero card | 5 / 4 / 6 |
| B | **Mineral surface progress strip; ribbon excluded on `/my-work`** | **9 / 9 / 9** |
| C | Remove mission summary entirely | 6 / 5 / 7 |

**Implemented:** `MissionHomeSummary` uses `cbaiMineralSurface`; ribbon hidden on mission home.

## 7. Light theme internal shell

| Option | Approach | Score |
|--------|----------|-------|
| A | White sidebar + white main (generic dashboard) | 4 / 3 / 6 |
| B | **Shared `--cbai-sidebar-bg` + `--cbai-canvas` on sidebar and main** | **9 / 9 / 9** |
| C | Dark sidebar + light main (split system) | 6 / 5 / 6 |

**Implemented:** Light theme platform sidebar/main background tokens aligned.

## 8. Locale screenshot gate

| Option | Approach | Score |
|--------|----------|-------|
| A | Patch `localStorage` on shared page after EN navigation | 4 / 3 / 5 |
| B | **Fresh browser context + `addInitScript` with full profile; wait for `document.documentElement.lang`** | **10 / 9 / 10** |
| C | UI-click LanguageSelector in Playwright | 8 / 8 / 7 |

**Implemented:** Per-locale isolated context with `:local` profile seed; verified UZ/RU/TR captures.

## 9. Personal Cabinet stat labels

| Option | Approach | Score |
|--------|----------|-------|
| A | Leave English dt/li strings | 3 / 3 / 4 |
| B | **`genesisOs.cabinetStat*` keys in all four languages** | **10 / 9 / 10** |
| C | Remove stat grid until data exists | 6 / 5 / 7 |

**Implemented:** Localized Projects, tasks, teams, passport, opportunities summaries.

## 10. My Work mission CTA deduplication

| Option | Approach | Score |
|--------|----------|-------|
| A | Keep Begin mission + Create a mission link | 5 / 4 / 6 |
| B | **Single CTA in `MissionHomeSummary`; empty missions card text-only** | **9 / 9 / 9** |
| C | Remove both CTAs | 4 / 3 / 5 |

**Implemented:** Personal Cabinet empty missions no longer links to `/?create=1`.

## 11. Voice open panel footprint

| Option | Approach | Score |
|--------|----------|-------|
| A | Full-width bottom sheet | 5 / 4 / 6 |
| B | **`max-w-[18rem]` compact panel bottom-right** | **9 / 8 / 9** |
| C | Hide open panel; text-only modal | 7 / 6 / 8 |

**Implemented:** Reduced open dock width on Research and internal routes.
