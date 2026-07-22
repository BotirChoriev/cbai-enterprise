/** Shared premium brand class tokens — Variant 1 Dark Premium (emerald accent, restrained gold). */

export const brandAccent = "text-teal-400";
export const brandAccentHover = "hover:text-teal-300";
export const brandAccentBg = "bg-teal-500/10";
export const brandAccentBorder = "border-teal-500/20";

/* ── Motion & focus (one language) ─────────────────────────────────────── */

export const cbaiTransition = "transition-colors duration-150 ease-out";

export const cbaiFocusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400";

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
  "rounded-xl border border-teal-500/10 bg-[var(--card)]/80 shadow-[0_0_48px_-16px_rgba(13,148,136,0.14)] backdrop-blur-md";

export const cbaiSectionTitle = "text-base font-semibold tracking-tight text-[var(--cbai-text-primary)]";

export const cbaiSectionEyebrow =
  "text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--cbai-accent-primary)]";

export const cbaiPageHeader = "cbai-page-header";

export const cbaiPageWorkspace = "cbai-page-workspace";

/** Mineral surface — structured operating panel without excessive glass. */
export const cbaiMineralSurface =
  "rounded-xl border border-zinc-800/80 bg-[var(--surface)]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

export const cbaiMineralPanel = `${cbaiMineralSurface} ${cbaiPanelPadding}`;
export const cbaiMineralPanelMd = `${cbaiMineralSurface} ${cbaiPanelPadding} ${cbaiStackMd}`;

export const cbaiEmptyDashed =
  "rounded-xl border border-dashed border-zinc-800 px-5 py-12 text-center";

/** Progressive disclosure panel — entity explore, optional sections. */
export const cbaiDisclosurePanel =
  "scroll-mt-6 rounded-xl border border-zinc-800/80 bg-[var(--surface)]/90";

export const cbaiDisclosureSummary =
  `cursor-pointer list-none px-4 py-3 text-sm font-medium text-zinc-500 marker:content-none [&::-webkit-details-marker]:hidden ${cbaiTransition}`;

export const cbaiLoadingLine = `text-sm ${cbaiTextMuted}`;

export const cbaiStatCell = "rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-2";

/** Graph and explorer panels — mineral surface with standard padding. */
export const cbaiGraphPanel = `${cbaiMineralSurface} ${cbaiPanelPadding}`;

export const cbaiIconBtn =
  `inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-300 ${cbaiTransition} hover:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-40 ${cbaiFocusRing}`;

export const cbaiIconBtnSm =
  `inline-flex min-h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400 ${cbaiTransition} hover:border-zinc-600 ${cbaiFocusRing}`;

/* ── Buttons ───────────────────────────────────────────────────────────── */

export const cbaiBtnPrimary =
  `inline-flex min-h-10 items-center justify-center rounded-lg bg-teal-600 px-5 text-sm font-semibold text-zinc-50 ${cbaiTransition} hover:bg-teal-500 ${cbaiFocusRing}`;

export const cbaiBtnPrimarySm =
  `inline-flex min-h-8 items-center justify-center rounded-lg bg-teal-600 px-4 text-xs font-semibold text-zinc-50 ${cbaiTransition} hover:bg-teal-500 ${cbaiFocusRing}`;

export const cbaiBtnSecondary =
  `inline-flex min-h-10 items-center justify-center rounded-lg border border-zinc-700 bg-[var(--surface)]/80 px-5 text-sm font-medium text-teal-400 ${cbaiTransition} hover:border-teal-500/30 hover:bg-zinc-900/60 ${cbaiFocusRing}`;

export const cbaiBtnSecondarySm =
  `inline-flex min-h-8 items-center justify-center rounded-lg border border-zinc-700 bg-[var(--surface)]/80 px-3 text-xs font-medium text-teal-400 ${cbaiTransition} hover:border-teal-500/30 hover:bg-zinc-900/60 disabled:cursor-not-allowed disabled:opacity-40 ${cbaiFocusRing}`;

export const cbaiBtnGhost =
  `inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-zinc-400 ${cbaiTransition} hover:text-zinc-200 ${cbaiFocusRing}`;

/* ── Surface hierarchy (Level 0 canvas / Level 1 glass / Level 2 solid) ─ */

export const cbaiSurfaceCanvas = "bg-[var(--cbai-shell-bg)]";
export const cbaiSurfaceGlass =
  "rounded-xl border border-teal-500/12 bg-[var(--cbai-glass-surface)] backdrop-blur-md";
export const cbaiSurfaceSolid =
  "rounded-xl border border-zinc-800/80 bg-[var(--cbai-solid-surface)]";

/* ── Chips & inline actions ────────────────────────────────────────────── */

export const cbaiChip =
  `inline-flex min-h-8 items-center rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-500 ${cbaiTransition} hover:border-teal-500/30 hover:text-teal-300 ${cbaiFocusRing}`;

export const cbaiChipActive =
  `inline-flex min-h-8 items-center rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs text-teal-300 ${cbaiFocusRing}`;

export const cbaiProminentAction =
  `inline-flex min-h-10 items-center rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm font-medium text-teal-300 ${cbaiTransition} hover:border-teal-400/50 hover:bg-teal-500/15 ${cbaiFocusRing}`;

export const cbaiLinkMuted =
  `text-xs text-zinc-500 ${cbaiTransition} hover:text-teal-300 ${cbaiFocusRing}`;

export const cbaiLinkAction =
  `text-xs text-teal-400 ${cbaiTransition} hover:text-teal-300 ${cbaiFocusRing}`;

/* ── Navigation ────────────────────────────────────────────────────────── */

export const cbaiNavActive = "bg-teal-500/10 text-teal-400";
export const cbaiNavInactive = `text-zinc-400 ${cbaiTransition} hover:bg-zinc-900/80 hover:text-zinc-50`;

export const cbaiNavEyebrow = "cbai-nav-eyebrow px-2";

export const cbaiNavRow = "cbai-nav-row focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400";
export const cbaiNavRowActive = "cbai-nav-row-active";
export const cbaiNavRowIdle = "cbai-nav-row-idle";

export const cbaiSpatialNavRow = cbaiNavRow;
export const cbaiSpatialNavRowActive = cbaiNavRowActive;
export const cbaiSpatialNavRowIdle = cbaiNavRowIdle;

/* ── Search & shell ────────────────────────────────────────────────────── */

export const cbaiSearchShell =
  "cbai-glass rounded-xl border border-teal-500/20 p-2 shadow-[0_0_40px_-12px_rgba(13,148,136,0.18)] transition-shadow duration-150 ease-out focus-within:border-teal-400/40 focus-within:shadow-[0_0_56px_-8px_rgba(13,148,136,0.28)]";

export const cbaiSearchInput =
  "home-search-input w-full rounded-lg border border-zinc-800/80 bg-[var(--surface)]/90 px-5 py-4 text-lg text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none sm:py-5 sm:pr-36 sm:text-xl";

export const cbaiHeroGlow =
  "relative overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.08),transparent_55%)]";

export const cbaiOperatingShell = "min-h-full bg-[var(--background)] text-[var(--foreground)]";

/** Intelligence Canvas — full operating workspace grid. */
export const cbaiIntelligenceCanvas =
  "cbai-intelligence-canvas relative min-h-full bg-[var(--background)]";

/** Living operating object — not a card. */
export const cbaiOperatingObject =
  "cbai-operating-object relative overflow-hidden";
