import { GRAPH_PIPELINE_STAGES } from "@/lib/graph/graph-platform";

const NODE_HEIGHT = 44;
const NODE_GAP = 20;
const START_Y = 28;

export default function GraphPipeline() {
  const totalHeight =
    START_Y +
    GRAPH_PIPELINE_STAGES.length * NODE_HEIGHT +
    (GRAPH_PIPELINE_STAGES.length - 1) * NODE_GAP;

  return (
    <div
      className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6"
      role="img"
      aria-label="How the knowledge graph connects Entity through Decision Intelligence"
    >
      <svg
        viewBox={`0 0 320 ${totalHeight}`}
        className="mx-auto h-auto w-full max-w-xs text-zinc-500"
        aria-hidden="true"
      >
        {GRAPH_PIPELINE_STAGES.map((label, index) => {
          const y = START_Y + index * (NODE_HEIGHT + NODE_GAP);
          const centerY = y + NODE_HEIGHT / 2;
          const nextCenterY =
            START_Y +
            (index + 1) * (NODE_HEIGHT + NODE_GAP) +
            NODE_HEIGHT / 2;

          return (
            <g key={label}>
              {index < GRAPH_PIPELINE_STAGES.length - 1 ? (
                <line
                  x1={160}
                  y1={y + NODE_HEIGHT}
                  x2={160}
                  y2={nextCenterY - NODE_HEIGHT / 2}
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
                fontSize="12"
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
