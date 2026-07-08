/** Premium globe / network visual for homepage hero — decorative SVG only. */
export default function HomeHeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center lg:max-w-none"
    >
      <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="absolute inset-8 rounded-full bg-blue-600/10 blur-2xl" />
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full drop-shadow-[0_0_60px_rgba(34,211,238,0.15)]"
      >
        <defs>
          <linearGradient id="hero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <radialGradient id="hero-sphere" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#1e3a5f" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050810" stopOpacity="0" />
          </radialGradient>
          <filter id="hero-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        <circle
          cx="200"
          cy="200"
          r="168"
          stroke="url(#hero-grad)"
          strokeWidth="0.75"
          opacity="0.25"
          strokeDasharray="4 8"
        />
        <circle
          cx="200"
          cy="200"
          r="140"
          stroke="#22d3ee"
          strokeWidth="0.5"
          opacity="0.15"
        />

        {/* Globe sphere */}
        <circle cx="200" cy="200" r="118" fill="url(#hero-sphere)" />
        <circle cx="200" cy="200" r="118" stroke="url(#hero-grad)" strokeWidth="1.5" opacity="0.6" />
        <ellipse
          cx="200"
          cy="200"
          rx="118"
          ry="42"
          stroke="#22d3ee"
          strokeWidth="0.75"
          opacity="0.35"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="42"
          ry="118"
          stroke="#38bdf8"
          strokeWidth="0.75"
          opacity="0.25"
        />
        <ellipse
          cx="200"
          cy="168"
          rx="90"
          ry="28"
          stroke="#22d3ee"
          strokeWidth="0.5"
          opacity="0.2"
        />
        <ellipse
          cx="200"
          cy="232"
          rx="90"
          ry="28"
          stroke="#22d3ee"
          strokeWidth="0.5"
          opacity="0.2"
        />

        {/* Network arcs */}
        <path
          d="M80 140 Q200 80 320 140"
          stroke="url(#hero-grad)"
          strokeWidth="1"
          opacity="0.4"
          fill="none"
        />
        <path
          d="M70 260 Q200 340 330 260"
          stroke="url(#hero-grad)"
          strokeWidth="1"
          opacity="0.35"
          fill="none"
        />
        <path
          d="M140 70 Q200 200 140 330"
          stroke="#38bdf8"
          strokeWidth="0.75"
          opacity="0.3"
          fill="none"
        />
        <path
          d="M260 70 Q200 200 260 330"
          stroke="#60a5fa"
          strokeWidth="0.75"
          opacity="0.3"
          fill="none"
        />

        {/* Glowing nodes */}
        {[
          [200, 82],
          [318, 140],
          [340, 200],
          [318, 260],
          [200, 318],
          [82, 260],
          [60, 200],
          [82, 140],
          [200, 200],
        ].map(([cx, cy], i) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={i === 8 ? 4 : 3}
            fill={i === 8 ? "#22d3ee" : i % 2 === 0 ? "#38bdf8" : "#60a5fa"}
            filter="url(#hero-glow)"
            opacity={i === 8 ? 1 : 0.85}
          />
        ))}

        {/* Connection lines to center */}
        <g opacity="0.35" stroke="#22d3ee" strokeWidth="0.6">
          <line x1="200" y1="82" x2="200" y2="200" />
          <line x1="318" y1="140" x2="200" y2="200" />
          <line x1="340" y1="200" x2="200" y2="200" />
          <line x1="318" y1="260" x2="200" y2="200" />
          <line x1="200" y1="318" x2="200" y2="200" />
          <line x1="82" y1="260" x2="200" y2="200" />
          <line x1="60" y1="200" x2="200" y2="200" />
          <line x1="82" y1="140" x2="200" y2="200" />
        </g>
      </svg>
    </div>
  );
}
