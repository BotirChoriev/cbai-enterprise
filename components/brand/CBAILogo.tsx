type CBAILogoProps = {
  compact?: boolean;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const MARK_SIZES = { sm: 28, md: 36, lg: 48, xl: 64 } as const;

function gradientDefs(id: string) {
  return (
    <defs>
      <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="55%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-node-glow`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/** Premium CBAI mark — geometric C, inner globe, network nodes. */
function CBAIMark({ size = 36, id = "cbai" }: { size?: number; id?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
    >
      {gradientDefs(id)}
      <circle cx="32" cy="32" r="30" fill={`url(#${id}-glow)`} />
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
      <ellipse cx="32" cy="32" rx="11" ry="4.5" stroke="#22d3ee" strokeWidth="0.75" opacity="0.45" />
      <ellipse cx="32" cy="32" rx="4.5" ry="11" stroke="#22d3ee" strokeWidth="0.75" opacity="0.35" />
      {/* Network nodes */}
      <circle cx="32" cy="21" r="2" fill="#22d3ee" filter={`url(#${id}-node-glow)`} />
      <circle cx="41" cy="32" r="1.75" fill="#38bdf8" filter={`url(#${id}-node-glow)`} />
      <circle cx="32" cy="43" r="1.75" fill="#60a5fa" filter={`url(#${id}-node-glow)`} />
      <circle cx="23" cy="32" r="1.75" fill="#22d3ee" filter={`url(#${id}-node-glow)`} />
      <line x1="32" y1="21" x2="41" y2="32" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" />
      <line x1="41" y1="32" x2="32" y2="43" stroke="#38bdf8" strokeWidth="0.6" opacity="0.45" />
      <line x1="32" y1="43" x2="23" y2="32" stroke="#60a5fa" strokeWidth="0.6" opacity="0.45" />
      <line x1="23" y1="32" x2="32" y2="21" stroke="#22d3ee" strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

export default function CBAILogo({
  compact = false,
  showTagline = true,
  size = "md",
  className = "",
}: CBAILogoProps) {
  const markSize = MARK_SIZES[size];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <CBAIMark size={markSize} id="cbai-compact" />
        <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-sm font-bold tracking-tight text-transparent">
          CBAI
        </span>
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <CBAIMark size={markSize} id="cbai-full" />
      <div className="min-w-0">
        <p className="bg-gradient-to-r from-zinc-50 via-cyan-100 to-blue-200 bg-clip-text text-lg font-bold tracking-tight text-transparent sm:text-xl">
          CBAI
        </p>
        {showTagline ? (
          <p className="text-[11px] font-medium tracking-[0.12em] text-cyan-400/90 uppercase sm:text-xs">
            Official Evidence Intelligence
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { CBAIMark };
