import type { WorkspaceCoverageItem } from "@/lib/workspaces";
import { displayStatusLabel } from "@/lib/workspaces";
import { workspaceMotifFill } from "@/components/workspaces/workspace-motif-colors";

type CitizenTopicWheelProps = {
  topics: readonly WorkspaceCoverageItem[];
};

// Citizen's own atmosphere: a civic wheel, not a bar chart — public topics have no ranking
// between them, so position is a clock face (real topic count, evenly spaced) and the only
// real variable is each spoke's true evidence status. Warm clay rather than the cool tones
// used elsewhere: this is the one room addressed to a person, not an institution.
export default function CitizenTopicWheel({ topics }: CitizenTopicWheelProps) {
  const size = 240;
  const center = size / 2;
  const radius = 92;
  const hubRadius = 30;

  const connected = topics.filter(
    (t) => t.statusLabel === "Connected" || t.statusLabel === "Available Information",
  ).length;

  return (
    <div className="relative mx-auto flex w-full max-w-[300px] items-center justify-center lg:mx-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-[280px] w-[280px] rounded-full bg-[radial-gradient(ellipse,rgba(194,112,61,0.16),transparent_70%)]"
      />
      <svg
        className="relative h-auto w-full max-w-[240px]"
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        role="img"
        aria-label={`Citizen topic wheel: ${topics.length} real public topics, ${connected} with connected evidence`}
      >
        <circle cx={center} cy={center} r={radius} stroke="#c2703d" strokeOpacity="0.25" strokeWidth="1" fill="none" />
        {topics.map((topic, index) => {
          const angle = (index / topics.length) * Math.PI * 2 - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const hubX = center + hubRadius * Math.cos(angle);
          const hubY = center + hubRadius * Math.sin(angle);
          return (
            <g key={topic.id}>
              <line x1={hubX} y1={hubY} x2={x} y2={y} stroke="#c2703d" strokeOpacity="0.3" strokeWidth="1" />
              <circle cx={x} cy={y} r="6" fill={workspaceMotifFill(topic.statusLabel)}>
                <title>{`${topic.title}: ${displayStatusLabel(topic.statusLabel)}`}</title>
              </circle>
            </g>
          );
        })}
        <circle cx={center} cy={center} r={hubRadius} fill="#1c1512" stroke="#c2703d" strokeOpacity="0.4" strokeWidth="1" />
        <text x={center} y={center + 4} textAnchor="middle" fontSize="15" fontWeight="600" className="fill-[#e2a878]">
          {topics.length}
        </text>
      </svg>
    </div>
  );
}
