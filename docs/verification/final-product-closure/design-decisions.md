# Final Product Closure — Design Decisions

**Branch:** `preview/spatial-world-intelligence`

## DD-PC-001 — Voice setup messaging (Phase 9)

| Option | Description | Clarity | Risk | Selected |
|--------|-------------|---------|------|----------|
| A | Keep npm/.dev.vars in main dock notice | 4 | Low | |
| B | User-friendly notice + collapsible developer diagnostics | 9 | Low | ✅ |
| C | Hide all backend hints | 6 | Medium | |

**Selected B:** End users see honest capability state; developers expand diagnostics for broker URL, classification, and doctor command.

## DD-PC-002 — Indicator explorer localization (Phase 10)

| Option | Description | Clarity | Risk | Selected |
|--------|-------------|---------|------|----------|
| A | Leave English in expert indicator panels | 5 | Low | |
| B | Client i18n via `indicatorExplorer` dictionary section | 9 | Low | ✅ |
| C | Server-side translation at data layer | 7 | High | |

**Selected B:** Platform UI strings use dictionaries; source material stays in official language.

## DD-PC-003 — Information architecture (Phase 3)

**Selected:** Canonical CORE / INTELLIGENCE / OPERATIONS / OVERSIGHT / SYSTEM structure with Knowledge Graph under Intelligence (from DD-006).

## DD-PC-004 — Trust long-document navigation (Phase 7)

| Option | Description | Clarity | Risk | Selected |
|--------|-------------|---------|------|----------|
| A | Flat card stack only | 6 | Low | |
| B | Existing section anchor nav + numbered sections | 9 | Low | ✅ |
| C | Full sidebar TOC | 8 | Medium | |

**Selected B:** Trust already ships section nav; retained with scroll-margin for sticky topbar.

## DD-PC-005 — Design tokens (Phase 5)

**Selected B:** Extend semantic tokens (`--cbai-surface-inspector`) rather than per-route Tailwind zinc overrides in indicator panels.
