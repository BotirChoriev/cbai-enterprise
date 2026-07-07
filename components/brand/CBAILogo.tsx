type CBAILogoProps = {
  compact?: boolean;
  showTagline?: boolean;
  className?: string;
};

/** Foundation Mark (Concept A) — baseline, circle, balance axis. CSS/SVG placeholder. */
function CBAIMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <line x1="4" y1="20" x2="20" y2="20" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="11" r="5" stroke="#22d3ee" strokeWidth="1.5" />
      <line x1="12" y1="6" x2="12" y2="20" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" />
      <rect x="11" y="3" width="2" height="2" fill="#22d3ee" />
    </svg>
  );
}

export default function CBAILogo({
  compact = false,
  showTagline = true,
  className = "",
}: CBAILogoProps) {
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <CBAIMark size={28} />
        <span className="text-sm font-semibold tracking-tight text-zinc-50">CBAI</span>
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CBAIMark size={36} />
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-tight text-zinc-50">CBAI</p>
        {showTagline ? (
          <p className="text-[11px] font-medium tracking-wide text-cyan-400/80">
            Official Evidence Intelligence
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { CBAIMark };
