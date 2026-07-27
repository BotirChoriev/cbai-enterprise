/** Shared premium brand class tokens — semantic `--cbai-*` surfaces (DD-FPF-002). */

export const brandAccent = "text-[var(--cbai-accent-primary)]";
export const brandAccentHover = "hover:text-[var(--cbai-accent-hover)]";
export const brandAccentBg = "bg-[var(--cbai-accent-subtle)]";
export const brandAccentBorder = "border-[color-mix(in_srgb,var(--cbai-accent-primary)_22%,transparent)]";

/* ── Motion & focus (one language) ─────────────────────────────────────── */

export const cbaiTransition = "transition-colors duration-150 ease-out";

export const cbaiFocusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cbai-focus-ring)]";

/* ── Spacing scale ─────────────────────────────────────────────────────── */

export const cbaiPanelPadding = "p-4";
export const cbaiPanelPaddingLg = "p-5";
export const cbaiStackSm = "space-y-2";
export const cbaiStackMd = "space-y-3";
export const cbaiStackLg = "space-y-4";
export const cbaiPageStack = "space-y-6";
export const cbaiEntitySidebarStack = "space-y-4";
export const cbaiGapSm = "gap-2";
export const cbaiGapMd = "gap-3";

/* ── Typography scale ──────────────────────────────────────────────────── */

export const cbaiTextBody = "text-sm text-[var(--cbai-text-secondary)]";
export const cbaiTextMuted = "text-xs text-[var(--cbai-text-muted)]";
export const cbaiTextCaption = "text-xs text-[var(--cbai-text-muted)]";

/* ── Surfaces ──────────────────────────────────────────────────────────── */

export const cbaiGlassCard =
  "rounded-[var(--cbai-radius-card)] border border-[color-mix(in_srgb,var(--cbai-accent-primary)_12%,var(--cbai-border-subtle))] bg-[var(--cbai-glass-surface)] shadow-[var(--cbai-shadow-soft)] backdrop-blur-md";

export const cbaiSectionTitle = "text-base font-semibold tracking-tight text-[var(--cbai-text-primary)]";

export const cbaiSectionEyebrow =
  "text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--cbai-accent-primary)]";

export const cbaiPageHeader = "cbai-page-header";

export const cbaiPageWorkspace = "cbai-page-workspace";

/** Mineral surface — structured operating panel without excessive glass. */
export const cbaiMineralSurface =
  "rounded-[var(--cbai-radius-card)] border border-[var(--cbai-border-subtle)] bg-[var(--cbai-solid-surface)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--cbai-text-primary)_4%,transparent)]";

export const cbaiMineralPanel = `${cbaiMineralSurface} ${cbaiPanelPadding}`;
export const cbaiMineralPanelMd = `${cbaiMineralSurface} ${cbaiPanelPadding} ${cbaiStackMd}`;

export const cbaiEmptyDashed =
  "rounded-[var(--cbai-radius-card)] border border-dashed border-[var(--cbai-border-default)] px-5 py-12 text-center";

/** Progressive disclosure panel — entity explore, optional sections. */
export const cbaiDisclosurePanel =
  "scroll-mt-6 rounded-[var(--cbai-radius-card)] border border-[var(--cbai-border-subtle)] bg-[var(--cbai-solid-surface)]";

export const cbaiDisclosureSummary =
  `cursor-pointer list-none px-4 py-3 text-sm font-medium text-[var(--cbai-text-muted)] marker:content-none [&::-webkit-details-marker]:hidden ${cbaiTransition}`;

export const cbaiLoadingLine = `text-sm ${cbaiTextMuted}`;

export const cbaiStatCell =
  "rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-muted)] px-3 py-2";

/** Graph and explorer panels — mineral surface with standard padding. */
export const cbaiGraphPanel = `${cbaiMineralSurface} ${cbaiPanelPadding}`;

export const cbaiIconBtn =
  `inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] text-sm text-[var(--cbai-text-secondary)] ${cbaiTransition} hover:border-[var(--cbai-border-active)] disabled:cursor-not-allowed disabled:opacity-40 ${cbaiFocusRing}`;

export const cbaiIconBtnSm =
  `inline-flex min-h-9 items-center justify-center rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-default)] bg-[var(--cbai-surface-muted)] px-2 text-[10px] font-medium uppercase tracking-wider text-[var(--cbai-text-muted)] ${cbaiTransition} hover:border-[var(--cbai-border-active)] ${cbaiFocusRing}`;

/* ── Buttons ───────────────────────────────────────────────────────────── */

export const cbaiBtnPrimary =
  `inline-flex min-h-10 items-center justify-center rounded-[var(--cbai-radius-control)] bg-[var(--cbai-accent-primary)] px-5 text-sm font-semibold text-[#f8fafc] ${cbaiTransition} hover:bg-[var(--cbai-accent-hover)] ${cbaiFocusRing}`;

export const cbaiBtnPrimarySm =
  `inline-flex min-h-8 items-center justify-center rounded-[var(--cbai-radius-control)] bg-[var(--cbai-accent-primary)] px-4 text-xs font-semibold text-[#f8fafc] ${cbaiTransition} hover:bg-[var(--cbai-accent-hover)] ${cbaiFocusRing}`;

export const cbaiBtnSecondary =
  `inline-flex min-h-10 items-center justify-center rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-5 text-sm font-medium text-[var(--cbai-accent-primary)] ${cbaiTransition} hover:border-[var(--cbai-border-active)] hover:bg-[var(--cbai-surface-hover)] ${cbaiFocusRing}`;

export const cbaiBtnSecondarySm =
  `inline-flex min-h-8 items-center justify-center rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-default)] bg-[var(--cbai-solid-surface)] px-3 text-xs font-medium text-[var(--cbai-accent-primary)] ${cbaiTransition} hover:border-[var(--cbai-border-active)] hover:bg-[var(--cbai-surface-hover)] disabled:cursor-not-allowed disabled:opacity-40 ${cbaiFocusRing}`;

export const cbaiBtnGhost =
  `inline-flex min-h-10 items-center justify-center rounded-[var(--cbai-radius-control)] px-4 text-sm font-medium text-[var(--cbai-text-muted)] ${cbaiTransition} hover:text-[var(--cbai-text-primary)] ${cbaiFocusRing}`;

/* ── Surface hierarchy (Level 0 canvas / Level 1 glass / Level 2 solid) ─ */

export const cbaiSurfaceCanvas = "bg-[var(--cbai-shell-bg)]";
export const cbaiSurfaceGlass =
  "rounded-[var(--cbai-radius-card)] border border-[color-mix(in_srgb,var(--cbai-accent-primary)_12%,var(--cbai-border-subtle))] bg-[var(--cbai-glass-surface)] backdrop-blur-md";
export const cbaiSurfaceSolid =
  "rounded-[var(--cbai-radius-card)] border border-[var(--cbai-border-subtle)] bg-[var(--cbai-solid-surface)]";

/* ── Chips & inline actions ────────────────────────────────────────────── */

export const cbaiChip =
  `inline-flex min-h-8 items-center rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-default)] px-3 py-1.5 text-xs text-[var(--cbai-text-muted)] ${cbaiTransition} hover:border-[var(--cbai-border-active)] hover:text-[var(--cbai-accent-primary)] ${cbaiFocusRing}`;

export const cbaiChipActive =
  `inline-flex min-h-8 items-center rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-active)] bg-[var(--cbai-accent-subtle)] px-3 py-1.5 text-xs text-[var(--cbai-accent-primary)] ${cbaiFocusRing}`;

export const cbaiProminentAction =
  `inline-flex min-h-10 items-center rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-active)] bg-[var(--cbai-accent-subtle)] px-3 py-2 text-sm font-medium text-[var(--cbai-accent-primary)] ${cbaiTransition} hover:bg-[color-mix(in_srgb,var(--cbai-accent-subtle)_140%,transparent)] ${cbaiFocusRing}`;

export const cbaiLinkMuted =
  `text-xs text-[var(--cbai-text-muted)] ${cbaiTransition} hover:text-[var(--cbai-accent-primary)] ${cbaiFocusRing}`;

export const cbaiLinkAction =
  `text-xs text-[var(--cbai-accent-primary)] ${cbaiTransition} hover:text-[var(--cbai-accent-hover)] ${cbaiFocusRing}`;

/* ── Navigation ────────────────────────────────────────────────────────── */

export const cbaiNavActive = "bg-[var(--cbai-nav-bg-active)] text-[var(--cbai-accent-primary)]";
export const cbaiNavInactive = `text-[var(--cbai-nav-text)] ${cbaiTransition} hover:bg-[var(--cbai-surface-hover)] hover:text-[var(--cbai-nav-text-hover)]`;

export const cbaiNavEyebrow = "cbai-nav-eyebrow px-2";

export const cbaiNavRow = "cbai-nav-row focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cbai-focus-ring)]";
export const cbaiNavRowActive = "cbai-nav-row-active";
export const cbaiNavRowIdle = "cbai-nav-row-idle";

export const cbaiSpatialNavRow = cbaiNavRow;
export const cbaiSpatialNavRowActive = cbaiNavRowActive;
export const cbaiSpatialNavRowIdle = cbaiNavRowIdle;

/* ── Search & shell ────────────────────────────────────────────────────── */

export const cbaiSearchShell =
  "cbai-glass rounded-[var(--cbai-radius-card)] border border-[color-mix(in_srgb,var(--cbai-accent-primary)_20%,var(--cbai-border-subtle))] p-2 shadow-[var(--cbai-shadow-soft)] transition-shadow duration-150 ease-out focus-within:border-[var(--cbai-border-active)]";

export const cbaiSearchInput =
  "home-search-input w-full rounded-[var(--cbai-radius-control)] border border-[var(--cbai-border-subtle)] bg-[var(--cbai-solid-surface)] px-5 py-4 text-lg text-[var(--cbai-text-primary)] placeholder:text-[var(--cbai-text-muted)] focus-visible:outline-none sm:py-5 sm:pr-36 sm:text-xl";

export const cbaiHeroGlow =
  "relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--cbai-accent-primary)_8%,transparent),transparent_55%)]";

export const cbaiOperatingShell = "min-h-full bg-[var(--background)] text-[var(--foreground)]";

/** Intelligence Canvas — full operating workspace grid. */
export const cbaiIntelligenceCanvas =
  "cbai-intelligence-canvas relative min-h-full bg-[var(--background)]";

/** Living operating object — not a card. */
export const cbaiOperatingObject =
  "cbai-operating-object relative overflow-hidden";
