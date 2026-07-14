type CBAILogoProps = {
  compact?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** "auto" (default) — the wordmark follows the real active theme (CSS custom properties), so it
   * reads correctly whether the surface is the default light Intelligence palette or the explicit
   * Deep theme, with zero per-call-site guessing about the surrounding background. "forcedDark" —
   * always renders as if on a light surface, for a context that is always white regardless of the
   * app's current theme (e.g. a printed report). */
  variant?: "auto" | "forcedDark";
};

const MARK_SIZES = { sm: 28, md: 36, lg: 48, xl: 64 } as const;

const LOGO_ACCESSIBLE_NAME = "CBAI — Universal Intelligence";

/** Design System 4.0 brand identity — the deep forest-green accent (#005810) blending toward the
 * brighter trust-green (#2fbf71), replacing the previous cyan/blue gradient everywhere the mark
 * itself carries color (the SVG can't read CSS custom properties across a static export the same
 * way text can, so the mark's own palette is fixed here rather than theme-reactive). */
function gradientDefs(id: string) {
  return (
    <defs>
      <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2fbf71" />
        <stop offset="55%" stopColor="#0a7a1f" />
        <stop offset="100%" stopColor="#005810" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#2fbf71" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#2fbf71" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-node-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="0.6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/**
 * Premium CBAI mark — a circular intelligence/network symbol: geometric C, inner globe,
 * 4-node network ring. Standalone/icon-only usages (no adjacent wordmark) should pass
 * `standalone` so the mark carries its own accessible name — every other usage sits beside the
 * CBAI wordmark, which already provides the accessible label, so the mark itself stays
 * `aria-hidden` to avoid announcing the same name twice.
 */
function CBAIMark({ size = 36, id = "cbai", standalone = false }: { size?: number; id?: string; standalone?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={standalone ? "img" : undefined}
      aria-label={standalone ? LOGO_ACCESSIBLE_NAME : undefined}
      aria-hidden={standalone ? undefined : true}
      className="shrink-0"
    >
      {gradientDefs(id)}
      <circle className="cbai-mark-glow" cx="32" cy="32" r="30" fill={`url(#${id}-glow)`} />
      {/* Geometric C */}
      <path
        d="M44 18C38 12 28 10 20 14C10 20 8 34 14 44C18 50 26 54 34 52"
        stroke={`url(#${id}-grad)`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 18V46C38 52 28 54 20 50"
        stroke={`url(#${id}-grad)`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      {/* Inner globe */}
      <circle cx="32" cy="32" r="11" stroke={`url(#${id}-grad)`} strokeWidth="1.25" opacity="0.7" />
      <ellipse cx="32" cy="32" rx="11" ry="4.5" stroke="#0a7a1f" strokeWidth="0.75" opacity="0.45" />
      <ellipse cx="32" cy="32" rx="4.5" ry="11" stroke="#0a7a1f" strokeWidth="0.75" opacity="0.35" />
      {/* Network nodes */}
      <circle cx="32" cy="21" r="2" fill="#2fbf71" filter={`url(#${id}-node-glow)`} />
      <circle cx="41" cy="32" r="1.75" fill="#0a7a1f" filter={`url(#${id}-node-glow)`} />
      <circle cx="32" cy="43" r="1.75" fill="#005810" filter={`url(#${id}-node-glow)`} />
      <circle cx="23" cy="32" r="1.75" fill="#2fbf71" filter={`url(#${id}-node-glow)`} />
      <line x1="32" y1="21" x2="41" y2="32" stroke="#2fbf71" strokeWidth="0.6" opacity="0.5" />
      <line x1="41" y1="32" x2="32" y2="43" stroke="#0a7a1f" strokeWidth="0.6" opacity="0.45" />
      <line x1="32" y1="43" x2="23" y2="32" stroke="#005810" strokeWidth="0.6" opacity="0.45" />
      <line x1="23" y1="32" x2="32" y2="21" stroke="#2fbf71" strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

export default function CBAILogo({
  compact = false,
  showTagline = true,
  size = "md",
  className = "",
  variant = "auto",
}: CBAILogoProps) {
  const markSize = MARK_SIZES[size];
  // "auto" reads the real active theme via CSS custom properties (--foreground/--accent already
  // flip between the default light Intelligence palette and the explicit Deep theme) — no
  // per-call-site guessing about the surrounding background. "forcedDark" is for a context that is
  // always a light/white surface regardless of the app's current theme (e.g. a printed report).
  const wordmarkGradient =
    variant === "forcedDark"
      ? "bg-gradient-to-r from-slate-900 via-emerald-800 to-[#005810]"
      : "bg-gradient-to-r from-[var(--foreground)] via-[var(--accent)] to-[var(--accent)]";
  const taglineColor = variant === "forcedDark" ? "text-[#005810]/90" : "text-[var(--accent)]/90";

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`} role="img" aria-label={LOGO_ACCESSIBLE_NAME}>
        <CBAIMark size={markSize} id="cbai-compact" />
        <span
          aria-hidden="true"
          className={`${wordmarkGradient} bg-clip-text text-sm font-bold tracking-tight text-transparent`}
        >
          CBAI
        </span>
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`} role="img" aria-label={LOGO_ACCESSIBLE_NAME}>
      <CBAIMark size={markSize} id="cbai-full" />
      <div aria-hidden="true" className="min-w-0">
        <p className={`${wordmarkGradient} bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl`}>
          CBAI
        </p>
        {showTagline ? (
          <p className={`text-[11px] font-medium tracking-[0.12em] ${taglineColor} uppercase sm:text-xs`}>
            Universal Intelligence
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { CBAIMark, LOGO_ACCESSIBLE_NAME };
