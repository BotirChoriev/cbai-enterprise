# Existing design system (baseline)

## Theme mechanism
- Default dark via `:root` in `app/globals.css`
- Light via `html.theme-light` (`AssistantProfileProvider`)
- Spatial home remains dark-specialist under light theme

## Token families (already present)
Canvas: `--cbai-canvas`, `--cbai-shell-bg`, `--background`
Surfaces: `--cbai-glass-surface`, `--cbai-solid-surface`, `--cbai-surface-muted|hover|inspector`
Text: `--cbai-text-primary|secondary|muted`
Accent: `--cbai-accent-primary` (teal)
Chrome: `--cbai-topbar-bg`, `--cbai-sidebar-bg`, `--cbai-dock-inset`
Spacing/radius/motion: `--cbai-space-*`, `--cbai-radius-*`, `--cbai-motion-*`

## Brand helpers
`components/brand/brand-classes.ts` — surfaces, buttons, nav rows, page workspace.

## Closure direction (chosen)
**Option C — canonical system-level:** strengthen semantic tokens + shared shells; migrate brand helpers off hardcoded zinc where critical; CSS guardrails against white cards on dark theme; expand IA disclosure — not three parallel UI systems.
