const MAP_NODES = [
  "Countries",
  "Companies",
  "Universities",
  "Knowledge Graph",
  "Evidence",
  "Reasoning",
  "Decision Intelligence",
] as const;

const NODE_HEIGHT = 48;
const NODE_GAP = 24;
const START_Y = 32;

export default function HomePlatformMap() {
  const totalHeight =
    START_Y + MAP_NODES.length * NODE_HEIGHT + (MAP_NODES.length - 1) * NODE_GAP;

  return (
    <div
      className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 sm:p-8"
      role="img"
      aria-label="Platform architecture flow from Countries through Decision Intelligence"
    >
      <svg
        viewBox={`0 0 320 ${totalHeight}`}
        className="mx-auto h-auto w-full max-w-xs text-zinc-500"
        aria-hidden="true"
      >
        {MAP_NODES.map((label, index) => {
          const y = START_Y + index * (NODE_HEIGHT + NODE_GAP);
          const centerY = y + NODE_HEIGHT / 2;
          const nextY =
            START_Y + (index + 1) * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2;

          return (
            <g key={label}>
              {index < MAP_NODES.length - 1 ? (
                <line
                  x1={160}
                  y1={y + NODE_HEIGHT}
                  x2={160}
                  y2={nextY - NODE_HEIGHT / 2}
                  stroke="currentColor"
                  strokeOpacity="0.35"
                  strokeWidth="1.5"
                />
              ) : null}
              <rect
                x={40}
                y={y}
                width={240}
                height={NODE_HEIGHT}
                rx="8"
                fill="#18181b"
                stroke="currentColor"
                strokeOpacity="0.45"
              />
              <text
                x={160}
                y={centerY + 5}
                textAnchor="middle"
                fill="#e4e4e7"
                fontSize="13"
                fontFamily="system-ui, sans-serif"
                fontWeight="500"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
