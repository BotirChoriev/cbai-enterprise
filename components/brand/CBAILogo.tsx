type CBAILogoProps = {
  compact?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** "auto" (default) — the wordmark follows the real active theme (CSS custom properties), so it
   * reads correctly whether the surface is the default light Intelligence palette or the explicit
   * Deep theme, with zero per-call-site guessing about the surrounding background. "forcedDark" —
   * always renders as if on a light surface, for a context that is always white regardless of the
   * app's current theme (e.g. a printed report). "onDark" — teal wordmark for deep navy surfaces. */
  variant?: "auto" | "forcedDark" | "onDark";
};

const MARK_SIZES = { sm: 28, md: 36, lg: 52, xl: 72 } as const;

const LOGO_ACCESSIBLE_NAME = "CBAI — Universal Intelligence Operating System";
const LOGO_SUBTITLE_PRIMARY = "Universal Intelligence";
const LOGO_SUBTITLE_SECONDARY = "Operating System";

/** Design System — intelligence-sphere mark: concentric globe grid with network nodes.
 * Teal/cyan palette aligned with CBAI accent; no crescent, no detached map fragment. */
function gradientDefs(id: string) {
  return (
    <defs>
      <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5eead4" />
        <stop offset="50%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#0d9488" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
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
 * Premium CBAI mark — intelligence sphere with latitude rings and network nodes.
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
      <circle cx="32" cy="32" r="27" stroke={`url(#${id}-grad)`} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="18" stroke={`url(#${id}-grad)`} strokeWidth="1.25" opacity="0.75" />
      <ellipse cx="32" cy="32" rx="18" ry="7" stroke="#14b8a6" strokeWidth="0.9" opacity="0.55" />
      <ellipse cx="32" cy="32" rx="7" ry="18" stroke="#0d9488" strokeWidth="0.9" opacity="0.45" />
      <circle cx="32" cy="32" r="4" fill={`url(#${id}-grad)`} opacity="0.9" />
      <circle cx="32" cy="14" r="2.2" fill="#5eead4" filter={`url(#${id}-node-glow)`} />
      <circle cx="50" cy="32" r="2" fill="#14b8a6" filter={`url(#${id}-node-glow)`} />
      <circle cx="32" cy="50" r="2" fill="#0d9488" filter={`url(#${id}-node-glow)`} />
      <circle cx="14" cy="32" r="2" fill="#5eead4" filter={`url(#${id}-node-glow)`} />
      <line x1="32" y1="14" x2="50" y2="32" stroke="#14b8a6" strokeWidth="0.65" opacity="0.45" />
      <line x1="50" y1="32" x2="32" y2="50" stroke="#0d9488" strokeWidth="0.65" opacity="0.4" />
      <line x1="32" y1="50" x2="14" y2="32" stroke="#0d9488" strokeWidth="0.65" opacity="0.4" />
      <line x1="14" y1="32" x2="32" y2="14" stroke="#5eead4" strokeWidth="0.65" opacity="0.45" />
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
      : variant === "onDark"
        ? "bg-gradient-to-r from-teal-100 via-teal-300 to-emerald-400"
        : "bg-gradient-to-r from-[var(--foreground)] via-[var(--accent)] to-[var(--accent)]";
  const taglinePrimaryColor =
    variant === "forcedDark"
      ? "text-[#005810]/90"
      : variant === "onDark"
        ? "text-teal-100/90"
        : "text-[var(--accent)]/90";
  const taglineSecondaryColor =
    variant === "forcedDark"
      ? "text-slate-600"
      : variant === "onDark"
        ? "text-[#e8f4f0]/85"
        : "text-zinc-500";

  if (compact) {
    return (
      <span className={`inline-flex shrink-0 ${className}`}>
        <CBAIMark size={markSize} id="cbai-compact" standalone />
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} role="img" aria-label={LOGO_ACCESSIBLE_NAME}>
      <CBAIMark size={markSize} id="cbai-full" />
      <div aria-hidden="true" className="min-w-0 space-y-0.5">
        <p className={`${wordmarkGradient} bg-clip-text text-lg font-bold leading-none tracking-tight text-transparent sm:text-xl lg:text-[1.35rem]`}>
          CBAI
        </p>
        {showTagline ? (
          <>
            <p className={`text-[9px] font-medium uppercase tracking-[0.13em] ${taglinePrimaryColor} sm:text-[10px]`}>
              {LOGO_SUBTITLE_PRIMARY}
            </p>
            <p className={`text-[9px] font-medium uppercase tracking-[0.13em] ${taglineSecondaryColor} sm:text-[10px]`}>
              {LOGO_SUBTITLE_SECONDARY}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export { CBAIMark, LOGO_ACCESSIBLE_NAME, LOGO_SUBTITLE_PRIMARY, LOGO_SUBTITLE_SECONDARY };
