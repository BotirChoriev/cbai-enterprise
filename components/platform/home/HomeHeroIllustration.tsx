export default function HomeHeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <svg
        viewBox="0 0 420 360"
        className="h-auto w-full text-zinc-600"
        role="img"
      >
        <title>Evidence intelligence layers</title>
        <defs>
          <linearGradient id="hero-layer-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="hero-layer-b" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Base platform */}
        <rect
          x="40"
          y="280"
          width="340"
          height="12"
          rx="6"
          fill="currentColor"
          opacity="0.25"
        />

        {/* Layer stack — evidence OS */}
        {[
          { y: 228, label: "Decision", w: 260, x: 80, fill: "url(#hero-layer-b)" },
          { y: 178, label: "Trust", w: 280, x: 70, fill: "url(#hero-layer-a)" },
          { y: 128, label: "Confidence", w: 300, x: 60, fill: "url(#hero-layer-b)" },
          { y: 78, label: "Evidence", w: 320, x: 50, fill: "url(#hero-layer-a)" },
        ].map((layer) => (
          <g key={layer.label}>
            <rect
              x={layer.x}
              y={layer.y}
              width={layer.w}
              height="44"
              rx="8"
              fill={layer.fill}
              stroke="currentColor"
              strokeOpacity="0.35"
            />
            <text
              x={layer.x + 16}
              y={layer.y + 27}
              fill="#e4e4e7"
              fontSize="13"
              fontFamily="system-ui, sans-serif"
              fontWeight="500"
            >
              {layer.label}
            </text>
          </g>
        ))}

        {/* Connection nodes */}
        <circle cx="210" cy="48" r="6" fill="#38bdf8" opacity="0.8" />
        <circle cx="120" cy="100" r="4" fill="#a1a1aa" opacity="0.6" />
        <circle cx="300" cy="100" r="4" fill="#a1a1aa" opacity="0.6" />
        <circle cx="90" cy="200" r="4" fill="#a1a1aa" opacity="0.6" />
        <circle cx="330" cy="200" r="4" fill="#a1a1aa" opacity="0.6" />

        <path
          d="M210 54 L120 96 M210 54 L300 96 M120 104 L90 196 M300 104 L330 196"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}
